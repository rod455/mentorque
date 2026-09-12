import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { chaveDadosOk } from "@/lib/chaveDados";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { escolherEmail, type Escolha, type PessoaDaJornada } from "@/lib/jornada/decisao";
import { montarMensagem, renderEmail } from "@/lib/jornada/emails";
import { linkDeSaida } from "@/lib/jornada/saida";
import { enviarPush, pushConfigurado } from "@/lib/push/transporte";
import type { ServiceRecord, Vehicle } from "@/lib/app/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// O padrão da Vercel é 10 segundos e a lista não cabe: cada envio respeita o
// limite do Resend (dois por segundo). Sessenta segundos para até 40 envios.
export const maxDuration = 60;

// A jornada de recorrência: o cron diário.
//
// Aprovada pelo dono em 12/09/2026 (docs/agentes/propostas/jornada-de-recorrencia.md).
// Toda manhã, 9h de Brasília, lê o estado de cada conta, pergunta à decisão
// pura (lib/jornada/decisao.ts) qual e-mail cabe hoje, monta o texto
// (lib/jornada/emails.ts), manda por e-mail e, onde houver token, por push
// com a mesma mensagem, e grava o envio.
//
// TRÊS TRAVAS, e cada uma responde a um jeito diferente de errar:
//
//   1. ENSAIO POR PADRÃO. Sem JORNADA_ATIVA=sim na Vercel, o cron roda
//      inteiro, decide para todo mundo e NÃO manda nada: devolve a lista do
//      que mandaria. Mensagem a cliente é alçada do dono; ligar a chave é o
//      ato dele. `?ensaio=1` força o ensaio mesmo com a chave ligada.
//   2. A CHAVE DO CRON. A Vercel manda `Authorization: Bearer $CRON_SECRET`;
//      sem ela, ou com a DADOS_CHAVE para uma rodada manual, nada roda.
//   3. A TRAVA NO BANCO. jornada_envios tem índice único (user_id, dia): duas
//      rodadas no mesmo dia não mandam duas vezes, e a decisão lê os envios
//      antes de escolher.
//
// O que fica de fora, de propósito: conta sem e-mail, e qualquer regra de
// oferta ou preço (não existe nenhuma aqui, e não entra sem o dono).

const FROM = process.env.JORNADA_FROM ?? process.env.WAITLIST_FROM ?? "Mentorque <contato@mentorque.com.br>";
const PAUSA_MS = 600; // dois por segundo é o teto do Resend

