"use client";

import { useEffect, useState } from "react";

// Ponte de vídeo para o app das lojas.
//
// No app empacotado a página vem de `capacitor://localhost`, que não é uma
// origem HTTP. O player do YouTube exige uma e responde "Erro de configuração
// do player de vídeo" — foi o que aparecia no iPhone.
//
// Esta página resolve isso sendo o intermediário: o app abre um iframe apontado
// para cá (https://mentorque.com.br/embed?v=ID) e, de dentro daqui, o iframe do
// YouTube enxerga uma origem https legítima. O vídeo toca DENTRO do app, sem
// mandar ninguém para o navegador.
//
// Nada além do player mora aqui: sem cabeçalho, sem margem, sem rolagem.
export default function EmbedPage() {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    // Lido do próprio endereço em vez de useSearchParams: assim a página
    // continua exportável como estática, sem exigir Suspense.
    const raw = new URLSearchParams(window.location.search).get("v") ?? "";
    // Aceita id puro ou URL completa (watch, youtu.be, embed, shorts).
    const m = raw.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{6,})/);
    const clean = (m ? m[1] : raw).trim();
    setId(/^[\w-]{6,}$/.test(clean) ? clean : null);
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", overflow: "hidden" }}>
      {id ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0&modestbranding=1`}
          title="video"
          style={{ width: "100%", height: "100%", border: 0 }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <p
          style={{
            display: "grid",
            placeItems: "center",
            height: "100%",
            margin: 0,
            color: "#f4f2ec",
            font: '14px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
            opacity: 0.6,
          }}
        >
          Vídeo não encontrado.
        </p>
      )}
    </div>
  );
}
