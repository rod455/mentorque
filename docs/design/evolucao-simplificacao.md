# Simplificação do Mentorque: o que a proposta acerta, o que o código desmente, e a ordem em que isso entra

Escrito em 04/10/2026, depois de ler o protótipo clicável (18 telas + landing)
e a especificação que vieram da sessão com Behance, contra o código de hoje e
contra o caderno de experimentos. A régua é a do CRO (`docs/agentes/cro-besci.md`):
uma aposta por vez, instrumento antes da aposta, área com experimento aberto
fica congelada, denominador de hoje escrito no dia em que a aposta abre, nada
de preço.

Fonte dos fatos: cada afirmação sobre "hoje" tem o arquivo ao lado. Onde eu não
medi, está escrito que não medi.

## 1. O que a proposta acerta, e fica

- **A pergunta é a porta, o carro vem pelo valor.** É a lição 1 (28/09) levada
  até o fim. Hoje o herói do Início já manda para o Biela quando não há carro
  (`Home.tsx:350`), mas é um bloco entre dezesseis. A proposta faz dele a única
  ação primária. Certo.
- **Uma ação primária por tela, em âmbar.** O Início de hoje tem, na ordem:
  aviso de versão, convite de aviso, herói, card Premium, busca, carro, custo
  do carro, data a vencer, resumo do mês, fixados, salvos, "Para você",
  memórias, problemas comuns, ações rápidas e a folha de km (`Home.tsx:325-721`).
  Dezesseis blocos, e os fechamentos do app se concentram ali (lição 8). A
  proposta tem razão no diagnóstico.
- **Cadastro do carro numa folha de três campos, aberta de onde a pessoa está.**
  Reaproveita o único FUNCIONOU do caderno (108 contra 78). Certo, e barato.
- **Cada portão diz o que destrava** (login, carro, Premium). É a lição 6.
- **Prova social DEPOIS da primeira resposta, não antes.** É a saída elegante
  para a decisão do dono de 01/09 (a página fica): ela fica, só muda de lugar
  para depois do valor. Precisa do dono dizer sim, porque muda o lugar de uma
  página que ele decidiu manter, mas é uma proposta que respeita a decisão em
  vez de contorná-la.
- **Biela em três blocos fixos** (causas, urgência, o que perguntar na
  oficina). Hoje a resposta é texto corrido montado na rota
  (`app/api/biela/route.ts:309-311`, prompt pede 2 a 5 frases). Três blocos
  dão o que as avaliações elogiam: desfecho, não recurso.
- **Landing em seis blocos, com o Biela na primeira dobra e o único destino
  sendo a loja.** Hoje são treze seções e um carrossel de três manchetes
  (`app/page.tsx:41-56`, `strings.pt.ts:25-29`). Lições 4 e 11.

## 2. O que o código desmente na especificação (corrigir antes de construir)

| A especificação diz | O código diz | Consequência |
|---|---|---|
| Pendência 1: "limite real do grátis, o protótipo supõe 5 por mês" | É 5 por mês mesmo: `lib/biela/limite.ts:32`, decisão do dono de 15/09. Contado no servidor, só conta se a IA respondeu | Pendência resolvida; o texto "No grátis: 5 perguntas por mês e até 2 veículos" está certo |
| `registrou_servico` é evento "sugerido, só se a aposta abrir"; aposta 6 "depende do evento novo" | Já existe (`lib/app/funil.ts:76`, `app/api/funil/route.ts:51`), e `viu_aula` também | A aposta 6 não depende de nada; pode medir hoje |
| `clicou_loja` na LP é evento novo | Já existe como `clicou_baixar` | A aposta da LP tem instrumento hoje |
| `avaliou_resposta` é evento novo | O polegar já existe e grava em `/api/biela-voto` (`Biela.tsx:285-320`); o polegar para baixo já pede motivo | A aposta dos três blocos tem instrumento hoje: taxa de polegar para cima, antes e depois |
| Depoimentos: "Consegui economizar na revisão." e "Não sei nada de carro e tenho aprendido." | Os textos literais são outros: "Consegui economizar. Muito bom para gerenciar revisões e troca de óleo e coisas do tipo." (munizluiz) e "Eu não conheço nada sobre carro e mecânica, e com os vídeos do app tenho aprendido cada vez mais." (aminoru), `content.ts:396-397` | A própria regra 4 da especificação ("nenhum depoimento inventado") proíbe encurtar. Vai o texto inteiro, com o nome, que é o que torna conferível |
| 3.3 "Entrar sabe por que a pessoa veio" é mudança a fazer | Já sabe, para o caso assinar: `Auth.tsx:217` (`veioAssinar()`), em produção desde 18/09 e com experimento ABERTO (`login-sabe-que-veio-comprar`) | Não é aposta nova; é área congelada até o veredito |
| 3.16 "Quer que a gente avise a próxima revisão do {carro}?" é tela nova | Já existe: `ConviteDeAviso.tsx`, texto em `content.ts:200`, no Início logo depois do onboarding e na garagem | A aposta 5 já está no ar; o que está aberto é o timing (`convite-do-carro-nao-queima-com-convidado`) |
| Início: "sai a saudação" | Não existe saudação no Início | Nada a tirar |
| 3.12 Sintomas viram atalho que abre o Biela com a pergunta | Hoje a tela de sintoma tem conteúdo próprio: causas (2 no grátis, o resto borrado), urgência, faixa de preço regional, testes caseiros, anamnese e checklist (`Symptoms.tsx:359-526`) | Trocar isso por "abre o chat" apaga uma superfície de paywall (as causas borradas) e o preço regional, que é promessa da ficha das lojas. Não é simplificação, é remoção de produto. Ver seção 4 |
| 3.10 Registrar serviço em quatro campos | Hoje são oito no grátis (serviços, data, km, oficina, valor, peças até 3, observações, foto), três obrigatórios (`History.tsx:526-693`) | A direção está certa; a data não pode sumir (vira "hoje" editável), e peças e foto viram "mais detalhes" recolhido, não somem |
| Abas: cinco viram quatro (Início, Biela, Garagem, Aprender) | Hoje: Início, Carros, Problemas, Calendário, Estudos (`Shell.tsx:261-267`). O Calendário carrega histórico, serviços e as datas do carro, que são experimento ABERTO | Tirar a aba Calendário mexe em quatro apostas abertas de uma vez. Ver seção 3 |

