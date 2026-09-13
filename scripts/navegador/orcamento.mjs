// A análise de orçamento por foto, do botão até o histórico.
//
// O modelo não roda aqui (sem chave no ambiente de conferência), e é de
// propósito: a rota em si é conferida por `conferir:orcamento` no que é pura,
// e a resposta do modelo é simulada nesta suíte, para a TELA ser provada com
// os três desfechos que ela tem: resultado, limite estourado, falha.
import { abrirApp, controlesForaDaTela, garagem } from "./base.mjs";

export const nome = "orcamento";
export const sobre = "a análise de orçamento por foto: foto, resultado, limite e salvar no histórico";

const RESPOSTA = {
  ok: true,
  restantes: 1,
  premium: false,
  analise: {
    oficina: "Auto Center Prova",
    total: 1234.5,
    ilegivel: false,
    resumo: "O orçamento troca o óleo e as pastilhas dianteiras do carro.",
    itens: [
      { descricao: "Troca de óleo 5w30", tipo: "servico", valor: 280, explicacao: "Lubrifica o motor.", servico: "oil", faixa: { min: 150, max: 450, regiao: "SP", especifica: false }, posicao: "dentro" },
      { descricao: "Pastilhas dianteiras", tipo: "peca", valor: 954.5, explicacao: "Freiam o carro.", atencao: "Pergunte a marca da peça.", servico: "brakes", faixa: { min: 250, max: 800, regiao: "SP", especifica: false }, posicao: "acima" },
    ],
    perguntas: ["Os discos foram medidos?", "Qual a marca da pastilha?"],
    alerta: null,
  },
};

/** Uma foto de orçamento desenhada na hora, para o input de arquivo. */
async function fotoDeOrcamento(nav) {
  const ctx = await nav.newContext({ viewport: { width: 800, height: 600 } });
  const pg = await ctx.newPage();
  await pg.setContent(`<body style="font-family:sans-serif;padding:40px"><h2>Auto Center Prova</h2>
    <table style="font-size:20px"><tr><td>Troca de óleo 5w30</td><td>R$ 280,00</td></tr>
    <tr><td>Pastilhas dianteiras</td><td>R$ 954,50</td></tr><tr><td><b>Total</b></td><td><b>R$ 1.234,50</b></td></tr></table></body>`);
  const buffer = await pg.screenshot({ type: "png" });
  await ctx.close();
  return { name: "orcamento.png", mimeType: "image/png", buffer };
}

