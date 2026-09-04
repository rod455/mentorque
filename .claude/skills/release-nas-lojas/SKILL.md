---
name: release-nas-lojas
description: Como preparar e mandar uma versão do app para a App Store e a Google Play sem queimar build. Use SEMPRE que a conversa envolver subir versão, novo build, Codemagic, versionCode, versionName, TestFlight, notas de versão, "o que vai nesta versão", ou quando um build falhar na compilação ou na publicação. Também antes de dizer que qualquer conserto "precisa de build", porque metade das coisas aqui vai ao ar sem build nenhum.
---

# Mandar uma versão para as lojas

Cada build é caro em tempo de espera, e alguns erros só aparecem no fim do
caminho, depois de tudo compilar. Todos os tropeços abaixo aconteceram.

## Primeiro: isto precisa mesmo de build?

Boa parte do que se conserta aqui **não** precisa. Confira antes de prometer uma
versão nova ao dono:

| onde mora a mudança | precisa de build? |
|---|---|
| `app/api/**`, site, landing, e-mail | não, vai no push (Vercel) |
| aulas e trilhas (`lib/app/conteudo/aulas.ts`) | não, o catálogo é remoto |
| artes em `public/learn/` | não, servidas do site |
| `lib/app/**`, `components/app/**` | sim, mas veja abaixo |
| `android/**`, `ios/**`, plugins | sim |

O caso sutil: código do app que só morde na **web** (query na URL, recarga de
página no login social) vai ao ar no push, porque a web é servida pela Vercel. O
binário carrega a mesma mudança, e ela entra sozinha no próximo build.

## A versão mora em três lugares e eles não conversam

```
lib/app/content.ts        APP_VERSION        (o que o app DIZ que é)
android/app/build.gradle  versionName        (o que a Play publica)
ios/.../project.pbxproj   MARKETING_VERSION  (duas ocorrências)
```

`npm run conferir:versoes` compara os três **e** confere que a versão ainda não
foi publicada. A segunda pergunta existe porque em 03/09 os três concordavam em
1.6, que já estava aprovada, e o build inteiro morreu na publicação com
`CFBundleShortVersionString must contain a higher version`.

Ao publicar uma versão, acrescente o número à lista `JA_PUBLICADAS` no
`scripts/verifica-versoes.mjs`.

## versionCode: a única fonte que vale

O CI usa o contador do Codemagic e trata o `mentorqueVersionCode` do
`android/gradle.properties` só como **piso**. A linha que responde de verdade é
`versionCode deste envio: N`, impressa no log do passo "Compilar .aab".

O "Index" da tela do Codemagic **não** é o contador. Isso já produziu dois
falsos alarmes.

**E um envio que falha pode queimar o número mesmo assim.** Em 03/09 a Apple
recusou o envio e a Play aceitou, publicando na faixa interna um binário com o
conteúdo da 1.7 vestido de 1.6. O 54 ficou gasto. Depois de qualquer envio
falho, confira o que cada loja aceitou antes de assumir que nada aconteceu.

## Quando o build quebra em dependência que não é nossa

O build do iPhone morreu num `cannot find 'FBSDKAppLinkUtility' in scope`,
dentro do plugin da AppsFlyer, sem ninguém ter tocado nele. Duas lições:

**O build nativo não é reproduzível.** O Codemagic usa `xcode: latest`, os
pacotes SPM entram por faixa de versão e não existe `Package.resolved`
versionado. Três coisas se movem sozinhas entre um build e outro, então "não
mexi em nada" não significa "nada mudou".

**Remendo em `node_modules` precisa das duas metades:** um `postinstall` que
aplica (para valer no `npm ci` do CI sem depender de alguém lembrar de um passo
no yaml) e uma conferência que reprova se o remendo sumir. E fixe a versão do
pacote sem acento, porque o remendo aponta para um texto exato.

## As notas das lojas são texto de produto, não changelog

O que se escreve em "Novidades desta versão" **vai para a ficha**, e na App
Store aparece para qualquer pessoa, inclusive quem ainda não baixou, até a
próxima versão.

Três regras, e elas estão junto com as notas de cada versão em `docs/lojas/`:

1. **Fale do ganho, não do defeito.** "O lembrete leva direto para a pergunta",
   não "corrigimos o redirecionamento do push". Contar o defeito ensina o leitor
   que o app tinha um problema que ele talvez nem tivesse notado.
2. **Descreva o que a pessoa vai sentir**, com o verbo na ação dela.
3. **Nada que não tenha sido conferido.** Onde a prova não fecha, fale do que a
   rede faz, e não de uma cura. Quando o app fechava no Android sem causa
   provada, a ficha dizia "a tela se refaz sozinha", que é verdade, e não
   "consertamos o app fechando".

Confira o limite de 500 caracteres da Play contando o texto de verdade.

## Antes de enviar, e depois

**Antes:** separe no arquivo de notas o que vai NO BINÁRIO do que já está no ar.
Sem isso a conta do release sai dobrada e o texto promete o que a loja não
entrega. E escreva o roteiro de teste de aparelho para o que nenhuma suíte
alcança: toque em notificação com o app fechado, compra pela loja, e qualquer
coisa que dependa de plugin nativo.

**Depois, e só depois:** `/api/app/latest` aponta para o que está em
**PRODUÇÃO**. Bumpar com a versão ainda em análise acende o aviso de "versão
nova disponível" para todo mundo, apontando para algo que ninguém consegue
baixar. Espere a aprovação e use o número do log.
