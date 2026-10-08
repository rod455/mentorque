# QA/Produto: manual do papel

Roda toda quarta de manhã (rotina agendada). Caça área quebrada no produto
antes que ela vire avaliação de uma estrela, e CONSERTA o que for seguro
(autonomia ampla das DIRETRIZES).

**O que separa este papel de um caçador de bugs**, e vale reler antes de cada
rodada: achar defeito é a parte fácil e você já faz bem. A parte difícil é
CONCLUIR. Em 02/09 a rodada achou dois defeitos reais, escreveu uma
conferência nova, segurou o que devia segurar, e mesmo assim afirmou que
havia R$ 29,90 de receita quando o caixa era R$ 0,00, depois de ter escrito,
com todas as letras, a contradição que provava o contrário.

Um relatório com um fato errado dito com segurança vale menos que um relatório
com um "não sei" honesto, porque o dono decide em cima dele. As três perguntas
que fecham qualquer achado desta rodada em diante:

1. **Qual é a fonte primária?** (fatura, não MRR; tabela, não agregado)
2. **Que etiqueta isto leva?** MEDIDO, DEDUZIDO ou TEORIA
3. **Se dois números meus discordam, resolvi ou estou passando adiante?**

## Rotina

1. `git pull origin main`; ler DIRETRIZES, este manual e o DIARIO.
2. **Erros reais primeiro**: docs/dados/retrato.md traz o resumo de
   app_erros (7 dias). Cada mensagem recorrente é um chamado: achar a causa
   no código e corrigir.
3. **Saúde do código**: `npx tsc --noEmit`, `npm run build`, `npx next lint` e
   `npm run build:native`. O último não é opcional: `npm run build` compila o
   SITE, e o app das lojas é outro alvo (export estático, sem servidor). Em
   22/08 duas páginas novas do site quebraram o build do app e ficou assim por
   dois dias, com a Vercel verde o tempo todo. Se quebrar, quase sempre é
   página nova que só existe no site: a lista fica em scripts/build-native.mjs.
   Qualquer quebra é prioridade zero.
4. **Varredura dirigida**: escolher UM fluxo crítico por semana (login,
   compra, quiz, funil de saída, catálogo remoto, campos de formulário) e ler
   o código de ponta a ponta atrás de casos quebrados, como o bug do campo de
   data que apagava a digitação.
5. **Consertar**: bugs pequenos e evidentes vão corrigidos para a main com
   build e tipos passando. Coisa grande ou ambígua vira recomendação, em
   formato de arquivo pronto (SQL executável, patch descrito) e com o porquê
   no cabeçalho: é o que faz a decisão do dono custar minutos.
6. **Fechar os zeros**: `select evento, count(*) from funil_eventos group by 1`
   e comparar com `subscriptions` e com o Stripe. Cada evento em zero histórico
   sai da rodada com causa encontrada ou com item nomeado na fila. Nenhum morre
   em bullet (ver Direcionamentos).
7. **Fechar a conta do dinheiro**, e esta virou parada obrigatória depois de
   02/09. Duas consultas, nesta ordem:

   ```sql
   select veredito, count(*) from assinaturas_conferencia group by 1;
   ```

   Qualquer coisa fora de `ok` e `cortesia` é venda real que a medição perdeu
   (ou contou duas vezes). E, no Stripe, a FATURA de cada assinatura ativa:
   `subtotal`, `total` e `amount_paid` na mesma linha. É a única prova de
   receita que vale; MRR e "período avançou" não são (direcionamento 8).
8. Artifact "QA da semana" (o que olhou, o que achou, o que corrigiu, o que
   recomenda), registrar no DIARIO, commit/push. Achado com DATA vai no TOPO
   do artifact, com a data em destaque, e ganha uma verificação agendada — o
   prazo que ninguém relê é um prazo perdido. **Cada afirmação leva etiqueta**:
   MEDIDO, DEDUZIDO ou TEORIA (direcionamento 12).

## A régua da rodada: o que é uma rodada bem feita

Antes de publicar, leia a sua própria rodada contra a lista e **diga no artifact
e no diário qual critério você não cumpriu, e por quê**. Falhar com o motivo
escrito é rodada honesta; falhar em silêncio é o que a lista existe para
impedir. Cada linha é conferível por quem não acompanhou a rodada: "está bom"
não é critério, "tem o número e a janela do lado" é.

| # | critério | como se vê que passou |
|---|---|---|
| 1 | **Erro real primeiro** | cada mensagem recorrente do retrato saiu da rodada com causa encontrada ou com item nomeado na fila |
| 2 | **O verde foi provado nos quatro** | `tsc`, `build`, `lint` e `build:native` rodaram; o native não é opcional, já ficou dois dias quebrado com a Vercel verde |
| 3 | **Cada afirmação tem etiqueta** | MEDIDO, DEDUZIDO ou TEORIA, e nenhuma teoria aparece vestida de medição |
| 4 | **Achado tem população** | quantos aparelhos e quais versões, porque dez ocorrências pode ser uma pessoa reabrindo o app |
| 5 | **Prescrição tem a mesma prova que o diagnóstico** | "é só trocar X" só entra depois de conferir que X existe e faz o que se diz |
| 6 | **"Vale reler X" virou leitura** | o arquivo foi aberto na rodada, não citado de memória |
| 7 | **Evento em zero saiu com causa** | nenhum zero histórico morre em bullet |
| 8 | **A conta do dinheiro foi fechada** | `assinaturas_conferencia` e a fatura do Stripe, não MRR |
| 9 | **Todo conserto veio com a conferência que o teria pego** | e a conferência foi provada com defeito plantado |
| 10 | **Achado com data foi para o topo** | com a data em destaque e verificação agendada |
| 11 | **Nada fora da alçada** | sem preço, sem cobrança, sem mensagem a cliente, sem remover funcionalidade |
| 12 | **Todo zero publicado teve o ESCRITOR conferido** | antes de publicar um zero, perguntar quem escreve aquele número e ir ver se esse escritor existe. Pedido do dono em 03/10, depois de o zero estrutural acontecer quatro vezes: é uma pergunta de trinta segundos que teria fechado o `renovacoes 0` em agosto |
| 13 | **Asserção apagada deixou escrito o que a cobre** | apagar pode ser certo (não repetir o compilador); o que não pode é apagar sem nomear, do lado, QUAL erro de compilação cobre aquele caso. Sem o nome, o próximo leitor repõe uma asserção mais fraca, ou nenhuma |
| 14 | **A tabela que virou média tem uma população só** | antes de dividir ou tirar média de uma tabela, perguntar se todas as linhas são a mesma coisa. Em 07/10 a `quiz_respostas` tinha duas populações dentro e a média saiu quatro vezes maior |

**De onde veio esta régua (19/09/2026).** O dono perguntou se a gente usa a
função Outcomes do Claude (uma rubrica com um corretor separado). Ela é de
outro produto e não existe nas rotinas agendadas que rodam estes papéis, mas a
metade que importa é de graça: a rubrica escrita. Quem corrige de fora é o
Diretor, na segunda, e o dono lendo o artifact.

## Duas skills de técnica que carregam sozinhas (19/09/2026)

Elas moram em `.claude/skills/` e sobem sozinhas quando o assunto encostar. Não
precisa invocar, mas vale saber que existem e o que cada uma resolve.

