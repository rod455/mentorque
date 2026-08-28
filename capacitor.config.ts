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
    // O RevenueCat entra aqui para o Play Billing. A biblioteca ir no pacote
    // NÃO liga a venda: quem liga é a NEXT_PUBLIC_REVENUECAT_ANDROID_KEY no
    // build (lib/app/wrapper.ts → sellsInApp). Sem a chave o app segue em modo
    // leitor, igual a antes, e o plugin fica inerte.
    includePlugins: [
      "@capacitor/app",
      "@capacitor/browser",
      "@capacitor/local-notifications",
      // Push de verdade, embarcado DESLIGADO (decisão do dono, 28/08). Sem o
      // google-services.json o build passa (o gradle só aplica o plugin do
      // Google se o arquivo existir) e o registro falha em silêncio no
      // aparelho. Os passos para ligar estão em docs/push.md.
      "@capacitor/push-notifications",
      "@capacitor-community/admob",
      "@revenuecat/purchases-capacitor",
    ],
  },
  ios: {
    // Sem anúncios no iOS: o SDK do AdMob fica fora do build da Apple.
    // O social-login precisa entrar: é ele que abre a folha nativa da Apple e
    // do Google e devolve o idToken para o app (lib/app/socialLogin.ts).
    includePlugins: [
      "@capacitor/app",
      "@capacitor/browser",
      "@capacitor/local-notifications",
      // Push embarcado desligado, como no Android. No iPhone ele só passa a
      // registrar quando a capacidade Push Notifications existir no App ID e
      // o aps-environment entrar no App.entitlements (docs/push.md); até lá o
      // register() falha e o catch engole.
      "@capacitor/push-notifications",
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
