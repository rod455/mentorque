// O e-mail que sai deixa rastro, e o rastro entra fechado?
//
// POR QUE ISTO EXISTE (19/09/2026). A jornada manda até 6 e-mails por pessoa em
// 30 dias, e até hoje a gente sabia UMA coisa sobre eles: que saíram. Entregue,
// aberto, clicado, devolvido, marcado como spam, nada chegava aqui. Uma máquina
// de retenção que ninguém mede pode estar caindo em caixa de spam há uma semana,
// e o sintoma (silêncio) é idêntico ao de "mandamos e ninguém quis".
//
// Três coisas precisam valer ao mesmo tempo, e cada uma falha calada:
//
//   1. O ENVIO GUARDA O ID. Sem o id do Resend no registro, o evento "o e-mail
//      X foi aberto" não liga em nada e a tabela vira lixo com data.
//   2. O ENVIO LEVA A ETIQUETA. Sem ela dá para dizer "os e-mails vão mal" e
//      nunca QUAL e-mail ninguém abre, que é a única versão acionável.
//   3. O WEBHOOK CONFERE A ASSINATURA E FALHA FECHADO. Endpoint público que
//      grava no banco sem verificar é convite para encher a tabela de "aberto",
//      e métrica envenenada é pior do que métrica ausente: a ausente faz
//      perguntar.
//
// Rode com: npm run conferir:email
import { readFileSync } from "node:fs";
import { emailDoConvitePremium, linkDoConvite, PRIMEIRAS_PESSOAS } from "../lib/email/convitePremium.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}
const leia = (caminho: string) => readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8");
const semComentarios = (f: string) => f.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

console.log("E-mail: o que sai deixa rastro, e o rastro entra fechado?");

