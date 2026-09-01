// O frescor das fontes externas, conferido sem banco e sem rede.
//
// Esta conferência nasce de um caso real (01/09/2026): a coleta de métricas
// externas morreu em 23/08 e o retrato diário seguiu nove dias imprimindo
// aqueles pacotes como se fossem de hoje. O relatório do Diretor quase
// publicou "Stripe: 0 assinaturas" com dois clientes reais pagando.
//
// Rode com: npm run conferir:frescor
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

if (falhas) {
  console.error(`\n${falhas} conferência(s) de frescor reprovaram.`);
  process.exit(1);
}
console.log("Frescor: fonte parada é denunciada com a idade, e coleta em dia fica quieta.");