Duas coisas que a especificação chama de pendência e não são: as artes da Biela
já estão em `public/` (o sextavado com "B" do protótipo é só placeholder), e os
dois depoimentos já estão no app desde 04/10 (3.0).

## 3. O que o caderno congela hoje, e até quando

A regra da casa: área com experimento aberto não recebe mudança até o veredito
(`cro-besci.md:172`), e quando outra mudança toca o degrau de uma aposta
aberta, isso se diz NO DIA (retorno do dono de 02/10, ponto 2).

| Experimento aberto | Degrau que ele mede | O que da proposta cai dentro | Libera quando |
|---|---|---|---|
| `onboarding-curto` (A/B, lê de novo em 23/10) | `comecou_onboarding` → `terminou_onboarding` e → `cadastrou_carro` | 3.1 Primeira abertura sem onboarding, 3.2 prova social depois da resposta | 23/10, e depois da decisão do dono sobre A ou B |
| `login-sabe-que-veio-comprar` | `viu_paywall` → `iniciou_checkout` | 3.3 Entrar com intenção, 3.17 Paywall explicativo | Veredito do CRO na próxima sexta que tiver volume |
| `convite-do-carro-nao-queima-com-convidado` | convite → aceite → permissão | 3.16 Lembretes | Idem |
| `limite-de-carros-com-aviso` | confiança na garagem, volta de quem tem 2 carros | 3.6 Garagem (o rodapé "Até 2 veículos no grátis" É esta aposta) | Idem |
| `caderno-de-gastos`, `datas-do-carro`, `resumo-mensal`, `modo-motorista-de-app` (mudanças diretas, todas ABERTO) | uso dos quatro cards no Início e no Calendário | 3.4 Início (os cards saem do Início), a aba Calendário | Vereditos pendentes desde setembro; o CRO precisa fechar ou declarar inconclusivo |

Então o Início, que é a aposta número 1 da especificação, é também a tela com
mais apostas abertas em cima. Isso não impede a mudança; obriga a fazê-la de um
jeito específico: os quatro cards não SOMEM, descem para baixo da dobra (ou
para a tela do carro), e o dia em que o Início mudar fica escrito nas quatro
apostas como "mudança que toca o degrau".

## 4. Onde eu discordo da proposta

1. **Sintomas não viram atalho de chat agora.** A tela de sintoma hoje é
   conteúdo com portão de Premium no meio (causas borradas) e com a faixa de
   preço regional que a ficha das lojas promete. Antes de tirar, medir o que ela
   faz: `consultou_sintoma` → `perguntou_biela` e `consultou_sintoma` →
   `viu_paywall`, por plataforma, últimos 30 dias. Eu não medi isso nesta
   sessão. Se o número disser que quase ninguém chega ao paywall por ali, aí a
   proposta ganha. Antes do número, é remover produto por estética.
2. **Quatro abas não é a primeira coisa a fazer, é a última.** Tirar a aba
   Calendário muda onde moram histórico, datas e resumo, e todas são apostas
   abertas. A troca barata e sem conflito é UMA: a aba "Problemas" vira a aba
   "Biela", com os sintomas acessíveis pelo ícone no cabeçalho do chat (que é
   exatamente o desenho da própria proposta em 3.5). Cinco abas continuam por
   enquanto.
3. **"Lora sai do app" não é aposta, é decisão visual do dono.** São 62 usos
   em 27 arquivos (`layout.tsx:24-30`, `ui.tsx:196` é o título de todas as
   telas internas). Pode entrar num build junto com outra coisa, sem promessa
   de mover número nenhum. Não entra na fila de apostas.
4. **Prova social com "5,0 em 12 avaliações" e "170+ diagnósticos" já está no
   app** (`content.ts`, bloco `stats`, com a fonte em comentário). O que a
   proposta muda é o momento (depois da resposta). O número não é novidade.

