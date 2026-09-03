// O trecho de Facebook da AppsFlyer continua desarmado?
//
// Esta conferência existe porque o conserto mora em `node_modules`, que não é
// versionado. Um remendo que vive fora do repositório é um remendo que some
// sem avisar: basta alguém tirar o `postinstall`, subir a versão do plugin, ou
// o upstream reescrever o arquivo, e o build do iPhone volta a quebrar lá no
// Codemagic, dez minutos depois do push, com um erro de Swift que não tem
// nada a ver com o que a pessoa mexeu.
//
// O que ela protege é exatamente isso: o defeito volta AQUI, em dois segundos,
// e não lá.
//
// Ela é de propósito uma conferência de `node_modules`, que normalmente seria
// cheiro ruim. A justificativa é que o artefato que vai para a Apple inclui
// aquele arquivo, então ele faz parte do que a gente entrega, mesmo não sendo
// nosso.
//
// Rode com: npm run conferir:appsflyer
import { readFileSync, existsSync } from "node:fs";

const ALVO = "node_modules/appsflyer-capacitor-plugin/ios/Plugin/AppsFlyerPlugin.swift";
const QUEBRADA = "#if canImport(FacebookCore)";
const FECHADA = "#if MENTORQUE_APPLINKS_DO_FACEBOOK";

if (!existsSync(ALVO)) {
  console.log("AppsFlyer: plugin não instalado nesta máquina, nada a conferir.");
  process.exit(0);
}

const fonte = readFileSync(ALVO, "utf8");
const falhas = [];

if (fonte.includes(QUEBRADA)) {
  falhas.push(
    `a guarda quebrada "${QUEBRADA}" voltou.\n` +
      `       É ela que deixa o compilador entrar num trecho que usa FBSDKAppLinkUtility\n` +
      `       sem importar o módulo, e foi o que derrubou o build 1.7 do iPhone.\n` +
      `       Rode: node scripts/conserta-appsflyer.mjs`
  );
}

if (!fonte.includes(FECHADA)) {
  falhas.push(
    `não achei a guarda fechada "${FECHADA}".\n` +
      `       Ou o postinstall não rodou, ou o plugin mudou de forma.\n` +
      `       Se mudou, leia scripts/conserta-appsflyer.mjs e ajuste os dois arquivos.`
  );
}

// A linha perigosa só pode existir dentro de uma guarda fechada. Se ela some,
// ótimo (upstream consertou); se ela existe, tem de estar desarmada.
if (fonte.includes("FBSDKAppLinkUtility") && !fonte.includes(FECHADA)) {
  falhas.push("o uso de FBSDKAppLinkUtility está fora de qualquer guarda nossa.");
}

if (falhas.length) {
  for (const f of falhas) console.error(`FALHA  ${f}`);
  console.error(`\n${falhas.length} conferência(s) do AppsFlyer reprovaram.`);
  process.exit(1);
}

console.log("AppsFlyer: o trecho de Facebook segue desarmado, o build do iPhone compila.");
