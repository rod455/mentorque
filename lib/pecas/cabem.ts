// GERADO por `npm run pecas -- --medir`. Não editar à mão.
//
// Quem cabe em cada chapa, medido num Chromium de verdade. A rota
// /api/pecas desenha sem navegador e não tem como medir, então ela obedece
// a este arquivo. Rode o --medir de novo quando o banco do quiz mudar ou
// quando as chapas forem trocadas; a `npm run conferir:pecas` cobra o
// frescor.
//
// `largo` diz se o TÍTULO daquela peça coube na faixa larga do topo da
// chapa. Quando é falso, ele desce na coluna estreita. Os dois
// desenhistas leem daqui, para não medirem diferente.
export const CABEM: Record<string, { fonte: string; largo: boolean }[]> = {
  "desafio:feed": [
    {
      "fonte": "quiz:cheiro-queimado-freio",
      "largo": false
    },
    {
      "fonte": "quiz:luz-oleo-vermelha",
      "largo": true
    },
    {
      "fonte": "quiz:escapamento-barulho",
      "largo": false
    },
    {
      "fonte": "quiz:diesel-carro-passeio",
      "largo": true
    },
    {
      "fonte": "quiz:tracao-traseira",
      "largo": false
    },
    {
      "fonte": "quiz:revisao-antecipar",
      "largo": false
    },
    {
      "fonte": "quiz:pneu-nitrogenio",
      "largo": false
    },
    {
      "fonte": "quiz:superaquecimento-tampa",
      "largo": false
    },
    {
      "fonte": "quiz:fumaca-azul",
      "largo": false
    },
    {
      "fonte": "quiz:vibracao-velocidade",
      "largo": false
    },
    {
      "fonte": "quiz:farol-queimado-par",
      "largo": false
    },
    {
      "fonte": "quiz:ponto-morto-descida",
      "largo": true
    },
    {
      "fonte": "quiz:hibrido-tomada",
      "largo": true
    },
    {
      "fonte": "quiz:cambio-fluido",
      "largo": false
    },
    {
      "fonte": "quiz:tres-cilindros",
      "largo": false
    },
    {
      "fonte": "quiz:cilindrada-potencia",
      "largo": true
    },
    {
      "fonte": "quiz:nitro-filme",
      "largo": true
    },
    {
      "fonte": "quiz:oleo-intervalo",
      "largo": true
    },
    {
      "fonte": "quiz:luz-injecao-piscando",
      "largo": true
    },
    {
      "fonte": "quiz:mancha-chao",
      "largo": false
    },
    {
      "fonte": "quiz:freio-esponjoso",
      "largo": false
    },
    {
      "fonte": "quiz:carro-parado-tempo",
      "largo": false
    },
    {
      "fonte": "quiz:estepe-pressao",
      "largo": false
    },
    {
      "fonte": "quiz:eletrico-manutencao",
      "largo": true
    },
    {
      "fonte": "quiz:urbano-curto",
      "largo": false
    },
    {
      "fonte": "quiz:altitude-potencia",
      "largo": false
    },
    {
      "fonte": "quiz:balanceamento-motor",
      "largo": false
    },
    {
      "fonte": "quiz:marca-fiat-brasil",
      "largo": false
    },
    {
      "fonte": "quiz:etanol-70",
      "largo": true
    },
    {
      "fonte": "quiz:obd2-apaga-luz",
      "largo": true
    },
    {
      "fonte": "quiz:orcamento-perguntas",
      "largo": false
    },
    {
      "fonte": "quiz:premium-gasolina",
      "largo": false
    },
    {
      "fonte": "quiz:embreagem-pe",
      "largo": true
    },
    {
      "fonte": "quiz:combustivel-reserva",
      "largo": true
    },
    {
      "fonte": "quiz:freio-regenerativo",
      "largo": false
    },
    {
      "fonte": "quiz:aro-grande",
      "largo": false
    },
    {
      "fonte": "quiz:adas-confianca",
      "largo": false
    },
    {
      "fonte": "quiz:aerodinamica-asa",
      "largo": false
    },
    {
      "fonte": "quiz:ar-cardan",
      "largo": true
    },
    {
      "fonte": "quiz:pastilha-chiado",
      "largo": true
    },
    {
      "fonte": "quiz:agua-radiador",
      "largo": true
    },
    {
      "fonte": "quiz:pneu-pressao-onde",
      "largo": false
    },
    {
      "fonte": "quiz:turbo-desligar",
      "largo": false
    }
  ],
  "desafio:stories": [
    {
      "fonte": "quiz:bateria-descarregada",
      "largo": true
    },
    {
      "fonte": "quiz:consertar-ou-trocar",
      "largo": true
    },
    {
      "fonte": "quiz:oleo-nivel-quando",
      "largo": true
    },
    {
      "fonte": "quiz:cheiro-queimado-freio",
      "largo": true
    },
    {
      "fonte": "quiz:luz-oleo-vermelha",
      "largo": true
    },
    {
      "fonte": "quiz:escapamento-barulho",
      "largo": true
    },
    {
      "fonte": "quiz:cambio-automatico-neutro",
      "largo": true
    },
    {
      "fonte": "quiz:diesel-carro-passeio",
      "largo": true
    },
    {
      "fonte": "quiz:pneu-medida-trocar",
      "largo": true
    },
    {
      "fonte": "quiz:tsi-downsizing",
      "largo": true
    },
    {
      "fonte": "quiz:tracao-traseira",
      "largo": true
    },
    {
      "fonte": "quiz:revisao-antecipar",
      "largo": true
    },
    {
      "fonte": "quiz:pneu-nitrogenio",
      "largo": true
    },
    {
      "fonte": "quiz:superaquecimento-tampa",
      "largo": true
    },
    {
      "fonte": "quiz:fumaca-azul",
      "largo": true
    },
    {
      "fonte": "quiz:km-alto-comprar",
      "largo": true
    },
    {
      "fonte": "quiz:vibracao-velocidade",
      "largo": true
    },
    {
      "fonte": "quiz:farol-queimado-par",
      "largo": true
    },
    {
      "fonte": "quiz:ponto-morto-descida",
      "largo": true
    },
    {
      "fonte": "quiz:pneu-idade",
      "largo": true
    },
    {
      "fonte": "quiz:ipva-multa-revisao",
      "largo": true
    },
    {
      "fonte": "quiz:hibrido-tomada",
      "largo": true
    },
    {
      "fonte": "quiz:cambio-fluido",
      "largo": true
    },
    {
      "fonte": "quiz:app-motorista-desgaste",
      "largo": true
    },
    {
      "fonte": "quiz:tres-cilindros",
      "largo": true
    },
    {
      "fonte": "quiz:cilindrada-potencia",
      "largo": true
    },
    {
      "fonte": "quiz:nitro-filme",
      "largo": true
    },
    {
      "fonte": "quiz:oleo-intervalo",
      "largo": true
    },
    {
      "fonte": "quiz:luz-injecao-piscando",
      "largo": true
    },
    {
      "fonte": "quiz:correia-vs-corrente",
      "largo": true
    },
    {
      "fonte": "quiz:mancha-chao",
      "largo": true
    },
    {
      "fonte": "quiz:freio-esponjoso",
      "largo": true
    },
    {
      "fonte": "quiz:carro-parado-tempo",
      "largo": true
    },
    {
      "fonte": "quiz:alinhamento-quando",
      "largo": true
    },
    {
      "fonte": "quiz:estepe-pressao",
      "largo": true
    },
    {
      "fonte": "quiz:revisao-concessionaria",
      "largo": true
    },
    {
      "fonte": "quiz:estalo-esterco",
      "largo": true
    },
    {
      "fonte": "quiz:eletrico-manutencao",
      "largo": true
    },
    {
      "fonte": "quiz:cambio-solavanco",
      "largo": true
    },
    {
      "fonte": "quiz:urbano-curto",
      "largo": true
    },
    {
      "fonte": "quiz:altitude-potencia",
      "largo": true
    },
    {
      "fonte": "quiz:balanceamento-motor",
      "largo": true
    },
    {
      "fonte": "quiz:marca-fiat-brasil",
      "largo": true
    },
    {
      "fonte": "quiz:esquentar-parado",
      "largo": true
    },
    {
      "fonte": "quiz:etanol-70",
      "largo": true
    },
    {
      "fonte": "quiz:obd2-apaga-luz",
      "largo": true
    },
    {
      "fonte": "quiz:orcamento-perguntas",
      "largo": true
    },
    {
      "fonte": "quiz:cambio-cvt",
      "largo": true
    },
    {
      "fonte": "quiz:premium-gasolina",
      "largo": true
    },
    {
      "fonte": "quiz:ar-condicionado-consumo",
      "largo": true
    },
    {
      "fonte": "quiz:carro-usado-historico",
      "largo": true
    },
    {
      "fonte": "quiz:embreagem-pe",
      "largo": true
    },
    {
      "fonte": "quiz:combustivel-reserva",
      "largo": true
    },
    {
      "fonte": "quiz:freio-regenerativo",
      "largo": true
    },
    {
      "fonte": "quiz:aro-grande",
      "largo": true
    },
    {
      "fonte": "quiz:adas-confianca",
      "largo": true
    },
    {
      "fonte": "quiz:sedan-porta-malas",
      "largo": true
    },
    {
      "fonte": "quiz:aerodinamica-asa",
      "largo": true
    },
    {
      "fonte": "quiz:ar-cardan",
      "largo": true
    },
    {
      "fonte": "quiz:pastilha-chiado",
      "largo": true
    },
    {
      "fonte": "quiz:agua-radiador",
      "largo": true
    },
    {
      "fonte": "quiz:pneu-pressao-onde",
      "largo": true
    },
    {
      "fonte": "quiz:turbo-desligar",
      "largo": true
    }
  ],
  "dica:feed": [
    {
      "fonte": "quiz:farol-queimado-par",
      "largo": true
    },
    {
      "fonte": "quiz:pneu-idade",
      "largo": true
    },
    {
      "fonte": "quiz:hibrido-tomada",
      "largo": true
    },
    {
      "fonte": "quiz:cambio-fluido",
      "largo": true
    },
    {
      "fonte": "quiz:cilindrada-potencia",
      "largo": true
    },
    {
      "fonte": "quiz:oleo-intervalo",
      "largo": true
    },
    {
      "fonte": "quiz:luz-injecao-piscando",
      "largo": true
    },
    {
      "fonte": "quiz:mancha-chao",
      "largo": true
    },
    {
      "fonte": "quiz:freio-esponjoso",
      "largo": true
    },
    {
      "fonte": "quiz:estepe-pressao",
      "largo": true
    },
    {
      "fonte": "quiz:estalo-esterco",
      "largo": true
    },
    {
      "fonte": "quiz:eletrico-manutencao",
      "largo": true
    },
    {
      "fonte": "quiz:cambio-solavanco",
      "largo": true
    },
    {
      "fonte": "quiz:obd2-apaga-luz",
      "largo": true
    },
    {
      "fonte": "quiz:orcamento-perguntas",
      "largo": true
    },
    {
      "fonte": "quiz:cambio-cvt",
      "largo": true
    },
    {
      "fonte": "quiz:premium-gasolina",
      "largo": true
    },
    {
      "fonte": "quiz:carro-usado-historico",
      "largo": true
    },
    {
      "fonte": "quiz:embreagem-pe",
      "largo": true
    },
    {
      "fonte": "quiz:adas-confianca",
      "largo": true
    },
    {
      "fonte": "quiz:aerodinamica-asa",
      "largo": true
    },
    {
      "fonte": "quiz:ar-cardan",
      "largo": true
    },
    {
      "fonte": "quiz:pastilha-chiado",
      "largo": true
    },
    {
      "fonte": "quiz:pneu-pressao-onde",
      "largo": true
    },
    {
      "fonte": "quiz:turbo-desligar",
      "largo": true
    },
    {
      "fonte": "quiz:cheiro-queimado-freio",
      "largo": true
    },
    {
      "fonte": "quiz:luz-oleo-vermelha",
      "largo": true
    },
    {
      "fonte": "quiz:cambio-automatico-neutro",
      "largo": true
    },
    {
      "fonte": "quiz:pneu-nitrogenio",
      "largo": true
    },
    {
      "fonte": "quiz:fumaca-azul",
      "largo": true
    }
  ],
  "dica:stories": [
    {
      "fonte": "quiz:estalo-esterco",
      "largo": true
    },
    {
      "fonte": "quiz:obd2-apaga-luz",
      "largo": true
    }
  ],
  "curiosidade:feed": [],
  "curiosidade:stories": [],
  "pergunta:feed": [
    {
      "fonte": "quiz:premium-gasolina",
      "largo": false
    },
    {
      "fonte": "quiz:fumaca-azul",
      "largo": true
    },
    {
      "fonte": "quiz:eletrico-manutencao",
      "largo": true
    },
    {
      "fonte": "quiz:obd2-apaga-luz",
      "largo": true
    }
  ],
  "pergunta:stories": []
};
