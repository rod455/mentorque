import type { Content } from "./content";

// As contas das trilhas guiadas.
//
// Vivia dentro de Learn.tsx, mas quem precisa disto são DUAS telas: a lista de
// trilhas e o leitor de aula (que mostra "aula 3 de 7" e o botão da próxima).
// Função compartilhada morando dentro de um dos consumidores é um convite a
// duplicar: a segunda tela copia o cálculo, e a partir daí os dois divergem
// sem ninguém perceber.
//
// Aqui não há JSX de propósito. É aritmética de lista, e aritmética se confere
// sem abrir navegador.

type Item = Content["lessons"][number];
type Course = Content["courses"][number];

/**
 * As aulas de uma trilha, na ordem, ignorando id que não existe.
 *
 * Tudo aqui parte desta função e nunca do `order` cru: o catálogo é remoto e
 * pode ganhar uma trilha nova antes de o app conhecer as aulas dela. Id
 * desconhecido some em silêncio em vez de quebrar a tela.
 */
export function courseItems(course: Course, lessons: Item[]): Item[] {
  const byId = new Map(lessons.map((l) => [l.id, l]));
  return course.order.map((id) => byId.get(id)).filter((x): x is Item => !!x);
}

/** Quantas a pessoa já viu, quantas são, e qual é a próxima. */
export function courseProgress(
  course: Course,
  lessons: Item[],
  seen: string[]
): { done: number; total: number; next: Item | null } {
  const items = courseItems(course, lessons);
  const vistas = new Set(seen);
  const done = items.filter((l) => vistas.has(l.id)).length;
  return { done, total: items.length, next: items.find((l) => !vistas.has(l.id)) ?? null };
}

/** A trilha a que uma aula pertence (a primeira, se houver mais de uma) e a posição dela. */
export function courseOf(
  lessonId: string,
  courses: Course[],
  lessons: Item[]
): { course: Course; index: number; items: Item[] } | null {
  for (const course of courses) {
    const items = courseItems(course, lessons);
    const index = items.findIndex((l) => l.id === lessonId);
    if (index >= 0) return { course, index, items };
  }
  return null;
}
