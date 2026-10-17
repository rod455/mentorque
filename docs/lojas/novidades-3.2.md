# Novidades da versão 3.2

Aberta em 07/10/2026, logo depois de a 3.1 (build 71) chegar às duas lojas.
Tudo o que entra aqui **já roda na web** pelo deploy da Vercel; o binário só
importa para o app das lojas.

**Onde a 3.2 está:** ainda não gerada.

**Árvore do build:** (escrever o commit NA HORA de apertar o botão do
Codemagic, antes de qualquer frase sobre o que o binário tem; a
`conferir:versoes` cobra que cada item citado abaixo seja ancestral dela.)

## O que vai NO BINÁRIO

### Vai no binário, e a pessoa sente

1. **O quiz do dia 1 acontece** (08/10, commit bd95618). A resposta da
   pergunta do onboarding deixa de consumir o dia: a pergunta do dia fica
   disponível logo em seguida, a folha do primeiro quiz ganha o botão
   "Responder a de hoje", e a sequência nasce no primeiro quiz do dia. Nasce
   o evento `abriu_quiz`. Na 3.1 e antes, quem responde o onboarding vê
   "você já respondeu hoje" no mesmo dia.
2. **O "Fale com a gente" exige e-mail** (10/10, commit a793d6c). Chegaram dúvidas
   sem e-mail que não deu para responder. O campo passa a ser obrigatório,
   com aviso na tela, e nada sai sem um endereço válido. Até a 3.2 chegar,
   o app antigo ainda manda sem e-mail e o servidor marca o assunto com
   "[SEM E-MAIL]".
3. **Capacitor 8.5.1** (11/10, commit 1487203). Fecha a crítica 9,3 do 8.5.0
   (conteúdo de fora na origem do app pelo caminho do proxy interno). A
   pessoa não sente nada; é a camada que nenhuma conferência alcança. Sobe
   os quatro pacotes e o pino do Swift; o Android pega a versão no build.
4. **A linha do calendário promete o ganho** (09/10, commit 4fd0308). Quem
   ainda não registrou serviço vê o que ganha registrando, em vez de "nenhum
   serviço registrado ainda". Aposta `primeiro-servico-com-ganho-nomeado`.
5. **"Criar minha conta" abre a tela de criar conta** (16/10, commit
   79707a2). Depois de salvar o carro como convidado, o botão da folha
   "Salve sua garagem" levava a uma tela de "Entrar". Aposta
   `conta-que-sabe-que-veio-do-carro`: o relógio dela começa no dia em que
   esta versão chegar às lojas.
6. **Os três portões passam a gravar o não** (17/10, commit 1be2b21):
   `recusou_convite_aviso`, `convite_conta`, `aceitou_convite_conta`,
   `recusou_convite_conta`, `desistiu_da_compra` e `erro_na_compra`. A pessoa
   não sente nada; é a medição que faltava na folha da conta e na folha de
   compra da loja. Na 3.1 e antes, esses eventos não existem.
7. **O que é grátis e o que é Premium** (17/10, commit dca2448). A primeira
   consulta de sintoma mostra todas as causas e o checklist inteiro; das
   outras, o grátis vê a causa mais provável. No caderno de gastos, a semana
   e o mês continuam grátis, e o custo por km e o consumo ficam no Premium.
   A tabela do Premium passa a dizer os limites de verdade (Biela "3/mês",
   plano de revisão limitado, custo por km trancado). Decisão do dono de
   17/10.

### Já foi ao ar, e não espera build

1. **A Biela com 3 perguntas grátis por mês** (17/10, servidor). Vale para
   todas as versões; o app mostra o saldo que o servidor manda.
2. **O teste grátis de 7 dias no Play** (17/10, configuração da loja pela
   API): oferta `teste7` nos dois planos, e as ofertas de desconto com a
   etiqueta `rc-ignore-offer`. Vale para a 3.1 instalada.
3. **A ativação nova no retrato** e **os eventos novos na web** (17/10).

## A nota das lojas

Pela regra da casa: o ganho, não o defeito; o verbo na ação da pessoa; nada
que não tenha sido conferido. A mesma nota serve para a Apple. Sem falar de
teste grátis: ele é configuração de loja, e na Apple ainda não existe.

