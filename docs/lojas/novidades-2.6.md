# Novidades da versão 2.6

Aberta em 13/09/2026. Tudo o que entra aqui já roda na web pelo deploy da
Vercel; o binário só importa para o app das lojas.

**Onde a 2.5 está (reconferido no banco em 15/09/2026 às 10h20, não na
lembrança):** o dono gerou a 2.5 no Codemagic em 13/09.

**A Apple APROVOU a 2.5.** O retrato de `app_store_connect` de hoje traz
`2.5` em READY_FOR_SALE; o de ontem trazia a mesma versão em
WAITING_FOR_REVIEW. Ou seja, a aprovação caiu entre 14 e 15/09. **A fila da
Apple está livre e a trava que existia aqui deixou de existir:** não é mais
preciso esperar nem retirar nada.

No Android a 2.5 roda em aparelhos desde 13/09 (66 eventos de `2.5.0`, o
último hoje às 09:55). Continua em aberto se ela está na faixa de PRODUÇÃO
da Play ou só na interna, e isso não trava o build, só o `/api/app/latest`.

A 2.6 é a próxima, e ela carrega tudo o que a 2.5 carrega, mais o que está
aqui.

## O que vai NO BINÁRIO

1. **Análise de orçamento por foto** (13/09, aprovada pelo dono a partir da
   proposta `docs/agentes/propostas/plataforma-10m.md`). A pessoa tira foto
   do orçamento da oficina; a Biela lê linha a linha, explica para que serve
   cada item, compara com a faixa da região quando há referência e monta as
   perguntas para fazer antes de aprovar. Nunca diz "está sendo enganado".
   Entra por três lugares: o checklist do sintoma, o formulário de serviço
   novo e a Biela. "Salvar no histórico" abre o serviço pré-preenchido
   (serviço principal, oficina, total, as linhas nas notas).
   - Limite: **2 análises por mês no gratuito** (decisão do dono, 13/09),
     sem limite no Premium. O servidor conta (`orcamentos_analisados`) e
     confere o Premium pela tabela `subscriptions` com o Bearer, não pelo que
     o app diz.
   - A foto não é guardada: vai reduzida (1600 px) para a rota, que manda ao
     modelo e descarta. A tabela guarda só mês, identidade, quantos itens,
     total e as chaves de serviço com valor.
   - Onde mora: `lib/orcamento/analise.ts` (puro), `app/api/orcamento`,
     `components/app/screens/Orcamento.tsx`. Conferido por
     `conferir:orcamento` (limite, leitura de resposta suja, comparação,
     ligações) e pela suíte `conferir:navegador orcamento` (foto, resultado,
     limite, salvar no histórico), as duas provadas com defeito plantado.
   - Evento: `analisou_orcamento`, com a origem. A leitura que importa em 30
     dias: quem analisou volta e registra serviço mais que quem não analisou?
   - **Universal links** ficam aqui também (vindos da 2.5), quando o dono
     mandar o SHA-256 do Play.
2. **O caderno de gastos: abastecimento em três toques** (13/09, peça 1 da
   rotina do carro, `docs/agentes/propostas/rotina-do-carro.md`). Card
   "Custo do carro" no Início, abaixo do card do carro: sem lançamento,
   convida; com, mostra a semana e o custo por km. A tela pede valor, km do
   painel e litros (opcional); ao salvar, devolve custo por km, consumo e o
   mês, e carimba o km do carro (quem abastece pelo app não recebe a
   pergunta mensal de km). O histórico lista os abastecimentos junto dos
   serviços, com a soma do mês grátis no topo; o relatório de gastos
   (Premium) passa a incluir combustível. Grátis por decisão do dono.
   - Onde mora: `lib/app/combustivel.ts` (puro), `Abastecimento.tsx`, o
     card em `Home.tsx`, as linhas em `History.tsx`. Evento
     `registrou_abastecimento`. Conferido por `conferir:combustivel` (contas
     e ligações, provado com defeito plantado) e pela suíte
     `conferir:navegador combustivel` (17 casos).
   - Roteiro de aparelho: no app das lojas, registrar dois abastecimentos e
     ver o custo por km no segundo; abrir o app no dia seguinte e NÃO
     receber a folha mensal de km (o abastecimento carimbou).
