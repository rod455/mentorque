# Mentorque — Imagens

> **Status (05/08/2026):** COMPLETO — 98/98 imagens instaladas.
> As 43 capas de Estudos foram substituidas pela versao v4 (mesmo estilo giz
> dos demais pacotes). As 3 avulsas chegaram. A `memories/accessory.png` foi
> recuperada separando-a da `fullTank.png`, onde as duas artes vieram na
> mesma folha. Cache-busting das capas esta em `?v=4`.

Inventário de todos os espaços do app que ainda usam **ícone de linha ou emoji**
onde deveria entrar arte. Os IDs são os nomes exatos de arquivo esperados.

## Regra geral de formato

| Onde renderiza | Exportar em | Formato |
|---|---|---|
| Slots grandes (≥ 112 px na tela) | **600 × 600** | PNG, quadrado |
| Chips pequenos (44–64 px na tela) | **256 × 256** | PNG, fundo transparente |
| Slots 16:9 | **1200 × 675** | PNG ou JPG |

- Todos os quadrados são recortados com canto arredondado + contorno dourado
  pelo próprio app. **Deixe ~8% de margem de segurança em volta da arte** — o
  arredondamento come as quinas.
- Fundo: transparente, ou o grafite do app `#16181D`.
- Paleta: âmbar `#F2A623`, teal `#0F8A66`, coral `#C24D26`, creme `#F4F2EC`.
- **Sem texto dentro da imagem** — o título já aparece embaixo.

---

## 1. Memórias — 24 imagens · `public/memories/<id>.png` · 600 × 600

Placeholder de cada conquista quando o usuário ainda não subiu foto.
Renderiza a 112 px na Home e 56 px (circular) na tela de conquistas — a arte
precisa **funcionar dentro de um círculo** também.

### Marcos automáticos (11)
| id | hoje | tema |
|---|---|---|
| `welcome` | 👋 | Bem-vindo a bordo |
| `firstCar` | 🚗 | Primeiro carro |
| `named` | 🏷️ | Batizou o carro |
| `profileDone` | 🪪 | Perfil completo |
| `firstService` | 🧾 | Primeiro registro |
| `fiveServices` | 📋 | Cinco serviços |
| `tenServices` | 🗂️ | Histórico de mestre |
| `garageFull` | 🅿️ | Garagem cheia (3 carros) |
| `supporter` | ⭐ | Apoiador Premium |
| `firstMonth` | 🗓️ | Um mês juntos |
| `firstYear` | 🎂 | Um ano juntos |

### Marcos manuais (5)
| `onTime` | ✅ | Revisão em dia |
| `streak` | 🔥 | Sequência de cuidados |
| `explorer` | 📚 | Explorador dos Estudos |
| `diagnostician` | 🔍 | Bom de diagnóstico |
| `comeback` | 🔄 | Você voltou |

### Momentos (8)
| `firstTrip` | 🛣️ | Primeira viagem |
| `roadTrip` | 🌄 | Pegou a estrada |
| `firstWash` | 🧼 | Primeira lavagem |
| `nightDrive` | 🌙 | Rolê à noite |
| `rain` | 🌧️ | Encarou a chuva |
| `sunset` | 🌅 | Pôr do sol na estrada |
| `fullTank` | ⛽ | Tanque cheio, mundo aberto |
| `accessory` | 🎁 | Primeiro upgrade |

---

## 2. Problemas comuns — 19 imagens · `public/problems/<id>.png` · 600 × 600

Renderiza a 144 px (mesmo card do "Para você"). Hoje 19 sintomas dividem
apenas 5 ícones, então os cards se repetem visualmente — é o espaço com
maior ganho.

| id | sintoma |
|---|---|
| `brake-noise` | Barulho ao frear |
| `cel` | Luz do motor acesa |
| `consumption` | Carro bebendo muito |
| `hard-start` | Dificuldade para ligar |
| `steering-vibration` | Vibração no volante |
| `suspension-noise` | Barulho na suspensão |
| `overheating` | Temperatura subindo |
| `engine-misfire` | Motor falhando / engasgando |
| `engine-power-loss` | Perda de força |
| `engine-smoke` | Fumaça no escapamento |
| `brake-soft-pedal` | Pedal de freio baixo ou mole |
| `brake-pull` | Carro puxa para um lado ao frear |
| `steering-hard` | Direção pesada ou dura |
| `suspension-bounce` | Carro balançando demais |
| `tire-uneven-wear` | Desgaste irregular dos pneus |
| `tire-pressure-loss` | Pneu perdendo pressão |
| `battery-draining` | Bateria descarregando |
| `lights-dim` | Luzes fracas ou piscando |
| `ac-not-cooling` | Ar-condicionado não gela |

> Cuidado: o card tem um ponto de severidade no canto superior esquerdo e um
> selo "Recomendado" no inferior esquerdo. Não coloque nada importante nesses
> dois cantos.

---

## 3. Ações rápidas — 4 imagens · `public/actions/<id>.png` · 256 × 256

Renderiza a 56 px, dentro de um quadrado colorido. Arte precisa ser legível
bem pequena — traço grosso, silhueta forte.

