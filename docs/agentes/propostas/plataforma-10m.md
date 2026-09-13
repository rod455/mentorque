# Os dois projetos de R$ 10 milhões, contra o que o Mentorque já é

Pedido do dono em 13/09/2026: "Enviei 2 projetos de como transformar nosso
app em uma empresa de 10M ano. Quero que entenda o que temos e o que
precisamos evoluir." Os dois documentos: "App de Mecânica Automotiva"
(chamado aqui de Projeto A) e "Plataforma de Inteligência Automotiva"
(Projeto B). Lidos inteiros e comparados com o código, a ficha da loja e as
portas canônicas dos dados.

## 1. O que os dois projetos dizem, em uma linha cada

- **Projeto A**: comece simples. Histórico + lembretes + checklist para a
  oficina, tudo contextualizado pelo carro. Nada de diagnóstico automático,
  marketplace ou frota antes de provar que a pessoa volta e paga pela
  organização.
- **Projeto B**: o app é uma funcionalidade; a empresa é a camada de
  inteligência entre o dono, o carro e o ecossistema. O wedge recomendado é
  "entenda o problema do seu carro e o orçamento da oficina com IA que
  conhece o seu carro". Os R$ 10 milhões vêm de B2B (oficinas e frotas) e
  marketplace, não de B2C puro.

Onde eles concordam, e isso importa mais que onde divergem:

1. O carro é a unidade de tudo (nós já somos assim: `CarHub`, carro ativo
   na barra).
