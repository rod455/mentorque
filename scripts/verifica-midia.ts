// O gasto de anúncio: a frase do retrato esconde campanha parada?
//
// POR QUE ISTO EXISTE (02/10/2026). O caso real: em 24/09 o agente de Mídia leu
// R$ 163,59 numa janela de oito datas como "uns R$ 20 por dia" e propôs uma ação
// de R$ 640 por mês. A campanha tinha parado naquele mesmo dia, e o dinheiro da
// janela estava todo nas primeiras datas. O total estava certo e a leitura
// estava errada, e isso custou uma proposta inteira mais oito dias de fila.
//
// Esta conferência usa os NÚMEROS DAQUELE DIA como caso de teste. Se a frase
// não gritar neles, ela não serve: foi exatamente ali que a casa errou.
//
// O QUE ELA NÃO ALCANÇA: a frase é por FONTE (a conta inteira do Google, a
// conta inteira do Meta), porque o retrato só recebe o `porDia` da conta. Uma
// campanha que para dentro de uma conta que continua gastando não aparece aqui,
// e o lugar de ver isso é a coleta por campanha que o agente faz na rodada.
// Dizer isso é parte do trabalho: conferência que promete o que não alcança é
// pior que conferência que falta.
//
// Rode com: npm run conferir:midia
import { AVISO_GOOGLE, colunas, leParceiros, montaPacote, numero } from "../lib/appsflyer.ts";
import { motivoDaFalha } from "../lib/app/motivoDaFalha.ts";
import {
  DIAS_DA_PONTA,
  FONTES_DE_GASTO,
  QUEDA_QUE_E_PARADA,
  gastoDoDia,
  linhaDeGasto,
  ritmoDeGasto,
} from "../lib/midiaLegivel.ts";
import { readFileSync } from "node:fs";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}
const semComentarios = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

console.log("Mídia: a frase do gasto esconde campanha que parou de entregar?");

// ── 1. O CASO DE 24/09: A BUSCA QUE PAROU ──────────────────────────────────
//
// Oito datas, o dinheiro nas primeiras, impressão caindo antes do gasto. É o
// retrato do erro, com a ordem de grandeza real daquela semana.
{
  const busca = [
    { dia: "2026-09-17", custo: 20.1, impressoes: 1958 },
    { dia: "2026-09-18", custo: 21.4, impressoes: 1810 },
    { dia: "2026-09-19", custo: 19.8, impressoes: 1702 },
    { dia: "2026-09-20", custo: 22.3, impressoes: 1500 },
    { dia: "2026-09-21", custo: 20.9, impressoes: 980 },
    { dia: "2026-09-22", custo: 18.78, impressoes: 668 },
    { dia: "2026-09-23", custo: 1.2, impressoes: 98 },
    { dia: "2026-09-24", custo: 0.4, impressoes: 70 },
  ];
  const l = linhaDeGasto("google_ads", busca, "2026-09-24");
  conferir("a frase grita que a campanha parou", l.parada === true, l.texto);
  conferir("e diz com todas as letras que não é economia", /e nao economia/.test(l.texto), l.texto);
  conferir("o total continua lá, porque ele não é mentira", /R\$ 124,88/.test(l.texto), l.texto);
  conferir("a janela inteira aparece", /2026-09-17 a 2026-09-24/.test(l.texto), l.texto);
  conferir("a data da leitura aparece", /lido em 2026-09-24/.test(l.texto), l.texto);
  conferir("o ritmo das duas pontas aparece", /por dia nos 3 primeiros/.test(l.texto), l.texto);
  conferir("a queda da impressão entra como reforço", /impressao caiu \d+% no mesmo periodo/.test(l.texto), l.texto);
  conferir(
    "e a causa NÃO é inventada",
    /A causa mora no painel/.test(l.texto) && /NAO da para dizer qual|não dá para dizer qual/.test(l.texto),
    l.texto,
  );
  conferir("o motivo diz QUAL sinal disparou", /fim da janela seco/.test(l.motivo), l.motivo);
  conferir("e o sinal aparece na frase", /Nos 2 ultimos dias saiu/.test(l.texto), l.texto);
}