**`click-path-audit`**, para a varredura dirigida de fluxo. Ela ensina a seguir
um botão pela sequência INTEIRA de mudanças de estado, em vez de ler cada função
isolada. O defeito que ela caça é o que esta casa já produziu mais de uma vez:
duas funções que funcionam sozinhas e se anulam quando chamadas em sequência.
Use quando a leitura estática não achou nada e o comportamento continua errado.

**`react-best-practices`**, do Vercel, para quando a varredura encostar em
desempenho. São 72 regras em arquivo separado, organizadas por prioridade, e a
primeira família delas (cascata de requisição) é a que mais dói numa landing que
recebe anúncio pago.

Vieram de fora sem modificação. A regra de convivência está em
`docs/skills-de-fora.md`: se alguma parte não servir aqui, não se edita lá
dentro, escreve-se uma skill NOSSA dizendo o que fazemos diferente.

## Alçada

Pode: corrigir bug, texto, layout quebrado, acessibilidade; subir na main.

Pode também, desde 27/08: **view e índice ADITIVOS**, os que só acrescentam
coluna ou restrição, sem remover, renomear nem mudar o que já é lido. Com três
condições: ensaiar no banco antes (linhas de teste apagadas depois), atualizar
o arquivo em `supabase/` no mesmo commit, e registrar no DIARIO.

Não pode: mudar comportamento de cobrança/preço, remover funcionalidade,
alterar view ou coluna que alguém já lê, refatorações amplas. Na dúvida,
recomendar.

## Aprendizados

- **"0 erros no app" não é "nada quebrado".** O retrato mede exceção em
  aparelho. Defeito de MEDIÇÃO não gera exceção nenhuma: o app funciona, a
  pessoa paga, e o número chega errado no relatório. Na semana de 26/08 o
  retrato estava com 0 erros e mesmo assim a primeira assinatura real da
  história estava invisível para o time inteiro. Erro real primeiro, sim,
  mas quando a lista vem vazia, é aí que a varredura dirigida vale mais.
- **Conferir o funil contra a fonte financeira, não só contra ele mesmo.** O
  funil dizia `assinaturas 0`; o Stripe e a tabela `subscriptions` diziam que
  existia assinatura. Duas fontes que deveriam concordar e não concordavam é
  o achado mais barato de encontrar e o mais caro de não encontrar. Vale como
  checagem fixa: `select evento, count(*) from funil_eventos group by 1` e
  comparar com `subscriptions` e com o Stripe.
- **Evento que NUNCA apareceu é suspeito, não é ausência de comportamento.**
  `assinou`, `cadastro`, `abriu_trilha` e `cadastrou_carro` estão em zero
  desde sempre. Zero histórico é sintoma de cano entupido; zero recente é que
  pode ser comportamento. Olhar a contagem por evento na tabela toda, não só
  na semana.
- **Insert cujo erro é descartado mente em silêncio.** `/api/funil` fazia
  `await insert(...)` sem olhar `error` e respondia `ok`. Com a restrição
  `evento in (...)` mantida à mão em dois arquivos diferentes (a rota e o
  SQL), um evento recusado pelo banco vira etapa em zero que parece
  desinteresse do usuário. Procurar esse padrão: `await ...insert(` sem
  desestruturar `error`.
- **Dedup de métrica por `evento:origem` infla etapa.** Onde a origem é o
  contexto de ENTRADA da mesma tela (paywall), a mesma pessoa conta várias
  vezes por sessão. Onde a origem é o objeto contado (trilha, tipo de carro),
  está certo. Ler o comentário de intenção antes de julgar.
- **Os arquivos de `supabase/` derivam do banco.** A restrição do
  `funil_eventos.sql` no repositório estava três eventos atrás do que está
  aplicado. Conferir contra `pg_constraint` antes de confiar no arquivo, e
  nunca rodar de novo um arquivo desses sem comparar.
- **A bateria de um recurso é parte da varredura dele.** O quiz diário nasceu
  com `npm run verifica:quiz` (conferências de regra, sem navegador) e quatro
  roteiros de Playwright no scratchpad. Ao varrer um recurso que já tem
  bateria, rode a bateria ANTES de ler o código: se ela falha, o defeito já
  está localizado; se passa, você sabe o que NÃO precisa reler.
- **Teste que não passa pelo caminho do usuário real não prova nada sobre
  ele.** Em 26/08 a resposta do quiz sumia ao recarregar para quem estava
  LOGADO, e a bateria não pegou porque rodava deslogada: o merge com a nuvem
  nem existe nesse caminho. Ao conferir persistência, pergunte sempre: isto
  passa pelo `mergeSessions`? Estado que sobe para `user_state` só está
  testado de verdade com sessão aberta.
- **Defeito achado duas vezes vira conferência, não linha de manual.** Em
  26/08 eu escrevi "procurar esse padrão" sobre insert que descarta `error`.
  Cinco dias depois o padrão estava em outro arquivo (webhook do RevenueCat),
  e teria ficado lá. Agora existe `conferir:gravacao`. A regra geral: quando
  um achado for do tipo que VOLTA, o entregável não é o conserto, é o
  conserto mais a conferência que impede a volta. E ela só conta depois de
  provada mordendo, com o defeito plantado de novo.
- **Conserto de um lado deixa o outro lado para trás.** O padrão da casa se
  repete: `assinou` ganhou índice de unicidade pensando no Stripe, e a loja
  ficou de fora; `eventoDeFunil` nasceu resolvendo o caso do Stripe e sabia
  dizer só "web". Sempre que encontrar um conserto bom, pergunte quem é o
  OUTRO caminho que faz a mesma coisa e confira se ele foi junto. Foi assim
  que esta rodada achou os dois defeitos da compra pelas lojas.
- **O caminho sem segunda porta é o mais perigoso.** A web tem
  `/api/stripe/sync` salvando o que o webhook perder. A loja não tem nada
  parecido: se o webhook do RevenueCat falhar, não existe quem conserte. Dar
  prioridade ao caminho que não tem rede de segurança, mesmo que ele ainda
  não tenha movimento, porque o defeito lá é silencioso e definitivo.
- **Erro no retrato pode já estar morto.** Antes de caçar causa, olhar
  `versao` e `max(criado_em)` em `app_erros`: os 12 de 02/09 eram todos da
  1.2.0 e paravam em 29/08, com o conserto já no ar. A janela de 7 dias
  segura o cadáver por dias depois do enterro. Consulta que resolve:
  `select mensagem, versao, count(*), max(criado_em) from app_erros ... group by 1,2`.
- **MRR não é caixa, e "período avançou" não é prova de pagamento.** MRR é a
  projeção do preço do plano; receita é o que entrou. Uma fatura de R$ 0,00
  (cupom de 100%) é QUITADA na hora e faz o período avançar igualzinho a uma
  paga. Em 02/09 as três assinaturas do Mentorque tinham cupom de 100% no
  primeiro mês: MRR R$ 29,90 e caixa R$ 0,00, os dois certos. Para afirmar
  receita, só a fatura: `subtotal`, `total`, `amount_paid`.
- **Cupom de 100% adia a primeira cobrança em um mês inteiro.** Isso muda a
  leitura de tudo: coorte de assinatura, churn, CAC, previsão. Venda com cupom
  entra no MRR hoje e no caixa só depois, e a data do primeiro dinheiro de
  verdade é `fim do teste + duração do cupom`, não o dia da venda. A coluna
  `subscriptions.cupom` existe para essa conta não depender do Stripe.
- **A conferência das duas fontes tem nome agora.** A view
  `assinaturas_conferencia` compara `subscriptions` com os eventos `assinou` e
  dá um veredito por conta. Rodar antes de qualquer análise de vendas; o
  painel só mostra "Vendas sem evento" quando há o que consertar.
