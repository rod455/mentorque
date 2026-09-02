// Gravação de evento de funil que não olha se deu certo.
//
// POR QUE ISTO EXISTE (02/09/2026): é o MESMO defeito encontrado duas vezes,
// em lugares diferentes, com cinco dias de distância.
//
//   26/08  /api/funil fazia `await insert(...)` e respondia ok sem olhar o
//          erro. Evento recusado pelo banco sumia sem rastro e a etapa ficava
//          em zero, parecendo desinteresse de quem usa o app.
//   02/09  o webhook do RevenueCat fazia exatamente a mesma coisa, e ali era
//          pior: o evento perdido é o FINANCEIRO, e como a rota devolve 200 do
//          mesmo jeito, o RevenueCat considera entregue e nunca reenvia.
//
// Achar o mesmo defeito duas vezes é sinal de que ele volta. Anotar "procurar
// esse padrão" num manual é torcida; isto aqui é a regra com dentes.
//
// O QUE ELA PEGA, com a mira estreita de propósito:
//
//   PEGA   → gravação em funil_eventos cujo `insert` não desestrutura `error`
//   IGNORA → lib/funilServidor.ts, que É o escritor compartilhado (ele olha o
//            erro, tolera duplicado e loga o resto). Passar por ele é a forma
//            recomendada de gravar: quem usa `eventoDeFunil` nem aparece aqui,
//            porque não escreve `from("funil_eventos")`.
//
// Duas saídas válidas para quem for reprovado: usar `eventoDeFunil`, ou
// desestruturar `error` e decidir o que fazer com ele. Silêncio não é opção.
//
// Se um dia outras tabelas de métrica merecerem a mesma regra, o lugar de
// mexer é a constante TABELAS aqui embaixo.
//
// Rode com: npm run conferir:gravacao
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const PASTAS = ["app", "lib"];
const TABELAS = ["funil_eventos"];
/** O escritor compartilhado: ele é a solução, não o problema. */
const ISENTOS = [join("lib", "funilServidor.ts")];

function arquivos(dir) {
  const saida = [];
  let entradas;
  try {
    entradas = readdirSync(join(RAIZ, dir));
  } catch {
    return saida;
  }
  for (const nome of entradas) {
    const rel = join(dir, nome);
    if (statSync(join(RAIZ, rel)).isDirectory()) saida.push(...arquivos(rel));
    else if (/\.(ts|tsx)$/.test(nome)) saida.push(rel);
  }
  return saida;
}

const achados = [];

for (const alvo of PASTAS.flatMap(arquivos)) {
  if (ISENTOS.includes(alvo)) continue;
  const texto = readFileSync(join(RAIZ, alvo), "utf8");

  for (const tabela of TABELAS) {
    const marca = `from("${tabela}")`;
    let i = texto.indexOf(marca);
    while (i !== -1) {
      // A gravação inteira cabe numa janela curta: `.insert(` vem logo depois
      // do `from(...)`, e o `const { error } =` logo antes.
      const depois = texto.slice(i, i + 60);
      if (depois.includes(".insert(")) {
        const antes = texto.slice(Math.max(0, i - 140), i);
        const olhaOErro = /\{\s*error\b/.test(antes);
        if (!olhaOErro) {
          achados.push({
            arquivo: alvo,
            linha: texto.slice(0, i).split("\n").length,
            tabela,
          });
        }
      }
      i = texto.indexOf(marca, i + 1);
    }
  }
}

if (achados.length) {
  console.error(`\nGravação de funil sem olhar o erro (${achados.length} ocorrência(s)).`);
  console.error("Insert cujo erro é descartado deixa a etapa em zero parecendo");
  console.error("comportamento de quem usa o app. Já aconteceu duas vezes.\n");
  for (const a of achados) {
    console.error(`  ${a.arquivo}:${a.linha}  (${a.tabela})`);
  }
  console.error("\nConserto: use `eventoDeFunil` de lib/funilServidor.ts, ou");
  console.error("desestruture `error` e decida o que fazer com ele.\n");
  process.exit(1);
}

console.log("Gravação: todo evento de funil olha se o banco aceitou.");
