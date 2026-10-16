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
// existir carro nenhum, e o convite nunca apareceria, sem erro, sem log, sem
// nada. Foi trocado por evento (o mesmo desenho da folha de estrelas).
//
// DOIS DESFECHOS, DOIS APARELHOS (16/10/2026). O convite tem duas saídas e as
// duas precisam de folha aberta: criar a conta e dizer "Agora não". Depois de
// qualquer uma delas a folha não volta, então cada desfecho roda num aparelho
// novo, com o caminho do carro andado de novo. Juntar os dois num aparelho só
// faria o segundo degrau passar verde sem folha na frente.
import { garagem, abrirApp } from "./base.mjs";

export const nome = "conta";
export const sobre = "quem cadastra carro como convidado recebe o convite a salvar a garagem";

const SESSAO = () => garagem({ semCarro: true, startedAt: "2026-01-01" });
const CHAVES = { "mq-primeiro-quiz-nao": "1" };
const MARCA = "mq-veio-salvar-garagem";

/** Abre um aparelho novo e cadastra um carro como convidado, até a folha. */
async function atePedirConta(nav, ok, { rotular }) {
  const b = await abrirApp(nav, { sessao: SESSAO(), chaves: CHAVES });

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
  if (rotular) ok("a busca de modelo sugere algo", (await sugestao.count()) > 0);
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
  if (rotular) {
    ok("o convite a salvar a garagem aparece", /Salve sua garagem/i.test(corpo), corpo.replace(/\n/g, " | ").slice(0, 200));
    ok("o convite cita o carro cadastrado", /Golf/i.test(corpo));
    ok("o convite leva a criar conta", /Criar minha conta/i.test(corpo));
  }
  return b;
}

export async function rodar({ nav, ok }) {
  // ---- 1. O BOTÃO PROMETE CRIAR CONTA, E A TELA SEGUINTE TEM QUE CRIAR -----
  //
  // Aposta conta-que-sabe-que-veio-do-carro (16/10/2026). Até aqui o toque em
  // "Criar minha conta" abria a tela de ENTRAR: sem campo de nome, botão
  // escrito "Entrar" e o herói repetindo a mesma frase que a folha acabou de
  // dizer. Medido no banco em 16/10: uns 100 aparelhos por semana cadastram
  // carro como convidado e nunca criam conta, e nenhum deles cria a conta mais
  // de uma hora depois do carro.
  //
  // Os degraus abaixo cobram o CAMINHO, não a marca sozinha: marca gravada com
  // a tela errando o modo continuaria reprovando aqui.
  {
    const b = await atePedirConta(nav, ok, { rotular: true });

    const antes = await b.pg.evaluate((k) => window.localStorage.getItem(k), MARCA);
    ok("antes do toque, nenhuma marca de convite", antes === null, String(antes));

    await b.pg.locator("button").filter({ hasText: /Criar minha conta/i }).first().click();
    await b.pg.waitForTimeout(1800);

    const marca = await b.pg.evaluate((k) => window.localStorage.getItem(k), MARCA);
    ok("tocar em criar conta deixa a marca do convite", marca !== null, String(marca));

    const login = await b.corpo();
    ok(
      "a tela de entrar abre em modo de CRIAR CONTA",
      /J[áa] tem conta/i.test(login) && !/N[ãa]o tem conta/i.test(login),
      login.replace(/\n/g, " | ").slice(0, 240),
    );
    ok(
      "e o herói fala do passo que salva a garagem",
      /passo que salva sua garagem/i.test(login),
      login.replace(/\n/g, " | ").slice(0, 240),
    );
    ok("e não repete a frase que a folha acabou de dizer", !/Salve sua garagem e cuide/i.test(login));
    ok("nenhum erro de página no caminho da conta", b.erros.length === 0, b.erros[0] ?? "");
    await b.fechar();
  }

  // ---- 2. O OUTRO LADO DA FRONTEIRA ----------------------------------------
  //
  // Num aparelho que nunca viu o convite, a tela de entrar continua nascendo
  // em "Entrar", com o texto de sempre. Sem este degrau, uma tela que abrisse
  // SEMPRE em criar conta passaria verde no degrau 1.
  //
  // ---- 2. DÁ PARA DIZER NÃO, E O OUTRO LADO DA FRONTEIRA -------------------
  //
  // O app funciona como convidado por contrato (Termos, seção 3). Um convite
  // que não fecha seria uma parede de cadastro disfarçada.
  //
  // E o mesmo aparelho serve para o lado negativo da aposta: depois de recusar,
  // ele chega à MESMA tela de entrar por outra porta, o paywall. Lá a tela tem
  // de nascer em "Entrar", com a frase de quem veio comprar. Sem este degrau,
  // uma tela que abrisse SEMPRE em criar conta passaria verde no degrau 1.
  //
  // POR QUE O PAYWALL E NÃO O PERFIL: o cartão "Entrar no Mentorque" do Perfil
  // só é desenhado quando o login está configurado no ambiente, e na
  // conferência ele não está, então aquele caminho passaria sem alcançar a
  // tela. É o defeito de 18/09/2026, e o jeito de não repeti-lo é escolher uma
  // porta que esta conferência de fato atravessa.
  {
    const b = await atePedirConta(nav, ok, { rotular: false });
    const agoraNao = b.pg.locator("button").filter({ hasText: /Agora não/i }).first();
    ok("o convite pode ser recusado", (await agoraNao.count()) > 0);
    await agoraNao.click();
    await b.pg.waitForTimeout(800);
    ok("recusar fecha o convite", !/Salve sua garagem/i.test(await b.corpo()));
    const marca = await b.pg.evaluate((k) => window.localStorage.getItem(k), MARCA);
    ok("recusar NÃO deixa marca de convite", marca === null, String(marca));

    // O cadastro de carro termina na tela de Carros; o portão do Premium mora
    // no Início, então o caminho volta para lá antes de procurar por ele.
    await b.pg.getByRole("button", { name: /^Início$/i }).first().click();
    await b.pg.waitForTimeout(1200);
    const premium = b.pg.getByRole("button", { name: /Premium/i }).first();
    ok("o Início tem o portão do Premium", (await premium.count()) > 0);
    await premium.click();
    await b.pg.waitForTimeout(1500);
    const assinar = b.pg.getByRole("button", { name: /Começar 7 dias grátis/i }).first();
    ok("do paywall dá para pedir o teste grátis", (await assinar.count()) > 0);
    await assinar.click();
    await b.pg.waitForTimeout(1800);
    const tela = await b.corpo();
    ok(
      "por outra porta, a tela de entrar nasce em ENTRAR",
      /N[ãa]o tem conta/i.test(tela),
      tela.replace(/\n/g, " | ").slice(0, 240),
    );
    ok("e o herói não fala da garagem que acabou de ser salva", !/passo que salva sua garagem/i.test(tela));
    ok("nenhum erro de página no caminho da recusa", b.erros.length === 0, b.erros[0] ?? "");
    await b.fechar();
  }
}
