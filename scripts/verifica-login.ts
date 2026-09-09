// O login nativo não pode virar beco sem saída.
//
// O QUASE-ACIDENTE que fez esta conferência nascer (07/09/2026). O portão do
// login social foi aberto para o Android, e a chave é a variável
// NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID: com ela no build, `googleNativeConfigured()`
// diz sim e o pedido vai para a folha nativa. Só que a folha nativa é do
// `@capgo/capacitor-social-login`, que está no `ios.includePlugins` e NÃO está
// no do Android. No Android o `import` resolve (é JavaScript empacotado) e o
// lado nativo é que não existe: o `initialize()` falha, o pedido morre, e o
// caminho do navegador, o único que o Android tem hoje, nem chega a ser
// tentado. Ligar a variável apagaria o login do Android em vez de somar um.
//
// A causa de fundo é a distância: o portão mora em lib/app/auth.tsx e a lista
// de plugins mora no capacitor.config.ts. Nenhum dos dois arquivos sabe do
// outro, e nenhum tipo os liga. É exatamente o tipo de defeito que só aparece
// no aparelho de alguém, depois do build, com a loja no meio do caminho.
//
// Então a conferência olha OS DOIS e cobra a única coisa que mantém isso de pé
// nas duas configurações possíveis: quando o caminho nativo não existe, sobra o
// do navegador. Se um dia o plugin entrar no binário do Android, nada aqui
// precisa mudar; a queda vira redundância, que é o estado saudável dela.
//
// Rode com: npm run conferir:login
import { readFileSync } from "node:fs";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

/**
 * Sem comentários, e por um motivo já aprendido nesta casa: em
 * scripts/verifica-aviso.ts uma asserção aprovou um conserto que eu tinha
 * apagado, porque o COMENTÁRIO logo acima citava o código que ela procurava.
 * Aqui o risco é maior ainda, porque este arquivo e os que ele lê falam dos
 * mesmos nomes o tempo todo.
 */
function semComentarios(fonte: string): string {
  return fonte.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/gm, " ");
}

const leia = (caminho: string) => semComentarios(readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8"));

console.log("Login: quem abre o portão do nativo deixou a porta do navegador aberta?");

const auth = leia("lib/app/auth.tsx");
const social = leia("lib/app/socialLogin.ts");
const capacitor = leia("capacitor.config.ts");

// ── quem está dentro do binário de cada plataforma ──────────────────────────
//
// Leitura grosseira de propósito: o config é TypeScript e importá-lo daqui
// arrastaria o tipo do @capacitor/cli. O que interessa é o recorte de cada
// bloco `includePlugins`, e para isso basta achar onde cada plataforma começa.
const PLUGIN = "@capgo/capacitor-social-login";
function includePluginsDe(plataforma: "android" | "ios"): string {
  const i = capacitor.indexOf(`${plataforma}: {`);
  if (i < 0) return "";
  const j = capacitor.indexOf("includePlugins", i);
  if (j < 0) return "";
  const fim = capacitor.indexOf("]", j);
  return fim < 0 ? "" : capacitor.slice(j, fim);
}
const noAndroid = includePluginsDe("android").includes(PLUGIN);
const noIOS = includePluginsDe("ios").includes(PLUGIN);

conferir(
  "o plugin do login social está no binário do iPhone",
  noIOS,
  `sem ${PLUGIN} no ios.includePlugins não existe folha nativa nenhuma, e o iPhone é o único ` +
    "lugar onde 'Entrar com a Apple' funciona hoje"
);

// ── a queda para o navegador ────────────────────────────────────────────────
//
// As três asserções abaixo são um conserto só, partido em três porque cada
// pedaço já falhou sozinho em algum lugar deste repositório: a chamada sem
// resguardo, o nome do erro que muda de um lado e não do outro, e o `return`
// que engole o caminho alternativo.
// OS MOTIVOS SÃO LIDOS DO CÓDIGO, não escritos aqui, e isso é conserto de um
// furo desta própria conferência: na primeira vez em que ela foi provada, eu
// plantei um motivo inventado dentro do SEM_CAMINHO_NATIVO e ela aprovou. Ela
// estava conferindo a minha lista contra o código, e um motivo a mais na lista
// do código passava por fora dela inteira. A lista de baixo virou o MÍNIMO
// exigido; o que manda é o que está escrito no auth.tsx.
const MINIMOS = ["login_nativo_indisponivel", "google_sem_client_id"];
const listaNoCodigo = /SEM_CAMINHO_NATIVO\s*=\s*\[([^\]]*)\]/.exec(auth)?.[1] ?? "";
const MOTIVOS = [...listaNoCodigo.matchAll(/"([^"]+)"/g)].map((m) => m[1]);

for (const minimo of MINIMOS) {
  conferir(
    `"${minimo}" continua na lista de queda`,
    MOTIVOS.includes(minimo),
    "motivo devolvido antes de a folha abrir e fora da lista = a pessoa vê erro sem nunca ter visto tela"
  );
}