## 5. A ordem de apostas, uma por vez, com o denominador de hoje

A régua: o braço menor tem que chegar ao critério de parada no dia em que a
aposta abre. Denominadores de hoje, da leitura de 02/10 e do retrato de 04/10:
onboarding ~100 começos por semana por braço; ~200 usuários ativos por semana;
`perguntou_biela` 66 em 30 dias; `registrou_servico` eu não li nesta sessão.

| # | Aposta | Área livre? | Instrumento | Denominador de hoje | Quando |
|---|---|---|---|---|---|
| 1 | **Landing em seis blocos**, Biela na primeira dobra, duas avaliações literais com nome, preço uma vez, lojas no topo e no fim | Sim, nenhum experimento aberto na LP | `clicou_baixar` por visita, cortado por `utm_source` | Hoje: a busca do Google acabou de voltar a veicular (04/10) e aponta para a home. É tráfego novo chegando na mesma semana da mudança: declarar no dia e ler por fonte, não no total | Pode abrir agora |
| 2 | **Aba Problemas vira aba Biela**; Sintomas pelo ícone no cabeçalho do chat; nada mais muda | Sim | `perguntou_biela` por usuário ativo na semana; guarda: `consultou_sintoma` não pode cair pela metade | ~200 ativos por semana, 66 perguntas em 30 dias. É amostra pequena: leitura direcional em 2 semanas, veredito em 4 | Logo depois da 1 (área diferente, pode correr junto) |
| 3 | **Biela responde em três blocos** (causas, urgência, o que perguntar) com os chips "Quanto costuma custar?", "Posso viajar assim?", "Guardar para o meu carro" (abre a folha de três campos quando não há carro) | Sim | Taxa de polegar para cima (`biela-voto`, já existe); `perguntou_biela` → `abriu_cadastro_de_carro` → `cadastrou_carro` | 66 perguntas em 30 dias: com n assim, só direção. Dizer isso ao abrir | Depois da 2, porque a 2 traz volume para a 3 |
| 4 | **Início com a pergunta como única primária**; o carro vira chip com a próxima revisão; os quatro cards abertos descem para baixo da dobra; card Premium sai do Início (continua no Perfil e no limite) | Não: quatro mudanças diretas abertas | `perguntou_biela` por sessão com origem `home`; fechamentos na Home (retrato) | ~200 ativos por semana | Quando o CRO fechar ou declarar inconclusivas as quatro apostas do Início; ou agora, com a frase "toca o degrau" escrita nas quatro no dia |
| 5 | **Registrar serviço em quatro campos** (serviço, km, valor, oficina), data "hoje" editável, peças e foto em "mais detalhes" | Sim | `registrou_servico` por carro ativo (já existe) | Não li o número nesta sessão; ler antes de abrir | Depois da 4 |
| 6 | **Primeira abertura = a pergunta**; prova social DEPOIS da primeira resposta, uma vez; "Ou cadastrar meu carro primeiro" como segunda opção | Não: `onboarding-curto` até 23/10 | `comecou_onboarding` → `perguntou_biela` e → `cadastrou_carro` | ~100 por semana por braço, suficiente para A/B contra o vencedor de 23/10 | Depois de 23/10 e do dono decidir A ou B |
| 7 | **Paywall diz o que destrava com o carro pelo nome**; preço, planos e cupom intocados | Não: `login-sabe-que-veio-comprar` | `viu_paywall` → `iniciou_checkout` → `assinou` | 11 a 25 `viu_paywall` por semana: só direção | Depois do veredito do login |
| 8 | Sintomas viram atalho do Biela | Decidir com número | `consultou_sintoma` → `perguntou_biela` e → `viu_paywall` | Medir primeiro | Só se a medição da seção 4 autorizar |

Fora da fila, por não serem apostas: trocar o "B" sextavado pela arte real da
Biela, tirar a Lora, alinhar o corpo à esquerda. Entram no próximo build que
tiver outra razão para existir, sem reivindicar número.

## 6. O que a sessão de design deveria fazer com isto

- Corrigir no protótipo os dois depoimentos para o texto literal com o nome, e
  o campo Data no formulário de serviço.
- Redesenhar a aba: cinco abas com "Biela" no lugar de "Problemas", que é o que
  vai ao ar primeiro.
- Trazer referência de UMA coisa que ainda não está desenhada: como fica a
  tela de sintoma quando ela coexiste com o chat (causas, urgência e preço
  regional continuam existindo). Hoje o protótipo não tem essa tela porque
  decidiu apagá-la.
- Manter a landing como está no protótipo: é a aposta número 1 e está pronta.

## 7. Perguntas que só o dono responde

1. A prova social pode ir para DEPOIS da primeira resposta do Biela (a página
   fica, muda de lugar)? Sem isso, a aposta 6 não abre.
2. Lora sai e a arte da Biela entra no lugar do "B"? É visual, é de você.
3. Em 23/10, quando o `onboarding-curto` fechar: A (cinco páginas com a prova
   social) ou B (três páginas sem ela)? A aposta 6 nasce em cima da escolha.
