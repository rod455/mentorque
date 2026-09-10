// A regra da trilha em ritmo: qual aula avisar e quando, sem nada de aparelho.
//
// POR QUE (10/09/2026). As trilhas existem e ninguém as termina em ritmo
// nenhum: elas são uma lista. O que faz alguém voltar todo dia é ter um
// horário e um próximo passo pequeno, que é exatamente o que o quiz tem e as
// trilhas não tinham. A pessoa escolhe UMA trilha, e às 9h recebe "aula 3 de
// 7", com a próxima que ela ainda não viu. Terminou a trilha, acaba o aviso.
//
// Pura de propósito (é o que `npm run conferir:aviso` abre no node). Quem
// fala com o plugin é lembreteTrilha.ts.
import { courseProgress } from "./cursos.ts";
import type { Content } from "./content";

const HORA = 9;

type Course = Content["courses"][number];
type Item = Content["lessons"][number];

/** A próxima aula não vista da trilha, com a posição dela, ou null se acabou. */
export function proximaAulaDaTrilha(
  course: Course,
  lessons: Item[],
  seen: readonly string[],
): { aula: Item; n: number; total: number } | null {
  const { done, total, next } = courseProgress(course, lessons, [...seen]);
  if (!next) return null;
  return { aula: next, n: done + 1, total };
}

/** As próximas 9h: hoje, se ainda não passou; senão amanhã. */
export function quandoAvisarTrilha(agora = new Date()): Date {
  const alvo = new Date(agora);
  alvo.setHours(HORA, 0, 0, 0);
  if (alvo.getTime() <= agora.getTime()) alvo.setDate(alvo.getDate() + 1);
  return alvo;
}
