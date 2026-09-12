# Mentorque, guia de trabalho

App de cuidado com o carro: Next.js 14 + Capacitor. Uma pessoa só decide (o
dono, Rodrigo); o trabalho vai direto para a `main`.

**Antes de qualquer coisa**: `git pull origin main`. E leia
`docs/mapa-do-codigo.md`, que diz onde cada coisa mora e as regras de
organização. Este arquivo aqui só carrega o que precisa valer em toda sessão.

## O regime das duas velocidades (custo da conferência)

O custo de uma mudança tem que ser o da mudança, não o da cerimônia. Regra
do dono (12/09/2026): "crie projetos menores e não faça uma bateria 360
sempre". Duas mudanças pequenas levaram 40 minutos por causa da bateria.

- **Padrão, para qualquer mudança**: `npm run conferir` (tsc, lint e as
  conferências de script, uns 2 minutos) + só a suíte de navegador da área
  tocada (ex.: `npm run conferir:navegador telas`, ~1 min) + push. Vale
  também para código compartilhado (store, Shell, roteador, abertura):
  o tsc pega o que quebra de tipo, e a Vercel builda a cada push e reclama
  alto. Sem build local. Foto só se a mudança é visual.
- **Bateria completa (`conferir:navegador`, ~11 min) + build local** só
  antes de release para as lojas, ou quando uma suíte reprova sem fazer
  sentido. Nunca "por via das dúvidas".
- Fatiar o trabalho: cada pedido vira UM commit pequeno com a sua
  conferência, publicado na hora; não juntar três pedidos numa bateria só.
- Playwright fica fora das dependências de propósito: `npm i --no-save
  playwright` (Chromium em `/opt/pw-browsers/chromium` no ambiente remoto).

## Regras que o dono já fixou

- **Texto visível ao usuário**: português natural, SEM travessão (o caractere
  de traço longo). Vale para app, LP, e-mails e docs.
- **Nunca sem o dono**: preço e planos, cobrança, mensagem a cliente, apagar
  dados, gasto novo, publicar nas lojas, chaves e segredos.
- `INICIO_DO_QUIZ` (23/08/2026) não se move nunca mais; os testes fixam a
  data de propósito para gritar se mover.
- Revisão de perguntas do quiz: citar o `id`, não o número; na dúvida,
  perguntar antes de mudar.
- Commits em português, no estilo dos existentes: título curto com o porquê,
  corpo explicando a decisão.

## A disciplina das conferências

Prove que a conferência morde antes de confiar no verde dela: plante o
defeito que ela deveria pegar e veja se ela grita. Os casos em que isso
salvou o dia estão em `docs/mapa-do-codigo.md`.

E o que a conferência não alcança, diga que não alcança. Plugin nativo só
entra no binário depois de ler o caminho dele no fonte (não no README), com o
roteiro de aparelho escrito antes do build; e sobre um build que nenhum
aparelho abriu, a resposta é "sem sinal ainda", nunca "nada quebrou"
(regra do dono, 09/09/2026, em `.claude/skills/release-nas-lojas`).
