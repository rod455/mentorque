# Gerar o app Android no Android Studio (Windows)

Roteiro para compilar o `.aab` na sua máquina, em `C:\Apps\Mentorque`.

O app é **empacotado**: telas, estilos, imagens e lógica viram arquivos que
entram dentro do binário. Não existe `server.url` — o Android nunca carrega o
site para desenhar a interface. Por isso o passo `build:native` é obrigatório:
sem ele o `cap sync` não acha o que copiar e o build morre com
`Could not find the web assets directory`.

---

## 1. Trazer o código para o PC

**Primeira vez:**

```powershell
git clone https://github.com/rod455/mentorque.git C:\Apps\Mentorque
cd C:\Apps\Mentorque
```

**Nas vezes seguintes** (sempre antes de compilar, para não gerar um `.aab` de
código velho):

```powershell
cd C:\Apps\Mentorque
git checkout main
git pull origin main
```

## 2. Variáveis de ambiente (só na primeira vez)

Copie `.env.example` para `.env.local` e preencha. Para o Android, quatro
importam — e a que mais dá problema é a terceira:

| Variável | Para quê |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | login e banco |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | idem |
| `NEXT_PUBLIC_SITE_URL` | `https://mentorque.com.br` — de onde vêm as rotas `/api` |
| `NEXT_PUBLIC_REVENUECAT_IOS_KEY` | só iPhone; no Android fica sem uso |

`NEXT_PUBLIC_SITE_URL` errado gera um app que abre normalmente e não responde
nada: Biela muda, FIPE, revisões — tudo depende dela. Não é o endereço do
Supabase nem o id do pacote.

## 3. Gerar o pacote e sincronizar

```powershell
npm ci
npm run android:studio
```

O `android:studio` faz as duas coisas: gera o app estático e copia para
`android/app/src/main/assets/public`. No fim ele lista os plugins — no Android
têm que ser **3**: `@capacitor/app`, `@capacitor/browser` e
`@capacitor-community/admob`.

## 4. Subir o versionCode

Abra `android/gradle.properties` e **incremente** `mentorqueVersionCode`:

```
mentorqueVersionCode=3
```

Isto não é opcional. A Play recusa um `versionCode` já enviado, e ele fica
queimado mesmo que a versão tenha sido reprovada. O CI resolve sozinho pelo
número da build; no Android Studio, quem incrementa é você.

## 5. Compilar no Android Studio

1. **File → Open** → `C:\Apps\Mentorque\android` (a pasta `android`, não a raiz)
2. Espere o Gradle sincronizar
3. **Build → Generate Signed Bundle / APK → Android App Bundle**
4. Escolha o keystore `.jks` (o mesmo de sempre — perder essa chave significa
   não conseguir mais atualizar o app na Play)
5. Variant **release**

O `.aab` sai em `android\app\build\outputs\bundle\release\`.

## 6. Publicar

Play Console → **Teste interno** primeiro. Sem espera de revisão: o build fica
disponível em minutos para até 100 testadores. Só promova para produção depois
de instalar e conferir no aparelho.

---

## O que é diferente do iPhone

Mesmo código, comportamento diferente em tempo de execução — nenhum dos dois
projetos mexe no outro:

| | Android | iPhone |
|---|---|---|
| Anúncios | sim (AdMob) | nunca |
| Vende assinatura | não (modo leitor, política do Play Billing) | sim (compra da Apple) |
| Onboarding | 4 telas, sem oferta de Premium | 5 telas, com a oferta |
| Login social | pelo navegador, volta por `mentorque://` | folha nativa, sem sair do app |
| Plugins no binário | app, browser, admob | app, browser, revenuecat, social-login |

A escolha de plugins por plataforma está em `capacitor.config.ts`
(`android.includePlugins` e `ios.includePlugins`). O resto é decidido em tempo
de execução por `nativePlatform()` e `sellsInApp()`, em `lib/app/wrapper.ts`.

Vale notar por que o social-login fica **fora** do Android: ele arrasta o SDK do
Facebook, que exige `facebook_app_id` no `strings.xml` e derruba o app na
inicialização se faltar. No Android o login social segue pelo navegador, com o
retorno pelo esquema `mentorque://` registrado no `AndroidManifest.xml`.
