// O e-mail de quem cancelou: ele sai uma vez só, pergunta direito, e a
// resposta dá para ler?
//
// POR QUE ISTO EXISTE (02/10/2026), e o pedido é do dono: "um e-mail para
// comunicar quem cancelar a assinatura, com uma pesquisa de satisfação e
// perguntando os principais motivos, para a gente continuar evoluindo". Em
// 02/10 os três assinantes do Stripe saíram no mesmo dia, e a casa sabe QUE
// saíram e não sabe POR QUÊ.
//
// Mensagem a cliente não tem desfazer: sai errada, sai para todo mundo, e quem
// responde é o dono. Por isso esta conferência olha as travas antes do texto.
//
// O QUE ELA PROTEGE:
//   1. as três travas da skill `mensagem-a-cliente`: chave, `disparar: true`
//      explícito, e marca por destinatário gravada DEPOIS DE CADA envio;
//   2. ninguém recebe duas vezes, e quem pediu para sair não recebe;
//   3. o e-mail não promete acesso que não existe (a data só aparece quando
//      está no futuro);
//   4. os links da pesquisa são assinados COM o motivo dentro, senão trocar o
//      motivo no endereço vira ruído numa pesquisa de seis respostas;
//   5. a leitura descarta varredura de antivírus, que abre os seis links de
//      uma vez, em vez de contá-la como opinião;
//   6. o `&` do link vai escapado no HTML e cru no texto puro.
//
// O QUE ELA NÃO ALCANÇA: nenhum e-mail foi enviado. Disparar é alçada do dono,
// e cada disparo é uma decisão dele. O que está provado aqui é a forma; a
// entrega se prova com a cópia de prova no celular dele.
//
// Rode com: npm run conferir:saida
import { readFileSync } from "node:fs";
import { MOTIVOS, dataCurta, emailDeSaida, fraseDoAcesso } from "../lib/email/saida.ts";
import {
  JANELA_DE_ROBO_SEGUNDOS,
  MINIMO_PARA_LER_MOTIVOS,
  assinaturaDeMotivo,
  linhaDeMotivos,
  motivoConfere,
  respostasLegiveis,
} from "../lib/email/motivoDaSaida.ts";

process.env.JORNADA_SEGREDO ||= "segredo-de-conferencia";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}
const semComentarios = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const UID = "14e31832-c6ca-444b-aa3d-c86efc5686ff";

console.log("Saída: o e-mail do cancelamento sai uma vez, pergunta direito, e a resposta dá para ler?");

// ── 1. A PESQUISA TEM OS MOTIVOS QUE A PESSOA RECONHECE ────────────────────
{
  conferir("há pelo menos cinco motivos", MOTIVOS.length >= 5, String(MOTIVOS.length));
  conferir("todos têm id, português e inglês", MOTIVOS.every((m) => m.id && m.pt && m.en));
  conferir("os ids não se repetem", new Set(MOTIVOS.map((m) => m.id)).size === MOTIVOS.length);
  conferir("existe uma saída para quem não se encaixa", MOTIVOS.some((m) => m.id === "outro"));
  conferir(
    "e nenhum motivo é uma pergunta disfarçada de oferta",
    !MOTIVOS.some((m) => /desconto|promo|volte|fique/i.test(`${m.pt} ${m.en}`)),
    "oferta na saída transforma pedido de opinião em negociação, e aí a resposta deixa de ser verdade",
  );
}

// ── 2. O E-MAIL NÃO PROMETE ACESSO QUE NÃO EXISTE ──────────────────────────
{
  const futuro = fraseDoAcesso({ userId: UID, fimDoCiclo: "2026-10-25T00:00:00Z", hoje: "2026-10-02" });
  conferir("com ciclo no futuro, diz até quando", /até 25\/10\/2026/.test(futuro), futuro);

  const passado = fraseDoAcesso({ userId: UID, fimDoCiclo: "2026-09-20T00:00:00Z", hoje: "2026-10-02" });
  conferir("com ciclo no passado, NÃO inventa data", !/até/.test(passado), passado);
  conferir("e diz que encerrou", /encerrada/.test(passado), passado);

  const sem = fraseDoAcesso({ userId: UID, fimDoCiclo: null, hoje: "2026-10-02" });
  conferir("sem ciclo, também não inventa", !/até/.test(sem), sem);

  conferir("data torta não vira texto", dataCurta("isto nao e data") === null);
  conferir("data boa vira dd/mm/aaaa", dataCurta("2026-10-25T00:00:00Z") === "25/10/2026");
}

