"use client";

import { useState } from "react";
import { contaDoDia, contaDoMes, lancamentoValido, type ContaDoPeriodo } from "@/lib/app/motorista";
import { carName, formatBRL } from "@/lib/app/content";
import { funil } from "@/lib/app/funil";
import { useNav } from "@/lib/app/nav";
import { abastecimentosFor, activeVehicle, ganhosFor, servicesFor, usePrototype } from "@/lib/app/store";
import { Button } from "@/components/ui/Button";
import { AppHeader, Card, inputCls, useContent } from "../ui";
import { brlCentavos } from "./Abastecimento";

// O dia de trabalho de quem roda por aplicativo (modo motorista, 13/09/2026).
//
// Dois campos: o que o aplicativo pagou e quantos km o dia rodou. Ao salvar,
// a conta na hora: ganhou, custou, sobrou, e o lucro por km. O custo vem do
// custo por km do caderno de gastos (combustível) mais a reserva de
// manutenção dos serviços; sem dois abastecimentos, a tela diz que falta em
// vez de inventar. Onde a peça entra e por quê:
// docs/agentes/propostas/rotina-do-carro.md.

const hoje = () => new Date().toISOString().slice(0, 10);

export function GanhosScreen({ origem, id }: { origem?: string; id?: string }) {
  const c = useContent();
  const t = c.motorista;
  const { s, addGanho, removeGanho } = usePrototype();
  const { go, back, root } = useNav();
  const v = activeVehicle(s);
  const existente = id ? (s.ganhos ?? []).find((g) => g.id === id) ?? null : null;

  const [valor, setValor] = useState("");
  const [km, setKm] = useState("");
  const [data, setData] = useState(hoje());
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState<{ dia: ContaDoPeriodo; mes: ContaDoPeriodo } | null>(null);
  const [apagado, setApagado] = useState(false);

  const numero = (txt: string) => Number(txt.replace(/\./g, "").replace(",", "."));

  const salvar = () => {
    if (!v) return;
    const val = numero(valor);
    const kmN = parseInt(km.replace(/\D/g, ""), 10);
    const motivo = lancamentoValido(val, kmN);
    if (motivo === "valor") { setErro(t.valorInvalido); return; }
    if (motivo === "km") { setErro(t.kmInvalido); return; }
    const dia = data || hoje();
    const rec = { vehicleId: v.id, date: dia, valor: Math.round(val * 100) / 100, km: kmN };
    addGanho(rec);
    // A devolução usa a lista com o lançamento novo já dentro.
    const ganhos = [{ ...rec, id: "novo" }, ...ganhosFor(s, v.id)];
    const abastecimentos = abastecimentosFor(s, v.id);
    const servicos = servicesFor(s, v.id);
    setSalvo({
      dia: contaDoDia({ ganhos, abastecimentos, servicos, hoje: dia }),
      mes: contaDoMes({ ganhos, abastecimentos, servicos, mes: dia.slice(0, 7), hoje: dia }),
    });
    setErro(null);
    funil("lancou_ganho", { origem: origem ?? "direto" });
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

  // Ver e apagar um dia existente.
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
            <p className="mt-1 text-sm text-cream/70">{t.linhaKm.replace("{km}", existente.km.toLocaleString("pt-BR"))} · {existente.date}</p>
            <Button variant="ghost" className="mt-4 w-full" onClick={() => { removeGanho(existente.id); setApagado(true); }}>{t.apagar}</Button>
          </Card>
        )}
        <Button variant="secondary" className="mt-4 w-full" onClick={back}>{t.pronto}</Button>
      </div>
    );
  }

  if (salvo) {
    const d = salvo.dia;
    const detalhe = d.reservaPorKm != null
      ? t.comReserva.replace("{combustivel}", brlCentavos(d.combustivelPorKm ?? 0)).replace("{reserva}", brlCentavos(d.reservaPorKm))
      : t.soCombustivel;
    return (
      <div>
        <AppHeader title={t.titulo} subtitle={carName(v)} />
        <Card className="mt-2" data-conta-do-dia>
          <p className="text-xs font-semibold uppercase tracking-wide text-cream/45">{t.devolucaoTitulo.replace("{carro}", carName(v))}</p>
          {d.sobrou != null && d.custou != null ? (
            <>
              <p className="mt-2 font-display text-3xl text-cream">{formatBRL(d.sobrou)} <span className="text-base text-cream/55">{t.sobrou}</span></p>
              <p className="mt-1 text-sm text-cream/70">{t.ganhouCustou.replace("{ganhou}", formatBRL(d.ganhou)).replace("{custou}", formatBRL(d.custou))}</p>
              {d.lucroPorKm != null && <p className="mt-1 text-sm text-cream/70">{t.lucroPorKm.replace("{valor}", brlCentavos(d.lucroPorKm))}</p>}
              {d.custoPorKm != null && <p className="mt-2 text-xs text-cream/50">{t.custoPorKm.replace("{valor}", brlCentavos(d.custoPorKm)).replace("{detalhe}", detalhe)}</p>}
            </>
          ) : (
            <p className="mt-2 text-sm text-cream/85">{t.semCusto.replace("{ganhou}", formatBRL(d.ganhou)).replace("{km}", d.km.toLocaleString("pt-BR"))}</p>
          )}
          {salvo.mes.sobrou != null && salvo.mes.dias > 1 && (
            <p className="mt-2 text-xs text-teal/90">{t.mes.replace("{ganhou}", formatBRL(salvo.mes.ganhou)).replace("{sobrou}", formatBRL(salvo.mes.sobrou))}</p>
          )}
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
          <input value={km} inputMode="numeric" onChange={(e) => setKm(e.target.value.replace(/\D/g, ""))} placeholder={t.kmPh} className={inputCls} />
        </label>
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
