"use client";

import { useId, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { IconCheck } from "@/lib/icons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type Status = "idle" | "loading" | "success" | "error";

export function WaitlistForm({
  theme = "dark",
  className,
}: {
  theme?: "dark" | "light";
  className?: string;
}) {
  const { t, locale } = useI18n();
  const w = t.waitlist;
  const inputId = useId();
  const errorId = `${inputId}-error`;

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const light = theme === "light";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!value) return fail(w.errorRequired);
    if (!EMAIL_RE.test(value)) return fail(w.errorEmail);

    setError(null);
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "request_failed");
      setStatus("success");
    } catch {
      fail(w.errorGeneric);
    }
  }

  function fail(msg: string) {
    setError(msg);
    setStatus("error");
  }

  if (status === "success") {
    return (
      <div
        className={`flex items-start gap-3 rounded-2xl p-5 ${
          light ? "bg-teal/10 text-ink" : "bg-teal/15 text-cream"
        }`}
        role="status"
        aria-live="polite"
      >
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-teal text-white">
          <IconCheck className="h-4 w-4" />
        </span>
        <div>
          <p className="font-display text-base font-semibold">{w.successTitle}</p>
          <p className={`mt-1 text-sm ${light ? "text-ink/70" : "text-cream/70"}`}>{w.successBody}</p>
          <button
            type="button"
            onClick={() => {
              setEmail("");
              setStatus("idle");
            }}
            className="mt-2 text-sm font-medium text-teal underline-offset-2 hover:underline"
          >
            {w.again}
          </button>
        </div>
      </div>
    );
  }

  const inputBase = light
    ? "bg-white text-ink ring-1 ring-ink/15 placeholder:text-ink/40"
    : "bg-white/5 text-cream ring-1 ring-white/15 placeholder:text-cream/40";

  return (
    <form onSubmit={onSubmit} noValidate className={className}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor={inputId} className="sr-only">
            {w.emailLabel}
          </label>
          <input
            id={inputId}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={w.placeholder}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") {
                setStatus("idle");
                setError(null);
              }
            }}
            aria-invalid={status === "error"}
            aria-describedby={error ? errorId : undefined}
            disabled={status === "loading"}
            className={`h-13 w-full rounded-xl px-4 py-3.5 text-base outline-none transition focus-visible:ring-2 focus-visible:ring-amber ${inputBase}`}
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-amber px-6 py-3.5 font-display text-base font-medium text-graphite transition-all hover:bg-amber-300 hover:shadow-glow active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "loading" ? (
            <>
              <Spinner /> {w.loading}
            </>
          ) : (
            w.button
          )}
        </button>
      </div>
      {error ? (
        <p id={errorId} role="alert" className={`mt-2 text-sm ${light ? "text-coral" : "text-coral-600"}`}>
          {error}
        </p>
      ) : (
        <p className={`mt-2 text-xs ${light ? "text-ink/55" : "text-cream/50"}`}>{w.privacy}</p>
      )}
    </form>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
