import type { ReactNode } from "react";

// Shared chrome + typography for the legal pages (privacy, etc.). Server
// component, no client hooks — these pages are static and indexable.
export function LegalPage({
  title,
  updated,
  altHref,
  altLabel,
  homeLabel,
  children,
}: {
  title: string;
  updated: string;
  altHref: string;
  altLabel: string;
  homeLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-graphite text-cream">
      <header className="border-b border-white/5">
        <div className="mx-auto flex h-16 w-full max-w-2xl items-center justify-between px-5 sm:px-8">
          <a href="/" className="inline-flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber/15 font-display text-sm font-bold text-amber">M</span>
            <span className="font-serif text-lg font-semibold text-cream">Mentorque</span>
          </a>
          <a href={altHref} className="text-sm font-medium text-cream/60 hover:text-cream">{altLabel}</a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-8">
        <h1 className="font-serif text-3xl font-bold text-cream">{title}</h1>
        <p className="mt-2 text-sm text-cream/50">{updated}</p>

        <div
          className="mt-9 text-[15px] leading-relaxed text-cream/75
            [&_a]:text-amber [&_a]:underline [&_a]:underline-offset-2
            [&_h2]:mt-9 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-cream
            [&_h3]:mt-5 [&_h3]:font-display [&_h3]:text-[15px] [&_h3]:font-semibold [&_h3]:text-cream/90
            [&_p]:mt-3
            [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5
            [&_li]:marker:text-cream/30
            [&_strong]:text-cream/90"
        >
          {children}
        </div>

        <div className="mt-12 border-t border-white/5 pt-6 text-sm">
          <a href="/" className="text-amber hover:text-amber-300">← {homeLabel}</a>
          <p className="mt-4 text-xs text-cream/40">© 2026 Mentorque</p>
        </div>
      </main>
    </div>
  );
}
