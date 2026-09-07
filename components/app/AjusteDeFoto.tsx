"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { recortarImagem, type ImagemLida } from "@/lib/app/image";
import {
  ZOOM_MAXIMO,
  escalaEfetiva,
  limitaDeslocamento,
  retanguloDoRecorte,
  zoomDaPinca,
  type Ajuste,
  type Tamanho,
} from "@/lib/app/recorte";
import { useContent } from "./ui";

// A tela de ajustar a foto: a moldura fixa, a foto atrás, arrasta e aproxima.
//
// PEDIDO DO DONO (07/09/2026), para a foto do carro e a do perfil: "se for
// grande, aparece um campo para selecionar qual parte da foto ele quer, da
// mesma forma que funciona no WhatsApp e no Facebook".
//
// Esta tela NÃO SABE FAZER CONTA. Tudo o que é regra (a foto cobre a moldura
// sempre, o arrasto para na borda, qual pedaço sai) mora em lib/app/recorte.ts
// e é exercitado pela conferência sem navegador. Aqui é só medir a moldura,
// ouvir os dedos e desenhar o que a conta mandar. Foi assim de propósito: uma
// regra de recorte errada produz foto com borda preta ou com a cabeça cortada,
// e nenhuma das duas aparece em teste de texto.
//
// DOIS JEITOS DE APROXIMAR, e o segundo não é enfeite. A pinça é o gesto que a
// pessoa espera; a barra existe para quem usa um dedo só, para o navegador de
// mesa, e para a conferência de navegador conseguir mexer no zoom, porque
// Playwright não faz pinça.

const ZOOM_PASSO = 0.01;

export function AjusteDeFoto({
  fonte,
  alvo,
  redondo = false,
  onConfirmar,
  onCancelar,
}: {
  fonte: ImagemLida;
  /** Lado do quadrado que sai, em pixels da imagem gravada. */
  alvo: number;
  /** Mostra a máscara redonda (perfil). O que sai é quadrado nos dois casos. */
  redondo?: boolean;
  onConfirmar: (dataUrl: string) => void | Promise<void>;
  onCancelar: () => void;
}) {
  const c = useContent();
  const t = c.recorte;
  const molduraRef = useRef<HTMLDivElement>(null);
  const [moldura, setMoldura] = useState<Tamanho | null>(null);
  const [ajuste, setAjuste] = useState<Ajuste>({ zoom: 1, dx: 0, dy: 0 });
  const [ocupado, setOcupado] = useState(false);

  // A moldura é medida, não escrita: ela se adapta à largura do aparelho e a
  // conta precisa do número real em pixels.
  useEffect(() => {
    const el = molduraRef.current;
    if (!el) return;
    const medir = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setMoldura({ largura: r.width, altura: r.height });
    };
    medir();
    const obs = typeof ResizeObserver !== "undefined" ? new ResizeObserver(medir) : null;
    obs?.observe(el);
    return () => obs?.disconnect();
  }, []);

  const aplicar = (proximo: Ajuste) => {
    if (!moldura) return;
    setAjuste(limitaDeslocamento(fonte, moldura, proximo));
  };

  // Os dedos. Um arrasta; dois fazem pinça. O mapa guarda a última posição de
  // cada um para o arrasto ser a diferença entre dois eventos, e não uma
  // posição absoluta que pula quando o segundo dedo entra ou sai.
  const dedos = useRef(new Map<number, { x: number; y: number }>());
  const distancia = () => {
    const [a, b] = [...dedos.current.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  };
  const aoPousar = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dedos.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  };
  const aoMover = (e: React.PointerEvent) => {
    const antes = dedos.current.get(e.pointerId);
    if (!antes) return;
    const distanciaAntes = distancia();
    dedos.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (dedos.current.size >= 2) {
      aplicar({ ...ajuste, zoom: zoomDaPinca(ajuste.zoom, distanciaAntes, distancia()) });
    } else {
      aplicar({ ...ajuste, dx: ajuste.dx + (e.clientX - antes.x), dy: ajuste.dy + (e.clientY - antes.y) });
    }
  };
  const aoSoltar = (e: React.PointerEvent) => {
    dedos.current.delete(e.pointerId);
  };

  const confirmar = async () => {
    if (!moldura || ocupado) return;
    setOcupado(true);
    try {
      const r = retanguloDoRecorte(fonte, moldura, ajuste);
      await onConfirmar(await recortarImagem(fonte.dataUrl, r, { largura: alvo, altura: alvo }));
    } finally {
      setOcupado(false);
    }
  };

  const escala = moldura ? escalaEfetiva(fonte, moldura, ajuste.zoom) : 0;
  const larguraDesenhada = fonte.largura * escala;
  const alturaDesenhada = fonte.altura * escala;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.titulo}
      className="fixed inset-0 z-[60] flex flex-col bg-graphite text-cream"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={onCancelar} className="font-display text-sm font-medium text-cream/70">
          {c.common.cancel}
        </button>
        <h2 className="font-serif text-lg font-semibold">{t.titulo}</h2>
        <span className="w-16" aria-hidden />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6">
        {/* A moldura. `touch-action: none` é o que entrega o gesto para nós em
            vez de para a rolagem da página; sem isso o arrasto rola a tela. */}
        <div
          ref={molduraRef}
          onPointerDown={aoPousar}
          onPointerMove={aoMover}
          onPointerUp={aoSoltar}
          onPointerCancel={aoSoltar}
          className="relative aspect-square w-full max-w-[320px] cursor-grab select-none overflow-hidden rounded-2xl bg-graphite-900 ring-1 ring-white/15 active:cursor-grabbing"
          style={{ touchAction: "none" }}
          data-moldura
        >
          {moldura && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fonte.dataUrl}
              alt=""
              draggable={false}
              className="pointer-events-none absolute max-w-none"
              style={{
                width: larguraDesenhada,
                height: alturaDesenhada,
                left: moldura.largura / 2 + ajuste.dx - larguraDesenhada / 2,
                top: moldura.altura / 2 + ajuste.dy - alturaDesenhada / 2,
              }}
            />
          )}
          {redondo && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_0_9999px_rgba(22,24,29,0.72)]"
            />
          )}
        </div>

        <p className="max-w-[20rem] text-center text-sm text-cream/55">{t.dica}</p>

        <label className="flex w-full max-w-[320px] items-center gap-3 text-sm text-cream/70">
          <span className="shrink-0">{t.zoom}</span>
          <input
            type="range"
            min={1}
            max={ZOOM_MAXIMO}
            step={ZOOM_PASSO}
            value={ajuste.zoom}
            onChange={(e) => aplicar({ ...ajuste, zoom: Number(e.target.value) })}
            aria-label={t.zoom}
            className="w-full accent-amber"
          />
        </label>
      </div>

      <div className="px-5 pb-6 pt-2">
        <Button size="lg" className="w-full" onClick={confirmar} disabled={!moldura || ocupado}>
          {t.confirmar}
        </Button>
      </div>
    </div>
  );
}
