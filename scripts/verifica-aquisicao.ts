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

if (falhas) {
  console.error(`\n${falhas} conferência(s) da escada de aquisição reprovaram.`);
  process.exit(1);
}
console.log("Aquisição: um dono por degrau, o que falta diz que falta, e as recusas viajam com o número.");
