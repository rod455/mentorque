// Como sair do app para um endereço de fora, por plataforma. Pura, para
// `npm run conferir:navegacao` exercitar sem navegador.
//
// O CASO (dono, 12/09/2026, iPhone): tocou em "Atualizar" no banner de versão
// nova e ficou numa tela branca com "apps.apple.com" carregando para sempre.
// A saída passava pelo plugin Browser, que no iPhone é o Safari embutido
// (SFSafariViewController, só http e https: Browser.swift, linha 19). A ficha
// da loja dentro de um Safari embutido não vira a App Store; fica a página.
//
// O caminho certo no iPhone é o esquema `itms-apps://`, que o sistema entrega
// ao app da App Store. O Capacitor faz isso sozinho quando a WebView abre uma
// janela nova (`createWebViewWith` em WebViewDelegationHandler.swift chama
// `UIApplication.shared.open`), ou seja: `window.open` em vez do plugin.
//
// A mesma regra vale para "Avaliar o Mentorque" (`?action=write-review`), que
// usava o mesmo caminho. No Android a aba do sistema já entrega a Play.

export type SaidaDoApp = { url: string; pelaAba: boolean };

const LOJA_DA_APPLE = /^https:\/\/apps\.apple\.com\//;

export function comoSair(url: string, plataforma: "ios" | "android" | null): SaidaDoApp {
  if (plataforma === "ios" && LOJA_DA_APPLE.test(url)) {
    return { url: url.replace(/^https:/, "itms-apps:"), pelaAba: false };
  }
  return { url, pelaAba: true };
}
