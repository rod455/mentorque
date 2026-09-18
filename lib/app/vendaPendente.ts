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

/**
 * Esta pessoa chegou aqui para COMPRAR?
 *
 * Duas fontes, e as duas precisam ser olhadas:
 *
 *   a URL, quando ela acabou de clicar no link de venda (`/ALE100` vira
 *   `/app?assinar=mensal&cupom=...`);
 *
 *   o armazenamento, quando ela está VOLTANDO do login social e a URL já não
 *   carrega nada, porque o provedor devolve numa URL limpa.
 *
 * POR QUE ISTO EXISTE, se o `usePlanoPendente` já lê as duas. Porque ele mora
 * dentro do Shell, e o Shell só nasce depois do onboarding. Num aparelho novo
 * ninguém nunca chegava lá, e o link de venda virava apresentação de cinco
 * páginas. Esta função é a pergunta que o portão de app/app/page.tsx precisa
 * fazer ANTES de escolher entre Shell e onboarding, e por isso ela é barata,
 * pura de efeito e não consome nada: quem consome continua sendo o Shell.
 */
export function veioComprar(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const q = new URL(window.location.href).searchParams.get("assinar");
    if (q === "anual" || q === "mensal" || q === "annual" || q === "monthly") return true;
  } catch {
    /* URL estranha: segue para o armazenamento */
  }
  return vendaPendente() !== null;
}

// ---------------------------------------------------------------------------
// A marca de "eu estava tentando assinar quando me pediram conta".
//
// PROVADO NO NAVEGADOR EM 18/09/2026, e é o motivo desta marca existir: num
// aparelho sem conta, tocar em "Começar 7 dias grátis" no paywall leva à tela
// de entrar sem gravar evento nenhum, e essa tela diz "Salve sua garagem e
// cuide do seu carro de qualquer aparelho". É a frase certa para quem está
// sendo convidado a criar conta, e a errada para quem acabou de pedir um teste
// grátis: a pessoa disse sim para uma coisa e a tela seguinte fala de outra.
//
// Esta marca serve SÓ PARA O TEXTO. Ela não leva ninguém ao pagamento e não
// guarda plano nem cupom; quem faz isso é a compra pendente aqui de cima, que
// é do caminho do link de venda. Separar as duas é de propósito: mudar o que
// acontece DEPOIS do login num fluxo de dinheiro é decisão de quem cuida do
// pagamento, e está registrado como recomendação.
//
// Mesma validade da compra pendente, pelo mesmo motivo: meia hora atravessa um
// login social; uma semana faria a tela de entrar falar de assinatura para
// quem já esqueceu que tocou naquele botão.
const CHAVE_VEIO_ASSINAR = "mq-veio-assinar";

/** Marca que a pessoa foi parada no login vindo de um botão de assinar. */
export function marcaVeioAssinar(): void {
  try {
    window.localStorage.setItem(CHAVE_VEIO_ASSINAR, String(Date.now()));
  } catch {
    /* sem armazenamento: a tela de entrar fica com o texto de sempre */
  }
}

/**
 * A pessoa chegou ao login vindo de um botão de assinar, há pouco?
 *
 * Não consome a marca de propósito: o login social recarrega a página inteira
 * e a tela de entrar pode ser desenhada mais de uma vez na mesma tentativa.
 * Consumir na primeira leitura faria o texto certo aparecer e sumir no meio do
 * caminho. Quem apaga é o prazo.
 */
export function veioAssinar(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const bruto = window.localStorage.getItem(CHAVE_VEIO_ASSINAR);
    if (!bruto) return false;
    const t = Number(bruto);
    if (!Number.isFinite(t) || Date.now() - t > VALIDADE_MS) {
      window.localStorage.removeItem(CHAVE_VEIO_ASSINAR);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** Apaga a marca. Chamada quando a conta existe e o assunto acabou. */
export function esqueceVeioAssinar(): void {
  try {
    window.localStorage.removeItem(CHAVE_VEIO_ASSINAR);
  } catch {
    /* nada a fazer */
  }
}
