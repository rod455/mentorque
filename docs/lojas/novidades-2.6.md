# Novidades da versão 2.6

Aberta em 13/09/2026, com a 2.5 pronta para o Codemagic. Tudo o que entra
aqui já roda na web pelo deploy da Vercel; o binário só importa para o app
das lojas.

## O que vai NO BINÁRIO

1. **Análise de orçamento por foto** (13/09, aprovada pelo dono a partir da
   proposta `docs/agentes/propostas/plataforma-10m.md`). A pessoa tira foto
   do orçamento da oficina; a Biela lê linha a linha, explica para que serve
   cada item, compara com a faixa da região quando há referência e monta as
   perguntas para fazer antes de aprovar. Nunca diz "está sendo enganado".
   Entra por três lugares: o checklist do sintoma, o formulário de serviço
   novo e a Biela. "Salvar no histórico" abre o serviço pré-preenchido
   (serviço principal, oficina, total, as linhas nas notas).
   - Limite: **2 análises por mês no gratuito** (decisão do dono, 13/09),
     sem limite no Premium. O servidor conta (`orcamentos_analisados`) e
     confere o Premium pela tabela `subscriptions` com o Bearer, não pelo que
     o app diz.
   - A foto não é guardada: vai reduzida (1600 px) para a rota, que manda ao
     modelo e descarta. A tabela guarda só mês, identidade, quantos itens,
     total e as chaves de serviço com valor.
   - Onde mora: `lib/orcamento/analise.ts` (puro), `app/api/orcamento`,
     `components/app/screens/Orcamento.tsx`. Conferido por
     `conferir:orcamento` (limite, leitura de resposta suja, comparação,
     ligações) e pela suíte `conferir:navegador orcamento` (foto, resultado,
     limite, salvar no histórico), as duas provadas com defeito plantado.
   - Evento: `analisou_orcamento`, com a origem. A leitura que importa em 30
     dias: quem analisou volta e registra serviço mais que quem não analisou?
   - **Universal links** ficam aqui também (vindos da 2.5), quando o dono
     mandar o SHA-256 do Play.
2. **O caderno de gastos: abastecimento em três toques** (13/09, peça 1 da
   rotina do carro, `docs/agentes/propostas/rotina-do-carro.md`). Card
   "Custo do carro" no Início, abaixo do card do carro: sem lançamento,
   convida; com, mostra a semana e o custo por km. A tela pede valor, km do
   painel e litros (opcional); ao salvar, devolve custo por km, consumo e o
   mês, e carimba o km do carro (quem abastece pelo app não recebe a
   pergunta mensal de km). O histórico lista os abastecimentos junto dos
   serviços, com a soma do mês grátis no topo; o relatório de gastos
   (Premium) passa a incluir combustível. Grátis por decisão do dono.
   - Onde mora: `lib/app/combustivel.ts` (puro), `Abastecimento.tsx`, o
     card em `Home.tsx`, as linhas em `History.tsx`. Evento
     `registrou_abastecimento`. Conferido por `conferir:combustivel` (contas
     e ligações, provado com defeito plantado) e pela suíte
     `conferir:navegador combustivel` (17 casos).
   - Roteiro de aparelho: no app das lojas, registrar dois abastecimentos e
     ver o custo por km no segundo; abrir o app no dia seguinte e NÃO
     receber a folha mensal de km (o abastecimento carimbou).
3. **As datas do carro: IPVA, licenciamento, seguro e CNH** (13/09, peça 2
   da rotina). No calendário de revisões, o card "Datas do carro" com as
   quatro linhas; tocar informa a data e o valor opcional. No Início, a
   data a 30 dias ou menos (ou vencida há até 60) como card; fora disso,
   nada. No "Diagnóstico do carro", o sexto passo. Avisos locais 30, 7 e 1
   dia antes, às 9h, ids fixos 8 a 19, refeitos a cada abertura e a cada
   mudança de data; só do carro ativo. Sem rota no aviso de propósito (a
   lista de rotas é fechada): o toque abre o Início, onde o card já espera.
   - Onde mora: `lib/app/datasDoCarro.ts` (puro), `lib/app/lembreteDatas.ts`,
     `components/app/DatasDoCarro.tsx`, o card em `Home.tsx`. Conferido por
     `conferir:datas` (provado com as antecedências trocadas) e pela suíte
     `conferir:navegador datas`. O gatilho da jornada por e-mail (30 dias
     antes) entra com o resumo mensal, peça 3.
   - Roteiro de aparelho: informar uma data para daqui a 8 dias com os avisos
     ligados; amanhã às 9h chega "vence em 7 dias"; tocar abre o Início com
     o card da data. Trocar a data: o aviso antigo some e o novo entra.
   - **Pelo final da placa** (13/09, pedido do dono): na folha do IPVA e do
     licenciamento, estado e final da placa uma vez; o app sugere a data
     pelo calendário do estado (`lib/app/calendarioDaPlaca.ts`) e a pessoa
     confirma com um toque; depois disso, a linha oferece a próxima data
     com "Usar". Estados na tabela: IPVA de SP, MG, RS e SC; licenciamento
     de SP e RJ. Quando o calendário do ano ainda não saiu (os estados
     publicam em dezembro), a data é projetada do ano anterior e marcada
     como estimada no calendário, no Início, no aviso e no e-mail, pedindo
     para conferir. Sem calendário do estado, a folha diz quais existem e
     a pessoa digita. Conferido em `conferir:datas` e na suíte `datas`.
   - Roteiro de aparelho: no calendário, tocar em IPVA, escolher SP e o
     final 7, "Sugerir a data": vem 20/01 estimada; salvar; a linha do
     licenciamento passa a oferecer 31/10 com "Usar".
