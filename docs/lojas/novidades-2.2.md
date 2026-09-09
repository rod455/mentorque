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

## Roteiro de aparelho

A escrever antes do build.

## Antes de enviar

- Versão 2.2 nos três lugares (`npm run conferir:versoes`).
- Ao publicar, acrescentar `"2.2"` à lista `JA_PUBLICADAS`, no mesmo dia.
- Na Apple, criar a versão no App Store Connect e enviar para revisão; subir o
  build não basta.
