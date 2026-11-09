// A volta do checkout avulso do Stripe: para onde a página leva. Pura.
//
// POR QUE (09/11/2026). No Android a compra avulsa abre o Stripe na aba do
// sistema, fora do app (decisão do dono, 08/11). Pago, o Stripe manda para
// /compra-concluida, e é esta regra que diz o destino: no app, o esquema
// `mentorque://compra`, que reabre o Mentorque e entrega a sessão para a
// confirmação; na web, o próprio /app com a sessão na URL.
//
// O id da sessão só passa se tiver a forma de uma sessão do Stripe: a página
// é pública e o parâmetro vem da URL.

export type VoltaDaCompra = { tipo: "app" | "web"; url: string; cancelou: boolean };

export function voltaDaCompra(busca: string): VoltaDaCompra {
  const p = new URLSearchParams(busca);
  const sessao = p.get("sessao") ?? "";
  const valida = /^cs_[A-Za-z0-9_]{8,200}$/.test(sessao);
  const cancelou = p.get("cancelou") === "1";
  const qs = valida && !cancelou ? `?compra=${encodeURIComponent(sessao)}` : cancelou ? "?compra=cancelou" : "";
  if (p.get("de") === "app") return { tipo: "app", url: `mentorque://compra${qs}`, cancelou };
  return { tipo: "web", url: `/app${qs}`, cancelou };
}