function hojeEmBrasilia(agora = new Date()): string {
  return agora.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

function autorizado(req: Request): boolean {
  const segredo = process.env.CRON_SECRET;
  if (segredo && req.headers.get("authorization") === `Bearer ${segredo}`) return true;
  return chaveDadosOk(req);
}

type Estado = {
  vehicles?: Vehicle[];
  services?: ServiceRecord[];
  activeVehicleId?: string | null;
  quiz?: { respostas?: number; ultimoDia?: string | null } | null;
  name?: string | null;
  state?: string | null;
  city?: string | null;
};

type Manual = { make: string; model: string; year_from: number | null; year_to: number | null };

function temManualPara(manuais: Manual[], v: Vehicle | null): boolean {
  if (!v) return false;
  const make = v.make.trim().toLowerCase();
  const model = v.model.trim().toLowerCase();
  return manuais.some((m) =>
    m.make.trim().toLowerCase() === make &&
    (model.startsWith(m.model.trim().toLowerCase()) || m.model.trim().toLowerCase().startsWith(model)) &&
    (m.year_from === null || v.year >= m.year_from) &&
    (m.year_to === null || v.year <= m.year_to),
  );
}

/** Lê tudo de que a decisão precisa, para todas as contas. */
async function carregarPessoas(admin: SupabaseClient, hoje: string): Promise<{ pessoas: PessoaDaJornada[]; comToken: Set<string> }> {
  const { data: lista, error: erroUsers } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (erroUsers) throw new Error(`auth: ${erroUsers.message}`);

  const desde = new Date(`${hoje}T12:00:00Z`);
  desde.setUTCDate(desde.getUTCDate() - 90);
  const [estados, saidas, envios, manuais, tokens] = await Promise.all([
    admin.from("user_state").select("user_id, data, updated_at"),
    admin.from("jornada_saidas").select("user_id"),
    admin.from("jornada_envios").select("user_id, chave, dia").gte("dia", desde.toISOString().slice(0, 10)),
    admin.from("manuals").select("make, model, year_from, year_to"),
    admin.from("push_tokens").select("user_id"),
  ]);
  for (const r of [estados, saidas, envios, manuais, tokens]) if (r.error) throw new Error(`banco: ${r.error.message}`);

  const estadoDe = new Map<string, { data: Estado; updated_at: string }>();
  for (const e of estados.data ?? []) estadoDe.set(e.user_id, { data: (e.data ?? {}) as Estado, updated_at: e.updated_at });
  const saiu = new Set((saidas.data ?? []).map((s) => s.user_id as string));
  const enviosDe = new Map<string, { chave: string; dia: string }[]>();
  for (const e of envios.data ?? []) {
    const l = enviosDe.get(e.user_id) ?? [];
    l.push({ chave: e.chave, dia: e.dia });
    enviosDe.set(e.user_id, l);
  }
  const comToken = new Set((tokens.data ?? []).map((t) => t.user_id as string));
  const listaDeManuais = (manuais.data ?? []) as Manual[];

  const pessoas: PessoaDaJornada[] = [];
  for (const u of lista.users) {
    if (!u.email) continue;
    const estado = estadoDe.get(u.id);
    const d = estado?.data ?? {};
    const veiculos = (Array.isArray(d.vehicles) ? d.vehicles : []).filter((v) => v && !v.soldAt);
    const servicos = Array.isArray(d.services) ? d.services : [];
    const atividadeEstado = estado ? hojeEmBrasilia(new Date(estado.updated_at)) : null;
    const atividadeQuiz = d.quiz?.ultimoDia ?? null;
    const ultimaAtividade = [atividadeEstado, atividadeQuiz].filter((x): x is string => !!x).sort().pop() ?? null;
    const principal = veiculos.find((v) => v.id === d.activeVehicleId) ?? veiculos[0] ?? null;
    const meta = (u.user_metadata ?? {}) as { full_name?: string; name?: string };
    pessoas.push({
      userId: u.id,
      email: u.email,
      nome: d.name ?? meta.full_name ?? meta.name ?? null,
      contaCriadaEm: hojeEmBrasilia(new Date(u.created_at)),
      veiculos,
      carroPrincipalId: d.activeVehicleId ?? null,
      servicos,
      quizRespostas: d.quiz?.respostas ?? 0,
      ultimaAtividade,
      temManual: temManualPara(listaDeManuais, principal),
      uf: d.state ?? null,
      cidade: d.city ?? null,
      saiu: saiu.has(u.id),
      envios: enviosDe.get(u.id) ?? [],
    });
  }
  return { pessoas, comToken };
}

async function enviarEmail(chave: string, para: string, m: { assunto: string; html: string; text: string }, sairUrl: string): Promise<string | null> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${chave}` },
      body: JSON.stringify({
        from: FROM,
        to: [para],
        subject: m.assunto,
        html: m.html,
        text: m.text,
        headers: {
          "List-Unsubscribe": `<${sairUrl}>, <mailto:contato@mentorque.com.br?subject=Sair>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      }),
    });
    if (res.ok) return null;
    return `${res.status} ${await res.text().catch(() => "")}`.slice(0, 300);
  } catch (err) {
    return String(err).slice(0, 300);
  }
}

const mascara = (email: string) => {
  const [u, d] = email.split("@");
  return `${u.slice(0, 2)}…@${d ?? ""}`;
};

export async function GET(req: Request) {
  if (!autorizado(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: "banco_nao_configurado" }, { status: 501 });

  const url = new URL(req.url);
  const ensaioForcado = url.searchParams.get("ensaio") === "1";
  const ativa = process.env.JORNADA_ATIVA === "sim" && !ensaioForcado;
  const limite = Math.min(40, Math.max(1, Number(url.searchParams.get("limite") ?? 40) || 40));
  const chaveResend = process.env.RESEND_API_KEY ?? null;
  const hoje = hojeEmBrasilia();

  let pessoas: PessoaDaJornada[];
  let comToken: Set<string>;
  try {
    ({ pessoas, comToken } = await carregarPessoas(admin, hoje));
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err).slice(0, 200) }, { status: 502 });
  }

  const candidatos: { userId: string; email: string; chave: string; familia: string; motivo: string; assunto: string; push: boolean }[] = [];
  const erros: { userId: string; chave: string; erro: string }[] = [];
  const escolhas: { p: PessoaDaJornada; e: Escolha }[] = [];
  for (const p of pessoas) {
    let e: Escolha | null = null;
    try {
      e = escolherEmail(p, hoje);
    } catch (err) {
      erros.push({ userId: p.userId, chave: "?", erro: `decisao: ${String(err).slice(0, 120)}` });
    }
    if (e) escolhas.push({ p, e });
  }

  let enviados = 0;
  let pushEnviados = 0;
  for (const { p, e } of escolhas.slice(0, limite)) {
    let mensagem;
    try {
      mensagem = montarMensagem(e, p, hoje);
    } catch (err) {
      erros.push({ userId: p.userId, chave: e.chave, erro: `texto: ${String(err).slice(0, 120)}` });
      continue;
    }
    candidatos.push({ userId: p.userId, email: mascara(p.email), chave: e.chave, familia: e.familia, motivo: e.motivo, assunto: mensagem.assunto, push: comToken.has(p.userId) });
    if (!ativa) continue;

    if (!chaveResend) {
      erros.push({ userId: p.userId, chave: e.chave, erro: "resend_nao_configurado" });
      break;
    }
    const sairUrl = linkDeSaida(p.userId);
    if (!sairUrl) {
      erros.push({ userId: p.userId, chave: e.chave, erro: "sem_segredo_para_o_link_de_sair" });
      break;
    }
    const canais: string[] = [];
    const erroEmail = await enviarEmail(chaveResend, p.email, renderEmail(mensagem, sairUrl), sairUrl);
    if (erroEmail) erros.push({ userId: p.userId, chave: e.chave, erro: `email: ${erroEmail}` });
    else { enviados++; canais.push("email"); }

    if (comToken.has(p.userId)) {
      try {
        const r = await enviarPush(admin, { userId: p.userId }, mensagem.push);
        if (r.enviados > 0) { pushEnviados += r.enviados; canais.push("push"); }
      } catch (err) {
        erros.push({ userId: p.userId, chave: e.chave, erro: `push: ${String(err).slice(0, 120)}` });
      }
    }

    if (canais.length) {
      const { error } = await admin.from("jornada_envios").insert({ user_id: p.userId, chave: e.chave, dia: hoje, canais });
      if (error) erros.push({ userId: p.userId, chave: e.chave, erro: `registro: ${error.message.slice(0, 120)}` });
    }
    await new Promise((r) => setTimeout(r, PAUSA_MS));
  }

  return NextResponse.json({
    ok: true,
    hoje,
    modo: ativa ? "envio" : "ensaio",
    contas: pessoas.length,
    escolhidos: escolhas.length,
    limite,
    enviados,
    pushEnviados,
    push: pushConfigurado(),
    candidatos,
    erros,
  });
}

