// De onde a pessoa veio: quando a etiqueta gruda e quando ela não pode sumir.
//
// Esta conferência nasce de um gasto real (03/09/2026): a campanha de busca
// "Mentorque Lançamento" queimou R$ 44,16 em 23 cliques e não produziu UM
// evento de funil etiquetado. A captura da UTM morava dentro do componente da
// landing de tráfego pago, então clique que caísse na home ou direto no app
// perdia a campanha na chegada, em silêncio.
//
// O que ela protege, e a segunda regra é a que quase ninguém lembra:
//
//   1. chegada COM etiqueta gruda, e o gclid vem junto (é ele que devolve a
//      conversão ao Google)
//   2. chegada SEM etiqueta NÃO apaga a etiqueta que já estava lá. Quem clica
//      no anúncio, sai e volta digitando o endereço continua sendo daquela
//      campanha, senão toda segunda visita rouba o crédito da primeira
//   3. só os campos conhecidos entram: guardar a query inteira seria guardar o
//      que a pessoa digitou em campo de busca e o que um terceiro pendurar
//
// Rode com: npm run conferir:campanha
import { capturaCampanha, campanhaGuardada, gclidGuardado, leDaUrl } from "../lib/app/campanha.ts";

import { readFileSync } from "node:fs";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

const gaveta = new Map<string, string>();
(globalThis as Record<string, unknown>).window = {
  localStorage: {
    getItem: (k: string) => gaveta.get(k) ?? null,
    setItem: (k: string, v: string) => void gaveta.set(k, v),
    removeItem: (k: string) => void gaveta.delete(k),
  },
};

const ANUNCIO = "?utm_source=google&utm_medium=cpc&utm_campaign=lancamento&gclid=EAIaIQobChMI1234abcd";

// ── 1. o caso do gasto: o clique do anúncio gruda ───────────────────────────
{
  gaveta.clear();
  capturaCampanha(ANUNCIO);
  const c = campanhaGuardada();
  conferir("a campanha do anúncio fica guardada", c !== null);
  conferir("com a origem", c?.utm_source === "google", `veio ${c?.utm_source}`);
  conferir("com a campanha", c?.utm_campaign === "lancamento", `veio ${c?.utm_campaign}`);
  conferir("e com o id do clique do Google", gclidGuardado() === "EAIaIQobChMI1234abcd", `veio ${gclidGuardado()}`);
}

// ── 2. a segunda visita não rouba o crédito da primeira ─────────────────────
//
// O caso que mais destrói atribuição na prática: a pessoa clica no anúncio,
// fecha, e volta depois digitando o endereço. Se a chegada limpa apagasse a
// etiqueta, toda venda apareceria como "direto" e a campanha nunca teria
// crédito de nada.
{
  gaveta.clear();
  capturaCampanha(ANUNCIO);
  capturaCampanha("");
  conferir("voltar sem etiqueta não apaga a campanha", campanhaGuardada()?.utm_campaign === "lancamento");
  capturaCampanha("?nada=1&outro=2");
  conferir("voltar com query sem campanha também não apaga", campanhaGuardada()?.utm_campaign === "lancamento");
  conferir("e o clique do Google sobrevive junto", gclidGuardado() === "EAIaIQobChMI1234abcd");
}

// ── 3. campanha nova substitui a antiga ─────────────────────────────────────
{
  gaveta.clear();
  capturaCampanha(ANUNCIO);
  capturaCampanha("?utm_source=email&utm_campaign=lista-espera");
  conferir("a campanha mais recente é a que vale", campanhaGuardada()?.utm_campaign === "lista-espera");
  conferir("e a origem acompanha", campanhaGuardada()?.utm_source === "email");
}

// ── 4. só os campos conhecidos entram ───────────────────────────────────────
{
  const c = leDaUrl("?utm_source=google&senha=segredo&q=barulho+no+motor&gclid=abcdefghij");
  conferir("campo desconhecido não é guardado", c?.senha === undefined && c?.q === undefined, JSON.stringify(c));
  conferir("os conhecidos continuam entrando", c?.utm_source === "google" && c?.gclid === "abcdefghij");
}

// ── 5. chegada limpa não inventa campanha ───────────────────────────────────
{
  gaveta.clear();
  conferir("sem nada guardado, não há campanha", capturaCampanha("") === null);
  conferir("e não há clique do Google", gclidGuardado() === null);
}

// ── 6. valor absurdo é cortado, não recusado ────────────────────────────────
{
  gaveta.clear();
  capturaCampanha(`?utm_campaign=${"x".repeat(500)}`);
  const v = campanhaGuardada()?.utm_campaign ?? "";
  conferir("campanha comprida demais é cortada", v.length === 120, `ficou com ${v.length}`);
}


// ── 7. o PRIMEIRO evento da visita também sai etiquetado ────────────────────
//
// O defeito, medido em 03/09/2026: o `abriu_app` saía SEM etiqueta, e ele é
// justamente o evento que atribui a chegada. A captura mora no layout raiz e
// guarda num efeito; o `abriu_app` sai de um efeito lá dentro do Shell. No
// React o efeito do FILHO roda antes do efeito do PAI, então a ordem real era
// disparar primeiro e guardar depois.
//
// O conserto foi o `funil.ts` ler da URL em vez de só do armazenamento, e é
// isso que esta conferência protege: se alguém trocar de volta por
// `campanhaGuardada()`, a atribuição volta a perder a chegada em silêncio, que
// é o pior jeito de perder.
//
// Confere no TEXTO do arquivo, sem comentários. A limpeza não é capricho: neste
// repositório todo comentário cita código, e sem ela a explicação do conserto
// satisfaria a busca sozinha (foi o que aconteceu com a conferir:aviso).
{
  const semComentarios = (f: string) =>
    f.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/gm, " ");
  const funil = semComentarios(readFileSync(new URL("../lib/app/funil.ts", import.meta.url), "utf8"));
  const corpo = funil.slice(funil.indexOf("function utmGuardada"), funil.indexOf("export function funil"));
  conferir(
    "o funil lê a campanha da URL, não só do armazenamento",
    /capturaCampanha\s*\(/.test(corpo),
    "sem isso o primeiro evento da visita sai sem etiqueta"
  );

  // E a garantia de comportamento por trás disso: com a gaveta vazia, a
  // primeira leitura já devolve a campanha que está na URL.
  gaveta.clear();
  const primeira = capturaCampanha("?utm_source=email&utm_campaign=lista-espera");
  conferir("com nada guardado, a URL já responde", primeira?.utm_campaign === "lista-espera");
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) de campanha reprovaram.`);
  process.exit(1);
}
console.log("Campanha: o clique do anúncio gruda, e voltar sem etiqueta não apaga o crédito.");
