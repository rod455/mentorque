"use client";

import { useRef, useState } from "react";
import { usePrototype } from "@/lib/app/store";
import { useAuth } from "@/lib/app/auth";
import { uploadUserPhoto, deleteUserPhoto } from "@/lib/app/uploadPhoto";
import { useNav } from "@/lib/app/nav";
import { computeStatus, isLived, MILESTONES, PHASES, type GamSession } from "@/lib/app/gamification";
import { MedalEmblem, PhaseEmblem } from "../Emblem";
import { Button } from "@/components/ui/Button";
import { AppHeader, Icon, SectionTitle, Sheet, useContent } from "../ui";

// Downscale a picked image to a small JPEG data URL so photos stay tiny in
// localStorage / cloud sync.
function resizeImage(file: File, max = 900, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no-ctx"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Reads the gamification status from the prototype session.
function useGam(): { status: ReturnType<typeof computeStatus>; s: GamSession } {
  const { s } = usePrototype();
  return { status: computeStatus(s), s };
}

// 3.1.C — "Como funciona?": the phase ladder + what earns progress.
export function GamificationScreen() {
  const c = useContent();
  const g = c.gamification;
  const { status } = useGam();
  const { back } = useNav();

  return (
    <div>
      <AppHeader title={g.howTitle} />
      <p className="text-sm leading-snug text-cream/65">{g.howIntro}</p>

      <SectionTitle>{g.phasesTitle}</SectionTitle>
      <div className="space-y-1">
        {PHASES.map((ph, i) => {
          const meta = g.phases[ph.id];
          const current = i === status.phaseIndex;
          return (
            <div key={ph.id} className={`flex items-center gap-3 rounded-xl px-1.5 py-2 ${current ? "bg-amber/[0.07] ring-1 ring-amber/25" : ""}`}>
              <PhaseEmblem id={ph.id} emoji={ph.emoji} size={48} active={current} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-serif text-base font-semibold text-cream">{meta.name}</p>
                  {current && <span className="rounded bg-amber/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber">{g.phaseLabel}</span>}
                </div>
                <p className="mt-0.5 text-[13px] leading-snug text-cream/55">{meta.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <SectionTitle>{g.advanceTitle}</SectionTitle>
      <div className="overflow-hidden rounded-2xl bg-graphite-800 ring-1 ring-white/[0.06] [&>*+*]:border-t [&>*+*]:border-white/[0.06]">
        {g.activities.map((a) => (
          <div key={a.label} className="flex items-center gap-3 px-4 py-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/5 text-sm">{a.emoji}</span>
            <span className="min-w-0 flex-1 text-[13px] text-cream/85">{a.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-teal/[0.08] p-3.5 ring-1 ring-teal/20">
        <p className="font-serif text-[15px] font-semibold text-cream">🌱 {g.noRushTitle}</p>
        <p className="mt-1 text-[13px] leading-snug text-cream/65">{g.noRushBody}</p>
      </div>

      <Button size="lg" className="mt-5 w-full" onClick={back}>{g.gotIt}</Button>
    </div>
  );
}

// 3.1.D — "Seu acervo": milestone grid with Marcos / Momentos tabs.
export function AchievementsScreen() {
  const c = useContent();
  const g = c.gamification;
  const { s } = useGam();
  const { toggleMilestone } = usePrototype();
  const [tab, setTab] = useState<"marco" | "momento">("marco");
  const [openMoment, setOpenMoment] = useState<string | null>(null);

  const items = MILESTONES.filter((m) => m.cat === tab);
  const earned = items.filter((m) => m.earned(s)).length;
  const moment = MILESTONES.find((m) => m.id === openMoment) ?? null;

  return (
    <div>
      <AppHeader title={g.acervoTitle} />
      <p className="text-sm leading-snug text-cream/65">{tab === "momento" ? g.momentsIntro : g.acervoIntro}</p>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-graphite-800 p-1 ring-1 ring-white/[0.06]">
        {([["marco", g.tabMarcos], ["momento", g.tabMomentos]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-lg py-2 text-sm font-medium transition-colors ${tab === key ? "bg-amber text-graphite" : "text-cream/60"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="mt-3 text-center text-xs text-cream/45">
        {g.earnedCount.replace("{n}", String(earned)).replace("{total}", String(items.length))}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {items.map((m) => {
          const meta = g.milestones[m.id];
          const got = m.earned(s);
          const photo = tab === "momento" ? s.momentPhotos?.[m.id] : undefined;

          const inner = (
            <>
              {photo ? (
                <img src={photo} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-amber/40" />
              ) : (
                <MedalEmblem emoji={m.emoji} size={56} earned={got} />
              )}
              <p className={`mt-2.5 font-serif text-sm font-semibold ${got ? "text-cream" : "text-cream/45"}`}>{meta.title}</p>
              <p className={`mt-1 text-xs leading-snug ${got ? "text-cream/60" : "text-cream/35"}`}>{meta.desc}</p>
            </>
          );

          // Momentos: whole card opens the register/photo sheet.
          if (tab === "momento") {
            return (
              <button
                key={m.id}
                onClick={() => setOpenMoment(m.id)}
                className={`flex flex-col items-center rounded-2xl p-4 text-center ring-1 transition-colors ${got ? "bg-graphite-800 ring-amber/25" : "bg-graphite-800/40 ring-white/[0.05] hover:ring-white/15"}`}
              >
                {inner}
                <span className={`mt-2.5 rounded-full px-3 py-1 text-[11px] font-semibold ${got ? "bg-amber/15 text-amber" : "bg-white/5 text-cream/60"}`}>
                  {got ? g.livedBadge : g.tapToRegister}
                </span>
              </button>
            );
          }

          // Marcos: auto ones light up from usage; manual ones get a mark toggle.
          return (
            <div
              key={m.id}
              className={`flex flex-col items-center rounded-2xl p-4 text-center ring-1 ${got ? "bg-graphite-800 ring-amber/25" : "bg-graphite-800/40 ring-white/[0.05]"}`}
            >
              {inner}
              {m.manual && (
                <button
                  onClick={() => toggleMilestone(m.id)}
                  className={`mt-2.5 rounded-full px-3 py-1 text-[11px] font-semibold ring-1 transition-colors ${got ? "bg-amber/15 text-amber ring-amber/30" : "bg-white/5 text-cream/70 ring-white/10 hover:text-cream"}`}
                >
                  {got ? g.marked : g.mark}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <Sheet open={!!moment} onClose={() => setOpenMoment(null)}>
        {moment && <MomentSheet id={moment.id} emoji={moment.emoji} onClose={() => setOpenMoment(null)} />}
      </Sheet>
    </div>
  );
}

// Register/experience sheet for a single momento — add a photo and/or mark it.
function MomentSheet({ id, emoji, onClose }: { id: string; emoji: string; onClose: () => void }) {
  const c = useContent();
  const g = c.gamification;
  const { s, toggleMilestone, setMomentPhoto } = usePrototype();
  const { user } = useAuth();
  const meta = g.milestones[id];
  const photo = s.momentPhotos?.[id];
  const lived = isLived(s, id);
  const claimedManually = (s.claimedMilestones ?? []).includes(id);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await resizeImage(file);
      // Logado → Storage (guarda a URL). Convidado/falha → local. Adicionar
      // foto já marca o momento como vivido.
      const url = user ? await uploadUserPhoto(user.id, `moment-${id}`, dataUrl) : null;
      setMomentPhoto(id, url ?? dataUrl);
    } catch {
      /* ignore bad image */
    } finally {
      setBusy(false);
    }
  };

  const remove = () => {
    setMomentPhoto(id, null);
    if (user) deleteUserPhoto(user.id, `moment-${id}`);
    if (claimedManually) toggleMilestone(id);
    onClose();
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <MedalEmblem emoji={emoji} size={48} earned={lived} />
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-xl font-semibold text-cream">{meta.title}</h2>
          <p className="mt-0.5 text-sm text-cream/60">{meta.desc}</p>
        </div>
      </div>

      <div className="mt-4 aspect-video w-full overflow-hidden rounded-2xl ring-1 ring-white/10">
        {photo ? (
          <img src={photo} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="relative h-full w-full bg-graphite">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/memories/_empty-photo.png" alt="" className="h-full w-full object-cover" draggable={false} />
            <span className="absolute inset-x-0 bottom-2 px-6 text-center text-xs text-cream/45">{g.photoSub}</span>
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pick} />
      <Button size="lg" className="mt-4 w-full" disabled={busy} onClick={() => fileRef.current?.click()}>
        <Icon name="plus" className="h-4 w-4" /> {photo ? g.changePhoto : g.addPhoto}
      </Button>

      {!lived ? (
        <Button variant="secondary" className="mt-2 w-full" onClick={() => { toggleMilestone(id); onClose(); }}>
          {g.markLived}
        </Button>
      ) : (
        <button onClick={remove} className="mt-2 w-full py-2 text-center text-sm text-cream/45 hover:text-coral">
          {g.removeMoment}
        </button>
      )}
    </div>
  );
}
