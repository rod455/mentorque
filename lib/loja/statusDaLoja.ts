// O status da assinatura que vem da loja. Puro.
//
// TESTE GRÁTIS É `trialing`, NÃO `active` (21/11/2026).
//
// O DEFEITO, achado pelo descompasso entre dois instrumentos no retrato de
// 21/11: o RevenueCat dizia "1 teste ativo, 0 assinaturas, receita 0", e o
// nosso banco dizia "1 assinatura ativa, anual, 0 em teste". Esta rota gravava
// `active` para todo evento de compra, sem olhar o `period_type`. O acesso não
// muda (todo lugar que libera o Premium aceita `active` E `trialing`), mas
// quem lê o banco via um pagante onde havia um teste, que é exatamente a
// leitura que a casa não pode errar: ninguém pagou nada ainda.
export function statusDaLoja(periodType: string | undefined): "active" | "trialing" {
  return String(periodType ?? "").toUpperCase() === "TRIAL" ? "trialing" : "active";
}
