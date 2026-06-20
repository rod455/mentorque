import type { ReactNode } from "react";

type Theme = "dark" | "light" | "graphite-800";

const bg: Record<Theme, string> = {
  dark: "bg-graphite text-cream",
  "graphite-800": "bg-graphite-800 text-cream",
  light: "bg-cream text-ink",
};

/**
 * Section shell. Controls the "sandwich" backgrounds (dark transitions / light
 * content) and consistent vertical rhythm. No decorative stripes.
 */
export function Section({
  id,
  theme = "dark",
  className,
  children,
  containerClassName,
}: {
  id?: string;
  theme?: Theme;
  className?: string;
  children: ReactNode;
  containerClassName?: string;
}) {
  return (
    <section
      id={id}
      className={`relative scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24 ${bg[theme]} ${className ?? ""}`}
    >
      <div className={`mx-auto w-full max-w-content ${containerClassName ?? ""}`}>{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  theme = "dark",
  className,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  theme?: "dark" | "light";
  className?: string;
}) {
  const muted = theme === "dark" ? "text-cream/70" : "text-ink/70";
  return (
    <div className={`max-w-2xl ${className ?? ""}`}>
      {eyebrow ? (
        <p className="mb-3 font-display text-sm font-medium uppercase tracking-[0.14em] text-amber">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-balance text-3xl font-semibold leading-tight sm:text-4xl">{title}</h2>
      {intro ? <p className={`mt-4 text-lg leading-relaxed ${muted}`}>{intro}</p> : null}
    </div>
  );
}
