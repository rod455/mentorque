// Aviso que promete uma tela tem de abrir aquela tela.
//
// Esta conferência nasce de um relato do dono (03/09/2026): o lembrete das 9h
// diz "responda a pergunta do dia", a pessoa toca, e o app abre no Início. O
// aviso fez a parte difícil, que é trazer a pessoa de volta, e jogou fora o
// resultado no último passo.
//
// A causa era uma AUSÊNCIA, e é por isso que esta conferência é do jeito que
// é: não havia ouvinte de toque em lugar nenhum do app, e os avisos não
// carregavam destino. Nada estava errado, só faltava tudo. Conferência de
// lógica pura não pega ausência de ligação, então aqui vão os dois tipos:
//
//   1. a lógica da rota pendente, exercitada de verdade (é código sem import,
//      justamente para o node conseguir abrir);
//   2. as LIGAÇÕES, conferidas no texto dos arquivos. Conferir código lendo
//      texto é grosseiro e a gente sabe: o que salva é que cada asserção
//      aponta para um elo que, quando faltou, deixou o defeito de pé. Se o elo
//      mudar de forma, esta conferência reprova e alguém vem aqui reescrever a
//      asserção, que é bem melhor do que o silêncio de hoje.
//
// O que ela NÃO alcança: o comportamento do aparelho de verdade. Se o
// Capacitor mudar o nome do evento, ou o Android parar de entregar o `extra`,
// só o toque num celular na mão descobre. Por isso o roteiro de toque continua
// no checklist de release.
//
// Rode com: npm run conferir:aviso
import { anotaRota, aoAnotarRota, esqueceRota, nomeDeRota, rotaPendente } from "../lib/app/rotaPendente.ts";
import { espelhaOAparelho } from "../lib/app/espelhoDoAviso.ts";
import { quandoAvisarCarroParado } from "../lib/app/carroParado.ts";
import { QUIZ_ZERADO } from "../lib/app/quiz/sequencia.ts";
import { readFileSync } from "node:fs";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

/**
 * O arquivo SEM COMENTÁRIOS, e isto não é capricho: é um defeito que esta
 * conferência já deixou passar, na primeira vez em que foi provada.
 *
 * O teste era procurar `rota: "quiz"` no lembreteQuiz.ts. Tirei essa linha do
 * código de propósito, para ver a conferência gritar, e ela aprovou: o
 * COMENTÁRIO logo acima explica o conserto citando `rota: "quiz"`, e o texto
 * do comentário satisfazia a busca. Ou seja, a conferência estava conferindo a
 * documentação do conserto, não o conserto. Neste repositório, onde os
 * comentários explicam o porquê e citam código o tempo todo, isso ia acontecer
 * em qualquer conferência de texto que alguém escrevesse depois.
 *
 * A limpeza é grosseira (um `//` dentro de um texto entre aspas leva o resto da
 * linha junto), e serve mesmo assim: ela só pode fazer uma asserção reprovar à
 * toa, nunca passar à toa, e reprovar à toa traz alguém aqui olhar.
 */
