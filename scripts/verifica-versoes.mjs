// A versão do app mora em três lugares que não conversam entre si:
//
//   lib/app/content.ts          APP_VERSION   → o que o app DIZ que é
//   android/app/build.gradle    versionName   → o que a Play publica
//   ios/.../project.pbxproj     MARKETING_VERSION → o que a App Store publica
//
// Os dois últimos são obrigatórios para enviar; o primeiro não é obrigatório
// para nada, e foi exatamente por isso que ele apodreceu: ficou em "1.2.0"
// durante a 1.3 e a 1.4 inteiras. O estrago apareceu em 29/08, quando o funil
// foi consultado para responder "este iPhone está na 1.4?" e respondeu
// "1.2.0" para todos os aparelhos, de todas as versões, desde sempre.
//
// Esta conferência existe para o número mentiroso nunca mais passar de um
// release. Ela compara só major.minor: o APP_VERSION carrega um terceiro
// dígito que as lojas não usam.
// ────────────────────────────────────────────────────────────────────────────
//
// E EXISTE UM SEGUNDO JEITO DE ERRAR, que esta conferência deixou passar em
// 03/09/2026 e agora também pega.
//
// Naquele dia o build do iPhone foi recusado pela Apple:
//
//   CFBundleShortVersionString [1.6] must contain a higher version than that
//   of the previously approved version [1.6]
//
// E esta conferência tinha aprovado, com razão pela regra antiga: os três
// números concordavam. Todos em 1.6. O que ela não sabia é que 1.6 JÁ TINHA
// IDO para as lojas, porque concordância prova consistência, não novidade.
//
// O estrago não foi só o tempo de CI perdido. A Apple recusou o envio, mas a
// Play ACEITOU: foi publicado na faixa interna um binário com o conteúdo da
// 1.7 vestido de 1.6, e o versionCode daquele envio ficou gasto.
//
// Por isso a lista abaixo. Ela é escrita à mão, e a manutenção dela é o preço:
// ao publicar uma versão, acrescente o número aqui. Esquecer é seguro (a
// conferência apenas deixa de avisar), enquanto o contrário, subir de novo uma
// versão já publicada, custa um build inteiro.
const JA_PUBLICADAS = [
  "1.2",
  "1.3",
  "1.4",
  "1.5",
  // Aprovada nas duas lojas em 01/09/2026.
  "1.6",
  // Aprovada na Play em 03/09/2026. Foi nela que o app fechou ao responder o
  // quiz em 04/09, no aparelho de um cliente pagante. Ver
  // docs/qa/app-fecha-no-quiz.md.
  "1.7",
  // Publicada na Play em 04/09/2026, e ESQUECIDA AQUI. Este esquecimento tem
  // preço, e ele foi cobrado em 07/09: com a lista sem a 1.8, esta conferência
  // aprovou o repositório parado na 1.8 e um SEGUNDO build foi enviado à Play
  // com o mesmo nome de versão do que já estava rodando.
  //
  // A Play aceitou, como o comentário lá de cima já avisava que ela aceita. O
  // estrago desta vez não foi versionCode queimado: foi CEGUEIRA. O
  // `funil_eventos.versao` e o `app_erros.versao` carregam o APP_VERSION, então
  // um aparelho com os quatro consertos daquele dia e um sem eles respondem a
  // mesma coisa, "1.8.0", e não há pergunta que separe os dois.
  //
  // O comentário acima diz "esquecer é seguro (a conferência apenas deixa de
  // avisar)". Era o raciocínio certo para o estrago que se conhecia na época, e
  // ficou incompleto: quem esquece de listar a versão publicada também fica sem
  // o aviso de que o repositório PAROU nela. Enquanto a lista for escrita à
  // mão, esta linha aqui é o lembrete de que o preço não é zero.
  "1.8",
  // Enviada à Play em 08/09/2026 com a caixinha do Google quebrada (scopes que
  // o plugin recusa). O dono decidiu pular direto para a 2.0 em 09/09. Fica na
  // lista publicada ou não: nome de versão que já viajou com defeito conhecido
  // não volta, senão o número deixa de dizer qual build a pessoa tem.
  "1.9",
  // Gerada e enviada pelo dono em 09/09/2026, com o conserto dos scopes, o
  // ajuste de foto, a câmera do Android e o "?" flutuante. Acrescentada no
  // mesmo dia, na hora, que é a única forma de esta lista não repetir a 1.8.
  "2.0",
  // Aprovada nas DUAS lojas em 09/09/2026, no mesmo dia em que foi gerada. É a
  // primeira versão a chegar ao iPhone desde a 1.7 (03/09). Acrescentada na
  // hora da aprovação.
  "2.1",
  // Gerada e enviada em 09/09/2026 com o relato do login nativo ligado. Foi ela
  // que trouxe a primeira testemunha do login mudo do Android: "Google Sign-In
  // cancelled by user", e nada mais. Acrescentada em 10/09, ao abrir a 2.3.
  "2.2",
  // Gerada e enviada em 10/09/2026 com o "cancelado" do Google falando. Foi a
  // linha dela que mostrou a SHA-1 não cadastrada, e a mesma 2.3 logou no
  // Android às 10:19 UTC depois do cadastro. Acrescentada ao abrir a 2.4.
  "2.3",
  // Enviada em 11/09/2026 com os cinco momentos de recorrência, o carro
  // repetido, o onboarding do Android no carro e o ícone do aviso. Aprovada
  // na Play em 12/09; Apple em análise no mesmo dia. Acrescentada em 12/09.
  "2.4",
  // Gerada pelo dono no Codemagic em 13/09/2026 e ACRESCENTADA AQUI SÓ EM
  // 14/09, com um dia de atraso. A prova de que ela viajou não veio de
  // ninguém avisar, veio do banco: `metricas_diarias` de 14/09, fonte
  // `app_store_connect`, traz a 2.5 em WAITING_FOR_REVIEW criada em
  // 13/09 11:20 (hora do Pacífico), e `funil_eventos` tem 61 eventos de
  // `2.5.0` no Android entre 13 e 14/09, mais 6 no iPhone em 13/09.
  //
  // O PREÇO DO DIA DE ATRASO, e é o motivo desta nota existir: durante ele
  // esta conferência respondia "2.5, ainda não publicada", que é exatamente
  // a luz verde que ela existe para não dar. Um build gerado nesse dia teria
  // morrido no fim do caminho, com a Apple recusando o nome repetido.
  // A regra continua a mesma desde a 1.8: acrescentar NA HORA do envio, não
  // na hora da aprovação.
  "2.5",
  // Enviada pelo dono em 16/09/2026 e ACRESCENTADA AQUI EM 17/09, de novo com
  // um dia de atraso, pelo terceiro release seguido. A prova, do banco e não
  // da lembrança: `metricas_diarias` de 17/09, fonte `app_store_connect`,
  // traz a 2.6 em WAITING_FOR_REVIEW criada em 16/09 03:41 (Pacífico), e
  // `funil_eventos` tem 23 eventos de `2.6.0` em 9 aparelhos Android desde
  // 15/09, mais 1 no iPhone em 16/09.
  //
  // O ATRASO SE REPETE PORQUE A REGRA MORA NO LUGAR ERRADO: ela está escrita
  // na nota da 2.5 e em docs/lojas, ou seja, em texto que alguém precisa
  // lembrar de ler no momento do envio. Enquanto não houver algo que cobre
  // isto sozinho, o terceiro atraso vira o quarto.
  "2.6",
  // Enviada em 16/09/2026 (build 66) e aprovada nas duas lojas em 17/09.
  // ACRESCENTADA NA HORA do aviso do dono, e não no dia seguinte: é a
  // primeira vez em quatro releases que isto não atrasa. Os três anteriores
  // (1.8, 2.5 e 2.6) passaram um dia com a lista mentindo "ainda não
  // publicada", que é exatamente a luz verde que esta conferência existe para
  // não dar.
  "2.7",
  // Build 68, aprovada nas duas lojas e CONFERIDA em 25/09 de dois jeitos
  // independentes, porque a fonte do Play no retrato não traz versão: o
  // App Store Connect responde READY_FOR_SALE desde 24/09, e 30 aparelhos
  // Android já reportaram `2.8.0` no próprio funil. Acrescentada na hora do
  // aviso do dono, como a 2.7.
  "2.8",
  // Build 69, aprovada na Play primeiro e pela Apple em 30/09/2026.
  // Acrescentada na hora do aviso do dono, como a 2.7 e a 2.8.
  //
  // A PROVA DO ANDROID NÃO DEPENDEU DE NINGUÉM: 84 aparelhos já reportavam
  // `versao = 2.9.0` no nosso próprio funil desde 28/09, o mais recente às
  // 22h08 de 30/09. A do iPhone ainda NÃO existe do lado de cá, e isso está
  // escrito de propósito: a coleta do `app_store_connect` é das 6h e, naquela
  // hora, a 2.9 respondia WAITING_FOR_REVIEW. A aprovação veio depois. O
  // retrato de amanhã confere sozinho; se não trouxer READY_FOR_SALE, o campo
  // `ios` de app/api/app/latest/route.ts é o primeiro lugar a olhar.
  "2.9",
  // Publicada nas DUAS lojas em 05/10/2026, build 70, aviso do dono ("Build 70
  // no ar tanto Android quanto iOS"). A prova do Android não dependeu de
  // ninguém: 29 aparelhos Android já reportavam `versao = 3.0.0` no nosso
  // funil, o mais recente às 20h39 de 05/10. No iPhone, 1 aparelho (04/10, à
  // noite, TestFlight do dono); a aprovação da Apple se confere no retrato do
  // `app_store_connect` de 06/10, que é colhido às 6h.
  "3.0",
];

