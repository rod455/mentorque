# PROPOSTA, não aplicada: "Esqueci minha senha" não redefine senha nenhuma

Achado da rodada de QA de 16/09/2026, na varredura do fluxo de login e
recuperação de conta. Não apliquei porque o conserto é funcionalidade nova em
AUTENTICAÇÃO e eu não consigo reproduzir o passo que importa (o clique no link
do e-mail) nesta sessão. Conserto que não foi reproduzido é aposta com nome de
conserto, ainda mais em login. O raciocínio e o patch estão aqui para a
decisão custar minutos.

## O que o app promete

`components/app/screens/Auth.tsx`, no botão "Esqueci minha senha":

```ts
const res = await resetPassword(email);
if (res.error) setErr(a.errGeneric);
else setNotice(a.resetSent);
```

E `a.resetSent`, em `lib/app/content.ts`, é literalmente:

> "Enviamos um link para redefinir sua senha."

## O que o app faz

`lib/app/auth.tsx`:

```ts
const resetPassword = useCallback(async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim(), { redirectTo: emailRedirectUrl() },
  );
  ...
```

O link chega, a pessoa clica, e `emailRedirectUrl()` manda para `/app`. O
supabase-js troca o token por sessão, o `onAuthStateChange` faz `setUser` e
acabou. **A senha antiga continua valendo, e não existe nenhuma tela para
digitar uma nova.**

A prova é uma busca só, no repositório inteiro:

```
grep -rn "updateUser\|PASSWORD_RECOVERY\|type=recovery" lib/ app/ components/
→ lib/app/socialLogin.ts:208  (updateUser({ data: { name } }), que grava NOME)
```

Um `updateUser` no código todo, e ele é do login social gravando o nome. Não
há caminho para trocar senha em lugar nenhum, nem no app nem no site.

## O estrago, em ordem de gravidade

1. **O fluxo nunca fecha.** Quem esqueceu a senha ganha um login temporário,
   não uma recuperação. Da próxima vez que precisar entrar, a senha que ela
   não sabe continua sendo a única válida, e ela pede o link de novo. Para
   sempre.
2. **A tela mente.** "Enviamos um link para redefinir sua senha" descreve um
   recurso que não existe. É o tipo de frase que vira avaliação de uma
   estrela, porque a pessoa acha que o app está quebrado e não que falta o
   recurso.
3. **No app da loja é pior.** `emailRedirectUrl()` devolve `https://<site>/app`
   inclusive no app nativo. O link abre o NAVEGADOR, a sessão nasce lá, e o
   app no celular continua deslogado. A pessoa fez tudo certo e nada mudou na
   tela onde ela estava.

O item 3 é o mesmo formato do defeito que já mordeu esta casa no OAuth: a
sessão ficava no site e o app seguia deslogado (o comentário está em
`lib/app/socialLogin.ts`). Vale reler aquele conserto antes de fazer este.

## Patch sugerido

Três peças pequenas e uma decisão.

**1. Expor a troca de senha em `lib/app/auth.tsx`:**

```ts
const updatePassword = useCallback(async (senha: string): Promise<Result> => {
  if (!supabase) return { error: "auth_disabled" };
  const { error } = await supabase.auth.updateUser({ password: senha });
  return error ? { error: error.message } : {};
}, [supabase]);
```

**2. Reconhecer que a pessoa chegou por recuperação.** O evento existe e hoje é
descartado, porque o `onAuthStateChange` ignora o primeiro argumento:

```ts
// hoje:  (_e, session) => setUser(session?.user ?? null)
supabase.auth.onAuthStateChange((evento, session) => {
  setUser(session?.user ?? null);
  if (evento === "PASSWORD_RECOVERY") setPrecisaTrocarSenha(true);
});
```

**3. Uma tela simples de nova senha**, que aparece enquanto
`precisaTrocarSenha` for verdadeiro: dois campos iguais, `updatePassword`, e
uma confirmação. Ela não pode ser pulável, senão volta ao problema de hoje.

~~**A decisão, que é do dono**: no app da loja, mandar o link para `/app` na web
deixa o app nativo de fora. As duas saídas são um deep link
(`mentorque://auth-callback`, que o OAuth já usa e o app já sabe receber) ou
assumir que a recuperação acontece na web e o app pede para a pessoa entrar
com a senha nova depois. A primeira é melhor para quem usa o app; a segunda é
mais simples e não mexe em configuração de provedor.~~

