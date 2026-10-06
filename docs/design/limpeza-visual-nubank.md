# Limpeza visual do app: o que o Nubank faz e o que cabe aqui (06/10/2026)

Pedido do dono, ao ver a 3.0 no aparelho: "para o usuário logado, não mudou
nada né? queria deixar o app mais clean. Dê uma olhada no app do Nubank".

## O que a 3.0 mudou, e o que não mudou, para quem já tem carro

Mudou a ORDEM do Início, não o visual. Para quem tem carro: o herói virou a
pergunta ao Biela com três atalhos (antes era "O que vamos cuidar hoje?"
mandando para os sintomas), o carro desceu para o segundo bloco, entrou o par
"Registrar serviço" e "Aprender", a grade de quatro ações rápidas saiu, e o
card do Premium foi do topo para o fim. A aba "Problemas" virou "Biela".

Não mudou: a linguagem visual inteira (cards com borda, três fontes, emojis,
três carrosséis), e as abas Carros, Calendário, Estudos e Perfil. É por isso
que a sensação de "não mudou nada" é justa: a 3.0 reordenou, não limpou.

## Como foi olhado

Fotos do app como está (semente: um carro, dois serviços, dois
abastecimentos), em `/app`, 390px, nas cinco abas e no Perfil. Do lado do
Nubank, a leitura é da gramática do app como ele é (versões até 2026); daqui
não dá para abrir o app deles, então se o dono mandar prints, a comparação
sai lado a lado em cima deles.

## A gramática do Nubank, em seis regras

1. **Uma coluna de seções, não de cards.** A home é uma lista: cada seção tem
   um título com seta, UM número grande, uma linha de contexto e no máximo
   uma ação. Seções se separam por um fio, não por caixa. Caixa dentro de
   caixa não existe.
2. **Uma família tipográfica.** A hierarquia vem do tamanho e do peso, não
   de trocar de fonte. Número grande, rótulo pequeno em cima.
3. **Uma cor de marca e um fundo.** O roxo fica no cabeçalho e em poucos
   botões; o corpo é neutro; cor de estado aparece só onde há estado.
4. **Uma família de ícones, traço único, monocromática.** Zero emoji.
5. **Ações rápidas num trilho de botões redondos com rótulo curto** (Pix,
   Pagar, Transferir). Um trilho, logo abaixo do número principal.
6. **O detalhe mora um toque abaixo.** A home mostra o número; o resto abre
   pela seta. Nenhuma seção passa de três linhas.

(O Nubank não tem barra de abas. A nossa fica: `aba-biela` está aberta e
a barra é parte do que ela mede.)

## O que o nosso Início faz hoje, contra essas regras

Da foto de 06/10, no primeiro rolo de tela:

- **Três sistemas visuais na mesma tela.** Herói ilustrado com título em
  serifa; cards com anel de borda; emojis (⛽ 📊 📌 ★ 📅 🚕) ao lado de ícones
  de traço; ilustrações de giz nos carrosséis; dois estilos de botão (âmbar e
  verde); card do Premium em degradê. Regras 2, 3 e 4.
- **Tudo é card.** Nove caixas antes da busca, e carrosséis de caixas com
  anel âmbar depois. Sem fio, sem respiro, nada descansa o olho. Regra 1.
- **Três fontes.** Serifa nos títulos de seção, display nos cards, sans no
  corpo. Regra 2.
- **Os números não têm o mesmo molde.** "51%" no canto do card do carro;
  "R$ 230 · R$ 0,38 por km" numa linha com emoji; "Setembro do Golfinho:
  R$ 2.390" em outro card. Regra 6 pede um molde só: rótulo em cima, número
  grande, contexto embaixo.
- **Dois "?" com dois sentidos.** O chip do quiz na barra de cima e o botão
  flutuante de dúvida embaixo à direita (pedido do dono em 09/09). Na foto,
  o flutuante cobre a ponta do card do mês.
- **Três carrosséis** (Para você, Memórias, Problemas comuns), cada um com
  capas ilustradas e borda. O Nubank tem um, "Descubra mais", no fim.

Nas outras abas:

- **Carros** repete a arte da garagem do Início em largura total, com o mesmo
  "51%" logo abaixo: a mesma foto duas vezes a um toque de distância.
- **Calendário** chama "Calendário" e mostra o histórico de lançamentos.
- **Estudos** empilha doze trilhas, cada uma um card com barra de progresso
  em zero, mais oito azulejos de tema: um muro de zeros antes de qualquer
  aula.
- **Perfil** é a tela mais perto do Nubank que temos (linhas com ícone e
  seta). Só os quadrados coloridos atrás dos ícones destoam.

