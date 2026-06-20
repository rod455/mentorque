/* eslint-disable @next/next/no-img-element */
type Variant = "lockup-dark" | "lockup-light" | "mark";

const SRC: Record<Variant, string> = {
  "lockup-dark": "/logo/lockup-dark.svg",
  "lockup-light": "/logo/lockup-light.svg",
  mark: "/logo/mark.svg",
};

export function Logo({
  variant = "lockup-dark",
  className,
  priority,
}: {
  variant?: Variant;
  className?: string;
  priority?: boolean;
}) {
  return (
    <img
      src={SRC[variant]}
      alt="Mentorque"
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
    />
  );
}
