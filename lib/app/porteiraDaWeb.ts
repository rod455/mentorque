// A porteira da web: no site em produção, o app é só para quem já tem conta.
//
// DECISÃO DO DONO (12/09/2026): "vamos tirar o caminho da web. Usuário
// precisa baixar o app." Até aqui mentorque.com.br/app era a maior porta em
// número (182 onboardings e 15 contas em 28 dias, contra 64 e 1 no Android),
// e a que não tem recorrência nenhuma: sem aviso, sem push, sem os cinco
// momentos da 2.4. Três contas criadas pela web em 11/09 fizeram o
// onboarding, cadastraram o carro e nunca mais voltaram.
//
// O que a porteira faz: quem chega ao /app pelo navegador, no domínio de
// produção, SEM conta, vê "baixe o app" com os selos das lojas. Quem já tem
// conta (19 pelo Google, 5 pela Apple, 3 por e-mail, entre elas as três que
// pagam pelo Stripe) entra e continua usando; fechar a porta para quem já
// paga seria outro estrago.
//
// O que ela NÃO faz: nada no app das lojas (é a mesma tela, e `nativo` a
// desliga), nada em localhost nem nas prévias da Vercel, porque é lá que as
// suítes de navegador rodam e elas entram como convidado de propósito.
//
// Pura, para `npm run conferir:porteira` exercitar cada caso.

const DOMINIOS_DE_PRODUCAO = ["mentorque.com.br", "www.mentorque.com.br"];

export function porteiraFechada(o: {
  /** Dentro do app das lojas (Capacitor)? */
  nativo: boolean;
  /** `window.location.hostname` */
  hostname: string;
  /** Há sessão de conta resolvida? */
  temConta: boolean;
}): boolean {
  if (o.nativo) return false;
  if (!DOMINIOS_DE_PRODUCAO.includes(o.hostname.toLowerCase())) return false;
  return !o.temConta;
}
