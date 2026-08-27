"use client";

import { usePrototype } from "@/lib/app/store";
import { useNav } from "@/lib/app/nav";
import type { Content } from "@/lib/app/content";
import { Icon, PremiumBadge, Thumb, useContent } from "../ui";

// A linha de uma aula na lista.
//
// Aparece em cinco lugares (Estudos, trilha, para o seu carro, salvas, e o
// rodapé do leitor). Morava dentro de Learn.tsx, e o leitor de aula tinha de
// importar da tela de listagem para desenhar a própria lista de "veja também".
// Componente compartilhado não mora dentro de um dos consumidores.

type Item = Content["lessons"][number];

export function typeLabel(c: Content, t: string): string {
  return t === "video" ? c.learn.video : t === "checklist" ? c.learn.checklist : c.learn.article;
}

export function typeIcon(t: string): string {
  return t === "video" ? "diagnose" : t === "checklist" ? "check" : "book";
}

export function ItemRow({ item }: { item: Item }) {
  const c = useContent();
  const { s } = usePrototype();
  const { go } = useNav();
  const locked = item.premium && !s.premium;
  return (
    <button
      onClick={() => go(locked ? { name: "subscribe", ctx: "learn" } : { name: "content", id: item.id })}
      className="flex w-full items-center gap-3 rounded-2xl bg-graphite-800 p-3.5 text-left ring-1 ring-white/5 hover:ring-amber/30"
    >
      <span className={`grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-graphite ring-1 ${locked ? "text-amber/70 ring-amber/25" : "text-amber ring-amber/45"}`}>
        {item.thumb ? (
          <Thumb src={item.thumb} className={`h-full w-full object-contain ${locked ? "opacity-60" : ""}`} />
        ) : (
          <Icon name={typeIcon(item.type)} className="h-6 w-6" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-[15px] text-cream">{item.title}</span>
        <span className="block text-xs text-cream/50">{typeLabel(c, item.type)}</span>
      </span>
      {locked ? <PremiumBadge /> : <span className="text-cream/40">›</span>}
    </button>
  );
}
