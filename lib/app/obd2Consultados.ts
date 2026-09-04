"use client";

// Os códigos OBD2 que a pessoa consultou, para a Biela saber deles.
//
// POR QUE ISTO EXISTE. A tela do OBD2 e a Biela eram duas telas que quase não
// se falavam: o código digitado abria a Biela como FRASE, quando estava fora
// da tabela de 36, e sumia em qualquer outro caso. Quem consultava P0300, lia
// o significado e depois perguntava "meu carro está falhando, o que pode ser?"
// recebia uma resposta que ignorava o código, que é o dado mais duro que existe
// sobre um carro.
//
// Guarda em MEMÓRIA, de propósito, e a decisão é a mesma de lib/app/rotaPendente.ts:
// código de erro é coisa da sessão. Consultei P0171 hoje, resolvi, e daqui a
// três semanas pergunto sobre barulho de freio: o código velho entrando no
// contexto ali seria pista falsa com cara de dado. Fechou o app, esqueceu.
//
// O teto é pequeno porque a lista serve para dar CONTEXTO, não histórico: os
// três últimos cobrem quem leu o scanner e anotou o que apareceu.

const MAX = 3;

/** Formato de código de diagnóstico: letra do sistema mais quatro dígitos hex. */
const VALIDO = /^[PBCU][0-9A-F]{4}$/i;

let consultados: string[] = [];

/**
 * Registra um código que a pessoa consultou.
 *
 * Mais novo primeiro, sem repetir. Código inválido é ignorado em silêncio: a
 * tela já valida o formato antes de mostrar significado, e um segundo aviso
 * aqui não ajudaria ninguém.
 */
export function anotaCodigo(codigo: string): void {
  const c = (codigo ?? "").trim().toUpperCase();
  if (!VALIDO.test(c)) return;
  consultados = [c, ...consultados.filter((x) => x !== c)].slice(0, MAX);
}

/** Os códigos desta sessão, mais novo primeiro. */
export function codigosConsultados(): string[] {
  return consultados;
}

/** Esquece tudo. Existe para as conferências não vazarem estado entre casos. */
export function esqueceCodigos(): void {
  consultados = [];
}
