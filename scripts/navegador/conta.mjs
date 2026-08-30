// "Salve sua garagem": o convite a criar conta logo depois do primeiro carro.
//
// O caminho é dirigido de ponta a ponta de propósito (busca o modelo, escolhe
// o ano, salva), em vez de disparar o evento na mão. O elo que pode quebrar em
// silêncio é justamente a LIGAÇÃO entre salvar o carro e a folha aparecer, e
// só o caminho inteiro prova essa ligação.
//
// O defeito que este arquivo existe para impedir já aconteceu, na primeira
// escrita da folha em 30/08: ela lia uma marca no sessionStorage num efeito de
// montagem. Como a folha é montada junto com o app, o efeito rodava ANTES de
// existir carro nenhum, e o convite nunca apareceria — sem erro, sem log, sem
// nada. Foi trocado por evento (o mesmo desenho da folha de estrelas).
import { garagem, abrirApp } from "./base.mjs";

export const nome = "conta";
export const sobre = "quem cadastra carro como convidado recebe o convite a salvar a garagem";

export async function rodar({ nav, ok }) {
  const b = await abrirApp(nav, {
    sessao: garagem({ semCarro: true, startedAt: "2026-01-01" }),
    chaves: { "mq-primeiro-quiz-nao": "1" },
  });

  // Vai para a garagem vazia e começa o cadastro.
  await b.pg.getByRole("button", { name: /^Carros$/i }).first().click();
  await b.pg.waitForTimeout(1200);
  await b.pg.locator("main button, main a").filter({ hasText: /Adicionar|Cadastrar/i }).first().click();
  await b.pg.waitForTimeout(1200);

  // Campo único de busca (marca + modelo) e a primeira sugestão.
  const busca = b.pg.locator("main input").first();
  await busca.click();
  await busca.fill("Golf");
  await b.pg.waitForTimeout(1200);
  const sugestao = b.pg.locator("main button").filter({ hasText: /Golf/i }).first();
  ok("a busca de modelo sugere algo", (await sugestao.count()) > 0);
  await sugestao.click();
  await b.pg.waitForTimeout(800);

  // Ano: o <select> do formulário.
  const ano = b.pg.locator("main select").first();
  if (await ano.count()) await ano.selectOption({ index: 1 });
  await b.pg.waitForTimeout(500);

  const salvar = b.pg.locator("main button").filter({ hasText: /^Salvar|Adicionar/i }).last();
  await salvar.click();
  await b.pg.waitForTimeout(2500);

  const corpo = await b.corpo();
  ok("o convite a salvar a garagem aparece", /Salve sua garagem/i.test(corpo), corpo.replace(/\n/g, " | ").slice(0, 200));
  ok("o convite cita o carro cadastrado", /Golf/i.test(corpo));
  ok("o convite leva a criar conta", /Criar minha conta/i.test(corpo));

  // DÁ PARA DIZER NÃO: o app funciona como convidado por contrato (Termos,
  // seção 3). Um convite que não fecha seria uma parede de cadastro disfarçada.
  const agoraNao = b.pg.locator("button").filter({ hasText: /Agora não/i }).first();
  ok("o convite pode ser recusado", (await agoraNao.count()) > 0);
  if (await agoraNao.count()) {
    await agoraNao.click();
    await b.pg.waitForTimeout(800);
    ok("recusar fecha o convite", !/Salve sua garagem/i.test(await b.corpo()));
  }

  ok("nenhum erro de página no caminho", b.erros.length === 0, b.erros[0] ?? "");
  await b.fechar();
}
