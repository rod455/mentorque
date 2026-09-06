# Agente das peças de rede social

Gera a arte de Instagram escrevendo por cima das chapas da marca, manda no
Telegram e espera o dono aprovar. Nada é publicado sozinho.

## A divisão de trabalho, e por que ela é assim

| Quem | Faz |
| --- | --- |
| **A nossa rota** `/api/pecas` | escolhe o texto e devolve o PNG pronto |
| **O n8n** | conversa no Telegram, guarda o que foi recusado, manda a imagem |
| **O dono** | aprova, pede outra, ou pede outra seção |

O Telegram fica no n8n de propósito. O token do bot já mora lá, junto com os
outros segredos, e assim ele não passa pelo nosso repositório nem pelos envs da
Vercel. A rota não sabe o que é Telegram, e é bom que não saiba.

## A conversa que o dono desenhou

```
dono:    faça uma imagem da Curiosidade da semana
agente:  [imagem]  Curiosidade da semana
                   "Carro parado na garagem sofre menos?"
                   fonte: quiz:carro-parado-tempo
                   [Aprovar]  [Outra]
dono:    Outra
agente:  [imagem]  ... outro candidato, o anterior não volta
```

## As chamadas

Tudo em `https://www.mentorque.com.br/api/pecas`.

**A imagem:**

```
GET /api/pecas?secao=curiosidade&formato=stories
```

- `secao`: `desafio`, `dica`, `curiosidade` ou `pergunta`
- `formato`: `feed` (1080x1080) ou `stories` (1080x1920)
- `pular`: fontes já recusadas, separadas por vírgula

Devolve `image/png`. **O cabeçalho `x-peca-fonte` diz qual candidato veio**, e é
ele que o n8n guarda para mandar no `pular` da próxima chamada. Sem isso, pedir
outra devolveria a mesma: a rotação é determinística de propósito, para que
regerar depois de uma correção não troque a peça por baixo.

**O texto, para montar a legenda:**

```
GET /api/pecas?secao=curiosidade&json=1
```

Devolve `{ nome, secao, titulo, corpo, opcoes, destaque, fonte }`.

**Quando acabam os candidatos:** `409` com `{ "erro": "acabaram os candidatos
de ..." }`. O n8n deve mostrar isso ao dono, não tentar de novo.

## O fluxo no n8n

1. **Telegram Trigger** ouve a mensagem.
2. **Um nó de código** lê a seção pedida da frase e mantém a lista de fontes já
   recusadas naquela conversa.
3. **HTTP Request** para `/api/pecas?...`, com `Response Format: File`.
4. **Telegram → Send Photo**, com a legenda montada do `json=1` e dois botões de
   callback: `aprovar` e `outra`.
5. **Switch** no callback: `outra` volta ao passo 3 com o `pular` acrescido;
   `aprovar` encerra e avisa que está liberada para publicação.

O `x-peca-fonte` sai nos headers da resposta do passo 3. No n8n é
`{{ $response.headers['x-peca-fonte'] }}` quando "Include Response Headers"
estiver ligado.

## O enquadramento, que veio dos exemplos

Os quatro exemplos que o dono mandou estão em `assets/pecas/exemplos/`, com um
LEIA-ME próprio. Eles são o alvo, e mudaram uma coisa importante.

**O título é mais largo que o corpo.** O LEIA-ME das chapas declara uma coluna
por arquivo (405px na curiosidade, por exemplo). Esse número é o pior caso da
chapa inteira: a altura em que a Biela avança mais para a esquerda. Só que ela
não é um retângulo. Em cima da cabeça dela sobram 634px de quadro vazio.

Então cada chapa tem duas faixas: a larga do topo, onde só o título entra, e a
estreita, para a citação, o corpo e as opções, que descem ao lado da Biela.

Quem prova que as duas estão livres é a `conferir:pecas`, que abre o PNG e mede
(`lib/pecas/silhueta.ts`, um leitor de PNG em Node puro). Isso importa porque a
v2 das chapas vem "mantendo os mesmos nomes de arquivo": o desenho troca por
baixo e nenhum número muda. A conferência mede a chapa nova e reprova sozinha.

