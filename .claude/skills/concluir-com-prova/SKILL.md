---
name: concluir-com-prova
description: Como diagnosticar sem inventar causa. Use SEMPRE que estiver investigando um defeito relatado, explicando por que algo não funcionou, decidindo o que consertar, ou prestes a escrever uma frase que comece com "a causa é", "o que aconteceu foi" ou "isso acontece porque". Também quando um número parecer estranho, quando duas fontes discordarem, e antes de subir qualquer conserto que você não conseguiu reproduzir. Nesta casa, diagnóstico errado dito com confiança já custou builds inteiros e consertos de defeitos que não existiam.
---

# Concluir com prova

Diagnóstico errado não é só inútil: ele gasta o tempo do dono, produz consertos
de coisas que não estavam quebradas e, pior, deixa o defeito real de pé enquanto
todo mundo comemora.

Em 03/09, numa única noite, eu conclui errado três vezes seguidas sobre o mesmo
problema. As três conclusões eram plausíveis, bem argumentadas e falsas. Este
arquivo existe para que a próxima rodada não repita a sequência.

## A pergunta que evita quase tudo

**"Se eu estivesse errado, o que eu estaria vendo?"**

Se a resposta for "exatamente o que estou vendo agora", você tem uma hipótese
que combina com os dados, e não uma conclusão. Combinar não é provar: várias
histórias diferentes combinam com o mesmo sinal fraco.

Aquela noite, "os eventos estão sem etiqueta" combinava com três causas
diferentes: a query da campanha não chegou, a captura não funciona, ou **a minha
consulta procurou no lugar errado**. Era a terceira, e eu não a considerei
porque as outras duas explicavam o que eu via.

## Suspeite primeiro do seu próprio instrumento

Antes de concluir que o sistema está quebrado, confira a ferramenta que você
usou para olhar.

Sinal clássico: **um resultado zerado ou nulo em 100% dos casos.** Sistemas
raramente falham de forma tão perfeita. Consulta com caminho errado, sim.

O mesmo vale para o inverso: quando você "consertar" algo e o problema
continuar, a chance de o conserto ter sido no lugar errado é alta.

## Separe "não sei" de "não tem"

Muitos erros nascem de tratar ausência de informação como informação.

- `user` nulo pode ser "não tem sessão" **ou** "a sessão ainda está carregando".
  Confundir os dois quebrou o link de venda depois do login social.
- Evento que não aparece pode ser "não aconteceu" **ou** "não foi medido".
- Zero conversões pode ser "ninguém quis" **ou** "o caminho está quebrado".

Sempre que um valor puder significar as duas coisas, descubra qual antes de
seguir. Costuma haver um campo que separa (`ready`, um contador, um erro
registrado) e ele costuma já existir.

## Distinga defeito de medição de defeito de comportamento

Quando um número for absurdo (0 de 10, 100% de queda), a pergunta certa é: **o
evento deixou de acontecer, ou deixou de ser gravado?**

Como separar, e é barato:
- leia onde o evento nasce e veja se há caminho específico de plataforma;
- procure erro registrado na janela (`app_erros`);
- compare com uma população que deveria se comportar igual.

### ~~Em 04/09 a web tinha 0 de 10 no onboarding e o app das lojas 5 de 7. Conferi as duas hipóteses antes de falar. Era comportamento.~~

**Isto estava errado, e o modo de errar é o assunto desta seção.** Escrito em
04/09 de manhã, desmentido no mesmo dia à tarde. Os números certos eram 16 de 0
na web contra 17 de 27 nas lojas, e a conclusão "é comportamento" apoiava-se em
duas provas que não provavam nada:

- **"o portão de emissão é um só, sem caminho de plataforma".** Verdade, e
  irrelevante: o evento de saída pode simplesmente nunca ser alcançado.
- **"não há erro em `app_erros`".** Esta era a pior. O `vigiarErros()` era
  chamado dentro do Shell, e o Shell só existe DEPOIS do onboarding. A tabela
  estava vazia porque **ninguém estava olhando**, e eu li o silêncio como boa
  notícia.

**Tabela de erros vazia só é prova se alguém provar que o coletor estava ligado
naquela tela.** Ausência de registro é ausência de informação até que se mostre
o contrário, que é a regra da seção anterior aplicada ao próprio instrumento.

A pergunta que teria pego: *o que precisaria ser verdade para esse zero
significar "está tudo bem"?* Precisava de um coletor de pé naquela tela. Ninguém
tinha conferido isso. Verificar custou uma leitura de importações.

## Reproduza antes de consertar

Conserto sem reprodução é aposta com o nome de conserto.

Quando não der para reproduzir, **diga isso em voz alta** e trate o conserto
como hipótese: "isto endereça a causa mais provável, e eu não consegui
reproduzir". O dono decide melhor sabendo disso do que recebendo confiança
falsa.

E o caminho mais rápido para reproduzir costuma ser perguntar. Naquela noite eu
girei quarenta minutos em análise estática. A frase do dono, "deslogado dá pau,
logado funciona", cortou o problema no meio em dez segundos. **Uma pergunta bem
escolhida vale mais que uma hora de leitura de código.** Escolha a pergunta cuja
resposta divide as hipóteses ao meio, e peça só ela.

## Quando errar, corrija no lugar

O diário é memória compartilhada. Linha errada que fica intacta vira verdade
para outro agente daqui a um mês.

Corrija **onde foi escrito**, com o texto original riscado e a correção embaixo,
e não só numa entrada nova. E diga o que a conclusão errada tinha de plausível:
é isso que impede a próxima rodada de cair igual.

## O resumo

1. Pergunte o que você veria se estivesse errado.
2. Desconfie do instrumento antes do sistema.
3. Não confunda "não sei" com "não tem".
4. Separe medição de comportamento com duas checagens baratas, e confira que
   cada checagem estava mesmo ligada antes de aceitar o silêncio dela.
5. Reproduza, ou admita que não reproduziu.
6. Prefira uma pergunta certa a uma hora de dedução.
