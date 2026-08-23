# Skill: análise da operação

Como transformar os números do retrato em entendimento. Diretor e CRO leem
este documento ANTES de analisar; os demais consultam quando precisarem.
Ele evolui: cada rodada que descobrir uma regra melhor para o NOSSO app
escreve aqui embaixo, em "Aprendizados com os nossos dados".

## O mapa: as quatro perguntas, nesta ordem

1. **Aquisição**: gente nova está chegando? (cadastrosPorDia, Search
   Console, mídia paga, YouTube)
2. **Ativação**: quem chega experimenta de verdade? (funil da semana:
   abertura → cadastro; % de cadastro sobre visitantes)
3. **Retenção**: quem experimentou volta? (uso.coortes, uso.porSemana)
   É AQUI que mora a pergunta "estamos melhorando?". Aquisição enche o
   balde; retenção diz se o balde tem furo.
4. **Receita**: quem volta paga e continua pagando? (assinaturas,
   RevenueCat, Stripe, AdMob)

Problema detectado em uma etapa quase sempre nasce na etapa ANTERIOR.
Receita fraca com retenção boa é problema de paywall; retenção fraca torna
qualquer investimento em aquisição um desperdício.

## Definições exatas (a régua de uso no /api/dados → uso)

- **usuarios / usuarios_ativos**: pessoas distintas que abriram o app
  (identidade anônima por aparelho), não contagem de aberturas.
- **aberturas_por_usuario**: frequência semanal. Perto de 1 = abrem uma
  vez e somem; subindo = hábito se formando.
- **retencao_coortes**: de quem se CADASTROU na semana X (coorte),
  quantos voltaram a abrir o app entre 1 e 7 dias depois (voltaram_d1_7)
  e entre 8 e 30 dias depois (voltaram_d8_30). Comparar coortes entre si
  é o jeito certo de saber se o produto está melhorando: a coorte de quem
  entrou depois de uma melhoria voltou mais?

## Como ler com pouca gente (regra de honestidade)

- Coorte com menos de 30 pessoas: falar em PESSOAS, não em porcentagem
  ("3 dos 12 voltaram"), e não tirar conclusão estatística.
- Tendência exige 3+ semanas na mesma direção; variação de uma semana
  isolada não é tendência, é ruído.
- Série curta ou zerada: dizer isso com clareza. Número ausente NUNCA
  vira número inventado.

## Roteiro de diagnóstico rápido

- "Cadastros caíram" → olhar primeiro o TOPO: tráfego caiu (Search
  Console, gasto de mídia) ou a conversão da LP caiu (visitantes iguais,
  cadastros menores)?
- "Uso caiu" → separar: a coorte nova veio fraca (problema de aquisição:
  público errado chegando) ou as coortes antigas pararam de voltar
  (problema de produto/hábito)?
- "Receita parada" → conferir na ordem: gente vendo paywall? iniciando
  checkout? assinando? Cada degrau perdido aponta o conserto.
- Sempre cruzar com app_erros e avaliações: queda de uso com erro
  recorrente novo é bug, não comportamento.

## Réguas iniciais (benchmarks genéricos, até termos história própria)

Apps de educação/utilidade costumam ver 10 a 25% de retorno na primeira
semana pós-cadastro; frequência semanal saudável fica acima de 2
aberturas por usuário ativo. São réguas EMPRESTADAS: valem só para dar
escala até a nossa própria série existir. A meta real é cada coorte ser
melhor que a anterior.

## O painel da empresa: Marketing, Engajamento, Vendas

A visão completa se organiza em três blocos (é a ordem do retrato). Cada
bloco tem UM número que resume ("o número do bloco") e os de apoio.

**MARKETING (gente chegando)**
- Número do bloco: cadastros por semana.
- Apoio: cadastros por origem e campanha (cadastros_por_campanha), cliques
  e consultas do Search Console, views do YouTube, gasto de mídia.
- **CAC por campanha** = gasto da campanha / cadastros com a UTM dela.
  Enquanto não há campanha, o bloco mostra origem orgânica.

**ENGAJAMENTO (gente usando e voltando)**
- Número do bloco: retenção da coorte (voltaram em 1 a 7 dias).
- Apoio: usuários ativos por semana, frequência, **ativação real**
  (ativados_7d: fizeram abriu_trilha ou cadastrou_carro em até 7 dias do
  cadastro), erros do app, avaliações das lojas, vitals do Play.

**VENDAS (gente pagando e continuando)**
- Número do bloco: assinaturas ativas e MRR.
- Apoio: funil paywall → checkout → assinou, coorte de assinantes
  (assinaturas_coortes: dos que assinaram no mês X, quantos renovaram e
  quantos saíram), receita de anúncio (AdMob), receita real (Stripe).

## O que uma startup de app saudável acompanha (e o que "saudável" significa)

As métricas clássicas do mercado, na régua que importa em cada estágio:

