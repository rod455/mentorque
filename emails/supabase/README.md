# E-mails de autenticação (Supabase)

Estes arquivos NÃO são usados pelo código. Eles são colados à mão no painel do
Supabase, em **Authentication → Emails → Templates**. Ficam versionados aqui
porque o painel não tem histórico: sem uma cópia no repositório, a única forma
de saber o que está no ar é abrir o painel, e um texto perdido não volta.

Sempre que editar um template lá, atualize o arquivo aqui.

**E a pergunta que ninguém consegue responder daqui: o painel está com ISTO?**
Não existe conferência possível, porque nenhum script nosso lê o conteúdo do
painel. Em 20/09/2026 o dono criou uma conta de teste e recebeu o modelo DE
FÁBRICA do Supabase, em inglês, com estes arquivos versionados aqui desde
06/09. Ou seja: o trabalho estava feito e nunca tinha sido colado, e ninguém
tinha como saber. Quando colar, **diga no commit que colou, com a data**. É o
único registro que existe.

**O texto de `redefinir-senha.html` só passou a ser verdade em 20/09/2026.** Ele
diz "toque no botão abaixo para escolher uma nova", e até aquele dia não havia
tela nenhuma para escolher senha: o link criava sessão e a senha antiga
continuava valendo. O conserto está em `components/app/NovaSenha.tsx`. Se algum
dia aquela tela sair, este e-mail volta a mentir.

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
