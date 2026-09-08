import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GUIAS } from "@/lib/site/guias";

// O cartão de compartilhamento de cada guia (1200 por 630, o formato que
// WhatsApp, Instagram e buscadores mostram ao lado de um link).
//
// Até 08/09/2026 os quatro guias apontavam para a mesma imagem genérica da
// home, então um link de "carro não pega" e um de "luz da injeção" mostravam o
// mesmo cartão. Aqui o título do guia vira a imagem, com as fontes da marca,
// pelo mesmo `next/og` que desenha as peças de rede social (app/api/pecas).
//
// SÓ EXISTE NO SITE. A exportação estática do app não suporta rota dinâmica
// com desenho, e o app não compartilha guia: por isso `og` está em SO_NO_SITE
// no scripts/build-native.mjs, e a `conferir:guias` cobra que continue.
export const runtime = "nodejs";

const fonte = (arquivo: string) => readFileSync(join(process.cwd(), "assets/fontes", arquivo));

export async function GET(_req: Request, { params }: { params: { guia: string } }) {
  const g = GUIAS.find((x) => x.caminho === `/${params.guia}`);
  if (!g) return new Response("guia desconhecido", { status: 404 });

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: 1200,
          height: 630,
          padding: 72,
          background: "#16181D",
          color: "#F4F2EC",
          fontFamily: "IN",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 600, letterSpacing: 4, color: "#F2A623" }}>
            {g.rotulo.toUpperCase()}
          </div>
          <div style={{ display: "flex", marginTop: 28, fontFamily: "SG", fontSize: 64, lineHeight: 1.1, fontWeight: 700 }}>
            {g.h1}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 600 }}>Mentorque</div>
          <div style={{ display: "flex", fontSize: 26, color: "rgba(244,242,236,0.6)" }}>mentorque.com.br</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "SG", data: fonte("space-grotesk-700.ttf"), weight: 700, style: "normal" },
        { name: "IN", data: fonte("inter-600.ttf"), weight: 600, style: "normal" },
      ],
    }
  );
}
