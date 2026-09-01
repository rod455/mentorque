// O catálogo de aulas não promete o que não entrega.
//
// POR QUE ISTO EXISTE (01/09/2026): o catálogo tinha 50 aulas marcadas como
// `type: "video"` e só 43 com vídeo de verdade. As sete restantes mostravam a
// arte de "vídeo ainda não publicado". A tela degradava bem, então nunca
// quebrou nada e ninguém percebeu; só que seis delas eram as aulas DE MÃO,
// justamente as que a pessoa abre em pé do lado do carro.
//
// Quem achou foi o agente de Conteúdo, contando o catálogo à mão. Contagem à
// mão acha uma vez; conferência acha todo dia.
//
// O que ela protege:
//   1. aula que diz "video" tem vídeo (o caso das sete)
//   2. link [[id|texto]] aponta para aula que existe (link morto vira beco)
//   3. aula não se linka para ela mesma
//   4. id não se repete
//
// Rode com: npm run conferir:catalogo
import { aulas } from "../lib/app/conteudo/aulas.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

const { lessons } = aulas((pt: string) => pt);

// ── 1. quem diz vídeo, tem vídeo ────────────────────────────────────────────
{
  const semVideo = lessons.filter((l) => l.type === "video" && !l.media);
  conferir(
    "nenhuma aula marcada como vídeo está sem vídeo",
    semVideo.length === 0,
    semVideo.length
      ? `${semVideo.length}: ${semVideo.map((l) => l.id).join(", ")}\n       ` +
        "Ou grave o vídeo e acrescente `media`, ou mude `type` para \"article\".\n       " +
        "A lista e o caminho de volta estão em docs/conteudo/videos-a-gravar.md"
      : "",
  );
}

// ── 2. o contrário também: vídeo anexado numa aula que não é vídeo ─────────
{
  const desalinhadas = lessons.filter((l) => l.media && l.type !== "video");
  conferir(
    "aula com vídeo anexado está marcada como vídeo",
    desalinhadas.length === 0,
    desalinhadas.map((l) => `${l.id} (type=${l.type})`).join(", "),
  );
}

// ── 3. link interno aponta para aula que existe ────────────────────────────
{
  const existe = new Set(lessons.map((l) => l.id));
  const quebrados: string[] = [];
  const proprios: string[] = [];
  for (const l of lessons) {
    for (const p of l.body ?? []) {
      for (const m of p.matchAll(/\[\[([a-z0-9-]+)\|/g)) {
        if (!existe.has(m[1])) quebrados.push(`${l.id} aponta para ${m[1]}, que não existe`);
        else if (m[1] === l.id) proprios.push(l.id);
      }
    }
  }
  conferir("todo link [[id|texto]] leva a uma aula existente", quebrados.length === 0, quebrados.join("\n       "));
  conferir("nenhuma aula se linka para ela mesma", proprios.length === 0, proprios.join(", "));
}

// ── 4. id único ─────────────────────────────────────────────────────────────
{
  const vistos = new Set<string>();
  const repetidos: string[] = [];
  for (const l of lessons) {
    if (vistos.has(l.id)) repetidos.push(l.id);
    vistos.add(l.id);
  }
  conferir("nenhum id de aula repetido", repetidos.length === 0, repetidos.join(", "));
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) de catálogo reprovaram.`);
  process.exit(1);
}

const videos = lessons.filter((l) => l.type === "video").length;
const artigos = lessons.filter((l) => l.type === "article").length;
console.log(
  `Catálogo: ${lessons.length} aulas (${videos} com vídeo, ${artigos} artigos), sem promessa vazia e sem link morto.`,
);
