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

  const [{ data: semanas }, { data: subs }, { data: cadastros }, { data: erros }] = await Promise.all([
    admin.from("funil_semana").select("*").limit(12),
    admin.from("subscriptions").select("status, cancel_at_period_end, plan"),
    admin.from("funil_eventos").select("criado_em, plataforma").eq("evento", "cadastro").gte("criado_em", d14),
    admin.from("app_erros").select("criado_em, mensagem, plataforma").gte("criado_em", d7).limit(2000),
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
  });
}
