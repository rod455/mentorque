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

1. **Pegue as próximas 5 ou 6 conferências da fila** (a fila está no fim deste
   manual, com a data da última prova de cada uma). Rodízio: a que foi provada
   há mais tempo vai primeiro.
2. **Para cada uma, responda primeiro no papel**: que defeito ela existe para
   pegar? Se você não consegue escrever essa frase, a conferência não tem
   propósito claro e isso já é o achado.
3. **Plante esse defeito** e rode a conferência sozinha, sem passar por `tail`
   ou `grep`, para ler o **código de saída de verdade**.
4. **Desfaça pela cópia do arquivo.**
5. Anote: mordeu (saída 1) ou não mordeu (saída 0).
6. Para cada uma que não mordeu, **conserte a mira**, meça o estrago antes de
   alargar, e prove de novo.
7. Registre no DIARIO, atualize a fila aqui, commit e push só de `docs/` e dos
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

Rodízio por data mais antiga. "nunca" quer dizer que ela nunca foi testada
contra o defeito dela, que é o estado de quase todas em 19/09/2026.

| conferência | última prova | mordeu? |
|---|---|---|
| `conferir:travessao` | 19/09/2026 | sim, depois de consertada |
| `conferir:relatorio` | 19/09/2026 | sim |
| `conferir:email` | 19/09/2026 | sim, 3 defeitos plantados |
| `conferir:baixar` | 19/09/2026 | sim |
| `conferir:tipos` | nunca | |
| `conferir:estilo` | nunca | |
| `conferir:regras` | nunca | |
| `conferir:versoes` | nunca | |
| `conferir:identidade` | nunca | |
| `conferir:catalogo` | nunca | |
| `conferir:funil` | nunca | |
| `conferir:revisoes` | nunca | |
| `conferir:navegacao` | nunca | |
| `conferir:frescor` | nunca | |
| `conferir:migalha` | nunca | |
| `conferir:venda` | nunca | |
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

A `conferir:navegador` (a suíte de navegador) fica de fora do rodízio normal: ela
custa build de produção e uns 11 minutos. Prove uma suíte dela por mês, não por
semana.

## Aprendizados

**A primeira conferência provada desta casa falhou (19/09/2026).** A
`conferir:travessao` não via frase partida em dois campos. O padrão que isso
sugere, e que vale procurar nas próximas: **a conferência olha um pedaço e a
pessoa lê o todo.** Texto dividido em `{a, b}`, título montado por concatenação,
número formatado em outro lugar. Sempre que uma conferência ler literal por
literal, pergunte como aquilo chega junto na tela.
