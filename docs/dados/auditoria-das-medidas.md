# Auditoria das medidas: o que dá para ler no retrato, e o que não dá

Feita em 28/09/2026, a pedido do dono: *"estamos a mais de um mês medindo
semana a semana e até hoje temos partes que não estão mensuradas corretamente.
Precisamos corrigir todas as formas de medição imediatamente."*

Ele está certo. Este arquivo é a conta inteira, linha por linha do retrato
diário, sem escolher as fáceis.

## A causa, e ela é uma só

Em cinco dias, cinco instrumentos diferentes erraram, e **nenhum por descuido
de quem escreveu**:

| quando | quem | o que saiu | o que era |
|---|---|---|---|
| 23/09 | QA | achou que duas medidas do retrato não podiam ser lidas | certo, e consertou as views |
| 25/09 | CRO | "coorte de 14/09 FECHADA, zero voltando" | `d1_7_fechada` era `false` |
| 26/09 | anomalia | "28 no Android contra 2 no iPhone" | 24,1% contra 14,3% |
| 28/09 | Vigia | "22 erros em 7 dias" | 6 de 262 aparelhos, 2,3% |
| 28/09 | Diretor | "28 de ~367 veem o convite" | 337 dos 367 estavam na web, onde o convite não existe |

As quatro últimas têm a mesma forma: **um número foi publicado sem o que o
torna legível** (o denominador, a plataforma, ou a maturidade da janela).

E tem um detalhe que dói mais que os cinco: **a correção de 23/09 estava
certa e não chegou a ninguém.** As colunas `d1_7_fechada`, `d8_30_fechada`,
`semana_fechada` e `janela_fechada` existem desde aquele dia, e o retrato
seguiu imprimindo as quatro coortes exatamente iguais. Dois dias depois o CRO
tropeçou; cinco dias depois o Diretor tropeçou no mesmo lugar.

> **A regra que fica: conserto na fonte que não muda o consumidor não é
> conserto.** Toda rodada que arruma um dado tem que dizer quem lê aquele dado
> e se o leitor mudou. Se não mudou, o achado continua ABERTO.

## A conta, linha por linha

Verdicto de cada número do retrato de 28/09. **Legível** = dá para tomar
decisão. **Piso** = o número só cresce, não é resultado. **Cego** = falta o de
baixo.

### Marketing

| linha | veredito | por quê |
|---|---|---|
| Semana corrente: aberturas, visitantes, cadastros | **piso** | a semana tem 1 dia; está ao lado da semana cheia, convidando comparação |
| Semana anterior | legível | semana fechada |
| Cadastros 28d por origem (66 direto, 20 google) | **cego** | não traz o total, então não dá para saber que fração tem etiqueta. E desde 19/09 a busca parou de etiquetar, o que o retrato não diz |
| Gasto de mídia 7d | legível | |
| CAC bruto | **legível, e é o bom exemplo** | usa a última semana FECHADA e escreve a ressalva na linha seguinte. Foi consertado em 24/09 e é o modelo do que as outras precisam |
| Busca Google 28d | legível | |
| YouTube: views totais | **sem janela** | "totais" desde quando? Não dá para comparar semana a semana |

### Engajamento

| linha | veredito | por quê |
|---|---|---|
| Semana corrente: usuários ativos | **piso** | 1 dia ao lado de uma semana cheia, e aqui NÃO existe a ressalva que o CAC tem |
| Retenção, 4 coortes | **CRÍTICO** | `d8_30_fechada` é `false` nas QUATRO, e as quatro saem com "0 em 8 a 30 dias". É a linha que produziu o erro de 25/09 e o de 28/09 |
| Ativação, 4 coortes | **CRÍTICO** | `janela_fechada` é `false` em duas das quatro. "2 de 51" (aberta) ao lado de "6 de 11" (fechada) sugere uma queda de 55% para 4% que não existe |
| Erros no app 7d: 22 | **cego** | sem denominador. São 6 aparelhos em 262 Android ativos, 2,3% |
| Play vitals: sem dados | legível | e honesto |
| Avaliações nas lojas | legível | |

### Vendas

| linha | veredito | por quê |
|---|---|---|
| Assinaturas ativas (banco) | legível | |
| Fundo do funil, semana corrente | **piso** | 1 dia |
| Fundo do funil: viram paywall 45, iniciaram checkout 5 | **cego** | 85% das exibições são Android, que não tem botão de compra. O zero é estrutural, e a linha não diz |
| Assinantes, coorte 2026-09-01: 0 renovaram | **piso** | a primeira renovação de um mensal de 01/09 é 01/10. "0 renovaram" é calendário, não comportamento |
| Stripe: MRR 89,70, receita 30d 0,00 | **confuso** | os dois estão certos e parecem se contradizer. Falta dizer que a primeira cobrança é 01/10 |
| RevenueCat | **legível** | tem a ressalva ("active_users = aparelhos, inclui testes"), e é o outro bom exemplo |

**Placar: 7 legíveis, 4 piso, 4 cegos, 1 confuso, 1 sem janela.**

## O que já foi consertado (28/09)

1. **A régua do funil aprendeu plataforma** (`lib/funilCorreto.ts`).
   `podeComparar` recusa taxa cujos dois lados não cobrem a mesma população, e
   `RESSALVAS.viu_paywall` carrega o modo leitor do Android.
2. **O alarme ganhou denominador** (`supabase/aparelhos-ativos.sql`). O retrato
   publica `erros7d.aparelhosAtivos` e `aparelhosComErro`.
3. **As coortes passam a sair com a ressalva DENTRO da frase**
   (`lib/retratoLegivel.ts`). Onde a janela não fechou, o lugar do número é
   ocupado pelo motivo e pela data em que ele vai existir. O número cru viaja
   ao lado, marcado como PISO.

As três têm conferência com defeito plantado: `conferir:funil`,
`conferir:anomalias` e `conferir:legivel`.

## O que falta, e onde

**Um passo no n8n, e ele é o que fecha o assunto.** O texto do retrato é
montado lá, não aqui. `/api/dados` já entrega as frases prontas em
`usoRegua.linhasRetencao` e `usoRegua.linhasAtivacao`; o nó do Analista
precisa IMPRIMIR essas frases em vez de remontar as dele a partir dos números
crus. É o mesmo tipo de passo que o retrato já deu com o CAC em 24/09.

Enquanto isso não for feito, as linhas de coorte do retrato continuam saindo
do jeito antigo. **A conferência não alcança o n8n**, e por isso isto está
escrito aqui em vez de estar num teste.

**O que segue aberto na lista acima**, e não foi tocado hoje:
- a semana corrente ao lado da fechada, sem a ressalva que o CAC tem (3 linhas);
- os cadastros por origem sem total e sem o aviso da etiqueta quebrada;
- "0 renovaram" numa coorte cuja renovação ainda não chegou;
- Stripe com MRR e receita 30d que se contradizem sem explicação;
- YouTube sem janela.

Nenhum deles é difícil. Todos são a mesma coisa: **a frase precisa carregar o
que a torna legível, e a frase mora no n8n.**
