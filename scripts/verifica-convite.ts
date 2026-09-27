// O convite de aviso depois do cadastro do carro: quando a marca é gasta.
//
// ESTA CONFERÊNCIA NASCE DE UM BURACO MEDIDO em 25/09/2026. O convite de
// permissão é a porta de todos os lembretes do app, e ele só aparece para quem
// tem conta. A marca que leva o pedido do cadastro até a garagem era consumida
// ao montar a tela, sem olhar se havia conta: quem cadastrava o carro como
// CONVIDADO queimava o melhor momento do pedido sem ver convite nenhum, e
// criar a conta cinco minutos depois já não trazia o momento de volta.
//
// Convidado é o caso comum aqui: o app oferece explorar sem cadastrar e só
// pede a conta depois, com a folha "Salve sua garagem" em cima deste mesmo
// cadastro de carro. Na janela medida, 28 aparelhos viram o convite contra
// cerca de 367 que começaram o onboarding, e um em quatro aceitou.
//
// O que esta conferência protege, nesta ordem:
//
//   1. com conta, a marca vira convite
//   2. a marca vale UMA vez (dois montes não viram dois convites)
//   3. SEM conta, a marca NÃO é gasta: ela espera
//   4. a marca que esperou vira convite quando a conta chega
//   5. sem pedido nenhum, ninguém é convidado
//
// O que ela NÃO alcança, e fica dito: as três travas do pedido (quatro dias
// entre convites, três na vida, nunca depois de um não do sistema) vivem em
// `podeConvidar`, que conversa com o sistema operacional e não é exercitado
// aqui. E a marca morre com a sessão, de propósito, então o caso "criou a
// conta no dia seguinte" continua sem convite, por desenho.
//
// Rode com: npm run conferir:convite
import { pedirConviteNoCarro, consumirConviteNoCarro } from "../lib/app/marcasDeConvite.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) {
    console.log(`✓ ${nome}`);
    return;
  }
  falhas++;
  console.error(`✗ ${nome}${detalhe ? `\n   ${detalhe}` : ""}`);
}

// A garagem lê o estado da conta na hora de consumir; aqui isso é só um booleano.
const COM_CONTA = true;
const SEM_CONTA = false;

// ── 1. com conta, a marca vira convite ──────────────────────────────────────
{
  pedirConviteNoCarro();
  conferir("com conta, quem cadastrou o carro é convidado", consumirConviteNoCarro(COM_CONTA) === true);
}

// ── 2. a marca vale uma vez só ──────────────────────────────────────────────
{
  conferir("a marca não sobra para uma segunda montagem", consumirConviteNoCarro(COM_CONTA) === false);
}

// ── 3. sem conta, a marca não é gasta ───────────────────────────────────────
//
// É o buraco em si: antes, esta chamada devolvia true, o convite não era
// desenhado (não há conta) e a marca ia embora junto.
{
  pedirConviteNoCarro();
  conferir("convidado não é convidado agora", consumirConviteNoCarro(SEM_CONTA) === false);
}

// ── 4. e a marca que esperou vira convite quando a conta chega ──────────────
{
  conferir("a marca esperou pela conta", consumirConviteNoCarro(COM_CONTA) === true);
  conferir("e continua valendo uma vez só", consumirConviteNoCarro(COM_CONTA) === false);
}

// ── 5. sem pedido, ninguém é convidado ──────────────────────────────────────
{
  conferir("sem cadastro de carro não há convite", consumirConviteNoCarro(COM_CONTA) === false);
  conferir("nem para convidado", consumirConviteNoCarro(SEM_CONTA) === false);
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) falharam.`);
  process.exit(1);
}
console.log("\nConvite do carro: a marca espera pela conta em vez de queimar.");
