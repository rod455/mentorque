# E-mail de lançamento para a lista de espera

**Não enviado.** Mensagem a cliente é decisão do dono. Os dois bloqueios que
existiam (o teto do cupom e a landing de pré-lançamento) foram resolvidos em
03/09; falta o seu aval no texto e o disparo.

O texto vive em `lib/email/lancamento.ts`, nos dois idiomas, no mesmo formato
do e-mail de boas-vindas.

## Quem vai receber

18 na tabela, mas **17 recebem**. Todas vindas da landing, cadastradas entre
13/08 e 01/09. Dezesseis em português, uma em inglês. Três já têm conta no app.

**Tirar da lista: `eng.avilanova@gmail.com`.** Ele já assina (em teste, plano
mensal, e com cupom). Mandar "seu primeiro mês é por nossa conta" para quem já
tem o mês grátis é oferecer o que a pessoa já pegou, e o link levaria a um
segundo checkout da mesma assinatura.

```sql
-- quem recebe
select w.email, w.locale from waitlist w
where lower(w.email) not in (
  select lower(u.email) from auth.users u
  join subscriptions s on s.user_id = u.id
  where s.status in ('active','trialing')
)
order by w.created_at;
```

## Os dois bloqueios, resolvidos em 03/09

### 1. O cupom: teto de 25, e por que ele é um cupom NOVO

O pedido foi "subir para 25 usos". **Não dá para subir**: no Stripe,
`max_redemptions` não é editável, nem no cupom nem no código promocional. A
própria documentação da rota de atualização diz que os detalhes do cupom são,
por desenho, não editáveis. Então o caminho é substituir.

O que foi criado em 03/09:

| o quê | id | teto |
|---|---|---|
| cupom | `MENSAL-LANCAMENTO100-25` | 25 |
| código | `LANCAMENTO1MES` | 25 |

100% de desconto, `duration: once`, e **preso ao produto mensal**
(`applies_to.products`), que é a armadilha registrada na
`/api/stripe/checkout`: `applies_to` só pode ser definido na CRIAÇÃO, o Stripe
não devolve esse campo na leitura, e sem ele um código feito para valer
R$ 29,90 valeria R$ 239,90 no plano anual.

O código antigo `PREMIUM1MES` continua ativo com 9 usos: o MCP do Stripe não
expõe a operação que desativa código promocional. Ele não atrapalha (dá o mesmo
benefício, no mesmo plano), mas convém desativar no painel para não existirem
dois códigos vivos para a mesma coisa.

### 2. A landing: liberada no mesmo commit

`APP_STORE_PUBLICADO` e `PLAY_STORE_PUBLICADO` viraram `true`, e a página foi
reescrita junto. Os dois andam amarrados de propósito, e está escrito em
`lib/stores.ts`: virar o interruptor sem reescrever o texto faria a página
anunciar download no meio de "acesso antecipado" e "antes de chegar às lojas".

O que mudou na home:

- o formulário de lista de espera saiu do topo e do rodapé, e no lugar dele
  ficaram os selos das lojas mais um link discreto de usar pelo navegador;
- a barra de "vagas do lote de fundadores", cheia em 82%, saiu. O número era
  inventado e a frase ("encerra no lançamento") virou falsa quando o lançamento
  aconteceu. Escassez que a própria página desmente não pressiona ninguém, só
  ensina o leitor a não acreditar no resto;
- as vantagens de fundador viraram o que o plano gratuito faz de verdade, tirado
  da tabela de planos do app;
- as duas perguntas do FAQ sobre "entrar na lista" e "quando o app fica
  disponível" viraram "como faço para começar" e "o app já está disponível".

## As duas decisões de conteúdo, e o porquê

**O cupom só vale na web, e o e-mail assume isso.** O código é do Stripe. A
compra dentro do app das lojas passa pela Apple ou pela Play, onde não existe
onde digitar cupom. Se o e-mail dissesse "baixe o app e use o cupom", metade
das pessoas iria para o lugar onde a promessa não se cumpre.

