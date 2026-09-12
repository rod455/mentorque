// Para onde um link de fora abre o app: o `ir=` da URL.
//
// POR QUE (12/09/2026): o dono pediu que o botão de cada e-mail da jornada
// caia na tela certa dentro do app ("cadastrar o carro" abre o cadastro,
// "ver o calendário" abre o calendário), e não na tela inicial. O e-mail
// escreve `?ir=addCar` na URL; a página do app guarda o destino no mesmo
// lugar em que o onboarding guarda o dele (sessionStorage), e o Shell
// navega assim que nasce. Viaja pelo sessionStorage pelo mesmo motivo do
// onboarding: quem ainda não passou pela apresentação vê o OnboardingFlow, o
// Shell só nasce depois, e um `go` dado antes disso se perde.
//
// LISTA FECHADA, como as rotas de aviso: só telas que abrem sem parâmetro.
// Qualquer outra coisa na URL é ignorada, e a URL não navega para lugar
// nenhum que a barra de baixo não alcance.
//
// Pura, para `npm run conferir:jornada` ligar cada e-mail ao destino dele.

export const DESTINOS_DO_LINK = [
  "addCar",
  "cars",
  "car",
  "history",
  "addService",
  "revisions",
  "health",
  "biela",
  "quiz",
  "learn",
  "profile",
] as const;

export type DestinoDoLink = (typeof DESTINOS_DO_LINK)[number];

export function destinoValido(d: string | null | undefined): d is DestinoDoLink {
  return !!d && (DESTINOS_DO_LINK as readonly string[]).includes(d);
}

/** O destino pedido na query (`?ir=addCar`), ou null. */
export function destinoDoLink(search: string): DestinoDoLink | null {
  try {
    const d = new URLSearchParams(search).get("ir");
    return destinoValido(d) ? d : null;
  } catch {
    return null;
  }
}
