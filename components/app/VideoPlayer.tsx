"use client";

import { useEffect, useState } from "react";
import { isNativeApp } from "@/lib/app/wrapper";
import { siteOrigin } from "@/lib/app/apiBase";

// In-app video player. Plays a direct file (self-hosted MP4/HLS via Supabase
// Storage, Cloudflare Stream, Mux, R2…) or embeds YouTube/Vimeo. The user never
// leaves the app.
//
// No app empacotado a página vem de capacitor://localhost, que não é uma
// origem HTTP — e o player do YouTube exige uma, senão responde "Erro de
// configuração do player de vídeo". A saída é apontar o iframe para uma ponte
// no nosso site (/embed): de lá o YouTube enxerga uma origem https legítima e
// o vídeo toca DENTRO do app, sem mandar ninguém para o navegador.
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
  const ytSrc = native
    ? `${siteOrigin()}/embed?v=${id}`
    : `https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0&modestbranding=1`;
  const src = isYt ? ytSrc : vimeoEmbed(media.src);

  return (
    <div>
      <div className={`${frame} relative overflow-hidden rounded-2xl bg-graphite-900 ring-1 ring-white/10`}>
        <iframe
          src={src}
          title="video"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
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
