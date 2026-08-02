"use client";

import { usePrototype } from "@/lib/app/store";
import { useNav } from "@/lib/app/nav";
import { AppHeader, useContent } from "../ui";

// Kit do motorista — equipamentos úteis por categoria.
export function EquipmentScreen() {
  const c = useContent();
  const e = c.equipmentUi;
  const { s } = usePrototype();
  const { go } = useNav();

  return (
    <div>
      <AppHeader title={e.title} />
      <p className="mb-4 text-sm text-cream/60">{e.intro}</p>

      <div className="space-y-6">
        {c.equipment.map((group) => (
          <div key={group.section}>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-cream/45">{group.section}</p>
            <div className="space-y-2">
              {group.items.map((it) => (
                <div
                  key={it.name}
                  className={`flex gap-3 rounded-2xl bg-graphite-800 p-3.5 ring-1 ${it.star ? "ring-amber/30" : "ring-white/5"}`}
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-graphite-700 text-2xl">{it.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-[15px] text-cream">{it.name}</span>
                      {it.essential && <span className="rounded-md bg-teal/15 px-1.5 py-0.5 text-[10px] font-medium text-teal">{e.essential}</span>}
                      {it.star && <span className="text-amber">★</span>}
                    </div>
                    <p className="mt-1 text-xs leading-snug text-cream/60">{it.use}</p>
                  </div>
                  {/* Como usar → página do guia (Premium) */}
                  <button
                    onClick={() => go(s.premium ? { name: "equipmentHowTo", itemId: it.id } : { name: "subscribe", ctx: "equipment" })}
                    className="shrink-0 self-center rounded-full bg-amber/15 px-2.5 py-1 text-[11px] font-semibold text-amber ring-1 ring-amber/25 hover:bg-amber/25"
                  >
                    {e.howTo}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tie-in com o Biela */}
      <button
        onClick={() => go(s.premium ? { name: "biela", seed: e.bielaSeed } : { name: "subscribe", ctx: "biela" })}
        className="mt-6 flex w-full items-center gap-3 rounded-2xl bg-gradient-to-br from-amber/15 to-amber/5 px-3.5 py-3.5 text-left ring-1 ring-amber/25 hover:ring-amber/45"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-graphite-900/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/biela/biela-idle.png" alt="" className="h-full w-full object-contain" />
        </span>
        <span className="min-w-0 flex-1 text-sm text-cream/90">{e.bielaCta}</span>
        <span className="shrink-0 text-amber">›</span>
      </button>
    </div>
  );
}