3. **As datas do carro: IPVA, licenciamento, seguro e CNH** (13/09, peça 2
   da rotina). No calendário de revisões, o card "Datas do carro" com as
   quatro linhas; tocar informa a data e o valor opcional. No Início, a
   data a 30 dias ou menos (ou vencida há até 60) como card; fora disso,
   nada. No "Diagnóstico do carro", o sexto passo. Avisos locais 30, 7 e 1
   dia antes, às 9h, ids fixos 8 a 19, refeitos a cada abertura e a cada
   mudança de data; só do carro ativo. Sem rota no aviso de propósito (a
   lista de rotas é fechada): o toque abre o Início, onde o card já espera.
   - Onde mora: `lib/app/datasDoCarro.ts` (puro), `lib/app/lembreteDatas.ts`,
     `components/app/DatasDoCarro.tsx`, o card em `Home.tsx`. Conferido por
     `conferir:datas` (provado com as antecedências trocadas) e pela suíte
     `conferir:navegador datas`. O gatilho da jornada por e-mail (30 dias
     antes) entra com o resumo mensal, peça 3.
   - Roteiro de aparelho: informar uma data para daqui a 8 dias com os avisos
     ligados; amanhã às 9h chega "vence em 7 dias"; tocar abre o Início com
     o card da data. Trocar a data: o aviso antigo some e o novo entra.
   - **Pelo final da placa** (13/09, pedido do dono): na folha do IPVA e do
     licenciamento, estado e final da placa uma vez; o app sugere a data
     pelo calendário do estado (`lib/app/calendarioDaPlaca.ts`) e a pessoa
     confirma com um toque; depois disso, a linha oferece a próxima data
     com "Usar". Estados na tabela: IPVA de SP, MG, RS e SC; licenciamento
     de SP e RJ. Quando o calendário do ano ainda não saiu (os estados
     publicam em dezembro), a data é projetada do ano anterior e marcada
     como estimada no calendário, no Início, no aviso e no e-mail, pedindo
     para conferir. Sem calendário do estado, a folha diz quais existem e
     a pessoa digita. Conferido em `conferir:datas` e na suíte `datas`.
   - Roteiro de aparelho: no calendário, tocar em IPVA, escolher SP e o
     final 7, "Sugerir a data": vem 20/01 estimada; salvar; a linha do
     licenciamento passa a oferecer 31/10 com "Usar".
4. **O mês do carro fechado** (13/09, peça 3 da rotina). Na primeira semana
   do mês, o Início mostra o card "Agosto do Gol 2016: R$ 380" (combustível
   e serviços do mês fechado), tocando abre o histórico; só aparece quando
   houve lançamento. A parte que não vai no binário: a jornada por e-mail e
   push ganhou duas chaves, `mes` (dias 1 a 3, o resumo com custo por km e
   o que vence nos próximos 30 dias, só para quem tem lançamento ou data) e
   `vence` (IPVA, licenciamento, seguro ou CNH a 30 dias, uma vez a cada 60,
   nunca depois de vencida). Gatilho ganha do resumo; resumo ganha da
   cadência.
   - Onde mora: `lib/app/resumoDoMes.ts` (puro), o card em `Home.tsx`, as
     chaves em `lib/jornada/decisao.ts` e os textos em `lib/jornada/emails.ts`.
     Conferido por `conferir:jornada` (provado com três defeitos plantados:
     janela do resumo, data vencida virando e-mail, resumo antes do gatilho).
   - Roteiro de aparelho: entre os dias 1 e 7, com um abastecimento no mês
     anterior, o card do mês aparece no Início abaixo da data a vencer.
5. **O modo motorista de aplicativo** (13/09, peça 4 da rotina, como modo:
   o público principal segue decisão do dono). No Perfil, abaixo dos
   avisos, o interruptor "Trabalho com o carro por aplicativo". Ligado, o
   card "Custo do carro" do Início vira "Hoje com o Gol 2016: ganhou R$ 240
   · custou R$ 121 · sobrou R$ 119", com dois botões, "Lançar o dia" e
   "Abasteci". A tela do dia pede o que o aplicativo pagou e os km rodados;
   ao salvar, devolve o que sobrou, o lucro por km e de onde veio o custo
   (combustível dos abastecimentos mais a reserva de manutenção dos
   serviços dos últimos 12 meses, quando há 500 km registrados). Sem dois
   abastecimentos, a conta diz que o custo ainda falta; nunca inventa. O
   histórico lista os dias; o resumo do mês (card e e-mail) ganha a linha
   do lucro por km. O km rodado no dia NÃO carimba o odômetro.
   - Onde mora: `lib/app/motorista.ts` (puro), `Ganhos.tsx`, o card em
     `Home.tsx`, o interruptor em `Profile.tsx`, as linhas em
     `History.tsx`. Evento `lancou_ganho` (restrição do banco recriada,
     migração `funil_eventos_ganho`). Conferido por `conferir:motorista` e
     pela suíte `conferir:navegador motorista`.
   - Roteiro de aparelho: ligar o interruptor no Perfil, voltar ao Início e
     ver o card trocar; lançar um dia e ver a conta; desligar o interruptor
     e ver o card do custo voltar.

