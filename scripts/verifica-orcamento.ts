// A análise de orçamento por foto: a parte pura e as ligações.
//
// O que ela protege (13/09/2026):
//   1. o limite do gratuito é o que o dono decidiu (2 por mês), e o Premium
//      não tem limite;
//   2. a resposta do modelo é lida mesmo suja (cerca de código, frase antes),
//      e o que ele inventa fora do molde é podado (tipo desconhecido, chave
//      de serviço inexistente, 40 itens);
//   3. a comparação com a faixa é NOSSA: só entra em item com serviço
//      conhecido e valor; o modelo nunca diz "caro";
//   4. o pedido ao modelo proíbe acusar a oficina e pede JSON só;
//   5. as ligações: rota, tela, navegação, funil, os três pontos de entrada.
//
// Rode com: npm run conferir:orcamento
import { readFileSync } from "node:fs";
import {
  LIMITE_GRATIS_POR_MES,
  compararComFaixas,
  extrairJson,
  mesDe,
  normalizarAnalise,
  notasParaHistorico,
  podeAnalisar,
  promptDaAnalise,
  servicoPrincipal,
} from "../lib/orcamento/analise.ts";
import { faixaDaRegiao } from "../lib/app/faixaDePreco.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}
const leia = (caminho: string) => readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8");

console.log("Orçamento por foto: o limite é o do dono, a leitura aguenta resposta suja, a comparação é nossa.");

// ── 1. o limite ─────────────────────────────────────────────────────────────
conferir("o limite do gratuito é 2 por mês (decisão do dono, 13/09/2026)", LIMITE_GRATIS_POR_MES === 2);
conferir("a primeira e a segunda análise do mês passam no gratuito", podeAnalisar(0, false) && podeAnalisar(1, false));
conferir("a terceira não passa no gratuito", !podeAnalisar(2, false));
conferir("o Premium não tem limite", podeAnalisar(2, true) && podeAnalisar(50, true));
conferir("o mês do limite é AAAA-MM em UTC", mesDe(new Date("2026-09-30T23:30:00-03:00")) === "2026-10" && mesDe(new Date("2026-09-01T12:00:00Z")) === "2026-09");
conferir("a tela mostra o mesmo limite que o servidor conta", /freeOrcamentosMes:\s*2\b/.test(leia("lib/app/premium.ts")));

// ── 2. a leitura da resposta ────────────────────────────────────────────────
const respostaSuja = 'Aqui está:\n```json\n{"ilegivel": false, "oficina": "Auto Center X", "total": "R$ 1.234,50", "itens": [{"descricao": "Troca de óleo 5w30", "tipo": "servico", "quantidade": 1, "valor": "280,00", "explicacao": "Lubrifica o motor.", "servico": "oil"}, {"descricao": "Pastilhas dianteiras", "tipo": "peca", "valor": 320, "explicacao": "Freiam o carro.", "atencao": "Pergunte a marca.", "servico": "brakes"}, {"descricao": "Coisa estranha", "tipo": "sei-la", "valor": -5, "explicacao": "x", "servico": "nao-existe"}, {"descricao": "", "tipo": "peca"}], "perguntas": ["Os discos foram medidos?", "Qual a marca da pastilha?"], "alerta": null}\n```\nQualquer coisa me avise.';
const lido = normalizarAnalise(extrairJson(respostaSuja));
conferir("lê o JSON dentro de cerca de código com frase antes e depois", !!lido);
conferir("o total em texto brasileiro vira número", lido?.total === 1234.5, String(lido?.total));
conferir("o valor em texto com vírgula vira número", lido?.itens[0]?.valor === 280, String(lido?.itens[0]?.valor));
conferir("item sem descrição some", lido?.itens.length === 3, String(lido?.itens.length));
conferir("tipo desconhecido vira outro, e chave de serviço inexistente some", lido?.itens[2]?.tipo === "outro" && lido?.itens[2]?.servico === undefined);
conferir("valor negativo some", lido?.itens[2]?.valor === undefined);
conferir("a oficina e as perguntas passam", lido?.oficina === "Auto Center X" && lido?.perguntas.length === 2);
conferir("texto sem objeto nenhum devolve null", extrairJson("não consegui ler") === null && normalizarAnalise(extrairJson("não consegui ler")) === null);
conferir("JSON vazio sem itens nem resumo devolve null", normalizarAnalise({ itens: [], perguntas: [] }) === null);
const ilegivel = normalizarAnalise({ ilegivel: true, itens: [], perguntas: [], resumo: "", alerta: null, oficina: null, total: null });
conferir("foto que não é orçamento vira ilegível, não null", ilegivel?.ilegivel === true && ilegivel.itens.length === 0);
const muitos = normalizarAnalise({ itens: Array.from({ length: 45 }, (_, i) => ({ descricao: `item ${i}`, tipo: "peca", explicacao: "" })), resumo: "x" });
conferir("mais de 30 itens são cortados em 30", muitos?.itens.length === 30, String(muitos?.itens.length));

