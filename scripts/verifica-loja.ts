// A venda da loja chega até o Premium, e quando não chega, grita?
//
// POR QUE ISTO EXISTE (02/10/2026). O QA achou em 30/09 que o RevenueCat saiu
// de zero para UMA assinatura ativa em 25/09 e o banco não conhece nenhuma.
// Cinco dias sem ninguém saber, e o que denunciou foi o descompasso entre duas
// fontes, não um alarme. Se for compra de gente de verdade, a pessoa pagou e
// está sem Premium desde então.
//
// O QUE ESTA CONFERÊNCIA PROTEGE:
//   1. a compra do onboarding sai COM identidade. `initPurchases(null)` ali é
//      a causa provável do caso de 25/09: sem `appUserID` e sem `logIn`, a
//      folha da Apple abre com o id anônimo do RevenueCat mesmo com a pessoa
//      logada;
//   2. o webhook NÃO perde a venda com um 200. Identidade inútil passou a
//      virar linha em `app_erros`, com o `app_user_id` que permite achar a
//      compra no painel e ligar o Premium na mão;
//   3. só evento COM DINHEIRO gera relato. Alarmar sobre `CANCELLATION` sem
//      conta ensinaria a ignorar o alarme, que é a lição de 19/09;
//   4. o retrato PUBLICA a contagem, senão a rede existe e ninguém olha, que
//      é o defeito que esta casa passou a semana de 28/09 consertando;
//   5. o upsert do Stripe não APAGA cupom e gclid quando não os conhece.
//
// O QUE ELA NÃO ALCANÇA, e é a metade que importa saber: nenhuma compra de
// loja de verdade passou por este código. As suítes rodam num Chromium sem
// Capacitor, então o caminho da Apple não é reproduzível daqui. Isto é teoria
// em produção até a próxima venda de loja, e a prova é ela.
//
// Rode com: npm run conferir:loja
import { readFileSync } from "node:fs";
import {
  ORIGEM_VENDA_SEM_CONTA,
  conferenciaDaLoja,
  ehVendaComDinheiro,
  identidadeUsavel,
  linhaDeVendaSemConta,
  relatoDeVendaSemConta,
} from "../lib/loja/vendaSemConta.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}
const semComentarios = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

console.log("Loja: a compra chega ao Premium, e quando não chega, deixa rastro?");

// ── 1. A IDENTIDADE QUE SERVE E A QUE NÃO SERVE ─────────────────────────────
{
  conferir("o id de conta do Supabase serve", identidadeUsavel("fcd41994-1d3c-4f5e-8a2b-9c0d1e2f3a4b"));
  conferir("maiúsculas também", identidadeUsavel("FCD41994-1D3C-4F5E-8A2B-9C0D1E2F3A4B"));
  conferir("com espaço em volta, serve", identidadeUsavel("  fcd41994-1d3c-4f5e-8a2b-9c0d1e2f3a4b  "));
  // O formato que o RevenueCat gera quando ninguém se identificou. É ELE que
  // chegou (ou chegaria) no caso de 25/09.
  conferir("o id anônimo do RevenueCat NÃO serve", !identidadeUsavel("$RCAnonymousID:8f3a2b1c9d4e5f60"));
  conferir("vazio não serve", !identidadeUsavel(""));
  conferir("nulo não serve", !identidadeUsavel(null));
  conferir("pedaço de uuid não serve", !identidadeUsavel("fcd41994-1d3c"));
}

// ── 2. SÓ DINHEIRO GERA RELATO ──────────────────────────────────────────────
//
// A lição de 19/09: alarme que grita sobre coisa que não é defeito ensina o
// dono a ignorar o vigia, e aí o dia em que doer passa batido.
{
  for (const t of ["INITIAL_PURCHASE", "RENEWAL", "UNCANCELLATION", "PRODUCT_CHANGE", "NON_RENEWING_PURCHASE"]) {
    conferir(`${t} é dinheiro`, ehVendaComDinheiro(t));
  }
  for (const t of ["CANCELLATION", "EXPIRATION", "BILLING_ISSUE", "TEST", "", null]) {
    conferir(`${t || "(vazio)"} NÃO é dinheiro`, !ehVendaComDinheiro(t));
  }
  conferir("minúscula também conta", ehVendaComDinheiro("initial_purchase"));
}

