// Quem bateu no limite do gratuito, gravado pela rota que recusa.
//
// POR QUE (05/11/2026). As rotas do Biela e do orçamento devolvem 429 quando o
// mês grátis acaba, e não gravavam nada. O teste da compra avulsa
// (`compra-avulsa-por-momento`) mostra a oferta exatamente nesse momento, e
// sem esta linha ele não teria denominador. Ver supabase/limites_atingidos.sql.
import type { SupabaseClient } from "@supabase/supabase-js";

export type OndeDoLimite = "biela" | "orcamento";

/**
 * Grava a recusa. Nunca lança: é métrica, e métrica não pode trocar o 429 que
 * a pessoa precisa receber por um 500. Mas também não cala: o erro vai para o
 * log, porque contagem que falha em silêncio parece "ninguém bateu no limite".
 */
export async function gravaLimiteAtingido(
  admin: SupabaseClient,
  l: {
    onde: OndeDoLimite;
    mes: string;
    userId: string | null;
    anonId: string | null;
    feitas: number;
    plataforma?: unknown;
    versao?: unknown;
  },
): Promise<void> {
  try {
    const { error } = await admin.from("limites_atingidos").insert({
      onde: l.onde,
      mes: l.mes,
      user_id: l.userId,
      anon_id: l.userId ? null : l.anonId,
      feitas: l.feitas,
      plataforma: typeof l.plataforma === "string" ? l.plataforma.slice(0, 16) : null,
      versao: typeof l.versao === "string" ? l.versao.slice(0, 16) : null,
    });
    if (error) console.error(`[${l.onde}] não gravei o limite atingido`, { motivo: error.message });
  } catch (e) {
    console.error(`[${l.onde}] não gravei o limite atingido`, { motivo: e instanceof Error ? e.message : String(e) });
  }
}