// ── 3. OS LINKS SÃO ASSINADOS COM O MOTIVO DENTRO ──────────────────────────
//
// Sem o motivo no que é assinado, quem recebeu o e-mail troca `m=preco` por
// `m=problema` no endereço e responde por si mesmo com outro motivo.
{
  const aPreco = assinaturaDeMotivo(UID, "preco")!;
  conferir("a assinatura existe", !!aPreco);
  conferir("ela confere para o motivo certo", motivoConfere(UID, "preco", aPreco));
  conferir("e NÃO confere para outro motivo", !motivoConfere(UID, "problema", aPreco));
  conferir("nem para outra pessoa", !motivoConfere("00000000-0000-4000-8000-000000000000", "preco", aPreco));
  conferir("assinatura vazia não passa", !motivoConfere(UID, "preco", ""));
  conferir("assinatura de outro tamanho não passa", !motivoConfere(UID, "preco", aPreco.slice(0, 10)));
}

// ── 4. O E-MAIL INTEIRO ────────────────────────────────────────────────────
{
  const e = emailDeSaida({ userId: UID, nome: "Ana", fimDoCiclo: "2026-10-25T00:00:00Z", hoje: "2026-10-02" })!;
  conferir("o e-mail é montado", !!e);
  conferir("o assunto não promete nada", !/desconto|volte|oferta/i.test(e.assunto), e.assunto);
  conferir("abre com o nome quando existe", /Oi, Ana\./.test(e.texto), e.texto.slice(0, 40));
  conferir("os seis motivos aparecem", MOTIVOS.every((m) => e.texto.includes(m.pt)), "falta motivo no corpo");
  conferir("há um link por motivo", MOTIVOS.every((m) => e.texto.includes(`m=${m.id}`)));
  conferir("o convite a responder está lá", /responder este e-mail/.test(e.texto), e.texto);
  conferir(
    "não há botão nem banner",
    !/<table|background-image|border-radius:999px/.test(e.html),
    "peça gráfica cai na aba Promoções, e um e-mail de cancelamento que cai em Promoções não é lido",
  );
  conferir(
    "e não há oferta nenhuma",
    !/desconto|cupom|gr[áa]tis|volte/i.test(e.texto),
    "oferta na saída transforma pedido de opinião em negociação",
  );

  // O `&` escapado no HTML e CRU no texto puro. Em atributo, `&` cru é ambíguo,
  // e o que segura é a tolerância do navegador, que acaba no dia em que o
  // rastreio de clique do provedor REESCREVE o link.
  conferir("no HTML o & vai escapado", /&amp;m=/.test(e.html), "sem isto o link quebra quando algo reescreve o HTML");
  conferir("no texto puro o & vai cru", /[^;]&m=/.test(e.texto), "no texto puro, &amp; apareceria na cara da pessoa");
  conferir("o link leva UTM", /utm_source=email/.test(e.texto) && /utm_campaign=saida/.test(e.texto));

  const semNome = emailDeSaida({ userId: UID, fimDoCiclo: null, hoje: "2026-10-02" })!;
  conferir("sem nome, abre sem nome e sem vírgula solta", /^Oi\.\n/.test(semNome.texto), semNome.texto.slice(0, 20));
}

