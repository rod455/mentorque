// O que acontece com a garagem quando a pessoa responde à folha de importação.
//
// POR QUE ISTO EXISTE (10/09/2026). Ao entrar numa conta que já tem garagem,
// o que foi cadastrado como convidado neste aparelho fica esperando decisão
// (a folha `ImportarGaragem`). Até aqui a única resposta possível era "leva"
// ou "não leva", e quando o carro do aparelho era O MESMO carro da conta
// (regra em `mesmoCarro.ts`), "leva" produzia dois iguais na garagem: a folha
// avisava, mas a única saída sem duplicar era abrir mão do histórico feito no
// aparelho. O QA de 09/09 deixou isso de pé de propósito, porque juntar ou
// apagar sozinho escolheria qual carro sobrevive. Em 10/09 o dono decidiu:
// quando é o mesmo carro, PERGUNTA, igual já se pergunta para os diferentes.
//
// As três respostas para o carro repetido, e o que cada uma faz:
//
//   · JUNTAR: vira um carro só, o da conta. O histórico e os lembretes feitos
//     no aparelho passam a apontar para ele; os campos que a conta deixou em
//     branco (placa, motor, foto, apelido...) vêm do aparelho. Nada é apagado.
//   · SÓ O DA CONTA: o que foi feito no aparelho não entra. É o padrão da
//     folha (a conta continua como estava).
//   · SÓ O DESTE APARELHO: o carro da conta sai, com o histórico dele, e o do
//     aparelho entra no lugar. É a única resposta que apaga alguma coisa, e
//     por isso a folha diz isso em cima do botão.
//
// Tudo aqui é função pura sobre a sessão, sem React, para `conferir:garagem`
// exercitar cada resposta com defeito plantado.
import type { ServiceRecord, Vehicle } from "./types";

/** A resposta da pessoa para um carro do aparelho. */
export type EscolhaDeImportacao =
  | { id: string; acao: "levar" }
  | { id: string; acao: "juntar"; noCarro: string }
  | { id: string; acao: "trocar"; noLugarDe: string };

/** O pedaço da sessão que a importação mexe. Estrutural, para não puxar o store. */
export type GaragemDaSessao = {
  vehicles: Vehicle[];
  services: ServiceRecord[];
  reminders: string[]; // "vehicleId:itemKey"
  activeVehicleId: string | null;
};

/** O que ficou esperando decisão (mesma forma de `ImportacaoPendente` do store). */
export type PendenteDeImportacao = {
  veiculos: Vehicle[];
  servicos: ServiceRecord[];
  lembretes: string[];
};

const doCarro = (lembrete: string) => lembrete.split(":")[0];

/**
 * Um carro só a partir de dois cadastros do mesmo veículo.
 *
 * A identidade (id, tipo, marca, modelo, ano) é a DA CONTA: é o carro que já
 * existe nos outros aparelhos da pessoa e em tudo o que aponta para ele. O
 * aparelho só preenche o que a conta deixou em branco. Exceção: o km, que é
 * uma medida e não um cadastro; fica o informado por último e, sem data nos
 * dois, o maior (odômetro não anda para trás).
 */
export function juntarCarros(daConta: Vehicle, doAparelho: Vehicle): Vehicle {
  const kmDaConta = daConta.odometerKm ?? null;
  const kmDoAparelho = doAparelho.odometerKm ?? null;
  let km: Pick<Vehicle, "odometerKm" | "kmUpdatedAt"> = {};
  if (kmDaConta != null && kmDoAparelho != null) {
    const a = daConta.kmUpdatedAt ?? "";
    const b = doAparelho.kmUpdatedAt ?? "";
    const aparelhoManda = a && b ? b > a : !a && !b ? kmDoAparelho > kmDaConta : !!b;
    km = aparelhoManda
      ? { odometerKm: kmDoAparelho, kmUpdatedAt: doAparelho.kmUpdatedAt }
      : { odometerKm: kmDaConta, kmUpdatedAt: daConta.kmUpdatedAt };
  } else if (kmDaConta != null) {
    km = { odometerKm: kmDaConta, kmUpdatedAt: daConta.kmUpdatedAt };
  } else if (kmDoAparelho != null) {
    km = { odometerKm: kmDoAparelho, kmUpdatedAt: doAparelho.kmUpdatedAt };
  }
  return {
    ...doAparelho,
    ...semVazios(daConta),
    id: daConta.id,
    type: daConta.type,
    make: daConta.make,
    model: daConta.model,
    year: daConta.year,
    ...km,
    quiz: { ...(doAparelho.quiz ?? {}), ...(daConta.quiz ?? {}) },
    fuelPrefs: daConta.fuelPrefs ?? doAparelho.fuelPrefs,
  };
}

