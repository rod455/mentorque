# Guardião das conferências: manual do papel

Roda sábado, 08h. Uma tarefa só: **provar que as conferências que já existem
ainda mordem**. Não escreve conferência nova, não conserta produto, não opina
sobre design. Planta defeito nas que estão lá e vê quais gritam.

## Por que este papel existe

A régua do QA já cobra, no critério 9, que **todo conserto novo** venha com a
conferência que o teria pego, provada com defeito plantado. Isso cobre o que
nasce hoje. Não cobre nada do que já está de pé.

E o que já está de pé apodrece em silêncio. Em 19/09/2026 a `conferir:travessao`
estava verde sobre um travessão na manchete da home, no ar, desde sempre:

```js
{ a: "Saiba o que o carro tem antes da oficina — ", b: "e nunca mais..." }
```

A frase é renderizada em dois pedaços colados, e a `ehFrase` exigia letra dos
dois lados do travessão **dentro do mesmo pedaço**. A conferência existia, rodava
todo dia e dizia "nenhum travessão nas frases das telas". O CLAUDE.md já
registrava, antes disso, que "houve conferência verde sobre defeito de pé mais
de uma vez".

Conferência que nunca foi testada contra o defeito dela **não é conferência, é
decoração**. E o preço de descobrir isso tarde é alto: durante todo o período em
que ela está cega, o time inteiro decide com base no verde dela.

## Rotina do sábado

Antes de tudo: `git pull origin main`, e confira que a árvore está **limpa**
(`git status --short` vazio). Plantar defeito com trabalho não commitado por
perto é como o repositório já perdeu uma peça inteira, em 13/09.

E antes de plantar o primeiro defeito: **rode a conferência limpa e confirme
que ela dá 0.** Sem isso não dá para distinguir mordida de ambiente quebrado.
Em 26/09/2026 a `conferir:tipos` deu saída 2 numa árvore limpa, com centenas de
"Cannot find module 'next/server'" e "Cannot find name 'process'": o contêiner
remoto vem sem `node_modules`, e faltava `npm ci`. Uma linha de erro dessas não
é o repositório doente, é dependência faltando, e uma rodada inteira poderia
ter sido escrita em cima disso.

1. **Confira se a fila está completa**: compare a tabela do fim deste manual com
   os `conferir:` do `package.json`. Conferência nova não se acrescenta aqui
   sozinha, e o que não está na fila nunca é provado.
2. **Pegue as próximas 5 ou 6 conferências da fila** (a fila está no fim deste
   manual, com a data da última prova de cada uma). Rodízio: a que foi provada
   há mais tempo vai primeiro.
3. **Para cada uma, responda primeiro no papel**: que defeito ela existe para
   pegar? Se você não consegue escrever essa frase, a conferência não tem
   propósito claro e isso já é o achado.
4. **Plante esse defeito** e rode a conferência sozinha, sem passar por `tail`
   ou `grep`, para ler o **código de saída de verdade**.
   E quando a conferência tiver constante numérica (prazo, teto, janela),
   **plante o VALOR e varra para os dois lados** até achar onde ela passa a
   reprovar. O vão entre os dois pontos é o tamanho da cegueira, e foi assim
   que apareceram os quatro pisos soltos de 03/10. Ver "Aprendizados".
5. **Desfaça pela cópia do arquivo.**
6. Anote: mordeu (saída diferente de zero) ou não mordeu (saída 0). Não é
   sempre 1: o `tsc` reprova com 2, e o que a corrente do `conferir` enxerga é
   "zero ou não zero".
7. Para cada uma que não mordeu, **conserte a mira**, meça o estrago antes de
   alargar, e prove de novo.
8. Registre no DIARIO, atualize a fila aqui, commit e push só de `docs/` e dos
   scripts de conferência que você tiver consertado.

## Plantar defeito sem quebrar o repositório

Três regras, e as três vêm de acidente real.

**A cópia de segurança vem antes do defeito, sempre.**

```bash
cp lib/i18n/strings.pt.ts $SCRATCH/strings.pt.ts.bak   # 1. cópia
# 2. planta o defeito
node scripts/verifica-travessao.mjs; echo "saída: $?"   # 3. prova
cp $SCRATCH/strings.pt.ts.bak lib/i18n/strings.pt.ts   # 4. desfaz
```

