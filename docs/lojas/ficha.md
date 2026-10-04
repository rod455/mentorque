# Texto da ficha das lojas

Pronto para colar. Google Play e App Store separados, porque os limites e a
forma de indexar são diferentes.

O que está escrito abaixo é o texto NO AR. Propostas ainda não aplicadas ficam
no fim do arquivo, em "Propostas abertas", com data e raciocínio. Quando o
Rodrigo colar uma proposta no console, ela sobe para o corpo do arquivo e sai
de lá.

## Por que este texto é escrito assim

A ficha da loja não é lida só por gente. Ela é a fonte que um modelo de
linguagem encontra quando alguém pergunta "existe um app que ajuda a saber o
que meu carro tem?", e é o que a busca da própria loja indexa. As duas
leituras premiam a mesma coisa: **a primeira frase dizendo o que o produto é,
sem metáfora**.

"Especialista no bolso" é uma boa frase de marca e uma péssima primeira frase
de ficha: um modelo não consegue extrair dali que isto é um app de manutenção
automotiva. A metáfora entra depois, quando a definição já está no lugar.

Três regras que valem para os dois textos:

1. **Primeira linha define, não seduz.** Categoria, público e o que faz.
2. **O que o app NÃO faz aparece.** Não é humildade: é o que evita download
   de quem queria outra coisa, e download frustrado vira nota 1 estrela.
3. **Nada de número inventado.** Sem "milhares de usuários" e sem porcentagem
   de economia. O app é novo, e a loja não perdoa promessa desmentida.

---

## Google Play

### Título (30 caracteres)

```
Mentorque: manutenção do carro
```

Aplicado em 01/09/2026, no lugar de `Mentorque: cuidar do carro`. O motivo e
o critério de leitura estão em "Propostas aplicadas", no fim deste arquivo.

### Descrição curta (80 caracteres)

Aparece na listagem e é o trecho que mais viaja para fora da loja.

```
Entenda o barulho, a luz do painel e o orçamento antes de ir na oficina.
```

### Descrição completa (até 4000 caracteres)

```
Mentorque é um aplicativo de manutenção e educação automotiva para quem não é mecânico. Ele ajuda você a entender o que o seu carro tem, a decidir se o problema pode esperar e a chegar na oficina sabendo o que perguntar.

O QUE VOCÊ FAZ NO APP

Diagnóstico por sintoma
Descreva o que está sentindo com as suas palavras: barulho ao frear, luz acesa no painel, cheiro estranho, vibração no volante. O app mostra as causas prováveis, a urgência típica de cada uma e um checklist para levar na oficina, tudo ajustado ao carro que você cadastrou.

Aulas de mecânica para leigos
Trilhas do básico ao avançado sobre freio, suspensão, motor, elétrica e pneus. Escritas para quem nunca abriu um capô, sem jargão e sem aula de faculdade.

Histórico de manutenção
Registre serviços, peças e gastos por veículo. O app lembra das revisões pela quilometragem, e o histórico organizado ajuda na hora de vender o carro.

Ferramentas do dia a dia
Leitura de códigos OBD2, comparador de etanol e gasolina, quiz de saúde do veículo e estimativa de faixa de preço para você saber se o orçamento faz sentido.

PARA QUEM É

Para quem quer economizar sem ser enganado na oficina. Para motorista de aplicativo, que perde renda com o carro parado. Para quem comprou usado e não sabe o que já foi feito. E para quem simplesmente gosta de entender como as coisas funcionam.

O QUE O MENTORQUE NÃO FAZ

Ele não diagnostica o seu carro à distância e não substitui a inspeção de um profissional: mostra causas prováveis e prepara a conversa com o mecânico. Não conserta nada, não agenda serviço, não vende peça e não dá preço fechado. Também não é seguro nem assistência 24 horas.

PREÇO

O uso principal é gratuito e não pede cartão: cadastro de veículos, diagnóstico por sintoma, histórico de manutenção, aulas abertas e ferramentas básicas.

O Premium é opcional, por R$ 29,90 por mês ou R$ 239,90 por ano, e libera o acervo completo de conteúdo, relatórios de gasto, diagnóstico aprofundado e a assistente Biela sem limite.

Disponível em português e inglês. Também funciona no navegador, em www.mentorque.com.br
```

---

## App Store

### Nome (30 caracteres)

```
Mentorque: manutenção do carro
```