// ── 1. o envio guarda o id e leva a etiqueta ──────────────────────────────
{
  const jornada = leia("app/api/cron/jornada/route.ts");
  conferir(
    "o envio devolve o id do Resend",
    /const corpo = \(await res\.json\(\)[\s\S]{0,120}return \{ id: typeof corpo\.id === "string"/.test(jornada),
    "sem ler o id da resposta, o registro do envio nasce sem ligação com os eventos",
  );
  conferir(
    "o id vai para o registro do envio",
    /jornada_envios"\)\.insert\(\{[^}]*email_id: emailId/.test(jornada),
    "guardar o id numa variável e não gravar é o mesmo que não guardar",
  );
  conferir(
    "o envio leva a etiqueta da chave",
    /tags: \[\{ name: "chave", value: etiqueta/.test(jornada),
    "sem etiqueta, o relatório diz que os e-mails vão mal e nunca qual deles",
  );
  conferir(
    "a etiqueta é limpa antes de ir",
    /etiqueta\.replace\(\/\[\^a-zA-Z0-9_-\]\/g, "-"\)/.test(jornada),
    "a chave tem dois pontos (`vencida:oil`) e o Resend recusa etiqueta com caractere fora de letra, número, hífen e sublinhado",
  );
}

// ── 2. o webhook falha fechado ────────────────────────────────────────────
{
  const rota = leia("app/api/email/eventos/route.ts");
  conferir(
    "sem segredo configurado, a rota recusa",
    /if \(!segredo\) return NextResponse\.json\(\{ error: "webhook_sem_segredo" \}, \{ status: 501 \}\)/.test(rota),
    "falhar ABERTO aqui deixa qualquer um gravar 'aberto' na nossa medição",
  );
  conferir(
    "a assinatura é conferida",
    /assinaturaConfere\(segredo, id, ts, corpo, assinaturas\)/.test(rota) && /createHmac\("sha256", chave\)/.test(rota),
  );
  conferir(
    "a comparação é de tempo constante",
    /timingSafeEqual/.test(rota),
    "comparar assinatura com === vaza o segredo aos poucos pelo tempo de resposta",
  );
  conferir(
    "o corpo é lido como TEXTO",
    /const corpo = await req\.text\(\)/.test(rota),
    "a assinatura é sobre os bytes recebidos; reserializar o JSON muda espaços e a conta não fecha",
  );
  conferir(
    "evento velho é recusado",
    /assinatura_velha/.test(rota),
    "sem janela de tolerância, um pedido capturado pode ser repetido para sempre",
  );
  conferir(
    "o mesmo evento não conta duas vezes",
    /onConflict: "id_externo,tipo", ignoreDuplicates: true/.test(rota),
    "a pessoa abre o e-mail três vezes; o que interessa é se abriu, não quantas",
  );
  conferir(
    "nada de endereço de e-mail é guardado",
    !/\bto\b.*email|destinatario|\bemail:\s/.test(rota),
    "para medir engajamento basta o id, o tipo e a etiqueta: o que não se guarda não vaza",
  );
}

// ── 3. o retrato mostra, e avisa quando o instrumento está mudo ───────────
{
  const operacao = leia("lib/operacao.ts");
  conferir("o retrato publica o resumo de e-mail", /email30d: resumoDeEmail/.test(operacao));
  conferir(
    "a taxa de clique é sobre ENVIADOS, não sobre abertos",
    /taxaClique: taxa\(c\.clicados, c\.comId\)/.test(operacao),
    "abertura depende de imagem carregada; dividir clique por aberto infla a taxa justo nas listas que bloqueiam imagem",
  );
  conferir(
    "envio sem id fica fora do denominador",
    /semId: linhasDeEmail\.reduce\(\(a, c\) => a \+ \(c\.enviados - c\.comId\), 0\)/.test(operacao),
    "envio anterior a 19/09 nunca vai ter evento; contá-lo afundaria a taxa para sempre",
  );
  conferir(
    "o retrato diz quando o webhook está mudo",
    /semEventos: linhasDeEmail\.reduce/.test(operacao),
    "sem este aviso, zero por falta de instrumento é indistinguível de zero por falta de leitor",
  );
  // A SOMA MORA NO BANCO (15/10/2026). A API do Supabase devolve no máximo
  // 1.000 linhas por consulta, qualquer que seja o `.limit()`. Puxar eventos
  // linha a linha cortou metade das aberturas em silêncio quando passaram de
  // 1.000. A rota lê a view somada, e nunca volta a puxar as linhas.
  conferir(
    "a rota lê o resumo somado no banco",
    /from\("email_resumo_30d"\)/.test(operacao),
    "somar linhas em TypeScript esbarra no teto de 1.000 linhas da API",
  );
  conferir(
    "e não puxa mais as linhas de eventos",
    !/from\("email_eventos"\)/.test(operacao),
    "com 2.019 eventos em 30 dias, a rota via 1.000 e o retrato publicava metade das aberturas",
  );
  const view = leia("supabase/email_resumo_30d.sql");
  conferir(
    "a view conta cada e-mail uma vez por tipo",
    /bool_or\(tipo = 'opened'\)/.test(view) && /group by id_externo/.test(view),
    "abrir três vezes é \"abriu\"; somar eventos inflaria a taxa",
  );
  conferir("a view separa o envio sem evento", /as sem_eventos/.test(view));
}

// ── O CONVITE DO PREMIUM (24/10/2026) ───────────────────────────────────────
//
// Mensagem a cliente não tem desfazer. O que se perde numa edição distraída e
// só se descobre com a lista inteira já tendo recebido: o link de venda sem o
// cupom, o `&` cru no atributo (o rastreio de clique reescreve e a query se
// perde), o preço do mês seguinte, o número de aulas escrito à mão, e as travas
// da rota.
{
  const o = { nome: "joão da silva", cupom: "CUPOMTESTE", precoMensal: "R$ 29,90", aulas: 124, aulasPremium: 16, limiteBiela: 3, sair: "https://x.test/sair?u=1&a=2" };
  const e = emailDoConvitePremium(o);
  const link = linkDoConvite("CUPOMTESTE");
  conferir("o link do convite abre o mensal com o cupom e a campanha", /assinar=mensal&cupom=CUPOMTESTE&utm_source=email&utm_campaign=convite-premium/.test(link));
  conferir("no HTML o link vai com &amp; e nenhum & cru", e.html.includes(link.replace(/&/g, "&amp;")) && !e.html.includes(link));
  conferir("no texto puro o link vai com & normal", e.texto.includes(link) && !e.texto.includes("&amp;"));
  conferir("o preço depois do mês grátis está no corpo", e.html.includes("R$ 29,90 por mês") && e.texto.includes("R$ 29,90 por mês"));
  conferir(`o e-mail diz as ${PRIMEIRAS_PESSOAS} primeiras pessoas, que é a decisão do dono`, e.html.includes(`${PRIMEIRAS_PESSOAS} primeiras pessoas`));
  conferir("os números vêm de fora: 16 Premium e 108 abertas", e.html.includes("As 16 aulas Premium") && e.html.includes("108 que você já tem") && e.html.includes("3 perguntas por mês"));
  const outro = emailDoConvitePremium({ ...o, aulas: 130, aulasPremium: 20, limiteBiela: 5 });
  conferir("e mudam quando o catálogo muda", outro.html.includes("As 20 aulas Premium") && outro.html.includes("110 que você já tem") && outro.html.includes("5 perguntas por mês"));
  conferir("a saudação usa só o primeiro nome", e.html.includes("Oi, João!"));
  conferir("sem nome, a saudação não inventa um", emailDoConvitePremium({ ...o, nome: null }).html.includes("<b>Oi!</b>"));
  conferir("o link de sair está no rodapé, escapado", e.html.includes("https://x.test/sair?u=1&amp;a=2"));
  conferir("sem travessão no texto que a pessoa lê", !/\u2014/.test(e.html + e.texto + e.assunto));

  const rota = semComentarios(leia("app/api/email/convite-premium/route.ts"));
  conferir("a rota exige a chave dos dados", /if \(!chaveDadosOk\(req\)\) return negada\(\);/.test(rota));
  conferir("a rota só dispara com disparar: true", /if \(body\?\.disparar !== true\)/.test(rota));
  conferir(
    "a marca é gravada dentro do laço, logo depois de cada envio",
    /for \(const p of lista\) \{[\s\S]*await enviar\([\s\S]*\.from\("jornada_envios"\)[\s\S]*\.insert\(\{ user_id: p\.user_id, chave: CHAVE_DO_CONVITE_PREMIUM/.test(rota),
  );
  conferir("quem já recebeu e-mail hoje fica de fora (um envio por pessoa por dia)", /\.eq\("dia", hoje\)/.test(rota) && /recebeuHoje\.has\(p\.user_id\)/.test(rota));
  conferir("o cupom é conferido antes de mandar, e sem vaga não manda", /cupomAindaTemVaga\(/.test(rota) && rota.indexOf("cupomAindaTemVaga(") < rota.indexOf("for (const p of lista)"));
  conferir("o catálogo é contado na hora, sem as aulas agendadas", /lessonPublicada\(l, new Date\(\)\)/.test(rota));
  conferir("a rota tem teto de tempo", /export const maxDuration = \d+/.test(rota));
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) de e-mail reprovaram.`);
  process.exit(1);
}
console.log("E-mail: o envio guarda id e etiqueta, o webhook confere assinatura, e o retrato avisa quando está mudo.");
