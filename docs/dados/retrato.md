# Retrato diario da operacao Mentorque

Gerado pelo Analista de Dados (n8n) em 2026-09-30T09:00:07.438Z.
NAO editar a mao. Metodo de leitura: docs/agentes/skills/analise-da-operacao.md.
COMO LER: linha marcada PARCIAL ou AINDA NAO DA PARA LER nao e resultado,
e so cresce ate a janela fechar. Auditoria das medidas em
docs/dados/auditoria-das-medidas.md.

## MARKETING (gente chegando)
- Semana corrente (PARCIAL, ainda enche) (2026-09-28): aberturas 99, visitantes 80, cadastros 19
- Semana anterior (FECHADA) (2026-09-21): aberturas 330, visitantes 214, cadastros 51
- Cadastros 28d via (direto) / (sem campanha): 83 (81% dos 103)
- Cadastros 28d via google / lancamento: 20 (19% dos 103)
- Gasto de midia 7d: Meta 124.64 + Google 177.04 = 301.68
- CAC bruto (gasto dos ultimos 7 dias / cadastros da ultima semana FECHADA, 2026-09-21): 5.92
- A semana corrente tem 19 cadastros e ainda esta aberta: nao serve de denominador
- Busca Google 28d: 0 cliques, 37 impressoes
- YouTube (acumulado desde o canal existir, NAO e janela): 8 inscritos, 8557 views totais, 10 videos recentes

## ENGAJAMENTO (gente usando e voltando)
- Semana corrente (PARCIAL, ainda enche) (2026-09-28): 79 usuarios ativos, 97 aberturas (1.2 por usuario)
- Semana anterior (FECHADA) (2026-09-21): 209 usuarios ativos, 323 aberturas (1.5 por usuario)
- Retencao, coorte 2026-09-28: 17 cadastrados, 1 a 7 dias AINDA NAO DA PARA LER (fecha em 2026-10-12; hoje sao 0, PISO), 8 a 30 dias AINDA NAO DA PARA LER (fecha em 2026-11-04; hoje sao 0, PISO)
- Retencao, coorte 2026-09-21: 51 cadastrados, 1 a 7 dias AINDA NAO DA PARA LER (fecha em 2026-10-05; hoje sao 6, PISO), 8 a 30 dias AINDA NAO DA PARA LER (fecha em 2026-10-28; hoje sao 0, PISO)
- Retencao, coorte 2026-09-14: 16 cadastrados, 0 voltaram em 1 a 7 dias, 8 a 30 dias AINDA NAO DA PARA LER (fecha em 2026-10-21; hoje sao 1, PISO)
- Retencao, coorte 2026-09-07: 11 cadastrados, 1 voltaram em 1 a 7 dias, 8 a 30 dias AINDA NAO DA PARA LER (fecha em 2026-10-14; hoje sao 1, PISO)
- Ativacao, coorte 2026-09-28: AINDA NAO DA PARA LER (a janela fecha em 2026-10-12; hoje sao 0 de 17, PISO)
- Ativacao, coorte 2026-09-21: AINDA NAO DA PARA LER (a janela fecha em 2026-10-05; hoje sao 2 de 51, PISO)
- Ativacao, coorte 2026-09-14: 3 de 16 fizeram a primeira acao de valor em 7 dias
- Ativacao, coorte 2026-09-07: 6 de 11 fizeram a primeira acao de valor em 7 dias
- Erros no app: 25 relatos no app em 7 dias; 18 de defeito em 10 aparelho(s); 6 de desistencia (a pessoa fechou o login, NAO e falha); 1 de ambiente (sem rede). 10 de 302 aparelhos ativos com defeito (3.3%) [ativos: android 263, web 28, ios 11]
  - Sem alarme, e o motivo: 10 de 302 aparelhos com defeito (3.3%), abaixo do teto de 10%
  - 9x em 4 aparelho(s): app fechou sozinho em: abriu o app
  - 5x em 5 aparelho(s): login nativo google: Google Sign-In cancelled by user ([16] Cancelled by user.) package=mentorque.app signingSha1=E5:1C:
  - 2x em 2 aparelho(s): push: interruptor ligado, mas a permissão do sistema está "prompt"
- Play vitals: sem dados de crash ainda
- Avaliacoes nas lojas: 12 (media 5)
  - [app_store 5/5] Excelente (matthewsmc0)
  - [app_store 5/5] Aprendizado (aminoru)
  - [app_store 5/5] Bastante Útil (munizluiz)

## VENDAS (gente pagando e continuando)
- Assinaturas ativas (banco): 3 (anuais 0, mensais 3), cancelamento agendado: 0
- Fundo do funil, Semana corrente (PARCIAL, ainda enche): viram paywall 7, iniciaram checkout 0, assinaram 0, cancelaram 0
- Fundo do funil, Semana anterior (FECHADA): viram paywall 45, iniciaram checkout 5, assinaram 0, cancelaram 0
  - RESSALVA: no Android o paywall aparece e NAO tem botao de compra (modo leitor). O checkout so pode nascer no iPhone e na web: nao leia paywall->checkout somando as tres.
- Assinantes, coorte 2026-09-01: 1 assinaram, 0 renovaram, 0 sairam (renovacao de um mensal so pode aparecer 1 mes depois da coorte)
- Assinantes, coorte 2026-08-01: 2 assinaram, 0 renovaram, 0 sairam (renovacao de um mensal so pode aparecer 1 mes depois da coorte)
- Stripe (live): 3 assinaturas, MRR 89.70, receita 30d 0.00 (MRR e o contratado por mes; receita 30d e o COBRADO, e fica zero enquanto a primeira cobranca nao roda)
- RevenueCat: 1 assinaturas, MRR 4 (aviso: active_users = aparelhos, inclui testes)
- AdMob 7d: 0.00 USD de receita de anuncio
- Lojas: iOS 2.9 WAITING_FOR_REVIEW; iOS 2.8 READY_FOR_SALE; iOS 2.7 READY_FOR_SALE; iOS 2.6 READY_FOR_SALE; iOS 2.5 READY_FOR_SALE

