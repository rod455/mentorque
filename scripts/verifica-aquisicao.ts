// A escada da aquisição mente quando uma fonte falta?
//
// POR QUE ISTO EXISTE (03/10/2026). O dono: "estamos mapeando errado AppsFlyer,
// Google Ads, Play Store e Apple. Temos acesso a TODAS. Precisamos medir
// direito." O problema nunca foi acesso: era misturar as respostas de quatro
// fontes que respondem perguntas diferentes, e os casos que custaram a noite
// são os casos de teste daqui.
//
// O QUE ELA PROVA, e cada item é um jeito real de a escada mentir:
//
//   1. painel somado com painel conta a mesma pessoa duas vezes, e foi o que a
//      casa quase publicou (Google 235 + Meta 194 contra 140 que a Play inteira
//      registrou na semana);
//   2. `conversoes` do Google Ads entrando no lugar de instalação;
//   3. a AppsFlyer virando TOTAL quando ela só vê 77% dos aparelhos;
//   4. fonte que faltou devolvendo zero em vez de "não sei", que é como falha
//      de coleta vira queda de campanha;
//   5. custo por instalação com o denominador do painel em vez do MMP.
//
// O QUE ELA NÃO ALCANÇA: se os números das fontes estão certos. Isso é de cada
// coletor. Aqui se prova que a MISTURA deles não inventa número.
//
// Rode com: npm run conferir:aquisicao
import {
  DONO_DO_DEGRAU,
  FONTE_NO_MMP,
  RECUSAS,
  custoPorInstalacao,
  degrauDaInstalacaoPorFonte,
  degrauDaInstalacaoTotal,
  degrauDoDinheiro,
  linhaDaEscada,
  montaEscada,
} from "../lib/aquisicao.ts";
import { PACOTE_ANDROID, achaColuna, arquivoEhDoApp, arquivoMaisNovo, destextoUtf16, leInstalacoes } from "../lib/playRelatorios.ts";
import { readFileSync } from "node:fs";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

console.log("Aquisição: cada degrau tem um dono, e o que falta diz que falta?");

// Os números REAIS da semana de 26/09 a 03/10, que é o que torna isto um teste
// e não um exercício.
const PACOTES = {
  google_ads: { custo7d: 153.16, conversoes: 235, porRede: [{ rede: "YOUTUBE_WATCH", custo: 120.14 }] },
  meta_ads: { gasto7d: 132.11, instalacoes: 194 },
  appsflyer: {
    instalacoes: 179,
    pagas: 124,
    organicas: 55,
    android: {
      linhas: [
        { fonte: "Facebook Ads", instalacoes: 124 },
        { fonte: "Organic", instalacoes: 52 },
      ],
    },
  },
  app_store_downloads: { downloads7d: 9 },
};

// ── 1. DINHEIRO: a única soma legítima ─────────────────────────────────────
{
  const d = degrauDoDinheiro(PACOTES);
  conferir("o dinheiro soma os dois painéis", d.valor === 285.27, String(d.valor));
  conferir("e diz quanto é de cada um", d.porFonte.length === 2, JSON.stringify(d.porFonte));
  conferir("e o dono é o painel de anúncio", /painéis de anúncio/.test(d.dono), d.dono);

  // Painel que faltou vira ressalva, e o total não finge ser o total.
  const so = degrauDoDinheiro({ google_ads: { custo7d: 153.16 } });
  conferir("com um painel só, avisa que falta o outro", so.ressalvas.length > 0, JSON.stringify(so.ressalvas));
  const nenhum = degrauDoDinheiro({});
  conferir("sem painel nenhum o valor é nulo, não zero", nenhum.valor === null, String(nenhum.valor));
  conferir("e diz por quê", /nenhum painel/.test(nenhum.naoSei), nenhum.naoSei);
}

// ── 2. INSTALAÇÃO POR FONTE: só o MMP, e sempre com a ressalva ─────────────
{
  const d = degrauDaInstalacaoPorFonte(PACOTES.appsflyer);
  conferir("a instalação por fonte vem da AppsFlyer", d.valor === 179, String(d.valor));
  conferir("e o dono é o MMP", /AppsFlyer/.test(d.dono), d.dono);
  conferir("e lista as fontes, da maior para a menor", d.porFonte[0]?.fonte === "Facebook Ads", JSON.stringify(d.porFonte));
  // A RESSALVA DO SDK VIAJA SEMPRE. Sem ela, 179 vira "o total de instalações"
  // na cabeça de quem lê, e 23% dos aparelhos nunca entraram nessa conta.
  conferir(
    "e a ressalva do SDK vem junto, sempre",
    d.ressalvas.some((r) => r === RECUSAS.mmpComoTotal),
    JSON.stringify(d.ressalvas),
  );
  conferir("e a ressalva diz PROPORCAO e nao total", /PROPORCAO entre fontes, nunca o total/.test(RECUSAS.mmpComoTotal), RECUSAS.mmpComoTotal);

  const sem = degrauDaInstalacaoPorFonte(undefined);
  conferir("sem AppsFlyer o valor é nulo, não zero", sem.valor === null, String(sem.valor));
  conferir("e diz que falta a coleta", /não foi coletada/.test(sem.naoSei), sem.naoSei);
}

