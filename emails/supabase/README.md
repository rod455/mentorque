# E-mails de autenticação (Supabase)

Estes arquivos NÃO são usados pelo código. Eles são colados à mão no painel do
Supabase, em **Authentication → Emails → Templates**. Ficam versionados aqui
porque o painel não tem histórico: sem uma cópia no repositório, a única forma
de saber o que está no ar é abrir o painel, e um texto perdido não volta.

Sempre que editar um template lá, atualize o arquivo aqui.

| Arquivo | Template no painel | Assunto sugerido |
|---|---|---|
| `confirmar-cadastro.html` | Confirm signup | Confirme seu e-mail no Mentorque |
| `redefinir-senha.html` | Reset password | Redefinir sua senha do Mentorque |

## Cuidados

**As variáveis `{{ .ConfirmationURL }}` são preenchidas pelo Supabase.** Não
renomeie nem traduza — sem elas o link não existe e o cadastro não conclui.

**Os endereços das imagens são absolutos** (`https://www.mentorque.com.br/email/…`).
E-mail é aberto fora do site, então caminho relativo não resolve. As imagens são
geradas por `scripts/email-assets.mjs` e vivem em `public/email/`.

**Só o corpo, sem `<html>` nem `<body>`.** O Supabase injeta o documento em volta.

**Quem entra por Google ou Apple não recebe nada disso** — a conta já vem
verificada pelo provedor. Estes e-mails valem para cadastro com e-mail e senha.

## Idioma

O Supabase tem um template por tipo, sem variação por idioma — não dá para
escolher entre português e inglês pelo perfil de quem recebe. Os textos são em
português, com uma linha em inglês no fim de cada um, para quem receber sem
falar português (um revisor da Apple, por exemplo) entender do que se trata.
