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
  // A ordem de cada texto, pedida pelo dono em 12/09 ("mais apelativos,
  // explore a dor"): a pergunta que incomoda, o que custa deixar como está,
  // como o Mentorque resolve, e UMA ação.
  if (e.chave === "d0") {
    if (!carro) {
      return {
        assunto: "Não sabe quando é a próxima revisão do seu carro? A gente sabe.",
        preheader: "Cadastre o carro em um minuto e o Mentorque avisa antes de vencer.",
        titulo: "Quando foi a última troca de óleo?",
        saudacao: oi,
        paragrafos: [
          "Se você precisou pensar, esse é o sinal. A manutenção do carro vive na memória, e a memória falha justamente quando o motor cobra. Revisão atrasada não avisa: ela aparece na oficina, com preço de conserto em vez de preço de manutenção.",
          "O Mentorque tira isso da sua cabeça. Você cadastra o carro (marca, modelo e ano, um minuto) e ele monta o calendário de tudo o que vence, por km e por data, e avisa antes.",
        ],
        cta: { texto: "Cadastrar o meu carro em 1 minuto", url: link("addCar") },
        push: { titulo: "Quando foi a última troca de óleo?", corpo: "Se precisou pensar, cadastre o carro: o Mentorque avisa antes de vencer." },
      };
    }
    const itens = itensDoCalendario(p, carro, agora, hoje);
    return {
      assunto: `O ${nome} entrou na garagem. Agora ele não te pega de surpresa.`,
      preheader: "Troca de óleo, fluido de freio, correia: cada item com data e km.",
      titulo: `O ${nome} está vigiado`,
      saudacao: oi,
      paragrafos: [
        `Carro sem calendário só avisa quando quebra. A partir de hoje o ${nome} tem um: troca de óleo, fluido de freio, correia, bateria, cada item com data e km, e o aviso chega antes de vencer, não depois.`,
        itens.length ? "O que já dá para ver:" : "Falta só uma coisa: a data da última revisão que você lembra, mesmo aproximada. Com ela, o calendário passa a ter data de verdade.",
      ],
      destaque: itens.length ? { titulo: "Vence primeiro", itens } : undefined,
      cta: { texto: itens.length ? `Ver o calendário do ${nome}` : "Registrar a última revisão", url: link(itens.length ? "history" : "addService") },
      push: { titulo: `O ${nome} está vigiado`, corpo: itens.length ? itens[0] : "Registre a última revisão e o calendário ganha data." },
    };
  }

  if (e.chave === "d2") {
    if (!carro) {
      return {
        assunto: "Não sabe quando é a próxima revisão do seu carro?",
        preheader: "A maioria descobre na oficina. É o jeito mais caro.",
        titulo: "Descobrir na oficina sai caro",
        saudacao: oi,
        paragrafos: [
          "A maioria das pessoas descobre que a revisão venceu na oficina, quando a troca de óleo já virou retífica ou a pastilha comeu o disco. É o jeito mais caro de descobrir.",
          "Você criou a conta, mas ainda não cadastrou o carro, e sem ele o Mentorque não tem o que vigiar. Com o carro na garagem, cada item ganha data e km e o app avisa antes: sem planilha, sem lembrar, sem susto.",
        ],
        cta: { texto: "Cadastrar o meu carro", url: link("addCar") },
        push: { titulo: "Quando é a próxima revisão?", corpo: "Cadastre o carro e o Mentorque avisa antes de vencer. Um minuto." },
      };
    }
    const itens = itensDoCalendario(p, carro, agora, hoje);
    return {
      assunto: `Não sabe quando é a próxima revisão do ${nome}? Está aqui.`,
      preheader: "Data e km de cada item, pela régua do manual.",
      titulo: `A próxima revisão do ${nome}`,
      saudacao: oi,
      paragrafos: itens.length
        ? [
            "Revisão atrasada não avisa. Ela aparece na oficina, com preço de conserto. Pela régua do manual e pelo que você registrou, é isto que vence primeiro:",
          ]
        : [
            `O ${nome} está na garagem, mas o calendário ainda está em branco: falta a data da última revisão.`,
            "Registre a última que você lembra, mesmo aproximada. Com uma data, o Mentorque calcula todas as outras e avisa antes de vencer. Sem isso, você volta a descobrir na oficina.",
          ],
      destaque: itens.length ? { titulo: "Vence primeiro", itens } : undefined,
      cta: { texto: itens.length ? "Ver o calendário" : "Registrar a última revisão", url: link(itens.length ? "history" : "addService") },
      push: { titulo: `A próxima revisão do ${nome}`, corpo: itens.length ? itens[0] : "Registre a última revisão e o calendário nasce." },
    };
  }

  if (e.chave === "d5") {
    const faixa = regiao;
    const onde = faixa?.regiao ? ` em ${faixa.regiao}` : " perto de você";
    return {
      assunto: "Quanto você pagou na última troca de óleo? Sabe se foi caro?",
      preheader: `A faixa${onde}, antes de você fechar o próximo serviço.`,
      titulo: "Caro ou justo? Dá para saber",
      saudacao: oi,
      paragrafos: [
        "A maioria paga o que a oficina pede, porque não tem com o que comparar. É assim que a troca de óleo de duzentos vira quatrocentos e cinquenta sem ninguém perceber.",
        faixa
          ? `Numa oficina independente${faixa.regiao ? ` em ${faixa.regiao}` : ""}, troca de óleo com filtro costuma ficar entre <b>${reais(faixa.min)} e ${reais(faixa.max)}</b>. É referência, não tabela: carro, óleo e oficina mudam o número.`
          : "Numa oficina independente, troca de óleo com filtro tem uma faixa de preço conhecida. É referência, não tabela: carro, óleo e oficina mudam o número.",
        carro
          ? `O que muda o jogo é registrar o que você pagou no ${nome}. No próximo serviço, o Mentorque compara na hora com a sua região e diz se ficou dentro, abaixo ou acima.`
          : "O que muda o jogo é ter o carro cadastrado e registrar o que você pagou. No próximo serviço, o Mentorque compara na hora com a sua região e diz se ficou dentro, abaixo ou acima.",
      ],
      cta: { texto: carro ? "Registrar o último serviço" : "Cadastrar o meu carro", url: link(carro ? "addService" : "addCar") },
      push: { titulo: "Pagou caro na última troca de óleo?", corpo: "Registre o serviço e o Mentorque compara com a sua região." },
    };
  }

  if (e.chave === "d9") {
    const comManual = !!carro && p.temManual;
    return {
      assunto: "O mecânico disse que precisa trocar. Precisa mesmo?",
      preheader: comManual ? `A Biela responde com o manual do ${nome} aberto.` : "Pergunte à Biela antes de aceitar o orçamento.",
      titulo: "Precisa mesmo trocar?",
      saudacao: oi,
      paragrafos: [
        "Todo mundo já saiu da oficina com a sensação de ter pago por uma peça que não precisava, e sem saber o suficiente para discutir na hora.",
        "A Biela é a mecânica de plantão do Mentorque. Cole o orçamento, descreva o barulho, pergunte se aquela peça precisava mesmo ser trocada. Ela responde em português claro e diz o que merece um segundo orçamento.",
        comManual
          ? `E responde com o manual do ${nome} aberto: intervalo de troca, tipo de óleo, o que a fábrica recomenda para o seu carro, não para um carro qualquer.`
          : "Antes de fechar, vale uma pergunta. Depois de pagar, não tem mais o que fazer.",
      ],
      cta: { texto: "Perguntar à Biela antes de fechar", url: link("biela") },
      push: { titulo: "Precisa mesmo trocar?", corpo: "Cole o orçamento na Biela antes de fechar. Ela diz o que merece segundo orçamento." },
    };
  }

  if (e.chave === "d14") {
    if (carro) {
      const t = vehicleTraits(carro, agora);
      const idade = agora.getFullYear() - carro.year;
      if (t.has("oldCar")) {
        return {
          assunto: `O ${nome} tem ${idade} anos. Sabe o que costuma falhar nessa idade?`,
          preheader: "Cinco itens que envelhecem calados e escolhem o pior dia.",
          titulo: `${idade} anos de estrada`,
          saudacao: oi,
          paragrafos: [
            "Carro com mais de dez anos não é problema. É carro que avisa pouco: bateria, correia e coxim envelhecem calados, e o dia em que falham nunca é um dia bom. Os que mais aparecem:",
          ],
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
          nota: "O quiz de um minuto por dia ensina a reconhecer os sinais antes de virar conserto. Prefere o app no celular?",
          cta: { texto: "Responder o quiz de hoje", url: link("quiz") },
          push: { titulo: `${idade} anos de ${carro.model}: o que falha nessa idade?`, corpo: "Bateria, correia, coxins. Um minuto no quiz de hoje ensina a ver os sinais.", rota: "quiz" },
        };
      }
      if (t.has("highKm")) {
        return {
          assunto: `O ${nome} passou dos 100 mil km. Sabe o que ele passa a pedir?`,
          preheader: "Quatro itens que chegam junto com a quilometragem.",
          titulo: "Depois dos 100 mil",
          saudacao: oi,
          paragrafos: ["A partir dos 100 mil km alguns itens saem da lista de \"um dia\" e entram na de \"agora\". Quem não sabe descobre no guincho:"],
          destaque: {
            titulo: "Vale olhar",
            itens: [
              "Correia dentada ou corrente: o intervalo do manual costuma cair aqui",
              "Velas e cabos: falha de ignição começa como consumo alto",
              "Amortecedores e buchas: o carro flutua nas ondulações",
              "Embreagem: patina em subida antes de falhar de vez",
            ],
          },
          nota: "O quiz de um minuto por dia ensina a reconhecer os sinais antes de virar conserto. Prefere o app no celular?",
          cta: { texto: "Responder o quiz de hoje", url: link("quiz") },
          push: { titulo: "Depois dos 100 mil km", corpo: "Correia, velas, amortecedores: o que passa a pedir atenção. Quiz de hoje em um minuto.", rota: "quiz" },
        };
      }
    }
    return {
      assunto: "Luz acesa no painel. Parar ou seguir?",
      preheader: "Os quatro guias para não chegar na oficina no escuro.",
      titulo: "Parar ou seguir?",
      saudacao: oi,
      paragrafos: [
        "Luz da injeção, barulho novo, carro que custa a pegar: são as situações que mais assustam e mais rendem orçamento inflado, porque a pessoa chega na oficina sem saber o que é.",
        "Os guias dizem o que olhar antes de gastar:",
      ],
      destaque: {
        titulo: "Os guias",
        itens: [
          `<a href="${SITE}/luz-da-injecao-acesa" style="color:${TEXTO}">Luz da injeção acesa</a>`,
          `<a href="${SITE}/barulho-no-carro" style="color:${TEXTO}">Barulho no carro</a>`,
          `<a href="${SITE}/carro-nao-pega" style="color:${TEXTO}">Carro que não pega</a>`,
          `<a href="${SITE}/carro-gastando-muita-gasolina" style="color:${TEXTO}">Carro gastando muita gasolina</a>`,
        ],
      },
      nota: "E o quiz de um minuto por dia ensina a reconhecer os sinais antes de virar conserto. Prefere o app no celular?",
      cta: { texto: "Responder o quiz de hoje", url: link("quiz") },
      push: { titulo: "Luz acesa no painel. Parar ou seguir?", corpo: "O que olhar antes de ir à oficina. Quiz de hoje em um minuto.", rota: "quiz" },
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
      assunto: `${rotulo} do ${nome} venceu. Cada semana a mais custa mais caro.`,
      preheader: "Pelo que você registrou, este item já passou do ponto.",
      titulo: `${rotulo}: passou do ponto`,
      saudacao: oi,
      paragrafos: [
        `Pelo último registro, ${rotulo.toLowerCase()} do ${nome} venceu${detalhe ? ` ${detalhe}` : ""}. ${CUSTO_DO_ATRASO[item] ? `${CUSTO_DO_ATRASO[item].charAt(0).toUpperCase()}${CUSTO_DO_ATRASO[item].slice(1)}.` : ""}`,
        "Quanto mais tempo passa, mais o conserto cresce: o que hoje é manutenção vira reparo. Este é o aviso que a oficina não manda.",
        "Se já fez e não registrou, marque no app e o calendário se ajusta sozinho.",
      ],
      cta: { texto: `Ver a saúde do ${nome}`, url: link("health") },
      push: { titulo: `${rotulo} do ${nome} venceu`, corpo: CUSTO_DO_ATRASO[item] ? `${CUSTO_DO_ATRASO[item].charAt(0).toUpperCase()}${CUSTO_DO_ATRASO[item].slice(1)}.` : "Cada semana a mais custa mais caro. Já fez? Marque no app." },
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
      assunto: `${rotulo} do ${nome} ${quando.split(",")[0]}. Dá tempo de pagar menos.`,
      preheader: "Quem escolhe a oficina com calma paga o preço de manutenção, não o de emergência.",
      titulo: `${rotulo}: chegando`,
      saudacao: oi,
      paragrafos: [
        `Pela régua do manual e pelo que você informou, ${rotulo.toLowerCase()} do ${nome} ${quando}.`,
        "Avisar antes é para você escolher a oficina com calma e pedir dois orçamentos, em vez de aceitar o primeiro quando o carro já parou. Se outro item cair perto, o calendário sugere juntar tudo numa ida só.",
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
        assunto: `Você pagou ${reais(total)} em ${rotulo.toLowerCase()}. Foi caro?`,
        preheader: `Na região, a faixa é ${reais(faixa.min)} a ${reais(faixa.max)}. ${leitura.split(".")[0]}.`,
        titulo: "Foi caro?",
        saudacao: oi,
        paragrafos: [
          `${rotulo} do ${nome}, registrado em ${dataBr(s.date)}: <b>${reais(total)}</b>. ${faixa.regiao ? `Em ${faixa.regiao}` : "Na sua região"}, costuma ficar entre ${reais(faixa.min)} e ${reais(faixa.max)}.`,
          leitura,
          "É assim que o Mentorque te protege do orçamento inflado: cada serviço registrado vira comparação na hora, e quanto mais gente registra, mais a faixa vira dado de verdade.",
        ],
        cta: { texto: `Ver o histórico do ${nome}`, url: link("history") },
        push: { titulo: `${rotulo}: ${reais(total)}. Foi caro?`, corpo: `Na região, a faixa é ${reais(faixa.min)} a ${reais(faixa.max)}. ${leitura.split(".")[0]}.` },
      };
    }
  }

  if (e.chave === "parado-2" || e.chave === "parado-7") {
    const semana = e.chave === "parado-7";
    return {
      assunto: semana ? `Uma semana, e o ${nome} continua sem calendário` : `O ${nome} está na garagem, mas ainda não te protege`,
      preheader: "Um serviço registrado, e o calendário nasce.",
      titulo: semana ? "Ainda sem calendário" : "Cadastrado, mas sem calendário",
      saudacao: oi,
      paragrafos: [
        `Sem um serviço registrado, o app não sabe quando foi a última troca de óleo do ${nome}, e sem isso não tem como te avisar a próxima. É o carro cadastrado que ainda não conta nada, e revisão que ninguém vigia vence na oficina.`,
        "Registre o último serviço que você lembra, mesmo aproximado. Dez segundos, e o calendário nasce. Ou responda o quiz de um minuto: ele já diz por onde começar.",
      ],
      cta: { texto: "Registrar o último serviço", url: link("addService") },
      push: { titulo: semana ? `O ${nome} continua sem calendário` : `O ${nome} ainda não te protege`, corpo: "Registre o último serviço que você lembra e o calendário nasce." },
    };
  }

  if (e.chave === "km" && carro) {
    const desde = carro.kmUpdatedAt ? diasEntre(carro.kmUpdatedAt.slice(0, 10), hoje) : null;
    return {
      assunto: `Quantos km o ${nome} tem hoje? Sem isso, a troca de óleo passa despercebida`,
      preheader: "Óleo, filtro e correia vencem por km.",
      titulo: "Atualize o km",
      saudacao: oi,
      paragrafos: [
        `A última vez que você informou o km do ${nome} foi há ${desde ?? "mais de 45"} dias${typeof carro.odometerKm === "number" ? `, com ${kmBr(carro.odometerKm)}` : ""}. Desde então o carro rodou, e o calendário não sabe quanto.`,
        "Troca de óleo, filtro e correia vencem por km. Sem o número atual, o aviso chega tarde ou não chega. Dez segundos para atualizar.",
      ],
      cta: { texto: "Atualizar o km", url: link("car") },
      push: { titulo: `Quantos km o ${nome} tem hoje?`, corpo: "Sem o km atual, a troca de óleo passa despercebida. Dez segundos." },
    };
  }

  if (e.chave === "sumiu-14" || e.chave === "sumiu-30") {
    const tempo = e.chave === "sumiu-30" ? "um mês" : "duas semanas";
    if (carro) {
      const pendentes = itensDoCalendario(p, carro, agora, hoje, 30, 1000);
      return {
        assunto: pendentes.length ? `O ${nome} anda sem vigia há ${tempo}, e tem coisa pendente` : `O ${nome} anda sem vigia há ${tempo}`,
        preheader: pendentes.length ? "O calendário andou enquanto você não olhava." : "Nada venceu. Mas o calendário só protege com o km em dia.",
        titulo: `${tempo.charAt(0).toUpperCase()}${tempo.slice(1)} sem vigia`,
        saudacao: oi,
        paragrafos: pendentes.length
          ? [`Faz ${tempo} que o ${nome} não recebe registro nenhum. Enquanto isso, o calendário andou:`]
          : [`Faz ${tempo} que o ${nome} não recebe registro nenhum. Nada venceu nesse tempo, e isso é notícia boa.`, "Mas o calendário só te protege com o km em dia: dez segundos para atualizar, ou um minuto no quiz de hoje para manter a sequência."],
        destaque: pendentes.length ? { titulo: "Pendente", itens: pendentes } : undefined,
        cta: pendentes.length ? { texto: "Ver o calendário", url: link("history") } : { texto: "Responder o quiz de hoje", url: link("quiz") },
        push: pendentes.length
          ? { titulo: `${nome}: tem coisa pendente`, corpo: pendentes[0] }
          : { titulo: `${tempo.charAt(0).toUpperCase()}${tempo.slice(1)} sem o ${nome}`, corpo: "Nada venceu. O quiz de hoje leva um minuto.", rota: "quiz" },
      };
    }
    return {
      assunto: `Faz ${tempo} que o Mentorque não te vê. E o seu carro?`,
      preheader: "Alguma coisa venceu e ninguém avisou.",
      titulo: `${tempo.charAt(0).toUpperCase()}${tempo.slice(1)} sem aparecer`,
      saudacao: oi,
      paragrafos: [
        `Faz ${tempo} que você não abre o Mentorque. Nesse tempo, alguma coisa venceu no seu carro e ninguém avisou, porque ele não está cadastrado.`,
        "Um minuto para cadastrar, e o app passa a vigiar por você: revisão, km, o que vence primeiro. O quiz do dia leva outro minuto.",
      ],
      cta: { texto: "Cadastrar o meu carro", url: link("addCar") },
      push: { titulo: `${tempo.charAt(0).toUpperCase()}${tempo.slice(1)} sem aparecer. E o seu carro?`, corpo: "Cadastre o carro em um minuto e o app vigia por você." },
    };
  }

  // ---- sazonais ----
  if (familia === "sazonal" && carro && item) {
    if (item.startsWith("ferias")) {
      return {
        assunto: `Vai viajar com o ${nome}? Estrada cobra o que a cidade perdoa.`,
        preheader: "Seis itens em cinco minutos, antes de sair.",
        titulo: "Antes da viagem",
        saudacao: oi,
        paragrafos: ["Pneu murcho, óleo baixo e palheta gasta passam despercebidos na cidade. Na estrada, a 110 por hora com a família dentro, cada um vira susto. Cinco minutos na garagem antes de sair:"],
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
        push: { titulo: `Viagem com o ${nome}?`, corpo: "Estrada cobra o que a cidade perdoa. Seis itens em cinco minutos." },
      };
    }
    if (item.startsWith("chuva")) {
      return {
        assunto: `Chuva chegando: o ${nome} aquaplana com pneu careca`,
        preheader: "Três itens para olhar esta semana.",
        titulo: "Chuva chegando",
        saudacao: oi,
        paragrafos: ["As primeiras chuvas fortes do ano pegam o carro do jeito que o verão deixou: pneu no limite, palheta rabiscando, farol fraco. Aquaplanagem não avisa. Três coisas para olhar esta semana:"],
        destaque: {
          titulo: "Três itens",
          itens: [
            "Pneus: sulco abaixo de 1,6 mm é aquaplanagem na primeira poça",
            "Palhetas: se rabiscam o vidro, já era; trocar é barato",
            "Faróis e lanternas: chuva de dia é farol baixo aceso",
          ],
        },
        cta: { texto: `Ver a saúde do ${nome}`, url: link("health") },
        push: { titulo: "Chuva chegando", corpo: `Pneu careca aquaplana. Olhe pneu e palheta do ${nome} esta semana.` },
      };
    }
    if (item.startsWith("ipva")) {
      return {
        assunto: `Janeiro pesa no bolso. Não deixe o IPVA do ${nome} virar multa.`,
        preheader: "Placa, parcelas e desconto à vista mudam por estado.",
        titulo: "Janeiro é mês de IPVA",
        saudacao: oi,
        paragrafos: [
          "Cada estado publica o calendário pelo final da placa, com desconto para quem paga à vista e multa para quem deixa passar. Vale conferir a sua data antes que a primeira parcela vença.",
          `E já que o ${nome} está na sua mão: é uma boa hora para registrar o km atual e ver o que vence no primeiro trimestre.`,
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