6. **O push passa a alcançar quem não criou conta** (15/09, decisão do dono,
   depois de o Vigia acusar "token pronto, mas sem sessão"). Até a 2.5 o
   registro do token exigia sessão, e como no Android ninguém tem conta (26
   aparelhos em 5 dias, zero eventos com `user_id`), o push não alcançava uma
   única pessoa: a tabela tinha 1 token, de 11/09. Agora o dono da linha é a
   conta quando há sessão e o próprio aparelho quando não há.
   - Não muda nada na tela. O que muda é que ligar os avisos passa a valer
     para quem ainda não abriu conta.
   - Onde mora: `lib/app/push.ts`, `app/api/push/registrar`, a migração
     `supabase/push_anonimo.sql`. Conferido por `conferir:push`, provado com
     quatro defeitos plantados.
   - A outra metade (a jornada que fala com esses aparelhos) é servidor e já
     está no ar, PARADA: só sai com `JORNADA_APARELHO=sim` na Vercel.
   - **Roteiro de aparelho, e é o mais importante desta versão:** no app das
     lojas, SEM entrar na conta, Perfil, ligar os avisos e aceitar a
     permissão. Em até um minuto,
     `select platform, anon_id, user_id from push_tokens order by updated_at desc`
     mostra uma linha com `user_id` nulo e `anon_id` preenchido. Depois,
     criar conta no mesmo aparelho e conferir que a MESMA linha ganhou o
     `user_id` sem virar duas. Se ela não ganhar, `app_erros` com origem
     `push` diz o motivo.

7. **A Biela entra no gratuito: cinco perguntas por mês** (15/09, decisão do
   dono). Até a 2.5 ela era Premium fechada e quem não assinava via só o
   paywall. Agora qualquer pessoa, com conta ou sem, pergunta cinco vezes por
   mês, e a tela mostra quantas sobraram.
   - **Quem conta é o servidor**, não o app. O contador antigo vivia em estado
     de React e zerava a cada abertura, o que com limite zero nunca apareceu e
     com limite cinco viraria "cinco por abertura". A rota agora identifica
     pela conta (Bearer) ou pelo aparelho (`anon_id`), lê o Premium da tabela
     `subscriptions` e conta em `biela_perguntas`.
   - Onde mora: `lib/biela/limite.ts` (puro), `app/api/biela`,
     `components/app/screens/Biela.tsx`, a migração
     `supabase/biela_perguntas.sql`. Conferido por `conferir:biela`, provado
     com seis defeitos plantados.
   - **O número é do dono e muda numa linha:** `LIMITE_GRATIS_POR_MES` em
     `lib/biela/limite.ts`.
   - **Roteiro de aparelho:** no app das lojas, SEM assinar, fazer seis
     perguntas à Biela. As cinco primeiras respondem e o contador desce de 5
     até 0 na linha acima do campo; a sexta não sai e a folha do Premium toma
     o lugar do campo. Fechar e reabrir o app NÃO devolve perguntas (era
     exatamente isso que o contador antigo fazia). Conferir no banco:
     `select count(*) from biela_perguntas where mes = '2026-09'`.

## Roteiro de aparelho, e ele é obrigatório

Escrito antes do build. O que a bateria não alcança: a câmera do aparelho
dentro do WebView e a resposta do modelo de verdade (a suíte simula a rota).

1. **Câmera no app das lojas**: Problemas, um sintoma, "O que verificar",
   "Tirar foto do orçamento". O botão abre a câmera do aparelho (não só a
   galeria) no Android e no iPhone; a foto aparece na tela; "Analisar
   orçamento" devolve o resultado em até 30 segundos.
2. **Resultado de verdade**: com um orçamento impresso, as linhas batem com
   o papel, os valores conferem, e nenhuma frase acusa a oficina.
3. **Limite**: deslogado, na terceira análise do mês a tela oferece o
   Premium. Logado com Premium, a terceira passa.
4. **Salvar no histórico** chega ao formulário com oficina e total.

## O que vem junto da 2.5 e AINDA NÃO teve roteiro de aparelho

A 2.6 carrega tudo isto. Enquanto nenhum aparelho abrir, a resposta sobre
cada um é "sem sinal ainda", nunca "funcionou". O roteiro completo da 2.5
está em `docs/lojas/novidades-2.5.md`; estes são os que ainda não foram
rodados e que mais pesam:

1. **O token de push do iPhone** (o item 11 da 2.5, e o que nunca funcionou
   desde 28/08). iPhone com a versão nova, logado, Perfil, ligar os avisos.
   Em até um minuto, `select platform, updated_at from push_tokens` mostra
   uma linha `ios`. Se não mostrar,
   `select * from app_erros where origem = 'push'` diz o motivo. É plugin
   nativo, e a regra do dono de 09/09 manda o roteiro vir antes do build:
   está aqui, e o fonte do plugin já foi lido
   (`PushNotificationsPlugin.swift`, o `addObserver` da notificação
   `capacitorDidRegisterForRemoteNotifications`).
