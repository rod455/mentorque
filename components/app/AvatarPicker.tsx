"use client";

import { useRef } from "react";
import { resizeImage } from "@/lib/app/image";
import { Sheet } from "./ui";

// Standard car "avatars" (placeholder until custom art is uploaded).
export const CAR_AVATARS = ["🚗", "🚙", "🏎️", "🚕", "🛻", "🚐", "🚓", "🏍️", "🛵", "🚜"];

// Render an emoji avatar to a small PNG data URL so it works anywhere a car
// photo is shown (car list, hub, etc.) with the existing <img> code.
export function emojiToDataUrl(emoji: string): string {
  if (typeof document === "undefined") return "";
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.font = "92px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, size / 2, size / 2 + 6);
  return canvas.toDataURL("image/png");
}

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

      <div className="mt-3 grid grid-cols-5 gap-2">
        {CAR_AVATARS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => { onSelect(emojiToDataUrl(emoji)); onClose(); }}
            className="grid aspect-square place-items-center rounded-xl bg-graphite-700 text-2xl ring-1 ring-white/10 transition-colors hover:ring-amber/40"
            aria-label={`Avatar ${emoji}`}
          >
            {emoji}
          </button>
        ))}
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
