// Travessão em texto que o usuário lê.
//
// POR QUE ISTO EXISTE (01/09/2026): "sem travessão" é regra do dono desde o
// começo, está no CLAUDE.md, e mesmo assim o título da home foi para o ar como
// "Mentorque — aprenda mecânica...". Esse título é o que aparece no resultado
// do Google, na aba do navegador e no card de link compartilhado. Ninguém
// tinha percebido porque regra sem conferência é torcida, não regra.
//
// O QUE ELA PEGA, e por que a mira é estreita de propósito. A primeira versão
// desta conferência acusou 81 lugares e quase todos eram comentário de código
// ou o traço usado como "campo vazio" (`?? "—"`), que é uso tipográfico e não
// é frase. Conferência que reprova por causa de comentário é conferência que
// todo mundo passa a ignorar, e aí ela não serve para nada. Então:
//
//   PEGA   → travessão dentro de uma frase (texto com letras dos dois lados,
//            ou letra de um lado e fim da frase do outro)
//   IGNORA → comentário de linha e de bloco, inclusive {/* comentário JSX */}
//   IGNORA → o traço sozinho como campo vazio: "—", " — " entre variáveis
//   IGNORA → app/api/**, que é prompt de modelo, log e e-mail de operação
//
// Se um dia o traço como separador entre dois VALORES também for proibido, o
// lugar de mudar é a função `ehFrase` aqui embaixo, e o custo é conhecido:
// volta a acusar as telas que usam "{carro} — {n} serviços".
//
// Rode com: npm run conferir:travessao
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const TRAVESSAO = "—";

/** Pastas varridas por inteiro: tudo ali é texto de tela. */
const TELAS = ["components", "lib/app/conteudo"];
/** Arquivos avulsos de texto de tela. */
const AVULSOS = ["lib/app/content.ts"];
/** Em app/, só os campos que viram título e descrição de página. */
const METADADOS = /^\s*(title|description|siteName|alt):\s*["'`]/;

function arquivos(dir) {
  const saida = [];
  let itens;
  try {
    itens = readdirSync(join(RAIZ, dir));
  } catch {
    return saida;
  }
  for (const item of itens) {
    const caminho = join(dir, item);
    if (statSync(join(RAIZ, caminho)).isDirectory()) saida.push(...arquivos(caminho));
    else if (/\.(ts|tsx)$/.test(item)) saida.push(caminho);
  }
  return saida;
}

/**
 * Tira os comentários do arquivo, preservando as linhas (para o número bater).
 * Cobre `//`, `/* *\/` e a forma JSX `{/* *\/}`, que é a mais comum aqui.
 */
function semComentarios(texto) {
  const linhas = texto.split("\n");
  let dentroDeBloco = false;
  return linhas.map((linha) => {
    let saida = "";
    let i = 0;
    while (i < linha.length) {
      if (dentroDeBloco) {
        const fim = linha.indexOf("*/", i);
        if (fim === -1) return saida;
        dentroDeBloco = false;
        i = fim + 2;
        continue;
      }
      if (linha.startsWith("//", i)) return saida;
      if (linha.startsWith("/*", i)) {
        dentroDeBloco = true;
        i += 2;
        continue;
      }
      saida += linha[i];
      i++;
    }
    return saida;
  });
}

/** Os pedaços de texto literal de uma linha de código. */
function literais(linha) {
  const achados = [];
  const re = /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|`([^`\\]*(?:\\.[^`\\]*)*)`/g;
  let m;
  while ((m = re.exec(linha)) !== null) achados.push(m[1] ?? m[2] ?? m[3] ?? "");
  return achados;
}

/**
 * O travessão está dentro de uma FRASE, e não sendo usado como campo vazio ou
 * separador entre duas variáveis? Frase = tem letra colada nele de algum lado,
 * ignorando um espaço.
 */
function ehFrase(literal) {
  const i = literal.indexOf(TRAVESSAO);
  if (i === -1) return false;
  const antes = literal.slice(0, i).replace(/\s+$/, "");
  const depois = literal.slice(i + 1).replace(/^\s+/, "");
  const temLetra = (s) => /\p{L}{2}/u.test(s);
  return temLetra(antes) && temLetra(depois);
}

const achados = [];

function olhar(alvo, sóMetadados) {
  const linhas = semComentarios(readFileSync(join(RAIZ, alvo), "utf8"));
  linhas.forEach((linha, i) => {
    if (!linha.includes(TRAVESSAO)) return;
    if (sóMetadados && !METADADOS.test(linha)) return;
    for (const lit of literais(linha)) {
      if (ehFrase(lit)) {
        achados.push({ arquivo: alvo, linha: i + 1, trecho: lit.trim().slice(0, 95) });
        break;
      }
    }
  });
}

for (const alvo of [...TELAS.flatMap(arquivos), ...AVULSOS]) olhar(alvo, false);
for (const alvo of arquivos("app")) {
  if (alvo.startsWith(join("app", "api"))) continue;
  olhar(alvo, true);
}

if (achados.length) {
  console.error(`\nTravessão em frase que o usuário lê (${achados.length} ocorrência(s)).`);
  console.error("A regra está no CLAUDE.md: português natural, sem travessão.");
  console.error("Troque por dois pontos, vírgula, ponto, ou barra vertical no título.\n");
  for (const a of achados) {
    console.error(`  ${a.arquivo}:${a.linha}`);
    console.error(`    ${a.trecho}`);
  }
  process.exit(1);
}

console.log("Travessão: nenhum nas frases das telas, do conteúdo e dos títulos das páginas.");
