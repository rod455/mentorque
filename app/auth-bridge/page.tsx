"use client";

import { useEffect, useState } from "react";

// Ponte de retorno do login social para o app das lojas.
//
// O problema: o GoTrue do Supabase recusa `mentorque://auth-callback` na
// validação de Redirect URLs — mesmo cadastrado, mesmo com curinga — e cai no
// Site URL. Resultado: a sessão nascia no site dentro da janelinha do Safari e
// o app continuava deslogado.
//
// A saída é não depender disso. O app pede o retorno para ESTA página, que é
// um endereço https comum e passa na validação sem discussão. Daqui, uma
// navegação para o esquema próprio entrega o código ao app — e isso o
// SFSafariViewController faz sem problema, porque é o iOS abrindo um app
// instalado, não o Supabase validando uma URL.
//
// Encaminha query e fragmento inteiros: serve tanto para PKCE (`?code=`)
// quanto para o fluxo implícito (`#access_token=`).
const SCHEME = "mentorque://auth-callback";

export default function AuthBridgePage() {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    const { search, hash } = window.location;
    const url = `${SCHEME}${search || ""}${hash || ""}`;
    setTarget(url);
    // Imediato: na maioria dos casos o app abre antes de a página pintar.
    window.location.replace(url);
  }, []);

  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100dvh",
        margin: 0,
        padding: "24px",
        textAlign: "center",
        background: "#16181d",
        color: "#f4f2ec",
        font: '15px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div>
        <p style={{ fontWeight: 600 }}>Voltando para o Mentorque…</p>
        <p style={{ opacity: 0.6, fontSize: 13 }}>Se não abrir sozinho, toque no botão abaixo.</p>
        {target && (
          <a
            href={target}
            style={{
              display: "inline-block",
              marginTop: 16,
              padding: "12px 24px",
              borderRadius: 999,
              background: "#f2a623",
              color: "#16181d",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Abrir o Mentorque
          </a>
        )}
      </div>
    </div>
  );
}
