// Faz o "cancelado" do login do Google no Android contar o que o Google viu.
//
// O SINTOMA, na 2.0, 2.1 e 2.2 do Android (09 e 10/09/2026): a caixinha do
// Google abre, a Luana escolhe a conta, toca em Entrar, a caixinha fecha e a
// tela fica muda. Nenhum pedido chega ao Supabase. Na 2.2, com o relato
// ligado, a app_erros recebeu exatamente isto:
//
//   login nativo google: Google Sign-In cancelled by user
//
// E é tudo o que o plugin (@capgo/capacitor-social-login, GoogleProvider.java)
// deixa passar. O código dele, em handleSignInError, é este:
//
//   if (e instanceof GetCredentialCancellationException) {
//       call.reject("Google Sign-In cancelled by user", USER_CANCELLED_CODE, e);
//
// A mensagem de VERDADE, a que o Credential Manager do Android mandou, fica
// só em `e`, que o Capacitor escreve no Logcat e não devolve ao JavaScript.
// E o pacote, a SHA-1 do certificado que assinou o app instalado e o client
// id que o plugin usou, que são as três coisas que decidem esse caso, ele
// também só escreve no Logcat (logGoogleCloudDiagnostics). Logcat ninguém tem
// à mão no aparelho da Luana.
//
// O próprio README do plugin diz que USER_CANCELLED depois de escolher a
// conta pode ser pacote, SHA-1 ou client id não batendo; e o relato público
// mais comum desse "activity is cancelled by the user" é um client id do tipo
// Android no lugar do Web. Sem ver os quatro dados, cada build é um chute.
//
// O CONSERTO: a mesma rejeição, com a mensagem de baixo e os três dados do
// Logcat dentro do texto. O código de erro (USER_CANCELLED) e o comportamento
// da tela não mudam: o app continua engolindo como cancelamento, e o que muda
// é a linha que chega à app_erros. Nada aqui carrega dado da pessoa: pacote,
// certificado e client id são públicos (qualquer um com o APK os obtém).
//
// Roda sozinho no `postinstall`, que é o `npm ci` do Codemagic, porque o
// Gradle compila este arquivo direto de node_modules
// (android/capacitor.settings.gradle aponta para lá).

import { readFileSync, writeFileSync, existsSync } from "node:fs";

const ALVO = "node_modules/@capgo/capacitor-social-login/android/src/main/java/ee/forgr/capacitor/social/login/GoogleProvider.java";

/** A rejeição muda do plugin, exatamente como está no 8.3.40 (e no 8.5.7). */
const MUDA = 'call.reject("Google Sign-In cancelled by user", USER_CANCELLED_CODE, e);';

/**
 * A mesma rejeição, falando. `errorMessage` já existe no escopo (é a primeira
 * linha de handleSignInError); `getSigningCertificateSha1`, `context` e
 * `clientId` são do próprio arquivo. O client id vai inteiro no começo (os 22
 * primeiros caracteres, que são o número do projeto e o início do id) porque a
 * máscara do plugin mostra os 20 ÚLTIMOS, que em todo client id do Google são
 * "...googleusercontent.com" e não distinguem nada.
 */
const FALANTE =
  "String sha1Mq = getSigningCertificateSha1(context);\n" +
  '            String idMq = clientId == null ? "null" : clientId.substring(0, Math.min(22, clientId.length()));\n' +
  "            call.reject(\n" +
  '                "Google Sign-In cancelled by user (" + errorMessage + ") package=" + context.getPackageName() +\n' +
  '                    " signingSha1=" + (sha1Mq != null ? sha1Mq : "unknown") + " webClientId=" + idMq,\n' +
  "                USER_CANCELLED_CODE,\n" +
  "                e\n" +
  "            );";

if (!existsSync(ALVO)) {
  // Plugin não instalado (instalação só de produção da web). Nada a fazer.
  process.exit(0);
}

const fonte = readFileSync(ALVO, "utf8");

if (fonte.includes("sha1Mq")) {
  process.exit(0); // já remendado nesta instalação
}

if (!fonte.includes(MUDA)) {
  // O plugin mudou de forma. NÃO derruba o `npm ci`, porque isso pararia
  // também o deploy do site; quem reprova alto é `npm run conferir:login`.
  console.warn(
    `[social-login] AVISO: não achei a rejeição muda em ${ALVO}.\n` +
      `[social-login] O plugin mudou. Leia scripts/conserta-social-login.mjs e ajuste.`
  );
  process.exit(0);
}

writeFileSync(ALVO, fonte.replace(MUDA, FALANTE));
console.log("[social-login] o 'cancelado' do Google passa a dizer o que o Google viu (ver scripts/conserta-social-login.mjs).");
