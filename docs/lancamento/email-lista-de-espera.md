# E-mail de lançamento para a lista de espera

**Não enviado.** Mensagem a cliente é decisão do dono, e além do texto há dois
bloqueios que precisam ser resolvidos ANTES do disparo, senão o e-mail funciona
para os primeiros e falha calado para o resto.

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

## Os dois bloqueios

### 1. O cupom tem teto de resgates, e ele é menor que a lista

Situação no Stripe hoje:

| código | cupom | o que dá | resgatados | teto | sobram |
|---|---|---|---|---|---|
| `PREMIUM1MES` | MENSAL-LANCAMENTO100 | 1 mês grátis, plano mensal | 1 | 10 | **9** |
| `ALESSANDRO1MES` | MENSAL-ALESSANDRO100 | 1 mês grátis, plano mensal | 2 | 10 | **8** |
| `PREMIUM30` | ANUAL-LANCAMENTO30 | 30% no primeiro ano, plano anual | 0 | 10 | 10 |

São 17 pessoas e 9 resgates. **Do décimo clique em diante o desconto não é
aplicado**, e o pior é COMO ele falha: o Stripe recusa o código esgotado, a
nossa rota refaz a sessão sem desconto (de propósito, para a compra não morrer
por causa do cupom), e a pessoa cai num checkout de R$ 29,90 logo depois de ler
"por nossa conta". Ninguém recebe erro; só o preço cheio.

**Recomendação**: subir o teto do `PREMIUM1MES` para 25 antes de enviar. Vinte
e cinco e não dezessete porque alguém encaminha o e-mail, e um resgate a mais
custa um mês de assinatura enquanto um cupom estourado custa a pessoa.

Isso é mexer em cupom, então é sua chamada. Uma linha no painel do Stripe, ou
eu faço pela API se você autorizar.

### 2. A landing ainda está escrita para pré-lançamento

`lib/stores.ts` tem `APP_STORE_PUBLICADO = false` e `PLAY_STORE_PUBLICADO =
false`. Os endereços das lojas já são reais (o e-mail usa eles), mas a página
inicial do site continua falando em "acesso antecipado", "lote de fundadores" e
"antes de chegar às lojas".

O e-mail foi escrito para contornar isso: **nenhum botão dele leva à home**. O
principal vai direto ao checkout com o cupom, e os outros dois vão às fichas
das lojas. Mesmo assim, quem for curioso e digitar mentorque.com.br vai ler que
o app ainda não saiu, no mesmo dia em que recebeu um e-mail dizendo que saiu.

Não impede o envio. Impede que ele seja bom.

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
> O cupom **PREMIUM1MES** já vem aplicado no botão abaixo. Ele cobre o primeiro
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
https://www.mentorque.com.br/app?assinar=mensal&cupom=PREMIUM1MES&utm_source=email&utm_campaign=lista-espera
```

A versão em inglês está no mesmo arquivo, para a única pessoa com `locale=en`.

## Antes de enviar

1. **Subir o teto do `PREMIUM1MES` para 25** (bloqueio 1). Sem isso, nove
   pessoas recebem uma promessa que o checkout não cumpre.
2. **Você recebe o primeiro.** Disparar para o seu e-mail antes de tudo e abrir
   no celular: as imagens da faixa vêm do site, e imagem quebrada em e-mail não
   tem conserto depois de enviado.
3. **Clicar no botão de verdade**, até a tela de pagamento, e conferir que o
   desconto aparece aplicado. É o teste que prova o bloqueio 1 resolvido.
4. Conferir se algum dos 18 já assina, para não oferecer desconto a quem já
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
