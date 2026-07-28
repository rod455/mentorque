"use client";

import { useRef } from "react";
import { resizeImage } from "@/lib/app/image";
import { Sheet } from "./ui";

// Mentorque fleet avatars (512x512 transparent PNGs in /public/avatars).
// Everyday cars first, then the "dream garage" sports set.
export const AVATARS = [
  "avatar-fusca-azul",
  "avatar-hatch-vermelho",
  "avatar-sedan-prata",
  "avatar-sedan-grafite",
  "avatar-city-teal",
  "avatar-suv-branco",
  "avatar-suv-verde",
  "avatar-jipe-verde",
  "avatar-picape-azul",
  "avatar-picape-ambar",
  "avatar-perua-vinho",
  "avatar-minivan-azul",
  "avatar-kombi",
  "avatar-van-entrega",
  "avatar-utilitaria-laranja",
  "avatar-taxi-amarelo",
  "avatar-eletrico-branco",
  "avatar-classico-verde",
  "avatar-esportivo-amarelo",
  "avatar-muscle-preto",
  "avatar-supercarro-vermelho",
  "avatar-coupe-classico-prata",
  "avatar-turbo-japones-branco",
  "avatar-muscle-moderno-grafite",
  "avatar-roadster-verde",
  "avatar-hipercarro-preto",
  "avatar-rally-azul",
  "avatar-gt-classico-vermelho",
  "avatar-track-laranja",
  "avatar-eletrico-futurista",
].map((name) => `/avatars/${name}.png`);

type Labels = { title: string; sub: string; addPhoto: string; remove: string };

// Bottom sheet to pick a car avatar, upload a photo, or remove it.
export function AvatarPickerSheet({
  open,
  onClose,
  photo,
  onSelect,
  labels,
}: {
  open: boolean;
  onClose: () => void;
  photo?: string;
  onSelect: (photo: string | undefined) => void;
  labels: Labels;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (file?: File) => {
    if (!file) return;
    try {
      onSelect(await resizeImage(file));
      onClose();
    } catch {
      /* ignore */
    }
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <h2 className="font-display text-xl font-bold text-cream">{labels.title}</h2>
      <p className="mt-1 text-sm text-cream/55">{labels.sub}</p>

      <div className="mt-3 grid max-h-[46vh] grid-cols-4 gap-2 overflow-y-auto pr-1">
        {AVATARS.map((src) => {
          const active = photo === src;
          return (
            <button
              key={src}
              type="button"
              onClick={() => { onSelect(src); onClose(); }}
              className={`grid aspect-square place-items-center overflow-hidden rounded-xl bg-graphite-700 ring-1 transition-colors ${active ? "ring-amber" : "ring-white/10 hover:ring-amber/40"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-contain p-1" draggable={false} />
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-4 flex w-full items-center gap-3 rounded-xl bg-graphite-700 px-3.5 py-3 text-left ring-1 ring-white/10 hover:ring-amber/30"
      >
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-graphite-800 text-cream/60">📷</span>
        <span className="text-sm text-cream/80">{labels.addPhoto}</span>
      </button>

      {photo && (
        <button
          type="button"
          onClick={() => { onSelect(undefined); onClose(); }}
          className="mt-2 w-full py-1.5 text-center text-sm text-coral/80 hover:text-coral"
        >
          {labels.remove}
        </button>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
    </Sheet>
  );
}