// O BUILD DE CADA VERSÃO PUBLICADA (30/09/2026).
//
// POR QUE ESTE MAPA NASCEU, e nasceu de um defeito plantado que PASSOU VERDE.
// Ao publicar a 2.9 eu plantei "o campo `android` ficou em 68 enquanto a
// `versao` virou 2.9" e esta conferência aprovou. O estrago desse estado é
// silencioso e é exatamente o de 25/09: o repositório declara a versão nova
// publicada, a lista concorda, o campo `versao` concorda, e o banner CONTINUA
// APAGADO, porque quem está na 2.8 tem o build 68 e o aviso só acende para
// quem está abaixo do número. Ninguém é chamado para atualizar e nada reprova.
//
// A conferência de 25/09 amarrou `versao` à lista. Faltava amarrar o NÚMERO,
// que é o único campo que o app de fato lê.
//
// O preço é escrever o build aqui também, e a duplicação é de propósito: é a
// mesma ideia dos três lugares da versão de marketing, onde dois arquivos
// discordando é o que denuncia o esquecimento de um deles.
const BUILD_PUBLICADO = {
  "1.6": 52,
  "1.7": 55,
  "2.4": 63,
  "2.6": 66,
  "2.7": 67,
  "2.8": 68,
  "2.9": 69,
  "3.0": 70,
};

