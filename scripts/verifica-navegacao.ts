// O voltar do Android, conferido sem navegador.
//
// Nenhuma suíte de Chromium consegue apertar o botão físico do Android: ele é
// um evento do Capacitor, que não existe no navegador. Sem este arquivo, a
// regra que decide entre VOLTAR e JOGAR A PESSOA PARA FORA DO APP seria a
// única parte do produto sem conferência nenhuma.
//
// O defeito que motivou tudo (relatado pelo dono em 30/08): trocar de aba zera
// a pilha, então o voltar encontrava pilha de tamanho 1 em qualquer aba e
// minimizava. Quem ia de Início para Estudos e apertava voltar era expulso.
//
// Rode com: npm run conferir:navegacao
import { readFileSync } from "node:fs";
import { comNovaRaiz, passoDeVolta, LIMITE_DE_RAIZES, type Pilha } from "../lib/app/navPilha.ts";
import type { View } from "../lib/app/nav.ts";
import { comoSair } from "../lib/app/saidaDoApp.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

const v = (name: string) => ({ name } as unknown as View);
const inicio: Pilha = { views: [v("home")], raizes: [] };
const topo = (p: Pilha) => p.views[p.views.length - 1].name;

// ── sair do app para a loja (dono, 12/09/2026: "Atualizar" no iPhone ficou
// carregando apps.apple.com para sempre, dentro do app) ─────────────────────
{
  const ficha = "https://apps.apple.com/br/app/mentorque/id6797291865";
  const avaliar = "https://apps.apple.com/app/id6797291865?action=write-review";
  const play = "https://play.google.com/store/apps/details?id=mentorque.app";
  const ios = comoSair(ficha, "ios");
  conferir("no iPhone a ficha da App Store vai pelo esquema itms-apps, não pela aba", ios.url === "itms-apps://apps.apple.com/br/app/mentorque/id6797291865" && !ios.pelaAba, JSON.stringify(ios));
  const nota = comoSair(avaliar, "ios");
  conferir("no iPhone a folha de avaliação também vai pelo itms-apps", nota.url.startsWith("itms-apps://") && nota.url.endsWith("?action=write-review") && !nota.pelaAba, JSON.stringify(nota));
  conferir("no Android a Play continua pela aba do sistema", comoSair(play, "android").pelaAba);
  conferir("na web nada muda", comoSair(ficha, null).pelaAba && comoSair(ficha, null).url === ficha);
  conferir("no iPhone qualquer outro endereço continua pela aba (política de pagamentos)", comoSair("https://mentorque.com.br/privacidade", "ios").pelaAba);
}

// ── o caso que motivou o conserto ───────────────────────────────────────────
{
  // Início → (aba) Estudos → voltar deve devolver ao Início, não minimizar.
  const emEstudos = comNovaRaiz(inicio, v("learn"));
  conferir("trocar de aba zera a pilha", emEstudos.views.length === 1);
  conferir("trocar de aba guarda de onde veio", emEstudos.raizes.length === 1);

  const volta = passoDeVolta(emEstudos);
  conferir("voltar de uma aba NÃO minimiza", volta !== null);
  conferir("voltar de uma aba devolve à aba anterior", volta !== null && topo(volta) === "home", `foi para ${volta && topo(volta)}`);
  conferir("e o rastro é consumido", volta !== null && volta.raizes.length === 0);
}

// ── só sai na primeira tela da sessão ───────────────────────────────────────
conferir("na primeira tela, voltar minimiza", passoDeVolta(inicio) === null);

// ── a ordem: telas empilhadas vêm antes do rastro de abas ───────────────────
{
  // Início → Estudos (aba) → abre uma aula (empilha).
  const estudos = comNovaRaiz(inicio, v("learn"));
  const naAula: Pilha = { ...estudos, views: [...estudos.views, v("content")] };

  const p1 = passoDeVolta(naAula)!;
  conferir("o primeiro voltar fecha a aula, não pula para a aba anterior", topo(p1) === "learn", `foi para ${topo(p1)}`);
  conferir("e o rastro continua intacto", p1.raizes.length === 1);

  const p2 = passoDeVolta(p1)!;
  conferir("o segundo voltar aí sim vai para a aba anterior", topo(p2) === "home");
  conferir("o terceiro voltar minimiza", passoDeVolta(p2) === null);
}

// ── tocar duas vezes na mesma aba não cria rastro falso ─────────────────────
{
  const uma = comNovaRaiz(inicio, v("home"));
  conferir("tocar na aba em que já se está não empilha rastro", uma.raizes.length === 0, `raízes: ${uma.raizes.length}`);
  conferir("e não deixa o voltar travado num laço", passoDeVolta(uma) === null);
}

