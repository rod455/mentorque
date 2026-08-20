# Mentorque — build Android

O app Android é **empacotado** (Capacitor): telas, estilos, textos e imagens
viajam dentro do `.aab`, gerados por `npm run build:native`. Não existe
`server.url` — a WebView não sai para a internet para desenhar a interface.

> ⚠️ **Mudança de tela, texto ou preço exige build novo.** Até a versão 1.0 o
> app carregava `https://mentorque.com.br/app` e bastava um deploy da Vercel;
> não é mais assim. O que ainda vem pela rede, e portanto muda só com deploy:
> as rotas de `/api` (Biela, Stripe, FIPE, revisões) e o catálogo remoto de
> conteúdo (`lib/app/remoteLessons.ts`).

## Pré-requisitos (uma vez)
- Android Studio com SDK 36 e JDK 21
- Node 22; na raiz do projeto: `npm install`

## Sincronizar antes de qualquer build

O diretório `android/capacitor-cordova-android-plugins/` e os assets em
`android/app/src/main/assets/` são **gerados** e não vão para o git. Um clone
limpo não compila até você rodar, na raiz do repositório:

```bash
npm install
npm run android:studio    # = npm run build:native && npx cap sync android
```

**Use `android:studio`, não `sync:android`.** O `sync:android` roda só o
`cap sync`, que COPIA o site já compilado — ele não compila nada. Sem o
`build:native` antes, ou o Gradle para com "Could not find the web assets
directory", ou pior: encontra a pasta da build anterior e gera um `.aab`
perfeitamente válido com o app da semana passada dentro. O pacote sobe, a Play
aprova, e nenhuma das mudanças chega ao aparelho de ninguém.

## Build local — caminho curto (Windows)

```powershell
cd C:\Apps\Mentorque
.\scripts\release-android.ps1
```

O script faz `git pull`, `npm install`, `cap sync android` e `gradlew clean
bundleRelease`, e no fim imprime o caminho do `.aab`, o do `mapping.txt` e o
`versionCode` que entrou no pacote. Para sobrescrever o número sem editar o
`gradle.properties`: `.\scripts\release-android.ps1 -VersionCode 4`.

## Build local

```bash
npm run android:studio    # compila o site, sincroniza
npm run open:android      # abre o projeto no Android Studio
```

A ordem importa: o Android Studio empacota o que estiver em
`android/app/src/main/assets/public` no momento do build. Abrir o Studio sem
rodar o `android:studio` antes gera um pacote com o app antigo.

Ou direto pela linha de comando:

```bash
cd android && ./gradlew bundleRelease
```

Sem keystore configurada o `.aab` sai **não assinado** — serve para conferir o
pacote, mas a Play recusa. Para assinar localmente, crie
`android/keystore.properties` (já está no `.gitignore`):

```properties
storeFile=/caminho/absoluto/mentorque-upload.jks
storePassword=…
keyAlias=mentorque
keyPassword=…
```

Para gerar o `.jks` na primeira vez: **Build → Generate Signed App Bundle →
Android App Bundle → Create new…**

> ⚠️ **Guarde o `.jks` e as senhas.** Sem eles não há como publicar
> atualizações do app — a Google não substitui a chave de upload sem um
> processo de recuperação. Faça backup fora do repositório.

O pacote sai em `android/app/build/outputs/bundle/release/app-release.aab`.

## Build no CI (recomendado)

O workflow `android-play` em `codemagic.yaml` faz tudo: `npm ci`,
`cap sync android`, assinatura com a keystore guardada no Codemagic, e envio
para a **faixa de teste interno** da Play. A promoção para produção continua
manual, no Play Console.

Configuração única no painel do Codemagic:
1. **Teams → Integrations → Code signing identities → Android keystores**:
   suba o `.jks` com o nome de referência `mentorque-upload`.
2. Grupo de variáveis `google_play` com `GCLOUD_SERVICE_ACCOUNT_CREDENTIALS`
   (JSON da conta de serviço criada em Play Console → Configuração → acesso
   via API), marcada como **secreta**.

## Login social (configuração obrigatória no Supabase)

O app nativo não pode fazer OAuth dentro da própria WebView: o Google recusa
WebView embutida (`disallowed_useragent`) e um retorno `https://` cairia no
navegador do sistema, deixando o app deslogado. Então o fluxo é:

