"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePrototype } from "@/lib/app/store";
import { useAuth } from "@/lib/app/auth";
import { useI18n } from "@/lib/i18n";
import { useNav } from "@/lib/app/nav";
import { perguntasDoQuiz, type Pergunta } from "@/lib/app/quiz/perguntas";
import type { EstadoQuiz } from "@/lib/app/quiz/sequencia";
import {
  QUIZ_ZERADO,
  diaLocal,
  perguntaDoDia,
  respondeuHoje,
  sequenciaHoje,
  temPerdao,
  diasEntre,
  respostaDe,
} from "@/lib/app/quiz/sequencia";
import { enviarResposta, placarDoDia, type Placar } from "@/lib/app/quiz/placar";
import { passo } from "@/lib/app/ultimoPasso";
import { AppHeader, useContent } from "../ui";
import { ConviteDeAviso } from "../ConviteDeAviso";
import { PerguntaRespondida } from "../quiz/PerguntaRespondida";

// A pergunta do dia.
//
// O formato inteiro cabe numa frase: uma pergunta, três opções, você responde e
// descobre na hora se acertou, com a explicação do porquê. Sem cronômetro, sem
// pontuação, sem "você errou 3 de 5". A única coisa que se acumula é a
// sequência de dias, e ela sobe mesmo quando a resposta está errada.
//
// Isso é deliberado. O que constrói hábito é aparecer, não acertar. Um quiz que
// pontua acerto ensina a pessoa a evitar as perguntas difíceis — justamente as
// que ela abriu o app para entender.

export function QuizScreen() {
  const c = useContent();
  const q = c.quiz;
  const { locale } = useI18n();
  const { s, responderQuiz } = usePrototype();
  const { user } = useAuth();
  const { go, back } = useNav();

  const hoje = diaLocal();
  const estado = s.quiz ?? QUIZ_ZERADO;
  const perguntas = useMemo(() => perguntasDoQuiz(locale), [locale]);
  const pergunta = useMemo(() => perguntaDoDia(perguntas, hoje), [perguntas, hoje]);

  const [escolha, setEscolha] = useState<number | null>(null);
  const [placar, setPlacar] = useState<Placar | null>(null);

  // O estado COMO ESTAVA antes de responder, congelado no toque.
  //
  // Isto não é preciosismo: `responderQuiz` já atualizou a sessão quando esta
  // tela volta a desenhar, então somar 1 ao número atual mostrava "2 dias
  // seguidos" para quem tinha acabado de responder pela primeira vez. O mesmo
  // valeria para o recorde e para o aviso de perdão.
  //
  // Congelado no toque, e não na montagem, porque a sessão é hidratada depois
  // do primeiro desenho: um retrato tirado cedo demais seria o estado vazio.
  const [antes, setAntes] = useState<EstadoQuiz | null>(null);

  if (!pergunta) return <AppHeader title={q.titulo} />;
  // `escolha === null` é o que segura a explicação na tela: sem ele, responder
  // trocaria o que a pessoa está lendo pelo aviso de "você já respondeu hoje".
  if (escolha === null && respondeuHoje(estado, hoje)) {
    const r = respostaDe(estado, hoje);
    // A pergunta que ela respondeu HOJE pode não ser a que a rotação devolve
    // agora (o banco cresce, o idioma muda). O registro guarda o id e ele manda.
    const respondida = r ? perguntas.find((p) => p.id === r.perguntaId) ?? pergunta : null;
    return (
      <JaRespondeu
        onVoltar={back}
        onAnteriores={() => go({ name: "quizHistorico" })}
        sequencia={sequenciaHoje(estado, hoje)}
        pergunta={respondida}
        escolha={r?.escolha ?? null}
        aoAbrirAula={(aula) => go({ name: "content", id: aula })}
      />
    );
  }

  const base = antes ?? estado;

  return (
    <QuizDoDia
      pergunta={pergunta}
      escolha={escolha}
      placar={placar}
      sequenciaAntes={sequenciaHoje(base, hoje)}
      recordeAntes={base.recorde}
      // Perdão gasto AGORA: faltou exatamente um dia e ainda havia perdão. É a
      // única hora em que dizer isso é útil, e a pessoa merece saber que foi
      // perdoada em vez de achar que o app não percebeu a falta.
      perdoado={!!base.ultimoDia && diasEntre(base.ultimoDia, hoje) === 2 && temPerdao(base, hoje)}
      aoEscolher={(i) => {
        if (escolha !== null) return;
        // Migalha ANTES de qualquer coisa: se o app morrer daqui para a
        // frente, é isto que sobra para dizer onde. Ver lib/app/ultimoPasso.ts
        // e o relato de 02/09/2026 de app fechando ao responder no Android.
        passo("respondeu o quiz");
        setAntes(estado);
        setEscolha(i);
        const acertou = i === pergunta.correta;
        responderQuiz({ perguntaId: pergunta.id, escolha: i, acertou });
        enviarResposta({ dia: hoje, perguntaId: pergunta.id, acertou, userId: user?.id ?? null });
        // O placar chega depois da resposta, nunca antes: ver "62% acertaram"
        // com as opções na tela entregaria a resposta a quem soubesse ler.
        void placarDoDia(hoje, pergunta.id).then(setPlacar);
      }}
      aoSeguir={back}
      aoVerAnteriores={() => go({ name: "quizHistorico" })}
      aoAbrirAula={() => go({ name: "content", id: pergunta.aula })}
    />
  );
}

