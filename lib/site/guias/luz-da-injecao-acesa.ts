import type { Guia } from "./tipos";

// Guia: luz da injeção acesa.
//
// POR QUE ESTE ASSUNTO. É a busca de maior volume entre os sintomas que o app
// cobre, e a que mais gera decisão errada nos dois sentidos: gente que ignora
// por meses e gente que para no acostamento com medo. O ângulo que quase
// ninguém usa, e que é o certo, é a diferença entre FIXA e PISCANDO: uma pede
// agenda, a outra pede parar. Isso não é opinião nossa, é convenção do próprio
// sistema de diagnóstico dos carros.
//
// As causas conversam com o sintoma `cel` de lib/app/conteudo/sintomas.ts.
// Página e app precisam dizer a mesma coisa, senão quem baixa depois de ler
// aqui encontra outro conteúdo e perde a confiança nos dois.

export const guia: Guia = {
  caminho: "/luz-da-injecao-acesa",
  rotulo: "Guia de diagnóstico",
  h1: "Luz da injeção acesa: o que significa e o que fazer agora",
  tituloSeo: "Luz da injeção acesa: o que significa e o que fazer | Mentorque",
  descricaoSeo:
    "Luz do motor acesa? Entenda a diferença entre a luz fixa e a piscando, o que costuma estar por trás e quando dá para seguir viagem com segurança.",
  palavras: [
    "luz da injeção acesa",
    "luz do motor acesa",
    "luz da injeção piscando",
    "check engine aceso",
    "luz amarela do motor",
  ],
  chamada: "Luz da injeção acesa: fixa, piscando e o que fazer em cada caso",

  abertura: [
    "A luz da injeção, também chamada de luz do motor ou check engine, é a mais mal compreendida do painel. Ela não diz qual é o problema: ela diz que a central do carro guardou um código de erro. Pode ser uma tampa de combustível mal fechada e pode ser falha de ignição destruindo o catalisador, e o desenho no painel é exatamente o mesmo.",
    "Existe, porém, uma diferença que o próprio carro faz questão de mostrar e que quase nenhum texto explica: a luz FIXA e a luz PISCANDO não significam a mesma coisa. Entender esse detalhe já separa o caso de marcar oficina na semana do caso de parar hoje.",
  ],
  indiceTitulo: "Como a sua luz está se comportando?",

  blocos: [
    {
      id: "piscando",
      quando: "A luz está PISCANDO",
      som: "Ela pisca continuamente enquanto o motor está ligado, às vezes só quando você acelera ou sobe uma ladeira.",
      causas: [
        "Falha de ignição acontecendo agora. Piscar é a convenção que os fabricantes usam justamente para esse caso, porque combustível que não queima no cilindro sai quente pelo escapamento.",
        "Velas, cabos ou bobinas no fim da vida, que é a origem mais comum da falha de ignição.",
        "Bico injetor entupido ou com vazamento, que desregula a mistura de um cilindro só.",
        "Problema de compressão em um cilindro, mais raro e mais caro, que costuma vir com perda de força evidente.",
      ],
      observar: [
        "Pisca o tempo todo ou só quando você exige do motor?",
        "O carro está tremendo na marcha lenta ou perdendo força ao acelerar?",
        "Tem cheiro forte de combustível não queimado no escapamento?",
      ],
      urgencia: {
        rotulo: "Pare",
        tom: "alta",
        texto:
          "Luz piscando é o carro pedindo para você parar de exigir dele. Continuar rodando assim costuma transformar um conserto de ignição num conserto de catalisador, que é outra ordem de grandeza. Reduza a exigência, evite estrada e leve para diagnóstico antes de voltar a usar normalmente.",
      },
    },
    {
      id: "fixa",
      quando: "A luz acendeu e ficou FIXA",
      som: "Acendeu em algum momento e permanece acesa, sem piscar, com o carro andando aparentemente normal.",
      causas: [
        "Sonda lambda ou sistema de emissões, que é uma das origens mais frequentes e costuma aparecer sem sintoma nenhum na direção.",
        "Sensores de mistura fora da faixa esperada, o que também tende a aumentar o consumo aos poucos.",
        "Falha de ignição intermitente que já aconteceu e ficou registrada, mesmo que agora esteja se comportando.",
        "Alguma leitura fora do padrão depois de manutenção recente, principalmente quando alguma peça foi trocada por similar.",
      ],
      observar: [
        "Acendeu depois de abastecer, de uma revisão ou de uma chuva forte?",
        "O consumo mudou desde que ela acendeu?",
        "Ela apaga sozinha e volta depois de alguns dias?",
      ],
      urgencia: {
        rotulo: "Atenção",
        tom: "media",
        texto:
          "Fixa, sem perda de força e sem barulho novo, geralmente permite rodar até marcar a oficina. O que não vale é conviver com ela por meses: enquanto está acesa, um segundo problema que aparecer não tem como avisar, porque a luz já está ligada.",
      },
    },
    {
      id: "tampa",
      quando: "Acendeu logo depois de abastecer",
      som: "Você abasteceu, rodou alguns quilômetros e a luz acendeu, sem nenhuma outra mudança no comportamento do carro.",
      causas: [
        "Tampa do tanque mal fechada ou com a borracha ressecada. O sistema que controla vapores de combustível precisa do tanque vedado, e ele acusa quando não está.",
        "Combustível fora de especificação do posto, que pode desregular a mistura por alguns tanques.",
        "Coincidência: a luz ia acender de qualquer jeito e o abastecimento foi só o momento.",
      ],
      observar: [
        "A tampa deu aquele estalo de travamento quando você fechou?",
        "A borracha de vedação da tampa está inteira e macia?",
        "A luz apagou sozinha depois de alguns dias rodando?",
      ],
      urgencia: {
        rotulo: "Observar",
        tom: "baixa",
        texto:
          "Vale abrir e fechar a tampa direito e rodar alguns dias antes de gastar com diagnóstico. Muitos carros apagam a luz sozinhos depois de confirmar que o problema sumiu. Se não apagar, aí o código precisa ser lido.",
      },
    },
    {
      id: "outras-luzes",
      quando: "Ela acendeu junto com outra luz",
      som: "A luz da injeção não veio sozinha: tem outra ao lado, principalmente se alguma delas for vermelha.",
      causas: [
        "Luz vermelha de óleo ou de temperatura junto: aí quem manda é a vermelha, e ela é caso de parar.",
        "Luz de bateria junto, que costuma apontar para alternador e pode desligar o carro no meio do caminho.",
        "Luz de ABS ou de freio junto, comum quando algum sensor de roda parou de responder.",
        "Várias luzes acendendo ao mesmo tempo, que muitas vezes é problema elétrico de alimentação e não quatro defeitos.",
      ],
      observar: [
        "Alguma das luzes acesas é vermelha?",
        "O ponteiro de temperatura passou do meio?",
        "As luzes acenderam todas juntas ou uma de cada vez?",
      ],
      urgencia: {
        rotulo: "Pare",
        tom: "alta",
        texto:
          "Amarelo avisa, vermelho manda parar. Se tiver qualquer luz vermelha acesa junto, pare em lugar seguro antes de decidir qualquer outra coisa. A luz da injeção, nesse cenário, é a menos urgente das duas.",
      },
    },
  ],

  pareAgora: {
    titulo: "Quando não vale seguir viagem",
    intro:
      "Luz da injeção sozinha e fixa quase nunca é emergência. Estes sinais, junto com ela, são:",
    itens: [
      "A luz está piscando, ainda mais se o carro estiver tremendo ou perdendo força.",
      "Qualquer luz vermelha acesa junto: óleo, temperatura ou freio.",
      "Ponteiro de temperatura acima do meio, ou fumaça saindo do capô.",
      "Cheiro forte de combustível, dentro ou fora do carro.",
      "Perda de força que apareceu junto com a luz e não passa.",
    ],
  },

  oficina: {
    titulo: "Como chegar na oficina sem pagar no escuro",
    intro:
      "Luz da injeção é o sintoma em que mais se paga por serviço que não resolve, porque sem ler o código a oficina está adivinhando junto com você.",
    cartoes: [
      {
        titulo: "Exija a leitura do código",
        texto:
          "Nenhum diagnóstico honesto de luz da injeção começa sem scanner. Peça o código, anote a letra e os quatro números, e leve isso com você. Código na mão é o que impede a conversa de virar 'pode ser várias coisas'.",
      },
      {
        titulo: "Anote quando ela acendeu",
        texto:
          "Depois de abastecer, depois de uma revisão, depois de chuva, na subida, com o motor frio. O momento estreita a investigação mais do que qualquer palpite de peça.",
      },
      {
        titulo: "Não deixe apagar a luz e pronto",
        texto:
          "Apagar o código sem consertar a causa faz a luz voltar em alguns dias, e você paga duas vezes. Apagar só faz sentido depois do reparo, para confirmar que o erro não volta.",
      },
      {
        titulo: "Peça orçamento detalhado",
        texto:
          "Peça e mão de obra separadas, item por item. Orçamento com um valor único e a palavra 'revisão' é o formato que mais esconde serviço que você não pediu.",
      },
    ],
  },

  convite: {
    titulo: "Ler o código do seu carro sem depender da oficina",
    texto:
      "Este guia é geral de propósito, porque não sabe qual carro é o seu nem qual código a central guardou. No Mentorque você cadastra o carro, descreve o que está acontecendo e recebe as causas prováveis com a urgência típica de cada uma. Com um adaptador OBD2 comum, dá para ler o código você mesmo antes de chegar na oficina, o que muda completamente a conversa.",
  },

  faq: [
    {
      p: "Posso dirigir com a luz da injeção acesa?",
      r: "Com a luz FIXA, sem perda de força, sem barulho novo e sem outra luz acesa, normalmente dá para rodar até marcar a oficina. Com a luz PISCANDO, não: piscar é a convenção usada para falha de ignição acontecendo agora, e continuar exigindo do motor costuma danificar o catalisador. Na dúvida entre as duas, trate como o caso mais sério.",
    },
    {
      p: "Qual a diferença entre a luz fixa e a luz piscando?",
      r: "Fixa significa que existe um erro registrado que precisa ser investigado. Piscando significa que algo está acontecendo neste momento e pode causar dano, quase sempre falha de ignição jogando combustível não queimado no escapamento. É a mesma lâmpada dizendo duas coisas bem diferentes, e é o detalhe mais útil que você pode observar antes de decidir.",
    },
    {
      p: "A luz da injeção pode acender por causa da tampa do tanque?",
      r: "Pode, e acontece com frequência. O sistema que controla vapores de combustível precisa do tanque vedado, e uma tampa mal fechada ou com a borracha ressecada é suficiente para registrar erro. Vale fechar direito, esperar o estalo, e rodar alguns dias: muitos carros apagam a luz sozinhos depois de confirmar que o problema sumiu.",
    },
    {
      p: "Dá para ler o código do erro em casa?",
      r: "Dá. Todo carro vendido no Brasil com injeção eletrônica moderna tem uma tomada de diagnóstico, quase sempre embaixo do painel do lado do motorista, e adaptadores OBD2 são baratos e comuns. O código não conserta nada sozinho, mas transforma 'a luz acendeu' em 'o erro é este', que é a diferença entre negociar e aceitar.",
    },
    {
      p: "Apagar a luz resolve o problema?",
      r: "Não. Apagar o código limpa o registro, não a causa: se o defeito continuar, a luz volta em alguns dias de uso. O uso legítimo de apagar é depois do reparo, para conferir se o erro reaparece. Oficina que apaga a luz e devolve o carro sem explicar a causa não resolveu nada.",
    },
    {
      p: "O Mentorque diz qual é o problema do meu carro?",
      r: "O Mentorque mostra as causas prováveis para o sintoma que você descreve, a urgência típica de cada uma e um checklist para levar na oficina, tudo ajustado ao carro que você cadastra. Ele te prepara para a conversa com o mecânico, não substitui a inspeção presencial.",
    },
  ],
};
