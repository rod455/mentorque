// Aula agendada não pode vazar antes do dia.
//
// Esta conferência nasce de um pedido do dono (03/09/2026): os vídeos do canal
// são AGENDADOS no YouTube, e ele quis que a aula do app estreasse junto. Antes
// disso o app não tinha agendamento nenhum: tudo que entrava no arquivo
// aparecia no deploy seguinte.
//
// O RISCO que ela protege é específico e feio: aula publicada ANTES do vídeo
// mostra um card cujo player diz "vídeo indisponível". Isso é pior do que não
// ter o card, porque a pessoa clica, não vê nada, e aprende que o app promete
// conteúdo que não existe.
//
// O que ela protege:
//   1. data no futuro segura a aula
//   2. data de hoje já libera (estreia é no dia, não no dia seguinte)
//   3. aula sem data nenhuma continua publicada (é o conteúdo antigo)
//   4. data no futuro NÃO pode ser marcada como "Novo". A conta de novidade é
//      `agora - data`, que fica NEGATIVA no futuro, e negativo é menor que sete
//      dias: sem trava, a aula agendada seria a mais nova de todas e subiria
//      para o topo da Home antes de existir
//
// Rode com: npm run conferir:agenda
// As regras vêm do `content.ts` e as aulas do `aulas.ts`, e a separação é
// forçada pelo ambiente: `content.ts` importa sem extensão e o node puro não
// resolve isso. Copiar as DUAS funções aqui seria a saída fácil e a errada
// (regra duplicada é regra que diverge), então elas continuam sendo importadas
// de onde moram, e só o catálogo vem do arquivo que o node consegue abrir.
import { isNewLesson, lessonPublicada } from "../lib/app/regrasDeConteudo.ts";
import { aulas } from "../lib/app/conteudo/aulas.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

const HOJE = new Date("2026-09-10T12:00:00Z");

// ── a regra, nos quatro casos ───────────────────────────────────────────────
{
  conferir("data no futuro segura a aula", lessonPublicada({ addedAt: "2026-09-17" }, HOJE) === false);
  conferir("data de hoje já libera", lessonPublicada({ addedAt: "2026-09-10" }, HOJE) === true);
  conferir("data no passado segue publicada", lessonPublicada({ addedAt: "2026-08-01" }, HOJE) === true);
  conferir("aula sem data é conteúdo antigo, e fica publicada", lessonPublicada({}, HOJE) === true);
  conferir("data ilegível não some com a aula", lessonPublicada({ addedAt: "amanhã" }, HOJE) === true);
}

// ── a armadilha do selo "Novo" ──────────────────────────────────────────────
{
  conferir("aula agendada NÃO é marcada como nova", isNewLesson({ addedAt: "2026-09-17" }, HOJE) === false);
  conferir("aula de hoje é nova", isNewLesson({ addedAt: "2026-09-10" }, HOJE) === true);
  conferir("aula de dez dias atrás não é mais nova", isNewLesson({ addedAt: "2026-08-31" }, HOJE) === false);
}

// ── o caso real: os vídeos de setembro ──────────────────────────────────────
//
// As datas abaixo são as estreias no YouTube. Se alguém mexer nelas sem mexer
// no agendamento de lá, esta conferência avisa antes de o card quebrar.
{
  const { lessons } = aulas((pt: string) => pt);
  const esperado: Record<string, string> = {
    "vid-esquentar-parado": "2026-09-03",
    "vid-turbo-desligar-quente": "2026-09-03",
    "vid-padaria": "2026-09-10",
    "vid-agua-torneira-radiador": "2026-09-17",
  };
  for (const [id, data] of Object.entries(esperado)) {
    const a = lessons.find((l) => l.id === id);
    conferir(`a aula ${id} existe`, !!a);
    if (!a) continue;
    conferir(`${id} estreia em ${data}`, a.addedAt === data, `está ${a.addedAt}`);
    conferir(`${id} aponta para um vídeo`, a.media?.provider === "youtube" && !!a.media.src);
  }

  // Nenhuma aula agendada pode estar visível hoje.
  const hojeReal = new Date();
  const vazando = lessons.filter((l) => !lessonPublicada(l, hojeReal) && isNewLesson(l, hojeReal));
  conferir("nenhuma aula agendada aparece como novidade hoje", vazando.length === 0, vazando.map((l) => l.id).join(", "));
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) de agenda reprovaram.`);
  process.exit(1);
}
console.log("Agenda: aula com data no futuro não sai do forno antes do vídeo.");
