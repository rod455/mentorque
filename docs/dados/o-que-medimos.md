# O que a gente mede, e o que ainda não

Inventário escrito em 19/09/2026, por pedido do dono ("quero conseguir mensurar
tudo que é possível"). Serve para duas coisas: saber onde procurar um número
antes de inventar um, e saber o que ainda é buraco antes de tirar conclusão de
um silêncio.

**A regra que atravessa o documento inteiro:** silêncio não é resultado. Zero
por falta de instrumento e zero por falta de gente são a mesma cara no painel e
levam a decisões opostas. Toda linha aqui diz qual dos dois é.

## O que já entra sozinho, todo dia

Coletado pelo Analista (n8n, 5h30) e gravado em `metricas_diarias`, mais o que
nasce no nosso próprio banco.

| área | fonte | o que dá para responder |
|---|---|---|
| Funil do app e do site | `funil_eventos` (nosso) | abriu, começou onboarding, cadastrou carro, criou conta, viu paywall, tentou assinar, iniciou checkout, viu aula, consultou sintoma, registrou serviço, analisou orçamento, abasteceu, lançou ganho, clicou em baixar |
| Origem de cada pessoa | `extra->'utm'` no evento | de qual campanha, mídia e peça veio quem chegou, e o `gclid` do clique pago |
| Uso e retenção | views `uso_diario`, `uso_semanal`, `retencao_coortes`, `ativacao_coortes` | pessoas distintas por dia e semana, quem voltou em 1 a 7 e 8 a 30 dias, quem fez a primeira ação de valor em 7 dias |
| Vendas | `subscriptions` + Stripe (live) | ativas, pagantes, em teste, cortesias, cupons, MRR, receita 30 dias, desencontro entre a venda e a medição |
| Assinatura nas lojas | RevenueCat | assinaturas, MRR e testes do lado das lojas |
| Erros do app | `app_erros` | mensagem, plataforma, versão, quantos aparelhos, última ocorrência |
| Busca do Google | Search Console | cliques e impressões 28 dias, top consultas, top páginas |
| Google Ads | API | custo, cliques, impressões e conversões por dia, POR CAMPANHA (com estado e canal) e POR TERMO DE BUSCA |
| Meta Ads | API | contas visíveis, campanhas e conjuntos com estado real, e gasto por dia, por campanha e por anúncio |
| Anúncio dentro do app | AdMob | ganhos e impressões 7 dias |
| Lojas: saúde | Play Console | taxa de crash, taxa de ANR, avaliações |
| Lojas: Apple | App Store Connect | estado das versões e downloads (relatório de vendas) |
| Site | Vercel | deploys e erros de deploy, e desde 19/09 o Web Analytics ligado |
| YouTube | API | inscritos, views totais, views dos últimos vídeos |
| E-mail da jornada | `jornada_envios` + `email_eventos` | quantos saíram, e desde 19/09 entregue, aberto, clicado e devolvido POR CHAVE de e-mail |

## O que falta, em ordem de quanto dói

### 1. De onde vem cada INSTALAÇÃO (Android e iPhone)

**O buraco.** A campanha de instalação manda o clique direto para a loja. A
loja não conta de onde a pessoa veio, e o app abre sem saber. Hoje, uma
instalação vinda do Meta, uma do Google e uma orgânica são idênticas para nós.
Com quatro campanhas de instalação no ar, isso deixa de ser detalhe: é a maior
parte do dinheiro sem nome.

**O conserto, e ele é nosso.** O Android entrega ao próprio app, na primeira
abertura, a etiqueta de quem trouxe a instalação (o Install Referrer da Play
Store), e ali vem `utm_source`, `utm_campaign` e o `gclid` quando for Google.
Basta ler uma vez e mandar para o funil como qualquer outra etiqueta. **Precisa
de build** e de um plugin nativo pequeno; não depende de fornecedor nenhum.

**No iPhone não existe equivalente.** A Apple só entrega atribuição de Apple
Search Ads; para Meta e Google no iOS, ou entra SKAdNetwork (agregado, com
atraso e sem ligação com a pessoa) ou um MMP. Para o tamanho de hoje, o certo é
medir bem o Android e dizer que o iPhone é cego, em vez de fingir.

### 2. Aquisição e desinstalação no Play Console

**O buraco.** O Play sabe quantas instalações vieram de busca na loja, de
navegação, de anúncio e de link externo, e quantas pessoas desinstalaram. Nada
disso entra aqui: a coleta do Play traz só crash, ANR e avaliações.

**O conserto.** O Play publica esses relatórios em CSV num balde do Google Cloud
para a conta de serviço que a gente já usa. É coleta nova no n8n, sem build e
sem dono envolvido, e é o único lugar que responde "quantos desinstalaram".

### 3. A ficha da loja converte? (App Store Connect)

**O buraco.** A gente sabe quantos baixaram, e não quantos VIRAM a ficha. Sem
isso, "a ficha está ruim" e "ninguém chegou na ficha" são indistinguíveis, e as
propostas do ASO viram chute com boa vontade.

**O conserto.** A API de relatórios de analytics da App Store Connect entrega
impressões, visitas à página do produto e taxa de conversão. A credencial já
existe no n8n; o trabalho é pedir o relatório e ler quando ficar pronto.

### 4. Push: saiu, chegou, e alguém abriu?

**O buraco.** A gente mede quantos push saíram. Não mede quantos chegaram nem
quantos foram tocados, então um push que o sistema engoliu é igual a um push
que a pessoa ignorou.

**O conserto, em dois pedaços.** Abertura é nosso: o app emite um evento quando
abre por causa de um aviso, e isso vale para os dois sistemas (precisa de
build). Entrega é do Google: o FCM tem relatório de entrega para Android, e dá
para coletar sem build.

### 5. Desinstalação medida pelo push, de graça

Quando o Google ou a Apple respondem que o token não existe mais, aquilo é
quase sempre app desinstalado. Hoje a gente trata como erro e segue. Marcar a
data no `push_tokens` dá uma série de desinstalação por plataforma sem pedir
nada a ninguém, e sem build.

### 6. Instagram e Facebook orgânicos

Nenhum número de post (alcance, salvamento, visita ao perfil) chega aqui, e
nenhum clique de Instagram jamais apareceu no funil. O link com etiqueta já
existe (`mentorque.com.br/ig`, desde 19/09) e resolve o clique. O alcance por
post depende de uma permissão no painel da Meta, que está na lista do dono.

### 7. Web Analytics da Vercel no retrato

Ligado em 19/09, mas os números ainda não entram na coleta diária: hoje só dá
para vê-los no painel da Vercel. Entrar no retrato é o que permite ao papel de
SEO acompanhar visita por guia sem depender de alguém abrir um site.

### 8. O que a pessoa procura no app e não encontra

A busca interna existe e o que foi digitado não é guardado. É a lista mais
barata de ideias de conteúdo e de funcionalidade que um produto pode ter, e ela
está sendo jogada fora todo dia. Precisa de build, e de cuidado: guardar texto
que a pessoa digitou pede critério sobre o que NÃO guardar.

### 9. Velocidade do site

O Vercel Speed Insights não está ligado. Página lenta derruba conversão de
anúncio antes de qualquer texto, e hoje a gente não saberia.

## O que NÃO vale medir, e por quê

- **Abertura de e-mail como métrica de sucesso.** Ela depende de a imagem
  carregar, e quem bloqueia imagem some da conta. Serve de sinal relativo entre
  e-mails nossos, nunca de número absoluto para decidir nada sozinho.
- **Instalação contada pelo Meta ou pelo Google.** Cada um conta a sua, com
  janela própria, e as duas somadas passam do total real. Quando houver
  Install Referrer, a nossa contagem é a que vale.
- **Qualquer coisa que exija guardar dado de pessoa sem necessidade.** O que
  não se guarda não vaza. Medição aqui existe para decidir, não para colecionar.
