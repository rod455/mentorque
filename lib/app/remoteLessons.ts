"use client";

import { apiUrl } from "./apiBase";
import type { Content } from "./content";

// Catálogo de aulas vindo da rede.
//
// O app continua nascendo com o catálogo embutido no binário. Este módulo só
// SOBREPÕE, e apenas quando tem um payload válido em mãos. Se a rede falhar, se
// o JSON vier torto ou se for a primeira abertura, o embutido segue valendo —
// o motorista nunca vê tela vazia por causa disto.
//
// Assim, publicar uma aula nova passa a ser um deploy do site em vez de um
// build, uma revisão da Apple e uma atualização na mão do usuário.

export type Bilingue = { pt: string; en: string };
type Aula = Content["lessons"][number];

// Derivado do tipo real da aula, e não escrito à mão: assim um campo novo em
// `Lesson` aparece aqui como erro de compilação, em vez de sumir calado no
// payload e chegar `undefined` no aparelho — que foi como toda aula quebrou ao
// abrir na primeira versão disto.
export type AulaRemota = Omit<Aula, "title" | "body" | "need" | "steps" | "safety" | "stepsByLevel"> & {
  title: Bilingue;
  body?: Bilingue[];
  need: Bilingue[];
  steps: Bilingue[];
  safety: Bilingue[];
  stepsByLevel?: { iniciante: Bilingue[]; avancado: Bilingue[]; mecanico: Bilingue[] };
};

// Trilhas guiadas também viajam no pacote: trilha nova ou reordenada entra por
// deploy do site, sem build. Campo OPCIONAL de ponta a ponta — payload antigo
// (só lessons) continua válido, e app antigo ignora o campo que não conhece.
type Curso = Content["courses"][number];
export type CursoRemoto = Omit<Curso, "title" | "goal"> & { title: Bilingue; goal: Bilingue };

type Pacote = { version: string; lessons: AulaRemota[]; courses?: CursoRemoto[] };

// Interruptor do catálogo remoto.
//
// LIGADO. Ficou `false` durante o envio à App Store: o mecanismo tinha acabado
// de causar uma quebra (a rota descartava campos obrigatórios da aula) e não
// valia carregar esse risco numa submissão já devolvida duas vezes. O app foi
// aprovado, e a causa daquela quebra não volta — a rota agora espalha a aula
// inteira em vez de enumerar campo a campo.
//
// O embutido continua sendo o piso: `valido()` recusa pacote torto, e rede
// fora, JSON estranho ou primeira abertura caem no catálogo do binário. O que
// muda é que publicar aula passa a ser um deploy do site.
//
// CAPAS: `thumb` viaja como está escrito na aula. Caminho relativo
// (`/learn/x.png`) resolve DENTRO do pacote do app — serve para arte que já foi
// no binário. Aula publicada entre um build e outro precisa do endereço
// completo do site, senão o card chega sem imagem. Ver a nota em `content.ts`,
// no campo `thumb`.
const REMOTO_LIGADO = true;

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
      typeof a.track === "string" && typeof a.type === "string" &&
      // Obrigatórios no tipo da aula. A tela lê `.length` deles direto, então
      // um payload sem eles derruba o app — melhor recusar o pacote inteiro e
      // seguir com o embutido.
      Array.isArray(a.need) && Array.isArray(a.steps) && Array.isArray(a.safety) &&
      (a.body === undefined || Array.isArray(a.body))
  ) && cursosValidos((p as Pacote).courses);
}

// Trilha torta não derruba o pacote das aulas? Derruba sim — de propósito: um
// pacote meio-válido gravado no armazenamento viraria fonte permanente de
// estado esquisito. Ou vem tudo certo, ou fica o catálogo anterior.
function cursosValidos(cs: unknown): boolean {
  if (cs === undefined) return true; // payload antigo, sem trilhas
  if (!Array.isArray(cs)) return false;
  return cs.every(
    (t) =>
      t && typeof t.id === "string" && t.id.length > 0 &&
      t.title && typeof t.title.pt === "string" && typeof t.title.en === "string" &&
      t.goal && typeof t.goal.pt === "string" && typeof t.goal.en === "string" &&
      Array.isArray(t.order) && t.order.every((x: unknown) => typeof x === "string")
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
    if (!REMOTO_LIGADO) {
      // Apaga o que estiver guardado: um aparelho que já baixou um catálogo
      // antes de o interruptor cair não pode continuar usando aquilo.
      try { window.localStorage.removeItem(CHAVE); } catch { /* ignore */ }
      return () => { ouvintes.delete(fn); };
    }
    ler();
    void buscar();
  }
  return () => { ouvintes.delete(fn); };
}

/** Instantâneo para o cliente: o pacote guardado, ou null. */
export function snapshot(): Pacote | null {
  if (!REMOTO_LIGADO || typeof window === "undefined") return null;
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
export function paraIdioma(p: Pacote, locale: string): Aula[] {
  const i = locale === "pt" ? "pt" : "en";
  const um = (v: Bilingue[] | undefined) => v?.map((t) => t[i]);
  return p.lessons.map((a) => ({
    ...a,
    title: a.title[i],
    body: um(a.body),
    need: um(a.need) ?? [],
    steps: um(a.steps) ?? [],
    safety: um(a.safety) ?? [],
    stepsByLevel: a.stepsByLevel
      ? {
          iniciante: um(a.stepsByLevel.iniciante) ?? [],
          avancado: um(a.stepsByLevel.avancado) ?? [],
          mecanico: um(a.stepsByLevel.mecanico) ?? [],
        }
      : undefined,
  }));
}

/** Trilhas do pacote no idioma ativo — null quando o payload não as traz. */
export function cursosParaIdioma(p: Pacote, locale: string): Curso[] | null {
  if (!p.courses) return null;
  const i = locale === "pt" ? "pt" : "en";
  return p.courses.map((t) => ({ ...t, title: t.title[i], goal: t.goal[i] }));
}
