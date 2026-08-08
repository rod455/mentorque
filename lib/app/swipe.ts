"use client";

import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent, TouchEvent as ReactTouchEvent } from "react";

// Gesto de arrastar na horizontal (voltar / avançar tela).
//
// Por que não basta pointerdown + pointerup: num container que rola, o
// navegador CANCELA o ponteiro assim que decide que o dedo está rolando. A
// sequência real num celular é
//
//     pointerdown → touchstart → pointercancel → touchend
//
// — sem `pointerup` nenhum. Quem escuta só `pointerup` funciona no mouse e
// nunca no aparelho, que é exatamente onde o gesto importa. Por isso o toque é
// tratado por touchstart/touchend (que sempre chegam, com a posição final em
// `changedTouches`) e os ponteiros ficam só para mouse e trackpad.

type Opts = {
  onRight?: () => void; // esquerda → direita (voltar)
  onLeft?: () => void;  // direita → esquerda (avançar)
  minX?: number;        // distância mínima para valer como gesto
};

// Um arrasto que começa dentro de um carrossel é do carrossel, não da tela.
// Sem isto, rolar as capas para o lado sairia da tela por baixo do pano.
function dentroDeCarrossel(alvo: EventTarget | null, limite: Element | null): boolean {
  let el = alvo instanceof Element ? alvo : null;
  while (el && el !== limite) {
    const st = getComputedStyle(el);
    if ((st.overflowX === "auto" || st.overflowX === "scroll") && el.scrollWidth > el.clientWidth + 8) return true;
    el = el.parentElement;
  }
  return false;
}

export function useSwipe({ onRight, onLeft, minX = 60 }: Opts) {
  const inicio = useRef<{ x: number; y: number } | null>(null);

  const comecar = (x: number, y: number, alvo: EventTarget | null, limite: Element | null) => {
    inicio.current = dentroDeCarrossel(alvo, limite) ? null : { x, y };
  };

  const terminar = (x: number, y: number) => {
    const de = inicio.current;
    inicio.current = null;
    if (!de) return;
    const dx = x - de.x;
    const dy = y - de.y;
    // Precisa ser claramente horizontal: senão qualquer rolagem meio torta
    // trocaria de tela.
    if (Math.abs(dx) < minX || Math.abs(dx) <= Math.abs(dy) * 1.5) return;
    if (dx > 0) onRight?.();
    else onLeft?.();
  };

  return {
    onTouchStart: (e: ReactTouchEvent) => {
      const t = e.changedTouches[0];
      if (t) comecar(t.clientX, t.clientY, e.target, e.currentTarget);
    },
    onTouchEnd: (e: ReactTouchEvent) => {
      const t = e.changedTouches[0];
      if (t) terminar(t.clientX, t.clientY);
    },
    // Mouse e trackpad não são cancelados; e sem este filtro o toque seria
    // contado duas vezes, já que ele também emite eventos de ponteiro.
    onPointerDown: (e: ReactPointerEvent) => {
      if (e.pointerType === "mouse") comecar(e.clientX, e.clientY, e.target, e.currentTarget);
    },
    onPointerUp: (e: ReactPointerEvent) => {
      if (e.pointerType === "mouse") terminar(e.clientX, e.clientY);
    },
  };
}
