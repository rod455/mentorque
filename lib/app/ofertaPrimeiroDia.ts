// A oferta do Premium no primeiro dia (16/11/2026, plano de receita). Pura.
//
// POR QUE. De 80 a 89 de cada 100 testes grátis de app começam no primeiro
// dia (RevenueCat 2026). Até aqui o Premium do Mentorque só aparecia quando a
// pessoa batia num cadeado, o que no uso por episódio quase não acontece: em
// um mês, 271 aparelhos viram a tela do Premium e 1 começou teste
// (`funil_canonico('2026-10-16')`, lido em 16/11).
//
// A REGRA, e cada parte tem motivo:
//   - só para quem não é Premium;
//   - só onde existe teste grátis de verdade na loja. Android (oferta `teste7`
//     da Play) e web (Stripe, 7 dias) sim; o app do iPhone não, porque a Apple
//     ainda não tem oferta de teste, e prometer 7 dias que a loja não dá foi o
//     defeito de outubro;
//   - só nos 3 primeiros dias do carro: é a oferta do começo, não uma faixa
//     permanente;
//   - some para sempre com um "agora não", sem perguntar de novo.
//
// `npm run conferir:oferta-primeiro-dia` executa esta função com entradas
// conhecidas, e a suíte de navegador prova a ligação na tela.

export type EntradaDaOferta = {
  premium: boolean;
  /** "ios" só quando é o app nativo do iPhone (trialPlatform). */
  plataforma: "ios" | "other";
  /** Quando o carro mais antigo da garagem foi cadastrado (ISO), se souber. */
  carroDesde: string | null | undefined;
  agora: Date;
  recusou: boolean;
};

export const DIAS_DA_OFERTA = 3;
export const CHAVE_RECUSOU = "mentorque.ofertaPrimeiroDiaRecusou";

export function mostrarOfertaDoPrimeiroDia(e: EntradaDaOferta): boolean {
  if (e.premium || e.recusou) return false;
  if (e.plataforma === "ios") return false;
  if (!e.carroDesde) return false;
  const desde = new Date(e.carroDesde).getTime();
  if (!Number.isFinite(desde)) return false;
  const passou = e.agora.getTime() - desde;
  return passou >= 0 && passou < DIAS_DA_OFERTA * 86_400_000;
}
