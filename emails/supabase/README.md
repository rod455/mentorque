# E-mails de autenticação (Supabase)

Estes arquivos NÃO são usados pelo código. Eles são colados à mão no painel do
Supabase, em **Authentication → Emails → Templates**. Ficam versionados aqui
porque o painel não tem histórico: sem uma cópia no repositório, a única forma
de saber o que está no ar é abrir o painel, e um texto perdido não volta.

Sempre que editar um template lá, atualize o arquivo aqui.

**E a pergunta que ninguém consegue responder daqui: o painel está com ISTO?**
Não existe conferência possível, porque nenhum script nosso lê o conteúdo do
painel. Quando colar, **diga no commit que colou, com a data**. É o único
registro que existe.

### Um caso aberto (20/09/2026): o painel diz uma coisa e a caixa de entrada diz outra

O dono criou uma conta de teste e recebeu o modelo DE FÁBRICA do Supabase, em
inglês ("Confirm your email address / Follow the link below…"), remetente
`contato@mentorque.com.br`. Ao olhar o painel em seguida, **os dois modelos, o
de cadastro e o de senha, estavam ajustados com o texto daqui**.

A primeira explicação escrita aqui foi "nunca colaram", e o dono a desmentiu na
mesma hora. Fica registrada como ERRADA de propósito, para ninguém repetir o
raciocínio: o modelo estar certo no painel **não** prova que é ele que sai.

As hipóteses que sobram, em ordem do que custa menos conferir:

1. **um Send Email Hook ligado** (Authentication → Hooks). Se existir um, ele
   GERA o e-mail e os modelos do painel são ignorados inteiros. Isso explicaria
   tudo, inclusive o remetente próprio;
2. **o modelo foi salvo depois** do envio do teste, e a conta de teste pegou o
   estado anterior;
3. **projeto errado**: o painel aberto não é o `ajaxhsvjvmqtiyzelgrd`.

**O que resolve:** criar outra conta de teste AGORA e olhar o que chega. Se vier
em inglês de novo, é a hipótese 1 ou 3, e aí a resposta está em
Authentication → Hooks, não nos Templates.

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
