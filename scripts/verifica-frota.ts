// O carro que está na rua cabe no nosso cadastro?
//
// POR QUE ISTO EXISTE (04/09/2026). O dono perguntou quais carros de anos
// anteriores faltavam nos manuais, e a resposta trouxe junto um problema mais
// básico: o catálogo de "Adicionar carro" tinha sido montado olhando só para o
// que se vende zero km. Dos DEZ carros mais comuns da frota brasileira, dois
// (Fiesta e Celta) simplesmente não estavam lá. Quem tem um Celta abria o app,
// digitava "Celta" e não achava nada. Não dá erro, não gera relato, não aparece
// em métrica nenhuma: a pessoa só desiste.
//
// A frota brasileira tem 11 anos de idade média. Nosso público é justamente
// quem cuida do carro em casa porque a oficina é cara, ou seja, quem dirige o
// carro velho. Catálogo de lançamento é catálogo de concessionária, não nosso.
//
// O que ela cobra:
//   1. todo modelo das listas de frota e de usados é cadastrável;
//   2. a lista de anos alcança carro velho de verdade;
//   3. nenhum modelo repetido dentro da mesma marca (duas linhas iguais no
//      seletor não quebram nada e ninguém percebe até virar print).
//
// O QUE ELA NÃO CONFERE, de propósito: se existe MANUAL para o modelo. Isso
// mora no banco, não no repositório, e a lista de compras está em
// docs/manuais-a-subir.md. Cadastrar é o piso; entender o carro é o teto.
//
// Rode com: npm run conferir:frota
import { veiculos } from "../lib/app/conteudo/veiculos.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

// ── As listas de fora, com data e fonte ─────────────────────────────────────
//
// Números conferidos em 04/09/2026. Eles envelhecem, e tudo bem: o que não
// pode envelhecer é a lista de NOMES, porque carro que entrou na frota fica
// nela por vinte anos. Ao atualizar, some, não troque.

/** Os dez mais comuns nas ruas do Brasil (anuário Sincopeças, frota circulante). */
const FROTA_CIRCULANTE: [string, string][] = [
  ["Volkswagen", "Gol"],
  ["Fiat", "Uno"],
  ["Fiat", "Palio"],
  ["Fiat", "Strada"],
  ["Chevrolet", "Onix"],
  ["Ford", "Fiesta"],
  ["Chevrolet", "Celta"],
  ["Volkswagen", "Fox"],
  ["Hyundai", "HB20"],
  ["Ford", "Ka"],
];

/** Os mais transferidos como usados (Fenauto, julho de 2026). */
const USADOS_MAIS_VENDIDOS: [string, string][] = [
  ["Volkswagen", "Gol"],
  ["Chevrolet", "Onix"],
  ["Hyundai", "HB20"],
  ["Fiat", "Palio"],
  ["Fiat", "Uno"],
  ["Fiat", "Strada"],
  ["Volkswagen", "Saveiro"],
];

/**
 * O ano mais antigo que o cadastro precisa alcançar.
 *
 * Um Celta 2006 ainda roda, e a idade média da frota é de 11 anos. Se um dia
 * alguém encurtar a lista de anos "porque ninguém tem carro tão velho", esta
 * linha reprova antes de o usuário descobrir.
 */
const ANO_MAIS_ANTIGO_NECESSARIO = 2005;

const c = veiculos((pt: string) => pt);
const catalogo = new Set(
  Object.entries(c.modelsByMake).flatMap(([marca, modelos]) => modelos.map((m) => `${marca}|${m}`))
);

console.log("O carro que está na rua cabe no cadastro:");

// ── 1. a frota inteira é cadastrável ────────────────────────────────────────
for (const [lista, nome] of [
  [FROTA_CIRCULANTE, "frota circulante"],
  [USADOS_MAIS_VENDIDOS, "usados mais vendidos"],
] as const) {
  const fora = lista.filter(([marca, modelo]) => !catalogo.has(`${marca}|${modelo}`));
  conferir(
    `todo modelo da lista "${nome}" pode ser cadastrado`,
    fora.length === 0,
    fora.length
      ? `faltam ${fora.length}: ${fora.map(([a, b]) => `${a} ${b}`).join(", ")}\n       ` +
        "Some em lib/app/conteudo/veiculos.ts, em modelsByMake."
      : ""
  );
  if (!fora.length) console.log(`  ✓ ${nome}: ${lista.length} modelos, todos no catálogo`);
}

// ── 2. os anos alcançam carro velho ─────────────────────────────────────────
{
  const maisAntigo = Math.min(...c.years);
  conferir(
    "a lista de anos alcança a frota antiga",
    maisAntigo <= ANO_MAIS_ANTIGO_NECESSARIO,
    `o mais antigo oferecido é ${maisAntigo}, e precisa ir até ${ANO_MAIS_ANTIGO_NECESSARIO} ou antes`
  );
  if (maisAntigo <= ANO_MAIS_ANTIGO_NECESSARIO) console.log(`  ✓ anos de ${maisAntigo} a ${Math.max(...c.years)}`);
}

// ── 3. nada repetido ────────────────────────────────────────────────────────
{
  const repetidos: string[] = [];
  for (const [marca, modelos] of Object.entries(c.modelsByMake)) {
    const vistos = new Set<string>();
    for (const m of modelos) {
      if (vistos.has(m)) repetidos.push(`${marca} ${m}`);
      vistos.add(m);
    }
  }
  conferir("nenhum modelo repetido na mesma marca", repetidos.length === 0, repetidos.join(", "));
}

// ── 4. toda marca com modelo está na lista de marcas ────────────────────────
//
// O seletor monta a lista a partir de `makes`, então um modelo pendurado numa
// marca que não está lá é código morto: ninguém nunca vai vê-lo.
{
  const marcasOferecidas = new Set(c.makes.car);
  const orfas = Object.keys(c.modelsByMake).filter((m) => !marcasOferecidas.has(m));
  conferir("nenhuma marca com modelos fica fora do seletor", orfas.length === 0, orfas.join(", "));
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) da frota reprovaram.`);
  process.exit(1);
}
console.log(
  `Frota: ${catalogo.size} modelos cadastráveis, e os mais comuns do Brasil estão entre eles.`
);
