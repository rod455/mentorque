"use client";

// Testes A/B de jornada e de copy, por aparelho.
//
// O sorteio é determinístico: hash do anon_id + id do experimento decide a
// variante. A mesma pessoa vê SEMPRE a mesma versão (sem piscar, sem
// armazenamento extra), e a divisão fica ~50/50 entre aparelhos.
//
// A exposição viaja carimbada em todo evento do funil (extra.exp), então a
// leitura é "conversão por variante" na view experimentos_resultados.
//
// Regras de uso (manual do CRO, docs/agentes/cro-besci.md): registrar cada
// experimento no caderno docs/agentes/experimentos.md com o MESMO id; um
// teste ativo por área da jornada; ao encerrar, a variante vencedora vira o
// padrão e o experimento SAI daqui.
import { anonId } from "./anon";

// id do experimento -> variantes possíveis. Vazio = nenhum teste ativo.
// Exemplo: "paywall-titulo": ["a", "b"]
export const EXPERIMENTOS: Record<string, string[]> = {};

function hash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

// A variante desta pessoa neste experimento ("a" se o teste não existir,
// para o código chamador nunca quebrar quando um teste for encerrado).
export function variante(id: string): string {
  const vs = EXPERIMENTOS[id];
  if (!vs || vs.length === 0) return "a";
  try {
    return vs[hash(id + ":" + anonId()) % vs.length];
  } catch {
    return vs[0];
  }
}

// Todas as atribuições ativas desta pessoa, para o funil carimbar nos
// eventos. null quando não há teste rodando (evento fica limpo).
export function variantesAtivas(): Record<string, string> | null {
  const ids = Object.keys(EXPERIMENTOS);
  if (ids.length === 0) return null;
  const out: Record<string, string> = {};
  for (const id of ids) out[id] = variante(id);
  return out;
}