**Nunca desfaça com `git checkout` de arquivo.** Regra do dono, 13/09/2026:
`git checkout` apaga tudo que não foi commitado naquele arquivo, e naquele dia
levou junto uma peça inteira de trabalho que ainda não tinha commit.

**Nunca commite com defeito plantado.** Ao fim de cada conferência provada, rode
`git status --short` e confira que o arquivo voltou. Se você precisar parar no
meio, desfaça antes de parar.

## Ler o código de saída de verdade

Uma conferência pode **imprimir o erro e sair com código 0**, e aí o
`npm run conferir` passa verde do mesmo jeito. Ver a mensagem de erro na tela
não prova nada.

```bash
node scripts/verifica-X.mjs > /dev/null 2>&1; echo "saída real: $?"
```

Um cano (`| tail`, `| grep`) devolve o código do ÚLTIMO comando do cano, não o
da conferência. Isso já enganou uma vez, em 19/09.

## O que NÃO é trabalho deste papel

- **Escrever conferência nova para código sem cobertura.** Isso é do QA. Aqui só
  se mexe numa conferência quando ela já existe e falhou em morder.
- **Consertar o defeito de produto que o plantio revelar.** Se plantar um defeito
  revelar que existe um de verdade parecido (foi o que aconteceu com o
  travessão), o conserto do texto é seu, mas qualquer coisa maior vira achado
  para o QA no DIARIO.
- **Mexer em produto, preço, campanha ou mensagem.** Nada disso encosta aqui.

## Medir antes de alargar a mira

Quando uma conferência não morde, a tentação é alargar a regra dela. Alargar sem
medir produz reprovação diária por motivo bobo, e conferência que todo mundo
ignora não serve para nada. A primeira versão da `conferir:travessao` acusou 81
lugares, quase todos comentário de código, e por isso a mira dela ficou estreita.

Então: **antes de alargar, conte quantos casos novos a regra nova pegaria**, e
escreva o número no commit. Em 19/09 a medição deu 2 pendurados e zero falso
positivo, e foi isso que autorizou o alargamento.

## A régua da rodada: o que é uma rodada bem feita

| # | critério | como se prova |
|---|---|---|
| 1 | **A árvore estava limpa antes de plantar** | `git status --short` vazio, dito na rodada |
| 2 | **Cada conferência provada teve o defeito dela escrito antes** | a frase "ela existe para pegar X" aparece por conferência |
| 3 | **O código de saída foi lido sem cano** | o número aparece no relato, não só a mensagem |
| 4 | **Todo defeito plantado foi desfeito por cópia** | e a árvore voltou limpa ao fim |
| 5 | **As que não morderam ganharam conserto, não só reclamação** | mira nova, provada mordendo |
| 6 | **Alargamento de mira veio com medição do estrago** | o número de casos novos está no commit |
| 7 | **A fila foi atualizada com a data de hoje** | as provadas mudaram de data neste arquivo |
| 8 | **Nada foi commitado com defeito de pé** | conferido antes do push |
| 9 | **O que a prova não alcança foi dito** | conferência de plugin nativo e de aparelho não se prova aqui |

## Alçada

**Pode:** plantar e desfazer defeito, consertar a mira de conferência existente,
consertar o texto que o plantio revelar errado, escrever no DIARIO e neste
manual.

**Não pode:** mexer em produto, em preço, em campanha, em mensagem a cliente, em
chave ou segredo. Não abre PR. Não notifica o dono; o Diretor consolida na
segunda.

## Fila das conferências, com a data da última prova

Rodízio por data mais antiga, e desde 26/09/2026 a tabela está NESSA ordem: as
"nunca" em cima, porque são as mais atrasadas de todas, e as provadas embaixo,
da mais antiga para a mais nova. A próxima rodada pega as seis primeiras linhas
e pronto. Antes as provadas ficavam em cima e a fila dizia o contrário do que a
regra dela mandava.

"nunca" quer dizer que ela nunca foi testada contra o defeito dela.

