# Novidades da versão 3.6

Aberta em 16/11/2026, junto com o plano de receita do dono. É a próxima versão
das DUAS lojas: o iPhone já tem um binário 3.5 na Apple (build 76, em revisão
com o nome de loja "3.4"), então o próximo envio do iPhone precisa de número
de binário maior. A 3.5 nunca foi gerada para o Android, e o Android pula
direto para a 3.6. Tudo o que entra aqui **já roda na web** pelo deploy da
Vercel; o binário só importa para o app das lojas.

**Onde a 3.6 está:** aberta, nada gerado.

**Árvore do build:** (escrever o commit NA HORA de apertar o botão do
Codemagic, antes de qualquer frase sobre o que o binário tem.)

## O que vai NO BINÁRIO

### Vai no binário, e a pessoa sente

1. **O passe vira "Resolver este problema" e vem primeiro na parede da Biela**
   (16/11, plano de receita). Preço e o que libera não mudaram (R$ 9,90, 7
   dias de Biela e orçamento sem limite). Os pacotes de 2 e 10 perguntas vêm
   abaixo, como a opção menor.
2. **A tela do sintoma diz o preço de resolver sem assinar** (16/11), embaixo
   do botão "Aprofundar diagnóstico com o Biela": "1 pergunta grátis por mês.
   Se precisar de mais, resolva este problema por R$ 9,90, sem assinatura."
   Só onde a compra avulsa existe (não no iPhone) e só para quem não é
   Premium.
3. **O Premium com 7 dias grátis aparece no primeiro dia do carro** (16/11,
   plano de receita). Na tela do carro, nos 3 primeiros dias depois de
   cadastrar, um card oferece o teste. "Agora não" o esconde para sempre. A
   regra mora em `lib/app/ofertaPrimeiroDia.ts`. No iPhone não aparece, porque
   a Apple ainda não tem oferta de teste. Para medir, o paywall registra a
   origem `primeiro-dia` no `viu_paywall`.
4. **"Cotar meu seguro" nas datas do carro, como teste de demanda** (16/11,
   plano de receita). O botão fica na linha do seguro. A folha diz a
   verdade: a cotação ainda não existe e a parceria está sendo fechada; quem
   quiser, pede para ser avisado. Os eventos `viu_seguro`, `tocou_seguro` e
   `quer_seguro` entraram no banco em 16/11 (migrações
   `funil_eventos_seguro` e `funil_eventos_seguro_visto`). Na web vale desde
   o deploy.

## Ficou FORA do binário, de propósito

- A compra avulsa no iPhone, como na 3.4.

## A nota das lojas

(escrever quando a lista fechar)

## Plugin nativo nesta versão

Nenhum até aqui.

## Roteiro de aparelho, escrito ANTES do build

**Itens 1 e 2, Android sem Premium.** Abrir um sintoma com perguntas (ex.:
"Barulho ao frear"): embaixo do botão da Biela aparece a frase com R$ 9,90.
Gastar a pergunta grátis do mês: a parede mostra primeiro "Resolver este
problema" (R$ 9,90), depois "Ou só algumas perguntas" com os dois pacotes, e
o Premium abaixo. No iPhone, nenhuma das duas coisas aparece.

**Item 3, Android sem Premium.** Cadastrar um carro novo: a tela do carro
mostra "Experimente o Premium por 7 dias, de graça" com o nome do carro.
"Começar 7 dias grátis" abre o Premium, e a Play mostra a oferta de teste.
Voltar, tocar em "Agora não", fechar e abrir o app: o card não volta. No
iPhone, cadastrar um carro não mostra o card.

**Item 4, qualquer aparelho.** Abrir o calendário de revisões: na linha do
seguro aparece "Cotar meu seguro". Tocar abre a folha que diz "Ainda não está
pronto". "Sim, me avise" mostra "Combinado". No banco, depois: `viu_seguro`,
`tocou_seguro` e `quer_seguro` do mesmo aparelho, com a versão 3.6.0.