TROCADO pelo dono em 04/10/2026 (dito por ele; a página pública da App Store
não responde do ambiente remoto, então a conferência fica para a coleta do
App Store Connect). As palavras-chave AINDA NÃO: continuam as de "Hoje" na
tabela de 01/09, e só mudam junto com o próximo envio de versão. Virou linha
em `docs/agentes/acoes-do-dono.md`.

**PERDEU QUATRO ENVIOS, e isso está medido (01/10).** O retrato de hoje mostra
2.5, 2.6, 2.7, 2.8 e 2.9 todas em READY_FOR_SALE na App Store. Ou seja, desde
que esta linha foi escrita em 01/09 passaram quatro envios à Apple e o nome não
pegou carona em nenhum. Em 15/09 eu escrevi que a janela da 2.6 estava aberta e
custava dois minutos; a 2.6 subiu sem isso, e depois a 2.7, a 2.8 e a 2.9.

A lição não é sobre a Apple, é sobre onde eu escrevi o pedido: recomendação que
vive no diário e no artifact não é cobrada por ninguém. Agora é linha em
`docs/agentes/acoes-do-dono.md`, que conta idade todo dia. Enquanto não for
feito, o nome na App Store continua sendo `cuidar do carro` e o da Play
`manutenção do carro`, e as duas lojas dizem coisas diferentes sobre o mesmo
app.

### Subtítulo (30 caracteres)

```
Entenda o carro e a oficina
```

### Palavras-chave (100 caracteres, separadas por vírgula, sem espaço)

A Apple indexa este campo e ele não aparece para o usuário. Não repita
palavras que já estão no nome nem no subtítulo: a Apple já as indexa e
repetir desperdiça caracteres.

```
manutencao,mecanica,oficina,barulho,painel,obd2,revisao,pneu,freio,motor,diagnostico,gastos
```

### Texto promocional (170 caracteres, editável sem nova revisão)

```
Barulho novo no carro? Descubra as causas prováveis, a urgência de cada uma e o que perguntar na oficina antes de autorizar qualquer serviço.
```

### Descrição

Mesmo corpo da Play. A Apple não indexa a descrição na busca, mas é ela que
um modelo de linguagem lê, então o texto continua valendo.

---

## Prova social: chegou, e continua fora dos textos de loja

**Atualizado em 15/09/2026.** Já existem 8 avaliações, todas 5 estrelas (5 na
Play, 3 na App Store). Os textos exatos e quais servem de depoimento para a LP
estão em `docs/lojas/respostas.md`.

O que mudou: a LP pode encher a seção de depoimentos, que estava vazia de
propósito, com frase real e nome real.

O que NÃO mudou: nenhum texto de loja cita nota. Com 8 avaliações, uma nota 1
derruba a média de 5,00 para 4,56, e ficha que anuncia nota precisa de nova
revisão para desanunciar. Citar nota entra quando o volume aguentar uma nota
ruim sem virar mentira, não antes.

---

# Propostas aplicadas e abertas

## 2026-09-01 · O título é o campo mais forte da Play e hoje ele não tem a palavra que as pessoas digitam

**Estado: metade APLICADA.** O título da Play foi trocado pelo dono em
01/09/2026. Nome e palavras-chave da Apple continuam abertos.

**VEREDITO DE 01/10/2026, na data marcada: NÃO DEU PARA LER, e a causa não é
falta de tempo.** O número combinado (Play Console, Aquisição de usuários,
origem "Pesquisa do Google Play") só existe dentro do console, e este papel não
entra em console. Conferido no pacote bruto do coletor de hoje: `play_console`
devolve `{"anrPorDia":[],"crashPorDia":[]}` e nada de aquisição. O
`search_console` que o retrato traz é da WEB (0 clique e 37 impressões em 28
dias), não da busca da Play.

Pela regra escrita em 01/09, o desfecho é o mesmo em qualquer dos dois casos: o
título **FICA** como está, porque voltar para `cuidar` seria pior pelo mesmo
raciocínio, e a proposta desta quinzena muda de assunto em vez de mexer na
mesma palavra. A leitura continua pendurada numa única tela que só o dono abre,
e por isso virou uma linha em `docs/agentes/acoes-do-dono.md` com o caminho
exato, em vez de uma recomendação que envelhece no diário.

**O que muda:** uma linha em cada loja, e a limpeza que ela obriga no campo de
palavras-chave da Apple.

### Google Play, título (limite 30)

| | Texto | Caracteres |
|---|---|---|
| Hoje | `Mentorque: cuidar do carro` | 26 |
| Proposto | `Mentorque: manutenção do carro` | 30 |

