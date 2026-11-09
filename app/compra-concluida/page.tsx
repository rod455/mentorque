"use client";

// A volta do checkout avulso (09/11/2026). A regra do destino é pura, em
// lib/app/voltaDaCompra.ts. No app, tenta reabrir o Mentorque sozinho e deixa
// o botão para quando o navegador não seguir o esquema sem um toque.
import { useEffect, useState } from "react";
import { voltaDaCompra, type VoltaDaCompra } from "@/lib/app/voltaDaCompra";

export default function CompraConcluidaPage() {
  const [volta, setVolta] = useState<VoltaDaCompra | null>(null);

  useEffect(() => {
    const v = voltaDaCompra(window.location.search);
    setVolta(v);
    window.location.replace(v.url);
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
        <p style={{ fontWeight: 600 }} data-compra-concluida>
          {volta?.cancelou ? "Compra cancelada. Nada foi cobrado." : "Pagamento recebido. Voltando para o Mentorque…"}
        </p>
        <p style={{ opacity: 0.6, fontSize: 13 }}>Se não abrir sozinho, toque no botão abaixo.</p>
        {volta && (
          <a
            href={volta.url}
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
            Voltar para o Mentorque
          </a>
        )}
      </div>
    </div>
  );
}
