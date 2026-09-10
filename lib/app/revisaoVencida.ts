// A regra do aviso de revisão vencida, sem nada de aparelho.
//
// POR QUE (10/09/2026). O app já sabia que uma revisão tinha vencido: a
// situação "overdue" (lib/app/traits.ts) existe desde agosto e só servia
// para pôr uma aula na frente da outra. A dor mais específica que o app
// reconhece não mandava nada. Agora manda UM aviso por item vencido, e o
// mesmo item não volta a avisar antes de 30 dias: quem abre o app todo dia e
// escolhe não fazer já respondeu, e cobrar de novo é como avisos viram
// avisos desligados.
//
// Pura de propósito (é o que `npm run conferir:aviso` abre no node). Quem
// fala com o plugin é lembreteRevisaoVencida.ts.
const HORA = 9;
const DIAS_ENTRE_AVISOS_DO_MESMO_ITEM = 30;

/** Dia local yyyy-mm-dd, sem importar datas.ts (que é puro, mas é um import a menos). */
function dia(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function diasEntre(a: string, b: string): number {
  return Math.round((new Date(b + "T00:00:00").getTime() - new Date(a + "T00:00:00").getTime()) / 86_400_000);
}

/**
 * QUAL item vencido avisar e QUANDO, ou null se não cabe.
 *
 * `vencidos` na ordem em que a saúde os lista (a mais importante primeiro);
 * `avisados` diz em que dia cada chave foi avisada pela última vez. O aviso
 * sai às 9h de amanhã, nunca hoje: agendar para daqui a dez minutos, com a
 * pessoa dentro do app, é a definição de ruído.
 */
export function proximoAvisoDeVencida(o: {
  vencidos: readonly string[];
  avisados: Readonly<Record<string, string>>;
  agora?: Date;
}): { chave: string; quando: Date } | null {
  const agora = o.agora ?? new Date();
  const hoje = dia(agora);
  const chave = o.vencidos.find((k) => {
    const ultimo = o.avisados[k];
    return !ultimo || diasEntre(ultimo, hoje) >= DIAS_ENTRE_AVISOS_DO_MESMO_ITEM;
  });
  if (!chave) return null;
  const quando = new Date(agora);
  quando.setDate(quando.getDate() + 1);
  quando.setHours(HORA, 0, 0, 0);
  return { chave, quando };
}
