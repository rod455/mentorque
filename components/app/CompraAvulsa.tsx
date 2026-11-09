"use client";

// A folha da compra avulsa, na parede da Biela (09/11/2026).
//
// Os três formatos lado a lado, sem sorteio: a escolha da pessoa é a medida
// (`compra-avulsa-por-momento` no caderno). Os dois pacotes vêm num cartão só,
// para a comparação continuar sendo entre FORMATOS (pacote ou passe), como o
// dono decidiu em 05/11. O Premium continua logo abaixo, na linha de sempre.
//
// O preço escrito aqui é o mesmo que o checkout cobra (lib/avulsa/direito.ts),
// e `conferir:avulsa` reprova se os dois se separarem.
import { useEffect, useState } from "react";
import { funil } from "@/lib/app/funil";
import { abrirCheckout, avulsaDisponivel, type ProdutoAvulso } from "@/lib/app/compraAvulsa";
import { useContent } from "./ui";

export const PRECO_NA_TELA: Record<ProdutoAvulso, string> = {
  pacote_2: "R$ 1,90",
  pacote_10: "R$ 4,90",
  passe_7d: "R$ 9,90",
};

export function CompraAvulsa({ aviso }: { aviso?: string | null }) {
  const c = useContent();
  const [abrindo, setAbrindo] = useState<ProdutoAvulso | null>(null);
  const [erro, setErro] = useState(false);
  const disponivel = avulsaDisponivel();

  useEffect(() => {
    if (disponivel) funil("viu_avulsa", { umaVez: true, origem: "biela" });
  }, [disponivel]);

  if (!disponivel) return null;

  const comprar = async (produto: ProdutoAvulso) => {
    if (abrindo) return;
    setErro(false);
    setAbrindo(produto);
    funil("tentou_avulsa", { origem: produto });
    const ok = await abrirCheckout(produto);
    setAbrindo(null);
    if (!ok) setErro(true);
  };

  const botao = (produto: ProdutoAvulso, titulo: string) => (
    <button
      key={produto}
      data-avulsa={produto}
      onClick={() => void comprar(produto)}
      disabled={!!abrindo}
      className="flex flex-1 flex-col items-center rounded-xl bg-graphite-800 px-3 py-2.5 ring-1 ring-white/10 transition active:scale-[0.98] disabled:opacity-50"
    >
      <span className="text-sm font-semibold text-cream">{titulo}</span>
      <span className="text-xs text-amber">{PRECO_NA_TELA[produto]}</span>
    </button>
  );

  return (
    <div className="mb-2 rounded-2xl bg-graphite-800/60 p-3.5 ring-1 ring-white/10" data-compra-avulsa>
      <p className="mb-2.5 text-center text-sm font-medium text-cream">{c.biela.avulsaTitulo}</p>
      <div className="flex gap-2">
        {botao("pacote_2", c.biela.avulsaPacote2)}
        {botao("pacote_10", c.biela.avulsaPacote10)}
      </div>
      <p className="mt-1 text-center text-[11px] text-cream/50">{c.biela.avulsaPacoteSub}</p>
      <button
        data-avulsa="passe_7d"
        onClick={() => void comprar("passe_7d")}
        disabled={!!abrindo}
        className="mt-2.5 flex w-full items-center justify-between rounded-xl bg-graphite-800 px-3.5 py-2.5 text-left ring-1 ring-amber/30 transition active:scale-[0.98] disabled:opacity-50"
      >
        <span>
          <span className="block text-sm font-semibold text-cream">{c.biela.avulsaPasse}</span>
          <span className="block text-xs text-cream/60">{c.biela.avulsaPasseSub}</span>
        </span>
        <span className="text-sm font-semibold text-amber">{PRECO_NA_TELA.passe_7d}</span>
      </button>
      {(abrindo || erro || aviso) && (
        <p className="mt-2 text-center text-xs text-cream/70" role="status">
          {abrindo ? c.biela.avulsaAbrindo : erro ? c.biela.avulsaErro : aviso}
        </p>
      )}
    </div>
  );
}
