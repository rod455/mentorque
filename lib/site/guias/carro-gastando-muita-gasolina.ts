import type { Guia } from "./tipos";

// Guia: carro gastando muita gasolina.
//
// POR QUE ESTE ASSUNTO, E QUAL É O ÂNGULO. É busca de volume alto e de
// conteúdo ruim: as páginas que dominam o resultado repetem a mesma lista de
// lugar-comum (calibre o pneu, dirija com suavidade) sem enfrentar a pergunta
// que a pessoa realmente tem, que é "mudou alguma coisa no MEU carro ou é
// impressão minha?".
//
// O ângulo daqui é MEDIR ANTES DE CONSERTAR, e ele é honesto por um motivo
// simples: consumo é a única queixa da lista de sintomas em que a pessoa quase
// sempre não tem número nenhum, só sensação. Quem gasta com bico injetor por
// impressão costuma continuar com a mesma impressão depois.
//
// CUIDADO REGISTRADO, e vale para quem for atualizar. Um dos textos mais
// copiados sobre este assunto afirma que a gasolina brasileira passou a ter 35%
// de etanol. Isso está errado: em 14/07/2026 o CNPE aprovou a mistura de 30%
// para 32%, com validade de 180 dias e uma prorrogação possível, e o E35 seguia
// em estudo. Por isso o texto abaixo explica o MECANISMO e carimba a data em
// vez de fixar um número que envelhece sozinho: número errado em conteúdo de
// manutenção destrói confiança de uma vez só.
//
// Conversa com o sintoma `consumption` de lib/app/conteudo/sintomas.ts.

