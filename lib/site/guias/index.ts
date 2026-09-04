// O registro dos guias de sintoma do site.
//
// UMA LISTA SÓ, e isso é o ponto. O sitemap lê daqui, os links entre os guias
// leem daqui e a conferência lê daqui. Antes o sitemap era uma lista escrita à
// mão em `app/sitemap.ts`, e página nova que não aparece no sitemap é página
// que demora muito mais para ser descoberta, sem dar erro nenhum: o site
// funciona, a página abre, e ninguém a encontra.
import { guia as barulho } from "./barulho-no-carro";
import { guia as gasolina } from "./carro-gastando-muita-gasolina";
import { guia as naoPega } from "./carro-nao-pega";
import { guia as injecao } from "./luz-da-injecao-acesa";
import type { Guia } from "./tipos";

export type { Bloco, Guia, Pergunta } from "./tipos";

/**
 * Todos os guias publicados.
 *
 * A ordem é a de publicação, e ela aparece na lista "outros guias" do rodapé
 * de cada página. Guia novo entra no fim.
 */
export const GUIAS: Guia[] = [barulho, injecao, naoPega, gasolina];

/** Os outros guias, para o bloco de links internos de um deles. */
export function irmaosDe(caminho: string): Guia[] {
  return GUIAS.filter((g) => g.caminho !== caminho);
}
