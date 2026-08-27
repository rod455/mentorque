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
const LATEST = {
  android: 10, // 1.2 publicada na Play (versionCode 10, android/gradle.properties)
  ios: 45, // 1.2 publicada na App Store (build 45, conferido pelo dono no App Store Connect)
};

export function GET() {
  return NextResponse.json(LATEST);
}