4. **O mês do carro fechado** (13/09, peça 3 da rotina). Na primeira semana
   do mês, o Início mostra o card "Agosto do Gol 2016: R$ 380" (combustível
   e serviços do mês fechado), tocando abre o histórico; só aparece quando
   houve lançamento. A parte que não vai no binário: a jornada por e-mail e
   push ganhou duas chaves, `mes` (dias 1 a 3, o resumo com custo por km e
   o que vence nos próximos 30 dias, só para quem tem lançamento ou data) e
   `vence` (IPVA, licenciamento, seguro ou CNH a 30 dias, uma vez a cada 60,
   nunca depois de vencida). Gatilho ganha do resumo; resumo ganha da
   cadência.
   - Onde mora: `lib/app/resumoDoMes.ts` (puro), o card em `Home.tsx`, as
     chaves em `lib/jornada/decisao.ts` e os textos em `lib/jornada/emails.ts`.
     Conferido por `conferir:jornada` (provado com três defeitos plantados:
     janela do resumo, data vencida virando e-mail, resumo antes do gatilho).
   - Roteiro de aparelho: entre os dias 1 e 7, com um abastecimento no mês
     anterior, o card do mês aparece no Início abaixo da data a vencer.
5. **O modo motorista de aplicativo** (13/09, peça 4 da rotina, como modo:
   o público principal segue decisão do dono). No Perfil, abaixo dos
   avisos, o interruptor "Trabalho com o carro por aplicativo". Ligado, o
   card "Custo do carro" do Início vira "Hoje com o Gol 2016: ganhou R$ 240
   · custou R$ 121 · sobrou R$ 119", com dois botões, "Lançar o dia" e
   "Abasteci". A tela do dia pede o que o aplicativo pagou e os km rodados;
   ao salvar, devolve o que sobrou, o lucro por km e de onde veio o custo
   (combustível dos abastecimentos mais a reserva de manutenção dos
   serviços dos últimos 12 meses, quando há 500 km registrados). Sem dois
   abastecimentos, a conta diz que o custo ainda falta; nunca inventa. O
   histórico lista os dias; o resumo do mês (card e e-mail) ganha a linha
   do lucro por km. O km rodado no dia NÃO carimba o odômetro.
   - Onde mora: `lib/app/motorista.ts` (puro), `Ganhos.tsx`, o card em
     `Home.tsx`, o interruptor em `Profile.tsx`, as linhas em
     `History.tsx`. Evento `lancou_ganho` (restrição do banco recriada,
     migração `funil_eventos_ganho`). Conferido por `conferir:motorista` e
     pela suíte `conferir:navegador motorista`.
   - Roteiro de aparelho: ligar o interruptor no Perfil, voltar ao Início e
     ver o card trocar; lançar um dia e ver a conta; desligar o interruptor
     e ver o card do custo voltar.

## Roteiro de aparelho, e ele é obrigatório

Escrito antes do build. O que a bateria não alcança: a câmera do aparelho
dentro do WebView e a resposta do modelo de verdade (a suíte simula a rota).

1. **Câmera no app das lojas**: Problemas, um sintoma, "O que verificar",
   "Tirar foto do orçamento". O botão abre a câmera do aparelho (não só a
   galeria) no Android e no iPhone; a foto aparece na tela; "Analisar
   orçamento" devolve o resultado em até 30 segundos.
2. **Resultado de verdade**: com um orçamento impresso, as linhas batem com
   o papel, os valores conferem, e nenhuma frase acusa a oficina.
3. **Limite**: deslogado, na terceira análise do mês a tela oferece o
   Premium. Logado com Premium, a terceira passa.
4. **Salvar no histórico** chega ao formulário com oficina e total.