2. Não diagnosticar de forma definitiva; mostrar incerteza e mandar para o
   profissional quando há risco (nossa ficha já diz isso em "o que o
   Mentorque não faz").
3. A pergunta que vale é "qual problema faz alguém voltar ou pagar", não
   "como construir". Os dois pedem entrevistas com donos de carro antes de
   construir mais.
4. B2C sozinho dificilmente chega a R$ 10 milhões em 24 meses. O Projeto B
   faz a conta: 40.000 pagantes a R$ 20. O Projeto A nem promete.

## 2. Onde estamos, com a régua declarada

| medida | valor | fonte |
|---|---|---|
| contas | 28 (21 nos últimos 30 dias) | `auth.users` |
| pagantes | 3, todos de cupom, primeiro dinheiro em 01/10 | diário 04/09 |
| pessoas distintas em 30 dias | 321 | `funil_eventos`, identidade |
| voltam algum dia depois do primeiro | 11 de 253 (4%) | revisão de retenção 12/09 |
| carros na nuvem | 17 | revisão de retenção |
| preços registrados com valor | 1 | `precos_observados` |
| receita mensal prevista | R$ 89,70 | 3 × R$ 29,90 |

A distância até R$ 10 milhões por ano não é de produto, é de ordem de
grandeza: são 40.000 pagantes onde há 3, ou 1.000 oficinas onde há zero. Os
dois projetos sabem disso e por isso mandam validar antes de construir.
Este documento segue a mesma regra: o que propõe é o que dá para medir com
os instrumentos que já existem.

## 3. Inventário: pilar por pilar, o que já existe

"Existe" quer dizer tela publicada no app das lojas ou no site. "Parcial"
quer dizer que a base está lá e falta a parte que os projetos valorizam.

| pilar (nome dos projetos) | estado | o que temos |
|---|---|---|
| Cadastro do veículo | existe | tipo, marca e modelo pela FIPE, ano, motor, km, foto, placa; na 2.5, teste A/B com só marca, modelo e ano |
| Cadastro por placa (B) | não existe | pede uma API paga de consulta de placa; gasto novo, decisão do dono |
| Prontuário: histórico de serviços | existe | serviço, peças, valor, oficina, km, data; edição; PDF no Premium |
| Calendário de manutenção | existe | régua por km e por data (`planoDeRevisao.ts`), estimativa quando falta dado, aviso local de revisão vencida |
| Saúde do carro | existe, mas ver 5.3 | quiz de saúde com pontuação e sistemas; o Projeto A pede para NÃO mostrar número de saúde sem inspeção |
| Sintomas com causas e urgência | existe | 20 e poucos sintomas, causas prováveis, urgência típica, checklist para a oficina, testes que a pessoa faz |
| Triagem por perguntas antes do resultado (B) | não existe | o sintoma vai direto ao resultado; não há as 3 ou 4 perguntas adaptativas (parado ou andando, ao frear, luz acesa) |
| Semáforo de urgência (verde, amarelo, vermelho) (B) | parcial | a urgência existe por causa, não como veredito único do caso |
| IA que conhece o carro | existe | Biela, com 112 manuais e 34.609 trechos, contexto do carro cadastrado; texto só |
| Análise de orçamento por foto (B, wedge prioritário) | não existe | há o campo "valor total do orçamento" e "comparar orçamentos" no checklist; não há foto, OCR nem explicação linha a linha |
| Faixa de preço por serviço e região | existe | `precos_observados` e a comparação "na sua região" ao registrar serviço com valor; 1 registro até hoje |
| Relatório de gastos | existe (Premium) | gráfico por período; sem categorias como combustível, seguro, documentação |
| Custo por km, manter ou trocar (B) | não existe | |
| Exportar e compartilhar | parcial | PDF do histórico (Premium); não há "relatório do meu carro" compartilhável, que é a peça viral do Projeto B |
| Lembretes e recorrência | existe | avisos locais (quiz, km mensal, revisão vencida, trilha), push (Android; iPhone só na 2.5), jornada de e-mail de 21 textos |
| Aprender sobre o carro | existe | trilhas e aulas, quiz diário, glossário nas aulas |
| Ferramentas | existe | OBD2 por código, comparador etanol e gasolina, equipamentos |
| Free e Premium com paywall contextual | existe | R$ 29,90/mês e R$ 239,90/ano; tranca: causas completas, PDF, relatório de gastos, Biela sem limite, acervo |
| Modo convidado | existe | carro sem conta; convite para salvar na nuvem |
| SEO por sintoma | parcial | 4 guias no site (barulho, não pega, luz da injeção, gasolina); sem o botão "explique o seu para a Biela" |
| Vídeos curtos e Instagram | em andamento | automação de comentário no n8n, esperando verificação da Meta |
| Marketplace de oficinas (B) | não existe | |
| Copilot e CRM para oficinas (B) | não existe | |
| Frotas (A e B) | não existe | |
| Medição | existe | funil por aparelho e conta, eventos de valor desde 12/09, A/B por variante, coortes de retenção |

Resumo honesto: **o Projeto A já está construído.** Tudo o que ele chama de
MVP existe, e mais (Biela, aulas, quiz, jornada). O que ele pede e ainda não
temos é a validação: entrevistas e a prova de que a pessoa volta e paga. O
Projeto B pede três coisas novas no app (triagem por perguntas, orçamento
por foto, relatório compartilhável) e duas empresas novas (oficinas e
frotas).

## 4. O que falta, em ordem de alavanca

Cada item diz o princípio, o tamanho, o que mede e o que já existe para
apoiar. Preço, plano e gasto novo não entram aqui: são do dono.

### 4.1 Orçamento por foto, explicado pela Biela

O wedge que o Projeto B chama de "uma das melhores portas de entrada", e a
dor que a nossa própria ficha já promete na descrição curta ("o orçamento
antes de ir na oficina"). Hoje a pessoa digita o valor total; a proposta é
tirar foto do orçamento, a Biela extrai as linhas (peças, serviços, mão de
obra), explica para que serve cada item, compara com a faixa da região
quando houver, e devolve as perguntas para fazer na oficina. Nunca "está
sendo enganado"; sempre "entenda e pergunte", como os dois projetos mandam.

- O que já existe: Biela com contexto do carro, faixas de preço, checklist
  com campo de orçamento, os eventos para medir.
- O que falta: entrada de imagem na Biela (o modelo lê imagem; a rota
  precisa aceitar), o molde de resposta estruturada, a tela.
- Mede: `analisou_orcamento` (novo) e o retorno em 30 dias de quem
  analisou, contra quem não analisou. Uso episódico é o risco declarado no
  Projeto B; a leitura tem que ser de retorno, não de uso.
- Custo: uma a duas semanas. Custo por análise na API do modelo: pequeno,
  mas é gasto por uso; o dono define o limite no gratuito.

### 4.2 Triagem por perguntas antes do resultado

Hoje "barulho ao frear" abre a lista de causas. O Projeto B propõe três ou
quatro perguntas antes (parado ou andando; ao frear, acelerar ou virar; luz
no painel; ainda dá para dirigir) e um semáforo único no fim. É o que
separa "lista de causas" de "triagem", e é o que faz a pessoa sentir que o
app olhou o caso dela.

- O que já existe: os sintomas com causas e urgência, os testes que a
  pessoa faz, `consultou_sintoma`.
- O que falta: as perguntas por sintoma (conteúdo, revisado), a regra que
  reordena as causas pelas respostas, o semáforo.
- Mede: `consultou_sintoma` para `registrou_servico` ou `analisou_orcamento`
  em 30 dias; e a saída na tela de perguntas (se cair muita gente, as
  perguntas são fricção, não valor).

### 4.3 Relatório do meu carro, compartilhável

A peça de distribuição que não custa mídia: uma página ou imagem com o
carro, o que está em dia, o que vence, quanto gastou no ano, com o nome do
app. Serve para o WhatsApp da família e para a venda do carro ("histórico
para uma futura venda" está nos dois projetos).

- O que já existe: PDF do histórico (Premium), calendário, gastos.
- O que falta: a versão compartilhável, gratuita para o resumo e Premium
  para o completo; um link público por carro com o que a pessoa escolher
  mostrar.
- Mede: `compartilhou_relatorio` (novo) e instalações com a etiqueta do
  relatório (`utm_source=relatorio`).

### 4.4 Gastos com categorias e custo por km

O relatório de gastos existe, mas só conta serviço. Combustível, seguro,
documentação e pneus são as categorias que fazem alguém abrir o app todo
mês, e custo por km é o número que ninguém tem do próprio carro. Motorista
de aplicativo (que a ficha já mira) vive disso.

- O que já existe: o relatório, o registro de serviço com valor, o km
  mensal.
- O que falta: as categorias, o lançamento rápido de abastecimento, custo
  por km.
- Mede: pessoas com dois ou mais lançamentos em meses distintos.

### 4.5 Da página de sintoma no site para dentro do app

Os quatro guias já existem e trazem gente do Google. Falta o botão "explique
o barulho do seu carro para a Biela" abrindo o app na Biela com o sintoma
pré-preenchido. O `ir=` do link já faz a navegação; falta o texto carregar.

- Mede: cliques do guia para o app e `abriu_cadastro_de_carro` depois.
- Custo: dias.

### 4.6 Validação, que os dois projetos põem antes de tudo

Trinta entrevistas com donos de carro, dez com oficinas. Isso não é código
e não sou eu quem faz; posso preparar o roteiro (os dois projetos já trazem
as perguntas: último problema, como descobriu, quanto pagou, confiou no
orçamento, pagaria). O que eu posso fazer sozinho: a pergunta de uma linha
dentro do app depois do primeiro valor ("o que você veio resolver hoje?"),
gravada em `feedback`, para ler junto com o funil.

## 5. O que os projetos dizem para NÃO fazer, e onde nós já fazemos

### 5.1 Marketplace, oficinas e frotas: não agora

Os dois documentos são explícitos: só depois de um wedge com demanda
provada. Com 3 pagantes e 4% de retorno, não há demanda para vender a uma
oficina. O que dá para fazer hoje sem construir nada: o campo "oficina" do
serviço já existe; se ele for preenchido, nasce a lista de oficinas por
região que um dia vira rede. Custa zero e é a semente do Pilar 7.

### 5.2 Chatbot aberto

O Projeto B avisa que "mais um chatbot de mecânica" é copiável. A Biela já
é mais que isso (manuais, carro em contexto), mas a entrada é uma caixa de
texto livre. O 4.2 (triagem) e o 4.1 (orçamento) são o que a tornam
diferente de um ChatGPT com prompt de carro.

### 5.3 Saúde numérica

O Projeto A pede para não exibir "saúde" numérica sem inspeção, e preferir
estados explicáveis: em dia, atenção, informação insuficiente, revisão
possivelmente atrasada. A nossa tela do carro tem uma pontuação de saúde
que vem do quiz. Não é inventada (a pessoa respondeu), mas a leitura de
fora é a que o Projeto A teme. Vale uma decisão do dono: manter o número e
escrever de onde ele vem, ou trocar por estado por sistema. Eu iria de
estado por sistema, com "último registro" e "próximo acompanhamento", como
o Projeto A descreve; é também o que o card "Diagnóstico do carro" da 2.5
já começa a fazer.

### 5.4 Pedir Premium antes do primeiro valor

Os dois projetos: paywall só quando o valor está evidente (segundo carro,
exportar, relatório). O banner fixo da Home para quem não tem carro já está
anotado no mapa como fricção. Fica a recomendação de tirá-lo até o primeiro
carro existir.

## 6. A ordem que eu faria

Nada aqui é uma bateria 360. São quatro apostas medíveis, uma por vez, e a
decisão de negócio (B2B) fica para quando a primeira leitura chegar.

1. **Agora, sem binário**: 4.5 (guias do site abrem a Biela com o sintoma)
   e a semente de oficinas de 5.1. Dias.
2. **Próximas duas semanas**: 4.1, orçamento por foto. É o wedge que os dois
   projetos e a nossa ficha apontam, e é o que usa melhor o que já temos
   (Biela, faixas de preço, checklist). Binário para a foto no app das
   lojas; na web sai no push.
3. **Depois**: 4.2 (triagem) e 4.3 (relatório compartilhável). O 4.2 é
   conteúdo revisado, e revisão de conteúdo passa pelo dono.
4. **Ler**: em 30 dias, quem analisou orçamento ou passou pela triagem volta
   mais? Registra serviço? Paga? É a "maior pergunta a validar" do Projeto
   B, respondida com os eventos que já existem desde 12/09.
5. **Só então** a conversa de oficinas e frotas, com números na mão.

## 7. Decisões que são do dono

- Preço e limites do gratuito (o Projeto A sugere testar R$ 19,90, 29,90 e
  39,90; o B fala em R$ 14,90 a 29,90). Nada disso muda sem você.
- Consulta de placa (API paga) e o custo por análise de orçamento.
- A pontuação de saúde: número ou estado (5.3).
- As entrevistas (4.6): quem faz e quando.
- A direção B2B: oficinas ou frotas, e quando. Os dois projetos dizem
  "depois"; eu concordo, com a ressalva de que a semente (o campo oficina
  preenchido) começa agora e não custa nada.
