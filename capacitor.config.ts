import type { CapacitorConfig } from "@capacitor/cli";

// Wrapper nativo do Mentorque (Capacitor). A WebView carrega o app de
// produção — todo conteúdo atualiza via deploy, sem novo release na loja.
const config: CapacitorConfig = {
  appId: "mentorque.app",
  appName: "Mentorque",
  // Só a casca offline é empacotada no app. Apontar para `public/` embarcaria
  // ~32 MB de imagens que a WebView nunca lê (o app roda do servidor abaixo).
  webDir: "native/webshell",
  server: {
    url: "https://mentorque.com.br/app",
    androidScheme: "https",
    // Sem rede (ou erro HTTP no carregamento): a WebView cai nesta página
    // empacotada em vez de mostrar tela branca.
    errorPath: "offline.html",
  },
  android: {
    allowMixedContent: false,
    // Sem RevenueCat no Android: o app da loja é "modo leitor" (não vende
    // assinatura), então a biblioteca do Play Billing não deve ir no pacote.
    includePlugins: ["@capacitor/app", "@capacitor/browser", "@capacitor-community/admob"],
  },
  ios: {
    // Sem anúncios no iOS: o SDK do AdMob fica fora do build da Apple.
    includePlugins: ["@capacitor/app", "@capacitor/browser", "@revenuecat/purchases-capacitor"],
  },
  plugins: {
    AdMob: {
      appId: "ca-app-pub-9316035916536420~8094986125",
    },
    // O app é sempre escuro: força ícones claros nas barras do sistema
    // (o padrão segue o tema do aparelho e some em telas claras).
    SystemBars: {
      style: "DARK",
    },
  },
};

export default config;