## O que proponho

A regra do dono de 04/10 fica: os gifs, as animações e a Biela na garagem
não saem. Limpar não é tirar a marca; é tirar o ruído em volta dela.

### Fatia 1: o sistema (vale para o app inteiro, sem mexer em ordem de bloco)

1. Uma fonte de título. A serifa fica só na pergunta do herói, que é a voz da
   marca; seções e cards usam a display. (Ou nem isso: decisão do dono.)
2. Card vira seção. O `Card` de `components/app/ui.tsx` perde o anel e o
   fundo; blocos se separam por um fio de 1px a 6% de branco. Mesmo conteúdo,
   mesma ordem, menos caixa.
3. Um molde de número: rótulo pequeno em caixa alta, número grande, uma linha
   de contexto, seta à direita. Carro, gastos e mês usam o mesmo.
4. Uma família de ícones. Os emojis saem e entram os ícones de traço que o
   app já tem (`Icon`). Os quadrados coloridos atrás dos ícones do Perfil
   viram monocromáticos.
5. Uma cor de ação: âmbar. O botão verde "Abasteci" vira secundário (só
   contorno) ou âmbar. O degradê do Premium sai; vira uma linha "Premium ·
   7 dias grátis ›" no fim, como as outras.
6. Um "?" só. O chip do quiz ganha rótulo ("Quiz") e o flutuante de dúvida
   ganha ícone de conversa, para que o mesmo sinal não signifique duas coisas.

### Fatia 2: a estrutura do Início (toca a aposta aberta)

7. Trilho de ações redondas abaixo do carro, à la Pix/Pagar: Abasteci ·
   Serviço · Km · Aprender. Substitui o par de cards secundários e o botão
   dentro do card de custo.
8. "Setembro do Golfinho" deixa de ser card e vira a segunda linha da seção
   Gastos.
9. Dos três carrosséis fica um: "Para você" (é o motor de conteúdo).
   "Memórias" vira uma linha com contagem e seta. "Problemas comuns" sai do
   Início e fica onde já está: dentro do Biela ("Ver sintomas comuns") e na
   tela de sintomas.

### Fatia 3: as abas

10. Carros: a arte da garagem fica no Início; a aba mostra a foto ou o avatar
    do carro, e o número de saúde aparece uma vez.
11. Calendário: ou vira calendário (próximas revisões e datas no topo,
    histórico abaixo), ou muda de nome para Histórico. Hoje o nome promete
    uma coisa e a tela entrega outra.
12. Estudos: trilhas como linhas (nome, nível, "0/7" à direita, fio entre
    elas), barra de progresso só depois que a trilha começa, quatro trilhas
    à vista e "Ver todas".

## A ordem, pela régua do CRO

O Início está congelado por `inicio-pergunta-unica` e `aba-biela` (abertas
em 04/10, leitura direcional a partir de 18/10). A fatia 1 muda o sistema,
não a ordem nem o conteúdo dos blocos, mas é mudança visível na área medida,
então entra DECLARADA no dia na ficha das duas apostas, como a regra de 02/10
pede. A fatia 2 mexe em bloco e tira "Problemas comuns" do Início, que toca
`consultou_sintoma`, a guarda de `aba-biela`: ela espera a leitura de 18/10.
A fatia 3 não toca aposta nenhuma e pode começar agora.

Proposta de sequência: fatia 3 e fatia 1 nas abas fora do Início esta semana,
uma tela por commit, com a suíte de navegador da área; fatia 1 no Início
junto com a leitura direcional de 18/10; fatia 2 depois do veredito.

Cada fatia tem foto antes e depois (`scripts/navegador/` já sabe tirar), e a
suíte `telas` ganha uma linha que conta emojis e fontes na tela: zero emoji
no Início é conferência que morde.

## A proposta "área logada com a lógica do Nubank" (06/10), lida contra o código

O dono mandou um segundo documento, da mesma fonte do spec de 04/10. Ele
chega às mesmas seis regras por outro caminho (os dois redesigns públicos do
Nubank, 2021 e 2022) e vai mais longe em três pontos: a Home em oito blocos
com ordem fixa, um portão de Premium só, e pendência como linha em vez de
folha modal. O que concordo, o que discordo e o que conferi:

**Concordo, e entra no corte da 3.1:**

- A Home em oito blocos (seção 3), com a ordem fixa decidida por dado e sem
  carrossel. É a versão mais radical da minha fatia 2 e é melhor: "Para você"
  vira duas linhas no fim ("Descubra mais", P7), fixados e salvos vão para
  Aprender, Memórias e fase vão para o Perfil. Dois ajustes meus: "Problemas
  comuns" não sai da Home, vira UMA linha com seta (P4) como último bloco,
  porque `consultou_sintoma` é a guarda da aposta `aba-biela`, e o convite de
  aviso continua como está (virar pendência é a aposta 10, com teste).
