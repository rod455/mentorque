# Como criamos os dois apps (iPhone e Android) com Next.js, Capacitor e Codemagic

Guia para repetir o caminho numa empresa nova. Escrito em 11/10/2026, a partir
do que está no repositório do Mentorque e do que custou build para aprender.
Onde houver nome do Mentorque (bundle id, grupo de variáveis, nome do
keystore), é só trocar; a seção final lista tudo o que muda.

O roteiro passo a passo para ligar o Codemagic à Apple e à Play num app
novo, com o yaml modelo, está em
`docs/lojas/codemagic-apple-e-play-para-um-app-novo.md`.

Em uma frase: **o site é um app Next.js na Vercel; o app das lojas é o mesmo
código, exportado como arquivos estáticos e empacotado pelo Capacitor dentro
de um binário iOS e de um Android; o Codemagic compila os dois numa máquina
só e entrega no TestFlight e na faixa interna da Play; a promoção para
produção é um clique no console de cada loja.**

## 1. O desenho, e por que ele é assim

- **Uma base de código.** As telas, os estilos e os textos vivem em
  `components/app/**` e `lib/app/**`. A web e os dois apps mostram a mesma
  interface.
- **O app é empacotado, não um site dentro de uma moldura.** Não existe
  `server.url` no Capacitor. A WebView carrega HTML, CSS e JS de dentro do
  binário. Consequência boa: nada de tela branca sem rede e nenhuma navegação
  escapando para o Safari. Consequência que custa: **mudança de tela ou de
  texto exige build novo e revisão de loja**. Deploy do site não chega ao
  aparelho de ninguém.
- **O que continua vindo pela rede**, e por isso muda só com deploy: as rotas
  `/api/**` (chat, pagamento, consultas) e o catálogo de conteúdo remoto. Tudo
  o que puder ser servido pela API, sirva pela API: é o que permite consertar
  sem esperar a Apple.
- **No app, toda chamada de API é absoluta.** O HTML vem de
  `capacitor://localhost`, então `fetch("/api/x")` bateria nos arquivos
  empacotados. `lib/app/apiBase.ts` monta a URL com `NEXT_PUBLIC_SITE_URL`,
  normalizada para o endereço final sem redirecionamento (ver tropeço 4).

## 2. O que precisa existir antes do primeiro build

| Conta ou peça | Para quê |
|---|---|
| Apple Developer Program | o App ID (bundle id), o certificado de distribuição e o perfil de provisionamento do tipo App Store |
| App Store Connect | o app criado, a chave de API (Issuer ID, Key ID, arquivo .p8) para o Codemagic publicar no TestFlight |
| Google Play Console | o app criado, o keystore de upload (.jks) e uma conta de serviço com acesso via API (JSON) para o Codemagic publicar na faixa interna |
| Codemagic | o repositório conectado, um time com as Code signing identities (certificado iOS, perfil iOS, keystore Android), a integração App Store Connect e os grupos de variáveis |
| Supabase (ou o banco que for) | URL e chave anônima, que viajam embutidas no app |
| RevenueCat | as chaves públicas por plataforma, para a compra pelas lojas |

Nada disso é segredo que mora no repositório. O repositório tem o `.env.example`
com os NOMES; os valores ficam no painel do Codemagic (grupo de variáveis) e na
Vercel.

## 3. O repositório: as peças que fazem o mesmo código virar app

### 3.1 `next.config` com dois alvos

`BUILD_TARGET=native` liga `output: "export"` e um `distDir` próprio
(`.next-native`). Sem a variável, é o build normal do site, com rotas de API.

### 3.2 `scripts/build-native.mjs`, o empacotador

É o coração do caminho e vale ler inteiro. O que ele faz, na ordem:

1. **Confere as variáveis embutidas** antes de qualquer coisa
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `NEXT_PUBLIC_SITE_URL`, a chave do RevenueCat). Faltando, no CI é erro com o
   nome do que faltou; o estrago de deixar passar só apareceria no aparelho,
   com login morto ou paywall vazio.
2. **Confere que o site responde** no endereço de `NEXT_PUBLIC_SITE_URL`, com
   `redirect: "manual"`, porque um 308 que troca de domínio mata o `fetch`
   dentro do app e o Node seguiria o salto sem avisar.
3. **Tira do caminho tudo o que só existe no site** (`app/api`, landing,
   painel, guias): `output: "export"` recusa route handlers e páginas
   dinâmicas. A lista `SO_NO_SITE` é mantida à mão, e uma conferência compara
   com o registro dos guias para nenhum ficar de fora.
