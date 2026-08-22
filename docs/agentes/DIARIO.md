# Diário do time de agentes

Registro cronológico das rodadas. Cada agente escreve aqui ao terminar:
data, papel, o que fez, o que encontrou, o que recomenda. O mais novo em cima.

## 2026-08-22 · Analista de Dados nasce (avaliações das lojas)
- Tabela lojas_avaliacoes + rota /api/avaliacoes (POST coleta, GET resumo).
- Workflow diário no n8n coletando o feed público da App Store; rodou limpo,
  tabela vazia porque o app ainda não tem avaliações (esperado).
- Destino: resumo do Diretor, respostas do ASO e troca dos depoimentos da LP
  por citações reais "via App Store" quando existirem.

## 2026-08-22 · Sentinela v2 (direcionamento do dono)
- Cadência reduzida para 2x por dia (12h em 12h).
- Dupla homologação: falha na primeira olhada espera 1 minuto e é reconferida;
  só alerta problema CONFIRMADO. Testada nos dois cenários (transitório e
  confirmado), ativada; a v1 horária foi arquivada.
- Registrado o limite do papel: a Sentinela não enxerga dentro dos apps
  instalados; crashes e telas quebradas são visíveis nos Android vitals, no
  App Store Connect e nas avaliações (papel do QA e do ASO & Lojas).

## 2026-08-22 · fundação
- Funil da operação instrumentado (8 eventos, /api/funil, view semanal).
- Sentinela criada no n8n (checagem horária + alerta por Gmail) e ATIVADA;
  primeira execução real passou com as quatro checagens saudáveis.
  Incidente de setup: o secret do client OAuth não é copiável do n8n nem do
  console; a solução é criar um secret ADICIONAL no client (sem apagar o
  antigo). Fica de lição para futuras credenciais.
- Estrutura de memória criada (DIRETRIZES, manuais, este diário).
