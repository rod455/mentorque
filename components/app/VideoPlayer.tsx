"use client";

// In-app video player. Plays a direct file (self-hosted MP4/HLS via Supabase
// Storage, Cloudflare Stream, Mux, R2…) or embeds YouTube/Vimeo. The user never
// leaves the app.
type Media = { provider: "mp4" | "youtube" | "vimeo"; src: string; poster?: string };

// Accept a bare id or a full URL for embeds.
function youtubeEmbed(src: string): string {
  const m = src.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{6,})/);
  const id = m ? m[1] : src;
  return `https://www.youtube-nocookie.com/embed/${id}`;
}
function vimeoEmbed(src: string): string {
  const m = src.match(/(\d{6,})/);
  const id = m ? m[1] : src;
  return `https://player.vimeo.com/video/${id}`;
}

export function VideoPlayer({ media }: { media: Media }) {
  if (media.provider === "mp4") {
    return (
      <video
        controls
        playsInline
        preload="metadata"
        poster={media.poster}
        className="aspect-video w-full rounded-2xl bg-black ring-1 ring-white/10"
      >
        <source src={media.src} type="video/mp4" />
      </video>
    );
  }
  const src = media.provider === "youtube" ? youtubeEmbed(media.src) : vimeoEmbed(media.src);
  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl ring-1 ring-white/10">
      <iframe
        src={src}
        title="video"
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
      />
    </div>
  );
}