// ── 3. INSTALAÇÃO TOTAL: o buraco é declarado, não estimado ────────────────
{
  const d = degrauDaInstalacaoTotal(PACOTES);
  // SEMPRE NULO ENQUANTO A PLAY NÃO FOR COLETADA, mesmo com a Apple lida. Dar o
  // número da Apple como total faria o Android, que é 98% da base, sumir.
  conferir("a instalação total é nula mesmo com a Apple lida", d.valor === null, String(d.valor));
  conferir("e o motivo cita a Play", /Play Console/.test(d.naoSei), d.naoSei);
  conferir("e diz que o Android é 98% da base", /98% da base/.test(d.naoSei), d.naoSei);
  conferir("e o lado da Apple aparece como fonte", d.porFonte[0]?.valor === 9, JSON.stringify(d.porFonte));
  conferir("e o dono são as lojas", /lojas/.test(d.dono), d.dono);
}

// ── 4. CUSTO POR INSTALAÇÃO: denominador do MMP, nunca do painel ───────────
{
  const dinheiro = degrauDoDinheiro(PACOTES);
  const inst = degrauDaInstalacaoPorFonte(PACOTES.appsflyer);
  const cpi = custoPorInstalacao(dinheiro, inst, FONTE_NO_MMP);

  // A META TEM AS DUAS PONTAS: R$ 132,11 do painel dela, 124 instalações do MMP.
  const meta = cpi.find((c) => c.fonte === "meta_ads");
  conferir("a Meta tem custo por instalação", meta?.porInstalacao === 1.07, JSON.stringify(meta));

  // O GOOGLE NÃO TEM, e é o ponto inteiro: ele gastou R$ 153,16 e o MMP não
  // atribui nenhuma instalação a ele. Usar as 235 conversões do painel dele
  // como denominador daria R$ 0,65 por instalação, um número lindo e inventado.
  conferir(
    "o Google NÃO tem custo por instalação, porque falta o denominador do MMP",
    !cpi.some((c) => c.fonte === "google_ads"),
    JSON.stringify(cpi),
  );
  conferir("então só uma fonte fecha a conta hoje", cpi.length === 1, JSON.stringify(cpi));

  // E com o Google atribuído, ele entra: a regra não é "o Google nunca entra",
  // é "só entra com o denominador do dono certo".
  const comGoogle = custoPorInstalacao(
    dinheiro,
    degrauDaInstalacaoPorFonte({
      instalacoes: 259,
      android: { linhas: [{ fonte: "Facebook Ads", instalacoes: 124 }, { fonte: "googleadwords_int", instalacoes: 80 }] },
    }),
    FONTE_NO_MMP,
  );
  conferir("com o Google atribuído, ele entra na conta", comGoogle.some((c) => c.fonte === "google_ads"), JSON.stringify(comGoogle));
  conferir("e a conta dele é R$ 1,91", comGoogle.find((c) => c.fonte === "google_ads")?.porInstalacao === 1.91, JSON.stringify(comGoogle));
}