- A linha de atalhos (P3): Abastecer, Serviço, Revisões, Orçamento (a tela de
  orçamento por foto existe: rota `orcamento`). Antes de ela entrar, nasce o
  evento `clicou_atalho` com o nome do atalho; sem ele a linha não tem
  leitura. `registrou_servico` e `aceitou_convite_aviso` já existem.
- Pendência como linha (P5): a mais próxima, uma só, no lugar da folha
  mensal de km. A folha de km sai; o convite de aviso fica como está.
- O hub do carro com a gramática de tela de produto (seção 4): número grande,
  atalhos, pendências numa linha com contagem, produtos em linhas. Entra como
  conteúdo da aba Carros de hoje, sem mexer na barra.
- Calendário (seção 5): número grande, atalhos, chips, linha do tempo; o
  aviso do limite do grátis aos 18 registros em vez da surpresa no 21.
- Aprender (seção 6) sem o card do Biela e com trilhas em linha. O quiz fica
  no cabeçalho por enquanto (ver "discordo").
- Dois dos seis "defeitos" da seção 9 são reais e entram: "o Biela" e "a
  Biela" alternam em `content.ts` (24 contra 6; fica "o Biela", que é o que a
  Home e a nota das lojas dizem), e o onboarding ainda mostra dois
  depoimentos inventados ("Marina S." e "Carlos E.") ao lado dos dois reais,
  contra a regra de 04/10. Os dois saem e entram dois reais de
  `docs/lojas/respostas.md`.

**Discordo, ou fica para depois:**

- Abas de cinco para quatro e o "?" flutuante fora (seção 2): navegação é a
  aposta 11 do próprio documento, e o "?" foi pedido do dono em 09/09. Na
  3.1 o "?" ganha ícone de conversa e o chip do quiz ganha rótulo; o resto
  espera.
- Um portão de Premium só, `LinhaPremium` (seção 7): é a melhor ideia do
  documento e a de maior superfície (seis telas e o componente). Mexe no
  degrau `viu_paywall` por contexto, que `login-sabe-que-veio-comprar` lê.
  É a aposta 9, logo depois da 3.1, sozinha, com `viu_paywall` por `ctx`
  lido antes e depois.
- Tirar o quiz do cabeçalho (seção 6, aposta 12): o quiz é a máquina de três
  manhãs; sai do cabeçalho só com número.
- "neista mês" em `Biela.tsx` (seção 9, item 1): não existe no código de
  hoje. Moraes455 (item 4) já está fora da conta em `respostas.md`; Triplyze
  (item 5) e as doze sem resposta (item 6) já estão lá como pedido ao dono.

**O que o documento diz e eu conferi:** a rota de orçamento por foto existe;
os eventos `registrou_servico` e `aceitou_convite_aviso` existem em
`lib/funilCorreto.ts`; `clicou_atalho` e `ligou_avisos` não existem (o
segundo é coberto por `aceitou_convite_aviso`); os sete fechamentos na Home
são da migalha própria (`app_erros`), não do Play, que suprime vitals.

## O corte da 3.1, fechado

1. Sistema: card vira seção com fio, um molde de número, uma fonte de título
   (serifa só na pergunta), emojis viram ícones, uma cor de ação, "?" com
   ícone de conversa e quiz com rótulo.
2. Home em oito blocos: cabeçalho, aviso de versão, pergunta com chips,
   atalhos (com `clicou_atalho`), linha do carro, uma pendência, gastos do
   mês, "Descubra mais" com duas aulas, e "Problemas comuns" como linha.
3. Aba Carros: hub com número grande, atalhos, pendências em linha, produtos
   em linhas.
4. Calendário: número grande, atalhos, chips, linha do tempo, aviso aos 18.
5. Aprender: sem o card do Biela, trilhas em linha, salvos dentro.
6. Texto: "o Biela" em tudo; dois depoimentos inventados saem do onboarding.

Fora da 3.1, cada uma como aposta própria: `LinhaPremium` (9), convite de
aviso como pendência (10), abas (11), quiz fora do cabeçalho (12).

Régua: uma tela por commit com a suíte da área e foto antes e depois; as
fichas de `inicio-pergunta-unica` e `aba-biela` recebem no dia a nota de que
a versão B mudou; a bateria completa e o build local antes do botão; a árvore
escrita na ficha da 3.1 na hora do botão.
