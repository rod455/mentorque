// A jornada de quem BAIXOU o app e não criou conta: qual push cabe hoje.
//
// APROVADA PELO DONO EM 15/09/2026: "vamos mandar push para quem baixou o app
// e não só quem criou conta. Precisamos de uma jornada para fazer essas
// pessoas abrirem a conta."
//
// O NÚMERO QUE MOTIVOU: no Android há 26 aparelhos em 5 dias e nenhum evento
// com conta. Treze terminaram o onboarding, onze abriram o cadastro de carro,
// dois cadastraram, e zero criaram conta. A jornada por e-mail não alcança
// nenhuma dessas pessoas, porque ela precisa de um endereço.
//
// O QUE ESTE MÓDULO SABE, E É POUCO DE PROPÓSITO. Do lado do servidor, um
// aparelho sem conta é só uma lista de eventos do funil. Não há carro, não há
// serviço, não há quilometragem: o estado de quem não tem conta mora no
// aparelho e em nenhum outro lugar. Por isso nenhum texto daqui cita o carro
// pelo nome nem promete número: seria inventar. O que ele sabe é o que a
// pessoa FEZ e o que ela NÃO fez, e é disso que a jornada é feita.
//
// A PROMESSA É A VERDADEIRA, e é a mesma que o convite dentro do app já faz
// ("Seu carro está guardado só neste aparelho"): sem conta, o que ela
// registrou se perde na troca de celular. Não é argumento de venda, é o que
// acontece.
//
// E ELA PEDE UMA VEZ E PARA. Cada chave sai no máximo uma vez na vida do
// aparelho; esgotadas as seis, silêncio para sempre. Jornada de conversão que
// repete vira cobrança, e quem não quer conta já disse que não quer.
//
// Puro de propósito, como lib/jornada/decisao.ts: recebe o retrato de um
// aparelho e a data, devolve uma escolha. `npm run conferir:push` exercita
// caso a caso.

export type EnvioAoAparelho = { chave: string; dia: string };

export type AparelhoDaJornada = {
  anonId: string;
  plataforma: "android" | "ios";
  /**
   * Último dia de cada evento do funil deste aparelho, yyyy-mm-dd.
   *
   * A presença da chave é o que importa na maioria das regras; o dia serve
   * para não falar de uma coisa que a pessoa acabou de fazer.
   */
  eventos: Record<string, string>;
  /** O que este aparelho já recebeu (chave e dia). */
  envios: EnvioAoAparelho[];
};

export type EscolhaDoAparelho = { chave: string; motivo: string };

// ---- as réguas, num lugar só ------------------------------------------------

/** Mínimo de dias entre dois push para o mesmo aparelho. */
export const ESPACO_MINIMO_DIAS = 4;
/** Teto na janela móvel, contando tudo. Mais apertado que o do e-mail: push acorda a pessoa. */
export const TETO_POR_JANELA = 3;
export const JANELA_DO_TETO = 30;
/** Não falar de uma coisa que a pessoa fez agora: deixe esfriar. */
export const ESFRIAR_DIAS = 2;
/** Sumiu: os dois marcos, cada um uma vez. */
export const VOLTAR_1 = 10;
export const VOLTAR_2 = 25;

/** Eventos que significam "esta pessoa já tem dado de verdade aqui dentro". */
export const EVENTOS_DE_DADO = [
  "registrou_servico",
  "registrou_abastecimento",
  "analisou_orcamento",
  "lancou_ganho",
] as const;

/** O evento que prova que a conta existe. Quem o emitiu sai da jornada. */
export const EVENTO_DE_CONTA = "cadastro";

// ---- ajudantes --------------------------------------------------------------

