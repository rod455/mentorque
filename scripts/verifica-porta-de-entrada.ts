// A primeira tela de quem não tem carro pergunta antes de pedir?
//
// POR QUE ISTO EXISTE (28/09/2026). Até hoje o Início de quem não tem carro
// dizia "Vamos cadastrar o seu primeiro carro", com o botão grande indo direto
// ao formulário e um "Explorar sem cadastrar" em 13px e 60% de opacidade. A
// primeira coisa que o app pedia era trabalho, e a saída era um sussurro.
//
// O QUE OS NÚMEROS DIZIAM DESSA ORDEM:
//
//   cinco em seis que abrem o formulário nas lojas não terminam;
//   `comecou_onboarding` é a ÚLTIMA ação de 78,7% na web (base 54,9%);
//   `abriu o cadastro de carro e sumiu`: 3 Android e 1 iOS em 14 dias;
//   e é a mesma tela onde se concentram os fechamentos do app.
//
// Era o maior vazamento do produto, e estava na porta de entrada. A troca é de
// ORDEM, não de recurso: a pessoa pergunta ao Biela primeiro, recebe uma
// resposta, e só então é convidada a dizer qual é o carro dela, como quem
// melhora o que acabou de receber.
//
// O QUE ESTA CONFERÊNCIA PROTEGE, e é tudo aquilo que uma edição distraída
// desfaz sem ninguém notar:
//
//   1. o botão grande de quem não tem carro leva ao Biela, não ao formulário;
//   2. o cadastro continua a UM toque, logo abaixo (a troca é de ordem, e não
//      de esconder o cadastro: quem já sabe o que quer não pode ser obrigado
//      a conversar antes);
//   3. o convite dentro do Biela só aparece DEPOIS de uma resposta, e só para
//      quem não tem carro;
//   4. a pergunta vira evento de funil, senão a mudança não tem leitura;
//   5. os dois caminhos até o cadastro carregam `origem`, que é o que
//      responde "a Biela primeiro trouxe mais cadastro?".
//
// O QUE ELA NÃO ALCANÇA: se a resposta do Biela sem carro é boa o bastante
// para ganhar o cadastro. Isso é produto, e quem responde é o número depois de
// uns dias no ar, não uma conferência.
//
// Rode com: npm run conferir:porta
import { readFileSync } from "node:fs";
import { MEDIDO_DESDE, NATUREZA, UNIDADE } from "../lib/funilCorreto.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

const leia = (caminho: string) => readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8");
const semComentarios = (f: string) => f.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

console.log("Porta de entrada: quem não tem carro pergunta antes de cadastrar?");

