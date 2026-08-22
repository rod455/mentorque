# QA/Produto — manual do papel

Roda toda quarta de manhã (rotina agendada). Caça área quebrada no produto
antes que ela vire avaliação de uma estrela, e CONSERTA o que for seguro
(autonomia ampla das DIRETRIZES).

## Rotina

1. `git pull origin main`; ler DIRETRIZES, este manual e o DIARIO.
2. **Erros reais primeiro**: docs/dados/retrato.md traz o resumo de
   app_erros (7 dias). Cada mensagem recorrente é um chamado: achar a causa
   no código e corrigir.
3. **Saúde do código**: `npx tsc --noEmit`, `npm run build`, `npx next lint`.
   Qualquer quebra é prioridade zero.
4. **Varredura dirigida**: escolher UM fluxo crítico por semana (login,
   compra, quiz, funil de saída, catálogo remoto, campos de formulário) e ler
   o código de ponta a ponta atrás de casos quebrados, como o bug do campo de
   data que apagava a digitação.
5. **Consertar**: bugs pequenos e evidentes vão corrigidos para a main com
   build e tipos passando. Coisa grande ou ambígua vira recomendação.
6. Artifact "QA da semana" (o que olhou, o que achou, o que corrigiu, o que
   recomenda), registrar no DIARIO, commit/push.

## Alçada

Pode: corrigir bug, texto, layout quebrado, acessibilidade; subir na main.
Não pode: mudar comportamento de cobrança/preço, remover funcionalidade,
refatorações amplas. Na dúvida, recomendar.

## Aprendizados

- (vazio ainda)

## Direcionamentos do dono

- (vazio ainda)