export const guia: Guia = {
  caminho: "/carro-gastando-muita-gasolina",
  rotulo: "Guia de diagnóstico",
  h1: "Carro gastando muita gasolina: como descobrir se mudou mesmo",
  tituloSeo: "Carro gastando muita gasolina: causas e como medir | Mentorque",
  descricaoSeo:
    "Antes de trocar peça por impressão, aprenda a medir o consumo do seu carro de verdade e a separar o que é hábito, o que é combustível e o que é defeito mecânico.",
  palavras: [
    "carro gastando muita gasolina",
    "consumo do carro aumentou",
    "carro bebendo muito",
    "como calcular consumo do carro",
    "carro gastando mais que o normal",
  ],
  chamada: "Carro gastando muito: medir antes de trocar peça",

  abertura: [
    "Quase todo mundo chega nesse assunto com uma sensação, não com um número. E sensação de consumo é enganosa: o preço do litro subiu, o trânsito piorou, a rotina mudou, e a impressão de que o carro está bebendo mais aparece antes de qualquer defeito existir.",
    "Por isso este guia começa pelo contrário do que costuma se ler: antes de trocar filtro, limpar bico ou desconfiar da bomba, vale medir. Duas medições feitas do jeito certo custam nada e evitam gastar com peça que não era o problema. Depois de medir, as causas ficam bem mais fáceis de separar.",
  ],
  indiceTitulo: "Por onde começar",

  blocos: [
    {
      id: "medir",
      quando: "Primeiro: descubra o consumo real",
      som: "O método do tanque cheio, que é o único que não depende do computador de bordo nem da sua memória.",
      causas: [
        "Abasteça até o bico desarmar sozinho e zere o hodômetro parcial. Encher além do desarme falseia a medida.",
        "Rode normalmente até o tanque chegar perto da metade ou menos, sem mudar o seu jeito de dirigir de propósito.",
        "Abasteça de novo no mesmo posto e na mesma bomba, até o bico desarmar sozinho, e anote os litros e os quilômetros rodados.",
        "Divida os quilômetros pelos litros. Esse é o consumo real daquele período, e é com ele que a próxima medição vai ser comparada.",
      ],
      observar: [
        "O computador de bordo costuma otimizar a leitura, e o erro dele não é constante. Use como referência, não como prova.",
        "Uma medição sozinha não diz nada: é a comparação entre duas ou três, feitas do mesmo jeito, que revela mudança.",
        "Anote também o tipo de uso do período: mais cidade, mais estrada, mais ar-condicionado.",
      ],
      urgencia: {
        rotulo: "Comece aqui",
        tom: "baixa",
        texto:
          "Sem essa medição, qualquer conserto vira aposta e qualquer melhora vira impressão. Com ela, você consegue dizer para a oficina 'fazia X e passou a fazer Y', que é uma frase completamente diferente de 'está gastando muito'.",
      },
    },
    {
      id: "combustivel",
      quando: "Mudou o combustível, não o carro",
      som: "O consumo piorou sem nenhuma outra mudança perceptível no comportamento do carro.",
      causas: [
        "A gasolina brasileira leva etanol anidro por obrigação legal, e esse percentual MUDA por decisão do governo. Etanol tem menos energia por litro que a gasolina pura, então quando o percentual sobe o consumo em quilômetros por litro tende a subir junto, mesmo com o carro perfeito.",
        "Troca de posto ou de bandeira, principalmente quando o combustível anterior estava fora de especificação.",
        "Abastecer com etanol achando que a conta fecha. A regra prática dos 70% existe justamente porque etanol rende menos por litro.",
        "Combustível adulterado, que costuma vir acompanhado de falha, engasgo ou partida difícil, e não só de consumo alto.",
      ],
      observar: [
        "A piora coincidiu com uma troca de posto ou com uma notícia sobre mudança na mistura?",
        "O carro apresentou algum outro sintoma junto, como engasgo ou perda de força?",
        "Você comparou etanol e gasolina pelo preço por quilômetro rodado, ou só pelo preço do litro?",
      ],
      urgencia: {
        rotulo: "Observar",
        tom: "baixa",
        texto:
          "Em 14/07/2026 o CNPE aprovou elevar a mistura obrigatória de 30% para 32% de etanol anidro na gasolina, por 180 dias e com uma prorrogação possível. Percentuais maiores seguiam em estudo naquela data. Confirme o que está valendo hoje antes de concluir que o defeito é do carro: essa regra muda, e não é raro.",
      },
    },
    {
      id: "manutencao",
      quando: "O básico que realmente pesa",
      som: "Itens de manutenção que afetam consumo de forma mensurável, em ordem do mais barato para o mais caro.",
      causas: [
        "Pressão dos pneus abaixo do especificado. É o item mais barato da lista e um dos que mais influenciam, porque pneu murcho aumenta a resistência ao rolamento o tempo todo.",
        "Filtro de ar sujo, que dificulta a respiração do motor e costuma ser trocado tarde demais.",
        "Velas de ignição gastas, que fazem a queima ficar incompleta e cobram isso em combustível e em desempenho.",
        "Bicos injetores sujos e sensores de mistura fora de faixa, que costumam vir acompanhados de marcha lenta irregular.",
      ],
      observar: [
        "Quando os pneus foram calibrados pela última vez, e você usou a pressão da etiqueta do carro ou a que o frentista achou?",
        "Há quanto tempo o filtro de ar e as velas não são trocados?",
        "A marcha lenta está estável, ou o ponteiro oscila com o carro parado?",
      ],
      urgencia: {
        rotulo: "Atenção",
        tom: "media",
        texto:
          "A ordem importa: calibragem e filtro de ar custam pouco e resolvem parte real dos casos. Limpeza de bico é um serviço legítimo, mas pedir isso antes de conferir pneu e filtro é começar pelo caro.",
      },
    },
    {
      id: "uso",
      quando: "Mudou o seu uso, e não o carro",
      som: "O carro é o mesmo, a manutenção está em dia, e mesmo assim o número piorou.",
      causas: [
        "Mais trânsito parado. Motor ligado sem o carro andar é o pior cenário possível para quilômetros por litro.",
        "Trajetos curtos com motor frio, em que o carro passa boa parte do percurso na fase de aquecimento, que é a mais gastadora.",
        "Ar-condicionado ligado o tempo todo, principalmente no uso urbano.",
        "Peso e aerodinâmica: bagageiro no teto, porta-malas carregado, janelas abertas em velocidade de estrada.",
      ],
      observar: [
        "A sua rotina de trajetos mudou nos últimos meses?",
        "Você passou a fazer mais percursos curtos, de menos de dez minutos?",
        "Está mais quente, e o ar-condicionado passou a ficar ligado o tempo inteiro?",
      ],
      urgencia: {
        rotulo: "Observar",
        tom: "baixa",
        texto:
          "Esta é a causa mais comum e a que menos aparece nas listas da internet, porque não vende peça nenhuma. Se a medição piorou junto com uma mudança de rotina, o carro provavelmente está certo.",
      },
    },
  ],

  pareAgora: {
    titulo: "Quando consumo alto não é só consumo alto",
    intro:
      "Beber mais raramente é urgente. Junto com estes sinais, deixa de ser só uma questão de bolso:",
    itens: [
      "Cheiro de combustível dentro ou ao redor do carro, que pode indicar vazamento.",
      "Mancha de combustível no chão onde o carro fica estacionado.",
      "Luz da injeção acesa junto com a piora do consumo.",
      "Fumaça preta saindo do escapamento ao acelerar.",
      "Perda de força ou engasgo aparecendo junto com o aumento do gasto.",
    ],
  },

  oficina: {
    titulo: "Como chegar na oficina com um número na mão",
    intro:
      "Consumo é a queixa mais fácil de a oficina não conseguir verificar, porque depende de rodar com o carro por dias. Quem chega medindo muda essa conversa.",
    cartoes: [
      {
        titulo: "Leve as suas medições",
        texto:
          "Duas ou três medições pelo método do tanque cheio, com data e tipo de uso. 'Fazia X e passou a fazer Y' é um dado; 'está gastando muito' é uma sensação, e ninguém consegue consertar sensação.",
      },
      {
        titulo: "Comece pelo mais barato",
        texto:
          "Pressão dos pneus e filtro de ar antes de qualquer serviço de injeção. São conferência de minutos e resolvem parte real dos casos.",
      },
      {
        titulo: "Meça de novo depois do serviço",
        texto:
          "Mesmo método, mesmo posto. É o único jeito de saber se o que você pagou funcionou, e é justamente a etapa que quase ninguém faz.",
      },
      {
        titulo: "Peça orçamento detalhado",
        texto:
          "Peça e mão de obra separadas, item por item. Orçamento com um valor único e a palavra 'revisão' é o formato que mais esconde serviço que você não pediu.",
      },
    ],
  },

  convite: {
    titulo: "Deixar a medição de ser trabalho seu",
    texto:
      "Fazer isso no papel funciona por duas semanas e depois todo mundo abandona. No Mentorque você registra cada abastecimento e o consumo é calculado sozinho, abastecimento a abastecimento, com o histórico do seu carro guardado. Tem também o comparador de etanol e gasolina, que responde qual dos dois compensa hoje pelo preço por quilômetro rodado, e não pelo preço do litro.",
  },

  faq: [
    {
      p: "Como calcular o consumo real do carro?",
      r: "Abasteça até o bico desarmar sozinho e zere o hodômetro parcial. Rode normalmente. Abasteça de novo no mesmo posto e na mesma bomba, até o bico desarmar sozinho, e divida os quilômetros rodados pelos litros que couberam. Uma medição isolada não diz muito: é a comparação entre duas ou três, feitas do mesmo jeito, que mostra se mudou de verdade.",
    },
    {
      p: "O computador de bordo mostra o consumo certo?",
      r: "Ele serve como referência, não como prova. A leitura costuma ser otimista e o erro não é constante entre carros nem entre tipos de uso. Para decidir se vale gastar com um serviço, o método do tanque cheio é mais confiável, porque mede litros que realmente entraram e quilômetros que realmente foram rodados.",
    },
    {
      p: "A mudança na gasolina afeta o consumo?",
      r: "Afeta. A gasolina vendida no Brasil leva etanol anidro por obrigação legal, e o percentual muda por decisão do governo. Etanol tem menos energia por litro que a gasolina pura, então quando esse percentual sobe o rendimento em quilômetros por litro tende a cair mesmo com o carro em perfeito estado. Em 14/07/2026 o CNPE aprovou a elevação de 30% para 32%, por 180 dias. Confirme o que está valendo hoje antes de concluir que o problema é mecânico.",
    },
    {
      p: "Vale a pena limpar os bicos injetores para gastar menos?",
      r: "Vale quando existe sintoma que aponte para isso, como marcha lenta irregular, engasgo ou falha. Como primeira medida contra consumo alto, não: pressão dos pneus, filtro de ar e velas custam menos e explicam mais casos. Limpeza de bico pedida por impressão, sem medição antes e depois, é o serviço que mais deixa a pessoa com a mesma dúvida e a conta paga.",
    },
    {
      p: "Etanol ou gasolina: qual compensa?",
      r: "Depende do preço dos dois no dia e do rendimento do seu carro. A regra prática mais conhecida é comparar se o etanol está custando até cerca de 70% do preço da gasolina, porque ele rende menos por litro. O jeito honesto é comparar o custo por quilômetro rodado com as suas próprias medições, já que o rendimento varia de carro para carro.",
    },
    {
      p: "O Mentorque diz qual é o problema do meu carro?",
      r: "O Mentorque mostra as causas prováveis para o sintoma que você descreve, a urgência típica de cada uma e um checklist para levar na oficina, tudo ajustado ao carro que você cadastra. Ele te prepara para a conversa com o mecânico, não substitui a inspeção presencial.",
    },
  ],
};