// A tela de quem volta depois de já ter respondido.
//
// Antes ela mostrava só a chama e o "volte amanhã", e escondia justamente o que
// a pessoa veio buscar: qual era a pergunta, o que ela marcou e por quê. Quem
// reabre um quiz respondido quer reler a explicação, não ser informado de que
// respondeu. A confirmação vira uma faixa curta em cima e o conteúdo volta.
//
// `pergunta` pode ser nula para quem respondeu antes de o histórico existir:
// nesse caso não há o que remostrar, e a tela cai no formato antigo em vez de
// inventar uma resposta que não foi gravada.
function JaRespondeu({
  onVoltar,
  onAnteriores,
  sequencia,
  pergunta,
  escolha,
  aoAbrirAula,
}: {
  onVoltar: () => void;
  onAnteriores: () => void;
  sequencia: number;
  pergunta: Pergunta | null;
  escolha: number | null;
  aoAbrirAula: (aula: string) => void;
}) {
  const c = useContent();
  const q = c.quiz;
  const temRegistro = !!pergunta && escolha !== null;

  return (
    <>
      <AppHeader title={q.titulo} />

      <div className="mt-2 flex items-center gap-3 rounded-2xl bg-graphite-800 px-4 py-3 ring-1 ring-white/5">
        <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber/15 text-xl">
          🔥
        </span>
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold text-cream">{q.jaRespondeuTitulo}</p>
          <p className="text-[13px] leading-snug text-cream/55">
            {sequencia === 0
              ? q.sequenciaComecou
              : sequencia === 1
                ? q.sequenciaUm
                : q.sequenciaN.replace("{n}", String(sequencia))}
          </p>
        </div>
      </div>

      {temRegistro && (
        <div className="mt-4">
          <PerguntaRespondida pergunta={pergunta} escolha={escolha} aoAbrirAula={() => aoAbrirAula(pergunta.aula)} />
        </div>
      )}

      <p className="mt-5 text-center text-[13px] leading-relaxed text-cream/50">{q.jaRespondeuCorpo}</p>

      <button
        onClick={onAnteriores}
        className="mt-3 w-full rounded-xl bg-graphite-700 px-4 py-3 font-display text-sm font-semibold text-cream ring-1 ring-white/10"
      >
        {q.verAnteriores}
      </button>
      <button
        onClick={onVoltar}
        className="mt-2 w-full rounded-xl px-4 py-3 font-display text-sm font-semibold text-cream/60"
      >
        {q.seguir}
      </button>
    </>
  );
}

function Chama({ n }: { n: number }) {
  const c = useContent();
  const q = c.quiz;
  return (
    <div className="text-center">
      <span aria-hidden className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber/15 text-3xl">
        🔥
      </span>
      <p className="mt-2 font-display text-sm font-semibold text-amber">
        {n === 0 ? q.sequenciaComecou : n === 1 ? q.sequenciaUm : q.sequenciaN.replace("{n}", String(n))}
      </p>
    </div>
  );
}

