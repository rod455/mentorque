"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePrototype } from "@/lib/app/store";
import { useI18n } from "@/lib/i18n";
import { useNav } from "@/lib/app/nav";
import { perguntasDoQuiz } from "@/lib/app/quiz/perguntas";
import {
  INICIO_DO_QUIZ,
  QUIZ_ZERADO,
  diaLocal,
  diasEntre,
  perguntaDoDia,
  respostaDe,
} from "@/lib/app/quiz/sequencia";
import { AppHeader, UpgradeBanner, useContent } from "../ui";
import { PerguntaRespondida } from "../quiz/PerguntaRespondida";

// O calendário das perguntas.
//
// Serve duas coisas que não são a mesma: rever o que já foi respondido, e
// responder um dia que passou em branco.
//
// A SEGUNDA É QUE PRECISA DE CUIDADO. Responder o passado conta como estudo e
// NÃO alimenta a sequência (a regra está em quiz/sequencia.ts). Sem isso,
// bastaria uma tarde preenchendo o mês para o app exibir "30 dias seguidos"
// que nunca aconteceram, e o número que a tela celebra deixaria de significar
// coisa alguma — inclusive para quem o construiu de verdade. A tela avisa
// disso ANTES da pessoa responder, e não depois: descobrir a regra na hora da
// recompensa é como se sentir enganado.

/**
 * Até onde o calendário deixa voltar SEM assinatura.
 *
 * Sete dias no grátis, tudo desde o primeiro dia do quiz no Premium: decisão
 * do dono (27/08). A janela curta mantém o hábito diário vivo para todo
 * mundo, e o arquivo completo vira um dos motivos concretos de assinar.
 */
const DIAS_GRATIS = 7;

