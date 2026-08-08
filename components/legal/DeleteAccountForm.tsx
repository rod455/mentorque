"use client";

import { useState } from "react";
import { apiUrl } from "@/lib/app/apiBase";

// Formulário público de solicitação de exclusão de conta (LGPD / Google Play).
// Envia a solicitação por e-mail via /api/feedback (Resend).
export function DeleteAccountForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || state === "sending") return;
    setState("sending");
    try {
      const res = await fetch(apiUrl("/api/feedback"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: "deletion",
          email: email.trim(),
          name: email.trim(),
          message: `Solicitação de exclusão de conta e dados.\nE-mail da conta: ${email.trim()}${message.trim() ? `\n\nObservações: ${message.trim()}` : ""}`,
        }),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <div style={{ background: "#eaf6ef", border: "1px solid #bfe3cd", borderRadius: 12, padding: 16, color: "#1c5c38" }}>
        <strong>Solicitação enviada. ✅</strong>
        <p style={{ margin: "6px 0 0" }}>
          Vamos confirmar pelo seu e-mail e concluir a exclusão da conta e dos dados em até 30 dias.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 10, maxWidth: 480 }}>
      <label style={{ fontWeight: 600 }}>
        E-mail da conta
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@email.com"
          style={{ display: "block", width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 10, border: "1px solid #d8d3c6", fontSize: 15 }}
        />
      </label>
      <label style={{ fontWeight: 600 }}>
        Observações (opcional)
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Algo que devamos saber?"
          style={{ display: "block", width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 10, border: "1px solid #d8d3c6", fontSize: 15, resize: "vertical" }}
        />
      </label>
      <button
        type="submit"
        disabled={state === "sending"}
        style={{ background: "#c0392b", color: "#fff", border: 0, borderRadius: 999, padding: "12px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: state === "sending" ? 0.6 : 1 }}
      >
        {state === "sending" ? "Enviando…" : "Solicitar exclusão da conta"}
      </button>
      {state === "error" && (
        <p style={{ color: "#c0392b", margin: 0 }}>
          Não foi possível enviar. Tente novamente ou escreva para contato@mentorque.com.br.
        </p>
      )}
    </form>
  );
}