// A ÁRVORE DE CADA BUILD PUBLICADO (06/10/2026).
//
// POR QUE ESTE MAPA NASCEU. A 3.0 (build 70) saiu da árvore 748fedf às 18h07
// UTC de 04/10. O Início novo e a aba Biela entraram na `main` às 22h56 UTC do
// mesmo dia, no commit 28f13e1, e a nota das lojas, a ficha da versão e o
// caderno de apostas disseram que o binário tinha os dois. O dono abriu a 3.0
// no iPhone em 06/10 e viu a aba "Problemas". Ninguém releu a árvore do build
// antes de escrever o que ele continha; o git sabia desde o primeiro minuto
// (28f13e1 não é ancestral de 748fedf) e ninguém perguntou.
//
// Com o mapa, a ficha `docs/lojas/novidades-<versão>.md` declara a árvore e
// cita o commit de cada item do binário, e a conferência pergunta ao git se
// cada commit está dentro da árvore. A manutenção é escrever o commit AQUI e
// na ficha na hora de apertar o botão do Codemagic, não depois.
const ARVORE_DO_BUILD = {
  "3.0": "748fedf",
};

import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const raiz = new URL("..", import.meta.url);
const ler = (p) => readFileSync(new URL(p, raiz), "utf8");

function pegar(arquivo, regex, nome) {
  const m = ler(arquivo).match(regex);
  if (!m) {
    console.error(`Versões: não achei ${nome} em ${arquivo}.`);
    process.exit(1);
  }
  return m[1];
}

