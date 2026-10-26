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
//   5. o "Adicionar carro" oferece o ano do carro da pessoa (21/10/2026: um
//      carro de 1984 virou 2000 porque a lista parava em 2000)
//   6. a aula que responde o sintoma existe e abre no leitor (26/10/2026)
//
// Rode com: npm run conferir:catalogo
import { readFileSync } from "node:fs";
import { aulas } from "../lib/app/conteudo/aulas.ts";
import { ANO_MAIS_ANTIGO_DO_CADASTRO, anosDoCadastro, veiculos } from "../lib/app/conteudo/veiculos.ts";
import { AULAS_DO_SINTOMA, sintomas } from "../lib/app/conteudo/sintomas.ts";

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

// ── 3b. o MESMO beco, no outro campo: `related` ─────────────────────────────
//
// O bloco de cima confere o link [[id|texto]] do corpo. O `related` carrega
// id de aula igual, aparece na tela como "Continue por aqui", e não era
// conferido por ninguém (achado do Guardião em 26/09/2026, plantando um id
// morto ali e vendo esta conferência aprovar, saída 0).
//
// Some do mesmo jeito silencioso das sete aulas de vídeo que fizeram este
// arquivo nascer: Content.tsx faz `.map(...).filter(l => !!l)`, então o id que
// não resolve não quebra tela nenhuma, só deixa de virar card. A pessoa vê
// dois "Continue por aqui" onde deveria ver três, e nada avisa.
//
// A MEDIÇÃO ANTES DE ALARGAR, que é o que autoriza esta regra: 165
// referências de `related` em 56 aulas, UMA morta (`vid-padaria` apontava
// para `battery-care`, que não existe em lugar nenhum do repositório) e ZERO
// auto-referências. Um conserto, nenhum falso positivo.
{
  const existe = new Set(lessons.map((l) => l.id));
  const mortos: string[] = [];
  const proprios: string[] = [];
  for (const l of lessons) {
    for (const id of l.related ?? []) {
      if (!existe.has(id)) mortos.push(`${l.id} aponta para ${id}, que não existe`);
      else if (id === l.id) proprios.push(l.id);
    }
  }
  conferir(
    "todo id de `related` leva a uma aula existente",
    mortos.length === 0,
    mortos.join("\n       "),
  );
  conferir("nenhuma aula se lista no próprio `related`", proprios.length === 0, proprios.join(", "));
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

// ── 5. QUEM ENTREGA A PROMESSA: a tela (critério 10, achado em 17/10/2026) ──
//
// Este arquivo se chama "o catálogo de aulas não promete o que não entrega", e
// até hoje conferia só o lado do DADO: a aula que diz `video` tem `media`. O
// outro lado da mesma promessa é a tela desenhar o player, e isso não era
// conferido por ninguém.
//
// Medido: no `Content.tsx`, troquei `{lesson.media ? (` por
// `{lesson.media && lesson.type !== "video" ? (`. O tsc aceita, porque os
// tipos continuam certos, e aí as 48 aulas de vídeo passam a aparecer SEM
// player. Esta conferência passou verde e a CORRENTE INTEIRA do
// `npm run conferir` também, saída 0.
//
// É a mesma degradação silenciosa das sete aulas sem vídeo que fizeram este
// arquivo nascer, só que do outro lado do contrato: lá o dado mentia, aqui a
// tela emudece. Conferência de texto, e a dívida fica dita: o certo seria a
// suíte de navegador afirmar o player, e ela roda uma vez por mês.
{
  const tela = readFileSync(new URL("../components/app/screens/Content.tsx", import.meta.url), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/.*$/gm, " ");

  // O ELO: o player é desenhado por TER vídeo, e por mais nada. Qualquer
  // condição extra nesse portão é um jeito de esconder vídeo que existe.
  conferir(
    "a tela desenha o player para toda aula que tem vídeo",
    /\{lesson\.media \? \(/.test(tela),
    "condição extra nesse portão esconde vídeo que existe, e o dado continua dizendo que ele está lá",
  );
  conferir(
    "e o player recebe o vídeo da própria aula",
    /<VideoPlayer media=\{lesson\.media\}/.test(tela),
    "player sem o media da aula desenha outra coisa, ou nada",
  );
}

// ── 5. o ano do carro da pessoa existe na lista ────────────────────────────
{
  const em2026 = anosDoCadastro(new Date("2026-10-21T12:00:00Z"));
  conferir("o carro de 1984 do relato de 21/10 tem o ano dele", em2026.includes(1984));
  conferir("a lista vai até 1960", em2026.at(-1) === ANO_MAIS_ANTIGO_DO_CADASTRO && ANO_MAIS_ANTIGO_DO_CADASTRO <= 1960);
  conferir("o modelo do ano que vem já aparece", em2026[0] === 2027);
  conferir("a lista anda com o calendário", anosDoCadastro(new Date("2031-03-01T12:00:00Z"))[0] === 2032);
  conferir("sem buraco nem repetição, do mais novo ao mais antigo", em2026.every((a, i) => i === 0 || em2026[i - 1] - a === 1));
  conferir("a tela recebe essa lista", veiculos((pt: string) => pt).years.join() === anosDoCadastro().join());
}

// ── 6. a aula do sintoma existe, abre no leitor e chega à tela ──────────────
//
// O caminho do sintoma para a aula (26/10/2026) é uma tabela de ids, e id que
// não resolve some calado: a tela não desenha card para aula que não acha. É o
// mesmo beco do `related` (bloco 3b). E três ids do acervo não abrem o leitor,
// abrem uma ferramenta (`telas.tsx`), que não grava `viu_aula`: apontar o
// sintoma para eles deixaria a régua do Conteúdo cega sem ninguém ver.
{
  const porId = new Map(lessons.map((l) => [l.id, l]));
  const { symptoms } = sintomas((pt: string) => pt);
  const sintomasQueExistem = new Set(symptoms.map((x) => x.id));
  const telas = readFileSync(new URL("../components/app/telas.tsx", import.meta.url), "utf8");
  const ferramentas = new Set([...telas.matchAll(/view\.id === "([a-z0-9-]+)"/g)].map((m) => m[1]));
  const problemas: string[] = [];
  for (const [sid, ids] of Object.entries(AULAS_DO_SINTOMA)) {
    if (!sintomasQueExistem.has(sid)) problemas.push(`${sid} não é sintoma do app`);
    for (const id of ids) {
      const aula = porId.get(id);
      if (!aula) problemas.push(`${sid} aponta para ${id}, que não existe`);
      else if (ferramentas.has(id)) problemas.push(`${sid} aponta para ${id}, que abre ferramenta e não grava viu_aula`);
      else if (aula.premium) problemas.push(`${sid} aponta para ${id}, que é Premium: o caminho viraria paywall`);
    }
  }
  conferir("a aula de cada sintoma existe, abre no leitor e é livre", problemas.length === 0, problemas.join("\n       "));
  conferir("a conferência enxerga as ferramentas de telas.tsx", ferramentas.has("read-obd2"), [...ferramentas].join(", "));
  const chegam = symptoms.filter((x) => (x.aulas?.length ?? 0) > 0).length;
  conferir("a tabela chega aos sintomas que a tela recebe", chegam === Object.keys(AULAS_DO_SINTOMA).length, `${chegam} de ${Object.keys(AULAS_DO_SINTOMA).length}`);
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