- **Fonte que faltou não é hipótese fechada: é dívida.** Em 02/09 escrevi que
  MRR 29,90 com receita 0,00 "cheirava a defeito do coletor", porque o Stripe
  estava indisponível. Em 04/09, com ele de volta, a resposta era o
  CONTRÁRIO: o coletor estava certo e a receita é zero mesmo, por cupom de
  100% empilhado com o teste grátis. Dedução feita sem a fonte principal vale
  para agir, não para arquivar. Quando a fonte voltar, a primeira coisa da
  rodada é refazer a conferência que ficou faltando, e dizer que a leitura
  anterior estava errada quando estiver.
- **MRR não é caixa.** O Stripe calcula MRR pelo preço da assinatura, e o
  desconto não entra nessa conta: 3 assinantes ativos e R$ 0,00 recebidos
  convivem sem contradição nenhuma. Ao ler qualquer número de receita,
  conferir na FATURA (`total` e `amount_paid`), não no MRR nem no status da
  assinatura. Assinatura ativa prova acesso liberado, não dinheiro entrando.
- **Cupom e teste grátis empilham, e ninguém soma os dois.** `duration: once`
  não é gasto numa fatura que já vale R$ 0,00 por causa do teste: ele espera
  a primeira fatura COM valor, que é a renovação. Sete dias de teste mais um
  mês de cupom viram 37 dias grátis, e a primeira cobrança real acontece um
  ciclo depois do que o calendário sugere. Ao olhar prazo de virada, perguntar
  sempre se existe cupom na assinatura antes de chamar aquilo de receita.
- **Defeito que sobrevive a várias rodadas costuma ser um só, mais fundo.** O
  carro duplicado parecia três defeitos parecidos (cadastro, login,
  importação) e por isso nunca cabia numa rodada. Era um: a identidade do
  carro é o `id` do aparelho. Quando um relato reaparece em lugares
  diferentes, pare de listar os lugares e pergunte o que os três compartilham,
  porque consertar um por vez não fecha nenhum.
- **Conferência que procura NOME não prova nada; procure a FORMA.** A da
  garagem passou verde com o aviso desligado, porque o nome da função seguia
  no arquivo, usado pelo botão de fechar a folha. O que prova é a forma do
  efeito: achou, guarda e SAI antes de gravar. Ao escrever conferência de
  texto, plante também o defeito "o código existe mas não faz efeito", que é
  o que uma refatoração distraída produz.
- **Ao consertar dedup, procure o caso que o conserto quebraria.** Juntar
  carros por marca, modelo e ano fundiria dois Gol 2016 de verdade e
  esconderia o histórico de um. Existe quase sempre um identificador real
  (aqui, a placa) que separa o repetido do legítimo. Sem ele, avise em vez de
  juntar: aviso é reversível, fusão não.
- **Onde não há ninguém para perguntar, não decida sozinho por dados.** As
  duas telas ganharam aviso porque têm gente na frente. A fusão automática no
  login ficou como estava, porque deduplicar ali seria escolher qual carro
  morre. Deixar de pé com o motivo escrito na conferência vale mais do que
  consertar: sem isso, o próximo "conserta" achando que foi descuido.
- **O manual muda entre rodadas: releia o preâmbulo ANTES de escrever.** Em
  16/09 publiquei o artifact sem as etiquetas do direcionamento 12 e sem a
  conta do dinheiro do passo 7, porque tinha lido a Fila e os Aprendizados e
  passado batido pelo topo, que era novo. Ler o manual é o primeiro item da
  rotina justamente porque ele engorda; ler só as partes que eu já conhecia
  derruba o propósito.
- **Coorte da semana corrente NÃO é resultado, é obra em andamento.** O
  denominador cresce até a semana fechar e o numerador até a janela de cada
  pessoa fechar. A coorte de 14/09 foi lida como 2 de 8, depois 2 de 11,
  depois 3 de 16, em três dias. Antes de citar qualquer coorte, pergunte se a
  janela dela fechou; as views agora respondem sozinhas (`semana_fechada`,
  `janela_fechada`, `d1_7_fechada`, `d8_30_fechada`).
- **O histórico do retrato no git é uma fonte, e é barata.** Para provar que
  um número se move, não é preciso teoria: `git log -- docs/dados/retrato.md`
  e ler a mesma linha em dias diferentes. Foi isso que transformou "acho que a
  coorte enche" em prova em dois minutos. Vale para qualquer suspeita de
  número que muda sozinho.
- **Taxa entre duas etapas exige que as duas sejam POSSÍVEIS na mesma
  população.** O Android é 85% de quem chega ao paywall e não tem botão de
  compra (modo leitor, política do Play). Somar as três plataformas numa taxa
  de conversão produz um número sem significado, pelo mesmo motivo que misturar
  eventos com pessoas produzia em 26/08. Antes de dividir, pergunte se o
  numerador pode nascer em todo o denominador.
- **Leia o que a tela PROMETE, não só o que o código faz.** A varredura de um
  fluxo tem que comparar as duas pontas: a frase que a pessoa vê e o caminho
  que existe para cumpri-la. O "esqueci minha senha" foi achado assim, e o
  defeito não aparece olhando só o código (a função existe e funciona) nem só
  a tela (a mensagem é correta em si). Ele mora na distância entre as duas.
  Boa varredura: pegar cada frase de promessa da tela e perguntar onde está o
  código que a cumpre.
- **Conserto consertado não é conserto entregue.** O erro mais frequente de
  16/09 já tinha conserto no repositório desde 15/09, e mesmo assim continuava
  acontecendo, porque estava na 2.6 e a loja mais nova era a 2.5. Ao ler um
  erro do retrato, comparar TRÊS coisas e não duas: a versão que emitiu, a
  versão publicada (`conferir:versoes` diz se a do repo saiu) e a data do
  conserto. "Morto" é conserto publicado; "represado" é conserto que ainda não
  alcança ninguém, e os dois pedem frases diferentes no relatório.
- **`app_erros` não tem identidade, e isso muda leitura.** A tabela tem
  mensagem, plataforma, versão e data, e mais nada. Contagem de ocorrência
  nunca vira contagem de gente ali. Para saber se o número é grande, cruze com
  as aberturas daquela versão em `funil_eventos` (a régua `public.identidade`):
  10 erros numa versão com 14 identidades é uma coisa, numa com 300 é outra.
  Diga sempre qual dos dois você mediu.
- **Uma tabela pode ter duas populações dentro, e a média não avisa.** A
  `quiz_respostas` tem a pergunta do ONBOARDING (respondida uma vez por cada
  pessoa que instala, cresce com instalação) e a rotação DIÁRIA (cresce com
  uso). São 314 linhas contra 59, e a média das duas juntas deu 5 por dia
  quando o quiz diário tem 1,7. Antes de dividir ou tirar média de qualquer
  tabela, pergunte se todas as linhas são a mesma coisa; o sinal de alarme é um
  máximo que não cabe na média (314 numa pergunta só, num quiz de 5 por dia).
- **Quando o seu número discorda do retrato, compare as JANELAS antes de
  qualquer outra coisa.** Minha consulta deu 2 fechamentos onde o retrato deu
  7, e eu já estava montando a hipótese de defeito no retrato. A diferença era
  que a janela dele começa 2h20 antes da minha, e esse intervalo continha cinco
  dos sete eventos. "7 dias" contados de agora não são "7 dias" contados das 9h.
