import type { Guia } from "./tipos";

// Guia: barulho no carro. O primeiro deste formato, de 30/08/2026.
//
// O conteúdo veio da página `app/barulho-no-carro/page.tsx`, PALAVRA POR
// PALAVRA: ele já estava no ar e indexado, e reescrever texto publicado sem
// motivo é jogar fora o pouco de histórico que a página tem. O que mudou foi só
// onde ele mora, para os quatro guias dividirem a mesma estrutura.
//
// O ângulo é o método, não a lista de doenças: "barulho no carro" é uma busca
// que quase sempre vem com o som ainda fresco na cabeça de quem digitou, e a
// primeira coisa útil que alguém pode oferecer é COMO ESTREITAR a possibilidade
// (pelo momento em que o som aparece), não um catálogo de peças.
//
// As causas conversam de propósito com o diagnóstico por sintoma do app
// (lib/app/conteudo/sintomas.ts): brake-noise, suspension-noise,
// steering-vibration, engine-misfire.

export const guia: Guia = {
  caminho: "/barulho-no-carro",
  rotulo: "Guia de diagnóstico",
  h1: "Barulho no carro: descubra o que pode ser antes de ir na oficina",
  tituloSeo: "Barulho no carro: como descobrir o que pode ser | Mentorque",
  descricaoSeo:
    "Identifique o barulho do carro pelo momento em que ele aparece: freando, virando, em buraco ou acelerando. Entenda a urgência de cada caso.",
  palavras: [
    "barulho no carro",
    "barulho ao frear",
    "barulho na suspensão",
    "barulho ao virar o volante",
    "que barulho é esse no carro",
  ],
  chamada: "Barulho no carro: descubra pelo momento em que o som aparece",

  abertura: [
    "Quase todo mundo procura por “barulho no carro” com o som ainda fresco na cabeça e uma lista enorme de possibilidades pela frente. A boa notícia é que existe um atalho, e ele não é decorar peça: é reparar em QUANDO o barulho aparece. Freando, virando, em buraco, acelerando ou parado. Cada momento aponta para um conjunto diferente de suspeitos.",
    "Este guia não diagnostica o seu carro, e nenhum texto na internet consegue fazer isso com honestidade. O que ele faz é te dar o vocabulário e as perguntas certas, para você chegar na oficina sabendo do que se trata em vez de aceitar a primeira resposta que aparecer.",
  ],
  indiceTitulo: "Quando o seu barulho aparece?",

  blocos: [
    {
      id: "freando",
      quando: "Aparece quando você pisa no freio",
      som: "Chiado agudo, rangido metálico ou um raspar contínuo que some assim que você tira o pé.",
      causas: [
        "Pastilhas no fim do curso. A maioria dos carros modernos traz uma lingueta de metal que encosta no disco justamente para chiar e avisar antes de acabar o material.",
        "Disco empenado ou marcado, que costuma vir acompanhado de trepidação no pedal.",
        "Pinça travada, quando o barulho não some ao soltar o freio e uma roda esquenta mais que as outras.",
        "Pastilha nova ainda em assentamento, que pode chiar nos primeiros dias sem indicar defeito.",
      ],
      observar: [
        "O barulho aumenta em frenagem forte ou aparece já na frenagem leve?",
        "O pedal treme ou vibra junto com o som?",
        "Vem de uma roda só ou dos dois lados?",
      ],
      urgencia: {
        rotulo: "Atenção",
        tom: "media",
        texto:
          "Freio é sistema de segurança, e chiado que virou raspar seco costuma significar que o material de atrito acabou. Vale marcar a inspeção em vez de deixar para a próxima revisão.",
      },
    },
    {
      id: "buraco",
      quando: "Aparece ao passar em buraco, lombada ou piso ruim",
      som: "Estalo seco, batida oca ou um 'toc-toc' que acompanha as irregularidades da rua.",
      causas: [
        "Bieletas e buchas da barra estabilizadora, origem de boa parte dos estalos de suspensão.",
        "Amortecedores gastos, que raramente quebram de uma vez: eles vão perdendo firmeza e você só percebe depois de trocar.",
        "Batentes ressecados ou coxins do amortecedor, que endurecem com o tempo e passam a bater.",
        "Algo solto que não é suspensão, de protetor de cárter a peça do escapamento encostando na carroceria.",
      ],
      observar: [
        "O barulho é sempre no mesmo canto do carro?",
        "O carro continua balançando depois de uma ondulação, em vez de assentar de uma vez?",
        "Piorou depois de um impacto específico, tipo um buraco fundo?",
      ],
      urgencia: {
        rotulo: "Atenção",
        tom: "media",
        texto:
          "Costuma piorar devagar e mexe com estabilidade e desgaste de pneu. Não é motivo para parar o carro hoje, mas é o tipo de item que fica mais caro quanto mais espera.",
      },
    },
    {
      id: "volante",
      quando: "Aparece ao virar o volante",
      som: "Zumbido que muda com o esterço, estalo ritmado em curva fechada ou rangido ao manobrar parado.",
      causas: [
        "Junta homocinética, quando o estalo é ritmado, aparece em curva fechada e acompanha a velocidade da roda.",
        "Rolamento de roda, que costuma dar um zumbido que muda de volume conforme o carro pende para um lado.",
        "Direção elétrica ou hidráulica reclamando, comum ao esterçar com o carro parado.",
        "Suspensão sob torção, quando buchas já gastas aparecem só na curva.",
      ],
      observar: [
        "Acontece para os dois lados ou só para um?",
        "Muda de volume conforme a velocidade da roda?",
        "Aparece manobrando parado ou só com o carro andando?",
      ],
      urgencia: {
        rotulo: "Atenção",
        tom: "media",
        texto:
          "Junta homocinética e rolamento são itens que dão bastante aviso antes de virar problema sério, e ignorar o aviso é o que transforma peça em reboque. Vale investigar sem correria, mas sem deixar de lado.",
      },
    },
    {
      id: "parado",
      quando: "Aparece com o carro parado, em marcha lenta",
      som: "Chiado agudo com o motor frio, tinido metálico leve ou um zumbido constante que some quando o motor esquenta.",
      causas: [
        "Correia de acessórios ou tensor, principalmente quando o chiado aparece frio e some depois de alguns minutos.",
        "Rolamento de algum acessório, como alternador ou compressor do ar-condicionado.",
        "Escapamento com folga, que faz tinido leve com a vibração da marcha lenta.",
        "Ruído normal do próprio motor, que muita gente passa a notar depois de trocar de carro.",
      ],
      observar: [
        "Some quando o motor esquenta?",
        "Muda ao ligar o ar-condicionado?",
        "Acompanha a rotação do motor ou é constante?",
      ],
      urgencia: {
        rotulo: "Observar",
        tom: "baixa",
        texto:
          "Boa parte do que se ouve parado é comportamento normal do carro que você só passou a notar. Anote em que situação aparece e leve essa informação para a próxima revisão.",
      },
    },
    {
      id: "velocidade",
      quando: "Um som constante que aumenta com a velocidade",
      som: "Zumbido de fundo, como um avião distante, que cresce conforme o velocímetro sobe.",
      causas: [
        "Pneu com desgaste irregular, que costuma ser a causa mais comum e a mais barata de resolver.",
        "Rolamento de roda, quando o zumbido muda ao fazer uma curva longa para um lado e para o outro.",
        "Pneu fora do padrão do carro, incluindo medida trocada em uma troca recente.",
        "Alinhamento e balanceamento fora do ponto, que costumam vir junto com vibração no volante.",
      ],
      observar: [
        "Muda quando você troca de faixa em curva longa?",
        "Os pneus estão gastando mais de um lado da banda de rodagem?",
        "Começou logo depois de trocar ou rodiziar pneus?",
      ],
      urgencia: {
        rotulo: "Atenção",
        tom: "media",
        texto:
          "Vale começar pelo mais barato: olhar o desgaste dos pneus e a calibragem antes de autorizar qualquer serviço de suspensão.",
      },
    },
  ],

  pareAgora: {
    titulo: "Quando não vale deixar para depois",
    intro:
      "A maioria dos barulhos permite marcar a oficina com calma. Estes sinais, não. Se algum deles estiver junto com o som, pare em lugar seguro e procure ajuda profissional antes de continuar:",
    itens: [
      "Cheiro de queimado junto com o barulho, principalmente depois de descida longa ou de frear muito.",
      "Luz vermelha no painel acesa junto com o som: óleo, temperatura ou freio.",
      "Pedal de freio afundando mais que o normal ou com sensação de esponja.",
      "Barulho metálico forte vindo de uma roda, que aumenta com a velocidade e não some.",
      "Fumaça, vazamento visível embaixo do carro ou perda súbita de força.",
    ],
  },

  oficina: {
    titulo: "Como chegar na oficina sem pagar no escuro",
    intro: "Quatro hábitos que custam nada e mudam a conversa. Valem para qualquer barulho da lista acima.",
    cartoes: [
      {
        titulo: "Grave o som no celular",
        texto:
          "Trinta segundos com a janela aberta na situação em que o barulho aparece valem mais que qualquer descrição. Mecânico bom reconhece som, e som gravado não depende da sua memória.",
      },
      {
        titulo: "Anote QUANDO ele aparece",
        texto:
          "Frio ou quente, parado ou andando, virando para que lado, em que velocidade. É exatamente esse recorte que estreita a investigação e encurta a mão de obra de diagnóstico.",
      },
      {
        titulo: "Peça orçamento detalhado",
        texto:
          "Peça e mão de obra separadas, item por item. Orçamento com um valor único e a palavra 'revisão' é o formato que mais esconde serviço que você não pediu.",
      },
      {
        titulo: "Peça a peça velha de volta",
        texto:
          "É um direito seu e é o jeito mais simples de conferir que a troca aconteceu. Só avise antes do serviço, não depois.",
      },
    ],
  },

  convite: {
    titulo: "Levar isso para o seu carro",
    texto:
      "Este guia é geral de propósito, porque não sabe qual carro é o seu. No Mentorque você cadastra marca, modelo, ano e motor, descreve o sintoma com as suas palavras e recebe as causas prováveis, a urgência típica e o checklist para levar na oficina, ajustados ao seu carro. Também dá para registrar o que já foi feito, para o histórico não morar mais na sua memória.",
  },

  faq: [
    {
      p: "Dá para descobrir o barulho do carro pela internet?",
      r: "Dá para estreitar bastante as possibilidades, e é isso que este guia faz. Diagnóstico fechado, não: ele depende de ouvir o carro, inspecionar e às vezes rodar com ele. O que um guia bem-feito entrega é você chegar na oficina sabendo o que perguntar, em vez de aceitar a primeira resposta que aparecer.",
    },
    {
      p: "Barulho ao frear é sempre pastilha gasta?",
      r: "Não. Pastilha no fim é a causa mais comum, porque a maioria dos carros tem uma lingueta que chia de propósito para avisar. Mas disco empenado, pinça travada e até pastilha nova em assentamento fazem barulho parecido. A diferença costuma estar no detalhe: se o pedal treme, se o som some ao soltar o freio, se vem de um lado só.",
    },
    {
      p: "Posso continuar dirigindo com barulho no carro?",
      r: "Depende do barulho e de quem olhou. Estalo de suspensão em buraco geralmente permite rodar até marcar a oficina. Já barulho junto com luz vermelha no painel, cheiro de queimado ou pedal de freio esponjoso é caso de parar em lugar seguro e procurar ajuda. Na dúvida, trate como o caso mais sério.",
    },
    {
      p: "O que é aquele chiado que some quando o motor esquenta?",
      r: "Costuma ser correia de acessórios ou tensor: com o motor frio a borracha está mais dura e escorrega, e ao aquecer o chiado some. Não é o único motivo possível, mas é o primeiro item que um mecânico costuma checar quando o som tem esse padrão.",
    },
    {
      p: "O Mentorque diz qual é o problema do meu carro?",
      r: "O Mentorque mostra as causas prováveis para o sintoma que você descreve, a urgência típica de cada uma e um checklist para levar na oficina, tudo ajustado ao carro que você cadastra. Ele te prepara para a conversa com o mecânico, não substitui a inspeção presencial.",
    },
  ],
};
