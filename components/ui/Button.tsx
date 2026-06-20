import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-display font-medium transition-all duration-200 focus-visible:outline-none disabled:opacity-60 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-amber text-graphite hover:bg-amber-300 hover:shadow-glow active:translate-y-px",
  secondary:
    "bg-graphite-700 text-cream hover:bg-graphite-600 ring-1 ring-white/10 active:translate-y-px",
  ghost:
    "bg-transparent text-cream hover:bg-white/5 ring-1 ring-white/15 active:translate-y-px",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base py-3.5",
};

function classes(variant: Variant, size: Size, className?: string) {
  return [base, variants[variant], sizes[size], className].filter(Boolean).join(" ");
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: { variant?: Variant; size?: Size; children: ReactNode } & ComponentProps<"button">) {
  return (
    <button className={classes(variant, size, className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  ...props
}: { variant?: Variant; size?: Size; children: ReactNode; href: string } & Omit<
  ComponentProps<typeof Link>,
  "href"
>) {
  return (
    <Link href={href} className={classes(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
