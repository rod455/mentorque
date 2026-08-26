import type { SupabaseClient } from "@supabase/supabase-js";

// Eventos de funil que nascem NO SERVIDOR.
//
// A regra que vale desde o começo: evento financeiro só existe quando o
// servidor confirmou com o processador. O app nunca fabrica conversão. Isso
// continua valendo — o que muda aqui é reconhecer que o servidor tem DOIS
// caminhos para confirmar, não um:
//
//   · o webhook do Stripe, que chega sozinho;
//   · o /api/stripe/sync, que o app dispara ao voltar do checkout e que LÊ a
//     assinatura direto do Stripe com a chave secreta.
//
// Os dois são o servidor perguntando ao Stripe. Depender só do primeiro foi o
// que produziu o buraco de 25/08: uma assinatura real, paga, e `funil_eventos`
// sem um único `assinou`. Com os dois gravando, o evento só some se as duas
// portas falharem ao mesmo tempo.
//
// Quem impede a contagem dobrada é o BANCO, não este código: o índice
// `funil_eventos_assinou_unico` deixa passar um `assinou` por assinatura, e a
// segunda tentativa bate nele. Guardar isso no banco em vez de num "confere
// antes de inserir" elimina a corrida entre os dois caminhos, que podem chegar
// no mesmo segundo.

/** Erro do Postgres para violação de chave única. */
const DUPLICADO = "23505";

// O mesmo tipo que `getSupabaseAdmin()` devolve. Sem parâmetros de genérico:
// o projeto não gera tipos do banco, então qualquer coisa mais específica aqui
// briga com o cliente real em vez de descrever ele.
type Admin = SupabaseClient;

/**
 * Grava um evento de funil vindo do servidor.
 *
 * Nunca lança: funil é métrica, e métrica não pode derrubar o webhook que
 * mantém a assinatura em dia. Mas também não cala: duplicado é esperado e sai
 * em silêncio, enquanto qualquer outro erro vai para o log, porque foi
 * justamente o silêncio que fez uma etapa ficar em zero parecendo desinteresse
 * de quem usa o app.
 */
export async function eventoDeFunil(
  admin: Admin,
  evento: string,
  o: { userId?: string | null; origem: string; extra?: Record<string, unknown> }
): Promise<void> {
  try {
    const { error } = await admin.from("funil_eventos").insert({
      evento,
      user_id: o.userId && /^[0-9a-f-]{36}$/i.test(o.userId) ? o.userId : null,
      plataforma: "web",
      origem: o.origem,
      extra: o.extra ?? null,
    });
    if (error && error.code !== DUPLICADO) {
      console.warn(`[funil] ${evento} recusado:`, error.message);
    }
  } catch (err) {
    console.warn(`[funil] ${evento} falhou:`, err);
  }
}
