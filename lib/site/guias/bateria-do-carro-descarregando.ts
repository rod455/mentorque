import type { Guia } from "./tipos";

// Guia: a bateria do carro descarregando.
//
// POR QUE ESTE ASSUNTO, E ESCOLHIDO POR DADO. Em 15/09/2026 o Search Console
// mostrou 24 impressões em 28 dias e, pela primeira vez, uma família inteira de
// consultas de categoria em volta da partida: "carro da partida mas não pega"
// (4 impressões), "nao pega" (2), "carro não pega" (1) e "carro nao quer pegar"
// (1). O `/carro-nao-pega` é quem responde a elas, e este guia é o irmão dele.
//
// O RECORTE É OUTRO, DE PROPÓSITO, e é isso que impede a página de ser uma
// cópia. O guia de partida responde "não liga AGORA", com a pessoa parada na
// garagem. Este responde uma pergunta diferente, que é a que faz a pessoa voltar
// a procurar depois de já ter tomado chupeta: "por que ela vive arriando?".
//
// O método é o mesmo que funcionou no guia de barulho: em vez de listar peça,
// ensinar a ESTREITAR. Aqui o que estreita é QUANDO a bateria arria, porque
// isso separa quase sozinho os três suspeitos que se confundem (bateria no fim,
// alternador não recarregando e consumo parasita). Trocar bateria quando o
// problema era um dos outros dois é o erro mais caro e mais comum do assunto, e
// a pessoa só descobre quando a bateria nova arria também.
//
// Conversa com o sintoma `battery-draining` de lib/app/conteudo/sintomas.ts.