// ── 2. SEMANA NORMAL NÃO VIRA ALARME ───────────────────────────────────────
//
// Esta é a metade que decide se alguém vai manter a frase: alarme que dispara
// com oscilação de leilão é alarme que alguém desliga, e aí o de verdade
// também morre.
{
  const normal = [
    { dia: "2026-09-25", custo: 21.25, impressoes: 1108 },
    { dia: "2026-09-26", custo: 21.01, impressoes: 1029 },
    { dia: "2026-09-27", custo: 26.35, impressoes: 915 },
    { dia: "2026-09-28", custo: 25.05, impressoes: 2364 },
    { dia: "2026-09-29", custo: 19.9, impressoes: 1500 },
    { dia: "2026-09-30", custo: 23.4, impressoes: 1600 },
  ];
  const l = linhaDeGasto("google_ads", normal, "2026-10-02");
  conferir("semana normal não é chamada de parada", l.parada === false, l.texto);
  conferir("e não ganha suspeita inventada", !/PAROU|suspeita/i.test(l.texto), l.texto);
  conferir("mas ainda traz janela, ritmo e data da leitura", /janela/.test(l.texto) && /Ritmo/.test(l.texto) && /lido em/.test(l.texto), l.texto);
}

// ── 3. IMPRESSÃO CAINDO ANTES DO GASTO: AVISO, NÃO PROVA ───────────────────
{
  const antes = [
    { dia: "2026-09-25", custo: 21, impressoes: 2000 },
    { dia: "2026-09-26", custo: 20, impressoes: 1900 },
    { dia: "2026-09-27", custo: 21, impressoes: 1800 },
    { dia: "2026-09-28", custo: 20, impressoes: 300 },
    { dia: "2026-09-29", custo: 19, impressoes: 200 },
    { dia: "2026-09-30", custo: 21, impressoes: 150 },
  ];
  const l = linhaDeGasto("google_ads", antes, "2026-10-02");
  conferir("não chama de parada, porque o gasto não caiu", l.parada === false, l.texto);
  conferir("mas avisa que a impressão caiu antes", /impressao cai ANTES do gasto|impressão cai ANTES/i.test(l.texto), l.texto);
  conferir("e diz que é suspeita, não prova", /suspeita, nao prova|suspeita, não prova/i.test(l.texto), l.texto);
}

// ── 4. O QUE A FRASE FAZ QUANDO NÃO DÁ PARA DIZER ──────────────────────────
{
  const curta = [
    { dia: "2026-10-01", custo: 20 },
    { dia: "2026-10-02", custo: 1 },
  ];
  const l = linhaDeGasto("meta_ads", curta, "2026-10-02");
  conferir("janela curta não vira alarme", l.parada === false, l.texto);
  conferir("e o motivo é dito em vez de omitido", /Janela curta demais/.test(l.texto), l.texto);
  conferir("precisa de duas pontas de verdade", ritmoDeGasto(curta) === null, JSON.stringify(ritmoDeGasto(curta)));

  const vazia = linhaDeGasto("meta_ads", [], "2026-10-02");
  conferir("sem dado nenhum, diz que não há dado", /nenhum dia de gasto/.test(vazia.texto), vazia.texto);
  conferir("e não chama ausência de dado de parada", vazia.parada === false, vazia.texto);
}

// ── 5. AS DUAS FONTES ESCREVEM O GASTO COM NOMES DIFERENTES ────────────────
//
// O Google manda `custo` e o Meta manda `gasto`. Ler só um dos dois daria
// R$ 0,00 numa conta que gasta, que é zero com cara de medida.
{
  conferir("o `custo` do Google é lido", gastoDoDia({ dia: "x", custo: 12.5 }) === 12.5);
  conferir("o `gasto` do Meta é lido", gastoDoDia({ dia: "x", gasto: 7.25 }) === 7.25);
  conferir("campo ausente é zero e não NaN", gastoDoDia({ dia: "x" }) === 0);
  conferir("texto no lugar do número não contamina a soma", gastoDoDia({ dia: "x", custo: "abc" as unknown as number }) === 0);

  const meta = [
    { dia: "2026-09-25", gasto: 20.96, impressoes: 1578 },
    { dia: "2026-09-26", gasto: 16.74, impressoes: 1605 },
    { dia: "2026-09-27", gasto: 17.42, impressoes: 1909 },
    { dia: "2026-09-28", gasto: 0.2, impressoes: 40 },
    { dia: "2026-09-29", gasto: 0.1, impressoes: 30 },
    { dia: "2026-09-30", gasto: 0, impressoes: 10 },
  ];
  const l = linhaDeGasto("meta_ads", meta, "2026-10-02");
  conferir("e a conta do Meta parada também grita", l.parada === true, l.texto);
}

