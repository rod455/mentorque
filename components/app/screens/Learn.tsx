"use client";

import { useState } from "react";
import { activeVehicle, usePrototype } from "@/lib/app/store";
import { useNav } from "@/lib/app/nav";
import { Button } from "@/components/ui/Button";
import { AppHeader, Card, Icon, SectionTitle, useContent } from "../ui";

// 2.6.A — Aprenda mecânica (para este carro)
export function LearnScreen() {
  const c = useContent();
  const { s } = usePrototype();
  const { go } = useNav();
  const v = activeVehicle(s);

  const recommended = c.lessons.slice(0, 3);
  const rest = c.lessons.slice(3);
  const typeLabel = (t: string) => (t === "video" ? c.learn.video : c.learn.article);

  const Row = ({ id, title, type }: { id: string; title: string; type: string }) => (
    <button onClick={() => go({ name: "content", id })} className="flex w-full items-center gap-3 rounded-2xl bg-graphite-800 p-3.5 text-left ring-1 ring-white/5 hover:ring-amber/30">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber/12 text-amber">
        <Icon name={type === "video" ? "diagnose" : "book"} className="h-6 w-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-[15px] text-cream">{title}</span>
        <span className="block text-xs text-cream/50">{typeLabel(type)}</span>
      </span>
      <span className="text-cream/40">›</span>
    </button>
  );

  return (
    <div>
      <AppHeader title={`${c.learn.title}${v ? " · " + v.model : ""}`} />
      <SectionTitle>{c.learn.recommended}</SectionTitle>
      <div className="space-y-2.5">
        {recommended.map((l) => <Row key={l.id} id={l.id} title={l.title} type={l.type} />)}
      </div>
      {rest.length > 0 && (
        <>
          <SectionTitle>{c.learn.all}</SectionTitle>
          <div className="space-y-2.5">
            {rest.map((l) => <Row key={l.id} id={l.id} title={l.title} type={l.type} />)}
          </div>
        </>
      )}
    </div>
  );
}

// 2.6.B — Tela de conteúdo
export function ContentScreen({ id }: { id: string }) {
  const c = useContent();
  const lesson = c.lessons.find((l) => l.id === id);
  const [done, setDone] = useState(false);
  const [saved, setSaved] = useState(false);
  if (!lesson) return <AppHeader title="—" />;

  return (
    <div>
      <AppHeader title={lesson.title} />

      {/* Media placeholder */}
      <div className="grid aspect-video place-items-center rounded-2xl bg-gradient-to-br from-graphite-700 to-graphite-800 text-cream/30 ring-1 ring-white/10">
        <Icon name={lesson.type === "video" ? "diagnose" : "book"} className="h-12 w-12" />
      </div>

      <Block title={c.learn.need}>
        <ul className="space-y-1.5">
          {lesson.need.map((x) => (
            <li key={x} className="flex gap-2 text-sm text-cream/80"><span className="text-teal">✓</span>{x}</li>
          ))}
        </ul>
      </Block>

      <Block title={c.learn.steps}>
        <ol className="space-y-2">
          {lesson.steps.map((x, i) => (
            <li key={x} className="flex gap-2.5 text-sm text-cream/85">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber/15 font-display text-xs font-semibold text-amber">{i + 1}</span>
              {x}
            </li>
          ))}
        </ol>
      </Block>

      <Block title={c.learn.safety}>
        <ul className="space-y-1.5">
          {lesson.safety.map((x) => (
            <li key={x} className="flex gap-2 rounded-lg bg-coral/10 px-3 py-2 text-sm text-cream/85 ring-1 ring-coral/15"><span className="text-coral">!</span>{x}</li>
          ))}
        </ul>
      </Block>

      <div className="mt-6 flex gap-2">
        <Button className="flex-1" onClick={() => setDone((d) => !d)}>{done ? `✓ ${c.learn.completed}` : c.learn.complete}</Button>
        <Button variant="ghost" className="flex-1" onClick={() => setSaved((v) => !v)}>{saved ? "★" : "☆"} {c.learn.saveLater}</Button>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cream/45">{title}</p>
      {children}
    </div>
  );
}
