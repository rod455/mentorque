"use client";

import { useEffect, useRef, useState } from "react";
import { usePrototype } from "@/lib/app/store";
import { abrirAjustesDeAvisos } from "@/lib/app/notificacoes";
import { convidar, podeConvidar, type MomentoDoPedido } from "@/lib/app/pedidoDeAviso";
import { passo } from "@/lib/app/ultimoPasso";
import { funil } from "@/lib/app/funil";
import { useContent } from "./ui";

// O convite para ligar o aviso do quiz.
//
// Some sozinho na maioria das vezes: quem decide se ele pode aparecer é
// lib/app/pedidoDeAviso.ts, e as regras de lá (um a cada 4 dias, três no
// total, nunca depois de um "não" do sistema) existem porque a permissão de
// notificação é de um tiro só.
//
// O ARGUMENTO MUDA COM A SEQUÊNCIA, e é a parte que importa. Para quem
// respondeu hoje pela primeira vez, o convite é genérico ("quer o de amanhã?").
// Para quem já tem dias acumulados, ele fala do que existe de concreto: a
// sequência dela, e o esquecimento como o que a ameaça. É a diferença entre
// pedir permissão e explicar para quê.
//
// O que ele NUNCA faz é ameaçar. "Não perca sua sequência!" é a frase que faz
// alguém desinstalar em vez de voltar.

/** De quantos dias de sequência em diante o convite usa o argumento dela. */
const SEQUENCIA_PARA_ARGUMENTO = 2;

export function ConviteDeAviso({
  momento,
  sequencia,
  titulo,
  corpo,
}: {
  momento: MomentoDoPedido;
  sequencia: number;
  /** Texto próprio do momento (o do carro fala do carro, não do quiz). */
  titulo?: string;
  corpo?: string;
}) {
  const c = useContent();
  const q = c.quiz;
  const { setNotifications } = usePrototype();
  const [cabe, setCabe] = useState(false);
  const [fechado, setFechado] = useState(false);
  // A RECUSA TAMBÉM É RESPOSTA (17/10/2026). Até aqui o convite gravava que
  // apareceu e que foi aceito, e o resto era silêncio: de 93 convites no
  // calendário, 78 não deixavam rastro. Agora a recusa grava o como: `botao`
  // quando a pessoa tocou no "não", `saiu` quando a tela foi embora com o
  // convite à vista e sem resposta. O que ainda escapa é o app fechado na
  // hora, que não desmonta nada.
  const mostrado = useRef(false);
  const respondeu = useRef(false);

  // A pergunta "cabe um convite agora?" é assíncrona porque a resposta que mais
  // vale vem do sistema (já concedida? já negada?), não do nosso registro.
  useEffect(() => {
    let vivo = true;
    void podeConvidar().then((r) => {
      if (!vivo) return;
      setCabe(r);
      // O portão medido (11/09/2026): quantas vezes o convite aparece, de
      // onde, e o que acontece depois. Uma vez por momento por sessão.
      if (r) funil("convite_aviso", { origem: momento, umaVez: true, chave: momento });
      if (r) mostrado.current = true;
    });
    return () => {
      vivo = false;
      if (mostrado.current && !respondeu.current) {
        respondeu.current = true;
        funil("recusou_convite_aviso", { origem: momento, detalhe: "saiu" });
      }
    };
  }, [momento]);

  const recusar = () => {
    respondeu.current = true;
    setFechado(true);
    funil("recusou_convite_aviso", { origem: momento, detalhe: "botao" });
  };

  if (!cabe || fechado) return null;

  const comSequencia = sequencia >= SEQUENCIA_PARA_ARGUMENTO;

  const aceitar = async () => {
    respondeu.current = true;
    setFechado(true);
    // Aqui abre a caixa do SISTEMA, que é código nativo. Se o app sumir na
    // frente dela, a migalha é a única testemunha.
    passo("pediu permissão de aviso");
    funil("aceitou_convite_aviso", { origem: momento });
    const concedida = await convidar(momento);
    funil(concedida ? "permissao_aviso_concedida" : "permissao_aviso_negada", { origem: momento });
    // O interruptor do Perfil segue o que o sistema respondeu. Sem isto o app
    // ficaria dizendo "avisos ligados" para quem recusou na caixa do sistema.
    if (concedida) {
      setNotifications(true);
      return;
    }
    // QUEM TOCOU EM "QUERO O AVISO" PEDIU PARA RECEBER, e o convite tinha o
    // mesmo beco sem saída do interruptor do Perfil (relatado pelo dono em
    // 07/09/2026): quando o pedido não termina em permissão, o cartão sumia e
    // não acontecia mais nada. A pessoa disse sim e o app não deu resposta.
    //
    // E aqui o caso é MAIS comum do que no Perfil, não menos. O `podeConvidar`
    // não distingue "nunca perguntei" de "já negaram de vez", de propósito:
    // distinguir custaria atravessar a ponte nativa no instante em que a
    // pessoa responde o quiz, que é o caminho onde o app já fechou na mão de
    // gente. Então o convite aparece para quem o sistema já negou, o
    // `pedirPermissao` devolve não sem abrir caixa nenhuma, e sem isto aqui o
    // toque não fazia nada visível. Os ajustes do aparelho são o único lugar
    // onde essa pessoa ainda pode ligar.
    abrirAjustesDeAvisos();
  };

  return (
    <div className="mt-3 rounded-2xl bg-amber/[0.07] p-5 ring-1 ring-amber/20">
      <p className="font-display text-[15px] font-semibold text-cream">{titulo ?? q.avisoTitulo}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-cream/65">
        {corpo ?? (comSequencia ? q.avisoCorpoSequencia.replace("{n}", String(sequencia)) : q.avisoCorpo)}
      </p>
      <div className="mt-4 flex gap-2">
        <button
          onClick={aceitar}
          className="flex-1 rounded-xl bg-amber px-4 py-2.5 font-display text-sm font-semibold text-graphite active:scale-[0.99]"
        >
          {q.avisoSim}
        </button>
        <button
          onClick={recusar}
          className="rounded-xl bg-graphite-700 px-4 py-2.5 font-display text-sm font-medium text-cream/70 ring-1 ring-white/10"
        >
          {q.avisoNao}
        </button>
      </div>
    </div>
  );
}
