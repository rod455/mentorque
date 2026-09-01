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
  // CONFIRMADO pelo dono na linha `versionCode deste envio: 52` do log do
  // Codemagic, que é a única fonte que vale para este número.
  android: 52, // 1.6 em produção na Play, aprovada em 01/09
  // DEDUZIDO, não conferido, e vale dizer de onde vem a dedução: o passo
  // "Número da build (iOS, incremental)" usa `PROJECT_BUILD_NUMBER + 1`, o
  // mesmo do Android. A 1.5 saiu com 51 quando o piso do gradle era 13, ou
  // seja, aquele 51 veio do CONTADOR e não do piso; contador em 50 então,
  // 51 agora, mais um dá 52 nas duas plataformas. Se a App Store mostrar
  // outro número, é este aqui que está errado, e o conserto é uma linha.
  ios: 52, // 1.6 em produção na App Store, aprovada em 01/09
};

export function GET() {
  return NextResponse.json(LATEST);
}
