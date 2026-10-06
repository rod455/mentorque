# Novidades da versão 3.1

Aberta em 05/10/2026, logo depois de a 3.0 ser aprovada nas duas lojas. Tudo o
que entra aqui **já roda na web** pelo deploy da Vercel; o binário só importa
para o app das lojas.

**Onde a 3.1 está:** fechada para build em 06/10 à noite, a pedido do dono
("Vamos colocar tudo e enviar para iOS e Android aprovar. Versão 3.1").
Ainda não gerada.

**Árvore do build:** (escrever o commit NA HORA de apertar o botão do
Codemagic, antes de qualquer frase sobre o que o binário tem. A 3.0 saiu sem
o item principal da nota porque esta linha não existia; a `conferir:versoes`
cobra que cada item citado abaixo seja ancestral dela.)

**Onde a 3.0 está:** aprovada em 05/10 nas duas lojas, build 70, árvore
18ece86. Sem o Início novo e sem a aba Biela, que são o item 1 daqui.

## O que vai NO BINÁRIO, e o que já está no ar

`lib/app/**` e `components/app/**` são o app e **precisam de build**;
`app/api/**`, o site e a landing vão ao ar no push; as aulas são sobrescritas
remotamente por `/api/lessons`, então também vão ao ar no push.

### Vai no binário, e a pessoa sente

1. **O Início tem uma ação só** (04/10, commit 28f13e1). A pergunta "O que
   está acontecendo com o seu carro?" é a porta para todo mundo, com três
   atalhos (Barulho, Luz do painel, Cheiro) que abrem o chat já preenchido.
   Ficou fora da 3.0 por ter entrado na `main` depois da árvore do build 70.
2. **O Início em oito blocos, e o sistema visual novo** (06/10, commit
   3e19e9e). Card virou linha com fio; nascem a fila de atalhos (Abastecer,
   Serviço, Revisões, Orçamento; no modo motorista, Meu dia), a linha do
   carro com km e saúde, UMA pendência por vez (data a vencer, km parado há
   mais de um mês, ou km nunca informado), os gastos do mês com a semana e o
   custo por km, "Descubra mais" com aulas em linha e "Problemas comuns".
   Saíram a busca, fixados, salvos, o carrossel, o kit, Memórias e a folha
   mensal de km, que virou pendência e só abre no toque. O "?" flutuante
   virou ícone de conversa, o chip do quiz diz "Quiz", zero emoji. A arte da
   Biela na garagem fica. Nasce o evento `clicou_atalho`.
3. **Aprender em linhas** (06/10, commit fce0acd). Sem o card do Biela,
   trilhas com o progresso à direita e a barra só depois de começar, cinco
   à vista e "Ver todas as trilhas".
4. **Calendário com número grande** (06/10, commit 812e83f). Gastos em 12
   meses, média por mês, atalhos, o aviso do limite do grátis aos 18
   registros como linha, e a linha do tempo em linhas sem emoji.
5. **Aba Carros como hub** (06/10, commit e9f7c49). A arte da garagem sai
   da aba (fica no Início), a lista vira linhas; dentro do carro, a saúde
   como número grande, atalhos, as pendências do cadastro numa linha com
   contagem, e os seis cards viram linhas.
6. **"O Biela" em todas as frases, e depoimentos reais** (06/10, commit
   df038a4). O app alternava "a Biela" e "o Biela"; e o onboarding ainda
   mostrava dois depoimentos inventados ao lado dos dois reais. Entram
   reais, literais, com o nome e a loja.
7. **Descubra mais dinâmico e os problemas comuns à vista** (06/10, commit
   976cf55). A ordem: o que a pessoa fixou, a leitura da luz do painel
   (OBD2), uma aula nova com selo, a mais vista por todo mundo (o catálogo
   passa a trazer `populares`, contado no funil), e as sugestões pelo carro.
   Dois problemas comuns em linha no Início e "Ver todos". A tela de
   sintomas ganhou a mesma gramática.
8. **A aba Biela abre a tela de problemas** (06/10, commit b2ce634). Decisão
   do dono: a aba abre arte, busca, problemas comuns e sistemas, e o chat
   fica a um toque no botão "Falar com o Biela", para todo mundo. O chat
   continua sendo a porta do Início.
9. **Um portão só para o Premium, com contorno** (06/10, commits 770c0b1 e
   0426bed). O app dizia "isso é pago" de seis jeitos; agora é uma linha
   só em toda tela, com contorno âmbar: o título é o ganho e a linha de
   contexto é o que fica de fora no gratuito. No Início, três linhas (Biela
   sem limite, plano de revisão completo, histórico sem limite e relatório),
   cada uma com o seu contexto no paywall. Nenhum preço e nenhum plano
   mudou.

### Já foi ao ar, e não espera build

1. **O catálogo traz as aulas mais vistas** (`/api/lessons`, `populares`),
   contadas em `viu_aula` nos últimos 30 dias. O app antigo ignora o campo.
