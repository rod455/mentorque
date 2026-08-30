// Os dois imports de VALOR levam `.ts` explícito de propósito: é o que permite
// `node --experimental-strip-types` rodar scripts/verifica-revisoes.ts sem
// empacotador. O import de tipo não precisa: ele é apagado antes de o Node ver.
import { REVISION_RULES } from "./health.ts";
import { diaLocal } from "./datas.ts";
import type { ServiceRecord, Vehicle } from "./types";

// QUANDO cada serviço do calendário cai, em data e em quilômetro.
//
// O bloco "Próximos serviços" do Histórico mostrava só o nome da regra e um
// botão "Já fiz esse serviço". Isso responde à pergunta errada: quem abre ali
// não quer marcar que fez, quer saber QUANDO precisa fazer. Sem data e sem km,
// o lembrete é um post-it sem nada escrito.
//
// As contas moram aqui, longe do JSX, porque são a parte que pode estar errada
// em silêncio. Uma data trocada não quebra tela nenhuma: ela só manda a pessoa
// à oficina no mês errado, e ninguém descobre.
//
// AS DUAS BASES SÃO INDEPENDENTES, e é isso que o manual quer dizer com "a
// cada 10.000 km OU 12 meses": vence o que chegar primeiro. Por isso um item
// pode ter data e km, só data, só km, ou nenhum dos dois (aí não há o que
// prever, e dizer qualquer coisa seria inventar).

export type PlanoDeItem = {
  key: string;
  /** Data prevista pelo TEMPO (yyyy-mm-dd), ou null se a regra não tem prazo. */
  dataPrevista: string | null;
  /** Meses de intervalo do manual, quando existe. */
  mesesIntervalo: number | null;
  /** De onde saiu a data base: o último serviço do tipo, ou a compra do carro. */
  ancora: "servico" | "compra" | null;
  /** Quantos km faltam (negativo = passou). Null quando não dá para calcular. */
  kmRestantes: number | null;
  /** Km de intervalo do manual, quando existe. */
  kmIntervalo: number | null;
  /** Odômetro em que o serviço vence. */
  kmPrevisto: number | null;
  /**
   * O km previsto é ESTIMADO porque não existe registro do último serviço
   * deste tipo. Nesse caso a conta não é "última troca + intervalo" (não
   * sabemos a última), é o próximo múltiplo do intervalo acima do odômetro
   * atual. A interface precisa dizer isso: um número inventado sem aviso é
   * pior que número nenhum.
   */
  kmEstimado: boolean;
  /** Já venceu, por qualquer uma das duas bases. */
  vencido: boolean;
};

/** Soma meses a uma data ISO, sem escorregar de mês (31/01 + 1 mês = 28/02). */
export function somarMeses(iso: string, meses: number): string | null {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return null;
  const dia = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + meses);
  // Último dia do mês de destino: 0 do mês seguinte.
  const ultimo = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(dia, ultimo));
  return diaLocal(d);
}

function ultimoDoTipo(servicos: ServiceRecord[], tipo: string): ServiceRecord | null {
  const lista = servicos.filter((s) => s.type === tipo);
  if (!lista.length) return null;
  return lista.slice().sort((a, b) => (b.km || 0) - (a.km || 0) || b.date.localeCompare(a.date))[0];
}

/**
 * O plano de UM item do calendário, ou null se a regra não existe.
 *
 * Devolve null também quando não há absolutamente nada com que prever (sem
 * odômetro, sem serviço do tipo e sem data de compra): melhor a interface
 * dizer "informe o km" do que exibir uma previsão fabricada.
 */
export function planoDoItem(
  v: Vehicle,
  servicos: ServiceRecord[],
  key: string,
  agora = new Date(),
): PlanoDeItem | null {
  const regra = REVISION_RULES.find((r) => r.key === key);
  if (!regra) return null;

  const ultimo = ultimoDoTipo(servicos, key);
  const hoje = diaLocal(agora);

  // Pelo tempo.
  let dataPrevista: string | null = null;
  let ancora: PlanoDeItem["ancora"] = null;
  if (regra.everyMonths) {
    const base = ultimo?.date ?? v.purchaseDate ?? null;
    if (base) {
      dataPrevista = somarMeses(base, regra.everyMonths);
      ancora = ultimo?.date ? "servico" : "compra";
    }
  }

  // Pelo km.
  const km = typeof v.odometerKm === "number" && v.odometerKm > 0 ? v.odometerKm : null;
  let kmPrevisto: number | null = null;
  let kmRestantes: number | null = null;
  let kmEstimado = false;
  if (regra.everyKm && km != null) {
    if (ultimo?.km) {
      kmPrevisto = ultimo.km + regra.everyKm;
    } else {
      // Sem registro da última: o próximo múltiplo do intervalo acima do
      // odômetro. Um carro usado com 98.000 km e sem histórico daria
      // "vencida há 88.000 km" pela conta ingênua de zero + intervalo, e
      // isso é ruído, não informação.
      kmPrevisto = Math.ceil((km + 1) / regra.everyKm) * regra.everyKm;
      kmEstimado = true;
    }
    kmRestantes = kmPrevisto - km;
  }

  if (dataPrevista == null && kmRestantes == null) return null;

  const vencido =
    (dataPrevista != null && dataPrevista < hoje) || (kmRestantes != null && kmRestantes <= 0);

  return {
    key,
    dataPrevista,
    mesesIntervalo: regra.everyMonths ?? null,
    ancora,
    kmRestantes,
    kmIntervalo: regra.everyKm ?? null,
    kmPrevisto,
    kmEstimado,
    vencido,
  };
}

/** O plano de vários itens de uma vez, na ordem em que foram pedidos. */
export function planoDosItens(
  v: Vehicle,
  servicos: ServiceRecord[],
  keys: string[],
  agora = new Date(),
): PlanoDeItem[] {
  return keys
    .map((k) => planoDoItem(v, servicos, k, agora))
    .filter((p): p is PlanoDeItem => p !== null);
}

/**
 * Uma ida só à oficina em vez de três.
 *
 * A ideia é do dono e é boa por um motivo prático: o custo de levar o carro
 * não é o serviço, é o dia sem carro. Se três itens caem no mesmo trimestre,
 * juntar tudo numa visita economiza duas.
 *
 * A DATA SUGERIDA É SEMPRE A MAIS CEDO DO GRUPO, nunca uma média nem a mais
 * tarde. Adiantar um serviço custa dinheiro; atrasar custa motor. Entre os
 * dois erros possíveis, a sugestão só pode errar para o lado barato.
 *
 * Só entram itens com data prevista. Item que só tem km não tem dia no
 * calendário, e chutar um dia para ele exigiria supor quantos km a pessoa
 * roda por mês, que é justamente o número que a gente não tem.
 */
export type VisitaUnica = { dia: string; keys: string[] };

export function visitaUnica(planos: PlanoDeItem[], janelaDias = 90): VisitaUnica | null {
  const comData = planos
    .filter((p): p is PlanoDeItem & { dataPrevista: string } => p.dataPrevista != null)
    .sort((a, b) => a.dataPrevista.localeCompare(b.dataPrevista));
  if (comData.length < 2) return null;

  const primeiro = comData[0].dataPrevista;
  const limite = new Date(primeiro + "T00:00:00");
  limite.setDate(limite.getDate() + janelaDias);
  const teto = diaLocal(limite);

  const juntos = comData.filter((p) => p.dataPrevista <= teto);
  if (juntos.length < 2) return null;

  return { dia: primeiro, keys: juntos.map((p) => p.key) };
}
