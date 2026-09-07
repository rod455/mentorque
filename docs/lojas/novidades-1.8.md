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

---

# A SEGUNDA 1.8 (07/09/2026)

**Isto não é a mesma versão de cima.** É um segundo build do Android, enviado e
publicado em 07/09, com o MESMO nome de versão da 1.8 de 04/09 e conteúdo
completamente diferente. O nome repetido foi um esquecimento, está explicado no
`scripts/verifica-versoes.mjs` e no diário, e o repositório já subiu para 1.9.

Fica registrado aqui porque a ficha da loja é o lugar onde essa confusão custa:
quem colar as notas de cima nesta entrega vai prometer "responder a pergunta do
dia ficou mais leve", que já foi entregue em 04/09, e não vai contar nada do que
esta versão realmente faz.

## O que vai NO BINÁRIO

1. **A tela de login percebe que o login aconteceu.** Entrar com o Google no
   Android completava tudo e a tela continuava pedindo login. A sessão chegava
   e ninguém olhava para ela.
2. **O interruptor de avisos diz a verdade sobre o aparelho.** Ele mostra o que
   o sistema realmente permite, ligar leva aos ajustes quando a permissão ainda
   não existe, e desligar continua desligando.
3. **O convite do pós-quiz leva a algum lugar.** Dizer "quero o aviso" quando a
   permissão não pode ser dada ali abre os ajustes do aparelho.
4. **O caminho do login nunca fica sem saída.** Invisível para quem usa: quando
   a folha nativa não existe no aparelho, o pedido cai para o navegador em vez
   de morrer.

## O que NÃO precisa de binário

Já está no ar pela Vercel: os links dos guias no rodapé do site.

## Notas para a Play, PARA O DONO CONFERIR ANTES DE COLAR

Seguem as três regras: falam do ganho e não do defeito, com o verbo na ação da
pessoa, e não prometem nada que não tenha sido conferido.

**Novidades desta versão** (limite: 500 caracteres)

```
Entre com a sua conta do Google e o app abre já logado, direto no seu carro.

Os avisos da pergunta do dia ficaram no seu controle: o interruptor do Perfil
mostra o que o seu aparelho permite de verdade, e ligar leva você direto para
onde a permissão é dada.

E ao responder o quiz, aceitar o lembrete de amanhã resolve ali mesmo.
```

## Depois de publicar

- **Trocar o `android` em `app/api/app/latest/route.ts`.** Ele está em 55, que é
  a 1.7, desde 03/09: a primeira 1.8 subiu e este número não. Enquanto ele ficar
  atrás, ninguém vê o aviso de versão nova e todo mundo espera a atualização
  automática da Play. Como o banner compara o versionCode e não o nome, apontar
  para o build desta entrega acende o aviso inclusive para quem está na PRIMEIRA
  1.8, que é o único jeito de separar as duas na mão das pessoas.
- O número sai de Play Console → Produção → Versões → "Códigos de versão", ou da
  linha `versionCode deste envio: N` no log do Codemagic. Não sai do
  `gradle.properties`, que é só piso, nem do "Index" da tela do Codemagic: os
  dois já produziram erro aqui.
