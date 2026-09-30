# Novidades da versão 3.0

Aberta em 30/09/2026, logo depois de a 2.9 ser aprovada nas duas lojas. Tudo o
que entra aqui **já roda na web** pelo deploy da Vercel; o binário só importa
para o app das lojas.

**Onde a 2.9 está:** aprovada em 30/09 (Play antes, Apple no dia), build 69,
nas duas lojas.

## O que vai NO BINÁRIO, e o que já está no ar

A separação importa: sem ela a conta do release sai dobrada e a ficha promete o
que a loja não entrega. A regra de bolso, que já custou confusão aqui:
`lib/app/**` e `components/app/**` são o app e **precisam de build**;
`app/api/**`, o site e a landing vão ao ar no push; as aulas
(`lib/app/conteudo/aulas.ts`) são sobrescritas remotamente por `/api/lessons`,
então também vão ao ar no push.

### Vai no binário, e a pessoa sente

Ainda nada. Esta seção enche conforme a semana anda.

### Já foi ao ar, e não espera build

1. **As perguntas ao Biela passaram a dizer sobre o que são** (29 e 30/09).
   Toda pergunta grava duas etiquetas, origem (atalho da tela, tela de
   sintoma, digitada, continuação de conversa) e tema (freios, elétrica,
   arrefecimento, motor...), sem guardar o texto. O retrato imprime as duas
   metades separadas, porque somar atalho com pergunta digitada mede a ordem
   dos nossos botões e não a demanda. Regra em `lib/biela/perguntaLida.ts`.
2. **O alarme de erros virou razão** (29/09). O Vigia disparava em
   `total >= 20` relatos; agora decide por aparelhos com defeito sobre
   aparelhos ativos, com desistência de login fora da conta. Regra em
   `lib/alarmeDeErros.ts`.

## Dívidas que estão esperando ESTE binário

São as duas que a 2.9 deixou para trás de propósito, para não mexer numa
versão já conferida:

1. **Desistência de login ainda é GRAVADA como erro.** O leitor já separa
   (`classeDoErro`), mas a origem continua suja: quem olhar `app_erros` cru vê
   22 erros onde há 14. O conserto é no app.
2. **O 👎 sozinho não deixa rastro.** A tela só grava o voto negativo depois
   que a pessoa escolhe um motivo (`components/app/screens/Biela.tsx`), e por
   isso os 24 votos de seis semanas são todos positivos. Isso **não** é
   aprovação de 100%, e o retrato já diz isso ao lado do número. O conserto é
   gravar o voto na hora do toque e completar com o motivo depois.

## Roteiro de aparelho

A escrever quando houver o que testar. A regra do dono (09/09/2026) continua:
sobre um build que nenhum aparelho abriu, a resposta é "sem sinal ainda", nunca
"nada quebrou".
