import { avisoDeColeta, frescorDasFontes } from "./frescorDasFontes";
import {
  CADEIA_ATO,
  CADEIA_PRIMEIRA_SESSAO,
  CADEIA_SESSAO,
  NATUREZA,
  degrausDaCadeia,
  janelaDaCadeia,
  type EventoFunil,
} from "./funilCorreto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { comTentativas, transitorio } from "@/lib/transitorio";

// O agregado da operação num lugar só: alimenta a rota /api/dados (que o
// Analista de Dados coleta todo dia) e o painel /painel (que o Rodrigo abre
// quando quiser). Só agregados: nada de e-mail, nome ou id de usuário.

export type DadosOperacao = Awaited<ReturnType<typeof coletarDadosOperacao>>;

export async function coletarDadosOperacao() {
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  // Os tempos de cada consulta (14/09/2026). A rota levava uns 8 segundos
  // num dia normal e estourou o teto de 15 nas manhãs de 12, 13 e 14/09 sem
  // que ninguém soubesse QUAL consulta pesava. Vai no JSON e no log da
  // Vercel quando passa de 5 segundos: é a evidência para o próximo conserto.
  //
  // O que os logs da Supabase mostraram em 14/09: as consultas levam
  // milissegundos no Postgres, mas a camada de API (PostgREST) devolvia 504
  // para 4 a 8 das 12 consultas disparadas de uma vez ("Timed out acquiring
  // connection from connection pool"), e a rota seguia com aquelas seções
  // VAZIAS, sem dizer nada: "série de uso vazia", "funil sem dados". Por
  // isso: no máximo 3 consultas por vez, até 3 tentativas com pausa quando a
  // API responde 503/504, e o erro de cada consulta vai em `falhas`, para o
  // retrato e o Vigia enxergarem buraco em vez de zero.
  const t0 = Date.now();
  const tempos: Record<string, number> = {};
  const falhas: Record<string, string> = {};
  const POR_VEZ = 3;
  type Resposta = { data: unknown; error: { message?: string; code?: string } | null; status?: number };
  // A regra de "vale tentar de novo" mora em lib/transitorio.ts e vale para o
  // /api/funil tambem: uma ponte, uma regra.
  const medir = async <T extends Resposta>(nome: string, fabrica: () => PromiseLike<T>): Promise<T> => {
    const inicio = Date.now();
    const r = await comTentativas(fabrica, { pausaMs: 300 });
    tempos[nome] = Date.now() - inicio;
    if (r.error) falhas[nome] = `${r.status ?? ""} ${r.error.code ?? ""} ${r.error.message ?? ""}${transitorio(r) ? " (passageiro, tentou 3x)" : ""}`.trim();
    return r;
  };
  // Poucas por vez: é a pilha da API que engasga, não o banco.
  const emFila = async <T,>(tarefas: (() => Promise<T>)[]): Promise<T[]> => {
    const saida: T[] = new Array(tarefas.length);
    let proxima = 0;
    const trabalhador = async () => {
      while (proxima < tarefas.length) {
        const i = proxima++;
        saida[i] = await tarefas[i]();
      }
    };
    await Promise.all(Array.from({ length: Math.min(POR_VEZ, tarefas.length) }, trabalhador));
    return saida;
  };

  const d14 = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const d7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const d30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const d10dias = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [
    { data: semanas }, { data: subs }, { data: cadastros }, { data: erros }, { data: metricas },
    { data: usoDiario }, { data: usoSemanal }, { data: coortes },
    { data: ativacao }, { data: assCoortes }, { data: porCampanha },
    { data: conferencia }, { data: emailEnvios }, { data: emailEventos },
  ] = await emFila([
    () => medir("funil_semana", () => admin.from("funil_semana").select("*").limit(12)),
    // `stripe_subscription_id` entra na leitura porque é ele que separa venda
    // de cortesia: conta liberada na mão não tem assinatura no Stripe.
    () => medir("subscriptions", () => admin.from("subscriptions").select("status, cancel_at_period_end, plan, stripe_subscription_id, cupom")),
    () => medir("cadastros", () => admin.from("funil_eventos").select("criado_em, plataforma").eq("evento", "cadastro").gte("criado_em", d14)),
    () => medir("app_erros", () => admin.from("app_erros").select("criado_em, mensagem, plataforma, versao, anon_id").gte("criado_em", d7).limit(2000)),
    // SEM filtro de data: o frescor precisa enxergar fonte parada há muito
    // tempo, e a janela de 10 dias fazia a fonte morta SUMIR em vez de
    // gritar. O recorte de 10 dias continua existindo, mas em memória,
    // depois de calcular há quanto tempo cada uma parou.
    () => medir("metricas_diarias", () => admin.from("metricas_diarias").select("dia, fonte, dados").order("dia", { ascending: false }).limit(400)),
    () => medir("uso_diario", () => admin.from("uso_diario").select("*").limit(14)),
    () => medir("uso_semanal", () => admin.from("uso_semanal").select("*").limit(8)),
    () => medir("retencao_coortes", () => admin.from("retencao_coortes").select("*").limit(8)),
    () => medir("ativacao_coortes", () => admin.from("ativacao_coortes").select("*").limit(8)),
    () => medir("assinaturas_coortes", () => admin.from("assinaturas_coortes").select("*").limit(12)),
    () => medir("cadastros_por_campanha", () => admin.from("cadastros_por_campanha").select("*").limit(20)),
    // A conferência entre a fonte da verdade e a medição. Ver a view em
    // supabase/funil_eventos.sql: ela existe porque as duas divergiram e
    // ninguém percebeu até alguém perguntar na mão.
    () => medir("assinaturas_conferencia", () => admin.from("assinaturas_conferencia").select("veredito")),
    // O QUE ACONTECE COM O E-MAIL DEPOIS DE SAIR (19/09/2026). A jornada manda
    // até 6 por pessoa em 30 dias e a gente só sabia que saíram. Entregue,
    // aberto e clicado chegam pelo webhook do Resend (/api/email/eventos), e
    // aqui viram taxa por chave: é assim que se descobre QUAL e-mail ninguém
    // abre, em vez de "os e-mails vão mal".
    () => medir("jornada_envios", () => admin.from("jornada_envios").select("chave, dia, email_id").gte("dia", d30).limit(3000)),
    () => medir("email_eventos", () => admin.from("email_eventos").select("id_externo, tipo, chave, criado_em").gte("criado_em", d30).limit(5000)),
  ]);
  tempos.paralelo = Date.now() - t0;
  const { data: experimentos } = await medir("experimentos", () => admin.from("experimentos_resultados").select("*").limit(120));
  // A porta única das anomalias (supabase/anomalias-da-operacao.sql). A régua
  // mora no banco pelo mesmo motivo do funil_canonico: consulta escrita à mão
  // em cada leitor produz um número diferente por leitor.
  const { data: anomalias } = await medir("anomalias", () => admin.rpc("anomalias_da_operacao", { p_dias: 14 }));

  // A quebra do funil (28 dias, pessoas distintas): quantos por cento passam
  // de cada etapa para a seguinte, e onde está a maior perda. É o mapa de
  // prioridade dos testes A/B do CRO.
  //
  // A CADEIA ÚNICA DE SEIS DEGRAUS FOI DESFEITA EM 01/09/2026, e o motivo é
  // de unidade, não de conta. `abriu_app` e `viu_paywall` disparam uma vez por
  // SESSÃO, para quem estiver lá; `cadastro`, `iniciou_checkout` e `assinou`
  // disparam no INSTANTE do ato e nunca mais. Dividir um ato por um evento de
  // sessão é dividir fluxo de novatos por estoque de todos: sai um número
  // calculável que não quer dizer nada, e foi assim que o relatório de 31/08
  // publicou 17 → 8 → 2 → 2 → 2 como se fosse funil.
  //
  // Agora são dois trechos comparáveis por dentro, e cada degrau que não pode
  // virar taxa carrega o MOTIVO em vez de um número. A regra mora em
  // lib/funilCorreto.ts, que é puro e conferível por `npm run conferir:funil`.
  //
  // A pergunta "quantos têm carro", que a etapa `ativacao` tentava responder,
  // mudou de lugar: ela é ESTADO e está em `estadoDaBase`, conferível conta a
  // conta, sem depender de o evento existir na época.
  const { data: estadoDaBase } = await medir("estado_da_base", () => admin.from("estado_da_base").select("*").maybeSingle());

  const desde28 = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  // A janela pedida é 28 dias, mas ela encolhe até onde os eventos existem.
  // Recusar tudo seria honesto e inútil: trocaria um número errado por número
  // nenhum. O encolhimento vai escrito em `janela.aviso`.
  const janela = janelaDaCadeia([...CADEIA_SESSAO, ...CADEIA_ATO], desde28);
  const { data: etapas } = await medir("funil_etapas", () => admin.rpc("funil_etapas", { p_desde: janela.desde }));
  const porEtapa = new Map<EventoFunil, number>(
    ((etapas ?? []) as { evento: string; pessoas: number }[])
      .filter((e) => e.evento in NATUREZA)
      .map((e) => [e.evento as EventoFunil, Number(e.pessoas)]),
  );
  // CADASTRO NÃO SAI DO EVENTO. O evento só dispara para conta criada há menos
  // de 7 dias, e esse buraco nenhum build conserta: a conta de 08/08 continua
  // velha demais, hoje e sempre. `auth.users` tem a data de nascimento do fato
  // gravada, e ainda dá para tirar as três contas do próprio time, que
  // inflariam qualquer taxa. Na janela de hoje: o evento dizia 1, a tabela diz
  // 2. A regra geral está em FONTE_MELHOR, em lib/funilCorreto.ts.
  const { data: contasDeFora } = await medir("contas_criadas_desde", () => admin.rpc("contas_criadas_desde", { p_desde: janela.desde }));
  if (typeof contasDeFora === "number") porEtapa.set("cadastro", contasDeFora);
  const comPerdidos = (d: ReturnType<typeof degrausDaCadeia>[number]) => ({
    ...d,
    perdidos: d.taxa === null ? null : Math.max(0, d.antes - d.depois),
  });
  // A primeira sessão tem janela própria: os eventos dela nasceram em 01/09 e
  // só chegam aos aparelhos com a 1.6. Misturar com a janela dos outros faria
  // a cadeia parecer vazia em vez de nova.
  const janelaPrimeira = janelaDaCadeia(CADEIA_PRIMEIRA_SESSAO, desde28);
  const { data: etapasPrimeira } = await medir("funil_etapas_primeira", () => admin.rpc("funil_etapas", { p_desde: janelaPrimeira.desde }));
  const porEtapaPrimeira = new Map<EventoFunil, number>(
    ((etapasPrimeira ?? []) as { evento: string; pessoas: number }[])
      .filter((e) => e.evento in NATUREZA)
      .map((e) => [e.evento as EventoFunil, Number(e.pessoas)]),
  );
  // ── O que aconteceu com os e-mails da jornada (19/09/2026) ───────────────
  const envios = (emailEnvios ?? []) as { chave: string; dia: string; email_id: string | null }[];
  const eventos = (emailEventos ?? []) as { id_externo: string; tipo: string; chave: string | null }[];
  const porEmail = new Map<string, Set<string>>();
  for (const e of eventos) {
    const s = porEmail.get(e.id_externo) ?? new Set<string>();
    s.add(e.tipo);
    porEmail.set(e.id_externo, s);
  }
  const contaPorChave: Record<string, { enviados: number; comId: number; entregues: number; abertos: number; clicados: number; problemas: number }> = {};
  for (const env of envios) {
    const c = (contaPorChave[env.chave] ??= { enviados: 0, comId: 0, entregues: 0, abertos: 0, clicados: 0, problemas: 0 });
    c.enviados++;
    if (!env.email_id) continue;
    c.comId++;
    const tipos = porEmail.get(env.email_id);
    if (!tipos) continue;
    if (tipos.has("delivered")) c.entregues++;
    if (tipos.has("opened")) c.abertos++;
    if (tipos.has("clicked")) c.clicados++;
    if (tipos.has("bounced") || tipos.has("complained") || tipos.has("failed")) c.problemas++;
  }
  const taxa = (parte: number, todo: number) => (todo > 0 ? Math.round((parte / todo) * 1000) / 10 : null);
  const resumoDeEmail = {
    enviados: envios.length,
    // Envio SEM id do Resend é envio anterior a 19/09/2026, quando o id passou
    // a ser guardado. Ele nunca vai ter evento, e contá-lo no denominador
    // afundaria a taxa para sempre.
    semId: envios.filter((e) => !e.email_id).length,
    semEventos: envios.filter((e) => e.email_id && !porEmail.has(e.email_id)).length,
    porChave: Object.entries(contaPorChave)
      .map(([chave, c]) => ({
        chave,
        ...c,
        taxaAbertura: taxa(c.abertos, c.comId),
        taxaClique: taxa(c.clicados, c.comId),
      }))
      .sort((a, b) => b.enviados - a.enviados),
  };

  const quebraFunil = [
    ...degrausDaCadeia(CADEIA_SESSAO, porEtapa, janela.desde),
    ...degrausDaCadeia(CADEIA_ATO, porEtapa, janela.desde),
    ...degrausDaCadeia(CADEIA_PRIMEIRA_SESSAO, porEtapaPrimeira, janelaPrimeira.desde),
  ].map(comPerdidos);

  // QUEM É ASSINANTE, E POR QUE A CONTA ESTAVA ERRADA AQUI.
  //
  // Este arquivo filtrava só `status === "active"`. O app (lib/app/store.tsx) e
  // o /api/stripe/sync contam `active` E `trialing`, porque em teste o cartão
  // já foi dado e a pessoa já tem Premium na mão. Duas definições de assinante
  // no mesmo produto, e a mais estreita era justamente a que alimentava o
  // painel: em 02/09/2026 o painel dizia 2 assinaturas enquanto 4 contas
  // tinham Premium. É o mesmo erro de unidade do funil, em outro lugar.
  //
  // E não basta somar: as três coisas abaixo são diferentes e virariam mentira
  // se ficassem num número só.
  //
  //   pagantes  → já teve fatura paga (`active` com assinatura do Stripe)
  //   emTeste   → `trialing`: vale como assinante, mas ainda não é receita
  //   cortesias → liberadas na mão, sem Stripe (o revisor das lojas). Nunca
  //               foram receita e não podem entrar em contagem de venda.
  const assinantes = (subs ?? []).filter((s) => s.status === "active" || s.status === "trialing");
  const cortesias = assinantes.filter((s) => !s.stripe_subscription_id);
  const daLoja = assinantes.filter((s) => !!s.stripe_subscription_id);
  const emTeste = daLoja.filter((s) => s.status === "trialing");
  const pagantes = daLoja.filter((s) => s.status === "active");
  // O que o painel chamava de "ativas": mantido com o mesmo nome para não
  // quebrar leitura de fora, mas agora com a definição que o app usa.
  const ativas = assinantes;

  const cadastrosPorDia: Record<string, number> = {};
  for (const c of cadastros ?? []) {
    const dia = String(c.criado_em).slice(0, 10);
    cadastrosPorDia[dia] = (cadastrosPorDia[dia] ?? 0) + 1;
  }

  const errosPorMensagem: Record<string, number> = {};
  // ALÉM DO TOTAL, QUANDO FOI A ÚLTIMA VEZ E EM QUANTOS APARELHOS (19/09/2026).
  //
  // O DEFEITO QUE ISSO CONSERTA: o Vigia diz "um erro está se repetindo: 10x"
  // lendo só este total de 7 dias, no presente. O erro do push parou em 15/09,
  // quando a 2.6 levou o conserto, e o alarme continuou saindo todo dia até
  // 19/09 porque as ocorrências velhas seguiam dentro da janela. Alarme que
  // repete sobre coisa já consertada é o jeito mais rápido de ensinar o dono a
  // ignorar o Vigia, e aí o próximo alarme de verdade passa batido.
  //
  // `ultimo` é o que responde "ainda está acontecendo?"; `aparelhos` é o que
  // separa dez pessoas de uma reabrindo o app (a coluna nasceu em 17/09); e
  // `versoes` diz se o erro só existe em versão velha, que é o caso quando o
  // conserto já saiu e a base ainda não atualizou.
  const detalhe: Record<string, { total: number; ultimo: string; aparelhos: Set<string>; versoes: Set<string> }> = {};
  for (const e of erros ?? []) {
    const m = String(e.mensagem).slice(0, 120);
    const d = (detalhe[m] ??= { total: 0, ultimo: "", aparelhos: new Set(), versoes: new Set() });
    d.total += 1;
    const quando = String(e.criado_em ?? "");
    if (quando > d.ultimo) d.ultimo = quando;
    if (e.anon_id) d.aparelhos.add(String(e.anon_id));
    if (e.versao) d.versoes.add(String(e.versao));
    errosPorMensagem[m] = (errosPorMensagem[m] ?? 0) + 1;
  }
  const topErros = Object.entries(detalhe)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5)
    .map(([mensagem, d]) => ({
      mensagem,
      total: d.total,
      ultimo: d.ultimo.slice(0, 10),
      aparelhos: d.aparelhos.size,
      versoes: [...d.versoes].sort(),
    }));

  // O frescor sai de TODAS as linhas; a série exibida, só dos últimos 10 dias.
  const hoje = new Date().toISOString().slice(0, 10);
  const frescor = frescorDasFontes(metricas ?? [], hoje);

  const porFonte: Record<string, { dia: string; dados: Record<string, unknown> }[]> = {};
  for (const m of metricas ?? []) {
    if (m.dia < d10dias) continue;
    (porFonte[m.fonte] ??= []).push({ dia: m.dia, dados: (m.dados ?? {}) as Record<string, unknown> });
  }

  tempos.total = Date.now() - t0;
  if (tempos.total > 5000) console.warn("dados: consulta lenta", JSON.stringify(tempos));
  if (Object.keys(falhas).length) console.warn("dados: consulta com erro", JSON.stringify(falhas));

  return {
    geradoEm: new Date().toISOString(),
    // Quanto cada consulta levou, em ms, e qual falhou (14/09/2026). Seção
    // com erro aqui é BURACO, não zero: quem lê o retrato confere isto antes
    // de escrever "sem dados".
    tempos,
    falhas,
    funilSemanas: semanas ?? [],
    assinaturas: {
      ativas: ativas.length,
      cancelando: ativas.filter((s) => s.cancel_at_period_end).length,
      anuais: ativas.filter((s) => s.plan === "annual").length,
      mensais: ativas.filter((s) => s.plan === "monthly").length,
      // A quebra que impede o número de cima de virar mentira. Sem ela, uma
      // cortesia do revisor e um teste grátis de sete dias entram na mesma
      // linha que um cliente pagante, e "assinaturas" deixa de dizer receita.
      pagantes: pagantes.length,
      emTeste: emTeste.length,
      cortesias: cortesias.length,
      // Quantas vendas nasceram de um cupom. Em 02/09/2026 eram TODAS, e o
      // número importa por um motivo que não é vaidade: cupom de 100% adia a
      // primeira cobrança em um mês inteiro, então venda com cupom entra no
      // MRR hoje e no caixa só depois. Sem esta linha, "3 assinaturas" e
      // "R$ 0,00 recebidos" parecem contradição, e não são.
      comCupom: daLoja.filter((s) => !!s.cupom).length,
      cupons: Object.entries(
        daLoja.reduce<Record<string, number>>((acc, s) => {
          if (s.cupom) acc[String(s.cupom)] = (acc[String(s.cupom)] ?? 0) + 1;
          return acc;
        }, {}),
      )
        .sort((a, b) => b[1] - a[1])
        .map(([codigo, total]) => ({ codigo, total })),
      // Assinatura de verdade que a medição não registrou (ou registrou duas
      // vezes). Zero é o normal; qualquer outro número é o painel avisando que
      // ele mesmo está mentindo, em vez de esperar alguém perguntar.
      desencontros: ((conferencia ?? []) as { veredito: string }[]).filter(
        (c) => c.veredito !== "ok" && c.veredito !== "cortesia, nao e venda",
      ).length,
    },
    cadastrosPorDia,
    erros7d: { total: (erros ?? []).length, top: topErros },
    // E-MAIL DA JORNADA, 30 dias: o que saiu e o que aconteceu depois.
    //
    // As taxas são sobre ENVIADOS, e a de clique é sobre enviados também (e não
    // sobre abertos), porque abertura de e-mail é medida por imagem carregada e
    // quem bloqueia imagem some do denominador. Ler clique/aberto infla a taxa
    // exatamente nas listas mais técnicas. `semEventos` é o aviso honesto: se
    // todos os envios estiverem aí, o webhook não está ligado e as taxas
    // abaixo são zero por falta de instrumento, não por falta de leitor.
    email30d: resumoDeEmail,
    // A régua de uso: pessoas distintas (não aberturas), retenção por coorte
    // de cadastro e frequência. Definições na skill do time
    // (docs/agentes/skills/analise-da-operacao.md).
    uso: {
      porDia: usoDiario ?? [],
      porSemana: usoSemanal ?? [],
      coortes: coortes ?? [],
      // Ativação real: % da coorte que fez a primeira ação de valor
      // (abriu trilha ou cadastrou carro) em até 7 dias do cadastro.
      ativacao: ativacao ?? [],
    },
    // Vendas: coorte mensal de quem assinou e o que aconteceu depois.
    vendas: { assinaturasCoortes: assCoortes ?? [] },
    // Marketing: de onde vieram os cadastros dos últimos 28 dias (UTM da LP).
    // Cruzado com o gasto de meta_ads/google_ads, vira CAC por campanha.
    marketing: { cadastrosPorCampanha: porCampanha ?? [] },
    // Testes A/B em curso: eventos e pessoas por experimento e variante
    // (caderno em docs/agentes/experimentos.md).
    experimentos: experimentos ?? [],
    // Onde o funil quebra (28 dias): taxa de passagem etapa a etapa, em dois
    // trechos comparáveis por dentro. Degrau com `taxa: null` traz `motivo`:
    // é SEM MEDIÇÃO com a razão escrita, nunca um zero mudo.
    quebraFunil,
    // A janela realmente usada, e o aviso quando ela precisou encurtar.
    janelaDoFunil: janela,
    // ESTADO da base, que é o que "ativação" sempre quis dizer e o evento não
    // sabia responder. Conferível conta a conta. Cobre só quem tem CONTA:
    // convidado guarda o carro no aparelho e não aparece aqui, e escrever
    // "dos usuários" em cima deste número é mentira.
    estadoDaBase: estadoDaBase ?? null,
    // ANOMALIAS: padrões que valem investigação, contados no servidor.
    //
    // POR QUE ISTO ENTROU (07/09/2026). Duas coisas graves ficaram semanas
    // invisíveis, e nenhuma precisava de dado novo. O Android nunca teve um
    // evento com conta, em toda a história, e ninguém viu porque o relatório
    // olhava o total, onde a web cobre o buraco. E quem responde a pergunta do
    // dia costuma sumir, o que a nossa migalha de fechamento não consegue
    // acusar: ela só fala na abertura SEGUINTE, então um defeito ruim o
    // bastante para a pessoa desistir a deixa muda para sempre.
    //
    // Esta lista não prova nada sozinha. O valor dela é ser contável e
    // comparável entre plataformas: "some no Android e não no iPhone" é
    // achado; "some em todas" é gente terminando o que veio fazer.
    anomalias: anomalias ?? [],
    // Fontes externas coletadas pelo Analista (metricas_diarias): para cada
    // fonte, o pacote mais recente e a série dos últimos 10 dias.
    fontesExternas: porFonte,
    // A IDADE de cada fonte, da mais parada para a mais fresca, e uma frase
    // para quem só lê uma linha. Sem isto, pacote de nove dias atrás era
    // publicado como se fosse de hoje (ver lib/frescorDasFontes.ts).
    frescorDasFontes: frescor,
    avisoDeColeta: avisoDeColeta(frescor),
  };
}

export async function resumoAvaliacoes() {
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const { data } = await admin
    .from("lojas_avaliacoes")
    .select("loja, nota, titulo, texto, autor, versao, coletado_em")
    .order("coletado_em", { ascending: false })
    .limit(500);

  const linhas = data ?? [];
  const porNota: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
  const porLoja: Record<string, number> = {};
  let soma = 0;
  for (const l of linhas) {
    porNota[String(l.nota)] = (porNota[String(l.nota)] ?? 0) + 1;
    porLoja[l.loja] = (porLoja[l.loja] ?? 0) + 1;
    soma += l.nota ?? 0;
  }
  return {
    total: linhas.length,
    media: linhas.length ? Math.round((soma / linhas.length) * 10) / 10 : null,
    porNota,
    porLoja,
    recentes: linhas.slice(0, 10).map((l) => ({
      loja: l.loja,
      nota: l.nota,
      titulo: l.titulo,
      texto: l.texto ? String(l.texto).slice(0, 300) : null,
      autor: l.autor,
      versao: l.versao,
    })),
  };
}