/** Dias inteiros entre duas datas yyyy-mm-dd (positivo quando `b` é depois). */
function dias(a: string, b: string): number {
  const ms = Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`);
  return Math.round(ms / 86400000);
}

function jaRecebeu(ap: AparelhoDaJornada, chave: string): boolean {
  return ap.envios.some((e) => e.chave === chave);
}

/** O dia mais recente em que este aparelho fez qualquer coisa. */
export function ultimaAtividade(ap: AparelhoDaJornada): string | null {
  let ultimo: string | null = null;
  for (const dia of Object.values(ap.eventos)) if (!ultimo || dia > ultimo) ultimo = dia;
  return ultimo;
}

/** O evento existe e já esfriou? */
function esfriou(ap: AparelhoDaJornada, evento: string, hoje: string): boolean {
  const dia = ap.eventos[evento];
  return !!dia && dias(dia, hoje) >= ESFRIAR_DIAS;
}

// ---- a decisão --------------------------------------------------------------

/**
 * Qual push cabe hoje para este aparelho, ou nenhum.
 *
 * A ordem das chaves é a ordem do que a pessoa tem a perder, do maior para o
 * menor: quem registrou gasto perde mais que quem só cadastrou o carro, e quem
 * cadastrou o carro perde mais que quem parou no meio do onboarding.
 */
export function escolherPush(ap: AparelhoDaJornada, hoje: string): EscolhaDoAparelho | null {
  // Tem conta: esta jornada inteira pede para criar a conta que ela já tem.
  // O cron já filtra por `user_id is null` no token; isto é a segunda tranca,
  // porque o token pode estar anônimo enquanto o app ainda não reentregou.
  if (ap.eventos[EVENTO_DE_CONTA]) return null;

  const ultima = ultimaAtividade(ap);
  // Mexeu no app hoje não recebe hoje: push para quem está com o app aberto é
  // ruído, e ruído ensina a desligar os avisos.
  if (ultima === hoje) return null;

  let ultimoEnvio: string | null = null;
  let naJanela = 0;
  for (const e of ap.envios) {
    if (!ultimoEnvio || e.dia > ultimoEnvio) ultimoEnvio = e.dia;
    const desde = dias(e.dia, hoje);
    if (desde >= 0 && desde < JANELA_DO_TETO) naJanela++;
  }
  if (ultimoEnvio && dias(ultimoEnvio, hoje) < ESPACO_MINIMO_DIAS) return null;
  if (naJanela >= TETO_POR_JANELA) return null;

  // 1. Já tem dado de verdade aqui dentro, e ele mora só neste aparelho.
  const comDado = EVENTOS_DE_DADO.find((ev) => esfriou(ap, ev, hoje));
  if (comDado && !jaRecebeu(ap, "guardar:dados")) {
    return { chave: "guardar:dados", motivo: `tem ${comDado} e nenhuma conta` };
  }

  // 2. Cadastrou o carro, que é o trabalho que ela teve e que se perde.
  if (esfriou(ap, "cadastrou_carro", hoje) && !jaRecebeu(ap, "guardar:carro")) {
    return { chave: "guardar:carro", motivo: "cadastrou o carro e não criou conta" };
  }

  // 3. Abriu o cadastro do carro e não terminou.
  if (!ap.eventos.cadastrou_carro && esfriou(ap, "abriu_cadastro_de_carro", hoje) && !jaRecebeu(ap, "falta:carro")) {
    return { chave: "falta:carro", motivo: "abriu o cadastro do carro e não cadastrou" };
  }

  // 4. Começou o onboarding e não terminou.
  if (!ap.eventos.terminou_onboarding && esfriou(ap, "comecou_onboarding", hoje) && !jaRecebeu(ap, "falta:onboarding")) {
    return { chave: "falta:onboarding", motivo: "começou o onboarding e não terminou" };
  }

  // 5. Sumiu. Dois marcos, e o segundo é o último de todos: ele oferece a
  //    saída em vez de insistir.
  if (ultima) {
    const sumido = dias(ultima, hoje);
    if (sumido >= VOLTAR_2 && !jaRecebeu(ap, "voltar:25")) {
      return { chave: "voltar:25", motivo: `sem abrir há ${sumido} dias` };
    }
    if (sumido >= VOLTAR_1 && sumido < VOLTAR_2 && !jaRecebeu(ap, "voltar:10")) {
      return { chave: "voltar:10", motivo: `sem abrir há ${sumido} dias` };
    }
  }

  return null;
}

// ---- os textos --------------------------------------------------------------

export type TextoDoPush = { titulo: string; corpo: string };

/**
 * O texto de cada chave.
 *
 * REGRAS QUE VALEM AQUI, e a conferência cobra cada uma:
 *
 *   - Sem travessão, como todo texto que o usuário lê.
 *   - Sem preço, sem plano, sem Premium. Esta jornada pede uma CONTA, que é
 *     de graça; misturar venda nela é quebrar a promessa no mesmo toque.
 *   - Sem citar carro, número ou data. O servidor não sabe nada disso de quem
 *     não tem conta, e prometer o que não se sabe é o jeito mais rápido de a
 *     pessoa desinstalar.
 *   - Título até 70 e corpo até 160, a mesma régua do push da jornada.
 *
 * O texto do "guardar:carro" é de propósito quase igual ao do convite que já
 * existe dentro do app ("Seu carro está guardado só neste aparelho. Criando
 * sua conta, ele fica salvo e volta no celular novo"): a pessoa tem que
 * reconhecer a mesma voz, não achar que são dois apps.
 */
export const TEXTOS: Record<string, TextoDoPush> = {
  "guardar:dados": {
    titulo: "O que você registrou está só neste aparelho",
    corpo: "Criando sua conta, o histórico do carro fica salvo e volta no celular novo, no tablet ou no navegador.",
  },
  "guardar:carro": {
    titulo: "Seu carro está guardado só neste aparelho",
    corpo: "Criando sua conta, ele fica salvo e volta no celular novo, no tablet ou no navegador.",
  },
  "falta:carro": {
    titulo: "Faltou cadastrar o seu carro",
    corpo: "Com marca, modelo e ano o app já monta o calendário de revisão. Leva menos de um minuto.",
  },
  "falta:onboarding": {
    titulo: "Você parou no meio do caminho",
    corpo: "Faltam poucos toques para o app saber de que carro cuidar.",
  },
  "voltar:10": {
    titulo: "Barulho, luz acesa, carro que não pega",
    corpo: "O app explica o que pode ser e o que perguntar na oficina, em português de gente.",
  },
  "voltar:25": {
    titulo: "Faz um tempo que você não abre o Mentorque",
    corpo: "Se não estiver sendo útil para você, é só desligar os avisos no Perfil. Sem ressentimento.",
  },
};

/** Todas as chaves que esta jornada pode mandar, na ordem em que saem. */
export const CHAVES = [
  "guardar:dados",
  "guardar:carro",
  "falta:carro",
  "falta:onboarding",
  "voltar:10",
  "voltar:25",
] as const;
