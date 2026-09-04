// O que a Biela recebe sobre o carro cabe no que a gente aceita pagar?
//
// POR QUE ISTO EXISTE. A partir de 04/09/2026 a pergunta que vai para a IA leva
// junto o histórico de serviços, o código OBD2 consultado e o sintoma em
// investigação. Isso conserta o buraco que fazia a Biela responder "pode ser
// bateria" para quem trocou a bateria há três meses, e abre dois riscos novos:
//
//   1. CONTA. O contexto viaja em TODA pergunta, e cada token é pago por nós.
//      Sem teto, quem usa o app há um ano manda o histórico inteiro toda vez.
//   2. BORDA PÚBLICA. A `/api/biela` aceita o que mandarem. O recorte do app não
//      protege nada contra um corpo forjado; quem protege é a revalidação na
//      rota, e é ela que esta conferência cobra.
//
// A regra de ouro aqui: o teto do app pode ser mais apertado que o da rota,
// nunca mais frouxo. Se um dia alguém afrouxar a rota, a conta cresce em
// silêncio, sem defeito visível em tela nenhuma.
//
// Rode com: npm run conferir:contexto
import { readFileSync } from "node:fs";
import { contextoDoCarro, servicosParaIA } from "../lib/app/contextoDoCarro.ts";
import type { ServiceRecord, Vehicle } from "../lib/app/types.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (!condicao) falhas++;
  console.log(`  ${condicao ? "✓" : "✗"} ${nome}${detalhe ? "  " + detalhe : ""}`);
}

const CARRO = { id: "v1", make: "VW", model: "Golf", year: 2014 } as unknown as Vehicle;
const dia = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
const servico = (i: number, quandoEmDias: number, extra: Partial<ServiceRecord> = {}) =>
  ({ id: `s${i}`, vehicleId: "v1", type: `servico ${i}`, date: dia(quandoEmDias), km: 1000 * i, parts: [], ...extra }) as ServiceRecord;

console.log("Contexto do carro que vai para a Biela:");

// ── 1. o recorte respeita quantidade e idade ────────────────────────────────
{
  const muitos = Array.from({ length: 20 }, (_, i) => servico(i, -i));
  const r = servicosParaIA(muitos, CARRO);
  conferir("no máximo 6 serviços", r.length === 6, `veio ${r.length}`);
  conferir("mais novo primeiro", r[0].em > r[5].em, `${r[0].em} vs ${r[5].em}`);

  const velhos = [servico(1, -800), servico(2, -900)];
  conferir("serviço velho fica de fora", servicosParaIA(velhos, CARRO).length === 0);
}

// ── 2. só o carro ativo ─────────────────────────────────────────────────────
//
// Sem isto, quem tem dois carros recebe a resposta do Golf contaminada pelo
// histórico do Uno, e o erro é invisível: a resposta parece só ruim.
{
  const deOutro = { ...servico(1, -5), vehicleId: "v2" } as ServiceRecord;
  const r = servicosParaIA([servico(2, -5), deOutro], CARRO);
  conferir("histórico de outro carro não entra", r.length === 1, `veio ${r.length}`);
}

// ── 3. as peças entram no texto ─────────────────────────────────────────────
//
// "revisão" não diz nada; "revisão (pastilhas)" diz que freio foi mexido, e é
// isso que faz a Biela não recomendar o que acabou de ser feito.
{
  const r = servicosParaIA([servico(1, -5, { type: "revisão", parts: [{ name: "pastilhas" }] })], CARRO);
  conferir("a peça trocada aparece", r[0].o.includes("pastilhas"), r[0].o);
}

// ── 4. código OBD2 inválido não passa ───────────────────────────────────────
{
  const ctx = contextoDoCarro({ servicos: [], veiculo: CARRO, obd2: ["P0300", "nao-e-codigo", "ZZZZZ"] });
  conferir("só código com formato válido entra", ctx?.obd2?.length === 1, JSON.stringify(ctx?.obd2));
}