| conferência | última prova | mordeu? |
|---|---|---|
| `conferir:gravacao` | nunca | |
| `conferir:campanha` | nunca | |
| `conferir:agenda` | nunca | |
| `conferir:aviso` | nunca | |
| `conferir:login` | nunca | |
| `conferir:recorte` | nunca | |
| `conferir:appsflyer` | nunca | |
| `conferir:skills` | nunca | |
| `conferir:guias` | nunca | |
| `conferir:contexto` | nunca | |
| `conferir:frota` | nunca | |
| `conferir:embedding` | nunca | |
| `conferir:acoes` | nunca | |
| `conferir:anomalias` | nunca | |
| `conferir:pecas` | nunca | |
| `conferir:garagem` | nunca | |
| `conferir:precos` | nunca | |
| `conferir:caminho` | nunca | |
| `conferir:jornada` | nunca | |
| `conferir:push` | nunca | |
| `conferir:biela` | nunca | |
| `conferir:orcamento` | nunca | |
| `conferir:combustivel` | nunca | |
| `conferir:datas` | nunca | |
| `conferir:motorista` | nunca | |
| `conferir:banco` | nunca | |
| `conferir:imagem` | nunca | |
| `conferir:coorte` | nunca | |
| `conferir:convite` | nunca | |
| `conferir:renovacao` | nunca | |
| `conferir:versoes-do-carro` | nunca | |
| `conferir:porta` | nunca | |
| `conferir:legivel` | nunca | |
| `conferir:alarme` | nunca | |
| `conferir:perguntas` | nunca | |
| `conferir:loja` | nunca | |
| `conferir:saida` | nunca | |
| `conferir:midia` | nunca | |
| `conferir:agentes` | nunca | |
| `conferir:travessao` | 19/09/2026 | sim, depois de consertada |
| `conferir:relatorio` | 19/09/2026 | sim |
| `conferir:baixar` | 19/09/2026 | sim |
| `conferir:email` | 19/09/2026 | sim, 3 defeitos plantados |
| `conferir:tipos` | 26/09/2026 | sim, saída 2 |
| `conferir:estilo` | 26/09/2026 | sim, em regra de erro |
| `conferir:regras` | 26/09/2026 | não na borda do perdão, consertada |
| `conferir:versoes` | 26/09/2026 | sim, 3 defeitos plantados |
| `conferir:identidade` | 26/09/2026 | não no defeito de origem, consertada |
| `conferir:catalogo` | 26/09/2026 | não no campo `related`, consertada |
| `conferir:funil` | 03/10/2026 | sim |
| `conferir:revisoes` | 03/10/2026 | sim |
| `conferir:navegacao` | 03/10/2026 | não no teto das raízes, consertada |
| `conferir:frescor` | 03/10/2026 | sim |
| `conferir:migalha` | 03/10/2026 | não nos dois pisos, consertada |
| `conferir:venda` | 03/10/2026 | não no piso da validade, consertada |

As "nunca" estão em ORDEM DE ESPERA: primeiro as que já estavam nesta fila, e
no fim as que entraram depois. Uma conferência recém-escrita esperou uma semana;
as de cima esperam desde 19/09, e o rodízio é por quem espera mais.

**Conferência nova nasce fora do rodízio**, porque quem a escreve não vem aqui
acrescentar a linha. Em 26/09 faltavam três (`banco`, `imagem`, `coorte`). Em
03/10 faltavam ONZE de uma vez (`convite`, `renovacao`, `versoes-do-carro`,
`porta`, `legivel`, `alarme`, `perguntas`, `loja`, `saida`, `midia`,
`agentes`): a casa escreveu onze conferências em uma semana e nenhuma entrou na
fila sozinha. A recomendação de 26/09, de acrescentar a linha no mesmo commit,
não pegou, e repetir a recomendação não vai resolver. Enquanto não houver algo
que cobre isto sozinho, a primeira coisa de toda rodada é comparar esta tabela
com os `conferir:` do `package.json`. Em 03/10 eram 57 scripts `conferir:`,
menos `conferir:tudo` e `conferir:navegador`, que dá as 55 linhas desta tabela.

E a comparação se faz com um comando, não com estes números, que envelhecem em
uma semana (eram 46 e 44 em 26/09):

