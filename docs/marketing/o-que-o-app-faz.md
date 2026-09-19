# Mentorque: o que o app faz hoje

Material de referência para quem cria peça, imagem e texto de divulgação.
Escrito em 19/09/2026, a partir do código da versão 2.7 (a que está nas lojas).

**Regra de ouro deste documento: só existe aqui o que o app faz de verdade.**
Se uma peça prometer algo que não está nesta lista, a pessoa baixa, não acha, e
vira avaliação de uma estrela. Já aconteceu: a ficha dizia "cadastro de
veículos" e uma avaliação real escreveu "bom que é grátis para 1 carro",
saindo com a conta errada na cabeça.

---

## Em uma frase

O Mentorque é um app de cuidado com o carro que responde três perguntas que
todo motorista tem e quase ninguém consegue responder sozinho: **o que está
acontecendo com o meu carro, quanto ele me custa, e esse orçamento da oficina
faz sentido?**

O tom é o de um mecânico de confiança explicando em português de gente. Nunca
acusa a oficina, nunca usa jargão sem explicar, nunca promete diagnóstico
remoto de coisa que só se vê no aparelho.

---

## As funcionalidades, uma a uma

### 1. Análise de orçamento por foto

**O que é:** a pessoa tira uma foto do orçamento que a oficina passou. O app lê
linha por linha, explica para que serve cada item em uma ou duas frases, compara
o preço com a faixa da região quando existe referência, e devolve três a seis
perguntas concretas para fazer no balcão antes de aprovar.

**O que ele NUNCA faz:** dizer que a oficina está enganando, cobrando caro ou
empurrando serviço. O papel dele é explicar e municiar a pessoa de perguntas.

**Onde vive:** tela Orçamento, alcançável pelo checklist de sintoma, pelo
formulário de serviço novo e pela Biela.

**Grátis ou pago:** 2 análises por mês no gratuito, sem limite no Premium.

**O gancho de imagem:** a foto de um papel amassado de oficina virando uma lista
explicada. É a funcionalidade mais visual do app.

### 2. Biela, a mecânica de IA

**O que é:** uma conversa sobre o carro da pessoa. Ela sabe qual é o modelo, o
que já foi feito no histórico, o código de OBD2 que a pessoa acabou de
consultar e o sintoma em investigação. Quando existe manual do carro, responde
a partir dele e diz de qual ano é o manual quando ele não bate com o ano do
carro.

**Onde vive:** tela Biela, alcançável por Estudos, Problemas, busca,
Equipamentos e OBD2.

**Grátis ou pago:** **5 perguntas por mês, sem assinar e sem criar conta.** Sem
limite no Premium. Este é o argumento mais forte que o app tem hoje para quem
nunca usou.

**O gancho de imagem:** a pergunta que a pessoa tem vergonha de fazer no balcão.
"Barulho estranho", "luz acesa no painel", "isso é caro?".

### 3. Caderno de gastos: abastecimento em três toques

**O que é:** a pessoa registra o abastecimento informando valor, km do painel e
litros (opcional). O app devolve na hora quanto o carro custa por km e o consumo
em km por litro. A partir do segundo abastecimento a conta fica completa.

**Detalhe que importa:** quem abastece pelo app carimba o km do carro
automaticamente, então não recebe a pergunta mensal de quilometragem.

**Onde vive:** card "Custo do carro" na tela Início, e no Histórico.

**Grátis ou pago:** grátis.

**O gancho de imagem:** o número que ninguém sabe de cabeça, "quanto o meu carro
custa por km".

### 4. Datas do carro: IPVA, licenciamento, seguro e CNH

**O que é:** a pessoa guarda as quatro datas e o app avisa 30, 7 e 1 dia antes,
às 9h. No IPVA e no licenciamento ela não precisa nem saber a data: informa o
estado e o final da placa uma vez, e o app sugere pelo calendário oficial
daquele estado.

**Estados com calendário hoje:** IPVA de SP, MG, RS e SC; licenciamento de SP e
RJ. Quando o calendário do ano ainda não saiu, o app projeta a partir do ano
anterior e marca a data como estimada, pedindo para conferir no Detran.

**Onde vive:** card "Datas do carro" no Calendário, e no Início quando falta 30
dias ou menos.

**Grátis ou pago:** grátis.

**O gancho de imagem:** o alívio de não ser pego de surpresa pelo IPVA.

### 5. O mês do carro fechado

**O que é:** no começo de cada mês, o app mostra e manda por e-mail o resumo do
mês anterior: quanto foi de combustível, quanto foi de serviço, o custo por km e
o que vence nos próximos 30 dias.

**Onde vive:** card no Início na primeira semana do mês, e e-mail.

**Grátis ou pago:** grátis.

### 6. Modo motorista de aplicativo

**O que é:** um interruptor no Perfil para quem trabalha com o carro. Ligado, o
card do Início vira a conta do dia: **ganhou, custou, sobrou**, mais o lucro por
km. O custo sai do combustível registrado mais uma reserva de manutenção
calculada pelos serviços dos últimos 12 meses.

**Honestidade embutida:** sem dois abastecimentos registrados, o app diz que o
custo ainda falta, em vez de inventar um número.

**Onde vive:** Perfil (o interruptor) e Início (a conta).

**Grátis ou pago:** grátis.