**Título comprido não usa a faixa larga.** Se ele não terminar antes do corte,
desceria por cima da Biela. Nesse caso a peça é desenhada na coluna estreita,
que é livre até embaixo. Quem decide é a medição, uma vez, e grava em
`lib/pecas/cabem.ts`. Os dois desenhistas obedecem.

## O que o agente NÃO faz

- **Não publica.** Publicar em rede social é decisão do dono, e a peça aprovada
  volta como arquivo para ele postar. A regra da casa vale aqui.
- **Não escreve texto.** O conteúdo sai do banco de 60 perguntas do quiz, que já
  passou por revisão com regra própria: sem número inventado, sem certeza
  mecânica absoluta. O LEIA-ME das chapas proíbe número inventado, e texto
  revisado uma vez vale mais que texto novo toda semana.
- **Não desenha o que não cabe.** Ver abaixo.

## A régua é uma só, e isso custou um susto

Existem dois desenhistas: o `scripts/pecas.mjs`, em Chromium, para ver
localmente, e o `next/og` da rota, que é o que responde ao n8n porque Chromium
não roda numa função da Vercel.

Satori, que é o motor do `next/og`, não é um navegador: mede diferente. Na
primeira chamada real a rota desenhou uma peça que o script tinha recusado, e
saiu título por cima das opções.

Agora **quem mede é o script**, com navegador de verdade:

```
npm run pecas -- --medir
```

Ele desenha cada candidato e grava o veredito em `lib/pecas/cabem.ts`, que é
versionado e gerado, não editado à mão. **A rota não mede nada: obedece.** A
`npm run conferir:pecas` cobra o frescor desse arquivo, porque ele envelhece em
silêncio: pergunta nova no banco nunca viraria peça, e peça que deixou de caber
continuaria sendo escolhida.

Rode o `--medir` de novo quando o banco do quiz mudar ou quando as chapas forem
trocadas.

**A medição olha os dois lados da caixa.** Ela começou olhando só a altura, e
saiu uma dica escrita "BALANCEAMENTC": a palavra era mais larga que a coluna e
o `overflow: hidden` cortou a última letra, sem nada reprovar. Peça cortada
parece pronta, que é o pior tipo de defeito. Agora largura também reprova.

## O que está aberto

**O que não cabe é o CORPO, não o título.** A faixa larga resolveu a manchete e
não resolveu isto: o "porque" do banco do quiz tem de 150 a 280 caracteres, e
nos exemplos do dono o corpo tem uns 120. A conta é essa, e ela aparece nas duas
seções que carregam o porquê inteiro.

O que cabe hoje:

| Seção | Feed | Stories |
| --- | --- | --- |
| desafio | 43 | 63 |
| dica | 30 | 2 |
| pergunta da comunidade | 4 | 0 |
| curiosidade | **0** | **0** |

A pergunta da comunidade caía de 63 para 4 porque ela deixou de ser uma pergunta
solta e passou a ser pergunta mais resposta mais porquê, como no exemplo. O
desafio perdeu duas para a conferência de largura, que antes as deixava passar
cortadas.

Quatro saídas, e a escolha é do dono: esperar a v2 das chapas que ele já pediu
(com a Biela empurrada para a direita, o que alarga a coluna), escrever uma
linha curta por curiosidade, cortar o porquê na primeira frase (o que precisa de
revisão dele, porque várias começam pelo mito), ou publicar as seções que cabem.

**A "pergunta da comunidade" não tem fonte própria.** O certo seria vir de
pergunta feita por gente de verdade, e a conversa com a Biela não fica
arquivada por decisão de privacidade. Por ora ela usa uma pergunta do quiz, que
ao menos é uma pergunta real que motorista erra.

## Onde mexer

| Quero mudar | Vá em |
| --- | --- |
| como cada seção deve ficar | `assets/pecas/exemplos/`, os exemplos do dono |
| a zona onde o texto pode entrar | `lib/pecas/chapas.ts`, e rode `conferir:pecas` |
| como a chapa é medida | `lib/pecas/silhueta.ts` |
| de onde sai o conteúdo | `lib/pecas/conteudo.ts` |
| o desenho que o n8n recebe | `app/api/pecas/route.tsx` |
| o desenho que eu vejo localmente | `scripts/pecas.mjs` |
| as chapas | `assets/pecas/`, e rode `--medir` depois |
