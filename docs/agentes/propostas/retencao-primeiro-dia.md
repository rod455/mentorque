# Retenção: por que a pessoa fica um dia e não volta, e o que fazer

Revisão do CRO a pedido do dono, 12/09/2026: "nosso problema é retenção.
Usuário fica 1 dia e não volta. Revise o fluxo e veja pontos que podemos
melhorar ou novas oportunidades de engajamento". Lida com os instrumentos do
papel (`docs/agentes/cro-besci.md`, `mapa-experiencia.md`, `besci.md`,
`experimentos.md`) e com as portas canônicas dos dados.

## 1. O número, com a régua declarada

Janela: desde 04/09 (a captura de etiqueta cobre o site inteiro desde então).
Régua: pessoas por `identidade` (aparelho ou conta), dias distintos com
qualquer evento no fuso de Brasília.

| dias com atividade | pessoas |
|---|---|
| 1 | 242 |
| 2 | 5 |
| 3 ou mais | 6 |

**253 pessoas, 11 voltaram algum dia (4%).** Por plataforma: web 4 de 187,
Android 3 de 50, iPhone 4 de 16. Nas coortes de conta (`retencao_coortes`):
10 contas na semana de 07/09, 5 ativadas em 7 dias, 1 voltou. Quiz: 36
pessoas responderam desde 23/08, 30 só num dia.

O "fica um dia e não volta" é verdadeiro, e são TRÊS vazamentos diferentes,
não um. Tratar como um só é errar o remédio.

## 2. Os três vazamentos

### Vazamento A: a apresentação, antes de qualquer valor

| plataforma | começou o onboarding | terminou | taxa |
|---|---|---|---|
| web | 184 | 41 | 22% |
| Android | 45 | 28 | 62% |
| iPhone | 9 | 9 | 100% |

Na web (anúncio) 4 em 5 desistem dentro das cinco páginas de apresentação.
Esse público sumiu hoje com o fechamento do caminho da web, então o que
sobra é a loja: no Android, 4 em 10 desistem antes do fim. Cinco páginas de
promessa, nenhuma de entrega. A pessoa instalou para resolver um problema
de carro e recebe um folheto.

### Vazamento B: o formulário do carro (o maior)

| plataforma | abriu o cadastro do carro | cadastrou | taxa |
|---|---|---|---|
| web | 13 | 8 | 62% |
| Android | 13 | 2 | 15% |
| iPhone | 6 | 1 | 17% |

**No app das lojas, 5 em 6 pessoas que abrem o formulário do carro não
terminam.** É a fricção mais cara do produto, porque sem carro não existe
calendário, saúde, aviso, nada do que faz alguém voltar. O formulário pede
marca, modelo, ano, versão ou motor, km, foto e, mais tarde, data de compra
e o quiz de saúde. Sem erro registrado em `app_erros`: ninguém quebra, todo
mundo desiste. Inferido por leitura, não provado em campo: a busca de marca
e modelo (lista da FIPE) no celular é o passo que trava; o roteiro de
aparelho da 2.4 deveria olhar isso com o cronômetro na mão.

Quem termina, termina pela metade: dos 17 carros na nuvem, 5 têm data de
compra, 5 têm o quiz de saúde, 4 têm serviço. Sem isso o card de revisões
vira pedido de dado em vez de entrega (a fricção já está no mapa).

### Vazamento C: nada puxa de volta

- **Avisos ligados em 3 de 28 contas.** O pedido de permissão só aparece
  depois de responder um quiz (36 pessoas) ou de cadastrar carro (11). Quem
  não fez nenhum dos dois nunca vê o convite, e é justamente quem sumiu.
- O quiz é a única rotina diária e vive dentro do app: puxa quem já voltou,
  não alcança quem sumiu (o mapa já diz isso desde 28/08).
- Até hoje não havia e-mail nenhum. A jornada (12/09) fecha esse buraco
  para quem tem conta: 27 pessoas. Convidado sem conta continua fora de
  alcance por qualquer canal que não seja o aviso local.
- Não existe evento de CONCLUSÃO (aula vista, sintoma consultado, serviço
  registrado com valor). "Primeiro valor" continua sem régua, como o mapa
  anota desde 28/08. Sem isso não dá para saber o que quem voltou fez.

## 3. O que fazer, em ordem de alavanca

Cada item traz o princípio (besci.md), o tamanho e o que mede. Baixo risco
vai direto; o que muda jornada vira experimento registrado antes.

### 3.1 Cadastro do carro em duas etapas (a maior alavanca)

Hoje: um formulário com sete campos. Proposta: **etapa 1 só marca, modelo e
ano**, com o botão "Salvar" ativo assim que os três existirem, e o carro já
aparece na garagem. Km, motor, foto, placa e data de compra viram uma
"etapa 2" opcional, oferecida na tela do carro como progresso ("Diagnóstico
do Gol: 2 de 5 dados"). Princípio: fricção e efeito de progresso (pedir o
micro antes do macro). Mede: `abriu_cadastro_de_carro` para `cadastrou_carro`
no Android e iPhone; hoje 3 em 19. Experimento A/B possível pela infra de
variantes (`lib/app/experimentos.ts`). Risco: baixo; reversível.

### 3.2 A primeira tela depois do carro entrega, não pede

