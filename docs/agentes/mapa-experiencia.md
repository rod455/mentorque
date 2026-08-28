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

v2 em 2026-08-28: primeira rodada semanal do ritual, foco RETENÇÃO. Entrou a
seção "O que traz a pessoa de volta" (auditoria das superfícies de retorno) e
a correção do login social ficou registrada no passo 4 da jornada. Próxima
rodada alterna para CONVERSÃO.

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
  a data de criação da conta com a janela de abertura do app, não pelo clique
  exato de criar conta. Serve para o funil, mas não é preciso no limite.
- CORRIGIDO EM 27/08 (rodada do QA): a janela era de 15 MINUTOS e por isso o
  evento nunca nascia. Nove contas em agosto, zero eventos. Consequência para
  quem lê o funil AGORA: a maior quebra do painel (abriu_app → cadastro, 11
  pessoas viraram 0) é em boa parte régua quebrada, não desinteresse. Antes de
  desenhar qualquer teste em cima dessa passagem, esperar duas semanas de
  medição já consertada.
- CORRIGIDO EM 28/08 (esta rodada): o login social do app das lojas travava
  para sempre no carregamento do plugin, sem erro na tela. Quem tocasse em
  "entrar com Google" ou "entrar com Apple" dentro do app ficava esperando
  sem resposta. Mesmo defeito do lembrete (ver a seção de retenção): o objeto
  do plugin parece uma promessa para o JavaScript, e a espera nunca terminava.
  Vale só para o app das lojas; no navegador o caminho é outro e sempre
  funcionou. Precisa de conferência em aparelho real quando sair o build,
  porque aqui só dá para provar por leitura de código.

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

# O que traz a pessoa de volta (auditoria de retenção, 2026-08-28)

O app não tem push. Isso não é um detalhe técnico, é a moldura de toda a
retenção: não existe hoje nenhuma forma de falar com quem parou de abrir o
app. Tudo o que traz de volta está DENTRO do aparelho e depende de a pessoa
abrir, ou de um lembrete local agendado enquanto ela ainda estava por perto.

## Lembrete local (quiz do dia e fim do teste)
- Trabalho: ser o único caminho de volta que não depende de a pessoa lembrar
  sozinha. Dois avisos, um por finalidade: o quiz do dia às 9h e o aviso de
  que o teste grátis está para acabar.
- Fricções conhecidas: a permissão do sistema é de UM TIRO (recusou, acabou),
  então cada pedido é caro; e quem para de abrir o app recebe UM aviso e
  depois silêncio, por decisão de projeto (nada rearma sozinho).
- Princípios: efeito de progresso (a sequência do quiz), clareza do próximo
  passo, timing do pedido (a permissão só é pedida depois de a pessoa
  responder um quiz, nunca na chegada).
- Última auditoria: 2026-08-28 · ACHADO: nenhum dos dois avisos jamais saiu.
  O carregamento do plugin ficava pendente para sempre, então o interruptor
  do Perfil não reagia ao toque, o convite depois do quiz nunca aparecia e
  nada era agendado. Corrigido no mesmo dia (lib/app/notificacoes.ts).
- Apostas em aberto: lembrete-que-chega, fim-do-lembrete-falso.

## Quiz do dia e a sequência
- Trabalho: dar um motivo de um minuto para abrir o app todo dia, e
  transformar isso em identidade ("cuido do meu carro").
- Fricções conhecidas: a sequência só existe dentro do app, então ela puxa
  quem já voltou e não alcança quem sumiu. O convite de aviso é o que fecharia
  esse vão, e era justamente ele que não aparecia.
- Princípios: efeito de progresso, compromisso e consistência.
- Última auditoria: 2026-08-28 · sem mudança de copy nesta rodada.

## Início: carro, saúde e próximas revisões
- Trabalho: responder "e agora?" em um olhar para quem abriu sem tarefa na
  cabeça. O card do carro mostra a nota de saúde; o card de revisões é o
  primeiro da fila quando existe carro.
- Fricções conhecidas: com carro incompleto (sem quiz de saúde, sem km ou sem
  data de compra) o card de revisões vira pedido de dado em vez de entrega de
  valor. É honesto (sem dado o plano não é preciso), mas é uma tarefa a mais
  entre a pessoa e a primeira coisa útil.
- Princípios: clareza do próximo passo, compromisso (pedir o micro antes do
  macro).
- Última auditoria: 2026-08-28 · sem mudança nesta rodada; candidato natural
  a teste quando houver volume.

## O que não dá para medir hoje (e por isso não dá para apostar)
- uso.coortes está VAZIO no retrato. A retenção por coorte é montada sobre o
  evento de cadastro, que só voltou a funcionar em 27/08. Ou seja: a pergunta
  "quem experimentou volta?" não tem resposta legível nenhuma esta semana.
- Continua sem evento de CONCLUSÃO (trilha, aula, serviço, sintoma), então
  "valor consumado" segue sem régua, como já estava anotado no passo 5.
- Consequência prática, e é a razão de esta rodada não propor teste A/B:
  medir retenção hoje é medir com régua quebrada. Duas semanas de cadastro
  medido de verdade vêm primeiro.

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
