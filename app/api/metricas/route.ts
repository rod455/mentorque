import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { chaveDadosOk, negada } from "@/lib/chaveDados";
import { leParceiros, montaPacote } from "@/lib/appsflyer";
import { leInstalacoes } from "@/lib/playRelatorios";

export const runtime = "nodejs";
// Teto de duracao: funcao pendurada segura memoria provisionada (e cota).
export const maxDuration = 10;

// Métricas diárias das fontes externas (tabela public.metricas_diarias).
//
// POST: recebe do Analista de Dados (n8n) o pacote de UMA fonte para UM dia
// e grava por cima se já existir (chave dia + fonte). A rota é pública como
// as irmãs, então valida fonte, formato do dia e tamanho do pacote; o pior
// que um curioso consegue é sujar uma métrica interna de um dia.
//
// GET: os últimos 30 dias agrupados por fonte, para o /api/dados e para
// conferência manual.
const FONTES = new Set([
  "search_console", "stripe", "youtube", "meta_ads", "google_ads",
  "revenuecat", "vercel", "admob", "app_store_connect", "play_console",
  // Downloads reais das lojas (relatório de vendas da Apple exclui
  // TestFlight; o do Play virá do export no Cloud Storage).
  "app_store_downloads", "play_downloads",
  // Instalação por FONTE DE MÍDIA (AppsFlyer, Pull API, 03/10/2026). É a única
  // fonte da casa que diz QUEM trouxe a instalação: o painel do Google e o da
  // Meta contam cada um a sua, e o Play Console não divide anunciante (a
  // dimensão de origem dele tem duas linhas: pagas-e-diretas e não-atribuído).
  "appsflyer",
]);
const MAX_DADOS = 20000; // bytes de JSON por pacote

// Dia local do Brasil, para a linha de "hoje" bater com o dia do Rodrigo.
const diaBrasil = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());

export async function POST(req: Request) {
  if (!chaveDadosOk(req)) return negada();
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  let b: Record<string, unknown> | undefined;
  try { b = (await req.json()) as Record<string, unknown>; } catch { /* abaixo */ }

  const fonte = typeof b?.fonte === "string" && FONTES.has(b.fonte) ? b.fonte : null;
  const dia = typeof b?.dia === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.dia) ? b.dia : diaBrasil();
  const dados = b?.dados && typeof b.dados === "object" && !Array.isArray(b.dados)
    ? (b.dados as Record<string, unknown>)
    : null;

  if (!fonte || !dados) return NextResponse.json({ error: "pacote_invalido" }, { status: 400 });

  // A APPSFLYER CHEGA COMO CSV CRU, E A LEITURA ACONTECE AQUI (03/10/2026).
  //
  // POR QUE ASSIM, e não com um nó de código no n8n como as outras fontes: a
  // leitura do relatório de parceiros é a parte que quebra calada (vírgula
  // dentro de campo desloca as colunas, `N/A` virando zero transforma "não sei"
  // em "foi de graça", e texto de erro da API lido como tabela vazia vira
  // "zero instalação"). Nó de código do n8n não é conferido por nada; aqui a
  // `conferir:midia` planta defeito em cima de cada um desses casos.
  //
  // E POR QUE NA MESMA PORTA, e não numa rota própria: o nó do n8n que grava
  // métrica já carrega a chave desta casa. Uma rota separada significaria uma
  // segunda cópia da mesma chave num segundo lugar, e chave copiada é chave que
  // um dia gira pela metade.
  let pacote: Record<string, unknown> = dados;
  if (fonte === "appsflyer") {
    const texto = (v: unknown) => (typeof v === "string" ? v : null);
    const android = leParceiros(texto(dados.csvAndroid));
    const ios = leParceiros(texto(dados.csvIos));
    // OS DOIS ILEGÍVEIS É RECUSA, e não pacote vazio: gravar zero quando o
    // token venceu faria a operação ler queda de campanha onde houve queda de
    // coleta. É o quarto jeito de inventar número que esta casa já pagou.
    if (!android && !ios) {
      return NextResponse.json({ error: "appsflyer_ilegivel" }, { status: 400 });
    }
    const janela = {
      de: typeof dados.de === "string" ? dados.de : "",
      ate: typeof dados.ate === "string" ? dados.ate : dia,
    };
    pacote = montaPacote(janela, android, ios) as unknown as Record<string, unknown>;
  }

  // O RELATÓRIO DE INSTALAÇÕES DO PLAY, PELO MESMO DESENHO (03/10/2026).
  //
  // O n8n baixa o CSV mensal do bucket do Cloud Storage e entrega cru; a
  // leitura acontece aqui, onde a `conferir:aquisicao` planta defeito em cima
  // dela. O formato tem duas armadilhas que quebram caladas (o arquivo é UTF-16
  // e o cabeçalho vem no idioma da conta), e a regra é a mesma do resto: o que
  // eu não reconheço NÃO vira zero, vira `formatoDesconhecido` com o cabeçalho
  // que chegou, para a próxima rodada ter o que ler.
  if (fonte === "play_downloads") {
    const csv = typeof dados.csv === "string" ? dados.csv : null;
    const lido = leInstalacoes(csv);
    pacote = lido.ok
      ? { ok: true, instalacoes: lido.total, de: lido.de, ate: lido.ate, dias: lido.dias,
          arquivo: typeof dados.arquivo === "string" ? dados.arquivo : null }
      : { ok: false,
          // O MOTIVO DE QUEM FALHOU PRIMEIRO GANHA (03/10/2026). Na primeira
          // execução o coletor gravou `naoLi: "arquivo vazio"` quando a causa
          // real era `Credentials not found` na listagem do bucket: o erro
          // estava no pacote e a rota não o publicava, então o relato final
          // dizia o sintoma e escondia a causa. Erro de listagem manda.
          naoLi: typeof dados.erroDaListagem === "string" && dados.erroDaListagem
            ? `a listagem do bucket falhou: ${dados.erroDaListagem}`
            : lido.formatoDesconhecido,
          cabecalho: lido.cabecalho,
          arquivo: typeof dados.arquivo === "string" ? dados.arquivo : null,
          arquivos: Array.isArray(dados.arquivos) ? dados.arquivos.slice(0, 40) : undefined };
  }

  if (JSON.stringify(pacote).length > MAX_DADOS) {
    return NextResponse.json({ error: "pacote_grande" }, { status: 413 });
  }

  const { error } = await admin
    .from("metricas_diarias")
    .upsert({ dia, fonte, dados: pacote, coletado_em: new Date().toISOString() }, { onConflict: "dia,fonte" });
  if (error) return NextResponse.json({ error: "gravacao_falhou" }, { status: 500 });
  return NextResponse.json({ ok: true, dia, fonte });
}

export async function GET(req: Request) {
  if (!chaveDadosOk(req)) return negada();
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  const d30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const { data } = await admin
    .from("metricas_diarias")
    .select("dia, fonte, dados, coletado_em")
    .gte("dia", d30)
    .order("dia", { ascending: false })
    .limit(400);

  const fontes: Record<string, { dia: string; dados: unknown }[]> = {};
  for (const l of data ?? []) {
    (fontes[l.fonte] ??= []).push({ dia: l.dia, dados: l.dados });
  }
  return NextResponse.json({ fontes });
}
