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
// O sorteio em si (hash com mistura final) mora em sorteio.ts, puro, para a
// conferência medir que dois testes ao mesmo tempo são independentes.
import { varianteDe } from "./sorteio.ts";

// id do experimento -> variantes possíveis. Vazio = nenhum teste ativo.
// Exemplo: "paywall-titulo": ["a", "b"]
export const EXPERIMENTOS: Record<string, string[]> = {
  // Aprovado pelo dono em 12/09/2026 (docs/agentes/experimentos.md). A = o
  // formulário de sempre (sete campos); B = só marca, modelo e ano, e o
  // resto vira a barra "Diagnóstico do carro" na tela do carro.
  "cadastro-em-duas-etapas": ["a", "b"],
  // Aprovado pelo dono em 12/09/2026. A = cinco páginas (três de
  // apresentação, prova social, última). B = três: a dor, como resolve, e a
  // última (o carro no Android; o teste onde vende). A prova social fica de
  // fora da B.
  "onboarding-curto": ["a", "b"],
};

// A variante desta pessoa neste experimento ("a" se o teste não existir,
// para o código chamador nunca quebrar quando um teste for encerrado).
export function variante(id: string): string {
  const vs = EXPERIMENTOS[id];
  if (!vs || vs.length === 0) return "a";
  try {
    return varianteDe(id, anonId(), vs);
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
