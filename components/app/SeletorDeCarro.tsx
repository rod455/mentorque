"use client";

import { activeVehicle, ownedVehicles, usePrototype } from "@/lib/app/store";
import { carName } from "@/lib/app/content";
import { Icon, useContent } from "./ui";

// Troca do carro ativo sem sair da tela.
//
// O app inteiro (revisões, saúde, histórico, aulas do "Para você") responde a
// UM carro por vez, o ativo. Quem tem mais de um via só o ativo no Início e
// precisava ir até a garagem, abrir o outro carro e voltar. Três toques para
// uma pergunta de um toque: "e o outro carro, como está?".
//
// Some com um carro só, que é a maioria: um seletor de uma opção é enfeite que
// ocupa altura no lugar mais caro da tela.
//
// Só carros que a pessoa ainda tem. Vendido continua acessível pelo histórico,
// dentro da garagem, mas não disputa espaço aqui: ninguém precisa de acesso
// rápido às revisões de um carro que não é mais dele.
export function SeletorDeCarro() {
  const { s, setActiveVehicle } = usePrototype();
  const c = useContent();
  const carros = ownedVehicles(s);
  const ativo = activeVehicle(s);

  if (carros.length < 2) return null;

  return (
    // A faixa sangra até as bordas (`-mx-5 px-5` anula o respiro do <main>):
    // com a lista cortada rente à margem, um carro parcialmente visível na
    // direita é o que avisa que dá para arrastar.
    <div
      className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      role="group"
      aria-label={c.home.switchCar}
    >
      {carros.map((v) => {
        const on = v.id === ativo?.id;
        return (
          <button
            key={v.id}
            onClick={() => setActiveVehicle(v.id)}
            aria-pressed={on}
            className={`flex shrink-0 items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 transition-colors ${
              on
                ? "bg-amber/15 ring-1 ring-amber/50"
                : "bg-graphite-800 ring-1 ring-white/[0.06] active:bg-graphite-700"
            }`}
          >
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full ${
                on ? "bg-amber/20 text-amber" : "bg-white/5 text-cream/50"
              }`}
            >
              {v.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.photo} alt="" className="h-full w-full object-cover" />
              ) : (
                <Icon name={v.type === "moto" ? "moto" : "car"} className="h-4 w-4" />
              )}
            </span>
            <span
              className={`max-w-[8.5rem] truncate font-display text-[13px] font-medium ${
                on ? "text-amber" : "text-cream/70"
              }`}
            >
              {carName(v)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
