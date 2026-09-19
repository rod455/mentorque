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

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}
const leia = (caminho: string) => readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8");

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
    /semId: envios\.filter\(\(e\) => !e\.email_id\)\.length/.test(operacao),
    "envio anterior a 19/09 nunca vai ter evento; contá-lo afundaria a taxa para sempre",
  );
  conferir(
    "o retrato diz quando o webhook está mudo",
    /semEventos: envios\.filter/.test(operacao),
    "sem este aviso, zero por falta de instrumento é indistinguível de zero por falta de leitor",
  );
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) de e-mail reprovaram.`);
  process.exit(1);
}
console.log("E-mail: o envio guarda id e etiqueta, o webhook confere assinatura, e o retrato avisa quando está mudo.");
