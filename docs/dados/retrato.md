# Retrato diario da operacao Mentorque

Gerado pelo Analista de Dados (n8n) em 2026-08-24T09:00:06.617Z.
NAO editar a mao. Metodo de leitura: docs/agentes/skills/analise-da-operacao.md.

## MARKETING (gente chegando)
- Semana corrente (2026-08-17): aberturas 4, visitantes 2, cadastros 0
- Semana anterior (sem dados): aberturas 0, visitantes 0, cadastros 0
- Midia paga: sem gasto no periodo (crescimento organico)
- Busca Google 28d: 0 cliques, 0 impressoes
- YouTube: 0 inscritos, 0 views totais, 10 videos recentes

## ENGAJAMENTO (gente usando e voltando)
- Semana corrente (2026-08-17): 2 usuarios ativos, 4 aberturas (2 por usuario)
- Erros no app 7d: 0
- Play vitals: sem dados de crash ainda
- Avaliacoes nas lojas: 0

## VENDAS (gente pagando e continuando)
- Assinaturas ativas (banco): 1 (anuais 1, mensais 0), cancelamento agendado: 0
- Fundo do funil, Semana corrente: viram paywall 0, iniciaram checkout 0, assinaram 0, cancelaram 0
- Fundo do funil, Semana anterior: viram paywall 0, iniciaram checkout 0, assinaram 0, cancelaram 0
- Stripe (live): 0 assinaturas, MRR 0.00, receita 30d 0.00
- RevenueCat: 0 assinaturas, MRR 0 (aviso: active_users = aparelhos, inclui testes)
- AdMob 7d: 0.00 USD de receita de anuncio
- Lojas: iOS 1.1 WAITING_FOR_REVIEW; iOS 1.0 READY_FOR_SALE

