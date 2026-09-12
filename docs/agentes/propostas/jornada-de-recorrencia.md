# Jornada de recorrência: e-mail e push, proposta para o dono

Escrita em 12/09/2026 a pedido do dono: "vamos implementar email e push para
garantir a recorrência das pessoas. Crie uma jornada de emails de cadência,
com principais pontos de dor do cliente que podem fazer ele voltar. Quem tiver
carro cadastrado, use as informações para criar jornadas personalizadas."

É proposta. Nada aqui foi construído nem enviado. Mensagem a cliente é alçada
do dono: os textos abaixo são rascunhos para ele aprovar, mudar ou vetar.

## 1. Quem dá para alcançar, e por onde

Antes da jornada, o mapa de quem existe. Régua: `estado_da_base` e
`push_tokens`, lidos em 12/09.

| quem | quantos | e-mail | push do servidor | aviso local (no aparelho) |
|---|---|---|---|---|
| contas | 27 (todas com e-mail) | sim | 1 pessoa com token (Android) | só quem usa o app das lojas e ligou avisos |
| contas com carro | 13 | sim, personalizado | idem | idem |
| contas com serviço registrado | 4 | sim, muito personalizado | idem | idem |
| convidados (sem conta), a maioria no Android e iPhone | dezenas por semana | **não** | **não** | sim: os cinco momentos da 2.4 e o quiz |

Três consequências, e elas desenham a proposta inteira:

1. **E-mail é o único canal que chega em quem tem conta e usa pela web**, que
   foi 13 das 16 contas desde 04/09. A web não tem aviso nenhum.
2. **Push do servidor hoje alcança uma pessoa.** O código existe
   (`/api/push/enviar`, FCM e APNs), mas o token só é gravado quando a pessoa
   liga avisos no app das lojas, e as chaves (`FCM_CONTA_SERVICO`,
   `APNS_CHAVE_P8`, `APNS_KEY_ID`, `APNS_TEAM_ID`) não constam como
   colocadas na Vercel. Construir jornada de push do servidor agora é
   construir para ninguém. O aviso local já faz o papel dele no aparelho.
3. **Convidado não tem e-mail.** A recorrência dele fica com os avisos
   locais, que já existem. O jeito de ele entrar na jornada é criar conta, e
   isso é uma proposta à parte (não misturar aqui).

Recomendação: **e-mail primeiro, para as contas; push do servidor só quando
houver token e chave.** O que a jornada de e-mail avisa é o mesmo que o
aviso local já avisa no aparelho, para quem tem os dois não haver
contradição: mesma régua, mesmo texto, canais diferentes.

## 2. A cadência das contas novas (14 dias, 5 e-mails)

Cada e-mail é UMA dor e UMA ação. Quem tem carro cadastrado recebe a versão
com o carro dele no assunto e no corpo; quem não tem recebe a versão que pede
o carro, porque sem carro o app não tem o que lembrar.

| dia | dor | sem carro | com carro (exemplo: Gol 2016) | ação |
|---|---|---|---|---|
| D0, na hora | "criei a conta e agora?" | "Sua conta está pronta. Falta o carro, e leva um minuto." | "Sua conta está pronta. O seu Gol 2016 já tem calendário." | abrir o app |
| D2 | "não sei quando fazer a revisão" | "Sem o carro, o Mentorque é só o quiz. Com ele, é o calendário do seu carro." | "O que o seu Gol 2016 precisa nos próximos 90 dias" (lista de `planoDosItens`, com data e km) | cadastrar o carro / ver o calendário |
| D5 | "pagar caro na oficina" | "Quanto custa uma troca de óleo na sua região?" (faixa nacional) | "Troca de óleo no Gol 2016: a faixa de preço antes de você fechar" (faixa do tipo, `faixaDePreco.ts`) | registrar o último serviço |
| D9 | "não entendo o que o mecânico fala" | "Pergunte à Biela antes de aceitar o orçamento" | "O manual do Gol 2016 está na Biela" (só se há manual; senão a versão genérica) | abrir a Biela |
| D14 | "luz acesa, barulho, e agora?" | os quatro guias de sintoma do site | "Seu Gol 2016 tem 9 anos: o que costuma aparecer nessa idade" (traits: carro velho, km alto) | responder o quiz |

Regras da cadência:

- Quem fez a ação antes do e-mail **não recebe aquele e-mail**: cadastrou o
  carro no D1, o D2 vira a versão "com carro"; registrou serviço, o D5 sai.
- Quem abriu o app no dia não recebe e-mail no dia. Lembrete para quem está
  usando é ruído.
- Assinante em teste grátis não recebe oferta nenhuma nesta cadência. Preço
  e planos são do dono, e não entram aqui sem ele.

## 3. Jornadas por gatilho (contas com carro)

Aqui está a personalização de verdade: não é "dia X depois do cadastro", é
"o carro DESSA pessoa chegou nesse ponto". As regras já existem no app, são
puras e rodam no servidor sem mudar nada: `planoDosItens`, `computeUpcoming`,
`proximoAvisoDeVencida`, `quandoAvisarCarroParado`, `vehicleTraits`.