// ── o rastro não cresce para sempre ─────────────────────────────────────────
{
  let p = inicio;
  // Alterna entre duas abas muitas vezes (é o que uma sessão longa faz).
  for (let i = 0; i < LIMITE_DE_RAIZES * 3; i++) p = comNovaRaiz(p, v(i % 2 === 0 ? "learn" : "home"));
  conferir(
    "o rastro para de crescer no limite",
    p.raizes.length <= LIMITE_DE_RAIZES,
    `${p.raizes.length} raízes guardadas`,
  );
  // E mesmo cheio, ele termina: voltar o suficiente sempre chega ao fim.
  let passos = 0;
  let q: Pilha | null = p;
  while (q && passos < 1000) { q = passoDeVolta(q); passos++; }
  conferir("voltar sempre termina em minimizar", q === null, `parou depois de ${passos} passos`);
}

// ── O TETO TEM QUE CABER UMA SESSÃO DE VERDADE ──────────────────────────────
//
// Achado do Guardião em 03/10/2026. As duas linhas de cima provam que o teto
// FUNCIONA, e não conseguem dizer que ele está no lugar certo: as duas são
// escritas em termos de `LIMITE_DE_RAIZES` (o laço usa `LIMITE * 3` e a
// asserção compara com `LIMITE`), então os dois lados andam junto com a
// constante. Plantado o valor 3 em vez de 20, este arquivo passava inteiro.
//
// E 3 é o defeito de 30/08 em câmera lenta: quem passeia por quatro abas perde
// as raízes mais antigas, e o voltar minimiza antes de devolver a pessoa por
// onde ela entrou. Então aqui a conferência não compara com a constante, ela
// exige COMPORTAMENTO: oito abas visitadas, oito voltas até minimizar.
{
  // Oito trocas de aba, nenhuma repetindo a anterior (tocar na aba em que já
  // se está não empilha rastro, de propósito). Começa em "learn" porque
  // `inicio` já está em "home".
  const abas = ["learn", "health", "garage", "profile", "learn", "health", "garage", "profile"];
  let p = inicio;
  for (const a of abas) p = comNovaRaiz(p, v(a));
  let passos = 0;
  let q: Pilha | null = p;
  while (q) { q = passoDeVolta(q); passos++; }
  // Oito voltas para desfazer as oito trocas, mais a nona que minimiza.
  conferir(
    "oito trocas de aba dão oito voltas antes de minimizar",
    passos === abas.length + 1,
    `deu ${passos} passos para ${abas.length} trocas; teto baixo demais expulsa a pessoa cedo`,
  );
}

// ── E QUEM USA A PILHA: o nav.tsx (critério 10, achado em 10/10/2026) ───────
//
// Este arquivo existe por causa do defeito de 30/08: trocar de aba zerava a
// pilha, e o voltar do Android expulsava a pessoa em vez de devolvê-la. Ele
// provava a REGRA e não olhava quem a chama, e isso deixava o defeito de 30/08
// voltar inteiro pelo outro lado. Medido: troquei no `lib/app/nav.tsx` a linha
// `setP((s) => comNovaRaiz(s, v))` por `setP(() => ({ views: [v], raizes: [] }))`,
// que é literalmente o defeito original, e tanto esta conferência quanto a
// `conferir:tipos` passaram verdes, saída 0.
//
// Conferência de texto, e a dívida é dita: o certo seria exercitar o provider
// do nav, e não existe executor de React aqui. Ela aponta o ELO, que é a
// chamada com o estado dentro, não o nome da função solto.
{
  const nav = readFileSync(new URL("../lib/app/nav.tsx", import.meta.url), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/.*$/gm, " ");

  conferir(
    "trocar de aba passa pela pilha, e não substitui o estado à mão",
    /comNovaRaiz\(\s*s\s*,\s*v\s*\)/.test(nav),
    "montar `{ views: [v], raizes: [] }` direto aqui é o defeito de 30/08: o rastro morre e o voltar expulsa",
  );
  conferir(
    "o voltar do Android pergunta à pilha qual é o próximo passo",
    /passoDeVolta\(\s*agora\.current\s*\)/.test(nav),
    "sem esta chamada o botão físico não tem como saber se há para onde voltar",
  );
  conferir(
    "e só minimiza quando a pilha diz que não há mais volta",
    /if \(!proximo\) return false/.test(nav),
    "minimizar sem perguntar é exatamente o que a pessoa relatou em 30/08",
  );
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) de navegação reprovaram.`);
  process.exit(1);
}
console.log("Navegação: o voltar do Android respeita telas, abas e o fim da sessão.");