/** Só as chaves com valor: é o que permite "a conta ganha quando preencheu". */
function semVazios<T extends object>(o: T): Partial<T> {
  const r: Partial<T> = {};
  for (const [k, v] of Object.entries(o)) {
    if (v !== undefined && v !== null && v !== "") (r as Record<string, unknown>)[k] = v;
  }
  return r;
}

/**
 * Aplica as respostas da folha à sessão da conta.
 *
 * Id que não está no pendente é ignorado (a folha só oferece o que está lá);
 * "juntar" e "trocar" cujo carro da conta não existe mais viram "levar", que é
 * o caminho que não perde nada. Lista vazia devolve a sessão intacta.
 */
export function aplicarImportacao<S extends GaragemDaSessao>(
  sessao: S,
  pendente: PendenteDeImportacao,
  escolhas: EscolhaDeImportacao[],
): S {
  let vehicles = [...sessao.vehicles];
  let services = [...sessao.services];
  let reminders = [...sessao.reminders];
  let activeVehicleId = sessao.activeVehicleId;
  const garagemVazia = vehicles.length === 0;

  for (const escolha of escolhas) {
    const carro = pendente.veiculos.find((v) => v.id === escolha.id);
    if (!carro) continue;
    const servicosDele = pendente.servicos.filter((r) => r.vehicleId === carro.id);
    const lembretesDele = pendente.lembretes.filter((r) => doCarro(r) === carro.id);
    const naConta = (id: string) => vehicles.find((v) => v.id === id) ?? null;

    if (escolha.acao === "juntar" && naConta(escolha.noCarro)) {
      const alvo = naConta(escolha.noCarro)!;
      vehicles = vehicles.map((v) => (v.id === alvo.id ? juntarCarros(alvo, carro) : v));
      const jaTem = new Set(services.map((r) => r.id));
      services = [
        ...services,
        ...servicosDele.filter((r) => !jaTem.has(r.id)).map((r) => ({ ...r, vehicleId: alvo.id })),
      ];
      reminders = [...new Set([...reminders, ...lembretesDele.map((r) => `${alvo.id}:${r.slice(carro.id.length + 1)}`)])];
      continue;
    }

    if (escolha.acao === "trocar" && naConta(escolha.noLugarDe)) {
      const sai = escolha.noLugarDe;
      vehicles = vehicles.map((v) => (v.id === sai ? carro : v));
      services = [...services.filter((r) => r.vehicleId !== sai), ...servicosDele];
      reminders = [...reminders.filter((r) => doCarro(r) !== sai), ...lembretesDele];
      if (activeVehicleId === sai) activeVehicleId = carro.id;
      continue;
    }

    // "levar", ou "juntar"/"trocar" órfãos: entra como carro novo, sem duplicar
    // por id (o id do aparelho nunca existe na conta, mas custa nada).
    if (naConta(carro.id)) continue;
    vehicles = [...vehicles, carro];
    services = [...services, ...servicosDele];
    reminders = [...new Set([...reminders, ...lembretesDele])];
    // Garagem vazia até aqui: o primeiro importado vira o ativo, senão a Home
    // abriria sem carro selecionado tendo carro na garagem.
    if (garagemVazia && !activeVehicleId) activeVehicleId = carro.id;
  }

  return { ...sessao, vehicles, services, reminders, activeVehicleId };
}