### App Store, nome (limite 30)

Mesma troca, pelo mesmo motivo. Nome, subtítulo e palavras-chave da Apple só
mudam junto com o envio de uma versão, e a 1.5 já subiu em 31/08, então esta
parte espera o próximo envio. Na Play o título muda na hora, sem release: dá
para aplicar a metade da Play hoje e a da Apple depois, e isso até ajuda a
separar o efeito de cada loja.

### App Store, palavras-chave (limite 100)

| | Campo | Caracteres |
|---|---|---|
| Hoje | `manutencao,mecanica,oficina,barulho,painel,obd2,revisao,pneu,freio,motor,diagnostico,gastos` | 91 |
| Proposto | `mecanica,barulho,painel,obd2,revisao,pneu,freio,motor,diagnostico,gastos,oleo,bateria,suspensao` | 95 |

Saíram `oficina` e `manutencao`, entraram `oleo`, `bateria` e `suspensao`: de
12 termos para 13, sem estourar o limite.

### O raciocínio

O título é o campo de maior peso na busca da Play, e hoje ele gasta esse peso
em `cuidar`, que é um verbo que quase ninguém digita na caixa de busca. Quem
tem um barulho no carro procura por manutenção, revisão, oficina, óleo. A
troca de `cuidar` por `manutenção` põe no campo mais forte o termo mais
procurado da categoria, sem perder a marca (o nome continua na frente) e sem
perder o sentido para quem lê: `manutenção do carro` diz o que o app é com a
mesma clareza, e ainda usa os 30 caracteres inteiros em vez de 26.

Na Apple a mesma troca tem um efeito de segunda ordem que é onde mora o ganho
real. A Apple indexa nome, subtítulo e palavras-chave juntos, e repetir termo
entre eles é caractere jogado fora. Hoje o campo já desperdiça `oficina`, que
está no subtítulo desde sempre. Com `manutenção` subindo para o nome,
`manutencao` também vira repetição. As duas remoções liberam espaço para três
termos que o app atende de verdade e que hoje não estão em lugar nenhum: óleo,
bateria e suspensão.

Repare no que a proposta NÃO faz: não mexe na descrição curta, que é boa e
carrega barulho, painel e oficina, e não inventa prova social. Uma coisa por
rodada, para dar para ler o efeito de cada uma.

### O risco, dito na cara

O nome fica com acento (`manutenção`) e o campo de palavras-chave sempre usou
forma sem acento. A Apple normaliza acento na busca, então quem digitar
`manutencao` deveria continuar achando o app pelo nome, mas isso é o que se
espera, não o que se comprovou. Conferência barata depois de publicar: buscar
`manutencao` sem acento na App Store BR e ver se o Mentorque aparece. Se não
aparecer, devolver `manutencao` ao campo de palavras-chave e tirar de lá o
termo mais fraco.

### Como saber se funcionou

ATENÇÃO AO QUE MUDOU EM 01/09: os anúncios do Google Ads começaram no mesmo
dia. A Play separa a origem (Pesquisa do Google Play é uma linha, tráfego de
anúncio é outra), então dá para ler, mas com uma ressalva: campanha faz subir
a busca por MARCA, e busca por marca cai na mesma linha de "Pesquisa do Google
Play" que a busca por categoria. Se o número subir, olhar os TERMOS antes de
creditar a troca do título. Quem chegou digitando "mentorque" veio do anúncio,
não da palavra `manutenção`.

Play Console, Aquisição de usuários, origem "Pesquisa do Google Play": hoje
esse número é zero contra zero, então qualquer coisa acima de zero já é sinal.
A leitura honesta só existe a partir de duas rodadas depois da troca, porque a
Play leva alguns dias para reindexar e o volume é pequeno demais para ler em
uma semana.

---

## 2026-09-15 · O texto diz que o grátis cadastra veículos; o app para no segundo

**Estado: ABERTA, e sem sinal de ter sido aplicada (conferido em 01/10).** Vale
para a Play (aplicável na hora) e para a App Store (entra junto com o próximo
envio). Entrou na lista do dono em 01/10, porque duas semanas no diário não
moveram nada. O prazo de volta atrás de 15/10 só começa a contar do dia em que
a frase entrar no ar, não da data em que foi proposta.

### A troca, em tabela

Campo: descrição completa, bloco PREÇO. Limite de 4000 caracteres, hoje em
2086, então espaço não é problema.