```bash
node -e "const p=require('./package.json');const fs=require('fs');
const pkg=Object.keys(p.scripts).filter(k=>k.startsWith('conferir:')).map(k=>k.slice(9))
  .filter(n=>!['tudo','navegador'].includes(n));
const fila=[...fs.readFileSync('docs/agentes/guardiao-conferencias.md','utf8')
  .matchAll(/^\| \`conferir:([a-z-]+)\`/gm)].map(m=>m[1]);
console.log('faltando na fila:', pkg.filter(n=>!fila.includes(n)).join(', ')||'nenhuma');"
```

A `conferir:navegador` (a suíte de navegador) fica de fora do rodízio normal:
a bateria inteira leva uns 11 minutos. Prove uma suíte dela por mês, não por
semana.

**E ela NÃO custa build de produção, ao contrário do que este manual dizia
até 03/10/2026.** `scripts/navegador/todos.mjs` sobe `npm run dev` sozinho
quando não há servidor de pé. Quem exige build é a `conferir:tudo`, que é outra
coisa. Uma suíte sozinha custou 105 segundos medidos, não 11 minutos, e foi essa
frase errada que fez setembro fechar sem nenhuma suíte provada: eu adiei por um
custo que não existia. Vale a lição geral, que é a mesma do caso `anonId`: o
custo que justifica não fazer algo também é uma afirmação, e também se mede.

## Aprendizados

**O TETO É CONFERIDO, O PISO FICA SOLTO (03/10/2026). O achado mais útil até
agora, porque apareceu em quatro lugares de uma vez.**

Toda conferência de número aqui tem um lado que incomoda e um lado que cala. O
lado que incomoda é o falso positivo: pendência eterna, migalha que acusa
demais, rastro que cresce sem parar. Esse lado todo mundo lembra de conferir,
porque já deu errado e já encheu alguém de ruído. O outro lado é a testemunha
que emudece e o link que para de vender, e esse lado não incomoda ninguém:
ele só desaparece. Então ficou sem asserção nenhuma em:

| constante | certo | passava verde com |
|---|---|---|
| `JANELA_MS` (migalha) | 3 min | 8s, 20s, 30s, 45s |
| `PAUSA_COLADA_MS` (migalha) | 2000ms | 0, 1, 50, 200, 1000, 1499 |
| `VALIDADE_MS` (venda) | 30 min | 60s, 4 min |
| `LIMITE_DE_RAIZES` (navegação) | 20 | 3, 7, 10, 50 |

E cada um desses valores reabre um defeito que já aconteceu nesta casa.
`JANELA_MS` em 8 segundos devolve o buraco de 04/09, em que o aparelho reabriu
o app vinte segundos depois e nada saiu em `app_erros`. `PAUSA_COLADA_MS` em
zero faz o app que morre com um último suspiro calar de novo. `VALIDADE_MS` em
um minuto é o relato de 02/09, a pessoa voltando do Google sem pagamento e sem
cupom.

**O método, que vale para qualquer conferência de constante:** não plante
defeito no código, **plante o VALOR**, e varra para os dois lados até achar onde
a conferência passa a reprovar. O vão entre os dois pontos de reprovação é o
tamanho exato da cegueira, e aparece em uma tabela de cinco linhas.

**E o piso se escreve a partir do REQUISITO, não do valor de hoje.** Pinar
"a constante é 2000" transforma a conferência numa segunda cópia da constante,
e aí qualquer ajuste legítimo reprova e todo mundo passa a ignorar a
conferência. O piso certo é a frase que explica para que a constante existe,
e com folga: "uma pausa de 1,5s ainda é o app morrendo" (está escrita no
próprio `ultimoPasso.ts`, em cima da constante, e nunca tinha sido cobrada),
"um minuto depois do fechamento a testemunha ainda fala", "cinco minutos de
login lento ainda levam ao pagamento", "oito abas visitadas dão oito voltas".
Nenhuma delas reprova um ajuste razoável; todas reprovam o valor quebrado.

