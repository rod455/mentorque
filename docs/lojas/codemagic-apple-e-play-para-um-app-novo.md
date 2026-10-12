# Codemagic ligado à Apple e à Play: o roteiro completo para configurar um app novo

Escrito em 12/10/2026 para outro agente copiar e configurar um app novo do
zero. É tudo o que o Mentorque tem no Codemagic para falar com a App Store e
com a Google Play, com os NOMES de cada peça e o lugar onde ela mora. Nenhum
valor de chave, senha ou certificado está aqui, de propósito: eles vivem no
painel do Codemagic e nos consoles, nunca no repositório nem numa conversa.

Pressupostos do roteiro: app Next.js empacotado pelo Capacitor (ver
`docs/lojas/como-criamos-os-apps-no-codemagic.md`), um repositório no GitHub,
uma conta Apple Developer e uma conta Google Play Console já abertas. Onde
aparecer `<ASSIM>`, troque pelo valor do app novo. Onde aparecer o valor do
Mentorque, é exemplo do formato.

## 0. O mapa: o que vive onde

| peça | onde mora | nome no yaml | exemplo do Mentorque |
|---|---|---|---|
| bundle id do iPhone | Apple Developer e `ios/App/App.xcodeproj` | `ios_signing.bundle_identifier` | `mentorque.app` |
| pacote do Android | `android/app/build.gradle` (`applicationId`) | (lido pelo gradle) | `mentorque.app` |
| Team ID da Apple | Apple Developer, canto superior direito | (não entra no yaml) | `GGM89XNN4S` |
| id do app na App Store | App Store Connect, informações do app | (não entra no yaml) | `6797291865` |
| chave de API do App Store Connect (.p8 + Key ID + Issuer ID) | Codemagic, Teams > Integrations > App Store Connect | `integrations.app_store_connect` | `asc-mentorque` |
| certificado de distribuição iOS (.p12) | Codemagic, Code signing identities > iOS certificates | escolhido por `ios_signing` | um certificado "Apple Distribution" |
| perfil de provisionamento App Store (.mobileprovision) | Codemagic, Code signing identities > iOS provisioning profiles | escolhido por `ios_signing` | um perfil do bundle id, com Sign In with Apple |
| keystore de upload do Android (.jks) | Codemagic, Code signing identities > Android keystores | `android_signing` | referência `mentorque-upload` |
| conta de serviço do Google Cloud com acesso à Play (JSON) | Codemagic, grupo de variáveis `google_play` | `GCLOUD_SERVICE_ACCOUNT_CREDENTIALS` | (secreta) |
| variáveis embutidas no app (`NEXT_PUBLIC_*`) | Codemagic, grupo de variáveis com o nome do app | `environment.groups` | grupo `Mentorque` |
| piso do versionCode | `android/gradle.properties` | lido pelo passo "Compilar .aab" | `mentorqueVersionCode=72` |

## 1. Na Apple, antes do Codemagic

1. **App ID** em Apple Developer > Identifiers: o bundle id (`<BUNDLE_ID>`),
   com as capabilities que o app usa marcadas ANTES de gerar o perfil. No
   Mentorque: Sign In with Apple, Push Notifications, Associated Domains. Um
   perfil gerado antes de a capability entrar no App ID é baixado normalmente
   pelo build e só quebra no archive, com erro vago.
2. **Certificado de distribuição** (Apple Distribution) em Certificates: gere
   num Mac com Keychain (ou com `openssl` + CSR), exporte como `.p12` com
   senha. É ele que assina o `.ipa`.
3. **Perfil de provisionamento** em Profiles: tipo App Store, para o App ID
   acima, com o certificado acima. Baixe o `.mobileprovision`.
4. **App no App Store Connect**: crie o app com o bundle id, anote o Apple ID
   numérico do app (`<APP_STORE_APP_ID>`).
5. **Chave de API** em App Store Connect > Users and Access > Integrations >
   App Store Connect API: função App Manager (basta para enviar ao
   TestFlight). Anote **Issuer ID**, **Key ID** e baixe o `.p8`. A Apple só
   deixa baixar UMA vez.
6. **Localização principal** do app no App Store Connect: Portuguese
   (Brazil), se o app é brasileiro. Isso não é o idioma do binário (o
   `CFBundleDevelopmentRegion` e as localizações do Xcode declaram o que o
   binário fala; a 3.0 do Mentorque mostrou "Idioma: EN" na loja por isso).

## 2. Na Google Play, antes do Codemagic

1. **App no Play Console** com o nome do pacote (`<PACKAGE>`); o pacote não
   muda nunca mais depois do primeiro envio.
