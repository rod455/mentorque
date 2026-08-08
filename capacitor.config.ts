import type { CapacitorConfig } from "@capacitor/cli";

// App nativo do Mentorque (Capacitor). O app roda INTEIRO de dentro do
// binário: telas, estilos, imagens e lógica são arquivos empacotados, gerados
// por `npm run build:native`. Não existe `server.url` — a WebView nunca sai
// para a internet para desenhar a interface, então não há tela branca por
// falta de rede nem navegação escapando para o Safari.
//
// O que continua vindo da rede: as rotas de API (Biela, Stripe, FIPE, revisões)
// e o catálogo de conteúdo, ambos chamados por URL absoluta.
const config: CapacitorConfig = {
  appId: "mentorque.app",
  appName: "Mentorque",
  webDir: "native/app",
  server: {
    androidScheme: "https",
    iosScheme: "capacitor",
  },
  android: {
    allowMixedContent: false,
    // Sem RevenueCat no Android: o app da loja é "modo leitor" (não vende
    // assinatura), então a biblioteca do Play Billing não deve ir no pacote.
    includePlugins: ["@capacitor/app", "@capacitor/browser", "@capacitor-community/admob"],
  },
  ios: {
    // Sem anúncios no iOS: o SDK do AdMob fica fora do build da Apple.
    // O social-login precisa entrar: é ele que abre a folha nativa da Apple e
    // do Google e devolve o idToken para o app (lib/app/socialLogin.ts).
    includePlugins: [
      "@capacitor/app",
      "@capacitor/browser",
      "@revenuecat/purchases-capacitor",
      "@capgo/capacitor-social-login",
    ],
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