const curta = (v) => v.split(".").slice(0, 2).join(".");

const app = pegar("lib/app/content.ts", /APP_VERSION\s*=\s*"([^"]+)"/, "APP_VERSION");
const android = pegar("android/app/build.gradle", /versionName\s+"([^"]+)"/, "versionName");
const ios = pegar("ios/App/App.xcodeproj/project.pbxproj", /MARKETING_VERSION\s*=\s*([0-9.]+)\s*;/, "MARKETING_VERSION");

const alvo = curta(android);
const erros = [];
if (curta(app) !== alvo) erros.push(`APP_VERSION (${app}) não bate com o versionName do Android (${android})`);
if (curta(ios) !== alvo) erros.push(`MARKETING_VERSION do iOS (${ios}) não bate com o versionName do Android (${android})`);

if (erros.length) {
  console.error("Versões divergentes:");
  for (const e of erros) console.error(`  - ${e}`);
  console.error("\nAo subir de versão, os três mudam juntos: lib/app/content.ts,");
  console.error("android/app/build.gradle e o MARKETING_VERSION do projeto iOS.");
  process.exit(1);
}

if (JA_PUBLICADAS.includes(alvo)) {
  console.error(`Versão ${alvo} JÁ FOI PUBLICADA nas lojas.`);
  console.error("");
  console.error("A Apple recusa um envio com nome de versão já aprovado, e o build");
  console.error("inteiro se perde no fim do caminho. A Play aceita, o que é pior:");
  console.error("publica conteúdo novo vestido de versão velha e queima o versionCode.");
  console.error("");
  console.error("Suba a versão nos três lugares antes de mandar para as lojas:");
  console.error("  lib/app/content.ts        APP_VERSION");
  console.error("  android/app/build.gradle  versionName");
  console.error("  ios/.../project.pbxproj   MARKETING_VERSION (duas ocorrências)");
  console.error("");
  console.error("E acrescente a versão publicada à lista JA_PUBLICADAS deste arquivo.");
  process.exit(1);
}

// ── O BANNER APONTA PARA A ÚLTIMA VERSÃO PUBLICADA? (25/09/2026) ───────────
//
// O CASO, e ele é pequeno e humilhante. A 2.8 foi aprovada, entrou em
// JA_PUBLICADAS, o repositório abriu a 2.9, tudo verde. E o banner de "versão
// nova disponível" continuou em 67, porque a troca do número em
// app/api/app/latest/route.ts não foi feita: uma substituição de texto não
// casou, falhou CALADA, e o commit foi empurrado dizendo que tinha acendido.
//
// O dono descobriu do jeito mais caro possível: abrindo o próprio app e não
// vendo o aviso. Antes de achar a causa, meia hora foi gasta investigando
// cache de borda da Vercel, porque a resposta do endereço era coerente com um
// cache velho e coerente também com "ninguém trocou o número".
//
// Os dois passos são UM só na prática e estavam separados: acrescentar a
// versão à lista de publicadas e acender o banner para ela. Agora o segundo
// não pode ficar para trás sem reprovar.
const rota = ler("app/api/app/latest/route.ts");
const mRota = rota.match(/versao:\s*"([\d.]+)"/);
const ultimaPublicada = JA_PUBLICADAS[JA_PUBLICADAS.length - 1];

if (!mRota) {
  console.error("Versões: não achei o campo `versao` em app/api/app/latest/route.ts.");
  console.error("Ele existe para amarrar o banner à última versão publicada.");
  process.exit(1);
}
if (mRota[1] !== ultimaPublicada) {
  console.error(`Banner de versão nova aponta para ${mRota[1]}, e a última publicada é ${ultimaPublicada}.`);
  console.error("");
  console.error("Quem está na versão anterior NÃO vê o aviso de atualizar, e o app");
  console.error("deles segue com defeitos já corrigidos. Abra");
  console.error("app/api/app/latest/route.ts e troque os TRÊS campos:");
  console.error("  android  o versionCode da Play em Produção, Códigos de versão");
  console.error("  ios      o número de build no App Store Connect, Pronta para venda");
  console.error(`  versao   "${ultimaPublicada}"`);
  console.error("");
  console.error("Os dois primeiros são números de BUILD e não a versão de marketing.");
  process.exit(1);
}

