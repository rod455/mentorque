// O frescor das fontes externas, conferido sem banco e sem rede.
//
// Esta conferência nasce de um caso real (01/09/2026): a coleta de métricas
// externas morreu em 23/08 e o retrato diário seguiu nove dias imprimindo
// aqueles pacotes como se fossem de hoje. O relatório do Diretor quase
// publicou "Stripe: 0 assinaturas" com dois clientes reais pagando.
//
// Rode com: npm run conferir:frescor
import { readFileSync } from "node:fs";
import {
  DIAS_ATE_PARADA,
  avisoDeColeta,
  frescorDasFontes,
  type PacoteDeFonte,
} from "../lib/frescorDasFontes.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

const HOJE = "2026-09-01";
const p = (fonte: string, dia: string): PacoteDeFonte => ({ fonte, dia });

// ── o caso real ─────────────────────────────────────────────────────────────
{
  const linhas = ["stripe", "revenuecat", "vercel"].map((f) => p(f, "2026-08-23"));
  const r = frescorDasFontes(linhas, HOJE);

  conferir("conta os 9 dias parados", r.every((f) => f.diasParado === 9), JSON.stringify(r));
  conferir("marca todas como paradas", r.every((f) => f.parada));

  const aviso = avisoDeColeta(r);
  conferir("o aviso existe", aviso !== null);
  conferir("o aviso diz há quantos dias", (aviso ?? "").includes("9 dias"), aviso ?? "");
  conferir(
    "o aviso avisa que os valores NÃO são de hoje",
    /não de hoje/i.test(aviso ?? ""),
    aviso ?? "",
  );
}

// ── coleta em dia não vira aviso ────────────────────────────────────────────
{
  const r = frescorDasFontes([p("stripe", HOJE), p("vercel", "2026-08-31")], HOJE);
  conferir("fonte de hoje tem 0 dias", r.find((f) => f.fonte === "stripe")?.diasParado === 0);
  conferir("nenhuma está parada", r.every((f) => !f.parada));
  conferir(
    "sem nada parado, não existe aviso (aviso diário vira paisagem)",
    avisoDeColeta(r) === null,
    String(avisoDeColeta(r)),
  );
}

// ── o limiar ────────────────────────────────────────────────────────────────
{
  const noLimite = frescorDasFontes([p("x", "2026-08-30")], HOJE)[0]; // 2 dias
  const passou = frescorDasFontes([p("x", "2026-08-29")], HOJE)[0]; // 3 dias
  conferir(`${DIAS_ATE_PARADA} dias ainda não é parada`, noLimite.parada === false, JSON.stringify(noLimite));
  conferir(`${DIAS_ATE_PARADA + 1} dias já é parada`, passou.parada === true, JSON.stringify(passou));
}

// ── só a fonte parada é denunciada ──────────────────────────────────────────
{
  const r = frescorDasFontes([p("stripe", HOJE), p("youtube", "2026-08-10")], HOJE);
  const aviso = avisoDeColeta(r) ?? "";
  conferir("a parada aparece no aviso", aviso.includes("youtube"), aviso);
  conferir("a fresca NÃO aparece no aviso", !aviso.includes("stripe"), aviso);
  conferir("a parada vem primeiro na lista", r[0].fonte === "youtube", r.map((f) => f.fonte).join(", "));
}

// ── mais de um pacote por fonte: vale o mais novo ───────────────────────────
{
  const r = frescorDasFontes(
    [p("stripe", "2026-08-20"), p("stripe", "2026-08-31"), p("stripe", "2026-08-25")],
    HOJE,
  );
  conferir("usa o pacote mais recente da fonte", r[0].ultimoDia === "2026-08-31", JSON.stringify(r));
  conferir("uma linha por fonte", r.length === 1);
}

// ── lixo não derruba ────────────────────────────────────────────────────────
{
  const sujo = [p("stripe", HOJE), { fonte: "", dia: HOJE }, { fonte: "x", dia: "" }] as PacoteDeFonte[];
  const r = frescorDasFontes(sujo, HOJE);
  conferir("linha sem fonte ou sem dia é ignorada", r.length === 1 && r[0].fonte === "stripe", JSON.stringify(r));
  conferir("lista vazia não quebra nem inventa aviso", frescorDasFontes([], HOJE).length === 0 && avisoDeColeta([]) === null);
}

// ── E QUEM USA A REGRA: o retrato diário (critério 10, achado em 10/10/2026) ─
//
// Este arquivo provava a regra do frescor com números e não olhava uma linha de
// quem a chama. Medido plantando no consumidor: apaguei a linha
// `avisoDeColeta: avisoDeColeta(frescor)` do `lib/operacao.ts` e não só esta
// conferência passou verde, a CORRENTE INTEIRA do `npm run conferir` passou,
// saída 0.
//
// E o que isso reabre é o caso de 01/09/2026 que fez este arquivo nascer: a
// coleta morreu em 23/08 e o retrato seguiu nove dias imprimindo aqueles
// pacotes como se fossem de hoje, até quase publicar "Stripe: 0 assinaturas"
// com dois clientes pagando. A regra que denuncia a fonte parada não serve de
// nada se o retrato não publicar a denúncia: quem lê o retrato não chama
// função nenhuma, ele lê campo.
//
// Conferência de texto, como a irmã dela na `conferir:anomalias`, e pela mesma
// razão: o retrato de verdade depende de banco. Ela aponta o ELO (a chamada com
// o argumento que decide, e o campo no JSON), não o nome da função solto.
{
  const retrato = readFileSync(new URL("../lib/operacao.ts", import.meta.url), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/.*$/gm, " ");

  conferir(
    "o retrato diário calcula o frescor das fontes",
    /frescorDasFontes\(\s*metricas[^)]*\)/.test(retrato),
    "sem a chamada, nenhuma fonte parada é medida e o retrato imprime pacote velho como atual",
  );
  conferir(
    "o retrato publica o aviso de coleta parada",
    /\n\s*avisoDeColeta:\s*avisoDeColeta\(/.test(retrato),
    "calcular e não publicar é o mesmo que não calcular: quem lê o retrato lê campo, não chama função",
  );
  conferir(
    "e publica o frescor por fonte, não só o aviso",
    /\n\s*frescorDasFontes:/.test(retrato),
    "sem a lista por fonte, o leitor vê que algo parou e não vê o quê nem desde quando",
  );
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) de frescor reprovaram.`);
  process.exit(1);
}
console.log("Frescor: fonte parada é denunciada com a idade, e coleta em dia fica quieta.");