4. Roda `next build` com `BUILD_TARGET=native`, devolve as pastas (inclusive se
   o processo morrer no meio), copia a saída para `native/app`, que é o
   `webDir` do Capacitor.
5. **Copia `app/index.html` para a raiz.** O roteador do Capacitor no iOS
   devolve o `index.html` da raiz para todo caminho sem extensão. Um
   redirecionamento na raiz entra em laço (tela preta antes da splash).

### 3.3 `capacitor.config.ts`

- `appId`, `appName`, `webDir: "native/app"`, sem `server.url`.
- **Plugins declarados por plataforma** (`android.includePlugins` e
  `ios.includePlugins`). No Mentorque o AdMob entra só no Android; o
  social-login entra nos dois com `providers: { facebook: false }`, porque o
  SDK do Facebook sem `facebook_app_id` derruba o app do Android na abertura.
- Plugin nativo só entra no binário depois de ler o caminho dele no fonte do
  plugin (não no README) e com o roteiro de aparelho escrito antes do build.

### 3.4 Pequenos scripts que evitam build quebrado

- `scripts/ios-google-scheme.mjs`: escreve no `Info.plist` o esquema reverso
  do client id do Google (sem ele o botão do Google não abre nada).
- `scripts/conserta-appsflyer.mjs`, chamado no `postinstall`: remenda um
  trecho do plugin da AppsFlyer que não compila no iOS. Remendo em
  `node_modules` precisa das duas metades: o `postinstall` que aplica (para
  valer no `npm ci` do CI) e uma conferência que reprova se o remendo sumir.
- `android/gradle.properties` guarda o **piso** do `versionCode`
  (`mentorqueVersionCode=N`), e `android/app/build.gradle` lê
  `MENTORQUE_VERSION_CODE` do ambiente, com o piso como reserva.

## 4. O Codemagic: `codemagic.yaml`

Três workflows, e o normal é usar um só:

| workflow | máquina | gera | publica em |
|---|---|---|---|
| `lojas` | Mac mini M2 | .ipa e .aab num build só | TestFlight e Play (faixa interna) |
| `ios-testflight` | Mac mini M2 | .ipa | TestFlight |
| `android-play` | Linux | .aab | Play (faixa interna) |

O `lojas` compila o web uma vez e empacota as duas plataformas: um clique, um
build. É tudo-ou-nada: se o archive do iOS falhar, o .aab não é publicado (o
Android compila antes de propósito, por ser o passo mais previsível).

Os passos do `lojas`, na ordem:

1. `npm ci`
2. `npm run build:native` (a seção 3.2)
3. `node scripts/ios-google-scheme.mjs`
4. `npx cap sync`
5. Escrever `android/keystore.properties` a partir das variáveis que o
   Codemagic injeta do keystore guardado (`CM_KEYSTORE_PATH`,
   `CM_KEYSTORE_PASSWORD`, `CM_KEY_ALIAS`, `CM_KEY_PASSWORD`).
6. Compilar o .aab com o `versionCode` = contador do projeto + 1, nunca abaixo
   do piso do `gradle.properties`. O passo imprime `versionCode deste envio: N`,
   e **essa linha é a única fonte que vale** (ver tropeço 7).
7. `xcode-project use-profiles` e, logo depois, **abrir cada perfil baixado e
   conferir que ele tem a capability do Sign In with Apple**. Um perfil
   emitido antes de a capability entrar no App ID é baixado normalmente e só
   quebra no archive, com erro vago. Aqui falha cedo e com instrução.
8. `agvtool new-version -all` com o contador do projeto + 1, impresso no log.
9. `xcode-project build-ipa`, e, se falhar, imprimir o erro real do
   `xcodebuild` (o wrapper engole a saída e devolve só "status code 65").
10. Publicar: `app_store_connect` com `submit_to_testflight: true`, e
    `google_play` na `track: internal` com `submit_as_draft: false`.

Configuração que mora no painel, não no yaml:

- **Code signing identities**: certificado de distribuição iOS, perfil de
  provisionamento App Store e keystore Android com um nome de referência (no
  Mentorque, `mentorque-upload`). O perfil que o build usa é a cópia guardada
  no Codemagic: apagar no portal da Apple não muda nada; para trocar, gere um
  novo, baixe o `.mobileprovision` e substitua a cópia.
- **Integração App Store Connect** com a chave de API (no yaml, `asc-mentorque`).
- **Grupos de variáveis**: um com as `NEXT_PUBLIC_*` embutidas no pacote (no
  yaml, `Mentorque`) e um com `GCLOUD_SERVICE_ACCOUNT_CREDENTIALS` para a
  Play (`google_play`). O nome do grupo no yaml precisa bater exatamente com o
  do painel, senão o build nem começa.
