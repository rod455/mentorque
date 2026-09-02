# Entrar com a Apple fora do iPhone

O botão já existe no código e está DESLIGADO de propósito. Este arquivo é o que
falta fazer para ligar, e por que ligar antes disso quebraria em vez de ajudar.

## Onde o botão está hoje

- **iPhone (app da loja): funcionando.** O login é nativo: a folha da Apple
  devolve um `idToken` para dentro do app e o Supabase troca por sessão. A
  audiência do token é o bundle do app, e o bundle já está cadastrado.
- **Site, Android, iPad: escondido.** Quem manda é `appleLoginDisponivel()`
  em `lib/app/socialLogin.ts`, atrás de `NEXT_PUBLIC_APPLE_WEB=1`.

## Por que está escondido

Fora do iPhone o pedido vai pelo **fluxo web** da Apple, e a Apple exige um
identificador SEPARADO para isso: um **Services ID**. O bundle do app não
serve. Sem o Services ID, a Apple recusa **na tela dela**, depois que o
navegador já saiu do nosso domínio. Do nosso lado não sobra nada: o Supabase
registra "Redirecting to external provider" e nunca recebe retorno, então nem
dá para mostrar um erro útil. A pessoa vê uma tela de erro da Apple e conclui
que o Mentorque está quebrado.

Botão que some é ruim. Botão que leva a um beco sem saída é pior.

## O que fazer, na ordem

Tudo na conta de desenvolvedor da Apple e no painel do Supabase. Nada disso
mora no repositório, e a chave `.p8` não pode passar por conversa nenhuma:
ela vai direto do computador do dono para o painel do Supabase.

1. **Anote o Team ID.** Dez caracteres, no menu de cima e à direita do Apple
   Developer Console.
2. **Registre as fontes de e-mail** em *Sign in with Apple for Email
   Communication* (seção Services do console). É o que permite à Apple mandar
   os e-mails de repasse de quem escolhe esconder o endereço.
3. **Confira o App ID** (o bundle do app, `br.com.mentorque.app`) com a
   capacidade *Sign in with Apple* ligada. O campo de notificação
   servidor-para-servidor fica VAZIO: o Supabase não recebe esse aviso.
4. **Crie um Services ID** em Identifiers, filtrando por Services IDs. Nome no
   estilo domínio invertido, por exemplo `br.com.mentorque.web`.
5. **Configure as Website URLs desse Services ID.** É aqui que quase todo
   mundo erra, então vale ser literal: o domínio é o do **Supabase**, não o
   nosso.

   ```
   Domains and Subdomains:  ajaxhsvjvmqtiyzelgrd.supabase.co
   Return URLs:             https://ajaxhsvjvmqtiyzelgrd.supabase.co/auth/v1/callback
   ```

   Pôr `mentorque.com.br` aqui é o engano natural e não funciona: quem recebe
   o retorno da Apple é o Supabase, e o domínio tem que ser o de quem recebe.
6. **Crie uma Key de assinatura** (seção Keys) com Sign in with Apple. Baixe o
   `AuthKey_XXXXXXXXXX.p8` e guarde bem: a Apple deixa baixar UMA vez. Se
   vazar, revogue e crie outra na hora.
7. **Gere o client secret** com o gerador que fica na própria página de
   documentação do Supabase (nada sai do navegador). Ele não funciona no
   Safari; use Chrome ou Firefox.
8. **No painel do Supabase**, em Authentication → Providers → Apple: cole o
   secret e ponha o **Services ID PRIMEIRO** no campo *Client IDs*, com o
   bundle do app depois, separados por vírgula e sem espaço:

   ```
   br.com.mentorque.web,br.com.mentorque.app
   ```

   A ordem importa: é o primeiro da lista que vira o `client_id` do fluxo web.
   O bundle continua na lista porque é ele que valida o token do login nativo
   do iPhone.
9. **Na Vercel**, variável de ambiente `NEXT_PUBLIC_APPLE_WEB=1`, e novo
   deploy. Ela é lida na hora do build, então mudar sem redeploy não faz nada.

## Depois de ligar, conferir DUAS coisas

Não uma. A mudança do passo 8 encosta no login que já funciona.

1. **No site**, num navegador comum: o botão preto da Apple aparece na tela de
   entrar e a folha da Apple abre, autoriza e volta logado.
2. **No iPhone, no app da loja**: o login com a Apple continua entrando. Este
   é o que pode quebrar sem ninguém perceber, porque ninguém pensa em testar o
   que não foi mexido, e o campo *Client IDs* é compartilhado pelos dois.

## Fonte

Documentação oficial do Supabase, "Login with Apple", seção de configuração do
fluxo web. O passo 5 é citação direta de lá: o domínio a usar é o domínio em
que o projeto Supabase está hospedado.
