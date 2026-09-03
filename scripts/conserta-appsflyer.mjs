// Desarma o trecho de Facebook do plugin da AppsFlyer, que não compila.
//
// O DEFEITO, que derrubou o build 1.7 do iPhone em 03/09/2026:
//
//   AppsFlyerPlugin.swift:665: cannot find 'FBSDKAppLinkUtility' in scope
//
// E ele é um defeito DO PLUGIN, não nosso. O código lá é este:
//
//   #if canImport(FacebookCore)
//       AppsFlyerLib.shared().enableFacebookDeferredApplinks(with: FBSDKAppLinkUtility.self)
//
// Duas coisas erradas na mesma linha. A guarda pergunta por `FacebookCore`,
// mas o símbolo usado (`FBSDKAppLinkUtility`) mora em `FBSDKCoreKit`, que é
// outro módulo. E o arquivo não importa NENHUM dos dois: os imports dele são
// só Foundation, Capacitor e AppsFlyerLib. Ou seja, no dia em que a guarda
// abrir, o que está dentro dela não compila de jeito nenhum.
//
// POR QUE A GUARDA ABRIU AGORA, depois de a 1.6 ter passado. O
// `@capgo/capacitor-social-login` traz o SDK do Facebook para o build do
// iPhone (ele suporta login com Facebook, que a gente não usa). O alvo do
// AppsFlyer NÃO declara dependência do Facebook, mas o SwiftPM constrói tudo
// na mesma pasta e o `canImport` enxerga módulo que esteja no caminho de
// busca, dependência declarada ou não. Então essa guarda depende de o
// FacebookCore já ter sido construído quando o arquivo da AppsFlyer compila, o
// que é ordem de build, não regra. Ela vinha dando "não" e passou a dar "sim".
//
// Nada disso está pinado do nosso lado: o Codemagic usa `xcode: latest`, o
// facebook-ios-sdk entra por faixa (`upToNextMajor from 18.0.3`) e não existe
// Package.resolved versionado. Qualquer um dos três pode ter virado a chave, e
// por isso o conserto não pode depender de descobrir qual foi.
//
// O CONSERTO: fechar a guarda de vez, com um nome que ninguém define. O ramo
// `#else` do próprio plugin continua lá e responde "Please install FBSDK
// First!" para quem chamar. Isso é honesto para nós: o app não usa login com
// Facebook nem applinks adiados do Facebook, e nunca chama esta função.
//
// Roda sozinho no `postinstall`, então vale para o `npm ci` do Codemagic sem
// depender de alguém lembrar de acrescentar um passo no codemagic.yaml.

import { readFileSync, writeFileSync, existsSync } from "node:fs";

const ALVO = "node_modules/appsflyer-capacitor-plugin/ios/Plugin/AppsFlyerPlugin.swift";

/** A guarda quebrada do plugin. */
const QUEBRADA = "#if canImport(FacebookCore)";

/**
 * A guarda fechada. O nome é nosso e não é definido em lugar nenhum, o que é o
 * ponto: `#if` de bandeira inexistente é sempre falso, e o compilador nem olha
 * o que está dentro. Fica com a nossa marca de propósito, para quem tropeçar
 * nela saber que é intencional e achar este arquivo.
 */
const FECHADA = "#if MENTORQUE_APPLINKS_DO_FACEBOOK";

if (!existsSync(ALVO)) {
  // Plugin não instalado (ou instalação só de produção da web). Nada a fazer,
  // e isso não é erro.
  process.exit(0);
}

const fonte = readFileSync(ALVO, "utf8");

if (fonte.includes(FECHADA)) {
  process.exit(0); // já consertado nesta instalação
}

if (!fonte.includes(QUEBRADA)) {
  // O plugin mudou de forma. NÃO derruba o `npm ci`, porque isso pararia
  // também o deploy do site por causa de um problema que é só do iPhone; quem
  // reprova alto é `npm run conferir:appsflyer`, que roda antes de todo push.
  console.warn(
    `[appsflyer] AVISO: não achei "${QUEBRADA}" em ${ALVO}.\n` +
      `[appsflyer] O plugin mudou. Confira se o trecho de Facebook ainda existe\n` +
      `[appsflyer] e ajuste scripts/conserta-appsflyer.mjs antes do próximo build do iPhone.`
  );
  process.exit(0);
}

writeFileSync(ALVO, fonte.replace(QUEBRADA, FECHADA));
console.log("[appsflyer] trecho de Facebook desarmado (ver scripts/conserta-appsflyer.mjs).");