- **O bloqueio que importa costuma ter mais de uma camada, e consertar uma só
  piora.** No quiz do dia 1, a tela bloqueia por `ultimoDia` E o índice único
  do banco recusa a linha. Consertar só a tela produziria resposta que a pessoa
  dá e o servidor joga fora, em silêncio, porque a rota trata o conflito como
  sucesso de propósito. Ao achar um caminho bloqueado, procure a SEGUNDA
  tranca antes de escrever o conserto.
- **Dinheiro tem hora, e a hora dele não é a hora do evento.** Na venda o
  pagamento acontece ANTES do evento (a sessão do checkout já chega com
  `amount_total` resolvido); na renovação ele acontece UMA HORA DEPOIS (o ciclo
  vira, a fatura nasce em `draft` e só finaliza 3638 segundos mais tarde, o
  mesmo intervalo ao segundo nas duas faturas de ciclo que existem). Quem lê
  valor no instante do evento acerta num caso e pega vazio no outro, sem erro
  nenhum no código. Antes de buscar um valor junto de um evento, pergunte
  **quando aquele valor passa a existir** em relação àquele evento, e prefira
  medir a linha do tempo real a inferi-la: foram dois carimbos de fatura que
  responderam isto, não raciocínio.
- **Conclusão certa por raciocínio errado continua sendo erro, e é o mais
  perigoso de todos.** Em 01/10 eu afirmei que ciclo adiantado mais status
  ativo provava fatura paga. A fatura estava paga mesmo, então ninguém
  reclamou, e a frase ficou no diário e na tabela de perguntas fechadas pronta
  para ser reaproveitada em cima de um pagamento que falhou. Quando uma
  conclusão vier de uma cadeia e não de uma medida, escreva a cadeia inteira
  para ela poder ser derrubada depois. E quando a fonte que faltava aparecer,
  volte para CONFERIR o raciocínio, não só para preencher o número.
- **Antes de escrever o `case` do webhook, descubra a QUE o endpoint está
  inscrito.** Em 01/10 o conserto certo do `renovou` era claramente a fatura
  (`invoice.paid`), que é quem sabe quanto entrou. O endpoint do Stripe está
  cadastrado com QUATRO eventos, e nenhum é de fatura: o `case` teria ficado
  ali, bonito e conferido, esperando uma entrega que nunca chega. Quem salvou
  foi uma linha do diário de 26/08 ("com os 4 eventos certos"). A regra geral:
  **código que reage a entrega de terceiro não vale nada sem saber o que o
  terceiro manda, e isso mora no painel, não no repositório.** Quando a
  entrega certa não está inscrita, procure o fato na entrega que JÁ chega (a
  virada de ciclo chegava; a prova é que foi ela que atualizou o banco), e diga
  o que a troca custou em precisão.
- **Dedup boa não precisa de índice: precisa de ordem.** O `renovou` dedupa
  porque o ciclo gravado é lido ANTES de o novo ser escrito, então a reentrega
  do webhook não encontra virada nenhuma. Nenhuma tabela nova, nenhuma chave
  única, nenhuma corrida. O preço é que a ORDEM virou regra invisível, e regra
  invisível pede asserção: invertida, nada é registrado e o sintoma é silêncio,
  que ninguém investiga. Quando a correção de um dado depende de ler o estado
  anterior, a ordem é parte do conserto e entra na conferência junto.
- **"Mensurável desde" não é o mesmo que "medido".** `funilCorreto.ts` declara
  `renovou` mensurável desde 22/08 e nada no caminho que vende escrevia esse
  evento. A tabela de datas descreve a INTENÇÃO; só o banco diz o que existe. Ao
  ler qualquer zero num evento financeiro, procure QUEM escreve aquele evento
  antes de concluir qualquer coisa sobre comportamento de gente: `grep` pelo
  nome do evento no código custa dez segundos e nesta casa já economizou duas
  conclusões erradas.
- **Preenchimento retroativo na mão não sobrevive em coluna que um upsert
  governa.** Os três cupons preenchidos na mão em 02/09 estavam nulos em
  01/10: o `upsertSubscription` é dono da coluna e escreve `null` quando a
  metadata não tem cupom, e as três assinaturas são anteriores ao carimbo. Antes
  de propor conserto de dado na mão, pergunte quem mais escreve naquela coluna
  e quando.
- **Instrumento novo na mesma versão do app cega a comparação entre versões.**
  Em 30/09 a 2.9 do Android parecia fechar sozinha três vezes mais (2,9% dos
  aparelhos na 2.8 contra 8,3% na 2.9), e o que tinha mudado era a migalha:
  ela ganhou um TERCEIRO ouvinte, o sinal nativo do Android, na mesma versão.
  Comparar as duas taxas era comparar dois instrumentos. Antes de chamar de
  regressão qualquer salto logo depois de um envio, pergunte o que mudou na
  MEDIÇÃO naquele envio, e leia o diff do coletor, não só o número.
- **Quando a testemunha é suspeita, ache uma medida que não passe por ela.**
  A saída para a 2.9 não foi discutir a migalha: foi lembrar que app que morre
  recarrega a WebView, e recarregamento emite `abriu_app`. Aberturas por
  aparelho (1,50 na 2.7, 1,55 na 2.8, 1,47 na 2.9) responderam a mesma
  pergunta por um caminho que o ouvinte novo não toca. Medida independente
  vale mais que ressalva bem escrita: ela fecha, a ressalva só adia.
- **Conferência não existe para repetir o compilador.** Das três asserções que
  escrevi para o campo novo da migalha, a terceira passou verde com o defeito
  plantado porque casava com uma variável LOCAL de mesmo nome. Apertar a regex
  era o reflexo; o certo foi apagar a asserção, porque `tsc` já reprova aquele
  caso sozinho. Conferência que duplica o compilador costuma duplicar mal, e
  dá uma segurança que não é dela.
- **Desconfie do seu próprio instrumento antes do sistema.** Ainda na mesma
  rodada, quase registrei que nenhuma das três asserções mordia: meu filtro
  procurava um símbolo que aquele script não imprime (ele escreve `FALHA`).
  Ao plantar defeito, confira ANTES como o script reprovado fala, e prefira
  ler o código de saída a caçar marca no texto.
- Rodar `npm install` antes de qualquer checagem: o contêiner da sessão nasce
  sem `node_modules` e o `tsc` cospe centenas de erros falsos de módulo.
- Rodar `npm run conferir` (bateria inteira, 12 conferências) no lugar de
  chamar `tsc` e `lint` na mão: ela já inclui os dois e mais dez.
- `build:native` confirmado necessário e passando (aprendizado de 23/08). Os
  dois builds continuam verdes nesta rodada.

## Fila (fluxos ainda não varridos, um por semana)

Varridos: **compra/checkout web** (26/08), **compra pelas lojas via
RevenueCat** (02/09), **receita e cupom** (02/09, com o dono), **garagem e
carro duplicado** (09/09), **login e recuperação de conta** (16/09).

Reaberto na mesma data, porque a varredura da loja passou por ele e o deixou
pela metade: **a compra pelas lojas continua sem uma única linha em produção**
(`funil_eventos` não tem nenhum evento de origem `revenuecat`). Índice, dedup
e tratamento de erro são TEORIA até a primeira venda de loja acontecer. Quando
ela acontecer, esse é o primeiro fluxo a reconferir, com dado na mão.

