# Mentorque, guia de trabalho

App de cuidado com o carro: Next.js 14 + Capacitor. Uma pessoa só decide (o
dono, Rodrigo); o trabalho vai direto para a `main`.

**Antes de qualquer coisa**: `git pull origin main`. E leia
`docs/mapa-do-codigo.md`, que diz onde cada coisa mora e as regras de
organização. Este arquivo aqui só carrega o que precisa valer em toda sessão.

## O regime das duas velocidades (custo da conferência)

O custo de uma mudança pequena tem que ser o da mudança, não o da cerimônia.

- **Mudança localizada** (uma tela, um componente, texto): `npm run conferir`
  + só a suíte de navegador da área tocada (ex.: `npm run conferir:navegador
  carro`, ~30s) + push. Sem build local: a Vercel builda a cada push. Foto de
  conferência só se a mudança é visual.
- **Bateria completa (`conferir:navegador`, ~7min) + build local** apenas
  quando a mudança toca código compartilhado (store, Shell, roteador, base
  das suítes), antes de release para as lojas, ou quando uma suíte reprova
  sem fazer sentido.
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
