// Cadastrar uma moto, do botão "Moto" até o veículo gravado.
//
// POR QUE ESTA SUÍTE EXISTE (27/09/2026). Chegou um "Quero cadastrar minha
// moto" pelo suporte. O seletor Carro/Moto existia desde sempre e funcionava,
// mas duas coisas estavam de pé: o catálogo de moto tinha 37 modelos contra
// 235 de carro e não continha nenhum nome de tanque (quem digitava "Titan",
// que é o que está escrito na moto mais comum do Brasil, não achava nada), e a
// tela dizia "carro" do título à mensagem de busca vazia mesmo com Moto
// marcado. O banco concordava: 68 veículos cadastrados, NENHUM do tipo moto.
//
// Nada disso aparecia em conferência nenhuma. `conferir:frota` só olhava o
// catálogo de carro, e nenhuma suíte de navegador dirigia este formulário: a
// suíte `carro` semeia uma moto pronta no localStorage, o que prova que o app
// DESENHA uma moto, não que alguém consegue cadastrar uma.
//
// Por isso a pergunta aqui é a da pessoa, não a do código: eu escolho Moto,
// digito o nome que está no tanque, e a moto entra na garagem?
//
// O QUE ELA NÃO ALCANÇA: a WebView do aparelho. Isto roda em Chromium de
// mesa com viewport de celular.
import { garagem, dia, abrirApp } from "./base.mjs";

export const nome = "moto";
export const sobre = "cadastrar moto, do seletor até o veículo gravado";

// Garagem vazia: é a situação de quem acabou de instalar e vem cadastrar.
// `mq-primeiro-quiz-nao` tira a folha do primeiro quiz da frente.
const SESSAO = garagem({ semCarro: true, startedAt: dia(0) });
const CHAVES = { "mq-primeiro-quiz-nao": "1" };

async function abrirFormulario(nav) {
  // `?ir=addCar` é a mesma porta que os e-mails da jornada usam
  // (lib/app/destinoDoLink.ts), então abrir por aqui não inventa caminho.
  const app = await abrirApp(nav, { sessao: SESSAO, chaves: CHAVES, rota: "/app?ir=addCar" });
  return app;
}

/** O caminho inteiro: escolher Moto, buscar pelo tanque, salvar. */
async function cadastrarPeloNomeDoTanque(nav, ok) {
  const app = await abrirFormulario(nav);
  const { pg } = app;

  // ---- 1. o seletor existe e é alcançável ---------------------------------
  const botaoMoto = pg.getByRole("button", { name: /^Moto$/ }).first();
  ok("o botão Moto está na tela de cadastro", (await botaoMoto.count()) > 0);
  await botaoMoto.click();
  await pg.waitForTimeout(400);

  // ---- 2. a tela passa a falar moto ---------------------------------------
  //
  // O defeito que trouxe o relato: com Moto escolhido a tela continuava
  // dizendo "carro", e a mensagem de busca vazia dizia "Nenhum CARRO
  // encontrado", que é uma resposta que manda a pessoa embora.
  const texto = await app.corpo();
  ok("com Moto escolhido o título fala de moto", /Adicionar moto/i.test(texto), texto.slice(0, 60));
  ok("com Moto escolhido o campo não pede um carro", !/Carro \(marca e modelo\)/i.test(texto));

  // ---- 3. a busca acha pelo nome do TANQUE --------------------------------
  //
  // "Titan" é o teste que importa: é o nome escrito na moto mais comum do
  // Brasil, e era exatamente o que não achava nada.
  const campo = pg.locator("input").first();
  await campo.click();
  await campo.fill("Titan");
  await pg.waitForTimeout(500);

  const semResultado = await pg.getByText(/Nenhum(a)? (moto|carro) encontrad/i).count();
  ok('digitar "Titan" devolve alguma moto', semResultado === 0);

  const sugestao = pg.getByRole("button", { name: /Titan/i }).first();
  ok('a sugestão de "Titan" aparece na lista', (await sugestao.count()) > 0);
  await sugestao.click();
  await pg.waitForTimeout(400);

  // ---- 4. o resto do formulário aceita a moto -----------------------------
  // O ano é um <select>, e sem ele `valid` é falso e o Salvar fica desligado.
  await pg.locator("select").first().selectOption("2020");
  await pg.waitForTimeout(300);

  const salvar = pg.getByRole("button", { name: /^(Salvar|Cadastrar|Adicionar)/i }).last();
  ok("o botão de salvar está disponível", (await salvar.count()) > 0);
  await salvar.click();
  await pg.waitForTimeout(1500);

  // ---- 5. a moto ENTROU, e entrou como moto -------------------------------
  //
  // Este é o passo que prova. Ver a tela mudar não basta: o que interessa é o
  // `type` gravado, porque é ele que faz a consulta de preço ir para o
  // catálogo de motos da FIPE e o app desenhar o ícone certo.
  const sessao = await app.sessaoGravada();
  const veiculos = sessao?.vehicles ?? [];
  const moto = veiculos.find((v) => v?.type === "moto");
  ok("a moto foi gravada na garagem", !!moto, `veículos: ${JSON.stringify(veiculos.map((v) => `${v.type} ${v.make} ${v.model}`))}`);
  ok("o veículo gravado é do tipo moto", moto?.type === "moto", String(moto?.type));
  ok("o modelo gravado é o que foi escolhido", /Titan/i.test(moto?.model ?? ""), moto?.model ?? "");

  ok("nenhum erro de página no cadastro de moto", app.erros.length === 0, app.erros[0] ?? "");
  await app.fechar();
}

/** Trocar de volta para Carro não pode deixar a tela meio moto. */
async function voltarParaCarroLimpaTudo(nav, ok) {
  const app = await abrirFormulario(nav);
  const { pg } = app;

  await pg.getByRole("button", { name: /^Moto$/ }).first().click();
  await pg.waitForTimeout(300);
  const campo = pg.locator("input").first();
  await campo.click();
  await campo.fill("Titan");
  await pg.waitForTimeout(400);
  await pg.getByRole("button", { name: /Titan/i }).first().click().catch(() => {});
  await pg.waitForTimeout(300);

  await pg.getByRole("button", { name: /^Carro$/ }).first().click();
  await pg.waitForTimeout(400);

  const texto = await app.corpo();
  ok("voltar para Carro traz o título de carro de volta", /Adicionar carro/i.test(texto));
  const valor = await campo.inputValue();
  ok("voltar para Carro limpa a moto que estava escolhida", !/Titan/i.test(valor), valor);

  ok("nenhum erro de página ao trocar de tipo", app.erros.length === 0, app.erros[0] ?? "");
  await app.fechar();
}

export async function rodar({ nav, ok }) {
  await cadastrarPeloNomeDoTanque(nav, ok);
  await voltarParaCarroLimpaTudo(nav, ok);
}
