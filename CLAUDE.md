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

## Antes de publicar um número (03/10/2026)

O dono perguntou, depois de uma noite de correções: "se temos acesso, por que
estamos trazendo informações incorretas ainda?". Acesso nunca foi o problema.
Em uma noite saíram sete afirmações erradas, e **seis têm a mesma causa**:
conclusão tirada do primeiro número encontrado, sem perguntar o que ele mede e
sem procurar um segundo instrumento que meça a mesma coisa.

- "o Google Ads não está ligado" (a integração estava ativa; eu inferi a causa
  a partir da AUSÊNCIA da linha);
- "o orgânico é no máximo 11%" (o Play dizia 11%, a AppsFlyer dizia 31%);
- "1.400 conversões por mês" (li um gráfico do Play como instalação diária, e
  não era; o real era um terço);
- "72% de quem instala nunca abre" (dois números do Play que eu nunca conferi
  se eram comparáveis; a AppsFlyer contradiz);
- "a atribuição é gasto novo" (já estava instalada, com número no nosso diário);
- "o critério 6 é inalcançável por falta de etiqueta" (é inaplicável: 96% do
  dinheiro é vídeo, e vídeo não tem termo de busca).

**A regra que fica, e ela vale na conversa e não só na rodada semanal:** antes
de publicar um número, diga de qual instrumento ele veio, e **se existe um
segundo instrumento que mede a mesma coisa, cite os dois ou declare que não
conferiu**. Faixa honesta vale mais que número preciso e errado.

E o irmão disso: **ausência não é causa.** "A linha não apareceu" responde o
QUE, nunca o PORQUÊ. Se a conclusão começa com "então deve ser porque", ela é
hipótese e precisa de um teste que a separe das outras.

**E acesso não é a mesma coisa que perguntar.** O coletor do Google Ads tem a
credencial desde agosto e nunca pediu a quebra por rede, porque a consulta é uma
lista de perguntas que alguém escreveu uma vez. Quando um número surpreender,
pergunte primeiro se a fonte já responde algo que a gente nunca pediu.

## A disciplina das conferências

Prove que a conferência morde antes de confiar no verde dela: plante o
defeito que ela deveria pegar e veja se ela grita. Os casos em que isso
salvou o dia estão em `docs/mapa-do-codigo.md`. Defeito plantado se desfaz
com cópia de segurança do arquivo, nunca com `git checkout` de arquivo
ainda não commitado (13/09: apagou uma peça inteira antes do commit).

E o que a conferência não alcança, diga que não alcança. Plugin nativo só
entra no binário depois de ler o caminho dele no fonte (não no README), com o
roteiro de aparelho escrito antes do build; e sobre um build que nenhum
aparelho abriu, a resposta é "sem sinal ainda", nunca "nada quebrou"
(regra do dono, 09/09/2026, em `.claude/skills/release-nas-lojas`).

## Antes de mandar o dono clicar (04/10/2026)

Num dia só, quatro vezes, a lista mandou o dono fazer coisa que já estava
feita: a credencial da AppsFlyer, a localização principal na Apple, as
permissões e o webhook do Instagram. A reação dele: "você continua me mandando
fazer coisas que já foram feitas, inútil sua atuação". Ele tinha razão, e a
causa foi a mesma nas quatro: a linha nasceu de um diagnóstico de tela de
semanas atrás e ninguém releu o instrumento antes de repetir o pedido.

**A regra que fica:** antes de pedir qualquer clique ao dono, conferir no
instrumento que a casa já alcança (execuções do n8n, API, definição do fluxo,
banco) se a coisa já está feita. Linha de lista que nasceu de diagnóstico tem
que dizer de que dia é, e o pedido só se repete depois de reler. Se o
instrumento responde, não se pergunta ao dono.

