// O sorteio de variante, puro: id do experimento + anon do aparelho -> uma
// das variantes. Separado de experimentos.ts para `conferir:funil` medir o
// sorteio sem passar pelo navegador (anon.ts precisa de localStorage).
//
// djb2 e, no fim, a mistura final do murmur3.
//
// POR QUE A MISTURA (12/09/2026, no dia em que o segundo teste ligou): o
// djb2 sozinho é linear na paridade. Com dois experimentos, "id-a:anon" e
// "id-b:anon" só diferem no prefixo, e a paridade do resultado é a paridade
// do prefixo mais a do sufixo; como o sufixo (o anon) é o mesmo, a variante
// de um teste determinava a do outro em 100% dos aparelhos (5.000 de 5.000
// numa amostra). Dois testes ao mesmo tempo eram um só, e a leitura de cada
// um levava o efeito do outro. A mistura quebra a linearidade;
// `conferir:funil` mede que a concordância entre dois testes fica perto de
// 50% e grita se a mistura sair daqui.
function hash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35) >>> 0;
  h ^= h >>> 16;
  return h >>> 0;
}

export function varianteDe(id: string, anon: string, vs: string[]): string {
  return vs[hash(id + ":" + anon) % vs.length];
}
