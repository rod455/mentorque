# Novidades da versão 3.6

Aberta em 16/11/2026, junto com o plano de receita do dono. É a próxima versão
das DUAS lojas: o iPhone já tem um binário 3.5 na Apple (build 76, à venda desde
16/11 com o nome de loja "3.4"), então o próximo envio do iPhone precisa de número
de binário maior. A 3.5 nunca foi gerada para o Android, e o Android pula
direto para a 3.6. Tudo o que entra aqui **já roda na web** pelo deploy da
Vercel; o binário só importa para o app das lojas.

**Onde a 3.6 está:** aberta, nada gerado.

**Árvore do build:** (escrever o commit NA HORA de apertar o botão do
Codemagic, antes de qualquer frase sobre o que o binário tem.)

## O que vai NO BINÁRIO

### Vai no binário, e a pessoa sente

1. **O passe vira "Resolver este problema" e vem primeiro na parede da Biela**
   (16/11, commit 16450d1, plano de receita). Preço e o que libera não mudaram (R$ 9,90, 7
   dias de Biela e orçamento sem limite). Os pacotes de 2 e 10 perguntas vêm
   abaixo, como a opção menor.
2. **A tela do sintoma diz o preço de resolver sem assinar** (16/11, commit
   16450d1), embaixo
   do botão "Aprofundar diagnóstico com o Biela": "1 pergunta grátis por mês.
   Se precisar de mais, resolva este problema por R$ 9,90, sem assinatura."
   Só onde a compra avulsa existe (não no iPhone) e só para quem não é
   Premium.
3. **O Premium com 7 dias grátis aparece no primeiro dia do carro** (16/11,
   commit 7f94150, plano de receita). Na tela do carro, nos 3 primeiros dias depois de
   cadastrar, um card oferece o teste. "Agora não" o esconde para sempre. A
   regra mora em `lib/app/ofertaPrimeiroDia.ts`. No iPhone não aparece, porque
   a Apple ainda não tem oferta de teste. Para medir, o paywall registra a
   origem `primeiro-dia` no `viu_paywall`.
4. **A pesquisa curta no Início** (16/11, commit 8236a08, plano de receita). Quem começou a
   usar há 3 dias ou mais vê, uma vez, um card com 4 perguntas: o teste de
   Sean Ellis, quanto gastou com o carro em 3 meses, se tem seguro e quanto
   pagaria por "Resolver este problema", mais um campo livre. As respostas vão
   para `pesquisa_respostas` (tabela criada em 16/11, RLS sem política) pela
   rota `/api/pesquisa`. Na web vale desde o deploy.

## Ficou FORA do binário, de propósito

- A compra avulsa no iPhone, como na 3.4.
- **O botão "Cotar meu seguro"** (criado em 16/11). Saiu em 21/11, antes
  de qualquer build, por decisão do dono: "vamos colocar a 3.6 sem o link de
  afiliado de seguro". Saiu também da web. Os eventos `viu_seguro`,
  `tocou_seguro` e `quer_seguro` continuam aceitos pelo banco, sem ninguém
  que os emita. O commit de 16/11 está DENTRO da árvore (o botão nasceu e
  saiu depois), por isso esta linha não cita o número: a `conferir:versoes`
  acusaria "está em Ficou FORA e é ancestral".

## A nota das lojas

Pela regra da casa: o ganho, não o defeito; o verbo na ação da pessoa; nada
que não tenha sido conferido. A pesquisa fica fora: não é ganho para quem lê
a loja. O seguro saiu da versão em 21/11.

**Para a Play (Android):**

```
Carro dando sinal? Agora dá para resolver o problema com a Biela por 7 dias, sem assinatura, e conferir o orçamento da oficina antes de pagar.

Acabou de cadastrar o carro? Experimente o Premium por 7 dias, de graça.
```

**Para a App Store (iPhone): não enviar por enquanto.** Sem o seguro, a 3.6 do
iPhone leva só a pesquisa (a compra avulsa e a oferta de teste não aparecem
lá). Não há ganho para escrever na loja, e a recomendação de 21/11 é mandar só
o Android agora.

Na Apple, a versão nova se cria no App Store Connect com o MESMO número do
binário: **3.6**. A 3.4 da loja levou o binário 3.5, e essa diferença não
deve se repetir.

## Plugin nativo nesta versão

Nenhum. De `android/`, `ios/`, `capacitor.config.ts` e `package-lock.json`,
desde a árvore da 3.4 (93bc0c7), mudaram só os números de versão (3.6 e o piso
76). Conferido no git em 16/11.

## Roteiro de aparelho, escrito ANTES do build

**Seguro, qualquer aparelho.** No calendário de revisões, a linha do seguro
mostra só a data, sem botão de cotar.

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

**Item 4, aparelho que usa o app há mais de 3 dias.** O Início mostra "4
perguntas rápidas". Responder as quatro liga o Enviar; enviar agradece e o
card não volta. No banco, depois: uma linha em `pesquisa_respostas` com a
plataforma e a versão 3.6.0.
