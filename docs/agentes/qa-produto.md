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
   build e tipos passando. Coisa grande ou ambígua vira recomendação.
6. Artifact "QA da semana" (o que olhou, o que achou, o que corrigiu, o que
   recomenda), registrar no DIARIO, commit/push.

## Alçada

Pode: corrigir bug, texto, layout quebrado, acessibilidade; subir na main.
Não pode: mudar comportamento de cobrança/preço, remover funcionalidade,
refatorações amplas. Na dúvida, recomendar.

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
- Rodar `npm install` antes de qualquer checagem: o contêiner da sessão nasce
  sem `node_modules` e o `tsc` cospe centenas de erros falsos de módulo.
- `build:native` confirmado necessário e passando (aprendizado de 23/08). Os
  dois builds continuam verdes nesta rodada.

## Fila (fluxos ainda não varridos, um por semana)

Varridos: **compra/checkout web** (26/08).

- **Carro duplicado** (herdado de 23/08, ainda aberto): o mesmo carro
  cadastrado duas vezes vira dois carros. Sugerido para a próxima rodada.
- Login e recuperação de conta (o botão da Apple fora do iPhone já foi
  tratado em 23/08; o resto do fluxo nunca foi lido de ponta a ponta).
- Quiz de saúde, catálogo remoto de aulas, campos de formulário.
- Compra pelas lojas (RevenueCat): o caminho web foi varrido nesta rodada, o
  das lojas não. O webhook do RevenueCat nasce os mesmos eventos financeiros
  do Stripe e merece a mesma conferência.

## Direcionamentos do dono

- (vazio ainda)
