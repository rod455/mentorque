// Registra no Info.plist o esquema reverso do iOS Client ID do Google.
//
// O SDK do Google Sign-In abre a tela de conta fora do app e volta por um
// esquema próprio derivado do client id: `com.googleusercontent.apps.123-abc`
// para o client id `123-abc.apps.googleusercontent.com`. Se esse esquema não
// estiver no Info.plist, o SDK aborta antes de abrir qualquer coisa — o botão
// do Google não faz nada.
//
// O valor padrão é o mesmo de lib/app/socialLogin.ts — os dois precisam apontar
// para o mesmo client id, senão o SDK abre a tela do Google e não consegue
// voltar. Client id não é segredo (ele fica visível no Info.plist do app
// publicado), então mora no repositório; a variável de ambiente
// NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID sobrescreve quando o projeto do Google Cloud
// mudar.
import fs from "node:fs";
import path from "node:path";

const PLIST = path.join(process.cwd(), "ios", "App", "App", "Info.plist");
const MARKER = "com.googleusercontent.apps.";
const PADRAO = "43445984392-mvc7mg1dlljbdq942aort4hhvet5l78h.apps.googleusercontent.com";

const clientId = (process.env.NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "").trim() || PADRAO;

if (!/^[\w-]+\.apps\.googleusercontent\.com$/.test(clientId)) {
  console.error(`[ios-google-scheme] valor inválido: "${clientId}"`);
  console.error('   Esperado algo como "123456789-abcdef.apps.googleusercontent.com".');
  process.exit(1);
}

const scheme = MARKER + clientId.replace(/\.apps\.googleusercontent\.com$/, "");

let plist = fs.readFileSync(PLIST, "utf8");

if (plist.includes(`<string>${scheme}</string>`)) {
  console.log(`[ios-google-scheme] já registrado: ${scheme}`);
  process.exit(0);
}

// Troca um esquema antigo do Google, se houver, em vez de acumular entradas.
if (plist.includes(MARKER)) {
  plist = plist.replace(new RegExp(`<string>${MARKER}[\\w-]+</string>`), `<string>${scheme}</string>`);
} else {
  // Entrada própria: o SDK do Google procura pelo esquema em qualquer
  // CFBundleURLTypes, mas separar deixa claro de quem é cada um.
  const entry = `	<key>CFBundleURLTypes</key>
	<array>
		<dict>
			<key>CFBundleURLName</key>
			<string>br.com.mentorque.google</string>
			<key>CFBundleTypeRole</key>
			<string>Editor</string>
			<key>CFBundleURLSchemes</key>
			<array>
				<string>${scheme}</string>
			</array>
		</dict>`;
  const open = "\t<key>CFBundleURLTypes</key>\n\t<array>";
  if (!plist.includes(open)) {
    console.error("[ios-google-scheme] não achei CFBundleURLTypes no Info.plist.");
    process.exit(1);
  }
  plist = plist.replace(open, entry);
}

fs.writeFileSync(PLIST, plist);
console.log(`[ios-google-scheme] esquema registrado: ${scheme}`);