// ── 5. A LEITURA DESCARTA VARREDURA DE ANTIVÍRUS ───────────────────────────
//
// Servidor corporativo e antivírus abrem TODOS os links da mensagem. Se cada
// abertura virasse resposta, a pesquisa mediria antivírus, que é o erro que
// esta casa cometeu duas vezes em setembro em outros instrumentos.
{
  const t = (s: number) => new Date(Date.UTC(2026, 9, 2, 12, 0, s)).toISOString();
  const varredura = [
    { user_id: "robo", motivo: "preco", criado_em: t(0) },
    { user_id: "robo", motivo: "pouco-uso", criado_em: t(1) },
    { user_id: "robo", motivo: "faltou", criado_em: t(1) },
    { user_id: "robo", motivo: "problema", criado_em: t(2) },
  ];
  const gente = [{ user_id: "ana", motivo: "preco", criado_em: t(0) }];
  // Tocar duas vezes no MESMO link é gente impaciente, não robô.
  const impaciente = [
    { user_id: "bia", motivo: "faltou", criado_em: t(0) },
    { user_id: "bia", motivo: "faltou", criado_em: t(3) },
  ];
  // Trocar de ideia uma semana depois também não é robô, e vale a primeira.
  const depois = [
    { user_id: "caio", motivo: "pouco-uso", criado_em: t(0) },
    { user_id: "caio", motivo: "preco", criado_em: new Date(Date.UTC(2026, 9, 9, 12, 0, 0)).toISOString() },
  ];

  const r = respostasLegiveis([...varredura, ...gente, ...impaciente, ...depois]);
  conferir("a varredura é descartada", r.descartados === 1, JSON.stringify(r));
  conferir("e não vira resposta", !r.respostas.some((x) => x.userId === "robo"), JSON.stringify(r.respostas));
  conferir("gente conta", r.respostas.some((x) => x.userId === "ana" && x.motivo === "preco"));
  conferir("tocar duas vezes no mesmo link conta uma", r.respostas.filter((x) => x.userId === "bia").length === 1);
  conferir("quem trocou de ideia depois vale a primeira", r.respostas.find((x) => x.userId === "caio")?.motivo === "pouco-uso");
  conferir("a janela de robô é curta", JANELA_DE_ROBO_SEGUNDOS <= 60, String(JANELA_DE_ROBO_SEGUNDOS));
}

// ── 6. A FRASE DO RETRATO TEM DENOMINADOR E DIZ QUANDO NÃO DÁ PARA LER ─────
{
  const poucas = linhaDeMotivos([{ user_id: "ana", motivo: "preco", criado_em: "2026-10-02T12:00:00Z" }], 3);
  conferir("com 1 resposta o ranking NÃO é legível", poucas.legivel === false, poucas.motivo);
  conferir("mas o denominador aparece", /de 3 e-mail\(s\)/.test(poucas.texto), poucas.texto);
  conferir("e diz que não dá para ler", /AINDA NAO DA PARA LER/.test(poucas.texto), poucas.texto);

  const muitas = Array.from({ length: MINIMO_PARA_LER_MOTIVOS }, (_, i) => ({
    user_id: `p${i}`,
    motivo: i % 2 ? "preco" : "pouco-uso",
    criado_em: "2026-10-02T12:00:00Z",
  }));
  const l = linhaDeMotivos(muitas, 40);
  conferir("no mínimo, passa a ser legível", l.legivel === true, l.motivo);
  conferir("e traz o ranking", /preco \d|pouco-uso \d/.test(l.texto), l.texto);
}

