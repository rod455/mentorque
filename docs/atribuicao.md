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
2. **Rótulos de privacidade das lojas.** A primeira versão desta linha dizia
   "identificadores de aparelho não (sem IDFA)", e estava ERRADA. Sem ATT o
   app realmente não pega o IDFA, mas identificador de aparelho ele pega:
   no iPhone o IDFV, e no Android o identificador de publicidade (temos a
   permissão `AD_ID` no manifesto, usada pelo AdMob e pelo AppsFlyer).
   Declarar "não coleta identificador" seria declaração falsa para as duas
   lojas. O que declarar, em cada uma:

   **App Store Connect → App Privacy** (o iPhone não tem AdMob):

   | Dado | Coleta | Finalidade | Vinculado a você | Usado para rastrear |
   |---|---|---|---|---|
   | Identificadores → ID do dispositivo (IDFV) | sim | Análise + Publicidade do desenvolvedor | **não** | **não** |
   | Dados de uso → Interação com o produto | sim | Análise | não | não |
   | Diagnóstico → Outros dados de diagnóstico | sim | Análise | não | não |

   **Play Console → Segurança dos dados** (o Android tem AdMob junto):

   | Dado | Coleta | Compartilha | Finalidade |
   |---|---|---|---|
   | Device or other IDs (ID de publicidade) | sim | **sim** | Publicidade/marketing, Análise, Prevenção de fraude |
   | App activity → Interações no app | sim | não | Análise |
   | App info and performance → Diagnóstico | sim | não | Análise |

   E marcar a declaração de **ID de publicidade** no formulário da Play (ela
   é obrigatória por causa da permissão `AD_ID`).

   POR QUE "usado para rastrear = não" NA APPLE, com um SDK de atribuição
   dentro: rastreamento, na definição da Apple, é ligar os dados desta
   pessoa a dados de TERCEIROS no nível do indivíduo, para anúncio ou venda
   a data broker. Não fazemos isso: não pedimos ATT, não pegamos IDFA, a
   atribuição do iPhone é o SKAdNetwork (mecanismo da própria Apple, que
   entrega agregado) e os interruptores de compartilhamento avançado do
   AppsFlyer com a Meta estão DESLIGADOS.

   DUAS COISAS MUDAM ESSA RESPOSTA, e quem mexer nelas tem de voltar aqui:
   ligar o "Advanced Matching" na integração da Meta, ou passar a mandar o
   CUID (o id da conta) para o AppsFlyer. Qualquer uma das duas transforma o
   dado em vinculado à identidade, e a da Apple passa a exigir ATT.
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