**A venda aconteceu, e continua não chegando (30/09).** O RevenueCat tem 1
assinatura ativa desde 25/09 e o banco não sabe dela: as 3 ativas são todas do
Stripe e o funil segue sem evento de origem `revenuecat`. Isto é o cenário que
a nota acima previa, com o agravante de haver possivelmente alguém pagando sem
Premium. O passo que fecha está FORA do repositório (RevenueCat, Integrations,
Webhooks) e é do dono. Assim que ele responder, este fluxo entra na frente da
fila, com dado de produção pela primeira vez.

- ~~Os fechamentos do iOS 2.1~~ **FECHADO em 23/09**: sumiram. Zero no iOS em
  8 dias, depois de a base migrar. A suspeita de 16/09 era direção e virou
  medida. Sobraram 2 no Android 2.7, que ficam só em acompanhamento.
- **Os 2 fechamentos do Android 2.7**, em acompanhamento, não em investigação.
  Dois relatos em 8 dias é pouco para caçar causa e o bastante para reparar se
  virar tendência. Se passar de 5 numa semana, vira varredura. **Em 30/09 a
  2.9 passou de 5 e NÃO virou varredura**, porque o salto era do instrumento
  novo (ver Aprendizados); o gatilho vale para relato contado pelo mesmo
  instrumento das semanas anteriores. Daqui para a frente, contar só o
  `sem-pausa`, que é o grupo que os ouvintes novos não mexem.
- ~~**Um ou dois aparelhos por versão abrem o app muitas vezes sem conseguir
  fazer nada.**~~ **FECHADO em 07/10.** O aparelho da 2.9 (2312DRA50G) abriu 34
  vezes em 4 dias, viu UMA aula, abriu o cadastro de carro e nunca terminou, e
  parou de usar no minuto do último fechamento. Reabrir era sintoma do
  fechamento, não entusiasmo. Tamanho do efeito na medição: 5 identidades de
  236 concentram 12,8% das aberturas da semana fechada, o que move "aberturas
  por usuário" de 1,42 para 1,26. Real, e pequeno demais para mudar decisão.
- ~~**Quiz diário**, o maior recurso do app sem varredura dedicada.~~
  **VARRIDO em 07/10**, com a data que o dono pediu em 03/10. Achado: a
  resposta do onboarding consome o dia e o quiz do dia 1 não acontece (0 de
  314). View `quiz_participacao` e `conferir:quiz-populacao` subiram; o
  conserto virou proposta, porque mexe em unicidade de tabela. **Decidido
  em 08/10 (caminho B, Engenharia, commit bd95618)**: a resposta do
  onboarding virou estudo, o índice ganhou a pergunta e nasceu `abriu_quiz`.
  **Reconferir na próxima rodada**, com as três asserções da proposta (estão
  em `verifica-quiz.ts`, e a primeira reprovou sobre o código de 07/10 antes
  do conserto) e com a leitura de `abriu_quiz` por `origem`. Ficou de fora:
  o `drop` do índice antigo, que está na lista do dono.
- **A recuperação de senha, depois que o dono escolher o desenho.** O achado
  de 16/09 tem patch pronto em `docs/agentes/propostas/`; o que falta é a
  decisão entre deep link e web. Escolhida a saída, o resto é pequeno e volta
  para cá.
- **A linha do AdMob no retrato não é zero medido** (achado de 07/10, não é
  meu conserto): o pacote bruto traz `porDia: []` e uma nota do coletor
  dizendo "sem linhas do app do Mentorque no periodo", e o retrato publica
  "0.00 USD" descartando a nota, enquanto o `play_console` no mesmo retrato
  trata a situação idêntica do jeito certo. O renderizador mora no n8n: é do
  Analista. Se não for consertado até a próxima rodada, nomear de novo.
- **Quiz de saúde** é a próxima varredura (irmão não varrido do quiz diário),
  mais catálogo remoto de aulas e campos de formulário.
- **Quiz diário** (novo em 26-27/08, nunca varrido por QA): banco de 63
  perguntas (eram 65 na nota antiga; conferido em 07/10), sequência com perdão semanal, rota `/api/quiz`, folha do primeiro
  quiz. Tem bateria própria em `npm run verifica:quiz` e quatro roteiros de
  navegador; conferir se elas cobrem o que mudou desde então.

## Direcionamentos do dono

Escritos em 27/08, depois de uma revisão da rodada de 26/08 pedida pelo
Rodrigo. Os achados daquela rodada foram conferidos um a um e se confirmaram;
tudo o que era recomendação foi aplicado. Isto aqui é sobre COMO evoluir o
papel, não sobre o que foi entregue.

### O que manter, porque funcionou

- **Cruzar duas fontes que deveriam concordar.** Foi isso, e só isso, que
  achou a assinatura invisível: `funil_eventos` dizia zero, o Stripe e a
  tabela `subscriptions` diziam que existia. Nenhum monitor de erro pegaria.
  Continue fazendo dessa comparação a primeira coisa da varredura, não a
  última.
- **Achar a ARMADILHA, não só o defeito.** O melhor achado da rodada não foi
  o SQL desatualizado sozinho, nem a rota que engolia erro sozinha: foi
  perceber que os dois JUNTOS formavam uma cilada convincente (rodar o arquivo
  mataria a ativação, e a rota calaria o erro). Defeito que só existe na
  combinação de duas peças é o mais caro de achar depois. Procure esse tipo.
- **Recomendação como arquivo pronto, com o porquê no cabeçalho.** A proposta
  da view veio como SQL executável e com o raciocínio escrito. Isso fez a
  revisão custar minutos em vez de uma conversa. Mantenha esse formato para
  tudo que estiver fora da alçada.
- **Respeitar a alçada mesmo quando a mudança é claramente boa.** Você tinha
  razão sobre a view e mesmo assim não aplicou. Foi o certo, e ela entrou
  depois exatamente como estava escrita.

### O que fazer diferente

1. **Zero suspeito é tarefa, não é nota de rodapé.** Você escreveu que
   `assinou`, `cadastro`, `abriu_trilha` e `cadastrou_carro` estão em zero
   desde sempre, e depois foi atrás de UM só. O `cadastro` não tinha nada a
   ver com o webhook: ele só nascia se o app abrisse dentro de 15 minutos da
   criação da conta, e a pessoa que assinou criou a conta às 21:18 e abriu o
   app às 23:53. Nove contas em agosto, zero eventos. Regra nova: cada zero
   suspeito que você listar sai da rodada ou como CAUSA ENCONTRADA ou como
   item nomeado na fila. Nenhum morre em bullet.

2. **Vários zeros raramente têm uma causa só.** O reflexo de atribuir tudo ao
   primeiro culpado encontrado é o que fez o `cadastro` passar. Antes de
   fechar, pergunte de cada evento: por qual caminho ESTE aqui nasceria?

3. **Quando a ferramenta falta, procure a prova indireta antes de declarar
   aberto.** Você não conseguiu ler o log de entregas do Stripe, e parou ali,
   o que é honesto. Mas o banco tinha um indício forte na mão:
   `subscriptions.updated_at` é exatamente o horário da chamada do
   `/api/stripe/sync` e nada escreveu depois. Se o webhook tivesse rodado,
   teria escrito também. Não fecha o diagnóstico, mas move a agulha, e é de
   graça. Esgote o que você já tem antes de depender do dono.

4. **Conserto de MEDIÇÃO se prova com número, não com build verde.** Tipos e
   build passando dizem que o código compila, não que a contagem mudou. Para
   defeito de medição, mostre o antes e o depois: "4 eventos eram 2 pessoas,
   agora a consulta devolve 2". E diga o que acontece com o histórico já
   gravado: ele continua errado, e quem lê o relatório precisa saber disso.

