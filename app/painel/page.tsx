import type { Metadata } from "next";
import { coletarDadosOperacao, resumoAvaliacoes } from "@/lib/operacao";

// O painel da operação: os mesmos números que alimentam os agentes, na tela,
// atualizados a cada visita. Portão pela chave dos dados (?chave=...), e a
// página é montada no servidor, então a chave nunca aparece no JavaScript.
export const metadata: Metadata = {
  title: "Painel Mentorque",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const nf = new Intl.NumberFormat("pt-BR");
const reais = (centavos: number) => `R$ ${(centavos / 100).toFixed(2).replace(".", ",")}`;

function diasSP(qtd: number): string[] {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" });
  return Array.from({ length: qtd }, (_, i) => f.format(new Date(Date.now() - (qtd - 1 - i) * 86400000)));
}
const ddmm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

type Ponto = { rotulo: string; valor: number };

// Barras de uma série só (âmbar validado sobre o grafite): finas, topo
// arredondado ancorado na base, vão de 2px, último ponto com rótulo direto e
// tooltip nativo em cada barra. A tabela de dados vive num <details> ao lado.
function Barras({ serie, unidade, cor = "#C8841F" }: { serie: Ponto[]; unidade: string; cor?: string }) {
  if (serie.length === 0) return <p className="text-sm text-cream/50">Sem dados ainda.</p>;
  const A = 120, LARG = 560, base = A - 18;
  const max = Math.max(...serie.map((p) => p.valor), 1);
  const passo = LARG / serie.length;
  const larguraBarra = Math.min(28, Math.max(6, passo - 4));
  return (
    <div>
      <svg viewBox={`0 0 ${LARG} ${A}`} className="w-full" role="img" aria-label={`Série diária de ${unidade}`}>
        <line x1="0" y1={base} x2={LARG} y2={base} stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" />
        {serie.map((p, i) => {
          const h = p.valor === 0 ? 0 : Math.max(3, (p.valor / max) * (base - 16));
          const x = i * passo + (passo - larguraBarra) / 2;
          const ultimo = i === serie.length - 1;
          return (
            <g key={p.rotulo}>
              <rect x={x} y={base - h} width={larguraBarra} height={h || 0.5} rx="3" fill={cor} fillOpacity={p.valor === 0 ? 0.18 : 1}>
                <title>{`${p.rotulo}: ${nf.format(p.valor)} ${unidade}`}</title>
              </rect>
              {ultimo && p.valor > 0 && (
                <text x={x + larguraBarra / 2} y={base - h - 5} textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.9" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {nf.format(p.valor)}
                </text>
              )}
              {(i === 0 || ultimo || i === Math.floor(serie.length / 2)) && (
                <text x={x + larguraBarra / 2} y={A - 4} textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.45">
                  {p.rotulo}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <details className="mt-1 text-xs text-cream/50">
        <summary className="cursor-pointer select-none">ver tabela</summary>
        <table className="mt-2 w-full text-left text-cream/80">
          <tbody>
            {serie.map((p) => (
              <tr key={p.rotulo} className="border-t border-white/5">
                <td className="py-0.5 pr-4">{p.rotulo}</td>
                <td className="py-0.5 tabular-nums">{nf.format(p.valor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

function Tile({ rotulo, valor, nota }: { rotulo: string; valor: string; nota?: string }) {
  return (
    <div className="rounded-2xl bg-graphite-800 p-4 ring-1 ring-white/10">
      <p className="text-[11px] font-medium uppercase tracking-wide text-cream/50">{rotulo}</p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-cream">{valor}</p>
      {nota && <p className="mt-0.5 text-[11px] text-cream/45">{nota}</p>}
    </div>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-amber">{titulo}</h2>
      <div className="mt-3 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function CartaoGrafico({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-graphite-800 p-4 ring-1 ring-white/10">
      <h3 className="mb-2 text-sm font-medium text-cream/80">{titulo}</h3>
      {children}
    </div>
  );
}

export default async function Painel({ searchParams }: { searchParams: { chave?: string } }) {
  const esperada = process.env.DADOS_CHAVE;
  if (!esperada || searchParams.chave !== esperada) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-graphite p-6 text-cream">
        <div className="max-w-sm rounded-2xl bg-graphite-800 p-8 text-center ring-1 ring-white/10">
          <p className="font-display text-lg font-semibold">Acesso restrito</p>
          <p className="mt-2 text-sm text-cream/60">
            Este painel é interno. Abra pelo endereço com a chave de acesso
            {!esperada && " (a variável DADOS_CHAVE ainda não está configurada no ambiente)"}.
          </p>
        </div>
      </main>
    );
  }

  const [dados, avals] = await Promise.all([coletarDadosOperacao(), resumoAvaliacoes()]);
  if (!dados) {
    return <main className="min-h-screen bg-graphite p-8 text-cream">Banco não configurado.</main>;
  }

  const fx = dados.fontesExternas;
  const ultimo = (f: string) => (fx[f]?.[0]?.dados ?? {}) as Record<string, any>;
  const sc = ultimo("search_console");
  const meta = ultimo("meta_ads");
  const gads = ultimo("google_ads");
  const yt = ultimo("youtube");
  const rc = ultimo("revenuecat");
  const st = ultimo("stripe");
  const admob = ultimo("admob");
  const asc = ultimo("app_store_connect");
  const downloads = ultimo("app_store_downloads");

  const dias = diasSP(14);
  const usoPorDia = new Map((dados.uso.porDia as any[]).map((u) => [u.dia, u.usuarios ?? 0]));
  const serieUsuarios: Ponto[] = dias.map((d) => ({ rotulo: ddmm(d), valor: Number(usoPorDia.get(d) ?? 0) }));
  const serieCadastros: Ponto[] = dias.map((d) => ({ rotulo: ddmm(d), valor: dados.cadastrosPorDia[d] ?? 0 }));
  const serieAdmob: Ponto[] = ((admob.porDia as any[]) ?? []).map((p) => ({ rotulo: ddmm(String(p.dia)), valor: Math.round(Number(p.ganhos ?? 0) * 100) / 100 }));

  const ontem = dias[dias.length - 2];
  const s0 = (dados.funilSemanas as any[])[0] ?? {};
  const s1 = (dados.funilSemanas as any[])[1] ?? {};
  const gastoMidia = Number(meta.gasto7d ?? 0) + Number(gads.custo7d ?? 0);
  const mrrCent = Number(st.mrrCentavos ?? 0);
  const versaoIos = (asc.versoes as any[])?.[0];

  const geradoEm = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" }).format(new Date());

  return (
    <main className="min-h-screen bg-graphite px-4 py-8 text-cream">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="font-display text-2xl font-bold">Painel da operação</h1>
          <p className="text-xs text-cream/50">atualizado em {geradoEm} · recarregue para atualizar</p>
        </header>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Tile rotulo="Usuários ontem" valor={nf.format(Number(usoPorDia.get(ontem) ?? 0))} nota="pessoas distintas (web por ora)" />
          <Tile rotulo="Cadastros ontem" valor={nf.format(dados.cadastrosPorDia[ontem] ?? 0)} />
          <Tile rotulo="Assinaturas ativas" valor={nf.format(dados.assinaturas.ativas)} nota={`${dados.assinaturas.anuais} anuais, ${dados.assinaturas.mensais} mensais`} />
          <Tile rotulo="MRR (Stripe)" valor={reais(mrrCent)} />
          <Tile rotulo="Anúncios 7d" valor={`US$ ${Number(admob.ganhos7d ?? 0).toFixed(2)}`} nota="AdMob" />
          <Tile rotulo="iOS na Apple" valor={versaoIos ? String(versaoIos.versao) : "?"} nota={versaoIos ? String(versaoIos.estado).replaceAll("_", " ").toLowerCase() : "sem dado"} />
        </div>

        <Bloco titulo="Marketing · gente chegando">
          <CartaoGrafico titulo="Cadastros por dia (14 dias)">
            <Barras serie={serieCadastros} unidade="cadastros" />
          </CartaoGrafico>
          <div className="rounded-2xl bg-graphite-800 p-4 ring-1 ring-white/10 text-sm">
            <h3 className="mb-2 font-medium text-cream/80">Origem dos cadastros (28 dias)</h3>
            {(dados.marketing.cadastrosPorCampanha as any[]).length === 0 ? (
              <p className="text-cream/50">Nenhum cadastro no período ainda.</p>
            ) : (
              <table className="w-full text-left">
                <tbody>
                  {(dados.marketing.cadastrosPorCampanha as any[]).slice(0, 8).map((c) => (
                    <tr key={`${c.origem}-${c.campanha}`} className="border-t border-white/5">
                      <td className="py-1 pr-2 text-cream/80">{c.origem} · {c.campanha}</td>
                      <td className="py-1 text-right tabular-nums">{nf.format(c.cadastros_28d)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="mt-3 text-xs text-cream/50">
              Mídia 7d: {gastoMidia > 0 ? `R$ ${gastoMidia.toFixed(2)}` : "sem gasto (orgânico)"} ·
              Busca 28d: {nf.format(Number(sc.cliques28d ?? 0))} cliques, {nf.format(Number(sc.impressoes28d ?? 0))} impressões ·
              YouTube: {nf.format(Number(yt.viewsTotais ?? 0))} views
            </p>
            <p className="mt-1 text-xs text-cream/50">
              Downloads App Store (loja, sem TestFlight): {downloads.downloadsApp != null ? nf.format(Number(downloads.downloadsApp)) : "sem coleta"}{downloads.dia ? ` em ${ddmm(String(downloads.dia))}` : ""}
            </p>
          </div>
        </Bloco>

        <Bloco titulo="Engajamento · gente voltando">
          <CartaoGrafico titulo="Usuários ativos por dia (14 dias)">
            <Barras serie={serieUsuarios} unidade="usuários" />
          </CartaoGrafico>
          <div className="rounded-2xl bg-graphite-800 p-4 ring-1 ring-white/10 text-sm">
            <h3 className="mb-2 font-medium text-cream/80">Retenção e ativação por coorte</h3>
            {(dados.uso.coortes as any[]).length === 0 ? (
              <p className="text-cream/50">Série nasceu em 23/08; as primeiras coortes aparecem aqui.</p>
            ) : (
              <table className="w-full text-left">
                <thead className="text-xs uppercase tracking-wide text-cream/45">
                  <tr><th className="py-1 font-medium">Coorte</th><th className="font-medium">Cadastros</th><th className="font-medium">Voltaram 1 a 7d</th><th className="font-medium">8 a 30d</th></tr>
                </thead>
                <tbody>
                  {(dados.uso.coortes as any[]).slice(0, 6).map((c) => (
                    <tr key={c.coorte} className="border-t border-white/5 tabular-nums">
                      <td className="py-1">{ddmm(String(c.coorte))}</td><td>{c.cadastrados}</td><td>{c.voltaram_d1_7}</td><td>{c.voltaram_d8_30}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="mt-3 text-xs text-cream/50">
              Erros no app (7d): {nf.format(dados.erros7d.total)}{dados.erros7d.top[0] ? ` · mais comum: ${dados.erros7d.top[0].total}x ${dados.erros7d.top[0].mensagem.slice(0, 60)}` : ""}
            </p>
            <p className="mt-1 text-xs text-cream/50">
              Avaliações nas lojas: {avals ? `${nf.format(avals.total)}${avals.media ? ` (média ${avals.media})` : ""}` : "sem coleta"}
            </p>
          </div>
        </Bloco>

        <Bloco titulo="Vendas · gente pagando">
          <div className="rounded-2xl bg-graphite-800 p-4 ring-1 ring-white/10 text-sm">
            <h3 className="mb-2 font-medium text-cream/80">Fundo do funil (semana corrente vs anterior)</h3>
            <table className="w-full text-left tabular-nums">
              <thead className="text-xs uppercase tracking-wide text-cream/45">
                <tr><th className="py-1 font-medium">Etapa</th><th className="font-medium">Corrente</th><th className="font-medium">Anterior</th></tr>
              </thead>
              <tbody>
                {[
                  ["Viram paywall", s0.viram_paywall, s1.viram_paywall],
                  ["Iniciaram checkout", s0.iniciaram_checkout, s1.iniciaram_checkout],
                  ["Assinaram", s0.assinaturas, s1.assinaturas],
                  ["Cancelaram", s0.cancelamentos, s1.cancelamentos],
                ].map(([r, a, b]) => (
                  <tr key={String(r)} className="border-t border-white/5">
                    <td className="py-1 text-cream/80">{r}</td><td>{Number(a ?? 0)}</td><td>{Number(b ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-cream/50">
              RevenueCat: {nf.format(Number(rc.active_subscriptions ?? 0))} assinaturas, MRR US$ {Number(rc.mrr ?? 0).toFixed(2)} · Stripe 30d: {reais(Number(st.receita30dCentavos ?? 0))}
            </p>
            {(dados.vendas.assinaturasCoortes as any[]).slice(0, 4).map((v) => (
              <p key={v.coorte} className="mt-1 text-xs text-cream/50">
                Coorte {ddmm(String(v.coorte))}: {v.assinaram} assinaram, {v.renovaram} renovaram, {v.sairam} saíram
              </p>
            ))}
          </div>
          <CartaoGrafico titulo="Receita de anúncio por dia (AdMob, US$)">
            <Barras serie={serieAdmob} unidade="US$" cor="#57A87A" />
          </CartaoGrafico>
        </Bloco>

        <section className="mt-8">
          <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-amber">Fontes · frescor da coleta</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(fx).map(([nome, serie]) => {
              const topo = serie[0] as any;
              const comErro = topo?.dados && (topo.dados as any).erro;
              return (
                <span key={nome} className={`rounded-full px-3 py-1 text-xs ring-1 ${comErro ? "bg-coral/15 text-cream/80 ring-coral/40" : "bg-graphite-800 text-cream/70 ring-white/10"}`}>
                  {comErro ? "✕" : "✓"} {nome} · {topo?.dia ? ddmm(String(topo.dia)) : "?"}
                </span>
              );
            })}
            {Object.keys(fx).length === 0 && <p className="text-sm text-cream/50">Coleta de fontes externas desligada.</p>}
          </div>
          <p className="mt-4 text-xs text-cream/40">
            Definições e método de leitura: docs/agentes/skills/analise-da-operacao.md. Usuários do RevenueCat contam aparelhos (incluem testes); gente real é o funil e o banco.
          </p>
        </section>
      </div>
    </main>
  );
}