// ── 7. AS TRÊS TRAVAS DA ROTA DE DISPARO ───────────────────────────────────
{
  const rota = semComentarios(readFileSync(new URL("../app/api/email/saida/route.ts", import.meta.url), "utf8"));
  conferir("1ª trava: a chave dos dados", /chaveDadosOk\(req\)/.test(rota));
  conferir("2ª trava: o disparar explícito", /body\?\.disparar !== true/.test(rota), "sem isto um GET de rastreador manda e-mail para gente de verdade");
  conferir("3ª trava: a marca por destinatário", /from\("jornada_envios"\)\s*\n?\s*\.insert/.test(rota));
  conferir(
    "e a marca é gravada DENTRO do laço, logo depois do envio",
    /for \(const alvo of alvos\)[\s\S]{0,900}from\("jornada_envios"\)/.test(rota),
    "marcada só no fim, uma rota que morre no meio manda tudo de novo na proxima chamada",
  );
  conferir(
    "quem já recebeu sai pela consulta, e não por lista escrita antes",
    /from\("jornada_envios"\)\.select\("user_id"\)\.eq\("chave", CHAVE_DO_ENVIO\)/.test(rota),
  );
  conferir("quem pediu para sair também sai", /from\("jornada_saidas"\)\.select\("user_id"\)/.test(rota));
  // A consulta existir não é a trava: a trava é alguém USAR o resultado dela
  // para pular a pessoa. Foi exatamente este o buraco do `conferir:loja` nesta
  // semana, que afirmava a linha vizinha em vez do que estava em uso.
  conferir(
    "e o resultado das duas consultas pula a pessoa de verdade",
    /if \(fora\.has\(userId\)\) continue;/.test(rota),
    "consulta feita e ignorada manda de novo para quem ja recebeu",
  );
  // Enviado e não marcado é o pior estado possível: o e-mail já saiu, não dá
  // para desfazer, e sem a marca a próxima chamada manda de novo. As DUAS
  // formas de aparecer são exigidas separadamente porque servem a pessoas
  // diferentes: o log é o que a Vercel guarda para depois, a falha na resposta
  // é o que quem disparou vê na hora. Aceitar "uma das duas" foi o que deixou
  // o primeiro defeito plantado aqui passar verde.
  conferir(
    "enviar sem marcar fica registrado no log",
    /console\.error\("\[saida\] e-mail enviado e NAO marcado"/.test(rota),
    "sem a marca a proxima chamada manda de novo, e isso nao pode sair calado",
  );
  conferir(
    "e aparece na resposta de quem disparou",
    /enviado_sem_marca/.test(rota),
    "quem disparou precisa saber na hora quem recebeu sem ficar marcado",
  );
  conferir("o teto de tempo está declarado", /maxDuration = \d+/.test(rota), "o padrao do plano e 10s e o disparo morreria no meio");
  conferir("há cópia de prova que não toca na lista", /body\?\.teste/.test(rota));
  conferir(
    "e a resposta do e-mail cai numa caixa lida",
    /reply_to: RESPONDE/.test(rota),
    'o texto diz "e so responder": isso tem de chegar em alguem',
  );
}

// ── 8. A ROTA QUE GRAVA O MOTIVO ───────────────────────────────────────────
{
  const rota = semComentarios(readFileSync(new URL("../app/api/jornada/motivo/route.ts", import.meta.url), "utf8"));
  // A guarda inteira, e não as peças soltas: `const conhecido = MOTIVOS.some(...)`
  // pode existir e não ser usado em lugar nenhum, e aí a conferência ficaria
  // verde afirmando uma linha que não tranca nada.
  conferir(
    "a guarda exige assinatura E motivo conhecido, no mesmo if",
    /!conhecido \|\| !motivoConfere\(u, m, a\)\)/.test(rota),
    "chave antiga de uma pesquisa que mudou nao pode entrar como resposta, e assinatura nao conferida e qualquer um respondendo por qualquer um",
  );
  conferir("o motivo conhecido vem da lista de verdade", /MOTIVOS\.some\(/.test(rota));
  conferir("grava em saida_motivos", /from\("saida_motivos"\)\.insert/.test(rota));
  conferir(
    "e falhar ao gravar NÃO sai calado",
    /console\.error\("\[saida\] motivo NAO gravado"/.test(rota),
    "e a resposta de alguem que se deu ao trabalho de responder",
  );
  conferir(
    "a rota NÃO tem POST que mude coisa sem assinatura",
    !/export async function POST/.test(rota),
    "porta a mais num caminho que grava opiniao de cliente",
  );
}

// ── 9. A RESPOSTA CHEGA A QUEM LÊ ──────────────────────────────────────────
//
// Regra da semana: conserto na fonte que não muda o consumidor não é conserto.
// `linhaDeMotivos` existir não serve de nada se o retrato não a imprimir: o
// dono pediu isto para VER os motivos, e uma função que ninguém chama é um
// monte de código morto com cara de entrega.
{
  const op = semComentarios(readFileSync(new URL("../lib/operacao.ts", import.meta.url), "utf8"));
  conferir("o retrato busca os cliques", /from\("saida_motivos"\)/.test(op));
  conferir("e imprime a linha pronta", /porQueCancelaram: linhaDeMotivos\(/.test(op), "funcao que ninguem chama nao e entrega");
  conferir(
    "o denominador é a contagem da chave do envio",
    /chave === CHAVE_DO_ENVIO_DE_SAIDA/.test(op),
    "sem denominador, 3 respostas podem ser 3 de 4 ou 3 de 300",
  );
  // A chave mora num lugar só. Duas cópias da palavra em dois arquivos é o
  // jeito de o retrato um dia contar uma chave que ninguém envia e dizer
  // "0 de 0" com convicção.
  const rota = semComentarios(readFileSync(new URL("../app/api/email/saida/route.ts", import.meta.url), "utf8"));
  conferir(
    "e a chave do envio é a MESMA nos dois lados",
    /CHAVE_DO_ENVIO = CHAVE_DO_ENVIO_DE_SAIDA/.test(rota) && !/CHAVE_DO_ENVIO = "/.test(rota),
    "chave copiada a mao: no dia em que uma mudar, o denominador vira zero calado",
  );
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) do e-mail de saída reprovaram.`);
  process.exit(1);
}
console.log("Saída: três travas de pé, links assinados por motivo, varredura descartada na leitura.");
