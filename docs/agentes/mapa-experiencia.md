# Mapa vivo da experiência

O modelo do app inteiro na cabeça do CRO: cada tela com o seu trabalho, as
fricções conhecidas, o princípio BeSci que se aplica e o estado (quando foi
auditada, o que mudou). Toda rodada ATUALIZA este mapa em vez de redescobrir
o app; o Rodrigo consulta antes de cada build para ver o estado geral.

Formato de cada tela/fluxo:

    ## Tela ou fluxo
    - Trabalho da tela: o que ela precisa fazer a pessoa sentir/fazer
    - Fricções conhecidas: lista honesta
    - Princípios que se aplicam: da skill besci.md
    - Última auditoria: data · Mudanças feitas: commits/datas
    - Apostas em aberto: ids do caderno de experimentos

## Estado

v1 escrita na rodada especial de 2026-08-23 (análise do app inteiro pedida
pelo dono antes do build único das lojas). A rodada rodou na sessão
cse_01Lomhspp6q37YTZzgEB4sEz e publicou o artifact "Mapa do app"; o push
dela falhou por falta de permissão de escrita, então o conteúdo foi
reaplicado aqui pela sessão do Rodrigo. As rodadas semanais mantêm daqui
em diante.

# A jornada completa: do anúncio ao premium

Estado de medição de cada passo (a régua honesta do que sabemos hoje).

## 1. Anúncio → LP
- Estado: INSTRUMENTADO, sem gasto ainda.
- Pixel da Meta e conversão do Google Ads carregam na LP; a UTM da campanha
  fica guardada no aparelho (localStorage mq-utm) e viaja nos eventos.
- Sem campanha ativa, esta ponta não tem dado real para ler.

## 2. LP → clique na loja
- Estado: MEDIDO. O toque no selo da loja dispara a conversão nos dois
  pixels. É o último ponto medido antes de sair do nosso domínio.

## 3. Loja → download → primeira abertura
- Estado: BURACO CONFIRMADO. Sem install referrer (Android) nem deep link
  diferido, a campanha guardada na LP NÃO atravessa para o app instalado
  pela loja. Só sabemos a campanha de quem usa a versão web.
- Consequência prática: o CAC por campanha vai medir bem a web e ficar cego
  na loja até isso ser resolvido. Não é urgente antes da primeira campanha,
  mas precisa entrar na conta quando o Rodrigo for ler custo por assinante.

## 4. Abertura → criação de conta
- Estado: MEDIDO POR HEURÍSTICA. O evento de cadastro é inferido comparando
  a data de criação da conta com os últimos 15 minutos, não pelo clique
  exato de criar conta. Serve para o funil, mas não é preciso no limite.

## 5. Conta → primeiro valor
- Estado: PARCIAL. Cadastrar o primeiro carro é medido de verdade
  (evento cadastrou_carro). Concluir uma trilha, registrar o primeiro
  serviço e resolver um sintoma, os três candidatos mais fortes a "valor
  realmente sentido", não geram evento nenhum hoje.
- ACHADO TÉCNICO da rodada: o evento abriu_trilha, que o código trata como
  ativação, mede ABRIR uma categoria de navegação, não concluir um curso
  nem uma aula. É um sinal de intenção, não de valor consumado. Não existe
  hoje evento de conclusão de trilha, aula, serviço ou sintoma. É o próximo
  buraco de instrumentação a fechar.

## 6. Premium
- Estado: O TRECHO MAIS BEM MEDIDO. Viu paywall, iniciou checkout, assinou,
  renovou, cancelou e expirou, todos com a origem exata e confirmados no
  servidor (Stripe na web, RevenueCat nas lojas), nunca fabricados no
  cliente.

# Banner de premium: onde o pedido está e onde caberia melhor

Situação hoje: o pedido de premium aparece DUAS vezes antes de qualquer
valor percebido, na última página do onboarding e no banner fixo da Home,
este último mesmo para quem ainda não cadastrou carro nenhum.

- A favor de manter cedo: superfície máxima, custo zero de engenharia, e
  quem chegou decidido converte sem fricção extra.
