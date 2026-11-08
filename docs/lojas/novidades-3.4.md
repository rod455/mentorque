# Novidades da versão 3.4

Aberta em 27/10/2026, quando a 3.3 (build 74) chegou às duas lojas. Tudo o que
entra aqui **já roda na web** pelo deploy da Vercel; o binário só importa para
o app das lojas.

**Onde a 3.4 está:** ainda não gerada.

**Árvore do build:** (escrever o commit NA HORA de apertar o botão do
Codemagic, antes de qualquer frase sobre o que o binário tem; a
`conferir:versoes` cobra que cada item citado abaixo seja ancestral dela.)

## O que vai NO BINÁRIO

1. **O sintoma "Perda de força" ganha o card da aula** (29/10, commit
   99889cc, rodada do Conteúdo). A aula `diag-perda-de-forca` já chega à 3.3
   pelo catálogo remoto; a ligação na tela do sintoma (`AULAS_DO_SINTOMA`) vai
   no binário. Se a tabela passar a viajar no catálogo remoto antes do build,
   este item sai daqui.

2. **O segundo pedido de conta, para o convidado que já tem algo a perder**
   (30/10, commit 7c52226, rodada do CRO, com o conserto de alcance da revisão
   do mesmo dia no commit seguinte). A folha "Salve sua garagem" é código do
   binário (`components/app/SalveSuaGaragem.tsx` e
   `lib/app/segundoPedidoDeConta.ts`); na web já roda. Sem a 3.4, quem usa o
   app das lojas nunca recebe o repique, e a aposta
   `a-conta-e-pedida-de-novo-a-quem-ja-tem-algo-a-perder` só lê depois que a
   3.4 passar de metade dos aparelhos ativos.

3. **O Biela grátis com 1 pergunta por mês, nos textos do app** (05/11,
   decisão do dono). O limite em si é do servidor e vale para todas as
   versões desde o deploy; o que vai no binário são os dois textos com o
   número: a tabela de planos ("Perguntas ao Biela, 1/mês", que na 3.3 ainda
   diz "3/mês") e o singular "1 pergunta grátis restante neste mês" (na 3.3
   sai "1 perguntas grátis restantes").

4. **O sintoma "Motor falhando" ganha o card da aula** (04/11, commit f1cea63,
   rodada do Conteúdo). Mesmo caso do item 1: a aula `diag-motor-falhando`
   chega pelo catálogo remoto, e a ligação na tela do sintoma
   (`AULAS_DO_SINTOMA`, `engine-misfire`) vai no binário. Faltava nesta lista
   até a revisão de 08/11.

## Ficou FORA do binário, de propósito

- **A compra avulsa (passe do problema e pacote de perguntas),** aprovada pelo
  dono em 05/11, ainda não foi construída: faltam os produtos nas lojas e no
  RevenueCat (cliques do dono) e o código de compra única. Vai numa versão
  própria, com roteiro de aparelho de compra.
- Tudo o que foi feito no servidor nesta semana já está no ar para todas as
  versões, sem build: o limite de 1 pergunta grátis, o manual do carro no
  Biela, a contagem de quem bate no limite, e a frase "conforme o manual"
  proibida quando não há trecho.

## A nota das lojas

Pela regra da casa: o ganho, não o defeito; o verbo na ação da pessoa; nada
que não tenha sido conferido. Fora dela de propósito: a mudança de 3 para 1
pergunta grátis (não é ganho para a pessoa, e o texto da tabela de planos já
diz o número certo).

```
Agora o app volta a lembrar de salvar sua garagem quando você já tem serviço, abastecimento ou aula guardados, para nada se perder se trocar de celular.

Nos sintomas "Perda de força" e "Motor falhando", a aula que explica o problema está a um toque.
```

## Plugin nativo nesta versão

Nenhum. De `android/`, `ios/` e `capacitor.config.ts`, desde a árvore da 3.3
(e39b866), mudaram só os números de versão (3.4 e o piso 75). Nada de
caminho nativo novo para ler no fonte.

## Roteiro de aparelho, escrito ANTES do build

**Itens 1 e 4, os cards de aula.** No app atualizado, abrir o Biela, escolher
os sintomas "Perda de força" e "Motor falhando": cada um mostra o card da aula
na tela do sintoma, e tocar abre o leitor na aula certa
(`diag-perda-de-forca` e `diag-motor-falhando`).

**Item 3, os textos do Biela.** Num aparelho sem Premium e sem pergunta feita
no mês: o Biela mostra "1 pergunta grátis restante neste mês", no singular, e
a tabela de planos diz "1/mês".

**Item 2, o segundo pedido.** Num aparelho que já tinha o app como convidado,
com carro e pelo menos um serviço registrado, e que nunca criou conta:

1. Atualizar para a 3.4 e abrir. A folha "Salve sua garagem" aparece sozinha
   na abertura, sem cadastrar carro. Se não aparecer, anotar se o aparelho
   tem serviço, abastecimento ou aula concluída; sem nenhum dos três, não
   aparecer é o certo.
2. Tocar em "Agora não". Fechar o app de verdade e abrir de novo: a folha NÃO
   volta, nem nesta abertura nem nas seguintes.
3. Num aparelho com conta: abrir o app e conferir que a folha não pisca na
   abertura, nem por um instante.
4. No banco, depois: `convite_conta` com `extra.detalhe = 'repique'` e o
   `recusou_convite_conta` com `botao-2` do mesmo aparelho.
