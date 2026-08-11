"use client";

import { apiUrl } from "./apiBase";

// Catálogo de aulas vindo da rede.
//
// O app continua nascendo com o catálogo embutido no binário. Este módulo só
// SOBREPÕE, e apenas quando tem um payload válido em mãos. Se a rede falhar, se
// o JSON vier torto ou se for a primeira abertura, o embutido segue valendo —
// o motorista nunca vê tela vazia por causa disto.
//
// Assim, publicar uma aula nova passa a ser um deploy do site em vez de um
// build, uma revisão da Apple e uma atualização na mão do usuário.

type Bilingue = { pt: string; en: string };
export type AulaRemota = {
  id: string;
  title: Bilingue;
  body: Bilingue[];
  type: string;
  track: string;
  system?: string;
  premium?: boolean;
  make?: string;
  model?: string;
  difficulty?: string;
  traits?: string[];
  situations?: string[];
  media?: unknown;
  thumb?: string;
  addedAt?: string;
};
type Pacote = { version: string; lessons: AulaRemota[] };

const CHAVE = "mentorque-aulas-remotas";

let memoria: Pacote | null = null;
let lido = false;
let buscando = false;
const ouvintes = new Set<() => void>();

// Um payload quebrado é pior que payload nenhum: ele substituiria o catálogo
// bom por lixo, e ficaria guardado. Por isso a conferência é feita antes de
// aceitar, e vale tanto para o que chega da rede quanto para o que está no
// armazenamento (que pode ter sido gravado por uma versão anterior do app).
function valido(p: unknown): p is Pacote {
  if (!p || typeof p !== "object") return false;
  const { version, lessons } = p as Pacote;
  if (typeof version !== "string" || !Array.isArray(lessons) || lessons.length === 0) return false;
  return lessons.every(
    (a) =>
      a && typeof a.id === "string" && a.id.length > 0 &&
      a.title && typeof a.title.pt === "string" && typeof a.title.en === "string" &&
      Array.isArray(a.body) &&
      typeof a.track === "string" && typeof a.type === "string"
  );
}

function ler(): Pacote | null {
  if (lido) return memoria;
  lido = true;
  try {
    const cru = window.localStorage.getItem(CHAVE);
    if (cru) {
      const p = JSON.parse(cru);
      if (valido(p)) memoria = p;
      else window.localStorage.removeItem(CHAVE);
    }
  } catch { /* armazenamento indisponível: segue com o embutido */ }
  return memoria;
}

function avisar() { for (const f of ouvintes) f(); }

async function buscar() {
  if (buscando) return;
  buscando = true;
  try {
    const res = await fetch(apiUrl("/api/lessons"), { cache: "no-store" });
    if (!res.ok) return;
    const p = await res.json();
    if (!valido(p)) return;
    if (memoria?.version === p.version) return; // nada mudou
    memoria = p;
    try { window.localStorage.setItem(CHAVE, JSON.stringify(p)); } catch { /* cota cheia: vale só nesta sessão */ }
    avisar();
  } catch { /* offline: o embutido cobre */ } finally {
    buscando = false;
  }
}

/** Assina mudanças do catálogo remoto. A primeira assinatura dispara a busca. */
export function subscribe(fn: () => void): () => void {
  ouvintes.add(fn);
  if (ouvintes.size === 1) {
    ler();
    void buscar();
  }
  return () => { ouvintes.delete(fn); };
}

/** Instantâneo para o cliente: o pacote guardado, ou null. */
export function snapshot(): Pacote | null {
  if (typeof window === "undefined") return null;
  return ler();
}

/**
 * Instantâneo do servidor e da hidratação: sempre null.
 *
 * O HTML é gerado com o catálogo embutido. Se a primeira renderização do
 * cliente já usasse o remoto, o React acusaria divergência de hidratação —
 * então a troca acontece no passo seguinte, sem piscar.
 */
export function serverSnapshot(): Pacote | null { return null; }

/** Converte o pacote bilíngue para o idioma ativo, no formato que o app usa. */
export function paraIdioma(p: Pacote, locale: string) {
  const idioma = locale === "pt" ? "pt" : "en";
  return p.lessons.map((a) => ({
    ...a,
    title: a.title[idioma],
    body: a.body.map((t) => t[idioma]),
  }));
}
