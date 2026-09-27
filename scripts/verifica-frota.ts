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
// A MOTO ENTROU EM 27/09/2026, pelo mesmo motivo e com dez vezes mais atraso.
// Chegou um "Quero cadastrar minha moto" pelo suporte. O seletor Carro/Moto
// existia e funcionava; o catálogo de moto é que tinha 6 marcas e 37 modelos
// contra 24 e 235 de carro, e o banco confirmava: 68 veículos cadastrados,
// NENHUM do tipo moto. Esta conferência só olhava `modelsByMake` e `makes.car`,
// então o defeito que ela foi criada para pegar estava de pé ao lado dela.
//
// O que ela cobra:
//   1. todo modelo das listas de frota e de usados é cadastrável;
//   2. a lista de anos alcança carro velho de verdade;
//   3. nenhum modelo repetido dentro da mesma marca (duas linhas iguais no
//      seletor não quebram nada e ninguém percebe até virar print);
//   4. toda marca com modelos aparece no seletor, nos dois tipos;
//   5. a frota de MOTO é cadastrável, e pelo NOME DO TANQUE: a busca da tela é
//      por substring, então quem digita "Titan" precisa achar alguma coisa;
//   6. a tela de cadastro fala "moto" quando Moto está escolhido.
//
// O QUE ELA NÃO CONFERE, de propósito: se existe MANUAL para o modelo. Isso
// mora no banco, não no repositório, e a lista de compras está em
// docs/manuais-a-subir.md. Cadastrar é o piso; entender o carro é o teto.
//
// Rode com: npm run conferir:frota
import { readFileSync } from "node:fs";
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
 * As motos que estão na rua no Brasil, pelo NOME DO TANQUE.
 *
 * A lista é de emplacamentos (Abraciclo) somados à frota que continua rodando,
 * e foi escrita em 27/09/2026. Vale a mesma regra das listas de carro: some,
 * não troque, porque moto emplacada fica na rua por vinte anos.
 *
 * O que ela guarda de verdade é o NOME. A família CG é a moto mais comum do
 * país e estava no catálogo só como "CG 160": quem digitava "Titan" ou "Fan",
 * que é o que está escrito no tanque, não achava nada. Por isso a lista traz o
 * nome comercial, e não a cilindrada.
 */
const FROTA_MOTOS: [string, string][] = [
  ["Honda", "CG 160 Titan"],
  ["Honda", "CG 160 Fan"],
  ["Honda", "CG 125 Titan"],
  ["Honda", "CG 150 Titan"],
  ["Honda", "Biz 125"],
  ["Honda", "Pop 110i"],
  ["Honda", "Bros 160"],
  ["Honda", "XRE 300"],
  ["Honda", "CB 300F Twister"],
  ["Honda", "PCX"],
  ["Yamaha", "Factor 150"],
  ["Yamaha", "Fazer 250"],
  ["Yamaha", "Crosser 150"],
  ["Yamaha", "NMAX 160"],
  ["Yamaha", "YBR 125"],
  ["Yamaha", "XTZ 125"],
  ["Suzuki", "Yes 125"],
  ["Haojue", "DK 150"],
  ["Shineray", "Jet 50"],
  ["Dafra", "Citycom 300"],
];

/**
 * O que a pessoa DIGITA. A busca da tela é `modelo.includes(q) ||
 * marca.includes(q)`, então cada palavra daqui tem que devolver pelo menos uma
 * moto. É a conferência que teria evitado o relato do suporte: "Titan" não
 * devolvia nada, e a tela respondia "Nenhum carro encontrado".
 */
const PALAVRAS_DO_TANQUE = [
  "titan", "fan", "cg", "biz", "pop", "bros", "twister", "xre",
  "factor", "ybr", "crosser", "nmax", "xtz", "fazer", "yes", "burgman",
  "haojue", "shineray", "dafra", "harley", "triumph", "ktm", "ducati",
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
  for (const mapa of [c.modelsByMake, c.motoModelsByMake]) {
    for (const [marca, modelos] of Object.entries(mapa)) {
      const vistos = new Set<string>();
      for (const m of modelos) {
        if (vistos.has(m)) repetidos.push(`${marca} ${m}`);
        vistos.add(m);
      }
    }
  }
  conferir("nenhum modelo repetido na mesma marca", repetidos.length === 0, repetidos.join(", "));
}

// ── 4. toda marca com modelo está na lista de marcas ────────────────────────
//
// O seletor monta a lista a partir de `makes`, então um modelo pendurado numa
// marca que não está lá é código morto: ninguém nunca vai vê-lo.
{
  const orfas = [
    ...Object.keys(c.modelsByMake).filter((m) => !c.makes.car.includes(m)).map((m) => `carro: ${m}`),
    ...Object.keys(c.motoModelsByMake).filter((m) => !c.makes.moto.includes(m)).map((m) => `moto: ${m}`),
  ];
  conferir("nenhuma marca com modelos fica fora do seletor", orfas.length === 0, orfas.join(", "));
}

