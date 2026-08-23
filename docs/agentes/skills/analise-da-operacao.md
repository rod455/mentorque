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
