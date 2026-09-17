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
  // SEGURADO EM 17/09/2026, e a assimetria é a razão. Este número NÃO
  // acompanhou o Android de propósito.
  //
  // O dono disse que a 66 está "nas lojas", no plural. A última medição diz
  // outra coisa sobre a Apple: o retrato de `app_store_connect` de HOJE
  // (17/09, colhido às 6h) traz a 2.6 em WAITING_FOR_REVIEW, criada em 16/09
  // 03:41 do Pacífico, e a versão em READY_FOR_SALE ainda é a 2.5. Pode ser
  // que a Apple tenha aprovado depois da coleta; o retrato não saberia.
  //
  // O erro tem lados de custo bem diferentes, e é isso que decide enquanto há
  // dúvida. Número BAIXO demais: ninguém vê o banner, e o app segue
  // funcionando. Número ALTO demais: todo iPhone passa a ver "versão nova
  // disponível", a pessoa vai à App Store, não encontra nada, e o aviso vira
  // mentira. Na dúvida, o número fica atrás.
  //
  // E NÃO É HIPÓTESE NESTA CASA: em 12/09 este campo foi para 74 pela
  // lembrança de alguém e o banner acendeu para todo mundo na 2.4, apontando
  // para um build que a loja não tinha. A nota do Android acima é a cicatriz
  // disso.
  //
  // Para soltar: App Store Connect, na versão em "Pronta para venda", o
  // número de build (CFBundleVersion). Não é o "Index" da tela do Codemagic,
  // que já causou dois falsos alarmes aqui. Confirmado isso, este número vira
  // 66 numa linha.
  ios: 63, // 2.5 é o que está em produção na App Store; 2.6 em análise (17/09)
};

export function GET() {
  return NextResponse.json(LATEST);
}
