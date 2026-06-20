"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Fade/slide a block into view on scroll. Honors prefers-reduced-motion
 * (renders immediately, no transform) via framer-motion's hook.
 */
export function Reveal({
  children,
  delay = 0,
  as = "div",
  className,
  y = 16,
}: {
  children: ReactNode;
  delay?: number;
  as?: "div" | "li" | "section" | "span";
  className?: string;
  y?: number;
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}