| id | rótulo | cor do fundo |
|---|---|---|
| `diagnose` | Diagnosticar | coral |
| `log-service` | Registrar serviço | teal |
| `service-plan` | Plano de revisão | âmbar |
| `learn` | Aprender | cinza claro |

---

## 4. Subsistemas — 5 imagens · `public/systems/<key>.png` · 256 × 256

Grade "Ou explore por sistema" na aba Problemas. Vou subir o chip de 44 px
para 64 px, igualando o card do Kit do motorista (que já tem imagem).

| key | rótulo |
|---|---|
| `engine` | Motor |
| `brakes` | Freios |
| `suspension` | Suspensão |
| `tires` | Pneus & Rodas |
| `electrical` | Elétrica |

*(`equipment` — Kit do motorista — já tem imagem.)*

---

## 5. Trilhas de conhecimento — 9 imagens · `public/tracks/<id>.png` · 256 × 256

Grade da aba Estudos, mesmo chip de 44 px (subir para 64 px).

| id | trilha |
|---|---|
| `fundamentals` | Fundamentos |
| `diy` | Faça Você Mesmo |
| `diagnosis` | Diagnóstico |
| `money` | Economia & Bolso |
| `brand` | Por Montadora |
| `model` | Por Modelo |
| `sports` | Esportivos |
| `culture` | Cultura & Curiosidades |
| `library` | Biblioteca completa e trilhas (hoje é um `★`) |

---

## 6. Conteúdos sem capa — 11 imagens · `public/learn/<id>.png` · 600 × 600

São as aulas de personalização criadas por último. Mesmo estilo do pacote
de capas que já subimos.

| id | aula |
|---|---|
| `trait-turbo` | Motor turbo: 5 cuidados que dobram a vida |
| `trait-cvt` | Câmbio CVT: o que preserva e o que destrói |
| `trait-dct` | Câmbio automatizado / dupla embreagem |
| `trait-ev` | Carro elétrico: manutenção do que sobra |
| `trait-diesel` | Diesel: filtro, arla e injeção |
| `trait-highkm` | Carro com km alto: o que checar |
| `trait-appuse` | Rodar de app: desgaste acelerado |
| `trait-urban` | Só trecho urbano: o que isso faz no motor |
| `sit-just-bought` | Comprei agora: os 5 primeiros passos |
| `sit-overdue` | Revisão atrasada: por onde começar |
| `sit-no-history` | Sem histórico do carro: como reconstruir |

---

## 7. Kit do motorista — 22 imagens · `public/kit/<id>.png` · 256 × 256

Lista de equipamentos, hoje 100% emoji, chip de 44 px.

**Emergência:** `spare-kit` (estepe/macaco/chave), `triangle` (triângulo),
`jumper` (chupeta), `inflator` (calibrador+compressor), `flashlight` (lanterna),
`firstaid` (primeiros socorros), `towstrap` (cabo de reboque)

**Diagnóstico:** `obd2` (scanner OBD2), `multimeter` (multímetro),
`oilgauge` (medidor de pressão de óleo)

**Ferramentas:** `sockets` (chaves e soquetes), `pliers` (alicate),
`screwdrivers` (chaves de fenda/Philips), `filterwrench` (chave de filtro),
`jackstands` (macaco + cavaletes), `torque` (torquímetro), `drainpan` (bacia)

**Consumíveis:** `spareoil` (óleo reserva), `coolant` (arrefecimento),
`wd40` (desengripante), `tape` (fita e abraçadeiras), `gloves` (luvas e panos)

---

## 8. Avulsas — 4 imagens

| arquivo | tamanho | onde |
|---|---|---|
| `public/learn/revisions.png` | 600 × 600 | Card "Próximas revisões" no carrossel "Para você" (hoje ícone de calendário) |
| `public/learn/_video-placeholder.png` | 1200 × 675 | Espaço do vídeo dentro das aulas que ainda não têm vídeo |
| `public/memories/_empty-photo.png` | 1200 × 675 | Estado vazio da foto do Momento |
| `public/badges/badge-anual.png` | 600 × 600 | Escudo dourado "ANUAL" do plano — **pendente do seu lado**, só recebi colado inline |

---

## Total: 98 imagens

| Pacote | Qtd | Tamanho |
|---|---|---|
| 1. Memórias | 24 | 600 × 600 |
| 2. Problemas comuns | 19 | 600 × 600 |
| 3. Ações rápidas | 4 | 256 × 256 |
| 4. Subsistemas | 5 | 256 × 256 |
| 5. Trilhas | 9 | 256 × 256 |
| 6. Conteúdos sem capa | 11 | 600 × 600 |
| 7. Kit do motorista | 22 | 256 × 256 |
| 8. Avulsas | 4 | variado |

## Prioridade sugerida

1. **Problemas comuns (19)** — hoje 19 cards com só 5 ícones repetidos, é o
   que mais chama atenção na Home e na aba Problemas.
2. **Conteúdos sem capa (11)** — quebram a consistência do carrossel que já
   tem capa.
3. **Memórias (24)** — muita superfície, mas o usuário só vê as conquistadas.
4. **Trilhas (9) + Subsistemas (5)** — grades de navegação.
5. **Kit (22)** — tela mais interna, menor impacto.
6. **Ações rápidas (4)** — ícones de linha funcionam bem a 56 px; é o pacote
   mais opcional.
