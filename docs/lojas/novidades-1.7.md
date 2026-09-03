# Novidades da versão 1.7

Versão de CONSERTO por dentro, de EXPERIÊNCIA por fora. Nenhuma tela nova, mas
quatro pontos em que o app parava de ajudar e agora ajuda.

## Como escrever o texto destas duas caixas

**O que a gente escreve aqui VAI PARA A LOJA, do jeito que está.** Na App Store
o "Novidades desta versão" aparece na ficha para qualquer pessoa, inclusive
quem ainda não baixou, e fica lá até a próxima versão. Não é changelog de
desenvolvedor: é texto de produto, lido por cliente.

Daí as três regras deste arquivo:

1. **Falar do ganho, não do defeito.** "O lembrete leva direto para a pergunta"
   e não "corrigimos o redirecionamento do push". A pessoa não sabe o que
   estava quebrado, e contar o defeito em detalhe só ensina que o app tinha um.
2. **Descrever o que ela vai sentir usando**, com o verbo na ação dela: tocar,
   assinar, responder, abrir.
3. **Nada que não tenha sido conferido.** É ficha de loja, não é o diário. Onde
   a prova não fecha (o fechamento no Android, cuja causa não está provada), o
   texto fala do que a rede FAZ, não de uma cura.

---

## Google Play

**Novidades desta versão** (limite: 500 caracteres)

```
O lembrete da pergunta do dia agora leva direto para a pergunta. Toque na
notificação e o quiz abre pronto para responder.

A tela do quiz ficou mais firme no Android: se o sistema encerrar a página para
liberar memória, ela se refaz sozinha e você continua de onde estava.

Quem assina pela loja passa a ver uma confirmação que acompanha a liberação do
Premium até ela chegar.

As aulas em vídeo de setembro chegaram com capa própria, e cada uma estreia no
mesmo dia do vídeo.
```

---

## App Store

**Novidades desta versão**

```
Esta versão deixa o uso de todo dia mais direto.

O lembrete da pergunta do dia agora leva direto para a pergunta. Toque na
notificação e o quiz abre pronto para responder, sem parar na tela inicial e
sem precisar procurar nada.

A tela do quiz também ficou mais firme. Quando o sistema precisa liberar
memória e encerra a página do app, ela se refaz sozinha e você continua de onde
estava.

Quem assina pela loja passa a ver uma confirmação que acompanha a liberação do
Premium até ela chegar. Antes a tela ficava parada depois da compra aprovada, e
dava a impressão de que nada tinha acontecido.

E o conteúdo continua crescendo: as aulas em vídeo de setembro chegaram com
capa própria, e cada aula nova aparece aqui no mesmo dia em que o vídeo estreia
no canal.
```

---

## O que vai nesta versão, de verdade

**Visível ao usuário**

- **O toque no aviso do quiz abre o quiz** (`e07e4b3`). Não havia ouvinte de
  toque em lugar nenhum do app, nem para o aviso local nem para push, e os
  avisos não carregavam destino. O sistema abria o app, e abrir o app era tudo
  o que acontecia. Conserto completo, dos dois lados.
- **A tela do quiz no Android sobrevive à morte do renderizador** (`b37f2ec`).
  Quando o processo que desenha a página morre, o padrão do Android é derrubar
  a Activity junto, e o app "fecha". Agora o `MainActivity` intercepta e
  recria a tela. **A causa do fechamento ainda não está provada**, então isto é
  rede, não conserto: junto foi a migalha do último passo, que é a testemunha
  que vai dizer onde ele morre. Ver `docs/qa/app-fecha-no-quiz.md`.
- **A compra pela loja terminava em silêncio** (`455db06`). Aprovada a compra,
  a tela ficava parada. Agora tem desfecho.
- **Capas próprias das aulas de setembro** e a capa da `vid-altitude` refeita
  (`1231d9c`). Já estão no ar pelo catálogo remoto desde 03/09; a 1.7 leva
  também para quem abrir o app sem rede.
- **Aula agendada não vaza antes do dia** também no aparelho (`860006b`). O
  servidor já segurava; o cliente segura o catálogo embarcado, que é o que o
  app usa offline.

**Invisível, e é o resto do porquê**

- **A migalha do último passo** (`lib/app/ultimoPasso.ts`): quando o app morre,
  o JavaScript morre junto e ninguém relata. Agora ele escreve ANTES, e a
  próxima abertura conta o que aconteceu.
- **Menos trabalho nativo no caminho quente do quiz**: cancelar aviso deixou de
  atravessar a ponte nativa em aparelho que nunca agendou nada.
- **Captura de campanha em qualquer página, e o `gclid` chegando na venda**
  (`0b8e74a`). É medição de anúncio, não muda nada para o usuário.
- **A compra pendente atravessa o login social** (`19bc7a1`). O defeito era só
  da web (no app o login é nativo e a página não recarrega), mas o código
  viaja junto.

**O que NÃO é da 1.7, e já está no ar sem build nenhum**

Vale separar para a conta não sair dobrada: a landing liberada, o cupom novo, o
e-mail de lançamento e a rota de disparo, as correções de medição e os agentes
não dependem de loja. Foram para a Vercel no push.

---

## Antes de enviar

- Rótulos de privacidade: **nada muda**. Nenhum campo novo é coletado; a
  captura de campanha usa o mesmo `anon_id` que o funil já usava, e o `gclid`
  vem da própria URL do anúncio. O que declarar continua em
  `docs/atribuicao.md`.
- **Teste de aparelho desta versão**, no celular, depois de instalar. Os três
  primeiros só existem no binário, então nenhuma suíte alcança:
  1. **O toque no aviso.** Ligar os avisos no Perfil, esperar o lembrete das
     9h (ou adiantar o relógio do aparelho), e tocar na notificação com o app
     FECHADO. Tem que abrir na pergunta do dia, não no Início. Repetir com o
     app aberto em segundo plano.
  2. **O quiz no Android**, no aparelho que relatou o fechamento se possível:
     responder a pergunta do dia algumas vezes seguidas. Se fechar, a próxima
     abertura deve relatar o último passo em `app_erros`, e é ISSO que a gente
     quer desta versão, mesmo que ela não conserte.
  3. **A compra pela loja**, com uma conta de teste: assinar e conferir que a
     confirmação aparece sozinha, sem precisar fechar e reabrir.
  4. Abrir Estudos e conferir que as quatro aulas de setembro mostram a capa
     nova, e que a aula da serra não está mais com a arte cortada.

---

## Os números desta versão

- **Android**: o envio queimado de 03/09 saiu com versionCode **54** e a Play
  ACEITOU (a Apple é que recusou, pelo nome de versão). Ou seja, 54 está gasto.
  O piso do `gradle.properties` foi para 55. Confirmar no log a linha
  `versionCode deste envio: N`, que é a única fonte que vale.
- **iOS**: build esperado igual ao do Android, pelo mesmo contador. Confirmar
  no TestFlight antes de escrever em qualquer lugar.

## Bumpar /api/app/latest: NÃO, ainda

A regra de sempre: `/api/app/latest` aponta para o que está em **PRODUÇÃO**,
não para o que está em análise. Só mexer depois da aprovação nas duas lojas, e
com o número do log na mão.