2. **Keystore de upload**: gere um `.jks` (alias, senha do keystore e senha da
   chave). Guarde em dois lugares seguros fora do repositório: perder essa
   chave significa não conseguir mais atualizar o app com Play App Signing
   sem pedir reset ao Google. No Play Console, Play App Signing fica ligado
   (o Google re-assina com a chave dele; a sua é só de upload).
3. **Conta de serviço** no Google Cloud (projeto ligado ao Play Console):
   crie a conta, baixe o JSON da chave, e no Play Console > Usuários e
   permissões convide o e-mail da conta de serviço com permissão de enviar
   versões para a faixa de teste interno (e gerenciar versões, se quiser que
   o CI promova). A permissão leva até 24 h para valer.
4. **Primeiro envio à mão**: a Play exige que o PRIMEIRO `.aab` de um app
   novo suba pelo console, não pela API. Gere um build local (`docs/
   android-local.md` descreve o caminho pelo Android Studio) ou baixe o
   artefato do Codemagic e suba na faixa interna pelo painel. Depois disso o
   `publishing.google_play` do yaml funciona.
5. **SHA-1**: o login com Google no Android precisa de DOIS SHA-1 no projeto
   do Google Cloud do provider: o do keystore de upload e o da chave do Play
   App Signing (Play Console > Integridade do app). Com só o primeiro, o
   login funciona no build local e falha no app da loja.

## 3. No Codemagic

1. **Conectar o repositório** (Applications > Add application > GitHub) e
   escolher "codemagic.yaml" como configuração.
2. **Teams > Integrations > App Store Connect**: adicionar a chave de API com
   um nome de referência (`<ASC_INTEGRACAO>`, no Mentorque `asc-mentorque`):
   Issuer ID, Key ID e o `.p8`. É esse nome que vai em
   `integrations.app_store_connect` no yaml.
3. **Teams > Code signing identities**:
   - iOS certificates: subir o `.p12` com a senha.
   - iOS provisioning profiles: subir o `.mobileprovision`. **O build usa a
     cópia guardada aqui, não a do portal da Apple**: apagar ou regenerar no
     portal não muda nada no build; para trocar, gere um novo, baixe e
     substitua aqui.
   - Android keystores: subir o `.jks` com alias e as duas senhas, e dar o
     nome de referência (`<KEYSTORE_REF>`, no Mentorque `mentorque-upload`).
     É esse nome que vai em `android_signing`.
4. **Applications > o app > Environment variables**, em dois grupos:
   - grupo `google_play`: `GCLOUD_SERVICE_ACCOUNT_CREDENTIALS` = o JSON da
     conta de serviço, marcada como secreta.
   - grupo com o nome do app (`<GRUPO_DO_APP>`, no Mentorque `Mentorque`):
     as variáveis que ficam EMBUTIDAS no pacote. No Mentorque:
     `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
     `NEXT_PUBLIC_SITE_URL` (o endereço FINAL do site, com `www` se o apex
     redireciona), `NEXT_PUBLIC_REVENUECAT_IOS_KEY`,
     `NEXT_PUBLIC_REVENUECAT_ANDROID_KEY` (sem ela o Android sai em modo
     leitor, sem paywall), `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID` (o client id do
     tipo Web application, o mesmo do provider Google do Supabase).
   O nome do grupo no yaml tem de bater EXATAMENTE com o do painel, senão o
   build nem começa.
5. **Build number**: o Codemagic mantém um contador por projeto
   (`PROJECT_BUILD_NUMBER`). O yaml soma 1 e usa esse número como
   `CFBundleVersion` no iPhone e como `versionCode` no Android, nunca abaixo
   do piso de `gradle.properties`. Se o app novo já teve envios por fora,
   ajuste o piso para o último `versionCode` aceito pela Play mais um, ou
   edite o contador em Applications > o app > Settings > Build number.

## 4. No repositório

### 4.1 `android/app/build.gradle`: assinatura e versionCode

```groovy
// Assinatura de release. Duas origens, nesta ordem:
//   1. android/keystore.properties (build local, arquivo fora do git)
//   2. variáveis de ambiente (CI: <PREFIXO>_KEYSTORE_*)
def keystorePropsFile = rootProject.file("keystore.properties")
def keystoreProps = new Properties()
if (keystorePropsFile.exists()) {
    keystorePropsFile.withInputStream { keystoreProps.load(it) }
}
def keystoreValue = { String propKey, String envKey ->
    keystoreProps.getProperty(propKey) ?: System.getenv(envKey)
}
def keystorePath = keystoreValue("storeFile", "<PREFIXO>_KEYSTORE_PATH")
def hasSigningConfig = keystorePath != null && !keystorePath.trim().isEmpty() && file(keystorePath).exists()

