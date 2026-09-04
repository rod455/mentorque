# Novidades da versão 1.8

Versão de ESTABILIDADE, e ela nasceu de um relato com vídeo. Um cliente gravou
a tela do Android fechando ao responder a pergunta do dia, na 1.7, no mesmo dia
em que a 1.7 chegou à Play.

As três regras de escrita da 1.7 continuam valendo, e nesta versão a terceira
pesa mais que nunca: **o texto não pode prometer cura.** A causa do fechamento
não está provada. O que subiu foi menos trabalho no caminho onde ele acontece e
uma testemunha que passa a funcionar. Prometer "corrigimos o fechamento" seria
vender o que não temos, e o cliente que gravou o vídeo é justamente quem vai
conferir primeiro.

O que a 1.8 leva, e por quê, está em `docs/qa/app-fecha-no-quiz.md`.

---

## Google Play

**Novidades desta versão** (limite: 500 caracteres)

```
Responder a pergunta do dia ficou mais leve: o app faz menos trabalho no
instante da resposta, e a sua sequência continua contada do mesmo jeito.

Se alguma coisa sair do lugar, o app agora sabe contar o que estava fazendo,
e isso chega até a gente sem você precisar escrever nada.

Obrigado a quem nos avisou: relato de usuário é o que vira conserto por aqui.
```

## App Store

**Novidades desta versão**

```
Responder a pergunta do dia ficou mais leve. O app faz menos trabalho no
instante em que você toca na alternativa, e a sua sequência segue contada do
mesmo jeito.

E quando alguma coisa sai do lugar, o app agora sabe dizer o que estava fazendo
na hora. Esse aviso chega até nós sozinho, sem você precisar escrever nada.

Obrigado a quem nos avisou desta vez: relato de usuário é o que vira conserto
por aqui.
```

---

## O que vai NO BINÁRIO

Só isto. Se algo não estiver na lista, não veio nesta versão.

1. **Uma porta só para perguntar a permissão de avisos.** Responder o quiz
   atravessava a ponte nativa duas vezes seguidas para descobrir o mesmo fato.
   Agora a resposta é guardada e esquecida quando o app volta ao primeiro
   plano. Isso reduz o caminho quente; não é o conserto do fechamento.
2. **A migalha do último passo volta a testemunhar.** Ela existia desde a 1.7 e
   ficou muda no fechamento de 04/09, porque um app que morre some da tela e o
   próprio código tratava isso como "a pessoa saiu do app". Agora a hora da
   pausa é gravada, e pausa colada no passo continua virando relato.

## O que NÃO precisa de binário

Foi para a Vercel no push e já está no ar: os três guias de sintoma do site, o
coletor de erros começando no `AppBoundary`, o sitemap e as conferências novas.
Nada disso conta como novidade de loja.

## Antes de enviar

- Conferir que o versionCode subiu (56) e que o nome da versão é 1.8. A 1.7 já
  está publicada e foi acrescentada à lista de `scripts/verifica-versoes.mjs`,
  então repetir o número agora reprova em `npm run conferir`.
- Roteiro de aparelho, e é curto porque o alvo é um só: responder a pergunta do
  dia num Android, com os avisos LIGADOS, e conferir que o app não fecha. Se
  fechar, abrir o app de novo em seguida: é essa abertura que manda o relato.
- Depois de publicar, ler `app_erros` procurando `tipo = 'fechou'`. É a primeira
  versão em que essa linha pode aparecer de verdade.
