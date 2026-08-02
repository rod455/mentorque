# Mentorque — gerar o .aab para a Google Play

O app Android é um wrapper (Capacitor) que carrega `https://mentorque.com.br/app`.
Conteúdo, telas e preços atualizam via deploy do site — **não** precisa de novo
release na loja, exceto se mudar esta "casca" (ícone, nome, plugins, permissões).

## Pré-requisitos (uma vez)
- Android Studio instalado (com SDK 34+)
- Node instalado; na raiz do projeto: `npm install`

## Passo a passo

1. **Sincronizar o projeto** (sempre que mudar plugin/config do Capacitor):
   ```bash
   npx cap sync android
   ```

2. **Abrir no Android Studio:**
   ```bash
   npx cap open android
   ```
   (ou abra a pasta `android/` manualmente)

3. **Criar a chave de assinatura** (só na primeira vez):
   - Menu **Build → Generate Signed App Bundle/APK → Android App Bundle → Next**
   - **Create new…** → escolha um arquivo `.jks`, defina senhas e alias (ex.: `mentorque`)
   - ⚠️ **GUARDE o arquivo .jks e as senhas** — sem eles não dá para atualizar o app depois.

4. **Gerar o .aab:**
   - Ainda no assistente: selecione a keystore criada → **Next** → variante **release** → **Create**
   - O arquivo sai em `android/app/release/app-release.aab`

5. **Subir na Play Console:**
   - Testar e lançar → Produção (ou Teste interno primeiro) → Criar versão → arraste o `.aab`

## Versões
A cada novo envio para a loja, incremente em `android/app/build.gradle`:
- `versionCode` (1 → 2 → 3…, obrigatório)
- `versionName` ("1.0" → "1.1"…, visível ao usuário)

## O que já está configurado
- WebView carregando o app de produção (`capacitor.config.ts`)
- AdMob: app id no `AndroidManifest.xml` + plugin `@capacitor-community/admob`
  (o site detecta o wrapper e usa os blocos reais; no navegador, house ads)
- Modo leitor: dentro do wrapper não há oferta/compra de assinatura
  (política do Google Play Billing) — assinante loga e o Premium libera
- Ícone e splash gerados a partir da marca (`npx @capacitor/assets generate --android`
  regenera, usando `assets/icon.png` e `assets/splash.png`)
- Orientação retrato