2. **O guia da luz da injeção aprofundado** (Conteúdo, 06/10).

## A nota das lojas

Escrita pela regra da casa: fala do ganho, não do defeito; verbo na ação da
pessoa; nada que não tenha sido conferido. Dentro dos 500 da Play. A mesma
nota serve para a Apple.

```
O Início ficou mais limpo: uma pergunta ao Biela, atalhos para abastecer, registrar serviço e ver revisões, e logo abaixo o seu carro, os gastos do mês e uma pendência por vez.

A aba Biela abre os problemas comuns do seu carro, e o chat fica a um toque.

O Calendário mostra os gastos em 12 meses e a média por mês. Aprender e Carros ganharam o mesmo visual, mais leve.

E o Premium passou a dizer, em cada tela, o que você ganha com ele.
```

Em inglês:

```
A cleaner Home: one question to Biela, shortcuts to fuel up, log a service and see upcoming service, and right below it your car, this month's spend and one pending item at a time.

The Biela tab opens your car's common problems, and the chat is one tap away.

The Calendar shows 12-month spend and the monthly average. Learn and Cars got the same lighter look.

And Premium now says, on every screen, what you get with it.
```

## Plugin nativo nesta versão

Nenhum plugin novo e nenhuma mudança em `capacitor.config.ts`. O que mudou em
`android/` e `ios/` desde a árvore da 3.0 é só o nome da versão (3.1) e o piso
do versionCode (71). A regra de 09/09 (ler o fonte do plugin no caminho que o
app usa) não tem objeto aqui.

## Roteiro de aparelho, escrito ANTES do build

Regra do dono de 09/09/2026: build sem roteiro não sai, e conferência verde
prova o que a conferência olha, não o binário. **Nenhuma suíte daqui alcança a
WebView do aparelho.**

1. **O Início em oito blocos, com carro.** Abrir com carro cadastrado: a
   pergunta com os três atalhos; a fila Abastecer, Serviço, Revisões,
   Orçamento; a linha do carro com km e saúde; os gastos do mês; "Descubra
   mais"; dois problemas comuns; o bloco do Premium com contorno. Nada
   cortado num celular estreito (360px). Tocar em "Luz do painel" abre o
   chat com a frase já escrita.
2. **A pendência de km parado.** Com um carro cujo km foi informado há mais
   de 30 dias, a linha "Atualizar a quilometragem" aparece e NENHUMA folha
   abre sozinha. Tocar na linha abre a folha; salvar o mesmo número fecha a
   folha e a linha some.
3. **A aba Biela.** Abre a tela de problemas (arte, busca, problemas comuns,
   sistemas). "Falar com o Biela" abre o chat; voltar devolve à tela de
   problemas. Perguntar algo e receber resposta.
4. **Calendário.** O número grande dos 12 meses e a média; os atalhos levam
   às telas certas; a linha do tempo abre cada registro.
5. **Carros.** A lista em linhas; dentro do carro, a saúde grande, os
   atalhos, a linha de pendências abre a lista e cada item leva ao lugar.
6. **Estudos.** Trilhas em linha; "Ver todas as trilhas" expande; uma trilha
   abre pelo toque na linha.
7. **O Premium.** As linhas com contorno abrem o paywall; no iPhone, chegar
   até a folha da Apple (pode cancelar nela). No Android, idem com a Play.
8. **O quiz e o "?".** O chip "Quiz" na barra de cima abre o quiz; o botão
   flutuante com ícone de conversa abre "Fale com a gente".

## O que este build NÃO conserta, e não pode ser dito como se consertasse

1. **A nota da 3.0 nas lojas** prometeu a aba Biela; a 3.1 é o que cumpre.
2. **O `topPaginas` do Search Console** vazio é credencial no n8n, clique do
   dono, nada a ver com binário.
3. **As apostas abertas** (`inicio-pergunta-unica`, `aba-biela`,
   `portao-unico-do-premium`) passam a valer no app com esta versão; a
   leitura separa por plataforma e por versão.

## Antes de promover a produção

- `npm run conferir` inteiro, a bateria completa de navegador e o build local
  (regime de release, não o das duas velocidades): feitos em 06/10 à noite,
  ver o diário;
- **escrever a árvore do build nesta ficha no momento do botão**, e conferir
  com `git merge-base --is-ancestor <commit do item> <árvore>` que cada item
  está nela: é o que faltou na 3.0;
- depois do envio, ler a hora de envio na Apple (fluxo manual `Engenharia:
  builds da App Store` no n8n) e compará-la com a hora do commit da árvore;
- acrescentar `3.1` à lista `JA_PUBLICADAS` e a árvore em `ARVORE_DO_BUILD`
  em `scripts/verifica-versoes.mjs` **só depois** da aprovação;
- o `/api/app/latest` aponta para o que está em PRODUÇÃO: esperar a
  aprovação e usar o número do log do Codemagic (`versionCode deste envio: N`).