export const guia: Guia = {
  caminho: "/bateria-do-carro-descarregando",
  publicadoEm: "2026-09-15",
  atualizadoEm: "2026-09-15",
  rotulo: "Guia de diagnóstico",
  h1: "Bateria descarregando: é a bateria, o alternador ou algo consumindo?",
  tituloSeo: "Bateria do carro descarregando: o que pode ser | Mentorque",
  descricaoSeo:
    "A bateria do carro vive arriando? Descubra pelo momento em que ela descarrega se o problema é a bateria, o alternador ou algo consumindo energia com o carro desligado.",
  palavras: [
    "bateria do carro descarregando",
    "bateria do carro arriando",
    "bateria descarrega sozinha",
    "bateria nova descarregando",
    "carro arria com o carro parado",
    "bateria não segura carga",
  ],
  chamada: "Bateria descarregando: a bateria, o alternador ou um consumo",

  abertura: [
    "Bateria arriando quase nunca é uma pergunta sobre a bateria. São três suspeitos que dão exatamente o mesmo sintoma: a bateria chegando ao fim, o alternador não recarregando direito e alguma coisa consumindo energia com o carro desligado. Trocar a bateria quando o problema era um dos outros dois é o erro mais caro do assunto, e ele só aparece semanas depois, quando a bateria nova arria também.",
    "A boa notícia é que dá para separar os três sem ferramenta nenhuma, reparando em QUANDO ela arria. Ficou dias parada? Arriou de um dia para o outro mesmo rodando? Só custa na primeira partida da manhã? Morreu com o carro andando? Cada resposta aponta para um suspeito diferente, e chegar na oficina com essa frase pronta muda a conversa e encurta o serviço.",
  ],
  indiceTitulo: "Em que momento a sua bateria arria?",

  blocos: [
    {
      id: "dias-parado",
      quando: "Arria quando o carro fica alguns dias parado",
      som: "O carro roda bem durante a semana, fica parado no fim de semana ou nas férias, e na hora de sair não tem força para girar o motor.",
      causas: [
        "Consumo parasita: alguma coisa continua ligada com o carro desligado. Rastreador, alarme instalado depois, som, câmera de ré, carregador esquecido na tomada ou um acessório mal instalado são os campeões.",
        "Bateria perto do fim da vida útil, que ainda segura o uso diário mas não aguenta ficar parada.",
        "Luz de porta, de porta-malas ou de porta-luvas que não apaga, o que é fácil de conferir e frequentemente esquecido.",
        "Uso só em trajetos curtos, em que o alternador nunca chega a devolver o que a partida consumiu. É o mesmo padrão que também castiga outras peças.",
      ],
      observar: [
        "Quantos dias parado ela aguenta? Dois é muito diferente de duas semanas.",
        "Foi instalado algum acessório elétrico nos últimos meses, mesmo que pequeno?",
        "Abra o porta-malas e o porta-luvas à noite, no escuro: alguma luz fica acesa quando deveria apagar?",
      ],
      urgencia: {
        rotulo: "Atenção",
        tom: "media",
        texto:
          "Este é o padrão clássico de consumo parasita, e é o único dos três que a troca de bateria não resolve. Antes de comprar bateria, peça para medir a corrente de fuga com o carro desligado: é um teste de minutos e evita pagar duas vezes.",
      },
    },
    {
      id: "de-um-dia-para-o-outro",
      quando: "Arria de um dia para o outro, mesmo rodando todo dia",
      som: "Você usa o carro normalmente, estaciona à noite com tudo funcionando, e de manhã ele mal gira ou só dá um clique.",
      causas: [
        "Consumo parasita mais forte que o do caso anterior, drenando a bateria em poucas horas.",
        "Bateria que já não segura carga: ela aceita a carga do alternador e a perde parada, o que costuma ser o fim da vida útil dela.",
        "Alternador entregando menos do que deveria, então a bateria sai de casa cheia pela metade e não sobra margem para a noite.",
        "Terminais oxidados ou frouxos, que atrapalham tanto a carga quanto a partida. É o defeito mais barato da lista.",
      ],
      observar: [
        "Depois de rodar meia hora e desligar, o carro pega normal se você tentar em seguida?",
        "Os bornes têm aquele pó esbranquiçado ou esverdeado em volta?",
        "Está acontecendo todo dia ou só depois de dias em que o carro rodou pouco?",
      ],
      urgencia: {
        rotulo: "Atenção",
        tom: "media",
        texto:
          "Quando o carro pega bem logo depois de rodar e falha na manhã seguinte, a energia está indo embora durante a noite. Isso aponta muito mais para consumo parasita ou bateria que não segura carga do que para alternador.",
      },
    },
    {
      id: "so-de-manha",
      quando: "Só custa a pegar na primeira partida do dia",
      som: "De manhã o motor gira devagar, arrastado, e no resto do dia o carro pega normal, como se nada tivesse acontecido.",
      causas: [
        "Bateria perdendo capacidade com a idade: o frio e as horas paradas expõem a perda antes de tudo o mais.",
        "Bateria correta, porém subdimensionada para o carro ou para o uso, quando alguém trocou por uma menor para economizar.",
        "Terminais com mau contato, que somam resistência justamente no momento de maior exigência.",
        "Motor de partida exigindo mais corrente do que deveria, o que é menos comum e aparece junto com barulho diferente ao girar.",
      ],
      observar: [
        "Acenda a luz interna antes de girar a chave: ela enfraquece muito na partida?",
        "Qual a data de fabricação estampada na própria bateria? Ela é a idade real, não a da nota fiscal.",
        "Piora nos dias mais frios e melhora nos dias quentes?",
      ],
      urgencia: {
        rotulo: "Atenção",
        tom: "media",
        texto:
          "Este é o aviso mais educado que uma bateria dá, e costuma vir semanas antes de ela deixar alguém na mão. É o momento de testar a carga com calma, não de esperar virar emergência. O mesmo som visto do outro lado está no [[/carro-nao-pega#girando-devagar|guia de quando o carro não pega]].",
      },
    },
    {
      id: "luz-acesa-andando",
      quando: "A luz da bateria acende com o carro andando",
      som: "Aquele desenho de bateria no painel acende ou fica piscando com o motor já funcionando, às vezes junto com as luzes enfraquecendo ou a direção pesando.",
      causas: [
        "Alternador não recarregando, por escova, regulador ou o próprio alternador.",
        "Correia do alternador solta, gasta ou arrebentada. Quando ela arrebenta, costuma levar junto a direção hidráulica e o arrefecimento, por isso o carro fica estranho de uma vez só.",
        "Fiação ou conexão do alternador com defeito, entregando menos do que a bateria precisa.",
        "Bateria no fim exigindo do alternador mais do que ele consegue sustentar.",
      ],
      observar: [
        "A luz acendeu andando ou já estava acesa desde a partida?",
        "A direção ficou pesada ou o ponteiro de temperatura subiu junto?",
        "As luzes do painel e os faróis enfraquecem quando o motor cai para a marcha lenta?",
      ],
      urgencia: {
        rotulo: "Prioridade",
        tom: "alta",
        texto:
          "Esta é a única das quatro situações em que o carro pode parar no meio do caminho, porque ele passa a rodar consumindo o que resta da bateria. Não é caso de seguir viagem contando com a sorte: procure ajuda antes de desligar o motor, porque depois de desligado ele pode não voltar a pegar.",
      },
    },
    {
      id: "depois-da-chupeta",
      quando: "Pega na chupeta e arria de novo pouco depois",
      som: "O cabo de outro carro resolve na hora, você roda tranquilo, e no dia seguinte, ou às vezes no mesmo dia, está tudo de novo como estava.",
      causas: [
        "O problema nunca foi resolvido: a chupeta empresta energia para a partida e não conserta a causa de a energia ter sumido.",
        "Alternador não recarregando, e aí a cada desligada o carro volta ao ponto de partida.",
        "Bateria que já não aceita carga, mesmo com o alternador trabalhando corretamente.",
        "Consumo parasita continuando a drenar, independente de quanto o carro rodou.",
      ],
      observar: [
        "Depois da chupeta você rodou bastante ou desligou em poucos minutos?",
        "A luz da bateria ficou acesa depois que o carro pegou?",
        "Já trocou a bateria por causa disso e o problema voltou?",
      ],
      urgencia: {
        rotulo: "Atenção",
        tom: "media",
        texto:
          "Bateria nova que arria de novo é a assinatura de que a causa está em outro lugar, quase sempre no alternador ou num consumo parasita. Nesse ponto, insistir em trocar peça sem teste é o caminho mais caro. Se além disso o carro dá partida e não pega, o recorte está em [[/carro-nao-pega#gira-e-nao-pega|gira normal mas não pega]].",
      },
    },
  ],

  pareAgora: {
    titulo: "Quando não é caso de tentar de novo",
    intro:
      "Na maioria das vezes uma bateria arriada é só um transtorno. Nestes casos, não é, e insistir piora:",
    itens: [
      "A caixa da bateria está estufada, deformada ou com vazamento visível. Não dê chupeta nela.",
      "Cheiro de ovo podre ou de enxofre perto da bateria, que pode indicar que ela está gaseando.",
      "Faísca, fumaça ou aquecimento nos bornes ao tentar a partida.",
      "A [[/luz-da-injecao-acesa#outras-luzes|luz vermelha de óleo ou de temperatura]] acesa junto com a da bateria: aí desligue em vez de continuar.",
      "Cheiro de queimado vindo do compartimento do motor depois que o carro pegou.",
    ],
  },

  oficina: {
    titulo: "Como não comprar bateria duas vezes",
    intro:
      "Bateria é a peça que mais se troca sem necessidade, porque o sintoma é claro e o palpite é barato de dar. Estes quatro hábitos custam nada e resolvem isso.",
    cartoes: [
      {
        titulo: "Peça os dois testes, não a peça",
        texto:
          "Bateria e alternador se testam em minutos, com aparelho, e o teste custa uma fração da peça. Peça o resultado dos dois antes de autorizar qualquer troca: é exatamente esse par que separa os suspeitos.",
      },
      {
        titulo: "Peça a medida de fuga",
        texto:
          "Se ela arria com o carro parado, o teste que importa é o de corrente de fuga, feito com o carro desligado. É ele que encontra o rastreador, o alarme ou o acessório que ninguém lembrava de ter instalado.",
      },
      {
        titulo: "Olhe a data na bateria",
        texto:
          "A data de fabricação vem estampada na própria caixa. Ela diz a idade real da peça, que muitas vezes não é a que o dono anterior contou nem a da nota da última troca.",
      },
      {
        titulo: "Comece pelo mais barato",
        texto:
          "Limpar e apertar os terminais e conferir o cabo de massa é conferência de minutos e resolve uma parte real dos casos. Nenhuma oficina honesta se incomoda de começar por aí.",
      },
    ],
  },

  convite: {
    titulo: "Levar isso para o seu carro",
    texto:
      "Este guia é geral de propósito, porque não sabe qual carro é o seu. No Mentorque você cadastra marca, modelo, ano e motor, descreve o sintoma com as suas palavras e recebe as causas prováveis, a urgência típica e o checklist para levar na oficina, ajustados ao seu carro. E dá para registrar a data em que a bateria foi trocada, que é justamente a informação que some quando ela deixa você na mão dois anos depois.",
  },

  faq: [
    {
      p: "Bateria nova descarregando, o que pode ser?",
      r: "Bateria nova que arria é a assinatura mais clara de que o problema não era a bateria. Os dois suspeitos que sobram são o alternador, que não está recarregando o que a partida consome, e o consumo parasita, alguma coisa que continua puxando energia com o carro desligado. Rastreador, alarme instalado depois, som e acessórios mal instalados são os mais comuns. Os dois casos se identificam com teste, e o teste custa muito menos que a bateria que já foi comprada à toa.",
    },
    {
      p: "Como saber se é a bateria ou o alternador?",
      r: "O momento em que o problema aparece separa bem os dois. Se o carro morre ou as luzes enfraquecem com ele andando, ou se a luz da bateria acende no painel com o motor funcionando, o suspeito é o alternador. Se o carro roda sem nenhum sintoma e só falha ao ser ligado depois de horas parado, o suspeito é a bateria ou algum consumo. Em qualquer dos casos, os dois se testam em minutos, e vale pedir o resultado dos dois antes de trocar qualquer um.",
    },
    {
      p: "Por que a bateria descarrega com o carro parado?",
      r: "Todo carro moderno consome um pouquinho de energia desligado, para manter alarme, central e memórias. Isso é normal e uma bateria saudável aguenta. Quando o consumo passa do normal, quase sempre há algo instalado depois de fábrica ainda ligado, ou uma luz interna que não apaga. Uma bateria já no fim da vida também some com a carga sozinha, mesmo sem nada consumindo. O teste que separa os dois é o de corrente de fuga.",
    },
    {
      p: "Quanto tempo dura a bateria de um carro?",
      r: "Depende muito mais do uso do que do calendário: calor, trajetos curtos, muitas partidas por dia e ficar longos períodos parado encurtam a vida dela. Em vez de contar no palpite, olhe a data de fabricação estampada na própria caixa da bateria, que é a idade real da peça. E trate o sinal como mais confiável que a data: quando ela começa a custar só na primeira partida da manhã, está avisando.",
    },
    {
      p: "Dar chupeta resolve o problema?",
      r: "Chupeta resolve o dia, não a causa. Ela empresta energia para o motor pegar, e nada mais. Se a bateria não estava segurando carga, se o alternador não está recarregando ou se existe algo consumindo com o carro desligado, tudo isso continua exatamente igual depois que o carro liga. Bateria que precisa de chupeta com frequência é um sintoma para investigar, não uma rotina para adotar.",
    },
    {
      p: "O Mentorque diz qual é o problema do meu carro?",
      r: "O Mentorque mostra as causas prováveis para o sintoma que você descreve, a urgência típica de cada uma e um checklist para levar na oficina, tudo ajustado ao carro que você cadastra. Ele te prepara para a conversa com o mecânico, não substitui a inspeção presencial.",
    },
  ],
};
