"use client";

import { useState } from "react";
import { datasDoCarro, estadoDaData, TIPOS_DE_DATA } from "@/lib/app/datasDoCarro";
import { finalDaPlaca, sugestaoDeData, ufsComCalendario, type Sugestao, type TipoComCalendario } from "@/lib/app/calendarioDaPlaca";
import { BR_STATES } from "@/lib/app/ufs";
import { formatBRL } from "@/lib/app/content";
import { usePrototype } from "@/lib/app/store";
import type { TipoDeData, Vehicle } from "@/lib/app/types";
import { Button } from "@/components/ui/Button";
import { Card, DateField, inputCls, Sheet, useContent } from "./ui";

// As datas do carro, no calendário de revisões (peça 2 da rotina do carro,
// 13/09/2026). Quatro linhas, cada uma com a data e "vence em n dias", ou
// "Informar". Tocar abre a folha com a data e o valor opcional. Onde entra e
// por quê: docs/agentes/propostas/rotina-do-carro.md.
//
// Pelo final da placa (13/09/2026, pedido do dono): para IPVA e
// licenciamento, a folha pede o estado e o final da placa uma vez e sugere a
// data pelo calendário do estado (lib/app/calendarioDaPlaca.ts). A pessoa
// confirma com um toque; a data estimada (calendário do ano ainda não
// publicado) fica marcada em tudo o que a mostra.

/** "vence em 12 dias", "vence hoje", "venceu há 3 dias". */
export function quandoVence(dias: number, t: { venceEm: string; venceAmanha: string; venceHoje: string; venceu: string }): string {
  const estado = estadoDaData(dias);
  if (estado === "vencida") return t.venceu.replace("{n}", String(-dias));
  if (estado === "hoje") return t.venceHoje;
  if (dias === 1) return t.venceAmanha;
  return t.venceEm.replace("{n}", String(dias));
}