// ── 5. a moto que está na rua cabe no cadastro ──────────────────────────────
const catalogoMoto = new Set(
  Object.entries(c.motoModelsByMake).flatMap(([marca, modelos]) => modelos.map((m) => `${marca}|${m}`))
);
{
  const fora = FROTA_MOTOS.filter(([marca, modelo]) => !catalogoMoto.has(`${marca}|${modelo}`));
  conferir(
    'todo modelo da lista "frota de motos" pode ser cadastrado',
    fora.length === 0,
    fora.length
      ? `faltam ${fora.length}: ${fora.map(([a, b]) => `${a} ${b}`).join(", ")}\n       ` +
        "Some em lib/app/conteudo/veiculos.ts, em motoModelsByMake."
      : ""
  );
  if (!fora.length) console.log(`  ✓ frota de motos: ${FROTA_MOTOS.length} modelos, todos no catálogo`);
}

// ── 6. a busca acha a moto pelo nome do tanque ──────────────────────────────
//
// Esta é a conferência que teria evitado o relato. Ela imita a busca da tela
// (substring em modelo OU marca) com as palavras que a pessoa realmente
// digita. Um catálogo pode estar "completo" por cilindrada e mudo por nome.
{
  const paresMoto = Object.entries(c.motoModelsByMake).flatMap(([marca, modelos]) =>
    modelos.map((modelo) => `${modelo} ${marca}`.toLowerCase())
  );
  const mudas = PALAVRAS_DO_TANQUE.filter((q) => !paresMoto.some((p) => p.includes(q)));
  conferir(
    "toda palavra que a pessoa digita acha alguma moto",
    mudas.length === 0,
    mudas.length
      ? `sem resultado para: ${mudas.join(", ")}\n       ` +
        'A tela responderia "Nenhuma moto encontrada" e a pessoa desiste.'
      : ""
  );
  if (!mudas.length) console.log(`  ✓ busca de moto: ${PALAVRAS_DO_TANQUE.length} palavras de tanque, todas com resposta`);
}

// ── 7. a tela fala "moto" quando Moto está escolhido ────────────────────────
//
// O catálogo cheio não conserta uma tela que insiste em dizer "carro". Em
// 27/09 ela dizia, do título até a mensagem de busca vazia, e era isso que
// contradizia o seletor. Aqui a conferência olha o FONTE: nenhum dos textos
// que mudam com o tipo pode ser renderizado direto de `a.`, sem passar pelo
// objeto `t` que escolhe entre carro e moto.
{
  const tela = readFileSync(new URL("../components/app/screens/Cars.tsx", import.meta.url), "utf8");
  const fixos = ["a.title", "a.editTitle", "a.carField", "a.carFieldPh", "a.noCarMatch", "a.curtoDepois", "a.duplicadoTitulo"];
  const presos = fixos.filter((k) => new RegExp(`\\{\\s*${k.replace(".", "\\.")}[\\s}]`).test(tela));
  conferir(
    "nenhum texto de carro é renderizado com Moto escolhido",
    presos.length === 0,
    presos.length
      ? `renderizados direto em Cars.tsx: ${presos.join(", ")}\n       ` +
        "Use o objeto `t`, que escolhe entre a versão carro e a versão moto."
      : ""
  );

  // Os textos moram em lib/app/content.ts, que é módulo de app e não importa
  // limpo aqui. Ler o fonte basta: o que se quer saber é se a chave existe.
  const textos = readFileSync(new URL("../lib/app/content.ts", import.meta.url), "utf8");
  const faltando = ["titleMoto", "editTitleMoto", "motoField", "motoFieldPh", "noMotoMatch", "curtoDepoisMoto", "duplicadoTituloMoto"]
    .filter((k) => !new RegExp(`^\\s*${k}:\\s*T\\(`, "m").test(textos));
  conferir(
    "todo texto da tela tem a versão moto",
    faltando.length === 0,
    `faltam em lib/app/content.ts, em addCar: ${faltando.join(", ")}`
  );
  if (!presos.length && !faltando.length) console.log("  ✓ a tela de cadastro fala moto quando Moto está escolhido");
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) da frota reprovaram.`);
  process.exit(1);
}
console.log(
  `Frota: ${catalogo.size} carros e ${catalogoMoto.size} motos cadastráveis, ` +
    "e os mais comuns do Brasil estão entre eles."
);
