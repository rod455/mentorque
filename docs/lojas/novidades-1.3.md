# Novidades da versão 1.3

Texto pronto para colar no campo "Novidades desta versão" das duas lojas.

A manchete é o conserto dos lembretes, dito sem drama técnico: a pessoa não
precisa saber de proxy nem de promessa, precisa saber que agora o aviso chega.
O login social NÃO entra: nunca esteve quebrado, e anunciar conserto do que
funcionava planta dúvida de graça.

---

## Google Play

**Título curto**

Lembretes consertados, ano no seletor de carro e calendário com nome

**Novidades desta versão** (limite: 500 caracteres)

```
Lembretes consertados: o aviso da pergunta do dia e o do fim do teste
grátis não estavam sendo agendados. Agora chegam de verdade. Se você
liga os avisos no Perfil, o lembrete das 9h passa a aparecer.

O seletor de carro no topo mostra o ano de cada veículo: quem tem dois
parecidos bate o olho e sabe qual é.

O Calendário diz de qual carro ele é: "Calendário do seu Polo".

Ajustes de espaço na barra de cima em telas menores.
```

Contagem: 437 caracteres (limite 500).

---

## App Store

**Novidades desta versão** (limite: 4000 caracteres)

```
Lembretes consertados
O aviso da pergunta do dia e o do fim do teste grátis não estavam sendo
agendados por um defeito técnico, mesmo com o interruptor ligado. Está
consertado: quem liga os avisos no Perfil passa a receber o lembrete das
9h e o aviso antes do fim do teste. Se você já tinha ligado e nada
chegava, abra o app uma vez depois de atualizar e ele reagenda sozinho.

Seletor de carro com o ano
No topo da tela, cada veículo aparece com o ano ao lado do nome. Quem tem
dois carros do mesmo modelo, ou apelidos parecidos, escolhe sem precisar
abrir a garagem para conferir.

Calendário com nome
O título da aba Calendário agora diz de qual carro ele é: "Calendário do
seu Polo". Com a troca de carro no topo, fica claro o que a tela está
mostrando.

Ajustes
Melhor uso do espaço na barra de cima em telas menores: nada fica coberto
nem cortado.
```

---

## Antes de enviar (regra desta release)

O conserto dos lembretes foi provado por leitura de código e pelos erros
registrados nos aparelhos, mas a regra que ficou da 1.2 é que conserto de
plugin se confere em aparelho DE VERDADE antes de ir para a loja:

1. instalar o build de teste (TestFlight / faixa interna da Play);
2. ligar os avisos no Perfil e conferir que o sistema pede permissão;
3. conferir que o lembrete das 9h aparece agendado (ou mudar a hora do
   aparelho para o dia seguinte e ver o aviso chegar);
4. entrar com o Google uma vez, só para confirmar que segue de pé.

Sem os quatro passos verdes, não envia.
