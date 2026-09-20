# Proposta: fazer o endereço https abrir o app sozinho (App Links / Universal Links)

**Estado: não feita.** Precisa de build novo nas duas lojas, e isso é decisão do
dono. Escrita em 20/09/2026, no mesmo dia em que a ponte passou a mandar todo
link de e-mail para o app.

## O que está no ar hoje

Todo link de autenticação (confirmar cadastro, redefinir senha) volta para
`https://mentorque.com.br/auth-bridge`. De lá:

- **computador** segue direto para `/app`, porque ali não existe app para abrir;
- **celular** tenta `mentorque://auth-callback` e, se em 2,5 segundos ninguém
  assumir, segue para `/app` sozinho.

A regra está em `lib/app/pontePraApp.ts`, é pura e tem conferência que morde
(quatro defeitos plantados em 20/09).

## O que está errado nisso, e é honesto dizer

**O relógio é um chute.** Não existe forma de o navegador perguntar "este
aparelho tem o app instalado?". O que a ponte faz é tentar e medir o efeito
colateral: se o app assumiu, o navegador vai para segundo plano e a página fica
escondida; se continua na frente da pessoa, provavelmente não tem app. Isso erra
nos dois sentidos:

- **celular lento abrindo o app**: o relógio dispara antes, e a pessoa termina
  logada NO NAVEGADOR, que é exatamente o que o dono não quer;
- **Android sem o app**: dependendo da versão do Chrome, a navegação para um
  esquema desconhecido troca a página por um erro (`ERR_UNKNOWN_URL_SCHEME`)
  ANTES de o relógio existir. Aí não há reserva nenhuma, porque não há mais
  página. A saída manual ("Continuar no navegador") nem chega a ser vista.

O segundo caso é o que me deixa desconfortável, e não consigo medir daqui: a
resposta muda por versão de Chrome e por fabricante.

## O jeito definitivo

Fazer o PRÓPRIO endereço https abrir o app. O sistema operacional resolve, sem
esquema próprio, sem relógio, sem chute: se o app está instalado, ele abre; se
não está, a página carrega no navegador. É o mesmo mecanismo que faz um link do
YouTube abrir o app do YouTube.

**Android (App Links)**

1. `public/.well-known/assetlinks.json` com a impressão digital SHA-256 da chave
   que assina o app na Play. A do Play App Signing, não a do upload;
2. `<intent-filter android:autoVerify="true">` no `AndroidManifest.xml`, para o
   host `mentorque.com.br` e o caminho `/auth-bridge`;
3. build novo na Play.

**iOS (Universal Links)**

1. `public/.well-known/apple-app-site-association`, servido como
   `application/json` e SEM extensão no nome;
2. o direito de Associated Domains (`applinks:mentorque.com.br`) no perfil de
   provisionamento;
3. build novo na App Store.

## O custo e o risco

- **Custo**: algumas horas de configuração, mais um ciclo de revisão em cada
  loja. O arquivo do Android precisa da impressão digital do Play App Signing,
  que só o dono alcança no console.
- **Risco**: baixo e reversível. Enquanto os dois não estiverem no ar, a ponte
  de hoje continua funcionando exatamente como funciona; quando entrarem, o
  esquema próprio vira reserva da reserva.
- **Ganho de tabela**: qualquer link nosso (`/app/...`) passa a abrir no app.
  Hoje só a autenticação tem ponte.

## Como conferir que ficou de pé

Nenhum script daqui alcança isto, e não adianta fingir que alcança. O roteiro é
de aparelho:

1. `https://mentorque.com.br/.well-known/assetlinks.json` responde 200 com
   `content-type: application/json`;
2. no Android, `adb shell pm get-app-links com.mentorque.app` diz `verified`;
3. com o app instalado, abrir o link do e-mail **abre o app**, sem passar pela
   tela "Abrindo o Mentorque…";
4. desinstalando o app, o MESMO link abre a página no navegador.

O passo 4 é o que prova que ninguém ficou num beco.
