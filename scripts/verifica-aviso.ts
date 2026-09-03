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
  return fonte.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/gm, " ");
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
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) de aviso reprovaram.`);
  process.exit(1);
}
console.log("Aviso: o toque no lembrete abre a tela que o lembrete prometeu.");