// ── 5. sem nada útil, não manda contexto nenhum ─────────────────────────────
//
// Mandar `{}` custaria token e ainda faria a rota montar cabeçalho vazio.
{
  conferir("carro sem histórico não gera contexto", contextoDoCarro({ servicos: [], veiculo: CARRO }) === null);
  conferir("sem carro ativo não gera contexto", contextoDoCarro({ servicos: [servico(1, -1)], veiculo: null }) === null);
}

// ── 6. A ROTA REVALIDA, e com teto igual ou menor ───────────────────────────
//
// O app cortar não protege nada: quem chega na rota é o que alguém quis mandar.
{
  const rota = readFileSync(new URL("../app/api/biela/route.ts", import.meta.url), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/.*$/gm, " ");
  conferir("a rota tem teto de serviços", /MAX_SERVICOS\s*=\s*\d+/.test(rota));
  conferir("a rota corta o tamanho do texto", /MAX_TEXTO\s*=\s*\d+/.test(rota));
  conferir("a rota valida o formato do código", /CODIGO_OBD2\s*=\s*\/\^/.test(rota));
  conferir("a rota recorta a lista antes de usar", /\.slice\(0, MAX_SERVICOS\)/.test(rota));

  const tetoRota = Number((rota.match(/MAX_SERVICOS\s*=\s*(\d+)/) ?? [])[1]);
  const app = readFileSync(new URL("../lib/app/contextoDoCarro.ts", import.meta.url), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/.*$/gm, " ");
  const tetoApp = Number((app.match(/MAX_SERVICOS\s*=\s*(\d+)/) ?? [])[1]);
  conferir(
    "o teto do app não é mais frouxo que o da rota",
    Number.isFinite(tetoApp) && Number.isFinite(tetoRota) && tetoApp <= tetoRota,
    `app ${tetoApp}, rota ${tetoRota}`
  );
}

// ── 7. OS TESTES DE GARAGEM: segurança e conclusão ──────────────────────────
//
// A partir de 04/09/2026 os sintomas podem trazer `testes`, que é o que a
// pessoa faz SOZINHA antes de ir na oficina. Duas regras vieram junto com o
// campo, e conferência é o que as mantém de pé quando o próximo sintoma for
// escrito por outra pessoa (ou por um agente):
//
//   SEGURANÇA. Nada que peça para erguer o carro, abrir sistema pressurizado
//   quente ou pôr a mão perto de peça girando. Um teste de garagem que
//   machuca alguém é pior que nenhum teste, e ninguém vai reler o comentário
//   do tipo antes de escrever o próximo.
//
//   CONCLUSÃO. Todo teste diz o que fazer E o que o resultado significa. Sem
//   o `entao`, é tarefa sem desfecho: a pessoa faz, olha e continua sem saber.
{
  const { sintomas } = await import("../lib/app/conteudo/sintomas.ts");
  const { symptoms } = sintomas((a: string) => a);
  const comTeste = symptoms.filter((sx: { testes?: unknown[] }) => (sx.testes?.length ?? 0) > 0);
  conferir("existe sintoma com teste de garagem", comTeste.length > 0, `${comTeste.length} sintomas`);

  // Palavras que descrevem manobra perigosa para leigo. Deliberadamente
  // literais: a intenção aqui é reprovar cedo e o autor reescrever a frase.
  const PERIGO = /macac|erguer o carro|levantar o carro|motor ligado.*(correia|ventoinha|polia)|abra.*radiador|tampa do radiador/i;
  for (const sx of comTeste as { id: string; testes: { faca: string; entao: string }[] }[]) {
    for (const t of sx.testes) {
      conferir(`${sx.id}: o teste diz o que fazer`, t.faca.trim().length > 20, t.faca.slice(0, 40));
      conferir(`${sx.id}: e o que o resultado significa`, t.entao.trim().length > 30, t.entao.slice(0, 40));
      conferir(`${sx.id}: o teste não pede manobra perigosa`, !PERIGO.test(t.faca), t.faca.slice(0, 60));
    }
  }
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) do contexto reprovaram.`);
  process.exit(1);
}
console.log("Contexto: o que a Biela recebe do carro tem teto, e a rota revalida.");
