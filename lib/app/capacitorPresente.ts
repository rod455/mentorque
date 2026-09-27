// Estamos rodando dentro do app das lojas?
//
// Uma função, sem dependência nenhuma, e ela mora sozinha por dois motivos.
//
// 1. PORQUE A RESPOSTA É "O CAPACITOR ESTÁ PUBLICADO NESTA JANELA", e não uma
//    pergunta feita ao Capacitor. Isso parece um detalhe e é o contrário: em
//    27/09/2026 a migalha do último passo quis saber se estava no app nativo e
//    fez o caminho que parece certo,
//
//        const { Capacitor } = await import("@capacitor/core");
//        if (!Capacitor.isNativePlatform()) return;
//
//    sem perceber que CARREGAR o `@capacitor/core` na web publica
//    `window.Capacitor`. Ou seja, importar o pacote para perguntar se estamos
//    no app nativo fazia o app nativo passar a existir. `isNativeApp()` virava
//    true no navegador, `sellsInApp()` virava false, e o site inteiro entrava
//    em MODO LEITOR: nenhum convite de assinatura em lugar nenhum, na web, que
//    é uma das duas plataformas que conseguem vender (no Android não há botão
//    de compra). Quem pegou foi a suíte de navegador `telas`, no "o paywall
//    desenha", depois de onze minutos.
//
//    Esta função é a porta que NÃO tem esse efeito: ela só olha a janela.
//
// 2. PORQUE ELA ESTAVA PRESA. Ela morava em `lib/app/wrapper.ts`, que importa
//    `@/lib/stores` por atalho de caminho, e atalho de caminho não existe para
//    o `node --experimental-strip-types`. Quem quisesse usá-la numa conferência
//    de linha de comando não conseguia. É a mesma mudança que as marcas de
//    convite sofreram em 25/09/2026, pelo mesmo motivo: regra pura no arquivo
//    errado é regra fora do alcance de quem confere.
//
// O `wrapper.ts` reexporta, então nenhum chamador antigo mudou.

export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
}
