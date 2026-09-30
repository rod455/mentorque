"use client";

// A migalha do último passo, para saber o que o app estava fazendo quando
// desapareceu.
//
// O PROBLEMA QUE ISTO RESOLVE. Em 02/09/2026 um usuário relatou que o app
// FECHA ao responder o quiz no Android. O coletor de erros (lib/app/erros.ts)
// não tinha nada: ele enxerga exceção de JavaScript e promessa rejeitada, e
// nenhuma das duas fecha um app. Quando o processo do app (ou o renderizador
// da WebView) morre, o JavaScript morre junto e não sobra quem relate.
//
// A saída é escrever ANTES. A cada passo que vale a pena, gravamos no aparelho
// "estou aqui, agora". Se a próxima coisa que acontecer for uma abertura do
// app com essa migalha ainda quente, então a sessão anterior não terminou:
// ela foi interrompida. E a migalha diz em cima de qual passo.
//
// A trava contra falso positivo é o `pausado`: quando a pessoa manda o app
// para segundo plano, marcamos a migalha como fria. Aparelho apertado de
// memória mata app em segundo plano o tempo todo, e isso é normal do Android,
// não é o defeito que estamos caçando. O que interessa é morrer EM USO.

// A ÚNICA porta daqui para o Capacitor, e ela olha `window.Capacitor` sem
// carregar o pacote. Está num módulo sozinho por causa disso e para caber na
// conferência de linha de comando; o porquê inteiro está lá dentro. Extensão
// explícita porque o `node --experimental-strip-types` precisa dela.
import { isNativeApp } from "./capacitorPresente.ts";

const CHAVE = "mq-ultimo-passo";

/**
 * De quanto tempo para trás a migalha ainda acusa fechamento.
 *
 * Três minutos. Acima disso a chance de ser outra coisa (aparelho desligado,
 * app dormindo até o sistema recolher) já é maior que a de ser o defeito, e um
 * relato errado é pior que nenhum: ele enche a tabela de ruído com cara de
 * dado e faz o QA caçar fantasma.
 */
const JANELA_MS = 3 * 60 * 1000;

/**
 * Quão perto do passo uma "pausa" ainda é suspeita de ser a própria morte.
 *
 * O `pausado` existe contra falso positivo, e continua certo: Android recolhe
 * app parado em segundo plano o tempo todo. Só que ele tinha um buraco, e o
 * buraco engoliu justamente o caso que a migalha foi criada para pegar.
 *
 * Em 04/09/2026, na 1.7.0, o aparelho 70d10f37 respondeu o quiz às 18:27:44 e
 * reabriu o app às 18:28:04, vinte segundos depois. A janela de três minutos
 * cobria com folga, e mesmo assim NENHUMA linha saiu em `app_erros`. A hipótese
 * mais provável é esta: um app que está morrendo some da tela, e sumir da tela
 * dispara `visibilitychange` de `hidden`. Se o JavaScript ainda tiver um último
 * suspiro, ele mesmo esfria a migalha e a testemunha se cala sozinha.
 *
 * A separação que resolve é temporal, e é honesta: quem manda o app para
 * segundo plano faz isso SEGUNDOS ou minutos depois do último passo, porque
 * precisa ler a tela, decidir e tocar. Pausa colada no passo não é gente
 * saindo do app, é o app desaparecendo.
 *
 * Dois segundos é folgado de propósito para o lado do silêncio: quem sair do
 * app um segundo e meio depois de responder vira relato, e isso é aceitável,
 * porque perder o defeito é mais caro que uma linha a mais para o QA ler.
 */
const PAUSA_COLADA_MS = 2000;

type Migalha = {
  nome: string;
  t: number;
  pausado: boolean;
  /** Quando a pausa aconteceu. Ausente nas migalhas gravadas antes de 04/09. */
  pausadoEm?: number;
};

function ler(): Migalha | null {
  try {
    const cru = window.localStorage.getItem(CHAVE);
    if (!cru) return null;
    const m = JSON.parse(cru) as Partial<Migalha>;
    if (typeof m?.nome !== "string" || typeof m?.t !== "number") return null;
    return {
      nome: m.nome,
      t: m.t,
      pausado: m.pausado === true,
      pausadoEm: typeof m.pausadoEm === "number" ? m.pausadoEm : undefined,
    };
  } catch {
    return null;
  }
}