// ── 5. AS RECUSAS VIAJAM COM A ESCADA ──────────────────────────────────────
//
// Regra que mora longe do número não chega na hora em que o número é lido. As
// três recusas são o que impede o próximo leitor de refazer a conta errada.
{
  const e = montaEscada(PACOTES);
  conferir("a escada tem os três degraus", e.degraus.length === 3, String(e.degraus.length));
  conferir("e carrega as três recusas", e.recusas.length === 3, JSON.stringify(e.recusas));
  conferir(
    "a recusa de somar painéis está escrita com o caso",
    /conta a mesma pessoa duas vezes/.test(RECUSAS.somarPaineis),
    RECUSAS.somarPaineis,
  );
  conferir(
    "e a de conversão tem a aritmética que a prova",
    /33,6 por dia/.test(RECUSAS.conversaoComoInstalacao) && /20 por dia/.test(RECUSAS.conversaoComoInstalacao),
    RECUSAS.conversaoComoInstalacao,
  );

  // A LINHA DO RETRATO diz "NAO SEI" onde não sabe, em vez de omitir o degrau.
  const linhas = linhaDaEscada(e);
  conferir("o retrato publica uma linha por degrau", linhas.length === 3, JSON.stringify(linhas));
  conferir(
    "e o degrau sem dono diz NAO SEI, com o motivo",
    linhas.some((l) => /instalação total.*NAO SEI/.test(l)),
    linhas.join(" | "),
  );
  conferir("e o degrau que sabe mostra o número", linhas.some((l) => /R\$ 285\.27/.test(l)), linhas.join(" | "));
  conferir("e cada linha diz quem é o dono", linhas.every((l) => /\[dono: /.test(l)), linhas.join(" | "));
}

// ── 6. O RETRATO USA A ESCADA ──────────────────────────────────────────────
//
// Critério 10 do Guardião: conserto na fonte que o consumidor não usa não é
// conserto. Sem esta seção, a escada podia estar perfeita e ninguém a ler.
{
  const op = readFileSync(new URL("../lib/operacao.ts", import.meta.url), "utf8");
  conferir("o retrato importa a escada", /from "\.\/aquisicao"/.test(op));
  conferir("e publica o campo", /aquisicao: \(\(\) => \{/.test(op), "sem o campo, a regra existe e ninguem le");
  conferir("e publica as linhas prontas", /linhas: linhaDaEscada\(escada\)/.test(op));
  conferir(
    "e monta a partir das fontes coletadas",
    /montaEscada\(pacotes\)/.test(op) && /pacotes\[f\] = \(porFonte\[f\] \?\? \[\]\)\[0\]\?\.dados/.test(op),
    "escada montada com objeto vazio devolve NAO SEI em tudo e parece coleta quebrada",
  );
  conferir("o dono de cada degrau está escrito no fonte", Object.keys(DONO_DO_DEGRAU).length === 5, Object.keys(DONO_DO_DEGRAU).join(", "));
}

// ── O RELATORIO DE INSTALACOES DO PLAY, QUE MORA NUM BUCKET (03/10/2026) ───
//
// POR QUE. O degrau da instalacao TOTAL do Android nao tinha dono. A metrica
// nao vive na API de Reporting (so vitals, e mesmo isso nunca veio: 35 dias, 33
// pacotes vazios); vive em CSV mensal num bucket do Cloud Storage. O dono
// passou os enderecos em 03/10.
//
// AS DUAS ARMADILHAS DESTE FORMATO, e as duas quebram calado:
//   1. o arquivo e UTF-16. Lido como UTF-8, o cabecalho vem com um byte nulo
//      entre cada letra, nenhuma coluna e achada, e um leitor ingenuo devolve
//      zero linha com cara de "mes sem instalacao";
//   2. o cabecalho vem no IDIOMA DA CONTA, entao procurar o nome exato em uma
//      lingua so funciona hoje e some amanha.
{
  console.log("Play, relatorio de instalacoes: formato estranho vira aviso ou vira zero?");

  // O cabecalho REAL do primeiro CSV do Mentorque (04/10/2026), com as doze
  // colunas. Tres delas vem zeradas em todos os dias e nao e zero medido:
  // `Daily Device Uninstalls`, `Daily Device Upgrades` e `Total User Installs`.
  // A desinstalacao que o Play ainda alimenta e `Daily User Uninstalls`.
  const CABECALHO =
    "Date,Package Name,Daily Device Installs,Daily Device Uninstalls,Daily Device Upgrades,Total User Installs," +
    "Daily User Installs,Daily User Uninstalls,Active Device Installs,Install events,Update events,Uninstall events";
  const CSV = [CABECALHO, "2026-10-01,mentorque.app,22,0,0,0,23,3,200,22,5,3", "2026-10-02,mentorque.app,19,0,0,0,20,1,218,19,2,1"].join("\n");

  const lido = leInstalacoes(CSV);
  conferir("le as duas linhas", lido.ok && lido.dias.length === 2, JSON.stringify(lido));
  conferir("e soma as instalacoes", lido.ok && lido.total === 41, JSON.stringify(lido.ok && lido.total));
  conferir("e traz a janela", lido.ok && lido.de === "2026-10-01" && lido.ate === "2026-10-02", JSON.stringify(lido));
  conferir(
    "e le a desinstalacao da coluna que o Play AINDA alimenta (user), nao da zerada (device)",
    lido.ok && lido.dias[0]?.desinstalacoes === 3,
    JSON.stringify(lido.ok && lido.dias[0]),
  );
  conferir("e le a base instalada do dia", lido.ok && lido.dias[1]?.ativos === 218, JSON.stringify(lido.ok && lido.dias[1]));
  conferir("e a base instalada do pacote e a do ULTIMO dia, porque e estoque", lido.ok && lido.ativosNoFim === 218);

  // UTF-16: o nulo entre as letras. Este e o caso que, sem tratamento, devolve
  // zero linha e vira "o mes nao teve instalacao" no retrato.
  const utf16 = "\uFEFF" + CSV.split("").join("\u0000");
  const lidoUtf16 = leInstalacoes(utf16);
  conferir("arquivo UTF-16 e lido, nao vira mes vazio", lidoUtf16.ok && lidoUtf16.total === 41, JSON.stringify(lidoUtf16));
  conferir("destextoUtf16 tira a marca de ordem de bytes", !destextoUtf16("\uFEFFabc").startsWith("\uFEFF"));

  // IDIOMA: o mesmo relatorio em portugues tem que ser lido igual.
  const EM_PT = ["Data,Nome do pacote,Instalações diárias de dispositivos,Desinstalações diárias de usuários,Instalações ativas de dispositivos",
                 "2026-10-01,mentorque.app,22,3,200"].join("\n");
  const lidoPt = leInstalacoes(EM_PT);
  conferir("o mesmo relatorio em portugues e lido igual", lidoPt.ok && lidoPt.total === 22 && lidoPt.dias[0]?.desinstalacoes === 3 && lidoPt.ativosNoFim === 200, JSON.stringify(lidoPt));
  conferir("achaColuna ignora acento e caixa", achaColuna(["Instalações Diárias de Dispositivos"], ["instalacoes diarias de dispositivos"]) === 0);

  // FORMATO DESCONHECIDO NAO VIRA ZERO, que e a regra inteira deste arquivo.
  const estranho = leInstalacoes("Coluna A,Coluna B\n1,2");
  conferir("cabecalho que eu nao reconheco NAO vira zero", estranho.ok === false, JSON.stringify(estranho));
  conferir("e devolve o cabecalho que chegou, para a proxima rodada ler", !estranho.ok && estranho.cabecalho.length === 2, JSON.stringify(estranho));
  conferir("arquivo vazio tambem nao vira zero", leInstalacoes("").ok === false);
  conferir("nulo tambem nao", leInstalacoes(null).ok === false);
  const soCabecalho = leInstalacoes(CABECALHO);
  conferir("cabecalho reconhecido sem linha diz isso, e nao total zero", soCabecalho.ok === false, JSON.stringify(soCabecalho));

  // O ARQUIVO MAIS NOVO vem do nome, nao da ordem da listagem: o relatorio e
  // MENSAL e a API nao promete ordem nenhuma.
  //
  // E O BUCKET E DA CONTA, NAO DO APP (04/10/2026): a primeira listagem real
  // trouxe 200 arquivos de dois OUTROS apps do dono, e o seletor gravou o
  // setembro de `com.appfactory.minhanotafinanceira` como zero instalacao do
  // Mentorque, com `ok: true`. Mes mais novo de outro app e o app errado.
  const nomes = [
    "stats/installs/installs_mentorque.app_202608_overview.csv",
    "stats/installs/installs_com.appfactory.minhanotafinanceira_202611_overview.csv",
    "stats/installs/installs_mentorque.app_202610_overview.csv",
    "stats/installs/installs_mentorque.app_202609_overview.csv",
    "stats/installs/installs_mentorque.app_202610_country.csv",
  ];
  conferir(
    "escolhe o mes mais novo pelo NOME, nao pela ordem da lista, e so DESTE app",
    arquivoMaisNovo(nomes, "_overview.csv", PACOTE_ANDROID) === "stats/installs/installs_mentorque.app_202610_overview.csv",
    String(arquivoMaisNovo(nomes, "_overview.csv", PACOTE_ANDROID)),
  );
  conferir("e sem arquivo do sufixo devolve nulo", arquivoMaisNovo(nomes, "_nao_existe.csv", PACOTE_ANDROID) === null);
  conferir(
    "listagem so com apps vizinhos devolve nulo, nunca o vizinho mais novo",
    arquivoMaisNovo(nomes.filter((n) => !n.includes("mentorque")), "_overview.csv", PACOTE_ANDROID) === null,
  );
  conferir("o pacote e o do capacitor.config.ts", /appId: "mentorque\.app"/.test(readFileSync(new URL("../capacitor.config.ts", import.meta.url), "utf8")) && PACOTE_ANDROID === "mentorque.app");
  conferir("um nome com o pacote dentro de outro nao engana", !arquivoEhDoApp("stats/installs/installs_mentorque.appfactory_202610_overview.csv", PACOTE_ANDROID));

  // A ROTA USA A REGRA. Criterio 10: conserto na fonte que o consumidor nao usa
  // nao e conserto.
  const rotaPlay = readFileSync(new URL("../app/api/metricas/route.ts", import.meta.url), "utf8");
  conferir("a rota importa o leitor do Play", /from "@\/lib\/playRelatorios"/.test(rotaPlay));
  conferir("e le o CSV na fonte play_downloads", /fonte === "play_downloads"/.test(rotaPlay) && /leInstalacoes\(csv\)/.test(rotaPlay));
  // Quem escolhe o arquivo e um no de codigo do n8n, que nada confere. Entao a
  // rota confere o pacote DE NOVO, e recusa o arquivo do app vizinho antes de
  // ler uma linha dele.
  conferir(
    "e recusa arquivo de outro app da conta antes de ler o CSV",
    /arquivoEhDoApp\(arquivo, PACOTE_ANDROID\)/.test(rotaPlay) && /arquivo de OUTRO app da conta/.test(rotaPlay),
    "sem isso o setembro do app vizinho vira zero instalacao nossa com ok: true, como em 04/10",
  );
  conferir(
    "e o erro da LISTAGEM ganha do sintoma na hora de explicar",
    /a listagem do bucket falhou/.test(rotaPlay) && /dados\.erroDaListagem/.test(rotaPlay),
    "na primeira execucao real a rota gravou 'arquivo vazio' e a causa era 'Credentials not found'",
  );
  conferir(
    "e grava `naoLi` com o cabecalho quando nao reconhece",
    /: lido\.formatoDesconhecido/.test(rotaPlay) && /cabecalho: lido\.cabecalho/.test(rotaPlay),
    "sem isso o mes que a rota nao entendeu vira instalacao zero no retrato",
  );
}

// ── A LISTA DE FONTES ESTA EM DOIS LUGARES (03/10/2026) ────────────────────
//
// POR QUE ISTO EXISTE, e o caso tem menos de uma hora: o `appsflyer` entrou no
// `Set` da rota `/api/metricas` e NAO entrou na clausula `check` da tabela. A
// rota aceitou o pacote, o banco recusou, e a resposta foi 500
// `gravacao_falhou`. O coletor teria gravado nada todo dia, em silencio, se a
// execucao nao tivesse sido conferida na hora.
//
// E a mesma forma da lista de destinos da `acoes-do-dono`, que a
// `conferir:agentes` ja cobre: duas copias da mesma lista divergem caladas. O
// teste e a intersecao EXATA, nos dois sentidos.
{
  const rota = readFileSync(new URL("../app/api/metricas/route.ts", import.meta.url), "utf8");
  const sql = readFileSync(new URL("../supabase/metricas_diarias.sql", import.meta.url), "utf8");

  const doCodigo = [...(rota.match(/const FONTES = new Set\(\[([\s\S]*?)\]\)/)?.[1] ?? "").matchAll(/"([a-z_]+)"/g)].map((m) => m[1]!);
  const doBanco = [...(sql.match(/check \(fonte in \(([\s\S]*?)\)\)/)?.[1] ?? "").matchAll(/'([a-z_]+)'/g)].map((m) => m[1]!);

  conferir("a lista de fontes existe no codigo", doCodigo.length >= 10, doCodigo.join(", "));
  conferir("e existe no arquivo de esquema", doBanco.length >= 10, doBanco.join(", "));
  const soNoCodigo = doCodigo.filter((f) => !doBanco.includes(f));
  const soNoBanco = doBanco.filter((f) => !doCodigo.includes(f));
  conferir(
    "e as duas listas de fontes sao a MESMA",
    soNoCodigo.length === 0 && soNoBanco.length === 0,
    `so no codigo: ${soNoCodigo.join(", ") || "nenhuma"}; so no banco: ${soNoBanco.join(", ") || "nenhuma"}. ` +
      "fonte so no codigo e 500 gravacao_falhou todo dia, em silencio",
  );
  conferir("e a appsflyer esta nas duas", doCodigo.includes("appsflyer") && doBanco.includes("appsflyer"));
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) da escada de aquisição reprovaram.`);
  process.exit(1);
}
console.log("Aquisição: um dono por degrau, o que falta diz que falta, e as recusas viajam com o número.");