| | Texto | Caracteres |
|---|---|---|
| Hoje | `O uso principal é gratuito e não pede cartão: cadastro de veículos, diagnóstico por sintoma, histórico de manutenção, aulas abertas e ferramentas básicas.` | 154 |
| Proposto (Play) | `O uso principal é gratuito e não pede cartão: até 2 carros na garagem, diagnóstico por sintoma, 20 serviços no histórico, aulas abertas e ferramentas básicas. Na versão gratuita do Android aparecem anúncios.` | 207 |
| Proposto (App Store) | igual, sem a frase dos anúncios (a Apple não tem AdMob no app) | 158 |

E a linha seguinte, que hoje não diz o que o Premium resolve:

| | Texto |
|---|---|
| Hoje | `...libera o acervo completo de conteúdo, relatórios de gasto, diagnóstico aprofundado e a assistente Biela sem limite.` |
| Proposto | `...libera garagem sem limite, o acervo completo de conteúdo, relatórios de gasto, diagnóstico aprofundado e a assistente Biela sem limite.` |

Os números não são estimativa, saem de `lib/app/premium.ts`: `freeCars: 2`,
`freeServices: 20`, `freeParts: 3`.

### O raciocínio

"Cadastro de veículos" lê-se como ilimitado. O app para no terceiro carro. Quem
baixa para organizar os carros da família ou da empresa descobre isso depois de
cadastrar, que é o pior momento possível: já investiu trabalho.

Isso não é teoria. **Uma avaliação desta quinzena já repete a informação errada
em público**: a Triplyze escreveu "bom que é grátis para 1 carro". A pessoa
gostou e mesmo assim saiu com a conta errada na cabeça, para menos. Duas das
cinco avaliações da Play falam em vários carros, frota e clínica. É o público
que mais esbarra no limite e é exatamente quem a ficha não avisa.

A regra 2 desta ficha já mandava fazer isso desde o começo: "o que o app NÃO faz
aparece, porque download frustrado vira nota 1 estrela". A regra estava escrita
e o bloco PREÇO nunca foi conferido contra o código.

O motivo de ser AGORA, e não numa rodada qualquer: são 8 avaliações, todas 5
estrelas. Uma nota 1 leva a média de 5,00 para 4,56; duas levam para 4,20. Com
amostra deste tamanho, evitar uma decepção vale mais do que atrair dois
downloads, e o custo dessa prevenção é uma frase.

### O que a proposta NÃO faz

Não mexe em preço nem em plano: os R$ 29,90 e R$ 239,90 ficam iguais, e o
limite de 2 carros já existe no app hoje. Isto é descrever o que já é, não
mudar o que é. Não mexe no título, que foi a proposta de 01/09 e ainda está em
leitura. Não cita nota nem depoimento na loja. E não entra no campo de
palavras-chave, embora `frota` seja candidato para a próxima rodada: hoje o
campo da Apple está proposto em 95 de 100 e não cabe sem tirar outro termo.

### O risco, dito na cara

Dizer "até 2 carros" pode afastar quem tem três e fecharia assinatura. É um
risco real, e a resposta honesta é que essa pessoa descobre o limite de
qualquer jeito, dez minutos depois, e aí já está irritada. O outro risco é a
frase dos anúncios: ela precisa bater com a declaração de anúncios no console
da Play. Conferência barata, uma tela: Play Console, Ficha da loja, seção
Anúncios, tem que estar marcado "Contém anúncios". Se estiver desmarcado, o
erro é a declaração, não a frase.

### Como saber se funcionou

Este é um conserto de expectativa, não de aquisição, então a métrica não é
instalação: é a ausência de uma nota baixa com a palavra "grátis", "pago" ou
"limite" dentro. A leitura é por exceção e roda sozinha nas próximas rodadas,
porque toda avaliação nova passa por aqui. Se o volume de instalação cair de
forma visível na mesma semana, aí sim a frase espantou gente, e isso aparece no
Play Console em Aquisição.

### A LINHA DE BASE, LIDA EM 03/10/2026 (e o que ela muda na proposta)

O dono abriu as telas. Os números, todos do Play Console:

| o quê | número | onde foi lido |
|---|---|---|
| taxa de conversão da ficha | **29,1%** (28 dias) | Páginas de detalhes do app, tabela da página padrão |
| a mesma, janela maior | 27,93% (90 dias) | visão geral de Crescimento |
| visitantes da ficha | 484 (28 dias) / 868 na página padrão | Páginas de detalhes do app |
| cliques de instalação de usuários únicos | 134 (28 dias) | idem |
| aquisições de dispositivos | 561 (28 dias) | visão geral de Crescimento |
| primeiros acessos por dispositivo | 158 (28 dias) | idem |
| público de instalação em 29/09 | 403 aparelhos, **98,51% Brasil** | Estatísticas, por país |