function gravar(m: Migalha): void {
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(m));
  } catch {
    /* sem armazenamento: fica sem migalha, e é só isso que se perde */
  }
}

/** Registra em que passo o app está agora. Barato de propósito: uma escrita. */
export function passo(nome: string): void {
  if (typeof window === "undefined") return;
  gravar({ nome, t: Date.now(), pausado: false });
}

/** O app foi para segundo plano: a migalha esfria e para de acusar. */
export function esfriaMigalha(): void {
  const m = ler();
  // A HORA da pausa é gravada junto, e é ela que separa "a pessoa saiu do app"
  // de "o app desapareceu da tela porque estava morrendo". Ver PAUSA_COLADA_MS.
  if (m) gravar({ ...m, pausado: true, pausadoEm: Date.now() });
}

/**
 * A sessão anterior morreu em uso? Devolve o passo em que ela estava.
 *
 * Consome a migalha: chamar duas vezes na mesma abertura devolve null na
 * segunda, senão o mesmo fechamento viraria dois relatos.
 */
export function fechamentoAnterior(): { nome: string; segundos: number; como: "sem-pausa" | "pausa-colada" } | null {
  if (typeof window === "undefined") return null;
  const m = ler();
  try {
    window.localStorage.removeItem(CHAVE);
  } catch {
    /* segue */
  }
  if (!m) return null;
  const ha = Date.now() - m.t;
  if (ha < 0 || ha > JANELA_MS) return null;
  // COMO a migalha concluiu, e isso existe por causa de 30/09/2026.
  //
  // A 2.9 ganhou o terceiro ouvinte (o nativo do Android) na MESMA versão em
  // que foi publicada. Resultado: a taxa de relatos por aparelho saltou de
  // 2,9% para 8,3% e não havia como saber se o app piorou ou se a testemunha
  // passou a enxergar mais. Foi preciso achar uma medida que não passasse pela
  // migalha (aberturas por aparelho, que ficou igual) para responder.
  //
  // Mudar o instrumento e a versão no mesmo envio cega a comparação. Com este
  // campo, a próxima vez separa sozinha: `sem-pausa` é "nenhum ouvinte viu o
  // app sair", `pausa-colada` é "um ouvinte viu, colado demais no passo para
  // ser a pessoa saindo". Um ouvinte novo mexe no segundo grupo, não no
  // primeiro, então o primeiro continua comparável entre versões.
  const como: "sem-pausa" | "pausa-colada" = m.pausado ? "pausa-colada" : "sem-pausa";
  if (m.pausado) {
    // Migalha antiga, gravada antes de existir `pausadoEm`: mantém o
    // comportamento velho e cala, porque sem a hora não dá para distinguir.
    if (m.pausadoEm === undefined) return null;
    // Pausa que veio SEGUNDOS depois do passo é a pessoa saindo do app: cala.
    // Pausa colada no passo é suspeita de ser a morte, e essa fala.
    if (m.pausadoEm - m.t > PAUSA_COLADA_MS) return null;
  }
  return { nome: m.nome, segundos: Math.round(ha / 1000), como };
}

/**
 * Liga os ouvintes que esfriam a migalha quando o app sai da frente.
 *
 * SÃO DOIS, e o segundo entrou em 05/09/2026 depois de a testemunha mentir
 * quatro vezes no mesmo minuto. Os relatos foram estes, todos na web:
 *
 *   11:45:08  fechou em "abriu o app", 69s depois
 *   11:45:38  fechou em "abriu o app", 31s depois
 *   11:45:40  fechou em "abriu o app",  2s depois
 *   11:46:18  fechou em "abriu o app", 38s depois
 *
 * Cruzando com o funil, era um aparelho só, que fez `cadastro` às 11:45:38 e
 * `iniciou_checkout` às 11:45:52. Os 31 segundos são a ida ao Google para
 * logar; os 38, a ida ao Stripe para pagar. Ninguém fechou nada.
 *
 * A causa é que `visibilitychange` NÃO dispara em navegação de página inteira.
 * Sair para o provedor de login e voltar deixa a migalha quente, e a próxima
 * abertura a lê como sessão interrompida. Ou seja: a testemunha acusava crash
 * exatamente nos dois momentos em que o produto ganha dinheiro, que também são
 * os dois que mais mandam a pessoa para fora da página.
 *
 * `pagehide` é o discriminador certo, e não por acaso: ele dispara em QUALQUER
 * saída ordenada da página (navegação, aba fechada, app indo para trás), e não
 * dispara quando o processo morre, porque não sobra JavaScript para disparar
 * nada. É essa assimetria que a migalha sempre quis medir.
 *
 * Os dois ouvintes convivem sem conflito: `esfriaMigalha` é idempotente para o
 * que interessa, e a trava do PAUSA_COLADA_MS continua valendo por cima dos
 * dois. App que morre e alcança disparar `pagehide` no último suspiro esfria a
 * migalha COLADA no passo, e a regra dos dois segundos faz ela falar assim
 * mesmo.
 */
