"use client";

import { useEffect, useState } from "react";
import { activeVehicle, usePrototype } from "@/lib/app/store";
import { useAuth } from "@/lib/app/auth";
import { useNav } from "@/lib/app/nav";
import { carName } from "@/lib/app/content";
import { marcaVeioSalvarGaragem } from "@/lib/app/veioSalvarGaragem";
import {
  cabeSegundoPedido,
  gastaSegundoPedido,
  marcaPedidoDeContaNaSessao,
  marcaRecusaDeConta,
} from "@/lib/app/segundoPedidoDeConta";
import { funil } from "@/lib/app/funil";
import { Icon, useContent } from "./ui";

/**
 * Nome do evento que esta folha escuta.
 *
 * POR QUE EVENTO E NÃO UMA MARCA NO sessionStorage: a folha é montada UMA VEZ,
 * junto com o app, dentro de Sobreposicoes. Um efeito de montagem lendo uma
 * marca rodaria antes de o cadastro de carro existir, e a folha nunca
 * apareceria — o defeito silencioso de sempre, que só apareceria no aparelho
 * do dono. O mesmo desenho da folha de estrelas (lib/app/feedbackPrompt.ts).
 */
export const EVENTO = "mq-salve-garagem";

/** Chamado pelo cadastro de carro: acorda a folha. */
export function pedirConviteDeConta(): void {
  if (typeof window === "undefined") return;
  // Antes do evento, e de forma síncrona: o carro novo chega ao estado no
  // mesmo toque, e o efeito do segundo pedido não pode vê-lo sem ver a marca.
  marcaPedidoDeContaNaSessao();
  window.dispatchEvent(new CustomEvent(EVENTO));
}

