"use client";

import { useEffect, useState } from "react";
import { usePrototype } from "@/lib/app/store";
import { convidar, podeConvidar, type MomentoDoPedido } from "@/lib/app/pedidoDeAviso";
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

export function ConviteDeAviso({ momento, sequencia }: { momento: MomentoDoPedido; sequencia: number }) {
  const c = useContent();
  const q = c.quiz;
  const { setNotifications } = usePrototype();
  const [cabe, setCabe] = useState(false);
  const [fechado, setFechado] = useState(false);

  // A pergunta "cabe um convite agora?" é assíncrona porque a resposta que mais
  // vale vem do sistema (já concedida? já negada?), não do nosso registro.
  useEffect(() => {
    let vivo = true;
    void podeConvidar().then((r) => { if (vivo) setCabe(r); });
    return () => { vivo = false; };
  }, []);

  if (!cabe || fechado) return null;

  const comSequencia = sequencia >= SEQUENCIA_PARA_ARGUMENTO;

  const aceitar = async () => {
    setFechado(true);
    const concedida = await convidar(momento);
    // O interruptor do Perfil segue o que o sistema respondeu. Sem isto o app
    // ficaria dizendo "avisos ligados" para quem recusou na caixa do sistema.
    if (concedida) setNotifications(true);
  };

  return (
    <div className="mt-3 rounded-2xl bg-amber/[0.07] p-5 ring-1 ring-amber/20">
      <p className="font-display text-[15px] font-semibold text-cream">{q.avisoTitulo}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-cream/65">
        {comSequencia ? q.avisoCorpoSequencia.replace("{n}", String(sequencia)) : q.avisoCorpo}
      </p>
      <div className="mt-4 flex gap-2">
        <button
          onClick={aceitar}
          className="flex-1 rounded-xl bg-amber px-4 py-2.5 font-display text-sm font-semibold text-graphite active:scale-[0.99]"
        >
          {q.avisoSim}
        </button>
        <button
          onClick={() => setFechado(true)}
          className="rounded-xl bg-graphite-700 px-4 py-2.5 font-display text-sm font-medium text-cream/70 ring-1 ring-white/10"
        >
          {q.avisoNao}
        </button>
      </div>
    </div>
  );
}