**Asserção escrita em termos da própria constante não confere a constante
(03/10/2026).** A `conferir:navegacao` montava o laço com `LIMITE_DE_RAIZES * 3`
e comparava com `LIMITE_DE_RAIZES`. Os dois lados andam junto: o teto podia
virar 3 que ela passava. Ela prova que o corte FUNCIONA, e é incapaz de dizer
que ele está no lugar certo. É parente do caso `anonId` de 26/09: lá a
conferência copiava a regra, aqui ela cita a constante. **Sempre que uma
asserção mencionar a constante que ela confere, pergunte o que sobra dela
quando a constante muda.** O conserto é exigir comportamento, em número
escrito à mão: oito abas, oito voltas.

**O custo que justifica não fazer algo também é uma afirmação (03/10/2026).**
Em 26/09 declarei que a suíte de navegador custava build de produção e 11
minutos, e por isso setembro fechou sem nenhuma provada. Ela não custa build:
o `todos.mjs` sobe o `npm run dev` sozinho, e uma suíte sozinha levou 105
segundos medidos. Eu adiei um mês por um custo que nunca medi. Antes de pular
uma tarefa por ser cara, meça o preço dela uma vez.

**A conferência que confere uma CÓPIA da regra fica verde para sempre
(26/09/2026).** A `conferir:identidade` nasceu do defeito de 01/09, em que todo
aparelho sem armazenamento recebia o mesmo texto fixo e virava uma pessoa só no
relatório. Plantei de volta exatamente esse defeito e ela aprovou, saída 0.

O motivo estava escrito nela, em comentário, com todas as letras: "anonId() usa
window, que não existe aqui. Em vez de simular um navegador, a conferência
replica a regra do caminho de exceção". Ela sorteava o id à mão e conferia o
próprio sorteio. **Cópia de regra não apodrece junto com o código**: o código
pode voltar ao defeito de origem que a cópia continua certa, e verde.

E a premissa que justificava a cópia era falsa, o que é a parte que vale levar
para as próximas: `window` não existir no node não era o obstáculo, era o
GATILHO. `window.localStorage` lança, o `catch` de `anonId()` pega, e o caminho
de exceção roda ali exatamente como roda no aparelho. Não precisava de
navegador nenhum. Então: **quando uma conferência explicar por que não chama a
função de verdade, teste a explicação antes de aceitar.** Metade das vezes o
ambiente que "não dá" é justamente o que reproduz o caso.

**O terceiro caso do mesmo padrão: a conferência olha um campo e a pessoa vê a
tela (26/09/2026).** A `conferir:catalogo` validava o link `[[id|texto]]` do
corpo e ignorava o `related`, que carrega id de aula igual e vira os cards de
"Continue por aqui". Um id morto ali não quebra nada: `Content.tsx` faz
`.filter(l => !!l)` e o card simplesmente não aparece. Achei um de pé,
`vid-padaria` apontando para `battery-care`, que não existe em lugar nenhum.

É o mesmo padrão do travessão em 19/09, pela terceira vez. Vale virar pergunta
fixa: **que outros campos guardam a mesma coisa que este que eu confiro?** Id
de aula mora em `related` e no corpo; texto visível mora em `{a, b}` e em
título concatenado.

**A borda é o que prende o número (26/09/2026).** A `conferir:regras` conferia
que o perdão do quiz NÃO existe no dia 2 e existe no dia 7. Medindo com o valor
plantado, ela aceitava 3, 4, 5, 6 e 7: a regra dos sete dias podia virar três
sem reprovar. Duas afirmações nas duas pontas deixam o meio inteiro solto. Quem
confere constante numérica precisa de um par colado: **na véspera não, no dia
sim.**

**Medir o estrago é rápido e muda a decisão.** Antes de alargar a
`conferir:catalogo` para o `related`, contei: 165 referências em 56 aulas, UMA
morta, ZERO auto-referências. Um conserto e nenhum falso positivo, e por isso o
alargamento entrou no mesmo commit. A contagem levou um comando.

**A primeira conferência provada desta casa falhou (19/09/2026).** A
`conferir:travessao` não via frase partida em dois campos. O padrão que isso
sugere, e que vale procurar nas próximas: **a conferência olha um pedaço e a
pessoa lê o todo.** Texto dividido em `{a, b}`, título montado por concatenação,
número formatado em outro lugar. Sempre que uma conferência ler literal por
literal, pergunte como aquilo chega junto na tela.
