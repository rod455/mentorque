# Novidades da versão 2.5 (fila, ainda não aberta)

A 2.4 está fechada e conferida (11/09/2026). O que entra aqui é o que o dono
aprovou para a versão seguinte; o repositório continua em 2.4 até ela ser
enviada. Ao abrir a 2.5: versão nos três lugares, `"2.4"` em
`JA_PUBLICADAS`, e o roteiro de aparelho escrito antes do build.

## Aprovado pelo dono, a fazer

1. **O lembrete do quiz cobre três manhãs, não uma.** Aprovado em 12/09/2026,
   depois de o dono ficar dias sem aviso no iPhone. Hoje
   `lib/app/lembreteQuiz.ts` agenda UM aviso para as próximas 9h e só
   reagenda quando a pessoa abre o app ou responde: quem some recebe um e
   depois silêncio, que é o caso que mais precisava do lembrete. Passa a
   agendar os próximos três dias (três avisos, um por manhã, ids fixos),
   cancelados e refeitos a cada abertura ou resposta. Quem responde todo dia
   continua vendo um por dia; quem some recebe três manhãs e depois o
   silêncio. Três é o meio do caminho entre "um e acabou" e perseguir.
   `conferir:aviso` ganha o caso: sem resposta por três dias, três avisos;
   respondeu hoje, o de hoje sai da lista.
2. **Ligar o interruptor de avisos responde na tela.** "Avisos ligados. O
   próximo sai amanhã às 9h." Hoje, com a permissão já dada, o toque não
   mostra nada, e o dono achou que não tinha funcionado (12/09).

## O que NÃO precisa de binário

A escrever.

## Roteiro de aparelho

A escrever antes do build. Já se sabe um passo: ligar avisos, responder o
quiz, não abrir o app por dois dias, e ver o aviso das 9h nos dois dias.
