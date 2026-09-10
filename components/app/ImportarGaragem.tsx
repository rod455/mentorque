"use client";

import { useState } from "react";
import { usePrototype } from "@/lib/app/store";
import { carroIgualNaGaragem } from "@/lib/app/mesmoCarro";
import type { EscolhaDeImportacao } from "@/lib/app/importacao";
import type { Vehicle } from "@/lib/app/types";
import { useContent } from "./ui";

// Pergunta de importação da garagem do convidado.
//
// Aparece quando alguém entra numa conta que JÁ TEM garagem e o aparelho tem
// carros cadastrados sem login. Antes o app juntava os dois sozinho, e a pessoa
// terminava com carros que nunca pediu — e, num aparelho emprestado, com o
// carro de outra pessoa dentro da conta dela.
//
// Não fecha sozinha de propósito: sem X, sem fechar tocando fora. Os dois
// caminhos são botão explícito, porque "não levar nenhum" descarta trabalho e
// isso precisa ser uma escolha, não um toque errado.
//
// Começa com tudo DESMARCADO por decisão do dono: o padrão é a conta continuar
// como está, e o que entra é o que a pessoa afirmou ser dela.
//
// Carro que a conta JÁ TEM (regra em mesmoCarro.ts) não é caixa de marcar: é
// uma escolha entre juntar num só, ficar só com o da conta (o padrão, que não
// muda nada) ou ficar só com o deste aparelho. Decisão do dono em 10/09/2026:
// perguntar, igual se pergunta para os carros diferentes, em vez de o app
// escolher qual carro sobrevive.

type Decisao = "juntar" | "conta" | "aparelho";

export function ImportarGaragem() {
  const { s, importacaoPendente, resolverImportacao } = usePrototype();
  const c = useContent();
  const t = c.importar;
  const [marcados, setMarcados] = useState<string[]>([]);
  const [decisoes, setDecisoes] = useState<Record<string, Decisao>>({});

  if (!importacaoPendente) return null;

  const alternar = (id: string) =>
    setMarcados((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));
  const decidir = (id: string, d: Decisao) => setDecisoes((atual) => ({ ...atual, [id]: d }));

  // Para cada carro do aparelho, o carro da conta que parece ser ele (ou null).
  const repetidos = new Map<string, Vehicle | null>(
    importacaoPendente.veiculos.map((v) => [v.id, carroIgualNaGaragem(s.vehicles, v)]),
  );
  const temRepetido = [...repetidos.values()].some(Boolean);

  const escolhas: EscolhaDeImportacao[] = importacaoPendente.veiculos.flatMap((v): EscolhaDeImportacao[] => {
    const igual = repetidos.get(v.id);
    if (!igual) return marcados.includes(v.id) ? [{ id: v.id, acao: "levar" }] : [];
    const d = decisoes[v.id] ?? "conta";
    if (d === "juntar") return [{ id: v.id, acao: "juntar", noCarro: igual.id }];
    if (d === "aparelho") return [{ id: v.id, acao: "trocar", noLugarDe: igual.id }];
    return [];
  });

  const opcoes: { d: Decisao; rotulo: string; explica: string }[] = [
    { d: "juntar", rotulo: t.juntar, explica: t.juntarExplica },
    { d: "conta", rotulo: t.soDaConta, explica: t.soDaContaExplica },
    { d: "aparelho", rotulo: t.soDoAparelho, explica: t.soDoAparelhoExplica },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative app-col animate-fade-up rounded-t-3xl bg-graphite-800 p-5 pb-[calc(1.75rem+env(safe-area-inset-bottom))] ring-1 ring-white/10">
        <h2 className="font-serif text-xl font-bold text-cream">{t.title}</h2>
        <p className="mt-1.5 text-sm leading-snug text-cream/70">{t.body}</p>

        <ul className="mt-4 max-h-[45vh] space-y-2 overflow-y-auto">
          {importacaoPendente.veiculos.map((v) => {
            const n = importacaoPendente.servicos.filter((r) => r.vehicleId === v.id).length;
            const nome = v.nickname?.trim() || `${v.make} ${v.model}`;
            const detalhe = `${v.year}${v.plate ? ` · ${v.plate}` : ""} · ${
              n === 0 ? t.semServico : `${n} ${n === 1 ? t.servico : t.servicos}`
            }`;
            const igual = repetidos.get(v.id);

            if (igual) {
              const d = decisoes[v.id] ?? "conta";
              return (
                <li key={v.id} className="rounded-xl bg-graphite-700 px-3.5 py-3 ring-1 ring-white/10" data-carro-repetido>
                  <span className="block truncate font-display text-sm font-semibold text-cream">{nome}</span>
                  <span className="block text-xs text-cream/55">{detalhe}</span>
                  <p className="mt-2 text-xs font-medium text-amber">{t.repetido}</p>
                  <div className="mt-2 grid grid-cols-3 gap-1.5" role="radiogroup" aria-label={t.repetido}>
                    {opcoes.map((o) => (
                      <button
                        key={o.d}
                        role="radio"
                        aria-checked={d === o.d}
                        onClick={() => decidir(v.id, o.d)}
                        className={`rounded-lg px-2 py-2 text-center text-[12px] font-semibold leading-tight ring-1 transition-colors ${
                          d === o.d ? "bg-amber text-graphite ring-amber" : "bg-graphite-800 text-cream/80 ring-white/10"
                        }`}
                      >
                        {o.rotulo}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs leading-snug text-cream/60">{opcoes.find((o) => o.d === d)?.explica}</p>
                </li>
              );
            }

            const marcado = marcados.includes(v.id);
            return (
              <li key={v.id}>
                <button
                  onClick={() => alternar(v.id)}
                  aria-pressed={marcado}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left ring-1 transition-colors ${
                    marcado ? "bg-amber/10 ring-amber/50" : "bg-graphite-700 ring-white/10"
                  }`}
                >
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-md ring-1 ${
                      marcado ? "bg-amber text-graphite ring-amber" : "ring-white/25"
                    }`}
                  >
                    {marcado ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3 w-3">
                        <path d="m5 13 4 4L19 7" />
                      </svg>
                    ) : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-display text-sm font-semibold text-cream">{nome}</span>
                    <span className="block text-xs text-cream/55">{detalhe}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-3 text-center text-xs leading-snug text-cream/45">{t.aviso}</p>

        <button
          onClick={() => resolverImportacao(escolhas)}
          disabled={!escolhas.length}
          className="mt-3 w-full rounded-xl bg-amber px-4 py-3 font-display text-sm font-semibold text-graphite transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {temRepetido ? t.confirmar : t.importar}
        </button>
        <button
          onClick={() => resolverImportacao([])}
          className="mt-2 w-full rounded-xl px-4 py-2.5 font-display text-sm font-semibold text-cream/60 hover:text-cream"
        >
          {t.importarNenhum}
        </button>
      </div>
    </div>
  );
}
