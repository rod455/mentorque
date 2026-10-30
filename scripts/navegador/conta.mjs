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
import { garagem, abrirApp, BASE, ESPERA_DE_ABERTURA } from "./base.mjs";

export const nome = "conta";
export const sobre = "quem cadastra carro como convidado recebe o convite a salvar a garagem, e o recusante antigo com algo a perder recebe o segundo pedido";

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

  // ---- 3. O SEGUNDO PEDIDO ALCANÇA O RECUSANTE DE ANTES DO CONTADOR --------
  //
  // Revisão de 30/10/2026. A primeira escrita do repique exigia o contador de
  // recusas, que só nasce com ela: os 225 recusantes que motivaram a aposta
  // não têm contador e nunca seriam perguntados de novo, e a conferência de
  // linha de comando passava verde porque cada caso dela começava recusando.
  // Aqui o aparelho é o de antes: convidado, com carro e com um serviço, sem
  // contador nenhum. Ele abre o app e a folha tem de aparecer sozinha, sem
  // cadastro de carro, etiquetada como repique.
  {
    const eventos = [];
    const comServico = () =>
      garagem({
        startedAt: "2026-01-01",
        services: [{ id: "s1", vehicleId: "v1", type: "oil", date: "2026-09-01", km: 90000, total: 320, parts: [], notes: "" }],
      });
    // Abre primeiro o site e só depois o app: o convite sai na abertura, e o
    // ouvido do funil tem de estar ligado antes dela. Recarregar o app não
    // serve, porque a recarga reescreve a chave vazia por cima do repique que
    // a primeira abertura gastou.
    const b = await abrirApp(nav, { sessao: comServico(), chaves: { ...CHAVES, "mq-conta-repique": "" }, rota: "/" });
    b.pg.on("request", (r) => {
      if (!r.url().includes("/api/funil")) return;
      try { eventos.push(JSON.parse(r.postData() ?? "{}")); } catch { /* corpo que não é JSON */ }
    });
    await b.pg.goto(BASE + "/app", { waitUntil: "domcontentloaded" });
    await b.pg.waitForTimeout(ESPERA_DE_ABERTURA);
    ok("o recusante antigo com algo a perder recebe o segundo pedido ao abrir", /Salve sua garagem/i.test(await b.corpo()));
    const convites = eventos.filter((e) => e.evento === "convite_conta");
    ok(
      "e o convite sai etiquetado como repique",
      convites.length === 1 && convites[0].detalhe === "repique",
      JSON.stringify(convites.map((e) => e.detalhe)),
    );
    const agoraNao = b.pg.locator("button").filter({ hasText: /Agora não/i }).first();
    if (await agoraNao.count()) await agoraNao.click();
    await b.pg.waitForTimeout(800);
    const recusa = eventos.filter((e) => e.evento === "recusou_convite_conta");
    ok(
      "recusar o repique conta como o segundo não",
      recusa.length === 1 && recusa[0].detalhe === "botao-2",
      JSON.stringify(recusa.map((e) => e.detalhe)),
    );
    ok("nenhum erro de página no segundo pedido", b.erros.length === 0, b.erros[0] ?? "");
    await b.fechar();
  }

  // ---- 4. O OUTRO LADO: O MESMO APARELHO, COM O REPIQUE JÁ GASTO -----------
  //
  // Sem este degrau, uma folha que abrisse para todo convidado com serviço
  // passaria verde no degrau 3.
  {
    const b = await abrirApp(nav, {
      sessao: garagem({
        startedAt: "2026-01-01",
        services: [{ id: "s1", vehicleId: "v1", type: "oil", date: "2026-09-01", km: 90000, total: 320, parts: [], notes: "" }],
      }),
      chaves: CHAVES,
    });
    ok("com o repique gasto, a folha não abre sozinha", !/Salve sua garagem/i.test(await b.corpo()));
    await b.fechar();
  }
}
