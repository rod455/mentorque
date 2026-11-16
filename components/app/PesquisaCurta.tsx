"use client";

// A pesquisa curta, no Início (16/11/2026, plano de receita). O porquê de cada
// pergunta e quem vê estão em lib/pesquisa/perguntas.ts; aqui só o desenho.
import { useEffect, useState } from "react";
import { apiPost } from "@/lib/app/apiBase";
import { anonId } from "@/lib/app/anon";
import { APP_VERSION } from "@/lib/app/content";
import { isNativeApp, nativePlatform } from "@/lib/app/wrapper";
import { CHAVE_FEITA, completa, mostrarPesquisa, PERGUNTAS, TETO_DO_LIVRE, type Pergunta, type Respostas } from "@/lib/pesquisa/perguntas";
import { Button } from "@/components/ui/Button";
import { Card, inputCls, Sheet, useContent } from "./ui";

export function PesquisaCurta({ comecouEm }: { comecouEm: string | null | undefined }) {
  const c = useContent();
  const t = c.pesquisa;
  const [jaFeita, setJaFeita] = useState(true);
  const [aberta, setAberta] = useState(false);
  const [r, setR] = useState<Respostas>({});
  const [enviando, setEnviando] = useState(false);
  const [enviada, setEnviada] = useState(false);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    try { setJaFeita(localStorage.getItem(CHAVE_FEITA) === "1"); } catch { setJaFeita(false); }
  }, []);

  const encerrar = () => {
    setJaFeita(true);
    try { localStorage.setItem(CHAVE_FEITA, "1"); } catch { /* sem armazenamento: some só nesta sessão */ }
  };

  if (!enviada && !mostrarPesquisa({ comecouEm, agora: new Date(), jaFeita })) return null;

  const enviar = async () => {
    if (!completa(r) || enviando) return;
    setEnviando(true);
    setErro(false);
    try {
      const res = await apiPost("/api/pesquisa", {
        respostas: r,
        anonId: anonId(),
        plataforma: isNativeApp() ? nativePlatform() ?? "nativo" : "web",
        versao: APP_VERSION,
      });
      if (!res.ok) throw new Error(String(res.status));
      setEnviada(true);
      encerrar();
    } catch {
      setErro(true);
    } finally {
      setEnviando(false);
    }
  };

  const escolha = <P extends Pergunta>(p: P) => (
    <div className="mt-4" data-pergunta={p}>
      <p className="text-sm font-medium text-cream">{t.perguntas[p]}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {PERGUNTAS[p].map((op) => (
          <button
            key={op}
            type="button"
            data-opcao={op}
            onClick={() => setR((x) => ({ ...x, [p]: op }))}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-colors ${
              r[p] === op ? "bg-amber text-graphite ring-amber" : "bg-graphite-700 text-cream/80 ring-white/10"
            }`}
          >
            {(t.opcoes[p] as Record<string, string>)[op]}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {!enviada && (
        <div data-pesquisa-curta>
          <Card className="mt-3 ring-1 ring-amber/30">
            <p className="font-display text-[15px] text-cream">{t.titulo}</p>
            <p className="mt-0.5 text-xs text-cream/60">{t.sub}</p>
            <Button className="mt-3 w-full" onClick={() => setAberta(true)}>{t.abrir}</Button>
            <button type="button" onClick={encerrar} className="mt-2 w-full py-1 text-center text-xs text-cream/50">{t.agoraNao}</button>
          </Card>
        </div>
      )}
      <Sheet open={aberta} onClose={() => setAberta(false)}>
        <div data-folha-pesquisa>
          {enviada ? (
            <p className="py-4 text-center text-sm text-teal/90" role="status">{t.obrigado}</p>
          ) : (
            <>
              <h2 className="font-display text-xl font-bold text-cream">{t.titulo}</h2>
              {escolha("sentir")}
              {escolha("gasto")}
              {escolha("seguro")}
              {escolha("preco")}
              <label className="mt-4 block">
                <span className="text-sm font-medium text-cream">{t.livre}</span>
                <textarea
                  value={r.livre ?? ""}
                  maxLength={TETO_DO_LIVRE}
                  onChange={(e) => setR((x) => ({ ...x, livre: e.target.value }))}
                  rows={3}
                  className={`${inputCls} mt-2`}
                />
              </label>
              {erro && <p className="mt-2 text-xs text-red-300/90">{t.erro}</p>}
              <Button size="lg" className="mt-4 w-full" disabled={!completa(r) || enviando} onClick={() => void enviar()}>
                {enviando ? t.enviando : t.enviar}
              </Button>
            </>
          )}
        </div>
      </Sheet>
    </>
  );
}
