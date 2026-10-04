# Novidades da versão 3.0

Aberta em 30/09/2026, logo depois de a 2.9 ser aprovada nas duas lojas. Tudo o
que entra aqui **já roda na web** pelo deploy da Vercel; o binário só importa
para o app das lojas.

**Onde a 2.9 está:** aprovada em 30/09 (Play antes, Apple no dia), build 69,
nas duas lojas.

## O que vai NO BINÁRIO, e o que já está no ar

A separação importa: sem ela a conta do release sai dobrada e a ficha promete o
que a loja não entrega. A regra de bolso, que já custou confusão aqui:
`lib/app/**` e `components/app/**` são o app e **precisam de build**;
`app/api/**`, o site e a landing vão ao ar no push; as aulas
(`lib/app/conteudo/aulas.ts`) são sobrescritas remotamente por `/api/lessons`,
então também vão ao ar no push.

### Vai no binário, e a pessoa sente

1. **Cadastrar o carro virou uma tela só** (02/10). O formulário curto venceu
   o A/B que rodou desde 15/09 e vira o padrão para todo mundo: marca, modelo e
   ano, sem a segunda etapa. Quem chegava na tela longa desistia mais.
2. **Dois depoimentos reais no onboarding e no paywall** (04/10). Os textos
   eram inventados; agora são trechos literais de avaliações públicas da App
   Store, com o apelido de quem escreveu e "via App Store" (aminoru, 13/09;
   munizluiz, 04/09). Os dois primeiros do onboarding continuam.
3. **Os números da página "Amado por motoristas" passam a ser medidos**
   (04/10). Antes "4,8", "10.000+ diagnósticos" e "5.000+ motoristas", que
   nenhum instrumento sustentava. Agora "5,0 nas avaliações das lojas" (12
   avaliações, todas 5 estrelas), "170+ diagnósticos" (178 consultas de
   sintoma no funil desde 13/09, quando o evento nasceu) e "250+ motoristas"
   (254 aparelhos Android ativos em 25/09, relatório do Play). Pisos, com a
   fonte no comentário do código.
4. **O Início tem uma ação só, e a aba "Problemas" virou "Biela"** (04/10,
   noite). A pergunta "O que está acontecendo com o seu carro?" é a porta para
   todo mundo, com ou sem carro, com três atalhos (Barulho, Luz do painel,
   Cheiro) que abrem o chat já preenchido. O carro é o segundo bloco,
   "Registrar serviço" e "Aprender" são as secundárias, o Premium desceu para
   o fim da tela e a grade de ações rápidas saiu. Na barra de baixo, a aba
   "Problemas" passou a chamar "Biela" e abre o chat; os sintomas continuam
   inteiros, a um toque dentro do chat e nos problemas comuns do Início.
   Apostas `inicio-pergunta-unica` e `aba-biela` do caderno.
5. **O iPhone passa a se declarar em português** (04/10). A página pública da
   App Store dizia "Idioma: EN, Inglês" porque o binário só declarava `en`
   (`Info.plist` e `knownRegions`); a localização principal da ficha já era
   Português (Brasil). Agora `pt-BR` e `en`. O sinal é a página dizer "PT"
   depois de publicada.

### Vai no binário e ninguém vê (medição e robustez)

6. **A compra pela loja sai com identidade** (02/10). O `initPurchases` do
   onboarding passava `null`; a folha da Apple abria com o id anônimo do
   RevenueCat mesmo com a pessoa logada, e o webhook perdia a venda com um 200.
   Agora a compra leva o `appUserID`, e identidade inútil vira linha em
   `app_erros` com a chave de busca. O caso de 25/09 (uma assinatura ativa no
   RevenueCat e nenhuma no banco) é o que isto existe para não repetir.