- Contra: contraria o timing do pedido da própria skill BeSci. Pedir antes
  de qualquer valor sentido custa confiança, não só conversão.

Onde caberia melhor (recomendação da rodada):
1. No aviso de trilha concluída, que hoje não tem oferta nenhuma.
2. Depois do primeiro serviço registrado, e nunca junto do pedido de nota
   na loja (dois pedidos no mesmo instante se anulam).
3. No detalhe de um sintoma diagnosticado.

DECISÃO DO DONO (2026-08-23): adicionar os momentos novos, sem tirar os
antigos. Implementado no mesmo dia:
- Trilha concluída: UpgradeBanner dentro do aviso de celebração,
  ctx "trilha-concluida" (Learn.tsx).
- Histórico: UpgradeBanner a partir do SEGUNDO serviço registrado,
  ctx "pos-servico" (History.tsx). Do segundo em diante de propósito: é no
  primeiro que o app pede nota na loja, e a promessa de relatório de gastos
  só é concreta com histórico na mão.
- Ponto 3 NÃO recebeu banner novo: o detalhe do sintoma já tem três
  convites de Premium (causas bloqueadas, diagnóstico com a Biela e o
  banner de recomendações). Um quarto seria poluição, não conversão.
- O banner da Home para quem não tem carro FICA, por decisão do dono.

Como ler o resultado: cada ctx vira a origem do evento viu_paywall, então
a view experimentos e o funil por origem mostram qual momento converte
melhor. Comparar em 4 semanas contra o paywall do onboarding.

# Ebooks: onde a oferta de material aprofundado é natural

Hoje não existe nenhum lugar no app pensado para vender conteúdo
aprofundado por assunto. Três pontos se destacam por juntar timing certo
com interesse concreto:

1. Trilha concluída: quem terminou uma trilha sobre um assunto já provou
   interesse nele, e esse momento hoje está vazio.
2. Sintoma resolvido: o problema está concreto na cabeça da pessoa agora;
   um material "tudo sobre isso" é hiper-relevante.
3. Código OBD2 específico (menor, mas natural).

Cuidados registrados: a oferta precisa ficar visualmente diferente do
cadeado de premium que já existe nas mesmas telas, para não confundir dois
produtos; e ferramentas deliberadamente gratuitas (calculadora de
combustível) não devem ganhar oferta nenhuma.

# Personas: hipóteses ancoradas em sinal que já existe

Sem volume para clusterizar de verdade, então são HIPÓTESES, não segmentos
estatísticos. Cada uma se apoia num dado que o banco já guarda hoje.

1. **Quer economizar e não ser enganado** (a persona padrão): chegou com um
   problema concreto e quer saber se o preço da oficina faz sentido.
   Sinal: orçamento reportado no checklist de sintoma, histórico de
   manutenção fraco no quiz de saúde.
2. **Motorista de aplicativo**: carro parado é perda de renda. Urgência tem
   peso real aqui. Sinal: uso profissional declarado no quiz.
3. **Entusiasta ou modificador**: estuda por interesse, não só por
   necessidade. Público natural de conteúdo técnico e de ebook.
   Sinal: motor modificado no quiz + trilhas DIY abertas com frequência.
4. **Dono de usado com medo de ser enganado**: comprou carro de histórico
   incerto e quer confirmar que está tudo bem. Sinal: veículo mais antigo,
   histórico de acidente ou manutenção mal documentada no quiz.

Plano de personalização por estágio:
- HOJE: sem volume para estatística. Dá para variar TEXTO (nunca preço nem
  plano) usando o que a própria pessoa DECLAROU no quiz. É honesto porque
  não é inferência sobre ela, é repetição do que ela disse.
- COM VOLUME: cruzar conteúdo consultado, veículo e quiz para clusterizar
  de verdade e testar mensagem por cluster como A/B real.
- FALTA HOJE: registrar quando um sintoma é apenas visualizado (hoje só o
  orçamento fica gravado) e decidir se a campanha de origem deve ser
  persistida por conta, não só por evento.
