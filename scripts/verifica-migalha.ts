// A migalha do último passo: quando ela acusa fechamento e quando ela cala.
//
// Esta conferência nasce de um relato real (02/09/2026): um usuário disse que
// o app FECHA ao responder o quiz no Android, e não havia uma única linha em
// app_erros. Não havia porque quando o app morre o JavaScript morre junto, e
// o coletor de erros só enxerga exceção de quem continua vivo.
//
// A migalha é a testemunha que sobra. E uma testemunha que fala demais é pior
// que nenhuma: se ela acusar "fechou sozinho" toda vez que o Android recolhe
// um app parado em segundo plano, a tabela enche de ruído com cara de dado e o
// defeito de verdade some no meio. Por isso o que esta conferência protege é,
// nesta ordem:
//
//   1. morreu EM USO: acusa, e diz em cima de qual passo
//   2. estava em segundo plano: cala
//   3. faz muito tempo: cala
//   4. acusa UMA vez só: a migalha é consumida na leitura
//
// E DESDE 27/09/2026, o que faltava e é o coração do assunto:
//
//   5. a migalha SABE DIZER ONDE. Até este dia o app inteiro tinha cinco
//      chamadas de `passo()`, e nenhuma no onboarding, no cadastro do carro ou
//      no paywall. A testemunha respondia "abriu o app" sempre, porque era o
//      único passo no caminho de quem acabou de instalar. Ela não estava
//      mentindo: estava cega, e o dono chegou a perguntar se não era melhor
//      desligar o relato. O conserto foi ligar a migalha ao ROTEADOR, um lugar
//      só, para toda tela que existir daqui para frente entrar sozinha.
//   6. a ORDEM no Shell, que é a regra que o conserto podia quebrar: quem lê a
//      migalha da sessão anterior roda ANTES de quem escreve a desta.
//   7. o ouvinte de pausa do ANDROID está ligado. Os dois antigos são eventos
//      de navegador, e a pergunta da migalha é sobre o aplicativo.
//   8. o relato diz EM QUE APARELHO (lib/app/aparelho.ts).
//
// Rode com: npm run conferir:migalha
import { readFileSync } from "node:fs";
import { fechamentoAnterior, esfriaMigalha, passo } from "../lib/app/ultimoPasso.ts";
import { descreveAparelho } from "../lib/app/aparelho.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

// ── um navegador de mentira, com só o que a migalha usa ─────────────────────
//
// A migalha vive no localStorage e escuta o visibilitychange. Aqui interessa a
// REGRA, não o navegador, então basta uma gaveta de memória e um documento com
// o estado de visibilidade. `vigiarPausa` fica de fora de propósito: o que ela
// faz é chamar `esfriaMigalha`, e é isso que a conferência exercita direto.
const gaveta = new Map<string, string>();
(globalThis as Record<string, unknown>).window = {
  localStorage: {
    getItem: (k: string) => gaveta.get(k) ?? null,
    setItem: (k: string, v: string) => void gaveta.set(k, v),
    removeItem: (k: string) => void gaveta.delete(k),
  },
};

const CHAVE = "mq-ultimo-passo";
/** Reescreve a migalha existente com outro carimbo de tempo. */
function envelhece(segundos: number) {
  const m = JSON.parse(gaveta.get(CHAVE) as string) as { nome: string; t: number; pausado: boolean };
  gaveta.set(CHAVE, JSON.stringify({ ...m, t: Date.now() - segundos * 1000 }));
}

// ── 1. morreu em uso: acusa, e diz onde ─────────────────────────────────────
{
  gaveta.clear();
  passo("respondeu o quiz");
  envelhece(7);
  const f = fechamentoAnterior();
  conferir("morrer em uso é relatado", f !== null);
  conferir("o relato diz em cima de qual passo", f?.nome === "respondeu o quiz", `veio "${f?.nome}"`);
  conferir("o relato diz há quanto tempo", f?.segundos === 7, `veio ${f?.segundos}`);
}

