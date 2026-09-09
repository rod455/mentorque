// O atalho para "Fale com a gente": um botão flutuante em qualquer aba, e o
// Perfil rolando sozinho até o formulário.
//
// PEDIDO DO DONO (09/09/2026), com o exemplo de outro app dele: um "?" fixo na
// lateral da tela que, ao tocar, vai direto para a parte de mandar dúvida, e a
// tela já rola e para exatamente no ponto da pergunta.
//
// Por que existe um módulo para isso, e não só um `go({ name: "profile" })`:
// o Perfil é a mesma tela quer a pessoa chegue pelo ícone de cima, quer chegue
// pelo botão. O que muda é a INTENÇÃO, e o roteador não carrega intenção. Então
// o botão deixa aqui um pedido, o Perfil consome o pedido ao montar e rola. O
// pedido é consumido UMA vez de propósito: sem isso, toda remontagem do Perfil
// rolaria de novo, e quem só queria ver a foto ia parar no formulário.
//
// Mesmo desenho de lib/app/rotaPendente.ts, que faz isso para o toque no aviso.

/** O `id` do bloco no Perfil. Só existe um, e é para ele que a rolagem vai. */
export const ID_FALE_COM_A_GENTE = "fale-com-a-gente";

let pedido = false;

/** O botão flutuante foi tocado: o próximo Perfil que montar rola até o formulário. */
export function pedirDuvida(): void {
  pedido = true;
}

/** O Perfil pergunta uma vez ao montar. Devolve true no máximo uma vez por pedido. */
export function consumirPedidoDeDuvida(): boolean {
  const p = pedido;
  pedido = false;
  return p;
}
