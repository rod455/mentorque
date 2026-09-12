# A jornada de recorrência: e-mail e push, e como ligar

Aprovada pelo dono em 12/09/2026 e construída no mesmo dia. A proposta, com
o mapa de quem dá para alcançar e o porquê de cada e-mail, está em
`docs/agentes/propostas/jornada-de-recorrencia.md`. Aqui é o manual de
operação: o que existe, onde mora, como testar e como ligar.

## O que existe

| peça | onde | o que faz |
|---|---|---|
| a decisão | `lib/jornada/decisao.ts` | pura: recebe o retrato de uma conta e a data, devolve qual e-mail cabe hoje, ou nenhum |
| os textos | `lib/jornada/emails.ts` | um texto por chave, personalizado pelo carro; o molde HTML; a versão push |
| o link de sair | `lib/jornada/saida.ts` e `app/api/jornada/sair` | assinado por pessoa; grava em `jornada_saidas` |
| o cron | `app/api/cron/jornada` | todo dia às 9h de Brasília (`vercel.json`); decide, manda, grava |
| o transporte de push | `lib/push/transporte.ts` | FCM (Android) e APNs (iPhone); a rota manual `/api/push/enviar` usa o mesmo |
| as tabelas | `supabase/jornada.sql` | `jornada_envios` (trava de envio dobrado) e `jornada_saidas` |
| a conferência | `npm run conferir:jornada` | decisão caso a caso, textos e ligações; provada com defeito plantado |

## As regras, em uma linha cada

- Quem saiu não recebe nada. Quem mexeu no app hoje não recebe hoje.
- Um e-mail a cada três dias por pessoa; nunca dois no mesmo dia (índice
  único no banco).
- Gatilho ganha de cadência, cadência ganha de sazonal.
- A cadência (d0, d2, d5, d9, d14) só sai até três dias depois do marco.
  Conta antiga nunca recebe a cadência em rajada; ela entra pelos gatilhos.
- "Vencida" só com um serviço daquele tipo registrado. Data de compra sem
  registro não vira "vencido há 30 meses".
- Sem preço de plano e sem oferta em e-mail nenhum. Isso é do dono.

## Os e-mails

| chave | quando | assunto (com carro) |
|---|---|---|
| d0 | conta nasceu | Sua conta está pronta. O Gol 2016 já tem calendário. |
| d2 | dia 2 | O que o Gol 2016 precisa nos próximos 90 dias |
| d5 | dia 5, sem serviço registrado | Quanto custa uma troca de óleo em Campinas/SP? |
| d9 | dia 9 | O manual do Gol 2016 está na Biela |
| d14 | dia 14 | O Gol 2016 tem 10 anos: o que costuma aparecer nessa idade |
| vencida:item | item vencido, com registro; a cada 30 dias | Troca de óleo do Gol 2016 passou do ponto |
| chegando:item | vence em 30 dias ou 1.000 km; a cada 60 dias | Troca de óleo do Gol 2016 vence em 25 dias |
| preco:serviço | serviço com valor registrado há até 10 dias; uma vez | Você pagou R$ 280 em troca de óleo. Na região, a faixa é R$ 160 a R$ 490 |
| parado-2, parado-7 | carro cadastrado, zero serviço e zero quiz | O Gol 2016 está cadastrado, mas ainda não conta nada |
| km | km sem atualizar há 45 dias | Quantos km o Gol 2016 tem hoje? |
| sumiu-14, sumiu-30 | sem atividade | O Gol 2016 está sem novidade há duas semanas |
| sazonal:ferias-12, ferias-07, chuva, ipva | janela de dias no mês; uma vez por ano | Antes de pegar a estrada com o Gol 2016: seis itens em cinco minutos |

Sem carro, cada um tem a versão que pede o carro.

## Como ligar (passos do dono, nesta ordem)

1. **Ver o ensaio.** Sem a chave ligada o cron não manda nada; ele devolve
   o que mandaria hoje:

   ```
   curl "https://www.mentorque.com.br/api/cron/jornada?chave=A_DADOS_CHAVE"
   ```

   A resposta traz `modo: "ensaio"`, quantas contas, quantas escolhidas e a
   lista com chave, motivo e assunto de cada uma (e-mail mascarado).

2. **Receber uma cópia de cada e-mail** antes de qualquer cliente ver:

   ```
   curl -X POST https://www.mentorque.com.br/api/cron/jornada \
     -H "content-type: application/json" -H "x-mq-chave: A_DADOS_CHAVE" \
     -d '{"teste": "voce@exemplo.com", "chave": "d2", "comCarro": true}'
   ```

   Chaves para testar: `d0`, `d2`, `d5`, `d9`, `d14`, `vencida:oil`,
   `chegando:oil`, `preco`, `parado-2`, `km`, `sumiu-14`,
   `sazonal:ferias-12-2026`. `"comCarro": false` mostra a versão sem carro.
   A cópia não grava envio nem toca em conta nenhuma.

3. **Cadastrar o domínio no relay da Apple.** Quatro contas entraram com
   "ocultar meu e-mail" (`privaterelay.appleid.com`); sem o domínio de envio
   cadastrado no console do desenvolvedor (Certificates, Identifiers &
   Profiles, Services, Sign in with Apple for Email Communication), esses
   e-mails voltam.

4. **Ligar.** Na Vercel, Production: `JORNADA_ATIVA=sim`, e redeploy. Opcional:
   `JORNADA_SEGREDO` (assina o link de sair; sem ela, usa a `DADOS_CHAVE`) e
   `JORNADA_FROM` (remetente; sem ela, o mesmo do lançamento). A primeira
   rodada de verdade sai na manhã seguinte às 9h; para não esperar, chame o
   GET do passo 1 depois do redeploy (com a chave ligada ele envia).

5. **Push.** O mesmo cron manda push onde há token, com o título e o corpo
   do e-mail. Só acontece com as quatro chaves de `docs/push.md` na Vercel
   (`FCM_CONTA_SERVICO`, `APNS_CHAVE_P8`, `APNS_KEY_ID`, `APNS_TEAM_ID`). A
   resposta do cron diz `push: { android, ios }` com o que está configurado.

## Como ler depois

- Quem clicou volta ao app com `utm_source=email&utm_campaign=jornada&utm_content=<chave>`;
  o `abriu_app` na web já lê a etiqueta (docs/utms.md).
- `select chave, count(*) from jornada_envios group by 1` diz o que saiu;
  `select count(*) from jornada_saidas` diz quem pediu para sair. Saída
  acima de 2% de um e-mail é sinal de que aquele texto está errado.
- O que o cron NÃO alcança: abertura de e-mail (a Apple esconde), e quem usa
  o app das lojas e clica no e-mail cai no navegador, não no app, porque não
  há universal link. Fica registrado como limite.

## Rodada de teste que ainda não aconteceu

Nenhum e-mail da jornada foi enviado a ninguém até a chave ser ligada. O
ensaio contra o banco real e as cópias de prova são os passos 1 e 2 acima, e
são do dono. Até lá a resposta certa sobre "a jornada funciona?" é: a
decisão e os textos estão conferidos; o envio, sem sinal ainda.
