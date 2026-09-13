"use client";

import { useState } from "react";
import { consumoKmPorLitro, custoPorKm, devolucao, gastoDoMes, kmValido } from "@/lib/app/combustivel";
import { carName, formatBRL } from "@/lib/app/content";
import { funil } from "@/lib/app/funil";
import { useNav } from "@/lib/app/nav";
import { abastecimentosFor, activeVehicle, usePrototype } from "@/lib/app/store";
import type { Combustivel } from "@/lib/app/types";
import { Button } from "@/components/ui/Button";
import { AppHeader, Card, Chip, inputCls, useContent } from "../ui";

// O abastecimento em três toques (caderno de gastos, 13/09/2026).
//
// Valor, litros (opcional) e km do painel. Ao salvar, a devolução na hora:
// custo por km, consumo e o mês, como a comparação de preço faz no serviço.
// É o momento de valor da peça, e é ele que puxa o próximo lançamento. O km
// carimba o odômetro no store, então quem abastece pelo app não recebe a
// pergunta mensal de km. Onde a peça entra e por quê:
// docs/agentes/propostas/rotina-do-carro.md.

const TIPOS: Combustivel[] = ["gasolina", "etanol", "diesel", "gnv", "outro"];

/** R$ com centavos: custo por km precisa deles (R$ 0,62). */
export const brlCentavos = (n: number) => "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const hoje = () => new Date().toISOString().slice(0, 10);