function QuizDoDia({
  pergunta,
  escolha,
  placar,
  sequenciaAntes,
  recordeAntes,
  perdoado,
  aoEscolher,
  aoSeguir,
  aoVerAnteriores,
  aoAbrirAula,
}: {
  pergunta: Pergunta;
  escolha: number | null;
  placar: Placar | null;
  sequenciaAntes: number;
  recordeAntes: number;
  perdoado: boolean;
  aoEscolher: (i: number) => void;
  aoSeguir: () => void;
  aoVerAnteriores: () => void;
  aoAbrirAula: () => void;
}) {
  const c = useContent();
  const q = c.quiz;
  const respondeu = escolha !== null;
  const acertou = escolha === pergunta.correta;
  const sequenciaDepois = sequenciaAntes + 1;
  const novoRecorde = sequenciaDepois > recordeAntes;

  // Rola até a explicação assim que ela aparece: em tela de celular ela nasce
  // abaixo da dobra, e quem não rola acha que responder não fez nada.
  const explicacao = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (respondeu) explicacao.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [respondeu]);

  return (
    <>
      <AppHeader title={q.titulo} />

      <h2 className="mt-2 text-balance font-serif text-[22px] font-bold leading-snug text-cream">
        {pergunta.pergunta}
      </h2>

      <div className="mt-5 space-y-2.5">
        {pergunta.opcoes.map((opcao, i) => {
          const certa = i === pergunta.correta;
          const minha = i === escolha;
          // Antes de responder, todas iguais. Depois: a certa em verde SEMPRE
          // (inclusive quando a pessoa errou, porque é isso que ela precisa
          // ver), e a errada escolhida marcada sem estridência.
          const cor = !respondeu
            ? "bg-graphite-800 ring-white/[0.08] text-cream/90"
            : certa
              ? "bg-teal/15 ring-teal/50 text-cream"
              : minha
                ? "bg-coral/10 ring-coral/40 text-cream/80"
                : "bg-graphite-800 ring-white/[0.05] text-cream/40";
          return (
            <button
              key={i}
              onClick={() => aoEscolher(i)}
              disabled={respondeu}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left ring-1 transition-colors ${cor} ${respondeu ? "" : "active:bg-graphite-700"}`}
            >
              <span
                aria-hidden
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] font-bold ${
                  respondeu && certa
                    ? "bg-teal text-graphite"
                    : respondeu && minha
                      ? "bg-coral/70 text-graphite"
                      : "bg-white/10 text-cream/60"
                }`}
              >
                {respondeu && certa ? "✓" : respondeu && minha ? "✕" : String.fromCharCode(65 + i)}
              </span>
              <span className="min-w-0 flex-1 text-[15px] leading-snug">{opcao}</span>
            </button>
          );
        })}
      </div>

      {respondeu && (
        <div ref={explicacao} className="mt-5">
          <div className={`rounded-2xl p-5 ring-1 ${acertou ? "bg-teal/10 ring-teal/25" : "bg-graphite-800 ring-white/[0.08]"}`}>
            <p className={`font-display text-[15px] font-bold ${acertou ? "text-teal" : "text-cream"}`}>
              {acertou ? q.acertou : q.errou}
            </p>
            {!acertou && (
              <p className="mt-1.5 text-sm text-cream/80">
                <span className="text-cream/50">{q.aRespostaE} </span>
                {pergunta.opcoes[pergunta.correta]}
              </p>
            )}
            <p className="mt-2.5 text-sm leading-relaxed text-cream/70">{pergunta.porque}</p>
            <button
              onClick={aoAbrirAula}
              className="mt-4 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-amber"
            >
              {q.verAula}
              <span aria-hidden>›</span>
            </button>
          </div>

          {/* Sequência e estatística: a recompensa. Vem depois da explicação de
              propósito — primeiro o que ela aprendeu, depois o troféu. */}
          <div className="mt-3 rounded-2xl bg-graphite-800 p-5 ring-1 ring-white/5">
            <Chama n={sequenciaDepois} />
            {novoRecorde && sequenciaDepois > 1 && (
              <p className="mt-1 text-center font-display text-xs font-semibold text-amber/80">{q.recordeNovo}</p>
            )}
            {!novoRecorde && recordeAntes > sequenciaDepois && (
              <p className="mt-1 text-center text-xs text-cream/45">{q.recorde.replace("{n}", String(recordeAntes))}</p>
            )}
            {perdoado && (
              <p className="mx-auto mt-3 max-w-[19rem] text-center text-[13px] leading-relaxed text-cream/55">
                {q.perdaoUsado}
              </p>
            )}
            {placar && (
              <p className="mt-3 text-center text-[13px] text-cream/60">
                {placar.percentual === null
                  ? q.placarPoucos
                  : q.placarCertos.replace("{p}", String(placar.percentual))}
              </p>
            )}
          </div>

          {/* Convite de notificação. Passa pelo controle único (um a cada 4
              dias, três no total), então na maioria das vezes não aparece. */}
          <ConviteDeAviso momento="quiz" sequencia={sequenciaDepois} />

          <button
            onClick={aoSeguir}
            className="mt-4 w-full rounded-xl bg-amber px-4 py-3.5 font-display text-[15px] font-semibold text-graphite active:scale-[0.99]"
          >
            {q.seguir}
          </button>
          {/* O caminho para o calendário nasce aqui, logo depois de responder:
              é a hora em que a pessoa está com o assunto na cabeça e pode
              querer o dia que perdeu. */}
          <button
            onClick={aoVerAnteriores}
            className="mt-2 w-full rounded-xl px-4 py-3 font-display text-sm font-semibold text-cream/60"
          >
            {q.verAnteriores}
          </button>
        </div>
      )}
    </>
  );
}
