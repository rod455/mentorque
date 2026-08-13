import { siteOrigin } from "./apiBase";

// Endereços das páginas legais, SEMPRE absolutos.
//
// Dentro do app das lojas o HTML vem do binário e a origem é
// `capacitor://localhost`. Um link relativo como `/privacidade` aponta, ali,
// para um arquivo que não existe no pacote: o roteador do Capacitor devolve o
// index.html e o app se recarrega sozinho. Do lado de fora parece um link
// morto — e foi por links assim que a Apple devolveu a versão pela diretriz
// 3.1.2(c), que exige links FUNCIONAIS para os termos e a privacidade dentro
// do fluxo de compra.
//
// Com a URL absoluta, o NativeLinkGuard reconhece que o destino sai do app e
// manda para o navegador do sistema, que é o comportamento esperado.

export function privacyUrl(locale: string): string {
  return `${siteOrigin()}${locale === "pt" ? "/privacidade" : "/privacy"}`;
}

export function termsUrl(locale: string): string {
  return `${siteOrigin()}${locale === "pt" ? "/termos" : "/terms"}`;
}
