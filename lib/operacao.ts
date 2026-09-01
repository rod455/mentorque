import { avisoDeColeta, frescorDasFontes } from "./frescorDasFontes";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// O agregado da operação num lugar só: alimenta a rota /api/dados (que o
// Analista de Dados coleta todo dia) e o painel /painel (que o Rodrigo abre
// quando quiser). Só agregados: nada de e-mail, nome ou id de usuário.

export type DadosOperacao = Awaited<ReturnType<typeof coletarDadosOperacao>>;

export async function coletarDadosOperacao() {
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const d14 = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const d7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const d10dias = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [
    { data: semanas }, { data: subs }, { data: cadastros }, { data: erros }, { data: metricas },
    { data: usoDiario }, { data: usoSemanal }, { data: coortes },
    { data: ativacao }, { data: assCoortes }, { data: porCampanha },
  ] = await Promise.all([
    admin.from("funil_semana").select("*").limit(12),
    admin.from("subscriptions").select("status, cancel_at_period_end, plan"),
    admin.from("funil_eventos").select("criado_em, plataforma").eq("evento", "cadastro").gte("criado_em", d14),
    admin.from("app_erros").select("criado_em, mensagem, plataforma").gte("criado_em", d7).limit(2000),
    // SEM filtro de data: o frescor precisa enxergar fonte parada há muito
    // tempo, e a janela de 10 dias fazia a fonte morta SUMIR em vez de
    // gritar. O recorte de 10 dias continua existindo, mas em memória,
    // depois de calcular há quanto tempo cada uma parou.
    admin.from("metricas_diarias").select("dia, fonte, dados").order("dia", { ascending: false }).limit(400),
    admin.from("uso_diario").select("*").limit(14),
    admin.from("uso_semanal").select("*").limit(8),
    admin.from("retencao_coortes").select("*").limit(8),
    admin.from("ativacao_coortes").select("*").limit(8),
    admin.from("assinaturas_coortes").select("*").limit(12),
    admin.from("cadastros_por_campanha").select("*").limit(20),
  ]);
  const { data: experimentos } = await admin.from("experimentos_resultados").select("*").limit(120);

  // A quebra do funil (28 dias, pessoas distintas): quantos por cento passam
  // de cada etapa para a seguinte, e onde está a maior perda. É o mapa de
  // prioridade dos testes A/B do CRO.
  const { data: etapas28 } = await admin.from("funil_etapas_28d").select("*");
  const porEtapa = new Map((etapas28 ?? []).map((e) => [e.evento, Number(e.pessoas)]));
  const CADEIA = ["abriu_app", "cadastro", "ativacao", "viu_paywall", "iniciou_checkout", "assinou"] as const;
  const quebraFunil = CADEIA.slice(0, -1).map((de, i) => {
    const para = CADEIA[i + 1];
    const antes = porEtapa.get(de) ?? 0;
    const depois = porEtapa.get(para) ?? 0;
    return {
      de, para, antes, depois,
      taxa: antes > 0 ? Math.round((depois / antes) * 1000) / 10 : null,
      perdidos: Math.max(0, antes - depois),
    };
  });

  const ativas = (subs ?? []).filter((s) => s.status === "active");

  const cadastrosPorDia: Record<string, number> = {};
  for (const c of cadastros ?? []) {
    const dia = String(c.criado_em).slice(0, 10);
    cadastrosPorDia[dia] = (cadastrosPorDia[dia] ?? 0) + 1;
  }

  const errosPorMensagem: Record<string, number> = {};
  for (const e of erros ?? []) {
    const m = String(e.mensagem).slice(0, 120);
    errosPorMensagem[m] = (errosPorMensagem[m] ?? 0) + 1;
  }
  const topErros = Object.entries(errosPorMensagem)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([mensagem, total]) => ({ mensagem, total }));

  // O frescor sai de TODAS as linhas; a série exibida, só dos últimos 10 dias.
  const hoje = new Date().toISOString().slice(0, 10);
  const frescor = frescorDasFontes(metricas ?? [], hoje);

  const porFonte: Record<string, { dia: string; dados: Record<string, unknown> }[]> = {};
  for (const m of metricas ?? []) {
    if (m.dia < d10dias) continue;
    (porFonte[m.fonte] ??= []).push({ dia: m.dia, dados: (m.dados ?? {}) as Record<string, unknown> });
  }

  return {
    geradoEm: new Date().toISOString(),
    funilSemanas: semanas ?? [],
    assinaturas: {
      ativas: ativas.length,
      cancelando: ativas.filter((s) => s.cancel_at_period_end).length,
      anuais: ativas.filter((s) => s.plan === "annual").length,
      mensais: ativas.filter((s) => s.plan === "monthly").length,
    },
    cadastrosPorDia,
    erros7d: { total: (erros ?? []).length, top: topErros },
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
    // Onde o funil quebra (28 dias): taxa de passagem etapa a etapa.
    quebraFunil,
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
