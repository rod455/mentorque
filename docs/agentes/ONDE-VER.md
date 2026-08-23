# Onde ver o que cada agente está fazendo

Guia do dono. Cada agente do time tem uma sessão de trabalho fixa, que
continua de uma rodada para a outra. A rotina do calendário acorda essa
sessão no dia e hora certos, em vez de criar uma sessão nova toda vez.

## As cinco sessões fixas

| Agente | Quando roda | Sessão de trabalho |
|---|---|---|
| Diretor de operação | segunda, 08h | session_01Xfw4FJyyDcqzmNL4WkwFdQ |
| Conteúdo e SEO | terça, 08h | session_019A8o2Q4fn9EEJzMYdgcPdW |
| QA e Produto | quarta, 08h | session_019nSkCjj5CdbtiaSgwFZqKt |
| CRO e BeSci | sexta, 08h | session_01UXveaUrRoWYxwYPTEaLkEi |
| ASO e Lojas | dias 1 e 15, 08h | session_01CDEHdMPNgxScD7NeWU4bef |

Horário de Brasília. No calendário elas ficam gravadas em UTC (11h).

## Os quatro lugares onde o trabalho aparece

1. **Lista de sessões em claude.ai/code.** Cada agente tem nome próprio
   ("Agente · CRO e BeSci"), então dá para abrir a conversa dele e ver
   tudo que ele fez, rodada por rodada, desde a primeira. É o lugar mais
   completo: mostra o raciocínio, não só a conclusão.
2. **Galeria de artifacts.** Toda rodada publica um relatório com nome
   fixo: "Relatório da semana" (Diretor), "QA da semana", "Conversão da
   semana", "Conteúdo da semana", "Lojas da quinzena". É a leitura de 3
   minutos.
3. **Este repositório.** DIARIO.md tem o registro de cada rodada em ordem,
   o mais novo em cima, e o `git log` mostra exatamente o que cada agente
   mudou no código.
4. **Notificação no celular.** Só o Diretor manda, uma vez por semana, na
   segunda: a manchete e o que precisa de decisão. Os outros quatro
   trabalham em silêncio de propósito, e o Diretor consolida o que
   importa. Isso é escolha do dono, não limitação.

## Por que sessão fixa e não sessão nova a cada rodada

Duas razões, uma prática e uma de qualidade:

- **Prática:** sessão criada na hora pela rotina não tem destino de
  escrita configurado, então o agente trabalhava, escrevia e o push
  falhava. Foi o que aconteceu duas vezes com o CRO em 2026-08-23, e o
  trabalho teve que ser reaplicado à mão. Sessão fixa criada com destino
  de escrita empurra para a main normalmente.
- **Qualidade:** o agente lembra da rodada anterior. O CRO na sexta que
  vem sabe que aposta registrou hoje e fecha o veredito dela; o Conteúdo
  sabe qual formato entregou e alterna; o ASO não rascunha de novo uma
  resposta que já entregou.

## Se um agente parar de entregar

Sinal de alerta: a rodada passou e não apareceu artifact novo nem commit
no DIARIO. O que checar, nesta ordem:

1. A rotina está ligada e apontando para a sessão certa (lista de
   Routines, campo persistent_session_id).
2. A sessão não foi arquivada. Sessão arquivada não aceita evento; basta
   desarquivar.
3. A sessão tem destino de escrita. Sem isso o agente trabalha e o push
   falha em silêncio no fim.
