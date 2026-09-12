// O link de sair da jornada, assinado por pessoa.
//
// O link vai dentro de todo e-mail e precisa funcionar sem login (a pessoa
// clica no celular, no navegador que for). Sem assinatura, qualquer um que
// soubesse um user_id tiraria outra pessoa da lista; com ela, só quem recebeu
// o e-mail tem o link certo. HMAC do user_id com um segredo do servidor.
//
// O segredo: JORNADA_SEGREDO na Vercel. Enquanto ela não existir, cai na
// DADOS_CHAVE, que já é segredo do servidor e já existe, para a jornada não
// ficar parada por causa de uma variável a mais. Trocar o segredo invalida
// os links dos e-mails já enviados, e é só isso que acontece.

import { createHmac, timingSafeEqual } from "node:crypto";

export const SITE = "https://www.mentorque.com.br";

function segredo(): string | null {
  return process.env.JORNADA_SEGREDO ?? process.env.DADOS_CHAVE ?? null;
}

export function assinaturaDeSaida(userId: string): string | null {
  const s = segredo();
  if (!s) return null;
  return createHmac("sha256", s).update(`sair:${userId}`).digest("hex").slice(0, 40);
}

export function assinaturaConfere(userId: string, assinatura: string): boolean {
  const esperada = assinaturaDeSaida(userId);
  if (!esperada || !assinatura || assinatura.length !== esperada.length) return false;
  return timingSafeEqual(Buffer.from(esperada), Buffer.from(assinatura));
}

/** A URL completa do link de sair, ou null sem segredo (aí não se envia). */
export function linkDeSaida(userId: string): string | null {
  const a = assinaturaDeSaida(userId);
  if (!a) return null;
  return `${SITE}/api/jornada/sair?u=${encodeURIComponent(userId)}&a=${a}`;
}