const COM_CALENDARIO: TipoComCalendario[] = ["ipva", "licenciamento"];
const temCalendario = (tipo: TipoDeData): tipo is TipoComCalendario => (COM_CALENDARIO as TipoDeData[]).includes(tipo);
const br = (iso: string) => iso.split("-").reverse().join("/");
const hojeIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function DatasDoCarro({ v }: { v: Vehicle }) {
  const c = useContent();
  const t = c.datasDoCarro;
  const { s, updateVehicle, setState } = usePrototype();
  const [aberta, setAberta] = useState<TipoDeData | null>(null);
  const [em, setEm] = useState("");
  const [valor, setValor] = useState("");
  const [salvo, setSalvo] = useState(false);
  const [uf, setUf] = useState(s.state ?? "");
  const [final, setFinal] = useState(v.finalDaPlaca ?? finalDaPlaca(v.plate) ?? "");
  const [sugestao, setSugestao] = useState<Sugestao | null>(null);
  const [semCalendario, setSemCalendario] = useState(false);
  const lidas = datasDoCarro(v);
  const porTipo = new Map(lidas.map((d) => [d.tipo, d]));

  const ufGuardada = s.state ?? "";
  const finalGuardado = v.finalDaPlaca ?? finalDaPlaca(v.plate) ?? "";

  // A sugestão pronta para a linha: quando estado e final já estão guardados
  // e a data ainda não foi informada (ou já venceu), um toque resolve.
  const sugestaoDaLinha = (tipo: TipoDeData): Sugestao | null => {
    if (!temCalendario(tipo)) return null;
    const d = porTipo.get(tipo);
    if (d && d.dias >= 0) return null;
    return sugestaoDeData({ uf: ufGuardada, final: finalGuardado, tipo, hoje: hojeIso() });
  };

  const gravar = (tipo: TipoDeData, dado: { em: string; valor?: number; estimada?: boolean }) => {
    updateVehicle(v.id, { datas: { ...(v.datas ?? {}), [tipo]: dado } });
  };

  const abrir = (tipo: TipoDeData) => {
    const d = v.datas?.[tipo];
    setEm(d?.em ?? "");
    setValor(d?.valor != null ? String(d.valor) : "");
    setSalvo(false);
    setSugestao(null);
    setSemCalendario(false);
    setAberta(tipo);
  };
  const sugerir = () => {
    if (!aberta || !temCalendario(aberta)) return;
    const f = final.replace(/\D/g, "").slice(-1);
    if (!uf || !f) return;
    if (uf !== s.state) setState(uf);
    if (f !== v.finalDaPlaca) updateVehicle(v.id, { finalDaPlaca: f });
    const sug = sugestaoDeData({ uf, final: f, tipo: aberta, hoje: hojeIso() });
    setSugestao(sug);
    setSemCalendario(!sug);
    if (sug) setEm(sug.em);
  };
  const salvar = () => {
    if (!aberta || !/^\d{4}-\d{2}-\d{2}$/.test(em)) return;
    const n = parseInt(valor.replace(/\D/g, ""), 10);
    const estimada = !!sugestao && sugestao.em === em && sugestao.estimada;
    gravar(aberta, { em, ...(Number.isFinite(n) && n > 0 ? { valor: n } : {}), ...(estimada ? { estimada: true } : {}) });
    setSalvo(true);
  };
  const remover = () => {
    if (!aberta) return;
    const datas = { ...(v.datas ?? {}) };
    delete datas[aberta];
    updateVehicle(v.id, { datas });
    setAberta(null);
  };

  return (
    <Card className="mb-3" data-datas-do-carro>
      <p className="text-xs font-semibold uppercase tracking-wide text-cream/45">{t.titulo}</p>
      <p className="mt-0.5 text-xs text-cream/50">{t.sub}</p>
      <div className="mt-2.5 divide-y divide-white/5">
        {TIPOS_DE_DATA.map((tipo) => {
          const d = porTipo.get(tipo);
          const estado = d ? estadoDaData(d.dias) : null;
          const sug = sugestaoDaLinha(tipo);
          return (
            <div key={tipo}>
              <button onClick={() => abrir(tipo)} className="flex w-full items-center gap-3 py-2.5 text-left" data-data-do-carro={tipo}>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-cream/90">{t.tipos[tipo]}</span>
                  {d && (
                    <span className={`block text-xs ${estado === "vencida" ? "text-red-300/90" : estado === "distante" ? "text-cream/50" : "text-amber/90"}`}>
                      {quandoVence(d.dias, t)}{d.valor != null ? ` · ${formatBRL(d.valor)}` : ""}{d.estimada ? ` · ${t.estimadaLinha}` : ""}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-xs font-medium text-amber">{d ? br(d.em) : t.informar}</span>
              </button>
              {sug && (
                <div className="-mt-1 mb-2 flex items-center gap-2" data-sugestao-da-placa={tipo}>
                  <span className="min-w-0 flex-1 text-xs text-cream/55">{t.linhaSugestao.replace("{data}", br(sug.em)).replace("{estimada}", sug.estimada ? t.estimadaCurta : "")}</span>
                  <button onClick={() => gravar(tipo, { em: sug.em, ...(sug.estimada ? { estimada: true } : {}) })} className="shrink-0 rounded-full bg-amber/15 px-3 py-1 text-xs font-bold text-amber">{t.usar}</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Sheet open={!!aberta} onClose={() => setAberta(null)}>
        {aberta && (
          <>
            <h2 className="font-display text-xl font-bold text-cream">{t.tipos[aberta]}</h2>
            {temCalendario(aberta) && (
              <div className="mt-4 rounded-xl bg-graphite-700/60 p-3" data-pela-placa>
                <p className="text-xs font-semibold uppercase tracking-wide text-cream/45">{t.placaTitulo}</p>
                <p className="mt-0.5 text-xs text-cream/50">{t.placaSub}</p>
                <div className="mt-2 flex gap-2">
                  <label className="block flex-1">
                    <span className="mb-1 block text-xs text-cream/55">{t.uf}</span>
                    <select value={uf} onChange={(e) => setUf(e.target.value)} className={inputCls} aria-label={t.uf}>
                      <option value="">{t.ufSelecione}</option>
                      {BR_STATES.map((x) => (<option key={x} value={x}>{x}</option>))}
                    </select>
                  </label>
                  <label className="block w-28">
                    <span className="mb-1 block text-xs text-cream/55">{t.finalDaPlaca}</span>
                    <input value={final} inputMode="numeric" maxLength={1} onChange={(e) => setFinal(e.target.value.replace(/\D/g, "").slice(-1))} placeholder={t.finalPh} className={inputCls} aria-label={t.finalDaPlaca} />
                  </label>
                </div>
                <Button variant="secondary" className="mt-2 w-full" disabled={!uf || !final} onClick={sugerir}>{t.sugerir}</Button>
                {sugestao && (
                  <p className="mt-2 text-xs text-teal/90" data-sugestao>
                    {(sugestao.estimada ? t.sugestaoEstimada : t.sugestaoExata)
                      .replace("{final}", final).replace("{uf}", uf).replace("{data}", br(sugestao.em))
                      .replace("{ano}", sugestao.em.slice(0, 4)).replace("{base}", String(sugestao.baseAno))}
                  </p>
                )}
                {semCalendario && (
                  <p className="mt-2 text-xs text-amber/90" data-sem-calendario>
                    {t.semCalendario.replace("{uf}", uf)} {t.ufsCobertas.replace("{ufs}", ufsComCalendario(aberta).join(", "))}
                  </p>
                )}
              </div>
            )}
            <label className="mt-4 block">
              <span className="mb-1 block text-xs text-cream/55">{t.data}</span>
              <DateField value={em} onCommit={(val) => { setEm(val); if (sugestao && val !== sugestao.em) setSugestao(null); }} className={inputCls} />
            </label>
            <label className="mt-3 block">
              <span className="mb-1 block text-xs text-cream/55">{t.valor}</span>
              <input value={valor} inputMode="numeric" onChange={(e) => setValor(e.target.value.replace(/\D/g, ""))} placeholder={t.valorPh} className={inputCls} />
            </label>
            {salvo ? (
              <p className="mt-3 text-xs text-teal/90">{t.salvo}</p>
            ) : (
              <Button size="lg" className="mt-4 w-full" disabled={!/^\d{4}-\d{2}-\d{2}$/.test(em)} onClick={salvar}>{t.salvar}</Button>
            )}
            {v.datas?.[aberta] && (
              <Button variant="ghost" className="mt-2 w-full" onClick={remover}>{t.remover}</Button>
            )}
          </>
        )}
      </Sheet>
    </Card>
  );
}