2. **"Avaliar" e "Atualizar" abrem a App Store** (item 9 da 2.5): Perfil,
   "Avaliar o Mentorque", a App Store abre, não uma aba branca.
3. **As três manhãs do aviso do quiz** (item 1 da 2.5): ligar avisos,
   responder o quiz e não abrir o app por dois dias; o aviso das 9h chega
   nos dois.
4. **As duas variantes dos testes A/B** (itens 7 e 8 da 2.5) no app das
   lojas: onboarding de três ou cinco páginas, e o formulário do carro
   curto ou completo. Para ver a outra variante, apagar os dados do app.

## Notas para as lojas, PARA O DONO CONFERIR ANTES DE COLAR

Ganho, não defeito; verbo na ação da pessoa; nada que não tenha sido
conferido.

**IMPORTANTE, e é a regra três:** o primeiro parágrafo promete a foto do
orçamento. A leitura do modelo foi provada em produção pela web em 13/09,
mas a CÂMERA dentro do app das lojas não. Se os passos 1 e 2 do roteiro
acima não passarem no aparelho, tirar esse parágrafo antes de colar.

**Google Play** (limite: 500 caracteres)

```
Agora o Mentorque cuida também do dinheiro do carro.

Recebeu um orçamento da oficina? Tire uma foto e veja item por item, com a faixa de preço da sua região.

Registre o abastecimento em três toques e descubra quanto seu carro custa por km.

Guarde IPVA, licenciamento, seguro e CNH: o app avisa 30, 7 e 1 dia antes, e sugere a data pelo final da placa.

No começo do mês, o resumo do que o carro custou.

E agora você tem 5 perguntas por mês, de graça, com a Biela, a nossa mecânica de IA.
```

**App Store**

```
Agora o Mentorque cuida também do dinheiro do carro.

Recebeu um orçamento da oficina? Tire uma foto e veja item por item, com a faixa de preço da sua região, e as perguntas para fazer antes de aprovar.

Registre o abastecimento em três toques e descubra quanto seu carro custa por km.

Guarde IPVA, licenciamento, seguro e CNH: o app avisa 30, 7 e 1 dia antes, e sugere a data pelo final da placa.

No começo do mês, o resumo do que o carro custou.

Trabalha com o carro por aplicativo? Ligue o modo no Perfil e veja quanto sobrou no dia.

E agora você tem 5 perguntas por mês, de graça, com a Biela, a nossa mecânica de IA.
```

**A linha da Biela é nova (15/09) e é a que mais atrai desta versão**, porque é
a única que dá algo que antes era pago. Ela diz o número de propósito: "grátis"
sem número é a promessa que a pessoa preenche sozinha para mais, e depois
reclama. A regra 2 da ficha manda dizer o que o app não faz, e cinco é o que
ele faz.

## Antes de enviar

- Versão 2.6 nos três lugares: reconferido em 15/09 (`conferir:versoes` diz
  "2.6 (app 2.6.0, Android 2.6, iOS 2.6), ainda não publicada"). A 2.5 está
  na lista `JA_PUBLICADAS`, com a prova do banco.
- Na Apple, a 2.5 foi APROVADA (READY_FOR_SALE no retrato de 15/09). A fila
  está livre; nada a esperar nem a retirar.
- Conferência de 15/09, antes do build: `npm run conferir` inteiro passou
  (código 0), a bateria de navegador passou inteira (18 suítes, 344 passos,
  804 s) e o `npm run build` local passou (código 0). Nenhuma dependência
  mudou desde a 2.5: o diff de `package.json` e `package-lock.json` desde
  13/09 é só de scripts. Em `android/` e `ios/` mudaram apenas os dois
  números de versão. Nenhum plugin nativo entrou ou mudou, então a regra do
  dono de 09/09 (ler o fonte do plugin antes do build) não tem alvo novo
  nesta versão.
- O que a conferência NÃO alcança continua sendo o roteiro de aparelho
  acima. Verde aqui prova o que a suíte olha, não o binário.
- Ao enviar a 2.6, acrescentar `"2.6"` à lista `JA_PUBLICADAS` NA HORA do
  envio, não na hora da aprovação. Foi o atraso de um dia nisso, na 2.5,
  que deixou a conferência dando luz verde para um nome já usado.
- `/api/app/latest` só depois da aprovação, com o número do log
  ("versionCode deste envio: N"), nunca com o "Index" da tela. Hoje ele
  aponta para a 2.4, build 63.
- Pergunta aberta para o dono: a 2.5 está na faixa de PRODUÇÃO da Play ou
  só na interna? Se estiver em produção, o banner de versão nova está
  apontando para a 2.4 e quem tem 2.4 não está sendo avisado.
