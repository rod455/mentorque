// O vigia da operação continua ligado, e a testemunha continua calada na web?
//
// POR QUE ISTO EXISTE (07/09/2026). Duas coisas graves ficaram semanas
// invisíveis, e as duas eram lições sobre INSTRUMENTAÇÃO, não sobre produto.
//
//   1. O ANDROID NUNCA TEVE UMA CONTA. Em quatro semanas e 160 eventos, nenhum
//      evento do Android carregou `user_id`; iPhone e web carregam desde 24/08.
//      Ninguém viu porque todo relatório olhava o TOTAL, e no total a web cobre
//      o buraco. O conserto não é um número novo: é uma pergunta que passa a
//      ser feita todo dia, sozinha, e que grita por plataforma.
//
//   2. A MIGALHA DE FECHAMENTO SÓ FALA NA ABERTURA SEGUINTE. Ela foi construída
//      para pegar o app fechando no quiz do Android, e desde que subiu produziu
//      seis relatos: SEIS na web, ZERO no Android. Um fechamento ruim o
//      bastante para a pessoa desistir deixa a testemunha muda para sempre, e
//      na web a mesma evidência tem explicação inocente (fechar o navegador não
//      deixa JavaScript rodar). Ou seja: ela enchia de ruído justamente a
//      tabela onde o QA procura o defeito que ela deveria denunciar.
//
// O que esta conferência cobra é o que impede as duas de voltarem calado:
//
//   1. o retrato diário continua LENDO a porta única das anomalias
//   2. o SQL e o leitor concordam no nome da função (renomear um lado só é o
//      jeito clássico de a porta virar decoração)
//   3. o relato de fechamento continua sendo só do app das lojas
//
// Rode com: npm run conferir:anomalias
import { readFileSync } from "node:fs";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

const leia = (caminho: string) => readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8");

const sql = leia("supabase/anomalias-da-operacao.sql");
const operacao = leia("lib/operacao.ts");
const erros = leia("lib/app/erros.ts");

console.log("Anomalias: o vigia da operação continua ligado?");

// ── 1. a porta única existe dos dois lados, com o mesmo nome ───────────────
//
// Lido do arquivo e não repetido à mão: repetir o nome aqui criaria uma
// terceira cópia, e a próxima divergência ficaria entre as duas cópias nossas.
{
  const nome = sql.match(/create or replace function public\.(\w+)/)?.[1] ?? "";
  conferir("o SQL declara a função das anomalias", !!nome, "o arquivo mudou de forma; releia antes de confiar nesta conferência");

  conferir(
    "o retrato diário chama a função pelo nome que o SQL declara",
    !!nome && operacao.includes(`"${nome}"`),
    `o SQL declara ${nome} e lib/operacao.ts não chama esse nome. Renomear um lado só transforma a porta em decoração: a rota responde, o campo vem vazio, e ninguém percebe.`
  );

  conferir(
    "o retrato publica o campo das anomalias",
    /\n\s*anomalias:/.test(operacao),
    "a chamada pode existir e o resultado não sair no JSON, que é o mesmo que não existir para quem lê o retrato"
  );

  // As duas anomalias que motivaram tudo isto. Se alguém apagar uma delas do
  // SQL, some uma pergunta que ninguém mais vai fazer sozinho.
  conferir("a anomalia da plataforma sem conta continua no SQL", sql.includes("plataforma sem nenhuma conta"));
  conferir("a anomalia do quiz continua no SQL", sql.includes("respondeu o quiz e sumiu"));
}

// ── 2. o relato de fechamento é só do app das lojas ────────────────────────
//
// A premissa da migalha ("o processo morreu enquanto a pessoa usava é
// defeito") vale no app e NÃO vale no navegador, onde fechar a aba, fechar o
// navegador ou deslizar ele para fora produzem exatamente a mesma evidência.
{
  const bloco = erros.match(/export function relatarFechamentoAnterior\(\)[\s\S]*?\n}/)?.[0] ?? "";
  conferir("relatarFechamentoAnterior ainda existe", !!bloco, "a função mudou de nome; esta conferência precisa ser reapontada");
  conferir(
    "o relato de fechamento só sai no app das lojas",
    bloco.includes("isNativeApp()"),
    "sem esta guarda a web volta a encher app_erros de fechamento que não é defeito, e a tabela deixa de servir para achar o crash do Android"
  );
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) das anomalias reprovaram.`);
  process.exit(1);
}
console.log("Anomalias: a porta única está ligada ao retrato e o fechamento só fala no app.");