## CORREÇÃO (17/09/2026): a decisão acima é uma escolha falsa

Fui conferir para levar a pergunta ao dono e ela se dissolveu. **O caminho do
deep link não mexe em configuração de provedor nenhuma, porque ele já está
construído, cadastrado e rodando em produção.**

O que existe hoje, e não foi feito para a recuperação de senha, mas serve
inteiro para ela:

- `NATIVE_AUTH_REDIRECT` (`wrapper.ts:31`) é `${APP_ORIGIN}/auth-bridge`, uma
  página https comum que passa na validação do GoTrue. Ela nasceu porque o
  GoTrue **recusa** `mentorque://` na lista de Redirect URLs, e o comentário
  dela conta essa história.
- `app/auth-bridge/page.tsx` repassa **query e fragmento inteiros** para o
  esquema próprio, e o comentário dela diz por quê: "serve tanto para PKCE
  (`?code=`) quanto para o fluxo implícito (`#access_token=`)". Um link de
  recuperação é exatamente um desses dois.
- `auth.tsx:104` já escuta o deep link, e `completeOAuth` já trata as duas
  formas (`exchangeCodeForSession` e `setSession`).

A prova de que essa ponte funciona não é leitura de código: **29 das 32 contas
do banco não têm senha**, ou seja, entraram por login social, que é o fluxo que
atravessa essa mesma ponte.

Então o conserto é menor do que esta proposta imaginava. O defeito do item 3 é
uma linha: `emailRedirectUrl()` (`wrapper.ts:109`) devolve `${APP_ORIGIN}/app`
quando é app nativo, e deveria devolver `NATIVE_AUTH_REDIRECT`, como o login
social já faz.

## CORREÇÃO 2: a peça 2 do patch não vai disparar no app das lojas

`PASSWORD_RECOVERY` é um evento que o supabase-js emite quando ELE mesmo
encontra o token na URL, pelo `detectSessionInUrl`. No caminho nativo quem cria
a sessão somos nós, chamando `exchangeCodeForSession` ou `setSession` na mão, e
esses emitem `SIGNED_IN`. Ou seja: escutar só o evento funciona na web e falha
calado no app, que é justamente onde o defeito é pior.

O que carrega a intenção nos dois caminhos é a própria URL: o link de
recuperação traz `type=recovery`. Então a peça 2 tem que ser as duas coisas:

- na web, o evento `PASSWORD_RECOVERY` do `onAuthStateChange`;
- no nativo, ler `type` da URL do deep link dentro do `completeOAuth` e ligar o
  `precisaTrocarSenha` ali.

Uma conferência que morde isso: plantar a remoção do `type=recovery` e ver a
suíte reprovar. Sem ela, este é o tipo de defeito que passa no navegador e só
aparece no aparelho de alguém.

## O tamanho do estrago, medido (17/09/2026)

Antes de tratar como urgência, fui ao banco:

| | |
|---|---|
| Contas | 32 |
| Contas **com senha** (as únicas que podem esquecer uma) | **3** |
| Pediram recuperação alguma vez | **1**, em 09/09 |

As outras 29 entraram por Google ou Apple e não têm senha para esquecer. O
defeito é real e a tela mente, mas ele alcança três pessoas hoje, e uma esbarrou
nele. Isso não segura um envio de versão; cresce junto com a base de login por
e-mail.

## Como conferir depois

Isto precisa de aparelho e de e-mail de verdade, e é justamente o passo que eu
não consegui rodar:

1. pedir recuperação com uma conta de teste;
2. clicar no link do e-mail no CELULAR, com o app instalado;
3. definir a senha nova;
4. fechar o app, abrir e entrar com a senha nova.

O passo 4 é o que prova. Chegar logado no passo 2 não prova nada, e é
exatamente isso que acontece hoje.

Depois do conserto, cabe uma conferência de bateria: se a tela promete
redefinir senha, tem que existir um `updateUser({ password })` alcançável. É
uma conferência de texto, grosseira, mas pega justamente o estado de hoje.
