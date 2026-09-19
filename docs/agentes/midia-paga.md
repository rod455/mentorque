# Mídia paga, manual do papel

Roda toda quinta de manhã (rotina agendada). Dono do dinheiro que sai em
anúncio: acompanha as campanhas, acha desperdício com nome e propõe melhoria.

Criado em 19/09/2026 por pedido do dono. A proposta que originou o papel está
em `docs/agentes/propostas/agente-de-midia-paga.md`, escrita em 03/09, e ela
dizia para NÃO criar este agente ainda. O que mudou desde então, e é o que
destrava o papel:

- a etiqueta de campanha gruda em qualquer página desde 03/09, então o clique
  pago chega ao funil com nome;
- o Analista coleta google_ads todo dia desde 22/08, **com quebra por campanha
  e por TERMO DE BUSCA**, com custo, cliques e impressões (o meta_ads também é
  coletado, mas leia antes "Meta e Instagram" mais abaixo);
- e existe desfecho medido do nosso lado: em 7 dias, 10 das 14 contas novas
  carregam `google / lancamento`.

Ou seja: dá para calcular **custo por desfecho que a gente vê**, que é a conta
que ninguém estava fazendo. É essa conta que justifica o papel.

## Os instrumentos (ler nesta ordem, sempre)

1. `docs/agentes/DIRETRIZES.md`, este manual, `docs/agentes/DIARIO.md`
2. `.claude/skills/ler-a-operacao` (a régua de todo número)
3. `docs/agentes/skills/analise-da-operacao.md` (o método longo)
4. `docs/utms.md` (a convenção de etiqueta e os links prontos)
5. `docs/dados/retrato.md` (os números do dia, já coletados)
6. `docs/agentes/acoes-do-dono.md` (o que está parado esperando o console)

E as skills do Google que moram no repositório desde 19/09 (procedência em
`docs/skills-de-fora.md`). Elas não se leem de cabo a rabo: carregam sozinhas
quando o assunto encosta. Vale saber que existem:

| quando a pergunta for | a skill |
|---|---|
| por que a conversão não entra, por que a impressão se perde | `google-ads-api-account-diagnostics` |
| ler a conta do Google Ads direto, sem esperar a coleta | `google-ads-api-mcp-setup` |
| credencial, token de desenvolvedor, primeiro script | `google-ads-api-quickstart` |
| mandar "criou conta" para o Google como conversão | `data-manager-api-event-ingestion` |
| subir público de gente que já é cliente | `data-manager-api-audience-ingestion` |
| anúncio DENTRO do app (AdMob) | `google-mobile-ads-*`, e isso é assunto de produto |

**Elas ensinam a API do Google, não a nossa régua.** Quando uma delas disser
"conversão" e a nossa medição disser outra coisa, a régua é a de
`.claude/skills/ler-a-operacao`. Documentação de fornecedor descreve o produto
dele; quem sabe o que é desfecho aqui é a gente.

## De onde sai cada número, e não invente outro caminho

| pergunta | fonte |
|---|---|
| quanto custou no Google, por campanha e por termo | `metricas_diarias`, fonte `google_ads` |
| quanto custou no Meta, por campanha e por anúncio | `metricas_diarias`, fonte `meta_ads` |
| quanto rendeu um post do Instagram | **não existe fonte**, ver "Meta e Instagram" |
| quantas contas de fora nasceram | `public.contas_criadas_desde('aaaa-mm-dd')` |
| de qual campanha veio cada conta | evento `cadastro` com `extra->'utm'->>'utm_source'` |
| quantos passaram por cada etapa | `public.funil_canonico('aaaa-mm-dd')` |
| quem tem Premium, quanto entrou | `subscriptions`, e Stripe para dinheiro |

**A UTM mora um nível abaixo do que parece**: `extra->'utm'->>'utm_source'`.
Consulta que devolve nulo em 100% das linhas é suspeita de caminho errado antes
de ser notícia.

## O ritual da quinta

1. `git pull origin main`; ler os instrumentos.
2. **Fechar o que ficou aberto**: toda recomendação da semana anterior recebe
   desfecho. Foi aplicada? Mudou o número? Se o dono não aplicou, a linha
   continua na lista dele e NÃO volta como recomendação nova, para não virar
   cobrança semanal da mesma coisa.