// ── E O NÚMERO DO BANNER É O DA ÚLTIMA PUBLICADA? (30/09/2026) ─────────────
//
// O campo `versao` acima é decorativo para o app: ele lê `android` e `ios`.
// Então declarar a 2.9 publicada com o build da 2.8 nos dois campos deixa o
// banner APAGADO e tudo verde, que foi o defeito plantado que passou em
// 30/09. Aqui o número é cobrado contra o mapa `BUILD_PUBLICADO`.
const buildEsperado = BUILD_PUBLICADO[ultimaPublicada];
// Os dois campos são lidos AQUI, e não reaproveitados da conferência do piso
// logo abaixo: a primeira versão desta checagem usava a variável daquele
// bloco, que só é declarada depois, e o script inteiro passou a morrer com
// `Cannot access 'mAndroid' before initialization`. Três defeitos plantados
// disseram "mordeu" enquanto o verdadeiro estava no original derrubado.
// Conferência que derruba sem imprimir falha não provou nada.
const mAndroidBanner = rota.match(/android:\s*(\d+)/);
const mIos = rota.match(/ios:\s*(\d+)/);
if (buildEsperado === undefined) {
  console.error(`Não sei com que build a ${ultimaPublicada} foi publicada.`);
  console.error("");
  console.error("Acrescente a linha em BUILD_PUBLICADO, no topo deste arquivo:");
  console.error(`  "${ultimaPublicada}": <o codigo da Play em Producao, Codigos de versao>,`);
  console.error("");
  console.error("Sem isso o banner pode ficar apagado com tudo verde: o app lê");
  console.error("`android` e `ios`, e o campo `versao` não muda nada para quem consome.");
  process.exit(1);
}
if (!mIos || !mAndroidBanner) {
  console.error("Versões: não achei os campos `android`/`ios` em app/api/app/latest/route.ts.");
  process.exit(1);
}
const erradosDoBanner = [];
if (Number(mAndroidBanner[1]) !== buildEsperado) erradosDoBanner.push(`android está ${mAndroidBanner[1]}, e a ${ultimaPublicada} saiu com ${buildEsperado}`);
if (Number(mIos[1]) !== buildEsperado) erradosDoBanner.push(`ios está ${mIos[1]}, e a ${ultimaPublicada} saiu com ${buildEsperado}`);
if (erradosDoBanner.length) {
  console.error(`Banner diz ${ultimaPublicada}, mas aponta para build de outra versão:`);
  for (const e of erradosDoBanner) console.error(`  - ${e}`);
  console.error("");
  console.error("O app lê `android` e `ios`, não o campo `versao`. Com o número");
  console.error("atrasado, QUEM ESTÁ NA VERSÃO ANTERIOR NÃO VÊ O AVISO, e nada");
  console.error("reprova: é o silêncio de 25/09 em outra forma.");
  console.error("");
  console.error("Se o build da loja for outro, corrija nos DOIS lugares: o campo");
  console.error("da rota e a linha em BUILD_PUBLICADO deste arquivo.");
  process.exit(1);
}

// ── O PISO DO versionCode PASSOU O QUE JÁ FOI PUBLICADO? (28/09/2026) ──────
//
// A Play RECUSA um versionCode menor ou igual ao maior já enviado, e um número
// recusado fica queimado do mesmo jeito. O CI calcula
// `PROJECT_BUILD_NUMBER + 1` e usa `mentorqueVersionCode` do gradle.properties
// como PISO, exatamente para o caso de o contador do Codemagic estar atrás
// (ver o passo "Compilar .aab" no codemagic.yaml, onde isso está escrito).
//
// O PROBLEMA QUE ESTA CONFERÊNCIA PEGA: o piso é o único número deste
// repositório que ninguém precisa tocar para o build passar, então ele
// envelhece sozinho. Em 28/09, preparando a 2.9, ele estava em **56** enquanto
// a 2.8 já tinha saído com **68**: o piso não protegia mais nada, e a rede que
// existe para salvar um envio queimado estava doze números atrás do chão.
//
// Ele não precisa ser exato, precisa ser MAIOR que o publicado. Errar para
// cima é de graça no Android (o número só precisa crescer); errar para baixo
// custa um build e um número queimado.
const gradle = ler("android/gradle.properties");
const mPiso = gradle.match(/mentorqueVersionCode=(\d+)/);
const mAndroid = rota.match(/android:\s*(\d+)/);

