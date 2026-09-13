"use client";

import { useRef, useState } from "react";
import { anonId } from "@/lib/app/anon";
import { apiPost } from "@/lib/app/apiBase";
import { APP_VERSION, formatBRL, vehicleLabel } from "@/lib/app/content";
import { useI18n } from "@/lib/i18n";
import { funil } from "@/lib/app/funil";
import { resizeImage } from "@/lib/app/image";
import { useNav } from "@/lib/app/nav";
import { LIMITS } from "@/lib/app/premium";
import { activeVehicle, usePrototype } from "@/lib/app/store";
import { isNativeApp, nativePlatform } from "@/lib/app/wrapper";
import { notasParaHistorico, servicoPrincipal, type Analise } from "@/lib/orcamento/analise";
import { getBrowserSupabase } from "@/lib/supabaseBrowser";
import { Button } from "@/components/ui/Button";
import { AppHeader, Card, UpgradeBanner, useContent } from "../ui";

// A análise de orçamento por foto (aprovada pelo dono em 13/09/2026).
//
// A pessoa tira a foto, o servidor (app/api/orcamento) pede ao modelo que
// leia linha a linha e devolva JSON, e esta tela mostra: o que o orçamento
// faz, cada item explicado, a faixa da região quando há referência, e as
// perguntas para a oficina. Nunca "está sendo enganado". O limite do
// gratuito (2 por mês) é contado no servidor; aqui só se mostra o que sobrou.
// A foto vai reduzida (1600 px) e não é guardada em lugar nenhum.

type Estado = "escolher" | "analisando" | "resultado" | "limite" | "falhou";

