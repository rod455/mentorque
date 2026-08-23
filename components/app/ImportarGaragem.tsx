"use client";

import { useState } from "react";
import { usePrototype } from "@/lib/app/store";
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
export function ImportarGaragem() {
  const { importacaoPendente, resolverImportacao } = usePrototype();
  const c = useContent();
  const t = c.importar;
  const [marcados, setMarcados] = useState<string[]>([]);

  if (!importacaoPendente) return null;

  const alternar = (id: string) =>
    setMarcados((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative app-col animate-fade-up rounded-t-3xl bg-graphite-800 p-5 pb-[calc(1.75rem+env(safe-area-inset-bottom))] ring-1 ring-white/10">
        <h2 className="font-serif text-xl font-bold text-cream">{t.title}</h2>
        <p className="mt-1.5 text-sm leading-snug text-cream/70">{t.body}</p>

        <ul className="mt-4 max-h-[45vh] space-y-2 overflow-y-auto">
          {importacaoPendente.veiculos.map((v) => {
            const n = importacaoPendente.servicos.filter((r) => r.vehicleId === v.id).length;
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
                    <span className="block truncate font-display text-sm font-semibold text-cream">
                      {v.nickname?.trim() || `${v.make} ${v.model}`}
                    </span>
                    <span className="block text-xs text-cream/55">
                      {v.year}
                      {v.plate ? ` · ${v.plate}` : ""} · {n === 0 ? t.semServico : `${n} ${n === 1 ? t.servico : t.servicos}`}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-3 text-center text-xs leading-snug text-cream/45">{t.aviso}</p>

        <button
          onClick={() => resolverImportacao(marcados)}
          disabled={!marcados.length}
          className="mt-3 w-full rounded-xl bg-amber px-4 py-3 font-display text-sm font-semibold text-graphite transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {t.importar}
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