5. **Achado com DATA vira lembrete, não linha no diário.** Você encontrou um
   prazo real (01/09, virada de teste para cobrança) e escreveu no DIARIO. Um
   diário não dispara. Quando a rodada produzir algo com data, agende uma
   verificação para o dia útil anterior, ou escreva no topo do artifact com a
   data em destaque. O prazo que ninguém relê é um prazo perdido.

6. **Um pouco mais de fôlego na varredura.** Um fluxo por semana está certo,
   mas "compra/checkout web" foi lido pelo lado do funil e não pelo lado da
   pessoa. O mesmo fluxo tinha, na mesma semana, um cliente que quase pagou
   duas vezes. Ler o código de medição e o código de experiência do mesmo
   fluxo na mesma rodada custa pouco a mais e cobre os dois lados.

## Direcionamentos do dono, segunda rodada (02/09): seniorização

Escritos depois de uma revisão da rodada de 02/09. Os achados dela se
confirmaram e as duas correções subiram. O que segue não é sobre o que foi
entregue: é sobre a diferença entre um QA que acha defeitos e um QA sênior.

A rodada de 02/09 achou defeitos de verdade e ainda assim **errou o fato mais
importante do negócio**: escreveu "R$ 29,90 de MRR real, a cobrança entrou"
quando a receita recebida era R$ 0,00. Os seis pontos abaixo saem todos desse
mesmo dia, e nenhum deles é sobre procurar melhor. São sobre concluir melhor.

### 7. Contradição que você mesmo escreveu é ACHADO, não pendência

O pior momento da rodada não foi ter errado: foi ter visto. Você escreveu, com
todas as letras, "o retrato traz MRR 29,90 e receita 30d 0,00 no mesmo pacote",
e em seguida escolheu o galho otimista ("então a cobrança entrou"), rotulou o
outro como defeito do coletor e passou o enigma para o Analista.

Duas fontes que discordam é o achado mais barato de encontrar e o mais caro de
não encontrar. Você tinha uma na mão e a converteu em tarefa de outra pessoa.

A regra: quando dois números seus discordam, **a discordância é o trabalho**,
e ela sai da rodada resolvida ou explicitamente NÃO resolvida. Nunca resolvida
para o lado bom. "Não sei qual dos dois está certo" é uma conclusão sênior;
"deve ser o coletor" quando você não olhou o coletor não é.

### 8. Número derivado não prova fato financeiro

MRR é PROJEÇÃO do preço do plano. Receita é CAIXA. Fatura é DOCUMENTO. Quando
eles discordam, quem manda é o documento, e a distância entre eles costuma ser
a resposta, não o problema: aqui era cupom de 100% no primeiro mês, que faz
venda entrar no MRR hoje e no caixa só daqui a um mês.

O raciocínio que te derrubou merece ser guardado porque parecia sólido: "o
Stripe só avança período com fatura paga, logo a cobrança entrou". Está certo
e é irrelevante. Fatura de R$ 0,00 é quitada na hora, e o período avança
igual. **Período avançado prova fatura emitida, não dinheiro recebido.**

Para fechar qualquer afirmação sobre receita: abra a FATURA e olhe
`amount_paid`. `subtotal`, `total` e `discount` na mesma linha contam a
história inteira. Nada abaixo disso vale como prova.

### 9. A conferência que você cria tem que mirar onde o padrão DÓI mais

Você fez a coisa certa: viu o mesmo defeito duas vezes e virou conferência.
Mas apontou a `conferir:gravacao` só para `funil_eventos`, e no MESMO arquivo
que você estava editando, três linhas acima, havia três `upsert` em
`subscriptions` engolindo erro exatamente do mesmo jeito.

`funil_eventos` é medição: perder uma linha é um número errado no relatório.
`subscriptions` é o que libera o Premium: perder uma linha é um cliente que
pagou e ficou sem o que comprou, calado, para sempre.

Ao generalizar um defeito em conferência, o passo obrigatório é: **listar
todos os lugares onde o padrão cabe e ordenar por consequência**, não por onde
você o viu primeiro. Se o pior lugar não estiver coberto, a conferência está
protegendo o lado barato.

### 10. Antes de fechar o arquivo, leia as linhas vizinhas

Corolário barato do ponto 9, e vale como hábito mecânico: você editou uma rota
inteira e não olhou os três `upsert` que estavam a três linhas de distância.
Quando terminar de mexer num arquivo, releia o arquivo INTEIRO com o defeito
que você acabou de consertar na cabeça. É a busca mais barata que existe, e o
lugar mais provável de achar o irmão de um defeito é ao lado dele.

### 11. Proteção que depende de campo opcional não é proteção

A dedup da reentrega ficou assim: `...(event.id ? { rc_event: event.id } : {})`.
Se o id não vier, a proteção inteira some **sem barulho**, e a rota volta a
contar a venda duas vezes exatamente como antes.

Ou o campo é obrigatório e a ausência dele falha alto, ou você tem uma trava
que pode estar destravada sem ninguém saber. Toda proteção precisa de resposta
para uma pergunta: **como eu descubro que ela parou de valer?**

### 12. Conserto que nunca rodou em produção é TEORIA, e leva etiqueta

O braço da loja nunca gravou uma única linha: `funil_eventos` não tem nem um
evento de origem `revenuecat`. O índice, a dedup e o tratamento de erro são
raciocínio bem-feito sobre um caminho que ninguém percorreu.

Isso não é motivo para não fazer. É motivo para **dizer**. Cada achado e cada
conserto sai da rodada com etiqueta: MEDIDO (vi o dado), DEDUZIDO (infiro de
um indício, e digo qual) ou TEORIA (a lógica fecha, mas nada exercitou isto
ainda). A rodada de 02/09 misturou os três no mesmo tom de voz, e é por isso
que o erro do MRR passou: ele estava escrito com a mesma segurança de um fato
medido.

## Terceira rodada (17/09): a prescrição vale o que vale a prova

O dono pediu este retorno depois da rodada de 16/09, a do "esqueci minha
senha". A revisão é da engenharia, e ela começa pelo que não precisa mudar.

**O diagnóstico daquela rodada é o melhor que este papel já produziu.** Um
`grep` por `updateUser` no repositório inteiro, com um único resultado que é de
outra coisa, não é indício: é prova conclusiva de que o recurso não existe. Foi
certo segurar o patch (login não reproduzido não se aplica), foi certo dizer
onde não enxerga, e as etiquetas MEDIDO, DEDUZIDO e TEORIA foram respeitadas de
verdade, não só escritas. A dívida de fonte da semana anterior foi paga com
dado que desmentiu a própria leitura antiga, que é a coisa mais difícil de
fazer e a mais valiosa.

O que segue é sobre a outra metade do documento.

### 13. A prescrição precisa da mesma prova que o diagnóstico

Na mesma rodada, o achado foi provado com uma busca conclusiva e o **patch foi
escrito sem abrir o código que faria o conserto funcionar**. Deu dois erros no
mesmo documento.

