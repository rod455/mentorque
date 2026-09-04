# O app fecha ao responder o quiz (Android)

Aberto em 02/09/2026, a partir de um relato de usuário. **Não está resolvido**:
o que existe até aqui é a prova de que o defeito é real, uma testemunha
plantada para a próxima vez, e uma rede para o app não desaparecer.

## O que está provado

O relato bate com o que o nosso próprio funil registrou, no mesmo dia, num
aparelho Android na 1.6.0 (`70d10f37…`):

```
12:32:34.260  atribuicao (ok)
12:32:34.262  abriu_app
12:32:41.366  resposta do quiz gravada (fumaca-azul)
12:32:48.978  abriu_app   ← de novo, 7 segundos depois de responder
```

O segundo `abriu_app` é a prova. Ele nasce num `useEffect` de montagem com
dedup **em memória** (`lib/app/funil.ts`), então ele só sai duas vezes se o
JavaScript inteiro tiver morrido e renascido no meio. Traduzindo: o aparelho
respondeu o quiz e, sete segundos depois, o app estava começando do zero.

A resposta chegou ao servidor antes da queda. Ou seja, a morte é DEPOIS do
envio, no que vem em seguida.

## O que está descartado

- **Não é erro de JavaScript.** A tabela `app_erros` não tem uma linha desde
  28/08, e o coletor está vivo (ele reportou de verdade em 1.2). Exceção de
  JavaScript, aliás, não fecha app: derruba a tela e o resto continua.
- **Não é a rota do quiz.** O `insert` grava, e conflito de dia repetido já é
  tratado como sucesso (`23505`), não como erro.
- **Não é a tela.** A suíte `conferir:navegador quiz` percorre o caminho
  inteiro num Chromium, do chip até o envio, e passa com o console limpo.
- **Não é a Play acusando.** `crashPorDia` do `play_console` está vazio. Isso
  não inocenta ninguém: morte do processo da WebView costuma não virar crash
  nos Android vitals, e o relatório ainda atrasa um dia.

## A suspeita, e por que ela é só suspeita

O que o app faz de NATIVO no instante em que a pessoa responde é notificação
local, e nada mais:

1. `s.quiz` muda → `useLembretes` → `sincronizarLembreteQuiz`. Com os avisos
   desligados, isso chamava `cancelar()`, que **carrega o plugin e cria canal
   de notificação** só para descobrir que não havia nada agendado.
2. `ConviteDeAviso` monta → `podeConvidar()` → carregava o plugin de novo
   para perguntar a permissão ao sistema, ANTES de olhar as travas locais.

Esse caminho é novo em produção. Até 28/08 ele estava **morto**: toda chamada
ao plugin morria no `.then()` (ver o comentário longo em
`lib/app/notificacoes.ts`). O defeito foi corrigido, o plugin passou a ser
chamado de verdade, e o relato de app fechando apareceu depois disso. É um
indício de tempo, não uma prova de causa.

## O que foi feito

**1. Uma testemunha (`lib/app/ultimoPasso.ts`).** A cada passo que vale, o app
grava no aparelho "estou aqui, agora". Na abertura seguinte, se essa migalha
ainda estiver quente e não tiver sido esfriada pela ida para segundo plano,
sai uma linha em `app_erros` do tipo `fechou`, dizendo em cima de qual passo o
app sumiu. É o único jeito de relatar uma morte: quem morre não relata.

Conferida por `npm run conferir:migalha`, com os três defeitos plantados e
acusados (ignorar o segundo plano, não consumir a migalha, janela sem teto).

**2. Uma rede (`MainActivity.java`).** A WebView desenha num processo separado.
Quando esse processo morre, o padrão do Android é derrubar a activity, e para
a pessoa o app fecha sozinho. Agora o app trata o caso: solta a WebView morta e
refaz a tela. Recarregar do começo é ruim; sumir é pior.

**3. Menos trabalho nativo no caminho quente.** As duas chamadas ao plugin
descritas acima saíram do instante da resposta:

- `cancelar()` não carrega mais o plugin em aparelho que nunca agendou aviso
  nenhum (marca `mq-avisos-ja-agendou`, semeada pelo interruptor da pessoa);
