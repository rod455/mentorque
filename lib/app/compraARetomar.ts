// A compra que a conta interrompeu, para ser retomada depois do login.
//
// POR QUE (26/10/2026, decisão do dono: "podemos implementar o ir direto para
// a compra"). Quem toca em assinar sem conta é mandado criar a conta e,
// depois do login, voltava ao paywall com o mesmo botão de antes: tinha de
// escolher de novo uma coisa que já tinha escolhido. Desde 12/10, quatro
// aparelhos tocaram em assinar sem conta, três criaram a conta em menos de um
// minuto, e nenhum dos três chegou ao checkout.
//
// O QUE ISTO NÃO FAZ: cobrar. Retomar é abrir o MESMO passo que a pessoa
// pediu (a folha da loja, ou o checkout do site), e é nele que ela confirma
// ou desiste. Nada é pago sem o toque dela na folha da Apple, da Google ou do
// Stripe.
//
// Por que um registro próprio, e não a marca `mq-veio-assinar`: aquela serve
// ao TEXTO da tela de entrar e à contagem da volta, e guarda só a hora. Para
// retomar é preciso saber QUAL botão foi tocado (o plano, a loja ou o site, a
// oferta de saída), senão a pessoa que tocou no mensal acabaria na folha do
// anual.
//
// Pura na decisão (`comoRetomar`) para a conferir:venda exercitar cada botão.

const CHAVE = "mq-compra-a-retomar";

/**
 * Dez minutos. O login do Google leva segundos; o cadastro por e-mail, com a
 * confirmação, leva alguns minutos. Mais que isso e a folha de compra abriria
 * para quem já mudou de assunto, o que é assustador e não ajuda ninguém.
 */
export const VALIDADE_DA_RETOMADA_MS = 10 * 60 * 1000;

export type CompraARetomar = { origem: string; plano: "annual" | "monthly"; t: number };

export type ComoRetomar =
  | { tipo: "loja"; plano: "annual" | "monthly" }
  | { tipo: "site"; plano: "annual" | "monthly" }
  | { tipo: "oferta10" }
  | { tipo: "oferta25" }
  | null;

/**
 * Qual passo reabrir, a partir da `origem` que o botão gravou no
 * `tentou_assinar`. As origens são as do paywall: `loja-annual`,
 * `web-monthly`, `web-exit10`, `oferta-exit25`, `oferta-<id do pacote>`.
 * Origem que não se reconhece não retoma nada: na dúvida, a pessoa fica no
 * paywall, como antes.
 */
export function comoRetomar(r: Pick<CompraARetomar, "origem" | "plano">): ComoRetomar {
  const o = r.origem;
  if (/exit25|25$/.test(o) && /^(web-|oferta-)/.test(o)) return { tipo: "oferta25" };
  if (/exit10|10$/.test(o) && /^(web-|oferta-)/.test(o)) return { tipo: "oferta10" };
  if (o.startsWith("loja-")) return { tipo: "loja", plano: r.plano };
  if (o === "web-annual" || o === "web-monthly") return { tipo: "site", plano: r.plano };
  return null;
}

/** Ainda vale? Fora da validade, ou com relógio voltando, não vale. */
export function aindaVale(r: CompraARetomar | null, agora: number): r is CompraARetomar {
  if (!r) return false;
  const idade = agora - r.t;
  return idade >= 0 && idade <= VALIDADE_DA_RETOMADA_MS;
}

export function guardaCompraARetomar(origem: string, plano: "annual" | "monthly"): void {
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify({ origem, plano, t: Date.now() }));
  } catch {
    /* sem armazenamento: a pessoa volta ao paywall, como antes */
  }
}

/** A compra a retomar, se ainda valer. Não consome; quem consome é `esquece`. */
export function compraARetomar(): CompraARetomar | null {
  try {
    const cru = window.localStorage.getItem(CHAVE);
    if (!cru) return null;
    const v = JSON.parse(cru) as Partial<CompraARetomar>;
    if (typeof v.origem !== "string" || typeof v.t !== "number") return null;
    if (v.plano !== "annual" && v.plano !== "monthly") return null;
    const r = { origem: v.origem, plano: v.plano, t: v.t };
    if (!aindaVale(r, Date.now())) {
      esqueceCompraARetomar();
      return null;
    }
    return r;
  } catch {
    return null;
  }
}

export function esqueceCompraARetomar(): void {
  try {
    window.localStorage.removeItem(CHAVE);
  } catch {
    /* nada a esquecer */
  }
}
