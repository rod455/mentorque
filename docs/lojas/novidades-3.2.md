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
