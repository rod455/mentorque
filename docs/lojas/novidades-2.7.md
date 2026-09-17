# Novidades da versão 2.7

Aberta em 17/09/2026, algumas horas depois de a 2.6 sair. Tudo o que entra
aqui já roda na web pelo deploy da Vercel; o binário só importa para o app das
lojas.

**Onde a 2.6 está (conferido no banco em 17/09):** enviada em 16/09 03:41
(Pacífico), build 66, publicada nas duas lojas. O banner de "versão nova
disponível" já aponta para a 66 em `/api/app/latest`.

## O que vai NO BINÁRIO

São três consertos e nenhuma funcionalidade nova. **A 2.7 existe porque a 2.6
prometeu na ficha uma coisa que o binário não entregava.**

1. **A Biela no gratuito passa a FUNCIONAR** (17/09, relatado pelo dono no
   aparelho). A 2.6 levou o limite de cinco perguntas por mês e o contador do
   servidor, e levou junto sete portões de Premium nas ENTRADAS, em cinco
   telas: Estudos, Equipamentos, Sintomas (três lugares), Busca e OBD2. Quem
   não assinava era mandado ao paywall antes de chegar ao chat, então a
   novidade não alcançou ninguém. Saíram também o selo Premium do card e o
   cadeado do botão de diagnóstico.
   - Onde mora: as cinco telas acima e `components/app/screens/Learn.tsx`.
     Conferido por `conferir:biela` (texto, nos cinco arquivos) e pela suíte
     `telas` (sem assinatura, o card abre o chat E o campo de escrever está
     lá), as duas provadas com o portão plantado de volta.
   - **Isto é o que torna verdadeira a linha que a ficha da 2.6 já publicou**
     ("5 perguntas por mês, de graça, com a Biela"). Enquanto a 2.7 não sair,
     a loja promete o que o binário não faz.
2. **O card de abastecimento no Início volta a caber na tela** (17/09,
   relatado pelo dono com foto). O botão morava dentro da linha do texto com
   `shrink-0`, e o título do card vazio interpola o nome inteiro do carro:
   num celular de 390px a coluna do texto ficava com 82px de 350 (23%), e em
   320px com 12px de 280 (4%), escrevendo uma palavra por linha. O botão foi
   para linha própria, como o card do motorista já fazia.
   - Conferido pela suíte `combustivel`, que passou a MEDIR a largura da
     coluna a 320 e 390px. Nenhuma conferência pegava isto antes: `min-w-0
     flex-1` deixa a coluna encolher até quase zero sem estourar o card para
     o lado, então não é vazamento lateral, é coluna estreita.
3. **O "esqueci minha senha" para de prometer o que não existe** (17/09,
   achado da QA). O texto dizia "Enviamos um link para redefinir sua senha" e
   não há nenhuma tela para redefinir senha: há exatamente um `updateUser` no
   repositório e ele grava nome no login social. O link cria sessão, então o
   texto passa a dizer isso, que é um link de acesso.
   - A recuperação de verdade está proposta e corrigida em
     `docs/agentes/propostas/recuperar-senha-nao-recupera.md`, e fica para
     depois: é funcionalidade nova em autenticação e exige teste de aparelho
     com e-mail real.
   - Tamanho medido antes de virar urgência: 32 contas, 3 com senha, 1 pedido
     de recuperação em toda a história. As outras 29 entraram por Google ou
     Apple e não têm senha para esquecer.

Vai junto, sem efeito visível: o relato de erro passa a dizer de que aparelho
veio (`anon_id`, o mesmo do funil). Sem ele, "dez ocorrências" pode ser dez
pessoas ou uma reabrindo o app, e as duas leituras pedem reações opostas.

## Roteiro de aparelho, e ele é obrigatório

O que nenhuma suíte alcança é o binário. Os dois primeiros são os consertos
desta versão; o terceiro é herdado da 2.6 e nunca foi rodado.

1. **A Biela abre SEM assinar, pelas cinco portas.** No app das lojas, sem
   assinatura: Estudos e o card "Fala com o Biela"; Problemas, um sintoma, e
   "Diagnosticar com a Biela"; a busca; a tela de OBD2, "Aprofunde"; e
   Equipamentos. As cinco têm que abrir o chat, com o campo de escrever, e
   nenhuma pode cair no paywall. Na tela, acima do campo, tem que aparecer
   "5 perguntas grátis restantes neste mês".