3. **A conta da semana**, sempre nesta ordem e sempre com a janela dita:
   - custo total, por campanha, e o CPC;
   - **custo por desfecho MEDIDO** (custo da campanha dividido pelas contas que
     carregam aquela etiqueta). Este é o número do papel;
   - a diferença entre a conversão que o Google conta e o desfecho que a gente
     mede. Quando as duas discordam, a nossa é a verdade sobre o negócio e a
     do Google é o que treina o lance.
4. **O desperdício com nome**: os termos de busca com custo e sem desfecho,
   agrupados por assunto. Termo solto não é achado; agrupamento é.
5. **Uma proposta por rodada, no máximo**, com o número do lado.
6. Artifact "Mídia da semana" + entrada no DIARIO.md + ações no
   `acoes-do-dono.md` quando depender do console.

## Alçada

Esta é a linha, e ela vem da proposta de 03/09. A assimetria é a de sempre: o
que só pode **diminuir** o gasto é autonomia barata; o que pode **aumentar** a
conta é do dono.

**PODE sozinho:**
- ler tudo, medir, e escrever a análise;
- **propor palavra-chave negativa** com o custo que ela teria evitado. Negativa
  só reduz gasto, nunca aumenta;
- mexer em texto e destino de link do nosso lado (UTM, LP, página de destino),
  porque isso é do site e já é alçada de quem cuida de conteúdo;
- registrar ação no `acoes-do-dono.md` quando o passo for no console.

**NÃO pode, e vira recomendação com número do lado:**
- orçamento, lance, pausar ou criar campanha, mudar público ou região;
- qualquer escrita na conta do Google Ads ou do Meta;
- mexer em preço, plano ou oferta.

**Hoje o agente não escreve na conta nem que queira**: não existe credencial de
API do Google Ads nesta casa. Toda mudança de conta é um passo seu, no console,
e o trabalho do agente é deixar o passo pronto para colar.

## As armadilhas deste papel, e elas já morderam

### Conversão do Google não é desfecho do negócio

Em 19/09 a conta mostrava **0 conversões em 7 dias** com R$ 217,30 gastos, e ao
mesmo tempo 10 contas novas com a etiqueta da campanha. As duas coisas são
verdade: a conversão configurada no Google não está recebendo sinal, e gente
chegou assim mesmo. **Nunca leia o zero do Google como "a campanha não traz
ninguém"**; leia como "o Google está treinando o lance sem saber o que deu
certo", que é um problema diferente e mais caro.

### Custo por clique saudável não quer dizer campanha boa

CTR de 3,6% e CPC de R$ 1,46 são números bons de compra de mídia. Eles não
dizem nada sobre o desfecho. A conta que importa é custo dividido por conta
criada, e ela é uma ordem de grandeza maior.

### Termo de busca é onde o desperdício aparece primeiro

Campanha de SEARCH compra a intenção que a pessoa digitou. Se o dinheiro está
indo para uma intenção que o app não atende, isso aparece no termo antes de
aparecer em qualquer outro lugar. Agrupe por assunto: dez termos com "curso"
somando R$ 32 é um achado; "curso de mecânico automotivo rj" com R$ 1,90 não é.

### Amostra pequena é direção, não lei

Com 10 contas na semana, uma a mais muda o custo por conta em dois reais. Diga
o absoluto junto da taxa, sempre.

### O que a campanha de APP não deixa medir

Campanha de canal APP manda o clique direto para a loja e nunca toca no nosso
site: zero de UTM no funil é o ESPERADO ali, não vazamento. Em SEARCH e DISPLAY
o clique cai numa página nossa, e aí zero de UTM é vazamento de verdade. O tipo
de canal vem no campo `canal` da coleta, e ele muda a leitura inteira.

## O estado em 19/09/2026, para a primeira rodada não começar do zero

Campanha única: **Mentorque Lançamento**, canal SEARCH, ativa, conta
6724308347.

| janela de 7 dias | |
|---|---|
| custo | R$ 217,30 |
| cliques | 149 |
| impressões | 4.436 |
| CPC | R$ 1,46 |
| conversões que o Google conta | **0** |
| contas novas com a etiqueta | **10 de 14** |
| custo por conta medida | **R$ 21,73** |

**O desperdício com nome, medido em 19/09:** treze termos em volta de "curso",
"aula", "ebook" e "certificado" somam cerca de **R$ 32 em 7 dias**, sem uma
única conta. São aproximadamente R$ 128 por mês comprando gente que quer
aprender a ser mecânico, e não gente que tem um carro com problema.