7. **A subida do SDK da AppsFlyer tenta três vezes e diz por que falhou**
   (03/10). Na 2.7.0, 24% dos aparelhos Android nunca subiam o SDK e o funil
   gravava só "erro". Agora são três tentativas com espera crescente e, se
   todas falharem, o desfecho vai com o motivo (`erro:<slug>`), uma linha por
   aparelho. Isto NÃO é cura: é a testemunha passando a dizer o que viu. A
   leitura é no funil, evento `atribuicao`, uma semana depois.

### Já foi ao ar, e não espera build

1. **As perguntas ao Biela passaram a dizer sobre o que são** (29 e 30/09).
   Toda pergunta grava duas etiquetas, origem (atalho da tela, tela de
   sintoma, digitada, continuação de conversa) e tema (freios, elétrica,
   arrefecimento, motor...), sem guardar o texto. O retrato imprime as duas
   metades separadas, porque somar atalho com pergunta digitada mede a ordem
   dos nossos botões e não a demanda. Regra em `lib/biela/perguntaLida.ts`.
2. **O alarme de erros virou razão** (29/09). O Vigia disparava em
   `total >= 20` relatos; agora decide por aparelhos com defeito sobre
   aparelhos ativos, com desistência de login fora da conta. Regra em
   `lib/alarmeDeErros.ts`.

## As duas dívidas da 2.9 entraram, na noite do build (04/10)

Eram as duas que a 2.9 deixou para trás de propósito. O dono mandou: "vamos
colocar uai". Entraram como itens 8 e 9 do binário, cada um com a sua
conferência plantada e mordendo (`conferir:biela` e `conferir:alarme`).

8. **O 👎 grava no toque.** Até a 2.9 a tela só mandava o voto negativo junto
   com o motivo (`components/app/screens/Biela.tsx`), e quem tocava e fechava
   não deixava rastro: 24 votos em seis semanas, todos positivos, e isso não
   era aprovação. Agora o toque grava e a rota devolve o id; o motivo, se a
   pessoa escolher, completa a MESMA linha (`/api/biela-voto` com `id`).
   Quem toca 👎 e muda para 👍 também completa a linha, sem duplicar.
9. **A desistência de login sai com o tipo certo.** `relatarLoginNativo`
   passa a gravar `tipo = "desistencia"` quando a frase é de cancelamento,
   pela mesma régua do leitor (`classeDoErro`), e o leitor aceita o tipo
   antes da frase. As linhas antigas continuam classificadas pela frase. O
   que muda para quem olha `app_erros` cru: 22 erros deixam de parecer 22.

## A nota das lojas

Escrita pela regra da casa: fala do ganho, não do defeito; verbo na ação da
pessoa; nada que não tenha sido conferido. 436 caracteres, dentro
dos 500 da Play. A mesma nota serve para a Apple.

```
Cadastre o carro em uma tela só.

Marca, modelo e ano, e pronto: o Mentorque já monta o calendário de revisões do seu carro. Sem segunda etapa.

Assinou pela loja? O Premium fica ligado à sua conta, e entra junto com você em qualquer aparelho.

O Biela ganhou a própria aba: descreva o barulho, a luz ou o cheiro e ele responde na hora.

E a página de boas-vindas agora mostra o que as pessoas escrevem de verdade nas lojas sobre o app.
```

**O que ficou DE FORA da nota, de propósito:** a medição da AppsFlyer, a
identidade da compra (a pessoa sente o ganho, não o mecanismo; a frase da nota
já diz o ganho) e o idioma declarado do iPhone. "Melhoramos nossa telemetria"
é texto que só ocupa espaço.

## Plugin nativo nesta versão

Nenhum plugin novo e nenhuma mudança em `capacitor.config.ts`. O que mudou em
`ios/` é configuração de idioma (`Info.plist` e `knownRegions`), não código de
plugin. A regra de 09/09 (ler o fonte do plugin no caminho que o app usa) não
tem objeto aqui; a `conferir:versoes` cobra que a declaração de idioma não
suma num `cap sync`.

## Roteiro de aparelho, escrito ANTES do build

Regra do dono de 09/09/2026: build sem roteiro não sai, e conferência verde
prova o que a conferência olha, não o binário. **Nenhuma suíte daqui alcança a
WebView do aparelho.**

