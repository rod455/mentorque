// O time de agentes: os manuais existem, têm régua, e a lista do dono não
// divergiu do código que a lê?
//
// POR QUE ISTO EXISTE (02/10/2026). As regras do time moram em texto, de
// escolha: o dono lê, discorda e apaga quando quiser, o que memória automática
// não permite. O preço dessa escolha é que texto apodrece sem avisar, e aqui ele
// apodrece de três jeitos conhecidos:
//
//   1. a tabela do time cita um manual que não existe mais (renomeado, movido),
//      e o agente abre a rodada lendo um arquivo que não está lá;
//   2. um manual perde a seção "A régua da rodada", e a partir daí a rodada não
//      tem contra o que se medir, nem o Diretor contra o que dar veredito;
//   3. a lista de destinos documentada em `acoes-do-dono.md` e a lista fechada
//      dentro de `scripts/acoes-do-dono.ts` se separam, e aí a documentação
//      ensina um valor que a conferência reprova, ou pior: aceita um valor que
//      agrupa errado.
//
// O terceiro é o que esta casa chama de regra copiada: duas cópias da mesma
// lista em dois arquivos, e a divergência acontece em silêncio.
//
// O QUE ELA NÃO ALCANÇA: se a regra escrita é BOA, e se o agente a seguiu. A
// primeira é do dono, a segunda é do veredito do Diretor na segunda. Aqui só se
// prova que o texto está de pé e coerente.
//
// Rode com: npm run conferir:agentes
import { readFileSync, existsSync } from "node:fs";

const RAIZ = new URL("..", import.meta.url).pathname;
const ler = (p: string) => readFileSync(`${RAIZ}${p}`, "utf8");

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

console.log("Agentes: os manuais do time estão de pé e a lista do dono bate com o código?");

const diretrizes = ler("docs/agentes/DIRETRIZES.md");

// ── 1. A TABELA DO TIME APONTA PARA MANUAL QUE EXISTE ──────────────────────
{
  // As linhas da tabela "O time": | Papel | Onde roda | Cadência | Manual |
  const linhas = [...diretrizes.matchAll(/^\|([^|\n]+)\|([^|\n]+)\|[^|\n]+\|\s*([a-z0-9-]+\.md)\s*\|/gm)].map((m) => ({
    papel: m[1]!.trim(),
    onde: m[2]!.trim(),
    manual: m[3]!,
  }));
  conferir("a tabela do time tem pelo menos oito papéis", linhas.length >= 8, `achei ${linhas.length}`);
  for (const l of linhas) {
    conferir(`o manual ${l.manual} existe`, existsSync(`${RAIZ}docs/agentes/${l.manual}`), "a rodada abre mandando ler este arquivo");
  }

  // ── 2. TODA RODADA DO CLAUDE TEM RÉGUA ─────────────────────────────────
  //
  // Sem régua, a rodada não tem contra o que se medir e o veredito do Diretor
  // vira opinião, que é exatamente o que a régua foi criada para substituir.
  //
  // SÓ AS RODADAS DO CLAUDE, e a distinção é de verdade: o Sentinela e o
  // Analista são fluxos do n8n, sem artifact e sem autoavaliação, e cobrar
  // deles a seção seria cobrar coisa que ninguém escreveu para eles. Fica
  // dito, porque é um fato sobre a operação e não um detalhe deste script:
  // esses dois não se medem contra nada, e quem olha para eles é o Diretor.
  for (const l of linhas.filter((x) => /Rotina Claude/i.test(x.onde))) {
    if (!existsSync(`${RAIZ}docs/agentes/${l.manual}`)) continue;
    const texto = ler(`docs/agentes/${l.manual}`);
    conferir(`${l.manual} tem a seção da régua`, /A r[ée]gua da rodada/i.test(texto), "manual sem regua nao da veredito, da opiniao");
  }
  // E A INVARIANTE QUE FECHA A PORTA DOS FUNDOS: quem roda no Claude é
  // exatamente quem tem régua. Um limiar ("pelo menos sete") deixava mover um
  // papel para o n8n na tabela e, com isso, livrá-lo da cobrança em silêncio,
  // com o manual dele continuando a ter régua. Os dois conjuntos têm de ser o
  // mesmo: se não são, ou a tabela está errada, ou o manual está.
  const doClaude = linhas.filter((x) => /Rotina Claude/i.test(x.onde)).map((x) => x.manual);
  const comRegua = linhas
    .filter((x) => existsSync(`${RAIZ}docs/agentes/${x.manual}`) && /A r[ée]gua da rodada/i.test(ler(`docs/agentes/${x.manual}`)))
    .map((x) => x.manual);
  const sobrando = comRegua.filter((m) => !doClaude.includes(m));
  const faltando = doClaude.filter((m) => !comRegua.includes(m));
  conferir(
    "quem roda no Claude é exatamente quem tem régua",
    sobrando.length === 0 && faltando.length === 0,
    `com régua e fora do Claude: ${sobrando.join(", ") || "nenhum"}; no Claude e sem régua: ${faltando.join(", ") || "nenhum"}`,
  );
}

