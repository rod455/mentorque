import type { Metadata } from "next";
import { AuthProvider } from "@/lib/app/auth";
import { PrototypeProvider } from "@/lib/app/store";
import { NativeLinkGuard } from "@/components/app/NativeLinkGuard";
import { AppBoundary } from "@/components/app/AppBoundary";

// O app em si (a landing é que é indexada). O título vai para o <title> da
// página — e é lido por rastreadores e pelos revisores das lojas, então nada
// de "protótipo" aqui.
export const metadata: Metadata = {
  title: "Mentorque — cuide do seu carro com confiança",
  robots: { index: false, follow: false },
};

// Vigia de inicialização — a última linha de defesa contra a tela morta.
//
// O AppBoundary cobre erros DENTRO do React. Mas se o próprio bundle não
// chegar (deploy no meio do carregamento, rede caindo depois do HTML, WebView
// bloqueando o script), o React nunca monta e nenhum componente pode socorrer:
// sobra o HTML do servidor, que é uma casca sem nada clicável.
//
// Este script é inline, roda sem depender de nenhum arquivo externo e revela
// um aviso com botão de recarregar caso o app não dê sinal de vida. O
// AppBoundary chama window.__mqReady() ao montar e o aviso é descartado.
const BOOT_WATCHDOG = `(function(){
  var booted=false;
  window.__mqReady=function(){
    booted=true;
    var f=document.getElementById('mq-boot-fallback');
    if(f&&f.parentNode)f.parentNode.removeChild(f);
  };
  setTimeout(function(){
    if(booted)return;
    var f=document.getElementById('mq-boot-fallback');
    if(f)f.style.display='flex';
  },9000);
})();`;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: BOOT_WATCHDOG }} />
      {/* Estilo embutido de propósito: precisa funcionar mesmo se a folha de
          estilos não tiver carregado. */}
      <div
        id="mq-boot-fallback"
        style={{
          display: "none",
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          padding: "24px",
          textAlign: "center",
          background: "#16181d",
          color: "#f4f2ec",
          font: '16px/1.4 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <strong style={{ fontSize: "20px" }}>Algo travou por aqui</strong>
        <span style={{ maxWidth: "20rem", opacity: 0.65, fontSize: "14px" }}>
          Não conseguimos carregar o app agora. Verifique sua conexão e tente de novo.
        </span>
        <a
          href="/app"
          style={{
            marginTop: "4px",
            padding: "12px 24px",
            borderRadius: "999px",
            background: "#f2a623",
            color: "#16181d",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Tentar de novo
        </a>
      </div>
      {/* A fronteira envolve TUDO: os providers também leem storage e podem
          falhar num aparelho com dados de site bloqueados. */}
      <AppBoundary>
        <AuthProvider>
          <NativeLinkGuard />
          <PrototypeProvider>{children}</PrototypeProvider>
        </AuthProvider>
      </AppBoundary>
    </>
  );
}
