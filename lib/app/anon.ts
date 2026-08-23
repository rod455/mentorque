"use client";

// A identidade anônima do aparelho (localStorage), compartilhada pelo funil
// e pelos experimentos A/B. Não identifica ninguém fora do app.
const CHAVE_ANON = "mq-anon-id";

export function anonId(): string {
  try {
    let v = window.localStorage.getItem(CHAVE_ANON);
    if (!v) {
      v = crypto.randomUUID();
      window.localStorage.setItem(CHAVE_ANON, v);
    }
    return v;
  } catch {
    return "sem-armazenamento";
  }
}