## Fontes externas (pacote bruto mais recente por fonte)
- admob (2026-08-23): {"apps":["ca-app-pub-9316035916536420~8094986125"],"nota":"sem linhas do app do Mentorque no periodo","moeda":"USD","porDia":[],"ganhos7d":0,"impressoes7d":0}
- app_store_connect (2026-08-23): {"versoes":[{"estado":"WAITING_FOR_REVIEW","versao":"1.1","criadaEm":"2026-08-21T05:20:14-07:00"},{"estado":"READY_FOR_SALE","versao":"1.0","criadaEm":"2026-08-02T11:19:15-07:00"}]}
- app_store_downloads (2026-08-23): {"dia":"2026-08-21","nota":"sem transacoes na App Store no dia (relatorio vazio; exclui TestFlight)","downloadsApp":0}
- google_ads (2026-08-23): {"erro":"The resource you are requesting could not be found"}
- meta_ads (2026-08-23): {"conta":"Mentorque Ads","moeda":"BRL","porDia":[],"gasto7d":0}
- play_console (2026-08-23): {"anrPorDia":[],"crashPorDia":[]}
- revenuecat (2026-08-23): {"mrr":0,"nota":"active_users e new_customers contam APARELHOS que abriram o app (inclui TestFlight e aparelhos de teste do dono); pessoas reais = contas do banco e regua de uso do funil","revenue":0,"active_users":22,"active_trials":0,"new_customers":22,"active_subscriptions":0}
- search_console (2026-08-23): {"porDia":[{"dia":"2026-08-21","cliques":0,"impressoes":0}],"cliques28d":0,"topConsultas":[],"impressoes28d":0}
- stripe (2026-08-23): {"moeda":null,"mrrCentavos":0,"assinaturasAtivas":0,"receita30dCentavos":0}
- vercel (2026-08-23): {"ultimo":{"alvo":"production","estado":"READY","quando":"2026-08-23T21:33:37.646Z"},"comErro7d":0,"deploys7d":20,"prontos7d":20}
- youtube (2026-08-23): {"recentes":[{"views":0,"titulo":"Curiosidade - Uso do Nitro (Oxido Nitroso)","publicadoEm":"2026-08-10T02:18:33Z"},{"views":0,"titulo":"A peca que usa a fisica para ajudar o motor - Ressonador","publicadoEm":"2026-08-10T02:11:04Z"},{"views":0,"titulo":"Vibracao de um motor 3 Cilindros - Por que?","publicadoEm":"2026-08-10T02:10:16Z"},{"views":0,"titulo":"Jogo Rapido - Turbo vs Nitro","publicadoEm...

## Dados brutos (JSON)

```json
{
  "dados": {
    "geradoEm": "2026-08-24T09:00:04.882Z",
    "funilSemanas": [
      {
        "semana": "2026-08-17",
        "aberturas": 4,
        "visitantes": 2,
        "cadastros": 0,
        "viram_paywall": 0,
        "iniciaram_checkout": 0,
        "assinaturas": 0,
        "renovacoes": 0,
        "cancelamentos": 0,
        "expirados": 0
      }
    ],
    "assinaturas": {
      "ativas": 1,
      "cancelando": 0,
      "anuais": 1,
      "mensais": 0
    },
    "cadastrosPorDia": {},
    "erros7d": {
      "total": 0,
      "top": []
    },
    "uso": {
      "porDia": [
        {
          "dia": "2026-08-23",
          "usuarios": 2,
          "aberturas": 4
        }
      ],
      "porSemana": [
        {
          "semana": "2026-08-17",
          "usuarios_ativos": 2,
          "aberturas": 4,
          "aberturas_por_usuario": 2
        }
      ],
      "coortes": [],
      "ativacao": []
    },
    "vendas": {
      "assinaturasCoortes": []
    },
    "marketing": {
      "cadastrosPorCampanha": []
    },
    "experimentos": [],
    "quebraFunil": [
      {
        "de": "abriu_app",
        "para": "cadastro",
        "antes": 2,
        "depois": 0,
        "taxa": 0,
        "perdidos": 2
      },
      {
        "de": "cadastro",
        "para": "ativacao",
        "antes": 0,
        "depois": 0,
        "taxa": null,
        "perdidos": 0
      },
      {
        "de": "ativacao",
        "para": "viu_paywall",
        "antes": 0,
        "depois": 0,
        "taxa": null,
        "perdidos": 0
      },
      {
        "de": "viu_paywall",
        "para": "iniciou_checkout",
        "antes": 0,
        "depois": 0,
        "taxa": null,
        "perdidos": 0
      },
      {
        "de": "iniciou_checkout",
        "para": "assinou",
        "antes": 0,
        "depois": 0,
        "taxa": null,
        "perdidos": 0
      }
    ],
    "fontesExternas": {
      "youtube": [
        {
          "dia": "2026-08-23",
          "dados": {
            "recentes": [
              {
                "views": 0,
                "titulo": "Curiosidade - Uso do Nitro (Oxido Nitroso)",
                "publicadoEm": "2026-08-10T02:18:33Z"
              },
              {
                "views": 0,
                "titulo": "A peca que usa a fisica para ajudar o motor - Ressonador",
                "publicadoEm": "2026-08-10T02:11:04Z"
              },
              {
                "views": 0,
                "titulo": "Vibracao de um motor 3 Cilindros - Por que?",
                "publicadoEm": "2026-08-10T02:10:16Z"
              },
              {
                "views": 0,
                "titulo": "Jogo Rapido - Turbo vs Nitro",
                "publicadoEm": "2026-08-10T02:09:26Z"
              },
              {
                "views": 0,
                "titulo": "Jogo Rapido Turbo vs Aspirado",
                "publicadoEm": "2026-08-10T02:07:15Z"
              },
              {
                "views": 0,
                "titulo": "Jogo Rapido Etanol vs Gasolina",
                "publicadoEm": "2026-08-10T02:06:31Z"
              },
              {
                "views": 0,
                "titulo": "Como funciona a Luz de injecao?",
                "publicadoEm": "2026-08-10T02:05:32Z"
              },
              {
                "views": 0,
                "titulo": "Luz de injecao acesa? Confere essa dica",
                "publicadoEm": "2026-08-10T02:04:34Z"
              },
              {
                "views": 0,
                "titulo": "Luz de Injecao Acendeu? Dica Rapida",
                "publicadoEm": "2026-08-10T02:03:53Z"
              },
              {
                "views": 0,
                "titulo": "Dica compra de carro usado",
                "publicadoEm": "2026-08-10T01:57:24Z"
              }
            ],
            "inscritos": 0,
            "totalVideos": 0,
            "viewsTotais": 0
          }
        },
        {
          "dia": "2026-08-22",
          "dados": {
            "erro": "Credentials not found"
          }
        }
      ],
      "search_console": [
        {
          "dia": "2026-08-23",
          "dados": {
            "porDia": [
              {
                "dia": "2026-08-21",
                "cliques": 0,
                "impressoes": 0
              }
            ],
            "cliques28d": 0,
            "topConsultas": [],
            "impressoes28d": 0
          }
        },
        {
          "dia": "2026-08-22",
          "dados": {
            "erro": "Nenhuma propriedade mentorque no Search Console"
          }
        }
      ],
      "stripe": [
        {
          "dia": "2026-08-23",
          "dados": {
            "moeda": null,
            "mrrCentavos": 0,
            "assinaturasAtivas": 0,
            "receita30dCentavos": 0
          }
        },
        {
          "dia": "2026-08-22",
          "dados": {
            "erro": "falha na coleta"
          }
        }
      ],
      "meta_ads": [
        {
          "dia": "2026-08-23",
          "dados": {
            "conta": "Mentorque Ads",
            "moeda": "BRL",
            "porDia": [],
            "gasto7d": 0
          }
        },
        {
          "dia": "2026-08-22",
          "dados": {
            "conta": "Mentorque Ads",
            "moeda": "BRL",
            "porDia": [],
            "gasto7d": 0
          }
        }
      ],
      "google_ads": [
        {
          "dia": "2026-08-23",
          "dados": {
            "erro": "The resource you are requesting could not be found"
          }
        },
        {
          "dia": "2026-08-22",
          "dados": {
            "erro": "Credentials not found"
          }
        }
      ],
      "revenuecat": [
        {
          "dia": "2026-08-23",
          "dados": {
            "mrr": 0,
            "nota": "active_users e new_customers contam APARELHOS que abriram o app (inclui TestFlight e aparelhos de teste do dono); pessoas reais = contas do banco e regua de uso do funil",
            "revenue": 0,
            "active_users": 22,
            "active_trials": 0,
            "new_customers": 22,
            "active_subscriptions": 0
          }
        },
        {
          "dia": "2026-08-22",
          "dados": {
            "erro": "Credentials not found"
          }
        }
      ],
      "vercel": [
        {
          "dia": "2026-08-23",
          "dados": {
            "ultimo": {
              "alvo": "production",
              "estado": "READY",
              "quando": "2026-08-23T21:33:37.646Z"
            },
            "comErro7d": 0,
            "deploys7d": 20,
            "prontos7d": 20
          }
        },
        {
          "dia": "2026-08-22",
          "dados": {
            "erro": "Credentials not found"
          }
        }
      ],
      "admob": [
        {
          "dia": "2026-08-23",
          "dados": {
            "apps": [
              "ca-app-pub-9316035916536420~8094986125"
            ],
            "nota": "sem linhas do app do Mentorque no periodo",
            "moeda": "USD",
            "porDia": [],
            "ganhos7d": 0,
            "impressoes7d": 0
          }
        },
        {
          "dia": "2026-08-22",
          "dados": {
            "erro": "Credentials not found"
          }
        }
      ],
      "app_store_connect": [
        {
          "dia": "2026-08-23",
          "dados": {
            "versoes": [
              {
                "estado": "WAITING_FOR_REVIEW",
                "versao": "1.1",
                "criadaEm": "2026-08-21T05:20:14-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "1.0",
                "criadaEm": "2026-08-02T11:19:15-07:00"
              }
            ]
          }
        },
        {
          "dia": "2026-08-22",
          "dados": {
            "erro": "401 - \"{\\n\\t\\\"errors\\\": [{\\n\\t\\t\\\"status\\\": \\\"401\\\",\\n\\t\\t\\\"code\\\": \\\"NOT_AUTHORIZED\\\",\\n\\t\\t\\\"title\\\": \\\"Authentication credentials are missing or invalid.\\\",\\n\\t\\t\\\"detail\\\": \\\"Provide a properly configured and signed bearer token, and make sure that it has not expired. Learn more about Generating"
          }
        }
      ],
      "play_console": [
        {
          "dia": "2026-08-23",
          "dados": {
            "anrPorDia": [],
            "crashPorDia": []
          }
        },
        {
          "dia": "2026-08-22",
          "dados": {
            "erro": "Credentials not found"
          }
        }
      ],
      "app_store_downloads": [
        {
          "dia": "2026-08-23",
          "dados": {
            "dia": "2026-08-21",
            "nota": "sem transacoes na App Store no dia (relatorio vazio; exclui TestFlight)",
            "downloadsApp": 0
          }
        }
      ]
    }
  },
  "avaliacoes": {
    "total": 0,
    "media": null,
    "porNota": {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0
    },
    "porLoja": {},
    "recentes": []
  }
}
```
