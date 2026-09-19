"use client";

import { useEffect, useState } from "react";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/stores";
import { lojaDoAparelho, type Destino } from "@/lib/site/lojaDoAparelho";
import { capturaCampanha } from "@/lib/app/campanha";
import { funil } from "@/lib/app/funil";

/**
 * O link inteligente de download: uma parada de meio segundo entre o anúncio e
 * a loja.
 *
 * POR QUE ISTO EXISTE (19/09/2026). O link da bio do Instagram mandava a pessoa
 * direto para a ficha da loja, e loja não conta de onde o clique veio. O
 * resultado é que o Instagram era invisível: em todos os eventos desde 23/08 as
 * origens registradas são google (563), atalho (14) e email (8), e `instagram`
 * não aparece uma única vez. Não dava para dizer se um post funcionou.
 *
 * A página resolve duas coisas de uma vez:
 *
 *   1. manda para a loja CERTA pelo aparelho (iPhone para a App Store, Android
 *      para o Google Play), que é o que a pessoa esperava do link;
 *   2. guarda a etiqueta da campanha e registra o clique ANTES de sair, que é
 *      o que a gente não tinha.
 *
 * O desvio é do lado do cliente de propósito. Um 302 no servidor seria mais
 * rápido e não deixaria rastro nenhum: sem JavaScript rodando, a etiqueta não é
 * guardada e o evento não nasce. A espera é de 400ms, o bastante para o pedido
 * do evento sair, e a página mostra os dois botões para quem cair no desktop ou
 * para quem o desvio não pegar.
 *
 * NÃO substitui o OneLink da AppsFlyer, que continua na lista do dono: aquele
 * liga o clique à INSTALAÇÃO, e este liga o clique à origem. Enquanto ele não
 * existe, este é o que transforma "não sei" em número.
 */

export function LevaParaALoja() {
  const [destino, setDestino] = useState<Destino | null>(null);

  useEffect(() => {
    let cancelado = false;
    try {
      // A etiqueta PRIMEIRO: se a pessoa voltar para o site depois, a campanha
      // já está guardada no aparelho dela.
      capturaCampanha(window.location.search);
    } catch {
      /* rastreio nunca segura a página */
    }
    const escolhida = lojaDoAparelho(navigator.userAgent || "", navigator.maxTouchPoints || 0);
    setDestino(escolhida);
    try {
      funil("clicou_baixar", { origem: escolhida, umaVez: true, chave: `baixar:${escolhida}` });
    } catch {
      /* idem */
    }
    if (escolhida === "escolha") return;
    const url = escolhida === "app_store" ? APP_STORE_URL : PLAY_STORE_URL;
    const t = setTimeout(() => {
      if (!cancelado) window.location.replace(url);
    }, 400);
    return () => {
      cancelado = true;
      clearTimeout(t);
    };
  }, []);

  const indo = destino === "app_store" || destino === "play";

  return (
    <main className="min-h-screen bg-graphite text-cream flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <p className="font-display text-2xl font-semibold text-amber">Mentorque</p>
        <h1 className="mt-4 text-xl font-semibold">
          {indo ? "Abrindo a loja do seu celular" : "Baixe o Mentorque"}
        </h1>
        <p className="mt-3 text-sm text-cream/70">
          {indo
            ? "Se a loja não abrir sozinha em alguns segundos, toque no botão abaixo."
            : "Escolha a loja do seu celular. O app é grátis para começar."}
        </p>

        <div className="mt-8 flex flex-col gap-3" data-lojas>
          <a
            href={PLAY_STORE_URL}
            data-loja="play"
            className="rounded-xl border border-cream/20 px-5 py-3 text-sm font-semibold hover:border-amber"
          >
            Baixar no Google Play
          </a>
          <a
            href={APP_STORE_URL}
            data-loja="app-store"
            className="rounded-xl border border-cream/20 px-5 py-3 text-sm font-semibold hover:border-amber"
          >
            Baixar na App Store
          </a>
        </div>

        {/* Sem atalho para o /app aqui, de propósito: a decisão do dono de
            12/09/2026 é que nenhuma página do site leve até lá, e quem digita
            o endereço chega do mesmo jeito. A conferir:caminho cobra isso, e
            foi ela que pegou este link na primeira versão desta página. */}
        <p className="mt-8 text-xs text-cream/50">
          Grátis para começar: 5 perguntas por mês para a Biela, sem criar conta.
        </p>
      </div>
    </main>
  );
}
