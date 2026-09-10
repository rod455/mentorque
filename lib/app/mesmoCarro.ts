// Quando dois cadastros são o MESMO carro.
//
// POR QUE ISTO EXISTE (09/09/2026). O app inteiro identificava carro pelo `id`
// gerado no aparelho, e nunca pelo carro. Em todo caminho que junta garagens a
// dedup era por id:
//
//   · `addVehicle` concatenava sem olhar nada;
//   · `mergeById` casa por `id`, então o Gol 2016 da nuvem e o Gol 2016 feito
//     como convidado são dois ids diferentes e viram DOIS carros no login;
//   · `resolverImportacao` monta `jaTem` com os ids da conta, que nunca casam
//     com o id do carro equivalente, então o marcado entra mesmo já existindo.
//
// Como os ids nascem no aparelho, dois cadastros do mesmo carro NUNCA colidem.
// O relato de 23/08/2026 ("o mesmo carro cadastrado duas vezes vira dois
// carros") é isso, e é o mesmo defeito nos três caminhos.
//
// A PLACA MANDA, e essa é a parte que evita o conserto pior que o defeito.
// Comparar só marca, modelo e ano juntaria dois Gol 2016 de verdade, que é
// coisa que existe: casal com carros iguais, frota pequena, pai e filho. Placa
// é o identificador real de um veículo no Brasil. Então:
//
//   · com placa nos dois: só é o mesmo carro se a placa for a mesma;
//   · sem placa em algum dos dois: cai em tipo, marca, modelo e ano.
//
// Isto responde "parecem o mesmo carro", e é usado para AVISAR e PERGUNTAR,
// nunca para juntar ou apagar sozinho. Unir dois carros por conta própria
// esconderia o histórico de um deles, e histórico é o que a pessoa veio
// guardar aqui. Quando é a pessoa que responde (folha de importação, desde
// 10/09/2026), o que acontece com os dois carros está em importacao.ts.
import type { Vehicle } from "./types";

/** Comparação de texto tolerante: sem espaço sobrando, sem caixa, sem acento. */
function chave(s: string | undefined | null): string {
  return (s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Placa só serve de identidade quando existe dos dois lados. */
function placa(v: Pick<Vehicle, "plate">): string {
  return chave(v.plate).replace(/[^a-z0-9]/g, "");
}

type CarroComparavel = Pick<Vehicle, "type" | "make" | "model" | "year" | "plate">;

/** Os dois cadastros parecem ser o mesmo veículo? */
export function mesmoCarro(a: CarroComparavel, b: CarroComparavel): boolean {
  const pa = placa(a);
  const pb = placa(b);
  if (pa && pb) return pa === pb;
  return (
    a.type === b.type &&
    a.year === b.year &&
    chave(a.make) === chave(b.make) &&
    chave(a.model) === chave(b.model)
  );
}

/** O primeiro carro da lista que parece ser este, ou null. */
export function carroIgualNaGaragem<T extends CarroComparavel>(
  garagem: readonly T[],
  candidato: CarroComparavel,
): T | null {
  return garagem.find((v) => mesmoCarro(v, candidato)) ?? null;
}
