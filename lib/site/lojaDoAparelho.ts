// Qual loja este aparelho abre, lida do que o navegador diz ser.
//
// POR QUE MORA AQUI, E NÃO DENTRO DO COMPONENTE (19/09/2026). Esta é a única
// parte do link inteligente que pode errar em silêncio: o desvio em si é uma
// linha, mas mandar um iPhone para o Google Play é um beco sem saída para a
// pessoa e um clique pago jogado fora. Num arquivo simples ela é conferível
// com os textos de verdade que os navegadores mandam, inclusive os do
// navegador de dentro do Instagram, que é por onde a maior parte desse
// tráfego chega.

export type Destino = "app_store" | "play" | "escolha";

/**
 * @param ua o `navigator.userAgent`
 * @param toques o `navigator.maxTouchPoints` (o iPad moderno se anuncia como
 *   Macintosh, e sem o toque ele cairia na escolha manual)
 */
export function lojaDoAparelho(ua: string, toques = 0): Destino {
  const u = (ua || "").toLowerCase();
  // Android ANTES de iOS: o navegador do Instagram no Android carrega a
  // palavra "Mobile" e às vezes nomes de aparelho que confundem, mas sempre
  // diz "android". Já um iPhone nunca diz "android".
  if (/android/.test(u)) return "play";
  if (/iphone|ipod|ipad/.test(u)) return "app_store";
  if (/macintosh|mac os x/.test(u) && toques > 1) return "app_store"; // iPad moderno
  return "escolha";
}