if (!mPiso || !mAndroid) {
  console.error("Versões: não achei o piso do versionCode ou o build publicado do Android.");
  console.error("  piso:      mentorqueVersionCode em android/gradle.properties");
  console.error("  publicado: campo `android` em app/api/app/latest/route.ts");
  process.exit(1);
}
const piso = Number(mPiso[1]);
const publicado = Number(mAndroid[1]);
if (piso <= publicado) {
  console.error(`Piso do versionCode é ${piso}, e a Play já tem o ${publicado} publicado.`);
  console.error("");
  console.error("A Play recusa versionCode menor ou igual ao maior já enviado, e o");
  console.error("número recusado fica QUEIMADO. O piso existe para salvar o envio");
  console.error("quando o contador do Codemagic está atrás; com ele abaixo do que já");
  console.error("está publicado, ele não salva nada.");
  console.error("");
  console.error(`Abra android/gradle.properties e ponha mentorqueVersionCode=${publicado + 1}`);
  console.error("ou mais. Errar para cima é de graça: o número só precisa crescer.");
  process.exit(1);
}

// ─────────────────────────────────────────────────
// O IDIOMA QUE A APP STORE MOSTRA VEM DO BINÁRIO (04/10/2026). A página pública
// do app dizia "Idioma: EN, Inglês" para um app brasileiro, e a localização
// principal da ficha já era Português (Brasil): o campo da página lê as
// localizações que o binário DECLARA (`CFBundleLocalizations` e
// `CFBundleDevelopmentRegion` no Info.plist, `knownRegions` no projeto), e o
// projeto só declarava `en`. Um `npx cap sync` que regenere o projeto volta ao
// inglês em silêncio, e a página volta a dizer EN sem ninguém trocar nada.
{
  const plist = readFileSync("ios/App/App/Info.plist", "utf8");
  const pbx = readFileSync("ios/App/App.xcodeproj/project.pbxproj", "utf8");
  const regiao = plist.match(/<key>CFBundleDevelopmentRegion<\/key>\s*<string>([^<]+)<\/string>/)?.[1];
  const locs = plist.match(/<key>CFBundleLocalizations<\/key>\s*<array>([\s\S]*?)<\/array>/)?.[1] ?? "";
  const declaradas = [...locs.matchAll(/<string>([^<]+)<\/string>/g)].map((m) => m[1]);
  const problemas = [];
  if (regiao !== "pt-BR") problemas.push(`CFBundleDevelopmentRegion é "${regiao}", e tem que ser pt-BR`);
  if (!declaradas.includes("pt-BR")) problemas.push(`CFBundleLocalizations não declara pt-BR (declara: ${declaradas.join(", ") || "nada"})`);
  if (!/knownRegions = \([\s\S]*?"pt-BR",[\s\S]*?\);/.test(pbx)) problemas.push("knownRegions do projeto Xcode não tem pt-BR");
  if (problemas.length) {
    console.error("FALHA  o binário do iPhone não declara português, e a App Store vai mostrar \"Idioma: EN\":");
    for (const p of problemas) console.error(`       ${p}`);
    process.exit(1);
  }
}