export function QuizHistoricoScreen() {
  const c = useContent();
  const q = c.quiz;
  const { locale } = useI18n();
  const { s, responderQuizPassado } = usePrototype();
  const { go } = useNav();

  const hoje = diaLocal();
  const estado = s.quiz ?? QUIZ_ZERADO;
  const perguntas = useMemo(() => perguntasDoQuiz(locale), [locale]);

  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [escolhaAgora, setEscolhaAgora] = useState<number | null>(null);

  const nomeDoMes = (dia: string) =>
    new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", { month: "long", timeZone: "UTC" })
      .format(new Date(`${dia}T12:00:00Z`));

  // A janela que esta pessoa enxerga.
  //
  // Ninguém volta antes de INICIO_DO_QUIZ: o quiz não existia, e mostrar
  // aqueles dias seria cobrar presença num jogo que não tinha começado.
  // Dentro disso, Premium vê tudo desde o primeiro dia e o grátis vê os
  // últimos sete.
  const premium = s.premium;
  const primeiroVisivel = useMemo(() => {
    if (premium) return INICIO_DO_QUIZ;
    const corte = new Date(new Date(`${hoje}T12:00:00Z`).getTime() - (DIAS_GRATIS - 1) * 86400000)
      .toISOString()
      .slice(0, 10);
    return corte > INICIO_DO_QUIZ ? corte : INICIO_DO_QUIZ;
  }, [premium, hoje]);
  // O convite só aparece quando existe de fato algo atrás da cerca. Na
  // primeira semana do quiz não existe, e convite para nada é ruído.
  const temArquivoFechado = !premium && primeiroVisivel > INICIO_DO_QUIZ;

  // Os dias da grade, do mais antigo para o mais novo, terminando hoje,
  // agrupados por mês: uma fileira que vai 30, 31, 1, 2 sem nada escrito não
  // diz de que primeiro de qual mês se trata.
  const meses = useMemo(() => {
    const grupos: { mes: string; dias: { dia: string; alcancavel: boolean }[] }[] = [];
    const fim = new Date(`${hoje}T12:00:00Z`).getTime();
    for (let t = new Date(`${primeiroVisivel}T12:00:00Z`).getTime(); t <= fim; t += 86400000) {
      const dia = new Date(t).toISOString().slice(0, 10);
      // Antes de a pessoa entrar no app não existe "dia perdido": ela não
      // estava aqui. Mostrar aqueles dias como pendência seria cobrar
      // ausência de quem nem tinha instalado.
      const alcancavel = !s.startedAt || diasEntre(s.startedAt, dia) >= 0;
      const mes = dia.slice(0, 7);
      const ultimo = grupos[grupos.length - 1];
      if (ultimo?.mes === mes) ultimo.dias.push({ dia, alcancavel });
      else grupos.push({ mes, dias: [{ dia, alcancavel }] });
    }
    return grupos;
  }, [hoje, primeiroVisivel, s.startedAt]);

  const abrir = (dia: string) => {
    setEscolhaAgora(null);
    setSelecionado((antes) => (antes === dia ? null : dia));
  };

  // O painel do dia nasce embaixo da grade, fora da tela num celular. Sem esta
  // rolagem a pessoa toca num dia e parece que não aconteceu nada.
  //
  // Ao ABRIR, alinha pelo topo: a pergunta é o começo da leitura e cortá-la não
  // ajuda ninguém. Ao RESPONDER, alinha pelo fim: a pergunta ela já leu, e o
  // que ela quer ver agora é a explicação, que nasce no rodapé do painel.
  const painel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!selecionado) return;
    painel.current?.scrollIntoView({
      behavior: "smooth",
      block: escolhaAgora === null ? "nearest" : "end",
    });
  }, [selecionado, escolhaAgora]);

  const perguntaSelecionada = selecionado ? perguntaDoDia(perguntas, selecionado) : null;
  const respostaSelecionada = selecionado ? respostaDe(estado, selecionado) : null;
  // A pergunta que a pessoa respondeu NAQUELE dia pode não ser a que a rotação
  // devolve hoje (o banco cresce). O histórico guarda o id, e ele manda.
  const perguntaDoRegistro = respostaSelecionada
    ? perguntas.find((p) => p.id === respostaSelecionada.perguntaId) ?? perguntaSelecionada
    : perguntaSelecionada;

  const nomeDoDia = (dia: string) => {
    const d = new Date(`${dia}T12:00:00Z`);
    return new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", {
      day: "numeric",
      month: "long",
      timeZone: "UTC",
    }).format(d);
  };

  return (
    <>
      <AppHeader title={q.historicoTitulo} />

      <p className="text-sm leading-relaxed text-cream/55">{q.historicoEscolhaDia}</p>

      {/* Um bloco por mês, cada um com o nome escrito. Sem cabeçalho de dias da
          semana, porque a régua aqui é "os últimos 30 dias" e não um mês
          fechado — um cabeçalho fixo mentiria sobre o alinhamento. */}
      {meses.map(({ mes, dias }) => (
        <div key={mes} className="mt-4">
          <p className="mb-2 font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-cream/35">
            {nomeDoMes(dias[0].dia)}
          </p>
          <div className="grid grid-cols-7 gap-1.5">
            {dias.map(({ dia, alcancavel }) => {
              const r = respostaDe(estado, dia);
              const ehHoje = dia === hoje;
              const aberto = selecionado === dia;
              const numero = Number(dia.slice(8, 10));

              const cor = !alcancavel
                ? "bg-graphite-800/40 text-cream/20"
                : r
                  ? r.acertou
                    ? "bg-teal/20 text-teal ring-1 ring-teal/40"
                    : "bg-coral/15 text-coral ring-1 ring-coral/35"
                  : "bg-graphite-800 text-cream/45 ring-1 ring-white/[0.06]";

              return (
                <button
                  key={dia}
                  onClick={() => alcancavel && abrir(dia)}
                  disabled={!alcancavel}
                  aria-label={`${nomeDoDia(dia)}: ${r ? (r.acertou ? q.historicoLegendaAcerto : q.historicoLegendaErro) : q.historicoLegendaAberto}`}
                  aria-pressed={aberto}
                  className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl font-display font-semibold leading-none transition-colors ${cor} ${
                    aberto ? "outline outline-2 outline-amber" : ""
                  } ${ehHoje && !aberto ? "outline outline-1 outline-amber/50" : ""}`}
                >
                  {/* O número fica SEMPRE visível, mesmo no dia respondido: sem
                      ele a pessoa perde a referência de qual dia é qual, e um
                      calendário sem datas legíveis é só uma fileira de vistos. */}
                  <span className={r ? "text-[11px] opacity-70" : "text-[13px]"}>{numero}</span>
                  {r && <span aria-hidden className="text-[12px]">{r.acertou ? "✓" : "✕"}</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Legenda. Três cores num calendário não se adivinham. */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-cream/45">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-teal/60" />
          {q.historicoLegendaAcerto}
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-coral/60" />
          {q.historicoLegendaErro}
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-white/20" />
          {q.historicoLegendaAberto}
        </span>
      </div>

      {/* O arquivo completo é Premium. O convite só existe quando há dias de
          verdade atrás da cerca, e some sozinho no modo leitor (o UpgradeBanner
          cuida disso). */}
      {temArquivoFechado && <UpgradeBanner ctx="quiz-historico" text={q.historicoPremium} />}

      {selecionado && perguntaDoRegistro && (
        <div ref={painel} className="mt-5 scroll-mt-4 rounded-2xl bg-graphite-800 p-4 ring-1 ring-white/5">
          <p className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.12em] text-amber">
            {nomeDoDia(selecionado)}
          </p>

          {respostaSelecionada ? (
            <PerguntaRespondida
              pergunta={perguntaDoRegistro}
              escolha={respostaSelecionada.escolha}
              aoAbrirAula={() => go({ name: "content", id: perguntaDoRegistro.aula })}
            />
          ) : escolhaAgora !== null ? (
            <PerguntaRespondida
              pergunta={perguntaDoRegistro}
              escolha={escolhaAgora}
              aoAbrirAula={() => go({ name: "content", id: perguntaDoRegistro.aula })}
            />
          ) : (
            <>
              <p className="mb-3 text-sm text-cream/55">{q.historicoDiaAberto}</p>
              <h2 className="text-balance font-serif text-[19px] font-bold leading-snug text-cream">
                {perguntaDoRegistro.pergunta}
              </h2>
              <div className="mt-4 space-y-2">
                {perguntaDoRegistro.opcoes.map((opcao, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const acertou = i === perguntaDoRegistro.correta;
                      setEscolhaAgora(i);
                      // Nada de `enviarResposta` aqui, de propósito: a
                      // estatística do dia é da turma que respondeu NAQUELE
                      // dia, e a rota recusa data antiga justamente por isso.
                      responderQuizPassado(selecionado, {
                        perguntaId: perguntaDoRegistro.id,
                        escolha: i,
                        acertou,
                      });
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl bg-graphite-700 px-3.5 py-3 text-left ring-1 ring-white/[0.08] active:bg-graphite-600"
                  >
                    <span
                      aria-hidden
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-[12px] font-bold text-cream/60"
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="min-w-0 flex-1 text-[14px] leading-snug text-cream/90">{opcao}</span>
                  </button>
                ))}
              </div>
              {/* O aviso vem ANTES de responder. Descobrir depois que aquilo
                  não contou para a sequência é a definição de frustração. */}
              <p className="mt-3 text-[12px] leading-relaxed text-cream/40">{q.historicoSemSequencia}</p>
            </>
          )}
        </div>
      )}

      {/* O rodapé da tela. Com dia aberto ele some: ali embaixo já tem a
          explicação, e um total do lado dela só disputa atenção. */}
      {!selecionado &&
        (estado.respostas > 0 ? (
          <p className="mt-6 text-center text-sm text-cream/45">
            {(estado.respostas === 1
              ? q.historicoRespondidaUma
              : q.historicoRespondidasN.replace("{n}", String(estado.respostas))) +
              ", " +
              (estado.acertos === 1
                ? q.historicoCertaUma
                : q.historicoCertasN.replace("{n}", String(estado.acertos)))}
          </p>
        ) : (
          <p className="mt-6 text-center text-sm leading-relaxed text-cream/45">{q.historicoVazio}</p>
        ))}
    </>
  );
}