// ── 3. a comparação é nossa ─────────────────────────────────────────────────
if (lido) {
  const comparado = compararComFaixas(lido, "SP", "campinas");
  const esperada = faixaDaRegiao("oil", "SP", "campinas")!;
  conferir("item com serviço conhecido e valor ganha a faixa da região", comparado.itens[0].faixa?.min === esperada.min && comparado.itens[0].faixa?.max === esperada.max);
  conferir("e a posição na faixa", ["abaixo", "dentro", "acima"].includes(comparado.itens[0].posicao ?? ""));
  conferir("item sem serviço conhecido não ganha faixa", comparado.itens[2].faixa === undefined);

  // A comparação é por SERVIÇO, somando as linhas (prova em produção de
  // 13/09: óleo, filtro e mão de obra marcados `oil`, cada um "abaixo").
  const tresLinhas = normalizarAnalise({
    resumo: "x",
    itens: [
      { descricao: "Óleo 5w30", tipo: "peca", valor: 180, explicacao: "", servico: "oil" },
      { descricao: "Filtro de óleo", tipo: "peca", valor: 45, explicacao: "", servico: "oil" },
      { descricao: "Mão de obra", tipo: "mao_de_obra", valor: 60, explicacao: "", servico: "oil" },
      { descricao: "Pastilhas", tipo: "peca", valor: 220, explicacao: "", servico: "brakes" },
    ],
  })!;
  const porServico = compararComFaixas(tresLinhas, null, null);
  conferir("as linhas do mesmo serviço são somadas antes de comparar", porServico.itens[0].somaDoServico === 285 && porServico.itens[0].posicao === "dentro", JSON.stringify(porServico.itens[0]));
  conferir("a faixa vai só na primeira linha do serviço", porServico.itens[1].faixa === undefined && porServico.itens[2].faixa === undefined);
  conferir("outro serviço tem a própria soma", porServico.itens[3].somaDoServico === 220 && porServico.itens[3].faixa !== undefined);
  conferir("o serviço principal é o de maior valor com referência", servicoPrincipal(comparado) === "brakes");
  const notas = notasParaHistorico(comparado);
  conferir("as notas para o histórico levam as linhas com valor", /Troca de óleo 5w30: R\$ 280/.test(notas) && notas.length <= 1500, notas.slice(0, 80));
}

// ── 4. o pedido ao modelo ───────────────────────────────────────────────────
const prompt = promptDaAnalise("pt", { make: "VW", model: "Gol", year: 2016, km: 98000, engine: "1.0" });
conferir("pede JSON só", /SOMENTE um JSON/.test(prompt));
conferir("proíbe acusar a oficina", /NUNCA diga que a oficina está enganando/.test(prompt));
conferir("lista as chaves de serviço com referência", /oil, airfilter, brakefluid, brakes, battery, revision, suspension, tires, timing/.test(prompt));
conferir("leva o carro da pessoa", /VW Gol 2016, 1\.0, 98000 km/.test(prompt));
conferir("o pedido em português não carrega travessão", !prompt.includes("—"));
conferir("existe a versão em inglês", /ONLY a JSON object/.test(promptDaAnalise("en", null)));