| gatilho | regra (já no código) | assunto (rascunho) | espelha o aviso local |
|---|---|---|---|
| revisão chegando | item com `dataPrevista` a 30 dias, ou km previsto a 1.000 km do atual | "Troca de óleo do Gol 2016 vence em 30 dias" | `lembreteRevisao` |
| revisão vencida | `proximoAvisoDeVencida`, uma vez por item a cada 30 dias | "O Gol 2016 passou do ponto: troca de óleo vencida" | momento 3 da 2.4 |
| km parado | `kmUpdatedAt` há mais de 45 dias | "Quantos km o Gol 2016 tem hoje? O calendário depende disso" | lembrete mensal de km |
| cadastrou e sumiu | `quandoAvisarCarroParado`: carro cadastrado, zero serviço e zero quiz, D+2 (e-mail no D+7 se ainda nada) | "O Gol 2016 está cadastrado, mas ainda não conta nada" | momento 1 da 2.4 |
| serviço registrado | primeiro serviço com valor | "Você pagou R$ 280 na troca de óleo. Na região, a faixa é R$ 190 a 320" | momento 2 da 2.4 |
| sumiu do app | 14 dias sem abrir, e de novo aos 30 | "O Gol 2016 está sem novidade há duas semanas. Tem alguma coisa pendente" (lista do que venceu ou vai vencer) | nenhum: é só e-mail |

Sazonais, por época do ano, filtrados pelo carro (idade e km):

| quando | dor | assunto (rascunho) |
|---|---|---|
| dezembro e julho | viagem de férias | "Antes de pegar a estrada com o Gol 2016: seis itens em cinco minutos" |
| outubro a março (chuva) | pneu careca, palheta, aquaplanagem | "Chuva chegando: pneu e palheta do Gol 2016" |
| janeiro | IPVA e licenciamento | "IPVA do Gol 2016: o calendário do estado" (só se o estado for conhecido) |

Frequência combinada, para não virar perseguição: **no máximo um e-mail a
cada 3 dias por pessoa, nunca dois no mesmo dia**; gatilho ganha de cadência,
cadência ganha de sazonal. Quem clica em "não quero mais" sai de tudo, na
hora, sem perguntar por quê.

## 4. Push: o que fazer e o que não fazer

- **Não construir jornada de push do servidor agora.** Um token, chaves
  ausentes. Quando o dono colocar as quatro chaves na Vercel, o mesmo
  motor da jornada (item 5) ganha um segundo canal sem regra nova: onde há
  token, manda push com o mesmo texto do assunto; onde não há, só o e-mail.
- **O aviso local continua sendo o push de quem usa o app**, com ou sem
  conta. A fila da 2.5 (quiz cobrindo três manhãs; confirmação ao ligar
  avisos) é o que mais aumenta recorrência no aparelho, e não depende de
  nada desta proposta.
- Ver por que só uma pessoa tem token entre 27 contas é pergunta para o
  roteiro de aparelho da 2.4: ligar avisos no Perfil deveria gravar o token.

## 5. Como seria construído (para o dono dimensionar)

- **Um cron diário na Vercel** (`/api/cron/jornada`, 9h de Brasília), no
  mesmo molde do `biela-resumo` que já roda toda segunda. Lê `user_state`
  (carros, serviços, km) e `auth.users`, decide por pessoa o que cabe hoje,
  manda pelo Resend, que já é o provedor da casa.
- **A decisão é um módulo puro** (`lib/jornada/decisao.ts`): recebe o estado
  de uma pessoa e a data, devolve "qual e-mail hoje, ou nenhum". É o que
  `npm run conferir:jornada` exercita, caso a caso, com defeito plantado
  antes de confiar (quem abriu hoje não recebe; dois no mesmo dia nunca;
  quem saiu nunca).
- **Uma tabela `emails_enviados`** (pessoa, e-mail, dia): a trava contra o
  envio dobrado, a mesma lição do e-mail de lançamento. E o registro de quem
  saiu.
- **Medição pelo funil que já existe**: cada link leva
  `utm_source=email&utm_campaign=jornada&utm_content=d2-carro`, e o
  `abriu_app` na web já lê etiqueta. Abertura de e-mail não se mede (a Apple
  esconde); clique e volta ao app, sim.
- **Links**: quem usa pela web abre `/app` direto (é conta, é link direto,
  mesma categoria dos atalhos de venda). Quem usa o app das lojas cai no
  navegador, porque não há universal link configurado; o e-mail traz o selo
  da loja ao lado. Configurar universal link é trabalho de binário e fica
  para depois.
- **As 4 contas Apple com e-mail escondido** (`privaterelay.appleid.com`) só
  recebem se o domínio de envio estiver cadastrado no relay da Apple, no
  console do desenvolvedor. Passo do dono, antes do primeiro disparo.

Ordem sugerida, se aprovado: motor e trava (1 dia), cadência dos 5 e-mails
(1 dia), gatilhos de revisão e km (1 dia), sazonais depois. Push do servidor
entra quando houver chave.

## 6. O que preciso do dono antes de construir

1. Aprovar ou mudar a lista de e-mails (quais entram, quais saem) e os
   assuntos. Os textos completos vêm depois, um a um, para aprovação.
2. Frequência máxima: proposto um a cada 3 dias. Mais que isso vira spam.
3. Remetente: `Mentorque <contato@mentorque.com.br>`, o mesmo do lançamento?
4. Cadastrar o domínio no relay da Apple (senão as 4 contas Apple não
   recebem).
5. Decidir se as chaves de push vão para a Vercel agora ou depois.
