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

console.log(`Versões conferem: ${alvo} (app ${app}, Android ${android}, iOS ${ios}).`);
