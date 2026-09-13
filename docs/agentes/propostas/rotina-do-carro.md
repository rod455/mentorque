# Rotina do carro: onde cada peça entra, pela régua do CRO

Pedido do dono em 13/09/2026: "vamos fazer o que você propôs. Utilize o
agente de CRO para entender qual o melhor local para colocar". As quatro
peças (caderno de gastos, datas do carro, resumo mensal, modo motorista de
aplicativo) nasceram da pergunta "o que é recorrente na vida de quem tem
carro", e a resposta foi dinheiro e datas, não mecânica. Este documento
decide o LUGAR de cada uma com os instrumentos do papel
(`docs/agentes/cro-besci.md`, `mapa-experiencia.md`, `skills/besci.md`) e
registra cada aposta no caderno antes de construir.

## O que o mapa diz sobre o lugar

- O Início existe para responder "e agora?" em um olhar (mapa, seção
  "Início"). Hoje a ordem é: banner de versão, convite de aviso, herói,
  Premium, busca, card do carro, card de revisões, atalhos, memórias. O card
  de revisões "vira pedido de dado em vez de entrega" quando falta km. O km
  é o dado que mais falta, e é exatamente o que um abastecimento traz de
  graça.
- O convite de aviso só convence com motivo concreto (mapa, "Lembrete
  local"): "a próxima revisão do Gol" é bom; "o IPVA vence em 12 dias" é
  melhor, porque tem data e dinheiro.
- O Premium aparece antes do primeiro valor (mapa, "Banner de premium").
  Nada aqui vai atrás de paywall na entrada: combustível é grátis por
  decisão do dono, e o que fica no Premium é o relatório completo.
- Áreas congeladas por experimento aberto: o onboarding (`onboarding-curto`)
  e o formulário do carro (`cadastro-em-duas-etapas`). Nenhuma peça daqui
  toca nelas.

## Peça 1: o caderno de gastos, começando pelo abastecimento

**Onde entra**

1. **Início, logo abaixo do card do carro**: o card "Custo do carro". Com
   abastecimento registrado: "Esta semana: R$ 180 · R$ 0,62 por km" e o
   botão "Abasteci". Sem nenhum: "Quanto o Gol custa por km? Registre o
   próximo abastecimento em três toques". Fica abaixo do carro e ACIMA do
   card de revisões, porque é a ação de menor esforço da tela e a que
   alimenta o resto (o km).
2. **A folha de abastecimento**: três campos (valor pago, litros, km do
   painel), combustível pré-marcado com o último usado, data de hoje. Salvar
   com dois dos três campos preenchidos (valor e km bastam; litros refina
   o consumo). Nada de posto, nada de nota.
3. **Ao salvar, a devolução na hora**, como a comparação de preço faz no
   serviço: "R$ 0,62 por km · consumo 11,8 km/l · este mês R$ 380". É o
   momento de valor, e é ele que ganha o pedido de aviso quando ainda não
   houver permissão (timing do pedido).
4. **Histórico**: o abastecimento entra na mesma lista, com a própria
   etiqueta, e o "Relatório de gastos" (Premium) ganha categorias:
   combustível, serviços, seguro, documentação, pneus. A soma da semana e o
   custo por km são grátis; o relatório por categoria e por período continua
   Premium.
5. **O km mensal**: quem abastece não é perguntado "quantos km tem hoje?",
   porque o abastecimento carimba o km. A folha mensal continua para quem
   não abastece pelo app.

**Princípio**: compromisso e consistência (o menor lançamento possível,
repetido). Um princípio só, para a leitura ser limpa.

**Mede**: pessoas com abastecimento em duas semanas seguidas (a régua de
rotina); e, de quebra, a idade do km carimbado (hoje a maioria está velho).

**Risco**: baixo; é um card e uma folha. Não é A/B: o Início não tem teste
aberto e adicionar um bloco novo não tem "versão B" honesta para comparar.
Registrado como mudança direta.

## Peça 2: as datas do carro

**Onde entra**

1. **No calendário de revisões**, não numa tela nova. A tela de revisões já
   lista o que vence por data e km; IPVA, licenciamento, seguro e CNH entram
   na mesma lista, com a própria etiqueta, ordenados junto. Quem abre o
   calendário vê o carro inteiro, mecânica e papelada.
2. **Na tela do carro**, o card "Diagnóstico do carro" (2.5) ganha o passo
   "datas" (n de 6): é a barra de progresso que já pede o que falta.
3. **No Início, só quando há data a 30 dias ou menos**: "IPVA do Gol vence
   em 12 dias", com o valor se a pessoa informou. Fora dessa janela, nada no
   Início: card permanente de data distante é ruído.
4. **Avisos**: 30, 7 e 1 dia antes, locais, com ids fixos, cancelados e
   refeitos a cada abertura como o quiz. E o convite de aviso, para quem
   ainda não ligou, aparece ao salvar a primeira data: "Quer que a gente
   avise 30 dias antes?".
5. **Jornada**: gatilho `vence:item` no e-mail (30 dias antes), na mesma
   régua de "vencida" e "chegando" que já existe.

**Princípio**: aversão à perda (multa, juros, carro parado), com
honestidade: o valor da multa só quando for público e certo.

**Mede**: avisos ligados por origem `datas`; retorno no mês de um
vencimento contra os outros meses.

**Dependência do dono**: consulta de placa (API paga) faria as datas
nascerem preenchidas. Sem ela, a pessoa digita uma vez.

## Peça 3: o resumo mensal

**Onde entra**

1. **E-mail e push no dia 1**, chave `mes` na jornada, ganhando da cadência
   naquele dia: gasto do mês por categoria, custo por km, o que vence em 30
   dias, o que ficou sem registrar. Só sai para quem tem pelo menos um
   lançamento no mês ou uma data cadastrada; resumo vazio é spam.
2. **No Início, na primeira semana do mês**: o mesmo resumo como card,
   "Agosto do Gol: R$ 620", que abre o relatório. Some no dia 8.

**Princípio**: efeito de progresso (o mês fechado é um marco).

**Mede**: abertura do app nos três dias seguintes ao envio, contra a média;
saídas da jornada (acima de 2% é texto errado).

## Peça 4: o modo motorista de aplicativo

**Onde entra**

1. **No Perfil**, um interruptor "Uso o carro para trabalhar por
   aplicativo". Não é pergunta do onboarding (área congelada, e é fricção
   na chegada).