// ── 3. AS CINCO OBRIGAÇÕES QUE VALEM PARA TODOS ────────────────────────────
//
// As duas primeiras são de 19/09 (medir-se contra a régua, e o Diretor
// corrigindo de fora). As duas de 02/10 nasceram do caso do ASO: duas rodadas
// corretas produziram ZERO respostas públicas, porque o que depende do dono foi
// explicado em lugar onde se explica em vez de virar linha na lista dele.
{
  conferir(
    "a rodada se mede contra a própria régua antes de publicar",
    /se mede contra a pr[óo]pria r[ée]gua/i.test(diretrizes),
  );
  conferir("o Diretor corrige de fora", /O Diretor corrige de fora/i.test(diretrizes));
  conferir(
    "recomendação que depende do dono vira linha na lista dele",
    /LINHA NA LISTA DELE/.test(diretrizes),
    "explicar no diario e no artifact e o que falhou duas vezes seguidas em setembro",
  );
  conferir(
    "e a rodada abre fechando o desfecho, com a regra dos 21 dias",
    /21 dias/.test(diretrizes) && /CUSTO DE HOJE/i.test(diretrizes),
    "recomendacao velha nao e so esquecida: pode ter deixado de ser verdade",
  );
  conferir(
    "antes de levantar algo, procurar se já foi levantado",
    /antes de "levantar"/i.test(diretrizes),
    "a mesma pergunta foi levantada por dois papeis em 04/09 e 15/09, sem uma saber da outra",
  );

  // E A FRASE QUE APRESENTA A LISTA CONTA CERTO QUANTAS SÃO. Em 03/10 ela dizia
  // "Duas obrigações saem disso" com QUATRO itens embaixo: ela envelheceu na
  // segunda e na terceira vez que a lista cresceu, sem ninguém notar. Título que
  // não bate com o conteúdo é o primeiro sinal de doc apodrecendo, e é o mesmo
  // defeito que a skill `conferir-que-morde` já pega no título dela.
  const NUMERO: Record<string, number> = { Uma: 1, Duas: 2, Três: 3, Quatro: 4, Cinco: 5, Seis: 6, Sete: 7 };
  const anuncio = diretrizes.match(/^(\w+) obrigações saem disso/m)?.[1] ?? "";
  const bloco = diretrizes.split(/^\w+ obrigações saem disso[^\n]*$/m)[1]?.split(/^\*\*/m)[0] ?? "";
  const itens = (bloco.match(/^\d+\. \*\*/gm) ?? []).length;
  conferir(
    "e a frase que apresenta as obrigações conta certo quantas são",
    NUMERO[anuncio] === itens,
    `a frase diz "${anuncio}" (${NUMERO[anuncio] ?? "?"}) e a lista tem ${itens} itens`,
  );
}

// ── 4. O CRUZAMENTO DA SEMANA É TRABALHO DO DIRETOR ────────────────────────
{
  const diretor = ler("docs/agentes/diretor.md");
  conferir(
    "o Diretor cruza a semana, e não só dá veredito por rodada",
    /CRUZAMENTO DA SEMANA/i.test(diretor),
    "tres das quatro rodadas de 29/09 a 02/10 falharam pelo mesmo motivo e nenhum veredito individual enxergaria",
  );
  conferir(
    "e o cruzamento tem os dois tipos que contam",
    /mesmo TIPO de erro/.test(diretor) && /mesmo PEDIDO/.test(diretor),
    "sem os dois tipos a pergunta vira resenha",
  );
}

