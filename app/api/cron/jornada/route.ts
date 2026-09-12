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
//   1. O FREIO. Nasceu em ensaio por padrão (JORNADA_ATIVA=sim para enviar);
//      em 12/09 o dono mandou "faça tudo que precisa e deixe funcionando", e
//      o padrão virou ENVIAR, com JORNADA_PAUSADA=sim na Vercel como freio.
//      `?ensaio=1` força o ensaio numa chamada: decide para todo mundo e não
//      manda nada, devolve a lista do que mandaria.
//      O que substitui a cópia de prova antes do disparo, já que ninguém
//      conseguiu mandá-la daqui: na primeira vez que cada e-mail sai para
//      alguém, o dono recebe a mesma cópia, na mesma manhã, e todo dia com
//      envio recebe o resumo do que saiu (para quem, qual chave, qual
//      assunto). O endereço é o FEEDBACK_TO, o mesmo do resumo da Biela.
//   2. A CHAVE DO CRON. A Vercel manda `Authorization: Bearer $CRON_SECRET`;
//      sem ela, ou com a DADOS_CHAVE para uma rodada manual, nada roda.
//   3. A TRAVA NO BANCO. jornada_envios tem índice único (user_id, dia): duas
//      rodadas no mesmo dia não mandam duas vezes, e a decisão lê os envios
//      antes de escolher.
//
// O que fica de fora, de propósito: conta sem e-mail; os endereços do "ocultar
// meu e-mail" da Apple (privaterelay.appleid.com) enquanto o domínio não
// estiver cadastrado no relay dela (JORNADA_APPLE_RELAY=sim libera), porque
// e-mail para eles VOLTA e devolução suja o domínio; e qualquer regra de
// oferta ou preço (não existe nenhuma aqui, e não entra sem o dono).

const FROM = process.env.JORNADA_FROM ?? process.env.WAITLIST_FROM ?? "Mentorque <contato@mentorque.com.br>";
const DONO = process.env.FEEDBACK_TO ?? "contato@mentorque.com.br";
const APPLE_RELAY = "@privaterelay.appleid.com";
const PAUSA_MS = 600; // dois por segundo é o teto do Resend

