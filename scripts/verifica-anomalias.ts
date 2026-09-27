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

  // ── A ANOMALIA DO QUIZ VIROU OUTRA COISA (27/09/2026) ─────────────────────
  //
  // A antiga contava quantas pessoas responderam o quiz e nunca mais
  // produziram evento, em número ABSOLUTO. Ela gritava "28 no Android contra 2
  // no iPhone" todo dia. Medido com denominador, era 24,1% contra 14,3% (sobre
  // 116 respostas e 14), e comparado com as outras ações do Android o quiz
  // ficava ABAIXO da média: viu_paywall 44,4%, cadastro 32,6%, quiz 23,7%.
  // Um quarto de qualquer coisa que se faça no Android é a última coisa que
  // aquele aparelho faz. Isso é a nossa retenção, não app fechando.
  //
  // A pergunta não foi apagada, foi calibrada: o quiz continua entrando na
  // conta e aparece sozinho no dia em que passar da base da plataforma dele.
  //
  // O QUE ESTA CONFERÊNCIA PROTEGE é justamente a calibração, porque é ela que
  // se perde numa edição distraída. Sem denominador e sem base, a linha volta
  // a ser o alarme que grita todo dia sobre coisa que não é defeito, e a casa
  // já sabe o preço disso: está escrito logo abaixo, no contrato com o Vigia.
  conferir("a anomalia calibrada continua no SQL", sql.includes("acao que costuma ser a ultima"));
  conferir(
    "ela compara com a BASE da plataforma, não com zero",
    /pct_base/.test(sql) && /\+ 15/.test(sql),
    "sem a base, 24% vira achado e 24% é o normal desta casa"
  );
  conferir(
    "ela exige volume mínimo",
    /having count\(\*\) >= 20/.test(sql),
    "sem piso, três ocorrências viram anomalia e o alarme toca por ruído"
  );
  conferir(
    "ela publica o denominador no detalhe",
    /'de ' \|\| count\(\*\) \|\| ' vezes de '/.test(sql),
    "número sem denominador foi exatamente o defeito da versão antiga: quem lê não tem como saber se é muito"
  );
  conferir(
    "o quiz continua ENTRANDO na conta",
    sql.includes("'respondeu o quiz'"),
    "calibrar não é apagar a pergunta: se um dia o quiz passar da base, ele tem que aparecer sozinho"
  );
  conferir(
    "ação terminal por projeto fica de fora",
    /not in \('clicou_baixar', 'clicou_consultoria', 'assinou', 'iniciou_checkout'\)/.test(sql),
    "clicou_baixar é 94% na web e está CERTO: a pessoa vai para a loja. Dentro da conta, ele enche o alarme de acerto com cara de erro"
  );

  // AS DUAS DE 27/09/2026, e elas nasceram juntas de propósito.
  //
  // O dono perguntou se não era melhor parar de mandar o relato de "app fechou
  // sozinho", porque ele dizia sempre a mesma coisa. A resposta foi não, e o
  // motivo está nestas duas linhas: o relato é a testemunha de DENTRO, que só
  // fala se a pessoa reabrir o app, e a outra é a mesma pergunta vista de
  // FORA, que não depende de ninguém voltar.
  //
  // Se alguém apagar a de fora achando que a de dentro basta, volta o buraco
  // de projeto que está escrito no cabeçalho deste arquivo desde 07/09: quem o
  // app derruba e não volta não existe em lugar nenhum.
  conferir("a anomalia do cadastro de carro continua no SQL", sql.includes("abriu o cadastro de carro e sumiu"));
  conferir("a anomalia do fechamento continua no SQL", sql.includes("'app fechou sozinho'"));
  conferir(
    "o fechamento sai com a VERSÃO no detalhe",
    /string_agg\(distinct coalesce\(a\.versao/.test(sql),
    'sem a versão não dá para responder "já passou e foi para o próximo build?", que é a primeira pergunta que alguém faz ao ver o número'
  );

  // ── O CONTRATO COM O VIGIA (19/09/2026) ───────────────────────────────────
  //
  // O DEFEITO: de 15 a 19/09 o Vigia mandou todo dia "um erro está se
  // repetindo: 10x push: token pronto, mas sem sessão". O erro tinha PARADO em
  // 15/09, quando a 2.6 levou o conserto; as ocorrências velhas é que
  // continuavam dentro da janela de 7 dias. A frase estava no presente e o
  // dado era do passado.
  //
  // O Vigia passou a exigir que a última ocorrência seja de ontem ou de hoje,
  // e quem entrega esse `ultimo` é esta rota. Se o campo sumir daqui, o Vigia
  // volta a alertar sobre erro morto, e ele NÃO tem como perceber: a regra
  // dele trata campo ausente como "alerta", de propósito, para não calar por
  // falta de dado. Ou seja, quebrar este contrato falha para o lado barulhento
  // e ninguém liga os dois fatos.
  //
  // Alarme que repete sobre coisa já consertada ensina o dono a ignorar o
  // Vigia, e aí o próximo alarme de verdade passa batido.
  conferir(
    "cada erro do retrato diz QUANDO foi a última vez",
    /ultimo: d\.ultimo\.slice\(0, 10\)/.test(operacao),
    "sem `ultimo` o Vigia não consegue separar erro vivo de erro já consertado",
  );
  conferir(
    "e em quantos aparelhos, e em quais versões",
    /aparelhos: d\.aparelhos\.size/.test(operacao) && /versoes: \[\.\.\.d\.versoes\]/.test(operacao),
    "dez ocorrências pode ser uma pessoa reabrindo o app; e erro só em versão velha é base que não atualizou, não defeito de pé",
  );
  conferir(
    "a consulta busca as colunas que isso exige",
    /from\("app_erros"\)\.select\("criado_em, mensagem, plataforma, versao, anon_id"\)/.test(operacao),
    "o resumo não inventa coluna que a consulta não trouxe",
  );
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
