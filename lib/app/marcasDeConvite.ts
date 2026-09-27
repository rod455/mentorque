"use client";

// As marcas que levam um pedido de uma tela para a seguinte.
//
// POR QUE ESTE ARQUIVO EXISTE SEPARADO de lib/app/pedidoDeAviso.ts: as marcas
// são estado puro, sem nenhuma dependência, e quem mora no pedidoDeAviso
// conversa com o sistema operacional (permissão, plugin de notificação). Essa
// mistura deixava a regra das marcas fora do alcance de qualquer conferência
// de linha de comando, porque importar o arquivo inteiro arrastava o plugin
// junto. Aqui elas ficam conferíveis sozinhas (npm run conferir:convite).
//
// O QUE UMA MARCA É: o cadastro do carro acontece numa tela e a garagem
// aparece na seguinte, então o pedido de convite viaja numa variável de
// módulo, como o convite de conta (SalveSuaGaragem) e o atalho de dúvida. Ela
// vive na MEMÓRIA e morre com a sessão, de propósito: pedido que ressuscita
// dias depois vira praga.

// ── o convite logo depois de terminar a apresentação ────────────────────────
//
// Avisos ligados em 3 de 28 contas, e o convite só aparecia depois de um quiz
// ou de um carro: quem não fazia nenhum dos dois nunca via o pedido, e era
// justamente quem sumia. Terminar a apresentação é o primeiro "sim" pequeno da
// pessoa; o Início consome a marca ao nascer e faz o convite com um motivo
// concreto (a próxima revisão do carro dela, quando há carro).
let conviteNoOnboarding = false;

export function pedirConviteNoOnboarding(): void {
  conviteNoOnboarding = true;
}

export function consumirConviteNoOnboarding(): boolean {
  const r = conviteNoOnboarding;
  conviteNoOnboarding = false;
  return r;
}

// ── o convite logo depois do cadastro do carro (10/09/2026) ─────────────────
//
// A pessoa acabou de fazer a primeira coisa de valor, e é o momento em que a
// coorte morre: 7 em 8 não voltam na primeira semana.
let conviteNoCarro = false;

export function pedirConviteNoCarro(): void {
  conviteNoCarro = true;
}

/**
 * Consome a marca do convite do carro, mas SÓ quando há quem o veja.
 *
 * O `podeVer` existe por um buraco medido em 25/09/2026: a marca era consumida
 * ao montar a garagem, sem olhar nada, e o convite só é desenhado para quem tem
 * conta. Quem cadastrava o carro como CONVIDADO queimava o melhor momento do
 * pedido sem ver convite nenhum, e criar a conta cinco minutos depois já não
 * trazia o momento de volta. Convidado é o caso comum: o app oferece explorar
 * sem cadastrar e só pede a conta depois, com a folha "Salve sua garagem" em
 * cima deste mesmo cadastro.
 *
 * Sem conta, a marca fica de pé e espera. Não vira pedido eterno: ela morre
 * com a sessão, igual a antes.
 */
export function consumirConviteNoCarro(podeVer = true): boolean {
  if (!podeVer) return false;
  const r = conviteNoCarro;
  conviteNoCarro = false;
  return r;
}
