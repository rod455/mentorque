# Novidades da versão 2.3

Aberta em 10/09/2026, depois de a 2.2 reprovar o login do Google no Android
do mesmo jeito da 2.0 e da 2.1, mas desta vez com testemunha: a `app_erros`
recebeu "Google Sign-In cancelled by user", e só isso, porque é a frase fixa
que o plugin devolve. Esta versão existe para a frase vir inteira.

## O que vai NO BINÁRIO

1. **O "cancelado" do Google diz o que o Google viu.** O plugin
   (`@capgo/capacitor-social-login`) troca a mensagem do Android por uma frase
   fixa e deixa no Logcat as quatro coisas que decidem o caso: a mensagem de
   verdade, o pacote, a SHA-1 do certificado que assinou o app instalado e o
   client id que ele usou. O remendo (`scripts/conserta-social-login.mjs`, no
   `postinstall`) põe as quatro dentro da mesma rejeição, que o app já relata
   em `app_erros`. Nada muda na tela; o código de erro continua USER_CANCELLED
   e o app continua engolindo como cancelamento. `conferir:login` cobra o
   remendo e reprova se o plugin voltar à frase muda.

## O que NÃO precisa de binário

Nada até aqui.

## Roteiro de aparelho, e ele é obrigatório

Escrito antes do build. No aparelho da Luana (Android):

1. **Entrar com o Google.** Se funcionar, o caso fecha e o restante do roteiro
   da 2.1 segue. Se a tela voltar muda, a linha em `app_erros`, versão 2.3.0,
   tem de trazer, além do "cancelled by user", a mensagem entre parênteses e
   `package=`, `signingSha1=` e `webClientId=`. Com isso:
   - `signingSha1` diferente das duas SHA-1 cadastradas no Google Cloud
     (upload termina em `17:DF`, Play termina em `B4:4D:41`): o certificado
     que assinou o app instalado não está no console, e o conserto é
     cadastrar exatamente o que a linha mostrar.
   - `webClientId` que não comece com `1009695078013-eom7is`: o build saiu com
     outro id, e o conserto é no Codemagic.
   - os dois batendo: a mensagem entre parênteses é a pista, e o caso muda de
     figura (aparelho, conta, Play Services).
2. Os cinco passos restantes do roteiro da 2.1 (foto do perfil, câmera ou
   galeria, ajuste da foto, o "?", avisos), que nunca foram rodados inteiros.

O que a conferência daqui não alcança: se o login vai funcionar, e se o
remendo compila no Gradle do Codemagic (aqui só a sintaxe do Java foi
conferida, com um parser; o build é a prova). Sobre esse build, até um
aparelho abrir, a resposta é "sem sinal ainda".

## O que o aparelho disse (10/09, 10:10 UTC)

Passo 1 reprovou igual, e a linha veio inteira, versão 2.3.0:

    Google Sign-In cancelled by user (activity is cancelled by the user.)
    package=mentorque.app
    signingSha1=E5:1C:71:4E:AF:82:E6:58:E7:6A:46:96:E0:81:3E:50:5C:91:71:CC
    webClientId=1009695078013-eom7ist1

Pacote certo, client id certo, e a SHA-1 do certificado que assinou o app
instalado NÃO é nenhuma das duas cadastradas no Google Cloud (upload termina
em `17:DF`, a outra em `B4:4D:41`). É o primeiro caso do roteiro: o conserto
é cadastrar essa SHA-1 num cliente Android do mesmo projeto, e não precisa
de build, porque a checagem é do lado do Google. Os outros passos não foram
rodados.

**Fechado às 10:19 UTC do mesmo dia**: com a SHA-1 cadastrada, a mesma 2.3
logou com o Google num Android 8.1 (sessão criada no Supabase, provider
google). Primeiro login nativo do Android desde que o app existe.

## Antes de enviar

- Versão 2.3 nos três lugares (`npm run conferir:versoes`).
- Ao publicar, acrescentar `"2.3"` à lista `JA_PUBLICADAS`, no mesmo dia.
- Na Apple, criar a versão no App Store Connect e enviar para revisão; subir o
  build não basta. O iPhone não precisa desta versão (o remendo é só do
  Android), mas o build `lojas` gera os dois.