1. O app abre a página do provedor numa **aba do sistema** (`@capacitor/browser`).
2. O provedor volta para o deep link **`mentorque://auth-callback`** — o valor
   real está em `lib/app/wrapper.ts` (`NATIVE_AUTH_CALLBACK`). Escreveu-se
   `mentorque.app://` aqui por um tempo, e é errado: o Android registra só o
   esquema `mentorque` (`res/values/strings.xml`). O iPhone atende os dois, por
   herança, o que escondia o engano.
3. O Android/iOS reabre o app com essa URL e `lib/app/auth.tsx` troca o código
   pela sessão (PKCE).

Para isso funcionar, no painel do Supabase → **Authentication → URL
Configuration → Redirect URLs**, adicione:

```
mentorque://auth-callback
https://mentorque.com.br/app
```

O primeiro é o retorno do app; o segundo atende a web e os links enviados por
e-mail (confirmação de conta e redefinição de senha), que podem ser abertos em
outro aparelho e por isso continuam em `https://`.

Nada muda no Google Cloud nem na Apple: o redirect URI deles continua sendo o
callback do Supabase (`https://<projeto>.supabase.co/auth/v1/callback`).

O esquema `mentorque.app` está declarado em três lugares, que precisam ficar em
sincronia: `res/values/strings.xml` (`custom_url_scheme`), o `intent-filter` do
`AndroidManifest.xml` e o `CFBundleURLTypes` do `ios/App/App/Info.plist`.

## Versões

- `versionCode` — **incremente `mentorqueVersionCode` em `gradle.properties` a
  cada envio**. Fica lá (e não no `build.gradle`) para o assistente
  "Generate Signed Bundle" do Android Studio pegar o número sem precisar de
  flag. O CI ignora esse valor e usa `MENTORQUE_VERSION_CODE`, que tem
  precedência. **Um versionCode já enviado fica queimado mesmo que a versão
  tenha sido reprovada** — a Play recusa o upload repetido.
- `versionName` — em `app/build.gradle`. É o que o usuário vê ("1.0" → "1.1").

## O que já está configurado

| Item | Onde |
| --- | --- |
| Site empacotado que vai dentro do `.aab` | `scripts/build-native.mjs` → `webDir: native/app` |
| Trava de navegação (não sai de `/app`) | `components/app/NativeLinkGuard.tsx` |
| Edge-to-edge + ícones claros nas barras | `viewportFit` em `app/layout.tsx` + `plugins.SystemBars` |
| Splash (API do Android 12+, compat até o 6) | `res/values/styles.xml` + `MainActivity.java` |
| AdMob: app id, consentimento (UMP), aparelhos de teste | `AndroidManifest.xml` + `lib/app/admob.ts` |
| Venda pela loja (Play Billing / Apple IAP) | `NEXT_PUBLIC_REVENUECAT_ANDROID_KEY` no build → `lib/app/wrapper.ts` → `sellsInApp()` |
| Login social por deep link | `lib/app/auth.tsx` + `intent-filter` no manifesto |
| Plugins que entram no pacote Android | `capacitor.config.ts` → `android.includePlugins` |
| Assinatura e `versionCode` | `app/build.gradle` + `codemagic.yaml` |

Para regenerar ícone e splash a partir da marca:

```bash
npx @capacitor/assets generate --android    # usa assets/icon.png e assets/splash.png
```

## Antes de enviar para a Play

- [ ] `npm run android:studio` rodado (build:native **+** sync — ver acima)
- [ ] `mentorqueVersionCode` incrementado em `gradle.properties`
- [ ] Instalar o `.aab` de **release** num aparelho real e abrir o app —
      o build de release passa pelo R8 (`minifyEnabled true`), que não é
      exercitado pelo build de debug
- [ ] Modo avião: o app abre e navega normalmente (a interface é local); só o
      Biela e as revisões devem avisar que falta rede. Tela branca aqui
      significa que o `build:native` não entrou no pacote
- [ ] **Entrar com Google e com Apple num aparelho real**: a aba do sistema
      abre, e ao terminar o app reabre já logado. Se voltar deslogado, falta
      o `mentorque://auth-callback` nos Redirect URLs do Supabase
- [ ] Tocar em "Política de privacidade" e "Avaliar o Mentorque": devem abrir
      **fora** do app (aba do sistema), nunca a landing dentro da WebView
- [ ] **Segurança de dados** no Play Console declarando o ID de publicidade
      (o app usa AdMob) — precisa bater com a política de privacidade do site