**O gancho de imagem:** o motorista de app que dirige o dia inteiro e não sabe
quanto sobrou.

### 7. Diagnóstico por sintoma

**O que é:** a pessoa escolhe o que está sentindo (barulho, luz acesa, carro que
não pega, gastando muito) e o app faz perguntas que estreitam o problema, em vez
de listar peças. No fim, diz o que pode ser, o que dá para checar na garagem e
quando é caso de parar o carro na hora.

**Onde vive:** aba Problemas.

**Grátis ou pago:** grátis.

### 8. Calendário de revisão e saúde do carro

**O que é:** a partir do que a pessoa registrou (serviços, km, data de compra),
o app monta o calendário de revisão do carro e mostra o que está em dia, o que
está chegando e o que venceu, com aviso no aparelho.

**Regra que vale citar:** o app **não inventa atraso**. Ele só diz "venceu"
quando existe um serviço daquele tipo registrado; sem registro, ele pede o
registro em vez de cobrar.

**Onde vive:** aba Calendário e a tela do carro.

**Grátis ou pago:** grátis.

### 9. Histórico de manutenção

**O que é:** tudo o que foi feito no carro num lugar só, com data, km, valor e
notas. Abastecimentos e dias de trabalho entram na mesma lista. O orçamento
analisado por foto pode ser salvo direto no histórico, já preenchido.

**Grátis ou pago:** 20 serviços no gratuito, sem limite no Premium.

### 10. Trilha de mecânica e quiz diário

**O que é:** aulas curtas sobre mecânica de verdade, organizadas em trilhas
(como "Primeiros 30 dias"), e uma pergunta por dia com sequência e conquistas.

**Onde vive:** aba Estudos.

**Grátis ou pago:** parte das aulas é aberta; o acervo completo é Premium.

---

## Gratuito e Premium, os números exatos

| | Gratuito | Premium |
|---|---|---|
| Carros na garagem | **2** | sem limite |
| Serviços no histórico | **20** | sem limite |
| Perguntas à Biela | **5 por mês** | sem limite |
| Análises de orçamento por foto | **2 por mês** | sem limite |
| Diagnóstico por sintoma, calendário, datas, abastecimento | tudo | tudo |
| Acervo de aulas | parcial | completo |
| Relatórios de gasto | não | sim |

**Preço:** R$ 29,90 por mês ou R$ 239,90 por ano (equivale a R$ 19,99 por mês).
Teste grátis de 7 dias (3 dias no iPhone, por regra da Apple).

**Na versão gratuita do Android aparecem anúncios.** No iPhone não.

> Preço muda. Antes de fechar qualquer arte com valor, confirme com o Rodrigo.

---

## A marca

**Cores** (as mesmas do app):

| Cor | Hex | Uso |
|---|---|---|
| Grafite | `#16181D` | fundo, sempre escuro |
| Creme | `#F4F2EC` | texto principal |
| Âmbar | `#F2A623` | destaque, botão principal, a cor da marca |
| Verde | `#0F8A66` | dinheiro, economia, coisa em dia |
| Coral | `#C24D26` | atenção, coisa vencida |

O app é **escuro por padrão**. Peça com fundo branco não parece o produto.

**A Biela** é a mecânica de IA da marca, representada por uma personagem
ilustrada (as artes estão em `public/biela/`). Ela é referida no feminino.

---

## O jeito de escrever, e ele não é negociável

1. **Português natural, SEM travessão** (o traço longo). Vale para tudo:
   anúncio, legenda, imagem, e-mail. Use vírgula, dois-pontos ou ponto.
2. **Ganho, não defeito.** "O app avisa 30 dias antes do IPVA", não
   "não esqueça mais do IPVA".
3. **Número junto da promessa.** "5 perguntas por mês" é melhor que "grátis",
   porque "grátis" sem número a pessoa preenche sozinha para mais, e depois
   reclama.
4. **Nunca acusar oficina.** O app explica e dá perguntas; ele não denuncia
   ninguém. Peça com "descubra se estão te roubando" está fora da marca.
5. **Nada de diagnóstico mágico.** O app não lê o carro à distância. Ele
   organiza, explica e pergunta.

---

## O que o app NÃO faz, para nenhuma peça prometer

- Não lê o carro remotamente nem por Bluetooth. O OBD2 é a pessoa digitando o
  código que o scanner mostrou.
- Não agenda serviço em oficina nem tem rede de oficinas parceiras.
- Não compara preço de peça em loja, nem vende peça.
- Não faz financiamento, seguro nem consulta de multa ou leilão.
- Não consulta a placa em base oficial. O final da placa serve só para sugerir
  a data do IPVA e do licenciamento pelo calendário do estado.
- Não redefine senha por enquanto: o "esqueci minha senha" manda um link de
  acesso que entra na conta sem senha.

---

## As três peças com mais chance de funcionar hoje

Opinião de quem olha os números, para orientar prioridade:

1. **A Biela grátis, com o número na frente.** É a única coisa que o app dá de
   graça e que os concorrentes cobram, e não pede nem conta.
2. **O orçamento por foto.** É a dor mais concreta e a mais visual: papel de
   oficina que ninguém entende virando lista explicada.
3. **O custo por km.** É um número que a pessoa não sabe, quer saber, e o app
   entrega em três toques.
