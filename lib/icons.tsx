import type { SVGProps } from "react";

/**
 * Mentorque icon set — a single coherent line family: 24px grid, 1.7 stroke,
 * round caps/joins, currentColor. Drawn in-house (no generic icon pack).
 */
type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function Base({ title, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

// Learning tracks — graduation cap over a progress path
export const IconTrack = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 8.5 12 4l9 4.5-9 4.5z" />
    <path d="M7 10.5V15c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-4.5" />
    <path d="M21 8.5V13" />
  </Base>
);

// Symptom diagnosis — magnifier reading a pulse/waveform
export const IconDiagnose = (p: IconProps) => (
  <Base {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m20 20-4.2-4.2" />
    <path d="M7.5 11h1.6l1.2-2.4 1.6 4 1-1.6h1.6" />
  </Base>
);

// Real tools — wrench
export const IconTools = (p: IconProps) => (
  <Base {...p}>
    <path d="M14.8 6.3a3.6 3.6 0 0 0-4.9 4.2L4 16.4 7.6 20l5.9-5.9a3.6 3.6 0 0 0 4.2-4.9l-2.3 2.3-2.1-.5-.5-2.1z" />
    <path d="M6.4 17.6h.01" />
  </Base>
);

// Consulting — speech bubble with a headset dot (human help)
export const IconConsult = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v6A2.5 2.5 0 0 1 17.5 15H10l-4 4v-4H6.5A2.5 2.5 0 0 1 4 12.5z" />
    <path d="M9.5 9.2a2.5 2.5 0 0 1 5 0" />
    <path d="M9.5 9.2v1.4M14.5 9.2v1.4" />
  </Base>
);

// Built for your car — car silhouette
export const IconCar = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 13.5l1.6-4.2A2 2 0 0 1 6.5 8h11a2 2 0 0 1 1.9 1.3l1.6 4.2" />
    <path d="M3 13.5h18v3.2a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-.7H6.5v.7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
    <path d="M6.5 15.4h.01M17.5 15.4h.01" />
  </Base>
);

// Community & lives — people
export const IconCommunity = (p: IconProps) => (
  <Base {...p}>
    <circle cx="9" cy="8.5" r="2.8" />
    <path d="M3.5 18.5a5.5 5.5 0 0 1 11 0" />
    <path d="M16 6.2a2.6 2.6 0 0 1 0 5" />
    <path d="M17 13.4a5.5 5.5 0 0 1 3.5 5.1" />
  </Base>
);

// Generic check (benefits)
export const IconCheck = (p: IconProps) => (
  <Base {...p}>
    <path d="m5 12.5 4 4 10-10.5" />
  </Base>
);

export const IconArrow = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Base>
);

export const ICONS = {
  track: IconTrack,
  diagnose: IconDiagnose,
  tools: IconTools,
  consult: IconConsult,
  car: IconCar,
  community: IconCommunity,
} as const;

export type IconName = keyof typeof ICONS;