2. **O contador desce e o limite segura.** Fazer seis perguntas: as cinco
   primeiras respondem e o contador vai de 5 a 0; a sexta não sai e a folha
   do Premium toma o lugar do campo. **Fechar e reabrir o app NÃO devolve
   perguntas** (era isso que o contador antigo fazia). Conferir no banco:
   `select count(*) from biela_perguntas where mes = '2026-09'`.
3. **O card de abastecimento no Início**, num celular estreito: o título
   "Quanto o [carro] custa por km?" tem que ocupar a largura do card, com o
   botão embaixo, e não uma palavra por linha.
4. **O token de push do iPhone** (herdado da 2.5, nunca rodado). iPhone com a
   versão nova, logado, Perfil, ligar os avisos. Em até um minuto,
   `select platform, anon_id, user_id from push_tokens order by updated_at desc`
   mostra uma linha `ios`. Sem conta, a linha nasce com `user_id` nulo e
   `anon_id` preenchido; criando conta depois, a MESMA linha ganha o
   `user_id` em vez de virar duas.

## Notas para as lojas, PARA O DONO CONFERIR ANTES DE COLAR

Ganho, não defeito; verbo na ação da pessoa; nada que não tenha sido
conferido.

**A decisão de forma, e ela é a que importa aqui.** A 2.7 é feita de
consertos, e nota de loja não fala de conserto. Mas a 2.6 tem um dia de vida
e quase ninguém a recebeu: no dia 17/09 havia 9 aparelhos Android na 2.6
contra 16 ainda na 2.5, e no iPhone a 2.6 tinha 1. Para a imensa maioria, o
que a 2.7 traz de novo é a lista da 2.6 inteira. Então ela é repetida aqui,
com a Biela promovida ao topo, porque agora ela é verdade.

O que a Biela ganha de dizer, e que a linha da 2.6 não dizia: **não precisa
criar conta**. O limite conta pelo id do aparelho quando não há sessão
(`app/api/biela/route.ts`), então a frase é fato, não promessa.

**Google Play** (limite: 500 caracteres)

```
Sua mecânica de IA agora atende de graça: 5 perguntas por mês com a Biela, sem assinar e sem criar conta.

Recebeu um orçamento da oficina? Tire uma foto e veja item por item, com a faixa de preço da sua região.

Registre o abastecimento em três toques e descubra quanto seu carro custa por km.

Guarde IPVA, licenciamento, seguro e CNH: o app avisa 30, 7 e 1 dia antes, e sugere a data pelo final da placa.
```

**App Store**

```
Sua mecânica de IA agora atende de graça: 5 perguntas por mês com a Biela, sem assinar e sem criar conta.

Barulho estranho, luz acesa no painel, orçamento que você não entendeu: pergunte e ela explica em português de gente, olhando o seu modelo e o que você já registrou.

Recebeu um orçamento da oficina? Tire uma foto e veja item por item, com a faixa de preço da sua região, e as perguntas para fazer antes de aprovar.

Registre o abastecimento em três toques e descubra quanto seu carro custa por km.

Guarde IPVA, licenciamento, seguro e CNH: o app avisa 30, 7 e 1 dia antes, e sugere a data pelo final da placa.

No começo do mês, o resumo do que o carro custou.

Trabalha com o carro por aplicativo? Ligue o modo no Perfil e veja quanto sobrou no dia.
```

## Antes de enviar

- Subir a versão nos três lugares ANTES do build. O repositório já está em
  2.7 (`conferir:versoes` diz "2.7, ainda não publicada").
- Acrescentar `"2.7"` à lista `JA_PUBLICADAS` NA HORA do envio, não na hora
  da aprovação. Foram três releases seguidos com um dia de atraso nisso.
- Na App Store, o nome e as palavras-chave novos continuam abertos e só
  mudam junto com um envio: esta é a próxima janela. Estão em
  `docs/lojas/ficha.md`.
- `/api/app/latest` só depois da aprovação, com o número do log
  ("versionCode deste envio: N"), nunca com o "Index" da tela. Hoje aponta
  para 66 nas duas lojas.