// ── CADA ITEM DA FICHA DA ÚLTIMA PUBLICADA ESTÁ NA ÁRVORE DO BUILD? (06/10) ──
//
// Três perguntas, todas ao git, que é o único que sabe:
//   1. a árvore da última publicada está em ARVORE_DO_BUILD e na ficha;
//   2. todo `commit <sha>` citado nas seções "Vai no binário" da ficha é
//      ancestral da árvore (senão a ficha promete o que a loja não entrega);
//   3. todo `commit <sha>` citado em "Ficou FORA do binário" NÃO é ancestral
//      (senão a ficha esconde o que a loja entregou).
// O caso que isto existe para pegar está no comentário de ARVORE_DO_BUILD.
{
  const ficha = `docs/lojas/novidades-${ultimaPublicada}.md`;
  const arvore = ARVORE_DO_BUILD[ultimaPublicada];
  const caminhoFicha = new URL(ficha, raiz);
  const temGit = existsSync(new URL(".git", raiz));
  if (!arvore) {
    console.error(`FALHA  não sei de que árvore a ${ultimaPublicada} foi gerada.`);
    console.error("       Acrescente em ARVORE_DO_BUILD, neste arquivo, o commit que estava na main");
    console.error("       na hora do botão do Codemagic. É o que faltou na 3.0 (ver o comentário lá).");
    process.exit(1);
  }
  if (!existsSync(caminhoFicha)) {
    console.error(`FALHA  a ficha ${ficha} não existe, e a ${ultimaPublicada} está publicada.`);
    process.exit(1);
  }
  const texto = readFileSync(caminhoFicha, "utf8");
  const mArvore = texto.match(/\*\*Árvore do build:\*\*\s*([0-9a-f]{7,40})/);
  if (!mArvore) {
    console.error(`FALHA  ${ficha} não declara "**Árvore do build:** <commit>".`);
    process.exit(1);
  }
  if (!mArvore[1].startsWith(arvore) && !arvore.startsWith(mArvore[1])) {
    console.error(`FALHA  ${ficha} diz árvore ${mArvore[1]}, e ARVORE_DO_BUILD diz ${arvore}.`);
    process.exit(1);
  }
  if (!temGit) {
    console.log(`Árvore do build da ${ultimaPublicada}: ${arvore} (sem .git aqui, não conferi os itens).`);
  } else {
    const ancestral = (sha) => {
      try {
        execFileSync("git", ["merge-base", "--is-ancestor", sha, arvore], { cwd: raiz, stdio: "ignore" });
        return true;
      } catch {
        return false;
      }
    };
    // As seções, pelo título: "### Vai no binário..." até a próxima "##", e
    // "## Ficou FORA do binário" até a próxima "## ".
    const secoes = (regexTitulo) => {
      const fatias = [];
      const re = new RegExp(`^(${regexTitulo}).*$`, "gm");
      let m;
      while ((m = re.exec(texto))) {
        const inicio = m.index + m[0].length;
        const prox = texto.slice(inicio).search(/^##(?!#)|^### /m);
        fatias.push(texto.slice(inicio, prox === -1 ? undefined : inicio + prox));
      }
      return fatias.join("\n");
    };
    const commits = (trecho) => [...trecho.matchAll(/commit ([0-9a-f]{7,40})/g)].map((m) => m[1]);
    const dentro = commits(secoes("### Vai no binário"));
    const fora = commits(secoes("## Ficou FORA do binário"));
    const problemas = [];
    for (const sha of dentro) if (!ancestral(sha)) problemas.push(`${sha} está em "Vai no binário", e NÃO é ancestral de ${arvore}`);
    for (const sha of fora) if (ancestral(sha)) problemas.push(`${sha} está em "Ficou FORA do binário", e É ancestral de ${arvore}`);
    if (dentro.length === 0) problemas.push(`nenhum item de "Vai no binário" cita o commit (escreva "(dd/mm, commit <sha>)" em cada um)`);
    if (problemas.length) {
      console.error(`FALHA  a ficha ${ficha} e a árvore do build ${arvore} discordam:`);
      for (const p of problemas) console.error(`       ${p}`);
      console.error("       A ficha promete o que a loja não entrega (ou esconde o que entregou).");
      console.error("       Foi assim que a 3.0 saiu sem o Início novo e com a nota dizendo que tinha.");
      process.exit(1);
    }
    console.log(`Árvore do build da ${ultimaPublicada}: ${arvore}; ${dentro.length} commit(s) da ficha dentro dela, ${fora.length} declarado(s) fora.`);
  }
}

console.log(`Versões conferem: ${alvo} (app ${app}, Android ${android}, iOS ${ios}), ainda não publicada.`);
console.log(`Banner: aponta para a ${mRota[1]}, que é a última publicada.`);
console.log(`versionCode: piso ${piso}, acima do ${publicado} que já está na Play.`);
