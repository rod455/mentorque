# Caderno de experimentos

O ciclo que separa o CRO sênior do júnior: toda aposta vira uma linha AQUI,
com hipótese, métrica e um veredito que fica aberto até ser fechado com
dado. A rodada semanal do CRO COMEÇA fechando os vereditos vencidos e só
depois abre aposta nova.

## Como registrar

Cada experimento é uma seção com este formato:

    ## [id-do-experimento] Título curto
    - Estado: PROPOSTO | ABERTO | FECHADO
    - Tipo: mudanca-direta | teste-ab
    - Alvo no funil: qual passagem quer melhorar (ver "Onde o funil quebra"
      no painel; a maior quebra é o alvo natural)
    - Tese BeSci: o princípio, por que ele se aplica AQUI, e o que cada
      variante muda na jornada (A = atual, B = proposta), explicado para o
      dono decidir sem abrir código
    - Métrica: o número exato que deve se mover · Duração mínima de leitura
    - Aprovação: aguardando o dono | aprovada pelo dono em DATA
    - Início: data · Ler a partir de: data (mínimo 2 semanas depois)
    - Antes: o valor no início (ou "série curta, base qualitativa")
    - Veredito: (aberto) | FUNCIONOU | NAO FUNCIONOU | INCONCLUSIVO + o porquê

Regras:
- Uma aposta nova por rodada, no máximo. Duas mudanças na mesma tela ao
  mesmo tempo = aprendizado nenhum.
- **Teste A/B só liga com aprovação do dono** (decisão do Rodrigo,
  2026-08-23): o agente registra como PROPOSTO com a tese completa e leva a
  proposta no artifact; NÃO ativa no código. Quando o Rodrigo aprovar (em
  qualquer sessão), quem implementar registra a aprovação aqui e ativa em
  lib/app/experimentos.ts. Mudança direta de baixo risco (sem variantes)
  continua na alçada normal, sem aprovação prévia.
- Teste A/B usa a infra de variantes (lib/app/experimentos.ts): registrar o
  id do experimento igual ao do código. Leitura por variante na view
  experimentos_resultados (via /api/dados, painel ou SQL).
- Com pouco volume, o veredito honesto é INCONCLUSIVO, AGUARDANDO VOLUME;
  reabrir quando a mídia ligar. Nunca fechar no achismo.
- Veredito fechado vira aprendizado na skill besci.md quando ensina algo.

## Experimentos

- (nenhum ainda; a primeira aposta da rodada sênior inaugura o caderno)
