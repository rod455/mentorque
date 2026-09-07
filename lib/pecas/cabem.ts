// GERADO por `npm run pecas -- --medir`. Não editar à mão.
//
// Quem cabe em cada chapa, medido num Chromium de verdade. A rota
// /api/pecas desenha sem navegador e não tem como medir, então ela obedece
// a este arquivo. Rode o --medir de novo quando o banco do quiz mudar ou
// quando as chapas forem trocadas; a `npm run conferir:pecas` cobra o
// frescor.
//
// `largo` diz se o TÍTULO daquela peça coube na faixa larga do topo da
// chapa. Quando é falso, ele desce na coluna estreita.
//
// `escala` é o tamanho do corpo, e 1 é o tamanho cheio. Menor que 1
// significa que aquela peça só coube com a fonte apertada, dentro do
// limite que o dono abriu em 07/09/2026. Os dois desenhistas leem daqui,
// para não medirem diferente.
export const CABEM: Record<string, { fonte: string; largo: boolean; escala: number }[]> = {
  "desafio:feed": [
    {
      "fonte": "quiz:oleo-nivel-quando",
      "largo": false,
      "escala": 0.82
    },
    {
      "fonte": "quiz:cheiro-queimado-freio",
      "largo": false,
      "escala": 1
    },
    {
      "fonte": "quiz:luz-oleo-vermelha",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:escapamento-barulho",
      "largo": false,
      "escala": 1
    },
    {
      "fonte": "quiz:cambio-automatico-neutro",
      "largo": false,
      "escala": 0.94
    },
    {
      "fonte": "quiz:diesel-carro-passeio",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:pneu-medida-trocar",
      "largo": false,
      "escala": 0.88
    },
    {
      "fonte": "quiz:tsi-downsizing",
      "largo": false,
      "escala": 0.82
    },
    {
      "fonte": "quiz:tracao-traseira",
      "largo": false,
      "escala": 1
    },
    {
      "fonte": "quiz:revisao-antecipar",
      "largo": false,
      "escala": 1
    },
    {
      "fonte": "quiz:pneu-nitrogenio",
      "largo": false,
      "escala": 1
    },
    {
      "fonte": "quiz:superaquecimento-tampa",
      "largo": false,
      "escala": 1
    },
    {
      "fonte": "quiz:fumaca-azul",
      "largo": false,
      "escala": 1
    },
    {
      "fonte": "quiz:km-alto-comprar",
      "largo": false,
      "escala": 0.82
    },
    {
      "fonte": "quiz:vibracao-velocidade",
      "largo": false,
      "escala": 1
    },
    {
      "fonte": "quiz:farol-queimado-par",
      "largo": false,
      "escala": 1
    },
    {
      "fonte": "quiz:ponto-morto-descida",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:pneu-idade",
      "largo": false,
      "escala": 0.82
    },
    {
      "fonte": "quiz:ipva-multa-revisao",
      "largo": false,
      "escala": 0.94
    },
    {
      "fonte": "quiz:hibrido-tomada",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:cambio-fluido",
      "largo": false,
      "escala": 1
    },
    {
      "fonte": "quiz:app-motorista-desgaste",
      "largo": false,
      "escala": 0.94
    },
    {
      "fonte": "quiz:tres-cilindros",
      "largo": false,
      "escala": 1
    },
    {
      "fonte": "quiz:cilindrada-potencia",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:nitro-filme",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:oleo-intervalo",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:luz-injecao-piscando",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:correia-vs-corrente",
      "largo": false,
      "escala": 0.88
    },
    {
      "fonte": "quiz:mancha-chao",
      "largo": false,
      "escala": 1
    },
    {
      "fonte": "quiz:freio-esponjoso",
      "largo": false,
      "escala": 1
    },
    {
      "fonte": "quiz:carro-parado-tempo",
      "largo": false,
      "escala": 1
    },
    {
      "fonte": "quiz:estepe-pressao",
      "largo": false,
      "escala": 1
    },
    {
      "fonte": "quiz:eletrico-manutencao",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:cambio-solavanco",
      "largo": false,
      "escala": 0.94
    },
    {
      "fonte": "quiz:urbano-curto",
      "largo": false,
      "escala": 1
    },
    {
      "fonte": "quiz:altitude-potencia",
      "largo": false,
      "escala": 1
    },
    {
      "fonte": "quiz:balanceamento-motor",
      "largo": false,
      "escala": 1
    },
    {
      "fonte": "quiz:marca-fiat-brasil",
      "largo": false,
      "escala": 1
    },
    {
      "fonte": "quiz:esquentar-parado",
      "largo": false,
      "escala": 0.94
    },
    {
      "fonte": "quiz:etanol-70",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:obd2-apaga-luz",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:orcamento-perguntas",
      "largo": false,
      "escala": 1
    },
    {
      "fonte": "quiz:cambio-cvt",
      "largo": false,
      "escala": 0.88
    },
    {
      "fonte": "quiz:premium-gasolina",
      "largo": false,
      "escala": 1
    },
    {
      "fonte": "quiz:carro-usado-historico",
      "largo": false,
      "escala": 0.94
    },
    {
      "fonte": "quiz:embreagem-pe",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:combustivel-reserva",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:freio-regenerativo",
      "largo": false,
      "escala": 1
    },
    {
      "fonte": "quiz:aro-grande",
      "largo": false,
      "escala": 1
    },
    {
      "fonte": "quiz:adas-confianca",
      "largo": false,
      "escala": 1
    },
    {
      "fonte": "quiz:sedan-porta-malas",
      "largo": false,
      "escala": 0.94
    },
    {
      "fonte": "quiz:aerodinamica-asa",
      "largo": false,
      "escala": 1
    },
    {
      "fonte": "quiz:ar-cardan",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:pastilha-chiado",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:agua-radiador",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:pneu-pressao-onde",
      "largo": false,
      "escala": 1
    },
    {
      "fonte": "quiz:turbo-desligar",
      "largo": false,
      "escala": 1
    }
  ],
  "desafio:stories": [
    {
      "fonte": "quiz:consertar-ou-trocar",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:oleo-nivel-quando",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:cheiro-queimado-freio",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:luz-oleo-vermelha",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:escapamento-barulho",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:cambio-automatico-neutro",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:diesel-carro-passeio",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:pneu-medida-trocar",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:tsi-downsizing",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:tracao-traseira",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:revisao-antecipar",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:pneu-nitrogenio",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:superaquecimento-tampa",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:fumaca-azul",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:km-alto-comprar",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:vibracao-velocidade",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:farol-queimado-par",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:ponto-morto-descida",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:pneu-idade",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:ipva-multa-revisao",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:hibrido-tomada",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:cambio-fluido",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:app-motorista-desgaste",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:tres-cilindros",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:cilindrada-potencia",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:nitro-filme",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:oleo-intervalo",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:luz-injecao-piscando",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:correia-vs-corrente",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:mancha-chao",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:freio-esponjoso",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:carro-parado-tempo",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:alinhamento-quando",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:estepe-pressao",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:revisao-concessionaria",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:estalo-esterco",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:eletrico-manutencao",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:cambio-solavanco",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:urbano-curto",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:altitude-potencia",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:balanceamento-motor",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:marca-fiat-brasil",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:esquentar-parado",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:etanol-70",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:obd2-apaga-luz",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:orcamento-perguntas",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:cambio-cvt",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:premium-gasolina",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:ar-condicionado-consumo",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:carro-usado-historico",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:embreagem-pe",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:combustivel-reserva",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:freio-regenerativo",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:aro-grande",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:adas-confianca",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:sedan-porta-malas",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:aerodinamica-asa",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:ar-cardan",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:pastilha-chiado",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:agua-radiador",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:pneu-pressao-onde",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:turbo-desligar",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:bateria-descarregada",
      "largo": true,
      "escala": 1
    }
  ],
  "dica:feed": [
    {
      "fonte": "quiz:farol-queimado-par",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:pneu-idade",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:ipva-multa-revisao",
      "largo": false,
      "escala": 0.94
    },
    {
      "fonte": "quiz:hibrido-tomada",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:cambio-fluido",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:app-motorista-desgaste",
      "largo": true,
      "escala": 0.94
    },
    {
      "fonte": "quiz:cilindrada-potencia",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:nitro-filme",
      "largo": true,
      "escala": 0.94
    },
    {
      "fonte": "quiz:oleo-intervalo",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:luz-injecao-piscando",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:mancha-chao",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:freio-esponjoso",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:carro-parado-tempo",
      "largo": true,
      "escala": 0.94
    },
    {
      "fonte": "quiz:alinhamento-quando",
      "largo": true,
      "escala": 0.94
    },
    {
      "fonte": "quiz:estepe-pressao",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:revisao-concessionaria",
      "largo": true,
      "escala": 0.88
    },
    {
      "fonte": "quiz:estalo-esterco",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:eletrico-manutencao",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:cambio-solavanco",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:urbano-curto",
      "largo": true,
      "escala": 0.94
    },
    {
      "fonte": "quiz:altitude-potencia",
      "largo": true,
      "escala": 0.94
    },
    {
      "fonte": "quiz:marca-fiat-brasil",
      "largo": false,
      "escala": 0.82
    },
    {
      "fonte": "quiz:esquentar-parado",
      "largo": true,
      "escala": 0.94
    },
    {
      "fonte": "quiz:etanol-70",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:obd2-apaga-luz",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:orcamento-perguntas",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:cambio-cvt",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:premium-gasolina",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:ar-condicionado-consumo",
      "largo": true,
      "escala": 0.94
    },
    {
      "fonte": "quiz:carro-usado-historico",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:embreagem-pe",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:combustivel-reserva",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:freio-regenerativo",
      "largo": false,
      "escala": 0.94
    },
    {
      "fonte": "quiz:aro-grande",
      "largo": true,
      "escala": 0.94
    },
    {
      "fonte": "quiz:adas-confianca",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:sedan-porta-malas",
      "largo": true,
      "escala": 0.88
    },
    {
      "fonte": "quiz:aerodinamica-asa",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:ar-cardan",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:pastilha-chiado",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:agua-radiador",
      "largo": true,
      "escala": 0.94
    },
    {
      "fonte": "quiz:pneu-pressao-onde",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:turbo-desligar",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:consertar-ou-trocar",
      "largo": true,
      "escala": 0.94
    },
    {
      "fonte": "quiz:oleo-nivel-quando",
      "largo": false,
      "escala": 0.94
    },
    {
      "fonte": "quiz:cheiro-queimado-freio",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:luz-oleo-vermelha",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:cambio-automatico-neutro",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:diesel-carro-passeio",
      "largo": true,
      "escala": 0.94
    },
    {
      "fonte": "quiz:tsi-downsizing",
      "largo": true,
      "escala": 0.94
    },
    {
      "fonte": "quiz:tracao-traseira",
      "largo": true,
      "escala": 0.88
    },
    {
      "fonte": "quiz:revisao-antecipar",
      "largo": true,
      "escala": 0.94
    },
    {
      "fonte": "quiz:pneu-nitrogenio",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:superaquecimento-tampa",
      "largo": true,
      "escala": 0.94
    },
    {
      "fonte": "quiz:fumaca-azul",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:km-alto-comprar",
      "largo": true,
      "escala": 0.88
    }
  ],
  "dica:stories": [
    {
      "fonte": "quiz:farol-queimado-par",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:hibrido-tomada",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:cambio-fluido",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:tres-cilindros",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:cilindrada-potencia",
      "largo": true,
      "escala": 0.88
    },
    {
      "fonte": "quiz:oleo-intervalo",
      "largo": true,
      "escala": 0.94
    },
    {
      "fonte": "quiz:luz-injecao-piscando",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:mancha-chao",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:freio-esponjoso",
      "largo": true,
      "escala": 0.88
    },
    {
      "fonte": "quiz:carro-parado-tempo",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:estalo-esterco",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:eletrico-manutencao",
      "largo": true,
      "escala": 0.88
    },
    {
      "fonte": "quiz:cambio-solavanco",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:altitude-potencia",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:esquentar-parado",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:obd2-apaga-luz",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:orcamento-perguntas",
      "largo": true,
      "escala": 0.88
    },
    {
      "fonte": "quiz:cambio-cvt",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:premium-gasolina",
      "largo": true,
      "escala": 0.88
    },
    {
      "fonte": "quiz:ar-condicionado-consumo",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:carro-usado-historico",
      "largo": true,
      "escala": 0.88
    },
    {
      "fonte": "quiz:embreagem-pe",
      "largo": true,
      "escala": 0.88
    },
    {
      "fonte": "quiz:adas-confianca",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:aerodinamica-asa",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:ar-cardan",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:pastilha-chiado",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:agua-radiador",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:pneu-pressao-onde",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:luz-oleo-vermelha",
      "largo": true,
      "escala": 0.88
    },
    {
      "fonte": "quiz:cambio-automatico-neutro",
      "largo": true,
      "escala": 0.88
    },
    {
      "fonte": "quiz:revisao-antecipar",
      "largo": true,
      "escala": 0.88
    },
    {
      "fonte": "quiz:pneu-nitrogenio",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:superaquecimento-tampa",
      "largo": true,
      "escala": 0.88
    },
    {
      "fonte": "quiz:fumaca-azul",
      "largo": true,
      "escala": 0.94
    },
    {
      "fonte": "quiz:vibracao-velocidade",
      "largo": true,
      "escala": 0.82
    }
  ],
  "curiosidade:feed": [
    {
      "fonte": "quiz:eletrico-manutencao",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:obd2-apaga-luz",
      "largo": true,
      "escala": 0.94
    },
    {
      "fonte": "quiz:premium-gasolina",
      "largo": false,
      "escala": 0.94
    },
    {
      "fonte": "quiz:embreagem-pe",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:ar-cardan",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:pastilha-chiado",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:agua-radiador",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:pneu-pressao-onde",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:luz-oleo-vermelha",
      "largo": true,
      "escala": 0.88
    },
    {
      "fonte": "quiz:diesel-carro-passeio",
      "largo": true,
      "escala": 0.88
    },
    {
      "fonte": "quiz:revisao-antecipar",
      "largo": true,
      "escala": 0.88
    },
    {
      "fonte": "quiz:hibrido-tomada",
      "largo": true,
      "escala": 0.88
    },
    {
      "fonte": "quiz:cilindrada-potencia",
      "largo": true,
      "escala": 0.88
    },
    {
      "fonte": "quiz:nitro-filme",
      "largo": true,
      "escala": 0.88
    },
    {
      "fonte": "quiz:oleo-intervalo",
      "largo": true,
      "escala": 0.94
    },
    {
      "fonte": "quiz:luz-injecao-piscando",
      "largo": true,
      "escala": 0.82
    }
  ],
  "curiosidade:stories": [
    {
      "fonte": "quiz:premium-gasolina",
      "largo": true,
      "escala": 0.88
    },
    {
      "fonte": "quiz:diesel-carro-passeio",
      "largo": true,
      "escala": 0.88
    },
    {
      "fonte": "quiz:nitro-filme",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:oleo-intervalo",
      "largo": true,
      "escala": 0.88
    }
  ],
  "pergunta:feed": [
    {
      "fonte": "quiz:carro-usado-historico",
      "largo": false,
      "escala": 0.88
    },
    {
      "fonte": "quiz:embreagem-pe",
      "largo": true,
      "escala": 0.94
    },
    {
      "fonte": "quiz:aro-grande",
      "largo": false,
      "escala": 0.88
    },
    {
      "fonte": "quiz:adas-confianca",
      "largo": false,
      "escala": 0.82
    },
    {
      "fonte": "quiz:aerodinamica-asa",
      "largo": true,
      "escala": 0.94
    },
    {
      "fonte": "quiz:ar-cardan",
      "largo": true,
      "escala": 0.94
    },
    {
      "fonte": "quiz:pastilha-chiado",
      "largo": true,
      "escala": 0.88
    },
    {
      "fonte": "quiz:agua-radiador",
      "largo": false,
      "escala": 0.82
    },
    {
      "fonte": "quiz:pneu-pressao-onde",
      "largo": true,
      "escala": 0.88
    },
    {
      "fonte": "quiz:turbo-desligar",
      "largo": false,
      "escala": 0.88
    },
    {
      "fonte": "quiz:consertar-ou-trocar",
      "largo": false,
      "escala": 0.82
    },
    {
      "fonte": "quiz:oleo-nivel-quando",
      "largo": false,
      "escala": 0.82
    },
    {
      "fonte": "quiz:cheiro-queimado-freio",
      "largo": false,
      "escala": 0.88
    },
    {
      "fonte": "quiz:luz-oleo-vermelha",
      "largo": false,
      "escala": 0.88
    },
    {
      "fonte": "quiz:cambio-automatico-neutro",
      "largo": false,
      "escala": 0.88
    },
    {
      "fonte": "quiz:diesel-carro-passeio",
      "largo": false,
      "escala": 0.82
    },
    {
      "fonte": "quiz:revisao-antecipar",
      "largo": false,
      "escala": 0.82
    },
    {
      "fonte": "quiz:pneu-nitrogenio",
      "largo": false,
      "escala": 0.88
    },
    {
      "fonte": "quiz:superaquecimento-tampa",
      "largo": false,
      "escala": 0.82
    },
    {
      "fonte": "quiz:fumaca-azul",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:farol-queimado-par",
      "largo": true,
      "escala": 0.94
    },
    {
      "fonte": "quiz:pneu-idade",
      "largo": false,
      "escala": 0.88
    },
    {
      "fonte": "quiz:hibrido-tomada",
      "largo": false,
      "escala": 0.88
    },
    {
      "fonte": "quiz:cambio-fluido",
      "largo": false,
      "escala": 0.82
    },
    {
      "fonte": "quiz:cilindrada-potencia",
      "largo": true,
      "escala": 0.94
    },
    {
      "fonte": "quiz:oleo-intervalo",
      "largo": true,
      "escala": 0.94
    },
    {
      "fonte": "quiz:luz-injecao-piscando",
      "largo": true,
      "escala": 0.88
    },
    {
      "fonte": "quiz:mancha-chao",
      "largo": false,
      "escala": 0.88
    },
    {
      "fonte": "quiz:freio-esponjoso",
      "largo": false,
      "escala": 0.88
    },
    {
      "fonte": "quiz:carro-parado-tempo",
      "largo": false,
      "escala": 0.82
    },
    {
      "fonte": "quiz:alinhamento-quando",
      "largo": false,
      "escala": 0.82
    },
    {
      "fonte": "quiz:estepe-pressao",
      "largo": true,
      "escala": 0.94
    },
    {
      "fonte": "quiz:estalo-esterco",
      "largo": false,
      "escala": 0.94
    },
    {
      "fonte": "quiz:eletrico-manutencao",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:cambio-solavanco",
      "largo": true,
      "escala": 0.94
    },
    {
      "fonte": "quiz:urbano-curto",
      "largo": false,
      "escala": 0.88
    },
    {
      "fonte": "quiz:altitude-potencia",
      "largo": false,
      "escala": 0.82
    },
    {
      "fonte": "quiz:esquentar-parado",
      "largo": false,
      "escala": 0.82
    },
    {
      "fonte": "quiz:obd2-apaga-luz",
      "largo": true,
      "escala": 1
    },
    {
      "fonte": "quiz:orcamento-perguntas",
      "largo": false,
      "escala": 0.82
    },
    {
      "fonte": "quiz:cambio-cvt",
      "largo": false,
      "escala": 0.88
    },
    {
      "fonte": "quiz:premium-gasolina",
      "largo": false,
      "escala": 1
    }
  ],
  "pergunta:stories": [
    {
      "fonte": "quiz:fumaca-azul",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:estalo-esterco",
      "largo": true,
      "escala": 0.82
    },
    {
      "fonte": "quiz:obd2-apaga-luz",
      "largo": true,
      "escala": 0.88
    }
  ]
};