// ── 1b. O PISO DA JANELA: o caso de 04/09 tem que caber nela ────────────────
//
// Achado do Guardião em 03/10/2026, e o jeito de achar foi plantar o valor em
// vez do código. A janela era conferida só por cima: migalha velha cala, o que
// prende o TETO. Por baixo não havia nada, e `JANELA_MS` podia cair para 8
// segundos sem reprovar nenhuma linha deste arquivo.
//
// Oito segundos reabriria exatamente o buraco que fez esta conferência nascer:
// o aparelho 70d10f37 respondeu o quiz às 18:27:44 e reabriu o app às
// 18:28:04, VINTE segundos depois. Com a janela em 8, aquele fechamento ficaria
// fora dela e a testemunha calaria de novo, verde.
//
// O piso é o caso do relato COM FOLGA, e a folga é o ponto. Uma janela de
// exatamente vinte segundos pegaria aquele aparelho por um fio e perderia
// qualquer pessoa um segundo mais lenta, e a pessoa é mais lenta: ela destrava
// o telefone, procura o ícone e volta. Um minuto é a medida honesta disso, e
// continua muito abaixo dos três minutos, então não vira uma segunda definição
// da constante.
{
  gaveta.clear();
  passo("respondeu o quiz");
  envelhece(60);
  const f = fechamentoAnterior();
  conferir(
    "fechamento de 1 minuto atrás ainda é relatado (o caso de 04/09, com folga)",
    f !== null,
    "se isto reprovar, JANELA_MS encolheu para perto do caso que a migalha existe para pegar",
  );
}

// ── 2. estava em segundo plano: cala ────────────────────────────────────────
//
// O caso que mais geraria ruído. Android recolhe app parado em segundo plano o
// tempo todo, e isso é comportamento normal do sistema, não defeito nosso.
{
  gaveta.clear();
  passo("respondeu o quiz");
  esfriaMigalha();
  envelhece(7);
  conferir("app recolhido em segundo plano NÃO vira relato", fechamentoAnterior() === null);
}

// ── 3. faz muito tempo: cala ────────────────────────────────────────────────
{
  gaveta.clear();
  passo("respondeu o quiz");
  envelhece(10 * 60);
  conferir("migalha velha não acusa nada", fechamentoAnterior() === null);
}

// ── 4. acusa uma vez só ─────────────────────────────────────────────────────
//
// Sem isto, um aparelho que fechasse uma vez relataria o MESMO fechamento em
// toda abertura seguinte, e um caso viraria vinte na contagem do QA.
{
  gaveta.clear();
  passo("respondeu o quiz");
  envelhece(7);
  conferir("a primeira leitura acusa", fechamentoAnterior() !== null);
  conferir("a segunda leitura já não acusa", fechamentoAnterior() === null);
}

// ── 5. sem migalha nenhuma, silêncio ────────────────────────────────────────
{
  gaveta.clear();
  conferir("abertura limpa não inventa fechamento", fechamentoAnterior() === null);
}

// ── 6. relógio para trás não vira relato ────────────────────────────────────
//
// Fuso mudando ou relógio corrigido pela rede deixam a migalha no futuro. Isso
// não é fechamento, é aritmética; melhor calar do que acusar.
{
  gaveta.clear();
  passo("respondeu o quiz");
  envelhece(-30);
  conferir("migalha no futuro não acusa nada", fechamentoAnterior() === null);
}


// ── 7. a pausa COLADA no passo continua acusando ────────────────────────────
//
// O caso de 04/09/2026, e o motivo de o `pausadoEm` existir. Um app que morre
// some da tela, e sumir da tela dispara `visibilitychange` de `hidden`. Se o
// JavaScript tiver um último suspiro, ele mesmo esfria a migalha e a
// testemunha se cala sozinha, justamente no caso que ela foi criada para
// pegar. Foi o que aconteceu: o aparelho respondeu o quiz às 18:27:44, reabriu
// vinte segundos depois, dentro da janela, e nada saiu em `app_erros`.
//
// A separação é temporal: pausa colada no passo é o app desaparecendo; pausa
// segundos depois é gente saindo do app (caso 2, que continua calado).
{
  gaveta.clear();
  passo("respondeu o quiz");
  esfriaMigalha(); // no mesmo instante, como um app morrendo
  // Envelhece os DOIS carimbos junto, mantendo a distância entre eles: a
  // sessão morreu há 7 segundos e a pausa foi colada na morte.
  {
    const m = JSON.parse(gaveta.get(CHAVE) as string) as { t: number; pausadoEm: number };
    gaveta.set(
      CHAVE,
      JSON.stringify({ ...m, t: m.t - 7000, pausadoEm: m.pausadoEm - 7000 })
    );
  }
  const f = fechamentoAnterior();
  conferir("pausa colada no passo ainda vira relato", f !== null, "é o app morrendo, não a pessoa saindo");
  conferir("e o relato diz o passo certo", f?.nome === "respondeu o quiz", `veio "${f?.nome}"`);
}

