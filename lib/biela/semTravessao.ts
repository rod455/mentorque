// A resposta da Biela sai sem travessão.
//
// POR QUE (08/11/2026). "Sem travessão" é regra do dono para todo texto que
// o usuário vê, e `conferir:travessao` cobre o que a casa escreve. A resposta
// da Biela não é escrita pela casa: é o modelo que escreve. Num teste em
// produção, as duas respostas vieram com travessão ("A cada 15.000 km ... —
// usando óleo semissintético"), e o motivo provável estava no próprio prompt,
// que tinha quatro travessões e ensinava o estilo pelo exemplo.
//
// O prompt perdeu os travessões e ganhou a proibição, mas pedido a modelo é
// tendência, não garantia. Esta função é a garantia: roda na resposta antes
// de ela sair da rota. `npm run conferir:biela` abre isto no node.
//
// Só o travessão (U+2014) e o meia-risca usado COMO travessão, com espaço dos
// dois lados. A meia-risca colada entre números ("10–15 mil km") é faixa, não
// pausa, e vira "a"; o hífen comum fica como está.
export function semTravessao(texto: string): string {
  if (!/[—–]/.test(texto)) return texto;
  return (
    texto
      // começo de linha, como marcador de lista: vira hífen
      .replace(/^([ \t]*)[—–][ \t]*/gm, "$1- ")
      // faixa numérica com meia-risca ou travessão colados: "10–15" → "10 a 15"
      .replace(/(\d)[—–](\d)/g, "$1 a $2")
      // pausa no meio da frase: vira vírgula
      .replace(/[ \t]*—[ \t]*/g, ", ")
      .replace(/[ \t]+–[ \t]+/g, ", ")
      // o que a troca pode ter deixado torto
      .replace(/,\s*,/g, ",")
      .replace(/,\s*([.!?:;])/g, "$1")
      .replace(/([.!?:;])\s*,\s*/g, "$1 ")
      .replace(/,[ \t]*$/gm, "")
  );
}
