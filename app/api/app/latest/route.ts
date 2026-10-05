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
  // 17/09/2026, fim do dia: 2.7, build 67, aprovada nas duas lojas. O número
  // é do dono, como manda a nota acima (o que vale é a Play em Produção, não
  // o arquivo nem o Codemagic).
  // Antes: 2.6 = 66, 2.4 = 63, 1.7 = 55.
  // 25/09/2026: 2.8, build 68. O dono avisou, e desta vez a conferência não
  // dependeu da palavra de ninguém, porque a fonte do Play no retrato não traz
  // versão: 30 APARELHOS ANDROID já reportaram `versao = 2.8.0` no nosso
  // próprio funil, o mais recente às 07h31 daquele dia.
  // Antes: 2.7 = 67, 2.6 = 66, 2.4 = 63, 1.7 = 55.
  // 30/09/2026: 2.9, build 69. Aprovada nas DUAS lojas (a Play primeiro, a
  // Apple hoje). O número é do dono, como manda a nota acima, e bate com o
  // menor valor possível: a 2.8 saiu com 68 e o código só pode crescer.
  //
  // A Play não precisou da palavra de ninguém: o nosso próprio funil tem 84
  // APARELHOS ANDROID reportando `versao = 2.9.0` desde 28/09, o mais recente
  // hoje às 22h08. No iPhone a prova ainda não existe do lado de cá (1
  // aparelho em 29/09, que é TestFlight), porque a coleta do
  // `app_store_connect` é das 6h e a aprovação saiu depois: às 6h de hoje ela
  // ainda respondia WAITING_FOR_REVIEW. Confere amanhã, sozinha.
  // Antes: 2.8 = 68, 2.7 = 67, 2.6 = 66, 2.4 = 63, 1.7 = 55.
  // 05/10/2026: 3.0, build 70, nas duas lojas. Número do dono, e bate com o
  // menor valor possível (a 2.9 saiu com 69). A Play não precisou da palavra de
  // ninguém: 29 aparelhos Android reportam `versao = 3.0.0` no funil desde
  // 04/10, o mais recente às 20h39 de hoje.
  // Antes: 2.9 = 69, 2.8 = 68, 2.7 = 67, 2.6 = 66, 2.4 = 63, 1.7 = 55.
  android: 70, // 3.0 na Play
  // A LIÇÃO DESTE CAMPO, que vale mais que o número: em 12/09 ele foi para 74
  // pela lembrança de alguém, e o banner acendeu para todo mundo na 2.4
  // apontando para um build que a loja não tinha. O erro tem lados de custo
  // bem diferentes. Número BAIXO demais: ninguém vê o banner, e o app segue
  // funcionando. Número ALTO demais: todo iPhone passa a ver "versão nova
  // disponível", vai à loja, não encontra nada, e o aviso vira mentira. Na
  // dúvida, o número fica atrás.
  //
  // COMO A DÚVIDA SE RESOLVE, e é de graça: o retrato de `app_store_connect`
  // das 6h do dia seguinte diz em que estado cada versão está. Ele é colhido
  // uma vez por dia, então não enxerga uma aprovação da tarde; por isso ele
  // serve para CONFERIR no dia seguinte, não para contestar na hora.
  //
  // Para atualizar: App Store Connect, na versão em "Pronta para venda", o
  // número de build (CFBundleVersion). Não é o "Index" da tela do Codemagic,
  // que já causou dois falsos alarmes aqui.
  // Antes: 2.6 = 66, 2.4 = 63, 1.6 = 52.
  // 25/09/2026: 2.8, build 68. Conferido na fonte que a nota acima manda usar,
  // e não de cabeça: o App Store Connect responde READY_FOR_SALE para a 2.8
  // desde 24/09.
  // 30/09/2026: 2.9, build 69, aprovada pela Apple hoje. Número do dono.
  // A FONTE QUE ESTA NOTA MANDA USAR AINDA NÃO CONFIRMA, e está dito de
  // propósito: o retrato do `app_store_connect` é colhido às 6h e, naquela
  // hora, a 2.9 estava em WAITING_FOR_REVIEW. A aprovação veio depois. Como a
  // própria nota acima já dizia, ele serve para CONFERIR no dia seguinte, não
  // para contestar na hora. Se amanhã o retrato não trouxer a 2.9 em
  // READY_FOR_SALE, este número é o primeiro lugar a olhar.
  // Antes: 2.8 = 68, 2.6 = 66, 2.4 = 63, 1.6 = 52.
  // 05/10/2026: 3.0, build 70, aprovada pela Apple, número do dono. Do lado
  // de cá só 1 aparelho iOS reporta 3.0.0 (04/10 à noite, o TestFlight do
  // dono), então a confirmação é a de sempre: o retrato do `app_store_connect`
  // de 06/10 tem que responder READY_FOR_SALE para a 3.0; se não responder,
  // este campo volta para 69 na hora.
  ios: 70, // 3.0 na App Store, aprovada em 05/10
  // A QUAL VERSÃO DE MARKETING OS DOIS NÚMEROS ACIMA CORRESPONDEM (25/09/2026).
  //
  // Existe porque neste dia o banner NÃO acendeu, e a causa não era loja nem
  // cache: a troca do número aqui simplesmente não tinha sido feita. Uma
  // substituição de texto não casou, falhou calada, e o commit foi empurrado
  // dizendo que o banner estava aceso. Passei meia hora investigando a borda
  // da Vercel antes de abrir o arquivo.
  //
  // Não é campo decorativo: `npm run conferir:versoes` exige que ele seja igual
  // à ÚLTIMA entrada de `JA_PUBLICADAS`. Ou seja, acrescentar uma versão à
  // lista de publicadas e esquecer de acender o banner passa a reprovar, que é
  // exatamente o par de passos que se separou hoje.
  //
  // O app ignora este campo (lê só `android`/`ios`), então ele não muda nada
  // para quem consome.
  versao: "3.0",
};

export function GET() {
  return NextResponse.json(LATEST);
}
