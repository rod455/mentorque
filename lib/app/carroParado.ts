import type { EstadoQuiz } from "./quiz/sequencia";
import type { ServiceRecord, Vehicle } from "./types";

// A regra do aviso de "cadastrou o carro e sumiu", sem nada de aparelho.
//
// Separada de lembreteCarroParado.ts (que fala com o plugin) para o node
// conseguir abrir este arquivo na conferência: é código sem import de
// runtime, como o de rotaPendente.ts e espelhoDoAviso.ts. O porquê do aviso
// está no outro arquivo.
const HORA = 9;
const DIAS_DEPOIS = 2;

/**
 * QUANDO avisar, ou null se não cabe.
 *
 * Carro sem `createdAt` é de antes desta versão: não recebe o aviso, porque
 * não se sabe quando foi cadastrado e um "cadastrou e sumiu" para quem usa o
 * app há um mês seria mentira. Fez algo com o carro (serviço registrado, quiz
 * respondido alguma vez): não recebe. Passou a hora e não voltou: silêncio,
 * nada de "amanhã então".
 */
export function quandoAvisarCarroParado(o: {
  veiculo: Pick<Vehicle, "createdAt"> | null;
  servicosDoCarro: readonly ServiceRecord[];
  quiz: EstadoQuiz | undefined;
  agora?: Date;
}): Date | null {
  const agora = o.agora ?? new Date();
  if (!o.veiculo?.createdAt) return null;
  if (o.servicosDoCarro.length > 0) return null;
  if ((o.quiz?.respostas ?? 0) > 0) return null;
  const nasceu = new Date(o.veiculo.createdAt);
  if (Number.isNaN(nasceu.getTime())) return null;
  const alvo = new Date(nasceu);
  alvo.setDate(alvo.getDate() + DIAS_DEPOIS);
  alvo.setHours(HORA, 0, 0, 0);
  if (alvo.getTime() <= agora.getTime()) return null;
  return alvo;
}
