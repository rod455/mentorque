# Os e-mails de autenticação, na marca do Mentorque

Estes arquivos são os modelos que o **Supabase** manda quando alguém cria conta
ou pede senha nova. Eles NÃO são enviados pelo nosso código: quem envia é o
GoTrue, com o modelo que estiver colado no painel.

## Por que isto existe (20/09/2026)

O dono criou uma conta de teste e recebeu isto:

> **Confirm your email address**
> Follow the link below to confirm this email address and finish signing up.

Em inglês, sem marca, sem contexto. É o modelo de fábrica do Supabase, e ele
chega para uma pessoa que acabou de ver um app inteiro em português, com a Biela
na tela. O e-mail é o primeiro contato fora do app, e ele estava dizendo "isto
aqui é um serviço genérico".

O envio em si já estava certo: sai de `contato@mentorque.com.br`, ou seja, o
remetente próprio já está configurado. O que faltava era o conteúdo.

## Onde colar

Painel do Supabase → **Authentication** → **Emails** → **Templates**. Cada
arquivo aqui corresponde a um modelo de lá:

| arquivo | modelo no painel | quando dispara |
|---|---|---|
| `confirmacao.html` | Confirm signup | conta nova criada com e-mail e senha |
| `recuperacao.html` | Reset password | tocou em "Esqueci minha senha" |

O assunto de cada um está na primeira linha do arquivo, como comentário HTML.

## As variáveis, e a única que importa

O Supabase troca `{{ .ConfirmationURL }}` pelo link real. É a única variável
usada aqui, de propósito: quanto menos variável, menos coisa para quebrar num
modelo que ninguém olha durante meses. Existem outras (`{{ .Email }}`,
`{{ .Token }}`), e elas não entram sem motivo.

## O que este repositório NÃO garante

**Estes arquivos são a nossa cópia, não a verdade.** A verdade está no painel, e
não existe conferência automática ligando os dois: nenhum script nosso consegue
ler o modelo que está lá dentro. Se alguém editar no painel e não trazer para
cá, os dois divergem em silêncio.

Então, ao mexer: **edite aqui, cole lá, e diga no commit que colou.** E quando
desconfiar, o jeito de conferir é criar uma conta de teste com um apelido de
e-mail (`seu.nome+teste@gmail.com`) e olhar o que chega.

## O que ainda está de fábrica

Os outros modelos do painel (convite, troca de e-mail, link mágico) continuam
em inglês e sem marca. Eles não foram traduzidos porque nenhum caminho do app
dispara esses hoje. No dia em que disparar, o modelo entra aqui antes.