**A base de comparação para a troca da descrição curta é 29,1%**, e é contra ela
que os 14 dias depois vão ser lidos. Antes dela existir, a condição de volta
atrás escrita acima não tinha contra o que medir.

**E UM ACHADO QUE ENCOLHE ESTA PROPOSTA, sem derrubá-la.** 561 aquisições
contra 134 cliques de instalação a partir da ficha, nas duas janelas de 28 dias
que o painel oferece (deslocadas em uma semana, então isso é ordem de grandeza e
não conta exata): **cerca de três quartos das instalações não passam pela
ficha.** Campanha de app instala direto do anúncio. Então título, descrição
curta e palavras-chave mexem no quarto que chega na página, e não no todo.

Consequência prática para quem escrever a próxima proposta de ficha: o tamanho
do efeito possível é um quarto do que a conta ingênua sugeriria, e isso precisa
estar escrito NA proposta. Não muda o custo (a descrição curta continua mudando
sem release) nem a direção (economia é a palavra que 4 das 12 avaliações
repetem), muda a expectativa.

**A QUEBRA POR ORIGEM FOI LIDA NO MESMO DIA, E ELA NÃO EXISTE COMO A GENTE
SUPUNHA.** Em Estatísticas, a dimensão "Origem do tráfego" tem **exatamente duas
origens**: `Pagas e diretas` e `Não atribuído`. Não há linha de "Pesquisa do
Google Play", que é a que este arquivo vinha pedindo desde 01/09. Em 29/09 foram
48 pagas e diretas contra 6 não atribuídas, num total de 54 no dia.

Três consequências, e elas valem mais que a proposta que as gerou:

1. **O veredito do título de 01/09 está ENCERRADO, e não adiado.** A leitura que
   ele esperava não existe neste painel e não vai existir. Pela regra escrita em
   01/09, sem leitura o título FICA. Não volta como pendência em rodada nenhuma.
2. **A condição de volta atrás da descrição curta perde o critério fino** (a
   conversão da origem orgânica) e fica com a média, 29,1% hoje, com a ressalva
   de contaminação por tráfego pago escrita acima. É uma leitura mais fraca, e
   está dito que é.
3. **O ALVO DESTE PAPEL MUDA.** A busca orgânica da loja, se existe, está dentro
   de "Não atribuído", que foi 6 de 54 em 29/09. **E um segundo instrumento
   discorda do tamanho**: a AppsFlyer, na semana de 26/09 a 02/10, conta 51
   orgânicas em 162 atribuições, que é 31%. Os dois baldes não são a mesma
   coisa (o do Play junta anúncio com link direto; o da AppsFlyer chama de
   orgânico tudo que não casou com rede paga), então o honesto é a FAIXA: o
   orgânico está entre um décimo e um terço, e a maioria é paga pelos dois
   instrumentos. Somado aos três
   quartos de instalação que não passam pela ficha, o retrato é que **a loja hoje
   é quase inteiramente um destino de anúncio**. Enquanto isso durar, a alavanca
   da ficha é a CONVERSÃO de quem o anúncio manda, não a descoberta orgânica:
   as primeiras imagens, a primeira frase e a nota, e não a caça a palavra-chave.
   Isso não torna o trabalho de palavra inútil, põe ele atrás na fila.

### A condição de volta atrás

Se até a rodada de 15/10/2026 aparecer queda clara de instalação sem outra
explicação (campanha parada, versão nova, feriado), a frase dos anúncios sai
primeiro, que é a mais fácil de espantar, e o "até 2 carros" fica. O limite de
carros não volta a ser escondido: esconder foi o erro que esta proposta
conserta. Se aparecer nota baixa reclamando de limite mesmo COM o aviso, o
problema deixa de ser o texto e passa a ser o produto, e a conversa muda de
dono: vira assunto do CRO, não da ficha.

---

## 2026-10-01 · A palavra que os usuários mais repetem não está em nenhum campo forte

**Estado: ABERTA.** Só Google Play, e muda na hora, sem envio de versão.

### A troca, em tabela

Campo: descrição curta da Play. Limite de 80 caracteres. É o segundo campo de
maior peso na busca da Play e é o trecho que mais viaja para fora da loja
(aparece na listagem, no compartilhamento e no que um modelo de linguagem lê).

