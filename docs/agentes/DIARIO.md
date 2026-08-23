# Diário do time de agentes

Registro cronológico das rodadas. Cada agente escreve aqui ao terminar:
data, papel, o que fez, o que encontrou, o que recomenda. O mais novo em cima.

## 2026-08-23 · Funil provado vivo + botão da Apple escondido fora do iPhone
- O funil GRAVOU pela primeira vez desde que foi criado: dois abriu_app pelo
  Safari do dono. A permissão estava certa; o zero anterior era porque os
  binários das lojas (1.0 de 02/08 e 1.1 de 21/08) são ANTERIORES ao código
  do funil, de 22/08. Consequência: todo usuário de loja é invisível até o
  próximo envio. Isso sozinho já justifica o build.
- Bug real encontrado pelo dono: "Entrar com a Apple" quebra fora do iPhone.
  O fluxo web da Apple exige um Services ID próprio (domínio verificado +
  URL de retorno do Supabase), que não existe. Os registros confirmam:
  Supabase redireciona para a Apple e nunca recebe retorno, então o app nem
  consegue mostrar erro. O botão agora só aparece no app da Apple, onde o
  login é nativo. Religa com NEXT_PUBLIC_APPLE_WEB=1 depois de configurar.
- NÃO é bug: carros de convidado entrarem na conta ao logar. É o merge
  proposital (store.tsx), para ninguém perder o que fez antes de criar
  conta. O que FALTA é remover duplicata: dois cadastros do mesmo carro
  viram dois carros. Fica para o QA olhar.

## 2026-08-23 · Gargalo do push resolvido: cada agente ganhou sessão fixa
- Causa raiz confirmada com teste isolado: sessão criada na hora pela
  rotina nasce sem destino de escrita, então o agente trabalha, tenta
  pushar e falha no fim. Uma sessão criada com destino de escrita pushou
  de primeira (commit de teste, depois revertido).
- Conserto: os cinco agentes agora têm sessão de trabalho fixa e nomeada,
  e as rotinas do calendário acordam essa sessão em vez de abrir uma nova.
  Efeito colateral bom: o agente lembra da rodada anterior, então o CRO
  fecha o veredito da aposta que ele mesmo registrou, o Conteúdo alterna o
  formato certo e o ASO não repete resposta já rascunhada.
- Onde o dono vê o trabalho de cada um está escrito em ONDE-VER.md, com os
  ids das sessões e o que checar quando um agente parar de entregar.
- Notificação: só o Diretor avisa, na segunda. Como rotina ligada a sessão
  fixa não carrega notificação própria, o próprio Diretor passou a mandar o
  aviso no fim da rodada, com a manchete e o que precisa de decisão.

## 2026-08-23 · Mapa do app (rodada especial do CRO) e o gargalo do push
- Rodada especial pedida pelo dono, só análise: mapa completo da jornada do
  anúncio ao premium, veredito sobre banner de premium, onde caberiam
  ebooks e framework de personas. Tudo escrito em mapa-experiencia.md.
- Achados que valem decisão do dono: (1) o pedido de premium aparece 2x
  antes de qualquer valor sentido, e o banner da Home para quem não tem
  carro é o candidato natural a sair; (2) três pontos naturais para ebook
  (trilha concluída, sintoma resolvido, código OBD2), nenhum ocupado hoje;
  (3) a campanha não atravessa da loja para o app instalado (sem install
  referrer nem deep link), então CAC por campanha mede bem só a web.
- Achado técnico: abriu_trilha mede ABRIR uma categoria, não concluir nada.
  Falta evento de conclusão (trilha, aula, serviço, sintoma) para medir
  valor consumado. Próximo buraco de instrumentação.
- Duas mudanças diretas foram para a main (CTA do teste por plano e fim do
  lembrete falso), ambas registradas no caderno de experimentos com
  veredito aberto para 20/09.
