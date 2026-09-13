"use client";

import { AVISO, agendar, cancelar, notificacoesDisponiveis, permissaoConcedida } from "./notificacoes";
import { avisosDasDatas, idsDosAvisosDeData } from "./datasDoCarro";
import type { TipoDeData, Vehicle } from "./types";

// Os avisos das datas do carro (13/09/2026): IPVA, licenciamento, seguro e
// CNH, 30, 7 e 1 dia antes, às 9h. Ids fixos (lib/app/notificacoes.ts,
// AVISO.datasDoCarro), cancelados e refeitos a cada abertura e a cada mudança
// de data, como o quiz das três manhãs. Só o carro ativo: quem tem dois
// carros vê as datas do outro ao trocar de carro, e os avisos seguem junto.
//
// Sem `rota` de propósito: a lista de rotas de aviso é fechada
// (lib/app/rotaPendente.ts), e o toque abre o Início, onde o card "vence em
// n dias" já está esperando.
export async function sincronizarLembreteDatas(o: {
  quer: boolean;
  veiculo: Vehicle | null;
  textos: { titulo: string; tituloAmanha: string; corpo: string; corpoEstimada: string; nomes: Record<TipoDeData, string>; carro: string };
  agora?: Date;
}): Promise<void> {
  if (!notificacoesDisponiveis()) return;
  const ids = idsDosAvisosDeData(AVISO.datasDoCarro);
  if (!o.quer || !o.veiculo) {
    for (const id of ids) await cancelar(id);
    return;
  }
  if (!(await permissaoConcedida())) return;
  const avisos = avisosDasDatas(o.veiculo, AVISO.datasDoCarro, o.agora ?? new Date());
  const vivos = new Set(avisos.map((a) => a.id));
  for (const id of ids) if (!vivos.has(id)) await cancelar(id);
  for (const a of avisos) {
    const nome = o.textos.nomes[a.tipo];
    const titulo = a.diasAntes === 1
      ? o.textos.tituloAmanha.replace("{tipo}", nome).replace("{carro}", o.textos.carro)
      : o.textos.titulo.replace("{tipo}", nome).replace("{carro}", o.textos.carro).replace("{n}", String(a.diasAntes));
    // Data estimada pelo final da placa: o aviso pede para conferir.
    await agendar({ id: a.id, titulo, corpo: a.estimada ? o.textos.corpoEstimada : o.textos.corpo, quando: a.quando });
  }
}