// ── 7b. O PISO DA COLA: 1,5 segundo ainda é colado ──────────────────────────
//
// O caso de cima usa distância ZERO entre o passo e a pausa, o mesmo
// instante. Isso prova que a trava existe, e não prova o tamanho dela:
// medido em 03/10/2026, com `PAUSA_COLADA_MS` em 0, 1 ou 50 milissegundos
// este arquivo passava inteiro, verde.
//
// E zero é o buraco de volta. Um app que morre e alcança disparar `pagehide`
// no último suspiro grava a pausa alguns milissegundos depois do passo, não no
// mesmo milissegundo. Com a trava em zero, esse app volta a calar, que é
// exatamente o defeito de 04/09.
//
// O piso aqui não é invenção: está escrito no próprio lib/app/ultimoPasso.ts,
// em cima da constante. "Quem sair do app um segundo e meio depois de
// responder vira relato, e isso é aceitável, porque perder o defeito é mais
// caro que uma linha a mais para o QA ler." Esta é a linha que cobra isso.
{
  gaveta.clear();
  passo("respondeu o quiz");
  esfriaMigalha();
  {
    const m = JSON.parse(gaveta.get(CHAVE) as string) as { t: number; pausadoEm: number };
    // A pausa chegou 1,5s DEPOIS do passo, e os dois envelhecem 7s juntos.
    gaveta.set(
      CHAVE,
      JSON.stringify({ ...m, t: m.t - 7000, pausadoEm: m.pausadoEm - 7000 + 1500 }),
    );
  }
  const f = fechamentoAnterior();
  conferir(
    "pausa 1,5s depois do passo ainda conta como colada",
    f !== null,
    "se isto reprovar, PAUSA_COLADA_MS encolheu e o app que morre com um último suspiro volta a calar",
  );
}

// ── 8. migalha antiga, sem a hora da pausa, continua calada ─────────────────
//
// Compatibilidade: aparelho que atualizar o app no meio pode ter uma migalha
// gravada pelo código velho, sem `pausadoEm`. Sem a hora não dá para
// distinguir morte de saída, e na dúvida vale o silêncio de antes.
{
  gaveta.clear();
  passo("respondeu o quiz");
  {
    const m = JSON.parse(gaveta.get(CHAVE) as string) as { nome: string; t: number };
    gaveta.set(CHAVE, JSON.stringify({ nome: m.nome, t: m.t - 7000, pausado: true }));
  }
  conferir("migalha velha pausada segue calada", fechamentoAnterior() === null);
}

