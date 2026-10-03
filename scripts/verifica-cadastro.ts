// O convite de "termine o cadastro": ele sai uma vez, para quem deve, e com o
// desconto que promete?
//
// POR QUE ISTO EXISTE (03/10/2026), pedido do dono: um e-mail oferecendo o
// primeiro mês de Premium com o cupom do Stripe para quem criou conta e não
// cadastrou o carro. São 32 pessoas, medidas no banco antes de escrever.
//
// Mensagem a cliente não tem desfazer: sai errada, sai para todo mundo, e quem
// responde é o dono. Por isso esta conferência olha as travas antes do texto.
//
// O QUE ELA PROTEGE:
//   1. as três travas da skill `mensagem-a-cliente`: chave, `disparar: true`
//      explícito, e marca por destinatário gravada DEPOIS DE CADA envio;
//   2. a quarta trava, que é deste caso: o TETO DO CUPOM. O e-mail promete
//      "por nossa conta", e passar do teto entrega preço cheio ao último da
//      fila, calado;
//   3. quem já tem carro, quem já assina e quem pediu para sair não recebem, e
//      isso sai de CONSULTA na hora do disparo, não de lista escrita antes;
//   4. o texto diz o preço do segundo mês, tem um botão só, e manda para a web,
//      que é o único lugar onde cupom de Stripe existe.
//
// O QUE ELA NÃO ALCANÇA: nenhum e-mail foi enviado, e o teto real do cupom não
// é lido daqui (a integração do Stripe não está autorizada nesta sessão). O que
// está provado é a forma e as travas; o número do teto é do painel, e a rota
// obriga quem dispara a passá-lo.
//
// Rode com: npm run conferir:cadastro
import { readFileSync } from "node:fs";
import { emailTermineOCadastro, linkDoCupom } from "../lib/email/termineOCadastro.ts";

process.env.JORNADA_SEGREDO ||= "segredo-de-conferencia";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}
const semComentarios = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const UID = "14e31832-c6ca-444b-aa3d-c86efc5686ff";

console.log("Cadastro: o convite do mês grátis sai uma vez, para quem deve, e com o desconto que promete?");

