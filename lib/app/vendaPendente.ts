"use client";

// A compra que ficou pendente enquanto a pessoa fazia login.
//
// O DEFEITO QUE ISTO CONSERTA, relatado em 02/09/2026: o dono clicou em
// mentorque.com.br/ALE100, caiu na tela de entrar, entrou com o Google e foi
// parar na tela inicial. Sem checkout, sem cupom. O link de venda que ele
// manda para quem já disse sim simplesmente não vendia.
//
// A causa é sutil e vale ficar escrita, porque ela volta em qualquer coisa que
// dependa de estado atravessando um login social. O plano e o cupom saíam da
// URL na abertura e viviam em `useState` e `useRef`, ou seja, NA MEMÓRIA DA
// PÁGINA. E login social na web não é uma tela do app: é o navegador saindo do
// nosso domínio, indo para o Google e voltando. A página inteira recarrega, e
// tudo o que estava na memória morre. Pior: os parâmetros já tinham sido
// apagados da URL logo na abertura (de propósito, para recarregar não reabrir
// compra), então nem a URL de volta tinha como lembrar.
//
// No aplicativo das lojas isso nunca apareceu porque lá o login é nativo: a
// folha da Apple abre POR CIMA do app, a página não recarrega e a memória
// sobrevive. Era um defeito que só existia na web, que é justamente onde os
// links de venda são clicados.
//
// Por isso a compra pendente mora no ARMAZENAMENTO do aparelho, e não na
// memória. E em `localStorage`, não em `sessionStorage`: o retorno do provedor
// nem sempre volta na mesma aba, principalmente em navegador embutido de
// aplicativo de mensagem, que foi exatamente por onde o link foi clicado.

export type VendaPendente = {
  plano: "annual" | "monthly";
  /**
   * Verdadeiro = veio do link de venda e vai DIRETO ao pagamento. Falso = veio
   * do onboarding e para no paywall. A diferença é de quem já foi convencido
   * para quem ainda está conhecendo.
   */
  direto: boolean;
  cupom?: string;
  /** Quando foi guardada. */
  t: number;
};

const CHAVE = "mq-venda-pendente";

/**
 * Por quanto tempo uma compra pendente ainda vale.
 *
 * Meia hora. Ela existe para atravessar um login, que leva segundos, e o teto
 * é o que impede o efeito colateral: sem ele, abrir o app dias depois
 * despejaria a pessoa numa tela de pagamento que ela não pediu, com um cupom
 * que ela já esqueceu. Guardar intenção de compra é útil; ressuscitar intenção
 * de compra é assustador.
 *
 * O teto é a rede, não a regra: o caminho normal é a pendência ser esquecida
 * assim que o destino abre.
 */
const VALIDADE_MS = 30 * 60 * 1000;

/** Guarda a compra e devolve o que foi guardado. */
export function guardaVenda(v: Omit<VendaPendente, "t">): VendaPendente {
  const completa: VendaPendente = { ...v, t: Date.now() };
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(completa));
  } catch {
    // Sem armazenamento a compra continua valendo NESTA página: quem chamou
    // recebe o objeto de volta e segue. O que se perde é só a travessia do
    // login social, e não há o que fazer quanto a isso sem armazenamento.
  }
  return completa;
}

/** A compra pendente, se ainda houver uma dentro da validade. */
export function vendaPendente(): VendaPendente | null {
  try {
    const cru = window.localStorage.getItem(CHAVE);
    if (!cru) return null;
    const v = JSON.parse(cru) as Partial<VendaPendente>;
    if (v?.plano !== "annual" && v?.plano !== "monthly") return null;
    if (typeof v.t !== "number") return null;
    const idade = Date.now() - v.t;
    if (idade < 0 || idade > VALIDADE_MS) {
      esqueceVenda();
      return null;
    }
    return {
      plano: v.plano,
      direto: v.direto === true,
      cupom: typeof v.cupom === "string" && v.cupom ? v.cupom : undefined,
      t: v.t,
    };
  } catch {
    return null;
  }
}

/**
 * Esquece a compra pendente.
 *
 * Chamada assim que o destino abre, e é isso que mantém a regra antiga de pé:
 * recarregar a página depois de chegar ao pagamento não reabre compra nenhuma,
 * porque já não há pendência guardada.
 */
export function esqueceVenda(): void {
  try {
    window.localStorage.removeItem(CHAVE);
  } catch {
    /* nada a esquecer */
  }
}