- `podeConvidar()` consulta as travas locais ANTES de perguntar ao sistema. A
  decisão é a mesma nos dois casos, porque trava local que já disse não não
  muda de ideia com a resposta do sistema.

Isso não é o conserto: é tirar o suspeito do caminho enquanto ele não é nem
inocentado nem condenado.

## 04/09/2026: o vídeo, e o que ele fecha

O dono mandou uma gravação de tela de um Android com o defeito acontecendo.
Treze segundos, e ela responde três perguntas que estavam em aberto.

**O momento exato, quadro a quadro (8 por segundo).** A pessoa toca na opção B.
A tela responde INTEIRA: o check verde aparece na alternativa, o painel
"Acertou!" com a explicação, o cartão de sequência com "1 dia seguido" e o botão
"Seguir". No quadro seguinte, cerca de 125 ms depois, já é a animação de
fechamento do app, e logo em seguida a tela inicial do Android com o aviso do
sistema.

Ou seja: **tudo o que é síncrono no toque terminou**, inclusive a atualização de
estado que desenhou a sequência. A morte é no que vem depois disso, e o que vem
depois é o efeito com `s.quiz` na lista de dependências, que leva a
`sincronizarLembreteQuiz`.

**É morte de PROCESSO, não erro de JavaScript, e agora está provado.** O aviso do
sistema é "Mentorque keeps stopping". Exceção de JavaScript não produz esse
diálogo: ela derruba a tela e o processo segue vivo. Isso também explica por que
o `try/catch` em volta de `plugin.schedule`, em `lib/app/notificacoes.ts`, nunca
pegou nada. Ele não tem como pegar: o que morre é o processo, não a promessa.

**"keeps stopping", e não "has stopped".** O Android usa a primeira forma quando
o app já quebrou VÁRIAS vezes seguidas. Não é um episódio.

**O aparelho é de um cliente pagante.** Dá para identificar pela gravação, e é a
assinatura que virou cobrança hoje. Sobe a prioridade: é 1 dos 3 clientes reais.

### O candidato mais óbvio foi conferido e ELIMINADO

A primeira hipótese de qualquer um, e foi a minha: em Android 12 e acima, agendar
alarme EXATO sem a permissão `SCHEDULE_EXACT_ALARM` lança `SecurityException` no
código nativo e mata o processo. Bate com tudo: é nativo, é Android novo, é no
`schedule`, e o nosso `AndroidManifest.xml` realmente **não declara** essa
permissão (só INTERNET, ACCESS_NETWORK_STATE e AD_ID).

Só que o plugin não deixa isso acontecer. Em
`@capacitor/local-notifications@8.3.1`, o `LocalNotificationManager.kt` decide
assim:

```kotlin
val useExact = localNotification.isExactNotification && canScheduleExactAlarms(alarmManager)
// canScheduleExactAlarms = SDK < S  ||  alarmManager.canScheduleExactAlarms()
```

Sem a permissão, ele cai em `setAndAllowWhileIdle`, que é inexato e **não lança**.
Então essa não é a causa em nenhum build que use 8.3.1. Fica registrado como
eliminado para a próxima pessoa não gastar a mesma tarde.

**Mas o achado colateral é real e vale saber:** sem `SCHEDULE_EXACT_ALARM`, o
lembrete diário é agendado como alarme INEXATO. Ele sai, e sai atrasado, às vezes
bastante. O experimento `lembrete-que-chega`, com veredito em 28/09, está medindo
um aviso que o sistema tem licença para adiar. Declarar essa permissão é decisão
do dono: a Play restringe o uso dela e pede justificativa, então não é uma linha
no manifesto, é um assunto com a loja.

### 04/09, mais tarde: O RASTRO NATIVO APARECEU

Play Console, Android vitals, Falhas e ANRs:

```
com.getcapacitor.Bridge.getPermissionStates
java.lang.NullPointerException
Tipo: Falha    Versões afetadas: 52 (1.6)    Usuários afetados: 1    Eventos: 1
```

**`getPermissionStates` é o que sustenta o `checkPermissions()` de um plugin.**
E o nosso caminho ao responder o quiz chama exatamente isso:

