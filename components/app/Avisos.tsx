"use client";

import { useMemo, useState } from "react";
import { ownedVehicles, servicesFor, usePrototype } from "@/lib/app/store";
import { isNewLesson } from "@/lib/app/content";
import { openStorePage, useUpdateAvailable } from "@/lib/app/appUpdate";
import { montarAvisos, lerLidos, marcarLidos, type Aviso, type Tom } from "@/lib/app/avisos";
import { useNav } from "@/lib/app/nav";
import { Icon, Sheet, useContent } from "./ui";

// Cores por urgência. Só três, e a mais forte reservada ao que já venceu: se
// tudo for vermelho, nada é.
const TINTA: Record<Tom, { fundo: string; texto: string }> = {
  urgente: { fundo: "bg-coral/15", texto: "text-coral" },
  atencao: { fundo: "bg-amber/15", texto: "text-amber" },
  neutro: { fundo: "bg-white/[0.07]", texto: "text-cream/60" },
};

/**
 * Sino do cabeçalho, ao lado do perfil.
 *
 * Existe porque o app tinha avisos espalhados e nenhum lugar para procurá-los:
 * a revisão vencida só aparecia dentro de Revisões, a versão nova só na tela
 * inicial, e quem recusou a notificação do sistema não ficava sabendo de nada.
 *
 * O contador some assim que a folha abre, não quando cada item é tocado. O
 * pedido do sino é "tem algo novo?", e ele já foi respondido no momento em que
 * a pessoa olhou a lista. Exigir um toque por item para limpar transforma um
 * aviso em tarefa.
 */
export function SinoDeAvisos() {
  const c = useContent();
  const a = c.avisos;
  const { s, subscribed, subscriptionEndsAt, subscriptionCanceling, setActiveVehicle } = usePrototype();
  const { root, go } = useNav();
  const temVersaoNova = useUpdateAvailable();
  const [aberto, setAberto] = useState(false);
  const [lidos, setLidos] = useState<string[]>(() => (typeof window === "undefined" ? [] : lerLidos()));

  const avisos = useMemo(
    () =>
      montarAvisos({
        carros: ownedVehicles(s),
        servicosDo: (id) => servicesFor(s, id),
        assinante: subscribed,
        fimDoPeriodo: subscriptionEndsAt,
        cancelando: subscriptionCanceling,
        temVersaoNova,
        aulasNovas: c.lessons
          .filter((l) => isNewLesson(l))
          .sort((x, y) => (y.addedAt ?? "").localeCompare(x.addedAt ?? ""))
          .map((l) => ({ id: l.id, title: l.title })),
        textos: a,
      }),
    [s, subscribed, subscriptionEndsAt, subscriptionCanceling, temVersaoNova, c.lessons, a]
  );

  const naoLidos = avisos.filter((x) => !lidos.includes(x.id)).length;

  const abrir = () => {
    setAberto(true);
    // Marca os de agora e, no mesmo passo, esquece os que já saíram da lista:
    // é isso que deixa um id fixo como "versao-nova" acender de novo no futuro.
    const vivos = avisos.map((x) => x.id);
    marcarLidos(vivos);
    setLidos(vivos);
  };

  const seguir = (aviso: Aviso) => {
    setAberto(false);
    if (aviso.destino.tipo === "loja") { openStorePage(); return; }
    // Revisões, saúde e histórico respondem ao carro ATIVO. Sem trocar antes,
    // tocar num aviso do segundo carro abriria o plano do primeiro, que é pior
    // do que não ter aviso nenhum: mostra o dado errado com cara de certo.
    if (aviso.destino.carroId) setActiveVehicle(aviso.destino.carroId);
    const v = aviso.destino.view;
    // Telas de aba entram como raiz (a de conteúdo é empilhada, para o "voltar"
    // devolver a pessoa de onde ela veio).
    if (v.name === "content") go(v);
    else root(v);
  };

  return (
    <>
      <button
        onClick={abrir}
        aria-label={naoLidos > 0 ? `${a.abrir} (${naoLidos})` : a.abrir}
        className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.06] text-cream/70 ring-1 ring-white/10 active:bg-white/10"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
          <path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7" />
          <path d="M10.3 20a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {naoLidos > 0 && (
          // Número, e não bolinha: "3 coisas para ver" e "algo mudou" pedem
          // reações diferentes. Acima de 9 vira "9+", senão o selo cresce e
          // encosta na foto do perfil.
          <span className="absolute -right-0.5 -top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-coral px-1 font-display text-[10px] font-bold leading-none text-graphite ring-2 ring-graphite">
            {naoLidos > 9 ? "9+" : naoLidos}
          </span>
        )}
      </button>

      <Sheet open={aberto} onClose={() => setAberto(false)}>
        <h2 className="pr-12 font-serif text-xl font-bold text-cream">{a.titulo}</h2>

        {avisos.length === 0 ? (
          <div className="py-8 text-center">
            <span aria-hidden className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-teal/15 text-teal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
                <path d="m5 13 4 4L19 7" />
              </svg>
            </span>
            <p className="mt-3 font-display text-[15px] font-semibold text-cream">{a.vazioTitulo}</p>
            <p className="mx-auto mt-1 max-w-[17rem] text-sm leading-relaxed text-cream/55">{a.vazioCorpo}</p>
          </div>
        ) : (
          // Teto de altura: com muitos carros a lista passa da tela, e uma
          // folha que não rola esconde o próprio fim.
          <div className="-mx-1 mt-4 max-h-[60vh] space-y-2 overflow-y-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {avisos.map((x) => {
              const cor = TINTA[x.tom];
              return (
                <button
                  key={x.id}
                  onClick={() => seguir(x)}
                  className="flex w-full items-start gap-3 rounded-2xl bg-graphite-700 px-3.5 py-3 text-left ring-1 ring-white/[0.06] active:bg-graphite-600"
                >
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${cor.fundo} ${cor.texto}`}>
                    <Icon name={x.icone} className="h-4.5 w-4.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[14px] font-semibold leading-snug text-cream">{x.titulo}</span>
                    <span className="mt-0.5 block text-[13px] leading-relaxed text-cream/60">{x.corpo}</span>
                  </span>
                  <span aria-hidden className="mt-1 shrink-0 text-cream/30">›</span>
                </button>
              );
            })}
          </div>
        )}
      </Sheet>
    </>
  );
}