Por isso a ordem é: botão grande para assinar no site com o desconto já
aplicado, e só depois as lojas, com a frase que explica a ordem ("o Premium é
da conta, não do aparelho"). Um segundo botão grande competindo com o primeiro
dividiria o clique entre assinar e baixar, e o que precisa acontecer primeiro é
assinar.

**O preço do segundo mês está no corpo, não em letra miúda.** "Primeiro mês por
nossa conta" sem dizer o que vem depois é a receita do estorno e da avaliação
de uma estrela. O e-mail diz o valor e o "cancela quando quiser" logo abaixo do
botão.

## O texto (português)

**Assunto:** O Mentorque saiu, e o seu primeiro mês é por nossa conta
**Prévia:** Já está na App Store e na Google Play. Seu cupom está aqui dentro.

> **A garagem abriu**
>
> Oi!
>
> Você entrou na lista de espera do Mentorque quando ele ainda era promessa.
> Ele saiu: está publicado na **App Store** e na **Google Play**, e você é uma
> das primeiras pessoas a saber.
>
> **O QUE DÁ PARA FAZER LÁ DENTRO**
> - Cadastrar seu carro e ver o plano de revisão dele, por data e por
>   quilometragem
> - Descrever um barulho ou uma luz no painel e receber a causa provável, com o
>   preço justo antes de você chegar na oficina
> - Perguntar qualquer coisa ao Biela, que é o mecânico de plantão, a qualquer
>   hora
> - 101 aulas de mão: quando fazer, como saber que já passou da hora e o que o
>   atraso cobra depois
> - A pergunta do dia: um minuto, uma pergunta, e a explicação do porquê da
>   resposta
>
> **Seu primeiro mês é por nossa conta**
>
> O cupom **LANCAMENTO1MES** já vem aplicado no botão abaixo. Ele cobre o primeiro
> mês do plano mensal.
>
> [ **Ativar meu mês grátis** ]
>
> Passado o primeiro mês, são R$ 29,90 por mês, e dá para cancelar quando
> quiser, pelo próprio app.
>
> ---
>
> Depois é só baixar o app e entrar com a mesma conta. O Premium é da conta,
> não do aparelho, então ele vai junto para o celular.
>
> **BAIXAR O APP**
> [ App Store ]  [ Google Play ]
>
> ┌─────────────────────────────────────────────────────────────┐
> │ **Quer testar o grátis antes do Premium? Não tem problema**  │
> │                                                             │
> │ Sério, não tem. Registrar seus serviços, diagnóstico por     │
> │ sintoma e lembretes de revisão estão no plano gratuito, sem  │
> │ cartão e sem prazo. Baixe, use o tempo que quiser, e o botão │
> │ lá de cima continua aqui para o dia em que você quiser o     │
> │ resto.                                                       │
> └─────────────────────────────────────────────────────────────┘
>
> Rodrigo, Mentorque

**Por que a porta do grátis fica no fim e não no começo**: oferecer o plano
gratuito antes do Premium enfraqueceria o convite que é o motivo do e-mail, e
escondê-lo faria quem não quer assinar agora simplesmente fechar a mensagem.
No fim ele funciona como rede: quem leu tudo e não clicou no botão âmbar ainda
encontra um caminho para entrar, em vez de sair de mãos vazias.

**E ele é verdade conferida, não gentileza.** O que está escrito ali sai da
tabela de planos do próprio app (`content.ts`): registrar serviços é completo
no grátis, diagnóstico por sintoma e lembretes de revisão vêm limitados, e
saúde por sistema, plano de revisão, Biela ilimitado e a biblioteca completa
são Premium. Prometer no e-mail um grátis maior do que o do app seria comprar
uma decepção na primeira abertura.

Endereço do botão, com a campanha marcada para o funil separar esta lista de
qualquer outra origem:

```
https://www.mentorque.com.br/app?assinar=mensal&cupom=LANCAMENTO1MES&utm_source=email&utm_campaign=lista-espera
```

A versão em inglês está no mesmo arquivo, para a única pessoa com `locale=en`.

## Antes de enviar

1. **Você recebe o primeiro.** Disparar para o seu e-mail antes de tudo e abrir
   no celular: as imagens da faixa vêm do site, e imagem quebrada em e-mail não
   tem conserto depois de enviado.
2. **Clicar no botão de verdade**, até a tela de pagamento, e conferir que o
   desconto aparece aplicado. É o teste que prova o cupom novo de pé.
3. Conferir se algum dos 17 já assina, para não oferecer desconto a quem já
   paga:
   ```sql
   select w.email from waitlist w
   join auth.users u on lower(u.email) = lower(w.email)
   join subscriptions s on s.user_id = u.id
   where s.status in ('active','trialing');
   ```

## Depois de enviar

O funil separa esta lista sozinho, pela campanha:

```sql
select evento, count(*), count(distinct anon_id)
from funil_eventos
where extra->>'utm_campaign' = 'lista-espera'
group by 1;
```

E a conta de vendas com cupom sai da coluna `subscriptions.cupom`, sem depender
do Stripe.
