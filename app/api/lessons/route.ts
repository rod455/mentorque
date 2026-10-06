import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getContent, lessonPublicada, type Content } from "@/lib/app/content";
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
    // AULA AGENDADA NÃO ENTRA NO PAYLOAD, e o corte é aqui de propósito.
    //
    // O servidor é quem sabe a data de verdade. Cortar só no aparelho teria
    // dois furos: relógio adiantado veria conteúdo antes da hora, e o texto da
    // aula viajaria pela rede antes de existir, disponível para quem abrisse a
    // resposta. Aula que ainda não saiu simplesmente não é enviada.
    //
    // Isso é o que permite escrever hoje a aula do vídeo que estreia dia 10 e
    // deixá-la no repositório sem ela vazar no app.
    if (!lessonPublicada(a)) continue;
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

// As aulas mais vistas por todo mundo nos últimos 30 dias (06/10/2026).
//
// Pedido do dono para o "Descubra mais" do Início: um item que "tem mais
// acesso por todos". O instrumento é o funil (`viu_aula`, uma vez por
// aparelho por aula), não a opinião de ninguém. Conta aparelhos distintos
// por aula, devolve os cinco mais vistos. Sem banco, ou com a tabela vazia,
// devolve vazio e o Início segue sem a linha: ausência não vira zero
// inventado nem aula escolhida à mão.
async function montarPopulares(): Promise<string[]> {
  const admin = getSupabaseAdmin();
  if (!admin) return [];
  const desde = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data, error } = await admin
    .from("funil_eventos")
    .select("origem, anon_id")
    .eq("evento", "viu_aula")
    .gte("criado_em", desde)
    .limit(5000);
  if (error || !data) return [];
  const porAula = new Map<string, Set<string>>();
  for (const r of data as { origem: string | null; anon_id: string | null }[]) {
    if (!r.origem) continue;
    if (!porAula.has(r.origem)) porAula.set(r.origem, new Set());
    porAula.get(r.origem)!.add(r.anon_id ?? "");
  }
  return [...porAula.entries()]
    .sort((a, b) => b[1].size - a[1].size)
    .slice(0, 5)
    .map(([id]) => id);
}

export async function GET() {
  const lessons = montar();
  const courses = montarCursos();
  const populares = await montarPopulares();
  // A versão é o resumo do próprio conteúdo: muda quando (e só quando) alguma
  // aula, trilha ou a lista de populares muda. O app compara com o guardado e
  // evita reescrever à toa.
  const version = createHash("sha1").update(JSON.stringify({ lessons, courses, populares })).digest("hex").slice(0, 12);

  return NextResponse.json(
    { version, count: lessons.length, lessons, courses, populares },
    {
      headers: {
        // Cache curto na borda: publicar uma aula chega ao aparelho em minutos,
        // sem transformar cada abertura do app numa consulta ao servidor.
        "cache-control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
    }
  );
}
