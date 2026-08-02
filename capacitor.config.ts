import type { CapacitorConfig } from "@capacitor/cli";

// Wrapper nativo do Mentorque (Capacitor). A WebView carrega o app de
// produção — todo conteúdo atualiza via deploy, sem novo release na loja.
const config: CapacitorConfig = {
  appId: "mentorque.app",
  appName: "Mentorque",
  // webDir é obrigatório mas não é usado: o app roda do servidor (abaixo).
  webDir: "public",
  server: {
    url: "https://mentorque.com.br/app",
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    AdMob: {
      appId: "ca-app-pub-9316035916536420~8094986125",
    },
  },
};

export default config;
