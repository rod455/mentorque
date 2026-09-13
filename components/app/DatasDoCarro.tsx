"use client";

import { useState } from "react";
import { datasDoCarro, estadoDaData, TIPOS_DE_DATA } from "@/lib/app/datasDoCarro";
import { formatBRL } from "@/lib/app/content";
import { usePrototype } from "@/lib/app/store";
import type { TipoDeData, Vehicle } from "@/lib/app/types";
import { Button } from "@/components/ui/Button";
import { Card, DateField, inputCls, Sheet, useContent } from "./ui";

// As datas do carro, no calendário de revisões (peça 2 da rotina do carro,
// 13/09/2026). Quatro linhas, cada uma com a data e "vence em n dias", ou
// "Informar". Tocar abre a folha com a data e o valor opcional. Onde entra e
// por quê: docs/agentes/propostas/rotina-do-carro.md.

/** "vence em 12 dias", "vence hoje", "venceu há 3 dias". */
export function quandoVence(dias: number, t: { venceEm: string; venceAmanha: string; venceHoje: string; venceu: string }): string {
  const estado = estadoDaData(dias);
  if (estado === "vencida") return t.venceu.replace("{n}", String(-dias));
  if (estado === "hoje") return t.venceHoje;
  if (dias === 1) return t.venceAmanha;
  return t.venceEm.replace("{n}", String(dias));
}

export function DatasDoCarro({ v }: { v: Vehicle }) {
  const c = useContent();
  const t = c.datasDoCarro;
  const { updateVehicle } = usePrototype();
  const [aberta, setAberta] = useState<TipoDeData | null>(null);
  const [em, setEm] = useState("");
  const [valor, setValor] = useState("");
  const [salvo, setSalvo] = useState(false);
  const lidas = datasDoCarro(v);
  const porTipo = new Map(lidas.map((d) => [d.tipo, d]));

  const abrir = (tipo: TipoDeData) => {
    const d = v.datas?.[tipo];
    setEm(d?.em ?? "");
    setValor(d?.valor != null ? String(d.valor) : "");
    setSalvo(false);
    setAberta(tipo);
  };
  const salvar = () => {
    if (!aberta || !/^\d{4}-\d{2}-\d{2}$/.test(em)) return;
    const n = parseInt(valor.replace(/\D/g, ""), 10);
    updateVehicle(v.id, { datas: { ...(v.datas ?? {}), [aberta]: { em, ...(Number.isFinite(n) && n > 0 ? { valor: n } : {}) } } });
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
          return (
            <button key={tipo} onClick={() => abrir(tipo)} className="flex w-full items-center gap-3 py-2.5 text-left" data-data-do-carro={tipo}>
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-cream/90">{t.tipos[tipo]}</span>
                {d && (
                  <span className={`block text-xs ${estado === "vencida" ? "text-red-300/90" : estado === "distante" ? "text-cream/50" : "text-amber/90"}`}>
                    {quandoVence(d.dias, t)}{d.valor != null ? ` · ${formatBRL(d.valor)}` : ""}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-xs font-medium text-amber">{d ? d.em.split("-").reverse().join("/") : t.informar}</span>
            </button>
          );
        })}
      </div>

      <Sheet open={!!aberta} onClose={() => setAberta(null)}>
        {aberta && (
          <>
            <h2 className="font-display text-xl font-bold text-cream">{t.tipos[aberta]}</h2>
            <label className="mt-4 block">
              <span className="mb-1 block text-xs text-cream/55">{t.data}</span>
              <DateField value={em} onCommit={setEm} className={inputCls} />
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
