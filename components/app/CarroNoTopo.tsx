"use client";

import { useEffect, useRef, useState } from "react";
import { activeVehicle, ownedVehicles, usePrototype } from "@/lib/app/store";
import { carName } from "@/lib/app/content";
import { Icon, useContent } from "./ui";

// A troca do carro ativo, na barra de cima.
//
// Já foi uma fileira de chips dentro do Início (SeletorDeCarro). Virou lista
// suspensa no topo a pedido do dono (27/08): o carro selecionado aparece ao
// lado da marca, um toque desce a lista com os outros, um toque escolhe. O
// app inteiro (revisões, saúde, histórico, "Para você") responde ao carro
// ativo, então o lugar dele é onde toda tela raiz enxerga, não um cartão a
// mais disputando a Home.
//
// Some com um carro só, que é a maioria: um seletor de uma opção é enfeite
// que ocupa o lugar mais caro da tela. (Vendidos também ficam fora: ninguém
// precisa de acesso rápido às revisões de um carro que não é mais dele.)
export function CarroNoTopo() {
  const { s, setActiveVehicle } = usePrototype();
  const c = useContent();
  const carros = ownedVehicles(s);
  const ativo = activeVehicle(s);

  const [aberto, setAberto] = useState(false);

  // Fecha ao tocar fora. O painel é pequeno; um backdrop escuro de folha
  // inteira seria peso demais para uma escolha de dois itens.
  const raiz = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!aberto) return;
    const fora = (ev: PointerEvent) => {
      if (!raiz.current?.contains(ev.target as Node)) setAberto(false);
    };
    window.addEventListener("pointerdown", fora);
    return () => window.removeEventListener("pointerdown", fora);
  }, [aberto]);

  if (carros.length < 2 || !ativo) return null;
  const outros = carros.filter((v) => v.id !== ativo.id);

  const Foto = ({ v, on }: { v: (typeof carros)[number]; on: boolean }) => (
    <span
      className={`grid h-6 w-6 shrink-0 place-items-center overflow-hidden rounded-full ${
        on ? "bg-amber/20 text-amber" : "bg-white/5 text-cream/50"
      }`}
    >
      {v.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={v.photo} alt="" className="h-full w-full object-cover" />
      ) : (
        <Icon name={v.type === "moto" ? "moto" : "car"} className="h-3.5 w-3.5" />
      )}
    </span>
  );

  return (
    <div ref={raiz} className="relative min-w-0">
      {/* O `max-w-full` não é enfeite: botão é elemento de formulário, e mesmo
          em display:flex a largura auto dele é "do tamanho do conteúdo", não
          "cabe no pai". Sem o teto, quando a barra aperta o invólucro encolhe
          e o botão NÃO acompanha: ele vazava por baixo do chip do quiz. */}
      <button
        onClick={() => setAberto((a) => !a)}
        aria-expanded={aberto}
        aria-label={`${c.home.switchCar}: ${carName(ativo)}`}
        className="flex h-9 min-w-0 max-w-full items-center gap-1.5 rounded-full bg-graphite-800 py-1 pl-1.5 pr-2.5 ring-1 ring-white/10 active:bg-graphite-700"
      >
        <Foto v={ativo} on />
        <span className="min-w-0 max-w-[7.5rem] truncate font-display text-[13px] font-semibold text-cream">
          {carName(ativo)}
        </span>
        <span
          aria-hidden
          className={`shrink-0 text-[10px] text-cream/45 transition-transform ${aberto ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>

      {aberto && (
        <div
          role="menu"
          aria-label={c.home.switchCar}
          className="absolute left-0 top-full z-[60] mt-2 w-52 overflow-hidden rounded-2xl bg-graphite-800 shadow-card ring-1 ring-white/10 [&>*+*]:border-t [&>*+*]:border-white/[0.06]"
        >
          {outros.map((v) => (
            <button
              key={v.id}
              role="menuitem"
              onClick={() => {
                setActiveVehicle(v.id);
                setAberto(false);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left active:bg-graphite-700"
            >
              <Foto v={v} on={false} />
              <span className="min-w-0 flex-1 truncate font-display text-[13px] font-medium text-cream/85">
                {carName(v)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
