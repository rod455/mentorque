# Diário do time de agentes

Registro cronológico das rodadas. Cada agente escreve aqui ao terminar:
data, papel, o que fez, o que encontrou, o que recomenda. O mais novo em cima.

## 2026-08-23 · Régua de uso + skill de análise (e um bug grave achado)
- ACHADO GRAVE no caminho: funil_eventos NUNCA tinha aceitado um evento
  (mesmo bug de permissão do dia anterior, presente desde a criação).
  Varredura completa achou 6 objetos sem acesso do papel de serviço
  (funil_eventos, funil_semana, content_events, price_reports, user_state,
  waitlist); user_state e waitlist funcionavam por outros caminhos, o resto
  estava mudo. Tudo corrigido + default privileges para tabelas futuras.
  A série do funil COMEÇA em 2026-08-23; web emite já, apps das lojas só a
  partir do próximo build.
- Régua de uso criada: views uso_diario, uso_semanal e retencao_coortes
  (pessoas distintas, frequência, retenção por coorte de cadastro), no
  /api/dados (campo uso) e no retrato (seção "Uso do app").
- Skill escrita em docs/agentes/skills/analise-da-operacao.md: as quatro
  perguntas (aquisição, ativação, retenção, receita), definições, regras de
  honestidade com amostra pequena, roteiro de diagnóstico e réguas
  emprestadas. Diretor e CRO agora leem antes de analisar (manuais
  atualizados).

## 2026-08-23 · Nove de dez fontes conectadas
- YouTube (cliente OAuth novo "Mentorque N8N", projeto Mentorque, app
  publicado em produção): coleta os 10 últimos vídeos; views zeradas
  enquanto os vídeos estiverem privados.
- AdMob: receita real de anúncio medida, em USD, cerca de US$ 1,64 nos
  últimos 7 dias com 30 a 78 impressões por dia.
- App Store Connect: chave .p8 conectada; primeira coleta mostrou a 1.1
  WAITING_FOR_REVIEW e a 1.0 READY_FOR_SALE. Aprendizado técnico: o nó JWT
  do n8n exige claims em modo JSON (iss, iat, exp, aud); os campos
  estruturados do nó não convertem para os nomes padrão.
- Falta só o Google Ads (developer token em processo, entra com as
  campanhas). Workflow de métricas segue DESLIGADO por decisão do dono.

## 2026-08-23 · Sete de dez fontes conectadas
- Search Console verificado (propriedade sc-domain:mentorque.com.br) e
  coletando; série nasce zerada porque a propriedade é nova.
- Rodrigo colou as chaves de Stripe, RevenueCat, Vercel e o JSON do Play;
  as quatro testadas no mesmo dia. Primeiros dados reais: RevenueCat com 22
  usuários ativos e 0 assinaturas; Vercel com 20 deploys sadios na semana;
  Play sem reviews e sem vitals ainda (app recém-chegado às lojas).
- Ajuste no braço de vitals: a API do Play publica com uns 3 dias de
  atraso, janela mudou para 12 a 4 dias atrás.
- Discrepância aberta: Stripe live mostra 0 assinaturas ativas, banco
  mostra 1 anual ativa (provável teste). Esclarecer antes do Diretor tratar
  como receita.
- Faltam: YouTube, AdMob, App Store Connect (.p8) e Google Ads (token em
  processo). Workflow segue desligado.

## 2026-08-22 · Meta conectada e um bug de permissão corrigido no banco
- Token da Marketing API da Meta (usuário do sistema "Analista Mentorque",
  criado pelo Luiz) colado no n8n e testado: enxerga a conta "Mentorque Ads"
  (BRL); gasto zerado porque ainda não há campanha. Pendência: trocar por
  token só de leitura (ads_read), o atual também edita.
- Teste de ponta a ponta do workflow de métricas revelou que tabelas criadas
  via integração não herdam permissão de escrita para o papel de serviço:
  app_erros, lojas_avaliacoes e metricas_diarias estavam com a rota travada
  em "permission denied" (latente nas duas primeiras, que só tinham recebido
  listas vazias). Grant aplicado nas três; segunda execução gravou as 10
  fontes na mesa, Meta com dado real e as demais registrando o próprio erro,
  provando a blindagem por braço.
- Descoberta no braço do Search Console: a conta Google conectada só tem a
  propriedade do vocaboost; falta cadastrar www.mentorque.com.br no Search
  Console (verificação por TXT no Registro.br).

## 2026-08-22 · Coleta total preparada (metricas externas, desligada)
- Mesa de pouso única no banco: tabela metricas_diarias (dia + fonte, jsonb)
  e rota /api/metricas; /api/dados passou a devolver fontesExternas e o
  retrato diário ganhou a seção "Fontes externas" (workflow republicado).
- Workflow novo "Analista: metricas externas" no n8n, com 11 braços
  independentes (Search Console, Stripe, YouTube, Meta Ads, Google Ads,
  RevenueCat, Vercel, AdMob, App Store Connect, Play vitals e avaliações do
  Play). Fica DESLIGADO até as credenciais serem coladas; braço sem
  credencial só registra o próprio erro, não derruba os demais.
- Checklist de chaves e de cliques (selecionar credencial nos nós) está no
  manual analista-dados.md. Decisão do dono: tudo num workflow só, blindado
  por braço, e tudo preparado antes de ligar.

## 2026-08-22 · O time completo entra em campo
- UTM ligada ao funil: eventos da web carregam a etiqueta de campanha que a
  LP guarda; mídia paga nasce mensurável.
- Ponte de dados criada no n8n (retrato diário → docs/dados/retrato.md via
  API do GitHub); aguarda o PAT "GitHub Analista" para ativar.
- Rotinas agendadas: Diretor (seg), Conteúdo & SEO (ter), QA/Produto (qua),
  CRO/BeSci (sex), ASO & Lojas (dias 1 e 15). Especialistas em silêncio;
  só o Diretor notifica.

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