// ── 9. SAIR DA PÁGINA TAMBÉM ESFRIA, e é isto que faltava ──────────────────
//
// O caso real, de 05/09/2026. A testemunha mentiu quatro vezes no mesmo
// minuto, todas na web, todas dizendo "app fechou sozinho em: abriu o app":
// 69s, 31s, 2s e 38s depois do passo. Cruzando com o funil era um aparelho só,
// que fez `cadastro` às 11:45:38 e `iniciou_checkout` às 11:45:52. Os 31
// segundos são a ida ao Google para logar; os 38, a ida ao Stripe para pagar.
//
// A causa: `visibilitychange` NÃO dispara em navegação de página inteira. A
// migalha ficava quente durante o passeio pelo provedor, e a volta era lida
// como sessão interrompida. A testemunha acusava crash exatamente nos dois
// momentos em que o produto ganha dinheiro.
//
// `pagehide` dispara em qualquer saída ORDENADA e não dispara quando o
// processo morre, porque não sobra JavaScript para disparar. É essa assimetria
// que a migalha sempre quis medir, e é por isso que esta conferência exercita
// `vigiarPausa` de verdade, e não só o `esfriaMigalha` por dentro: o que
// faltava não era a regra, era o ouvinte.
{
  const ouvintes = new Map<string, (() => void)[]>();
  const registra = (alvo: Map<string, (() => void)[]>) => (nome: string, fn: () => void) => {
    alvo.set(nome, [...(alvo.get(nome) ?? []), fn]);
  };
  const janela = (globalThis as Record<string, unknown>).window as Record<string, unknown>;
  janela.addEventListener = registra(ouvintes);
  (globalThis as Record<string, unknown>).document = {
    addEventListener: registra(ouvintes),
    visibilityState: "visible",
  };

  const { vigiarPausa } = await import("../lib/app/ultimoPasso.ts");
  vigiarPausa();

  conferir("vigiarPausa escuta pagehide", ouvintes.has("pagehide"), [...ouvintes.keys()].join(", "));
  conferir("e continua escutando visibilitychange", ouvintes.has("visibilitychange"), [...ouvintes.keys()].join(", "));

  // O caso do Google: passo, 31 segundos fora da página, volta. Não é crash.
  gaveta.clear();
  passo("abriu o app");
  for (const fn of ouvintes.get("pagehide") ?? []) fn();
  {
    const m = JSON.parse(gaveta.get(CHAVE) as string) as { t: number; pausadoEm: number };
    gaveta.set(CHAVE, JSON.stringify({ ...m, t: m.t - 31000 }));
  }
  conferir("ida ao login e volta NÃO vira relato", fechamentoAnterior() === null, "foi o que encheu a tabela em 05/09");

  // E a trava de sempre continua de pé: morte colada no passo fala, mesmo que
  // o último suspiro do app tenha alcançado disparar o pagehide.
  gaveta.clear();
  passo("respondeu o quiz");
  for (const fn of ouvintes.get("pagehide") ?? []) fn();
  {
    const m = JSON.parse(gaveta.get(CHAVE) as string) as { t: number; pausadoEm: number };
    gaveta.set(CHAVE, JSON.stringify({ ...m, t: m.t - 7000, pausadoEm: m.pausadoEm - 7000 }));
  }
  conferir("morte colada no passo continua falando", fechamentoAnterior() !== null, "o pagehide não pode calar o defeito");
}

// ── 10. A MIGALHA SABE DIZER ONDE ───────────────────────────────────────────
//
// A conferência que faltava, e a falta dela custou 25 dias de relatos inúteis.
// Tudo acima prova QUANDO a testemunha fala e quando cala. Nada provava que
// ela tem o que dizer. O app inteiro tinha cinco `passo()`, nenhum nas telas
// que a pessoa nova atravessa, e por isso todo relato de 05 a 26/09 saiu com a
// mesma frase: "app fechou sozinho em: abriu o app".
//
// Ela olha o FONTE porque o que se conserta aqui é ligação, não regra: o
// roteador precisa alimentar a migalha, e o Shell precisa fazer isso na ordem
// certa. Nenhum dos dois cabe no navegador de mentira lá de cima.
const leia = (caminho: string) => readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8");