conferir(
  "o resultado do caminho nativo é examinado antes de virar resposta",
  !/if \(canNative\) return await nativeSocialLogin/.test(auth),
  "devolver o nativo direto é o que fazia o Android ficar sem login nenhum quando o plugin " +
    "não está no binário: não sobra tentativa"
);
conferir(
  "quando o nativo não existe, o pedido cai para o navegador",
  /SEM_CAMINHO_NATIVO/.test(auth) && /signInWithOAuth/.test(auth.slice(auth.indexOf("SEM_CAMINHO_NATIVO"))),
  "a queda tem de terminar no fluxo do navegador, que é o login que o Android usa hoje"
);

// E os motivos da queda são os que o outro arquivo REALMENTE devolve. Esta é a
// asserção que amarra os dois: renomear o erro em socialLogin.ts sem mexer aqui
// deixaria a queda escrita e morta, que é pior do que não ter queda, porque
// parece conserto.
conferir("a lista de queda não está vazia", MOTIVOS.length > 0, "sem motivo nenhum, a queda nunca acontece");

// Cada motivo DA LISTA DO CÓDIGO tem de existir no socialLogin.ts e nascer
// ANTES de a folha do provedor abrir. As duas metades cobram coisas
// diferentes: a primeira pega o nome renomeado de um lado só, que deixa a
// queda escrita e morta (pior do que não ter queda, porque parece conserto); a
// segunda pega o motivo que só nasce DEPOIS de a pessoa ver a tela do Google,
// e cair para o navegador ali reabriria o login para quem acabou de desistir.
const antesDaFolha = social.slice(0, social.indexOf("plugin.login("));
for (const motivo of MOTIVOS) {
  conferir(
    `"${motivo}" é um motivo que o socialLogin.ts devolve mesmo`,
    social.includes(`"${motivo}"`),
    "o auth.tsx cai para o navegador por este nome; se ele mudou de lá, a queda virou letra morta"
  );
  conferir(
    `"${motivo}" nasce antes de a folha do provedor abrir`,
    antesDaFolha.includes(`"${motivo}"`),
    "só motivo anterior à folha pode cair para o navegador; depois dela, desistência é desistência"
  );
}

// ── a folha do Google no Android não manda `scopes` ─────────────────────────
//
// O plugin (GoogleProvider.java, 8.3.40) recusa QUALQUER lista de scopes se a
// MainActivity não implementar a interface dele, e acrescenta profile e email
// sozinho. A 1.9 mandava ["profile", "email"] e a Luana viu "You CANNOT use
// scopes without modifying the main activity" (09/09/2026). A conferência lê o
// trecho do login do Google sem comentários e cobra que o ramo do Android não
// carregue scopes.
{
  const trecho = social.slice(social.indexOf("provider === \"apple\""), social.indexOf("plugin.login(") + 400);
  const ramoAndroid = (trecho.match(/nativePlatform\(\)\s*===\s*"android"\s*\?\s*(\{[^}]*\})/) ?? [])[1] ?? "";
  conferir(
    "no Android, o login do Google não manda scopes",
    ramoAndroid.length > 0 && !/scopes/.test(ramoAndroid),
    ramoAndroid ? `ramo do Android: ${ramoAndroid}` : "não há ramo do Android nas opções do login do Google"
  );
}

// ── todo desfecho do login nativo que não é sessão é relatado ───────────────
//
// 09/09/2026: a caixinha abriu, a Luana escolheu a conta, a caixinha fechou e
// a tela ficou muda. Nenhum pedido chegou ao Supabase, e o app tinha engolido
// o motivo porque a mensagem do plugin dizia "cancel". Sem relato, a única
// testemunha era o Logcat. Agora os três pontos de falha (o plugin recusa, o
// plugin devolve sem idToken, o Supabase recusa o idToken) mandam a mensagem
// para app_erros, inclusive o "cancelado", que o README do plugin diz ser o
// sintoma clássico de SHA-1 ou client id errado.
{
  const relatos = (social.match(/relatarLoginNativo\(/g) ?? []).length;
  conferir(
    "os três desfechos sem sessão do login nativo são relatados",
    relatos >= 3,
    `${relatos} chamadas a relatarLoginNativo em socialLogin.ts; precisam ser 3: plugin recusou, sem idToken, Supabase recusou`
  );
  const catchDoPlugin = social.slice(social.indexOf("} catch (e) {", social.indexOf("plugin.login(")), social.indexOf("canceled: true"));
  conferir(
    "o 'cancelado' é relatado ANTES de ser engolido",
    /relatarLoginNativo\(/.test(catchDoPlugin),
    "relatar depois do return de cancelamento deixa o caso que mais importa sem testemunha"
  );
}

// ── o portão do Android ─────────────────────────────────────────────────────
if (!noAndroid) {
  conferir(
    "com o plugin fora do Android, o portão do Android depende de uma variável",
    /googleNativeConfigured\(\)/.test(auth) && /NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID/.test(social),
    "sem a variável no meio, o Android iria para uma folha nativa que não existe no binário dele"
  );
  console.log(
    `Login: ${PLUGIN} está fora do binário do Android, então o caminho nativo de lá SEMPRE cai ` +
      "para o navegador. A queda está no lugar."
  );
} else {
  console.log(`Login: ${PLUGIN} está nos dois binários; a queda para o navegador vira redundância.`);
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) de login reprovaram.`);
  process.exit(1);
}
console.log("Login: o portão do nativo nunca fecha a porta do navegador.");
