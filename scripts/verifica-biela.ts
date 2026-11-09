// A Biela no gratuito: quem conta, quem paga e o que a tela acredita.
//
// POR QUE (15/09/2026). O dono abriu a Biela para quem não assina, com cinco
// perguntas por mês. Trocar o zero por cinco na tela seria o conserto errado,
// porque os dois lados que seguravam o limite eram de mentira:
//
//   - o contador do gratuito vivia num `useState(0)`, que zera a cada abertura
//     do app, então o teto seria por abertura e não por mês;
//   - a rota `/api/biela` não conferia nada: sem sessão, sem Premium, sem
//     contagem. O único freio era o zero da tela.
//
// Cada pergunta é uma chamada paga. Um defeito em qualquer regra daqui não
// aparece como tela quebrada: aparece como fatura, no fim do mês, ou como
// gente trancada fora de um recurso que deveria estar aberto.
//
// Rode com: npm run conferir:biela
import { readFileSync } from "node:fs";
import { LIMITE_GRATIS_POR_MES, mesDe, podePerguntar, restantes } from "../lib/biela/limite.ts";
import { mesDe as mesDoOrcamento } from "../lib/orcamento/analise.ts";
import { semTravessao } from "../lib/biela/semTravessao.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}
const semComentarios = (f: string) => f.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/gm, " ");
const leia = (caminho: string) => semComentarios(readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8"));

console.log("Biela: o limite do gratuito, e quem o segura.");

// ── a conta ─────────────────────────────────────────────────────────────────
{
  conferir("o limite do gratuito é uma por mês (decisão do dono, 05/11; eram três desde 17/10 e cinco desde 15/09)", LIMITE_GRATIS_POR_MES === 1, String(LIMITE_GRATIS_POR_MES));
  conferir("com zero feitas, pode", podePerguntar(0, false));
  conferir(`com ${LIMITE_GRATIS_POR_MES - 1} feitas, ainda pode`, podePerguntar(LIMITE_GRATIS_POR_MES - 1, false));
  conferir(`com ${LIMITE_GRATIS_POR_MES} feitas, NÃO pode`, !podePerguntar(LIMITE_GRATIS_POR_MES, false));
  conferir("Premium passa por cima do teto", podePerguntar(999, true));
  conferir("o saldo do Premium é nulo, não um número", restantes(999, true) === null);
  conferir("o saldo nunca fica negativo", restantes(LIMITE_GRATIS_POR_MES + 3, false) === 0, String(restantes(LIMITE_GRATIS_POR_MES + 3, false)));
  conferir("com uma feita, sobram duas", restantes(1, false) === LIMITE_GRATIS_POR_MES - 1);

  // O mês é o MESMO do orçamento por foto, e não uma cópia. Dois relógios
  // diferentes para os dois limites gratuitos da mesma pessoa é o tipo de
  // divergência que só aparece na virada do mês, uma vez a cada trinta dias.
  const d = new Date("2026-09-15T12:00:00Z");
  conferir("o mês é o mesmo do orçamento por foto", mesDe(d) === mesDoOrcamento(d) && mesDe(d) === "2026-09", `${mesDe(d)} vs ${mesDoOrcamento(d)}`);
  conferir("o mês vira na virada, em UTC", mesDe(new Date("2026-09-30T23:59:59Z")) === "2026-09" && mesDe(new Date("2026-10-01T00:00:01Z")) === "2026-10");
}

// ── a rota, que é onde o limite existe de verdade ───────────────────────────
{
  const rota = leia("app/api/biela/route.ts");

  conferir(
    "a rota identifica pela conta (Bearer) e pelo aparelho (anonId)",
    /admin\.auth\.getUser\(bearer\)/.test(rota) && /body\.anonId === "string"/.test(rota),
    "sem identidade não há o que contar, e o limite vira enfeite",
  );
  conferir(
    "o Premium sai da tabela subscriptions, não do que o app diz",
    /from\("subscriptions"\)\.select\("status"\)/.test(rota) && /status === "active" \|\| sub\?\.status === "trialing"/.test(rota),
    "app comprometido diria que é Premium e a conta seria nossa",
  );
  conferir(
    "a rota CONTA no banco antes de chamar a API",
    /from\("biela_perguntas"\)[\s\S]{0,200}\.select\("id", \{ count: "exact", head: true \}\)[\s\S]{0,120}\.eq\("mes", mes\)/.test(rota),
  );
  // O FILTRO QUE SUBSTITUIU O PULO (29/09/2026). Até hoje a linha do assinante
  // simplesmente não existia, e era isso que protegia a contagem do gratuito.
  // Agora ela existe, porque o quadro de temas do Biela precisa de quem mais
  // usa, e quem mais usa é justamente quem não tem limite. O que impede a
  // confusão passou a ser este filtro: sem ele, quem cancelar o Premium abre o
  // mês seguinte já no teto, com as próprias perguntas de assinante contra si.
  conferir(
    "e a contagem do gratuito ignora a pergunta feita no Premium",
    /\.eq\("mes", mes\)[\s\S]{0,80}\.eq\("premium", false\)/.test(rota),
    "sem isto, cancelar o Premium faz a pessoa herdar as proprias perguntas como se fossem do mes gratis",
  );
  conferir(
    "e recusa com 429 quando o mês acabou",
    // A guarda ganhou a compra avulsa em 09/11 ("decisao ? !decisao.pode :
    // !podePerguntar(...)"); o que se cobra é o mesmo: recusa com 429.
    /!podePerguntar\(feitas, premium\)\) \{[\s\S]{0,480}status: 429/.test(rota),
  );
  conferir(
    "quem não tem identidade nenhuma é recusado",
    /if \(!userId && !anonId\) return NextResponse\.json\(\{ ok: false, error: "sem_identidade" \}/.test(rota),
  );
  // A ORDEM IMPORTA: contar depois de responder, e só no caminho que deu
  // certo. O `catch` é a chamada que NÃO completou.
  conferir(
    "a pergunta é gravada DEPOIS da resposta boa, não antes",
    /const data = await res\.json\(\)[\s\S]{0,900}from\("biela_perguntas"\)\.insert/.test(rota),
    "gravar antes cobraria uma das cinco por uma chamada que pode falhar",
  );
  // 29/09/2026: ESTA LINHA DIZIA O CONTRÁRIO, e a mudança é do dono ("vamos
  // começar a usar as perguntas, relevante para conseguirmos entender melhor
  // nossos usuários"). O assinante era pulado porque a tabela só servia para
  // contar o limite; agora ela também é o que diz o que o motorista pergunta,
  // e deixar de fora quem não tem limite é medir a curiosidade de quem ainda
  // não pagou e chamar isso de "os nossos usuários".
  //
  // O limite não afrouxou: quem o segura agora é o `.eq("premium", false)` da
  // contagem, conferido logo acima.
  conferir(
    "toda pergunta gera linha, inclusive a de quem é Premium",
    /if \(admin\) \{[\s\S]{0,400}from\("biela_perguntas"\)\.insert/.test(rota),
    "sem a linha do assinante, o quadro de temas mede so quem ainda nao pagou",
  );
  conferir(
    "e a linha carrega as duas etiquetas, nunca o texto",
    /origem,\s*\n\s*tema,/.test(rota) && !/pergunta:\s*question/.test(rota.replace(/^\s*\/\/.*$/gm, "")),
    "a politica de privacidade promete que o texto so fica guardado quando a pessoa vota",
  );
  conferir(
    "falha ao gravar NÃO derruba a resposta, mas vira registro",
    /if \(error\) console\.error\("\[biela\] não gravei a pergunta para o limite"/.test(rota),
    "contagem que não grava é limite que não existe, e isso some em silêncio",
  );
  conferir(
    "a rota devolve o saldo para a tela",
    /restantes: restantes\(feitas, premium\)/.test(rota),
  );
  // A tabela não guarda pergunta nem resposta, e isso é decisão, não esquecimento.
  conferir(
    "a rota não grava a pergunta nem a resposta na tabela do limite",
    !/insert\(\{[\s\S]{0,300}(question|answer|pergunta:|resposta:)/.test(rota),
    "o limite precisa saber quantas, não o quê",
  );
}

// ── a tela, que não pode voltar a contar sozinha ────────────────────────────
{
  const tela = leia("components/app/screens/Biela.tsx");

  conferir(
    "o contador em estado de React SUMIU (ele zerava a cada abertura do app)",
    !/setUsed\(/.test(tela) && !/FREE_BIELA_QUESTIONS/.test(tela),
    "era ele que transformaria cinco por mês em cinco por abertura",
  );
  conferir(
    "o saldo vem do servidor",
    /if \(typeof data\.restantes === "number"\) setRestantes\(data\.restantes\)/.test(tela),
  );
  // `restantes` nulo é "ainda não perguntei", não "acabou". Tratar desconhecido
  // como esgotado trancaria a Biela para todo mundo na primeira abertura.
  conferir(
    "saldo desconhecido NÃO tranca a tela",
    /const gated = !s\.premium && restantes !== null && restantes <= 0/.test(tela),
    "nulo significa 'não perguntei ao servidor ainda'",
  );
  conferir(
    "o 429 fecha a tela e não vira mensagem de erro solta",
    // 09/11: o 429 do teto do passe é o único que não fecha com zero (quem tem
    // passe não recebe oferta de compra); todo outro 429 fecha.
    /if \(res\.status === 429\) \{[\s\S]{0,260}else setRestantes\(0\)/.test(tela),
  );
  conferir(
    "a identidade viaja no pedido",
    /anonId: anonId\(\)/.test(tela) && /token \? \{ authorization: `Bearer \$\{token\}` \} : \{\}/.test(tela),
    "sem isto o servidor não sabe de quem é a pergunta e conta todo mundo junto",
  );
  conferir(
    "o saldo aparece para a pessoa",
    /c\.biela\.freeLeft\.replace\("\{n\}", String\(restantes\)\)/.test(tela),
    "quem não sabe que tem pergunta grátis não usa, e o ponto era o uso",
  );
}

// ── as PORTAS de entrada, que é onde o defeito de 17/09 morava ──────────────
//
// A conferência original olhou a rota, o limite, a tela e os textos, e deixou
// passar o que o dono viu no aparelho: a Biela continuava mostrando paywall.
// O motivo é o erro clássico da casa, o de conferir o meio do caminho e não o
// fim. Eu abri a porta DENTRO da sala e deixei SETE fechaduras do lado de
// fora, cada uma em uma tela, todas na forma
// `go(s.premium ? { name: "biela" } : { name: "subscribe" })`. Quem não
// assinava nunca chegava ao chat para descobrir que tinha cinco perguntas.
//
// Conferência de texto porque o alvo é navegação espalhada por sete arquivos,
// e o elo que ela cobra é exatamente o que manteve o defeito de pé.
{
  const telas = [
    "components/app/screens/Learn.tsx",
    "components/app/screens/Equipment.tsx",
    "components/app/screens/Symptoms.tsx",
    "components/app/screens/Search.tsx",
    "components/app/screens/Obd2.tsx",
  ];
  for (const caminho of telas) {
    const fonte = leia(caminho);
    const portao = /s\.premium\s*[\s\S]{0,40}?\{\s*name:\s*"biela"/.test(fonte);
    conferir(
      `${caminho.split("/").pop()}: a entrada da Biela NÃO passa por Premium`,
      !portao,
      "quem não assina tem cinco perguntas por mês e precisa CHEGAR na tela para usá-las",
    );
  }
  // O selo e o cadeado são a promessa visual do portão. Sobreviver a ele é
  // dizer "é pago" numa tela que é grátis, que afasta quem devia entrar.
  conferir(
    "o card da Biela em Estudos não tem mais selo de Premium",
    !/\{c\.biela\.cardTitle\}[\s\S]{0,120}<PremiumBadge \/>/.test(leia("components/app/screens/Learn.tsx")),
  );
  conferir(
    "o botão de diagnóstico não mostra mais cadeado",
    !/s\.premium \? "🐻" : "🔒"/.test(leia("components/app/screens/Symptoms.tsx")),
  );
}

// ── os textos ───────────────────────────────────────────────────────────────
{
  const content = readFileSync(new URL("../lib/app/content.ts", import.meta.url), "utf8");
  const bloco = content.slice(content.indexOf("freeLeft:"), content.indexOf("premiumCta:"));
  conferir(
    "o saldo fala do MÊS, que é a janela que o servidor conta",
    /restantes neste mês/.test(bloco) && !/restantes hoje/.test(bloco),
    "texto que diz uma janela e código que conta outra é reclamação certa",
  );
  conferir(
    "o texto de esgotado diz que as grátis acabaram, e não que a Biela é Premium",
    /perguntas grátis deste mês acabaram/.test(bloco) && !/é um recurso Premium/.test(bloco),
    bloco.slice(0, 200),
  );
  conferir("sem travessão nos dois", !/—/.test(bloco), bloco);
}


// ── o 👎 GRAVA NO TOQUE, e o motivo completa a mesma linha (3.0, 04/10/2026) ─
//
// Até a 2.9 a tela só mandava o voto negativo junto com o motivo. Quem tocava
// no polegar e fechava não deixava rastro: 24 votos em seis semanas, todos
// positivos, e o retrato precisava avisar que isso não era aprovação. Agora o
// toque grava e devolve o id; o motivo, se vier, completa a linha por ele.
{
  const tela = leia("components/app/screens/Biela.tsx");
  const inicio = tela.indexOf('if (v === "down") {');
  const ramo = inicio >= 0 ? tela.slice(inicio, tela.indexOf("return;\n    }", inicio)) : "";
  conferir(
    "o toque no 👎 grava o voto antes de esperar o motivo",
    /registrar\(i, "down"\)/.test(ramo),
    "o ramo do 👎 em votar() precisa chamar registrar(i, \"down\") no toque; sem isso 👎 sem motivo some de novo",
  );
  conferir(
    "o motivo COMPLETA a linha gravada em vez de abrir outra",
    /completar\(i, \{ voto: "down", motivo: chave/.test(tela),
    "o botão de motivo chama completar() com o id; registrar() ali gravaria o mesmo voto duas vezes",
  );
  const rota = leia("app/api/biela-voto/route.ts");
  conferir(
    "a rota devolve o id da linha gravada",
    /\.select\("id"\)\.single\(\)/.test(rota) && /id: data\?\.id/.test(rota),
    "sem o id na resposta a tela não tem como completar a linha",
  );
  conferir(
    "e completa a linha quando o pedido traz id",
    /body\.id/.test(rota) && /\.update\(campos\)\.eq\("id", id\)/.test(rota),
    "o pedido com id tem que virar update, não insert",
  );
}

// ── quem bateu no limite é contado (05/11/2026) ─────────────────────────────
//
// É o denominador do teste da compra avulsa (`compra-avulsa-por-momento`): a
// oferta aparece na recusa, e até aqui a recusa não gravava nada. Duas metades:
// a função, exercitada com um banco de mentira (a linha certa, e nunca derruba
// o 429 que a pessoa tem de receber); e o elo nas duas rotas, por texto, DENTRO
// do ramo da recusa e antes do `return`. Por texto quer dizer que a chamada
// está escrita no lugar certo, não que a rota roda: isso fica dito.
{
  const { gravaLimiteAtingido } = await import("../lib/limitesAtingidos.ts");
  const linhas: Record<string, unknown>[] = [];
  const falso = { from: () => ({ insert: async (l: Record<string, unknown>) => { linhas.push(l); return { error: null }; } }) };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await gravaLimiteAtingido(falso as any, { onde: "biela", mes: "2026-11", userId: "u1", anonId: "a1", feitas: 3, plataforma: "android", versao: "3.3.0" });
  const l = linhas[0] ?? {};
  conferir(
    "a recusa vira uma linha com onde, mês e quantas já tinha feito",
    linhas.length === 1 && l.onde === "biela" && l.mes === "2026-11" && l.feitas === 3,
    JSON.stringify(linhas),
  );
  conferir(
    "com conta, a linha leva a conta e não o aparelho (a mesma regra do limite)",
    l.user_id === "u1" && l.anon_id === null,
    JSON.stringify(l),
  );
  const quebrado = { from: () => ({ insert: async () => { throw new Error("banco fora"); } }) };
  let lancou = false;
  const erroOriginal = console.error;
  console.error = () => undefined;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await gravaLimiteAtingido(quebrado as any, { onde: "orcamento", mes: "2026-11", userId: null, anonId: "a1", feitas: 2 });
  } catch {
    lancou = true;
  } finally {
    console.error = erroOriginal;
  }
  conferir("banco fora NÃO derruba a recusa", !lancou, "a pessoa tem de receber o 429, não um 500");

  const ramo = (rota: string, guarda: string) => {
    const i = rota.indexOf(guarda);
    if (i < 0) return "";
    const fim = rota.indexOf("return NextResponse.json(", i);
    return fim < 0 ? "" : rota.slice(i, fim);
  };
  conferir(
    "a rota do Biela grava a recusa dentro do ramo do limite, antes de responder",
    /gravaLimiteAtingido\(admin, \{ onde: "biela"/.test(ramo(leia("app/api/biela/route.ts"), "!podePerguntar(feitas, premium)) {")),
  );
  conferir(
    "e a do orçamento também",
    /gravaLimiteAtingido\(admin, \{ onde: "orcamento"/.test(ramo(leia("app/api/orcamento/route.ts"), "if (!podeAnalisar(feitas, premium))")),
  );
}

// ── sem trecho de manual, a Biela não cita o manual (05/11/2026) ─────────────
//
// Num teste em produção, sem manual, a resposta dizia "conforme o manual do
// Onix 2019". Por texto: o ramo SEM manual existe e proíbe a citação nas duas
// línguas. Que o modelo obedeça não se prova aqui; prova-se lendo respostas.
{
  const rota = leia("app/api/biela/route.ts");
  const i = rota.indexOf("if (manual) {");
  const ramo = i < 0 ? "" : rota.slice(i, rota.indexOf("const res = await fetch", i));
  conferir(
    "sem trecho de manual, o prompt proíbe dizer 'conforme o manual'",
    /\} else \{[\s\S]*NÃO recebeu trecho de manual[\s\S]*NUNCA escreva "conforme o manual"/.test(ramo) &&
      /did NOT receive any manual excerpt/.test(ramo),
    "sem isto a Biela cita uma fonte que não leu, e a citação é o que faz a pessoa confiar",
  );
}

// ── a resposta sai sem travessão (08/11/2026) ──────────────────────────────
// Regra do dono para todo texto visível. A resposta é escrita pelo modelo, e
// num teste em produção as duas vieram com travessão. O prompt pede; a função
// garante; a rota tem de passar a resposta por ela.
{
  const T = "\u2014"; // travessão
  const M = "\u2013"; // meia-risca
  const casos: [string, string][] = [
    [`A cada 15.000 km ${T} usando óleo semissintético.`, "A cada 15.000 km, usando óleo semissintético."],
    [`gastas${T}o chiado avisa`, "gastas, o chiado avisa"],
    [`Troque entre 10${M}15 mil km.`, "Troque entre 10 a 15 mil km."],
    [`${T} pastilha\n${T} disco`, "- pastilha\n- disco"],
    [`pelo manual. ${T} Isso muda se`, "pelo manual. Isso muda se"],
    [`termina assim ${T}\noutra linha`, "termina assim\noutra linha"],
    [`uma pausa ${M} no meio`, "uma pausa, no meio"],
  ];
  for (const [entra, sai] of casos) {
    const r = semTravessao(entra);
    conferir(`sem travessão: ${JSON.stringify(entra)}`, r === sai && !/[\u2014]/.test(r), JSON.stringify(r));
  }
  const intacto = "Óleo 5W-30, troca a cada 10.000 km (ou 6 meses). Ver item 3.2, etc.";
  conferir("texto sem travessão sai idêntico (hífen, vírgula e ponto ficam)", semTravessao(intacto) === intacto, semTravessao(intacto));

  const rota = leia("app/api/biela/route.ts");
  conferir(
    "a rota passa a resposta do modelo pela semTravessao",
    /const answer = semTravessao\(/.test(rota),
    "sem isto a função existe e a resposta sai com travessão do mesmo jeito",
  );
  conferir(
    "o prompt proíbe travessão nos dois idiomas",
    /nunca use travessão/.test(rota) && /never use an em dash/.test(rota),
  );
  const prompt = rota.slice(rota.indexOf("function systemPrompt"), rota.indexOf("function basicAnswer"));
  conferir("o prompt não ensina travessão pelo exemplo", prompt.length > 0 && !prompt.includes(T), "o modelo imita a pontuação do prompt");
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) da Biela reprovaram.`);
  process.exit(1);
}
console.log("Biela: conta, rota, tela e textos conferidos.");
