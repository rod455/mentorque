"use client";

import { computeUpcoming } from "./health";
import type { ServiceRecord, Vehicle } from "./types";
import type { View } from "./nav";

// Avisos dentro do app: o sino ao lado do perfil.
//
// Nada aqui é uma notificação de sistema. As de sistema (@capacitor/local-
// notifications, em ./notificacoes.ts) saem na bandeja do celular e a pessoa
// precisa aceitar. Estas vivem só dentro do app, não pedem permissão nenhuma e
// existem justamente para quem disse "não" ao sistema continuar sabendo que a
// revisão venceu.
//
// A regra que segura a lista: NENHUM aviso é escrito num banco. Todo item aqui
// é derivado do estado que o app já tem na mão, agora. Isso tem duas
// consequências boas e uma limitação honesta:
//
// - resolveu o problema, o aviso some sozinho (registrou a revisão, atualizou
//   o app, cancelou a assinatura). Não existe aviso zumbi;
// - funciona offline, porque não depende de rede;
// - em compensação, não dá para avisar de coisa que só o servidor sabe. Quando
//   isso for preciso, entra uma fonte a mais aqui, não uma segunda central.

export type Tom = "urgente" | "atencao" | "neutro";

/** Para onde o toque leva. Descritor, não função: quem sabe navegar é a tela. */
export type Destino =
  | { tipo: "tela"; view: View; carroId?: string }
  | { tipo: "loja" };

export type Aviso = {
  /**
   * Estável enquanto o motivo for o mesmo, e diferente quando o motivo muda.
   * É o que decide o que já foi lido: `rev:{carro}:3` lido não esconde
   * `rev:{carro}:4`, porque venceu mais um item e isso é notícia nova.
   */
  id: string;
  tom: Tom;
  icone: string;
  titulo: string;
  corpo: string;
  destino: Destino;
};

type Textos = {
  revisaoVencidaTitulo: string;
  revisaoVencidaCorpo: string;
  revisaoVencidaCorpoN: string;
  revisaoPertoTitulo: string;
  revisaoPertoCorpo: string;
  revisaoPertoCorpoN: string;
  assinaturaTituloHoje: string;
  assinaturaTitulo1: string;
  assinaturaTituloN: string;
  assinaturaCorpo: string;
  versaoTitulo: string;
  versaoCorpo: string;
  aulaTitulo: string;
  aulaCorpo: string;
  aulaCorpoN: string;
};

export type EntradaAvisos = {
  /** Carros que a pessoa ainda tem. Vendido não gera aviso de revisão. */
  carros: Vehicle[];
  servicosDo: (carroId: string) => ServiceRecord[];
  assinante: boolean;
  fimDoPeriodo: string | null;
  cancelando: boolean;
  temVersaoNova: boolean;
  /** Aulas publicadas há pouco, da mais recente para a mais antiga. */
  aulasNovas: { id: string; title: string }[];
  textos: Textos;
  agora?: Date;
};

const troca = (s: string, vals: Record<string, string | number>) =>
  Object.entries(vals).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)), s);

/** Dias inteiros entre hoje e uma data ISO. Negativo = já passou. */
function diasAte(iso: string, agora: Date): number | null {
  const alvo = new Date(iso);
  if (Number.isNaN(alvo.getTime())) return null;
  const DIA = 24 * 60 * 60 * 1000;
  const zerar = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((zerar(alvo) - zerar(agora)) / DIA);
}

/**
 * Quantos dias antes do fim do período o aviso da assinatura aparece.
 *
 * Cinco, e não os dois do lembrete que sai na bandeja do celular: o da bandeja
 * chega sozinho na pessoa e por isso precisa ser cirúrgico, enquanto este só é
 * visto por quem abriu o app e tocou no sino. Custa menos, então pode avisar
 * com mais folga.
 */
const DIAS_AVISO_ASSINATURA = 5;