// ── 3. O RELATO LEVA A CHAVE DE BUSCA ───────────────────────────────────────
//
// Relato sem o `app_user_id` só serve para saber que doeu. Com ele, o dono abre
// o painel do RevenueCat, acha a compra e liga o Premium na mão.
{
  const r = relatoDeVendaSemConta({
    id: "1A2B3C4D-EVT",
    type: "INITIAL_PURCHASE",
    app_user_id: "$RCAnonymousID:8f3a2b1c9d4e5f60",
    product_id: "mentorque_annual",
    store: "APP_STORE",
  });
  conferir("a origem é a que o retrato conta", r.origem === ORIGEM_VENDA_SEM_CONTA, r.origem);
  conferir("o relato leva o app_user_id", /RCAnonymousID:8f3a2b1c9d4e5f60/.test(r.mensagem), r.mensagem);
  conferir("e o id do evento", /1A2B3C4D-EVT/.test(r.mensagem), r.mensagem);
  conferir("e o produto", /mentorque_annual/.test(r.mensagem), r.mensagem);
  conferir("e diz o que fazer", /ligar na mao/.test(r.mensagem), r.mensagem);
  conferir("a loja vira plataforma", r.plataforma === "ios", r.plataforma);
  conferir("Play também", relatoDeVendaSemConta({ store: "PLAY_STORE" }).plataforma === "android");
  conferir("loja desconhecida não inventa plataforma", relatoDeVendaSemConta({}).plataforma === "loja");
  conferir(
    "e o relato NÃO carrega nome nem e-mail",
    !/@/.test(r.mensagem),
    "o corpo do RevenueCat não manda isso, e o que basta para recuperar a venda é o identificador",
  );
}

// ── 4. A FRASE DO RETRATO, NOS DOIS ESTADOS ─────────────────────────────────
{
  const zero = linhaDeVendaSemConta(0);
  conferir("zero é dito como normal", /nenhuma/.test(zero.texto), zero.texto);
  conferir("e não grita", !/PERDIDAS/.test(zero.texto), zero.texto);

  const uma = linhaDeVendaSemConta(1);
  conferir("uma venda perdida grita", /VENDAS DE LOJA PERDIDAS \(30d\): 1/.test(uma.texto), uma.texto);
  conferir("e diz onde achar o rastro", new RegExp(ORIGEM_VENDA_SEM_CONTA).test(uma.texto), uma.texto);
  conferir("e diz que alguém pagou", /pagou/.test(uma.texto), uma.texto);
}

