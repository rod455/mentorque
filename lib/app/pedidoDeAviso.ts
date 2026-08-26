"use client";

import { diaLocal, diasEntre } from "./datas";
import { notificacoesDisponiveis, pedirPermissao, permissaoConcedida } from "./notificacoes";

// Quem pode pedir a permissão de notificação, e quando.
//
// O PROBLEMA QUE ISTO RESOLVE: a permissão de notificação é de UM TIRO. No
// iPhone e no Android 13+, o sistema mostra a caixa uma única vez; recusou,
// acabou — o app nunca mais consegue perguntar, e a única saída é a pessoa ir
// aos ajustes do aparelho por conta própria, o que praticamente ninguém faz.
//
// Isso transforma cada pedido numa aposta cara, e cria um risco que só aparece
// quando o app cresce: três telas diferentes querendo pedir (o fim do quiz, a
// faixa do calendário, o perfil) viram três chances de gastar o tiro na pior
// hora. Sem um controle único, ninguém está errado sozinho e o resultado é o
// pior possível.
//
// Por isso o pedido passa todo por aqui, com três travas:
//
//   1. no máximo um convite a cada 4 dias;
//   2. no máximo 3 convites na vida do aparelho;
//   3. nunca depois de um "não" do sistema, e nunca com a permissão já dada.
//
// FORA DESTE CONTROLE, de propósito: o interruptor do Perfil. Lá a pessoa
// tocou num botão que diz "quero receber avisos" — isso não é o app pedindo,
// é ela pedindo, e segurar o pedido dela seria o app quebrando a própria
// promessa na cara dela.

/** De onde veio o convite. Serve para saber qual deles converte. */
export type MomentoDoPedido = "quiz" | "calendario";

const CHAVE = "mq-pedido-aviso";

/** Espera mínima entre dois convites. */
const DIAS_ENTRE_PEDIDOS = 4;

/**
 * Teto de convites por aparelho.
 *
 * Três é o número de vezes que dá para insistir sem virar praga. Quem disse
 * "agora não" três vezes já respondeu; o quarto convite não é persistência, é
 * o app não escutando.
 */
const MAXIMO_DE_PEDIDOS = 3;

type Registro = { vezes: number; ultimoEm: string | null; ultimoMomento: MomentoDoPedido | null };

function ler(): Registro {
  try {
    const cru = window.localStorage.getItem(CHAVE);
    const r = cru ? (JSON.parse(cru) as Partial<Registro>) : null;
    return {
      vezes: typeof r?.vezes === "number" && r.vezes >= 0 ? r.vezes : 0,
      ultimoEm: typeof r?.ultimoEm === "string" ? r.ultimoEm : null,
      ultimoMomento: r?.ultimoMomento === "quiz" || r?.ultimoMomento === "calendario" ? r.ultimoMomento : null,
    };
  } catch {
    // Sem armazenamento, o registro nasce zerado a cada sessão. É o lado
    // errado para errar, mas as travas do SISTEMA continuam valendo: recusou
    // uma vez, `permissaoConcedida` e o próprio plugin não perguntam de novo.
    return { vezes: 0, ultimoEm: null, ultimoMomento: null };
  }
}

function gravar(r: Registro): void {
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(r));
  } catch {
    /* modo privado: segue sem registro */
  }
}

/** Quantos convites já foram feitos neste aparelho. */
export function pedidosFeitos(): number {
  if (typeof window === "undefined") return 0;
  return ler().vezes;
}

/**
 * Cabe um convite agora?
 *
 * Assíncrona porque a resposta mais importante vem do sistema, não do nosso
 * registro: se a permissão já foi dada ou já foi negada, não há convite a
 * fazer, e nenhuma contagem local muda isso.
 */
export async function podeConvidar(hoje = diaLocal()): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!notificacoesDisponiveis()) return false;   // navegador: não existe o que pedir
  if (await permissaoConcedida()) return false;   // já temos

  const r = ler();
  if (r.vezes >= MAXIMO_DE_PEDIDOS) return false;
  if (r.ultimoEm && diasEntre(r.ultimoEm, hoje) < DIAS_ENTRE_PEDIDOS) return false;

  // Um "não" definitivo do sistema não é distinguível daqui sem tocar no
  // plugin, e `pedirPermissao` já devolve false nesse caso sem abrir caixa
  // nenhuma. O que evitamos aqui é o convite VISUAL — a tela que diz "ative
  // as notificações" para quem não tem mais como ativar por ali.
  return true;
}

/**
 * Faz o convite: gasta uma das três chances e abre a caixa do sistema.
 *
 * Devolve true só quando a permissão saiu concedida. A contagem sobe mesmo
 * quando a pessoa recusa — recusa também é resposta, e é ela que a trava de
 * três existe para respeitar.
 */
export async function convidar(momento: MomentoDoPedido, hoje = diaLocal()): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const r = ler();
  gravar({ vezes: r.vezes + 1, ultimoEm: hoje, ultimoMomento: momento });
  return pedirPermissao();
}