- O client id público do Google do iPhone mora no código, de propósito: client
  id viaja no binário de qualquer jeito, e o valor fixo elimina o modo de
  falha mais provável, que é subir um build sem a variável. O do Android
  (`NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID`) é variável e precisa estar também em
  "Authorized Client IDs" do provider Google no Supabase.

## 5. Versão, número de build e a contabilidade que evita build queimado

A versão de marketing mora em três lugares que não conversam:

```
lib/app/content.ts        APP_VERSION        (o que o app diz que é, e o funil grava)
android/app/build.gradle  versionName        (o que a Play publica)
ios/.../project.pbxproj   MARKETING_VERSION  (duas ocorrências)
```

`npm run conferir:versoes` compara os três **e** confere que a versão ainda
não foi publicada, lendo a lista `JA_PUBLICADAS` escrita à mão. Concordância
prova consistência, não novidade: em 03/09 os três estavam em 1.6, já aprovada,
e a Apple recusou o build inteiro.

A mesma conferência guarda `BUILD_PUBLICADO` (o número de build de cada
versão aprovada) e `ARVORE_DO_BUILD` (o commit de onde cada binário saiu), e
cobra que cada item da ficha da versão cite um commit ancestral da árvore.

O aviso "versão nova disponível" dentro do app lê `/api/app/latest`, que
devolve o número de build **em produção** em cada loja. Depois de promover,
troque o número lá e faça deploy: o banner acende em quem está atrás, sem
esperar loja nenhuma.

## 6. O ritual de uma versão

1. **Abrir a ficha** `docs/lojas/novidades-<versão>.md` com: o que vai no
   binário (cada item com data e commit), o que já foi ao ar sem build, a nota
   das lojas (dentro dos 500 caracteres da Play, em português e inglês), os
   plugins nativos tocados, e o **roteiro de aparelho escrito antes do build**.
   Build sem roteiro não sai. Conferência verde prova o que a conferência
   olha; nenhuma suíte daqui alcança a WebView do aparelho.
2. **Regime de release**, só aqui e nunca "por via das dúvidas": `npm run
   conferir` inteiro, a bateria completa de navegador e o build local
   (`npm run build` e `npm run build:native`). No dia a dia vale o regime das
   duas velocidades: `conferir` mais a suíte da área tocada, e push.
3. **No momento do botão, escrever a árvore do build na ficha**
   (`**Árvore do build:** <sha>`). Tudo o que entrar na `main` depois é da
   próxima versão, mesmo que a ficha já contasse com isso. Foi assim que a 3.0
   saiu das lojas sem o item principal da própria nota.
4. **A hora do envio se pergunta à Apple**, não à memória: a API de builds do
   App Store Connect devolve o `uploadedDate`. Um commit criado depois dessa
   hora não está no binário.
5. **Promover** nos consoles: TestFlight para a App Store, faixa interna para
   produção na Play. Só depois: acrescentar a versão em `JA_PUBLICADAS`, o
   build em `BUILD_PUBLICADO`, a árvore em `ARVORE_DO_BUILD`, trocar o
   `/api/app/latest`, subir o piso do `versionCode` e abrir a versão seguinte
   nos três lugares da versão de marketing.
6. **Sobre um build que nenhum aparelho abriu, a resposta é "sem sinal
   ainda"**, nunca "nada quebrou". O primeiro sinal é o roteiro de aparelho
   no celular do dono; o segundo é o funil registrando aberturas na versão
   nova.

## 7. O que NÃO precisa de build (e vale desenhar para cair aqui)

| onde mora a mudança | precisa de build? |
|---|---|
| `app/api/**`, site, landing, e-mail | não, vai no push |
| catálogo de conteúdo servido por `/api` | não |
| artes servidas do site | não |
| `lib/app/**`, `components/app/**` | sim |
| `android/**`, `ios/**`, plugins, `capacitor.config.ts` | sim |

Quanto mais regra de negócio e conteúdo morar atrás de uma rota, menos vezes
você espera a revisão da loja para consertar algo.

## 8. Os tropeços que custaram build, e o que ficou de cada um

1. **Versão já publicada subiu de novo.** A Apple recusa
   (`CFBundleShortVersionString must contain a higher version`) e a Play
   ACEITA: ficou na faixa interna um binário com conteúdo novo vestido de
   versão velha, e o `versionCode` gastou. Ficou: `JA_PUBLICADAS` na
   conferência, e depois de qualquer envio falho conferir o que cada loja
   aceitou.
