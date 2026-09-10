"use client";

import { AVISO, agendar, cancelar, notificacoesDisponiveis, permissaoConcedida } from "./notificacoes";
import { proximaAulaDaTrilha, quandoAvisarTrilha } from "./ritmoDaTrilha";
import type { Content } from "./content";

// O aviso da trilha em ritmo: uma aula por dia, às 9h, a próxima que a pessoa
// ainda não viu. A regra está em ritmoDaTrilha.ts.
//
// UM AVISO POR VEZ, reagendado a cada abertura e a cada aula vista, como o
// do quiz: quem viu a aula de hoje às 8h não recebe às 9h um aviso da aula
// que acabou de ver, e sim da seguinte, amanhã. Terminou a trilha, cancela.
// O toque abre a trilha (rota "trilha", ver rotaPendente.ts).
export async function sincronizarLembreteTrilha(o: {
  quer: boolean;
  inscricao: { courseId: string } | null | undefined;
  courses: Content["courses"];
  lessons: Content["lessons"];
  seen: readonly string[];
  textos: { titulo: string; corpo: string };
}): Promise<void> {
  if (!notificacoesDisponiveis()) return;
  const course = o.inscricao ? o.courses.find((c) => c.id === o.inscricao?.courseId) : null;
  if (!o.quer || !course) {
    await cancelar(AVISO.trilha);
    return;
  }
  if (!(await permissaoConcedida())) return;
  const proxima = proximaAulaDaTrilha(course, o.lessons, o.seen);
  if (!proxima) {
    await cancelar(AVISO.trilha);
    return;
  }
  await agendar({
    id: AVISO.trilha,
    titulo: o.textos.titulo.replace("{n}", String(proxima.n)).replace("{total}", String(proxima.total)).replace("{aula}", proxima.aula.title),
    corpo: o.textos.corpo.replace("{trilha}", course.title),
    quando: quandoAvisarTrilha(),
    rota: "trilha",
  });
}
