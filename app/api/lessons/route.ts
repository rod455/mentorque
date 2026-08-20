import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getContent, type Content } from "@/lib/app/content";
import type { AulaRemota, Bilingue, CursoRemoto } from "@/lib/app/remoteLessons";

// Catálogo de aulas servido pela rede, para publicar conteúdo sem gerar build.
//
// O app das lojas nasce com o catálogo embutido no binário — é ele que garante
// primeira abertura instantânea, funcionamento sem rede e uma tela cheia na
// revisão da Apple, que testa em conexão ruim de propósito. Esta rota entrega a
// versão mais recente; quando ela é mais nova, o app passa a usá-la e guarda
// para a próxima abertura.
//
// Só DADOS trafegam aqui. A diretriz 3.3.1 da Apple restringe baixar código
// executável; texto e metadados de conteúdo são livres, e é assim que qualquer
// app de notícia ou de curso funciona.
//
// O payload é bilíngue: `getContent` resolve o idioma na hora de montar, então
// chamamos as duas versões e casamos por id. Assim um único arquivo serve PT e
// EN, e não existe a chance de as duas listas divergirem.

export const revalidate = 300;

type Aula = Content["lessons"][number];

// Espalhar a aula inteira e só DEPOIS trocar os campos de texto é deliberado.
//
// A primeira versão enumerava campo por campo — e esqueceu `need`, `steps` e
// `safety`, que são obrigatórios no tipo. Chegavam `undefined` no aparelho e
// toda aula derrubava o app ao abrir. Com o espalhamento, campo novo entra
// sozinho no payload e o erro não tem como se repetir.
function bilingue(pt: string[] | undefined, en: string[] | undefined): Bilingue[] | undefined {
  if (!pt) return undefined;
  // Diferença de tamanho entre os idiomas não pode derrubar a aula: o que
  // faltar em inglês cai para o português, que é sempre a versão de origem.
  return pt.map((texto, i) => ({ pt: texto, en: en?.[i] ?? texto }));
}

function montar(): AulaRemota[] {
  const pt = getContent("pt").lessons;
  const en = getContent("en").lessons;
  const porId = new Map(en.map((l) => [l.id, l]));

  const saida: AulaRemota[] = [];
  for (const a of pt) {
    const b: Aula | undefined = porId.get(a.id);
    if (!b) continue;
    saida.push({
      ...a,
      title: { pt: a.title, en: b.title },
      body: bilingue(a.body, b.body),
      need: bilingue(a.need, b.need) ?? [],
      steps: bilingue(a.steps, b.steps) ?? [],
      safety: bilingue(a.safety, b.safety) ?? [],
      stepsByLevel: a.stepsByLevel
        ? {
            iniciante: bilingue(a.stepsByLevel.iniciante, b.stepsByLevel?.iniciante) ?? [],
            avancado: bilingue(a.stepsByLevel.avancado, b.stepsByLevel?.avancado) ?? [],
            mecanico: bilingue(a.stepsByLevel.mecanico, b.stepsByLevel?.mecanico) ?? [],
          }
        : undefined,
    });
  }
  return saida;
}

// Trilhas guiadas, no mesmo esquema bilíngue: título e objetivo por idioma,
// resto (order, traits…) espalhado como está.
function montarCursos(): CursoRemoto[] {
  const pt = getContent("pt").courses;
  const en = new Map(getContent("en").courses.map((t) => [t.id, t]));
  return pt.map((t) => {
    const b = en.get(t.id);
    return { ...t, title: { pt: t.title, en: b?.title ?? t.title }, goal: { pt: t.goal, en: b?.goal ?? t.goal } };
  });
}

export function GET() {
  const lessons = montar();
  const courses = montarCursos();
  // A versão é o resumo do próprio conteúdo: muda quando (e só quando) alguma
  // aula ou trilha muda. O app compara com o guardado e evita reescrever à toa.
  const version = createHash("sha1").update(JSON.stringify({ lessons, courses })).digest("hex").slice(0, 12);

  return NextResponse.json(
    { version, count: lessons.length, lessons, courses },
    {
      headers: {
        // Cache curto na borda: publicar uma aula chega ao aparelho em minutos,
        // sem transformar cada abertura do app numa consulta ao servidor.
        "cache-control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
    }
  );
}