// Uma cópia de prova para um endereço, com uma pessoa de exemplo. Não toca em
// conta nenhuma nem grava envio. É o primeiro passo do roteiro: imagem
// quebrada e texto torto não têm conserto depois de enviados.
//
//   POST { "teste": "voce@exemplo.com", "chave": "d2", "comCarro": true }
export async function POST(req: Request) {
  if (!chaveDadosOk(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const chaveResend = process.env.RESEND_API_KEY;
  if (!chaveResend) return NextResponse.json({ ok: false, error: "resend_nao_configurado" }, { status: 501 });
  const body = await req.json().catch(() => ({}));
  const para = typeof body?.teste === "string" && body.teste.includes("@") ? body.teste.trim() : "";
  const chave = typeof body?.chave === "string" ? body.chave : "";
  if (!para || !chave) return NextResponse.json({ ok: false, error: "diga_teste_e_chave" }, { status: 400 });

  const hoje = hojeEmBrasilia();
  const comCarro = body?.comCarro !== false;
  const carro: Vehicle = { id: "v1", type: "car", make: "Volkswagen", model: "Gol", year: 2016, engine: "1.0", odometerKm: 84300, kmUpdatedAt: "2026-07-10T12:00:00Z", purchaseDate: "2024-03-10", createdAt: "2026-09-05T12:00:00Z" };
  const servico: ServiceRecord = { id: "s1", vehicleId: "v1", type: "oil", date: hoje, km: 84300, total: 280, parts: [] };
  const pessoa: PessoaDaJornada = {
    userId: "00000000-0000-0000-0000-000000000000",
    email: para,
    nome: "Rodrigo",
    contaCriadaEm: hoje,
    veiculos: comCarro ? [carro] : [],
    carroPrincipalId: comCarro ? "v1" : null,
    servicos: comCarro && chave.startsWith("preco") ? [servico] : [],
    quizRespostas: 0,
    ultimaAtividade: null,
    temManual: true,
    uf: "SP",
    cidade: "Campinas",
    saiu: false,
    envios: [],
  };
  const [familia, item] = chave.split(":");
  const escolha: Escolha = {
    chave: familia === "preco" ? "preco:s1" : chave,
    familia: /^d\d+$/.test(chave) ? "cadencia" : familia === "sazonal" ? "sazonal" : "gatilho",
    motivo: "cópia de prova",
    carro: comCarro ? carro : null,
    item: familia === "vencida" || familia === "chegando" ? item : undefined,
    servico: familia === "preco" ? servico : undefined,
  };
  let mensagem;
  try {
    mensagem = montarMensagem(escolha, pessoa, hoje);
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err).slice(0, 200) }, { status: 400 });
  }
  const sairUrl = linkDeSaida(pessoa.userId) ?? "https://www.mentorque.com.br";
  const erro = await enviarEmail(chaveResend, para, renderEmail(mensagem, sairUrl), sairUrl);
  return NextResponse.json(erro ? { ok: false, erro } : { ok: true, teste: para, chave: escolha.chave, assunto: mensagem.assunto, push: mensagem.push });
}