// ── 1. O LINK LEVA O CUPOM E A CAMPANHA ────────────────────────────────────
{
  const url = linkDoCupom("LANCAMENTO1MES");
  conferir("o link vai para o site, e não para a loja", /^https:\/\/www\.mentorque\.com\.br\//.test(url), url);
  conferir("leva o cupom", /cupom=LANCAMENTO1MES/.test(url), url);
  conferir("e o plano mensal, que é o que o cupom cobre", /assinar=mensal/.test(url), url);
  conferir("com UTM da campanha", /utm_source=email/.test(url) && /utm_campaign=termine-o-cadastro/.test(url), url);
}

// ── 2. O TEXTO DIZ O QUE CUSTA DEPOIS ──────────────────────────────────────
//
// "Primeiro mês por nossa conta" sem dizer o preço do segundo é a receita do
// estorno e da avaliação de uma estrela. A regra é do e-mail de lançamento.
{
  const e = emailTermineOCadastro({ userId: UID, nome: "Ana", cupom: "LANCAMENTO1MES", precoMensal: "R$ 29,90" });
  conferir("abre com o nome quando existe", /^Oi, Ana\./.test(e.texto), e.texto.slice(0, 30));
  conferir("diz que falta o carro", /cadastrar o carro/.test(e.texto), "o e-mail inteiro existe por causa disso");
  conferir("explica POR QUE o carro importa", /revis(õ|o)es|IPVA|consumo/.test(e.texto), "pedir sem motivo e so pedir");
  conferir("oferece o primeiro mês", /primeiro mês do Premium é por nossa conta/.test(e.texto), e.texto);
  conferir("o preço do segundo mês está no corpo", /R\$ 29,90 por mês/.test(e.texto), e.texto);
  conferir("e o cancelamento também", /cancela quando quiser/.test(e.texto), e.texto);
  conferir(
    "diz que o desconto é no site, porque o cupom é de lá",
    /desconto é aplicado no site/.test(e.texto),
    "cupom nao existe dentro do app das lojas, e mandar para la e prometer o que nao se cumpre",
  );
  conferir(
    "e explica que o Premium é da conta",
    /Premium é da conta, não do aparelho/.test(e.texto),
    "sem isso a pessoa assina no site e acha que precisa assinar de novo no app",
  );
  conferir("tem um jeito de sair da lista", /não receber mais e-mails/.test(e.texto), e.texto.slice(-200));

  // UM BOTÃO SÓ. Dois botões grandes dividem o clique entre assinar e baixar, e
  // o que precisa acontecer primeiro é assinar com o cupom.
  const botoes = (e.html.match(/display:block;padding:14px/g) ?? []).length;
  conferir("há um botão grande, e só um", botoes === 1, `achei ${botoes}`);

  // O `&` escapado no HTML e CRU no texto puro: em atributo, `&` cru é ambíguo,
  // e o que segura é a tolerância do navegador, que acaba no dia em que o
  // rastreio de clique do provedor REESCREVE o link.
  conferir("no HTML o & vai escapado", /&amp;cupom=/.test(e.html), "sem isto o link quebra quando algo reescreve o HTML");
  conferir("no texto puro o & vai cru", /[^;]&cupom=/.test(e.texto), "no texto puro, &amp; apareceria na cara da pessoa");

  const semNome = emailTermineOCadastro({ userId: UID, cupom: "X", precoMensal: "R$ 29,90" });
  conferir("sem nome, abre sem vírgula solta", /^Oi\.\n/.test(semNome.texto), semNome.texto.slice(0, 20));
}

// ── 3. O PREÇO NÃO ESTÁ CHUMBADO NO TEXTO ──────────────────────────────────
//
// Preço é alçada do dono e muda sem avisar o programador. Se ele viesse escrito
// aqui dentro, uma mudança de preço deixaria o e-mail mentindo, e a mentira
// seria sobre dinheiro.
{
  const outro = emailTermineOCadastro({ userId: UID, cupom: "OUTRO", precoMensal: "R$ 39,90" });
  conferir("o preço vem de fora", /R\$ 39,90 por mês/.test(outro.texto), outro.texto);
  conferir("e o cupom também", /cupom=OUTRO/.test(outro.texto), "cupom chumbado impede trocar quando o teto acabar");
}

// ── 4. AS TRAVAS DA ROTA DE DISPARO ────────────────────────────────────────
{
  const rota = semComentarios(readFileSync(new URL("../app/api/email/cadastro/route.ts", import.meta.url), "utf8"));
  conferir("1ª trava: a chave dos dados", /chaveDadosOk\(req\)/.test(rota));
  conferir(
    "2ª trava: o disparar explícito",
    /body\?\.disparar !== true/.test(rota),
    "sem isto um GET de rastreador manda e-mail para gente de verdade",
  );
  conferir("3ª trava: a marca por destinatário", /from\("jornada_envios"\)\s*\n?\s*\.insert/.test(rota));
  conferir(
    "e a marca é gravada DENTRO do laço, logo depois do envio",
    /for \(const alvo of cabem\)[\s\S]{0,900}from\("jornada_envios"\)/.test(rota),
    "marcada so no fim, uma rota que morre no meio manda tudo de novo",
  );
  conferir(
    "4ª trava: o teto do cupom é obrigatório",
    /Number\.isInteger\(cupons\)/.test(rota) && /faltou_cupons/.test(rota),
    "cupom tem max_redemptions NAO editavel: passar do teto entrega preco cheio ao ultimo da fila, calado",
  );
  conferir(
    "e o teto corta a lista de verdade",
    /alvos\.slice\(0, cupons\)/.test(rota),
    "exigir o numero e nao usar e pior que nao exigir: da a sensacao de trava sem ter trava",
  );
  conferir(
    "quem ficou de fora aparece na resposta",
    /ficaramDeFora/.test(rota),
    "quem dispara precisa saber quantos ficaram para a proxima leva",
  );
  conferir("quem já recebeu sai pela consulta", /from\("jornada_envios"\)\.select\("user_id"\)\.eq\("chave", CHAVE_DO_ENVIO\)/.test(rota));
  conferir("quem pediu para sair também", /from\("jornada_saidas"\)\.select\("user_id"\)/.test(rota));
  conferir("quem já assina também", /\.in\("status", \["active", "trialing"\]\)/.test(rota));
  // E QUEM JÁ TEM CARRO, que é o motivo do e-mail existir. A asserção é sobre
  // o conjunto de exclusão, não sobre a existência da variável: `comCarro`
  // declarado e não usado passou verde na primeira rodada de plantio, que é o
  // mesmo buraco do `conferir:loja` de 02/10 (afirmar a linha vizinha em vez
  // do que decide).
  conferir(
    "quem já tem carro entra no conjunto que fica de fora",
    /const fora = new Set\(\[\s*\.\.\.comCarro,/.test(rota),
    "mandar 'falta o seu carro' para quem acabou de cadastrar e o tipo de erro que faz desconfiar de tudo depois",
  );
  conferir(
    "e o carro é lido do ESTADO, não de evento",
    /vehicles/.test(rota) && /from\("user_state"\)/.test(rota),
    "evento so enxerga quem cadastrou DEPOIS de a medicao existir; estado enxerga todo mundo",
  );
  conferir(
    "o resultado das consultas pula a pessoa de verdade",
    /if \(fora\.has\(userId\)\) continue;/.test(rota),
    "consulta feita e ignorada manda para quem nao devia",
  );
  conferir(
    "enviar sem marcar fica registrado no log",
    /console\.error\("\[cadastro\] e-mail enviado e NAO marcado"/.test(rota),
    "sem a marca a proxima chamada manda de novo, e isso nao pode sair calado",
  );
  conferir("e aparece na resposta de quem disparou", /enviado_sem_marca/.test(rota));
  conferir("o teto de tempo está declarado", /maxDuration = \d+/.test(rota), "o padrao do plano e 10s e o disparo morreria no meio");
  conferir("há cópia de prova que não toca na lista", /body\?\.teste/.test(rota));
  conferir("e a resposta cai numa caixa lida", /reply_to: RESPONDE/.test(rota));
}

// ── 5. A CHAVE DO ENVIO É A MESMA NOS DOIS LADOS ───────────────────────────
//
// A chave é o que impede o envio dobrado e é o que o retrato usa para medir
// abertura e clique por campanha. Escrita em dois lugares, ela diverge calada.
{
  const rota = readFileSync(new URL("../app/api/email/cadastro/route.ts", import.meta.url), "utf8");
  const chave = rota.match(/CHAVE_DO_ENVIO = "([a-z-]+)"/)?.[1] ?? "";
  conferir("a chave do envio existe", !!chave, chave);
  const url = linkDoCupom("X");
  conferir(
    "e ela é a mesma do utm_campaign do link",
    url.includes(`utm_campaign=${chave}`),
    `chave "${chave}" e link "${url}": com nomes diferentes, o retrato mede uma campanha e o e-mail etiqueta outra`,
  );
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) do convite de cadastro reprovaram.`);
  process.exit(1);
}
console.log("Cadastro: travas de pé, teto do cupom obrigatório, e o texto diz o preço do segundo mês.");
