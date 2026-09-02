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
//   PEGA   → gravação (insert ou upsert) nas tabelas de TABELAS cujo verbo não
//            desestrutura `error`
//   IGNORA → lib/funilServidor.ts, que É o escritor compartilhado do funil (ele
//            olha o erro, tolera duplicado e loga o resto). Passar por ele é a
//            forma recomendada de gravar: quem usa `eventoDeFunil` nem aparece
//            aqui, porque não escreve `from("funil_eventos")`.
//
// POR QUE `subscriptions` ENTROU (02/09/2026): a versão de manhã desta mesma
// conferência mirava só `funil_eventos`, e no MESMO arquivo que ela foi escrita
// para consertar havia três `upsert` em `subscriptions` engolindo erro, três
// linhas acima. `funil_eventos` é medição; `subscriptions` é o que libera o
// Premium. Perder uma medição é ruim; perder uma assinatura paga é um cliente
// que pagou e ficou sem o que comprou, calado, para sempre. A conferência que
// nasce de um padrão precisa mirar onde ele dói mais, não só onde foi visto.
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
const TABELAS = ["funil_eventos", "subscriptions"];
/** Os escritores compartilhados: eles são a solução, não o problema. */
const ISENTOS = [join("lib", "funilServidor.ts"), join("lib", "subscriptionSync.ts")];

/** Os verbos que GRAVAM. Leitura (`select`) não tem o que perder em silêncio. */
const VERBOS = [".insert(", ".upsert("];

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
      if (VERBOS.some((v) => depois.includes(v))) {
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
  console.error(`\nGravação sem olhar o erro (${achados.length} ocorrência(s)).`);
  console.error("Em funil_eventos, o erro descartado deixa a etapa em zero parecendo");
  console.error("comportamento de quem usa o app. Em subscriptions é pior: a pessoa");
  console.error("pagou e fica sem o Premium, calada. Já aconteceu três vezes.\n");
  for (const a of achados) {
    console.error(`  ${a.arquivo}:${a.linha}  (${a.tabela})`);
  }
  console.error("\nConserto: use o escritor compartilhado da tabela (eventoDeFunil");
  console.error("ou upsertSubscription), ou desestruture `error` e decida o que");
  console.error("fazer com ele. Silêncio não é opção.\n");
  process.exit(1);
}

console.log("Gravação: funil e assinatura olham se o banco aceitou.");
