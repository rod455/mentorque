// A compra avulsa no app: abrir o checkout do Stripe e confirmar na volta.
//
// POR QUE ASSIM (09/11/2026). Decisão do dono de 08/11: no Android a compra
// passa pelo Stripe, FORA do app, e volta para ele. O checkout abre na aba do
// sistema (`openExternal`), nunca dentro da WebView. Pago, o Stripe manda
// para /compra-concluida, que reabre o app pelo `mentorque://compra`.
//
// A volta tem TRÊS caminhos, porque nenhum sozinho é garantido:
//   1. o deep link `mentorque://compra?compra=<sessão>`;
//   2. o app voltando para a frente com uma sessão pendente guardada (quem
//      pagou e fechou a aba sem tocar em "voltar");
//   3. na web, o próprio /app?compra=<sessão>.
// Os três chamam /api/avulsa/confirmar, que grava a compra uma vez só (o
// webhook do Stripe grava a mesma pelo outro lado).
//
// No iPhone a folha não aparece: a Apple não aceita pagamento externo por
// conteúdo digital, e o pedido do dono foi o Android.
import { apiPost } from "./apiBase";
import { anonId } from "./anon";
import { closeExternal, isNativeApp, nativePlatform, onDeepLink, openExternal } from "./wrapper";
import { getBrowserSupabase } from "@/lib/supabaseBrowser";
import { APP_VERSION } from "./content";

export type ProdutoAvulso = "pacote_2" | "pacote_10" | "passe_7d";

export type SaldoAvulso = {
  ligada: boolean;
  compra?: "gravou" | "ja_existia" | "recusou" | "pendente" | null;
  restantes?: number | null;
  creditos?: number;
  passeAte?: string | null;
};

const PENDENTE = "mentorque.compraAvulsaPendente";
const JA_COMPROU = "mentorque.comprouAvulsa";

/** A folha aparece onde o pagamento externo é o caminho escolhido. */
export function avulsaDisponivel(): boolean {
  return nativePlatform() !== "ios";
}

function guardar(chave: string, valor: string | null) {
  try {
    if (valor === null) localStorage.removeItem(chave);
    else localStorage.setItem(chave, valor);
  } catch { /* sem armazenamento: a volta pelo deep link ainda funciona */ }
}
function ler(chave: string): string | null {
  try { return localStorage.getItem(chave); } catch { return null; }
}

export function sessaoPendente(): string | null {
  return ler(PENDENTE);
}

async function cabecalhos(): Promise<Record<string, string>> {
  const sb = getBrowserSupabase();
  const token = sb ? (await sb.auth.getSession()).data.session?.access_token : undefined;
  return token ? { authorization: `Bearer ${token}` } : {};
}

function plataforma(): string {
  return isNativeApp() ? nativePlatform() ?? "nativo" : "web";
}

/** Abre o checkout. Devolve falso quando não conseguiu (a tela avisa). */
export async function abrirCheckout(produto: ProdutoAvulso): Promise<boolean> {
  try {
    const res = await apiPost("/api/avulsa/checkout", { produto, anonId: anonId(), plataforma: plataforma(), versao: APP_VERSION }, await cabecalhos());
    if (!res.ok) return false;
    const data = (await res.json()) as { url?: string; sessao?: string };
    if (!data.url || !data.sessao) return false;
    guardar(PENDENTE, data.sessao);
    if (isNativeApp()) openExternal(data.url);
    else window.location.assign(data.url);
    return true;
  } catch {
    return false;
  }
}

/** Confirma uma sessão (ou só lê o saldo, sem sessão). */
export async function confirmarCompra(sessao: string | null): Promise<SaldoAvulso | null> {
  try {
    const res = await apiPost("/api/avulsa/confirmar", { sessao, anonId: anonId() }, await cabecalhos());
    if (!res.ok) return null;
    const data = (await res.json()) as SaldoAvulso;
    // Pendente fica guardada: o webhook pode chegar antes da próxima volta.
    // Gravou, já existia ou recusou: não há mais o que confirmar.
    if (sessao && data.compra && data.compra !== "pendente") guardar(PENDENTE, null);
    if (data.compra === "gravou" || data.compra === "ja_existia") guardar(JA_COMPROU, "1");
    return data;
  } catch {
    return null;
  }
}

/** Já comprou alguma vez neste aparelho? Só então vale ler o saldo ao abrir. */
export function jaComprouAqui(): boolean {
  return ler(JA_COMPROU) === "1";
}

/** O parâmetro da volta: a sessão, "cancelou", ou nada. Puro. */
export function compraDaUrl(url: string): string | null {
  const i = url.indexOf("?");
  if (i < 0) return null;
  const v = new URLSearchParams(url.slice(i)).get("compra");
  if (v === "cancelou") return v;
  return v && /^cs_[A-Za-z0-9_]{8,200}$/.test(v) ? v : null;
}

/**
 * Escuta as três voltas. `aoVoltar` recebe o saldo confirmado, ou
 * "cancelou". Devolve a limpeza.
 */
export function escutarVoltaDaCompra(aoVoltar: (r: SaldoAvulso | "cancelou" | null) => void): () => void {
  const tratar = async (compra: string | null) => {
    if (compra === "cancelou") {
      guardar(PENDENTE, null);
      aoVoltar("cancelou");
      return;
    }
    const sessao = compra ?? sessaoPendente();
    if (!sessao) return;
    aoVoltar(await confirmarCompra(sessao));
  };

  // 1. o deep link
  const tirarDeep = onDeepLink((url) => {
    if (!url.startsWith("mentorque://compra")) return;
    closeExternal();
    void tratar(compraDaUrl(url));
  });

  // 2. de volta para a frente com sessão pendente
  const aoVoltarParaFrente = () => {
    if (document.visibilityState === "visible" && sessaoPendente()) void tratar(null);
  };
  document.addEventListener("visibilitychange", aoVoltarParaFrente);

  // 3. a web: /app?compra=<sessão>
  if (typeof window !== "undefined") {
    const daUrl = compraDaUrl(window.location.href);
    if (daUrl) {
      const limpa = new URL(window.location.href);
      limpa.searchParams.delete("compra");
      window.history.replaceState(null, "", limpa.toString());
      void tratar(daUrl);
    } else if (sessaoPendente()) {
      void tratar(null);
    }
  }

  return () => {
    tirarDeep();
    document.removeEventListener("visibilitychange", aoVoltarParaFrente);
  };
}