// ── 6. A RÉGUA NÃO DISPARA COM OSCILAÇÃO NORMAL ────────────────────────────
{
  conferir("o limiar é alto o bastante para não pegar leilão", QUEDA_QUE_E_PARADA >= 0.6, String(QUEDA_QUE_E_PARADA));
  conferir("e baixo o bastante para pegar parada", QUEDA_QUE_E_PARADA <= 0.9, String(QUEDA_QUE_E_PARADA));
  conferir("a ponta tem pelo menos três dias", DIAS_DA_PONTA >= 3, String(DIAS_DA_PONTA));

  // Queda de 50% é semana fraca, não parada.
  const fraca = [
    { dia: "2026-09-25", custo: 20 },
    { dia: "2026-09-26", custo: 20 },
    { dia: "2026-09-27", custo: 20 },
    { dia: "2026-09-28", custo: 10 },
    { dia: "2026-09-29", custo: 10 },
    { dia: "2026-09-30", custo: 10 },
  ];
  conferir("queda de metade não é parada", linhaDeGasto("google_ads", fraca, "2026-10-02").parada === false);
}

// ── 7. O RETRATO PUBLICA A FRASE, E NÃO SÓ O TOTAL ─────────────────────────
//
// Regra da semana: conserto na fonte que não muda o consumidor não é conserto.
// A frase existir e o retrato não imprimir é o mesmo que não ter escrito.
{
  const op = semComentarios(readFileSync(new URL("../lib/operacao.ts", import.meta.url), "utf8"));
  conferir("o retrato publica a frase pronta", /gastoLegivel: FONTES_DE_GASTO\.map/.test(op), "funcao que ninguem chama nao e entrega");
  conferir("e ela é montada com linhaDeGasto", /linhaDeGasto\(f, dados\.porDia \?\? \[\], pacote\?\.dia/.test(op), op.includes("linhaDeGasto") ? "chamada diferente do esperado" : "nem chama");
  conferir(
    "a data da leitura vem do pacote, não de hoje",
    /pacote\?\.dia \?\? "sem coleta"/.test(op),
    "carimbar hoje num pacote de ontem e exatamente o defeito que o frescor das fontes existe para pegar",
  );
  conferir("as duas fontes de gasto entram", FONTES_DE_GASTO.length === 2 && FONTES_DE_GASTO.includes("meta_ads"), FONTES_DE_GASTO.join(", "));
}

// ── O RELATORIO DE PARCEIROS DA APPSFLYER (03/10/2026) ─────────────────────
//
// POR QUE ISTO EXISTE. Ate 03/10 a casa nao sabia QUEM trazia a instalacao: o
// painel do Google conta a dele, o da Meta a dela, e o Play Console nao divide
// anunciante. A AppsFlyer divide, e a leitura do CSV dela e a parte que quebra
// calada. O caso de teste e o arquivo REAL de 26/09 a 03/10, que o dono baixou.
//
// O QUE ELA NAO ALCANCA: se a Pull API respondeu a verdade. Isso e a execucao
// do n8n, e o aviso do token vencido aparece como relatorio nao legivel.
{
  console.log("AppsFlyer: o relatorio de parceiros vira numero sem mentir?");

  const CSV_ANDROID = [
    "Agency/PMD (af_prt),Media Source (pid),Campaign (c),Impressions,Clicks,CTR,Installs,Conversion Rate,Sessions,Loyal Users,Loyal Users/Installs,Total Revenue,Total Cost,ROI,ARPU,Average eCPI",
    "None,Facebook Ads,Lançamento Mentorque,N/A,N/A,N/A,124,N/A,397,42,0.3387,0.0000,N/A,N/A,0.0000,N/A",
    "None,Organic,None,N/A,N/A,N/A,52,N/A,0,14,0.2692,0.0000,N/A,N/A,0.0000,N/A",
  ].join("\n");
  const CSV_IOS = [
    "Agency/PMD (af_prt),Media Source (pid),Campaign (c),Impressions,Clicks,CTR,Installs,Conversion Rate,Sessions,Loyal Users,Loyal Users/Installs,Total Revenue,Total Cost,ROI,ARPU,Average eCPI",
    "None,Organic,None,N/A,N/A,N/A,3,N/A,0,2,0.6667,0.0000,N/A,N/A,0.0000,N/A",
  ].join("\n");

  const android = leParceiros(CSV_ANDROID);
  conferir("o Android le as duas linhas", android?.linhas.length === 2, String(android?.linhas.length));
  conferir("e a Meta traz 124 instalacoes", android?.pagas === 124, String(android?.pagas));
  conferir("e o organico 52", android?.organicas === 52, String(android?.organicas));
  conferir("e o total 176", android?.instalacoes === 176, String(android?.instalacoes));
  conferir("e a campanha vem junto", android?.linhas[0]?.campanha === "Lançamento Mentorque", String(android?.linhas[0]?.campanha));
  conferir("e `None` na campanha vira nulo, nao a string None", android?.linhas[1]?.campanha === null, String(android?.linhas[1]?.campanha));

  // `N/A` E AUSENCIA, NAO ZERO. Mesma regra do valor da fatura em lib/ciclo.ts.
  // Custo zero diria "a campanha foi de graca"; custo ausente diz "a integracao
  // de custo esta desligada", e as duas levam a decisoes opostas.
  conferir("custo `N/A` vira nulo e nao zero", android?.linhas[0]?.custo === null, String(android?.linhas[0]?.custo));
  conferir("e a leitura declara que esta sem custo", android?.semCusto === true);
  // SEM LINHA NENHUMA NAO E "CUSTO DESLIGADO", e esta assercao nasceu de um
  // plantio que passou verde: `every` sobre lista vazia devolve true, entao um
  // relatorio com cabecalho e zero linhas afirmaria que a integracao de custo
  // esta desligada sem ter olhado uma linha sequer.
  const soCabecalho = leParceiros("Media Source (pid),Campaign (c),Installs,Total Cost");
  conferir("relatorio sem linha nao afirma custo desligado", soCabecalho?.semCusto === false, JSON.stringify(soCabecalho));
  conferir("e ele tambem nao inventa instalacao", soCabecalho?.instalacoes === 0, String(soCabecalho?.instalacoes));
  conferir("numero() devolve nulo para N/A", numero("N/A") === null);
  conferir("e zero de verdade continua zero", numero("0") === 0);

  // VIRGULA DENTRO DE CAMPO. `split(",")` desloca todas as colunas a direita e
  // as instalacoes passam a vir da coluna errada, com cara de numero certo.
  const comVirgula = [
    "Media Source (pid),Campaign (c),Installs,Sessions,Loyal Users,Total Cost",
    '\u0046acebook Ads,"Lançamento, Mentorque",124,397,42,N/A',
  ].join("\n");
  const lidoComVirgula = leParceiros(comVirgula);
  conferir(
    "campo entre aspas com virgula nao desloca as colunas",
    lidoComVirgula?.linhas[0]?.instalacoes === 124 && lidoComVirgula?.linhas[0]?.campanha === "Lançamento, Mentorque",
    JSON.stringify(lidoComVirgula?.linhas[0]),
  );
  conferir("colunas() respeita aspas", colunas('a,"b,c",d').length === 3, colunas('a,"b,c",d').join(" | "));

  // TEXTO QUE NAO E O RELATORIO vira NULO, e nao pacote vazio. A Pull API
  // responde 200 com texto de erro em alguns casos, e ler isso como "zero
  // instalacao" faria a operacao ver queda de campanha onde houve queda de
  // coleta.
  conferir("texto de erro nao vira zero instalacao", leParceiros("Token expired") === null);
  conferir("vazio nao vira zero instalacao", leParceiros("") === null);
  conferir("nulo nao vira zero instalacao", leParceiros(null) === null);

  // O AVISO DO ZERO ESTRUTURAL, que e o motivo de este pacote existir.
  const pacote = montaPacote({ de: "2026-09-26", ate: "2026-10-03" }, android, leParceiros(CSV_IOS));
  conferir("o pacote soma os dois apps", pacote.instalacoes === 179, String(pacote.instalacoes));
  conferir(
    "e avisa que o Google nao esta ligado",
    pacote.avisos.some((a) => a === AVISO_GOOGLE),
    pacote.avisos.join(" / "),
  );
  conferir(
    "e o aviso diz que zero significa NAO PERGUNTADO",
    /NAO PERGUNTADO/.test(AVISO_GOOGLE),
    "sem essa frase o leitor conclui que a campanha do Google nao trouxe ninguem",
  );
  conferir("e avisa do custo desligado", pacote.avisos.some((a) => /integracao de custo desligada/.test(a)));
  conferir("e carrega a ressalva do SDK", pacote.avisos.some((a) => /25% dos aparelhos Android/.test(a)));

  // E O AVISO SOME SOZINHO quando o dado muda, que e o ponto: ele e derivado do
  // conteudo, nao uma frase que alguem precisa lembrar de apagar.
  const comGoogle = leParceiros([
    "Media Source (pid),Campaign (c),Installs,Sessions,Loyal Users,Total Cost",
    "googleadwords_int,APP Android,80,200,20,151.83",
  ].join("\n"));
  const pacoteComGoogle = montaPacote({ de: "a", ate: "b" }, comGoogle, null);
  conferir(
    "com o Google ligado, o aviso dele some",
    !pacoteComGoogle.avisos.some((a) => a === AVISO_GOOGLE),
    pacoteComGoogle.avisos.join(" / "),
  );
  conferir(
    "e com custo de verdade o aviso de custo some",
    !pacoteComGoogle.avisos.some((a) => /integracao de custo desligada/.test(a)),
    pacoteComGoogle.avisos.join(" / "),
  );
  conferir("e o custo lido e o numero", comGoogle?.linhas[0]?.custo === 151.83, String(comGoogle?.linhas[0]?.custo));

  // A ROTA USA A REGRA, que e o criterio 10 do Guardiao: conserto na fonte que
  // o consumidor nao usa nao e conserto.
  const rota = readFileSync(new URL("../app/api/metricas/route.ts", import.meta.url), "utf8");
  conferir("a mesa de metricas aceita a fonte appsflyer", /"appsflyer",/.test(rota));
  conferir("a rota importa a regra", /from "@\/lib\/appsflyer"/.test(rota));
  conferir("e chama leParceiros nos dois apps", (rota.match(/leParceiros\(/g) ?? []).length >= 2, rota.match(/leParceiros\(/g)?.join(","));
  conferir("e monta o pacote com os avisos", /montaPacote\(/.test(rota));
  conferir(
    "e recusa quando nenhum relatorio e legivel",
    /appsflyer_ilegivel/.test(rota),
    "gravar zero quando a coleta falhou faz a operacao ler queda de campanha",
  );
  // E O QUE GRAVA E O PACOTE LIDO, nao o CSV cru. Conserto na fonte que o
  // consumidor nao usa nao e conserto: sem esta, a leitura podia estar perfeita
  // e o banco continuar guardando texto.
  conferir(
    "e o que vai para o banco e o pacote lido",
    /dados: pacote/.test(rota) && /pacote = montaPacote\(/.test(rota),
    "a regra pode estar certa e o banco guardar o CSV cru do mesmo jeito",
  );
  conferir(
    "e o teto de tamanho mede o pacote, nao o CSV",
    /JSON\.stringify\(pacote\)\.length > MAX_DADOS/.test(rota),
    "medir o CSV faria o relatorio crescer ate a rota recusar uma coleta boa",
  );
}

// ── A SUBIDA DO SDK DA APPSFLYER, NO APARELHO (03/10/2026) ─────────────────
//
// POR QUE ISTO EXISTE. Todo numero que a AppsFlyer entrega depende de o SDK ter
// subido no aparelho, e MEDIDO em 03/10 ele nao sobe em 23,1% dos Android (94
// de 407 em 21 dias). Em 22/09 eram 25%: duas versoes passaram sem mudar nada,
// porque o `catch` jogava o motivo fora e ninguem tinha o que investigar.
//
// O QUE ELA NAO ALCANCA: se o SDK sobe de verdade no aparelho. Isso e aparelho,
// e a prova e a proporcao de `origem = ok` cair depois do proximo build. Aqui
// se prova que o motivo VIAJA e que ele cabe na coluna.
{
  console.log("AppsFlyer no aparelho: a falha diz por que falhou?");

  const fonte = readFileSync(new URL("../lib/app/atribuicao.ts", import.meta.url), "utf8");

  // O MOTIVO CABE NA COLUNA. A rota do funil corta `origem` em 32; um motivo
  // mais longo chegaria cortado ao meio e dois erros diferentes virariam o
  // mesmo valor no banco, que e agrupar errado com cara de agrupar certo.
  const longo = motivoDaFalha(new Error("TypeError: Cannot read properties of undefined (reading 'initSDK') at AppsFlyerPlugin"));
  conferir("o motivo cabe nos 32 da coluna origem", longo.length <= 32, `${longo} (${longo.length})`);
  conferir("e comeca com erro:", longo.startsWith("erro:"), longo);
  conferir("e o slug nao tem espaco nem acento", /^erro:[a-z0-9-]+$/.test(longo), longo);
  conferir("erro sem mensagem nao vira string vazia", motivoDaFalha(undefined) === "erro:sem-mensagem", motivoDaFalha(undefined));
  conferir("e dois erros diferentes dao motivos diferentes",
    motivoDaFalha(new Error("network")) !== motivoDaFalha(new Error("timeout")),
    `${motivoDaFalha(new Error("network"))} vs ${motivoDaFalha(new Error("timeout"))}`);

  // A MARCA NO APARELHO AGRUPA POR FAMILIA. Se a chave fosse o texto inteiro,
  // um aparelho que falha com duas mensagens gravaria duas linhas, e o custo
  // passaria a crescer com a variedade de erro em vez de com o numero de
  // aparelhos, que e o oposto do que a marca existe para garantir.
  conferir(
    "a marca no aparelho usa a familia do desfecho, nao a mensagem",
    /desfecho\.split\(":"\)\[0\]/.test(fonte),
    "sem isso, um aparelho com dois erros diferentes grava duas linhas",
  );

  // TENTA MAIS DE UMA VEZ NA MESMA ABERTURA. O aparelho medio abre 1,5 vez, e o
  // desenho antigo tentava uma vez por abertura: na pratica, uma na vida.
  conferir("tenta mais de uma vez", /const TENTATIVAS = [2-9]/.test(fonte), "uma tentativa por abertura e uma tentativa na vida do aparelho");
  conferir("e espera entre as tentativas", /ESPERA_BASE_MS/.test(fonte) && /await espera\(/.test(fonte));
  // E SO GRAVA O DESFECHO FINAL. Registrar a falha da primeira tentativa faria
  // o aparelho que deu certo na terceira aparecer como falha, e a conta de 23%
  // passaria a medir "tropecou" em vez de "nao subiu".
  conferir(
    "e so registra a falha depois de todas as tentativas",
    /for \(let tentativa = 1; tentativa <= TENTATIVAS/.test(fonte) && /ultimo = motivoDaFalha\(e\)/.test(fonte),
    "gravar a falha dentro do laco faz quem deu certo na terceira contar como falha",
  );
  conferir(
    "e o sucesso sai do laco na hora",
    /registrar\("ok"\);\s*\n\s*return;/.test(fonte),
    "sem o return, o laco tentaria de novo depois de ter dado certo",
  );
  conferir(
    "e o `iniciado` volta a falso para a proxima abertura tentar",
    /iniciado = false;\s*\n\s*registrar\(ultimo\);/.test(fonte),
    "sem isso o aparelho que falhou nunca mais tenta",
  );
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) da frase de mídia reprovaram.`);
  process.exit(1);
}
console.log("Mídia: a janela está dentro da frase, parada não passa por economia, e oscilação não vira alarme.");
