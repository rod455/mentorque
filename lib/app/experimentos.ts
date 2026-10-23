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
  // ENCERRADO em 02/10/2026: a variante B venceu (108 de 173 cadastraram o
  // carro contra 78 de 173, mais de três vezes o erro padrão) e virou o
  // padrão em AddCarScreen. Fica anotado aqui porque o id não pode voltar:
  // reaproveitar um id encerrado misturaria exposição velha com nova na view
  // experimentos_resultados.
  // ENCERRADO em 23/10/2026: a variante A venceu, e venceu no degrau da CONTA.
  // De 891 aparelhos em A e 960 em B: terminaram o onboarding 672 e 759 (B
  // passa mais gente, quatro pontos, menos de duas vezes o erro), cadastraram
  // carro 435 e 444 (empate), e CRIARAM CONTA 214 e 179, cinco pontos a favor
  // de A com quase três vezes o erro padrão. Conferido por um segundo corte, a
  // conta entre quem já tem carro: 206 de 428 contra 174 de 439. A virou o
  // padrão (as cinco páginas, com a prova social que o dono decidiu manter em
  // 01/09) e o id não pode voltar, pelo mesmo motivo do de cima.
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
