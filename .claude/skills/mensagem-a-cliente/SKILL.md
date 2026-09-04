---
name: mensagem-a-cliente
description: Como preparar e disparar e-mail ou push para clientes do Mentorque sem quebrar promessa nem mandar duas vezes. Use SEMPRE que a conversa envolver mandar e-mail para a lista, campanha, push, notificação, cupom em link de venda, Resend, taxa de abertura, aba Promoções, ou "avisar os usuários". Também ao mexer em qualquer rota que envie mensagem, e antes de dizer que uma mensagem "já foi". Mensagem a cliente não tem desfazer: sai errada, sai para todo mundo, e o dono é quem responde.
---

# Mandar mensagem para cliente

Isto não tem botão de desfazer. E-mail sai, chega, e a pessoa lê. Um link de
venda quebrado no meio de uma promessa de desconto vira frustração em quem já
tinha dito sim.

## A trava que vem antes de tudo

**Mandar qualquer coisa a cliente é alçada do dono, explicitamente.** Está no
`CLAUDE.md` junto com preço, cobrança, apagar dados e publicar nas lojas.

Preparar, escrever, revisar e deixar armado: pode. Disparar: só com ele
mandando. E "ele mandou ontem" não vale para hoje: cada disparo é uma decisão.

## As três travas de uma rota de envio

A `/api/email/lancamento` é o modelo. Copie a forma, não invente outra:

1. **`DADOS_CHAVE`**, como todo agregado da operação. Mandar mensagem é a porta
   que menos pode ficar aberta por esquecimento.
2. **Um sinalizador explícito no corpo** (`disparar: true`). Assim nenhum GET de
   navegador, rastreador ou pré-carregamento manda e-mail para ninguém.
3. **Marca no banco, por destinatário** (`waitlist.lancamento_enviado_em`). É a
   única que sobrevive ao caso real: o agendamento rodando de novo amanhã, a
   rede repetindo a chamada, alguém disparando duas vezes na dúvida.

**A marca é gravada logo depois de CADA envio, não uma vez no fim.** Se a rota
morrer no meio da lista, quem já recebeu está marcado e a segunda chamada
continua de onde parou, em vez de mandar tudo de novo.

**Quem já assina sai por consulta feita na hora do disparo**, e não por uma
lista escrita antes: entre escrever o e-mail e mandá-lo, alguém pode assinar.
Oferecer "seu primeiro mês é por nossa conta" para quem já pegou o mês grátis é
oferecer o que a pessoa já tem, e o link leva a um segundo checkout da mesma
assinatura.

**Teto de tempo da função.** O padrão do plano é 10 segundos e uma lista de 17
não cabe (cada envio tem pausa para respeitar o limite do provedor). Declare
`maxDuration`.

## O cupom, e por que ele falha calado

O modo de falhar é o que o torna perigoso: o Stripe recusa o código esgotado, a
nossa rota **refaz a sessão sem desconto de propósito** (para a compra não
morrer por causa do cupom), e a pessoa cai num checkout de preço cheio logo
depois de ler que o mês era por nossa conta. Ninguém vê erro.

Por isso, antes de qualquer disparo:

- **confira o teto contra o tamanho da lista.** `max_redemptions` **não é
  editável** no Stripe, nem no cupom nem no código promocional. Não dá para
  subir: o caminho é criar outro e desativar o antigo.
- **`applies_to` só pode ser definido na CRIAÇÃO**, e o Stripe não devolve esse
  campo na leitura. Cupom de convite nasce restrito ao produto certo ou nasce
  errado, e um código feito para valer R$ 29,90 vale R$ 239,90 no plano anual.
- o código fica visível no módulo do e-mail para essa conferência ser possível.

## O link de venda dentro do HTML

O `href` precisa dos `&` escapados como `&amp;`. Em HTML isso é ambíguo dentro
de atributo, e o que salva é só a tolerância do navegador, que acaba no dia em
que alguma coisa **reescreve** o link (é o que o rastreio de clique do provedor
faz: lê o HTML, extrai a URL e monta outra).

Não é formatação: a query é `assinar` e `cupom`, ou seja, é o que abre o
checkout com o mês grátis. O texto puro é o contrário, usa `&` normal, senão a
pessoa vê `&amp;` na cara.

E o link leva UTM (`utm_source=email&utm_campaign=<qual>`), que é o que permite
medir o clique até a venda sem depender do provedor. A convenção está em
`docs/utms.md`.

## Número dentro de e-mail envelhece calado

O texto nasceu dizendo "101 aulas" e três dias depois o catálogo tinha 103.
Número escrito à mão envelhece contra nós, prometendo menos do que o app
entrega.

**Conte na hora do disparo, do próprio catálogo**, já descontando o que está
agendado: prometer uma aula que ainda não estreou é a mesma quebra que a trava
de agendamento existe para evitar.

## Antes de disparar, sem exceção

1. **O dono recebe a cópia de prova primeiro, e abre no celular.** As imagens
   vêm do site, e imagem quebrada não tem conserto depois de enviada.
2. **Alguém clica no botão de verdade**, até a tela de pagamento, e confere que
   o desconto aparece. É o teste que prova o cupom de pé. Não conclua a compra:
   o cupom tem teto.
3. **Confira quem sai da lista** por já assinar.

## O horário, e por que não é cron da Vercel

No plano atual o cron da Vercel dispara em algum momento **dentro** da hora
marcada. Se o pedido foi "20h", isso vira "entre 20h e 21h".

O agendador do n8n é exato. O gatilho lá é diário porque ele não agenda uma vez
só, e o que torna isso seguro é a marca no banco. **Desligue o workflow depois
de conferir o envio:** workflow ativo apontando para uma rota que manda
mensagem a cliente não é coisa para ficar viva por esquecimento.

## Depois: o que os números querem dizer

**Clique é sinal, abertura é estimativa.** O Apple Mail pré-carrega imagens por
privacidade e marca "aberto" sem ninguém olhar; o Gmail serve por proxy. Com
lista pequena, uma abertura muda a porcentagem em vários pontos.

**A aba Promoções não é spam.** É entregue e as pessoas abrem. E o Gmail acerta:
botão grande, banner com marca, cupom e "grátis" são um e-mail promocional. Não
existe cabeçalho que force a caixa Principal; para cair lá o e-mail precisa
**ser** outro tipo de mensagem, curto e pessoal, com link inline em vez de
botão. É uma troca real: desenho bonito nas Promoções, ou texto simples na
Principal. Com lista pequena, o texto simples costuma ganhar.

**O resgate do cupom é o medidor que ninguém bloqueia.** Sai do Stripe, não
depende de pixel, de UTM, de bloqueador nem de aba. Se ele subir, funcionou.

**No Resend, abertura e clique são configuração de DOMÍNIO**, não do envio.
Desligados, os eventos não existem e não dá para recuperar depois. Com
subdomínio próprio de rastreio, os links reescritos continuam com a nossa cara.

## O que a etiqueta não atravessa

Quem clica no selo da loja e instala o app **perde a etiqueta**: a loja não
repassa UTM. Então a medição vale para quem usa pelo navegador e subestima quem
baixa. Fechar essa ponte é outro assunto (`docs/atribuicao.md`).
