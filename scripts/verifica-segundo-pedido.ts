// O segundo pedido de conta: as três travas que o separam de uma praga.
//
// POR QUE ESTA CONFERÊNCIA EXISTE (30/10/2026). A aposta
// a-conta-e-pedida-de-novo-a-quem-ja-tem-algo-a-perder repete um pedido que o
// código mandava NÃO repetir: `lib/app/marcasDeConvite.ts` diz que a marca
// morre com a sessão porque "pedido que ressuscita dias depois vira praga".
// Repetir com disciplina é uma aposta; repetir sem disciplina é o defeito que
// faz alguém desinstalar, e esse defeito não aparece em nenhum número nosso
// até virar avaliação de uma estrela.
//
// As três travas, e cada uma tem um degrau aqui:
//
//   1. no máximo UM repique na vida do aparelho;
//   2. nunca na mesma sessão em que a conta já foi pedida (recusa inclusa);
//   3. nunca depois de dois "não".
//
// E a quarta regra, que não é trava: sem algo a perder, não há pedido nenhum.
//
// E O ALCANCE, que esta conferência deixou passar na primeira escrita (revisão
// de 30/10). Todo caso dela começava chamando `marcaRecusaDeConta()`, então ela
// nunca viu o aparelho de ANTES do contador, que é o de todos os 225
// recusantes que motivaram a aposta. As travas estavam certas e o pedido não
// alcançava ninguém. O degrau 0 abaixo é esse aparelho.
//
// O que ela NÃO alcança, e fica dito: o gatilho de verdade (serviço,
// abastecimento ou aula no estado) mora na folha, que é React, e aqui entra
// como o booleano `temAlgoAPerder`. O que esta conferência prova são as travas;
// que o booleano seja calculado do estado certo é cobrado no fonte, no fim.
//
// Rode com: npm run conferir:segundo-pedido
import { readFileSync } from "node:fs";

// ── um localStorage e um sessionStorage de mentira, porque as travas moram lá ──
function memoria() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    clear: () => m.clear(),
  };
}
const local = memoria();
const sessao = memoria();
(globalThis as unknown as { window: unknown }).window = {
  localStorage: local,
  sessionStorage: sessao,
};

const { marcaRecusaDeConta, cabeSegundoPedido, gastaSegundoPedido, marcaPedidoDeContaNaSessao } = await import(
  "../lib/app/segundoPedidoDeConta.ts"
);

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) {
    console.log(`✓ ${nome}`);
    return;
  }
  falhas++;
  console.error(`✗ ${nome}${detalhe ? `\n   ${detalhe}` : ""}`);
}

/** Zera tudo: aparelho novo. */
function aparelhoNovo() {
  local.clear();
  sessao.clear();
}
/** A pessoa fecha o app e abre de novo: o sessionStorage morre, o local fica. */
function novaSessao() {
  sessao.clear();
}

// ── 0. o recusante de antes do contador é alcançado ──────────────────────────
//
// Convidado com carro, sem contador, numa sessão em que a folha não foi pedida:
// é quem recusou (ou saiu sem responder) antes de este código existir.
aparelhoNovo();
conferir(
  "o convidado com carro e sem contador recebe o segundo pedido",
  cabeSegundoPedido(true) === true,
  "sem contador vale UMA recusa: todo convidado com carro já recebeu a folha no cadastro; exigir o contador deixa de fora os 225 recusantes da aposta",
);
conferir(
  "e o não dele ao repique conta como o segundo",
  (gastaSegundoPedido(), marcaRecusaDeConta()) === 2,
  "contar 1 etiquetaria o segundo não como o primeiro no funil (botao em vez de botao-2)",
);
aparelhoNovo();
conferir(
  "o recusante antigo que recusa a folha de OUTRO carro também chega a 2",
  marcaRecusaDeConta(true) === 2,
  "sem isso ele ainda ganharia um repique, que seria o terceiro pedido",
);

// ── 1. o aparelho novo, que acabou de cadastrar o carro, não ganha repique ───
aparelhoNovo();
marcaPedidoDeContaNaSessao();
conferir(
  "na sessão em que a folha foi pedida, sem contador, não há segundo pedido",
  cabeSegundoPedido(true) === false,
  "sem a marca da sessão, quem viu uma aula e depois cadastrou o carro ganharia o repique por cima do primeiro pedido",
);