export function vigiarPausa(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") esfriaMigalha();
  });
  window.addEventListener("pagehide", () => esfriaMigalha());
  void vigiarPausaNativa();
}

/**
 * O TERCEIRO OUVINTE, e é o único que é do Android (27/09/2026).
 *
 * POR QUE ELE FALTAVA. Os dois de cima são eventos de NAVEGADOR. A pergunta
 * que a migalha faz ("o app saiu da frente de propósito, ou morreu?") é uma
 * pergunta sobre o APLICATIVO, e quem responde isso no Android é o ciclo de
 * vida da Activity, não o DOM. `visibilitychange` numa WebView do Capacitor
 * acompanha a WebView, que nem sempre acompanha o app: dá para a Activity ir
 * para segundo plano sem o documento virar `hidden`.
 *
 * `App.addListener('appStateChange')` é o sinal do próprio sistema, e é ele
 * que separa as duas coisas sem depender de como a WebView se comporta naquele
 * aparelho.
 *
 * O QUE ISTO **NÃO** EXPLICA, e vale dizer para ninguém tratar como conserto
 * do defeito: em 27/09 os relatos de fechamento da 2.8.0 eram 2 aparelhos em
 * 73 que chegaram ao cadastro de carro. Se o ouvinte de DOM falhasse sempre,
 * os 73 relatariam, porque todo mundo manda o app para trás uma hora. Então o
 * que estes 2,7% são continua em aberto; o que muda aqui é a testemunha passar
 * a usar o sinal certo da plataforma que ela vigia.
 *
 * ⚠️ NÃO IMPORTE `@capacitor/core` AQUI. A primeira versão disto fazia
 * `const { Capacitor } = await import("@capacitor/core")` para perguntar
 * `isNativePlatform()`, e isso quase derrubou a venda no site inteiro.
 *
 * O motivo é uma linha de `lib/app/wrapper.ts:9`:
 *
 *     export function isNativeApp(): boolean {
 *       return !!(window as ...).Capacitor;      // PRESENÇA, não pergunta
 *     }
 *
 * Ela decide pela EXISTÊNCIA de `window.Capacitor`, e carregar o
 * `@capacitor/core` na web publica esse objeto. Ou seja: importar o pacote
 * para perguntar se estamos no app nativo faz o app nativo passar a existir.
 * Com isso `isNativeApp()` virava true no navegador, `sellsInApp()` virava
 * false, e o site inteiro entrava em MODO LEITOR: nenhum convite de assinatura
 * em lugar nenhum. Na web, que é uma das duas plataformas que conseguem
 * vender, porque no Android não há botão de compra.
 *
 * Quem pegou foi a suíte `telas`, em "o paywall desenha": ela chega ao paywall
 * pela faixa de convite do Estudos, e a faixa tinha sumido. Nenhuma conferência
 * de linha de comando via isso, e o `tsc` muito menos: o código estava certo,
 * a consequência é que era de outro arquivo.
 *
 * A porta certa é a `isNativeApp()` mesmo, que só OLHA a janela e não carrega
 * nada. Depois dela, importar o `@capacitor/app` é seguro: se estamos no app,
 * o Capacitor já está lá de qualquer jeito.
 */
async function vigiarPausaNativa(): Promise<void> {
  // Sem esta guarda o plugin também responderia na web, em cima do próprio
  // visibilitychange, e os dois ouvintes disputariam o mesmo `pausadoEm`.
  if (!isNativeApp()) return;
  try {
    const { App } = await import("@capacitor/app");
    await App.addListener("appStateChange", ({ isActive }) => {
      if (!isActive) esfriaMigalha();
    });
  } catch {
    /* sem plugin: os dois ouvintes de DOM continuam de pé */
  }
}
