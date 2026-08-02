"use client";

import { AppHeader, Card, useContent } from "../ui";

// Como usar um equipamento do Kit do motorista — versão fácil, passo a passo.
export function EquipmentHowToScreen({ itemId }: { itemId: string }) {
  const c = useContent();
  const e = c.equipmentUi;
  const item = c.equipment.flatMap((g) => g.items).find((it) => it.id === itemId);
  const guide = c.equipmentHowTo[itemId];
  if (!item || !guide) return <AppHeader title="—" />;

  return (
    <div>
      <AppHeader title={item.name} />

      {/* Cabeçalho do item */}
      <div className="flex items-center gap-3">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-graphite-800 text-3xl ring-1 ring-white/[0.06]">{item.emoji}</span>
        <p className="text-sm leading-relaxed text-cream/70">{item.use}</p>
      </div>

      {/* Passo a passo */}
      <p className="mb-2.5 mt-5 text-xs font-semibold uppercase tracking-wide text-cream/45">{e.howToSteps}</p>
      <div className="space-y-2">
        {guide.steps.map((step, i) => (
          <div key={i} className="flex gap-3 rounded-2xl bg-graphite-800 p-3.5 ring-1 ring-white/5">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber/15 font-display text-xs font-bold text-amber">{i + 1}</span>
            <p className="min-w-0 flex-1 text-sm leading-relaxed text-cream/85">{step}</p>
          </div>
        ))}
      </div>

      {/* Cuidados de segurança */}
      {guide.safety.length > 0 && (
        <>
          <p className="mb-2.5 mt-5 text-xs font-semibold uppercase tracking-wide text-cream/45">{e.howToSafety}</p>
          <div className="space-y-2">
            {guide.safety.map((sfy, i) => (
              <Card key={i} className="bg-coral/[0.08] ring-coral/20">
                <p className="text-sm leading-relaxed text-cream/85">
                  <span className="mr-1.5 text-coral">!</span>
                  {sfy}
                </p>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
