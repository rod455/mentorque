import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Resumo semanal dos votos na Biela.
//
// Dashboard que ninguém abre não melhora nada. Toda segunda de manhã o que a
// Biela errou na semana chega por e-mail, com a pergunta e a resposta lado a
// lado — que é o formato em que dá para ler e concluir alguma coisa.
//
// O mesmo passo apaga o que passou de 90 dias. Retenção precisa de alguém
// executando, senão vira promessa na política de privacidade e prática nenhuma
// no banco. Deixar junto do trabalho semanal é o que garante que aconteça.

const FROM = process.env.FEEDBACK_FROM ?? process.env.WAITLIST_FROM ?? "Mentorque <contato@mentorque.com.br>";
const TO = process.env.FEEDBACK_TO ?? "contato@mentorque.com.br";
const RETENCAO_DIAS = 90;

const MOTIVO_LABEL: Record<string, string> = {
  errada: "Errada",
  incompleta: "Não respondeu o que perguntei",
  confusa: "Confusa",
};

const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] as string));

type Voto = {
  criado_em: string; voto: string; motivo: string | null; comentario: string | null;
  pergunta: string; resposta: string; carro: string | null; com_manual: boolean | null; modo: string | null;
};

export async function GET(request: Request) {
  // A Vercel manda `Authorization: Bearer $CRON_SECRET` quando a variável
  // existe. Sem a conferência, qualquer um dispara o envio à vontade.
  const segredo = process.env.CRON_SECRET;
  if (segredo && request.headers.get("authorization") !== `Bearer ${segredo}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 501 });

  const semanaAtras = new Date(Date.now() - 7 * 864e5).toISOString();
  const { data, error } = await admin
    .from("biela_votos")
    .select("criado_em, voto, motivo, comentario, pergunta, resposta, carro, com_manual, modo")
    .gte("criado_em", semanaAtras)
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("[biela-resumo] leitura falhou:", error.message);
    return NextResponse.json({ ok: false, error: "read_failed" }, { status: 502 });
  }

  const votos = (data ?? []) as Voto[];
  const ruins = votos.filter((v) => v.voto === "down");
  const bons = votos.length - ruins.length;

  // Descarte da retenção, independente de ter havido voto na semana.
  const corte = new Date(Date.now() - RETENCAO_DIAS * 864e5).toISOString();
  const { error: erroLimpeza } = await admin.from("biela_votos").delete().lt("criado_em", corte);
  if (erroLimpeza) console.error("[biela-resumo] limpeza falhou:", erroLimpeza.message);

  // Semana sem nenhum voto não vira e-mail. Resumo vazio toda segunda é o jeito
  // mais rápido de ensinar alguém a ignorar o resumo.
  if (votos.length === 0) return NextResponse.json({ ok: true, enviado: false, motivo: "sem_votos" });

  const taxa = votos.length ? Math.round((bons / votos.length) * 100) : 0;

  const cartao = (v: Voto) => `
    <div style="background:#fff;border:1px solid #e6e2d8;border-radius:10px;padding:14px;margin:0 0 12px">
      <p style="margin:0 0 8px;font-size:12px;color:#8f8a80">
        ${new Date(v.criado_em).toLocaleDateString("pt-BR")}
        ${v.motivo ? ` · <b style="color:#c24d26">${esc(MOTIVO_LABEL[v.motivo] ?? v.motivo)}</b>` : ""}
        ${v.carro ? ` · ${esc(v.carro)}` : ""}
        ${v.com_manual === false ? " · sem manual" : ""}
        ${v.modo === "basic" ? " · modo básico" : ""}
      </p>
      <p style="margin:0 0 4px;font-size:12px;color:#8f8a80"><b>Perguntou</b></p>
      <p style="margin:0 0 10px;color:#333;white-space:pre-wrap">${esc(v.pergunta)}</p>
      <p style="margin:0 0 4px;font-size:12px;color:#8f8a80"><b>Biela respondeu</b></p>
      <p style="margin:0;color:#555;white-space:pre-wrap">${esc(v.resposta.slice(0, 900))}${v.resposta.length > 900 ? "…" : ""}</p>
      ${v.comentario ? `<p style="margin:10px 0 0;padding:8px 10px;background:#f6f2e8;border-radius:6px;color:#333"><b>Escreveu:</b> ${esc(v.comentario)}</p>` : ""}
    </div>`;

  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:640px;margin:auto">
    <div style="background:#f2a623;color:#141414;padding:16px 20px;border-radius:12px 12px 0 0;font-size:18px;font-weight:700">🐻 A Biela na semana</div>
    <div style="background:#faf7f0;padding:20px;border:1px solid #eee;border-top:none">
      <p style="margin:0 0 16px;color:#333">
        <b>${votos.length}</b> ${votos.length === 1 ? "voto" : "votos"} ·
        <b style="color:#0f8a66">${bons} 👍</b> ·
        <b style="color:#c24d26">${ruins.length} 👎</b> ·
        ${taxa}% de aprovação
      </p>
      ${ruins.length
        ? `<p style="margin:0 0 12px;font-weight:700;color:#141414">O que não serviu</p>${ruins.map(cartao).join("")}`
        : `<p style="margin:0;color:#0f8a66">Nenhum 👎 esta semana.</p>`}
    </div>
    <div style="padding:12px 20px;color:#8f8a80;font-size:12px;background:#f2efe8;border-radius:0 0 12px 12px">
      Votos com mais de ${RETENCAO_DIAS} dias são apagados automaticamente neste mesmo resumo.
    </div>
  </div>`;

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[biela-resumo] RESEND_API_KEY ausente — resumo não enviado");
    return NextResponse.json({ ok: false, error: "email_not_configured", votos: votos.length }, { status: 503 });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      subject: `[Mentorque] A Biela na semana — ${ruins.length} 👎 de ${votos.length}`,
      html,
    }),
  });
  if (!res.ok) {
    console.error("[biela-resumo] resend erro:", res.status, await res.text().catch(() => ""));
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, enviado: true, votos: votos.length, ruins: ruins.length });
}