- GARGALO ESTRUTURAL: pela segunda vez a sessão de rotina não conseguiu
  pushar (sem permissão de escrita no repositório), e o trabalho precisou
  ser reaplicado à mão por uma sessão do dono. Enquanto isso não for
  resolvido no ambiente das rotinas, a memória do time depende de alguém
  reaplicar. Proposta: liberar acesso de escrita ao repositório no ambiente
  das rotinas, ou fazer os agentes gravarem via API do GitHub como o n8n.

## 2026-08-23 · Quebra do funil visível + A/B com aprovação do dono
- Painel ganhou a seção "Onde o funil quebra" (28 dias, pessoas distintas
  por etapa, pior passagem destacada): é o mapa de prioridade dos testes.
- Fluxo de A/B mudou por decisão do dono: o CRO PROPÕE (estado PROPOSTO no
  caderno, com a tese BeSci explicada para leigos) e SÓ ativa com aprovação
  do Rodrigo. Manual, caderno e rotina das sextas atualizados.
- Incidente e conserto: ao trancar as rotas de agregados, a Sentinela levou
  401 no /api/funil e alertou CERTO (dupla homologação funcionou de ponta a
  ponta). Ela aprendeu a chave, foi republicada e mandou o "voltou ao
  normal". Aprendizado: toda rota nova trancada exige atualizar os vigias.

## 2026-08-23 · Painel /painel + agregados trancados por chave
- Painel da operação em www.mentorque.com.br/painel (renderizado no
  servidor, portão por ?chave=): blocos Marketing, Engajamento e Vendas,
  série diária de cadastros, usuários e receita de anúncio, coortes,
  fundo do funil e frescor das fontes.
- Decisão do dono: agregados não ficam abertos. Rotas de leitura e POSTs
  dos coletores exigem a chave DADOS_CHAVE (header x-mq-chave); POSTs do
  app (eventos e erros) seguem abertos. Os 4 workflows do n8n que falam
  com as rotas já apresentam a chave.

## 2026-08-23 · Downloads reais da Apple no ar (e um insight)
- Braço app_store_downloads pronto e testado: relatório diário de vendas
  da Apple (Vendor 94182924), que EXCLUI TestFlight, baixado, descompactado
  e interpretado. Chave única PS9LWJKWK6 (Developer + Sales + Access to
  Reports; aprendizado: a Apple combina papéis numa chave só).
- Primeiro dado: 21/08 teve 0 downloads orgânicos na App Store. Confirma
  que os 22 "usuários ativos" do RevenueCat são aparelhos de teste. A
  aquisição de verdade começa do zero, e agora é medida do jeito certo.
- Play downloads: aguardando o console gerar os primeiros relatórios.
- Aprendizado técnico: onError não sobrevive ao addNode da API do n8n;
  reaplicar com setNodeSettings depois de adicionar nós.

## 2026-08-23 · Visão de empresa completa + vigia de anomalias
- Eventos de primeira ação de valor no app (abriu_trilha, cadastrou_carro):
  ativação real passa a ser medida; web desde já, lojas no próximo build.
- Views novas: ativacao_coortes, assinaturas_coortes (renovou/saiu por
  coorte mensal de assinante) e cadastros_por_campanha (a ponta nossa do
  CAC). /api/dados ganhou uso.ativacao, vendas e marketing.
- Retrato reorganizado como EMPRESA: blocos MARKETING (com CAC calculado
  quando houver gasto), ENGAJAMENTO e VENDAS, com o método na skill.
- Skill ganhou "O painel da empresa" e as métricas de crescimento saudável
  (retenção que estabiliza, coortes melhorando, stickiness, quick ratio,
  LTV/CAC, payback, churn, MRR) com régua por estágio.
- Vigia de anomalias criado no n8n (DESLIGADO): diário 7h30, e-mail só
  quando algo foge do padrão; testado num dia normal, silêncio como
  esperado. Gmail anexado por API (o bug de anexar credencial é só nos
  nós HTTP Request).
- Downloads reais das lojas: pendente de Vendor Number (Apple) e URI do
  Cloud Storage (Play), anotado no manual do Analista.

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
