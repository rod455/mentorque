# Novidades da versão 2.9

Aberta em 25/09/2026, logo depois de a 2.8 ser aprovada. Tudo o que entra aqui
**já roda na web** pelo deploy da Vercel; o binário só importa para o app das
lojas.

> **PUBLICADA, build 69, nas duas lojas.** A Play primeiro (84 aparelhos já
> reportavam `2.9.0` no nosso funil em 28/09) e a Apple em **30/09/2026**. O
> banner de versão nova foi aceso no mesmo commit em que esta linha foi
> escrita, e o repositório abriu a 3.0.
>
> Uma ressalva honesta sobre a prova do iPhone: do lado de cá ela ainda não
> existe. A coleta do `app_store_connect` é das 6h e naquela hora a 2.9
> respondia `WAITING_FOR_REVIEW`; a aprovação veio depois. O retrato de amanhã
> confere sozinho. Se não trouxer `READY_FOR_SALE`, o campo `ios` de
> `app/api/app/latest/route.ts` é o primeiro lugar a olhar.

**Onde a 2.8 está:** aprovada em 24/09, build 68, nas duas lojas. Ainda são
**159 aparelhos Android** nela, que é exatamente quem o banner vai chamar.

## O que vai NO BINÁRIO, e o que já está no ar

A separação importa: sem ela a conta do release sai dobrada e a ficha promete o
que a loja não entrega.

### Vai no binário, e a pessoa sente

1. **Moto deixa de ser promessa** (27/09). O seletor Carro/Moto existia e
   funcionava desde sempre; o catálogo é que tinha **6 marcas e 37 modelos**,
   contra 24 e 235 de carro. E o erro mais caro era de NOME: a família CG é a
   moto mais comum do Brasil e estava lá só como "CG 160". Quem digitava
   "Titan" ou "Fan", que é o que está escrito no tanque, recebia "Nenhum carro
   encontrado" e ia embora. O banco concordava: **68 veículos cadastrados e
   nenhum do tipo moto**. Agora são **14 marcas e 156 modelos**, por nome de
   tanque, com as marcas que faltavam inteiras (Haojue, Shineray, Dafra,
   Harley-Davidson, Triumph, KTM, Ducati, Kasinski).
2. **A tela para de dizer "carro" quando Moto está escolhido** (27/09).
   Título, rótulo do campo, exemplos do placeholder e, o pior de todos, a
   mensagem de busca vazia. O texto desmentia o seletor.
3. **A lista de Versão / motor aparece inteira** (28/09). Relato com foto: uma
   pessoa cadastrando um Creta Ultimate 2.0 22/23, a lista parando em "Creta
   Limited" e a frase "não tem ele aqui". A FIPE tinha, e a nossa rota devolvia
   o carro dela na **posição 29 de 29**: a tela cortava em 12, e o décimo
   segundo item era exatamente a última linha da foto. **Metade deste conserto
   já está no ar** (a rota), e é esta metade que precisa do binário.
4. **O convite de aviso para de queimar na mão de quem não tem conta**
   (27/09). A marca que leva o convite do cadastro do carro até a garagem era
   consumida ao montar a tela, sem olhar se havia conta. Como o convite só é
   desenhado para quem tem conta, quem cadastrava como convidado queimava o
   momento sem ver convite nenhum.
5. **A porta de entrada inverteu: pergunta primeiro, cadastro depois**
   (28/09, decisão do dono). O Início de quem não tem carro dizia "Vamos
   cadastrar o seu primeiro carro", com o botão grande indo ao formulário e um
   "Explorar sem cadastrar" em 13px e 60% de opacidade. A primeira coisa que o
   app pedia era trabalho.
   - Os números dessa ordem: **cinco em seis** que abrem o formulário nas lojas
     não terminam, `comecou_onboarding` é a **última ação de 78,7%** na web
     (base 54,9% da plataforma), e é a mesma tela onde se concentram os
     fechamentos. Era o maior vazamento do produto, e estava na porta.
   - Agora o botão grande é **"Perguntar para o Biela"**, e o cadastro fica logo
     abaixo, a um toque: a troca é de ORDEM, não de esconder o cadastro.
   - Depois da resposta, e **só** depois dela, aparece o convite: *"Essa
     resposta serve para qualquer carro. Me diga qual é o seu e eu respondo
     pelo manual dele."* Ele não trava nada: a pessoa segue podendo perguntar.
   - **O custo já estava tampado** e não muda: cinco perguntas por mês no
     gratuito, contadas no servidor por conta ou por aparelho.

### Vai no binário e ninguém vê (medição)

6. **A migalha do fechamento passa a dizer EM QUAL TELA** (27/09). Ela passou
   25 dias relatando "app fechou sozinho em: abriu o app", sempre a mesma
   frase, porque o app inteiro tinha cinco chamadas de `passo()` e nenhuma no
   onboarding, no cadastro do carro ou no paywall. Agora ela sai do roteador,
   um lugar só, e toda tela entra sozinha.
