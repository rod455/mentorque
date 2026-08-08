"use client";

import { useEffect, useState } from "react";
import { isNativeApp, openExternal } from "@/lib/app/wrapper";

// In-app video player. Plays a direct file (self-hosted MP4/HLS via Supabase
// Storage, Cloudflare Stream, Mux, R2…) or embeds YouTube/Vimeo. The user never
// leaves the app.
//
// Exceção: no app empacotado a página vem de capacitor://localhost, que não é
// uma origem HTTP. O player do YouTube exige origem válida e responde com
// "Erro de configuração do player de vídeo". Por isso, no nativo, mostramos a
// capa do vídeo e abrimos na aba do sistema (SFSafariViewController no iOS) —
// que é a mesma solução que a Apple sugere para conteúdo web.
//
// `vertical` marca conteúdo 9:16 (Shorts/Reels): sem isso o vídeo em pé entra
// numa moldura 16:9 e fica minúsculo entre duas tarjas pretas.
type Media = { provider: "mp4" | "youtube" | "vimeo"; src: string; poster?: string; vertical?: boolean };

// Accept a bare id or a full URL for embeds.
function youtubeId(src: string): string {
  const m = src.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{6,})/);
  return m ? m[1] : src;
}
function vimeoEmbed(src: string): string {
  const m = src.match(/(\d{6,})/);
  const id = m ? m[1] : src;
  return `https://player.vimeo.com/video/${id}`;
}

export function VideoPlayer({ media }: { media: Media }) {
  // Só depois da montagem: no HTML gerado pela exportação estática ainda não
  // existe Capacitor, então decidir no render daria diferença na hidratação.
  const [native, setNative] = useState(false);
  useEffect(() => setNative(isNativeApp()), []);

  // Vídeo em pé ocupa a tela inteira se deixar solto — limita a largura e
  // centraliza, mantendo a proporção original.
  const frame = media.vertical
    ? "mx-auto aspect-[9/16] w-full max-w-[16rem]"
    : "aspect-video w-full";

  if (media.provider === "mp4") {
    return (
      <video
        controls
        playsInline
        preload="metadata"
        poster={media.poster}
        className={`${frame} rounded-2xl bg-black ring-1 ring-white/10`}
      >
        <source src={media.src} type="video/mp4" />
      </video>
    );
  }

  const isYt = media.provider === "youtube";
  const id = isYt ? youtubeId(media.src) : "";
  const src = isYt ? `https://www.youtube-nocookie.com/embed/${id}` : vimeoEmbed(media.src);
  const watchUrl = `https://www.youtube.com/watch?v=${id}`;

  return (
    <div>
      <div className={`${frame} relative overflow-hidden rounded-2xl bg-graphite-900 ring-1 ring-white/10`}>
        {isYt && native ? (
          <button onClick={() => openExternal(watchUrl)} className="group relative h-full w-full" aria-label="Assistir o vídeo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
              alt=""
              className="h-full w-full object-cover opacity-70"
              draggable={false}
            />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-amber text-graphite shadow-lg">
                <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-7 w-7"><path d="M8 5v14l11-7z" /></svg>
              </span>
            </span>
          </button>
        ) : (
          <iframe
            src={src}
            title="video"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        )}
      </div>
      {/* Saída de emergência: se o embed falhar (rede corporativa, incorporação
          desativada no vídeo), o motorista ainda consegue assistir. */}
      {isYt && (
        <a
          href={`https://www.youtube.com/watch?v=${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-center text-xs text-cream/45 underline underline-offset-2 hover:text-amber"
        >
          Assistir no YouTube
        </a>
      )}
    </div>
  );
}
