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
Mentorque: cuidar do carro
```

PENDENTE de troca para `Mentorque: manutenção do carro`, junto com as
palavras-chave. Na Apple, nome, subtítulo e palavras-chave só mudam com o
envio de uma versão. A metade da Play já foi aplicada em 01/09.

**A janela é a 2.6, e ela está aberta agora (15/09).** A 2.5 foi aprovada e
saiu da fila, a 2.6 está pronta e ainda não foi enviada
(`docs/lojas/novidades-2.6.md`). Nome e palavras-chave se digitam na mesma
tela do envio, então isto custa dois minutos SE for lembrado na hora. Se a 2.6
subir sem essa troca, a metade da Apple espera mais uma versão inteira. E já
perdeu envio: a 1.6 foi aprovada nas duas lojas em 01/09 e a 2.5 foi aprovada
em 15/09, as duas sem levar o nome novo junto. Não é urgente, é só barato
agora e caro depois.

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
01/09/2026. Nome e palavras-chave da Apple continuam abertos e entram no
próximo envio de versão.

**Quando reler, e o que fazer:** duas rodadas depois da troca, ou seja na
rodada de 01/10/2026. Se a origem "Pesquisa do Google Play" continuar em zero
ou só trouxer busca por marca, a palavra não é o gargalo e a conclusão é que o
problema está antes da ficha, na falta de gente chegando. Nesse caso o título
FICA como está (não se volta para `cuidar`, que era pior pelo mesmo
raciocínio) e a próxima proposta muda de assunto, não de palavra.

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

**Estado: ABERTA.** Vale para a Play (aplicável na hora) e para a App Store
(entra junto com o próximo envio, hoje a 2.6).

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

### A condição de volta atrás

Se até a rodada de 15/10/2026 aparecer queda clara de instalação sem outra
explicação (campanha parada, versão nova, feriado), a frase dos anúncios sai
primeiro, que é a mais fácil de espantar, e o "até 2 carros" fica. O limite de
carros não volta a ser escondido: esconder foi o erro que esta proposta
conserta. Se aparecer nota baixa reclamando de limite mesmo COM o aviso, o
problema deixa de ser o texto e passa a ser o produto, e a conversa muda de
dono: vira assunto do CRO, não da ficha.