// ── 1 e 2. O HERÓI DO INÍCIO ────────────────────────────────────────────────
{
  const home = semComentarios(leia("components/app/screens/Home.tsx"));

  // Desde 04/10/2026 (aposta `inicio-pergunta-unica`) o botão grande leva ao
  // Biela para TODO MUNDO, com ou sem carro. Até então a expressão era
  // `hasCar ? root({ name: "symptoms" }) : go({ name: "biela" })`, e esta
  // conferência a fixava; agora ela cobra a regra nova e reprova a volta da
  // bifurcação.
  conferir(
    "o botão grande leva ao Biela, com ou sem carro",
    /onClick=\{\(\) => go\(\{ name: "biela" \}\)\}/.test(home) && !/hasCar \? root\(\{ name: "symptoms" \}\)/.test(home),
    'mandar quem tem carro para a tela de sintomas e quem não tem para o chat é a ordem de 28/09; a de 04/10 é uma porta só'
  );
  conferir(
    "e os três atalhos do herói abrem o chat já preenchido",
    /go\(\{ name: "biela", seed: chip\.seed \}\)/.test(home),
    "atalho que abre o chat vazio é só um segundo botão; o que vale é a pergunta chegar escrita"
  );
  conferir(
    "e o cadastro continua a um toque, logo abaixo",
    /go\(\{ name: "addCar", origem: "inicio" \}\)/.test(home),
    "a troca é de ORDEM, não de esconder o cadastro: quem já sabe o que quer não pode ser obrigado a conversar antes"
  );

  const textos = leia("lib/app/content.ts");
  conferir(
    "o título de quem não tem carro é uma PERGUNTA",
    /heroTitleEmpty: T\("O que está acontecendo com o seu carro\?"/.test(textos),
    "o título é o que anuncia a ordem: se ele voltar a mandar cadastrar, o botão abaixo contradiz a frase acima"
  );
  conferir(
    "o botão grande convida a perguntar",
    /heroCtaEmpty: T\("Perguntar para o Biela"/.test(textos)
  );
}

// ── 3. O CONVITE DENTRO DO BIELA ────────────────────────────────────────────
//
// As três condições são o coração da ideia. Sem `msgs.length > 1` o convite
// aparece ANTES de qualquer resposta, e aí é o mesmo pedágio de antes, só que
// numa tela diferente.
{
  const biela = semComentarios(leia("components/app/screens/Biela.tsx"));
  const bloco = /\{!v && msgs\.length > 1 && !gated && \(/.test(biela);
  conferir(
    "o convite só aparece sem carro, DEPOIS de uma resposta e fora do limite",
    bloco,
    "as três condições juntas: `!v && msgs.length > 1 && !gated`. Sem a do meio, o convite volta a pedir antes de entregar"
  );
  conferir(
    "e o botão dele vai ao cadastro dizendo de onde veio",
    /go\(\{ name: "addCar", origem: "biela" \}\)/.test(biela)
  );

  const textos = leia("lib/app/content.ts");
  for (const chave of ["semCarroTitulo", "semCarroCorpo", "semCarroCta"]) {
    conferir(`o texto ${chave} existe`, new RegExp(`^\\s*${chave}: T\\(`, "m").test(textos));
  }
  // SÓ AS TRÊS FRASES DO CONVITE, e não o arquivo inteiro. A primeira versão
  // desta linha varria `content.ts` todo e reprovou o texto CERTO, porque o
  // comentário que explica a regra cita a frase proibida para dizer que ela
  // não pode aparecer. É a terceira vez em dois dias que uma conferência desta
  // casa lê comentário como conteúdo (as outras foram a de banco, com
  // "SECURITY DEFINER", e a da migalha, com "@capacitor/core"). A regra que
  // fica: conferência que procura texto olha o VALOR, nunca o arquivo.
  const frases = (["semCarroTitulo", "semCarroCorpo", "semCarroCta"] as const)
    .map((k) => new RegExp(`^\\s*${k}: T\\(\\s*"([^"]*)"`, "m").exec(textos)?.[1] ?? "")
    .join(" ");
  conferir(
    "o convite NÃO diz que é preciso cadastrar para continuar",
    frases.length > 0 && !/cadastr\w+ para (continuar|seguir|usar|perguntar)/i.test(frases),
    `seria mentira: a pessoa continua podendo perguntar. O convite fala do que MUDA, não do que trava. Veio: "${frases}"`
  );
}

// ── 4. A PERGUNTA VIRA EVENTO ───────────────────────────────────────────────
//
// Sem isto a mudança sobe e ninguém consegue dizer se funcionou, que é o erro
// mais caro que esta casa comete (ver o Diário de 27 e 28/09).
{
  const biela = semComentarios(leia("components/app/screens/Biela.tsx"));
  conferir(
    "perguntar ao Biela vira evento de funil",
    /funil\("perguntou_biela"/.test(biela),
    "até 28/09 o app não media uma única pergunta feita a ela"
  );
  conferir(
    "e o evento separa quem tem carro de quem não tem",
    /origem: v \? "com-carro" : "sem-carro"/.test(biela),
    "é essa separação que responde se o caminho novo trouxe gente"
  );

  // Os cinco lugares. Os quatro de código são lidos aqui; o quinto é o CHECK
  // do banco, e quem cobra ele é `npm run conferir:funil`.
  conferir("o evento está na régua canônica", NATUREZA.perguntou_biela !== undefined);
  conferir("com identidade de aparelho", UNIDADE.perguntou_biela === "aparelho");
  conferir("e com a data em que passou a ser medido", MEDIDO_DESDE.perguntou_biela === "2026-09-28");
  conferir("a rota aceita o evento", leia("app/api/funil/route.ts").includes('"perguntou_biela"'));
  conferir("e o arquivo do banco o declara", leia("supabase/funil_eventos.sql").includes("'perguntou_biela'"));
}

// ── 5. OS DOIS CAMINHOS CARREGAM A ORIGEM ───────────────────────────────────
{
  const nav = leia("lib/app/nav.tsx");
  const telas = semComentarios(leia("components/app/telas.tsx"));
  const cars = semComentarios(leia("components/app/screens/Cars.tsx"));

  conferir("a rota do cadastro aceita `origem`", /name: "addCar"; editId\?: string; origem\?: string/.test(nav));
  conferir(
    "e ela é repassada à tela",
    /<AddCarScreen editId=\{view\.editId\} origem=\{view\.origem\} \/>/.test(telas),
    "sem este repasse a origem morre no roteador e o evento sai vazio"
  );
  conferir(
    "o evento do cadastro leva a origem junto",
    /funil\("abriu_cadastro_de_carro", \{ umaVezPorAparelho: true, origem \}\)/.test(cars),
    "é o campo que separa quem chegou pelo Biela de quem chegou pelo Início"
  );
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) da porta de entrada reprovaram.`);
  process.exit(1);
}
console.log(
  "Porta de entrada: pergunta primeiro, cadastro a um toque, convite só depois da\n" +
    "resposta, e os dois caminhos dizem de onde vieram."
);
