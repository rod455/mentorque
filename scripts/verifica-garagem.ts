// Carro repetido na garagem.
//
// POR QUE ISTO EXISTE (09/09/2026). Relato aberto desde 23/08: "o mesmo carro
// cadastrado duas vezes vira dois carros". A causa é uma só, e ela vale para
// os três caminhos que juntam garagem: o app identifica carro pelo `id`, que
// nasce no APARELHO. Dois cadastros do mesmo carro nunca colidem, então
// `addVehicle`, `mergeById` e `resolverImportacao` sempre produziram dois.
//
// O que esta conferência trava:
//   1. a regra de identidade (`mesmoCarro`), incluindo o caso que impede o
//      conserto de ficar pior que o defeito: dois carros iguais com PLACAS
//      diferentes são dois carros, e juntá-los seria perda de dados;
//   2. a LIGAÇÃO da regra nas duas telas onde a pessoa decide. Sem isso, a
//      regra poderia estar perfeita e não ser chamada por ninguém, que é
//      exatamente como uma conferência passa verde sobre um defeito de pé.
//
// O item 2 é conferência de TEXTO, e isso é uma dívida assumida: o certo seria
// exercitar a tela. A suíte de navegador não cobre a folha de importação (ela
// só aparece ao entrar numa conta que já tem garagem, com carro de convidado no
// aparelho), então a ligação é conferida pela chamada no fonte, com os
// comentários removidos antes da busca. Removê-los importa aqui mais do que em
// qualquer outro lugar: os comentários destes dois arquivos CITAM o nome da
// função ao explicar o porquê, e satisfariam a busca sozinhos.
//
// O QUE ELA NÃO CONFERE, de propósito: que o merge da nuvem deixou de
// duplicar. Ele NÃO deixou, e isso é decisão registrada: unir dois carros
// esconderia o histórico de um deles. Ver o DIARIO de 09/09.
//
// Rode com: npm run conferir:garagem
import { readFileSync } from "node:fs";
import { mesmoCarro, carroIgualNaGaragem } from "../lib/app/mesmoCarro.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) {
    console.log(`✓ ${nome}`);
    return;
  }
  falhas++;
  console.error(`✗ ${nome}${detalhe ? `  ${detalhe}` : ""}`);
}

const gol = { type: "car" as const, make: "Volkswagen", model: "Gol", year: 2016, plate: undefined };

// --- a regra de identidade ---

conferir("o mesmo carro, digitado igual", mesmoCarro(gol, { ...gol }));

conferir(
  "caixa e espaço não separam o mesmo carro",
  mesmoCarro(gol, { ...gol, make: "  volkswagen ", model: "GOL" }),
);

conferir(
  "acento não separa o mesmo carro",
  mesmoCarro(
    { type: "car", make: "Citroën", model: "C3", year: 2019, plate: undefined },
    { type: "car", make: "Citroen", model: "c3", year: 2019, plate: undefined },
  ),
);

conferir("ano diferente é outro carro", !mesmoCarro(gol, { ...gol, year: 2017 }));
conferir("modelo diferente é outro carro", !mesmoCarro(gol, { ...gol, model: "Polo" }));
conferir(
  "moto não é carro, mesmo com marca e ano iguais",
  !mesmoCarro(gol, { ...gol, type: "moto" }),
);

// A placa é o que impede o conserto de virar perda de dados.
conferir(
  "placas diferentes são DOIS carros, mesmo modelo e ano",
  !mesmoCarro({ ...gol, plate: "ABC1D23" }, { ...gol, plate: "XYZ9K88" }),
);
conferir(
  "a mesma placa é o mesmo carro, mesmo com modelo digitado diferente",
  mesmoCarro({ ...gol, plate: "ABC-1D23" }, { ...gol, model: "Gol G6", plate: "abc1d23" }),
);
conferir(
  "placa só de um lado não separa: cai em marca, modelo e ano",
  mesmoCarro({ ...gol, plate: "ABC1D23" }, { ...gol, plate: undefined }),
);

// --- a busca na garagem ---

const garagem = [
  { id: "a", type: "car" as const, make: "Fiat", model: "Uno", year: 2012, plate: undefined },
  { id: "b", type: "car" as const, make: "Volkswagen", model: "Gol", year: 2016, plate: undefined },
];
conferir("acha o repetido na garagem", carroIgualNaGaragem(garagem, gol)?.id === "b");
conferir(
  "não inventa repetido quando não há",
  carroIgualNaGaragem(garagem, { ...gol, model: "Onix" }) === null,
);
conferir("garagem vazia não acha nada", carroIgualNaGaragem([], gol) === null);

// --- a ligação nas telas onde a pessoa decide ---

const semComentarios = (f: string) =>
  f.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/gm, " ");

const cars = semComentarios(readFileSync("components/app/screens/Cars.tsx", "utf8"));
conferir(
  "a tela de cadastrar carro consulta a garagem antes de gravar",
  cars.includes("carroIgualNaGaragem("),
  "sem isso, cadastrar o mesmo carro duas vezes volta a ser silencioso",
);
// Esta conferência nasceu frouxa e a versão frouxa está registrada de
// propósito: ela procurava `setJaExiste(` e `jaExiste` no arquivo, e passou
// verde com o defeito plantado, porque a própria folha de aviso usa os dois
// nomes (`onClose={() => setJaExiste(null)}`). Procurar o NOME não prova nada;
// o que prova é a forma: achou igual, guarda e SAI, antes de gravar.
conferir(
  "e o aviso interrompe a gravação, não só existe na tela",
  /if\s*\([^)]*\bigual\b[^)]*\)\s*\{[^}]*setJaExiste\(\s*igual\s*\)[^}]*\breturn\b/.test(cars),
  "sem o return, o aviso aparece e o carro é gravado do mesmo jeito",
);

const importar = semComentarios(readFileSync("components/app/ImportarGaragem.tsx", "utf8"));
conferir(
  "a folha de importação marca o carro que a conta já tem",
  importar.includes("carroIgualNaGaragem("),
  "sem isso, marcar o repetido produz dois iguais sem uma palavra",
);

if (falhas) {
  console.error(`\nGaragem: ${falhas} conferência(s) reprovada(s).`);
  process.exit(1);
}
console.log("\nGaragem: carro repetido é reconhecido, e as duas telas avisam antes.");
