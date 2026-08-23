import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// O retrato diário da operação, consolidado numa rota só. É a matéria-prima
// do Analista de Dados (n8n), que coleta isto todo dia de manhã e publica no
// repositório para o Diretor e os demais agentes lerem.
//
// Só agregados: nada de e-mail, nome ou id de usuário sai por aqui.
export async function GET() {
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 501 });

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
    admin.from("metricas_diarias").select("dia, fonte, dados").gte("dia", d10dias).order("dia", { ascending: false }).limit(120),
    admin.from("uso_diario").select("*").limit(14),
    admin.from("uso_semanal").select("*").limit(8),
    admin.from("retencao_coortes").select("*").limit(8),
    admin.from("ativacao_coortes").select("*").limit(8),
    admin.from("assinaturas_coortes").select("*").limit(12),
    admin.from("cadastros_por_campanha").select("*").limit(20),
  ]);

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

  return NextResponse.json({
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
    // Fontes externas coletadas pelo Analista (metricas_diarias): para cada
    // fonte, o pacote mais recente e a série dos últimos 10 dias.
    fontesExternas: (() => {
      const porFonte: Record<string, { dia: string; dados: unknown }[]> = {};
      for (const m of metricas ?? []) (porFonte[m.fonte] ??= []).push({ dia: m.dia, dados: m.dados });
      return porFonte;
    })(),
  });
}