```
Criar sua conta ficou mais direto: depois de salvar o carro, o botão leva para a tela certa, já pronta para o cadastro.

O quiz começa no primeiro dia: logo depois do cadastro, a pergunta do dia já está esperando.

A primeira consulta de sintoma mostra todas as causas possíveis e o checklist completo.

No caderno de gastos, a semana e o mês ficam à vista. No Premium, o custo por km e o consumo.
```

Em inglês:

```
Creating your account is more direct: after saving your car, the button takes you to the right screen, ready to sign up.

The quiz starts on day one: right after signing up, today's question is waiting.

Your first symptom lookup shows every possible cause and the full checklist.

The expense log keeps the week and the month in view. With Premium, cost per km and consumption.
```

## Plugin nativo nesta versão

Nenhum plugin novo. O que muda em `ios/` é o pino do `capacitor-swift-pm`
(8.5.0 para 8.5.1) no `Package.swift`, reescrito pelo `cap update`; em
`android/` nada versionado muda (o `:capacitor-android` vem do
`node_modules`). O `capacitor.config.ts` não foi tocado.

## Roteiro de aparelho, escrito ANTES do build

1. **O quiz do dia 1.** Com um carro recém-cadastrado, responder a pergunta
   da folha do primeiro quiz; tocar em "Responder a de hoje": a tela abre
   com OUTRA pergunta (a do dia), não com "você já respondeu hoje".
   Responder: "1 dia seguido". Voltar ao Início: o chip mostra "✓ · 1".
   Reabrir o app: a folha do primeiro quiz não volta.
2. **O "Fale com a gente" sem e-mail.** Perfil, "Fale com a gente", escrever
   uma mensagem e tocar em Enviar sem e-mail: a tela pede o e-mail e nada é
   enviado. Com um e-mail válido, envia e confirma. Conferir na caixa
   contato@ que a mensagem chegou com o endereço.
3. **O Capacitor novo não quebrou a casca.** Abrir o app, entrar com o
   Google e com a Apple, abrir o chat do Biela e receber resposta, abrir uma
   aula com vídeo, tocar num link externo (termos) e ver abrir no navegador
   do sistema, receber o aviso local do quiz. Nada disso muda de propósito;
   o que se confere é que continua igual.
4. **Criar minha conta.** Num aparelho sem conta, cadastrar um carro; na
   folha "Salve sua garagem", tocar em "Criar minha conta": a tela abre em
   CRIAR CONTA (campo de nome, botão de criar), não em "Entrar".
5. **O teste grátis no Android** (conta do Google que nunca assinou o
   Mentorque; a do dono pode não servir, por causa das compras de teste de
   agosto). Premium, plano anual, "Começar 7 dias grátis": a folha do Google
   tem de dizer 7 dias grátis e a data da primeira cobrança. Fechar a folha
   sem comprar: o app volta sem erro, e o banco recebe `desistiu_da_compra`
   com origem `loja-annual`. Sair do Premium pelo voltar: a oferta de 10%
   ainda aparece (a etiqueta `rc-ignore-offer` não pode tê-la escondido).
6. **O sintoma.** Consultar um sintoma: todas as causas aparecem. Consultar
   um segundo: uma causa aberta e as outras borradas, com o convite ao
   Premium. Voltar ao primeiro: continua inteiro.
7. **O caderno de gastos.** Sem Premium, dois abastecimentos: o segundo
   mostra o número borrado e "Ver o custo por km e o consumo"; o card do
   Início diz "custo por km no Premium".
8. **A tabela do Premium** mostra "3/mês" na linha do Biela.

## O que este build NÃO conserta, e não pode ser dito como se consertasse

1. **O teste grátis no iPhone.** A tela do iPhone promete 3 dias grátis e a
   App Store não tem oferta nenhuma (lido em 17/10 pela API; a chave da casa
   não cria). É configuração no App Store Connect, na lista do dono, e não
   depende deste binário.
2. **A volta das pessoas.** 16% voltam depois do primeiro dia; nada nesta
   versão foi feito para mudar isso diretamente.
