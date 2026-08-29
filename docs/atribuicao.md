# Atribuição de anúncios (AppsFlyer): o que está pronto e o que é do dono

Ligada em 29/08 para as campanhas de Meta e Google Ads que começam na
segunda. Conta criada com admin@mentorque.com.br, plano gratuito, moeda BRL,
fuso São Paulo, apps Android e iOS cadastrados.

## O que está no app (1.4)

- SDK oficial (appsflyer-capacitor-plugin 6.18.0) inicializado a cada
  abertura no app das lojas, silencioso e sem nenhum evento manual: o funil
  de negócio continua nascendo no servidor, e o SDK só cuida da atribuição
  de instalação.
- iPhone SEM a folha de rastreamento (ATT) e sem IDFA, de propósito: a
  atribuição vem agregada pelo SKAdNetwork, que é o que Meta e Google usam
  hoje. Pedir ATT na primeira abertura assusta o usuário e a revisão da
  Apple, por ganho marginal. Se um dia IDFA fizer falta, é decisão nova.
- Info.plist com o endpoint de postback do AppsFlyer e os ids SKAdNetwork
  de Meta (v9wttpbfk9, n38lu8286q) e Google (cstr6suwn9). Rede nova de
  anúncio = id novo ali (e build novo).
- Dev key embutida no código (lib/app/atribuicao.ts), como o client id do
  Google: ela viaja no binário de qualquer forma.

## O que só o dono faz (antes de segunda)

1. **Ligar os parceiros no AppsFlyer**: painel → Partner Marketplace (ou
   Integrated Partners) → Meta ads → ativar (vai pedir conexão com o
   Business Manager) e Google Ads → ativar (pede o link com a conta do
   Google Ads, um código de "link" que aparece lá). Sem isso o AppsFlyer
   mede, mas não conversa com as plataformas de anúncio.
2. **Rótulos de privacidade da App Store**: no App Store Connect → App
   Privacy, declarar o que o SDK coleta SEM ATT: identificadores de
   aparelho não (sem IDFA), mas dados de uso/diagnóstico e endereço IP
   sim, finalidade "Analytics/Marketing do desenvolvedor", não vinculados
   à identidade. A Play tem seção equivalente (Segurança dos dados).
3. **Nas campanhas**: Android roda e mede desde o primeiro dia (a
   atribuição do Android independe de SKAN). No iPhone, os números do
   SKAdNetwork chegam agregados e com atraso de 1 a 3 dias, e SÓ para
   instalações da 1.4 em diante: é o comportamento normal, não defeito.
4. **Devices de teste**: quando a 1.4 estiver no TestFlight/faixa interna,
   registrar o iPhone e um Android em My Devices no AppsFlyer, para os
   testes não sujarem os números e a instalação de teste aparecer ao vivo.

## O realismo do calendário

A 1.3 está em revisão e a 1.4 (com o SDK) vai atrás. Anúncio pode começar
na segunda mesmo que a 1.4 ainda esteja rolando para as lojas: o clique
leva para a loja de qualquer jeito, e o que se perde no intervalo é só a
ATRIBUIÇÃO fina das instalações (quem instalou a 1.3 não reporta). O funil
do servidor (cadastros, assinaturas, UTM da LP) continua medindo desde já.
