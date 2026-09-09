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
];

import { readFileSync } from "node:fs";

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

console.log(`Versões conferem: ${alvo} (app ${app}, Android ${android}, iOS ${ios}), ainda não publicada.`);