function semComentarios(fonte: string): string {
  // O `/*` SÓ ABRE COMENTÁRIO QUANDO VEM DEPOIS DE ESPAÇO ou de começo de
  // linha, e essa exigência é conserto de um defeito desta função, encontrado
  // em 07/09/2026 ao conferir a foto de perfil.
  //
  // O Perfil tem `accept="image/*"`. Sem a exigência, aquele `/*` no meio da
  // palavra abria um comentário que só fechava no `*/` seguinte, em outro
  // lugar do arquivo, e TUDO no meio sumia da conferência. O sintoma foi uma
  // asserção nova reprovando em código correto, o que é o lado bom de errar:
  // trouxe alguém aqui olhar. O lado ruim é o que já estava acontecendo calado,
  // porque as asserções que caíam naquele trecho apagado não conferiam nada.
  //
  // Em código de verdade um bloco de comentário sempre começa em espaço ou no
  // início da linha, então a exigência não perde comentário nenhum.
  return fonte.replace(/(^|\s)\/\*[\s\S]*?\*\//g, "$1 ").replace(/\/\/.*$/gm, " ");
}

const leia = (caminho: string) => semComentarios(readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8"));

// ── a lógica da rota pendente ───────────────────────────────────────────────
{
  esqueceRota();
  conferir("sem toque, não há rota pendente", rotaPendente() === null);

  conferir("quiz é uma rota conhecida", nomeDeRota("quiz") === "quiz");
  conferir("rota inventada é ignorada", nomeDeRota("checkout") === null);
  conferir("aviso sem destino é ignorado", nomeDeRota(undefined) === null);
  conferir("destino que não é texto é ignorado", nomeDeRota({ rota: "quiz" }) === null);

  // O payload de um push vem de fora do app. Um nome desconhecido não pode
  // derrubar nada nem empurrar o app para lugar nenhum.
  anotaRota("../../admin");
  conferir("payload estranho não vira rota", rotaPendente() === null);

  anotaRota("quiz");
  conferir("toque no aviso do quiz anota a rota", rotaPendente() === "quiz");

  esqueceRota();
  conferir("consumida uma vez, a rota não volta", rotaPendente() === null);
}

// ── o app fechado: o toque chega ANTES de a tela existir ────────────────────
//
// É o caso normal, não o raro: a pessoa toca no aviso com o app fechado. A
// anotação acontece primeiro e o roteador assina depois, então assinar TEM de
// consumir o que já está lá. Foi por isto que a rota é guardada em vez de só
// ser anunciada.
{
  esqueceRota();
  anotaRota("quiz");
  const ouvido: { rota: string | null } = { rota: null };
  const cancelar = aoAnotarRota(() => { ouvido.rota = rotaPendente(); });
  // Assinar não avisa sozinho; quem assina consome na hora também. Simula o
  // gancho: consome ao assinar e continua ouvindo.
  const naAssinatura = rotaPendente();
  conferir("quem assina depois do toque ainda encontra a rota", naAssinatura === "quiz");
  esqueceRota();

  // E o app JÁ ABERTO: o toque chega com o roteador de pé, e aí o aviso é que
  // acorda quem estava ouvindo.
  anotaRota("quiz");
  conferir("com o app aberto, o toque avisa quem está ouvindo", ouvido.rota === "quiz");
  cancelar();
  esqueceRota();

  ouvido.rota = null;
  anotaRota("quiz");
  conferir("depois de cancelar, ninguém é mais avisado", ouvido.rota === null);
  esqueceRota();
}

// ── as ligações que faltavam ────────────────────────────────────────────────
{
  const notificacoes = leia("lib/app/notificacoes.ts");
  const lembrete = leia("lib/app/lembreteQuiz.ts");
  const abertura = leia("lib/app/aberturaDoApp.ts");
  const shell = leia("components/app/Shell.tsx");
  const push = leia("lib/app/push.ts");
  const rotaEnviar = leia("app/api/push/enviar/route.ts");

  // 1. o aviso local carrega destino
  conferir(
    "o aviso agendado leva o destino no `extra`",
    /extra:\s*\{\s*rota:/.test(notificacoes),
    "sem `extra` o toque chega ao app sem dizer de onde veio"
  );
  conferir(
    "o lembrete do quiz pede a rota do quiz",
    /rota:\s*"quiz"/.test(lembrete),
    "era exatamente isto que faltava: o aviso abria o app no Início"
  );

  // 2. alguém ESCUTA o toque, dos dois lados
  conferir("há ouvinte de toque no aviso local", /addListener\(\s*"localNotificationActionPerformed"/.test(notificacoes));
  conferir("há ouvinte de toque no push", /addListener\(\s*"pushNotificationActionPerformed"/.test(push));

  // 3. o app liga os ouvintes na abertura e CONSOME a rota
  conferir("a abertura liga o ouvinte do aviso local", /ouvirToqueEmAviso\(\)/.test(abertura));
  conferir("a abertura liga o ouvinte do push", /ouvirToqueEmPush\(\)/.test(abertura));
  conferir(
    "a rota pendente vira navegação",
    /rotaPendente\(\)/.test(abertura) && /go\(\{\s*name:\s*"quiz"\s*\}\)/.test(abertura)
  );
  conferir(
    "esquece a rota ANTES de navegar",
    abertura.indexOf("esqueceRota()") < abertura.indexOf('go({ name: "quiz" })'),
    "esquecer depois faria o quiz reabrir sozinho a cada remontagem"
  );

  // 4. e o gancho está montado de verdade. Gancho que ninguém chama é código
  //    morto que parece conserto.
  conferir("o Shell chama o gancho", /useRotaDeAviso\(\)/.test(shell));

  // 5. o push do servidor sabe mandar destino
  conferir("o envio de push aceita rota", /data:\s*\{\s*rota\s*\}/.test(rotaEnviar), "FCM: o destino vai no `data`");
  conferir("o envio para o iPhone leva a rota ao lado do `aps`", /aps:.*\.\.\.\(rota/.test(rotaEnviar));

  // 6. A PONTE DA PERMISSÃO É ATRAVESSADA NUM LUGAR SÓ.
  //
  // `checkPermissions` desce até `com.getcapacitor.Bridge.getPermissionStates`,
  // que no Capacitor 8.5.0 desreferencia `plugin.getPluginHandle()` sem checar
  // nulo. Handle nulo ali é NullPointerException no fio principal, ou seja,
  // MORTE DO PROCESSO, e nenhum `try/catch` de JavaScript pega isso. Aconteceu
  // com um cliente na 1.6, registrado nos Android vitals em 02/09/2026.
  //
  // Cada chamada nova é um bilhete de rifa nesse sorteio, e o caminho do quiz
  // já tirou dois de uma vez. Por isso existe UMA função guardando a resposta
  // (`estadoDaPermissao`), e é ela que pode perguntar. A conferência olha o
  // arquivo SEM COMENTÁRIOS de propósito: este bloco aqui cita o nome da
  // chamada, e sem a limpeza a própria explicação reprovaria o conserto.
  const notif = leia("lib/app/notificacoes.ts");
  const travessias = (notif.match(/plugin\.checkPermissions\(\)/g) ?? []).length;
  conferir(
    "a permissão é perguntada ao sistema num lugar só",
    travessias === 1,
    `${travessias} chamadas a plugin.checkPermissions(); todas devem passar por estadoDaPermissao()`
  );
  conferir(
    "a resposta guardada é esquecida ao voltar para o app",
    /visibilitychange/.test(notif) && /permissao = null/.test(notif),
    "sem isso, quem liberar a permissão nos ajustes continua sendo tratado como negado"
  );
}

// ── o interruptor do Perfil diz a verdade sobre o aparelho ────────────────
//
// DOIS PEDIDOS DO DONO (07/09/2026), no mesmo minuto e pela mesma causa:
// "quando o usuário ativa, precisa ir para configurações, ele que está
// querendo receber" e "o toggle deve refletir as configurações do aparelho,
// se estiver ligado, não pode mostrar desligado".
//
// O QUE ELE VIU: ligou o interruptor e nada aconteceu. Nem folha de permissão,
// nem ajustes, nem aviso. O relato veio junto de "a Luana não recebeu nada do
// quiz hoje", que era outra coisa (ela criou a conta 12:03, depois das 9h, e o
// primeiro lembrete possível dela é amanhã).
//
// O DEFEITO REAL que apareceu no meio: a preferência guardada aqui e a
// permissão do sistema podiam discordar em silêncio. Com o interruptor ligado
// e a permissão ausente, TODO agendamento desistia sem dizer nada, porque
// `sincronizarLembreteQuiz` sai fora sem permissão. Interruptor ligado, nada
// agendado, nada na tela.
{
  const perfil = semComentarios(leia("components/app/screens/Profile.tsx"));

  conferir(
    "o Perfil pergunta ao sistema qual é a permissão de verdade",
    /permissaoConcedida\(\)/.test(perfil),
    "sem consultar o sistema, o interruptor mostra a preferência guardada, que pode estar mentindo"
  );
  conferir(
    "ligar sem permissão leva aos ajustes do aparelho",
    /if\s*\(\s*!ok\s*\)\s*abrirAjustesDeAvisos\(\)/.test(perfil),
    "antes só ia para os ajustes quando o sistema já tinha negado de vez; nos outros nãos o toque " +
      "não fazia nada visível e a pessoa ficava sem saber o que fazer"
  );
  conferir(
    "a tela reconfere a permissão ao voltar dos ajustes",
    /visibilitychange/.test(perfil),
    "liberar a permissão acontece FORA do app e voltar de lá não remonta a tela: sem isto quem libera " +
      "continua vendo bloqueado até fechar e abrir o app"
  );

  // E o convite do pós-quiz não pode ter o beco sem saída que o Perfil tinha.
  const convite = leia("components/app/ConviteDeAviso.tsx");
  conferir(
    "dizer sim no convite do quiz leva aos ajustes quando não vira permissão",
    /abrirAjustesDeAvisos\(\)/.test(convite),
    "o convite aparece para quem o sistema já negou (o podeConvidar não distingue, de propósito), " +
      "e sem isto o cartão sumia sem nada acontecer: a pessoa disse sim e o app não respondeu"
  );
}

// ── o espelho: quando o interruptor segue o aparelho, e quando não ─────────
//
// A regra exercitada DE VERDADE, e não lida como texto, porque ela já errou
// uma vez neste mesmo dia. A primeira versão seguia o sistema nos dois
// sentidos e deixava desligar impossível: o toque desligava, o efeito rodava
// de novo, via "concedida" e religava na cara da pessoa. Nenhuma conferência
// de texto pegaria isso; esta pega no primeiro caso de baixo.
{
  // SEM PERMISSÃO: ligado é mentira, porque nada é agendado sem permissão.
  const semPermissaoLigado = espelhaOAparelho({ concedida: false, ligadoNoApp: true, sistemaAntes: true });
  conferir("sem permissão, o interruptor desliga", semPermissaoLigado.ligar === false);
  conferir("sem permissão, a linha diz bloqueado", semPermissaoLigado.bloqueado);

  const semPermissaoDesligado = espelhaOAparelho({ concedida: false, ligadoNoApp: false, sistemaAntes: false });
  conferir(
    "sem permissão e já desligado, não mexe em nada",
    semPermissaoDesligado.ligar === null,
    "regravar a sessão a cada olhada é escrita à toa"
  );

  // PRIMEIRA OLHADA com permissão: a discordância aqui é resto de estado
  // velho, não decisão de ninguém. É o caso do pedido do dono.
  const primeira = espelhaOAparelho({ concedida: true, ligadoNoApp: false, sistemaAntes: null });
  conferir(
    "com permissão, o interruptor não mostra desligado na primeira olhada",
    primeira.ligar === true,
    "era o pedido: se estiver ligado no aparelho, não pode mostrar desligado"
  );
  conferir("com permissão, a linha não diz bloqueado", !primeira.bloqueado);

  // DEPOIS: com permissão, desligado é ESCOLHA, e o app não discute com ela.
  // ESTE É O CASO QUE A PRIMEIRA VERSÃO QUEBRAVA.
  const desligouAqui = espelhaOAparelho({ concedida: true, ligadoNoApp: false, sistemaAntes: true });
  conferir(
    "com permissão, quem desliga no app CONTINUA desligado",
    desligouAqui.ligar === null,
    "seguir o sistema nos dois sentidos religa sozinho e deixa desligar impossível"
  );

  // A PESSOA LIGOU NOS AJUSTES e voltou: aí ela pediu, fora do app.
  const ligouNosAjustes = espelhaOAparelho({ concedida: true, ligadoNoApp: false, sistemaAntes: false });
  conferir(
    "quem liga a permissão nos ajustes volta com o interruptor ligado",
    ligouNosAjustes.ligar === true,
    "é o único jeito de distinguir isto de 'acabei de desligar aqui': os dois retratos são iguais " +
      "sem a memória do que o sistema disse antes"
  );

  const jaLigado = espelhaOAparelho({ concedida: true, ligadoNoApp: true, sistemaAntes: true });
  conferir("com permissão e já ligado, não mexe em nada", jaLigado.ligar === null);
}

// ── a foto de perfil, e o toque na câmera ──────────────────────────────────
//
// DOIS RELATOS DO DONO no aparelho da Luana (07/09/2026), com a segunda 1.8 já
// instalada: a foto do Google não apareceu, e tocar na câmera abriu a tela de
// arquivos recentes em vez de perguntar entre câmera e galeria.
//
// Os dois são de Android e nenhum tem suíte que alcance: o WebView do aparelho
// não existe aqui, e a decisão entre câmera e seletor mora em código Java do
// Capacitor. O que dá para cobrar é que as três ligações que os consertam não
// sumam, porque cada uma delas, quando faltou, deixou o defeito de pé.
{
  const perfil = semComentarios(leia("components/app/screens/Profile.tsx"));

  conferir(
    "a foto de perfil não é pedida com referrer",
    /referrerPolicy="no-referrer"/.test(perfil),
    "o Android serve a página de https://localhost e manda esse Referer na busca da foto; " +
      "no iPhone o esquema é capacitor:// e não vai Referer nenhum, que é onde a foto sempre funcionou"
  );
  conferir(
    "foto que não carrega vira a inicial do nome",
    /onError=\{\(\) => setFotoFalhou\(true\)\}/.test(perfil) && /!fotoFalhou/.test(perfil),
    "sem isto o `<img>` quebrado desenha um buraco vazio, que é o que o dono viu: parece defeito " +
      "de desenho e não conta nada a ninguém"
  );
  conferir(
    "existe um campo com `capture` para a câmera",
    /capture="environment"/.test(perfil),
    "é a única palavra que o BridgeWebChromeClient do Capacitor lê para abrir a câmera em vez do " +
      "seletor de arquivos; sem ela não há como oferecer a câmera no Android"
  );
  conferir(
    "a escolha entre câmera e galeria só aparece no Android",
    /nativePlatform\(\) === "android"\) setEscolhendoFoto\(true\)/.test(perfil),
    "no iPhone o WKWebView já pergunta sozinho: pôr a nossa folha lá trocaria uma pergunta do " +
      "sistema, que a pessoa reconhece, por uma nossa"
  );
}

// ── cadastrou o carro e sumiu: um aviso dois dias depois ──────────────────
//
// 10/09/2026. É onde a coorte morre (1 em 8 volta na primeira semana), e até
// aqui nada do app falava com quem cadastrava o carro e não fazia mais nada.
// A regra é pura e as perguntas são as de sempre: quando avisa, quando NÃO
// avisa (fez algo, passou a hora, carro de antes), e se alguém chama.
{
  const dia = (s: string) => new Date(s);
  const carro = { createdAt: "2026-09-10T15:30:00" };
  const base = { veiculo: carro, servicosDoCarro: [], quiz: undefined };

  const quando = quandoAvisarCarroParado({ ...base, agora: dia("2026-09-10T16:00:00") });
  conferir("dois dias depois do cadastro, às 9h", !!quando && quando.getDate() === 12 && quando.getHours() === 9 && quando.getMinutes() === 0);
  conferir(
    "quem registrou um serviço no carro não recebe",
    quandoAvisarCarroParado({ ...base, servicosDoCarro: [{ id: "s", vehicleId: "v", type: "oil", date: "2026-09-10", km: 1, parts: [] }], agora: dia("2026-09-10T16:00:00") }) === null
  );
  conferir(
    "quem respondeu o quiz alguma vez não recebe",
    quandoAvisarCarroParado({ ...base, quiz: { ...QUIZ_ZERADO, respostas: 1 }, agora: dia("2026-09-10T16:00:00") }) === null
  );
  conferir(
    "passou a hora e não voltou: silêncio, nada de amanhã",
    quandoAvisarCarroParado({ ...base, agora: dia("2026-09-12T09:30:00") }) === null
  );
  conferir("carro de antes desta versão (sem data) não recebe", quandoAvisarCarroParado({ ...base, veiculo: {}, agora: dia("2026-09-10T16:00:00") }) === null);
  conferir("sem carro, nada", quandoAvisarCarroParado({ ...base, veiculo: null, agora: dia("2026-09-10T16:00:00") }) === null);

  const store = leia("lib/app/store.tsx");
  conferir("o cadastro carimba a data do carro", /createdAt:\s*v\.createdAt \?\? new Date\(\)\.toISOString\(\)/.test(store), "sem a data, a regra devolve null para todo carro e o aviso nunca existe");
  const abertura = leia("lib/app/aberturaDoApp.ts");
  conferir("a abertura sincroniza o aviso do carro parado", /sincronizarLembreteCarroParado\(\{/.test(abertura), "regra escrita e não chamada é o defeito silencioso de sempre");
  const cars = leia("components/app/screens/Cars.tsx");
  conferir("o cadastro do carro pede o convite de aviso", /pedirConviteNoCarro\(\)/.test(cars));
  conferir("e a garagem mostra o convite com o texto do carro", /<ConviteDeAviso[\s\S]*momento="carro"/.test(cars) && /conviteAvisoCorpo/.test(cars));
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) de aviso reprovaram.`);
  process.exit(1);
}
console.log("Aviso: o toque no lembrete abre a tela que o lembrete prometeu.");