```
s.quiz muda → useLembretes → sincronizarLembreteQuiz → permissaoConcedida()
            → plugin.checkPermissions() → Bridge.getPermissionStates → NPE
```

E chamava DUAS vezes: `sincronizarLembreteQuiz` perguntava, e `agendar()`
perguntava de novo logo em seguida. Duas travessias da ponte para descobrir o
mesmo fato, no instante exato em que o app morre.

**Onde o nulo mora.** `@capacitor/android@8.5.0`, `Bridge.java:1216`:

```java
CapacitorPlugin annotation = plugin.getPluginHandle().getPluginAnnotation();
```

Sem verificação de nulo. `getPluginHandle()` nulo, ou anotação nula, é
NullPointerException no fio principal, e isso mata o processo. Nenhum
`try/catch` de JavaScript alcança: quem morre é o processo, não a promessa. É
por isso que o `catch` em volta do `checkPermissions()` nunca reportou nada.

**O que ainda NÃO está provado:** por que o handle está nulo. Um palpite
razoável é a WebView que já morreu e foi refeita (ver a rede do
`MainActivity.java`), deixando instância de plugin órfã, mas isso é palpite e
fica registrado como palpite. A amostra também é pequena: 1 usuário, 1 evento,
e os dados da Play estavam com atualização de quinta 06:00, ou seja, a quebra
gravada em vídeo hoje ainda não entrou.

### O conserto que subiu, e o que ele é

Uma porta só para perguntar permissão (`estadoDaPermissao`), com a resposta
guardada e esquecida quando o app volta ao primeiro plano. Guardar é seguro
porque a permissão só muda nos ajustes do sistema, e para chegar lá a pessoa
sai do app.

Efeito: responder o quiz deixa de atravessar a ponte duas vezes e passa a
atravessar, no máximo, uma vez por volta ao app.

**Isto não conserta o defeito do Capacitor, e não deve ser lido como conserto
do crash.** Tira o nosso caminho mais quente de cima dele, que é o que dá para
fazer sem reproduzir a falha. Se as quebras continuarem depois da 1.7 chegar
nos aparelhos, a causa está em outro lugar e a migalha vai dizer em qual passo.

Conferido pela `conferir:aviso`, com os dois defeitos plantados e acusados: uma
segunda travessia da ponte, e esquecer de esquecer a resposta na volta.

### O que ainda falta, e onde está

O rastro nativo. `app_erros` não tem nada depois de 29/08 e todas as linhas de lá
são da 1.2.0, ou seja, a migalha do último passo não existe no aparelho que está
quebrando. A testemunha que a gente plantou só começa a testemunhar quando a 1.7
chegar nesse celular.

Enquanto isso, o rastro existe em UM lugar: **Play Console, Qualidade, Android
vitals, Falhas e ANRs**, filtrando pela versão instalada. Em 02/09 o
`crashPorDia` estava vazio, mas o aparelho quebrou de novo hoje e "keeps
stopping" é diálogo de crash de processo, que costuma ser reportado. Vale reabrir
com dois dias a mais de dados. É lá que está o `SecurityException`, o
`OutOfMemory` ou o que quer que seja, com a linha exata.

## O que falta, e depende do aparelho

1. **Qual aparelho e qual Android.** Muda a leitura por completo: memória
   apertada matando o renderizador é uma história, plugin quebrando em Android
   novo é outra.
2. **Se a pessoa tinha os avisos LIGADOS.** Com eles ligados o caminho passa
   por `schedule`, com eles desligados só por `cancel`. São dois códigos
   nativos diferentes.
3. **Se acontece toda vez ou de vez em quando.** Toda vez aponta para código;
   de vez em quando aponta para memória.

## Como ler o resultado, quando a 1.7 estiver no ar

```sql
select criado_em, mensagem, stack, plataforma, versao
from app_erros where tipo = 'fechou' order by criado_em desc;
```

`mensagem` diz o passo (`app fechou sozinho em: respondeu o quiz`) e `stack`
diz quantos segundos depois dele. Se as linhas vierem todas com o mesmo passo,
o suspeito está identificado. Se vierem espalhadas por passos diferentes, a
causa é do aparelho (memória), não do quiz.