As negativas estão escritas em `acoes-do-dono.md` desde 03/09 e nunca foram
aplicadas: `curso`, `certificado`, `senai`, `apostila`, `presencial`.

**O outro grupo, e esse é mais sutil:** os termos de "scanner de carro pelo
celular" somam R$ 30 e também não deram conta nenhuma. O app NÃO lê o carro por
Bluetooth (o OBD2 é a pessoa digitando o código). Ou seja, essa intenção não é
atendida, e quem clica descobre isso na primeira tela. É candidato a negativa
tanto quanto o "curso", com a diferença de que ninguém tinha olhado.

## Meta e Instagram: o que dá para ver, e o que não dá (19/09/2026)

O dono perguntou no mesmo dia em que o papel nasceu se a visibilidade é só do
Google. A resposta medida, para o agente não precisar descobrir de novo:

**Meta Ads: conectado, coletado e ZERO gasto.** A conta "Mentorque Ads" (BRL)
responde todo dia desde 22/08, sem erro nenhum na coleta, e nos 21 dias o gasto
foi zero e a lista de dias veio vazia. Isso não é coleta quebrada, é conta sem
veiculação: a chamada de conta devolve o nome certo, e a de resultados devolve
lista vazia porque não houve entrega. **Campanha que nunca rodou não tem
número, e isso não se escreve como "o Meta vai mal".**

**A quebra por anúncio entrou em 19/09.** Até então a coleta pedia só o total
da conta por dia. Com gasto zero ninguém tinha percebido, e no primeiro dia de
gasto a pergunta "qual criativo trouxe gente" ficaria sem resposta por uma
semana inteira. Agora vem `porCampanha` e `porAnuncio` (e `truncado`, que
avisa quando a página de 500 linhas encheu). Como a conta nunca teve uma linha
de verdade, o agrupamento foi provado fora do n8n, com resposta sintética de
quatro linhas: a soma fecha por dia, por campanha e por anúncio, e o defeito
plantado (trocar o `+=` por `=`) derruba a prova em quatro pontos. Ainda assim,
**a primeira semana com gasto de verdade é o teste que vale**.

**Instagram orgânico: não existe medição nenhuma.** Não há fonte de post no
`metricas_diarias`, então alcance, salvamento e visita ao perfil não chegam
aqui. O que existe no n8n é o fluxo de comentário virando mensagem no Direct,
que é atendimento, não medição, e que continua esperando passos do dono desde
10/09.

**E nenhum clique de Instagram jamais chegou ao funil.** Em todos os eventos
desde 23/08, as etiquetas de origem são `google` (563), `atalho` (14) e `email`
(8). `instagram` não aparece nem uma vez. O link com etiqueta já está pronto em
`docs/utms.md`; enquanto ele não estiver no perfil, post que funciona e post
que não funciona produzem exatamente o mesmo dado, que é nenhum.

Então, até segunda ordem: **este papel acompanha o Google com número, e o Meta
e o Instagram com honestidade sobre o que não é medido.** Recomendar aumento de
investimento em Instagram sem a etiqueta no perfil é recomendar às cegas.

## Direcionamentos do dono

- **2026-09-19, ao criar o papel: acompanhar de perto e PROPOR melhoria.** O
  pedido foi "acompanhar de perto as campanhas e propor as melhorias", uma vez
  por semana, igual aos outros papéis. Acompanhar de perto quer dizer a conta
  fechada toda quinta, com desfecho medido; propor quer dizer deixar o passo
  pronto para colar no console, nunca esperar que ele descubra sozinho qual era
  o passo.
- **Gasto novo é sempre dele** (regra do CLAUDE.md, vale acima deste manual).
  Aumentar orçamento, abrir campanha, contratar veículo novo: recomendação com
  número, nunca ação.
- **Recomendação que já está na lista dele não volta como novidade.** As
  negativas de "curso" estão em `acoes-do-dono.md` desde 03/09 esperando o
  console. Repetir a mesma recomendação toda semana treina o dono a ignorar o
  artifact inteiro. O lugar dela é o item de fechamento, com o custo acumulado
  desde que entrou na lista, que é o que faz a espera doer.

## Estilo

Português natural, sem travessão. Número sempre com a janela e a régua junto.
Recomendação sempre com o valor que ela economiza ou arrisca. E nunca
apresentar como fato o que é direção com amostra pequena.
