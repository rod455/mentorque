import { APP_ORIGIN } from "./wrapper";

// Base das rotas de API.
//
// Na web o app e as rotas moram na mesma origem, então caminho relativo basta.
// Já no app da loja o HTML vem de dentro do binário (capacitor://localhost), e
// um fetch("/api/...") bateria nos arquivos empacotados em vez do servidor.
// Por isso, no nativo, toda chamada de API vira absoluta para produção.
//
// NEXT_PUBLIC_SITE_URL permite apontar um build para outro ambiente (staging)
// sem tocar no código.
const REMOTE = (process.env.NEXT_PUBLIC_SITE_URL || APP_ORIGIN).replace(/\/+$/, "");

function isNative(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as { Capacitor?: unknown };
  // Também cobre o caso de o HTML ter sido aberto de dentro do pacote sem o
  // Capacitor ter injetado o global ainda.
  return !!w.Capacitor || window.location.protocol === "capacitor:" || window.location.protocol === "file:";
}

/** Caminho de API pronto para uso — relativo na web, absoluto no app nativo. */
export function apiUrl(path: string): string {
  if (!path.startsWith("/")) path = `/${path}`;
  return isNative() ? `${REMOTE}${path}` : path;
}