7. **O sinal de pausa passa a ser o do Android** (27/09). Os dois ouvintes
   antigos são eventos de navegador, e a pergunta da migalha é sobre o
   aplicativo: entrou o `appStateChange` do Capacitor.
8. **O relato de erro diz em que aparelho aconteceu** (27/09): modelo, versão
   do sistema, memória aproximada e núcleos, tirados do `navigator`, sem plugin
   nativo. "Morre na tela de cadastro" e "morre na tela de cadastro num Android
   de 2GB" pedem consertos diferentes.

### Já está no ar, NÃO conta como novidade da loja

- `/api/versions`: o filtro por ano deixou de se desligar nos carros populares
  (era 20 versões; Creta tem 29 e Gol mais de 30) e o teto subiu para 60.
- `/api/erros`: passou a gravar o campo do aparelho.
- A aula `vid-padaria` apontava para `battery-care`, que não existe; agora
  aponta para `diy-battery`. O catálogo de aulas é servido por `/api/lessons` e
  **substitui o embutido**, então já valeu no push.
- As anomalias novas no banco, a coluna `app_erros.aparelho` e o evento
  `perguntou_biela` (a restrição do banco foi recriada em 28/09).

## O plugin nativo desta versão, lido no FONTE

Nenhum plugin entrou ou saiu: `capacitor.config.ts`, `android/` e `ios/` não
foram tocados. Mas o item 7 **chama um caminho que o app nunca chamou**, e a
regra do dono de 09/09 vale igual. Lido em 28/09:

- **Android**, `node_modules/@capacitor/app/android/.../AppPlugin.java:36`: o
  ouvinte é registrado no `load()` do plugin, por
  `bridge.getApp().setStatusChangeListener`. **Não há `call.reject` neste
  caminho** (os dois do arquivo são do `getInfo` e do botão voltar). O plugin
  já está em `android.includePlugins` e em `capacitor.settings.gradle:5`.
- **iOS**, `AppPlugin.swift:22-29`: `didBecomeActive` e `willResignActive`
  viram `isActive`. Também sem exigência nenhuma.

**Duas nuances que só aparecem lendo o fonte, e as duas erram para o lado do
silêncio, que é o lado seguro:**

1. O Android dispara com `notifyListeners(..., false)`, ou seja, **não guarda o
   evento se ainda não houver ouvinte**. O nosso sobe por importação dinâmica,
   então existe uma janela de milissegundos na abertura em que ele ainda não
   está atento. Quem cobre essa janela são os dois ouvintes de DOM, que já
   estavam lá.
2. No iPhone, `willResignActive` dispara também em interrupção passageira
   (ligação chegando, central de controle, banner de aviso). A migalha esfria
   nesses casos. Efeito: a testemunha fica **mais calada** no iOS. Nenhum
   silêncio dela pode ser lido como "não houve fechamento".

## A nota das lojas

Escrita pela regra da casa: fala do ganho, não do defeito; verbo na ação da
pessoa; nada que não tenha sido conferido. Cabe no limite de 500 caracteres da
Play.

```
Sua moto tem lugar na garagem.

Cadastre a sua pelo nome que está no tanque: Titan, Fan, Biz, Pop, Factor,
XRE, CG 125 e mais de 150 modelos, de 14 marcas. Toque em Moto e o app passa
a falar de moto com você, do título ao resultado da busca.

E ao informar a versão do seu carro, você vê todas as opções do seu ano na
lista.

Chegou agora? Pergunte ao Biela antes de cadastrar qualquer coisa: descreva o
barulho ou a luz do painel e ele já te responde.
```

**O que ficou DE FORA da nota, de propósito:** os três itens de medição e o
convite de aviso. Nenhum muda algo que a pessoa sinta ao ler a ficha, e
"melhoramos nossa telemetria" é texto que só ocupa espaço.

## Roteiro de aparelho, escrito ANTES do build

Regra do dono de 09/09/2026: build sem roteiro não sai, e conferência verde
prova o que a conferência olha, não o binário. **Nenhuma suíte daqui alcança a
WebView do aparelho**, e a suíte `moto` roda em Chromium de mesa.

**O que NENHUMA conferência alcança nesta versão:**

1. **Cadastrar uma moto, ponta a ponta, no celular.** É o passo que decide.
   1. na tela de adicionar veículo, tocar em **Moto**;
   2. conferir que o título virou "Adicionar moto" e o campo pede uma moto;
   3. digitar **"Titan"** e conferir que aparece sugestão (era o caso exato do
      relato: antes respondia "Nenhum carro encontrado");
   4. escolher, preencher o ano e **salvar**;
   5. **fechar o app, abrir de novo e conferir que a moto está na garagem, com
      o ícone de moto.** O passo 5 é o único que prova que o `type` foi
      gravado, e não só desenhado.
