// Os e-mails da jornada: o texto de cada um, personalizado pelo carro, e o
// molde em HTML que vale para todos.
//
// TEXTOS APROVADOS EM LISTA pelo dono em 12/09/2026 (assuntos e a dor de cada
// e-mail, em docs/agentes/propostas/jornada-de-recorrencia.md). O corpo
// completo é rascunho dele para revisar: mensagem a cliente é alçada do dono,
// e é por isso que ele recebe uma cópia de cada e-mail na primeira vez que ele
// sai, e o resumo de cada manhã; JORNADA_PAUSADA=sim na Vercel é o freio.
//
// Regras que valem para todos e são conferidas por `conferir:jornada`:
//   - português natural, sem travessão;
//   - nenhum preço de plano, nenhuma oferta (isso é do dono, sempre);
//   - UMA dor e UMA ação por e-mail: um botão só;
//   - todo link leva a etiqueta (utm_source=email, utm_campaign=jornada,
//     utm_content=chave), que o funil da web já lê;
//   - todo e-mail tem o link de sair em um clique.
//
// O mesmo texto vira push (título e corpo curtos) onde há token: o motor
// manda os dois canais com a mesma mensagem, para quem tem os dois não
// haver contradição.
//
// Pura: só importa regras do app (pricing, faixa, plano, saúde, traits) e
// nada de Next, Supabase ou Resend.

import type { ServiceRecord, Vehicle } from "../app/types";
import { diasEntre } from "../app/datas.ts";
import { computeUpcoming, REVISION_RULES } from "../app/health.ts";
import { planoDosItens } from "../app/planoDeRevisao.ts";
import { faixaDaRegiao, posicaoNaFaixa } from "../app/faixaDePreco.ts";
import { vehicleTraits } from "../app/traits.ts";
import { nomeDoCarro, type Escolha, type PessoaDaJornada } from "./decisao.ts";
import type { DestinoDoLink } from "../app/destinoDoLink.ts";

// Endereço FIXO, como nos outros e-mails: imagem quebrada não tem conserto
// depois de enviada.
export const SITE = "https://www.mentorque.com.br";
const APP_STORE = "https://apps.apple.com/br/app/mentorque/id6797291865";
const PLAY_STORE = "https://play.google.com/store/apps/details?id=mentorque.app";

const CREME = "#f4f2ec";
const GRAFITE = "#16181D";
const AMBAR = "#F2A623";
const TEXTO = "#2b2f36";
const SUAVE = "#6b7078";

export type RotaDoToque = "quiz" | "trilha";

export type Mensagem = {
  assunto: string;
  preheader: string;
  titulo: string;
  saudacao: string;
  /** Parágrafos do corpo. HTML mínimo permitido (<b>). */
  paragrafos: string[];
  /** Bloco destacado, quando há lista. */
  destaque?: { titulo: string; itens: string[] };
  cta: { texto: string; url: string };
  nota?: string;
  push: { titulo: string; corpo: string; rota?: RotaDoToque };
};

/** Nomes dos itens do calendário, em português, como o app mostra. */
export const NOME_DO_ITEM: Record<string, string> = {
  oil: "Troca de óleo",
  airfilter: "Filtro de ar",
  brakes: "Freios",
  brakefluid: "Fluido de freio",
  timing: "Correia ou corrente",
  tires: "Pneus",
  battery: "Bateria",
  revision: "Revisão",
  suspension: "Suspensão",
};

/** O que atrasar cada item costuma custar, para o e-mail dizer o porquê. */
const CUSTO_DO_ATRASO: Record<string, string> = {
  oil: "óleo velho desgasta o motor por dentro, e motor é a peça mais cara do carro",
  airfilter: "filtro sujo aumenta o consumo e tira força",
  brakes: "pastilha no fim come o disco, e o conserto dobra de preço",
  brakefluid: "fluido velho absorve água e o pedal afunda quando você mais precisa",
  timing: "correia rompida costuma levar o motor junto",
  tires: "pneu no limite é aquaplanagem na primeira chuva",
  battery: "bateria no fim escolhe o pior dia para falhar",
};