// ── 5. A COMPRA DO ONBOARDING SAI COM IDENTIDADE ────────────────────────────
//
// É a causa provável do caso de 25/09, e a única asserção aqui que olha o app.
{
  const onb = semComentarios(readFileSync(new URL("../components/app/OnboardingFlow.tsx", import.meta.url), "utf8"));
  // O recorte NÃO exige o fecho da função de propósito: a primeira versão
  // pedia `\n  };` dentro de 400 caracteres, o corpo é maior que isso, e as
  // duas asserções reprovaram no código CERTO. Conferência que depende do
  // tamanho do corpo quebra na próxima linha que alguém acrescentar.
  const buy = onb.match(/const buyNow = async \(\) => \{[\s\S]{0,300}/);
  conferir("achei o buyNow do onboarding", !!buy, "se o nome mudou, esta asserção ficou cega");
  conferir(
    "a compra do onboarding passa a identidade para o RevenueCat",
    !!buy && /initPurchases\(user\?\.id \?\? null\)|initPurchases\(user\.id\)/.test(buy[0]),
    `${buy?.[0]?.match(/initPurchases\([^)]*\)/)?.[0] ?? "não achei a chamada"}; com null o plugin pula o logIn e a compra fica na conta anônima`,
  );
}

// ── 6. O WEBHOOK NÃO PERDE A VENDA EM SILÊNCIO ──────────────────────────────
{
  const rota = semComentarios(readFileSync(new URL("../app/api/revenuecat/webhook/route.ts", import.meta.url), "utf8"));
  conferir(
    "a identidade é conferida pela régua, e não por uma cópia da regex",
    /identidadeUsavel\(userId\)/.test(rota) && !/\[0-9a-f\]\{8\}/.test(rota),
    "regex copiada no leitor é regra que para de acompanhar a fonte",
  );
  conferir(
    "identidade inútil com dinheiro vira linha em app_erros",
    /ehVendaComDinheiro\(event\.type\)[\s\S]{0,300}from\("app_erros"\)\.insert/.test(rota),
    "sem isto a venda paga sai com um 200 e nunca mais existe",
  );
  conferir(
    "e o relato vem da régua, não montado ali",
    /relatoDeVendaSemConta\(event\)/.test(rota),
  );
}

// ── 6b. A SUBTRAÇÃO QUE FALTAVA: RevenueCat contra o banco ──────────────────
//
// O CASO REAL, e ele é o motivo desta régua existir: de 25/09 a 02/10 a fonte
// `revenuecat` do retrato disse `active_subscriptions: 1` todos os dias, e as
// assinaturas do banco eram todas do Stripe. Os dois números foram impressos
// lado a lado por OITO DIAS e ninguém subtraiu, porque subtrair era trabalho
// de quem lê.
{
  const perdida = conferenciaDaLoja(1, 0);
  conferir("1 no RevenueCat e 0 no banco dispara", perdida.deveAvisar === true, perdida.silencio);
  conferir("e diz quantas pessoas", /1 pessoa\(s\) que pagaram/.test(perdida.texto), perdida.texto);
  conferir("e diz onde mexer", /Integrations, Webhooks/.test(perdida.texto), perdida.texto);

  conferir("1 e 1 não dispara", conferenciaDaLoja(1, 1).deveAvisar === false);
  conferir("0 e 0 não dispara", conferenciaDaLoja(0, 0).deveAvisar === false);
  conferir("e o silêncio diz que batem", /batem/.test(conferenciaDaLoja(2, 2).silencio));

  // Sobra nossa não é venda perdida: assinatura que expirou no RevenueCat e
  // segue ativa aqui é outro problema, e gritar "alguém pagou" sobre ela
  // ensinaria a ignorar o alarme.
  const sobra = conferenciaDaLoja(0, 1);
  conferir("banco com mais que o RevenueCat NÃO grita que alguém pagou", sobra.deveAvisar === false, sobra.texto);
  conferir("mas o motivo fica dito", /sobra nossa/.test(sobra.silencio), sobra.silencio);

  // Sem leitura não é zero. É a regra da casa desde 28/09: ausência de medida
  // não pode virar afirmação sobre o mundo.
  const semLeitura = conferenciaDaLoja(null, 0);
  conferir("sem leitura do RevenueCat não dispara", semLeitura.deveAvisar === false);
  conferir("e diz que está sem leitura", /sem leitura do RevenueCat/.test(semLeitura.silencio), semLeitura.silencio);
  conferir("e lixo no lugar do número também cala", conferenciaDaLoja(NaN, 0).deveAvisar === false);
}

// ── 6c. A RESSALVA DO PAYWALL NÃO PODE MAIS DIZER MODO LEITOR ───────────────
//
// Ela nasceu certa em 28/09 e envelheceu: o Android tem `iniciou_checkout` de
// loja desde 23/09 e uma compra concluída em 25/09. Ressalva que explica um
// zero que já não existe é a mentira mais difícil de achar, porque todo mundo
// a repete achando que está sendo cuidadoso.
{
  const funil = readFileSync(new URL("../lib/funilCorreto.ts", import.meta.url), "utf8");
  // O RECORTE É DENTRO DO BLOCO `RESSALVAS`, e não no arquivo inteiro: a chave
  // `viu_paywall` aparece em mais de um mapa ali (UNIDADE, por exemplo), e a
  // primeira versão desta asserção pegou o valor errado, "aparelho", e
  // reprovou um texto correto. É a mesma armadilha de 03/09 com outra cara:
  // procurar um nome num arquivo grande acha o primeiro, não o certo.
  const bloco = funil.match(/export const RESSALVAS[\s\S]*?\n\};/)?.[0] ?? "";
  const ressalva = bloco.match(/viu_paywall:\s*\n?\s*"([^"]+)"/)?.[1] ?? "";
  conferir("achei o bloco RESSALVAS", !!bloco);
  conferir("achei a ressalva do paywall", !!ressalva, bloco.slice(0, 80));
  conferir(
    "a ressalva NÃO diz mais que o Android não tem botão de compra",
    !/modo leitor|não tem botão de compra|nao tem botao de compra/i.test(ressalva),
    ressalva,
  );
  conferir("e diz que o Android vende", /VENDE/.test(ressalva), ressalva);
}