1. **Curva de retenção que ESTABILIZA**: o sinal número um de
   product-market fit. A curva de cada coorte pode cair no começo, mas
   precisa achatar num patamar acima de zero (pessoas que ficaram). Curva
   que vai a zero = balde furado; crescer aquisição em cima disso é pagar
   para encher um balde sem fundo.
2. **Coortes melhorando**: cada coorte nova reter mais que a anterior
   prova que o produto está melhorando. É a NOSSA métrica de norte
   enquanto o volume é pequeno.
3. **Stickiness (ativos no dia / ativos no mês)**: acima de 20% indica
   hábito real; apps de utilidade vivem bem entre 10 e 25%.
4. **Quick ratio de usuários** (novos + ressuscitados / perdidos no
   período): acima de 1 a base cresce; muito acima de 2 é crescimento
   forte. Vale também para assinantes.
5. **LTV / CAC**: o valor que um assinante deixa na vida dele dividido
   pelo custo de adquirir. Régua de mercado: acima de 3 é saudável;
   abaixo de 1 é queimar dinheiro. Só calculável com campanhas rodando e
   alguns meses de renovação.
6. **Payback do CAC**: em quantos meses a assinatura devolve o custo de
   aquisição. Menos de 12 meses é confortável para app de assinatura.
7. **Churn mensal de assinantes**: para B2C, abaixo de 5% ao mês é bom;
   anual dilui isso (o nosso plano forte é anual, então o número aparece
   devagar e a renovação do mês 12 é o teste de verdade).
8. **MRR e composição do crescimento**: quanto do MRR novo vem de gente
   nova vs preço vs retorno. Crescer só com entrada nova e churn alto é
   crescimento de aparência.

Regra de estágio: com menos de algumas centenas de usuários, os itens 1,
2 e 3 mandam; 4 a 8 entram conforme mídia paga e assinantes existirem.
Não perseguir 8 números de uma vez: o Diretor destaca o número do bloco
e aponta UM desvio por semana.

## Ligando causa e efeito

Toda mudança relevante (versão nova, tela mexida, campanha ligada) tem
data registrada no DIARIO. Ao analisar, olhar o que mudou ANTES do número
se mover; ao recomendar, prever qual número deve se mover e conferir na
rodada seguinte. Recomendação sem número previsto não aprende nada.

## Limites conhecidos da série (atualizar quando mudarem)

- funil_eventos começou a receber de verdade em 2026-08-23 (bug de
  permissão corrigido); tudo antes disso não existe. A série nasce aqui.
- Apps das lojas só emitem eventos a partir do build que inclui o funil
  (posterior ao 8/43); até lá o uso medido é da web.
- "Primeira ação de valor" (abrir trilha, cadastrar carro) ainda não é
  evento; ativação hoje é aproximada pelo retorno pós-cadastro.
  Recomendação futura: evento abriu_trilha no app.

## Aprendizados com os nossos dados

- 2026-08-23: "active_users" do RevenueCat conta APARELHOS que abriram o
  app (SDK, inclui anônimos, testes do dono e TestFlight); contas criadas
  vivem no banco (auth.users, excluindo fake_). Em 23/08: 22 aparelhos
  abriram, 8 contas reais criadas (36% de abertura para cadastro). Nunca
  somar nem comparar os dois como se fossem a mesma coisa.
- 2026-08-23 (decisão do dono): não existe como separar TestFlight dentro
  dos números do RevenueCat (a API só marca sandbox em compras). Régua
  oficial de GENTE REAL: contas do banco + régua de uso do funil. O pacote
  revenuecat carrega uma nota se rotulando como bruto; usar só como ordem
  de grandeza de instalação, nunca como usuários em análise.
- 2026-08-23: a conta do AdMob é COMPARTILHADA com outros apps do dono, e o
  coletor pedia o relatório da conta inteira. Tudo que apareceu como receita
  de anúncio do Mentorque até 23/08 era, na verdade, de "Concurseiro" e
  "Bolão na Copa". Corrigido com filtro por app
  (ca-app-pub-9316035916536420~8094986125) no pedido e conferência no
  normalizador. **Número real do Mentorque: zero. Zero impressão, zero
  ganho, em 8 dias.**
- REGRA GERAL que sai daí, e que já valeu duas vezes (RevenueCat e AdMob):
  toda conta que o dono usa em mais de um produto entrega o TOTAL DELE por
  padrão, não o do Mentorque. Antes de acreditar em qualquer número de
  fonte externa, pergunte "isto está filtrado para o Mentorque?" e prove.
  Ainda não auditados sob essa régua: Stripe (a chamada é da conta toda) e
  YouTube (canal do `mine=true`). Se for usar esses números em análise,
  confira antes ou registre a dúvida em vez de afirmar.
- Truque para não se enganar sozinho: filtro que não casa com nada é
  IDÊNTICO a "não teve movimento". Sempre que um filtro novo devolver zero,
  rode uma vez SEM filtro e olhe os identificadores que voltam, para provar
  que o formato bate. Foi assim que se confirmou que o zero do Mentorque é
  zero de verdade, e não filtro errado.