/**
 * Link para o app com a etiqueta da jornada e, quando há, a TELA em que o
 * botão cai (`ir=`, lido por app/app/page.tsx e lib/app/destinoDoLink.ts).
 * Pedido do dono em 12/09/2026: o botão leva para dentro do app, na tela do
 * que o e-mail pediu, e não para a tela inicial.
 */
export function linkDoApp(chave: string, ir?: DestinoDoLink): string {
  const conteudo = chave.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  const u = new URL(`${SITE}/app`);
  if (ir) u.searchParams.set("ir", ir);
  u.searchParams.set("utm_source", "email");
  u.searchParams.set("utm_medium", "jornada");
  u.searchParams.set("utm_campaign", "jornada");
  u.searchParams.set("utm_content", conteudo);
  return u.toString();
}

const dataBr = (iso: string) => {
  const [a, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
};
const kmBr = (n: number) => `${Math.round(n).toLocaleString("pt-BR")} km`;
const reais = (n: number) => `R$ ${Math.round(n).toLocaleString("pt-BR")}`;
const primeiroNome = (nome: string | null) => (nome?.trim().split(/\s+/)[0] ?? "");

function saudacao(p: PessoaDaJornada): string {
  const n = primeiroNome(p.nome);
  return n ? `Oi, ${n}!` : "Oi!";
}

function servicosDoCarro(p: PessoaDaJornada, carro: Vehicle): ServiceRecord[] {
  return p.servicos.filter((s) => s.vehicleId === carro.id);
}

/** "Troca de óleo: até 15/11/2026, ou aos 45.000 km". Só o que tem previsão. */
function itensDoCalendario(p: PessoaDaJornada, carro: Vehicle, agora: Date, hoje: string, dias = 90, km = 3000): string[] {
  const chaves = REVISION_RULES.map((r) => r.key);
  const linhas: string[] = [];
  for (const plano of planoDosItens(carro, servicosDoCarro(p, carro), chaves, agora)) {
    const porData = plano.dataPrevista !== null && diasEntre(hoje, plano.dataPrevista) <= dias;
    const porKm = plano.kmRestantes !== null && !plano.kmEstimado && plano.kmRestantes <= km;
    if (!porData && !porKm && !plano.vencido) continue;
    const partes: string[] = [];
    if (plano.vencido) partes.push("já venceu");
    else {
      if (porData && plano.dataPrevista) partes.push(`até ${dataBr(plano.dataPrevista)}`);
      if (porKm && plano.kmPrevisto !== null) partes.push(`aos ${kmBr(plano.kmPrevisto)}`);
    }
    linhas.push(`${NOME_DO_ITEM[plano.key] ?? plano.key}: ${partes.join(", ou ")}`);
  }
  return linhas;
}

// ---- cada e-mail ---------------------------------------------------------------

export function montarMensagem(e: Escolha, p: PessoaDaJornada, hoje: string, agora = new Date(`${hoje}T12:00:00`)): Mensagem {
  const carro = e.carro;
  const nome = carro ? nomeDoCarro(carro) : null;
  const oi = saudacao(p);
  const link = (ir: DestinoDoLink) => linkDoApp(e.chave, ir);
  const regiao = faixaDaRegiao("oil", p.uf, p.cidade);
  const [familia, item] = e.chave.split(":");

  // ---- cadência ----
  if (e.chave === "d0") {
    if (!carro) {
      return {
        assunto: "Sua conta no Mentorque está pronta. Falta o carro.",
        preheader: "Leva um minuto: marca, modelo e ano.",
        titulo: "Conta pronta. Falta o carro.",
        saudacao: oi,
        paragrafos: [
          "O Mentorque lembra você da revisão antes de vencer, compara o preço do serviço com a sua região e responde o que o mecânico disse.",
          "Tudo isso começa com o seu carro cadastrado, e leva um minuto: marca, modelo e ano.",
        ],
        cta: { texto: "Cadastrar o meu carro", url: link("addCar") },
        push: { titulo: "Falta o carro", corpo: "Cadastre o seu carro e o calendário de revisão nasce. Leva um minuto." },
      };
    }
    const itens = itensDoCalendario(p, carro, agora, hoje);
    return {
      assunto: `Sua conta está pronta. O ${nome} já tem calendário.`,
      preheader: "Revisão vencida, km parado e serviço registrado viram lembrete.",
      titulo: `O ${nome} já está na garagem`,
      saudacao: oi,
      paragrafos: [
        `A partir de agora, revisão vencida, km parado e serviço registrado viram lembrete. Você não precisa lembrar de nada: o app lembra por você.`,
        itens.length ? "O que já dá para ver no calendário:" : "Registre a última revisão que você lembra, e o calendário passa a ter data.",
      ],
      destaque: itens.length ? { titulo: "Próximos 90 dias", itens } : undefined,
      cta: { texto: `Ver o calendário do ${nome}`, url: link("history") },
      push: { titulo: `O ${nome} já tem calendário`, corpo: "Revisão, km e serviço viram lembrete. Abra e veja o que vem." },
    };
  }

  if (e.chave === "d2") {
    if (!carro) {
      return {
        assunto: "Sem o carro, o Mentorque é só o quiz",
        preheader: "Com ele, é o calendário do seu carro.",
        titulo: "Sem carro, sem calendário",
        saudacao: oi,
        paragrafos: [
          "Você criou a conta há dois dias e ainda não cadastrou o carro. Sem ele o app não tem o que lembrar: nem troca de óleo, nem fluido de freio, nem correia.",
          "Com o carro cadastrado, cada um desses itens ganha data e km, e vira aviso antes de vencer.",
        ],
        cta: { texto: "Cadastrar o meu carro", url: link("addCar") },
        push: { titulo: "Sem carro, sem calendário", corpo: "Cadastre o seu carro e cada revisão ganha data e km." },
      };
    }
    const itens = itensDoCalendario(p, carro, agora, hoje);
    return {
      assunto: `O que o ${nome} precisa nos próximos 90 dias`,
      preheader: "Data e km de cada item, pela régua do manual.",
      titulo: `Os próximos 90 dias do ${nome}`,
      saudacao: oi,
      paragrafos: itens.length
        ? ["Pela régua do manual e pelo que você registrou, é isto que vence primeiro:"]
        : [
            `Ainda não temos a data da última revisão do ${nome}, então o calendário está em branco.`,
            "Registre o último serviço que você lembra, mesmo aproximado. Com uma data, o app calcula todas as outras.",
          ],
      destaque: itens.length ? { titulo: "Vence primeiro", itens } : undefined,
      cta: { texto: itens.length ? "Ver o calendário" : "Registrar a última revisão", url: link(itens.length ? "history" : "addService") },
      push: { titulo: `Os próximos 90 dias do ${nome}`, corpo: itens.length ? itens[0] : "Registre a última revisão e o calendário nasce." },
    };
  }

  if (e.chave === "d5") {
    const faixa = regiao;
    const onde = faixa?.regiao ? ` em ${faixa.regiao}` : " perto de você";
    return {
      assunto: `Quanto custa uma troca de óleo${onde}?`,
      preheader: "A faixa antes de você fechar o serviço.",
      titulo: "O preço antes de fechar",
      saudacao: oi,
      paragrafos: [
        faixa
          ? `Numa oficina independente, troca de óleo com filtro costuma ficar entre <b>${reais(faixa.min)} e ${reais(faixa.max)}</b>${faixa.regiao ? ` em ${faixa.regiao}` : ""}. É referência, não tabela: carro, óleo e oficina mudam o número.`
          : "Numa oficina independente, troca de óleo com filtro tem uma faixa de preço conhecida. É referência, não tabela: carro, óleo e oficina mudam o número.",
        carro
          ? `Registre o último serviço do ${nome} com o valor, e no próximo você compara na hora com a sua região.`
          : "Cadastre o carro e registre o último serviço com o valor. No próximo, você compara na hora com a sua região.",
      ],
      cta: { texto: carro ? "Registrar um serviço" : "Cadastrar o meu carro", url: link(carro ? "addService" : "addCar") },
      push: { titulo: "Quanto custa uma troca de óleo?", corpo: "Registre o último serviço e compare com a sua região." },
    };
  }

  if (e.chave === "d9") {
    const comManual = !!carro && p.temManual;
    return {
      assunto: comManual ? `O manual do ${nome} está na Biela` : "Pergunte à Biela antes de aceitar o orçamento",
      preheader: "A mecânica de plantão responde o que o mecânico disse.",
      titulo: comManual ? `O manual do ${nome}, aberto` : "Antes de aceitar o orçamento",
      saudacao: oi,
      paragrafos: [
        "A Biela é a mecânica de plantão do Mentorque. Cole o orçamento, descreva o barulho, pergunte se aquela peça precisava mesmo ser trocada.",
        comManual
          ? `Ela responde com o manual do ${nome} aberto: intervalo de troca, tipo de óleo, o que a fábrica recomenda para o seu carro, não para um carro qualquer.`
          : "Ela responde em português claro, com o que costuma ser normal e o que merece um segundo orçamento.",
      ],
      cta: { texto: "Perguntar à Biela", url: link("biela") },
      push: { titulo: comManual ? `O manual do ${nome} está na Biela` : "Pergunte à Biela", corpo: "Cole o orçamento e pergunte se a peça precisava mesmo ser trocada." },
    };
  }

  if (e.chave === "d14") {
    if (carro) {
      const t = vehicleTraits(carro, agora);
      const idade = agora.getFullYear() - carro.year;
      if (t.has("oldCar")) {
        return {
          assunto: `O ${nome} tem ${idade} anos: o que costuma aparecer nessa idade`,
          preheader: "Cinco itens que envelhecem calados.",
          titulo: `${idade} anos de estrada`,
          saudacao: oi,
          paragrafos: ["Carro com mais de dez anos não é problema; é carro que pede atenção em pontos que o novo não pede. Os que mais aparecem:"],
          destaque: {
            titulo: "Vale olhar",
            itens: [
              "Bateria: dura em média quatro anos e avisa pouco antes de falhar",
              "Correia ou corrente: intervalo do manual, e o rompimento leva o motor junto",
              "Mangueiras e coxins: borracha resseca e racha sem fazer barulho",
              "Amortecedores: perdem aos poucos, e a gente se acostuma com o carro balançando",
              "Fluido de freio: absorve água com o tempo e o pedal fica esponjoso",
            ],
          },
          cta: { texto: "Responder o quiz de hoje", url: link("quiz") },
          push: { titulo: `${idade} anos de ${carro.model}`, corpo: "Bateria, correia, coxins: o que aparece nessa idade. Um minuto no quiz de hoje.", rota: "quiz" },
        };
      }
      if (t.has("highKm")) {
        return {
          assunto: `Acima de 100 mil km: o que o ${nome} passa a pedir`,
          preheader: "Quatro itens que chegam junto com a quilometragem.",
          titulo: "Depois dos 100 mil",
          saudacao: oi,
          paragrafos: ["A partir dos 100 mil km alguns itens saem da lista de \"um dia\" e entram na de \"agora\":"],
          destaque: {
            titulo: "Vale olhar",
            itens: [
              "Correia dentada ou corrente: o intervalo do manual costuma cair aqui",
              "Velas e cabos: falha de ignição começa como consumo alto",
              "Amortecedores e buchas: o carro flutua nas ondulações",
              "Embreagem: patina em subida antes de falhar de vez",
            ],
          },
          cta: { texto: "Responder o quiz de hoje", url: link("quiz") },
          push: { titulo: "Depois dos 100 mil km", corpo: "Correia, velas, amortecedores: o que passa a pedir atenção. Quiz de hoje em um minuto.", rota: "quiz" },
        };
      }
    }
    return {
      assunto: "Luz acesa, barulho novo: o que fazer antes de ir à oficina",
      preheader: "Os quatro guias, e o quiz de um minuto.",
      titulo: "Antes de ir à oficina",
      saudacao: oi,
      paragrafos: ["Quatro situações que assustam e quase sempre têm explicação simples. Cada guia diz o que olhar antes de gastar:"],
      destaque: {
        titulo: "Os guias",
        itens: [
          `<a href="${SITE}/luz-da-injecao-acesa" style="color:${TEXTO}">Luz da injeção acesa</a>`,
          `<a href="${SITE}/barulho-no-carro" style="color:${TEXTO}">Barulho no carro</a>`,
          `<a href="${SITE}/carro-nao-pega" style="color:${TEXTO}">Carro que não pega</a>`,
          `<a href="${SITE}/carro-gastando-muita-gasolina" style="color:${TEXTO}">Carro gastando muita gasolina</a>`,
        ],
      },
      cta: { texto: "Responder o quiz de hoje", url: link("quiz") },
      push: { titulo: "Luz acesa, barulho novo?", corpo: "O que olhar antes de ir à oficina. E o quiz de hoje leva um minuto.", rota: "quiz" },
    };
  }

  // ---- gatilhos ----
  if (familia === "vencida" && carro && item) {
    const rotulo = NOME_DO_ITEM[item] ?? item;
    const u = computeUpcoming(carro, servicosDoCarro(p, carro), agora).find((i) => i.key === item);
    const detalhe = u?.basis === "km" && typeof u.inKm === "number"
      ? `há ${kmBr(-u.inKm)}`
      : u?.basis === "time" && typeof u.months === "number"
        ? `há ${u.months} meses`
        : "";
    return {
      assunto: `${rotulo} do ${nome} passou do ponto`,
      preheader: "Pelo que você registrou, este item já venceu.",
      titulo: `${rotulo}: venceu`,
      saudacao: oi,
      paragrafos: [
        `Pelo último registro, ${rotulo.toLowerCase()} do ${nome} venceu${detalhe ? ` ${detalhe}` : ""}.`,
        CUSTO_DO_ATRASO[item] ? `Vale não deixar: ${CUSTO_DO_ATRASO[item]}.` : "Vale não deixar para o mês que vem.",
        "Se já fez e não registrou, marque no app e o calendário se ajusta sozinho.",
      ],
      cta: { texto: `Ver a saúde do ${nome}`, url: link("health") },
      push: { titulo: `${rotulo} do ${nome} venceu`, corpo: CUSTO_DO_ATRASO[item] ? `${CUSTO_DO_ATRASO[item].charAt(0).toUpperCase()}${CUSTO_DO_ATRASO[item].slice(1)}.` : "Já fez? Marque no app." },
    };
  }

  if (familia === "chegando" && carro && item) {
    const rotulo = NOME_DO_ITEM[item] ?? item;
    const plano = planoDosItens(carro, servicosDoCarro(p, carro), [item], agora)[0];
    const emDias = plano?.dataPrevista ? diasEntre(hoje, plano.dataPrevista) : null;
    const quando = emDias !== null && emDias >= 0 && emDias <= 30
      ? emDias === 0 ? "vence hoje" : `vence em ${emDias} dias, em ${dataBr(plano.dataPrevista!)}`
      : plano?.kmRestantes !== null && plano?.kmRestantes !== undefined
        ? `vence em ${kmBr(plano.kmRestantes)}, aos ${kmBr(plano.kmPrevisto ?? 0)}`
        : "vence em breve";
    return {
      assunto: `${rotulo} do ${nome} ${quando.split(",")[0]}`,
      preheader: "Dá tempo de escolher a oficina com calma.",
      titulo: `${rotulo}: chegando`,
      saudacao: oi,
      paragrafos: [
        `Pela régua do manual e pelo que você informou, ${rotulo.toLowerCase()} do ${nome} ${quando}.`,
        "Avisar antes é para dar tempo de pedir dois orçamentos e, se outro item cair perto, juntar tudo numa ida só. O calendário sugere a data.",
      ],
      cta: { texto: "Ver o calendário", url: link("revisions") },
      push: { titulo: `${rotulo} do ${nome} está chegando`, corpo: `${quando.charAt(0).toUpperCase()}${quando.slice(1)}. Dá tempo de pedir dois orçamentos.` },
    };
  }

  if (familia === "preco" && carro && e.servico) {
    const s = e.servico;
    const rotulo = NOME_DO_ITEM[s.type] ?? s.type;
    const faixa = faixaDaRegiao(s.type, p.uf, p.cidade);
    const total = s.total ?? 0;
    if (faixa) {
      const pos = posicaoNaFaixa(total, faixa);
      const leitura = pos === "abaixo"
        ? "Ficou abaixo da faixa. Bom negócio; só vale conferir se a peça era de primeira linha."
        : pos === "dentro"
          ? "Ficou dentro da faixa. Preço justo pelo que se vê na região."
          : "Ficou acima da faixa. Na próxima, peça dois orçamentos antes de fechar; a diferença costuma pagar o trabalho.";
      return {
        assunto: `Você pagou ${reais(total)} em ${rotulo.toLowerCase()}. Na região, a faixa é ${reais(faixa.min)} a ${reais(faixa.max)}`,
        preheader: leitura,
        titulo: "Comparado com a região",
        saudacao: oi,
        paragrafos: [
          `${rotulo} do ${nome}, registrado em ${dataBr(s.date)}: <b>${reais(total)}</b>. ${faixa.regiao ? `Em ${faixa.regiao}` : "Na sua região"}, costuma ficar entre ${reais(faixa.min)} e ${reais(faixa.max)}.`,
          leitura,
          "A faixa é referência de oficina independente. Quanto mais serviços registrados, mais ela vira dado de verdade.",
        ],
        cta: { texto: `Ver o histórico do ${nome}`, url: link("history") },
        push: { titulo: `${rotulo}: ${reais(total)}`, corpo: `Na região, a faixa é ${reais(faixa.min)} a ${reais(faixa.max)}. ${leitura.split(".")[0]}.` },
      };
    }
  }

  if (e.chave === "parado-2" || e.chave === "parado-7") {
    const semana = e.chave === "parado-7";
    return {
      assunto: semana ? `Uma semana, e o ${nome} continua em branco` : `O ${nome} está cadastrado, mas ainda não conta nada`,
      preheader: "Um serviço registrado, e o calendário nasce.",
      titulo: semana ? "Ainda em branco" : "Cadastrado, e agora?",
      saudacao: oi,
      paragrafos: [
        `O ${nome} está na garagem, mas sem nenhum serviço registrado o app não sabe quando foi a última troca de óleo, e sem isso não tem como avisar a próxima.`,
        "Registre o último serviço que você lembra, mesmo aproximado. Ou responda o quiz de um minuto: ele já diz por onde começar.",
      ],
      cta: { texto: "Registrar o último serviço", url: link("addService") },
      push: { titulo: semana ? `O ${nome} continua em branco` : `O ${nome} ainda não conta nada`, corpo: "Registre o último serviço que você lembra e o calendário nasce." },
    };
  }

  if (e.chave === "km" && carro) {
    const desde = carro.kmUpdatedAt ? diasEntre(carro.kmUpdatedAt.slice(0, 10), hoje) : null;
    return {
      assunto: `Quantos km o ${nome} tem hoje?`,
      preheader: "O calendário por km depende desse número.",
      titulo: "Atualize o km",
      saudacao: oi,
      paragrafos: [
        `A última vez que você informou o km do ${nome} foi há ${desde ?? "mais de 45"} dias${typeof carro.odometerKm === "number" ? `, com ${kmBr(carro.odometerKm)}` : ""}.`,
        "Troca de óleo, filtro e correia vencem por km. Sem o número atual, o calendário fica cego para eles.",
      ],
      cta: { texto: "Atualizar o km", url: link("car") },
      push: { titulo: `Quantos km o ${nome} tem hoje?`, corpo: "O calendário por km depende desse número. Leva dez segundos." },
    };
  }

  if (e.chave === "sumiu-14" || e.chave === "sumiu-30") {
    const tempo = e.chave === "sumiu-30" ? "um mês" : "duas semanas";
    if (carro) {
      const pendentes = itensDoCalendario(p, carro, agora, hoje, 30, 1000);
      return {
        assunto: `O ${nome} está sem novidade há ${tempo}`,
        preheader: pendentes.length ? "Tem coisa pendente no calendário." : "Nada venceu. O quiz de hoje leva um minuto.",
        titulo: `${tempo.charAt(0).toUpperCase()}${tempo.slice(1)} sem novidade`,
        saudacao: oi,
        paragrafos: pendentes.length
          ? [`Faz ${tempo} que o ${nome} não recebe registro nenhum. Enquanto isso, o calendário andou:`]
          : [`Faz ${tempo} que o ${nome} não recebe registro nenhum. Nada venceu nesse tempo, e isso já é notícia boa.`, "O quiz de hoje leva um minuto e mantém a sequência."],
        destaque: pendentes.length ? { titulo: "Pendente", itens: pendentes } : undefined,
        cta: pendentes.length ? { texto: "Ver o calendário", url: link("history") } : { texto: "Responder o quiz de hoje", url: link("quiz") },
        push: pendentes.length
          ? { titulo: `${nome}: tem coisa pendente`, corpo: pendentes[0] }
          : { titulo: `${tempo.charAt(0).toUpperCase()}${tempo.slice(1)} sem o ${nome}`, corpo: "Nada venceu. O quiz de hoje leva um minuto.", rota: "quiz" },
      };
    }
    return {
      assunto: `Faz ${tempo} que você não aparece por aqui`,
      preheader: "O quiz do dia leva um minuto.",
      titulo: `${tempo.charAt(0).toUpperCase()}${tempo.slice(1)} sem aparecer`,
      saudacao: oi,
      paragrafos: [
        `Faz ${tempo} que você não abre o Mentorque. O quiz do dia leva um minuto, e cadastrar o carro leva outro: com ele, o app passa a avisar a revisão antes de vencer.`,
      ],
      cta: { texto: "Responder o quiz de hoje", url: link("quiz") },
      push: { titulo: `${tempo.charAt(0).toUpperCase()}${tempo.slice(1)} sem aparecer`, corpo: "O quiz do dia leva um minuto.", rota: "quiz" },
    };
  }

  // ---- sazonais ----
  if (familia === "sazonal" && carro && item) {
    if (item.startsWith("ferias")) {
      return {
        assunto: `Antes de pegar a estrada com o ${nome}: seis itens em cinco minutos`,
        preheader: "O que conferir antes da viagem.",
        titulo: "Antes da viagem",
        saudacao: oi,
        paragrafos: ["Estrada cobra o que a cidade perdoa. Cinco minutos na garagem, antes de sair:"],
        destaque: {
          titulo: "Seis itens",
          itens: [
            "Óleo e água do radiador no nível",
            "Pneus calibrados com o carro carregado, e o estepe também",
            "Freios: pedal firme, sem barulho de metal",
            "Luzes: faróis, lanternas, freio e seta",
            "Palhetas e água do para-brisa",
            "Documentos e o kit de estrada no porta-malas",
          ],
        },
        cta: { texto: `Ver a saúde do ${nome}`, url: link("health") },
        push: { titulo: `Viagem com o ${nome}?`, corpo: "Seis itens em cinco minutos antes de pegar a estrada." },
      };
    }
    if (item.startsWith("chuva")) {
      return {
        assunto: `Chuva chegando: pneu e palheta do ${nome}`,
        preheader: "Aquaplanagem começa no pneu careca.",
        titulo: "Chuva chegando",
        saudacao: oi,
        paragrafos: ["As primeiras chuvas fortes do ano pegam o carro do jeito que o verão deixou. Três coisas para olhar esta semana:"],
        destaque: {
          titulo: "Três itens",
          itens: [
            "Pneus: sulco abaixo de 1,6 mm é aquaplanagem na primeira poça",
            "Palhetas: se rabiscam o vidro, já era; trocar é barato",
            "Faróis e lanternas: chuva de dia é farol baixo aceso",
          ],
        },
        cta: { texto: `Ver a saúde do ${nome}`, url: link("health") },
        push: { titulo: "Chuva chegando", corpo: `Pneu e palheta do ${nome}: vale olhar esta semana.` },
      };
    }
    if (item.startsWith("ipva")) {
      return {
        assunto: `IPVA do ${nome}: janeiro é o mês de olhar o calendário do seu estado`,
        preheader: "Placa, parcelas e desconto à vista mudam por estado.",
        titulo: "Janeiro é mês de IPVA",
        saudacao: oi,
        paragrafos: [
          "Cada estado publica o calendário pelo final da placa, com desconto para quem paga à vista. Vale conferir a data do seu antes que a primeira parcela passe.",
          `E já que o ${nome} está na sua mão: é uma boa hora para registrar o km atual e conferir o que vence no primeiro trimestre.`,
        ],
        cta: { texto: "Atualizar o km", url: link("car") },
        push: { titulo: "Janeiro é mês de IPVA", corpo: `Confira o calendário do seu estado e atualize o km do ${nome}.` },
      };
    }
  }

  // Chave sem texto: o motor trata como "nada hoje" e o ensaio grita.
  throw new Error(`sem texto para a chave ${e.chave}`);
}

// ---- o molde --------------------------------------------------------------------

const FONTE = "-apple-system,'Segoe UI',Roboto,Arial,sans-serif";

function itemHtml(texto: string): string {
  return `<tr><td style="padding:0 0 10px 0;font:400 15px/1.55 ${FONTE};color:${TEXTO}">
    <span style="color:${AMBAR};font-weight:700">•</span>&nbsp;&nbsp;${texto}
  </td></tr>`;
}

/**
 * O HTML e o texto puro do e-mail. `sairUrl` é o link de sair em um clique,
 * assinado por pessoa (app/api/jornada/sair/route.ts).
 */
export function renderEmail(m: Mensagem, sairUrl: string): { assunto: string; html: string; text: string } {
  const html = `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${m.titulo}</title></head>
<body style="margin:0;padding:0;background:${CREME}">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${m.preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CREME};padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
        <tr><td align="center" style="background:${GRAFITE};padding:26px 24px 0 24px">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="padding-right:9px"><img src="${SITE}/email/marca.png" width="30" height="30" alt="" style="display:block;border:0"></td>
            <td style="font:700 19px/1 ${FONTE};color:${CREME};letter-spacing:.2px">Mentorque</td>
          </tr></table>
          <img src="${SITE}/email/biela.png" width="112" alt="Biela" style="display:block;border:0;margin:14px auto 0 auto">
        </td></tr>
        <tr><td align="center" style="background:${GRAFITE};padding:2px 24px 26px 24px">
          <div style="font:700 23px/1.3 Georgia,'Times New Roman',serif;color:${CREME}">${m.titulo}</div>
        </td></tr>
        <tr><td style="padding:28px 28px 4px 28px">
          <p style="margin:0 0 12px 0;font:700 16px/1.5 ${FONTE};color:${TEXTO}">${m.saudacao}</p>
          ${m.paragrafos.map((t) => `<p style="margin:0 0 16px 0;font:400 15px/1.65 ${FONTE};color:${TEXTO}">${t}</p>`).join("\n          ")}
        </td></tr>
        ${m.destaque ? `<tr><td style="padding:0 28px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#faf8f3;border-left:3px solid ${AMBAR};border-radius:6px">
            <tr><td style="padding:16px 18px">
              <p style="margin:0 0 12px 0;font:700 12px/1 ${FONTE};color:${SUAVE};letter-spacing:.6px;text-transform:uppercase">${m.destaque.titulo}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${m.destaque.itens.map(itemHtml).join("")}</table>
            </td></tr>
          </table>
        </td></tr>` : ""}
        <tr><td align="center" style="padding:24px 28px 8px 28px">
          <a href="${m.cta.url}" style="display:inline-block;background:${AMBAR};color:${GRAFITE};font:700 15px/1 ${FONTE};text-decoration:none;padding:14px 26px;border-radius:999px">${m.cta.texto}</a>
        </td></tr>
        <tr><td align="center" style="padding:14px 28px 28px 28px">
          <p style="margin:0;font:400 13px/1.6 ${FONTE};color:${SUAVE}">${m.nota ?? "Prefere o app no celular?"} <a href="${APP_STORE}" style="color:${SUAVE}">App Store</a> · <a href="${PLAY_STORE}" style="color:${SUAVE}">Google Play</a></p>
        </td></tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">
        <tr><td align="center" style="padding:18px 24px 6px 24px">
          <p style="margin:0;font:400 12px/1.6 ${FONTE};color:${SUAVE}">
            Mentorque © 2026 · Você recebe este e-mail porque tem conta no Mentorque.<br>
            Não quer mais? <a href="${sairUrl}" style="color:${SUAVE}">Sair em um clique</a>.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const limpo = (s: string) => s.replace(/<[^>]+>/g, "");
  const text = [
    m.titulo,
    "",
    m.saudacao,
    ...m.paragrafos.map(limpo),
    ...(m.destaque ? ["", `${m.destaque.titulo}:`, ...m.destaque.itens.map((i) => `- ${limpo(i)}`)] : []),
    "",
    `${m.cta.texto}: ${m.cta.url}`,
    "",
    `App Store: ${APP_STORE}`,
    `Google Play: ${PLAY_STORE}`,
    "",
    "Você recebe este e-mail porque tem conta no Mentorque.",
    `Não quer mais? Sair em um clique: ${sairUrl}`,
  ].join("\n");

  return { assunto: m.assunto, html, text };
}