function hojeEmBrasilia(agora = new Date()): string {
  return agora.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

// Quem pode chamar, e o que cada um vê.
//
// A Vercel manda `Authorization: Bearer $CRON_SECRET` QUANDO a variável
// existe. Sem ela, a chamada do cron chega sem cabeçalho nenhum, e uma porta
// que exigisse a chave rejeitaria o próprio cron: a jornada ficaria muda
// para sempre sem ninguém saber. Por isso, sem CRON_SECRET, a chamada do cron
// da Vercel (agente `vercel-cron`) passa, como no resumo da Biela. Repetir a
// chamada não manda nada dobrado: a decisão lê os envios e o banco tem o
// índice único. O que fica só para quem tem chave é a LISTA (e-mail
// mascarado, carro no assunto); sem chave a resposta traz só os números.
function quemChama(req: Request): "chave" | "cron" | "ninguem" {
  if (chaveDadosOk(req)) return "chave";
  const segredo = process.env.CRON_SECRET;
  if (segredo) return req.headers.get("authorization") === `Bearer ${segredo}` ? "cron" : "ninguem";
  return /vercel-cron/i.test(req.headers.get("user-agent") ?? "") ? "cron" : "ninguem";
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

// Marca e modelo bastam, e o ano fica de fora de propósito: a tabela guarda
// um ano por manual (Gol 2015, 2018, 2021, 2024), e a Biela responde para um
// Gol 2016 com o manual mais próximo. Exigir o ano exato aqui diria "sem
// manual" para quase todo mundo que tem.
function temManualPara(manuais: Manual[], v: Vehicle | null): boolean {
  if (!v) return false;
  const make = v.make.trim().toLowerCase();
  const model = v.model.trim().toLowerCase();
  return manuais.some((m) => {
    const mm = m.model.trim().toLowerCase();
    return m.make.trim().toLowerCase() === make && (model.startsWith(mm) || mm.startsWith(model));
  });
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
  const chamador = quemChama(req);
  if (chamador === "ninguem") return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: "banco_nao_configurado" }, { status: 501 });

  const url = new URL(req.url);
  const ensaioForcado = url.searchParams.get("ensaio") === "1";
  const pausada = process.env.JORNADA_PAUSADA === "sim";
  const ativa = !pausada && !ensaioForcado;
  const relayLiberado = process.env.JORNADA_APPLE_RELAY === "sim";
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
  // Chaves que já saíram para alguém antes de hoje: a primeira vez de cada
  // uma rende uma cópia para o dono.
  const chavesJaVistas = new Set<string>();
  for (const p of pessoas) for (const env of p.envios) if (env.dia < hoje) chavesJaVistas.add(env.chave);
  const copiasParaODono: { chave: string; assunto: string; html: string; text: string }[] = [];
  let puladosAppleRelay = 0;
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
    if (!relayLiberado && p.email.toLowerCase().endsWith(APPLE_RELAY)) {
      puladosAppleRelay++;
      continue;
    }

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
    const pronto = renderEmail(mensagem, sairUrl);
    const erroEmail = await enviarEmail(chaveResend, p.email, pronto, sairUrl);
    if (erroEmail) erros.push({ userId: p.userId, chave: e.chave, erro: `email: ${erroEmail}` });
    else {
      enviados++;
      canais.push("email");
      if (!chavesJaVistas.has(e.chave) && !copiasParaODono.some((c) => c.chave === e.chave)) {
        copiasParaODono.push({ chave: e.chave, assunto: pronto.assunto, html: pronto.html, text: pronto.text });
      }
    }

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

  // O dono vê o que saiu: uma cópia de cada e-mail que saiu pela primeira vez
  // e o resumo do dia. Só em modo envio e só quando aconteceu alguma coisa.
  let copiasEnviadas = 0;
  let resumoEnviado = false;
  if (ativa && chaveResend && (enviados > 0 || erros.length > 0)) {
    for (const c of copiasParaODono) {
      const erro = await enviarEmail(chaveResend, DONO, { assunto: `[cópia da jornada: ${c.chave}] ${c.assunto}`, html: c.html, text: c.text }, "https://www.mentorque.com.br");
      if (!erro) copiasEnviadas++;
      await new Promise((r) => setTimeout(r, PAUSA_MS));
    }
    const linhas = candidatos.map((c) => `<li>${c.email} · <b>${c.chave}</b> · ${c.assunto}${c.push ? " · push" : ""}</li>`).join("");
    const linhasDeErro = erros.map((x) => `<li>${x.chave}: ${x.erro}</li>`).join("");
    const resumoHtml = `<p>Jornada de ${hoje}: <b>${enviados}</b> e-mail(s) enviado(s), ${pushEnviados} push, ${puladosAppleRelay} pulado(s) por e-mail oculto da Apple, ${erros.length} erro(s).</p><ul>${linhas}</ul>${linhasDeErro ? `<p>Erros:</p><ul>${linhasDeErro}</ul>` : ""}<p>Para pausar: JORNADA_PAUSADA=sim na Vercel. Manual em docs/jornada.md.</p>`;
    const resumoText = `Jornada de ${hoje}: ${enviados} e-mail(s), ${pushEnviados} push, ${puladosAppleRelay} pulado(s) por e-mail oculto da Apple, ${erros.length} erro(s).\n` + candidatos.map((c) => `- ${c.email} · ${c.chave} · ${c.assunto}`).join("\n");
    const erro = await enviarEmail(chaveResend, DONO, { assunto: `Jornada de hoje: ${enviados} e-mail(s), ${erros.length} erro(s)`, html: resumoHtml, text: resumoText }, "https://www.mentorque.com.br");
    resumoEnviado = !erro;
  }

  return NextResponse.json({
    ok: true,
    hoje,
    modo: ativa ? "envio" : "ensaio",
    puladosAppleRelay,
    copiasParaODono: copiasEnviadas,
    resumoParaODono: resumoEnviado,
    contas: pessoas.length,
    escolhidos: escolhas.length,
    limite,
    enviados,
    pushEnviados,
    push: pushConfigurado(),
    candidatos: chamador === "chave" ? candidatos : candidatos.length,
    erros: chamador === "chave" ? erros : erros.length,
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
