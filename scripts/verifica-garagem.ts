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
// E, desde 10/09/2026, o que a folha FAZ com a resposta para o carro que a
// conta já tem (`lib/app/importacao.ts`): juntar num só, ficar só com o da
// conta, ficar só com o deste aparelho. Até 09/09 o merge continuava
// duplicando de propósito, porque juntar ou apagar sozinho escolheria qual
// carro sobrevive; em 10/09 o dono decidiu que a pessoa escolhe, e a regra
// pura é conferida aqui com cada resposta.
//
// Rode com: npm run conferir:garagem
import { readFileSync } from "node:fs";
import { mesmoCarro, carroIgualNaGaragem } from "../lib/app/mesmoCarro.ts";
import { aplicarImportacao, juntarCarros } from "../lib/app/importacao.ts";
import type { ServiceRecord, Vehicle } from "../lib/app/types.ts";

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
  "a folha de importação reconhece o carro que a conta já tem",
  importar.includes("carroIgualNaGaragem("),
  "sem isso, o repetido vira caixa de marcar e produz dois iguais sem uma palavra",
);
conferir(
  "e para ele oferece as três respostas: juntar, só o da conta, só o deste aparelho",
  /acao:\s*"juntar"/.test(importar) && /acao:\s*"trocar"/.test(importar) && /acao:\s*"levar"/.test(importar),
  "a pergunta existe no texto e a resposta não chega ao store: a folha decide sozinha de novo",
);
const store = semComentarios(readFileSync("lib/app/store.tsx", "utf8"));
conferir(
  "o store aplica a resposta pela regra pura, não por lista de ids",
  store.includes("aplicarImportacao(") && !/resolverImportacao\s*=\s*useCallback\(\(ids: string\[\]\)/.test(store),
  "sem isso, juntar e trocar chegam ao store e viram 'levar', duplicando de novo",
);

// --- o que cada resposta faz com a garagem (lib/app/importacao.ts) ---

const conta: { vehicles: Vehicle[]; services: ServiceRecord[]; reminders: string[]; activeVehicleId: string | null } = {
  vehicles: [
    { id: "nuvem-gol", type: "car" as const, make: "Volkswagen", model: "Gol", year: 2016, plate: undefined, odometerKm: 50_000, kmUpdatedAt: "2026-08-01T00:00:00.000Z" },
    { id: "nuvem-uno", type: "car" as const, make: "Fiat", model: "Uno", year: 2012, plate: "ABC1D23" },
  ],
  services: [
    { id: "s-nuvem-1", vehicleId: "nuvem-gol", type: "oil", date: "2026-07-01", km: 48_000, parts: [] },
    { id: "s-nuvem-2", vehicleId: "nuvem-uno", type: "brakes", date: "2026-06-01", km: 90_000, parts: [] },
  ],
  reminders: ["nuvem-gol:oil", "nuvem-uno:tires"],
  activeVehicleId: "nuvem-gol",
};
const pendente: { veiculos: Vehicle[]; servicos: ServiceRecord[]; lembretes: string[] } = {
  veiculos: [
    { id: "ap-gol", type: "car" as const, make: "volkswagen", model: "GOL", year: 2016, plate: "XYZ9K88", engine: "1.6", odometerKm: 52_000, kmUpdatedAt: "2026-09-01T00:00:00.000Z", nickname: "Golzinho" },
    { id: "ap-onix", type: "car" as const, make: "Chevrolet", model: "Onix", year: 2020, plate: undefined },
  ],
  servicos: [
    { id: "s-ap-1", vehicleId: "ap-gol", type: "tires", date: "2026-08-20", km: 51_000, parts: [] },
    { id: "s-ap-2", vehicleId: "ap-onix", type: "oil", date: "2026-08-25", km: 30_000, parts: [] },
  ],
  lembretes: ["ap-gol:brakes", "ap-onix:oil"],
};
const ids = (vs: { id: string }[]) => vs.map((v) => v.id).sort().join(",");

{
  const r = aplicarImportacao(conta, pendente, []);
  conferir("lista vazia deixa a conta intacta", ids(r.vehicles) === ids(conta.vehicles) && r.services.length === 2 && r.reminders.length === 2);
}
{
  const r = aplicarImportacao(conta, pendente, [{ id: "ap-onix", acao: "levar" }]);
  conferir("levar: o carro diferente entra como carro novo, com histórico e lembrete", ids(r.vehicles) === "ap-onix,nuvem-gol,nuvem-uno" && r.services.some((s) => s.id === "s-ap-2") && r.reminders.includes("ap-onix:oil"));
  conferir("levar: o carro ativo não muda quando a garagem já tinha carro", r.activeVehicleId === "nuvem-gol");
  conferir("levar: id que não está no pendente é ignorado", aplicarImportacao(conta, pendente, [{ id: "fantasma", acao: "levar" }]).vehicles.length === 2);
}
{
  const r = aplicarImportacao(conta, pendente, [{ id: "ap-gol", acao: "juntar", noCarro: "nuvem-gol" }]);
  const gol = r.vehicles.find((v) => v.id === "nuvem-gol")!;
  conferir("juntar: continua UM Gol, e é o da conta", ids(r.vehicles) === "nuvem-gol,nuvem-uno" && gol.make === "Volkswagen");
  conferir("juntar: o histórico do aparelho passa a apontar para o carro da conta", r.services.filter((s) => s.vehicleId === "nuvem-gol").length === 2 && !r.services.some((s) => s.vehicleId === "ap-gol"));
  conferir("juntar: o lembrete do aparelho vem junto, no id da conta", r.reminders.includes("nuvem-gol:brakes") && !r.reminders.includes("ap-gol:brakes") && r.reminders.includes("nuvem-gol:oil"));
  conferir("juntar: o aparelho preenche o que a conta deixou em branco", gol.plate === "XYZ9K88" && gol.engine === "1.6" && gol.nickname === "Golzinho");
  conferir("juntar: o km informado por último manda", gol.odometerKm === 52_000);
  conferir("juntar: nada da conta é apagado", r.services.some((s) => s.id === "s-nuvem-1") && r.services.some((s) => s.id === "s-nuvem-2"));
}
{
  const r = aplicarImportacao(conta, pendente, [{ id: "ap-gol", acao: "trocar", noLugarDe: "nuvem-gol" }]);
  conferir("trocar: o carro da conta sai e o do aparelho entra no lugar", ids(r.vehicles) === "ap-gol,nuvem-uno");
  conferir("trocar: o histórico do carro que saiu vai junto, o do que entrou fica", !r.services.some((s) => s.id === "s-nuvem-1") && r.services.some((s) => s.id === "s-ap-1") && r.services.some((s) => s.id === "s-nuvem-2"));
  conferir("trocar: lembretes idem", !r.reminders.includes("nuvem-gol:oil") && r.reminders.includes("ap-gol:brakes") && r.reminders.includes("nuvem-uno:tires"));
  conferir("trocar: o carro ativo acompanha a troca", r.activeVehicleId === "ap-gol");
  conferir("trocar: o outro carro da conta não é tocado", r.vehicles.some((v) => v.id === "nuvem-uno"));
}
{
  const r = aplicarImportacao(conta, pendente, [{ id: "ap-gol", acao: "juntar", noCarro: "sumiu" }]);
  conferir("juntar num carro que não existe mais vira levar, que não perde nada", ids(r.vehicles) === "ap-gol,nuvem-gol,nuvem-uno");
}
{
  const a = juntarCarros(conta.vehicles[0], { ...pendente.veiculos[0], year: 2017, model: "Polo" });
  conferir("juntarCarros: a identidade é a da conta", a.id === "nuvem-gol" && a.model === "Gol" && a.year === 2016);
  const semData = juntarCarros({ ...conta.vehicles[0], kmUpdatedAt: undefined, odometerKm: 60_000 }, { ...pendente.veiculos[0], kmUpdatedAt: undefined });
  conferir("juntarCarros: sem data nos dois, o km maior fica (odômetro não anda para trás)", semData.odometerKm === 60_000);
}

if (falhas) {
  console.error(`\nGaragem: ${falhas} conferência(s) reprovada(s).`);
  process.exit(1);
}
console.log("\nGaragem: carro repetido é reconhecido, as duas telas avisam antes, e a folha pergunta o que fazer com ele.");
