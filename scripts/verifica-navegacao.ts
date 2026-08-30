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
import { comNovaRaiz, passoDeVolta, LIMITE_DE_RAIZES, type Pilha } from "../lib/app/navPilha.ts";
import type { View } from "../lib/app/nav.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

const v = (name: string) => ({ name } as unknown as View);
const inicio: Pilha = { views: [v("home")], raizes: [] };
const topo = (p: Pilha) => p.views[p.views.length - 1].name;

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

if (falhas) {
  console.error(`\n${falhas} conferência(s) de navegação reprovaram.`);
  process.exit(1);
}
console.log("Navegação: o voltar do Android respeita telas, abas e o fim da sessão.");
