"use client";

// Quando um anúncio pode aparecer.
//
// A versão reprovada pela Google Play exibia um anúncio premiado de 8 segundos
// em cima do cadastro do primeiro carro — a única ação possível na tela
// inicial. Quem fechasse o anúncio voltava para a tela vazia. O revisor não
// tinha como chegar ao conteúdo, e a rejeição por "funcionalidade mínima /
// falta de engajamento" veio daí.
//
// Regra agora: anúncio nunca bloqueia uma ação do usuário (cadastrar carro,
// registrar serviço). Ele só aparece entre conteúdos, depois de o usuário já
// ter tirado valor do app, e com intervalo e teto diário.

// Conteúdos que o usuário abre de graça antes do primeiro anúncio.
const GRACE_OPENS = 4;
// Intervalo mínimo entre dois anúncios.
const COOLDOWN_MS = 4 * 60 * 1000;
// Teto por dia.
const DAILY_CAP = 6;

const KEY = "mentorque-ads";

type AdState = {
  opens: number; // conteúdos abertos no total
  lastAt: number; // timestamp do último anúncio
  day: string; // dia corrente (YYYY-MM-DD)
  today: number; // anúncios exibidos hoje
};

const EMPTY: AdState = { opens: 0, lastAt: 0, day: "", today: 0 };

const today = () => new Date().toISOString().slice(0, 10);

function read(): AdState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = { ...EMPTY, ...(JSON.parse(raw) as Partial<AdState>) };
    // Virou o dia → zera o teto diário.
    return parsed.day === today() ? parsed : { ...parsed, day: today(), today: 0 };
  } catch {
    return EMPTY;
  }
}

function write(next: AdState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* modo privado / cota — a política só fica mais permissiva */
  }
}

// Chamar ao abrir uma aula ou um problema. Conta para a carência inicial.
export function registerContentOpen(): void {
  const s = read();
  write({ ...s, opens: s.opens + 1 });
}

// Pode exibir um anúncio agora? Só chamar no cliente (usa localStorage).
export function canShowAd(): boolean {
  const s = read();
  if (s.opens < GRACE_OPENS) return false;
  if (s.today >= DAILY_CAP) return false;
  return Date.now() - s.lastAt >= COOLDOWN_MS;
}

// Chamar quando o anúncio efetivamente apareceu.
export function markAdShown(): void {
  const s = read();
  write({ ...s, day: today(), today: s.today + 1, lastAt: Date.now() });
}
