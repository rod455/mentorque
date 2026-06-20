/* eslint-disable @next/next/no-img-element */
import { useI18n } from "@/lib/i18n";
import { IconDiagnose, IconTrack, IconCheck } from "@/lib/icons";

/**
 * Lightweight phone frame with a placeholder app screen. Decorative — the
 * meaningful alt text lives on the wrapper for assistive tech.
 */
export function PhoneMockup() {
  const { t, locale } = useI18n();
  const screen = locale === "pt"
    ? { greeting: "Bom dia, Rod", car: "Golf GTI · 2014", track: "Trilha · Freios", trackStep: "3 de 8 · Pastilhas e discos", progress: "38%", diag: "Diagnóstico", diagItem: "Barulho ao frear", diagHint: "4 causas prováveis", done: "Checklist de hoje" }
    : { greeting: "Morning, Rod", car: "Golf GTI · 2014", track: "Track · Brakes", trackStep: "3 of 8 · Pads and discs", progress: "38%", diag: "Diagnosis", diagItem: "Noise when braking", diagHint: "4 likely causes", done: "Today's checklist" };

  return (
    <div
      role="img"
      aria-label={t.hero.mockupAlt}
      className="relative mx-auto w-[280px] sm:w-[320px]"
    >
      <div className="relative rounded-[2.6rem] border border-white/10 bg-graphite-900 p-3 shadow-card">
        <div className="overflow-hidden rounded-[2rem] bg-graphite-800">
          {/* status bar */}
          <div className="flex items-center justify-between px-5 pt-4 text-[10px] text-cream/50">
            <span>9:41</span>
            <span className="flex gap-1">
              <img src="/logo/mark.svg" alt="" className="h-3.5 w-3.5" />
            </span>
          </div>
          {/* greeting */}
          <div className="px-5 pt-3">
            <p className="text-[11px] text-cream/50">{screen.greeting}</p>
            <p className="font-display text-base font-semibold text-cream">{screen.car}</p>
          </div>
          {/* track card */}
          <div className="mx-5 mt-4 rounded-2xl bg-graphite-700 p-4">
            <div className="flex items-center gap-2 text-amber">
              <IconTrack className="h-4 w-4" />
              <span className="text-[11px] font-medium uppercase tracking-wider">{screen.track}</span>
            </div>
            <p className="mt-2 text-sm font-medium text-cream">{screen.trackStep}</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-amber" style={{ width: screen.progress }} />
            </div>
          </div>
          {/* diagnose card */}
          <div className="mx-5 mt-3 rounded-2xl bg-graphite-700 p-4">
            <div className="flex items-center gap-2 text-teal">
              <IconDiagnose className="h-4 w-4" />
              <span className="text-[11px] font-medium uppercase tracking-wider">{screen.diag}</span>
            </div>
            <p className="mt-2 text-sm font-medium text-cream">{screen.diagItem}</p>
            <p className="text-[11px] text-cream/50">{screen.diagHint}</p>
          </div>
          {/* checklist row */}
          <div className="mx-5 mb-5 mt-3 flex items-center gap-2 rounded-2xl bg-graphite-700 p-4">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-teal/20 text-teal">
              <IconCheck className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm text-cream/80">{screen.done}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
