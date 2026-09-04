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
// Rode com: npm run conferir:migalha
import { fechamentoAnterior, esfriaMigalha, passo } from "../lib/app/ultimoPasso.ts";

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

if (falhas) {
  console.error(`\n${falhas} conferência(s) da migalha reprovaram.`);
  process.exit(1);
}
console.log("Migalha: fechamento em uso é relatado uma vez; app em segundo plano fica calado.");
