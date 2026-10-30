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

## Roteiro de aparelho, escrito ANTES do build

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
