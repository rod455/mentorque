import { useI18n } from "@/lib/i18n";

/**
 * App Store / Google Play badges as placeholders. They render as buttons today
 * (no live link). When the app ships, set `href` to turn them into anchors.
 */
function Badge({
  store,
  caption,
  href,
}: {
  store: string;
  caption: string;
  href?: string;
}) {
  const inner = (
    <span className="flex items-center gap-3">
      <span aria-hidden className="text-cream/90">
        {store === "App Store" ? <AppleGlyph /> : <PlayGlyph />}
      </span>
      <span className="flex flex-col leading-tight text-left">
        <span className="text-[11px] text-cream/60">{caption}</span>
        <span className="font-display text-sm font-medium text-cream">{store}</span>
      </span>
    </span>
  );
  const cls =
    "inline-flex h-12 items-center rounded-xl bg-graphite-700 px-4 ring-1 ring-white/10 transition-colors hover:bg-graphite-600 focus-visible:outline-none";
  return href ? (
    <a href={href} className={cls}>
      {inner}
    </a>
  ) : (
    <button type="button" className={cls} aria-disabled="true" title={`${store} — ${caption}`}>
      {inner}
    </button>
  );
}

export function StoreBadges({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div className={`flex flex-wrap gap-3 ${className ?? ""}`}>
      <Badge store={t.hero.appStore} caption={t.hero.comingSoon} />
      <Badge store={t.hero.googlePlay} caption={t.hero.comingSoon} />
    </div>
  );
}

function AppleGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.4 12.7c0-2 1.6-2.9 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.3 2-1.4 2.4-.4 6 1 8 .7.9 1.4 2 2.5 2 1 0 1.3-.6 2.5-.6 1.2 0 1.5.6 2.5.6 1 0 1.7-.9 2.4-1.9.8-1.1 1.1-2.1 1.1-2.2-.1 0-2.1-.8-2.1-3.2zM14.6 6.3c.5-.7.9-1.6.8-2.6-.8 0-1.8.6-2.4 1.3-.5.6-1 1.6-.8 2.5.9.1 1.8-.5 2.4-1.2z" />
    </svg>
  );
}

function PlayGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 3.3c-.3.2-.5.6-.5 1.1v15.2c0 .5.2.9.5 1.1l8.2-8.7L4 3.3z" opacity=".9" />
      <path d="m14.7 9.3-2.5 2.7 2.5 2.7 3-1.7c.8-.5.8-1.5 0-2l-3-1.7z" />
      <path d="m4 3.3 8.2 8.7 2.5-2.7L5.4 2.7c-.6-.3-1.1-.2-1.4.6z" opacity=".7" />
      <path d="m12.2 12 -8.2 8.7c.3.8.8.9 1.4.6l9.3-5.3-2.5-3z" opacity=".5" />
    </svg>
  );
}