/** O fonte sem comentário nenhum, para as perguntas sobre o que o motor executa. */
function semComentarios(fonte: string): string {
  return fonte.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}
{
  const abertura = leia("lib/app/aberturaDoApp.ts");
  const shell = leia("components/app/Shell.tsx");

  conferir(
    "existe um gancho que grava migalha a cada tela",
    /export function useMigalhaDaTela\(/.test(abertura),
    "sem ele a migalha volta a conhecer só os cinco lugares que alguém lembrou de instrumentar à mão"
  );
  conferir(
    "e ele grava o nome da TELA, não um rótulo fixo",
    /passo\(`tela: \$\{view\.name\}`\)/.test(abertura),
    "um rótulo fixo é o mesmo que nada: o relato precisa nomear onde a pessoa estava"
  );
  conferir(
    "o Shell liga o gancho de verdade",
    /useMigalhaDaTela\(view\)/.test(shell),
    "o gancho pode existir e ninguém chamar, que é o mesmo que não existir"
  );

  // ── A ORDEM, que é a regra que este conserto podia atropelar ──────────────
  //
  // `useFunilDeAbertura` LÊ a migalha da sessão anterior; `useMigalhaDaTela`
  // ESCREVE a desta. Os dois são efeitos do mesmo componente, então a ordem de
  // declaração é a ordem de execução. Invertidos, a primeira tela apaga o
  // rastro do fechamento que o app abriu justamente para contar, e o sintoma
  // seria a tabela ficar VAZIA: silêncio, que ninguém investiga.
  const iAbertura = shell.indexOf("useFunilDeAbertura()");
  const iMigalha = shell.indexOf("useMigalhaDaTela(view)");
  conferir(
    "a leitura da migalha antiga vem ANTES da escrita da nova",
    iAbertura >= 0 && iMigalha > iAbertura,
    `useFunilDeAbertura em ${iAbertura}, useMigalhaDaTela em ${iMigalha}. Trocados, o fechamento nunca mais é relatado e a tabela fica muda.`
  );
}

// ── 11. O OUVINTE DE PAUSA DO ANDROID ───────────────────────────────────────
//
// Os dois ouvintes de 05/09 são `visibilitychange` e `pagehide`, eventos de
// NAVEGADOR. A pergunta da migalha ("o app saiu de propósito ou morreu?") é
// sobre o APLICATIVO, e quem responde isso no Android é o ciclo de vida da
// Activity. Numa WebView do Capacitor a Activity pode ir para trás sem o
// documento virar `hidden`.
{
  const fonte = leia("lib/app/ultimoPasso.ts");
  conferir(
    "a pausa escuta o estado do app no Capacitor",
    /addListener\(\s*["']appStateChange["']/.test(fonte),
    "sem isto a testemunha usa só sinal de navegador para decidir sobre um aplicativo"
  );
  conferir(
    "e esse ouvinte esfria a migalha quando o app sai da frente",
    /isActive[\s\S]{0,80}esfriaMigalha\(\)/.test(fonte),
    "escutar sem agir é decoração"
  );
  conferir(
    "o ouvinte nativo não sobe na web",
    /if \(!isNativeApp\(\)\) return;/.test(fonte),
    "na web o plugin responde em cima do próprio visibilitychange, e os dois disputariam o mesmo pausadoEm"
  );

  // ── A ARMADILHA QUE QUASE DERRUBOU A VENDA NO SITE (27/09/2026) ───────────
  //
  // A primeira versão do ouvinte perguntava "estamos no app nativo?" assim:
  //
  //     const { Capacitor } = await import("@capacitor/core");
  //     if (!Capacitor.isNativePlatform()) return;
  //
  // Correto em si, e desastroso por causa de OUTRO arquivo. `wrapper.ts:9`
  // decide pela PRESENÇA de `window.Capacitor`, não perguntando nada:
  //
  //     return !!(window as ...).Capacitor;
  //
  // Carregar o `@capacitor/core` na web PUBLICA esse objeto. Importar o pacote
  // para perguntar se estamos no app nativo fazia o app nativo passar a
  // existir: `isNativeApp()` virava true no navegador, `sellsInApp()` virava
  // false, e o site inteiro entrava em modo leitor, SEM NENHUM convite de
  // assinatura. Na web, que é uma das duas plataformas que conseguem vender.
  //
  // Quem pegou foi a suíte `telas` ("o paywall desenha"), depois de 11 minutos
  // de navegador. Esta linha pega em dois segundos, e por isso ela existe:
  // conferência de fonte não substitui a de navegador, mas falha mais cedo e
  // diz o porquê, que é o que faltou aqui.
  // SEM OS COMENTÁRIOS, e isso não é zelo: a primeira versão desta linha
  // reprovou o arquivo CERTO, porque o comentário que explica a armadilha cita
  // `await import("@capacitor/core")` para contar o que não se deve fazer. É a
  // segunda vez no mesmo dia que uma conferência lê um comentário como código
  // (a outra foi a de banco, com "SECURITY DEFINER" dentro de um comentário).
  // Conferência que procura texto tem que olhar só o que o motor executa.
  conferir(
    "a migalha NÃO carrega o @capacitor/core",
    !/@capacitor\/core/.test(semComentarios(fonte)),
    'importar o core na web publica `window.Capacitor`, e `isNativeApp()` de wrapper.ts:9 decide pela PRESENÇA dele. O site inteiro entra em modo leitor e some todo convite de assinatura. Use `isNativeApp()`, que só olha a janela.'
  );
}

// ── 12. O RELATO DIZ EM QUE APARELHO ────────────────────────────────────────
//
// "Morre na tela de cadastro do carro" e "morre na tela de cadastro do carro
// num Android de 2GB" pedem consertos diferentes, e até 27/09 eram a mesma
// linha. Os casos abaixo são user agents REAIS de WebView do Android, com as
// três formas que aparecem na prática (com Build, com `; wv`, e limpo).
{
  const casos: [string, Parameters<typeof descreveAparelho>[0], RegExp][] = [
    [
      "Android com Build e wv",
      { ua: "Mozilla/5.0 (Linux; Android 10; SM-G960F Build/QP1A.190711.020; wv) AppleWebKit/537.36", memoriaGb: 4, nucleos: 8 },
      /^Android 10 · SM-G960F · 4GB · 8 nucleos$/,
    ],
    [
      "Android limpo, modelo com espaços e parênteses",
      { ua: "Mozilla/5.0 (Linux; Android 11; moto g(8) power lite) AppleWebKit/537.36", memoriaGb: 2, nucleos: 8 },
      /^Android 11 · moto g\(8\) power lite · 2GB · 8 nucleos$/,
    ],
    [
      "iPhone, que não publica modelo",
      { ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15", nucleos: 6 },
      /^iPhone · iOS 17\.5\.1 · 6 nucleos$/,
    ],
    [
      // O Chrome novo troca o modelo por "K" quando anonimiza o user agent.
      // "Android 13 · K" seria uma linha com cara de dado e sem dado nenhum.
      "Android com user agent anonimizado",
      { ua: "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36", memoriaGb: 8, nucleos: 8 },
      /^Android 10 · 8GB · 8 nucleos$/,
    ],
    ["navegador de mesa", { ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36", nucleos: 10 }, /^web · 10 nucleos$/],
    ["sem user agent nenhum", { ua: "" }, /^$/],
  ];
  for (const [nome, sinais, esperado] of casos) {
    const saiu = descreveAparelho(sinais);
    conferir(`aparelho, ${nome}`, esperado.test(saiu), `veio "${saiu}"`);
  }

  // A MEMÓRIA É O CAMPO QUE IMPORTA para o defeito que motivou tudo isto, e é
  // o único que pode faltar sem o resto faltar: o WebKit não implementa
  // `deviceMemory`. Faltando, a linha sai sem ela em vez de sair quebrada.
  const semMemoria = descreveAparelho({ ua: "Mozilla/5.0 (Linux; Android 13; SM-A135M) AppleWebKit/537.36", nucleos: 8 });
  conferir("aparelho sem memória informada não inventa número", semMemoria === "Android 13 · SM-A135M · 8 nucleos", `veio "${semMemoria}"`);

  // E a ligação: de nada adianta a função existir se o relato não a manda, ou
  // se a rota joga o campo fora.
  const erros = leia("lib/app/erros.ts");
  const rota = leia("app/api/erros/route.ts");
  conferir("o coletor manda o aparelho junto", /aparelho:\s*aparelhoAtual\(\)/.test(erros));
  conferir("a rota grava o aparelho", /aparelho:\s*corta\(b\?\.aparelho/.test(rota), "sem isto o campo chega ao servidor e morre lá");

  // COMO a migalha concluiu (30/09/2026). A 2.9 ganhou o ouvinte nativo na
  // mesma versão em que foi publicada, e por isso não deu para saber se a alta
  // dos relatos era o app piorando ou a testemunha enxergando mais. O campo
  // separa os dois grupos: um ouvinte novo mexe em `pausa-colada` e não em
  // `sem-pausa`, então `sem-pausa` continua comparável entre versões.
  // NÃO confiro aqui que o tipo de retorno declara `como`: o compilador já
  // reprova isso sozinho (tirar o campo do tipo quebra o `return`, tirar dos
  // dois quebra o `f.como` em erros.ts), e a primeira versão desta asserção
  // passou verde com o defeito plantado porque casava com a declaração da
  // variável local, não com o tipo. Conferência não vale para repetir o
  // compilador, e quando repete costuma repetir mal.
  conferir(
    "e o coletor leva o `como` no rastro",
    /\$\{f\.como\}/.test(erros),
    "o campo existir sem viajar até app_erros não serve para nada",
  );
  conferir(
    "o `como` NÃO entra na mensagem, que precisa agrupar",
    !/app fechou sozinho em:[^`]*\$\{f\.como\}/.test(erros),
    "mensagem com o campo dentro quebra o agrupamento do top de erros",
  );
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) da migalha reprovaram.`);
  process.exit(1);
}
console.log(
  "Migalha: fechamento em uso é relatado uma vez, app em segundo plano fica calado,\n" +
    "e o relato agora diz em QUAL TELA e em QUE APARELHO."
);