// "Salve sua garagem": o convite a criar conta logo depois do primeiro carro.
//
// O MOMENTO É O ARGUMENTO. A pessoa acabou de digitar marca, modelo, ano e km;
// é o instante em que ela mais sente que tem algo a perder, e o único em que
// "seus dados estão só neste aparelho" é uma frase concreta em vez de um
// aviso genérico. Pedir cadastro na abertura do app é pedir por nada, e é o
// que faz metade das pessoas fechar antes de ver o produto.
//
// DÁ PARA DIZER NÃO, e isso não é fraqueza de desenho: o app funciona como
// convidado de propósito (está nos Termos, seção 3), e forçar a conta aqui
// seria quebrar uma promessa escrita para ganhar um cadastro. Quem recusa
// continua com tudo funcionando; o convite só não volta.
//
// Uma vez por sessão, nunca para quem já tem conta.
export function SalveSuaGaragem() {
  const c = useContent();
  const g = c.salvarGaragem;
  const { s } = usePrototype();
  const { user, ready } = useAuth();
  const { go } = useNav();
  const [aberta, setAberta] = useState(false);
  // Qual dos dois pedidos está na tela. Sem isto o funil não separa a conta que
  // o segundo pedido trouxe da que o primeiro já trazia, e a aposta não fecha.
  const [repique, setRepique] = useState(false);

  useEffect(() => {
    const abrir = () => setAberta(true);
    window.addEventListener(EVENTO, abrir);
    return () => window.removeEventListener(EVENTO, abrir);
  }, []);

  // O SEGUNDO PEDIDO, para quem já tem algo a perder (30/10/2026).
  //
  // Medido em 30/10: dos 225 convidados que tocaram em "Agora não" desde
  // 17/10, 73 depois fizeram algo de valor no app e só 7 criaram conta, cinco
  // deles pela folha que reapareceu ao cadastrar outro carro. Fora isso a
  // folha nasce só do cadastro de carro, e quem já tem carro nunca mais a
  // dispara.
  //
  // "Algo a perder" é estado que existe e é da pessoa: um serviço registrado,
  // um abastecimento ou uma aula vista. O carro NÃO conta aqui, de propósito:
  // é ele que dispara a primeira folha, e foi exatamente com o carro na mão
  // que ela disse não.
  //
  // As três travas (um repique na vida, nunca na sessão da recusa, nunca depois
  // de dois "não") moram em lib/app/segundoPedidoDeConta.ts, puras, para a
  // conferência de linha de comando exercitá-las sem navegador.
  const temAlgoAPerder =
    (s.services?.length ?? 0) > 0 ||
    (s.abastecimentos?.length ?? 0) > 0 ||
    (s.seenLessons?.length ?? 0) > 0;
  const v = activeVehicle(s);
  // `ready` e `v` são travas, não enfeite (revisão de 30/10). Sem `ready`, a
  // conta de quem já está logado ainda não chegou na abertura, `user` é nulo
  // por um instante, e o repique seria gasto e contado como convite para quem
  // já tem conta. Sem `v`, o convidado sem carro que viu uma aula gastaria o
  // repique numa folha que não desenha (ela precisa do carro), e sem contador
  // isso agora é o caso comum.
  const temCarro = !!v;
  useEffect(() => {
    if (!ready || user || !temCarro) return;
    if (!cabeSegundoPedido(temAlgoAPerder)) return;
    gastaSegundoPedido();
    setRepique(true);
    setAberta(true);
  }, [ready, user, temCarro, temAlgoAPerder]);

  const visivel = aberta && !user && !!v;

  // A FOLHA PASSA A CONTAR (17/10/2026). Ela é o degrau com mais gente do
  // produto, uns 100 aparelhos por semana que ganham carro e não ganham conta,
  // e não gravava nada: nem que apareceu, nem o sim, nem o não. A rodada do CRO
  // de 16/10 teve de reconstruir o degrau pelo carro e pelo cadastro. Uma vez
  // por sessão, como a própria folha.
  useEffect(() => {
    if (visivel) {
      funil("convite_conta", {
        origem: "carro",
        umaVez: true,
        chave: repique ? "convite_conta_repique" : "convite_conta",
        ...(repique ? { detalhe: "repique" } : {}),
      });
    }
  }, [visivel, repique]);

  if (!visivel || !v) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-graphite/80 px-4 pb-[max(env(safe-area-inset-bottom),16px)] backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-graphite-800 p-6 ring-1 ring-white/10">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-amber/15 text-amber">
          <Icon name="car" className="h-6 w-6" />
        </div>
        <p className="text-center font-serif text-lg font-bold text-cream">{g.title}</p>
        <p className="mt-2 text-center text-sm leading-relaxed text-cream/65">
          {g.body.replace("{carro}", carName(v))}
        </p>

        {/* A MARCA VAI JUNTO COM O TOQUE (16/10/2026). Sem ela a tela seguinte
            abre em "Entrar", que é o contrário do que este botão promete. Ver
            lib/app/veioSalvarGaragem.ts. */}
        <button
          onClick={() => {
            funil("aceitou_convite_conta", { origem: "carro", ...(repique ? { detalhe: "repique" } : {}) });
            marcaVeioSalvarGaragem();
            setAberta(false);
            go({ name: "auth" });
          }}
          className="mt-5 w-full rounded-xl bg-amber px-4 py-3 font-display text-sm font-semibold text-graphite active:scale-[0.99]"
        >
          {g.cta}
        </button>
        <button
          onClick={() => {
            // A recusa é contada aqui: é ela que destrava o segundo pedido (a
            // primeira) e que encerra o assunto (a segunda).
            const recusas = marcaRecusaDeConta(repique || (s.vehicles?.length ?? 0) > 1);
            funil("recusou_convite_conta", {
              origem: "carro",
              detalhe: recusas >= 2 ? "botao-2" : "botao",
            });
            setAberta(false);
          }}
          className="mt-2 w-full rounded-xl px-4 py-2.5 font-display text-sm font-medium text-cream/55"
        >
          {g.later}
        </button>
      </div>
    </div>
  );
}
