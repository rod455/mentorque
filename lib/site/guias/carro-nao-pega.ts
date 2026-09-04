import type { Guia } from "./tipos";

// Guia: o carro não pega.
//
// POR QUE ESTE ASSUNTO, E POR QUE ELE É DIFERENTE DOS OUTROS. Quem digita isso
// não está pesquisando, está PARADO na garagem com a chave na mão, atrasado.
// Então o guia começa pelo teste que a pessoa consegue fazer agora, sem
// ferramenta, e só depois explica a mecânica. Guia que abre com aula perde essa
// pessoa no primeiro parágrafo.
//
// O recorte é o SOM DA PARTIDA, e ele é bom porque divide o problema quase ao
// meio sem exigir conhecimento nenhum: motor girando devagar, clique seco sem
// girar, girando normal e não pegando, ou silêncio total. Cada um aponta para
// um conjunto diferente de suspeitos.
//
// Conversa com o sintoma `hard-start` de lib/app/conteudo/sintomas.ts.

export const guia: Guia = {
  caminho: "/carro-nao-pega",
  rotulo: "Guia de diagnóstico",
  h1: "O carro não pega: descubra o que é pelo som da partida",
  tituloSeo: "Carro não pega: o que pode ser e o que fazer agora | Mentorque",
  descricaoSeo:
    "O carro não liga? Descubra pelo som da partida se é bateria, motor de arranque ou combustível, faça o teste da luz do painel e saiba o que dizer para quem for te socorrer.",
  palavras: [
    "carro não pega",
    "carro não liga",
    "carro não pega de manhã",
    "carro não pega mas tem bateria",
    "carro faz clique e não liga",
  ],
  chamada: "O carro não pega: o que o som da partida revela",

  abertura: [
    "Se você está com a chave na mão e o carro não liga, comece por aqui: gire a chave e ESCUTE. O som que o carro faz nesse momento é a informação mais valiosa que existe, e ela some assim que alguém chega com um cabo de chupeta e resolve na força.",
    "Motor girando devagar, um clique seco sem girar nada, motor girando normal mas sem pegar, ou silêncio completo. São quatro sons diferentes que apontam para quatro conjuntos de causas diferentes. Saber qual é o seu evita trocar bateria boa e evita esperar guincho quando o problema era um cabo frouxo.",
  ],
  indiceTitulo: "Que som o seu carro faz ao girar a chave?",

  blocos: [
    {
      id: "girando-devagar",
      quando: "O motor gira devagar, arrastado",
      som: "Aquele arrastar preguiçoso, como se o carro estivesse sem forças, às vezes acompanhado das luzes do painel enfraquecendo.",
      causas: [
        "Bateria com carga baixa, que é de longe a causa mais comum desse som, principalmente na primeira partida do dia.",
        "Terminais da bateria oxidados ou frouxos. Corrosão esverdeada nos bornes atrapalha a passagem de corrente mesmo com bateria boa.",
        "Bateria no fim da vida útil, que costuma dar sinal por semanas antes de deixar na mão, sempre nas manhãs mais frias.",
        "Alternador não recarregando, quando a bateria está sendo descarregada aos poucos a cada uso.",
      ],
      observar: [
        "Acenda a luz interna antes de girar a chave: ela apaga ou enfraquece muito na hora da partida?",
        "Está acontecendo só na primeira partida do dia, ou também com o motor quente?",
        "A luz da bateria fica acesa depois que o carro pega?",
      ],
      urgencia: {
        rotulo: "Atenção",
        tom: "media",
        texto:
          "Chupeta resolve o dia, não o problema. Se o alternador não estiver recarregando, o carro morre de novo assim que você desligar. Vale testar carga da bateria e do alternador antes de simplesmente comprar bateria nova.",
      },
    },
    {
      id: "clique",
      quando: "Faz um clique seco e não gira",
      som: "Um 'tec' único e metálico, ou uma sequência rápida de cliques, sem o motor girar nada.",
      causas: [
        "Bateria bem descarregada: sobra energia para acionar o relé, não para girar o motor. É a causa mais frequente desse som.",
        "Terminais frouxos ou muito corroídos, que dão o mesmo sintoma de bateria fraca com a bateria em bom estado.",
        "Motor de arranque com defeito, quando o clique vem de um solenoide que aciona mas não movimenta.",
        "Cabo de massa solto, que é o defeito mais barato da lista e o mais esquecido.",
      ],
      observar: [
        "Foi um clique só, ou vários seguidos como uma metralhadora?",
        "As luzes do painel acendem com força normal?",
        "Balançando os terminais com a mão, eles se mexem?",
      ],
      urgencia: {
        rotulo: "Atenção",
        tom: "media",
        texto:
          "Vários cliques seguidos apontam mais para bateria; um clique único e forte aponta mais para arranque. A diferença importa porque uma é peça barata e a outra não, e é exatamente essa a informação que se perde quando alguém dá a chupeta antes de você reparar no som.",
      },
    },
    {
      id: "gira-e-nao-pega",
      quando: "Gira normal, com força, mas não pega",
      som: "O motor roda firme, no ritmo de sempre, e simplesmente não entra em funcionamento.",
      causas: [
        "Combustível não chegando: bomba, filtro entupido ou relé da bomba. Costuma ser a primeira suspeita quando a partida está forte.",
        "Sistema de ignição sem faísca, por velas muito gastas, bobina ou sensor de rotação.",
        "Sensor de posição do motor com falha, que é justamente o que diz à central quando injetar.",
        "Tanque mais vazio do que o marcador indica, que parece piada até acontecer com alguém.",
      ],
      observar: [
        "Ao girar a chave para a posição de contato, você ouve um zumbido curto de dois segundos vindo de trás? É a bomba pressurizando.",
        "O carro chegou a pegar e morrer em seguida, ou nem chegou a pegar?",
        "Tem cheiro forte de combustível depois de várias tentativas?",
      ],
      urgencia: {
        rotulo: "Atenção",
        tom: "media",
        texto:
          "Partida forte descarta bateria e arranque, que já é meio caminho. Evite insistir muitas vezes seguidas: além de descarregar a bateria, encharcar o motor de combustível dificulta a partida quando o problema for resolvido.",
      },
    },
    {
      id: "silencio",
      quando: "Silêncio total, nada acontece",
      som: "Você gira a chave e não acontece absolutamente nada, às vezes com o painel apagado.",
      causas: [
        "Bateria completamente descarregada ou cabo principal desconectado.",
        "Trava de segurança do câmbio: automático fora de P ou N, manual sem o pedal de embreagem pisado até o fim.",
        "Imobilizador não reconhecendo a chave, comum quando a bateria da própria chave acabou.",
        "Fusível ou relé de partida queimado, ou o interruptor de ignição com defeito.",
      ],
      observar: [
        "O painel acende quando você põe a chave no contato?",
        "No automático, tente em N além de P. No manual, pise a embreagem até o fim.",
        "A luz do imobilizador, aquele desenho de carro com cadeado, está piscando?",
      ],
      urgencia: {
        rotulo: "Observar",
        tom: "baixa",
        texto:
          "Silêncio com painel aceso raramente é motor: costuma ser trava de segurança, chave ou fusível. Vale gastar dois minutos com o câmbio, a embreagem e a bateria da chave antes de chamar socorro.",
      },
    },
  ],

  pareAgora: {
    titulo: "Quando não vale insistir",
    intro:
      "Tentar de novo é o reflexo natural, e na maioria das vezes é inofensivo. Nestes casos, não é:",
    itens: [
      "Cheiro forte de combustível dentro ou fora do carro: pare de tentar e ventile antes de qualquer coisa.",
      "Cheiro de queimado ou de plástico derretido ao girar a chave.",
      "Fumaça saindo de qualquer lugar, principalmente perto da bateria.",
      "O carro pegou, mas com a luz vermelha de óleo ou de temperatura acesa: desligue em vez de sair andando.",
      "Barulho metálico forte na partida, diferente de tudo que o carro fazia antes.",
    ],
  },

  oficina: {
    titulo: "Como não pagar por peça que não era o problema",
    intro:
      "Carro que não pega é o campeão de troca desnecessária, porque a pressa empurra para o palpite mais caro. Estes quatro hábitos custam nada.",
    cartoes: [
      {
        titulo: "Grave o som da partida",
        texto:
          "Antes de qualquer chupeta, grave dez segundos girando a chave. É a única testemunha do sintoma, e ela desaparece assim que o carro liga na base da ajuda de fora.",
      },
      {
        titulo: "Peça o teste, não a peça",
        texto:
          "Bateria e alternador se testam em minutos, com aparelho, e o teste custa muito menos que a peça. Peça o resultado do teste antes de autorizar a troca de qualquer uma das duas.",
      },
      {
        titulo: "Comece pelo mais barato",
        texto:
          "Terminais, cabo de massa e fusível são conferência de minutos e resolvem uma parte real dos casos. Nenhuma oficina honesta se incomoda de começar por aí.",
      },
      {
        titulo: "Peça orçamento detalhado",
        texto:
          "Peça e mão de obra separadas, item por item. Orçamento com um valor único e a palavra 'revisão' é o formato que mais esconde serviço que você não pediu.",
      },
    ],
  },

  convite: {
    titulo: "Levar isso para o seu carro",
    texto:
      "Este guia é geral de propósito, porque não sabe qual carro é o seu. No Mentorque você cadastra marca, modelo, ano e motor, descreve o sintoma com as suas palavras e recebe as causas prováveis, a urgência típica e o checklist para levar na oficina, ajustados ao seu carro. Também dá para registrar quando a bateria foi trocada, que é a informação que sempre falta justamente no dia em que ela deixa você na mão.",
  },

  faq: [
    {
      p: "O carro não pega mas tem bateria. O que pode ser?",
      r: "Se o painel acende com força e o motor gira normal, a bateria provavelmente está fazendo o trabalho dela e o problema está em combustível ou em ignição: bomba, filtro, velas, bobina ou sensor de rotação. Se o motor gira devagar ou só dá um clique, a bateria pode ter carga suficiente para as luzes e não para a partida, que exige muito mais corrente. Painel aceso não é prova de bateria boa.",
    },
    {
      p: "Por que o carro só não pega de manhã?",
      r: "Frio e tempo parado são as duas condições que mais expõem bateria no fim da vida: a carga cai e a partida exige mais. Esse padrão de falhar só na primeira partida do dia e funcionar o resto do tempo é típico, e costuma ser o aviso que vem semanas antes de a bateria deixar você na mão de vez. Vale testar a carga antes de virar emergência.",
    },
    {
      p: "O que significa o carro fazer clique e não ligar?",
      r: "O clique é o relé conseguindo acionar, sem energia ou sem mecanismo para girar o motor. Vários cliques rápidos seguidos apontam mais para bateria descarregada; um clique único e forte aponta mais para motor de arranque ou cabo de massa. Reparar em qual dos dois é o seu evita trocar a peça errada.",
    },
    {
      p: "Dar chupeta pode estragar o carro?",
      r: "Feito na ordem correta e com cabos em bom estado, é um procedimento comum. O que traz risco é inverter a polaridade, usar cabos finos demais ou fazer isso em carro com sistema elétrico já apresentando defeito. E vale lembrar do principal: chupeta resolve o dia, não a causa. Se o alternador não estiver recarregando, o carro morre de novo assim que desligar.",
    },
    {
      p: "O Mentorque diz qual é o problema do meu carro?",
      r: "O Mentorque mostra as causas prováveis para o sintoma que você descreve, a urgência típica de cada uma e um checklist para levar na oficina, tudo ajustado ao carro que você cadastra. Ele te prepara para a conversa com o mecânico, não substitui a inspeção presencial.",
    },
  ],
};
