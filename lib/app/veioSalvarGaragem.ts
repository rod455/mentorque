// A marca de "eu vinha salvar a minha garagem quando me pediram conta".
//
// POR QUE ELA EXISTE (16/10/2026, aposta conta-que-sabe-que-veio-do-carro).
// Medido no banco em 16/10: de cada semana, uns 100 aparelhos cadastram o
// carro como convidado e nunca criam conta, e das 372 pessoas das três semanas
// fechadas de 21/09 a 11/10 que cadastraram carro, 155 criaram conta em até
// DOIS minutos, 14 em até uma hora e nenhuma depois disso. Nenhuma, não uma.
// A conta se decide em cima da folha "Salve sua garagem", e o momento não
// volta.
//
// O DEFEITO QUE A MARCA CONSERTA: a folha oferece o botão "Criar minha conta"
// e a tela que abre é a de ENTRAR. O `AuthScreen` nasce em `mode = "in"`, sem
// o campo de nome, com o botão escrito "Entrar", o "Esqueci minha senha" na
// frente e o herói repetindo a mesma frase que a folha acabou de dizer. A
// pessoa apertou criar e recebeu entrar. É o mesmo defeito do "+" da garagem
// cheia (11/09) e da tela de entrar que não sabia que a pessoa veio comprar
// (18/09): o controle promete uma coisa e a tela de destino fala de outra.
//
// POR QUE ARMAZENAMENTO E NÃO PARÂMETRO DE NAVEGAÇÃO: o login social RECARREGA
// a página (na web o provedor volta por redirecionamento; no app, por deep
// link), e estado de navegação não atravessa recarga. É a mesma razão da marca
// `mq-veio-assinar` em lib/app/vendaPendente.ts, que já atravessou essa
// recarga em produção desde 18/09.
//
// ELA SERVE SÓ PARA O TEXTO E PARA O MODO INICIAL DA TELA. Não cria conta, não
// escolhe plano, não leva ninguém ao pagamento e não guarda nada do carro.
const CHAVE = "mq-veio-salvar-garagem";

// Meia hora, igual à marca de venda e pelo mesmo motivo: o prazo precisa
// atravessar um login social inteiro, e não pode ser tão longo que a tela de
// entrar fale da garagem para quem já esqueceu que tocou naquele botão.
const VALIDADE_MS = 30 * 60 * 1000;

/** Marca que a pessoa foi ao login a partir do convite "Salve sua garagem". */
export function marcaVeioSalvarGaragem(): void {
  try {
    window.localStorage.setItem(CHAVE, String(Date.now()));
  } catch {
    /* sem armazenamento: a tela de entrar fica com o texto de sempre */
  }
}

/**
 * A pessoa chegou ao login vindo do convite a salvar a garagem, há pouco?
 *
 * Não consome a marca, pelo mesmo motivo do `veioAssinar`: a tela de entrar
 * pode ser desenhada mais de uma vez na mesma tentativa de login. Quem apaga
 * é o prazo.
 */
export function veioSalvarGaragem(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return false;
    const t = Number(bruto);
    if (!Number.isFinite(t) || Date.now() - t > VALIDADE_MS) {
      window.localStorage.removeItem(CHAVE);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** Esquece a marca. Chamado quando a conta existe: o convite cumpriu o papel. */
export function esqueceVeioSalvarGaragem(): void {
  try {
    window.localStorage.removeItem(CHAVE);
  } catch {
    /* nada a fazer */
  }
}
