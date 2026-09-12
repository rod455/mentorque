# Novidades da versão 2.5

Aberta em 12/09/2026, com a 2.4 aprovada na Play e em análise na Apple.
O roteiro de aparelho da 2.4 (14 passos) ainda não foi rodado; o que ele
achar entra aqui.

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

- **O site não leva mais ao /app** (12/09): o link "use pelo navegador" saiu
  da home e nenhuma página aponta para o `/app`; a rota continua existindo
  para quem digita. Foi no deploy da Vercel; o app das lojas não muda
  (`scripts/verifica-caminho.ts`).

## Roteiro de aparelho

A escrever antes do build. Já se sabe um passo: ligar avisos, responder o
quiz, não abrir o app por dois dias, e ver o aviso das 9h nos dois dias.