export function AbastecimentoScreen({ origem, id }: { origem?: string; id?: string }) {
  const c = useContent();
  const t = c.combustivel;
  const { s, addAbastecimento, removeAbastecimento } = usePrototype();
  const { go, back, root } = useNav();
  const v = activeVehicle(s);
  const lista = v ? abastecimentosFor(s, v.id) : [];
  const existente = id ? (s.abastecimentos ?? []).find((a) => a.id === id) ?? null : null;

  const ultimoTipo = lista[0]?.combustivel ?? "gasolina";
  const [valor, setValor] = useState("");
  const [litros, setLitros] = useState("");
  const [km, setKm] = useState("");
  const [data, setData] = useState(hoje());
  const [tipo, setTipo] = useState<Combustivel>(ultimoTipo);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState<ReturnType<typeof devolucao> | null>(null);
  const [kmSalvo, setKmSalvo] = useState<number | null>(null);
  const [apagado, setApagado] = useState(false);

  const numero = (txt: string) => Number(txt.replace(/\./g, "").replace(",", "."));

  const salvar = () => {
    if (!v) return;
    const val = numero(valor);
    if (!Number.isFinite(val) || val <= 0) { setErro(t.valorInvalido); return; }
    const kmN = parseInt(km.replace(/\D/g, ""), 10);
    const motivo = kmValido(kmN, v.odometerKm);
    if (motivo === "invalido") { setErro(t.kmInvalido); return; }
    if (motivo === "menor") { setErro(t.kmMenor.replace("{novo}", kmN.toLocaleString("pt-BR")).replace("{atual}", (v.odometerKm ?? 0).toLocaleString("pt-BR"))); return; }
    const lit = litros.trim() ? numero(litros) : undefined;
    const rec = { vehicleId: v.id, date: data || hoje(), km: kmN, valor: Math.round(val * 100) / 100, combustivel: tipo, ...(lit && lit > 0 ? { litros: Math.round(lit * 100) / 100 } : {}) };
    addAbastecimento(rec);
    // A devolução usa a lista com o lançamento novo já dentro.
    const agora = [{ ...rec, id: "novo" }, ...lista];
    setSalvo({ custoPorKm: custoPorKm(agora), consumo: consumoKmPorLitro(agora), mes: gastoDoMes(agora), lancamentos: agora.length });
    setKmSalvo(kmN);
    setErro(null);
    funil("registrou_abastecimento", { origem: origem ?? "direto" });
  };

  if (!v) {
    return (
      <div>
        <AppHeader title={t.titulo} />
        <Card className="mt-2 text-center">
          <p className="text-sm text-cream/60">{t.semCarro}</p>
          <Button className="mt-4" onClick={() => go({ name: "addCar" })}>{c.history.addCar}</Button>
        </Card>
      </div>
    );
  }

  // Ver e apagar um lançamento existente.
  if (id) {
    return (
      <div>
        <AppHeader title={t.titulo} subtitle={carName(v)} />
        {apagado ? (
          <Card className="mt-2 text-center"><p className="text-sm text-cream/70">{t.apagado}</p></Card>
        ) : !existente ? (
          <Card className="mt-2 text-center"><p className="text-sm text-cream/70">{t.naoEncontrado}</p></Card>
        ) : (
          <Card className="mt-2">
            <p className="font-display text-lg text-cream">{formatBRL(existente.valor)}</p>
            <p className="mt-1 text-sm text-cream/70">
              {t.tipos[existente.combustivel]}{existente.litros ? ` · ${t.linhaLitros.replace("{n}", existente.litros.toLocaleString("pt-BR"))}` : ""} · {existente.km.toLocaleString("pt-BR")} km · {existente.date}
            </p>
            <Button variant="ghost" className="mt-4 w-full" onClick={() => { removeAbastecimento(existente.id); setApagado(true); }}>{t.apagar}</Button>
          </Card>
        )}
        <Button variant="secondary" className="mt-4 w-full" onClick={back}>{t.pronto}</Button>
      </div>
    );
  }

  if (salvo) {
    return (
      <div>
        <AppHeader title={t.titulo} subtitle={carName(v)} />
        <Card className="mt-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-cream/45">{t.devolucaoTitulo.replace("{carro}", carName(v))}</p>
          {salvo.custoPorKm != null ? (
            <p className="mt-2 font-display text-3xl text-cream">{brlCentavos(salvo.custoPorKm)} <span className="text-base text-cream/55">{t.porKm}</span></p>
          ) : (
            <p className="mt-2 text-sm text-cream/85">{t.primeiro}</p>
          )}
          {salvo.consumo != null && <p className="mt-1 text-sm text-cream/70">{t.consumo.replace("{n}", salvo.consumo.toLocaleString("pt-BR"))}</p>}
          <p className="mt-1 text-sm text-cream/70">{t.mes.replace("{valor}", formatBRL(salvo.mes))}</p>
          {kmSalvo != null && <p className="mt-2 text-xs text-teal/90">{t.kmCarimbado.replace("{km}", kmSalvo.toLocaleString("pt-BR"))}</p>}
        </Card>
        <div className="mt-4 space-y-2.5">
          <Button size="lg" className="w-full" onClick={() => root({ name: "home" })}>{t.pronto}</Button>
          <Button variant="ghost" className="w-full" onClick={() => root({ name: "history" })}>{t.verHistorico}</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AppHeader title={t.titulo} subtitle={carName(v)} />
      <p className="text-sm text-cream/60">{t.intro}</p>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs text-cream/55">{t.valor}</span>
          <input value={valor} inputMode="decimal" onChange={(e) => setValor(e.target.value)} placeholder={t.valorPh} className={inputCls} autoFocus />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-cream/55">{t.km}</span>
          <input value={km} inputMode="numeric" onChange={(e) => setKm(e.target.value.replace(/\D/g, ""))} placeholder={t.kmPh.replace("{km}", (v.odometerKm ?? 0).toLocaleString("pt-BR"))} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-cream/55">{t.litros}</span>
          <input value={litros} inputMode="decimal" onChange={(e) => setLitros(e.target.value)} placeholder={t.litrosPh} className={inputCls} />
        </label>
        <div>
          <span className="mb-1 block text-xs text-cream/55">{t.combustivel}</span>
          <div className="flex flex-wrap gap-2">
            {TIPOS.map((k) => (
              <Chip key={k} active={tipo === k} onClick={() => setTipo(k)}>{t.tipos[k]}</Chip>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="mb-1 block text-xs text-cream/55">{t.data}</span>
          <input type="date" value={data} max={hoje()} onChange={(e) => setData(e.target.value)} className={inputCls} />
        </label>
      </div>

      {erro && <p className="mt-3 text-xs text-red-300/90">{erro}</p>}

      <div className="mt-5 flex gap-2">
        <Button variant="ghost" className="flex-1" onClick={back}>{c.common.cancel}</Button>
        <Button className="flex-1" onClick={salvar}>{t.salvar}</Button>
      </div>
    </div>
  );
}