// Ordem: variável de ambiente (CI) -> propriedade do gradle -> 1.
def resolvedVersionCode = (System.getenv("<PREFIXO>_VERSION_CODE")
    ?: project.findProperty("<prefixo>VersionCode")
    ?: "1").toString().trim().toInteger()

android {
    defaultConfig {
        applicationId "<PACKAGE>"
        versionCode resolvedVersionCode
        versionName "<VERSAO_DE_MARKETING>"
    }
    if (hasSigningConfig) {
        signingConfigs {
            release {
                storeFile file(keystorePath)
                storePassword keystoreValue("storePassword", "<PREFIXO>_KEYSTORE_PASSWORD")
                keyAlias keystoreValue("keyAlias", "<PREFIXO>_KEY_ALIAS")
                keyPassword keystoreValue("keyPassword", "<PREFIXO>_KEY_PASSWORD")
            }
        }
    }
    buildTypes { release { if (hasSigningConfig) signingConfig signingConfigs.release } }
}
```

E em `android/gradle.properties`:

```
<prefixo>VersionCode=1
```

`android/keystore.properties` fica no `.gitignore`. No CI o yaml escreve esse
arquivo a partir das variáveis que o Codemagic injeta do keystore guardado.

### 4.2 iOS

- `ios/App/App.xcodeproj/project.pbxproj`: `PRODUCT_BUNDLE_IDENTIFIER` =
  `<BUNDLE_ID>`, `MARKETING_VERSION` (duas ocorrências) = a versão de
  marketing, `CODE_SIGN_STYLE = Automatic`. O `xcode-project use-profiles`
  do Codemagic troca para manual com o perfil guardado na hora do build.
- `ios/App/App/App.entitlements`: as capabilities (Sign In with Apple,
  aps-environment, Associated Domains) iguais às do App ID.
- `Info.plist`: o esquema reverso do client id do Google (se houver login
  com Google) e os ids SKAdNetwork das redes de anúncio (se houver
  atribuição).

### 4.3 `codemagic.yaml`, o modelo

Três workflows; o `lojas` é o caminho normal. Copie inteiro e troque os
`<...>`.

```yaml
workflows:
  lojas:
    name: iOS + Android -> lojas
    max_build_duration: 90
    instance_type: mac_mini_m2
    integrations:
      app_store_connect: <ASC_INTEGRACAO>
    environment:
      node: 22
      xcode: latest
      java: 21
      groups:
        - google_play
        - <GRUPO_DO_APP>
      ios_signing:
        distribution_type: app_store
        bundle_identifier: <BUNDLE_ID>
      android_signing:
        - <KEYSTORE_REF>
    scripts:
      - name: Instalar dependências web
        script: npm ci
      - name: Gerar o app estático que vai dentro dos binários
        script: npm run build:native
      - name: Sincronizar Capacitor (iOS e Android)
        script: npx cap sync
      - name: Assinatura Android (keystore do Codemagic -> keystore.properties)
        script: |
          cat > android/keystore.properties <<EOF
          storeFile=$CM_KEYSTORE_PATH
          storePassword=$CM_KEYSTORE_PASSWORD
          keyAlias=$CM_KEY_ALIAS
          keyPassword=$CM_KEY_PASSWORD
          EOF
      - name: Compilar .aab
        script: |
          # A Play recusa versionCode repetido. Contador do projeto + 1,
          # nunca abaixo do piso do gradle.properties.
          piso=$(grep -o '<prefixo>VersionCode=[0-9]*' android/gradle.properties | cut -d= -f2)
          v=$(( ${PROJECT_BUILD_NUMBER:-0} + 1 ))
          [ "$v" -lt "${piso:-1}" ] && v=$piso
          export <PREFIXO>_VERSION_CODE=$v
          echo "versionCode deste envio: $v"
          cd android
          ./gradlew bundleRelease
      - name: Aplicar perfis de assinatura (iOS)
        script: xcode-project use-profiles
      - name: Conferir os perfis baixados
        # Abre cada perfil e falha cedo se nenhum tiver a capability que o
        # app exige (aqui, Sign In with Apple). Sem isto o archive quebra no
        # fim, com erro vago.
        script: |
          shopt -s nullglob
          achou=0
          serve=0
          for p in "$HOME/Library/MobileDevice/Provisioning Profiles/"*.mobileprovision; do
            achou=1
            security cms -D -i "$p" > /tmp/perfil.plist 2>/dev/null || continue
            nome=$(/usr/libexec/PlistBuddy -c "Print :Name" /tmp/perfil.plist 2>/dev/null)
            echo "--- $nome"
            if grep -q "com.apple.developer.applesignin" /tmp/perfil.plist; then
              echo "    Sign In with Apple: SIM"; serve=1
            else
              echo "    Sign In with Apple: NAO"
            fi
          done
          [ "$achou" = "1" ] || echo "(nenhum perfil foi baixado)"
          if [ "$serve" != "1" ]; then
            echo "Nenhum perfil baixado autoriza Sign In with Apple. O perfil vem da copia"
            echo "guardada no Codemagic (Teams > Code signing identities), nao da Apple:"
            echo "gere um perfil novo no portal, baixe e substitua a copia no Codemagic."
            exit 1
          fi
      - name: Número da build (iOS, incremental)
        script: |
          cd ios/App
          agvtool new-version -all $((${PROJECT_BUILD_NUMBER:-0} + 1))
          echo "Build iOS deste envio (CFBundleVersion): $(agvtool what-version -terse)"
      - name: Compilar .ipa
        script: |
          # O xcode-project engole a saída do xcodebuild; em caso de falha,
          # desenterra o erro real do log.
          if ! xcode-project build-ipa --project ios/App/App.xcodeproj --scheme App; then
            echo "===================== erro real do xcodebuild ====================="
            for f in /tmp/xcodebuild_logs/*.log; do
              [ -f "$f" ] || continue
              echo "--- $f"
              grep -nE "error:|fatal|Provisioning profile|entitlement|Signing for|does(n't| not) (support|contain)|failed to (resolve|download)" "$f" | tail -80
            done
            exit 1
          fi
    artifacts:
      - build/ios/ipa/*.ipa
      - /tmp/xcodebuild_logs/*.log
      - android/app/build/outputs/bundle/release/*.aab
      - android/app/build/outputs/mapping/release/mapping.txt
    publishing:
      app_store_connect:
        auth: integration
        submit_to_testflight: true
      google_play:
        credentials: $GCLOUD_SERVICE_ACCOUNT_CREDENTIALS
        track: internal
        submit_as_draft: false

  ios-testflight:
    name: iOS -> TestFlight
    max_build_duration: 60
    instance_type: mac_mini_m2
    integrations:
      app_store_connect: <ASC_INTEGRACAO>
    environment:
      node: 22
      xcode: latest
      groups:
        - <GRUPO_DO_APP>
      ios_signing:
        distribution_type: app_store
        bundle_identifier: <BUNDLE_ID>
    scripts:
      - name: Instalar dependências web
        script: npm ci
      - name: Gerar o app estático que vai dentro do binário
        script: npm run build:native
      - name: Sincronizar Capacitor iOS
        script: npx cap sync ios
      - name: Aplicar perfis de assinatura
        script: xcode-project use-profiles
      - name: Número da build (incremental)
        script: |
          cd ios/App
          agvtool new-version -all $((${PROJECT_BUILD_NUMBER:-0} + 1))
      - name: Compilar .ipa
        script: xcode-project build-ipa --project ios/App/App.xcodeproj --scheme App
    artifacts:
      - build/ios/ipa/*.ipa
      - /tmp/xcodebuild_logs/*.log
    publishing:
      app_store_connect:
        auth: integration
        submit_to_testflight: true

  android-play:
    name: Android -> Google Play (teste interno)
    max_build_duration: 60
    instance_type: linux_x2
    environment:
      node: 22
      java: 21
      groups:
        - google_play
        - <GRUPO_DO_APP>
      android_signing:
        - <KEYSTORE_REF>
    scripts:
      - name: Instalar dependências web
        script: npm ci
      - name: Gerar o app estático que vai dentro do binário
        script: npm run build:native
      - name: Sincronizar Capacitor Android
        script: npx cap sync android
      - name: Assinatura (keystore do Codemagic -> keystore.properties)
        script: |
          cat > android/keystore.properties <<EOF
          storeFile=$CM_KEYSTORE_PATH
          storePassword=$CM_KEYSTORE_PASSWORD
          keyAlias=$CM_KEY_ALIAS
          keyPassword=$CM_KEY_PASSWORD
          EOF
      - name: Compilar .aab
        script: |
          piso=$(grep -o '<prefixo>VersionCode=[0-9]*' android/gradle.properties | cut -d= -f2)
          v=$(( ${PROJECT_BUILD_NUMBER:-0} + 1 ))
          [ "$v" -lt "${piso:-1}" ] && v=$piso
          export <PREFIXO>_VERSION_CODE=$v
          echo "versionCode deste envio: $v"
          cd android
          ./gradlew bundleRelease
    artifacts:
      - android/app/build/outputs/bundle/release/*.aab
      - android/app/build/outputs/mapping/release/mapping.txt
    publishing:
      google_play:
        credentials: $GCLOUD_SERVICE_ACCOUNT_CREDENTIALS
        track: internal
        submit_as_draft: false
```

O Mentorque tem um passo a mais no iOS, `node scripts/ios-google-scheme.mjs`,
que escreve no `Info.plist` o esquema reverso do client id do Google. Só
entra se o app novo tiver login com Google no iPhone.

## 5. O primeiro build, na ordem que não queima número

1. Rode `android-play` sozinho primeiro: é o lado mais previsível. Se a Play
   recusar com "primeiro envio precisa ser pelo console", suba o `.aab` do
   artefato à mão na faixa interna e rode de novo.
2. Rode `ios-testflight`. Os erros mais comuns, e o que cada um quer dizer:
   - "doesn't include the Sign In with Apple capability": o perfil guardado
     no Codemagic é anterior à capability; gere outro no portal e substitua.
   - "No signing certificate": o `.p12` não está nas Code signing
     identities, ou a senha está errada.
   - "CFBundleShortVersionString must contain a higher version": essa versão
     de marketing já foi aprovada; suba a `MARKETING_VERSION`.
   - status code 65 sem mais nada: baixe `/tmp/xcodebuild_logs/*.log` dos
     artefatos; o erro real está lá.
3. Só depois use o `lojas`, que faz os dois num build.
4. Anote de onde cada número sai: o `versionCode` do Android está na linha
   `versionCode deste envio: N` do log; o do iPhone, na linha `Build iOS
   deste envio`. O "Index" da tela do Codemagic NÃO é o contador.

## 6. Depois que a loja aprovar

- Promoção é manual: TestFlight > App Store pelo App Store Connect; faixa
  interna > produção pelo Play Console.
- O `/api/app/latest` (se o app novo tiver o aviso de versão nova) aponta
  para o número de build em PRODUÇÃO de cada loja; quem está nas faixas de
  teste está à frente e não vê aviso.
- Na conferência de versões, acrescente a versão à lista de publicadas, o
  build ao mapa e o commit da árvore do build; suba o piso do `versionCode`
  para o publicado mais um.

## 7. O que NÃO está no Codemagic, e também fala com as lojas

Para o agente não procurar no lugar errado:

- **RevenueCat** (compra pelas lojas): as chaves públicas por plataforma vão
  no grupo de variáveis do app; a ligação do RevenueCat com a Play usa OUTRA
  conta de serviço, só dele (`docs/lojas/venda-no-android.md`); com a Apple,
  usa a chave de API do App Store Connect com papel de In-App Purchase.
- **Push no iPhone**: chave APNs `.p8` própria (Team Scoped), fora do
  Codemagic, no servidor que envia (`docs/push.md`).
- **Leitura dos builds e versões pela API da Apple** (o fluxo "Engenharia:
  builds da App Store" do n8n e o coletor do Analista): outra chave de API
  do App Store Connect, com papel de leitura, guardada no cofre do n8n.
- **Avaliações e downloads**: coletor do Analista, pelo feed público da
  Apple e pela conta de serviço da Play do Analista.

## 8. Checklist para copiar

- [ ] App ID na Apple com as capabilities; certificado `.p12`; perfil App
      Store; app criado; chave de API (Issuer ID, Key ID, `.p8`).
- [ ] App na Play; keystore `.jks` guardado em dois lugares; conta de serviço
      convidada no Play Console; primeiro `.aab` subido à mão; os dois SHA-1
      no Google Cloud se houver login com Google.
- [ ] Codemagic: repositório conectado; integração App Store Connect com nome
      de referência; `.p12`, `.mobileprovision` e `.jks` nas Code signing
      identities; grupo `google_play` com o JSON; grupo do app com as
      `NEXT_PUBLIC_*`.
- [ ] Repositório: `build.gradle` com assinatura por arquivo ou ambiente e
      `versionCode` por ambiente; `gradle.properties` com o piso;
      `keystore.properties` no `.gitignore`; `pbxproj` com bundle id e versão;
      `codemagic.yaml` com os três workflows e os `<...>` trocados.
- [ ] Primeiro build por plataforma, depois o `lojas`; o número de cada envio
      anotado da linha do log.
