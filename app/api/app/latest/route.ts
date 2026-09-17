import { NextResponse } from "next/server";

// Build mais recente publicado em cada loja. É a fonte do banner "versão nova
// disponível" da tela inicial do app (lib/app/appUpdate.ts).
//
// COMO USAR: depois de promover um build novo na Play ou na App Store, troque
// o número aqui e faça deploy — o banner acende em todo mundo que estiver
// atrás, sem esperar loja nenhuma. Enquanto os números apontarem para o que
// está publicado, ninguém vê nada.
//
// Os números são os de BUILD, não a versão de marketing: no Android é o
// versionCode (histórico em android/gradle.properties), no iOS o
// CFBundleVersion que o Codemagic incrementa. Aponte para o que está em
// PRODUÇÃO — quem instala pelas faixas de teste está sempre à frente e não
// deve ver aviso.
// ATENÇÃO ao número do Android: ele NÃO sai do gradle.properties. O CI usa o
// contador do Codemagic e trata o nosso `mentorqueVersionCode` só como PISO
// (ver o passo "Compilar .aab" no codemagic.yaml). Por isso a 1.5 saiu com
// versionCode 51, e não com o 13 do arquivo. Em 31/08 este número ficou em 12
// justamente por eu ter copiado do arquivo: ninguém na 1.4 recebia o aviso,
// porque 48 já era maior que 12. O número certo é o que a Play mostra em
// Produção → Versões → "Códigos de versão".
// E NÃO É O "Index" DA TELA DO CODEMAGIC TAMBÉM. Em 01/09 a tela dizia
// "Index: 12" e eu tratei isso como o PROJECT_BUILD_NUMBER, concluindo que o
// envio ia sair com 14 e ser recusado pela Play. Falso alarme, e o segundo com
// o mesmo número: o contador é do PROJETO e já estava perto de 51. A linha que
// responde de verdade é `versionCode deste envio: N`, impressa pelo passo
// "Compilar .aab" no log do Codemagic.
const LATEST = {
  // A 2.4 saiu com build 63 nas duas lojas. CORRIGIDO pelo dono em
  // 13/09/2026: em 12/09 ele tinha dito 74 ("ambos são 74"), e por um dia o
  // banner de versão nova acendeu para todo mundo na 2.4, apontando para um
  // build que a loja não tinha (é o caso "número ALTO demais" descrito
  // abaixo, acontecendo). O número que vale é o da loja, em Produção,
  // "Códigos de versão", e não o que alguém lembra de cabeça.
  // Antes: 1.7 = 55.
  // 17/09/2026: o dono avisou que "a versão 66 já está nas lojas". O número é
  // dele, como manda a nota acima (o que vale é a Play em Produção, não o
  // arquivo nem o Codemagic), e a 2.6 tem lastro no banco: 23 eventos de
  // `2.6.0` em 9 aparelhos Android desde 15/09.
  // Antes: 2.4 = 63, 1.7 = 55.
  android: 66, // 2.6 na Play
  // 17/09/2026: SOLTO, com a confirmação do dono ("66 msm") depois de eu ter
  // segurado e mostrado o que me fazia duvidar.
  //
  // O que me fazia duvidar, registrado porque quem ler isto daqui a um mês
  // merece saber: o retrato de `app_store_connect` de 17/09, colhido às 6h,
  // trazia a 2.6 em WAITING_FOR_REVIEW e a 2.5 como a última READY_FOR_SALE.
  // A explicação que concilia as duas coisas é a aprovação ter caído depois
  // da coleta, e quem tem a tela do App Store Connect na frente é o dono.
  //
  // A DÚVIDA SE RESOLVE SOZINHA AMANHÃ, e de graça: o retrato das 6h de 18/09
  // vai dizer se a 2.6 está em READY_FOR_SALE. Se não estiver, este número
  // volta para 63 na hora, porque aí o banner está mandando todo iPhone
  // procurar o que a loja não tem (foi o que houve em 12/09, com 74).
  // Antes: 2.4 = 63, 1.6 = 52.
  ios: 66, // 2.6 na App Store, confirmada pelo dono em 17/09
};

export function GET() {
  return NextResponse.json(LATEST);
}
