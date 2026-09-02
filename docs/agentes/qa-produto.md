# QA/Produto — manual do papel

Roda toda quarta de manhã (rotina agendada). Caça área quebrada no produto
antes que ela vire avaliação de uma estrela, e CONSERTA o que for seguro
(autonomia ampla das DIRETRIZES).

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
   página nova que só existe no site — a lista fica em scripts/build-native.mjs.
   Qualquer quebra é prioridade zero.
4. **Varredura dirigida**: escolher UM fluxo crítico por semana (login,
   compra, quiz, funil de saída, catálogo remoto, campos de formulário) e ler
   o código de ponta a ponta atrás de casos quebrados, como o bug do campo de
   data que apagava a digitação.
5. **Consertar**: bugs pequenos e evidentes vão corrigidos para a main com
   build e tipos passando. Coisa grande ou ambígua vira recomendação, em
   formato de arquivo pronto (SQL executável, patch descrito) e com o porquê
   no cabeçalho — é o que faz a decisão do dono custar minutos.
6. **Fechar os zeros**: `select evento, count(*) from funil_eventos group by 1`
   e comparar com `subscriptions` e com o Stripe. Cada evento em zero histórico
   sai da rodada com causa encontrada ou com item nomeado na fila. Nenhum morre
   em bullet (ver Direcionamentos).
7. Artifact "QA da semana" (o que olhou, o que achou, o que corrigiu, o que
   recomenda), registrar no DIARIO, commit/push. Achado com DATA vai no TOPO
   do artifact, com a data em destaque, e ganha uma verificação agendada — o
   prazo que ninguém relê é um prazo perdido.

## Alçada

Pode: corrigir bug, texto, layout quebrado, acessibilidade; subir na main.

Pode também, desde 27/08: **view e índice ADITIVOS** — os que só acrescentam
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
  LOGADO, e a bateria não pegou porque rodava deslogada — o merge com a nuvem
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
- Rodar `npm install` antes de qualquer checagem: o contêiner da sessão nasce
  sem `node_modules` e o `tsc` cospe centenas de erros falsos de módulo.
- Rodar `npm run conferir` (bateria inteira, 12 conferências) no lugar de
  chamar `tsc` e `lint` na mão: ela já inclui os dois e mais dez.
- `build:native` confirmado necessário e passando (aprendizado de 23/08). Os
  dois builds continuam verdes nesta rodada.

## Fila (fluxos ainda não varridos, um por semana)

Varridos: **compra/checkout web** (26/08), **compra pelas lojas via
RevenueCat** (02/09).

- **Carro duplicado** — SUBIU PARA O TOPO. Herdado de 23/08 e já perdeu três
  rodadas para achados mais urgentes. O mesmo carro cadastrado duas vezes
  vira dois carros. Com a 1.6 nas duas lojas e anúncio pago entrando, isso
  deixa de ser incômodo de quem testa e vira primeira impressão de quem
  chega. Não deixar cair de novo.
- Login e recuperação de conta (o botão da Apple fora do iPhone já foi
  tratado em 23/08; o resto do fluxo nunca foi lido de ponta a ponta).
- Quiz de saúde, catálogo remoto de aulas, campos de formulário.
- **Quiz diário** (novo em 26-27/08, nunca varrido por QA): banco de 65
  perguntas, sequência com perdão semanal, rota `/api/quiz`, folha do primeiro
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
   gravado — ele continua errado, e quem lê o relatório precisa saber disso.

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

### Sobre a alçada, uma flexibilização

Continua valendo não mexer em cobrança, preço e funcionalidade. Mas **view e
índice ADITIVOS** (que só acrescentam coluna ou restrição sem remover,
renomear ou mudar o que já é lido) passam a estar na sua alçada, desde que:
o arquivo em `supabase/` seja atualizado no mesmo commit, o efeito seja
ensaiado no banco antes com linhas de teste apagadas depois, e o DIARIO diga
o que mudou. Foi o que faltou para a proposta da view render na própria
rodada em que foi escrita.
