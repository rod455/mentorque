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
  // CONFIRMADO pelo dono em 04/09/2026: a 1.7 saiu com versionCode 55.
  android: 55, // 1.7 em produção na Play, aprovada em 03/09
  // NÃO ATUALIZADO DE PROPÓSITO, e a assimetria é a razão.
  //
  // O dono confirmou a 1.7 na PLAY. Sobre a App Store não houve confirmação, e
  // a 1.7 é justamente a versão cujo envio para a Apple foi recusado em 03/09
  // (nome de versão repetido), então supor que ela está publicada lá seria
  // supor o contrário do último fato conhecido.
  //
  // O erro tem lados de custo bem diferentes. Número BAIXO demais: ninguém vê
  // o banner, e o app segue funcionando. Número ALTO demais: todo mundo passa
  // a ver "versão nova disponível" para uma versão que a loja não tem, e a
  // pessoa vai à App Store, não encontra nada, e o aviso vira mentira. Na
  // dúvida, o número fica atrás.
  //
  // Para atualizar: App Store Connect, na versão em "Pronta para venda", o
  // número de build (CFBundleVersion). Não é o "Index" da tela do Codemagic,
  // que já causou dois falsos alarmes aqui.
  ios: 52, // 1.6 em produção na App Store, aprovada em 01/09
};

export function GET() {
  return NextResponse.json(LATEST);
}