| | Texto | Caracteres |
|---|---|---|
| Hoje | `Entenda o barulho, a luz do painel e o orçamento antes de ir na oficina.` | 72 |
| Proposto | `Entenda o barulho, a luz do painel e o orçamento antes da oficina, e economize.` | 79 |

Se o console reclamar do tamanho, a alternativa com o mesmo sentido e um
caractere a menos é `Entenda o barulho, o painel e o orçamento antes de ir na
oficina, e economize.` (78), que troca "a luz do painel" por "o painel".

### O raciocínio

Agora existe voz de usuário suficiente para contar palavra, e foi o que eu fiz
nas 12 avaliações. Dois temas empatam na frente:

| Tema | Quantas avaliações | Quem |
|---|---|---|
| Economia (economizar, economia, gastos) | 4, sendo 3 de gente de fora | Triplyze, Biiaes, munizluiz, e o Moraes455 |
| Revisão e manutenção | 3 | Sorriso da Pele, Biiaes, munizluiz |
| Aprender (estudo, vídeo, conteúdo) | 2 | aminoru, Luana David |
| Mais de um carro (frota, clínica) | 2 | Mindmill Brasil, Sorriso da Pele |

Dos dois empatados, **manutenção já está no campo mais forte que existe**, o
título, desde 01/09. **Economia não está em nenhum campo indexado com peso**:
aparece só no meio da descrição completa, em "para quem quer economizar sem ser
enganado na oficina". A descrição curta, que é o segundo campo mais forte, fala
de sintoma (barulho, painel) e de orçamento, e não fala do desfecho.

E o desfecho é o que a pessoa escreve quando ela mesma resume o app: "consegui
economizar na revisão", "me fez economizar quase 40%", "Economia no bolso". Elas
não escrevem "entendi o barulho". Entender é o meio; economizar é o motivo.

A troca é deliberadamente a MENOR possível: a linha de hoje continua inteira,
na mesma ordem, e ganha duas palavras no fim. Nenhum substantivo indexado sai
(barulho, painel, orçamento e oficina ficam todos), então não há como esta
mudança piorar a busca por sintoma. O único custo de texto é "a luz do painel"
virar "antes da oficina" em vez de "antes de ir na oficina", que é a mesma
coisa dita com uma palavra a menos.

### O que a proposta NÃO faz

Não toca no título (a proposta de 01/09, que fica como está pelo veredito de
hoje). Não toca na descrição completa, onde mora a proposta de 15/09 sobre o
limite de 2 carros, que continua aberta e independente desta. Não cita nota nem
depoimento na loja. Não promete porcentagem: "economize" sem número é desfecho
possível, "economize 40%" seria promessa da empresa em cima da experiência de
uma pessoa.

### O risco, dito na cara

"Economize" é palavra de anúncio, e ficha que soa anúncio atrai quem quer
desconto e cupom, não quem quer entender o carro. Esse risco é real e é o motivo
de a palavra entrar NO FIM da frase, depois de a linha já ter dito o que o app
faz: quem lê os primeiros 60 caracteres continua recebendo a definição, não a
promessa. Se o efeito for atrair expectativa errada, ele aparece como avaliação
reclamando de preço ou de "não economizei nada", e essa leitura é a mesma da
proposta de 15/09.

### Como saber se funcionou, e o que atrapalha a leitura

A tela é Play Console, Ficha da loja, taxa de conversão da ficha (visitante que
vira instalação), comparando os 14 dias antes e os 14 depois da troca. A
descrição curta mexe em duas coisas ao mesmo tempo, busca e conversão, e a
conversão é a que dá para ler em duas semanas.

O que atrapalha, e precisa estar escrito antes de alguém comemorar: desde 20/09
a campanha de busca manda para a loja, e tráfego pago entra na mesma taxa de
conversão que o orgânico. Se a conversão subir junto com uma mudança de
campanha, não credite ao texto. O jeito de separar é olhar a conversão por
origem, na mesma tela.

### A condição de volta atrás

Se a taxa de conversão da ficha cair nos 14 dias depois da troca, volta a linha
de hoje, que está preservada na tabela acima para isso. Se ficar igual, FICA: a
palavra não custou nada e passa a trabalhar na busca. Se subir, a leitura segue
sendo frágil pelo motivo do parágrafo anterior, e o que vale como confirmação é
a conversão por origem orgânica, não a média.