A proposta entregou ao dono uma decisão ("deep link, que mexe em configuração
de provedor, ou web, mais simples?") cuja premissa era falsa: o deep link já
estava construído, cadastrado e rodando. Existe uma página `/auth-bridge`, que
nasceu porque o GoTrue recusa `mentorque://` na validação, que repassa query e
fragmento inteiros, e um ouvinte em `auth.tsx` que já trata as duas formas. Não
havia escolha para fazer, e o conserto era uma linha.

Tempo do dono gasto numa decisão que não existia é pior que achado não
reportado, porque ele vem com a autoridade de uma pergunta legítima.

**A régua, e ela é a mesma do `concluir-com-prova` aplicada ao outro lado:**
antes de escrever "o patch é assim", pergunte o que precisaria ser verdade para
o patch funcionar, e vá conferir cada uma dessas coisas. Diagnóstico responde
"o que está quebrado"; prescrição responde "o que fará isto funcionar", e as
duas perguntas pedem prova, não só a primeira.

### 14. "Vale reler X antes de fazer isto" é uma chamada de ferramenta, não uma frase

Este é o mais afiado, porque a própria proposta escreveu, sobre o conserto
gêmeo do login social:

> O item 3 é o mesmo formato do defeito que já mordeu esta casa no OAuth (o
> comentário está em `lib/app/socialLogin.ts`). Vale reler aquele conserto
> antes de fazer este.

A resposta inteira estava naquele arquivo. O documento **sabia** que o vizinho
existia, **mandou o leitor** ir ler, e não leu. Isso é delegar a própria
verificação para quem recebe o relatório.

Toda vez que a frase "vale olhar", "vale reler", "provavelmente existe algo
parecido em" aparecer no rascunho, ela é um pedido de leitura que você mesmo
tem que atender antes de publicar. Se depois de ler ainda valer citar, cite
com o que você encontrou lá dentro.

É o ponto 10 (ler as linhas vizinhas) um andar acima: o irmão de um defeito
mora ao lado dele, e **o irmão de um conserto também**.

### 15. Evento de biblioteca: confira o que o DISPARA no SEU caminho

A peça 2 do patch mandava escutar `PASSWORD_RECOVERY` no `onAuthStateChange`.
Esse evento só é emitido quando o supabase-js encontra o token na URL sozinho,
pelo `detectSessionInUrl`. No app das lojas quem cria a sessão somos nós, na
mão, e o evento que sai daí é `SIGNED_IN`.

Ou seja: o patch funcionaria no navegador e falharia calado no aparelho, que é
exatamente onde o defeito que ele conserta é pior. E o código que mostra isso
estava aberto na mesma rodada, porque a proposta cita o `onAuthStateChange`
duas linhas acima.

Nome de evento não é contrato. Antes de depender de um, ache quem o emite e
confirme que o SEU caminho passa por lá. O caminho feliz da documentação
raramente é o caminho do app nativo desta casa.

### 16. Achado sem tamanho medido faz tudo parecer urgente

A rodada descreveu o estrago em ordem de gravidade e não disse para quantas
pessoas. Uma consulta responde: 32 contas, **3 com senha**, e **1 pedido de
recuperação em toda a história**. As outras 29 entraram por Google ou Apple e
não têm senha para esquecer.

Isso não diminui o achado, muda o que fazer com ele: é um defeito que cresce
junto com o login por e-mail e que não segura um envio de versão. Sem o número,
ele chega ao dono com o mesmo peso de um defeito que atinge todo mundo, e quem
lê não tem como saber a diferença.

A habilidade `ler-a-operacao` já está disponível para este papel. **Todo achado
de fluxo sai com o tamanho da população afetada**, medido, ou com a frase
dizendo que não deu para medir e por quê.

### Sobre a alçada, uma flexibilização

Continua valendo não mexer em cobrança, preço e funcionalidade. Mas **view e
índice ADITIVOS** (que só acrescentam coluna ou restrição sem remover,
renomear ou mudar o que já é lido) passam a estar na sua alçada, desde que:
o arquivo em `supabase/` seja atualizado no mesmo commit, o efeito seja
ensaiado no banco antes com linhas de teste apagadas depois, e o DIARIO diga
o que mudou. Foi o que faltou para a proposta da view render na própria
rodada em que foi escrita.

### Segunda flexibilização (02/09): tratar erro NÃO é mexer em cobrança

Você segurou o patch da compra silenciosa porque ele encostava em cobrança, e
fez certo: aquele muda o que a pessoa VÊ depois de pagar. Mas na mesma rodada
você também deixou passar três `upsert` engolindo erro, e engolir erro não é
uma decisão de cobrança, é um defeito.

A linha nova, e ela é estreita de propósito:

- **ESTÁ na sua alçada**: fazer uma escrita olhar o `error`, registrar a
  falha, e responder o código de erro que faz o provedor REENVIAR. Isso não
  muda quem é cobrado, quando, nem quanto. Muda apenas se a falha aparece ou
  some. Condição: a operação tem que ser idempotente (reenviar não pode
  cobrar de novo nem duplicar linha), e você diz no DIARIO por que ela é.
- **NÃO está**: mudar o que é cobrado, quando é cobrado, quanto, quem ganha
  acesso, ou o que a tela diz para quem pagou. Continua recomendação.

A regra por trás: **tornar uma falha visível é sempre menos arriscado do que
deixá-la calada.** O caso de 02/09 é a prova pelo custo: um erro de banco de
um segundo, no webhook da loja, viraria um cliente pagante sem Premium para
sempre, porque a rota respondia 200 e o RevenueCat nunca reenviava. Segurar
esse conserto por prudência teria sido o mais caro dos dois caminhos.

## Retorno do dono sobre a rodada de 01/10/2026 (e a de 30/09)

Mandado escrever por ele em 03/10, para os sete papéis que rodaram desde 27/09.
São duas rodadas num retorno só porque elas são o mesmo fio: a varredura de
30/09 achou a venda de loja que o banco não conhecia, e a verificação agendada
de 01/10 achou que o funil nunca soube escrever `renovou`.

Primeiro o que manter.

**A VENDA DE 25/09 FOI ACHADA POR VOCÊ, SEIS DIAS DEPOIS, E POR MAIS NINGUÉM.**
Ela só virou Premium em 03/10, e o caminho inteiro até a causa (o webhook
cadastrado no apex, que redireciona) começou no descompasso que você mediu. E
você já tinha escrito a previsão em 02/09: "o caminho da loja é o mais perigoso
porque não tem segunda porta". Previsão escrita, confirmada e citada é a coisa
mais rara deste caderno.

**O ALARME QUE VOCÊ NÃO DEU VALE TANTO QUANTO O QUE VOCÊ DEU.** A 2.9 parecia
fechar sozinha três vezes mais, e o que segurou a conclusão foi perceber que a
testemunha mudou junto com o app: um ouvinte novo na mesma versão. Depois você
foi atrás de uma medida que não passa pela migalha, aberturas por aparelho, e
ela respondeu. Essa é a doença que a casa perseguiu o mês inteiro, e você foi o
único que a pegou ANTES de publicar o número.

**E DECLARAR O CONSERTO COMO TEORIA EM PRODUÇÃO**, com a data que o prova
(04/10) e com o que significa se o `renovou` não aparecer: "o conserto está
errado e o diagnóstico também".

Agora o que precisa melhorar, em três pontos.

**1. O PRIMEIRO DOS DOIS PONTOS QUE VOCÊ DEIXOU PARA O DONO NEM PRECISAVA
DELE.** Você fechou 01/10 com duas coisas no painel do Stripe: ler a fatura e
marcar `invoice.paid`. No dia seguinte o dono perguntou se dava para arrumar, e
dava: o código que lê o valor da fatura entrou em 02/10 sem ele tocar em nada.
Só a caixa do evento é dele. A regra que entrou em DIRETRIZES no mesmo dia vale
aqui: **recomendação que depende de outro vira linha na lista do dono, OU vira
trabalho seu se couber na sua alçada**, e escrever o código que guarda o valor
quando o evento chegar cabia. O critério útil não é "de quem é o painel", é: se
ficar com o outro, quanto tempo isso fica parado?

**2. O ZERO ESTRUTURAL É A QUARTA VEZ, E A SUA RÉGUA AINDA NÃO TEM LINHA PARA
ELE.** `renovacoes 0` lido como "ninguém renovou" quando significava "ninguém
mediu", com o `funilCorreto.ts` declarando a métrica mensurável desde 22/08.
Você mesmo escreveu o direcionamento 7 (contradição que você mesmo escreveu é
achado) e o 8 (número derivado não prova fato financeiro), e mesmo assim o zero
viveu cinco semanas. O que falta é um passo no ritual, não um direcionamento
novo: **antes de publicar qualquer zero, pergunte quem ESCREVE aquele número, e
vá ver se esse escritor existe.** É uma pergunta de trinta segundos que teria
fechado isto em agosto.

**3. A ASSERÇÃO QUE VOCÊ APAGOU ERA A QUE OLHAVA O CONSUMIDOR.** Das três que
você plantou na migalha, a terceira passou verde porque procurava o NOME do
campo e o nome continuava numa variável local; você apagou em vez de apertar,
com o argumento de que o compilador reprova sozinho. Dois dias depois, cinco
conferências desta casa ficaram verdes com o defeito de pé pela mesma família:
afirmavam a REGRA e não afirmavam QUEM USA a regra. Virou o critério 10 do
Guardião. Apagar asserção pode ser certo; o que não pode é apagar sem escrever
QUAL erro de compilação cobre aquele caso, com o nome dele, do lado. Sem isso o
próximo leitor repõe uma asserção mais fraca, ou nenhuma.

**E UMA COISA DE FILA, que não é falha e precisa de data:** o quiz diário é "o
maior recurso do app sem varredura dedicada" desde 30/09 e já cedeu a vez duas
vezes para a compra pelas lojas, com razão nas duas. A compra pelas lojas tem
desfecho desde 03/10: venda recuperada, webhook no `www`, Premium ativo. Marque
a data do quiz na fila.

## Retorno do dono sobre a rodada de 07/10/2026

Mandado escrever por ele em 08/10 ("Veja o que QA escreveu hoje"). Lido o
diário, o diff do commit f60b621, a proposta, o código que ela cita (linha a
linha, nos mesmos arquivos) e o banco, em 08/10 de madrugada (UTC).

Primeiro o que manter, e é uma rodada de nível.

**O SEU PRÓPRIO ERRO FOI PEGO ANTES DE SAIR.** "5 respostas por dia" estava
escrito, e o que fez você olhar de novo foi um máximo que não cabia na média
(314 numa pergunta só). O critério 14 nasceu disso, e é um critério de
trinta segundos. É exatamente a doença que a casa perseguiu setembro inteiro,
e desta vez ela morreu dentro da rodada.

**A SEGUNDA TRANCA FOI PROCURADA ANTES DE ESCREVER O CONSERTO.** A tela
bloqueia, e você foi ver se o banco também bloqueava, ensaiou em transação
desfeita e conferiu o resíduo. Quem consertasse só a tela produziria uma
resposta que a pessoa dá e o servidor joga fora em silêncio. Conferido em
08/10 no `pg_indexes`: o `quiz_respostas_uma_por_dia` é `(dia, anon_id)`,
como você disse.

**O CONSERTO FORA DA ALÇADA VIROU PROPOSTA COM AS TRÊS ASSERÇÕES ESCRITAS**, e
com o detalhe que você quase deixou passar (o total que soma duas vezes com um
registro só no histórico). Lido `aoResponder` e `comHistorico`: o detalhe é
real. E a fila fechou o item dos aparelhos que abrem muito com tamanho de
efeito (1,42 para 1,26), que é o que torna "real e pequeno demais para mudar
decisão" uma frase com lastro.

Agora o que precisa melhorar, em três pontos.

**1. "0 DE 314, MEDIDO NO BANCO" É UM ZERO ESTRUTURAL, E É O SEU CRITÉRIO 12
APLICADO À SUA PRÓPRIA MANCHETE.** O índice que você mesmo nomeou como
segunda tranca é quem ESCREVE esse zero: com unicidade em `(dia, anon_id)`,
a tabela não consegue ter outro número ali. O zero é verdadeiro e não prova
comportamento nenhum; ele repete o índice. O número que mede o estrago é
outro, e está na mesma tabela. Lido em 08/10: de 332 aparelhos que
responderam a pergunta do onboarding, 4 responderam o quiz do dia SEGUINTE
e 9 responderam algum quiz diário em qualquer dia depois. Nos últimos 30
dias, 316 responderam o onboarding, 96 voltaram ao app em outro dia
(`abriu_app`, funil) e 5 fizeram algum quiz diário. É isto que a manchete
deveria dizer: três em cada dez voltam, e um em cada sessenta faz o quiz. O
muro do dia 1 é o primeiro suspeito, e continua suspeito: não existe evento
de funil quando a tela do quiz abre, então ninguém sabe quantos bateram no
"você já respondeu" e foram embora. Instrumento que o veredito vai precisar
entra na proposta no dia em que você percebe que falta (regra do ponto 3 do
retorno ao SEO, 06/10).

**2. A PROPOSTA DIZ "ESTUDO, NÃO PRESENÇA" E DEPOIS MANTÉM A PRESENÇA.** A
direção escrita é que a resposta do onboarding conta como estudo, e o
vocabulário citado (`aoResponderPassado`) é exatamente esse. Mas o conserto
proposto mantém o onboarding carimbando `ultimoDia` e `sequencia = 1`, e
para isso precisa mudar o sentido de `respondeuHoje`, que tem SEIS
consumidores (a tela, o chip, `aoResponder`, os dois lembretes e o
histórico). As palavras e o código discordam. Se é estudo, o conserto mais
curto é o onboarding entrar pelo caminho de estudo e `respondeuHoje`
continuar o que é; Engenharia escreveu essa alternativa na proposta, com o
que ela custa e o que ela muda na frase do onboarding. A escolha entre as
duas é de produto (a sequência nasce no onboarding ou no primeiro quiz do
dia?) e é do dono, e a proposta deveria ter posto as duas lado a lado em vez
de uma só.

**3. "EM 42 DIAS A FRASE APARECEU EM UM" NÃO FECHA COM A SUA PRÓPRIA
IRONIA.** Se a única pergunta que passou do piso de 20 é a do onboarding, e a
tela do onboarding nunca pede o placar, a frase "62% acertaram" apareceu em
ZERO dias. O que aconteceu em um dia (hoje já são dois: 05/10 com 22 e 07/10
com 34, lido na `quiz_dia` em 08/10) foi uma PERGUNTA cruzar o piso, e a
pergunta errada. Número vem com o que ele mede: "nenhum dia do quiz diário
passou de 20 respostas; o piso só foi cruzado pela pergunta que não mostra
placar" é a frase, e ela é mais forte que a sua.

**Fica para a próxima rodada:** quiz de saúde, como você marcou. E quando o
dono decidir o caminho do dia 1, a reconferência do quiz diário entra na
frente, com a asserção 1 da proposta reprovando sobre o código de hoje antes
de qualquer conserto.
