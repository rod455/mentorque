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