// `symptomId` chega pelo checklist e por ora só diz de onde a pessoa veio; o
// serviço do histórico sai do próprio orçamento (servicoPrincipal), que é
// mais preciso que a categoria do sintoma.
export function OrcamentoScreen({ origem }: { origem?: string; symptomId?: string }) {
  const c = useContent();
  const o = c.orcamento;
  const { s } = usePrototype();
  const { locale } = useI18n();
  const { go, back } = useNav();
  const v = activeVehicle(s);
  const inputRef = useRef<HTMLInputElement>(null);

  const [foto, setFoto] = useState<string | null>(null);
  const [estado, setEstado] = useState<Estado>("escolher");
  const [analise, setAnalise] = useState<Analise | null>(null);
  const [restantes, setRestantes] = useState<number | null>(null);
  const [detalhe, setDetalhe] = useState("");

  const escolher = async (file?: File) => {
    if (!file) return;
    try {
      // 1600 px e qualidade alta de propósito: letra miúda de orçamento some
      // com a compressão que serve para a foto do carro.
      setFoto(await resizeImage(file, 1600, 0.85));
      setAnalise(null);
      setEstado("escolher");
    } catch { /* arquivo estranho: fica como estava */ }
  };

  const analisar = async () => {
    if (!foto || estado === "analisando") return;
    setEstado("analisando");
    setDetalhe("");
    try {
      const sb = getBrowserSupabase();
      const token = sb ? (await sb.auth.getSession()).data.session?.access_token : undefined;
      const res = await apiPost(
        "/api/orcamento",
        {
          imagem: foto,
          locale,
          car: v ? { make: v.make, model: v.model, year: v.year, km: v.odometerKm, engine: v.engine } : null,
          anonId: anonId(),
          uf: s.state,
          cidade: s.city,
          plataforma: isNativeApp() ? nativePlatform() ?? "nativo" : "web",
          versao: APP_VERSION,
        },
        token ? { authorization: `Bearer ${token}` } : {},
      );
      if (res.status === 429) { setEstado("limite"); return; }
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok || !data.analise) {
        setDetalhe(typeof data?.detalhe === "string" ? data.detalhe : `${res.status}`);
        setEstado("falhou");
        return;
      }
      setAnalise(data.analise as Analise);
      setRestantes(typeof data.restantes === "number" ? data.restantes : null);
      setEstado("resultado");
      funil("analisou_orcamento", { origem: origem ?? "direto" });
    } catch (e) {
      setDetalhe(e instanceof Error ? e.message : String(e));
      setEstado("falhou");
    }
  };

  const salvar = () => {
    if (!analise) return;
    go({
      name: "addService",
      preset: {
        type: servicoPrincipal(analise) ?? "other",
        shop: analise.oficina ?? undefined,
        total: analise.total != null ? Math.round(analise.total) : undefined,
        notes: notasParaHistorico(analise) || undefined,
      },
    });
  };

  const perguntar = () => {
    if (!analise) return;
    go({ name: "biela", seed: `${o.bielaSeed} ${analise.resumo || analise.itens.map((i) => i.descricao).join(", ")}`.slice(0, 500) });
  };

  const outra = () => { setFoto(null); setAnalise(null); setEstado("escolher"); };

  return (
    <div>
      <AppHeader title={o.title} subtitle={v ? vehicleLabel(v) : undefined} />

      {estado !== "resultado" && (
        <>
          <p className="text-sm text-cream/60">{o.intro}</p>

          <button
            onClick={() => inputRef.current?.click()}
            className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-graphite-800 px-4 py-4 text-left ring-1 ring-white/10 hover:ring-amber/30"
          >
            <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-graphite-700 text-2xl text-cream/60">
              {foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={foto} alt="" className="h-full w-full object-cover" />
              ) : (
                "📷"
              )}
            </span>
            <span className="text-sm text-cream/85">{foto ? o.trocar : o.escolher}</span>
          </button>
          <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => escolher(e.target.files?.[0])} />

          {estado === "limite" ? (
            <Card className="mt-4 text-center">
              <p className="text-sm text-cream/85">{o.limite.replace("{n}", String(LIMITS.freeOrcamentosMes))}</p>
              <Button className="mt-3 w-full" onClick={() => go({ name: "subscribe", ctx: "orcamento" })}>{o.limiteCta}</Button>
            </Card>
          ) : (
            <Button size="lg" className="mt-4 w-full" disabled={!foto || estado === "analisando"} onClick={analisar}>
              {estado === "analisando" ? o.analisando : o.analisar}
            </Button>
          )}

          {estado === "falhou" && (
            <p className="mt-3 text-xs text-red-300/90">{o.falhou}{isNativeApp() && detalhe ? ` (${detalhe})` : ""}</p>
          )}
          {!s.premium && estado !== "limite" && (
            <p className="mt-3 text-xs text-cream/45">{o.gratisRestantes.replace("{n}", String(LIMITS.freeOrcamentosMes))}</p>
          )}
        </>
      )}

      {estado === "resultado" && analise && (
        <div className="space-y-4">
          {analise.ilegivel ? (
            <Card>
              <p className="text-sm text-cream/85">{o.ilegivel}</p>
            </Card>
          ) : (
            <>
              {analise.alerta && (
                <div className="rounded-2xl bg-red-500/10 p-4 ring-1 ring-red-400/30">
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-300">{o.alerta}</p>
                  <p className="mt-1 text-sm text-cream/90">{analise.alerta}</p>
                </div>
              )}

              {analise.resumo && (
                <Card>
                  <p className="text-xs font-semibold uppercase tracking-wide text-cream/45">{o.resumo}</p>
                  <p className="mt-1 text-sm text-cream/90">{analise.resumo}</p>
                  {(analise.total != null || analise.oficina) && (
                    <p className="mt-2 text-xs text-cream/55">
                      {analise.oficina ? `${o.oficina}: ${analise.oficina}` : ""}
                      {analise.oficina && analise.total != null ? " · " : ""}
                      {analise.total != null ? `${o.total}: ${formatBRL(analise.total)}` : ""}
                    </p>
                  )}
                </Card>
              )}

              {analise.itens.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cream/45">{o.itens}</p>
                  <div className="space-y-2">
                    {analise.itens.map((it, i) => (
                      <div key={`${it.descricao}-${i}`} className="rounded-xl bg-graphite-800 px-3.5 py-3 ring-1 ring-white/5">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-medium text-cream">{it.descricao}<span className="ml-2 text-[11px] font-normal text-cream/40">{o.tipo[it.tipo]}</span></p>
                          {it.valor != null && <p className="shrink-0 text-sm text-cream/85">{formatBRL(it.valor)}</p>}
                        </div>
                        {it.explicacao && <p className="mt-1 text-xs text-cream/65">{it.explicacao}</p>}
                        {it.faixa && it.posicao && (
                          <p className="mt-1 text-xs text-teal/90">
                            {(it.faixa.regiao ? o.faixa : o.faixaSemRegiao).replace("{min}", formatBRL(it.faixa.min)).replace("{max}", formatBRL(it.faixa.max))} · {o.posicao[it.posicao]}
                          </p>
                        )}
                        {it.atencao && <p className="mt-1 text-xs text-amber/90"><span className="font-semibold">{o.atencao}:</span> {it.atencao}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analise.perguntas.length > 0 && (
                <Card>
                  <p className="text-xs font-semibold uppercase tracking-wide text-cream/45">{o.perguntas}</p>
                  <ul className="mt-2 space-y-1.5">
                    {analise.perguntas.map((p) => (
                      <li key={p} className="flex gap-2 text-sm text-cream/85"><span className="text-amber">?</span><span>{p}</span></li>
                    ))}
                  </ul>
                </Card>
              )}

              <div className="space-y-2.5">
                {v && <Button size="lg" className="w-full" onClick={salvar}>{o.salvar}</Button>}
                <Button variant="secondary" className="w-full" onClick={perguntar}>{o.perguntarBiela}</Button>
              </div>
            </>
          )}

          <Button variant="ghost" className="w-full" onClick={outra}>{o.outra}</Button>
          {restantes != null && !s.premium && (
            <p className="text-center text-xs text-cream/45">
              {restantes > 0 ? o.gratisRestantes.replace("{n}", String(restantes)) : o.limite.replace("{n}", String(LIMITS.freeOrcamentosMes))}
            </p>
          )}
          {!s.premium && <UpgradeBanner ctx="orcamento" text={c.paywalls.orcamento.title} />}
        </div>
      )}

      <p className="mt-5 text-xs text-cream/40">{o.aviso}</p>
      {estado !== "resultado" && (
        <Button variant="ghost" className="mt-3 w-full" onClick={back}>{c.common.cancel}</Button>
      )}
    </div>
  );
}
