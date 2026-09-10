# Novidades da versão 2.2

Aberta em 09/09/2026, com a 2.1 aprovada nas duas lojas. O que entrar aqui
precisa, antes do build, do roteiro de aparelho escrito (regra do dono, em
`.claude/skills/release-nas-lojas`).

## O que vai NO BINÁRIO

1. **O login nativo conta por que falhou.** Na 2.0/2.1 a caixinha do Google
   abre, a conta é escolhida e a tela volta muda: o plugin devolve algo com
   "cancel", o app engole, e nenhum pedido chega ao Supabase. Agora os três
   desfechos sem sessão (plugin recusou, sem idToken, Supabase recusou) viram
   linha em `app_erros` com a mensagem exata, inclusive o "cancelado". Não
   muda nada na tela; muda o que a gente enxerga. `conferir:login` cobra.

O que mais entrar vem do roteiro da 2.1 no aparelho da Luana
(`novidades-2.1.md`, seis passos).

## O que NÃO precisa de binário

A escrever a cada mudança.

## Roteiro de aparelho, e ele é obrigatório

Escrito em 09/09, antes do build. O build 2.2 sai com a variável
`NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID` recriada no Codemagic no mesmo dia (o dono
apagou e criou de novo com o id do MentorqueWeb), então ninguém sabe se o
valor anterior estava errado; o que se sabe é que este build carrega o certo.

No aparelho da Luana (Android), na ordem:

1. **Entrar com o Google.** A caixinha do sistema abre, a conta é escolhida e
   o app cai logado. Se a tela voltar muda, como na 2.1, o passo seguinte é
   meu, não dela: em `app_erros` tem de existir uma linha "login nativo
   google: ..." com a mensagem do plugin, com versão 2.2.0. Se a linha não
   existir, o relato falhou e isso é um segundo defeito.
2. Os cinco passos restantes do roteiro da 2.1 (foto do perfil, câmera ou
   galeria, ajuste da foto, o "?", avisos), que nunca foram rodados inteiros.

O que a conferência daqui não alcança: se o login vai funcionar. Sobre esse
build, até um aparelho abrir, a resposta é "sem sinal ainda".

## O que o aparelho disse (10/09)

Passo 1 reprovou do mesmo jeito da 2.1: caixinha, conta, Entrar, tela muda.
Mas desta vez a `app_erros` recebeu a linha, às 00:04 UTC, versão 2.2.0:

    login nativo google: Google Sign-In cancelled by user

É a frase fixa do plugin para `GetCredentialCancellationException`; a mensagem
que o Android mandou, o pacote, a SHA-1 e o client id ficam só no Logcat. A
2.3 remenda o plugin para essas quatro coisas virem na mesma linha
(`scripts/conserta-social-login.mjs`). Os outros cinco passos não foram
rodados.

## Antes de enviar

- Versão 2.2 nos três lugares (`npm run conferir:versoes`).
- Ao publicar, acrescentar `"2.2"` à lista `JA_PUBLICADAS`, no mesmo dia.
- Na Apple, criar a versão no App Store Connect e enviar para revisão; subir o
  build não basta.