Hoje, com carro incompleto, o Início pede o quiz de saúde e a data de
compra antes de mostrar qualquer coisa. Proposta: mostrar o calendário
ESTIMADO na hora (a régua do manual por km já existe em `planoDeRevisao.ts`,
marcada como estimativa), com uma linha honesta: "Estimado pelo km. Informe
a última troca e vira data exata". Princípio: clareza do próximo passo e
aversão à perda (o que vence, com número). Mede: pessoas que registram o
primeiro serviço nos 7 dias depois do carro (hoje 4 de 17). Baixo risco.

### 3.3 O convite de aviso na hora certa, para todo mundo

Hoje 3 de 28 contas com avisos ligados, e o convite exige quiz ou carro.
Proposta: o convite aparece **ao terminar o cadastro do carro** (a 2.4 já faz
isso, momento `carro`) e também **ao terminar o onboarding no Android**, com
um motivo concreto: "Quer que a gente avise a próxima revisão do Gol?".
Nunca na primeira tela, sempre depois de um sim pequeno (timing do pedido).
Mede: `convite_aviso` para `permissao_aviso_concedida` por origem, evento
que já existe desde 11/09. Baixo risco; é texto e momento.

### 3.4 Onboarding de três páginas, a terceira é o carro

Cinco páginas de promessa viram três: dor (uma frase e uma imagem), como
resolve (calendário e preço), e "cadastre o carro" (já é a última no
Android desde a 2.4; no iPhone ainda é o plano). A prova social inventada
sai até a real entrar (`prova-social-de-verdade`, proposto). Princípio:
fricção; prova social pequena e conferível ganha da grande e inventada
(aprendizado de 04/09). Mede: `comecou_onboarding` para
`terminou_onboarding` na loja (hoje 62% no Android). Experimento A/B:
5 páginas contra 3. Muda jornada: registrar antes, aprovação do dono.

### 3.5 O quiz cobre três manhãs e confirma na tela

Já aprovado para a 2.5 (fila em `docs/lojas/novidades-2.5.md`). É o que
transforma o quiz de rotina de quem já voltou em rotina de quem sumiu.
Mede: pessoas com quiz em 2 ou mais dias (hoje 6 de 36).

### 3.6 Um evento de conclusão

`viu_aula`, `consultou_sintoma`, `registrou_servico` (com `com_valor`).
Sem isso, nenhuma das apostas acima tem leitura de "valor consumado". É
medição, não produto, e destrava todas as outras. Uma tarde de trabalho.

## 4. Oportunidades novas de engajamento (o que ainda não existe)

Em ordem do que mais provavelmente traz gente de volta, com o custo:

1. **Resumo semanal do carro**, domingo à noite, por e-mail e push: o que
   venceu, o que vence em 30 dias, o km que falta informar, o quiz da semana.
   Um e-mail por semana com o nome do carro no assunto. Já cabe no motor da
   jornada como chave `semana`; custo pequeno. Princípio: efeito de
   progresso e aversão à perda.
2. **Km da semana em um toque.** Um card no Início, toda segunda: "Quantos km
   o Gol tem hoje?" com o número anterior pré-preenchido. É o menor
   compromisso possível e é o dado que mais destrava o calendário.
   Princípio: compromisso e consistência.
3. **Pergunta da Biela da semana** (do post do Instagram para dentro do app):
   a mesma dúvida que rende comentário no post vira card no Início com a
   resposta da Biela e o botão "perguntar sobre o meu carro". Liga o
   conteúdo que já é produzido à recorrência.
4. **Diagnóstico completo como barra de progresso** na tela do carro: 5
   dados, 5 passos, e o app diz o que ganha a cada um ("com o km, o óleo
   ganha data"). Substitui o pedido genérico de dado por uma trilha curta.
5. **Preço registrado vira comparação para todos**: quando houver 30
   observações de um tipo numa região, o e-mail e o card passam a dizer
   "na sua região, quem registrou pagou entre X e Y". O dado já é coletado
   (`precos_observados`). É o único motivo de registrar serviço que não é
   disciplina, é curiosidade.
6. **Voltar pelo link certo**: universal links (2.5) para o e-mail e o push
   abrirem o app em vez do navegador. Hoje todo clique de e-mail no celular
   cai na web.

## 5. O que NÃO fazer agora

- Mais pedidos de Premium antes do primeiro valor. O banner fixo da Home já
  aparece para quem não tem carro (fricção anotada no mapa).
- Push em massa "sentimos sua falta". Sem carro e sem dado, não há o que
  dizer; o e-mail `sumiu` já cobre quem tem conta.
- Ligar experimento de retenção sem o evento de conclusão (3.6): seria medir
  com régua quebrada, o mapa avisa desde 28/08.

## 6. A ordem que eu faria

1. Evento de conclusão (3.6) e o convite de aviso ao terminar o onboarding
   (3.3): um dia, baixo risco, direto na main.
2. Cadastro em duas etapas (3.1) como experimento A/B registrado: é a maior
   alavanca e é reversível.
3. Primeira tela que entrega (3.2) e resumo semanal (4.1): dois dias.
4. Onboarding de três páginas (3.4) como segundo experimento, depois que o
   primeiro tiver leitura.

Amostra pequena em tudo isto: 19 pessoas abriram o cadastro do carro na loja
em nove dias. Direção, não lei. A leitura de cada aposta pede duas semanas.