2. **Com o interruptor ligado**, o card "Custo do carro" do Início vira
   "Hoje: ganhou R$ 240 · custou R$ 95 · sobrou R$ 145", com o lançamento
   do dia (ganhos e km rodado) ao lado do abastecimento. O custo por km
   passa a incluir a reserva de manutenção (o calendário sabe o que vence).
3. **No resumo mensal**, a linha de lucro por km.

**Princípio**: clareza do próximo passo (a conta que decide se a corrida
valeu).

**Mede**: pessoas com o interruptor ligado e lançamento em cinco dias de
uma semana.

**Decisão do dono, pendente**: se este público vira o principal (ficha,
campanhas) ou fica como um modo. O interruptor não muda posicionamento.

## A ordem e o ritmo

1. Peça 1 agora, em commits pequenos: tipo e regra pura, folha, card do
   Início, histórico, conferência. Web no push; lojas na 2.6.
2. Peça 2 em seguida, porque reaproveita o calendário e os avisos.
3. Peça 3 depois das duas, porque é delas que o resumo se alimenta.
4. Peça 4 por último, depois da decisão do dono sobre o público.

Cada peça entra no caderno de experimentos como mudança direta, com a
métrica declarada, e a leitura de rotina passa a ser "semanas com
lançamento por pessoa", não "abriu o app".
