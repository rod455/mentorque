"use client";

import { useRef, useState } from "react";
import { lerImagem, resizeImage, type ImagemLida } from "@/lib/app/image";
import { precisaDeAjuste } from "@/lib/app/recorte";
import { AjusteDeFoto } from "./AjusteDeFoto";
import { Sheet } from "./ui";

// O lado da foto do carro que fica guardada. As molduras onde ela aparece são
// todas quadradas e pequenas (h-12 a h-16, object-cover), então 800 sobra até
// para tela de 3x; e é quadrado porque a moldura é quadrada, e o ajuste
// entrega exatamente o que estava dentro dela.
const LADO_DA_FOTO_DO_CARRO = 800;

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
  // A foto escolhida esperando a pessoa dizer qual pedaço fica. Enquanto isto
  // tem valor, a tela de ajuste está por cima de tudo.
  const [ajustando, setAjustando] = useState<ImagemLida | null>(null);

  // A foto passa pelo ajuste QUANDO PRECISA (pedido do dono, 07/09/2026: "se
  // for grande, aparece um campo para selecionar qual parte"). A regra de
  // quando é em lib/app/recorte.ts; uma foto já quadrada e pequena entra direto
  // como sempre entrou.
  const onFile = async (file?: File) => {
    if (!file) return;
    try {
      const lida = await lerImagem(file);
      if (precisaDeAjuste(lida, { largura: LADO_DA_FOTO_DO_CARRO, altura: LADO_DA_FOTO_DO_CARRO })) {
        setAjustando(lida);
        return;
      }
      onSelect(await resizeImage(file));
      onClose();
    } catch {
      /* ignore */
    }
  };

  if (ajustando) {
    return (
      <AjusteDeFoto
        fonte={ajustando}
        alvo={LADO_DA_FOTO_DO_CARRO}
        onConfirmar={(foto) => { setAjustando(null); onSelect(foto); onClose(); }}
        onCancelar={() => setAjustando(null)}
      />
    );
  }

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

      {/* O `value = ""` depois de ler: sem ele, escolher o MESMO arquivo de novo
          (para ajustar diferente) não dispara onChange, e o toque morre calado. */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; void onFile(f); }}
      />
    </Sheet>
  );
}