2. **A lista de versão do carro.** Cadastrar um **Hyundai Creta 2022**, chegar
   no campo "Versão / motor" sem digitar nada, e **rolar até o fim**:
   `Creta Ultimate 2.0 16V Flex Aut.` tem que estar lá. É o caso da foto.
3. **O ouvinte de pausa do Android, pelo lado do falso positivo.** Abrir o app,
   navegar duas ou três telas, **mandar para segundo plano pelo botão home**,
   esperar uns 30 segundos e voltar. Depois **fechar e abrir** o app. Não pode
   aparecer relato de "app fechou sozinho" dessas idas e vindas. (Conferir em
   `app_erros` no dia seguinte, filtrando pelo aparelho de teste.)
4. **A busca vazia fala de moto.** Com Moto escolhido, digitar um nome que não
   existe (ex.: "zzzz") e conferir que a mensagem diz **"Nenhuma moto
   encontrada"**.
5. **A porta de entrada, com a garagem VAZIA.** A suíte `porta` já dirige este
   caminho em Chromium, com a rota do Biela dublada; o que só o aparelho prova
   é a resposta de verdade.
   1. instalar limpo (ou limpar os dados do app) e chegar ao Início **sem
      carro**: o título tem que ser uma pergunta e o botão grande, "Perguntar
      para o Biela";
   2. conferir que **"Ou cadastrar meu carro"** está logo abaixo, a um toque;
   3. tocar no botão grande, **descrever um sintoma de verdade** (ex.: "barulho
      ao frear") e ler a resposta. **É o passo que decide**, e ele não é
      técnico: a pergunta é se essa resposta, sem o app saber qual é o carro,
      valeria o seu cadastro;
   4. conferir que o convite **"Essa resposta serve para qualquer carro"**
      aparece só DEPOIS da resposta, e que o botão dele abre o cadastro;
   5. e que dá para continuar perguntando sem cadastrar nada.

**O que NÃO dá para provar no aparelho, e por isso não se promete:** os itens 6
e 8 (a tela na migalha e o aparelho no relato) só aparecem quando houver um
fechamento de verdade. A verificação deles é olhar `app_erros` uns dias depois
do build e conferir que a coluna `origem` deixou de dizer sempre "abriu o app"
e que a coluna `aparelho` vem preenchida.

## O que este build NÃO conserta, e não pode ser dito como se consertasse

1. **Os fechamentos em si.** Na 2.8 foram 2 aparelhos em 73 que chegaram ao
   cadastro de carro (2,7%), contra 2 em 117 na 2.7. Esta versão faz a
   testemunha saber DIZER onde; ela não conserta o que ela vai apontar. Sobre
   isso, a frase honesta continua sendo "sem sinal ainda".
2. **A falha do SDK da AppsFlyer no Android.** Em 14 dias, 165 `ok` contra 52
   `erro`, 24% dos aparelhos. A causa não foi encontrada.
3. **A venda no Android.** Continua em modo leitor: falta a chave no build, e
   os passos estão em `docs/lojas/venda-no-android.md`. Se a chave entrar neste
   build, o paywall passa a vender e o roteiro daquele arquivo vale junto.

## O piso do versionCode, corrigido antes do build

Preparando esta versão apareceu um risco que não quebrava nada e por isso
ninguém via: o `mentorqueVersionCode` do `android/gradle.properties` estava em
**56**, e a Play já tinha o **68** publicado.

Esse número é o PISO que o CI usa quando o contador do Codemagic está atrás
(`v = PROJECT_BUILD_NUMBER + 1`, com o piso por baixo). Doze números abaixo do
chão, ele não protegia mais nada: se o contador viesse atrasado, o envio sairia
com um versionCode que a Play recusa, e **número recusado fica queimado do
mesmo jeito** (foi o que aconteceu com o 54, em 03/09).

Subiu para **69**, e agora `npm run conferir:versoes` compara o piso com o
campo `android` de `/api/app/latest` e reprova se ele não passar o publicado.
Errar para cima é de graça no Android: o número só precisa crescer.

## Antes de promover a produção

- `npm run conferir` inteiro, a bateria completa de navegador e o build local;
- `npm run conferir:versoes` já diz 2.9 nos três lugares, ainda não publicada,
  e com o piso do versionCode acima do que está na Play;
- acrescentar `2.9` à lista `JA_PUBLICADAS` em `scripts/verifica-versoes.mjs`
  **só depois** da aprovação;
- o `/api/app/latest` aponta para o que está em PRODUÇÃO: bumpar com a versão
  em análise acende o aviso de "versão nova" para todo mundo, apontando para
  algo que ninguém consegue baixar. O número certo é o do log do passo
  "Compilar .aab", não o "Index" da tela do Codemagic.