// ── 7. O RETRATO PUBLICA ────────────────────────────────────────────────────
{
  const operacao = semComentarios(readFileSync(new URL("../lib/operacao.ts", import.meta.url), "utf8"));
  conferir("o retrato conta as vendas sem conta", /ORIGEM_VENDA_SEM_CONTA/.test(operacao));
  conferir("e publica a frase pronta", /linhaSemConta: linhaDeVendaSemConta\(/.test(operacao));
  conferir("e a conferencia contra o RevenueCat", /lojaConferida: conferenciaDaLoja\(/.test(operacao));
  // A ASSERÇÃO OLHA O ARGUMENTO, e não uma linha vizinha parecida.
  //
  // A primeira versão conferia só que existia `assinaturasDeLoja: ativas.filter(...)`.
  // Plantei `ativas.length` DENTRO da chamada de `conferenciaDaLoja`, que é o
  // número que de fato decide o alarme, e ela aprovou: a linha vizinha
  // continuava lá, certinha. Conferir um lugar parecido com o que importa é o
  // mesmo que não conferir.
  const chamada = operacao.match(/conferenciaDaLoja\([\s\S]{0,400}?\n      \),/)?.[0] ?? "";
  conferir("achei a chamada da conferência da loja", !!chamada);
  conferir(
    "e ela recebe só as assinaturas SEM stripe",
    /ativas\.filter\(\(s\) => !s\.stripe_subscription_id\)\.length,?\s*\n?\s*\)/.test(chamada),
    `${chamada.slice(-90)}; comparar com o total esconde o buraco, porque as do Stripe tapam a conta`,
  );
  conferir("a janela é de 30 dias", /vendas_sem_conta[\s\S]{0,300}d30/.test(operacao), "em 7 dias o caso de 25/09 teria passado batido");
}

// ── 8. O UPSERT NÃO APAGA O QUE NÃO CONHECE ─────────────────────────────────
//
// Achado do QA em 01/10, de passagem: as três assinaturas têm `cupom` nulo, e
// os três códigos foram preenchidos à mão em 02/09. O upsert roda a cada
// webhook e gravava NULL por cima.
{
  const sync = semComentarios(readFileSync(new URL("../lib/subscriptionSync.ts", import.meta.url), "utf8"));
  conferir(
    "cupom só é escrito quando existe",
    /\.\.\.\(typeof sub\.metadata\?\.cupom === "string"[\s\S]{0,120}\{ cupom:/.test(sync),
    "`cupom: ... : null` apaga preenchimento manual no proximo webhook",
  );
  conferir(
    "gclid também",
    /\.\.\.\(typeof sub\.metadata\?\.gclid === "string"[\s\S]{0,120}\{ gclid:/.test(sync),
    "o gclid e a chave da devolucao da conversao ao Google Ads: apagado, a campanha otimiza no escuro",
  );
  conferir(
    "e nenhum dos dois volta a afirmar null",
    !/cupom:[^,\n]*:\s*null/.test(sync) && !/gclid:[^,\n]*:\s*null/.test(sync),
    sync.match(/(cupom|gclid):[^\n]*null[^\n]*/)?.[0] ?? "",
  );
}

// ── O ENDEREÇO QUE A GENTE MANDA O TERCEIRO REGISTRAR ──────────────────────
//
// POR QUE ISTO VIROU CONFERÊNCIA (03/10/2026), e são DUAS vendas perdidas pelo
// mesmo motivo, com 27 dias entre elas:
//
// O domínio sem `www` responde 308 Permanent Redirect para o com `www`.
// Navegador segue e ninguém nota. Robô de serviço de terceiro ou não segue, ou
// segue e derruba o header `Authorization` no salto entre hosts, que nas nossas
// rotas vira 401. Nos dois caminhos a entrega morre na porta, calada.
//
// Em 29/08 o Stripe parou de entregar exatamente assim, a causa foi provada com
// um fetch, o endpoint virou `www` e ficou escrito no diário que faltava
// conferir o RevenueCat, "porque a mesma parede vale para ele". Aquilo morou no
// diário, que é lugar onde se explica, e nunca virou linha na lista do dono.
// Em 25/09 uma compra de Play se perdeu, e o painel de 03/10 mostrou o webhook
// do RevenueCat ainda no apex. Pior: o COMENTÁRIO DA NOSSA PRÓPRIA ROTA mandava
// configurar assim.
//
// Então a regra agora é do repositório e não da memória de ninguém: endereço de
// webhook escrito aqui dentro usa o domínio primário.
{
  const arquivos = [
    "app/api/revenuecat/webhook/route.ts",
    "app/api/stripe/webhook/route.ts",
    "docs/push.md",
    "docs/agentes/acoes-do-dono.md",
  ];
  for (const arq of arquivos) {
    const texto = readFileSync(new URL(`../${arq}`, import.meta.url), "utf8");
    // Só as linhas que ENSINAM um endereço: apex seguido de /api. O apex
    // sozinho (origem do app, lista de CORS, deep link) é outro assunto e
    // navegador segue redirect sem reclamar.
    const apex = texto.match(/https:\/\/mentorque\.com\.br\/api\/[a-z/-]*/g) ?? [];
    conferir(
      `${arq} não ensina endereço de API sem www`,
      apex.length === 0,
      apex.length
        ? `${apex.join(", ")} — o apex responde 308 para o www, e robo de terceiro nao segue (ou segue e derruba o Authorization). Duas vendas ja morreram nisso, em 25/08 e 25/09`
        : "",
    );
  }
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) da loja reprovaram.`);
  process.exit(1);
}
console.log("Loja: a compra sai com identidade, e a que chegar sem conta deixa rastro com a chave de busca.");