// ── 5. A LISTA DE DESTINOS NÃO DIVERGIU DO CÓDIGO ──────────────────────────
//
// Duas cópias da mesma lista em dois arquivos divergem em silêncio. O teste é
// a interseção exata, nos dois sentidos: destino no código e não documentado
// não é usado por ninguém; destino documentado e não no código é reprovado na
// hora em que alguém o usar.
{
  const script = ler("scripts/acoes-do-dono.ts");
  const doc = ler("docs/agentes/acoes-do-dono.md");

  const noCodigo = (script.match(/const DESTINOS = \[([^\]]+)\]/)?.[1] ?? "")
    .split(",")
    .map((s) => s.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);
  conferir("a lista de destinos existe no código", noCodigo.length >= 5, noCodigo.join(", "));

  const naDoc = (doc.match(/Os destinos v[áa]lidos:([\s\S]*?)\n\n/)?.[1] ?? "").match(/`([a-z0-9-]+)`/g) ?? [];
  const documentados = naDoc.map((s) => s.replace(/`/g, ""));
  conferir("e está documentada no arquivo da lista", documentados.length >= 5, documentados.join(", "));

  for (const d of noCodigo) {
    conferir(`o destino "${d}" do código está documentado`, documentados.includes(d), "destino que o codigo aceita e ninguem sabe que existe");
  }
  for (const d of documentados) {
    conferir(`o destino "${d}" documentado existe no código`, noCodigo.includes(d), "a doc ensina um valor que a conferencia vai reprovar");
  }

  // E todo destino usado de verdade na tabela tem que estar nas duas listas,
  // senão a conferência da lista já teria reprovado, mas o agrupamento sairia
  // com uma sessão de um item e ninguém olharia duas vezes.
  const usados = [...doc.matchAll(/^\| \d{4}-\d{2}-\d{2} \| ([a-z-]+) \|/gm)].map((m) => m[1]!);
  for (const d of new Set(usados)) {
    conferir(`o destino "${d}" usado na tabela é conhecido`, noCodigo.includes(d), "agrupa errado com o total continuando certo");
  }
}


// ── 6. O CRITÉRIO 10 DO GUARDIÃO, E A SKILL QUE O ENTREGA ──────────────────
//
// POR QUE ISTO VIROU ASSERÇÃO (03/10/2026). A lição é que conferência que
// afirma a regra e não afirma QUEM USA a regra fica verde com o defeito de pé:
// aconteceu cinco vezes em dois dias. Ela entrou na régua do Guardião, que roda
// aos sábados, E na skill `conferir-que-morde`, que carrega sozinha em QUALQUER
// sessão que escreva conferência.
//
// Os dois lugares, e não um: lição que mora só no manual de sábado não chega na
// terça, quando alguém escreve a conferência. É a própria regra aplicada a ela
// mesma, e é por isso que esta seção confere os DOIS.
{
  const guardiao = ler("docs/agentes/guardiao-conferencias.md");
  conferir(
    "a régua do Guardião cobra plantio em quem USA a regra",
    /QUEM USA a regra/.test(guardiao),
    "sem criterio, o veredito do Diretor nao tem contra o que cobrar isso",
  );
  // A TABELA DOS CASOS, e não a menção ao nome. `conferir:loja` aparece em
  // outro lugar deste manual (a fila), então procurar o nome passava verde com
  // a tabela apagada. É o defeito desta própria lição, no texto que a explica.
  conferir(
    "e mostra os casos que a justificam, na tabela",
    /o que o plantio provou/.test(guardiao) && (guardiao.match(/passava verde/g) ?? []).length >= 4,
    "regra sem o caso que a gerou e a primeira a ser esquecida",
  );

  const skill = ler(".claude/skills/conferir-que-morde/SKILL.md");
  conferir(
    "a skill carrega a mesma lição",
    /afirma a regra e não afirma quem a usa/i.test(skill),
    "a regua roda sabado; a skill carrega em toda sessao que escreve conferencia",
  );
  conferir(
    "e manda plantar DOIS defeitos, um em cada lado",
    /DOIS plantios por conserto/.test(skill),
    "plantar so na regra e exatamente o defeito que a licao descreve",
  );
  conferir(
    "a skill manda conferir verde ANTES e DEPOIS do plantio",
    /ja estava vermelha/.test(skill) && /ficou vermelha depois/.test(skill),
    "sem isso, MORDEU pode ser so a falha antiga respondendo ao defeito novo (03/10, tres vezes no mesmo laco)",
  );
  conferir(
    "o título da seção conta certo quantos jeitos existem",
    /## Os seis jeitos de passar verde/.test(skill),
    "a skill tinha quatro e ganhou o quinto: titulo que nao bate com o conteudo e o primeiro sinal de doc apodrecendo",
  );
}


// ── 7. O RETORNO DO DONO AO GUARDIÃO NÃO PODE SUMIR ────────────────────────
//
// Ele mandou escrever o retorno da rodada de 03/10 no manual, que é onde o
// agente lê antes de cada rodada. Retorno que mora só no diário ou no chat é
// retorno que não chega: é a mesma regra que DIRETRIZES ganhou no mesmo dia
// sobre recomendação que depende de outro.
{
  const manualDoGuardiao = ler("docs/agentes/guardiao-conferencias.md");
  conferir("o retorno do dono está no manual do Guardião", /## Retorno do dono sobre a rodada/.test(manualDoGuardiao));

  // SÓ A SEÇÃO DO RETORNO, e não o manual inteiro. Duas das frases cobradas
  // aqui ("39 nunca provadas" e "105 segundos") existem também nos
  // Aprendizados, então procurar no arquivo todo deixava apagar o caso de
  // dentro do retorno e ficar verde. Plantado em 03/10, passou verde, e é o
  // critério 10 aplicado ao próprio texto: afirmar o lugar que decide.
  const secao = (manualDoGuardiao.split(/^## Retorno do dono sobre a rodada[^\n]*$/m)[1] ?? "")
    .split(/^## /m)[0]!
    .replace(/\s+/g, " ");
  conferir("a seção do retorno tem conteúdo", secao.length > 400, `${secao.length} caracteres`);
  conferir(
    "e cobra as três coisas, com o caso de cada uma DENTRO dela",
    /39 nunca provadas/.test(secao) && /envelhece calada/i.test(secao) && /105 segundos/.test(secao),
    "retorno sem o caso que o gerou e opiniao, e opiniao nao muda rodada nenhuma",
  );
  conferir(
    "e diz o que MANTER, não só o que consertar",
    /do melhor tipo que existe aqui/i.test(secao),
    "retorno so com o que esta errado ensina a esconder, nao a melhorar",
  );
}


// ── 8. A VISÃO DA FILA, A PARTIR DE 03/10 ──────────────────────────────────
//
// Decisão do dono: "as que têm mais de 15 dias, já foi; vamos corrigir e
// garantir que estamos tendo uma visão clara a partir de agora". As duas metades
// disso moram no manual e a `conferir:fila` cobra a tabela; aqui se cobra que o
// MANUAL continue explicando as duas, porque número sem a regra ao lado volta a
// ser lido errado na semana seguinte.
{
  const g = ler("docs/agentes/guardiao-conferencias.md").replace(/\s+/g, " ");
  conferir(
    "o manual proíbe o estado `nunca` daqui para a frente",
    /É PROIBIDO A PARTIR DE 03\/10\/2026/.test(g),
    "sem isso, conferencia nova sem plantio volta a entrar na fila como divida",
  );
  conferir(
    "e o critério 11 manda copiar o número do comando",
    /Os números publicados saíram de um comando/.test(g) && /Copie a linha. Não conte/.test(g),
    "a rodada de 03/10 publicou um numero contado a olho que media outra coisa",
  );
}

// ── 9. TODA RODADA TEM VEREDITO NO MANUAL DO PAPEL ─────────────────────────
//
// POR QUE ISTO EXISTE (03/10/2026). O dono perguntou se a casa havia dado
// retorno a todos os agentes na semana. Medido: oito rodadas entre 27/09 e
// 03/10 e UM manual com retorno desta semana, o do Guardião, que só tinha
// porque ele pediu. Os seis vereditos que o Diretor escreveu em 28/09 estavam
// todos no DIARIO e nenhum no manual do papel julgado, então nenhum dos seis
// leu o veredito antes da rodada seguinte. Virou a obrigação 5 de DIRETRIZES.
//
// O DESENHO IMPORTA, e é o que faz esta conferência não apodrecer: ela NÃO
// compara com o dia de hoje. Ela compara a data da rodada mais nova no diário
// com a data do retorno mais novo no manual. Conferência que olha o relógio
// fica vermelha sozinha num domingo e ensina a afrouxar o número; esta só fica
// vermelha quando alguém acrescenta uma rodada ao diário e não escreve o
// veredito dela, que é exatamente o momento em que ela deve gritar.
//
// A FOLGA DE DEZ DIAS é a cadência, não cortesia: as rodadas são semanais e o
// veredito sai na segunda, então o vão normal entre uma rodada e o retorno
// anterior chega a sete ou oito dias. Dez deixa o ritmo passar e pega duas
// segundas puladas.
//
// O QUE ELA NÃO ALCANÇA, e são três coisas:
//
//   1. se o veredito é JUSTO (isso é do dono) e se o agente mudou por causa
//      dele (isso aparece na rodada seguinte);
//   2. rodada cujo título do diário NÃO comece com `data · Papel`, porque é
//      assim que ela acha as rodadas. Uma entrada escrita como "Rodada do CRO"
//      fica invisível aqui, e a conferência diria 0 dias de atraso com o
//      veredito faltando. A convenção é a que as 60 entradas de rodada já
//      usam, e quebrá-la não reprova nada: é um buraco declarado, não coberto;
//   3. papel que PAROU de rodar. Sem rodada nova, não há veredito a cobrar, e a
//      linha impressa diz "nenhuma rodada no diário" sem reprovar. Quem olha
//      para papel parado é o Diretor na leitura do mês.
{
  const diario = ler("docs/agentes/DIARIO.md");
  const linhas = [...diretrizes.matchAll(/^\|([^|\n]+)\|([^|\n]+)\|[^|\n]+\|\s*([a-z0-9-]+\.md)\s*\|/gm)]
    .map((m) => ({ papel: m[1]!.trim(), onde: m[2]!.trim(), manual: m[3]! }))
    .filter((l) => /Rotina Claude/i.test(l.onde) && existsSync(`${RAIZ}docs/agentes/${l.manual}`));

  const DIA = 86400000;
  const resumo: string[] = [];

  for (const l of linhas) {
    // O apelido com que o papel assina no diário é a primeira palavra do nome
    // dele na tabela: "QA/Produto" assina "QA agendado" e "QA/Produto";
    // "Segurança e dependências" assina "Segurança (rodada 2)". Derivado da
    // tabela de propósito: uma segunda lista de nomes aqui seria regra copiada,
    // que é o erro que a seção 5 deste arquivo existe para pegar.
    const apelido = l.papel.split(/[\s/]/)[0]!;
    const rodadas = [...diario.matchAll(new RegExp(`^## (\\d{4})-(\\d{2})-(\\d{2}) · ${apelido}`, "gmu"))].map(
      (m) => Date.UTC(+m[1]!, +m[2]! - 1, +m[3]!),
    );
    if (rodadas.length === 0) {
      resumo.push(`${l.manual}: nenhuma rodada no diário`);
      continue;
    }
    const ultimaRodada = Math.max(...rodadas);

    const retornos = [...ler(`docs/agentes/${l.manual}`).matchAll(
      /^## Retorno do dono sobre a rodada de (\d{2})\/(\d{2})\/(\d{4})/gm,
    )].map((m) => Date.UTC(+m[3]!, +m[2]! - 1, +m[1]!));

    conferir(
      `${l.manual} tem retorno do dono sobre alguma rodada`,
      retornos.length > 0,
      "veredito que mora so no diario nao chega a quem ele deveria mudar (obrigacao 5 de DIRETRIZES)",
    );
    if (retornos.length === 0) continue;

    const ultimoRetorno = Math.max(...retornos);
    const atraso = Math.round((ultimaRodada - ultimoRetorno) / DIA);
    conferir(
      `o veredito de ${l.manual} acompanha a última rodada dele`,
      atraso <= 10,
      `rodada de ${new Date(ultimaRodada).toISOString().slice(0, 10)} e retorno de ` +
        `${new Date(ultimoRetorno).toISOString().slice(0, 10)}: ${atraso} dias sem veredito no manual`,
    );
    resumo.push(`${l.manual}: ${atraso} dia(s)`);

    // E O RETORNO TEM QUE TER AS DUAS METADES. Retorno só com o que está errado
    // ensina a esconder, não a melhorar, e foi o dono quem pediu as duas ao
    // ler a rodada do Guardião. A seção cobrada é a MAIS NOVA, não o arquivo:
    // procurar no manual inteiro passaria verde com a seção de hoje vazia e a
    // de setembro respondendo por ela.
    const todas = ler(`docs/agentes/${l.manual}`).split(/^## Retorno do dono sobre a rodada de /m);
    const maisNova = todas[todas.length - 1]!.split(/^## /m)[0]!;
    conferir(
      `o retorno de ${l.manual} diz o que MANTER, não só o que consertar`,
      /o que manter/i.test(maisNova),
      "retorno so com o que esta errado ensina a esconder",
    );
    conferir(
      `e cobra pelo menos dois pontos, com a seção cheia`,
      maisNova.replace(/\s+/g, " ").length > 800 && /\*\*1\./.test(maisNova) && /\*\*2\./.test(maisNova),
      `${maisNova.replace(/\s+/g, " ").length} caracteres na seção mais nova`,
    );
  }

  conferir("a obrigação 5 está escrita em DIRETRIZES", /VEREDITO DE UMA RODADA É ESCRITO NO MANUAL/.test(diretrizes));
  conferir(
    "e o manual do Diretor diz onde o veredito é escrito",
    /ONDE O VEREDITO É ESCRITO/.test(ler("docs/agentes/diretor.md")),
    "a obrigacao vale para todos, mas quem escreve o veredito e ele",
  );
  console.log(`       ATRASO DO VEREDITO, POR PAPEL: ${resumo.join("; ")}.`);
}


// ── 7. O DIÁRIO EM ORDEM, ASSINADO, E A FILA ENTRE PAPÉIS (06/10/2026) ───────
//
// Leitura de outubro do Diretor: a conferência só cobra rodada que consegue
// achar, e ela acha pelo título `data · Papel`. O diário estava fora de ordem
// em três pontos e 134 entradas numeradas não tinham papel. Daqui para a
// frente: decrescente por data, sem exceção, e título assinado a partir de
// 06/10. As entradas anteriores ficam como estão, de propósito.
{
  const diario = ler("docs/agentes/DIARIO.md");
  const datas = [...diario.matchAll(/^## (\d{4}-\d{2}-\d{2})/gm)].map((m) => m[1]!);
  let foraDeOrdem = "";
  for (let i = 1; i < datas.length; i++) {
    if (datas[i]! > datas[i - 1]!) { foraDeOrdem = `${datas[i]} aparece abaixo de ${datas[i - 1]}`; break; }
  }
  conferir(
    "o diário está em ordem decrescente de data",
    datas.length > 10 && !foraDeOrdem,
    foraDeOrdem || `${datas.length} entradas`,
    );

  // Mesma leitura da tabela do time que a seção 1 faz: derivada, não copiada.
  const APELIDOS = new Set<string>(["Engenharia"]);
  for (const m of diretrizes.matchAll(/^\|([^|\n]+)\|([^|\n]+)\|[^|\n]+\|\s*([a-z0-9-]+\.md)\s*\|/gm)) {
    const papel = m[1]!.trim();
    if (papel !== "Papel") APELIDOS.add(papel.split(/[\s/]/)[0]!);
  }
  const semAssinatura = [...diario.matchAll(/^## (\d{4}-\d{2}-\d{2})(?: \([^)]*\))? · ([^:\n]+)/gm)]
    .filter((m) => m[1]! >= "2026-10-06" && !APELIDOS.has(m[2]!.trim()))
    .map((m) => m[0].slice(0, 70));
  const semPonto = [...diario.matchAll(/^## (\d{4}-\d{2}-\d{2})[^\n]*$/gm)]
    .filter((m) => m[1]! >= "2026-10-06" && !/ · [^:\n]+:/.test(m[0]))
    .map((m) => m[0].slice(0, 70));
  conferir(
    "toda entrada do diário desde 06/10 assina o papel no título (`data · Papel: título`)",
    semAssinatura.length === 0 && semPonto.length === 0,
    [...semAssinatura, ...semPonto].slice(0, 3).join(" | ") || "",
  );
  conferir("e a regra da ordem e da assinatura está em DIRETRIZES", /decrescente por data, sem exceção/.test(diretrizes) && /assina \*\*Engenharia\*\*/.test(diretrizes));

  conferir("a fila entre papéis existe", existsSync(`${RAIZ}docs/agentes/entre-papeis.md`), "DIRETRIZES, 'A fila entre papéis'");
  conferir("e DIRETRIZES manda quem recebe abrir a rodada por ela", /abre lendo a fila/i.test(diretrizes));
  conferir("e o script dela deriva os papéis da tabela, não de uma lista própria", /DIRETRIZES\.md/.test(ler("scripts/entre-papeis.ts")) && !/const PAPEIS = new Set<string>\(\["Diretor"/.test(ler("scripts/entre-papeis.ts")), "segunda lista de papeis e regra copiada");
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) do time de agentes reprovaram.`);
  process.exit(1);
}
console.log("Agentes: manuais no lugar, todos com régua, as cinco obrigações escritas, veredito no manual de cada papel e a lista de destinos batendo com o código.");