## Fontes externas (pacote bruto mais recente por fonte)
- admob (2026-09-30): {"apps":["ca-app-pub-9316035916536420~8094986125"],"nota":"sem linhas do app do Mentorque no periodo","moeda":"USD","porDia":[],"ganhos7d":0,"impressoes7d":0}
- app_store_connect (2026-09-30): {"versoes":[{"estado":"WAITING_FOR_REVIEW","versao":"2.9","criadaEm":"2026-09-28T08:20:34-07:00"},{"estado":"READY_FOR_SALE","versao":"2.8","criadaEm":"2026-09-24T03:55:45-07:00"},{"estado":"READY_FOR_SALE","versao":"2.7","criadaEm":"2026-09-17T09:06:08-07:00"},{"estado":"READY_FOR_SALE","versao":"2.6","criadaEm":"2026-09-16T03:41:57-07:00"},{"estado":"READY_FOR_SALE","versao":"2.5","criadaEm":"20...
- app_store_downloads (2026-09-30): {"dia":"2026-09-28","atualizacoes":2,"downloadsApp":1,"unidadesPorTipo":{"1F":1,"7F":2}}
- google_ads (2026-09-30): {"conta":"Mentorque","porDia":[{"dia":"2026-09-23","custo":41.612832,"cliques":87,"conversoes":18,"impressoes":565},{"dia":"2026-09-24","custo":18.782614000000002,"cliques":50,"conversoes":16,"impressoes":777},{"dia":"2026-09-25","custo":21.599485,"cliques":79,"conversoes":24,"impressoes":1110},{"dia":"2026-09-26","custo":21.010339,"cliques":80,"conversoes":23,"impressoes":1029},{"dia":"2026-09-27...
- meta_ads (2026-09-30): {"conta":"Mentorque Ads","moeda":"BRL","contas":[{"id":"act_1071232758617319","nome":"Mentorque Ads","moeda":"BRL"}],"porDia":[{"dia":"2026-09-23","gasto":16.01,"cliques":89,"impressoes":1534,"instalacoes":28},{"dia":"2026-09-24","gasto":15.11,"cliques":66,"impressoes":1292,"instalacoes":12},{"dia":"2026-09-25","gasto":20.96,"cliques":102,"impressoes":1578,"instalacoes":42},{"dia":"2026-09-26","ga...
- play_console (2026-09-30): {"anrPorDia":[],"crashPorDia":[]}
- revenuecat (2026-09-30): {"mrr":4,"nota":"active_users e new_customers contam APARELHOS que abriram o app (inclui TestFlight e aparelhos de teste do dono); pessoas reais = contas do banco e regua de uso do funil","revenue":4,"active_users":500,"active_trials":0,"new_customers":495,"active_subscriptions":1}
- search_console (2026-09-30): {"porDia":[{"dia":"2026-09-02","cliques":0,"impressoes":0},{"dia":"2026-09-03","cliques":0,"impressoes":0},{"dia":"2026-09-04","cliques":0,"impressoes":0},{"dia":"2026-09-05","cliques":0,"impressoes":4},{"dia":"2026-09-06","cliques":0,"impressoes":0},{"dia":"2026-09-07","cliques":0,"impressoes":1},{"dia":"2026-09-08","cliques":0,"impressoes":5},{"dia":"2026-09-09","cliques":0,"impressoes":3},{"dia...
- stripe (2026-09-30): {"moeda":"brl","mrrCentavos":8970,"assinaturasAtivas":3,"receita30dCentavos":0}
- vercel (2026-09-30): {"ultimo":{"alvo":"production","estado":"READY","quando":"2026-09-29T21:27:44.621Z"},"comErro7d":0,"deploys7d":20,"prontos7d":20}
- youtube (2026-09-30): {"recentes":[{"views":1072,"titulo":"A pergunta que muda a conversa na oficina antes de aprovar o orçamento","publicadoEm":"2026-09-19T13:29:15Z"},{"views":20,"titulo":"Poça embaixo do carro: quando é normal e quando é vazamento","publicadoEm":"2026-09-19T13:28:32Z"},{"views":108,"titulo":"Etanol ou gasolina? A conta dos 70% e por que ela pode estar errada pro seu carro","publicadoEm":"2026-09-19T...

## Dados brutos (JSON)

```json
{
  "dados": {
    "geradoEm": "2026-09-30T09:00:05.486Z",
    "tempos": {
      "subscriptions": 486,
      "cadastros": 531,
      "app_erros": 74,
      "funil_semana": 575,
      "uso_diario": 51,
      "uso_semanal": 46,
      "ativacao_coortes": 57,
      "assinaturas_coortes": 39,
      "cadastros_por_campanha": 39,
      "retencao_coortes": 161,
      "metricas_diarias": 262,
      "assinaturas_conferencia": 42,
      "jornada_envios": 83,
      "email_eventos": 67,
      "paralelo": 861,
      "experimentos": 95,
      "anomalias": 172,
      "aparelhos_ativos": 47,
      "estado_da_base": 252,
      "funil_etapas": 52,
      "contas_criadas_desde": 54,
      "funil_etapas_primeira": 48,
      "total": 1598
    },
    "falhas": {},
    "funilSemanas": [
      {
        "semana": "2026-09-28",
        "aberturas": 99,
        "visitantes": 80,
        "cadastros": 19,
        "viram_paywall": 7,
        "iniciaram_checkout": 0,
        "assinaturas": 0,
        "renovacoes": 0,
        "cancelamentos": 0,
        "expirados": 0,
        "viram_paywall_pessoas": 7,
        "iniciaram_checkout_pessoas": 0,
        "assinaturas_pessoas": 0,
        "ativaram_pessoas": 33,
        "aberturas_sem_identidade": 0
      },
      {
        "semana": "2026-09-21",
        "aberturas": 330,
        "visitantes": 214,
        "cadastros": 51,
        "viram_paywall": 45,
        "iniciaram_checkout": 5,
        "assinaturas": 0,
        "renovacoes": 0,
        "cancelamentos": 0,
        "expirados": 0,
        "viram_paywall_pessoas": 43,
        "iniciaram_checkout_pessoas": 4,
        "assinaturas_pessoas": 0,
        "ativaram_pessoas": 103,
        "aberturas_sem_identidade": 0
      },
      {
        "semana": "2026-09-14",
        "aberturas": 97,
        "visitantes": 68,
        "cadastros": 14,
        "viram_paywall": 17,
        "iniciaram_checkout": 0,
        "assinaturas": 0,
        "renovacoes": 0,
        "cancelamentos": 0,
        "expirados": 0,
        "viram_paywall_pessoas": 16,
        "iniciaram_checkout_pessoas": 0,
        "assinaturas_pessoas": 0,
        "ativaram_pessoas": 19,
        "aberturas_sem_identidade": 0
      },
      {
        "semana": "2026-09-07",
        "aberturas": 113,
        "visitantes": 75,
        "cadastros": 11,
        "viram_paywall": 25,
        "iniciaram_checkout": 2,
        "assinaturas": 0,
        "renovacoes": 0,
        "cancelamentos": 0,
        "expirados": 0,
        "viram_paywall_pessoas": 24,
        "iniciaram_checkout_pessoas": 2,
        "assinaturas_pessoas": 0,
        "ativaram_pessoas": 15,
        "aberturas_sem_identidade": 0
      },
      {
        "semana": "2026-08-31",
        "aberturas": 128,
        "visitantes": 52,
        "cadastros": 8,
        "viram_paywall": 25,
        "iniciaram_checkout": 5,
        "assinaturas": 1,
        "renovacoes": 0,
        "cancelamentos": 0,
        "expirados": 0,
        "viram_paywall_pessoas": 18,
        "iniciaram_checkout_pessoas": 5,
        "assinaturas_pessoas": 1,
        "ativaram_pessoas": 5,
        "aberturas_sem_identidade": 16
      },
      {
        "semana": "2026-08-24",
        "aberturas": 84,
        "visitantes": 16,
        "cadastros": 1,
        "viram_paywall": 12,
        "iniciaram_checkout": 4,
        "assinaturas": 2,
        "renovacoes": 0,
        "cancelamentos": 0,
        "expirados": 0,
        "viram_paywall_pessoas": 7,
        "iniciaram_checkout_pessoas": 2,
        "assinaturas_pessoas": 2,
        "ativaram_pessoas": 2,
        "aberturas_sem_identidade": 11
      },
      {
        "semana": "2026-08-17",
        "aberturas": 4,
        "visitantes": 1,
        "cadastros": 0,
        "viram_paywall": 0,
        "iniciaram_checkout": 0,
        "assinaturas": 0,
        "renovacoes": 0,
        "cancelamentos": 0,
        "expirados": 0,
        "viram_paywall_pessoas": 0,
        "iniciaram_checkout_pessoas": 0,
        "assinaturas_pessoas": 0,
        "ativaram_pessoas": 0,
        "aberturas_sem_identidade": 2
      }
    ],
    "assinaturas": {
      "ativas": 3,
      "cancelando": 0,
      "anuais": 0,
      "mensais": 3,
      "pagantes": 3,
      "emTeste": 0,
      "cortesias": 0,
      "comCupom": 1,
      "cupons": [
        {
          "codigo": "MENSAL-LANCAMENTO100",
          "total": 1
        }
      ],
      "desencontros": 0
    },
    "cadastrosPorDia": {
      "2026-09-17": 2,
      "2026-09-18": 3,
      "2026-09-19": 3,
      "2026-09-20": 3,
      "2026-09-21": 12,
      "2026-09-26": 3,
      "2026-09-22": 4,
      "2026-09-23": 12,
      "2026-09-25": 8,
      "2026-09-24": 2,
      "2026-09-27": 10,
      "2026-09-28": 8,
      "2026-09-29": 9,
      "2026-09-30": 2
    },
    "erros7d": {
      "total": 25,
      "top": [
        {
          "mensagem": "app fechou sozinho em: abriu o app",
          "total": 9,
          "ultimo": "2026-09-27",
          "aparelhos": 4,
          "versoes": [
            "2.8.0"
          ]
        },
        {
          "mensagem": "login nativo google: Google Sign-In cancelled by user ([16] Cancelled by user.) package=mentorque.app signingSha1=E5:1C:",
          "total": 5,
          "ultimo": "2026-09-29",
          "aparelhos": 5,
          "versoes": [
            "2.7.0",
            "2.8.0",
            "2.9.0"
          ]
        },
        {
          "mensagem": "push: interruptor ligado, mas a permissão do sistema está \"prompt\"",
          "total": 2,
          "ultimo": "2026-09-29",
          "aparelhos": 2,
          "versoes": [
            "2.8.0",
            "2.9.0"
          ]
        },
        {
          "mensagem": "login nativo google: Google Sign-In failed: [16] Account reauth failed. The plugin cleared Credential Manager credential",
          "total": 1,
          "ultimo": "2026-09-23",
          "aparelhos": 1,
          "versoes": [
            "2.7.0"
          ]
        },
        {
          "mensagem": "\"LocalNotifications.then()\" is not implemented on ios",
          "total": 1,
          "ultimo": "2026-09-26",
          "aparelhos": 0,
          "versoes": [
            "1.2.0"
          ]
        }
      ],
      "aparelhosComErro": 16,
      "aparelhosAtivos": {
        "android": 263,
        "web": 28,
        "ios": 11
      },
      "porClasse": {
        "defeito": {
          "relatos": 18,
          "aparelhos": 10
        },
        "desistencia": {
          "relatos": 6,
          "aparelhos": 6
        },
        "ambiente": {
          "relatos": 1,
          "aparelhos": 1
        }
      },
      "aparelhosComDefeito": 10,
      "linha": {
        "texto": "Erros no app: 25 relatos no app em 7 dias; 18 de defeito em 10 aparelho(s); 6 de desistencia (a pessoa fechou o login, NAO e falha); 1 de ambiente (sem rede). 10 de 302 aparelhos ativos com defeito (3.3%) [ativos: android 263, web 28, ios 11]",
        "legivel": true,
        "motivo": ""
      },
      "alarme": {
        "deveAvisar": false,
        "texto": "",
        "silencio": "10 de 302 aparelhos com defeito (3.3%), abaixo do teto de 10%"
      }
    },
    "email30d": {
      "enviados": 289,
      "semId": 75,
      "semEventos": 2,
      "porChave": [
        {
          "chave": "d0",
          "enviados": 81,
          "comId": 68,
          "entregues": 66,
          "abertos": 12,
          "clicados": 2,
          "problemas": 1,
          "taxaAbertura": 17.6,
          "taxaClique": 2.9
        },
        {
          "chave": "d2",
          "enviados": 67,
          "comId": 53,
          "entregues": 51,
          "abertos": 4,
          "clicados": 0,
          "problemas": 1,
          "taxaAbertura": 7.5,
          "taxaClique": 0
        },
        {
          "chave": "d5",
          "enviados": 49,
          "comId": 32,
          "entregues": 31,
          "abertos": 2,
          "clicados": 0,
          "problemas": 1,
          "taxaAbertura": 6.3,
          "taxaClique": 0
        },
        {
          "chave": "d9",
          "enviados": 33,
          "comId": 19,
          "entregues": 18,
          "abertos": 0,
          "clicados": 0,
          "problemas": 1,
          "taxaAbertura": 0,
          "taxaClique": 0
        },
        {
          "chave": "sumiu-14",
          "enviados": 27,
          "comId": 17,
          "entregues": 17,
          "abertos": 2,
          "clicados": 0,
          "problemas": 0,
          "taxaAbertura": 11.8,
          "taxaClique": 0
        },
        {
          "chave": "d14",
          "enviados": 19,
          "comId": 17,
          "entregues": 17,
          "abertos": 2,
          "clicados": 0,
          "problemas": 0,
          "taxaAbertura": 11.8,
          "taxaClique": 0
        },
        {
          "chave": "sumiu-30",
          "enviados": 7,
          "comId": 2,
          "entregues": 2,
          "abertos": 2,
          "clicados": 0,
          "problemas": 0,
          "taxaAbertura": 100,
          "taxaClique": 0
        },
        {
          "chave": "vence:seguro",
          "enviados": 2,
          "comId": 2,
          "entregues": 2,
          "abertos": 0,
          "clicados": 0,
          "problemas": 0,
          "taxaAbertura": 0,
          "taxaClique": 0
        },
        {
          "chave": "vence:licenciamento",
          "enviados": 1,
          "comId": 1,
          "entregues": 1,
          "abertos": 0,
          "clicados": 0,
          "problemas": 0,
          "taxaAbertura": 0,
          "taxaClique": 0
        },
        {
          "chave": "preco:5dcb5a56-c25f-4c8c-b22f-878676b4d52f",
          "enviados": 1,
          "comId": 1,
          "entregues": 1,
          "abertos": 0,
          "clicados": 0,
          "problemas": 0,
          "taxaAbertura": 0,
          "taxaClique": 0
        },
        {
          "chave": "preco:8edb27dd-16e1-480c-ab9e-1ef6e0d1dc40",
          "enviados": 1,
          "comId": 1,
          "entregues": 1,
          "abertos": 0,
          "clicados": 0,
          "problemas": 0,
          "taxaAbertura": 0,
          "taxaClique": 0
        },
        {
          "chave": "vence:ipva",
          "enviados": 1,
          "comId": 1,
          "entregues": 1,
          "abertos": 0,
          "clicados": 0,
          "problemas": 0,
          "taxaAbertura": 0,
          "taxaClique": 0
        }
      ]
    },
    "uso": {
      "porDia": [
        {
          "dia": "2026-09-30",
          "usuarios": 5,
          "aberturas": 6,
          "aberturas_sem_identidade": 0
        },
        {
          "dia": "2026-09-29",
          "usuarios": 38,
          "aberturas": 49,
          "aberturas_sem_identidade": 0
        },
        {
          "dia": "2026-09-28",
          "usuarios": 41,
          "aberturas": 42,
          "aberturas_sem_identidade": 0
        },
        {
          "dia": "2026-09-27",
          "usuarios": 38,
          "aberturas": 64,
          "aberturas_sem_identidade": 0
        },
        {
          "dia": "2026-09-26",
          "usuarios": 39,
          "aberturas": 47,
          "aberturas_sem_identidade": 0
        },
        {
          "dia": "2026-09-25",
          "usuarios": 42,
          "aberturas": 58,
          "aberturas_sem_identidade": 0
        },
        {
          "dia": "2026-09-24",
          "usuarios": 16,
          "aberturas": 17,
          "aberturas_sem_identidade": 0
        },
        {
          "dia": "2026-09-23",
          "usuarios": 39,
          "aberturas": 48,
          "aberturas_sem_identidade": 0
        },
        {
          "dia": "2026-09-22",
          "usuarios": 33,
          "aberturas": 42,
          "aberturas_sem_identidade": 0
        },
        {
          "dia": "2026-09-21",
          "usuarios": 37,
          "aberturas": 47,
          "aberturas_sem_identidade": 0
        },
        {
          "dia": "2026-09-20",
          "usuarios": 25,
          "aberturas": 30,
          "aberturas_sem_identidade": 0
        },
        {
          "dia": "2026-09-19",
          "usuarios": 14,
          "aberturas": 16,
          "aberturas_sem_identidade": 0
        },
        {
          "dia": "2026-09-18",
          "usuarios": 9,
          "aberturas": 12,
          "aberturas_sem_identidade": 0
        },
        {
          "dia": "2026-09-17",
          "usuarios": 9,
          "aberturas": 16,
          "aberturas_sem_identidade": 0
        }
      ],
      "porSemana": [
        {
          "semana": "2026-09-28",
          "usuarios_ativos": 79,
          "aberturas": 97,
          "aberturas_por_usuario": 1.2,
          "aberturas_sem_identidade": 0
        },
        {
          "semana": "2026-09-21",
          "usuarios_ativos": 209,
          "aberturas": 323,
          "aberturas_por_usuario": 1.5,
          "aberturas_sem_identidade": 0
        },
        {
          "semana": "2026-09-14",
          "usuarios_ativos": 76,
          "aberturas": 106,
          "aberturas_por_usuario": 1.4,
          "aberturas_sem_identidade": 0
        },
        {
          "semana": "2026-09-07",
          "usuarios_ativos": 73,
          "aberturas": 111,
          "aberturas_por_usuario": 1.5,
          "aberturas_sem_identidade": 0
        },
        {
          "semana": "2026-08-31",
          "usuarios_ativos": 52,
          "aberturas": 130,
          "aberturas_por_usuario": 2.5,
          "aberturas_sem_identidade": 16
        },
        {
          "semana": "2026-08-24",
          "usuarios_ativos": 16,
          "aberturas": 84,
          "aberturas_por_usuario": 5.3,
          "aberturas_sem_identidade": 11
        },
        {
          "semana": "2026-08-17",
          "usuarios_ativos": 1,
          "aberturas": 4,
          "aberturas_por_usuario": 4,
          "aberturas_sem_identidade": 2
        }
      ],
      "coortes": [
        {
          "coorte": "2026-09-28",
          "cadastrados": 17,
          "voltaram_d1_7": 0,
          "voltaram_d8_30": 0,
          "semana_fechada": false,
          "d1_7_fechada": false,
          "d8_30_fechada": false
        },
        {
          "coorte": "2026-09-21",
          "cadastrados": 51,
          "voltaram_d1_7": 6,
          "voltaram_d8_30": 0,
          "semana_fechada": true,
          "d1_7_fechada": false,
          "d8_30_fechada": false
        },
        {
          "coorte": "2026-09-14",
          "cadastrados": 16,
          "voltaram_d1_7": 0,
          "voltaram_d8_30": 1,
          "semana_fechada": true,
          "d1_7_fechada": true,
          "d8_30_fechada": false
        },
        {
          "coorte": "2026-09-07",
          "cadastrados": 11,
          "voltaram_d1_7": 1,
          "voltaram_d8_30": 1,
          "semana_fechada": true,
          "d1_7_fechada": true,
          "d8_30_fechada": false
        },
        {
          "coorte": "2026-08-31",
          "cadastrados": 8,
          "voltaram_d1_7": 1,
          "voltaram_d8_30": 0,
          "semana_fechada": true,
          "d1_7_fechada": true,
          "d8_30_fechada": false
        },
        {
          "coorte": "2026-08-24",
          "cadastrados": 1,
          "voltaram_d1_7": 0,
          "voltaram_d8_30": 1,
          "semana_fechada": true,
          "d1_7_fechada": true,
          "d8_30_fechada": true
        }
      ],
      "linhasRetencao": [
        {
          "texto": "Retencao, coorte 2026-09-28: 17 cadastrados, 1 a 7 dias AINDA NAO DA PARA LER (fecha em 2026-10-12; hoje sao 0, PISO), 8 a 30 dias AINDA NAO DA PARA LER (fecha em 2026-11-04; hoje sao 0, PISO)",
          "legivel": false,
          "motivo": "janela(s) em aberto: 1 a 7 dias e 8 a 30 dias"
        },
        {
          "texto": "Retencao, coorte 2026-09-21: 51 cadastrados, 1 a 7 dias AINDA NAO DA PARA LER (fecha em 2026-10-05; hoje sao 6, PISO), 8 a 30 dias AINDA NAO DA PARA LER (fecha em 2026-10-28; hoje sao 0, PISO)",
          "legivel": false,
          "motivo": "janela(s) em aberto: 1 a 7 dias e 8 a 30 dias"
        },
        {
          "texto": "Retencao, coorte 2026-09-14: 16 cadastrados, 0 voltaram em 1 a 7 dias, 8 a 30 dias AINDA NAO DA PARA LER (fecha em 2026-10-21; hoje sao 1, PISO)",
          "legivel": false,
          "motivo": "janela(s) em aberto: 8 a 30 dias"
        },
        {
          "texto": "Retencao, coorte 2026-09-07: 11 cadastrados, 1 voltaram em 1 a 7 dias, 8 a 30 dias AINDA NAO DA PARA LER (fecha em 2026-10-14; hoje sao 1, PISO)",
          "legivel": false,
          "motivo": "janela(s) em aberto: 8 a 30 dias"
        },
        {
          "texto": "Retencao, coorte 2026-08-31: 8 cadastrados, 1 voltaram em 1 a 7 dias, 8 a 30 dias AINDA NAO DA PARA LER (fecha em 2026-10-07; hoje sao 0, PISO)",
          "legivel": false,
          "motivo": "janela(s) em aberto: 8 a 30 dias"
        },
        {
          "texto": "Retencao, coorte 2026-08-24: 1 cadastrados, 0 voltaram em 1 a 7 dias, 1 em 8 a 30 dias",
          "legivel": true,
          "motivo": ""
        }
      ],
      "linhasAtivacao": [
        {
          "texto": "Ativacao, coorte 2026-09-28: AINDA NAO DA PARA LER (a janela fecha em 2026-10-12; hoje sao 0 de 17, PISO)",
          "legivel": false,
          "motivo": "a janela de 7 dias fecha em 2026-10-12"
        },
        {
          "texto": "Ativacao, coorte 2026-09-21: AINDA NAO DA PARA LER (a janela fecha em 2026-10-05; hoje sao 2 de 51, PISO)",
          "legivel": false,
          "motivo": "a janela de 7 dias fecha em 2026-10-05"
        },
        {
          "texto": "Ativacao, coorte 2026-09-14: 3 de 16 fizeram a primeira acao de valor em 7 dias",
          "legivel": true,
          "motivo": ""
        },
        {
          "texto": "Ativacao, coorte 2026-09-07: 6 de 11 fizeram a primeira acao de valor em 7 dias",
          "legivel": true,
          "motivo": ""
        },
        {
          "texto": "Ativacao, coorte 2026-08-31: 1 de 8 fizeram a primeira acao de valor em 7 dias",
          "legivel": true,
          "motivo": ""
        },
        {
          "texto": "Ativacao, coorte 2026-08-24: 0 de 1 fizeram a primeira acao de valor em 7 dias",
          "legivel": true,
          "motivo": ""
        }
      ],
      "ativacao": [
        {
          "coorte": "2026-09-28",
          "cadastrados": 17,
          "ativados_7d": 0,
          "semana_fechada": false,
          "janela_fechada": false
        },
        {
          "coorte": "2026-09-21",
          "cadastrados": 51,
          "ativados_7d": 2,
          "semana_fechada": true,
          "janela_fechada": false
        },
        {
          "coorte": "2026-09-14",
          "cadastrados": 16,
          "ativados_7d": 3,
          "semana_fechada": true,
          "janela_fechada": true
        },
        {
          "coorte": "2026-09-07",
          "cadastrados": 11,
          "ativados_7d": 6,
          "semana_fechada": true,
          "janela_fechada": true
        },
        {
          "coorte": "2026-08-31",
          "cadastrados": 8,
          "ativados_7d": 1,
          "semana_fechada": true,
          "janela_fechada": true
        },
        {
          "coorte": "2026-08-24",
          "cadastrados": 1,
          "ativados_7d": 0,
          "semana_fechada": true,
          "janela_fechada": true
        }
      ]
    },
    "vendas": {
      "assinaturasCoortes": [
        {
          "coorte": "2026-09-01",
          "assinaram": 1,
          "renovaram": 0,
          "sairam": 0
        },
        {
          "coorte": "2026-08-01",
          "assinaram": 2,
          "renovaram": 0,
          "sairam": 0
        }
      ]
    },
    "marketing": {
      "cadastrosPorCampanha": [
        {
          "origem": "(direto)",
          "campanha": "(sem campanha)",
          "cadastros_28d": 83
        },
        {
          "origem": "google",
          "campanha": "lancamento",
          "cadastros_28d": 20
        }
      ]
    },
    "experimentos": [
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "a",
        "evento": "abriu_app",
        "eventos": 297,
        "pessoas": 181
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "a",
        "evento": "abriu_cadastro_de_carro",
        "eventos": 148,
        "pessoas": 148
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "a",
        "evento": "abriu_trilha",
        "eventos": 2,
        "pessoas": 2
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "a",
        "evento": "aceitou_convite_aviso",
        "eventos": 7,
        "pessoas": 7
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "a",
        "evento": "analisou_orcamento",
        "eventos": 2,
        "pessoas": 2
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "a",
        "evento": "atribuicao",
        "eventos": 158,
        "pessoas": 157
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "a",
        "evento": "cadastro",
        "eventos": 36,
        "pessoas": 36
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "a",
        "evento": "cadastrou_carro",
        "eventos": 65,
        "pessoas": 65
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "a",
        "evento": "clicou_baixar",
        "eventos": 51,
        "pessoas": 48
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "a",
        "evento": "comecou_onboarding",
        "eventos": 290,
        "pessoas": 290
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "a",
        "evento": "consultou_sintoma",
        "eventos": 83,
        "pessoas": 42
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "a",
        "evento": "convite_aviso",
        "eventos": 31,
        "pessoas": 27
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "a",
        "evento": "iniciou_checkout",
        "eventos": 2,
        "pessoas": 2
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "a",
        "evento": "perguntou_biela",
        "eventos": 2,
        "pessoas": 2
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "a",
        "evento": "permissao_aviso_concedida",
        "eventos": 9,
        "pessoas": 9
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "a",
        "evento": "registrou_abastecimento",
        "eventos": 2,
        "pessoas": 2
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "a",
        "evento": "registrou_servico",
        "eventos": 6,
        "pessoas": 5
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "a",
        "evento": "tentou_assinar",
        "eventos": 1,
        "pessoas": 1
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "a",
        "evento": "terminou_onboarding",
        "eventos": 178,
        "pessoas": 178
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "a",
        "evento": "viu_aula",
        "eventos": 98,
        "pessoas": 40
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "a",
        "evento": "viu_paywall",
        "eventos": 35,
        "pessoas": 33
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "b",
        "evento": "abriu_app",
        "eventos": 235,
        "pessoas": 167
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "b",
        "evento": "abriu_cadastro_de_carro",
        "eventos": 144,
        "pessoas": 144
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "b",
        "evento": "abriu_trilha",
        "eventos": 3,
        "pessoas": 1
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "b",
        "evento": "aceitou_convite_aviso",
        "eventos": 6,
        "pessoas": 6
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "b",
        "evento": "atribuicao",
        "eventos": 153,
        "pessoas": 153
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "b",
        "evento": "cadastro",
        "eventos": 49,
        "pessoas": 49
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "b",
        "evento": "cadastrou_carro",
        "eventos": 94,
        "pessoas": 91
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "b",
        "evento": "clicou_baixar",
        "eventos": 58,
        "pessoas": 56
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "b",
        "evento": "comecou_onboarding",
        "eventos": 270,
        "pessoas": 270
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "b",
        "evento": "consultou_sintoma",
        "eventos": 49,
        "pessoas": 24
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "b",
        "evento": "convite_aviso",
        "eventos": 33,
        "pessoas": 27
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "b",
        "evento": "iniciou_checkout",
        "eventos": 3,
        "pessoas": 2
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "b",
        "evento": "perguntou_biela",
        "eventos": 3,
        "pessoas": 3
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "b",
        "evento": "permissao_aviso_concedida",
        "eventos": 7,
        "pessoas": 7
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "b",
        "evento": "registrou_abastecimento",
        "eventos": 2,
        "pessoas": 2
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "b",
        "evento": "registrou_servico",
        "eventos": 13,
        "pessoas": 8
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "b",
        "evento": "tentou_assinar",
        "eventos": 2,
        "pessoas": 2
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "b",
        "evento": "terminou_onboarding",
        "eventos": 166,
        "pessoas": 166
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "b",
        "evento": "viu_aula",
        "eventos": 61,
        "pessoas": 32
      },
      {
        "experimento": "cadastro-em-duas-etapas",
        "variante": "b",
        "evento": "viu_paywall",
        "eventos": 34,
        "pessoas": 32
      },
      {
        "experimento": "onboarding-curto",
        "variante": "a",
        "evento": "abriu_app",
        "eventos": 224,
        "pessoas": 153
      },
      {
        "experimento": "onboarding-curto",
        "variante": "a",
        "evento": "abriu_cadastro_de_carro",
        "eventos": 132,
        "pessoas": 132
      },
      {
        "experimento": "onboarding-curto",
        "variante": "a",
        "evento": "abriu_trilha",
        "eventos": 4,
        "pessoas": 2
      },
      {
        "experimento": "onboarding-curto",
        "variante": "a",
        "evento": "aceitou_convite_aviso",
        "eventos": 6,
        "pessoas": 6
      },
      {
        "experimento": "onboarding-curto",
        "variante": "a",
        "evento": "analisou_orcamento",
        "eventos": 1,
        "pessoas": 1
      },
      {
        "experimento": "onboarding-curto",
        "variante": "a",
        "evento": "atribuicao",
        "eventos": 133,
        "pessoas": 133
      },
      {
        "experimento": "onboarding-curto",
        "variante": "a",
        "evento": "cadastro",
        "eventos": 49,
        "pessoas": 49
      },
      {
        "experimento": "onboarding-curto",
        "variante": "a",
        "evento": "cadastrou_carro",
        "eventos": 81,
        "pessoas": 79
      },
      {
        "experimento": "onboarding-curto",
        "variante": "a",
        "evento": "clicou_baixar",
        "eventos": 55,
        "pessoas": 54
      },
      {
        "experimento": "onboarding-curto",
        "variante": "a",
        "evento": "comecou_onboarding",
        "eventos": 268,
        "pessoas": 268
      },
      {
        "experimento": "onboarding-curto",
        "variante": "a",
        "evento": "consultou_sintoma",
        "eventos": 54,
        "pessoas": 25
      },
      {
        "experimento": "onboarding-curto",
        "variante": "a",
        "evento": "convite_aviso",
        "eventos": 30,
        "pessoas": 24
      },
      {
        "experimento": "onboarding-curto",
        "variante": "a",
        "evento": "iniciou_checkout",
        "eventos": 3,
        "pessoas": 2
      },
      {
        "experimento": "onboarding-curto",
        "variante": "a",
        "evento": "perguntou_biela",
        "eventos": 4,
        "pessoas": 4
      },
      {
        "experimento": "onboarding-curto",
        "variante": "a",
        "evento": "permissao_aviso_concedida",
        "eventos": 6,
        "pessoas": 6
      },
      {
        "experimento": "onboarding-curto",
        "variante": "a",
        "evento": "registrou_abastecimento",
        "eventos": 2,
        "pessoas": 2
      },
      {
        "experimento": "onboarding-curto",
        "variante": "a",
        "evento": "registrou_servico",
        "eventos": 13,
        "pessoas": 7
      },
      {
        "experimento": "onboarding-curto",
        "variante": "a",
        "evento": "tentou_assinar",
        "eventos": 1,
        "pessoas": 1
      },
      {
        "experimento": "onboarding-curto",
        "variante": "a",
        "evento": "terminou_onboarding",
        "eventos": 152,
        "pessoas": 152
      },
      {
        "experimento": "onboarding-curto",
        "variante": "a",
        "evento": "viu_aula",
        "eventos": 59,
        "pessoas": 29
      },
      {
        "experimento": "onboarding-curto",
        "variante": "a",
        "evento": "viu_paywall",
        "eventos": 30,
        "pessoas": 29
      },
      {
        "experimento": "onboarding-curto",
        "variante": "b",
        "evento": "abriu_app",
        "eventos": 308,
        "pessoas": 195
      },
      {
        "experimento": "onboarding-curto",
        "variante": "b",
        "evento": "abriu_cadastro_de_carro",
        "eventos": 160,
        "pessoas": 160
      },
      {
        "experimento": "onboarding-curto",
        "variante": "b",
        "evento": "abriu_trilha",
        "eventos": 1,
        "pessoas": 1
      },
      {
        "experimento": "onboarding-curto",
        "variante": "b",
        "evento": "aceitou_convite_aviso",
        "eventos": 7,
        "pessoas": 7
      },
      {
        "experimento": "onboarding-curto",
        "variante": "b",
        "evento": "analisou_orcamento",
        "eventos": 1,
        "pessoas": 1
      },
      {
        "experimento": "onboarding-curto",
        "variante": "b",
        "evento": "atribuicao",
        "eventos": 178,
        "pessoas": 177
      },
      {
        "experimento": "onboarding-curto",
        "variante": "b",
        "evento": "cadastro",
        "eventos": 36,
        "pessoas": 36
      },
      {
        "experimento": "onboarding-curto",
        "variante": "b",
        "evento": "cadastrou_carro",
        "eventos": 78,
        "pessoas": 77
      },
      {
        "experimento": "onboarding-curto",
        "variante": "b",
        "evento": "clicou_baixar",
        "eventos": 54,
        "pessoas": 50
      },
      {
        "experimento": "onboarding-curto",
        "variante": "b",
        "evento": "comecou_onboarding",
        "eventos": 292,
        "pessoas": 292
      },
      {
        "experimento": "onboarding-curto",
        "variante": "b",
        "evento": "consultou_sintoma",
        "eventos": 78,
        "pessoas": 41
      },
      {
        "experimento": "onboarding-curto",
        "variante": "b",
        "evento": "convite_aviso",
        "eventos": 34,
        "pessoas": 30
      },
      {
        "experimento": "onboarding-curto",
        "variante": "b",
        "evento": "iniciou_checkout",
        "eventos": 2,
        "pessoas": 2
      },
      {
        "experimento": "onboarding-curto",
        "variante": "b",
        "evento": "perguntou_biela",
        "eventos": 1,
        "pessoas": 1
      },
      {
        "experimento": "onboarding-curto",
        "variante": "b",
        "evento": "permissao_aviso_concedida",
        "eventos": 10,
        "pessoas": 10
      },
      {
        "experimento": "onboarding-curto",
        "variante": "b",
        "evento": "registrou_abastecimento",
        "eventos": 2,
        "pessoas": 2
      },
      {
        "experimento": "onboarding-curto",
        "variante": "b",
        "evento": "registrou_servico",
        "eventos": 6,
        "pessoas": 6
      },
      {
        "experimento": "onboarding-curto",
        "variante": "b",
        "evento": "tentou_assinar",
        "eventos": 2,
        "pessoas": 2
      },
      {
        "experimento": "onboarding-curto",
        "variante": "b",
        "evento": "terminou_onboarding",
        "eventos": 192,
        "pessoas": 192
      },
      {
        "experimento": "onboarding-curto",
        "variante": "b",
        "evento": "viu_aula",
        "eventos": 100,
        "pessoas": 43
      },
      {
        "experimento": "onboarding-curto",
        "variante": "b",
        "evento": "viu_paywall",
        "eventos": 39,
        "pessoas": 36
      }
    ],
    "quebraFunil": [
      {
        "de": "abriu_app",
        "para": "viu_paywall",
        "antes": 452,
        "depois": 105,
        "validoDesde": "2026-08-22",
        "ressalvas": [
          "no Android o paywall APARECE e não tem botão de compra (modo leitor, sem a chave do RevenueCat no build), e 85% das exibições vêm de lá. Taxa de paywall para checkout somando as tres plataformas mede um denominador que não converte por construção"
        ],
        "taxa": 23.2,
        "motivo": null,
        "perdidos": 347
      },
      {
        "de": "cadastro",
        "para": "iniciou_checkout",
        "antes": 112,
        "depois": 11,
        "validoDesde": "2026-08-22",
        "ressalvas": [
          "contado em auth.users (função contas_criadas_desde), não no evento: o evento só dispara para conta com menos de 7 dias e perde tudo que veio antes do instrumento"
        ],
        "taxa": 9.8,
        "motivo": null,
        "perdidos": 101
      },
      {
        "de": "iniciou_checkout",
        "para": "assinou",
        "antes": 11,
        "depois": 1,
        "validoDesde": "2026-08-22",
        "ressalvas": [],
        "taxa": null,
        "motivo": "iniciou_checkout é contado por APARELHO (identidade = anon_id) e assinou por CONTA (identidade = user_id, porque vem do webhook e não tem aparelho). São duas listas de chaves diferentes: quem está numa nunca aparece dentro da outra, e a taxa entre elas é ficção",
        "perdidos": null
      },
      {
        "de": "comecou_onboarding",
        "para": "terminou_onboarding",
        "antes": 828,
        "depois": 440,
        "validoDesde": "2026-09-01",
        "ressalvas": [],
        "taxa": 53.1,
        "motivo": null,
        "perdidos": 388
      },
      {
        "de": "terminou_onboarding",
        "para": "abriu_cadastro_de_carro",
        "antes": 440,
        "depois": 333,
        "validoDesde": "2026-09-01",
        "ressalvas": [],
        "taxa": 75.7,
        "motivo": null,
        "perdidos": 107
      },
      {
        "de": "abriu_cadastro_de_carro",
        "para": "cadastrou_carro",
        "antes": 333,
        "depois": 168,
        "validoDesde": "2026-09-01",
        "ressalvas": [
          "isto é ATO, e conta só quem cadastrou DENTRO da janela. Para quantos TÊM carro hoje, some as contas em estado_da_base: o ato não enxerga quem cadastrou antes do instrumento (23/08/2026) nem quem usa como convidado, sem conta"
        ],
        "taxa": 50.5,
        "motivo": null,
        "perdidos": 165
      }
    ],
    "janelaDoFunil": {
      "desde": "2026-09-02",
      "encurtada": false,
      "aviso": null
    },
    "estadoDaBase": {
      "contas": 121,
      "contas_com_estado": 115,
      "contas_com_carro": 91,
      "contas_com_servico": 13,
      "contas_ativas_7d": 54,
      "contas_ativas_30d": 106
    },
    "anomalias": [
      {
        "anomalia": "abriu o cadastro de carro e sumiu",
        "plataforma": "android",
        "quantas": 5,
        "detalhe": "sem nenhum evento depois de abrir o cadastro; indicio, nao prova"
      },
      {
        "anomalia": "abriu o cadastro de carro e sumiu",
        "plataforma": "ios",
        "quantas": 1,
        "detalhe": "sem nenhum evento depois de abrir o cadastro; indicio, nao prova"
      },
      {
        "anomalia": "acao que costuma ser a ultima",
        "plataforma": "web",
        "quantas": 57,
        "detalhe": "de 76 vezes de comecou_onboarding (75.0%), base da plataforma 49.4%; indicio, nao prova"
      },
      {
        "anomalia": "acao que costuma ser a ultima",
        "plataforma": "android",
        "quantas": 24,
        "detalhe": "de 70 vezes de cadastro (34.3%), base da plataforma 16.9%; indicio, nao prova"
      },
      {
        "anomalia": "acao que costuma ser a ultima",
        "plataforma": "android",
        "quantas": 16,
        "detalhe": "de 45 vezes de viu_paywall (35.6%), base da plataforma 16.9%; indicio, nao prova"
      },
      {
        "anomalia": "app fechou sozinho",
        "plataforma": "android",
        "quantas": 13,
        "detalhe": "versoes: 2.7.0, 2.8.0, 2.9.0; PISO, nao taxa: so conta quem reabriu o app"
      },
      {
        "anomalia": "app fechou sozinho",
        "plataforma": "ios",
        "quantas": 1,
        "detalhe": "versoes: 2.9.0; PISO, nao taxa: so conta quem reabriu o app"
      }
    ],
    "fontesExternas": {
      "youtube": [
        {
          "dia": "2026-09-30",
          "dados": {
            "recentes": [
              {
                "views": 1072,
                "titulo": "A pergunta que muda a conversa na oficina antes de aprovar o orçamento",
                "publicadoEm": "2026-09-19T13:29:15Z"
              },
              {
                "views": 20,
                "titulo": "Poça embaixo do carro: quando é normal e quando é vazamento",
                "publicadoEm": "2026-09-19T13:28:32Z"
              },
              {
                "views": 108,
                "titulo": "Etanol ou gasolina? A conta dos 70% e por que ela pode estar errada pro seu carro",
                "publicadoEm": "2026-09-19T13:27:53Z"
              },
              {
                "views": 123,
                "titulo": "O número no pneu não é a pressão do seu carro — onde está a certa",
                "publicadoEm": "2026-09-19T13:27:24Z"
              },
              {
                "views": 2031,
                "titulo": "Por que o carro perde força na serra? O que acontece com o motor em altitude",
                "publicadoEm": "2026-09-19T13:26:18Z"
              },
              {
                "views": 1834,
                "titulo": "Água de Torneira no radiador - você está estregando seu carro!",
                "publicadoEm": "2026-09-17T03:00:09Z"
              },
              {
                "views": 2,
                "titulo": "Erro silencioso de quem vai só na padaria!",
                "publicadoEm": "2026-09-10T03:00:39Z"
              },
              {
                "views": 5,
                "titulo": "Desligar o turbo quente: Mito ou Verdade?",
                "publicadoEm": "2026-09-03T10:12:37Z"
              },
              {
                "views": 4518,
                "titulo": "Esquentar o carro parado",
                "publicadoEm": "2026-09-03T10:10:14Z"
              },
              {
                "views": 2,
                "titulo": "SUPERCHARGER OU TURBO",
                "publicadoEm": "2026-08-28T13:52:12Z"
              }
            ],
            "inscritos": 8,
            "totalVideos": 9,
            "viewsTotais": 8557
          }
        },
        {
          "dia": "2026-09-29",
          "dados": {
            "recentes": [
              {
                "views": 963,
                "titulo": "A pergunta que muda a conversa na oficina antes de aprovar o orçamento",
                "publicadoEm": "2026-09-19T13:29:15Z"
              },
              {
                "views": 20,
                "titulo": "Poça embaixo do carro: quando é normal e quando é vazamento",
                "publicadoEm": "2026-09-19T13:28:32Z"
              },
              {
                "views": 108,
                "titulo": "Etanol ou gasolina? A conta dos 70% e por que ela pode estar errada pro seu carro",
                "publicadoEm": "2026-09-19T13:27:53Z"
              },
              {
                "views": 123,
                "titulo": "O número no pneu não é a pressão do seu carro — onde está a certa",
                "publicadoEm": "2026-09-19T13:27:24Z"
              },
              {
                "views": 1770,
                "titulo": "Por que o carro perde força na serra? O que acontece com o motor em altitude",
                "publicadoEm": "2026-09-19T13:26:18Z"
              },
              {
                "views": 1113,
                "titulo": "Água de Torneira no radiador - você está estregando seu carro!",
                "publicadoEm": "2026-09-17T03:00:09Z"
              },
              {
                "views": 2,
                "titulo": "Erro silencioso de quem vai só na padaria!",
                "publicadoEm": "2026-09-10T03:00:39Z"
              },
              {
                "views": 5,
                "titulo": "Desligar o turbo quente: Mito ou Verdade?",
                "publicadoEm": "2026-09-03T10:12:37Z"
              },
              {
                "views": 3169,
                "titulo": "Esquentar o carro parado",
                "publicadoEm": "2026-09-03T10:10:14Z"
              },
              {
                "views": 2,
                "titulo": "SUPERCHARGER OU TURBO",
                "publicadoEm": "2026-08-28T13:52:12Z"
              }
            ],
            "inscritos": 7,
            "totalVideos": 9,
            "viewsTotais": 5750
          }
        },
        {
          "dia": "2026-09-28",
          "dados": {
            "recentes": [
              {
                "views": 898,
                "titulo": "A pergunta que muda a conversa na oficina antes de aprovar o orçamento",
                "publicadoEm": "2026-09-19T13:29:15Z"
              },
              {
                "views": 19,
                "titulo": "Poça embaixo do carro: quando é normal e quando é vazamento",
                "publicadoEm": "2026-09-19T13:28:32Z"
              },
              {
                "views": 108,
                "titulo": "Etanol ou gasolina? A conta dos 70% e por que ela pode estar errada pro seu carro",
                "publicadoEm": "2026-09-19T13:27:53Z"
              },
              {
                "views": 123,
                "titulo": "O número no pneu não é a pressão do seu carro — onde está a certa",
                "publicadoEm": "2026-09-19T13:27:24Z"
              },
              {
                "views": 1427,
                "titulo": "Por que o carro perde força na serra? O que acontece com o motor em altitude",
                "publicadoEm": "2026-09-19T13:26:18Z"
              },
              {
                "views": 936,
                "titulo": "Água de Torneira no radiador - você está estregando seu carro!",
                "publicadoEm": "2026-09-17T03:00:09Z"
              },
              {
                "views": 2,
                "titulo": "Erro silencioso de quem vai só na padaria!",
                "publicadoEm": "2026-09-10T03:00:39Z"
              },
              {
                "views": 5,
                "titulo": "Desligar o turbo quente: Mito ou Verdade?",
                "publicadoEm": "2026-09-03T10:12:37Z"
              },
              {
                "views": 1815,
                "titulo": "Esquentar o carro parado",
                "publicadoEm": "2026-09-03T10:10:14Z"
              },
              {
                "views": 2,
                "titulo": "SUPERCHARGER OU TURBO",
                "publicadoEm": "2026-08-28T13:52:12Z"
              }
            ],
            "inscritos": 6,
            "totalVideos": 9,
            "viewsTotais": 4765
          }
        },
        {
          "dia": "2026-09-27",
          "dados": {
            "recentes": [
              {
                "views": 867,
                "titulo": "A pergunta que muda a conversa na oficina antes de aprovar o orçamento",
                "publicadoEm": "2026-09-19T13:29:15Z"
              },
              {
                "views": 19,
                "titulo": "Poça embaixo do carro: quando é normal e quando é vazamento",
                "publicadoEm": "2026-09-19T13:28:32Z"
              },
              {
                "views": 107,
                "titulo": "Etanol ou gasolina? A conta dos 70% e por que ela pode estar errada pro seu carro",
                "publicadoEm": "2026-09-19T13:27:53Z"
              },
              {
                "views": 123,
                "titulo": "O número no pneu não é a pressão do seu carro — onde está a certa",
                "publicadoEm": "2026-09-19T13:27:24Z"
              },
              {
                "views": 1267,
                "titulo": "Por que o carro perde força na serra? O que acontece com o motor em altitude",
                "publicadoEm": "2026-09-19T13:26:18Z"
              },
              {
                "views": 865,
                "titulo": "Água de Torneira no radiador - você está estregando seu carro!",
                "publicadoEm": "2026-09-17T03:00:09Z"
              },
              {
                "views": 2,
                "titulo": "Erro silencioso de quem vai só na padaria!",
                "publicadoEm": "2026-09-10T03:00:39Z"
              },
              {
                "views": 4,
                "titulo": "Desligar o turbo quente: Mito ou Verdade?",
                "publicadoEm": "2026-09-03T10:12:37Z"
              },
              {
                "views": 1523,
                "titulo": "Esquentar o carro parado",
                "publicadoEm": "2026-09-03T10:10:14Z"
              },
              {
                "views": 2,
                "titulo": "SUPERCHARGER OU TURBO",
                "publicadoEm": "2026-08-28T13:52:12Z"
              }
            ],
            "inscritos": 6,
            "totalVideos": 9,
            "viewsTotais": 4502
          }
        },
        {
          "dia": "2026-09-26",
          "dados": {
            "recentes": [
              {
                "views": 800,
                "titulo": "A pergunta que muda a conversa na oficina antes de aprovar o orçamento",
                "publicadoEm": "2026-09-19T13:29:15Z"
              },
              {
                "views": 17,
                "titulo": "Poça embaixo do carro: quando é normal e quando é vazamento",
                "publicadoEm": "2026-09-19T13:28:32Z"
              },
              {
                "views": 104,
                "titulo": "Etanol ou gasolina? A conta dos 70% e por que ela pode estar errada pro seu carro",
                "publicadoEm": "2026-09-19T13:27:53Z"
              },
              {
                "views": 122,
                "titulo": "O número no pneu não é a pressão do seu carro — onde está a certa",
                "publicadoEm": "2026-09-19T13:27:24Z"
              },
              {
                "views": 1175,
                "titulo": "Por que o carro perde força na serra? O que acontece com o motor em altitude",
                "publicadoEm": "2026-09-19T13:26:18Z"
              },
              {
                "views": 811,
                "titulo": "Água de Torneira no radiador - você está estregando seu carro!",
                "publicadoEm": "2026-09-17T03:00:09Z"
              },
              {
                "views": 2,
                "titulo": "Erro silencioso de quem vai só na padaria!",
                "publicadoEm": "2026-09-10T03:00:39Z"
              },
              {
                "views": 4,
                "titulo": "Desligar o turbo quente: Mito ou Verdade?",
                "publicadoEm": "2026-09-03T10:12:37Z"
              },
              {
                "views": 1223,
                "titulo": "Esquentar o carro parado",
                "publicadoEm": "2026-09-03T10:10:14Z"
              },
              {
                "views": 2,
                "titulo": "SUPERCHARGER OU TURBO",
                "publicadoEm": "2026-08-28T13:52:12Z"
              }
            ],
            "inscritos": 6,
            "totalVideos": 9,
            "viewsTotais": 3963
          }
        },
        {
          "dia": "2026-09-25",
          "dados": {
            "recentes": [
              {
                "views": 617,
                "titulo": "A pergunta que muda a conversa na oficina antes de aprovar o orçamento",
                "publicadoEm": "2026-09-19T13:29:15Z"
              },
              {
                "views": 17,
                "titulo": "Poça embaixo do carro: quando é normal e quando é vazamento",
                "publicadoEm": "2026-09-19T13:28:32Z"
              },
              {
                "views": 101,
                "titulo": "Etanol ou gasolina? A conta dos 70% e por que ela pode estar errada pro seu carro",
                "publicadoEm": "2026-09-19T13:27:53Z"
              },
              {
                "views": 122,
                "titulo": "O número no pneu não é a pressão do seu carro — onde está a certa",
                "publicadoEm": "2026-09-19T13:27:24Z"
              },
              {
                "views": 1090,
                "titulo": "Por que o carro perde força na serra? O que acontece com o motor em altitude",
                "publicadoEm": "2026-09-19T13:26:18Z"
              },
              {
                "views": 788,
                "titulo": "Água de Torneira no radiador - você está estregando seu carro!",
                "publicadoEm": "2026-09-17T03:00:09Z"
              },
              {
                "views": 2,
                "titulo": "Erro silencioso de quem vai só na padaria!",
                "publicadoEm": "2026-09-10T03:00:39Z"
              },
              {
                "views": 4,
                "titulo": "Desligar o turbo quente: Mito ou Verdade?",
                "publicadoEm": "2026-09-03T10:12:37Z"
              },
              {
                "views": 723,
                "titulo": "Esquentar o carro parado",
                "publicadoEm": "2026-09-03T10:10:14Z"
              },
              {
                "views": 2,
                "titulo": "SUPERCHARGER OU TURBO",
                "publicadoEm": "2026-08-28T13:52:12Z"
              }
            ],
            "inscritos": 6,
            "totalVideos": 9,
            "viewsTotais": 3022
          }
        },
        {
          "dia": "2026-09-24",
          "dados": {
            "recentes": [
              {
                "views": 561,
                "titulo": "A pergunta que muda a conversa na oficina antes de aprovar o orçamento",
                "publicadoEm": "2026-09-19T13:29:15Z"
              },
              {
                "views": 17,
                "titulo": "Poça embaixo do carro: quando é normal e quando é vazamento",
                "publicadoEm": "2026-09-19T13:28:32Z"
              },
              {
                "views": 100,
                "titulo": "Etanol ou gasolina? A conta dos 70% e por que ela pode estar errada pro seu carro",
                "publicadoEm": "2026-09-19T13:27:53Z"
              },
              {
                "views": 122,
                "titulo": "O número no pneu não é a pressão do seu carro — onde está a certa",
                "publicadoEm": "2026-09-19T13:27:24Z"
              },
              {
                "views": 939,
                "titulo": "Por que o carro perde força na serra? O que acontece com o motor em altitude",
                "publicadoEm": "2026-09-19T13:26:18Z"
              },
              {
                "views": 751,
                "titulo": "Água de Torneira no radiador - você está estregando seu carro!",
                "publicadoEm": "2026-09-17T03:00:09Z"
              },
              {
                "views": 2,
                "titulo": "Erro silencioso de quem vai só na padaria!",
                "publicadoEm": "2026-09-10T03:00:39Z"
              },
              {
                "views": 4,
                "titulo": "Desligar o turbo quente: Mito ou Verdade?",
                "publicadoEm": "2026-09-03T10:12:37Z"
              },
              {
                "views": 540,
                "titulo": "Esquentar o carro parado",
                "publicadoEm": "2026-09-03T10:10:14Z"
              },
              {
                "views": 2,
                "titulo": "SUPERCHARGER OU TURBO",
                "publicadoEm": "2026-08-28T13:52:12Z"
              }
            ],
            "inscritos": 6,
            "totalVideos": 9,
            "viewsTotais": 3021
          }
        },
        {
          "dia": "2026-09-23",
          "dados": {
            "recentes": [
              {
                "views": 556,
                "titulo": "A pergunta que muda a conversa na oficina antes de aprovar o orçamento",
                "publicadoEm": "2026-09-19T13:29:15Z"
              },
              {
                "views": 17,
                "titulo": "Poça embaixo do carro: quando é normal e quando é vazamento",
                "publicadoEm": "2026-09-19T13:28:32Z"
              },
              {
                "views": 100,
                "titulo": "Etanol ou gasolina? A conta dos 70% e por que ela pode estar errada pro seu carro",
                "publicadoEm": "2026-09-19T13:27:53Z"
              },
              {
                "views": 122,
                "titulo": "O número no pneu não é a pressão do seu carro — onde está a certa",
                "publicadoEm": "2026-09-19T13:27:24Z"
              },
              {
                "views": 925,
                "titulo": "Por que o carro perde força na serra? O que acontece com o motor em altitude",
                "publicadoEm": "2026-09-19T13:26:18Z"
              },
              {
                "views": 744,
                "titulo": "Água de Torneira no radiador - você está estregando seu carro!",
                "publicadoEm": "2026-09-17T03:00:09Z"
              },
              {
                "views": 2,
                "titulo": "Erro silencioso de quem vai só na padaria!",
                "publicadoEm": "2026-09-10T03:00:39Z"
              },
              {
                "views": 4,
                "titulo": "Desligar o turbo quente: Mito ou Verdade?",
                "publicadoEm": "2026-09-03T10:12:37Z"
              },
              {
                "views": 530,
                "titulo": "Esquentar o carro parado",
                "publicadoEm": "2026-09-03T10:10:14Z"
              },
              {
                "views": 2,
                "titulo": "SUPERCHARGER OU TURBO",
                "publicadoEm": "2026-08-28T13:52:12Z"
              }
            ],
            "inscritos": 6,
            "totalVideos": 9,
            "viewsTotais": 2976
          }
        },
        {
          "dia": "2026-09-22",
          "dados": {
            "recentes": [
              {
                "views": 553,
                "titulo": "A pergunta que muda a conversa na oficina antes de aprovar o orçamento",
                "publicadoEm": "2026-09-19T13:29:15Z"
              },
              {
                "views": 14,
                "titulo": "Poça embaixo do carro: quando é normal e quando é vazamento",
                "publicadoEm": "2026-09-19T13:28:32Z"
              },
              {
                "views": 99,
                "titulo": "Etanol ou gasolina? A conta dos 70% e por que ela pode estar errada pro seu carro",
                "publicadoEm": "2026-09-19T13:27:53Z"
              },
              {
                "views": 122,
                "titulo": "O número no pneu não é a pressão do seu carro — onde está a certa",
                "publicadoEm": "2026-09-19T13:27:24Z"
              },
              {
                "views": 895,
                "titulo": "Por que o carro perde força na serra? O que acontece com o motor em altitude",
                "publicadoEm": "2026-09-19T13:26:18Z"
              },
              {
                "views": 742,
                "titulo": "Água de Torneira no radiador - você está estregando seu carro!",
                "publicadoEm": "2026-09-17T03:00:09Z"
              },
              {
                "views": 2,
                "titulo": "Erro silencioso de quem vai só na padaria!",
                "publicadoEm": "2026-09-10T03:00:39Z"
              },
              {
                "views": 4,
                "titulo": "Desligar o turbo quente: Mito ou Verdade?",
                "publicadoEm": "2026-09-03T10:12:37Z"
              },
              {
                "views": 515,
                "titulo": "Esquentar o carro parado",
                "publicadoEm": "2026-09-03T10:10:14Z"
              },
              {
                "views": 2,
                "titulo": "SUPERCHARGER OU TURBO",
                "publicadoEm": "2026-08-28T13:52:12Z"
              }
            ],
            "inscritos": 6,
            "totalVideos": 9,
            "viewsTotais": 2910
          }
        },
        {
          "dia": "2026-09-21",
          "dados": {
            "recentes": [
              {
                "views": 540,
                "titulo": "A pergunta que muda a conversa na oficina antes de aprovar o orçamento",
                "publicadoEm": "2026-09-19T13:29:15Z"
              },
              {
                "views": 9,
                "titulo": "Poça embaixo do carro: quando é normal e quando é vazamento",
                "publicadoEm": "2026-09-19T13:28:32Z"
              },
              {
                "views": 85,
                "titulo": "Etanol ou gasolina? A conta dos 70% e por que ela pode estar errada pro seu carro",
                "publicadoEm": "2026-09-19T13:27:53Z"
              },
              {
                "views": 99,
                "titulo": "O número no pneu não é a pressão do seu carro — onde está a certa",
                "publicadoEm": "2026-09-19T13:27:24Z"
              },
              {
                "views": 836,
                "titulo": "Por que o carro perde força na serra? O que acontece com o motor em altitude",
                "publicadoEm": "2026-09-19T13:26:18Z"
              },
              {
                "views": 724,
                "titulo": "Água de Torneira no radiador - você está estregando seu carro!",
                "publicadoEm": "2026-09-17T03:00:09Z"
              },
              {
                "views": 2,
                "titulo": "Erro silencioso de quem vai só na padaria!",
                "publicadoEm": "2026-09-10T03:00:39Z"
              },
              {
                "views": 4,
                "titulo": "Desligar o turbo quente: Mito ou Verdade?",
                "publicadoEm": "2026-09-03T10:12:37Z"
              },
              {
                "views": 479,
                "titulo": "Esquentar o carro parado",
                "publicadoEm": "2026-09-03T10:10:14Z"
              },
              {
                "views": 2,
                "titulo": "SUPERCHARGER OU TURBO",
                "publicadoEm": "2026-08-28T13:52:12Z"
              }
            ],
            "inscritos": 5,
            "totalVideos": 9,
            "viewsTotais": 71
          }
        },
        {
          "dia": "2026-09-20",
          "dados": {
            "recentes": [
              {
                "views": 1,
                "titulo": "A pergunta que muda a conversa na oficina antes de aprovar o orçamento",
                "publicadoEm": "2026-09-19T13:29:15Z"
              },
              {
                "views": 4,
                "titulo": "Poça embaixo do carro: quando é normal e quando é vazamento",
                "publicadoEm": "2026-09-19T13:28:32Z"
              },
              {
                "views": 36,
                "titulo": "Etanol ou gasolina? A conta dos 70% e por que ela pode estar errada pro seu carro",
                "publicadoEm": "2026-09-19T13:27:53Z"
              },
              {
                "views": 10,
                "titulo": "O número no pneu não é a pressão do seu carro — onde está a certa",
                "publicadoEm": "2026-09-19T13:27:24Z"
              },
              {
                "views": 61,
                "titulo": "Por que o carro perde força na serra? O que acontece com o motor em altitude",
                "publicadoEm": "2026-09-19T13:26:18Z"
              },
              {
                "views": 31,
                "titulo": "Água de Torneira no radiador - você está estregando seu carro!",
                "publicadoEm": "2026-09-17T03:00:09Z"
              },
              {
                "views": 0,
                "titulo": "Erro silencioso de quem vai só na padaria!",
                "publicadoEm": "2026-09-10T03:00:39Z"
              },
              {
                "views": 4,
                "titulo": "Desligar o turbo quente: Mito ou Verdade?",
                "publicadoEm": "2026-09-03T10:12:37Z"
              },
              {
                "views": 36,
                "titulo": "Esquentar o carro parado",
                "publicadoEm": "2026-09-03T10:10:14Z"
              },
              {
                "views": 2,
                "titulo": "SUPERCHARGER OU TURBO",
                "publicadoEm": "2026-08-28T13:52:12Z"
              }
            ],
            "inscritos": 1,
            "totalVideos": 9,
            "viewsTotais": 70
          }
        }
      ],
      "vercel": [
        {
          "dia": "2026-09-30",
          "dados": {
            "ultimo": {
              "alvo": "production",
              "estado": "READY",
              "quando": "2026-09-29T21:27:44.621Z"
            },
            "comErro7d": 0,
            "deploys7d": 20,
            "prontos7d": 20
          }
        },
        {
          "dia": "2026-09-29",
          "dados": {
            "ultimo": {
              "alvo": "production",
              "estado": "READY",
              "quando": "2026-09-29T00:20:24.095Z"
            },
            "comErro7d": 0,
            "deploys7d": 20,
            "prontos7d": 20
          }
        },
        {
          "dia": "2026-09-28",
          "dados": {
            "ultimo": {
              "alvo": "production",
              "estado": "READY",
              "quando": "2026-09-27T15:53:06.266Z"
            },
            "comErro7d": 0,
            "deploys7d": 20,
            "prontos7d": 20
          }
        },
        {
          "dia": "2026-09-27",
          "dados": {
            "ultimo": {
              "alvo": "production",
              "estado": "READY",
              "quando": "2026-09-26T09:00:10.564Z"
            },
            "comErro7d": 0,
            "deploys7d": 20,
            "prontos7d": 20
          }
        },
        {
          "dia": "2026-09-26",
          "dados": {
            "ultimo": {
              "alvo": "production",
              "estado": "READY",
              "quando": "2026-09-25T10:52:13.203Z"
            },
            "comErro7d": 0,
            "deploys7d": 20,
            "prontos7d": 20
          }
        },
        {
          "dia": "2026-09-25",
          "dados": {
            "ultimo": {
              "alvo": "production",
              "estado": "READY",
              "quando": "2026-09-24T11:17:47.714Z"
            },
            "comErro7d": 0,
            "deploys7d": 20,
            "prontos7d": 20
          }
        },
        {
          "dia": "2026-09-24",
          "dados": {
            "ultimo": {
              "alvo": "production",
              "estado": "READY",
              "quando": "2026-09-23T09:00:11.490Z"
            },
            "comErro7d": 0,
            "deploys7d": 20,
            "prontos7d": 20
          }
        },
        {
          "dia": "2026-09-23",
          "dados": {
            "ultimo": {
              "alvo": "production",
              "estado": "READY",
              "quando": "2026-09-22T22:34:30.841Z"
            },
            "comErro7d": 0,
            "deploys7d": 20,
            "prontos7d": 20
          }
        },
        {
          "dia": "2026-09-22",
          "dados": {
            "ultimo": {
              "alvo": "production",
              "estado": "READY",
              "quando": "2026-09-22T00:09:54.198Z"
            },
            "comErro7d": 0,
            "deploys7d": 20,
            "prontos7d": 20
          }
        },
        {
          "dia": "2026-09-21",
          "dados": {
            "ultimo": {
              "alvo": "production",
              "estado": "READY",
              "quando": "2026-09-20T17:01:35.766Z"
            },
            "comErro7d": 0,
            "deploys7d": 20,
            "prontos7d": 20
          }
        },
        {
          "dia": "2026-09-20",
          "dados": {
            "ultimo": {
              "alvo": "production",
              "estado": "READY",
              "quando": "2026-09-19T21:56:14.096Z"
            },
            "comErro7d": 0,
            "deploys7d": 20,
            "prontos7d": 20
          }
        }
      ],
      "stripe": [
        {
          "dia": "2026-09-30",
          "dados": {
            "moeda": "brl",
            "mrrCentavos": 8970,
            "assinaturasAtivas": 3,
            "receita30dCentavos": 0
          }
        },
        {
          "dia": "2026-09-29",
          "dados": {
            "moeda": "brl",
            "mrrCentavos": 8970,
            "assinaturasAtivas": 3,
            "receita30dCentavos": 0
          }
        },
        {
          "dia": "2026-09-28",
          "dados": {
            "moeda": "brl",
            "mrrCentavos": 8970,
            "assinaturasAtivas": 3,
            "receita30dCentavos": 0
          }
        },
        {
          "dia": "2026-09-27",
          "dados": {
            "moeda": "brl",
            "mrrCentavos": 8970,
            "assinaturasAtivas": 3,
            "receita30dCentavos": 0
          }
        },
        {
          "dia": "2026-09-26",
          "dados": {
            "moeda": "brl",
            "mrrCentavos": 8970,
            "assinaturasAtivas": 3,
            "receita30dCentavos": 0
          }
        },
        {
          "dia": "2026-09-25",
          "dados": {
            "moeda": "brl",
            "mrrCentavos": 8970,
            "assinaturasAtivas": 3,
            "receita30dCentavos": 0
          }
        },
        {
          "dia": "2026-09-24",
          "dados": {
            "moeda": "brl",
            "mrrCentavos": 8970,
            "assinaturasAtivas": 3,
            "receita30dCentavos": 0
          }
        },
        {
          "dia": "2026-09-23",
          "dados": {
            "moeda": "brl",
            "mrrCentavos": 8970,
            "assinaturasAtivas": 3,
            "receita30dCentavos": 0
          }
        },
        {
          "dia": "2026-09-22",
          "dados": {
            "moeda": "brl",
            "mrrCentavos": 8970,
            "assinaturasAtivas": 3,
            "receita30dCentavos": 0
          }
        },
        {
          "dia": "2026-09-21",
          "dados": {
            "moeda": "brl",
            "mrrCentavos": 8970,
            "assinaturasAtivas": 3,
            "receita30dCentavos": 0
          }
        },
        {
          "dia": "2026-09-20",
          "dados": {
            "moeda": "brl",
            "mrrCentavos": 8970,
            "assinaturasAtivas": 3,
            "receita30dCentavos": 0
          }
        }
      ],
      "search_console": [
        {
          "dia": "2026-09-30",
          "dados": {
            "porDia": [
              {
                "dia": "2026-09-02",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-03",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-04",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-05",
                "cliques": 0,
                "impressoes": 4
              },
              {
                "dia": "2026-09-06",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-07",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-08",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-09",
                "cliques": 0,
                "impressoes": 3
              },
              {
                "dia": "2026-09-10",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-11",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-12",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-13",
                "cliques": 0,
                "impressoes": 3
              },
              {
                "dia": "2026-09-14",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-15",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-16",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-17",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-18",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-19",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-20",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-21",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-22",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-23",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-24",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-25",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-26",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-27",
                "cliques": 0,
                "impressoes": 1
              }
            ],
            "cliques28d": 0,
            "topPaginas": [],
            "erroPaginas": "Forbidden - perhaps check your credentials?",
            "topConsultas": [
              {
                "cliques": 0,
                "posicao": 1,
                "consulta": "\"mentorque\" -site:reddit.com -site:twitter.com -site:x.com -site:wykop.pl -site:tripadvisor.com -site:youtube.com -site:yelp.com -site:booking.com -site:facebook.com -site:instagram.com -site:tiktok.com",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 76,
                "consulta": "carro da partida e nao pega",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 71.3,
                "consulta": "carro da partida mas não pega",
                "impressoes": 4
              },
              {
                "cliques": 0,
                "posicao": 80,
                "consulta": "carro nao quer pegar",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 65,
                "consulta": "carro não pega",
                "impressoes": 2
              },
              {
                "cliques": 0,
                "posicao": 72,
                "consulta": "carro não quer pegar o que pode ser",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 54,
                "consulta": "luz do motor acesa",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 19,
                "consulta": "luz injeção vermelha",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 1,
                "consulta": "mentorque",
                "impressoes": 3
              },
              {
                "cliques": 0,
                "posicao": 52.5,
                "consulta": "nao pega",
                "impressoes": 2
              },
              {
                "cliques": 0,
                "posicao": 76,
                "consulta": "o carro nao pega",
                "impressoes": 1
              }
            ],
            "impressoes28d": 37
          }
        },
        {
          "dia": "2026-09-29",
          "dados": {
            "porDia": [
              {
                "dia": "2026-09-01",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-02",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-03",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-04",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-05",
                "cliques": 0,
                "impressoes": 4
              },
              {
                "dia": "2026-09-06",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-07",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-08",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-09",
                "cliques": 0,
                "impressoes": 3
              },
              {
                "dia": "2026-09-10",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-11",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-12",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-13",
                "cliques": 0,
                "impressoes": 3
              },
              {
                "dia": "2026-09-14",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-15",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-16",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-17",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-18",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-19",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-20",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-21",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-22",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-23",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-24",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-25",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-26",
                "cliques": 0,
                "impressoes": 0
              }
            ],
            "cliques28d": 0,
            "topPaginas": [],
            "erroPaginas": "Forbidden - perhaps check your credentials?",
            "topConsultas": [
              {
                "cliques": 0,
                "posicao": 1,
                "consulta": "\"mentorque\" -site:reddit.com -site:twitter.com -site:x.com -site:wykop.pl -site:tripadvisor.com -site:youtube.com -site:yelp.com -site:booking.com -site:facebook.com -site:instagram.com -site:tiktok.com",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 76,
                "consulta": "carro da partida e nao pega",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 71.3,
                "consulta": "carro da partida mas não pega",
                "impressoes": 4
              },
              {
                "cliques": 0,
                "posicao": 80,
                "consulta": "carro nao quer pegar",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 65,
                "consulta": "carro não pega",
                "impressoes": 2
              },
              {
                "cliques": 0,
                "posicao": 72,
                "consulta": "carro não quer pegar o que pode ser",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 54,
                "consulta": "luz do motor acesa",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 19,
                "consulta": "luz injeção vermelha",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 1,
                "consulta": "mentorque",
                "impressoes": 3
              },
              {
                "cliques": 0,
                "posicao": 52.5,
                "consulta": "nao pega",
                "impressoes": 2
              },
              {
                "cliques": 0,
                "posicao": 76,
                "consulta": "o carro nao pega",
                "impressoes": 1
              }
            ],
            "impressoes28d": 37
          }
        },
        {
          "dia": "2026-09-28",
          "dados": {
            "porDia": [
              {
                "dia": "2026-08-31",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-01",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-02",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-03",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-04",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-05",
                "cliques": 0,
                "impressoes": 4
              },
              {
                "dia": "2026-09-06",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-07",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-08",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-09",
                "cliques": 0,
                "impressoes": 3
              },
              {
                "dia": "2026-09-10",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-11",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-12",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-13",
                "cliques": 0,
                "impressoes": 3
              },
              {
                "dia": "2026-09-14",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-15",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-16",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-17",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-18",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-19",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-20",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-21",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-22",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-23",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-24",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-25",
                "cliques": 0,
                "impressoes": 0
              }
            ],
            "cliques28d": 0,
            "topPaginas": [],
            "erroPaginas": "Forbidden - perhaps check your credentials?",
            "topConsultas": [
              {
                "cliques": 0,
                "posicao": 1,
                "consulta": "\"mentorque\" -site:reddit.com -site:twitter.com -site:x.com -site:wykop.pl -site:tripadvisor.com -site:youtube.com -site:yelp.com -site:booking.com -site:facebook.com -site:instagram.com -site:tiktok.com",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 76,
                "consulta": "carro da partida e nao pega",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 71.3,
                "consulta": "carro da partida mas não pega",
                "impressoes": 4
              },
              {
                "cliques": 0,
                "posicao": 80,
                "consulta": "carro nao quer pegar",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 65,
                "consulta": "carro não pega",
                "impressoes": 2
              },
              {
                "cliques": 0,
                "posicao": 72,
                "consulta": "carro não quer pegar o que pode ser",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 54,
                "consulta": "luz do motor acesa",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 19,
                "consulta": "luz injeção vermelha",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 1,
                "consulta": "mentorque",
                "impressoes": 3
              },
              {
                "cliques": 0,
                "posicao": 52.5,
                "consulta": "nao pega",
                "impressoes": 2
              },
              {
                "cliques": 0,
                "posicao": 76,
                "consulta": "o carro nao pega",
                "impressoes": 1
              }
            ],
            "impressoes28d": 37
          }
        },
        {
          "dia": "2026-09-27",
          "dados": {
            "porDia": [
              {
                "dia": "2026-08-30",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-31",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-01",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-02",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-03",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-04",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-05",
                "cliques": 0,
                "impressoes": 4
              },
              {
                "dia": "2026-09-06",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-07",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-08",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-09",
                "cliques": 0,
                "impressoes": 3
              },
              {
                "dia": "2026-09-10",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-11",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-12",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-13",
                "cliques": 0,
                "impressoes": 3
              },
              {
                "dia": "2026-09-14",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-15",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-16",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-17",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-18",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-19",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-20",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-21",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-22",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-23",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-24",
                "cliques": 0,
                "impressoes": 1
              }
            ],
            "cliques28d": 0,
            "topPaginas": [],
            "erroPaginas": "Forbidden - perhaps check your credentials?",
            "topConsultas": [
              {
                "cliques": 0,
                "posicao": 1,
                "consulta": "\"mentorque\" -site:reddit.com -site:twitter.com -site:x.com -site:wykop.pl -site:tripadvisor.com -site:youtube.com -site:yelp.com -site:booking.com -site:facebook.com -site:instagram.com -site:tiktok.com",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 76,
                "consulta": "carro da partida e nao pega",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 71.3,
                "consulta": "carro da partida mas não pega",
                "impressoes": 4
              },
              {
                "cliques": 0,
                "posicao": 80,
                "consulta": "carro nao quer pegar",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 65,
                "consulta": "carro não pega",
                "impressoes": 2
              },
              {
                "cliques": 0,
                "posicao": 72,
                "consulta": "carro não quer pegar o que pode ser",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 54,
                "consulta": "luz do motor acesa",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 19,
                "consulta": "luz injeção vermelha",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 1,
                "consulta": "mentorque",
                "impressoes": 3
              },
              {
                "cliques": 0,
                "posicao": 52.5,
                "consulta": "nao pega",
                "impressoes": 2
              },
              {
                "cliques": 0,
                "posicao": 76,
                "consulta": "o carro nao pega",
                "impressoes": 1
              }
            ],
            "impressoes28d": 37
          }
        },
        {
          "dia": "2026-09-26",
          "dados": {
            "porDia": [
              {
                "dia": "2026-08-29",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-30",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-31",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-01",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-02",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-03",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-04",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-05",
                "cliques": 0,
                "impressoes": 4
              },
              {
                "dia": "2026-09-06",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-07",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-08",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-09",
                "cliques": 0,
                "impressoes": 3
              },
              {
                "dia": "2026-09-10",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-11",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-12",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-13",
                "cliques": 0,
                "impressoes": 3
              },
              {
                "dia": "2026-09-14",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-15",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-16",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-17",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-18",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-19",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-20",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-21",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-22",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-23",
                "cliques": 0,
                "impressoes": 0
              }
            ],
            "cliques28d": 0,
            "topPaginas": [],
            "erroPaginas": "Forbidden - perhaps check your credentials?",
            "topConsultas": [
              {
                "cliques": 0,
                "posicao": 1,
                "consulta": "\"mentorque\" -site:reddit.com -site:twitter.com -site:x.com -site:wykop.pl -site:tripadvisor.com -site:youtube.com -site:yelp.com -site:booking.com -site:facebook.com -site:instagram.com -site:tiktok.com",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 76,
                "consulta": "carro da partida e nao pega",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 71.3,
                "consulta": "carro da partida mas não pega",
                "impressoes": 4
              },
              {
                "cliques": 0,
                "posicao": 80,
                "consulta": "carro nao quer pegar",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 65,
                "consulta": "carro não pega",
                "impressoes": 2
              },
              {
                "cliques": 0,
                "posicao": 72,
                "consulta": "carro não quer pegar o que pode ser",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 54,
                "consulta": "luz do motor acesa",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 19,
                "consulta": "luz injeção vermelha",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 1,
                "consulta": "mentorque",
                "impressoes": 3
              },
              {
                "cliques": 0,
                "posicao": 52.5,
                "consulta": "nao pega",
                "impressoes": 2
              },
              {
                "cliques": 0,
                "posicao": 76,
                "consulta": "o carro nao pega",
                "impressoes": 1
              }
            ],
            "impressoes28d": 36
          }
        },
        {
          "dia": "2026-09-25",
          "dados": {
            "porDia": [
              {
                "dia": "2026-08-28",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-29",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-30",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-31",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-01",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-02",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-03",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-04",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-05",
                "cliques": 0,
                "impressoes": 4
              },
              {
                "dia": "2026-09-06",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-07",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-08",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-09",
                "cliques": 0,
                "impressoes": 3
              },
              {
                "dia": "2026-09-10",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-11",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-12",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-13",
                "cliques": 0,
                "impressoes": 3
              },
              {
                "dia": "2026-09-14",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-15",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-16",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-17",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-18",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-19",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-20",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-21",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-22",
                "cliques": 0,
                "impressoes": 0
              }
            ],
            "cliques28d": 0,
            "topPaginas": [],
            "erroPaginas": "Forbidden - perhaps check your credentials?",
            "topConsultas": [
              {
                "cliques": 0,
                "posicao": 1,
                "consulta": "\"mentorque\" -site:reddit.com -site:twitter.com -site:x.com -site:wykop.pl -site:tripadvisor.com -site:youtube.com -site:yelp.com -site:booking.com -site:facebook.com -site:instagram.com -site:tiktok.com",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 76,
                "consulta": "carro da partida e nao pega",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 71.3,
                "consulta": "carro da partida mas não pega",
                "impressoes": 4
              },
              {
                "cliques": 0,
                "posicao": 80,
                "consulta": "carro nao quer pegar",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 65,
                "consulta": "carro não pega",
                "impressoes": 2
              },
              {
                "cliques": 0,
                "posicao": 72,
                "consulta": "carro não quer pegar o que pode ser",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 54,
                "consulta": "luz do motor acesa",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 19,
                "consulta": "luz injeção vermelha",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 1,
                "consulta": "mentorque",
                "impressoes": 3
              },
              {
                "cliques": 0,
                "posicao": 52.5,
                "consulta": "nao pega",
                "impressoes": 2
              },
              {
                "cliques": 0,
                "posicao": 76,
                "consulta": "o carro nao pega",
                "impressoes": 1
              }
            ],
            "impressoes28d": 36
          }
        },
        {
          "dia": "2026-09-24",
          "dados": {
            "porDia": [
              {
                "dia": "2026-08-27",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-28",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-29",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-30",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-31",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-01",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-02",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-03",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-04",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-05",
                "cliques": 0,
                "impressoes": 4
              },
              {
                "dia": "2026-09-06",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-07",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-08",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-09",
                "cliques": 0,
                "impressoes": 3
              },
              {
                "dia": "2026-09-10",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-11",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-12",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-13",
                "cliques": 0,
                "impressoes": 3
              },
              {
                "dia": "2026-09-14",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-15",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-16",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-17",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-18",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-19",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-20",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-21",
                "cliques": 0,
                "impressoes": 1
              }
            ],
            "cliques28d": 0,
            "topPaginas": [],
            "erroPaginas": "Forbidden - perhaps check your credentials?",
            "topConsultas": [
              {
                "cliques": 0,
                "posicao": 1,
                "consulta": "\"mentorque\" -site:reddit.com -site:twitter.com -site:x.com -site:wykop.pl -site:tripadvisor.com -site:youtube.com -site:yelp.com -site:booking.com -site:facebook.com -site:instagram.com -site:tiktok.com",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 76,
                "consulta": "carro da partida e nao pega",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 71.3,
                "consulta": "carro da partida mas não pega",
                "impressoes": 4
              },
              {
                "cliques": 0,
                "posicao": 80,
                "consulta": "carro nao quer pegar",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 65,
                "consulta": "carro não pega",
                "impressoes": 2
              },
              {
                "cliques": 0,
                "posicao": 72,
                "consulta": "carro não quer pegar o que pode ser",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 54,
                "consulta": "luz do motor acesa",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 19,
                "consulta": "luz injeção vermelha",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 1,
                "consulta": "mentorque",
                "impressoes": 3
              },
              {
                "cliques": 0,
                "posicao": 52.5,
                "consulta": "nao pega",
                "impressoes": 2
              },
              {
                "cliques": 0,
                "posicao": 76,
                "consulta": "o carro nao pega",
                "impressoes": 1
              }
            ],
            "impressoes28d": 36
          }
        },
        {
          "dia": "2026-09-23",
          "dados": {
            "porDia": [
              {
                "dia": "2026-08-26",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-27",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-28",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-29",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-30",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-31",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-01",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-02",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-03",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-04",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-05",
                "cliques": 0,
                "impressoes": 4
              },
              {
                "dia": "2026-09-06",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-07",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-08",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-09",
                "cliques": 0,
                "impressoes": 3
              },
              {
                "dia": "2026-09-10",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-11",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-12",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-13",
                "cliques": 0,
                "impressoes": 3
              },
              {
                "dia": "2026-09-14",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-15",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-16",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-17",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-18",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-19",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-20",
                "cliques": 0,
                "impressoes": 0
              }
            ],
            "cliques28d": 0,
            "topPaginas": [],
            "erroPaginas": "Forbidden - perhaps check your credentials?",
            "topConsultas": [
              {
                "cliques": 0,
                "posicao": 1,
                "consulta": "\"mentorque\" -site:reddit.com -site:twitter.com -site:x.com -site:wykop.pl -site:tripadvisor.com -site:youtube.com -site:yelp.com -site:booking.com -site:facebook.com -site:instagram.com -site:tiktok.com",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 76,
                "consulta": "carro da partida e nao pega",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 71.3,
                "consulta": "carro da partida mas não pega",
                "impressoes": 4
              },
              {
                "cliques": 0,
                "posicao": 80,
                "consulta": "carro nao quer pegar",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 65,
                "consulta": "carro não pega",
                "impressoes": 2
              },
              {
                "cliques": 0,
                "posicao": 72,
                "consulta": "carro não quer pegar o que pode ser",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 54,
                "consulta": "luz do motor acesa",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 19,
                "consulta": "luz injeção vermelha",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 1,
                "consulta": "mentorque",
                "impressoes": 2
              },
              {
                "cliques": 0,
                "posicao": 52.5,
                "consulta": "nao pega",
                "impressoes": 2
              },
              {
                "cliques": 0,
                "posicao": 76,
                "consulta": "o carro nao pega",
                "impressoes": 1
              }
            ],
            "impressoes28d": 35
          }
        },
        {
          "dia": "2026-09-22",
          "dados": {
            "porDia": [
              {
                "dia": "2026-08-25",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-08-26",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-27",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-28",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-29",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-30",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-31",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-01",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-02",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-03",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-04",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-05",
                "cliques": 0,
                "impressoes": 4
              },
              {
                "dia": "2026-09-06",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-07",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-08",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-09",
                "cliques": 0,
                "impressoes": 3
              },
              {
                "dia": "2026-09-10",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-11",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-12",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-13",
                "cliques": 0,
                "impressoes": 3
              },
              {
                "dia": "2026-09-14",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-15",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-16",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-17",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-18",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-19",
                "cliques": 0,
                "impressoes": 1
              }
            ],
            "cliques28d": 0,
            "topPaginas": [],
            "erroPaginas": "Forbidden - perhaps check your credentials?",
            "topConsultas": [
              {
                "cliques": 0,
                "posicao": 1,
                "consulta": "\"mentorque\" -site:reddit.com -site:twitter.com -site:x.com -site:wykop.pl -site:tripadvisor.com -site:youtube.com -site:yelp.com -site:booking.com -site:facebook.com -site:instagram.com -site:tiktok.com",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 76,
                "consulta": "carro da partida e nao pega",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 71.3,
                "consulta": "carro da partida mas não pega",
                "impressoes": 4
              },
              {
                "cliques": 0,
                "posicao": 80,
                "consulta": "carro nao quer pegar",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 65,
                "consulta": "carro não pega",
                "impressoes": 2
              },
              {
                "cliques": 0,
                "posicao": 72,
                "consulta": "carro não quer pegar o que pode ser",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 54,
                "consulta": "luz do motor acesa",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 19,
                "consulta": "luz injeção vermelha",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 1,
                "consulta": "mentorque",
                "impressoes": 3
              },
              {
                "cliques": 0,
                "posicao": 52.5,
                "consulta": "nao pega",
                "impressoes": 2
              },
              {
                "cliques": 0,
                "posicao": 76,
                "consulta": "o carro nao pega",
                "impressoes": 1
              }
            ],
            "impressoes28d": 36
          }
        },
        {
          "dia": "2026-09-21",
          "dados": {
            "porDia": [
              {
                "dia": "2026-08-24",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-25",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-08-26",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-27",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-28",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-29",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-30",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-31",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-01",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-02",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-03",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-04",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-05",
                "cliques": 0,
                "impressoes": 4
              },
              {
                "dia": "2026-09-06",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-07",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-08",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-09",
                "cliques": 0,
                "impressoes": 3
              },
              {
                "dia": "2026-09-10",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-11",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-12",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-13",
                "cliques": 0,
                "impressoes": 3
              },
              {
                "dia": "2026-09-14",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-15",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-16",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-17",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-18",
                "cliques": 0,
                "impressoes": 0
              }
            ],
            "cliques28d": 0,
            "topPaginas": [],
            "erroPaginas": "Forbidden - perhaps check your credentials?",
            "topConsultas": [
              {
                "cliques": 0,
                "posicao": 1,
                "consulta": "\"mentorque\" -site:reddit.com -site:twitter.com -site:x.com -site:wykop.pl -site:tripadvisor.com -site:youtube.com -site:yelp.com -site:booking.com -site:facebook.com -site:instagram.com -site:tiktok.com",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 76,
                "consulta": "carro da partida e nao pega",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 71.3,
                "consulta": "carro da partida mas não pega",
                "impressoes": 4
              },
              {
                "cliques": 0,
                "posicao": 80,
                "consulta": "carro nao quer pegar",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 65,
                "consulta": "carro não pega",
                "impressoes": 2
              },
              {
                "cliques": 0,
                "posicao": 72,
                "consulta": "carro não quer pegar o que pode ser",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 54,
                "consulta": "luz do motor acesa",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 19,
                "consulta": "luz injeção vermelha",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 1,
                "consulta": "mentorque",
                "impressoes": 3
              },
              {
                "cliques": 0,
                "posicao": 52.5,
                "consulta": "nao pega",
                "impressoes": 2
              },
              {
                "cliques": 0,
                "posicao": 76,
                "consulta": "o carro nao pega",
                "impressoes": 1
              }
            ],
            "impressoes28d": 35
          }
        },
        {
          "dia": "2026-09-20",
          "dados": {
            "porDia": [
              {
                "dia": "2026-08-23",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-24",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-25",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-08-26",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-27",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-28",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-29",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-30",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-08-31",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-01",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-02",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-03",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-04",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-05",
                "cliques": 0,
                "impressoes": 4
              },
              {
                "dia": "2026-09-06",
                "cliques": 0,
                "impressoes": 0
              },
              {
                "dia": "2026-09-07",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-08",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-09",
                "cliques": 0,
                "impressoes": 3
              },
              {
                "dia": "2026-09-10",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-11",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-12",
                "cliques": 0,
                "impressoes": 1
              },
              {
                "dia": "2026-09-13",
                "cliques": 0,
                "impressoes": 3
              },
              {
                "dia": "2026-09-14",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-15",
                "cliques": 0,
                "impressoes": 2
              },
              {
                "dia": "2026-09-16",
                "cliques": 0,
                "impressoes": 5
              },
              {
                "dia": "2026-09-17",
                "cliques": 0,
                "impressoes": 0
              }
            ],
            "cliques28d": 0,
            "topPaginas": [],
            "erroPaginas": "Forbidden - perhaps check your credentials?",
            "topConsultas": [
              {
                "cliques": 0,
                "posicao": 1,
                "consulta": "\"mentorque\" -site:reddit.com -site:twitter.com -site:x.com -site:wykop.pl -site:tripadvisor.com -site:youtube.com -site:yelp.com -site:booking.com -site:facebook.com -site:instagram.com -site:tiktok.com",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 76,
                "consulta": "carro da partida e nao pega",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 71.3,
                "consulta": "carro da partida mas não pega",
                "impressoes": 4
              },
              {
                "cliques": 0,
                "posicao": 80,
                "consulta": "carro nao quer pegar",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 65,
                "consulta": "carro não pega",
                "impressoes": 2
              },
              {
                "cliques": 0,
                "posicao": 72,
                "consulta": "carro não quer pegar o que pode ser",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 54,
                "consulta": "luz do motor acesa",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 19,
                "consulta": "luz injeção vermelha",
                "impressoes": 1
              },
              {
                "cliques": 0,
                "posicao": 1,
                "consulta": "mentorque",
                "impressoes": 3
              },
              {
                "cliques": 0,
                "posicao": 52.5,
                "consulta": "nao pega",
                "impressoes": 2
              },
              {
                "cliques": 0,
                "posicao": 76,
                "consulta": "o carro nao pega",
                "impressoes": 1
              }
            ],
            "impressoes28d": 35
          }
        }
      ],
      "revenuecat": [
        {
          "dia": "2026-09-30",
          "dados": {
            "mrr": 4,
            "nota": "active_users e new_customers contam APARELHOS que abriram o app (inclui TestFlight e aparelhos de teste do dono); pessoas reais = contas do banco e regua de uso do funil",
            "revenue": 4,
            "active_users": 500,
            "active_trials": 0,
            "new_customers": 495,
            "active_subscriptions": 1
          }
        },
        {
          "dia": "2026-09-29",
          "dados": {
            "mrr": 4,
            "nota": "active_users e new_customers contam APARELHOS que abriram o app (inclui TestFlight e aparelhos de teste do dono); pessoas reais = contas do banco e regua de uso do funil",
            "revenue": 4,
            "active_users": 470,
            "active_trials": 0,
            "new_customers": 465,
            "active_subscriptions": 1
          }
        },
        {
          "dia": "2026-09-28",
          "dados": {
            "mrr": 4,
            "nota": "active_users e new_customers contam APARELHOS que abriram o app (inclui TestFlight e aparelhos de teste do dono); pessoas reais = contas do banco e regua de uso do funil",
            "revenue": 4,
            "active_users": 439,
            "active_trials": 0,
            "new_customers": 434,
            "active_subscriptions": 1
          }
        },
        {
          "dia": "2026-09-27",
          "dados": {
            "mrr": 4,
            "nota": "active_users e new_customers contam APARELHOS que abriram o app (inclui TestFlight e aparelhos de teste do dono); pessoas reais = contas do banco e regua de uso do funil",
            "revenue": 4,
            "active_users": 409,
            "active_trials": 0,
            "new_customers": 405,
            "active_subscriptions": 1
          }
        },
        {
          "dia": "2026-09-26",
          "dados": {
            "mrr": 4,
            "nota": "active_users e new_customers contam APARELHOS que abriram o app (inclui TestFlight e aparelhos de teste do dono); pessoas reais = contas do banco e regua de uso do funil",
            "revenue": 4,
            "active_users": 389,
            "active_trials": 0,
            "new_customers": 385,
            "active_subscriptions": 1
          }
        },
        {
          "dia": "2026-09-25",
          "dados": {
            "mrr": 4,
            "nota": "active_users e new_customers contam APARELHOS que abriram o app (inclui TestFlight e aparelhos de teste do dono); pessoas reais = contas do banco e regua de uso do funil",
            "revenue": 4,
            "active_users": 337,
            "active_trials": 0,
            "new_customers": 334,
            "active_subscriptions": 1
          }
        },
        {
          "dia": "2026-09-24",
          "dados": {
            "mrr": 0,
            "nota": "active_users e new_customers contam APARELHOS que abriram o app (inclui TestFlight e aparelhos de teste do dono); pessoas reais = contas do banco e regua de uso do funil",
            "revenue": 0,
            "active_users": 322,
            "active_trials": 0,
            "new_customers": 319,
            "active_subscriptions": 0
          }
        },
        {
          "dia": "2026-09-23",
          "dados": {
            "mrr": 0,
            "nota": "active_users e new_customers contam APARELHOS que abriram o app (inclui TestFlight e aparelhos de teste do dono); pessoas reais = contas do banco e regua de uso do funil",
            "revenue": 0,
            "active_users": 285,
            "active_trials": 0,
            "new_customers": 282,
            "active_subscriptions": 0
          }
        },
        {
          "dia": "2026-09-22",
          "dados": {
            "mrr": 0,
            "nota": "active_users e new_customers contam APARELHOS que abriram o app (inclui TestFlight e aparelhos de teste do dono); pessoas reais = contas do banco e regua de uso do funil",
            "revenue": 0,
            "active_users": 250,
            "active_trials": 0,
            "new_customers": 247,
            "active_subscriptions": 0
          }
        },
        {
          "dia": "2026-09-21",
          "dados": {
            "mrr": 0,
            "nota": "active_users e new_customers contam APARELHOS que abriram o app (inclui TestFlight e aparelhos de teste do dono); pessoas reais = contas do banco e regua de uso do funil",
            "revenue": 0,
            "active_users": 220,
            "active_trials": 0,
            "new_customers": 217,
            "active_subscriptions": 0
          }
        },
        {
          "dia": "2026-09-20",
          "dados": {
            "mrr": 0,
            "nota": "active_users e new_customers contam APARELHOS que abriram o app (inclui TestFlight e aparelhos de teste do dono); pessoas reais = contas do banco e regua de uso do funil",
            "revenue": 0,
            "active_users": 188,
            "active_trials": 0,
            "new_customers": 185,
            "active_subscriptions": 0
          }
        }
      ],
      "play_console": [
        {
          "dia": "2026-09-30",
          "dados": {
            "anrPorDia": [],
            "crashPorDia": []
          }
        },
        {
          "dia": "2026-09-29",
          "dados": {
            "anrPorDia": [],
            "crashPorDia": []
          }
        },
        {
          "dia": "2026-09-28",
          "dados": {
            "anrPorDia": [],
            "crashPorDia": []
          }
        },
        {
          "dia": "2026-09-27",
          "dados": {
            "anrPorDia": [],
            "crashPorDia": []
          }
        },
        {
          "dia": "2026-09-26",
          "dados": {
            "anrPorDia": [],
            "crashPorDia": []
          }
        },
        {
          "dia": "2026-09-25",
          "dados": {
            "anrPorDia": [],
            "crashPorDia": []
          }
        },
        {
          "dia": "2026-09-24",
          "dados": {
            "anrPorDia": [],
            "crashPorDia": []
          }
        },
        {
          "dia": "2026-09-23",
          "dados": {
            "anrPorDia": [],
            "crashPorDia": []
          }
        },
        {
          "dia": "2026-09-22",
          "dados": {
            "anrPorDia": [],
            "crashPorDia": []
          }
        },
        {
          "dia": "2026-09-21",
          "dados": {
            "anrPorDia": [],
            "crashPorDia": []
          }
        },
        {
          "dia": "2026-09-20",
          "dados": {
            "anrPorDia": [],
            "crashPorDia": []
          }
        }
      ],
      "meta_ads": [
        {
          "dia": "2026-09-30",
          "dados": {
            "conta": "Mentorque Ads",
            "moeda": "BRL",
            "contas": [
              {
                "id": "act_1071232758617319",
                "nome": "Mentorque Ads",
                "moeda": "BRL"
              }
            ],
            "porDia": [
              {
                "dia": "2026-09-23",
                "gasto": 16.01,
                "cliques": 89,
                "impressoes": 1534,
                "instalacoes": 28
              },
              {
                "dia": "2026-09-24",
                "gasto": 15.11,
                "cliques": 66,
                "impressoes": 1292,
                "instalacoes": 12
              },
              {
                "dia": "2026-09-25",
                "gasto": 20.96,
                "cliques": 102,
                "impressoes": 1578,
                "instalacoes": 42
              },
              {
                "dia": "2026-09-26",
                "gasto": 16.74,
                "cliques": 73,
                "impressoes": 1605,
                "instalacoes": 28
              },
              {
                "dia": "2026-09-27",
                "gasto": 17.42,
                "cliques": 120,
                "impressoes": 1909,
                "instalacoes": 38
              },
              {
                "dia": "2026-09-28",
                "gasto": 21.82,
                "cliques": 138,
                "impressoes": 2503,
                "instalacoes": 36
              },
              {
                "dia": "2026-09-29",
                "gasto": 16.58,
                "cliques": 87,
                "impressoes": 1396,
                "instalacoes": 16
              }
            ],
            "gasto7d": 124.64,
            "truncado": false,
            "campanhas": [
              {
                "nome": "Lançamento Mentorque",
                "criada": "2026-09-19",
                "status": "ACTIVE",
                "objetivo": "OUTCOME_APP_PROMOTION",
                "conjuntos": [
                  {
                    "nome": "Lançamento Mentorque",
                    "estadoReal": "ACTIVE",
                    "otimizaPor": "APP_INSTALLS",
                    "orcamentoDiario": null
                  }
                ],
                "estadoReal": "ACTIVE",
                "orcamentoDiario": 20
              }
            ],
            "contaLida": "act_1071232758617319",
            "porAnuncio": [
              {
                "nome": "Você liga o carro e espera parado",
                "gasto": 121.18,
                "cliques": 664,
                "campanha": "Lançamento Mentorque",
                "impressoes": 11448,
                "instalacoes": 192
              },
              {
                "nome": "Carro perde força na serra",
                "gasto": 2.82,
                "cliques": 10,
                "campanha": "Lançamento Mentorque",
                "impressoes": 304,
                "instalacoes": 6
              },
              {
                "nome": "Chegar na oficina com nome",
                "gasto": 0.36,
                "cliques": 0,
                "campanha": "Lançamento Mentorque",
                "impressoes": 42,
                "instalacoes": 0
              },
              {
                "nome": "Só ir na padaria",
                "gasto": 0.28,
                "cliques": 1,
                "campanha": "Lançamento Mentorque",
                "impressoes": 23,
                "instalacoes": 2
              }
            ],
            "porCampanha": [
              {
                "nome": "Lançamento Mentorque",
                "gasto": 124.64,
                "cliques": 675,
                "impressoes": 11817,
                "instalacoes": 200
              }
            ]
          }
        },
        {
          "dia": "2026-09-29",
          "dados": {
            "conta": "Mentorque Ads",
            "moeda": "BRL",
            "contas": [
              {
                "id": "act_1071232758617319",
                "nome": "Mentorque Ads",
                "moeda": "BRL"
              }
            ],
            "porDia": [
              {
                "dia": "2026-09-22",
                "gasto": 22.04,
                "cliques": 105,
                "impressoes": 2274,
                "instalacoes": 26
              },
              {
                "dia": "2026-09-23",
                "gasto": 16.01,
                "cliques": 89,
                "impressoes": 1534,
                "instalacoes": 28
              },
              {
                "dia": "2026-09-24",
                "gasto": 15.11,
                "cliques": 66,
                "impressoes": 1292,
                "instalacoes": 12
              },
              {
                "dia": "2026-09-25",
                "gasto": 20.96,
                "cliques": 102,
                "impressoes": 1578,
                "instalacoes": 42
              },
              {
                "dia": "2026-09-26",
                "gasto": 16.74,
                "cliques": 73,
                "impressoes": 1605,
                "instalacoes": 28
              },
              {
                "dia": "2026-09-27",
                "gasto": 17.42,
                "cliques": 120,
                "impressoes": 1909,
                "instalacoes": 38
              },
              {
                "dia": "2026-09-28",
                "gasto": 21.81,
                "cliques": 138,
                "impressoes": 2501,
                "instalacoes": 36
              }
            ],
            "gasto7d": 130.09,
            "truncado": false,
            "campanhas": [
              {
                "nome": "Lançamento Mentorque",
                "criada": "2026-09-19",
                "status": "ACTIVE",
                "objetivo": "OUTCOME_APP_PROMOTION",
                "conjuntos": [
                  {
                    "nome": "Lançamento Mentorque",
                    "estadoReal": "ACTIVE",
                    "otimizaPor": "APP_INSTALLS",
                    "orcamentoDiario": null
                  }
                ],
                "estadoReal": "ACTIVE",
                "orcamentoDiario": 20
              }
            ],
            "contaLida": "act_1071232758617319",
            "porAnuncio": [
              {
                "nome": "Você liga o carro e espera parado",
                "gasto": 127,
                "cliques": 682,
                "campanha": "Lançamento Mentorque",
                "impressoes": 12368,
                "instalacoes": 202
              },
              {
                "nome": "Carro perde força na serra",
                "gasto": 2.52,
                "cliques": 10,
                "campanha": "Lançamento Mentorque",
                "impressoes": 265,
                "instalacoes": 6
              },
              {
                "nome": "Chegar na oficina com nome",
                "gasto": 0.29,
                "cliques": 0,
                "campanha": "Lançamento Mentorque",
                "impressoes": 37,
                "instalacoes": 0
              },
              {
                "nome": "Só ir na padaria",
                "gasto": 0.28,
                "cliques": 1,
                "campanha": "Lançamento Mentorque",
                "impressoes": 23,
                "instalacoes": 2
              }
            ],
            "porCampanha": [
              {
                "nome": "Lançamento Mentorque",
                "gasto": 130.09,
                "cliques": 693,
                "impressoes": 12693,
                "instalacoes": 210
              }
            ]
          }
        },
        {
          "dia": "2026-09-28",
          "dados": {
            "conta": "Mentorque Ads",
            "moeda": "BRL",
            "contas": [
              {
                "id": "act_1071232758617319",
                "nome": "Mentorque Ads",
                "moeda": "BRL"
              }
            ],
            "porDia": [
              {
                "dia": "2026-09-21",
                "gasto": 30.74,
                "cliques": 96,
                "impressoes": 2891,
                "instalacoes": 24
              },
              {
                "dia": "2026-09-22",
                "gasto": 22.04,
                "cliques": 105,
                "impressoes": 2274,
                "instalacoes": 26
              },
              {
                "dia": "2026-09-23",
                "gasto": 16.01,
                "cliques": 89,
                "impressoes": 1534,
                "instalacoes": 28
              },
              {
                "dia": "2026-09-24",
                "gasto": 15.11,
                "cliques": 66,
                "impressoes": 1292,
                "instalacoes": 12
              },
              {
                "dia": "2026-09-25",
                "gasto": 20.96,
                "cliques": 102,
                "impressoes": 1578,
                "instalacoes": 42
              },
              {
                "dia": "2026-09-26",
                "gasto": 16.74,
                "cliques": 73,
                "impressoes": 1605,
                "instalacoes": 28
              },
              {
                "dia": "2026-09-27",
                "gasto": 17.36,
                "cliques": 120,
                "impressoes": 1898,
                "instalacoes": 38
              }
            ],
            "gasto7d": 138.96,
            "truncado": false,
            "campanhas": [
              {
                "nome": "Lançamento Mentorque",
                "criada": "2026-09-19",
                "status": "ACTIVE",
                "objetivo": "OUTCOME_APP_PROMOTION",
                "conjuntos": [
                  {
                    "nome": "Lançamento Mentorque",
                    "estadoReal": "ACTIVE",
                    "otimizaPor": "APP_INSTALLS",
                    "orcamentoDiario": null
                  }
                ],
                "estadoReal": "ACTIVE",
                "orcamentoDiario": 20
              }
            ],
            "contaLida": "act_1071232758617319",
            "porAnuncio": [
              {
                "nome": "Você liga o carro e espera parado",
                "gasto": 136.73,
                "cliques": 644,
                "campanha": "Lançamento Mentorque",
                "impressoes": 12839,
                "instalacoes": 192
              },
              {
                "nome": "Carro perde força na serra",
                "gasto": 1.73,
                "cliques": 6,
                "campanha": "Lançamento Mentorque",
                "impressoes": 178,
                "instalacoes": 4
              },
              {
                "nome": "Chegar na oficina com nome",
                "gasto": 0.29,
                "cliques": 0,
                "campanha": "Lançamento Mentorque",
                "impressoes": 38,
                "instalacoes": 0
              },
              {
                "nome": "Só ir na padaria",
                "gasto": 0.21,
                "cliques": 1,
                "campanha": "Lançamento Mentorque",
                "impressoes": 17,
                "instalacoes": 2
              }
            ],
            "porCampanha": [
              {
                "nome": "Lançamento Mentorque",
                "gasto": 138.96,
                "cliques": 651,
                "impressoes": 13072,
                "instalacoes": 198
              }
            ]
          }
        },
        {
          "dia": "2026-09-27",
          "dados": {
            "conta": "Mentorque Ads",
            "moeda": "BRL",
            "contas": [
              {
                "id": "act_1071232758617319",
                "nome": "Mentorque Ads",
                "moeda": "BRL"
              }
            ],
            "porDia": [
              {
                "dia": "2026-09-20",
                "gasto": 17.99,
                "cliques": 43,
                "impressoes": 1402,
                "instalacoes": 10
              },
              {
                "dia": "2026-09-21",
                "gasto": 30.74,
                "cliques": 96,
                "impressoes": 2891,
                "instalacoes": 24
              },
              {
                "dia": "2026-09-22",
                "gasto": 22.04,
                "cliques": 105,
                "impressoes": 2274,
                "instalacoes": 26
              },
              {
                "dia": "2026-09-23",
                "gasto": 16.01,
                "cliques": 89,
                "impressoes": 1534,
                "instalacoes": 28
              },
              {
                "dia": "2026-09-24",
                "gasto": 15.11,
                "cliques": 66,
                "impressoes": 1292,
                "instalacoes": 12
              },
              {
                "dia": "2026-09-25",
                "gasto": 20.96,
                "cliques": 102,
                "impressoes": 1578,
                "instalacoes": 42
              },
              {
                "dia": "2026-09-26",
                "gasto": 16.71,
                "cliques": 73,
                "impressoes": 1600,
                "instalacoes": 28
              }
            ],
            "gasto7d": 139.56,
            "truncado": false,
            "campanhas": [
              {
                "nome": "Lançamento Mentorque",
                "criada": "2026-09-19",
                "status": "ACTIVE",
                "objetivo": "OUTCOME_APP_PROMOTION",
                "conjuntos": [
                  {
                    "nome": "Lançamento Mentorque",
                    "estadoReal": "ACTIVE",
                    "otimizaPor": "APP_INSTALLS",
                    "orcamentoDiario": null
                  }
                ],
                "estadoReal": "ACTIVE",
                "orcamentoDiario": 20
              }
            ],
            "contaLida": "act_1071232758617319",
            "porAnuncio": [
              {
                "nome": "Você liga o carro e espera parado",
                "gasto": 138.24,
                "cliques": 569,
                "campanha": "Lançamento Mentorque",
                "impressoes": 12460,
                "instalacoes": 166
              },
              {
                "nome": "Carro perde força na serra",
                "gasto": 1.02,
                "cliques": 4,
                "campanha": "Lançamento Mentorque",
                "impressoes": 83,
                "instalacoes": 2
              },
              {
                "nome": "Só ir na padaria",
                "gasto": 0.28,
                "cliques": 1,
                "campanha": "Lançamento Mentorque",
                "impressoes": 23,
                "instalacoes": 2
              },
              {
                "nome": "Chegar na oficina com nome",
                "gasto": 0.02,
                "cliques": 0,
                "campanha": "Lançamento Mentorque",
                "impressoes": 5,
                "instalacoes": 0
              }
            ],
            "porCampanha": [
              {
                "nome": "Lançamento Mentorque",
                "gasto": 139.56,
                "cliques": 574,
                "impressoes": 12571,
                "instalacoes": 170
              }
            ]
          }
        },
        {
          "dia": "2026-09-26",
          "dados": {
            "conta": "Mentorque Ads",
            "moeda": "BRL",
            "contas": [
              {
                "id": "act_1071232758617319",
                "nome": "Mentorque Ads",
                "moeda": "BRL"
              }
            ],
            "porDia": [
              {
                "dia": "2026-09-19",
                "gasto": 10.24,
                "cliques": 35,
                "impressoes": 668,
                "instalacoes": 12
              },
              {
                "dia": "2026-09-20",
                "gasto": 17.99,
                "cliques": 43,
                "impressoes": 1402,
                "instalacoes": 10
              },
              {
                "dia": "2026-09-21",
                "gasto": 30.74,
                "cliques": 96,
                "impressoes": 2891,
                "instalacoes": 24
              },
              {
                "dia": "2026-09-22",
                "gasto": 22.04,
                "cliques": 105,
                "impressoes": 2274,
                "instalacoes": 26
              },
              {
                "dia": "2026-09-23",
                "gasto": 16.01,
                "cliques": 89,
                "impressoes": 1534,
                "instalacoes": 28
              },
              {
                "dia": "2026-09-24",
                "gasto": 15.11,
                "cliques": 66,
                "impressoes": 1292,
                "instalacoes": 12
              },
              {
                "dia": "2026-09-25",
                "gasto": 20.89,
                "cliques": 102,
                "impressoes": 1565,
                "instalacoes": 42
              }
            ],
            "gasto7d": 133.02,
            "truncado": false,
            "campanhas": [
              {
                "nome": "Lançamento Mentorque",
                "criada": "2026-09-19",
                "status": "ACTIVE",
                "objetivo": "OUTCOME_APP_PROMOTION",
                "conjuntos": [
                  {
                    "nome": "Lançamento Mentorque",
                    "estadoReal": "ACTIVE",
                    "otimizaPor": "APP_INSTALLS",
                    "orcamentoDiario": null
                  }
                ],
                "estadoReal": "ACTIVE",
                "orcamentoDiario": 20
              }
            ],
            "contaLida": "act_1071232758617319",
            "porAnuncio": [
              {
                "nome": "Você liga o carro e espera parado",
                "gasto": 132.27,
                "cliques": 535,
                "campanha": "Lançamento Mentorque",
                "impressoes": 11553,
                "instalacoes": 152
              },
              {
                "nome": "Só ir na padaria",
                "gasto": 0.37,
                "cliques": 1,
                "campanha": "Lançamento Mentorque",
                "impressoes": 34,
                "instalacoes": 2
              },
              {
                "nome": "Carro perde força na serra",
                "gasto": 0.27,
                "cliques": 0,
                "campanha": "Lançamento Mentorque",
                "impressoes": 27,
                "instalacoes": 0
              },
              {
                "nome": "Chegar na oficina com nome",
                "gasto": 0.11,
                "cliques": 0,
                "campanha": "Lançamento Mentorque",
                "impressoes": 12,
                "instalacoes": 0
              }
            ],
            "porCampanha": [
              {
                "nome": "Lançamento Mentorque",
                "gasto": 133.02,
                "cliques": 536,
                "impressoes": 11626,
                "instalacoes": 154
              }
            ]
          }
        },
        {
          "dia": "2026-09-25",
          "dados": {
            "conta": "Mentorque Ads",
            "moeda": "BRL",
            "contas": [
              {
                "id": "act_1071232758617319",
                "nome": "Mentorque Ads",
                "moeda": "BRL"
              }
            ],
            "porDia": [
              {
                "dia": "2026-09-19",
                "gasto": 10.24,
                "cliques": 35,
                "impressoes": 668,
                "instalacoes": 12
              },
              {
                "dia": "2026-09-20",
                "gasto": 17.99,
                "cliques": 43,
                "impressoes": 1402,
                "instalacoes": 10
              },
              {
                "dia": "2026-09-21",
                "gasto": 30.74,
                "cliques": 96,
                "impressoes": 2891,
                "instalacoes": 24
              },
              {
                "dia": "2026-09-22",
                "gasto": 22.04,
                "cliques": 105,
                "impressoes": 2274,
                "instalacoes": 26
              },
              {
                "dia": "2026-09-23",
                "gasto": 16.01,
                "cliques": 89,
                "impressoes": 1534,
                "instalacoes": 28
              },
              {
                "dia": "2026-09-24",
                "gasto": 15.09,
                "cliques": 66,
                "impressoes": 1289,
                "instalacoes": 12
              }
            ],
            "gasto7d": 112.11,
            "truncado": false,
            "campanhas": [
              {
                "nome": "Lançamento Mentorque",
                "criada": "2026-09-19",
                "status": "ACTIVE",
                "objetivo": "OUTCOME_APP_PROMOTION",
                "conjuntos": [
                  {
                    "nome": "Lançamento Mentorque",
                    "estadoReal": "ACTIVE",
                    "otimizaPor": "APP_INSTALLS",
                    "orcamentoDiario": null
                  }
                ],
                "estadoReal": "ACTIVE",
                "orcamentoDiario": 20
              }
            ],
            "contaLida": "act_1071232758617319",
            "porAnuncio": [
              {
                "nome": "Você liga o carro e espera parado",
                "gasto": 111.36,
                "cliques": 433,
                "campanha": "Lançamento Mentorque",
                "impressoes": 9985,
                "instalacoes": 110
              },
              {
                "nome": "Só ir na padaria",
                "gasto": 0.37,
                "cliques": 1,
                "campanha": "Lançamento Mentorque",
                "impressoes": 34,
                "instalacoes": 2
              },
              {
                "nome": "Carro perde força na serra",
                "gasto": 0.27,
                "cliques": 0,
                "campanha": "Lançamento Mentorque",
                "impressoes": 27,
                "instalacoes": 0
              },
              {
                "nome": "Chegar na oficina com nome",
                "gasto": 0.11,
                "cliques": 0,
                "campanha": "Lançamento Mentorque",
                "impressoes": 12,
                "instalacoes": 0
              }
            ],
            "porCampanha": [
              {
                "nome": "Lançamento Mentorque",
                "gasto": 112.11,
                "cliques": 434,
                "impressoes": 10058,
                "instalacoes": 112
              }
            ]
          }
        },
        {
          "dia": "2026-09-24",
          "dados": {
            "conta": "Mentorque Ads",
            "moeda": "BRL",
            "contas": [
              {
                "id": "act_1071232758617319",
                "nome": "Mentorque Ads",
                "moeda": "BRL"
              }
            ],
            "porDia": [
              {
                "dia": "2026-09-19",
                "gasto": 10.24,
                "cliques": 35,
                "impressoes": 668,
                "instalacoes": 12
              },
              {
                "dia": "2026-09-20",
                "gasto": 17.99,
                "cliques": 43,
                "impressoes": 1402,
                "instalacoes": 10
              },
              {
                "dia": "2026-09-21",
                "gasto": 30.74,
                "cliques": 96,
                "impressoes": 2891,
                "instalacoes": 24
              },
              {
                "dia": "2026-09-22",
                "gasto": 22.04,
                "cliques": 105,
                "impressoes": 2274,
                "instalacoes": 26
              },
              {
                "dia": "2026-09-23",
                "gasto": 16,
                "cliques": 89,
                "impressoes": 1533,
                "instalacoes": 28
              }
            ],
            "gasto7d": 97.01,
            "truncado": false,
            "campanhas": [
              {
                "nome": "Lançamento Mentorque",
                "criada": "2026-09-19",
                "status": "ACTIVE",
                "objetivo": "OUTCOME_APP_PROMOTION",
                "conjuntos": [
                  {
                    "nome": "Lançamento Mentorque",
                    "estadoReal": "ACTIVE",
                    "otimizaPor": "APP_INSTALLS",
                    "orcamentoDiario": null
                  }
                ],
                "estadoReal": "ACTIVE",
                "orcamentoDiario": 20
              }
            ],
            "contaLida": "act_1071232758617319",
            "porAnuncio": [
              {
                "nome": "Você liga o carro e espera parado",
                "gasto": 96.32,
                "cliques": 367,
                "campanha": "Lançamento Mentorque",
                "impressoes": 8700,
                "instalacoes": 98
              },
              {
                "nome": "Só ir na padaria",
                "gasto": 0.34,
                "cliques": 1,
                "campanha": "Lançamento Mentorque",
                "impressoes": 31,
                "instalacoes": 2
              },
              {
                "nome": "Carro perde força na serra",
                "gasto": 0.24,
                "cliques": 0,
                "campanha": "Lançamento Mentorque",
                "impressoes": 25,
                "instalacoes": 0
              },
              {
                "nome": "Chegar na oficina com nome",
                "gasto": 0.11,
                "cliques": 0,
                "campanha": "Lançamento Mentorque",
                "impressoes": 12,
                "instalacoes": 0
              }
            ],
            "porCampanha": [
              {
                "nome": "Lançamento Mentorque",
                "gasto": 97.01,
                "cliques": 368,
                "impressoes": 8768,
                "instalacoes": 100
              }
            ]
          }
        },
        {
          "dia": "2026-09-23",
          "dados": {
            "conta": "Mentorque Ads",
            "moeda": "BRL",
            "contas": [
              {
                "id": "act_1071232758617319",
                "nome": "Mentorque Ads",
                "moeda": "BRL"
              }
            ],
            "porDia": [
              {
                "dia": "2026-09-19",
                "gasto": 10.24,
                "cliques": 35,
                "impressoes": 668,
                "instalacoes": 12
              },
              {
                "dia": "2026-09-20",
                "gasto": 17.99,
                "cliques": 43,
                "impressoes": 1402,
                "instalacoes": 10
              },
              {
                "dia": "2026-09-21",
                "gasto": 30.74,
                "cliques": 96,
                "impressoes": 2891,
                "instalacoes": 24
              },
              {
                "dia": "2026-09-22",
                "gasto": 22.01,
                "cliques": 105,
                "impressoes": 2270,
                "instalacoes": 26
              }
            ],
            "gasto7d": 80.98,
            "truncado": false,
            "campanhas": [
              {
                "nome": "Lançamento Mentorque",
                "criada": "2026-09-19",
                "status": "ACTIVE",
                "objetivo": "OUTCOME_APP_PROMOTION",
                "conjuntos": [
                  {
                    "nome": "Lançamento Mentorque",
                    "estadoReal": "ACTIVE",
                    "otimizaPor": "APP_INSTALLS",
                    "orcamentoDiario": null
                  }
                ],
                "estadoReal": "ACTIVE",
                "orcamentoDiario": 20
              }
            ],
            "contaLida": "act_1071232758617319",
            "porAnuncio": [
              {
                "nome": "Você liga o carro e espera parado",
                "gasto": 80.46,
                "cliques": 279,
                "campanha": "Lançamento Mentorque",
                "impressoes": 7175,
                "instalacoes": 72
              },
              {
                "nome": "Carro perde força na serra",
                "gasto": 0.24,
                "cliques": 0,
                "campanha": "Lançamento Mentorque",
                "impressoes": 25,
                "instalacoes": 0
              },
              {
                "nome": "Só ir na padaria",
                "gasto": 0.17,
                "cliques": 0,
                "campanha": "Lançamento Mentorque",
                "impressoes": 19,
                "instalacoes": 0
              },
              {
                "nome": "Chegar na oficina com nome",
                "gasto": 0.11,
                "cliques": 0,
                "campanha": "Lançamento Mentorque",
                "impressoes": 12,
                "instalacoes": 0
              }
            ],
            "porCampanha": [
              {
                "nome": "Lançamento Mentorque",
                "gasto": 80.98,
                "cliques": 279,
                "impressoes": 7231,
                "instalacoes": 72
              }
            ]
          }
        },
        {
          "dia": "2026-09-22",
          "dados": {
            "conta": "Mentorque Ads",
            "moeda": "BRL",
            "contas": [
              {
                "id": "act_1071232758617319",
                "nome": "Mentorque Ads",
                "moeda": "BRL"
              }
            ],
            "porDia": [
              {
                "dia": "2026-09-19",
                "gasto": 10.24,
                "cliques": 35,
                "impressoes": 668,
                "instalacoes": 12
              },
              {
                "dia": "2026-09-20",
                "gasto": 17.99,
                "cliques": 43,
                "impressoes": 1402,
                "instalacoes": 10
              },
              {
                "dia": "2026-09-21",
                "gasto": 30.66,
                "cliques": 95,
                "impressoes": 2880,
                "instalacoes": 24
              }
            ],
            "gasto7d": 58.89,
            "truncado": false,
            "campanhas": [
              {
                "nome": "Lançamento Mentorque",
                "criada": "2026-09-19",
                "status": "ACTIVE",
                "objetivo": "OUTCOME_APP_PROMOTION",
                "conjuntos": [
                  {
                    "nome": "Lançamento Mentorque",
                    "estadoReal": "ACTIVE",
                    "otimizaPor": "APP_INSTALLS",
                    "orcamentoDiario": null
                  }
                ],
                "estadoReal": "ACTIVE",
                "orcamentoDiario": 20
              }
            ],
            "contaLida": "act_1071232758617319",
            "porAnuncio": [
              {
                "nome": "Você liga o carro e espera parado",
                "gasto": 58.39,
                "cliques": 173,
                "campanha": "Lançamento Mentorque",
                "impressoes": 4898,
                "instalacoes": 46
              },
              {
                "nome": "Carro perde força na serra",
                "gasto": 0.23,
                "cliques": 0,
                "campanha": "Lançamento Mentorque",
                "impressoes": 24,
                "instalacoes": 0
              },
              {
                "nome": "Só ir na padaria",
                "gasto": 0.17,
                "cliques": 0,
                "campanha": "Lançamento Mentorque",
                "impressoes": 19,
                "instalacoes": 0
              },
              {
                "nome": "Chegar na oficina com nome",
                "gasto": 0.1,
                "cliques": 0,
                "campanha": "Lançamento Mentorque",
                "impressoes": 9,
                "instalacoes": 0
              }
            ],
            "porCampanha": [
              {
                "nome": "Lançamento Mentorque",
                "gasto": 58.89,
                "cliques": 173,
                "impressoes": 4950,
                "instalacoes": 46
              }
            ]
          }
        },
        {
          "dia": "2026-09-21",
          "dados": {
            "conta": "Mentorque Ads",
            "moeda": "BRL",
            "contas": [
              {
                "id": "act_1071232758617319",
                "nome": "Mentorque Ads",
                "moeda": "BRL"
              }
            ],
            "porDia": [
              {
                "dia": "2026-09-19",
                "gasto": 10.24,
                "cliques": 35,
                "impressoes": 668,
                "instalacoes": 12
              },
              {
                "dia": "2026-09-20",
                "gasto": 17.94,
                "cliques": 43,
                "impressoes": 1397,
                "instalacoes": 10
              }
            ],
            "gasto7d": 28.18,
            "truncado": false,
            "campanhas": [
              {
                "nome": "Lançamento Mentorque",
                "criada": "2026-09-19",
                "status": "ACTIVE",
                "objetivo": "OUTCOME_APP_PROMOTION",
                "conjuntos": [
                  {
                    "nome": "Lançamento Mentorque",
                    "estadoReal": "ACTIVE",
                    "otimizaPor": "APP_INSTALLS",
                    "orcamentoDiario": null
                  }
                ],
                "estadoReal": "ACTIVE",
                "orcamentoDiario": 20
              }
            ],
            "contaLida": "act_1071232758617319",
            "porAnuncio": [
              {
                "nome": "Você liga o carro e espera parado",
                "gasto": 27.71,
                "cliques": 78,
                "campanha": "Lançamento Mentorque",
                "impressoes": 2026,
                "instalacoes": 22
              },
              {
                "nome": "Carro perde força na serra",
                "gasto": 0.21,
                "cliques": 0,
                "campanha": "Lançamento Mentorque",
                "impressoes": 13,
                "instalacoes": 0
              },
              {
                "nome": "Só ir na padaria",
                "gasto": 0.16,
                "cliques": 0,
                "campanha": "Lançamento Mentorque",
                "impressoes": 18,
                "instalacoes": 0
              },
              {
                "nome": "Chegar na oficina com nome",
                "gasto": 0.1,
                "cliques": 0,
                "campanha": "Lançamento Mentorque",
                "impressoes": 8,
                "instalacoes": 0
              }
            ],
            "porCampanha": [
              {
                "nome": "Lançamento Mentorque",
                "gasto": 28.18,
                "cliques": 78,
                "impressoes": 2065,
                "instalacoes": 22
              }
            ]
          }
        },
        {
          "dia": "2026-09-20",
          "dados": {
            "conta": "Mentorque Ads",
            "moeda": "BRL",
            "contas": [
              {
                "id": "act_1071232758617319",
                "nome": "Mentorque Ads",
                "moeda": "BRL"
              }
            ],
            "porDia": [
              {
                "dia": "2026-09-19",
                "gasto": 10.23,
                "cliques": 35,
                "impressoes": 667,
                "instalacoes": 12
              }
            ],
            "gasto7d": 10.23,
            "truncado": false,
            "campanhas": [
              {
                "nome": "Lançamento Mentorque",
                "criada": "2026-09-19",
                "status": "ACTIVE",
                "objetivo": "OUTCOME_APP_PROMOTION",
                "conjuntos": [
                  {
                    "nome": "Lançamento Mentorque",
                    "estadoReal": "ACTIVE",
                    "otimizaPor": "APP_INSTALLS",
                    "orcamentoDiario": null
                  }
                ],
                "estadoReal": "ACTIVE",
                "orcamentoDiario": 20
              }
            ],
            "contaLida": "act_1071232758617319",
            "porAnuncio": [
              {
                "nome": "Você liga o carro e espera parado",
                "gasto": 9.99,
                "cliques": 35,
                "campanha": "Lançamento Mentorque",
                "impressoes": 643,
                "instalacoes": 12
              },
              {
                "nome": "Chegar na oficina com nome",
                "gasto": 0.1,
                "cliques": 0,
                "campanha": "Lançamento Mentorque",
                "impressoes": 8,
                "instalacoes": 0
              },
              {
                "nome": "Só ir na padaria",
                "gasto": 0.09,
                "cliques": 0,
                "campanha": "Lançamento Mentorque",
                "impressoes": 12,
                "instalacoes": 0
              },
              {
                "nome": "Carro perde força na serra",
                "gasto": 0.05,
                "cliques": 0,
                "campanha": "Lançamento Mentorque",
                "impressoes": 4,
                "instalacoes": 0
              }
            ],
            "porCampanha": [
              {
                "nome": "Lançamento Mentorque",
                "gasto": 10.23,
                "cliques": 35,
                "impressoes": 667,
                "instalacoes": 12
              }
            ]
          }
        }
      ],
      "google_ads": [
        {
          "dia": "2026-09-30",
          "dados": {
            "conta": "Mentorque",
            "porDia": [
              {
                "dia": "2026-09-23",
                "custo": 41.612832,
                "cliques": 87,
                "conversoes": 18,
                "impressoes": 565
              },
              {
                "dia": "2026-09-24",
                "custo": 18.782614000000002,
                "cliques": 50,
                "conversoes": 16,
                "impressoes": 777
              },
              {
                "dia": "2026-09-25",
                "custo": 21.599485,
                "cliques": 79,
                "conversoes": 24,
                "impressoes": 1110
              },
              {
                "dia": "2026-09-26",
                "custo": 21.010339,
                "cliques": 80,
                "conversoes": 23,
                "impressoes": 1029
              },
              {
                "dia": "2026-09-27",
                "custo": 26.357428,
                "cliques": 81,
                "conversoes": 28,
                "impressoes": 915
              },
              {
                "dia": "2026-09-28",
                "custo": 25.056398,
                "cliques": 80,
                "conversoes": 37,
                "impressoes": 2366
              },
              {
                "dia": "2026-09-29",
                "custo": 21.988,
                "cliques": 50,
                "conversoes": 32,
                "impressoes": 2289
              },
              {
                "dia": "2026-09-30",
                "custo": 0.634647,
                "cliques": 3,
                "conversoes": 2,
                "impressoes": 61
              }
            ],
            "termos": [
              {
                "custo": 10.95,
                "termo": "scanner de carro no celular",
                "cliques": 7,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 28
              },
              {
                "custo": 6.49,
                "termo": "curso mecânica automotiva grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 28
              },
              {
                "custo": 6.32,
                "termo": "mecânico online perguntas e respostas",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 12
              },
              {
                "custo": 5.91,
                "termo": "como escanear o carro pelo celular grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 32
              },
              {
                "custo": 4.74,
                "termo": "scanner do carro pelo celular",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 4.32,
                "termo": "mecânico online",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 29
              },
              {
                "custo": 3.6,
                "termo": "curso de mecânica automotiva gratuito",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 3.24,
                "termo": "quando a luz da injeção fica acesa",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.23,
                "termo": "mecânica 2000 manual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 4
              },
              {
                "custo": 3.21,
                "termo": "luz de injeção eletrônica acesa e não apaga",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 14
              },
              {
                "custo": 3.2,
                "termo": "ebook mecanica automotiva",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 3.16,
                "termo": "carro liga parte eletrica mas nao da partida",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.16,
                "termo": "aula de mecânica básica",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 3.08,
                "termo": "troca de embreagem em bh",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.06,
                "termo": "curso mecânico automotivo",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 3.02,
                "termo": "como escanear o carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 54
              },
              {
                "custo": 2.98,
                "termo": "escanear seu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 2.98,
                "termo": "scanner automotivo para celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 27
              },
              {
                "custo": 2.96,
                "termo": "mecanico online tirar duvidas",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 2.95,
                "termo": "escanear carro pelo celular android",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2.7,
                "termo": "mecanico online",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 15
              },
              {
                "custo": 2.64,
                "termo": "mecânico virtual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 2.58,
                "termo": "como escanear meu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 2.51,
                "termo": "mecânico online grátis",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2,
                "termo": "cursos de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 6
              },
              {
                "custo": 2,
                "termo": "cursos online gratuitos com certificado mecanica automotiva",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.99,
                "termo": "curso mecânico de carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 1
              },
              {
                "custo": 1.98,
                "termo": "troca de oleo de carro quanto tempo",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.97,
                "termo": "meu carro acendeu a luz do motor",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.93,
                "termo": "curso de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.9,
                "termo": "pastilha de freio",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 1.9,
                "termo": "curso de mecânico automotivo rj",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.85,
                "termo": "carro esquentando mesmo com agua no radiador",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.85,
                "termo": "curso de mecânico carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.8,
                "termo": "quando o carro não dá partida o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 1.79,
                "termo": "hilux não pega na partida",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.78,
                "termo": "quando o carro está perdendo a força o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.77,
                "termo": "como escanear um carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "carro celta falhando o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "scanner automotivo gratis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.75,
                "termo": "escanear carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.74,
                "termo": "tabela de preços de serviços mecânicos automotivos 2026",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.74,
                "termo": "como regular a marcha lenta do onix",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.73,
                "termo": "sete videocarro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "porque o carro aquece muito",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "curso de mecânica",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 16
              },
              {
                "custo": 1.69,
                "termo": "fumaça branca no escapamento do carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.69,
                "termo": "luz da pressão do óleo piscando",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "carro perde força em alta rotação",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "curso de mecânica online grátis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              }
            ],
            "contaId": "6724308347",
            "custo7d": 177.04174300000003,
            "porCampanha": [
              {
                "id": "24273898063",
                "nome": "APP | Android | Instalações | BR",
                "canal": "MULTI_CHANNEL",
                "custo": 151.341743,
                "status": "ENABLED",
                "cliques": 494,
                "conversoes": 179,
                "impressoes": 8776
              },
              {
                "id": "24163300275",
                "nome": "Mentorque Lançamento",
                "canal": "SEARCH",
                "custo": 25.700000000000003,
                "status": "ENABLED",
                "cliques": 16,
                "conversoes": 1,
                "impressoes": 336
              }
            ],
            "termosSemConversao": [
              {
                "custo": 6.32,
                "termo": "mecânico online perguntas e respostas",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 12
              },
              {
                "custo": 5.91,
                "termo": "como escanear o carro pelo celular grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 32
              },
              {
                "custo": 4.74,
                "termo": "scanner do carro pelo celular",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 4.32,
                "termo": "mecânico online",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 29
              },
              {
                "custo": 3.6,
                "termo": "curso de mecânica automotiva gratuito",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 3.24,
                "termo": "quando a luz da injeção fica acesa",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.21,
                "termo": "luz de injeção eletrônica acesa e não apaga",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 14
              },
              {
                "custo": 3.2,
                "termo": "ebook mecanica automotiva",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 3.16,
                "termo": "carro liga parte eletrica mas nao da partida",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.16,
                "termo": "aula de mecânica básica",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 3.08,
                "termo": "troca de embreagem em bh",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.06,
                "termo": "curso mecânico automotivo",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 3.02,
                "termo": "como escanear o carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 54
              },
              {
                "custo": 2.98,
                "termo": "escanear seu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 2.98,
                "termo": "scanner automotivo para celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 27
              },
              {
                "custo": 2.96,
                "termo": "mecanico online tirar duvidas",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 2.95,
                "termo": "escanear carro pelo celular android",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2.7,
                "termo": "mecanico online",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 15
              },
              {
                "custo": 2.64,
                "termo": "mecânico virtual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 2.58,
                "termo": "como escanear meu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 2.51,
                "termo": "mecânico online grátis",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2,
                "termo": "cursos online gratuitos com certificado mecanica automotiva",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.98,
                "termo": "troca de oleo de carro quanto tempo",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.97,
                "termo": "meu carro acendeu a luz do motor",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.93,
                "termo": "curso de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.9,
                "termo": "pastilha de freio",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 1.9,
                "termo": "curso de mecânico automotivo rj",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.85,
                "termo": "carro esquentando mesmo com agua no radiador",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.85,
                "termo": "curso de mecânico carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.8,
                "termo": "quando o carro não dá partida o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 1.79,
                "termo": "hilux não pega na partida",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.78,
                "termo": "quando o carro está perdendo a força o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.77,
                "termo": "como escanear um carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "carro celta falhando o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "scanner automotivo gratis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.75,
                "termo": "escanear carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.74,
                "termo": "tabela de preços de serviços mecânicos automotivos 2026",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.74,
                "termo": "como regular a marcha lenta do onix",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.73,
                "termo": "sete videocarro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "porque o carro aquece muito",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "curso de mecânica",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 16
              },
              {
                "custo": 1.69,
                "termo": "fumaça branca no escapamento do carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.69,
                "termo": "luz da pressão do óleo piscando",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "carro perde força em alta rotação",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "curso de mecânica online grátis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              }
            ]
          }
        },
        {
          "dia": "2026-09-29",
          "dados": {
            "conta": "Mentorque",
            "porDia": [
              {
                "dia": "2026-09-22",
                "custo": 37.341941000000006,
                "cliques": 83,
                "conversoes": 18,
                "impressoes": 601
              },
              {
                "dia": "2026-09-23",
                "custo": 42.75996,
                "cliques": 88,
                "conversoes": 19,
                "impressoes": 574
              },
              {
                "dia": "2026-09-24",
                "custo": 18.944305999999997,
                "cliques": 51,
                "conversoes": 16,
                "impressoes": 777
              },
              {
                "dia": "2026-09-25",
                "custo": 21.58567,
                "cliques": 79,
                "conversoes": 23,
                "impressoes": 1109
              },
              {
                "dia": "2026-09-26",
                "custo": 21.010339,
                "cliques": 80,
                "conversoes": 22,
                "impressoes": 1031
              },
              {
                "dia": "2026-09-27",
                "custo": 26.357428,
                "cliques": 81,
                "conversoes": 28,
                "impressoes": 915
              },
              {
                "dia": "2026-09-28",
                "custo": 25.056398,
                "cliques": 80,
                "conversoes": 36,
                "impressoes": 2366
              },
              {
                "dia": "2026-09-29",
                "custo": 1.872264,
                "cliques": 2,
                "conversoes": 0,
                "impressoes": 198
              }
            ],
            "termos": [
              {
                "custo": 10.95,
                "termo": "scanner de carro no celular",
                "cliques": 7,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 28
              },
              {
                "custo": 6.49,
                "termo": "curso mecânica automotiva grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 28
              },
              {
                "custo": 6.32,
                "termo": "mecânico online perguntas e respostas",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 12
              },
              {
                "custo": 5.91,
                "termo": "como escanear o carro pelo celular grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 32
              },
              {
                "custo": 4.74,
                "termo": "scanner do carro pelo celular",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 4.32,
                "termo": "mecânico online",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 29
              },
              {
                "custo": 3.6,
                "termo": "curso de mecânica automotiva gratuito",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 3.24,
                "termo": "quando a luz da injeção fica acesa",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.23,
                "termo": "mecânica 2000 manual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 4
              },
              {
                "custo": 3.21,
                "termo": "luz de injeção eletrônica acesa e não apaga",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 14
              },
              {
                "custo": 3.2,
                "termo": "ebook mecanica automotiva",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 3.16,
                "termo": "carro liga parte eletrica mas nao da partida",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.16,
                "termo": "aula de mecânica básica",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 3.08,
                "termo": "troca de embreagem em bh",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.06,
                "termo": "curso mecânico automotivo",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 3.02,
                "termo": "como escanear o carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 54
              },
              {
                "custo": 2.98,
                "termo": "escanear seu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 2.98,
                "termo": "scanner automotivo para celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 27
              },
              {
                "custo": 2.96,
                "termo": "mecanico online tirar duvidas",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 2.95,
                "termo": "escanear carro pelo celular android",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2.7,
                "termo": "mecanico online",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 15
              },
              {
                "custo": 2.64,
                "termo": "mecânico virtual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 2.58,
                "termo": "como escanear meu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 2.51,
                "termo": "mecânico online grátis",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2,
                "termo": "cursos de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 6
              },
              {
                "custo": 2,
                "termo": "cursos online gratuitos com certificado mecanica automotiva",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.99,
                "termo": "curso mecânico de carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 1
              },
              {
                "custo": 1.98,
                "termo": "troca de oleo de carro quanto tempo",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.97,
                "termo": "meu carro acendeu a luz do motor",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.93,
                "termo": "curso de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.9,
                "termo": "pastilha de freio",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 1.9,
                "termo": "curso de mecânico automotivo rj",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.85,
                "termo": "carro esquentando mesmo com agua no radiador",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.85,
                "termo": "curso de mecânico carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.8,
                "termo": "quando o carro não dá partida o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 1.79,
                "termo": "hilux não pega na partida",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.78,
                "termo": "quando o carro está perdendo a força o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.77,
                "termo": "como escanear um carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "carro celta falhando o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "scanner automotivo gratis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.75,
                "termo": "escanear carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.74,
                "termo": "tabela de preços de serviços mecânicos automotivos 2026",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.74,
                "termo": "como regular a marcha lenta do onix",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.73,
                "termo": "sete videocarro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "porque o carro aquece muito",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "curso de mecânica",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 16
              },
              {
                "custo": 1.69,
                "termo": "fumaça branca no escapamento do carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.69,
                "termo": "luz da pressão do óleo piscando",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "carro perde força em alta rotação",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "curso de mecânica online grátis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              }
            ],
            "contaId": "6724308347",
            "custo7d": 194.928306,
            "porCampanha": [
              {
                "id": "24273898063",
                "nome": "APP | Android | Instalações | BR",
                "canal": "MULTI_CHANNEL",
                "custo": 148.658306,
                "status": "ENABLED",
                "cliques": 514,
                "conversoes": 158,
                "impressoes": 6903
              },
              {
                "id": "24163300275",
                "nome": "Mentorque Lançamento",
                "canal": "SEARCH",
                "custo": 46.27,
                "status": "ENABLED",
                "cliques": 30,
                "conversoes": 4,
                "impressoes": 668
              }
            ],
            "termosSemConversao": [
              {
                "custo": 6.32,
                "termo": "mecânico online perguntas e respostas",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 12
              },
              {
                "custo": 5.91,
                "termo": "como escanear o carro pelo celular grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 32
              },
              {
                "custo": 4.74,
                "termo": "scanner do carro pelo celular",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 4.32,
                "termo": "mecânico online",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 29
              },
              {
                "custo": 3.6,
                "termo": "curso de mecânica automotiva gratuito",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 3.24,
                "termo": "quando a luz da injeção fica acesa",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.21,
                "termo": "luz de injeção eletrônica acesa e não apaga",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 14
              },
              {
                "custo": 3.2,
                "termo": "ebook mecanica automotiva",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 3.16,
                "termo": "carro liga parte eletrica mas nao da partida",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.16,
                "termo": "aula de mecânica básica",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 3.08,
                "termo": "troca de embreagem em bh",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.06,
                "termo": "curso mecânico automotivo",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 3.02,
                "termo": "como escanear o carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 54
              },
              {
                "custo": 2.98,
                "termo": "escanear seu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 2.98,
                "termo": "scanner automotivo para celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 27
              },
              {
                "custo": 2.96,
                "termo": "mecanico online tirar duvidas",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 2.95,
                "termo": "escanear carro pelo celular android",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2.7,
                "termo": "mecanico online",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 15
              },
              {
                "custo": 2.64,
                "termo": "mecânico virtual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 2.58,
                "termo": "como escanear meu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 2.51,
                "termo": "mecânico online grátis",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2,
                "termo": "cursos online gratuitos com certificado mecanica automotiva",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.98,
                "termo": "troca de oleo de carro quanto tempo",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.97,
                "termo": "meu carro acendeu a luz do motor",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.93,
                "termo": "curso de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.9,
                "termo": "pastilha de freio",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 1.9,
                "termo": "curso de mecânico automotivo rj",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.85,
                "termo": "carro esquentando mesmo com agua no radiador",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.85,
                "termo": "curso de mecânico carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.8,
                "termo": "quando o carro não dá partida o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 1.79,
                "termo": "hilux não pega na partida",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.78,
                "termo": "quando o carro está perdendo a força o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.77,
                "termo": "como escanear um carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "carro celta falhando o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "scanner automotivo gratis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.75,
                "termo": "escanear carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.74,
                "termo": "tabela de preços de serviços mecânicos automotivos 2026",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.74,
                "termo": "como regular a marcha lenta do onix",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.73,
                "termo": "sete videocarro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "porque o carro aquece muito",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "curso de mecânica",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 16
              },
              {
                "custo": 1.69,
                "termo": "fumaça branca no escapamento do carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.69,
                "termo": "luz da pressão do óleo piscando",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "carro perde força em alta rotação",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "curso de mecânica online grátis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              }
            ]
          }
        },
        {
          "dia": "2026-09-28",
          "dados": {
            "conta": "Mentorque",
            "porDia": [
              {
                "dia": "2026-09-21",
                "custo": 39.512319000000005,
                "cliques": 128,
                "conversoes": 28,
                "impressoes": 1040
              },
              {
                "dia": "2026-09-22",
                "custo": 39.326885000000004,
                "cliques": 92,
                "conversoes": 18,
                "impressoes": 601
              },
              {
                "dia": "2026-09-23",
                "custo": 43.675753,
                "cliques": 90,
                "conversoes": 19,
                "impressoes": 574
              },
              {
                "dia": "2026-09-24",
                "custo": 20.390745000000003,
                "cliques": 56,
                "conversoes": 15,
                "impressoes": 777
              },
              {
                "dia": "2026-09-25",
                "custo": 21.974197,
                "cliques": 83,
                "conversoes": 23,
                "impressoes": 1115
              },
              {
                "dia": "2026-09-26",
                "custo": 21.486627,
                "cliques": 82,
                "conversoes": 22,
                "impressoes": 1040
              },
              {
                "dia": "2026-09-27",
                "custo": 26.357428,
                "cliques": 81,
                "conversoes": 28,
                "impressoes": 915
              },
              {
                "dia": "2026-09-28",
                "custo": 1.491502,
                "cliques": 3,
                "conversoes": 2,
                "impressoes": 124
              }
            ],
            "termos": [
              {
                "custo": 10.95,
                "termo": "scanner de carro no celular",
                "cliques": 7,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 28
              },
              {
                "custo": 6.49,
                "termo": "curso mecânica automotiva grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 28
              },
              {
                "custo": 6.32,
                "termo": "mecânico online perguntas e respostas",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 12
              },
              {
                "custo": 5.91,
                "termo": "como escanear o carro pelo celular grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 32
              },
              {
                "custo": 4.74,
                "termo": "scanner do carro pelo celular",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 4.32,
                "termo": "mecânico online",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 29
              },
              {
                "custo": 3.6,
                "termo": "curso de mecânica automotiva gratuito",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 3.24,
                "termo": "quando a luz da injeção fica acesa",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.23,
                "termo": "mecânica 2000 manual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 4
              },
              {
                "custo": 3.21,
                "termo": "luz de injeção eletrônica acesa e não apaga",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 14
              },
              {
                "custo": 3.2,
                "termo": "ebook mecanica automotiva",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 3.16,
                "termo": "carro liga parte eletrica mas nao da partida",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.16,
                "termo": "aula de mecânica básica",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 3.08,
                "termo": "troca de embreagem em bh",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.06,
                "termo": "curso mecânico automotivo",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 3.02,
                "termo": "como escanear o carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 54
              },
              {
                "custo": 2.98,
                "termo": "escanear seu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 2.98,
                "termo": "scanner automotivo para celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 27
              },
              {
                "custo": 2.96,
                "termo": "mecanico online tirar duvidas",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 2.95,
                "termo": "escanear carro pelo celular android",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2.7,
                "termo": "mecanico online",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 15
              },
              {
                "custo": 2.64,
                "termo": "mecânico virtual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 2.58,
                "termo": "como escanear meu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 2.51,
                "termo": "mecânico online grátis",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2,
                "termo": "cursos de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 6
              },
              {
                "custo": 2,
                "termo": "cursos online gratuitos com certificado mecanica automotiva",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.99,
                "termo": "curso mecânico de carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 1
              },
              {
                "custo": 1.98,
                "termo": "troca de oleo de carro quanto tempo",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.97,
                "termo": "meu carro acendeu a luz do motor",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.93,
                "termo": "curso de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.9,
                "termo": "pastilha de freio",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 1.9,
                "termo": "curso de mecânico automotivo rj",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.85,
                "termo": "carro esquentando mesmo com agua no radiador",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.85,
                "termo": "curso de mecânico carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.8,
                "termo": "quando o carro não dá partida o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 1.79,
                "termo": "hilux não pega na partida",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.78,
                "termo": "quando o carro está perdendo a força o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.77,
                "termo": "como escanear um carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "carro celta falhando o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "scanner automotivo gratis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.75,
                "termo": "escanear carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.74,
                "termo": "tabela de preços de serviços mecânicos automotivos 2026",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.74,
                "termo": "como regular a marcha lenta do onix",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.73,
                "termo": "sete videocarro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "porque o carro aquece muito",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "curso de mecânica",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 16
              },
              {
                "custo": 1.69,
                "termo": "fumaça branca no escapamento do carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.69,
                "termo": "luz da pressão do óleo piscando",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "carro perde força em alta rotação",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "curso de mecânica online grátis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              }
            ],
            "contaId": "6724308347",
            "custo7d": 214.21545600000002,
            "porCampanha": [
              {
                "id": "24273898063",
                "nome": "APP | Android | Instalações | BR",
                "canal": "MULTI_CHANNEL",
                "custo": 146.895456,
                "status": "ENABLED",
                "cliques": 571,
                "conversoes": 151,
                "impressoes": 5168
              },
              {
                "id": "24163300275",
                "nome": "Mentorque Lançamento",
                "canal": "SEARCH",
                "custo": 67.32000000000001,
                "status": "ENABLED",
                "cliques": 44,
                "conversoes": 4,
                "impressoes": 1018
              }
            ],
            "termosSemConversao": [
              {
                "custo": 6.32,
                "termo": "mecânico online perguntas e respostas",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 12
              },
              {
                "custo": 5.91,
                "termo": "como escanear o carro pelo celular grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 32
              },
              {
                "custo": 4.74,
                "termo": "scanner do carro pelo celular",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 4.32,
                "termo": "mecânico online",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 29
              },
              {
                "custo": 3.6,
                "termo": "curso de mecânica automotiva gratuito",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 3.24,
                "termo": "quando a luz da injeção fica acesa",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.21,
                "termo": "luz de injeção eletrônica acesa e não apaga",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 14
              },
              {
                "custo": 3.2,
                "termo": "ebook mecanica automotiva",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 3.16,
                "termo": "carro liga parte eletrica mas nao da partida",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.16,
                "termo": "aula de mecânica básica",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 3.08,
                "termo": "troca de embreagem em bh",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.06,
                "termo": "curso mecânico automotivo",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 3.02,
                "termo": "como escanear o carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 54
              },
              {
                "custo": 2.98,
                "termo": "escanear seu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 2.98,
                "termo": "scanner automotivo para celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 27
              },
              {
                "custo": 2.96,
                "termo": "mecanico online tirar duvidas",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 2.95,
                "termo": "escanear carro pelo celular android",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2.7,
                "termo": "mecanico online",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 15
              },
              {
                "custo": 2.64,
                "termo": "mecânico virtual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 2.58,
                "termo": "como escanear meu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 2.51,
                "termo": "mecânico online grátis",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2,
                "termo": "cursos online gratuitos com certificado mecanica automotiva",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.98,
                "termo": "troca de oleo de carro quanto tempo",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.97,
                "termo": "meu carro acendeu a luz do motor",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.93,
                "termo": "curso de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.9,
                "termo": "pastilha de freio",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 1.9,
                "termo": "curso de mecânico automotivo rj",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.85,
                "termo": "carro esquentando mesmo com agua no radiador",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.85,
                "termo": "curso de mecânico carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.8,
                "termo": "quando o carro não dá partida o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 1.79,
                "termo": "hilux não pega na partida",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.78,
                "termo": "quando o carro está perdendo a força o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.77,
                "termo": "como escanear um carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "carro celta falhando o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "scanner automotivo gratis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.75,
                "termo": "escanear carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.74,
                "termo": "tabela de preços de serviços mecânicos automotivos 2026",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.74,
                "termo": "como regular a marcha lenta do onix",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.73,
                "termo": "sete videocarro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "porque o carro aquece muito",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "curso de mecânica",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 16
              },
              {
                "custo": 1.69,
                "termo": "fumaça branca no escapamento do carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.69,
                "termo": "luz da pressão do óleo piscando",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "carro perde força em alta rotação",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "curso de mecânica online grátis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              }
            ]
          }
        },
        {
          "dia": "2026-09-27",
          "dados": {
            "conta": "Mentorque",
            "porDia": [
              {
                "dia": "2026-09-20",
                "custo": 62.114636,
                "cliques": 287,
                "conversoes": 21,
                "impressoes": 3907
              },
              {
                "dia": "2026-09-21",
                "custo": 40.875537,
                "cliques": 131,
                "conversoes": 30,
                "impressoes": 1040
              },
              {
                "dia": "2026-09-22",
                "custo": 39.634831000000005,
                "cliques": 93,
                "conversoes": 21,
                "impressoes": 623
              },
              {
                "dia": "2026-09-23",
                "custo": 43.675753,
                "cliques": 90,
                "conversoes": 20,
                "impressoes": 581
              },
              {
                "dia": "2026-09-24",
                "custo": 20.498244999999997,
                "cliques": 56,
                "conversoes": 16,
                "impressoes": 808
              },
              {
                "dia": "2026-09-25",
                "custo": 21.974197,
                "cliques": 83,
                "conversoes": 23,
                "impressoes": 1123
              },
              {
                "dia": "2026-09-26",
                "custo": 21.486627,
                "cliques": 82,
                "conversoes": 22,
                "impressoes": 1040
              },
              {
                "dia": "2026-09-27",
                "custo": 1.63437,
                "cliques": 6,
                "conversoes": 0,
                "impressoes": 97
              }
            ],
            "termos": [
              {
                "custo": 10.95,
                "termo": "scanner de carro no celular",
                "cliques": 7,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 28
              },
              {
                "custo": 6.49,
                "termo": "curso mecânica automotiva grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 28
              },
              {
                "custo": 6.32,
                "termo": "mecânico online perguntas e respostas",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 12
              },
              {
                "custo": 5.91,
                "termo": "como escanear o carro pelo celular grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 32
              },
              {
                "custo": 4.74,
                "termo": "scanner do carro pelo celular",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 4.32,
                "termo": "mecânico online",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 29
              },
              {
                "custo": 3.6,
                "termo": "curso de mecânica automotiva gratuito",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 3.24,
                "termo": "quando a luz da injeção fica acesa",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.23,
                "termo": "mecânica 2000 manual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 4
              },
              {
                "custo": 3.21,
                "termo": "luz de injeção eletrônica acesa e não apaga",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 14
              },
              {
                "custo": 3.2,
                "termo": "ebook mecanica automotiva",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 3.16,
                "termo": "carro liga parte eletrica mas nao da partida",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.16,
                "termo": "aula de mecânica básica",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 3.08,
                "termo": "troca de embreagem em bh",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.06,
                "termo": "curso mecânico automotivo",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 3.02,
                "termo": "como escanear o carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 54
              },
              {
                "custo": 2.98,
                "termo": "escanear seu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 2.98,
                "termo": "scanner automotivo para celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 27
              },
              {
                "custo": 2.96,
                "termo": "mecanico online tirar duvidas",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 2.95,
                "termo": "escanear carro pelo celular android",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2.7,
                "termo": "mecanico online",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 15
              },
              {
                "custo": 2.64,
                "termo": "mecânico virtual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 2.58,
                "termo": "como escanear meu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 2.51,
                "termo": "mecânico online grátis",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2,
                "termo": "cursos de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 6
              },
              {
                "custo": 2,
                "termo": "cursos online gratuitos com certificado mecanica automotiva",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.99,
                "termo": "curso mecânico de carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 1
              },
              {
                "custo": 1.98,
                "termo": "troca de oleo de carro quanto tempo",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.97,
                "termo": "meu carro acendeu a luz do motor",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.93,
                "termo": "curso de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.9,
                "termo": "pastilha de freio",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 1.9,
                "termo": "curso de mecânico automotivo rj",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.85,
                "termo": "carro esquentando mesmo com agua no radiador",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.85,
                "termo": "curso de mecânico carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.8,
                "termo": "quando o carro não dá partida o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 1.79,
                "termo": "hilux não pega na partida",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.78,
                "termo": "quando o carro está perdendo a força o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.77,
                "termo": "como escanear um carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "carro celta falhando o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "scanner automotivo gratis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.75,
                "termo": "escanear carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.74,
                "termo": "tabela de preços de serviços mecânicos automotivos 2026",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.74,
                "termo": "como regular a marcha lenta do onix",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.73,
                "termo": "sete videocarro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "porque o carro aquece muito",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "curso de mecânica",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 16
              },
              {
                "custo": 1.69,
                "termo": "fumaça branca no escapamento do carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.69,
                "termo": "luz da pressão do óleo piscando",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "carro perde força em alta rotação",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "curso de mecânica online grátis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              }
            ],
            "contaId": "6724308347",
            "custo7d": 251.89419599999997,
            "porCampanha": [
              {
                "id": "24273898063",
                "nome": "APP | Android | Instalações | BR",
                "canal": "MULTI_CHANNEL",
                "custo": 165.494196,
                "status": "ENABLED",
                "cliques": 771,
                "conversoes": 148,
                "impressoes": 7732
              },
              {
                "id": "24163300275",
                "nome": "Mentorque Lançamento",
                "canal": "SEARCH",
                "custo": 86.39999999999999,
                "status": "ENABLED",
                "cliques": 57,
                "conversoes": 5,
                "impressoes": 1487
              }
            ],
            "termosSemConversao": [
              {
                "custo": 6.32,
                "termo": "mecânico online perguntas e respostas",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 12
              },
              {
                "custo": 5.91,
                "termo": "como escanear o carro pelo celular grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 32
              },
              {
                "custo": 4.74,
                "termo": "scanner do carro pelo celular",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 4.32,
                "termo": "mecânico online",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 29
              },
              {
                "custo": 3.6,
                "termo": "curso de mecânica automotiva gratuito",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 3.24,
                "termo": "quando a luz da injeção fica acesa",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.21,
                "termo": "luz de injeção eletrônica acesa e não apaga",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 14
              },
              {
                "custo": 3.2,
                "termo": "ebook mecanica automotiva",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 3.16,
                "termo": "carro liga parte eletrica mas nao da partida",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.16,
                "termo": "aula de mecânica básica",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 3.08,
                "termo": "troca de embreagem em bh",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.06,
                "termo": "curso mecânico automotivo",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 3.02,
                "termo": "como escanear o carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 54
              },
              {
                "custo": 2.98,
                "termo": "escanear seu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 2.98,
                "termo": "scanner automotivo para celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 27
              },
              {
                "custo": 2.96,
                "termo": "mecanico online tirar duvidas",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 2.95,
                "termo": "escanear carro pelo celular android",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2.7,
                "termo": "mecanico online",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 15
              },
              {
                "custo": 2.64,
                "termo": "mecânico virtual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 2.58,
                "termo": "como escanear meu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 2.51,
                "termo": "mecânico online grátis",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2,
                "termo": "cursos online gratuitos com certificado mecanica automotiva",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.98,
                "termo": "troca de oleo de carro quanto tempo",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.97,
                "termo": "meu carro acendeu a luz do motor",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.93,
                "termo": "curso de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.9,
                "termo": "pastilha de freio",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 1.9,
                "termo": "curso de mecânico automotivo rj",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.85,
                "termo": "carro esquentando mesmo com agua no radiador",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.85,
                "termo": "curso de mecânico carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.8,
                "termo": "quando o carro não dá partida o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 1.79,
                "termo": "hilux não pega na partida",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.78,
                "termo": "quando o carro está perdendo a força o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.77,
                "termo": "como escanear um carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "carro celta falhando o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "scanner automotivo gratis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.75,
                "termo": "escanear carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.74,
                "termo": "tabela de preços de serviços mecânicos automotivos 2026",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.74,
                "termo": "como regular a marcha lenta do onix",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.73,
                "termo": "sete videocarro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "porque o carro aquece muito",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "curso de mecânica",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 16
              },
              {
                "custo": 1.69,
                "termo": "fumaça branca no escapamento do carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.69,
                "termo": "luz da pressão do óleo piscando",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "carro perde força em alta rotação",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "curso de mecânica online grátis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              }
            ]
          }
        },
        {
          "dia": "2026-09-26",
          "dados": {
            "conta": "Mentorque",
            "porDia": [
              {
                "dia": "2026-09-19",
                "custo": 17.9,
                "cliques": 11,
                "conversoes": 0,
                "impressoes": 494
              },
              {
                "dia": "2026-09-20",
                "custo": 62.753299,
                "cliques": 289,
                "conversoes": 22,
                "impressoes": 3913
              },
              {
                "dia": "2026-09-21",
                "custo": 40.862916999999996,
                "cliques": 130,
                "conversoes": 33,
                "impressoes": 1071
              },
              {
                "dia": "2026-09-22",
                "custo": 39.634831000000005,
                "cliques": 93,
                "conversoes": 21,
                "impressoes": 628
              },
              {
                "dia": "2026-09-23",
                "custo": 43.880759,
                "cliques": 91,
                "conversoes": 20,
                "impressoes": 583
              },
              {
                "dia": "2026-09-24",
                "custo": 21.098239,
                "cliques": 58,
                "conversoes": 16,
                "impressoes": 821
              },
              {
                "dia": "2026-09-25",
                "custo": 21.974197,
                "cliques": 83,
                "conversoes": 22,
                "impressoes": 1123
              },
              {
                "dia": "2026-09-26",
                "custo": 1.347727,
                "cliques": 5,
                "conversoes": 1,
                "impressoes": 104
              }
            ],
            "termos": [
              {
                "custo": 10.95,
                "termo": "scanner de carro no celular",
                "cliques": 7,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 28
              },
              {
                "custo": 6.49,
                "termo": "curso mecânica automotiva grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 28
              },
              {
                "custo": 6.32,
                "termo": "mecânico online perguntas e respostas",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 12
              },
              {
                "custo": 5.91,
                "termo": "como escanear o carro pelo celular grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 32
              },
              {
                "custo": 4.74,
                "termo": "scanner do carro pelo celular",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 4.32,
                "termo": "mecânico online",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 29
              },
              {
                "custo": 3.6,
                "termo": "curso de mecânica automotiva gratuito",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 3.24,
                "termo": "quando a luz da injeção fica acesa",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.23,
                "termo": "mecânica 2000 manual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 4
              },
              {
                "custo": 3.21,
                "termo": "luz de injeção eletrônica acesa e não apaga",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 14
              },
              {
                "custo": 3.2,
                "termo": "ebook mecanica automotiva",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 3.16,
                "termo": "carro liga parte eletrica mas nao da partida",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.16,
                "termo": "aula de mecânica básica",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 3.08,
                "termo": "troca de embreagem em bh",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.06,
                "termo": "curso mecânico automotivo",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 3.02,
                "termo": "como escanear o carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 54
              },
              {
                "custo": 2.98,
                "termo": "escanear seu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 2.98,
                "termo": "scanner automotivo para celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 27
              },
              {
                "custo": 2.96,
                "termo": "mecanico online tirar duvidas",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 2.95,
                "termo": "escanear carro pelo celular android",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2.7,
                "termo": "mecanico online",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 15
              },
              {
                "custo": 2.64,
                "termo": "mecânico virtual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 2.58,
                "termo": "como escanear meu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 2.51,
                "termo": "mecânico online grátis",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2,
                "termo": "cursos de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 6
              },
              {
                "custo": 2,
                "termo": "cursos online gratuitos com certificado mecanica automotiva",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.99,
                "termo": "curso mecânico de carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 1
              },
              {
                "custo": 1.98,
                "termo": "troca de oleo de carro quanto tempo",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.97,
                "termo": "meu carro acendeu a luz do motor",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.93,
                "termo": "curso de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.9,
                "termo": "pastilha de freio",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 1.9,
                "termo": "curso de mecânico automotivo rj",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.85,
                "termo": "carro esquentando mesmo com agua no radiador",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.85,
                "termo": "curso de mecânico carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.8,
                "termo": "quando o carro não dá partida o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 1.79,
                "termo": "hilux não pega na partida",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.78,
                "termo": "quando o carro está perdendo a força o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.77,
                "termo": "como escanear um carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "carro celta falhando o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "scanner automotivo gratis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.75,
                "termo": "escanear carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.74,
                "termo": "tabela de preços de serviços mecânicos automotivos 2026",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.74,
                "termo": "como regular a marcha lenta do onix",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.73,
                "termo": "sete videocarro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "porque o carro aquece muito",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "curso de mecânica",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 16
              },
              {
                "custo": 1.69,
                "termo": "fumaça branca no escapamento do carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.69,
                "termo": "luz da pressão do óleo piscando",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "carro perde força em alta rotação",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "curso de mecânica online grátis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              }
            ],
            "contaId": "6724308347",
            "custo7d": 249.45196900000002,
            "porCampanha": [
              {
                "id": "24273898063",
                "nome": "APP | Android | Instalações | BR",
                "canal": "MULTI_CHANNEL",
                "custo": 145.15196899999998,
                "status": "ENABLED",
                "cliques": 692,
                "conversoes": 130,
                "impressoes": 6779
              },
              {
                "id": "24163300275",
                "nome": "Mentorque Lançamento",
                "canal": "SEARCH",
                "custo": 104.3,
                "status": "ENABLED",
                "cliques": 68,
                "conversoes": 5,
                "impressoes": 1958
              }
            ],
            "termosSemConversao": [
              {
                "custo": 6.32,
                "termo": "mecânico online perguntas e respostas",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 12
              },
              {
                "custo": 5.91,
                "termo": "como escanear o carro pelo celular grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 32
              },
              {
                "custo": 4.74,
                "termo": "scanner do carro pelo celular",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 4.32,
                "termo": "mecânico online",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 29
              },
              {
                "custo": 3.6,
                "termo": "curso de mecânica automotiva gratuito",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 3.24,
                "termo": "quando a luz da injeção fica acesa",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.21,
                "termo": "luz de injeção eletrônica acesa e não apaga",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 14
              },
              {
                "custo": 3.2,
                "termo": "ebook mecanica automotiva",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 3.16,
                "termo": "carro liga parte eletrica mas nao da partida",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.16,
                "termo": "aula de mecânica básica",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 3.08,
                "termo": "troca de embreagem em bh",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.06,
                "termo": "curso mecânico automotivo",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 3.02,
                "termo": "como escanear o carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 54
              },
              {
                "custo": 2.98,
                "termo": "escanear seu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 2.98,
                "termo": "scanner automotivo para celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 27
              },
              {
                "custo": 2.96,
                "termo": "mecanico online tirar duvidas",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 2.95,
                "termo": "escanear carro pelo celular android",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2.7,
                "termo": "mecanico online",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 15
              },
              {
                "custo": 2.64,
                "termo": "mecânico virtual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 2.58,
                "termo": "como escanear meu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 2.51,
                "termo": "mecânico online grátis",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2,
                "termo": "cursos online gratuitos com certificado mecanica automotiva",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.98,
                "termo": "troca de oleo de carro quanto tempo",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.97,
                "termo": "meu carro acendeu a luz do motor",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.93,
                "termo": "curso de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.9,
                "termo": "pastilha de freio",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 1.9,
                "termo": "curso de mecânico automotivo rj",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.85,
                "termo": "carro esquentando mesmo com agua no radiador",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.85,
                "termo": "curso de mecânico carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.8,
                "termo": "quando o carro não dá partida o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 1.79,
                "termo": "hilux não pega na partida",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.78,
                "termo": "quando o carro está perdendo a força o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.77,
                "termo": "como escanear um carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "carro celta falhando o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "scanner automotivo gratis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.75,
                "termo": "escanear carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.74,
                "termo": "tabela de preços de serviços mecânicos automotivos 2026",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.74,
                "termo": "como regular a marcha lenta do onix",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.73,
                "termo": "sete videocarro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "porque o carro aquece muito",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "curso de mecânica",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 16
              },
              {
                "custo": 1.69,
                "termo": "fumaça branca no escapamento do carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.69,
                "termo": "luz da pressão do óleo piscando",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "carro perde força em alta rotação",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "curso de mecânica online grátis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              }
            ]
          }
        },
        {
          "dia": "2026-09-25",
          "dados": {
            "conta": "Mentorque",
            "porDia": [
              {
                "dia": "2026-09-18",
                "custo": 29.66,
                "cliques": 20,
                "conversoes": 0,
                "impressoes": 588
              },
              {
                "dia": "2026-09-19",
                "custo": 17.9,
                "cliques": 11,
                "conversoes": 0,
                "impressoes": 494
              },
              {
                "dia": "2026-09-20",
                "custo": 62.997851,
                "cliques": 289,
                "conversoes": 22,
                "impressoes": 3913
              },
              {
                "dia": "2026-09-21",
                "custo": 41.026298,
                "cliques": 131,
                "conversoes": 34,
                "impressoes": 1082
              },
              {
                "dia": "2026-09-22",
                "custo": 40.508764,
                "cliques": 96,
                "conversoes": 22,
                "impressoes": 642
              },
              {
                "dia": "2026-09-23",
                "custo": 44.343089000000006,
                "cliques": 92,
                "conversoes": 20,
                "impressoes": 596
              },
              {
                "dia": "2026-09-24",
                "custo": 21.098239,
                "cliques": 58,
                "conversoes": 16,
                "impressoes": 821
              },
              {
                "dia": "2026-09-25",
                "custo": 1.959423,
                "cliques": 4,
                "conversoes": 1,
                "impressoes": 114
              }
            ],
            "termos": [
              {
                "custo": 10.95,
                "termo": "scanner de carro no celular",
                "cliques": 7,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 28
              },
              {
                "custo": 6.49,
                "termo": "curso mecânica automotiva grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 28
              },
              {
                "custo": 6.32,
                "termo": "mecânico online perguntas e respostas",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 12
              },
              {
                "custo": 5.91,
                "termo": "como escanear o carro pelo celular grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 32
              },
              {
                "custo": 4.74,
                "termo": "scanner do carro pelo celular",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 4.32,
                "termo": "mecânico online",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 29
              },
              {
                "custo": 3.6,
                "termo": "curso de mecânica automotiva gratuito",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 3.24,
                "termo": "quando a luz da injeção fica acesa",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.23,
                "termo": "mecânica 2000 manual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 4
              },
              {
                "custo": 3.21,
                "termo": "luz de injeção eletrônica acesa e não apaga",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 14
              },
              {
                "custo": 3.2,
                "termo": "ebook mecanica automotiva",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 3.16,
                "termo": "carro liga parte eletrica mas nao da partida",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.16,
                "termo": "aula de mecânica básica",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 3.08,
                "termo": "troca de embreagem em bh",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.06,
                "termo": "curso mecânico automotivo",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 3.02,
                "termo": "como escanear o carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 54
              },
              {
                "custo": 2.98,
                "termo": "escanear seu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 2.98,
                "termo": "scanner automotivo para celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 27
              },
              {
                "custo": 2.96,
                "termo": "mecanico online tirar duvidas",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 2.95,
                "termo": "escanear carro pelo celular android",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2.7,
                "termo": "mecanico online",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 15
              },
              {
                "custo": 2.64,
                "termo": "mecânico virtual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 2.58,
                "termo": "como escanear meu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 2.51,
                "termo": "mecânico online grátis",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2,
                "termo": "cursos de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 6
              },
              {
                "custo": 2,
                "termo": "cursos online gratuitos com certificado mecanica automotiva",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.99,
                "termo": "curso mecânico de carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 1
              },
              {
                "custo": 1.98,
                "termo": "troca de oleo de carro quanto tempo",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.97,
                "termo": "meu carro acendeu a luz do motor",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.93,
                "termo": "curso de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.9,
                "termo": "pastilha de freio",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 1.9,
                "termo": "curso de mecânico automotivo rj",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.85,
                "termo": "carro esquentando mesmo com agua no radiador",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.85,
                "termo": "curso de mecânico carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.8,
                "termo": "quando o carro não dá partida o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 1.79,
                "termo": "hilux não pega na partida",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.78,
                "termo": "quando o carro está perdendo a força o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.77,
                "termo": "como escanear um carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "carro celta falhando o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "scanner automotivo gratis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.75,
                "termo": "escanear carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.74,
                "termo": "tabela de preços de serviços mecânicos automotivos 2026",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.74,
                "termo": "como regular a marcha lenta do onix",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.73,
                "termo": "sete videocarro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "porque o carro aquece muito",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "curso de mecânica",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 16
              },
              {
                "custo": 1.69,
                "termo": "fumaça branca no escapamento do carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.69,
                "termo": "luz da pressão do óleo piscando",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "carro perde força em alta rotação",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "curso de mecânica online grátis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              }
            ],
            "contaId": "6724308347",
            "custo7d": 259.493664,
            "porCampanha": [
              {
                "id": "24163300275",
                "nome": "Mentorque Lançamento",
                "canal": "SEARCH",
                "custo": 133.95999999999998,
                "status": "ENABLED",
                "cliques": 88,
                "conversoes": 5,
                "impressoes": 2520
              },
              {
                "id": "24273898063",
                "nome": "APP | Android | Instalações | BR",
                "canal": "MULTI_CHANNEL",
                "custo": 125.533664,
                "status": "ENABLED",
                "cliques": 613,
                "conversoes": 110,
                "impressoes": 5730
              }
            ],
            "termosSemConversao": [
              {
                "custo": 6.32,
                "termo": "mecânico online perguntas e respostas",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 12
              },
              {
                "custo": 5.91,
                "termo": "como escanear o carro pelo celular grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 32
              },
              {
                "custo": 4.74,
                "termo": "scanner do carro pelo celular",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 4.32,
                "termo": "mecânico online",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 29
              },
              {
                "custo": 3.6,
                "termo": "curso de mecânica automotiva gratuito",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 3.24,
                "termo": "quando a luz da injeção fica acesa",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.21,
                "termo": "luz de injeção eletrônica acesa e não apaga",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 14
              },
              {
                "custo": 3.2,
                "termo": "ebook mecanica automotiva",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 3.16,
                "termo": "carro liga parte eletrica mas nao da partida",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.16,
                "termo": "aula de mecânica básica",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 3.08,
                "termo": "troca de embreagem em bh",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.06,
                "termo": "curso mecânico automotivo",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 3.02,
                "termo": "como escanear o carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 54
              },
              {
                "custo": 2.98,
                "termo": "escanear seu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 2.98,
                "termo": "scanner automotivo para celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 27
              },
              {
                "custo": 2.96,
                "termo": "mecanico online tirar duvidas",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 2.95,
                "termo": "escanear carro pelo celular android",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2.7,
                "termo": "mecanico online",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 15
              },
              {
                "custo": 2.64,
                "termo": "mecânico virtual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 2.58,
                "termo": "como escanear meu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 2.51,
                "termo": "mecânico online grátis",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2,
                "termo": "cursos online gratuitos com certificado mecanica automotiva",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.98,
                "termo": "troca de oleo de carro quanto tempo",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.97,
                "termo": "meu carro acendeu a luz do motor",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.93,
                "termo": "curso de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.9,
                "termo": "pastilha de freio",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 1.9,
                "termo": "curso de mecânico automotivo rj",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.85,
                "termo": "carro esquentando mesmo com agua no radiador",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.85,
                "termo": "curso de mecânico carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.8,
                "termo": "quando o carro não dá partida o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 1.79,
                "termo": "hilux não pega na partida",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.78,
                "termo": "quando o carro está perdendo a força o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.77,
                "termo": "como escanear um carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "carro celta falhando o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "scanner automotivo gratis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.75,
                "termo": "escanear carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.74,
                "termo": "tabela de preços de serviços mecânicos automotivos 2026",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.74,
                "termo": "como regular a marcha lenta do onix",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.73,
                "termo": "sete videocarro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "porque o carro aquece muito",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "curso de mecânica",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 16
              },
              {
                "custo": 1.69,
                "termo": "fumaça branca no escapamento do carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.69,
                "termo": "luz da pressão do óleo piscando",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "carro perde força em alta rotação",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "curso de mecânica online grátis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              }
            ]
          }
        },
        {
          "dia": "2026-09-24",
          "dados": {
            "conta": "Mentorque",
            "porDia": [
              {
                "dia": "2026-09-17",
                "custo": 31.3,
                "cliques": 20,
                "conversoes": 0,
                "impressoes": 749
              },
              {
                "dia": "2026-09-18",
                "custo": 29.66,
                "cliques": 20,
                "conversoes": 0,
                "impressoes": 588
              },
              {
                "dia": "2026-09-19",
                "custo": 17.9,
                "cliques": 11,
                "conversoes": 0,
                "impressoes": 494
              },
              {
                "dia": "2026-09-20",
                "custo": 63.022636,
                "cliques": 291,
                "conversoes": 22,
                "impressoes": 3918
              },
              {
                "dia": "2026-09-21",
                "custo": 41.026298,
                "cliques": 131,
                "conversoes": 36,
                "impressoes": 1097
              },
              {
                "dia": "2026-09-22",
                "custo": 40.531397999999996,
                "cliques": 96,
                "conversoes": 23,
                "impressoes": 642
              },
              {
                "dia": "2026-09-23",
                "custo": 44.884138,
                "cliques": 101,
                "conversoes": 21,
                "impressoes": 596
              },
              {
                "dia": "2026-09-24",
                "custo": 0.785198,
                "cliques": 3,
                "conversoes": 0,
                "impressoes": 40
              }
            ],
            "termos": [
              {
                "custo": 10.95,
                "termo": "scanner de carro no celular",
                "cliques": 7,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 28
              },
              {
                "custo": 6.49,
                "termo": "curso mecânica automotiva grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 28
              },
              {
                "custo": 6.32,
                "termo": "mecânico online perguntas e respostas",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 12
              },
              {
                "custo": 5.91,
                "termo": "como escanear o carro pelo celular grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 32
              },
              {
                "custo": 4.74,
                "termo": "scanner do carro pelo celular",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 4.32,
                "termo": "mecânico online",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 29
              },
              {
                "custo": 4.3,
                "termo": "troca de embreagem em bh",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.6,
                "termo": "curso de mecânica automotiva gratuito",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 3.24,
                "termo": "quando a luz da injeção fica acesa",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.23,
                "termo": "mecânica 2000 manual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 4
              },
              {
                "custo": 3.21,
                "termo": "luz de injeção eletrônica acesa e não apaga",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 14
              },
              {
                "custo": 3.2,
                "termo": "ebook mecanica automotiva",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 3.16,
                "termo": "carro liga parte eletrica mas nao da partida",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.16,
                "termo": "aula de mecânica básica",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 3.06,
                "termo": "curso mecânico automotivo",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 3.02,
                "termo": "como escanear o carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 54
              },
              {
                "custo": 2.98,
                "termo": "escanear seu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 2.98,
                "termo": "scanner automotivo para celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 27
              },
              {
                "custo": 2.96,
                "termo": "mecanico online tirar duvidas",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 2.95,
                "termo": "escanear carro pelo celular android",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2.7,
                "termo": "mecanico online",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 15
              },
              {
                "custo": 2.64,
                "termo": "mecânico virtual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 2.58,
                "termo": "como escanear meu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 2.51,
                "termo": "mecânico online grátis",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2,
                "termo": "cursos de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 6
              },
              {
                "custo": 2,
                "termo": "cursos online gratuitos com certificado mecanica automotiva",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.99,
                "termo": "curso mecânico de carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 1
              },
              {
                "custo": 1.98,
                "termo": "troca de oleo de carro quanto tempo",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.97,
                "termo": "meu carro acendeu a luz do motor",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.93,
                "termo": "curso de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.9,
                "termo": "pastilha de freio",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 1.9,
                "termo": "curso de mecânico automotivo rj",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.85,
                "termo": "carro esquentando mesmo com agua no radiador",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.85,
                "termo": "curso de mecânico carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.8,
                "termo": "quando o carro não dá partida o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 1.79,
                "termo": "hilux não pega na partida",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.78,
                "termo": "quando o carro está perdendo a força o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.77,
                "termo": "como escanear um carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "carro celta falhando o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "scanner automotivo gratis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.75,
                "termo": "escanear carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.74,
                "termo": "tabela de preços de serviços mecânicos automotivos 2026",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.74,
                "termo": "como regular a marcha lenta do onix",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.73,
                "termo": "sete videocarro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "porque o carro aquece muito",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "curso de mecânica",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 16
              },
              {
                "custo": 1.69,
                "termo": "fumaça branca no escapamento do carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.69,
                "termo": "luz da pressão do óleo piscando",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "carro perde força em alta rotação",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "curso de mecânica online grátis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              }
            ],
            "contaId": "6724308347",
            "custo7d": 269.10966799999994,
            "porCampanha": [
              {
                "id": "24163300275",
                "nome": "Mentorque Lançamento",
                "canal": "SEARCH",
                "custo": 163.59,
                "status": "ENABLED",
                "cliques": 107,
                "conversoes": 5,
                "impressoes": 3239
              },
              {
                "id": "24273898063",
                "nome": "APP | Android | Instalações | BR",
                "canal": "MULTI_CHANNEL",
                "custo": 105.51966799999998,
                "status": "ENABLED",
                "cliques": 566,
                "conversoes": 97,
                "impressoes": 4885
              }
            ],
            "termosSemConversao": [
              {
                "custo": 6.32,
                "termo": "mecânico online perguntas e respostas",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 12
              },
              {
                "custo": 5.91,
                "termo": "como escanear o carro pelo celular grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 32
              },
              {
                "custo": 4.74,
                "termo": "scanner do carro pelo celular",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 4.32,
                "termo": "mecânico online",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 29
              },
              {
                "custo": 4.3,
                "termo": "troca de embreagem em bh",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.6,
                "termo": "curso de mecânica automotiva gratuito",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 3.24,
                "termo": "quando a luz da injeção fica acesa",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.21,
                "termo": "luz de injeção eletrônica acesa e não apaga",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 14
              },
              {
                "custo": 3.2,
                "termo": "ebook mecanica automotiva",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 3.16,
                "termo": "carro liga parte eletrica mas nao da partida",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.16,
                "termo": "aula de mecânica básica",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 3.06,
                "termo": "curso mecânico automotivo",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 3.02,
                "termo": "como escanear o carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 54
              },
              {
                "custo": 2.98,
                "termo": "escanear seu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 2.98,
                "termo": "scanner automotivo para celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 27
              },
              {
                "custo": 2.96,
                "termo": "mecanico online tirar duvidas",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 2.95,
                "termo": "escanear carro pelo celular android",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2.7,
                "termo": "mecanico online",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 15
              },
              {
                "custo": 2.64,
                "termo": "mecânico virtual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 2.58,
                "termo": "como escanear meu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 2.51,
                "termo": "mecânico online grátis",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2,
                "termo": "cursos online gratuitos com certificado mecanica automotiva",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.98,
                "termo": "troca de oleo de carro quanto tempo",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.97,
                "termo": "meu carro acendeu a luz do motor",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.93,
                "termo": "curso de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.9,
                "termo": "pastilha de freio",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 1.9,
                "termo": "curso de mecânico automotivo rj",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.85,
                "termo": "carro esquentando mesmo com agua no radiador",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.85,
                "termo": "curso de mecânico carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.8,
                "termo": "quando o carro não dá partida o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 1.79,
                "termo": "hilux não pega na partida",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.78,
                "termo": "quando o carro está perdendo a força o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.77,
                "termo": "como escanear um carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "carro celta falhando o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "scanner automotivo gratis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.75,
                "termo": "escanear carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.74,
                "termo": "tabela de preços de serviços mecânicos automotivos 2026",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.74,
                "termo": "como regular a marcha lenta do onix",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.73,
                "termo": "sete videocarro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "porque o carro aquece muito",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "curso de mecânica",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 16
              },
              {
                "custo": 1.69,
                "termo": "fumaça branca no escapamento do carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.69,
                "termo": "luz da pressão do óleo piscando",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "carro perde força em alta rotação",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "curso de mecânica online grátis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              }
            ]
          }
        },
        {
          "dia": "2026-09-23",
          "dados": {
            "conta": "Mentorque",
            "porDia": [
              {
                "dia": "2026-09-16",
                "custo": 27.69,
                "cliques": 19,
                "conversoes": 0,
                "impressoes": 556
              },
              {
                "dia": "2026-09-17",
                "custo": 31.3,
                "cliques": 20,
                "conversoes": 0,
                "impressoes": 749
              },
              {
                "dia": "2026-09-18",
                "custo": 29.66,
                "cliques": 20,
                "conversoes": 0,
                "impressoes": 588
              },
              {
                "dia": "2026-09-19",
                "custo": 17.9,
                "cliques": 11,
                "conversoes": 0,
                "impressoes": 494
              },
              {
                "dia": "2026-09-20",
                "custo": 63.182252,
                "cliques": 292,
                "conversoes": 23,
                "impressoes": 3930
              },
              {
                "dia": "2026-09-21",
                "custo": 42.941639,
                "cliques": 137,
                "conversoes": 36,
                "impressoes": 1117
              },
              {
                "dia": "2026-09-22",
                "custo": 41.108726000000004,
                "cliques": 97,
                "conversoes": 23,
                "impressoes": 644
              },
              {
                "dia": "2026-09-23",
                "custo": 1.596486,
                "cliques": 11,
                "conversoes": 1,
                "impressoes": 78
              }
            ],
            "termos": [
              {
                "custo": 10.95,
                "termo": "scanner de carro no celular",
                "cliques": 7,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 27
              },
              {
                "custo": 6.49,
                "termo": "curso mecânica automotiva grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 28
              },
              {
                "custo": 6.32,
                "termo": "mecânico online perguntas e respostas",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 12
              },
              {
                "custo": 5.91,
                "termo": "como escanear o carro pelo celular grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 31
              },
              {
                "custo": 4.74,
                "termo": "scanner do carro pelo celular",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 4.32,
                "termo": "mecânico online",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 29
              },
              {
                "custo": 3.6,
                "termo": "curso de mecânica automotiva gratuito",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 3.24,
                "termo": "quando a luz da injeção fica acesa",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.23,
                "termo": "mecânica 2000 manual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 4
              },
              {
                "custo": 3.21,
                "termo": "luz de injeção eletrônica acesa e não apaga",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 14
              },
              {
                "custo": 3.2,
                "termo": "ebook mecanica automotiva",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 3.16,
                "termo": "carro liga parte eletrica mas nao da partida",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.16,
                "termo": "aula de mecânica básica",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 3.06,
                "termo": "curso mecânico automotivo",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 3.02,
                "termo": "como escanear o carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 53
              },
              {
                "custo": 2.98,
                "termo": "escanear seu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 2.98,
                "termo": "scanner automotivo para celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 27
              },
              {
                "custo": 2.96,
                "termo": "mecanico online tirar duvidas",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 2.95,
                "termo": "escanear carro pelo celular android",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2.7,
                "termo": "mecanico online",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 15
              },
              {
                "custo": 2.64,
                "termo": "mecânico virtual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 2.58,
                "termo": "como escanear meu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 2.51,
                "termo": "mecânico online grátis",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2,
                "termo": "cursos de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 6
              },
              {
                "custo": 2,
                "termo": "cursos online gratuitos com certificado mecanica automotiva",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.99,
                "termo": "curso mecânico de carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 1
              },
              {
                "custo": 1.98,
                "termo": "troca de oleo de carro quanto tempo",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.97,
                "termo": "meu carro acendeu a luz do motor",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.93,
                "termo": "curso de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.9,
                "termo": "pastilha de freio",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 1.9,
                "termo": "curso de mecânico automotivo rj",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.85,
                "termo": "carro esquentando mesmo com agua no radiador",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.85,
                "termo": "curso de mecânico carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.8,
                "termo": "quando o carro não dá partida o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 1.79,
                "termo": "hilux não pega na partida",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.78,
                "termo": "quando o carro está perdendo a força o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.77,
                "termo": "como escanear um carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "carro celta falhando o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "scanner automotivo gratis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.75,
                "termo": "escanear carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.74,
                "termo": "tabela de preços de serviços mecânicos automotivos 2026",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.74,
                "termo": "como regular a marcha lenta do onix",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.73,
                "termo": "sete videocarro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "porque o carro aquece muito",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "curso de mecânica",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 16
              },
              {
                "custo": 1.69,
                "termo": "fumaça branca no escapamento do carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.69,
                "termo": "luz da pressão do óleo piscando",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "carro perde força em alta rotação",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "curso de mecânica online grátis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.67,
                "termo": "carro parou do nada o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              }
            ],
            "contaId": "6724308347",
            "custo7d": 255.37910300000001,
            "porCampanha": [
              {
                "id": "24163300275",
                "nome": "Mentorque Lançamento",
                "canal": "SEARCH",
                "custo": 171.25,
                "status": "ENABLED",
                "cliques": 113,
                "conversoes": 4,
                "impressoes": 3578
              },
              {
                "id": "24273898063",
                "nome": "APP | Android | Instalações | BR",
                "canal": "MULTI_CHANNEL",
                "custo": 84.129103,
                "status": "ENABLED",
                "cliques": 494,
                "conversoes": 79,
                "impressoes": 4578
              }
            ],
            "termosSemConversao": [
              {
                "custo": 6.32,
                "termo": "mecânico online perguntas e respostas",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 12
              },
              {
                "custo": 5.91,
                "termo": "como escanear o carro pelo celular grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 31
              },
              {
                "custo": 4.74,
                "termo": "scanner do carro pelo celular",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 4.32,
                "termo": "mecânico online",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 29
              },
              {
                "custo": 3.6,
                "termo": "curso de mecânica automotiva gratuito",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 3.24,
                "termo": "quando a luz da injeção fica acesa",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.21,
                "termo": "luz de injeção eletrônica acesa e não apaga",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 14
              },
              {
                "custo": 3.2,
                "termo": "ebook mecanica automotiva",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 3.16,
                "termo": "carro liga parte eletrica mas nao da partida",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.16,
                "termo": "aula de mecânica básica",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 3.06,
                "termo": "curso mecânico automotivo",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 3.02,
                "termo": "como escanear o carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 53
              },
              {
                "custo": 2.98,
                "termo": "escanear seu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 2.98,
                "termo": "scanner automotivo para celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 27
              },
              {
                "custo": 2.96,
                "termo": "mecanico online tirar duvidas",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 2.95,
                "termo": "escanear carro pelo celular android",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2.7,
                "termo": "mecanico online",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 15
              },
              {
                "custo": 2.64,
                "termo": "mecânico virtual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 2.58,
                "termo": "como escanear meu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 2.51,
                "termo": "mecânico online grátis",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2,
                "termo": "cursos online gratuitos com certificado mecanica automotiva",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.98,
                "termo": "troca de oleo de carro quanto tempo",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.97,
                "termo": "meu carro acendeu a luz do motor",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.93,
                "termo": "curso de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.9,
                "termo": "pastilha de freio",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 1.9,
                "termo": "curso de mecânico automotivo rj",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.85,
                "termo": "carro esquentando mesmo com agua no radiador",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.85,
                "termo": "curso de mecânico carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.8,
                "termo": "quando o carro não dá partida o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 1.79,
                "termo": "hilux não pega na partida",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.78,
                "termo": "quando o carro está perdendo a força o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.77,
                "termo": "como escanear um carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "carro celta falhando o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "scanner automotivo gratis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.75,
                "termo": "escanear carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.74,
                "termo": "tabela de preços de serviços mecânicos automotivos 2026",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.74,
                "termo": "como regular a marcha lenta do onix",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.73,
                "termo": "sete videocarro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "porque o carro aquece muito",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "curso de mecânica",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 16
              },
              {
                "custo": 1.69,
                "termo": "fumaça branca no escapamento do carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.69,
                "termo": "luz da pressão do óleo piscando",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "carro perde força em alta rotação",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "curso de mecânica online grátis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.67,
                "termo": "carro parou do nada o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              }
            ]
          }
        },
        {
          "dia": "2026-09-22",
          "dados": {
            "conta": "Mentorque",
            "porDia": [
              {
                "dia": "2026-09-15",
                "custo": 30.19,
                "cliques": 20,
                "conversoes": 0,
                "impressoes": 788
              },
              {
                "dia": "2026-09-16",
                "custo": 27.69,
                "cliques": 19,
                "conversoes": 0,
                "impressoes": 556
              },
              {
                "dia": "2026-09-17",
                "custo": 32.76,
                "cliques": 21,
                "conversoes": 0,
                "impressoes": 749
              },
              {
                "dia": "2026-09-18",
                "custo": 29.66,
                "cliques": 20,
                "conversoes": 0,
                "impressoes": 588
              },
              {
                "dia": "2026-09-19",
                "custo": 17.9,
                "cliques": 11,
                "conversoes": 0,
                "impressoes": 494
              },
              {
                "dia": "2026-09-20",
                "custo": 63.183954,
                "cliques": 292,
                "conversoes": 24,
                "impressoes": 3934
              },
              {
                "dia": "2026-09-21",
                "custo": 42.980458,
                "cliques": 138,
                "conversoes": 35,
                "impressoes": 1117
              },
              {
                "dia": "2026-09-22",
                "custo": 3.873112,
                "cliques": 8,
                "conversoes": 1,
                "impressoes": 42
              }
            ],
            "termos": [
              {
                "custo": 9.46,
                "termo": "scanner de carro no celular",
                "cliques": 6,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 26
              },
              {
                "custo": 6.49,
                "termo": "curso mecânica automotiva grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 28
              },
              {
                "custo": 6.32,
                "termo": "mecânico online perguntas e respostas",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 12
              },
              {
                "custo": 5.91,
                "termo": "como escanear o carro pelo celular grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 29
              },
              {
                "custo": 4.74,
                "termo": "scanner do carro pelo celular",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 4.32,
                "termo": "mecânico online",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 29
              },
              {
                "custo": 3.6,
                "termo": "curso de mecânica automotiva gratuito",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 3.24,
                "termo": "quando a luz da injeção fica acesa",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.23,
                "termo": "mecânica 2000 manual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 4
              },
              {
                "custo": 3.21,
                "termo": "luz de injeção eletrônica acesa e não apaga",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 13
              },
              {
                "custo": 3.2,
                "termo": "ebook mecanica automotiva",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 3.16,
                "termo": "carro liga parte eletrica mas nao da partida",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.16,
                "termo": "aula de mecânica básica",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 3.06,
                "termo": "curso mecânico automotivo",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 3.02,
                "termo": "como escanear o carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 50
              },
              {
                "custo": 2.98,
                "termo": "escanear seu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 2.98,
                "termo": "scanner automotivo para celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 27
              },
              {
                "custo": 2.96,
                "termo": "mecanico online tirar duvidas",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 2.95,
                "termo": "escanear carro pelo celular android",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 2.7,
                "termo": "mecanico online",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 15
              },
              {
                "custo": 2.64,
                "termo": "mecânico virtual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 2.58,
                "termo": "como escanear meu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 2.51,
                "termo": "mecânico online grátis",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2,
                "termo": "cursos de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 6
              },
              {
                "custo": 2,
                "termo": "cursos online gratuitos com certificado mecanica automotiva",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.99,
                "termo": "curso mecânico de carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 1
              },
              {
                "custo": 1.98,
                "termo": "troca de oleo de carro quanto tempo",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.97,
                "termo": "meu carro acendeu a luz do motor",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.93,
                "termo": "curso de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.9,
                "termo": "pastilha de freio",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 1.9,
                "termo": "curso de mecânico automotivo rj",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.85,
                "termo": "carro esquentando mesmo com agua no radiador",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.85,
                "termo": "curso de mecânico carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.8,
                "termo": "quando o carro não dá partida o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 1.79,
                "termo": "hilux não pega na partida",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.78,
                "termo": "quando o carro está perdendo a força o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.77,
                "termo": "como escanear um carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "carro celta falhando o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "scanner automotivo gratis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.75,
                "termo": "escanear carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.74,
                "termo": "tabela de preços de serviços mecânicos automotivos 2026",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.74,
                "termo": "como regular a marcha lenta do onix",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.73,
                "termo": "sete videocarro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "porque o carro aquece muito",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "curso de mecânica",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 16
              },
              {
                "custo": 1.69,
                "termo": "fumaça branca no escapamento do carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.69,
                "termo": "luz da pressão do óleo piscando",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "carro perde força em alta rotação",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "curso de mecânica online grátis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.67,
                "termo": "carro parou do nada o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              }
            ],
            "contaId": "6724308347",
            "custo7d": 248.23752399999998,
            "porCampanha": [
              {
                "id": "24163300275",
                "nome": "Mentorque Lançamento",
                "canal": "SEARCH",
                "custo": 183.73999999999998,
                "status": "ENABLED",
                "cliques": 121,
                "conversoes": 1,
                "impressoes": 4019
              },
              {
                "id": "24273898063",
                "nome": "APP | Android | Instalações | BR",
                "canal": "MULTI_CHANNEL",
                "custo": 64.497524,
                "status": "ENABLED",
                "cliques": 408,
                "conversoes": 59,
                "impressoes": 4249
              }
            ],
            "termosSemConversao": [
              {
                "custo": 9.46,
                "termo": "scanner de carro no celular",
                "cliques": 6,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 26
              },
              {
                "custo": 6.32,
                "termo": "mecânico online perguntas e respostas",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 12
              },
              {
                "custo": 5.91,
                "termo": "como escanear o carro pelo celular grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 29
              },
              {
                "custo": 4.74,
                "termo": "scanner do carro pelo celular",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 4.32,
                "termo": "mecânico online",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 29
              },
              {
                "custo": 3.6,
                "termo": "curso de mecânica automotiva gratuito",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 3.24,
                "termo": "quando a luz da injeção fica acesa",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.21,
                "termo": "luz de injeção eletrônica acesa e não apaga",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 13
              },
              {
                "custo": 3.2,
                "termo": "ebook mecanica automotiva",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 3.16,
                "termo": "carro liga parte eletrica mas nao da partida",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.16,
                "termo": "aula de mecânica básica",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 3.06,
                "termo": "curso mecânico automotivo",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 3.02,
                "termo": "como escanear o carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 50
              },
              {
                "custo": 2.98,
                "termo": "escanear seu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 2.98,
                "termo": "scanner automotivo para celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 27
              },
              {
                "custo": 2.96,
                "termo": "mecanico online tirar duvidas",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 2.95,
                "termo": "escanear carro pelo celular android",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 2.7,
                "termo": "mecanico online",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 15
              },
              {
                "custo": 2.64,
                "termo": "mecânico virtual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 2.58,
                "termo": "como escanear meu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 2.51,
                "termo": "mecânico online grátis",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2,
                "termo": "cursos online gratuitos com certificado mecanica automotiva",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.98,
                "termo": "troca de oleo de carro quanto tempo",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.97,
                "termo": "meu carro acendeu a luz do motor",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.93,
                "termo": "curso de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.9,
                "termo": "pastilha de freio",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 1.9,
                "termo": "curso de mecânico automotivo rj",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.85,
                "termo": "carro esquentando mesmo com agua no radiador",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.85,
                "termo": "curso de mecânico carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.8,
                "termo": "quando o carro não dá partida o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 1.79,
                "termo": "hilux não pega na partida",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.78,
                "termo": "quando o carro está perdendo a força o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.77,
                "termo": "como escanear um carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "carro celta falhando o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "scanner automotivo gratis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.75,
                "termo": "escanear carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.74,
                "termo": "tabela de preços de serviços mecânicos automotivos 2026",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.74,
                "termo": "como regular a marcha lenta do onix",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.73,
                "termo": "sete videocarro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "porque o carro aquece muito",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "curso de mecânica",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 16
              },
              {
                "custo": 1.69,
                "termo": "fumaça branca no escapamento do carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.69,
                "termo": "luz da pressão do óleo piscando",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "carro perde força em alta rotação",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "curso de mecânica online grátis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.67,
                "termo": "carro parou do nada o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              }
            ]
          }
        },
        {
          "dia": "2026-09-21",
          "dados": {
            "conta": "Mentorque",
            "porDia": [
              {
                "dia": "2026-09-14",
                "custo": 30,
                "cliques": 21,
                "conversoes": 0,
                "impressoes": 693
              },
              {
                "dia": "2026-09-15",
                "custo": 30.19,
                "cliques": 20,
                "conversoes": 0,
                "impressoes": 788
              },
              {
                "dia": "2026-09-16",
                "custo": 27.69,
                "cliques": 19,
                "conversoes": 0,
                "impressoes": 556
              },
              {
                "dia": "2026-09-17",
                "custo": 32.76,
                "cliques": 21,
                "conversoes": 0,
                "impressoes": 749
              },
              {
                "dia": "2026-09-18",
                "custo": 29.66,
                "cliques": 20,
                "conversoes": 0,
                "impressoes": 588
              },
              {
                "dia": "2026-09-19",
                "custo": 17.9,
                "cliques": 11,
                "conversoes": 0,
                "impressoes": 494
              },
              {
                "dia": "2026-09-20",
                "custo": 63.183954,
                "cliques": 292,
                "conversoes": 24,
                "impressoes": 3934
              },
              {
                "dia": "2026-09-21",
                "custo": 5.541361,
                "cliques": 23,
                "conversoes": 9,
                "impressoes": 177
              }
            ],
            "termos": [
              {
                "custo": 9.46,
                "termo": "scanner de carro no celular",
                "cliques": 6,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 23
              },
              {
                "custo": 6.49,
                "termo": "curso mecânica automotiva grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 27
              },
              {
                "custo": 6.32,
                "termo": "mecânico online perguntas e respostas",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 12
              },
              {
                "custo": 5.91,
                "termo": "como escanear o carro pelo celular grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 29
              },
              {
                "custo": 4.74,
                "termo": "scanner do carro pelo celular",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 4.32,
                "termo": "mecânico online",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 29
              },
              {
                "custo": 3.6,
                "termo": "curso de mecânica automotiva gratuito",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 3.24,
                "termo": "quando a luz da injeção fica acesa",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.23,
                "termo": "mecânica 2000 manual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 4
              },
              {
                "custo": 3.21,
                "termo": "luz de injeção eletrônica acesa e não apaga",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 13
              },
              {
                "custo": 3.2,
                "termo": "ebook mecanica automotiva",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 3.16,
                "termo": "carro liga parte eletrica mas nao da partida",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.16,
                "termo": "aula de mecânica básica",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 3.06,
                "termo": "curso mecânico automotivo",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 2.98,
                "termo": "escanear seu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 2.98,
                "termo": "scanner automotivo para celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 27
              },
              {
                "custo": 2.96,
                "termo": "mecanico online tirar duvidas",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 2.95,
                "termo": "escanear carro pelo celular android",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 2.7,
                "termo": "mecanico online",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 15
              },
              {
                "custo": 2.64,
                "termo": "mecânico virtual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 2.58,
                "termo": "como escanear meu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 2.51,
                "termo": "mecânico online grátis",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2,
                "termo": "cursos de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 6
              },
              {
                "custo": 2,
                "termo": "cursos online gratuitos com certificado mecanica automotiva",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.99,
                "termo": "curso mecânico de carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 1
              },
              {
                "custo": 1.98,
                "termo": "troca de oleo de carro quanto tempo",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.97,
                "termo": "meu carro acendeu a luz do motor",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.93,
                "termo": "curso de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.9,
                "termo": "pastilha de freio",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 1.9,
                "termo": "curso de mecânico automotivo rj",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.85,
                "termo": "carro esquentando mesmo com agua no radiador",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.85,
                "termo": "curso de mecânico carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.8,
                "termo": "quando o carro não dá partida o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 1.79,
                "termo": "hilux não pega na partida",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.78,
                "termo": "quando o carro está perdendo a força o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.77,
                "termo": "como escanear um carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "carro celta falhando o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "scanner automotivo gratis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.75,
                "termo": "escanear carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.74,
                "termo": "tabela de preços de serviços mecânicos automotivos 2026",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.74,
                "termo": "como regular a marcha lenta do onix",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.73,
                "termo": "sete videocarro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "porque o carro aquece muito",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "curso de mecânica",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 16
              },
              {
                "custo": 1.69,
                "termo": "fumaça branca no escapamento do carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.69,
                "termo": "luz da pressão do óleo piscando",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "carro perde força em alta rotação",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "curso de mecânica online grátis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.67,
                "termo": "carro parou do nada o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.65,
                "termo": "como escanear o carro pelo celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 49
              }
            ],
            "contaId": "6724308347",
            "custo7d": 236.92531499999998,
            "porCampanha": [
              {
                "id": "24163300275",
                "nome": "Mentorque Lançamento",
                "canal": "SEARCH",
                "custo": 192.62999999999997,
                "status": "ENABLED",
                "cliques": 128,
                "conversoes": 1,
                "impressoes": 4360
              },
              {
                "id": "24273898063",
                "nome": "APP | Android | Instalações | BR",
                "canal": "MULTI_CHANNEL",
                "custo": 44.295315,
                "status": "ENABLED",
                "cliques": 299,
                "conversoes": 32,
                "impressoes": 3619
              }
            ],
            "termosSemConversao": [
              {
                "custo": 9.46,
                "termo": "scanner de carro no celular",
                "cliques": 6,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 23
              },
              {
                "custo": 6.32,
                "termo": "mecânico online perguntas e respostas",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 12
              },
              {
                "custo": 5.91,
                "termo": "como escanear o carro pelo celular grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 29
              },
              {
                "custo": 4.74,
                "termo": "scanner do carro pelo celular",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 4.32,
                "termo": "mecânico online",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 29
              },
              {
                "custo": 3.6,
                "termo": "curso de mecânica automotiva gratuito",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 3.24,
                "termo": "quando a luz da injeção fica acesa",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.21,
                "termo": "luz de injeção eletrônica acesa e não apaga",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 13
              },
              {
                "custo": 3.2,
                "termo": "ebook mecanica automotiva",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 3.16,
                "termo": "carro liga parte eletrica mas nao da partida",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.16,
                "termo": "aula de mecânica básica",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 3.06,
                "termo": "curso mecânico automotivo",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 2.98,
                "termo": "escanear seu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 2.98,
                "termo": "scanner automotivo para celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 27
              },
              {
                "custo": 2.96,
                "termo": "mecanico online tirar duvidas",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 7
              },
              {
                "custo": 2.95,
                "termo": "escanear carro pelo celular android",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 2.7,
                "termo": "mecanico online",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 15
              },
              {
                "custo": 2.64,
                "termo": "mecânico virtual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 2.58,
                "termo": "como escanear meu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 2.51,
                "termo": "mecânico online grátis",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2,
                "termo": "cursos online gratuitos com certificado mecanica automotiva",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.98,
                "termo": "troca de oleo de carro quanto tempo",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.97,
                "termo": "meu carro acendeu a luz do motor",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.93,
                "termo": "curso de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.9,
                "termo": "pastilha de freio",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 1.9,
                "termo": "curso de mecânico automotivo rj",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.85,
                "termo": "carro esquentando mesmo com agua no radiador",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.85,
                "termo": "curso de mecânico carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.8,
                "termo": "quando o carro não dá partida o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 1.79,
                "termo": "hilux não pega na partida",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.78,
                "termo": "quando o carro está perdendo a força o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.77,
                "termo": "como escanear um carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "carro celta falhando o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "scanner automotivo gratis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.75,
                "termo": "escanear carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.74,
                "termo": "tabela de preços de serviços mecânicos automotivos 2026",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.74,
                "termo": "como regular a marcha lenta do onix",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.73,
                "termo": "sete videocarro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "porque o carro aquece muito",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "curso de mecânica",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 16
              },
              {
                "custo": 1.69,
                "termo": "fumaça branca no escapamento do carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.69,
                "termo": "luz da pressão do óleo piscando",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "carro perde força em alta rotação",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "curso de mecânica online grátis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.67,
                "termo": "carro parou do nada o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.65,
                "termo": "como escanear o carro pelo celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 49
              }
            ]
          }
        },
        {
          "dia": "2026-09-20",
          "dados": {
            "conta": "Mentorque",
            "porDia": [
              {
                "dia": "2026-09-13",
                "custo": 31.13,
                "cliques": 22,
                "conversoes": 0,
                "impressoes": 555
              },
              {
                "dia": "2026-09-14",
                "custo": 30,
                "cliques": 21,
                "conversoes": 0,
                "impressoes": 693
              },
              {
                "dia": "2026-09-15",
                "custo": 30.19,
                "cliques": 20,
                "conversoes": 0,
                "impressoes": 788
              },
              {
                "dia": "2026-09-16",
                "custo": 30.26,
                "cliques": 21,
                "conversoes": 0,
                "impressoes": 556
              },
              {
                "dia": "2026-09-17",
                "custo": 32.76,
                "cliques": 21,
                "conversoes": 0,
                "impressoes": 749
              },
              {
                "dia": "2026-09-18",
                "custo": 29.66,
                "cliques": 20,
                "conversoes": 0,
                "impressoes": 588
              },
              {
                "dia": "2026-09-19",
                "custo": 17.9,
                "cliques": 11,
                "conversoes": 0,
                "impressoes": 494
              },
              {
                "dia": "2026-09-20",
                "custo": 1.9756390000000001,
                "cliques": 1,
                "conversoes": 0,
                "impressoes": 70
              }
            ],
            "termos": [
              {
                "custo": 9.46,
                "termo": "scanner de carro no celular",
                "cliques": 6,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 23
              },
              {
                "custo": 6.32,
                "termo": "mecânico online perguntas e respostas",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 12
              },
              {
                "custo": 5.91,
                "termo": "como escanear o carro pelo celular grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 29
              },
              {
                "custo": 5.04,
                "termo": "curso mecânica automotiva grátis",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 25
              },
              {
                "custo": 4.74,
                "termo": "scanner do carro pelo celular",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 4.32,
                "termo": "mecânico online",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 29
              },
              {
                "custo": 3.6,
                "termo": "curso de mecânica automotiva gratuito",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 3.24,
                "termo": "quando a luz da injeção fica acesa",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.23,
                "termo": "mecânica 2000 manual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 4
              },
              {
                "custo": 3.21,
                "termo": "luz de injeção eletrônica acesa e não apaga",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 13
              },
              {
                "custo": 3.2,
                "termo": "ebook mecanica automotiva",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 3.16,
                "termo": "carro liga parte eletrica mas nao da partida",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.16,
                "termo": "aula de mecânica básica",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 3.06,
                "termo": "curso mecânico automotivo",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 2.98,
                "termo": "escanear seu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 2.98,
                "termo": "scanner automotivo para celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 26
              },
              {
                "custo": 2.95,
                "termo": "escanear carro pelo celular android",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 2.7,
                "termo": "mecanico online",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 15
              },
              {
                "custo": 2.64,
                "termo": "mecânico virtual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 2.58,
                "termo": "como escanear meu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 2.51,
                "termo": "mecânico online grátis",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2,
                "termo": "cursos de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 6
              },
              {
                "custo": 2,
                "termo": "cursos online gratuitos com certificado mecanica automotiva",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.99,
                "termo": "curso mecânico de carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 1,
                "impressoes": 1
              },
              {
                "custo": 1.98,
                "termo": "troca de oleo de carro quanto tempo",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.97,
                "termo": "meu carro acendeu a luz do motor",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.93,
                "termo": "curso de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.9,
                "termo": "pastilha de freio",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 1.9,
                "termo": "curso de mecânico automotivo rj",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.85,
                "termo": "carro esquentando mesmo com agua no radiador",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.85,
                "termo": "curso de mecânico carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.8,
                "termo": "quando o carro não dá partida o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 1.79,
                "termo": "hilux não pega na partida",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.78,
                "termo": "quando o carro está perdendo a força o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.77,
                "termo": "como escanear um carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "carro celta falhando o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "scanner automotivo gratis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.75,
                "termo": "escanear carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.74,
                "termo": "tabela de preços de serviços mecânicos automotivos 2026",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.73,
                "termo": "sete videocarro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "porque o carro aquece muito",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "curso de mecânica",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 14
              },
              {
                "custo": 1.69,
                "termo": "fumaça branca no escapamento do carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.69,
                "termo": "luz da pressão do óleo piscando",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "carro perde força em alta rotação",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "curso de mecânica online grátis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.67,
                "termo": "carro parou do nada o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.65,
                "termo": "como escanear o carro pelo celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 47
              },
              {
                "custo": 1.65,
                "termo": "haynespro app",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.65,
                "termo": "quando a luz do óleo acendeu no painel o que significa",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              }
            ],
            "contaId": "6724308347",
            "custo7d": 203.875639,
            "porCampanha": [
              {
                "id": "24163300275",
                "nome": "Mentorque Lançamento",
                "canal": "SEARCH",
                "custo": 203.71,
                "status": "ENABLED",
                "cliques": 137,
                "conversoes": 0,
                "impressoes": 4463
              },
              {
                "id": "24273898063",
                "nome": "APP | Android | Instalações | BR",
                "canal": "MULTI_CHANNEL",
                "custo": 0.165639,
                "status": "ENABLED",
                "cliques": 0,
                "conversoes": 0,
                "impressoes": 30
              }
            ],
            "termosSemConversao": [
              {
                "custo": 9.46,
                "termo": "scanner de carro no celular",
                "cliques": 6,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 23
              },
              {
                "custo": 6.32,
                "termo": "mecânico online perguntas e respostas",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 12
              },
              {
                "custo": 5.91,
                "termo": "como escanear o carro pelo celular grátis",
                "cliques": 4,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 29
              },
              {
                "custo": 5.04,
                "termo": "curso mecânica automotiva grátis",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 25
              },
              {
                "custo": 4.74,
                "termo": "scanner do carro pelo celular",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 4.32,
                "termo": "mecânico online",
                "cliques": 3,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 29
              },
              {
                "custo": 3.6,
                "termo": "curso de mecânica automotiva gratuito",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 3.24,
                "termo": "quando a luz da injeção fica acesa",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.21,
                "termo": "luz de injeção eletrônica acesa e não apaga",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 13
              },
              {
                "custo": 3.2,
                "termo": "ebook mecanica automotiva",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 3.16,
                "termo": "carro liga parte eletrica mas nao da partida",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 3.16,
                "termo": "aula de mecânica básica",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 3.06,
                "termo": "curso mecânico automotivo",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 2.98,
                "termo": "escanear seu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 2.98,
                "termo": "scanner automotivo para celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 26
              },
              {
                "custo": 2.95,
                "termo": "escanear carro pelo celular android",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 2.7,
                "termo": "mecanico online",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 15
              },
              {
                "custo": 2.64,
                "termo": "mecânico virtual",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 2.58,
                "termo": "como escanear meu carro pelo celular",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 2.51,
                "termo": "mecânico online grátis",
                "cliques": 2,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 8
              },
              {
                "custo": 2,
                "termo": "cursos online gratuitos com certificado mecanica automotiva",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.98,
                "termo": "troca de oleo de carro quanto tempo",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.97,
                "termo": "meu carro acendeu a luz do motor",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.93,
                "termo": "curso de mecanica de carros",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.9,
                "termo": "pastilha de freio",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 6
              },
              {
                "custo": 1.9,
                "termo": "curso de mecânico automotivo rj",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 4
              },
              {
                "custo": 1.85,
                "termo": "carro esquentando mesmo com agua no radiador",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.85,
                "termo": "curso de mecânico carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.8,
                "termo": "quando o carro não dá partida o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 9
              },
              {
                "custo": 1.79,
                "termo": "hilux não pega na partida",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.78,
                "termo": "quando o carro está perdendo a força o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.77,
                "termo": "como escanear um carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "carro celta falhando o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.76,
                "termo": "scanner automotivo gratis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.75,
                "termo": "escanear carro com celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.74,
                "termo": "tabela de preços de serviços mecânicos automotivos 2026",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.73,
                "termo": "sete videocarro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "porque o carro aquece muito",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.71,
                "termo": "curso de mecânica",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 14
              },
              {
                "custo": 1.69,
                "termo": "fumaça branca no escapamento do carro",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 5
              },
              {
                "custo": 1.69,
                "termo": "luz da pressão do óleo piscando",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "carro perde força em alta rotação",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.68,
                "termo": "curso de mecânica online grátis",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 3
              },
              {
                "custo": 1.67,
                "termo": "carro parou do nada o que pode ser",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              },
              {
                "custo": 1.65,
                "termo": "como escanear o carro pelo celular",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 47
              },
              {
                "custo": 1.65,
                "termo": "haynespro app",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 1
              },
              {
                "custo": 1.65,
                "termo": "quando a luz do óleo acendeu no painel o que significa",
                "cliques": 1,
                "campanha": "Mentorque Lançamento",
                "conversoes": 0,
                "impressoes": 2
              }
            ]
          }
        }
      ],
      "app_store_downloads": [
        {
          "dia": "2026-09-30",
          "dados": {
            "dia": "2026-09-28",
            "atualizacoes": 2,
            "downloadsApp": 1,
            "unidadesPorTipo": {
              "1F": 1,
              "7F": 2
            }
          }
        },
        {
          "dia": "2026-09-29",
          "dados": {
            "dia": "2026-09-27",
            "atualizacoes": 2,
            "downloadsApp": 2,
            "unidadesPorTipo": {
              "1F": 2,
              "7F": 2
            }
          }
        },
        {
          "dia": "2026-09-28",
          "dados": {
            "dia": "2026-09-26",
            "atualizacoes": 0,
            "downloadsApp": 1,
            "unidadesPorTipo": {
              "1F": 1
            }
          }
        },
        {
          "dia": "2026-09-27",
          "dados": {
            "dia": "2026-09-25",
            "atualizacoes": 9,
            "downloadsApp": 1,
            "unidadesPorTipo": {
              "1F": 1,
              "7F": 9
            }
          }
        },
        {
          "dia": "2026-09-26",
          "dados": {
            "dia": "2026-09-24",
            "atualizacoes": 6,
            "downloadsApp": 1,
            "unidadesPorTipo": {
              "1F": 1,
              "7F": 6
            }
          }
        },
        {
          "dia": "2026-09-25",
          "dados": {
            "dia": "2026-09-23",
            "nota": "sem transacoes na App Store no dia (a Apple nao gera relatorio quando nao ha nenhuma; exclui TestFlight)",
            "atualizacoes": 0,
            "downloadsApp": 0
          }
        },
        {
          "dia": "2026-09-24",
          "dados": {
            "dia": "2026-09-22",
            "nota": "sem transacoes na App Store no dia (a Apple nao gera relatorio quando nao ha nenhuma; exclui TestFlight)",
            "atualizacoes": 0,
            "downloadsApp": 0
          }
        },
        {
          "dia": "2026-09-23",
          "dados": {
            "dia": "2026-09-21",
            "nota": "sem transacoes na App Store no dia (a Apple nao gera relatorio quando nao ha nenhuma; exclui TestFlight)",
            "atualizacoes": 0,
            "downloadsApp": 0
          }
        },
        {
          "dia": "2026-09-22",
          "dados": {
            "dia": "2026-09-20",
            "atualizacoes": 0,
            "downloadsApp": 3,
            "unidadesPorTipo": {
              "1F": 3
            }
          }
        },
        {
          "dia": "2026-09-21",
          "dados": {
            "dia": "2026-09-19",
            "atualizacoes": 2,
            "downloadsApp": 1,
            "unidadesPorTipo": {
              "1F": 1,
              "7F": 2
            }
          }
        },
        {
          "dia": "2026-09-20",
          "dados": {
            "dia": "2026-09-18",
            "atualizacoes": 6,
            "downloadsApp": 1,
            "unidadesPorTipo": {
              "1F": 1,
              "7F": 6
            }
          }
        }
      ],
      "app_store_connect": [
        {
          "dia": "2026-09-30",
          "dados": {
            "versoes": [
              {
                "estado": "WAITING_FOR_REVIEW",
                "versao": "2.9",
                "criadaEm": "2026-09-28T08:20:34-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.8",
                "criadaEm": "2026-09-24T03:55:45-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.7",
                "criadaEm": "2026-09-17T09:06:08-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.6",
                "criadaEm": "2026-09-16T03:41:57-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.5",
                "criadaEm": "2026-09-13T11:20:33-07:00"
              }
            ]
          }
        },
        {
          "dia": "2026-09-29",
          "dados": {
            "versoes": [
              {
                "estado": "READY_FOR_REVIEW",
                "versao": "2.9",
                "criadaEm": "2026-09-28T08:20:34-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.8",
                "criadaEm": "2026-09-24T03:55:45-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.7",
                "criadaEm": "2026-09-17T09:06:08-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.6",
                "criadaEm": "2026-09-16T03:41:57-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.5",
                "criadaEm": "2026-09-13T11:20:33-07:00"
              }
            ]
          }
        },
        {
          "dia": "2026-09-28",
          "dados": {
            "versoes": [
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.8",
                "criadaEm": "2026-09-24T03:55:45-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.7",
                "criadaEm": "2026-09-17T09:06:08-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.6",
                "criadaEm": "2026-09-16T03:41:57-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.5",
                "criadaEm": "2026-09-13T11:20:33-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.4",
                "criadaEm": "2026-09-12T04:10:51-07:00"
              }
            ]
          }
        },
        {
          "dia": "2026-09-27",
          "dados": {
            "versoes": [
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.8",
                "criadaEm": "2026-09-24T03:55:45-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.7",
                "criadaEm": "2026-09-17T09:06:08-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.6",
                "criadaEm": "2026-09-16T03:41:57-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.5",
                "criadaEm": "2026-09-13T11:20:33-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.4",
                "criadaEm": "2026-09-12T04:10:51-07:00"
              }
            ]
          }
        },
        {
          "dia": "2026-09-26",
          "dados": {
            "versoes": [
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.8",
                "criadaEm": "2026-09-24T03:55:45-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.7",
                "criadaEm": "2026-09-17T09:06:08-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.6",
                "criadaEm": "2026-09-16T03:41:57-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.5",
                "criadaEm": "2026-09-13T11:20:33-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.4",
                "criadaEm": "2026-09-12T04:10:51-07:00"
              }
            ]
          }
        },
        {
          "dia": "2026-09-25",
          "dados": {
            "versoes": [
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.8",
                "criadaEm": "2026-09-24T03:55:45-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.7",
                "criadaEm": "2026-09-17T09:06:08-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.6",
                "criadaEm": "2026-09-16T03:41:57-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.5",
                "criadaEm": "2026-09-13T11:20:33-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.4",
                "criadaEm": "2026-09-12T04:10:51-07:00"
              }
            ]
          }
        },
        {
          "dia": "2026-09-24",
          "dados": {
            "versoes": [
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.7",
                "criadaEm": "2026-09-17T09:06:08-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.6",
                "criadaEm": "2026-09-16T03:41:57-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.5",
                "criadaEm": "2026-09-13T11:20:33-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.4",
                "criadaEm": "2026-09-12T04:10:51-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.1",
                "criadaEm": "2026-09-09T05:35:32-07:00"
              }
            ]
          }
        },
        {
          "dia": "2026-09-23",
          "dados": {
            "versoes": [
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.7",
                "criadaEm": "2026-09-17T09:06:08-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.6",
                "criadaEm": "2026-09-16T03:41:57-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.5",
                "criadaEm": "2026-09-13T11:20:33-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.4",
                "criadaEm": "2026-09-12T04:10:51-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.1",
                "criadaEm": "2026-09-09T05:35:32-07:00"
              }
            ]
          }
        },
        {
          "dia": "2026-09-22",
          "dados": {
            "versoes": [
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.7",
                "criadaEm": "2026-09-17T09:06:08-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.6",
                "criadaEm": "2026-09-16T03:41:57-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.5",
                "criadaEm": "2026-09-13T11:20:33-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.4",
                "criadaEm": "2026-09-12T04:10:51-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.1",
                "criadaEm": "2026-09-09T05:35:32-07:00"
              }
            ]
          }
        },
        {
          "dia": "2026-09-21",
          "dados": {
            "versoes": [
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.7",
                "criadaEm": "2026-09-17T09:06:08-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.6",
                "criadaEm": "2026-09-16T03:41:57-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.5",
                "criadaEm": "2026-09-13T11:20:33-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.4",
                "criadaEm": "2026-09-12T04:10:51-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.1",
                "criadaEm": "2026-09-09T05:35:32-07:00"
              }
            ]
          }
        },
        {
          "dia": "2026-09-20",
          "dados": {
            "versoes": [
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.7",
                "criadaEm": "2026-09-17T09:06:08-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.6",
                "criadaEm": "2026-09-16T03:41:57-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.5",
                "criadaEm": "2026-09-13T11:20:33-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.4",
                "criadaEm": "2026-09-12T04:10:51-07:00"
              },
              {
                "estado": "READY_FOR_SALE",
                "versao": "2.1",
                "criadaEm": "2026-09-09T05:35:32-07:00"
              }
            ]
          }
        }
      ],
      "admob": [
        {
          "dia": "2026-09-30",
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
          "dia": "2026-09-29",
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
          "dia": "2026-09-28",
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
          "dia": "2026-09-27",
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
          "dia": "2026-09-26",
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
          "dia": "2026-09-25",
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
          "dia": "2026-09-24",
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
          "dia": "2026-09-23",
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
          "dia": "2026-09-22",
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
          "dia": "2026-09-21",
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
          "dia": "2026-09-20",
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
        }
      ]
    },
    "frescorDasFontes": [
      {
        "fonte": "admob",
        "ultimoDia": "2026-09-30",
        "diasParado": 0,
        "parada": false
      },
      {
        "fonte": "app_store_connect",
        "ultimoDia": "2026-09-30",
        "diasParado": 0,
        "parada": false
      },
      {
        "fonte": "app_store_downloads",
        "ultimoDia": "2026-09-30",
        "diasParado": 0,
        "parada": false
      },
      {
        "fonte": "google_ads",
        "ultimoDia": "2026-09-30",
        "diasParado": 0,
        "parada": false
      },
      {
        "fonte": "meta_ads",
        "ultimoDia": "2026-09-30",
        "diasParado": 0,
        "parada": false
      },
      {
        "fonte": "play_console",
        "ultimoDia": "2026-09-30",
        "diasParado": 0,
        "parada": false
      },
      {
        "fonte": "revenuecat",
        "ultimoDia": "2026-09-30",
        "diasParado": 0,
        "parada": false
      },
      {
        "fonte": "search_console",
        "ultimoDia": "2026-09-30",
        "diasParado": 0,
        "parada": false
      },
      {
        "fonte": "stripe",
        "ultimoDia": "2026-09-30",
        "diasParado": 0,
        "parada": false
      },
      {
        "fonte": "vercel",
        "ultimoDia": "2026-09-30",
        "diasParado": 0,
        "parada": false
      },
      {
        "fonte": "youtube",
        "ultimoDia": "2026-09-30",
        "diasParado": 0,
        "parada": false
      }
    ],
    "avisoDeColeta": null
  },
  "avaliacoes": {
    "total": 12,
    "media": 5,
    "porNota": {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 12
    },
    "porLoja": {
      "app_store": 7,
      "google_play": 5
    },
    "recentes": [
      {
        "loja": "app_store",
        "nota": 5,
        "titulo": "Excelente",
        "texto": "Tem me ajudado bastante, muito bom!",
        "autor": "matthewsmc0",
        "versao": "1.6"
      },
      {
        "loja": "app_store",
        "nota": 5,
        "titulo": "Aprendizado",
        "texto": "Eu não conheço nada sobre carro e mecânica, e com os videos do app tenho aprendido cada vez mais. Os conteúdos são muito interessantes para o dia a dia, exemplo, resfriar o turbo antes de desligar o motor.",
        "autor": "aminoru",
        "versao": "2.4"
      },
      {
        "loja": "app_store",
        "nota": 5,
        "titulo": "Bastante Útil",
        "texto": "Me ajudou com a Manu tem os do meu carro, consegui economizar. Muito bom para gerenciar revisões e troca de óleo e coisas do tipo.",
        "autor": "munizluiz",
        "versao": "1.7"
      },
      {
        "loja": "app_store",
        "nota": 5,
        "titulo": "Ajuda com a economia!",
        "texto": "Consegui economizar na revisão do carro graças a informação do app!",
        "autor": "Biiaes",
        "versao": "1.7"
      },
      {
        "loja": "google_play",
        "nota": 5,
        "titulo": null,
        "texto": "me fez economizar quase 40% quando tive um problema no carro. bom que é grátis para 1 carro",
        "autor": "Triplyze",
        "versao": null
      },
      {
        "loja": "google_play",
        "nota": 5,
        "titulo": null,
        "texto": "para quem gosta de melhoramento automotivo é o melhor que tem.",
        "autor": "Luiz Fernando Muniz Viana",
        "versao": null
      },
      {
        "loja": "google_play",
        "nota": 5,
        "titulo": null,
        "texto": "Ajuda a tomar decisões e ter controle de frota. Eu também uso para meu carro particular",
        "autor": "Mindmill Brasil",
        "versao": null
      },
      {
        "loja": "google_play",
        "nota": 5,
        "titulo": null,
        "texto": "usamos para gerências as manutenções e dúvidas dos carros aqui da clínica",
        "autor": "Sorriso da Pele",
        "versao": null
      },
      {
        "loja": "google_play",
        "nota": 5,
        "titulo": null,
        "texto": "Aplicativo sensacional para estudos e identificação de problemas no carro.",
        "autor": "Luana David",
        "versao": "1.7"
      },
      {
        "loja": "app_store",
        "nota": 5,
        "titulo": "Economia no bolso",
        "texto": "Descobri o Mentorque e agora tenho controle dos gastos com meu carro além de economizar na oficina por não ser enrolado. \n\nAmo esse app",
        "autor": "Moraes455",
        "versao": "1.0"
      }
    ]
  }
}
```