export function montarAvisos(e: EntradaAvisos): Aviso[] {
  const agora = e.agora ?? new Date();
  const t = e.textos;
  const lista: Aviso[] = [];

  // 1. Revisões. Um aviso por carro, e só o pior caso dele: um carro com seis
  //    itens vencidos vira uma linha com "6 itens", não seis linhas. A lista
  //    precisa caber numa olhada, senão vira a mesma tela de revisões.
  for (const v of e.carros) {
    const itens = computeUpcoming(v, e.servicosDo(v.id), agora);
    const vencidos = itens.filter((i) => i.status === "overdue").length;
    const perto = itens.filter((i) => i.status === "soon").length;
    const nome = v.nickname || v.model;

    if (vencidos > 0) {
      lista.push({
        id: `rev-vencida:${v.id}:${vencidos}`,
        tom: "urgente",
        icone: "alert",
        titulo: troca(t.revisaoVencidaTitulo, { carro: nome }),
        corpo: vencidos === 1 ? t.revisaoVencidaCorpo : troca(t.revisaoVencidaCorpoN, { n: vencidos }),
        destino: { tipo: "tela", view: { name: "revisions" }, carroId: v.id },
      });
    } else if (perto > 0) {
      lista.push({
        id: `rev-perto:${v.id}:${perto}`,
        tom: "atencao",
        icone: "calendar",
        titulo: troca(t.revisaoPertoTitulo, { carro: nome }),
        corpo: perto === 1 ? t.revisaoPertoCorpo : troca(t.revisaoPertoCorpoN, { n: perto }),
        destino: { tipo: "tela", view: { name: "revisions" }, carroId: v.id },
      });
    }
  }

  // 2. Cobrança chegando. Quem já pediu cancelamento não recebe: não vai ser
  //    cobrado, então não há o que avisar, e insistir aí só parece cobrança
  //    disfarçada de aviso.
  if (e.assinante && !e.cancelando && e.fimDoPeriodo) {
    const dias = diasAte(e.fimDoPeriodo, agora);
    if (dias !== null && dias >= 0 && dias <= DIAS_AVISO_ASSINATURA) {
      const titulo =
        dias === 0 ? t.assinaturaTituloHoje : dias === 1 ? t.assinaturaTitulo1 : troca(t.assinaturaTituloN, { dias });
      lista.push({
        // A data no id, e não os dias: assim o aviso é UM por período. Com os
        // dias, ele reaparecia como não lido a cada manhã da semana final.
        id: `assinatura:${e.fimDoPeriodo.slice(0, 10)}`,
        tom: "atencao",
        icone: "clock",
        titulo,
        corpo: t.assinaturaCorpo,
        destino: { tipo: "tela", view: { name: "profile" } },
      });
    }
  }

  // 3. Versão nova na loja. Só existe dentro do app empacotado; na web o
  //    deploy já entregou a versão nova a todo mundo.
  if (e.temVersaoNova) {
    lista.push({
      id: "versao-nova",
      tom: "neutro",
      icone: "spark",
      titulo: t.versaoTitulo,
      corpo: t.versaoCorpo,
      destino: { tipo: "loja" },
    });
  }

  // 4. Conteúdo novo. Uma linha só, pela aula mais recente, com o resto
  //    contado no corpo: o valor é "tem coisa nova", não o catálogo inteiro.
  const nova = e.aulasNovas[0];
  if (nova) {
    const resto = e.aulasNovas.length - 1;
    lista.push({
      id: `aula:${nova.id}`,
      tom: "neutro",
      icone: "book",
      titulo: troca(t.aulaTitulo, { titulo: nova.title }),
      corpo: resto > 0 ? troca(t.aulaCorpoN, { n: resto }) : t.aulaCorpo,
      destino: { tipo: "tela", view: { name: "content", id: nova.id } },
    });
  }

  const peso: Record<Tom, number> = { urgente: 0, atencao: 1, neutro: 2 };
  return lista.sort((a, b) => peso[a.tom] - peso[b.tom]);
}

// ---- O que já foi lido ------------------------------------------------------
//
// Fica no aparelho, não na conta. Um aviso lido é uma informação sobre a tela
// que a pessoa olhou naquele celular, não sobre a conta dela, e sincronizar
// isso custaria uma tabela e uma escrita a cada abertura do sino para
// resolver um problema que ninguém tem.

const CHAVE = "mq-avisos-lidos";

export function lerLidos(): string[] {
  try {
    const cru = window.localStorage.getItem(CHAVE);
    const arr = cru ? (JSON.parse(cru) as unknown) : [];
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Guarda como lidos os ids informados, DESCARTANDO os que não estão mais na
 * lista atual.
 *
 * A poda não é limpeza: é o que faz um aviso de id fixo voltar a funcionar.
 * "versao-nova" some quando a pessoa atualiza; sem podar, o id continuaria
 * marcado como lido para sempre e a PRÓXIMA versão nasceria silenciosa.
 */
export function marcarLidos(idsVivos: string[]): void {
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(idsVivos));
  } catch {
    /* sem armazenamento: o sino reabre com tudo por ler, o que é o lado seguro */
  }
}
