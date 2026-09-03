"use client";

import { useEffect } from "react";
import { capturaCampanha } from "@/lib/app/campanha";

/**
 * Guarda a campanha da chegada, em QUALQUER página do site.
 *
 * Mora no layout raiz de propósito. Antes de 03/09/2026 essa captura vivia
 * dentro do componente da landing de tráfego pago, e por isso só funcionava
 * lá: clique de anúncio que caísse na home, numa página de conteúdo ou direto
 * no app perdia a campanha na chegada. O anúncio de busca do lançamento gastou
 * R$ 44,16 em 23 cliques e não deixou um único evento etiquetado.
 *
 * Um componente que não desenha nada e vive no layout é o menor jeito de
 * garantir que a etiqueta seja lida antes de a pessoa fazer qualquer coisa.
 */
export function CapturaDeCampanha() {
  useEffect(() => {
    try {
      capturaCampanha(window.location.search);
    } catch {
      /* rastreio nunca segura a página */
    }
  }, []);
  return null;
}