export async function rodar({ nav, ok }) {
  const foto = await fotoDeOrcamento(nav);

  // 1. Da Biela até a tela, e a foto escolhida aparece.
  const app = await abrirApp(nav, { sessao: garagem({ state: "SP", city: "Campinas" }), rota: "/app?ir=biela" });
  const { pg } = app;
  await pg.getByRole("button", { name: /Analisar orçamento por foto/i }).first().click();
  await pg.waitForTimeout(800);
  ok("a Biela leva à tela do orçamento", /Entenda o orçamento/.test(await app.corpo()));
  ok("a tela pede a foto e diz o limite do gratuito", /Tirar foto ou escolher da galeria/.test(await app.corpo()) && /2 análises grátis/.test(await app.corpo()));
  await pg.locator('input[type="file"]').setInputFiles(foto);
  await pg.waitForTimeout(1500);
  ok("a foto escolhida aparece e o botão de analisar liga", (await pg.locator("main img").count()) >= 1 && (await pg.getByRole("button", { name: /^Analisar orçamento$/i }).isEnabled()));
  ok("nenhum controle fora da tela", (await controlesForaDaTela(pg)).length === 0, (await controlesForaDaTela(pg)).join("; "));

  // 2. A rota falha (sem chave aqui): a tela diz que não deu, e não some.
  await pg.route("**/api/orcamento", (r) => r.fulfill({ status: 502, contentType: "application/json", body: JSON.stringify({ error: "falhou", detalhe: "anthropic_401" }) }));
  await pg.getByRole("button", { name: /^Analisar orçamento$/i }).click();
  await pg.waitForTimeout(1200);
  ok("falha da rota vira aviso na tela, com a foto ainda lá", /Não deu para analisar agora/.test(await app.corpo()) && (await pg.locator("main img").count()) >= 1);

  // 3. O resultado: resumo, linhas, faixa, perguntas e os dois botões.
  await pg.unroute("**/api/orcamento");
  await pg.route("**/api/orcamento", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(RESPOSTA) }));
  await pg.getByRole("button", { name: /^Analisar orçamento$/i }).click();
  await pg.waitForTimeout(1500);
  const corpo = await app.corpo();
  ok("o resumo aparece", /troca o óleo e as pastilhas/.test(corpo));
  ok("as linhas aparecem com valor e explicação", /Troca de óleo 5w30/.test(corpo) && /R\$\s?280/.test(corpo) && /Lubrifica o motor/.test(corpo));
  ok("a faixa da região e a posição aparecem", /Na sua região: R\$\s?150 a R\$\s?450/.test(corpo) && /dentro da faixa/.test(corpo) && /acima da faixa/.test(corpo));
  ok("o item com atenção mostra a pergunta, sem acusar", /Vale perguntar: Pergunte a marca/.test(corpo) && !/enganad/i.test(corpo));
  ok("as perguntas para a oficina aparecem", /Os discos foram medidos\?/.test(corpo));
  // formatBRL arredonda para inteiro, como em todo o app: 1234,5 vira R$ 1.235.
  ok("o total e a oficina aparecem", /Total lido: R\$\s?1\.235/.test(corpo) && /Auto Center Prova/.test(corpo));
  ok("sobra 1 análise grátis, e a tela diz", /1 análises grátis restantes/.test(corpo));
  if (process.env.FOTO_DO_ORCAMENTO) await pg.screenshot({ path: process.env.FOTO_DO_ORCAMENTO, fullPage: true }).catch(() => undefined);

  // 4. Salvar no histórico chega ao formulário pré-preenchido.
  await pg.getByRole("button", { name: /Salvar no histórico/i }).click();
  await pg.waitForTimeout(1000);
  const tela = await app.corpo();
  ok("salvar abre o formulário de serviço", /Adicionar serviço/.test(tela));
  ok("com o serviço principal, a oficina e o total do orçamento", /Pastilhas|Freio/i.test(tela) && (await pg.locator('input[value="Auto Center Prova"]').count()) === 1 && (await pg.locator('input[value="1235"]').count()) === 1);
  await app.fechar();

  // 5. O limite estourado leva ao Premium com o contexto certo.
  const app2 = await abrirApp(nav, { sessao: garagem(), rota: "/app?ir=biela" });
  await app2.pg.route("**/api/orcamento", (r) => r.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ error: "limite", limite: 2, feitas: 2, restantes: 0 }) }));
  await app2.pg.getByRole("button", { name: /Analisar orçamento por foto/i }).first().click();
  await app2.pg.waitForTimeout(800);
  await app2.pg.locator('input[type="file"]').setInputFiles(foto);
  await app2.pg.waitForTimeout(1200);
  await app2.pg.getByRole("button", { name: /^Analisar orçamento$/i }).click();
  await app2.pg.waitForTimeout(1200);
  ok("limite estourado explica e oferece o Premium", /usou as 2 análises grátis/.test(await app2.corpo()) && (await app2.pg.getByRole("button", { name: /Analisar sem limite/i }).count()) === 1);
  await app2.pg.getByRole("button", { name: /Analisar sem limite/i }).click();
  await app2.pg.waitForTimeout(1000);
  // A tela do Premium é uma só para todos os contextos (o ctx vai para o
  // funil como origem); o que se prova é que ela abriu no lugar do orçamento.
  const depois = await app2.corpo();
  ok("e a tela do Premium abre no lugar do orçamento", /Premium/i.test(depois) && !/Entenda o orçamento/.test(depois));
  await app2.fechar();
}