// ── 2. trava 2: nunca na mesma sessão da recusa ──────────────────────────────
aparelhoNovo();
conferir("a primeira recusa é contada como 1", marcaRecusaDeConta() === 1);
conferir(
  "na MESMA sessão da recusa, nada é pedido de novo",
  cabeSegundoPedido(true) === false,
  "pedir de novo minutos depois do não é a definição de praga",
);

// ── 3. na sessão seguinte, com algo a perder, cabe ───────────────────────────
novaSessao();
conferir(
  "na sessão seguinte, com algo a perder, o segundo pedido cabe",
  cabeSegundoPedido(true) === true,
);
conferir(
  "e SEM algo a perder não cabe, mesmo em sessão nova",
  cabeSegundoPedido(false) === false,
  "é o que separa esta aposta de simplesmente pedir duas vezes",
);

// ── 4. trava 1: um repique na vida ───────────────────────────────────────────
gastaSegundoPedido();
conferir(
  "gasto o repique, ele não volta nesta sessão",
  cabeSegundoPedido(true) === false,
);
novaSessao();
conferir(
  "nem em nenhuma sessão futura",
  cabeSegundoPedido(true) === false,
  "um repique na vida do aparelho, e o `mq-conta-repique` é o que garante",
);

// ── 5. trava 3: dois "não" encerram o assunto ────────────────────────────────
aparelhoNovo();
marcaRecusaDeConta();
novaSessao();
conferir("a segunda recusa é contada como 2", marcaRecusaDeConta() === 2);
novaSessao();
conferir(
  "depois de dois não, nunca mais",
  cabeSegundoPedido(true) === false,
  "quem disse não duas vezes respondeu a pergunta",
);

// ── 6. o elo no fonte: a folha conta a recusa e calcula o gatilho do estado ──
//
// As travas acima podem estar perfeitas e a folha nunca chamá-las. O que amarra
// as duas coisas é isto, e é conferência de texto: ela diz que a chamada ESTÁ
// escrita, não que ela é alcançável. Dito como limite, não disfarçado.
{
  const folha = readFileSync(new URL("../components/app/SalveSuaGaragem.tsx", import.meta.url), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/.*$/gm, " ");

  conferir(
    "a folha CONTA a recusa",
    /marcaRecusaDeConta\(/.test(folha),
    "sem contar a recusa, a trava 3 nunca dispara e o repique nunca é destravado",
  );
  conferir(
    "a folha pergunta se cabe, e gasta o repique ao mostrar",
    /cabeSegundoPedido\(/.test(folha) && /gastaSegundoPedido\(\)/.test(folha),
    "mostrar sem gastar repete para sempre, que é a praga",
  );
  // Só a expressão do gatilho: a recusa usa o número de carros, de propósito,
  // para contar o segundo não do aparelho de antes do contador.
  const gatilho = /const temAlgoAPerder =([\s\S]*?);/.exec(folha)?.[1] ?? "";
  conferir(
    "o gatilho é estado da PESSOA, não o carro",
    /services\?\.length/.test(gatilho) &&
      /abastecimentos\?\.length/.test(gatilho) &&
      /seenLessons\?\.length/.test(gatilho) &&
      !/vehicles/.test(gatilho),
    "o carro dispara a PRIMEIRA folha; usá-lo aqui perguntaria de novo a quem acabou de dizer não com o carro na mão",
  );
  conferir(
    "o cadastro marca a sessão ANTES de acordar a folha",
    /marcaPedidoDeContaNaSessao\(\);\s*window\.dispatchEvent/.test(folha),
    "a marca depois do evento, ou num efeito, chega tarde: o repique veria o carro novo sem a marca",
  );
  conferir(
    "o repique espera a conta carregar e exige carro",
    /if \(!ready \|\| user \|\| !temCarro\) return;/.test(folha),
    "sem `ready`, quem já tem conta tem o repique gasto e contado na abertura; sem carro, ele é gasto numa folha que não desenha",
  );
  conferir(
    "o funil separa o repique do primeiro pedido",
    /detalhe:\s*"repique"/.test(folha),
    "sem a etiqueta, a conta que o segundo pedido trouxe é indistinguível da que o primeiro já trazia, e a aposta não fecha",
  );
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) falharam.`);
  process.exit(1);
}
console.log("\nSegundo pedido de conta: um repique na vida, nunca na sessão da recusa, nunca depois de dois não.");
