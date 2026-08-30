# Novidades da versão 1.5

Versão de conserto e de clareza no Calendário. Diferente da 1.4 (que era
invisível para o usuário), esta tem mudança que dá para ver e vale contar.

---

## Google Play

**Novidades desta versão** (limite: 500 caracteres)

```
O Calendário agora diz QUANDO cada serviço cai: a data prevista, quantos
km faltam e de onde vem a regra. Quando dois ou três caem por perto, ele
sugere um dia só de oficina.

Consertos: carro usado sem histórico não aparece mais com revisões
"vencidas" que nunca existiram; o nome dos serviços parou de cortar na
tela; e o botão voltar não fecha mais o app quando dá para voltar.
```

---

## App Store

**Novidades desta versão**

```
O Calendário agora diz QUANDO cada serviço cai: a data prevista, quantos
km faltam e de onde vem a regra do manual. Quando dois ou três serviços
caem por perto, ele sugere um dia só de oficina, para você não perder
duas manhãs.

Também consertamos: quem cadastra um carro usado sem histórico não vê
mais revisões marcadas como "vencidas" que nunca existiram (agora elas
aparecem como estimativa, com o convite para você registrar a última), e
o nome dos serviços parou de ser cortado na tela.
```

---

## Antes de enviar

- Os rótulos de privacidade das duas lojas continuam os mesmos da 1.4
  (nada mudou no que o app coleta). O que declarar está em
  `docs/atribuicao.md`.
- Teste de aparelho novo desta versão: cadastrar um carro usado com km
  alto e SEM histórico, abrir Próximas revisões e conferir que nada
  aparece como "Vencida"; e apertar o voltar do Android depois de trocar
  de aba, conferindo que volta para a aba anterior em vez de minimizar.
- Depois de publicar, bumpar `/api/app/latest` para o versionCode 13 e
  para o build iOS que o log do Codemagic imprimir.
