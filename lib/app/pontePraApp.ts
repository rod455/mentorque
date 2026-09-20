// Para onde a ponte manda quem clicou no link do e-mail. Pura, sem janela nem
// navegador, para `npm run conferir:login` exercitar cada caso.
//
// A REGRA DO DONO (20/09/2026): "em vez de mandar para a web, quero que sempre
// direcione para o app que o usuário tem. Vamos utilizar o mínimo possível do
// aplicativo web."
//
// Como era até hoje: `emailRedirectUrl()` decidia pelo LUGAR DE ONDE O PEDIDO
// SAIU. Pediu recuperação dentro do app das lojas, o link voltava para a ponte;
// pediu pelo site, o link voltava para o site. Só que quem pede pelo site pode
// muito bem ter o app instalado, e nesse caso ele era jogado no navegador sem
// necessidade. O lugar de onde o pedido saiu não diz nada sobre onde a pessoa
// quer terminar.
//
// Agora a decisão é do APARELHO QUE ABRE O LINK, que é o único que sabe.
//
// POR QUE NÃO É SÓ "SEMPRE O ESQUEMA PRÓPRIO". Duas situações reais em que isso
// deixaria a pessoa num beco:
//
//   1. no computador não existe app nenhum para abrir. `mentorque://` ali é
//      endereço inválido, e o fim do caminho é uma página de erro;
//   2. no celular SEM o app instalado acontece a mesma coisa.
//
// O caso 1 esta regra resolve sozinha: computador vai direto para a web, sem
// tentar. O caso 2 ninguém resolve com certeza a partir do navegador, porque
// não existe forma de perguntar "você tem o app?" — por isso a ponte tenta o
// esquema e, se em `esperaMs` a página ainda estiver na frente da pessoa (ou
// seja, nenhum app assumiu), ela mesma segue para a web.
//
// O JEITO DEFINITIVO É OUTRO, e não cabe numa mudança de site: App Links no
// Android e Universal Links no iOS fazem o PRÓPRIO endereço https abrir o app
// quando ele existe, sem esquema próprio, sem relógio e sem chute. Exige
// `.well-known/assetlinks.json` com a impressão digital da assinatura,
// `apple-app-site-association`, o direito de Associated Domains e, acima de
// tudo, UM BUILD NOVO EM CADA LOJA. A proposta está em
// docs/agentes/propostas/links-do-app.md.
// Caminho relativo COM extensão, como em `saidaDoApp.ts`: assim a conferência
// roda no `node --experimental-strip-types`, que não lê os atalhos `@/` do
// tsconfig. Regra pura que a conferência não consegue importar é regra que
// ninguém exercita.
import { detectPlatform, type Platform } from "./platform.ts";

export type DestinoDaPonte =
  /** Tenta o app pelo esquema próprio, com a web de reserva se ninguém atender. */
  | { tipo: "app"; url: string; reserva: string; esperaMs: number }
  /** Aqui não existe app possível: vai direto, sem piscar erro nenhum. */
  | { tipo: "web"; url: string };

/** O esquema que o app das lojas escuta (`custom_url_scheme` do Android/iOS). */
const ESQUEMA = "mentorque://auth-callback";

/**
 * Quanto esperar o app assumir antes de seguir para a web.
 *
 * Dois segundos e meio é escolhido por cima: o app abrindo leva menos que isso
 * em qualquer aparelho, e quem NÃO tem o app espera esse tempo uma vez na vida.
 * Curto demais atropelaria um celular velho abrindo o app; longo demais deixa
 * quem não tem o app olhando para uma tela parada, achando que travou.
 */
export const ESPERA_PADRAO_MS = 2500;

/**
 * `search` e `hash` vão INTEIROS para os dois lados, e isso não é zelo.
 *
 * O link de recuperação chega em uma de duas formas: `?code=` (PKCE) ou
 * `#access_token=…&type=recovery` (implícito, que é o nosso). No implícito a
 * credencial inteira mora no FRAGMENTO, e é o fragmento que carrega o
 * `type=recovery` que faz a tela de senha nova aparecer (lib/app/recuperacao.ts).
 * Perder o `#` aqui é perder a recuperação inteira, calado.
 */
export function destinoDaPonte({
  plataforma,
  search = "",
  hash = "",
  esperaMs = ESPERA_PADRAO_MS,
}: {
  plataforma: Platform;
  search?: string;
  hash?: string;
  esperaMs?: number;
}): DestinoDaPonte {
  const cauda = `${search}${hash}`;
  const reserva = `/app${cauda}`;
  if (plataforma === "other") return { tipo: "web", url: reserva };
  return { tipo: "app", url: `${ESQUEMA}${cauda}`, reserva, esperaMs };
}

/** O mesmo, lendo a plataforma e o endereço do navegador. */
export function destinoDaPonteDaJanela(): DestinoDaPonte {
  if (typeof window === "undefined") return { tipo: "web", url: "/app" };
  return destinoDaPonte({
    plataforma: detectPlatform(),
    search: window.location.search,
    hash: window.location.hash,
  });
}