// ── 5. as ligações ──────────────────────────────────────────────────────────
{
  const rota = leia("app/api/orcamento/route.ts");
  conferir("a rota conta o limite antes de chamar o modelo", /podeAnalisar\(/.test(rota) && rota.indexOf("podeAnalisar(") < rota.indexOf("api.anthropic.com"));
  conferir("a rota confere o Premium no servidor, pela tabela, com o Bearer", /from\("subscriptions"\)/.test(rota) && /auth\.getUser\(bearer\)/.test(rota));
  conferir("a rota manda a imagem ao modelo", /type: "image"/.test(rota) && /base64/.test(rota));
  const insercao = rota.indexOf('from("orcamentos_analisados").insert(');
  conferir("a rota registra a análise sem a foto", insercao > 0 && !/imagem/.test(rota.slice(insercao)));
  conferir("o limite estourado responde 429", /status: 429/.test(rota));

  const tela = leia("components/app/screens/Orcamento.tsx");
  conferir("a tela emite analisou_orcamento com a origem", /funil\("analisou_orcamento",\s*\{[^}]*origem/.test(tela));
  conferir("a tela manda o Bearer quando há sessão", /authorization: `Bearer \$\{token\}`/.test(tela));
  conferir("a tela reduz a foto antes de mandar", /resizeImage\(file,\s*1600/.test(tela));
  conferir("estourar o limite leva ao Premium com o contexto certo", /ctx: "orcamento"/.test(tela) && /status === 429/.test(tela));
  conferir("a tela salva no histórico pré-preenchido", /name: "addService",\s*preset:/.test(tela) && /servicoPrincipal\(analise\)/.test(tela));

  conferir("a navegação conhece a tela", /name: "orcamento"/.test(leia("lib/app/nav.tsx")));
  conferir("o Shell desenha a tela", /case "orcamento": return <OrcamentoScreen/.test(leia("components/app/telas.tsx")));
  conferir("a tela tem aba", /orcamento: "problems"/.test(leia("components/app/Shell.tsx")));
  conferir("o checklist do sintoma leva ao orçamento", /name: "orcamento", origem: "checklist"/.test(leia("components/app/screens/Symptoms.tsx")));
  conferir("o registro de serviço leva ao orçamento", /name: "orcamento", origem: "servico"/.test(leia("components/app/screens/History.tsx")));
  conferir("a Biela leva ao orçamento", /name: "orcamento", origem: "biela"/.test(leia("components/app/screens/Biela.tsx")));
  conferir("o paywall tem o contexto orcamento", /orcamento: \{\s*title:/.test(leia("lib/app/content.ts")));

  for (const [arq, re] of [
    ["lib/app/funil.ts", /"analisou_orcamento"/],
    ["lib/funilCorreto.ts", /analisou_orcamento: "aparelho"/],
    ["lib/funilCorreto.ts", /analisou_orcamento: "sessao"/],
    ["lib/funilCorreto.ts", /analisou_orcamento: "2026-09-13"/],
    ["app/api/funil/route.ts", /"analisou_orcamento"/],
    ["supabase/funil_eventos.sql", /'analisou_orcamento'/],
  ] as const) {
    conferir(`o funil conhece analisou_orcamento em ${arq}`, re.test(leia(arq)));
  }
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) de orçamento reprovaram.`);
  process.exit(1);
}
console.log("Orçamento: duas análises grátis por mês, leitura que aguenta sujeira, comparação nossa, e a tela ligada nos três lugares.");