**O que NENHUMA conferência alcança nesta versão:**

1. **O cadastro curto no celular, ponta a ponta.** Conta nova, chegar na tela
   de adicionar carro, conferir que é UMA tela (marca, modelo, ano) sem
   segunda etapa, salvar, **fechar o app, abrir de novo** e ver o carro na
   garagem. O passo de fechar e abrir é o que prova que gravou.
2. **A compra pela loja, no iPhone, com a pessoa logada.** Abrir o paywall,
   tocar em assinar, chegar até a folha da Apple (pode cancelar nela). No dia
   seguinte, conferir no banco: `app_erros` NÃO pode ter linha de "identidade
   inútil" para o aparelho de teste. Se a compra for concluída de verdade, a
   assinatura tem que aparecer em `assinaturas` com o usuário certo.
3. **A atribuição.** Instalar a 3.0 pela loja num Android, abrir o app uma vez,
   e no dia seguinte olhar o funil: evento `atribuicao` daquele aparelho com
   `ok`, ou `erro:<motivo>`. Qualquer um dos dois é sinal; "nada" é a falha
   antiga.
4. **O idioma do iPhone.** Depois de publicado, abrir a página pública do app
   na App Store: o campo "Idioma" tem que dizer PT (ou PT e EN), não só EN.
   E o app abre em português num iPhone em português, como antes.
5. **A página "Amado por motoristas".** No onboarding, conferir que os dois
   últimos depoimentos trazem "via App Store" e que os números são 5,0 /
   170+ / 250+. Nada pode estar cortado nos cartões inclinados; o texto do
   aminoru é o mais comprido.
6. **O 👎 sem motivo.** Perguntar algo ao Biela, tocar no polegar para baixo
   e FECHAR o app sem escolher motivo. No dia seguinte, `biela_votos` tem que
   ter uma linha `down` com `motivo` nulo daquele aparelho. Depois, numa
   segunda resposta, tocar 👎 e escolher "incompleta": a linha é UMA, com o
   motivo preenchido, não duas.
7. **O Início novo e a aba Biela.** Com carro cadastrado, o Início abre com a
   pergunta e os três atalhos; tocar em "Luz do painel" abre o chat com a
   frase já escrita. A barra de baixo mostra "Biela" no lugar de "Problemas",
   e dentro do chat o atalho "Ver sintomas comuns" abre a tela de sintomas
   de sempre. Nada pode estar cortado no herói num celular estreito.

## O que este build NÃO conserta, e não pode ser dito como se consertasse

1. **A falha do SDK da AppsFlyer no Android.** O build faz a falha dizer o
   motivo; não a elimina. A frase honesta continua "sem sinal ainda" até a
   primeira semana de `atribuicao` da 3.0 no funil.
2. **As duas dívidas da 2.9** continuam: desistência de login gravada como
   erro, e o voto negativo do Biela sem rastro quando a pessoa não escolhe
   motivo. Nenhuma das duas entrou nesta versão.
3. **O vínculo Google Ads e AppsFlyer** foi feito nos dois consoles em 04/10,
   mas é de painel, não de binário: a 3.0 não tem nada a ver com ele
   aparecer ou não.

## Antes de promover a produção

- `npm run conferir` inteiro, a bateria completa de navegador e o build local
  (regime de release, não o das duas velocidades);
- `npm run conferir:versoes` já diz 3.0 nos três lugares, ainda não publicada,
  e com o piso do versionCode (70) acima do que está na Play (69);
- acrescentar `3.0` à lista `JA_PUBLICADAS` em `scripts/verifica-versoes.mjs`
  **só depois** da aprovação;
- o `/api/app/latest` aponta para o que está em PRODUÇÃO: bumpar com a versão
  em análise acende o aviso de "versão nova" para todo mundo, apontando para
  algo que ninguém consegue baixar. Esperar a aprovação e usar o número do
  log do Codemagic (`versionCode deste envio: N`).
