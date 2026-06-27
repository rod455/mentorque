"use client";

import { useEffect, useState } from "react";
import { usePrototype } from "@/lib/app/store";
import {
  fetchComplaints,
  fetchRecalls,
  fetchSafety,
  type ComplaintsSummary,
  type RecallItem,
  type SafetyRating,
} from "@/lib/app/vehicleClient";
import { Card, Icon, SectionTitle, useContent } from "./ui";

type State = {
  loading: boolean;
  recalls: RecallItem[] | null;
  complaints: ComplaintsSummary | null;
  safety: SafetyRating | null;
  failed: boolean;
};

// Live recalls / complaints / safety from NHTSA for the registered vehicle.
// NHTSA is US-market, so BR-only models legitimately return nothing — we show a
// clear source note instead of an error.
export function SafetyPanel() {
  const c = useContent();
  const s = c.safety;
  const { s: session } = usePrototype();
  const v = session.vehicle;

  const [state, setState] = useState<State>({ loading: true, recalls: null, complaints: null, safety: null, failed: false });

  useEffect(() => {
    if (!v) return;
    let alive = true;
    setState({ loading: true, recalls: null, complaints: null, safety: null, failed: false });
    Promise.allSettled([
      fetchRecalls(v.make, v.model, v.year),
      fetchComplaints(v.make, v.model, v.year),
      fetchSafety(v.make, v.model, v.year),
    ]).then(([rc, cp, sf]) => {
      if (!alive) return;
      const recalls = rc.status === "fulfilled" ? rc.value : [];
      const complaints = cp.status === "fulfilled" ? cp.value : null;
      const safety = sf.status === "fulfilled" ? sf.value : null;
      const failed = rc.status !== "fulfilled" && cp.status !== "fulfilled" && sf.status !== "fulfilled";
      setState({ loading: false, recalls, complaints, safety, failed });
    });
    return () => {
      alive = false;
    };
  }, [v]);

  if (!v) return null;

  const { loading, recalls, complaints, safety, failed } = state;
  const noData = !loading && (failed || ((recalls?.length ?? 0) === 0 && !(complaints && complaints.count > 0) && !safety));

  return (
    <div>
      <SectionTitle action={<span className="text-[11px] font-normal text-cream/40">{s.source}</span>}>{s.title}</SectionTitle>

      {loading ? (
        <div className="flex items-center gap-2 rounded-xl bg-graphite-800 px-3.5 py-3 text-sm text-cream/60 ring-1 ring-white/5">
          <Spinner /> {s.loading}
        </div>
      ) : noData ? (
        <div className="flex items-start gap-2 rounded-xl bg-graphite-800 px-3.5 py-3 text-sm text-cream/55 ring-1 ring-white/5">
          <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0 text-cream/40" />
          {s.noMatch}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Recalls */}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-cream/45">
              {recalls && recalls.length > 0 ? s.recallsFound.replace("{n}", String(recalls.length)) : s.recallsTitle}
            </p>
            {recalls && recalls.length > 0 ? (
              recalls.slice(0, 5).map((r, i) => (
                <Card key={r.campaign || i} className="ring-coral/20">
                  <div className="flex items-center gap-2 text-coral">
                    <Icon name="alert" className="h-4 w-4" />
                    <span className="flex-1 font-display text-[15px] text-cream">{r.component || r.campaign}</span>
                    {r.date && <span className="text-xs text-cream/45">{r.date}</span>}
                  </div>
                  {r.summary && <p className="mt-2 text-sm text-cream/80">{r.summary}</p>}
                  {r.remedy && (
                    <p className="mt-2 text-sm text-cream/65">
                      <span className="text-cream/45">{s.remedy}: </span>
                      {r.remedy}
                    </p>
                  )}
                </Card>
              ))
            ) : (
              <div className="flex items-center gap-2 rounded-xl bg-graphite-800 px-3.5 py-3 text-sm text-cream/60 ring-1 ring-white/5">
                <span className="text-teal">✓</span>
                {s.recallsNone}
              </div>
            )}
          </div>

          {/* Safety rating */}
          {safety && (safety.overall || safety.frontCrash || safety.sideCrash || safety.rollover) && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-cream/45">{s.ratingTitle}</p>
              <Card className="space-y-2">
                <Stars label={s.ratingOverall} value={safety.overall} highlight />
                <Stars label={s.ratingFront} value={safety.frontCrash} />
                <Stars label={s.ratingSide} value={safety.sideCrash} />
                <Stars label={s.ratingRollover} value={safety.rollover} />
              </Card>
            </div>
          )}

          {/* Complaints */}
          {complaints && complaints.count > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-cream/45">{s.complaintsTitle}</p>
              <Card>
                <p className="font-display text-[15px] text-cream">{s.complaintsCount.replace("{n}", String(complaints.count))}</p>
                {complaints.components.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {complaints.components.map((cm) => (
                      <span key={cm.name} className="rounded-full bg-graphite-700 px-2.5 py-1 text-xs text-cream/75">
                        {cm.name} · {cm.count}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stars({ label, value, highlight }: { label: string; value: string | null; highlight?: boolean }) {
  const n = value ? parseInt(value, 10) : NaN;
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={`text-sm ${highlight ? "text-cream" : "text-cream/65"}`}>{label}</span>
      {Number.isFinite(n) && n >= 1 && n <= 5 ? (
        <span className="flex items-center gap-0.5" aria-label={`${n}/5`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < n ? "text-amber" : "text-white/15"}>★</span>
          ))}
        </span>
      ) : (
        <span className="text-sm text-cream/40">{value ?? "—"}</span>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin text-cream/60" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