2. **Tela preta antes da splash no iPhone.** Um redirecionamento no
   `index.html` da raiz entra em laço com o roteador do Capacitor. Ficou: o
   HTML do app É o `index.html` da raiz.
3. **App abria e nenhuma rota respondia.** `NEXT_PUBLIC_SITE_URL` apontava para
   um domínio que não existia (o exemplo do `.env.example`). Como o valor vai
   embutido, só build novo conserta. Ficou: o empacotador testa o endereço
   antes de exportar.
4. **Chat mudo por dias.** O domínio sem `www` respondia 308 para o com `www`,
   e um `fetch` entre origens não segue esse salto ("Load failed"). Ficou: o
   endereço final sem redirecionamento, normalizado em `apiBase.ts`, e o
   teste com `redirect: "manual"` no build.
5. **Build do app quebrou porque o site ganhou uma página dinâmica.** A
   exportação estática recusa route handlers e `searchParams` no servidor.
   Ficou: a lista `SO_NO_SITE` e a conferência que a compara com o registro
   dos guias.
6. **App do Android abria e fechava na hora.** O plugin de login social
   arrastava o SDK do Facebook sem `facebook_app_id`. Ficou:
   `providers: { facebook: false }` no `capacitor.config.ts`, e a regra de ler
   o fonte do plugin antes de incluir.
7. **Falso alarme de `versionCode` repetido, duas vezes.** O "Index" da tela
   do Codemagic não é o contador do projeto, e o número do
   `gradle.properties` é só piso. Ficou: a linha `versionCode deste envio: N`
   no log é a única fonte.
8. **Archive do iPhone morreu dentro de um plugin que ninguém tocou.**
   `xcode: latest`, pacotes SPM por faixa de versão e sem `Package.resolved`
   versionado: três coisas se movem sozinhas entre builds. Ficou: "não mexi em
   nada" não significa "nada mudou"; remendo com `postinstall` mais
   conferência; versão do pacote fixada.
9. **Perfil de provisionamento sem a capability do Sign In with Apple.** O
   perfil era baixado normalmente e o archive só quebrava no fim. Ficou: o
   passo que abre o perfil e falha cedo, com o caminho de conserto.
10. **A versão saiu das lojas sem o item principal da nota.** O botão foi
    apertado numa árvore anterior ao commit que a ficha prometia. Ficou: a
    árvore do build escrita na hora do botão, cada item com commit, a
    conferência perguntando ao git, e a hora de envio lida na Apple.
11. **O número de versão que o app "diz" apodreceu por duas versões**, e o
    funil passou a não saber em que versão cada aparelho estava. Ficou:
    `APP_VERSION` entra na conferência dos três lugares.

## 9. Checklist para a empresa nova

O que trocar, na ordem em que você vai esbarrar:

- [ ] `appId` e `appName` em `capacitor.config.ts`; o bundle id em
      `ios_signing.bundle_identifier` nos três workflows; o pacote Android no
      `build.gradle` e nas pastas de código.
- [ ] O nome da integração App Store Connect (`asc-...`) e o nome de
      referência do keystore (`...-upload`) no yaml, iguais aos do painel.
- [ ] O nome do grupo de variáveis no yaml, igual ao do painel; dentro dele,
      as `NEXT_PUBLIC_*` do projeto novo (Supabase, site, RevenueCat, client
      id web do Google).
- [ ] `NEXT_PUBLIC_SITE_URL` com o endereço FINAL, com `www` se o apex
      redireciona; conferir com `curl -I` que responde 200 sem salto.
- [ ] A lista `SO_NO_SITE` do empacotador com as rotas que só existem no site.
- [ ] Os plugins por plataforma no `capacitor.config.ts`, cada um lido no fonte.
- [ ] `JA_PUBLICADAS`, `BUILD_PUBLICADO` e `ARVORE_DO_BUILD` zerados na
      conferência de versões; `mentorqueVersionCode` renomeado e no piso
      certo; `/api/app/latest` apontando para nada até a primeira publicação.
- [ ] A ficha `docs/lojas/novidades-1.0.md` aberta antes do primeiro build,
      com o roteiro de aparelho.
- [ ] As notas das lojas pela regra: fale do ganho, verbo na ação da pessoa,
      nada que não tenha sido conferido.

O que não muda: o desenho (site na Vercel, app empacotado, API pela rede), o
empacotador, os três workflows, a numeração de build pelo contador do
Codemagic com piso, e o ritual da seção 6.
