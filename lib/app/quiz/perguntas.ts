import type { Locale } from "@/lib/i18n";

// Banco de perguntas do quiz diário.
//
// Regras que valeram para escrever cada uma, e que precisam valer para as
// próximas:
//
//   1. NADA que dependa de carro específico. A pergunta é a mesma para todo
//      mundo no mesmo dia, e é isso que permite dizer "62% acertaram hoje".
//      Detalhe do carro da pessoa entra na explicação, nunca na pergunta.
//   2. Mito primeiro. A pergunta boa é aquela em que a maioria erra por
//      acreditar em algo que "todo mundo sabe". Trivia de decoreba (quantos
//      cilindros tem o motor X) não ensina nada e não faz ninguém voltar.
//   3. Sem número inventado. Nada de "economize 30%". Onde a faixa varia por
//      carro, o texto diz que varia.
//   4. Sem certeza mecânica absoluta. "Costuma", "na maioria dos carros".
//   5. Toda pergunta aponta para uma aula que EXISTE. É o que transforma o
//      quiz em porta de entrada do acervo em vez de um joguinho paralelo.
//   6. A explicação precisa fazer sentido sozinha, para quem errou e não vai
//      abrir a aula. É ela que entrega o valor do dia.
//
// A ordem do array é a ordem em que as perguntas saem (ver diaDoQuiz), então
// as primeiras foram escolhidas a dedo: são as que mais gente erra acreditando
// que sabe. A primeira é a que aparece dentro do onboarding.

export type Pergunta = {
  id: string;
  /** Aula que explica o assunto. Precisa existir em content.ts. */
  aula: string;
  pergunta: string;
  opcoes: string[];
  /** Índice da opção correta em `opcoes`. */
  correta: number;
  /** Explicação curta mostrada logo depois de responder. */
  porque: string;
};

export function perguntasDoQuiz(locale: Locale): Pergunta[] {
  const T = (pt: string, en: string) => (locale === "pt" ? pt : en);

  return [
    {
      id: "oleo-intervalo",
      aula: "vid-manual-habitos",
      pergunta: T("De quanto em quanto tempo se troca o óleo do motor?", "How often should you change the engine oil?"),
      opcoes: [
        T("A cada 5.000 km, sempre", "Every 5,000 km, always"),
        T("O que o manual do seu carro mandar", "Whatever your car's manual says"),
        T("A cada 6 meses, independente do km", "Every 6 months, regardless of mileage"),
      ],
      correta: 1,
      porque: T(
        "O que manda na troca de óleo é o tipo de uso do seu carro. No manual do veículo você encontra a especificação certa, baseada no seu uso. Trocar o óleo antes não faz mal, mas afeta o seu bolso.",
        "What decides the oil change is how your car is used. The manual has the right spec for your usage. Changing it sooner does no harm, but it does hit your wallet."
      ),
    },
    {
      id: "esquentar-parado",
      aula: "vid-manual-suave",
      pergunta: T("Deixar o carro esquentando parado antes de sair é bom para o motor?", "Is idling to warm up the engine before driving good for it?"),
      opcoes: [
        T("Sim, uns 5 minutos todo dia", "Yes, about 5 minutes every day"),
        T("Não, é melhor sair devagar logo", "No, it's better to just drive gently"),
        T("Só no verão", "Only in summer"),
      ],
      correta: 1,
      porque: T(
        "Aguarde de 10 a 30 segundos para a rotação do motor normalizar. Em motor com injeção eletrônica, esquentar parado só gasta combustível e demora mais para aquecer do que dirigindo. O certo é sair logo e andar suave nos primeiros minutos, sem esticar a marcha, até a temperatura normalizar.",
        "Wait 10 to 30 seconds for the engine revs to settle. On a fuel-injected engine, idling to warm up just burns fuel and heats up slower than driving does. Set off soon after and drive gently for the first minutes, without revving, until the temperature settles."
      ),
    },
    {
      id: "pastilha-chiado",
      aula: "diag-noises",
      pergunta: T("Chiado agudo ao frear normalmente é sinal de quê?", "A high-pitched squeal when braking usually means what?"),
      opcoes: [
        T("Pastilha chegando ao fim", "Brake pads near the end"),
        T("Freio novo assentando, sempre normal", "New brakes bedding in, always normal"),
        T("Problema no pneu", "A tire problem"),
      ],
      correta: 0,
      porque: T(
        "A maioria dos carros tem uma lâmina de metal na pastilha feita de propósito para chiar quando o material está acabando. É um aviso projetado, não um defeito. Pastilha nova também pode chiar por alguns dias, mas o chiado que insiste pede olhada.",
        "Most cars have a metal tab on the pad designed to squeal when the material runs low. It's a built-in warning, not a fault. New pads can squeal for a few days too, but a squeal that persists needs a look."
      ),
    },
    {
      id: "pneu-nitrogenio",
      aula: "tire-calibragem",
      pergunta: T("Calibrar o pneu com nitrogênio em vez de ar é melhor no uso de rua?", "Is filling tires with nitrogen instead of air better for street use?"),
      opcoes: [
        T("Sim, muda bastante", "Yes, it makes a big difference"),
        T("Faz pouca diferença no dia a dia", "It makes little difference day to day"),
        T("Sim, dispensa calibrar", "Yes, and you never need to check pressure again"),
      ],
      correta: 1,
      porque: T(
        "O ar que você respira já é quase 80% nitrogênio. A diferença existe em competição e em avião, onde a variação de temperatura é extrema. Na rua, o que muda de verdade a vida do pneu é calibrar com frequência, com qualquer um dos dois.",
        "The air you breathe is already almost 80% nitrogen. The difference matters in racing and aviation, where temperature swings are extreme. On the street, what actually changes tire life is checking pressure often, with either one."
      ),
    },
    {
      id: "luz-injecao-piscando",
      aula: "vid-luz-injecao-acendeu",
      pergunta: T("A luz de injeção acendeu e está PISCANDO. O que fazer?", "The check engine light came on and is FLASHING. What now?"),
      opcoes: [
        T("Seguir viagem, é só um aviso", "Keep driving, it's just a warning"),
        T("Reduzir e procurar ajuda logo", "Slow down and get help soon"),
        T("Desligar e ligar o carro para apagar", "Turn the car off and on to clear it"),
      ],
      correta: 1,
      porque: T(
        "Luz acesa fixa costuma ser algo a investigar sem desespero. Piscando é outra conversa: em geral indica falha de combustão acontecendo agora, que manda combustível não queimado para o catalisador e pode danificá-lo. Reduza a marcha e resolva logo.",
        "A steady light is usually something to look into without panic. Flashing is different: it typically means a misfire happening right now, sending unburnt fuel into the catalytic converter and risking damage. Ease off and sort it out soon."
      ),
    },
    {
      id: "etanol-70",
      aula: "vid-etanol-gasolina",
      pergunta: T("A conta dos 70% entre etanol e gasolina serve para quê?", "What is the 70% rule between ethanol and gasoline for?"),
      opcoes: [
        T("Saber qual rende mais pelo preço", "Knowing which gives more range for the price"),
        T("Saber qual tem mais potência", "Knowing which makes more power"),
        T("Saber qual suja menos o motor", "Knowing which keeps the engine cleaner"),
      ],
      correta: 0,
      porque: T(
        "A regra compara preço com rendimento: o etanol tem menos energia por litro, então rende menos, e a conta diz a partir de que preço ele compensa. Só que ela ficou menos precisa, porque a gasolina vendida hoje já vem com etanol na mistura. Serve como ponto de partida, mas a análise certa é feita carro a carro, medindo o consumo com cada combustível.",
        "The rule compares price with range: ethanol carries less energy per liter, so it goes less far, and the math says from what price it pays off. Except it got less precise, because the gasoline sold today already has ethanol blended in. Use it as a starting point, but the real answer is worked out car by car, measuring consumption on each fuel."
      ),
    },
    {
      id: "agua-radiador",
      aula: "fund-fluids",
      pergunta: T("Pode completar o radiador com água da torneira?", "Can you top up the radiator with tap water?"),
      opcoes: [
        T("Pode sempre, é a mesma coisa", "Always, it's the same thing"),
        T("Só em emergência, e trocando depois", "Only in an emergency, and replace it afterwards"),
        T("Nunca, em hipótese nenhuma", "Never, under any circumstance"),
      ],
      correta: 1,
      porque: T(
        "O fluido de arrefecimento não é só água: ele sobe o ponto de fervura, abaixa o de congelamento e protege contra corrosão. Água de torneira ainda traz minerais que incrustam. Em emergência, para não fundir o motor, completa e resolve depois na oficina.",
        "Coolant isn't just water: it raises the boiling point, lowers the freezing point and protects against corrosion. Tap water also carries minerals that scale up the system. In an emergency, to avoid cooking the engine, top it up and fix it properly later."
      ),
    },
    {
      id: "superaquecimento-tampa",
      aula: "diag-superaquecimento",
      pergunta: T("O carro ferveu. Dá para abrir a tampa do radiador na hora?", "The car overheated. Can you open the radiator cap right away?"),
      opcoes: [
        T("Sim, para aliviar a pressão", "Yes, to release the pressure"),
        T("Não, o sistema está sob pressão e queima", "No, the system is pressurized and will scald you"),
        T("Só com um pano na mão", "Only with a cloth in your hand"),
      ],
      correta: 1,
      porque: T(
        "Sistema quente está pressurizado, e abrir faz o líquido ferver de uma vez e sair no seu rosto e nas suas mãos. É uma das queimaduras mais comuns em pane de estrada. Desligue, espere esfriar de verdade, e só então olhe o nível.",
        "A hot system is pressurized, and opening it makes the fluid flash-boil into your face and hands. It's one of the most common burns in roadside breakdowns. Shut it off, let it truly cool, and only then check the level."
      ),
    },
    {
      id: "correia-vs-corrente",
      aula: "fund-systems",
      pergunta: T("Qual a diferença prática entre correia dentada e corrente de comando?", "What's the practical difference between a timing belt and a timing chain?"),
      opcoes: [
        T("Nenhuma, é só o nome", "None, just a different name"),
        T("A correia tem prazo de troca; a corrente costuma durar mais", "The belt has a replacement interval; the chain usually lasts longer"),
        T("A corrente precisa trocar todo ano", "The chain must be replaced every year"),
      ],
      correta: 1,
      porque: T(
        "A correia é de borracha e tem prazo definido pelo fabricante. Estourar costuma destruir o motor em carros onde válvula e pistão dividem espaço. A corrente é de metal e em geral é feita para durar a vida do motor, mas também desgasta e dá sinal de barulho.",
        "The belt is rubber and has a manufacturer-defined interval. Snapping usually destroys the engine on cars where valves and pistons share space. The chain is metal and generally designed to last the engine's life, but it wears too and gives itself away by noise."
      ),
    },
    {
      id: "obd2-apaga-luz",
      aula: "read-obd2",
      pergunta: T("Apagar o código com um leitor OBD2 resolve o problema?", "Does clearing the code with an OBD2 scanner fix the problem?"),
      opcoes: [
        T("Sim, o carro volta ao normal", "Yes, the car goes back to normal"),
        T("Não, só apaga o aviso", "No, it only erases the warning"),
        T("Sim, se apagar duas vezes", "Yes, if you clear it twice"),
      ],
      correta: 1,
      porque: T(
        "O código é o recado, não a doença. Apagar sem consertar faz a luz voltar assim que o carro rodar o ciclo de teste de novo. Pior: apagar antes de a oficina ler joga fora a pista que ajudaria no diagnóstico.",
        "The code is the message, not the illness. Clearing it without fixing means the light returns as soon as the car runs its test cycle again. Worse: clearing it before the shop reads it throws away the clue that would have helped."
      ),
    },
    {
      id: "pneu-pressao-onde",
      aula: "tire-calibragem",
      pergunta: T("Onde está a pressão correta dos pneus do seu carro?", "Where do you find the correct tire pressure for your car?"),
      opcoes: [
        T("Escrita na lateral do pneu", "Written on the tire's sidewall"),
        T("Na etiqueta da porta ou no manual", "On the door jamb sticker or in the manual"),
        T("É sempre 32 libras", "It's always 32 psi"),
      ],
      correta: 1,
      porque: T(
        "O número na lateral do pneu é a pressão MÁXIMA que ele suporta, não a recomendada para o seu carro. A correta vem do fabricante do veículo e costuma estar na etiqueta da coluna da porta do motorista, muitas vezes com valores diferentes para carro cheio.",
        "The number on the sidewall is the tire's MAXIMUM pressure, not the one recommended for your car. The correct one comes from the vehicle maker and is usually on the driver's door jamb sticker, often with different values for a loaded car."
      ),
    },
    {
      id: "fumaca-azul",
      aula: "diag-smells",
      pergunta: T("Fumaça azulada saindo do escapamento costuma indicar o quê?", "Bluish smoke from the exhaust usually points to what?"),
      opcoes: [
        T("Queima de óleo", "Burning oil"),
        T("Água no motor", "Water in the engine"),
        T("Excesso de combustível", "Too much fuel"),
      ],
      correta: 0,
      porque: T(
        "Azul é óleo passando para a câmara de combustão. Branca densa e com cheiro adocicado costuma ser líquido de arrefecimento, o que aponta para junta de cabeçote. Preta é mistura rica, combustível demais. A cor é a primeira pista.",
        "Blue is oil getting into the combustion chamber. Thick white with a sweet smell usually means coolant, pointing at a head gasket. Black is a rich mixture, too much fuel. Color is the first clue."
      ),
    },
    {
      id: "mancha-chao",
      aula: "diag-leaks",
      pergunta: T("Poça transparente embaixo do carro depois de usar o ar-condicionado é problema?", "A clear puddle under the car after using the A/C is a problem?"),
      opcoes: [
        T("Sim, é vazamento", "Yes, it's a leak"),
        T("Não, é a água que o ar condensa", "No, it's water the A/C condenses"),
        T("Sim, é fluido de freio", "Yes, it's brake fluid"),
      ],
      correta: 1,
      porque: T(
        "Ar-condicionado tira umidade do ar e essa água escorre por um dreno embaixo do carro. É normal e esperado. Preocupa o que tem cor e cheiro: marrom ou preto é óleo, vermelho é direção ou câmbio, verde ou laranja é arrefecimento.",
        "The A/C pulls moisture from the air and that water drains under the car. It's normal and expected. What worries is anything with color or smell: brown or black is oil, red is steering or transmission, green or orange is coolant."
      ),
    },
    {
      id: "orcamento-perguntas",
      aula: "money-quote",
      pergunta: T("A oficina passou um orçamento alto. Qual a primeira coisa a fazer?", "The shop quoted a high price. What's the first thing to do?"),
      opcoes: [
        T("Aceitar, eles entendem do assunto", "Accept it, they know the subject"),
        T("Pedir para detalhar peça e mão de obra", "Ask them to itemize parts and labor"),
        T("Reclamar do preço na hora", "Complain about the price on the spot"),
      ],
      correta: 1,
      porque: T(
        "Orçamento detalhado separa o que é peça do que é serviço e revela onde está o valor. Também facilita comparar com outra oficina no mesmo padrão. Pedir detalhe não é desconfiança, é o que qualquer oficina séria já faz sem você pedir.",
        "An itemized quote separates parts from labor and shows where the money is. It also makes comparing with another shop meaningful. Asking for detail isn't distrust, it's what any serious shop already does unprompted."
      ),
    },
    {
      id: "turbo-desligar",
      aula: "trait-turbo",
      pergunta: T("Carro turbo precisa ficar ligado um tempo antes de desligar?", "Does a turbo car need to idle before you shut it off?"),
      opcoes: [
        T("Sempre, sem exceção", "Always, no exception"),
        T("Depende do uso: só depois de exigir muito", "Depends on use: only after driving hard"),
        T("Nunca precisa", "It never matters"),
      ],
      correta: 1,
      porque: T(
        "Após um uso muito severo, o adequado é andar com o veículo em rotação baixa, permitindo que o ar atmosférico resfrie o motor e o turbo. Um pequeno trecho de 2 a 3 minutos nessa condição já é suficiente.",
        "After very hard use, the right move is to drive at low revs for a bit, letting outside air cool the engine and the turbo. A short stretch of 2 to 3 minutes like that is enough."
      ),
    },
    {
      id: "km-alto-comprar",
      aula: "trait-highkm",
      pergunta: T("Entre dois usados iguais, um com 60 mil km e outro com 120 mil, qual é a melhor compra?", "Between two identical used cars, one at 60,000 km and one at 120,000, which is the better buy?"),
      opcoes: [
        T("Sempre o de menor km", "Always the lower mileage one"),
        T("O que tem histórico de manutenção comprovado", "The one with proven maintenance history"),
        T("Tanto faz, o que importa é o ano", "Doesn't matter, the year is what counts"),
      ],
      correta: 1,
      porque: T(
        "Quilometragem baixa com manutenção nenhuma esconde borracha ressecada, óleo velho e peça parada. Km alto de rodovia, com revisão em dia e nota fiscal, costuma castigar menos o carro do que km baixo de trânsito parado. Histórico vale mais que o número.",
        "Low mileage with no maintenance hides dried-out rubber, old oil and seized parts. High highway mileage with up-to-date servicing and receipts is usually kinder to a car than low city mileage in stop-and-go. History beats the number."
      ),
    },
    {
      id: "freio-esponjoso",
      aula: "fund-fluids",
      pergunta: T("O pedal de freio ficou mole e vai fundo. O que isso costuma indicar?", "The brake pedal went soft and travels far. What does that usually mean?"),
      opcoes: [
        T("Pastilha nova assentando", "New pads bedding in"),
        T("Ar ou falta de fluido no sistema", "Air or low fluid in the system"),
        T("Normal em carro moderno", "Normal on a modern car"),
      ],
      correta: 1,
      porque: T(
        "Freio funciona porque líquido não comprime. Pedal esponjoso quer dizer que tem ar no circuito ou fluido de menos, e nos dois casos a frenagem fica imprevisível. É item de segurança: não é para deixar para a semana que vem.",
        "Brakes work because liquid doesn't compress. A spongy pedal means air in the circuit or low fluid, and either way stopping becomes unpredictable. It's a safety item: not something to leave for next week."
      ),
    },
    {
      id: "cambio-cvt",
      aula: "trait-cvt",
      pergunta: T("Câmbio CVT que não 'troca marcha' e mantém a rotação subindo está com defeito?", "A CVT that doesn't 'shift' and holds revs climbing is faulty?"),
      opcoes: [
        T("Sim, é sinal de problema", "Yes, that's a sign of trouble"),
        T("Não, é assim que ele funciona", "No, that's how it works"),
        T("Só se for carro novo", "Only if the car is new"),
      ],
      correta: 1,
      porque: T(
        "O CVT não tem marchas fixas: ele varia a relação de forma contínua para manter o motor na rotação mais eficiente. Essa sensação de 'motor gritando sem acelerar' incomoda quem vem de câmbio comum, mas é o projeto funcionando, não falha.",
        "A CVT has no fixed gears: it varies the ratio continuously to keep the engine at its most efficient rpm. That 'engine screaming without accelerating' feel bothers people used to conventional gearboxes, but it's the design working, not a fault."
      ),
    },
    {
      id: "bateria-descarregada",
      aula: "fund-dashboard",
      pergunta: T("O carro não pegou e a bateria estava fraca. Trocar a bateria sempre resolve?", "The car wouldn't start and the battery was weak. Does replacing it always fix it?"),
      opcoes: [
        T("Sim, é sempre a bateria", "Yes, it's always the battery"),
        T("Não necessariamente, o problema pode ser no alternador também", "Not necessarily, the alternator may be the problem too"),
        T("Sim, se for bateria de mais de 2 anos", "Yes, if the battery is over 2 years old"),
      ],
      correta: 1,
      porque: T(
        "Bateria fraca é sintoma, e a causa pode estar em quem deveria recarregá-la. Se o alternador não carrega, a bateria nova descarrega em poucos dias e você paga duas vezes. Antes de trocar, vale testar a carga e o alternador.",
        "A weak battery is a symptom, and the cause may be whatever should be recharging it. If the alternator isn't charging, the new battery dies in days and you pay twice. Before replacing, test the charge and the alternator."
      ),
    },
    {
      id: "vibracao-velocidade",
      aula: "diag-vibracao",
      pergunta: T("O volante treme só acima de 90 km/h e some abaixo disso. O suspeito mais comum é:", "The steering wheel shakes only above 90 km/h and settles below. The usual suspect is:"),
      opcoes: [
        T("Balanceamento das rodas", "Wheel balancing"),
        T("Motor desregulado", "Engine out of tune"),
        T("Freio gasto", "Worn brakes"),
      ],
      correta: 0,
      porque: T(
        "Vibração que aparece numa faixa de velocidade e some depois tem cara de desbalanceamento. Se ela só existe com o pé no freio, aí sim o suspeito vira disco empenado. A velocidade em que ela aparece é a melhor pista do que procurar.",
        "Vibration that shows up in a speed band and fades after it looks like imbalance. If it only exists with your foot on the brake, then a warped disc becomes the suspect. The speed where it appears is the best clue."
      ),
    },
    {
      id: "carro-parado-tempo",
      aula: "sit-overdue",
      pergunta: T("Carro parado na garagem por meses sofre menos que carro rodando?", "Does a car sitting in the garage for months suffer less than one being driven?"),
      opcoes: [
        T("Sim, parado não desgasta", "Yes, parked means no wear"),
        T("Não, parar traz problemas próprios", "No, sitting brings its own problems"),
        T("Só se for carro velho", "Only if it's an old car"),
      ],
      correta: 1,
      porque: T(
        "Parado, a bateria descarrega, o pneu deforma no ponto de apoio, a borracha resseca, o freio pode grudar no disco e o combustível envelhece. Um carro que roda de vez em quando costuma se manter melhor do que um que fica meses sem sair.",
        "Parked, the battery drains, tires flat-spot, rubber dries out, brakes can seize onto the disc and fuel ages. A car driven occasionally usually keeps better than one that sits for months."
      ),
    },
    {
      id: "premium-gasolina",
      aula: "vid-gasolina-e30",
      pergunta: T("Gasolina premium melhora qualquer carro?", "Does premium gasoline improve any car?"),
      opcoes: [
        T("Sim, sempre rende mais", "Yes, it always gives more"),
        T("Depende do que o motor foi projetado para usar", "It depends what the engine was designed for"),
        T("Só em carro importado", "Only in imported cars"),
      ],
      correta: 1,
      porque: T(
        "Isso só vira ganho em um motor cuja calibração consegue aproveitar a maior octanagem da gasolina. Caso contrário, é apenas dinheiro jogado no lixo.",
        "That only becomes a gain in an engine whose calibration can exploit the higher octane. Otherwise it is just money thrown away."
      ),
    },
    {
      id: "consertar-ou-trocar",
      aula: "money-repair-replace",
      pergunta: T("Existe uma régua simples para decidir entre consertar o carro ou trocar de carro?", "Is there a simple rule to decide between fixing the car or replacing it?"),
      opcoes: [
        T("Comparar o conserto com o valor do carro", "Compare the repair with the car's value"),
        T("Trocar sempre que passar de 100 mil km", "Always replace past 100,000 km"),
        T("Nunca consertar carro com mais de 10 anos", "Never fix a car older than 10 years"),
      ],
      correta: 0,
      porque: T(
        "Uma régua prática: se o conserto passa de mais ou menos metade do valor de mercado do carro, ou se você gasta em reparos mais do que gastaria numa parcela por mês, vale reavaliar. Some tudo do último ano antes de decidir no impulso.",
        "A practical rule: if the repair exceeds roughly half the car's market value, or you're spending more on repairs than a monthly payment would cost, it's worth reconsidering. Add up the last twelve months before deciding on impulse."
      ),
    },
    {
      id: "farol-queimado-par",
      aula: "fund-dashboard",
      pergunta: T("Queimou uma lâmpada do farol. Faz sentido trocar as duas?", "One headlight bulb burned out. Does it make sense to replace both?"),
      opcoes: [
        T("Não, só a que queimou", "No, only the one that failed"),
        T("Sim, elas têm vida parecida", "Yes, they have similar lifespans"),
        T("Tanto faz", "It makes no difference"),
      ],
      correta: 1,
      porque: T(
        "As duas trabalharam o mesmo tempo, então a segunda costuma queimar pouco depois. Trocar em par também mantém a cor e a intensidade iguais dos dois lados, o que importa para enxergar bem e para não incomodar quem vem na frente.",
        "Both worked the same hours, so the second usually fails soon after. Replacing in pairs also keeps color and intensity matched on both sides, which matters for seeing well and for not dazzling oncoming drivers."
      ),
    },
    {
      id: "alinhamento-quando",
      aula: "tire-calibragem",
      pergunta: T("Quando vale fazer alinhamento e balanceamento?", "When is it worth getting alignment and balancing done?"),
      opcoes: [
        T("Só quando o carro puxa para um lado", "Only when the car pulls to one side"),
        T("Também depois de buraco forte ou troca de pneu", "Also after a hard pothole or a tire change"),
        T("Uma vez por ano, sempre", "Once a year, always"),
      ],
      correta: 1,
      porque: T(
        "Puxar para o lado é o sintoma tardio: quando aparece, o pneu já desgastou torto. Buraco forte, troca de pneus e serviço na suspensão são os momentos naturais de conferir, antes de o estrago aparecer na borracha.",
        "Pulling to one side is the late symptom: by the time it shows, the tire has already worn unevenly. A hard pothole, new tires and suspension work are the natural moments to check, before the damage reaches the rubber."
      ),
    },
    {
      id: "ar-condicionado-consumo",
      aula: "money-fuel",
      pergunta: T("Na estrada, o que gasta mais combustível: ar-condicionado ligado ou janela aberta?", "On the highway, what burns more fuel: A/C on or windows down?"),
      opcoes: [
        T("Ar-condicionado, sempre", "A/C, always"),
        T("Janela aberta, na maioria dos casos", "Windows down, in most cases"),
        T("Os dois gastam igual", "Both the same"),
      ],
      correta: 1,
      porque: T(
        "Em velocidade de estrada, a janela aberta bagunça o ar em volta do carro, e a resistência pode crescer mais do que o esforço do compressor. Isso depende do tipo de veículo, da velocidade e de outros fatores. Na cidade, em velocidade baixa, a conta se inverte, e a janela costuma sair na frente.",
        "At highway speed, an open window disturbs the airflow around the car, and drag can grow more than the compressor's effort. That depends on the type of vehicle, the speed and other factors. In town, at low speed, it flips, and the window usually wins."
      ),
    },
    {
      id: "oleo-nivel-quando",
      aula: "fund-fluids",
      pergunta: T("Qual o melhor momento para conferir o nível de óleo do motor?", "When is the best moment to check engine oil level?"),
      opcoes: [
        T("Com o motor quente, recém-desligado", "With the engine hot, just switched off"),
        T("Com o carro no plano e o motor frio ou parado uns minutos", "On level ground, engine cold or after a few minutes off"),
        T("Com o motor ligado", "With the engine running"),
      ],
      correta: 1,
      porque: T(
        "O óleo precisa ter escorrido de volta para o cárter, senão a vareta mostra menos do que existe. Carro no plano importa pelo mesmo motivo. Conferir logo depois de desligar quente costuma dar leitura baixa e assustar à toa.",
        "The oil needs time to drain back into the sump, otherwise the dipstick reads lower than reality. Level ground matters for the same reason. Checking right after shutting down hot usually reads low and scares you for nothing."
      ),
    },
    {
      id: "ponto-morto-descida",
      aula: "vid-manual-suave",
      pergunta: T("Descer a serra em ponto morto economiza combustível?", "Does coasting downhill in neutral save fuel?"),
      opcoes: [
        T("Sim, o motor gasta menos", "Yes, the engine uses less"),
        T("Não, exceto em raras exceções", "No, apart from rare exceptions"),
        T("Sim, mas só em carro manual", "Yes, but only in a manual"),
      ],
      correta: 1,
      porque: T(
        "Em carro com injeção eletrônica, descer engrenado com o pé fora do acelerador corta o combustível, enquanto em ponto morto o motor precisa de combustível para se manter em marcha lenta. Entretanto, se a energia consumida pelo freio motor for maior do que a necessária para reacelerar o carro, temos o cenário de exceção. Por fim, sempre desça engrenado, pois, sem freio motor, a descida vira responsabilidade só do freio, que esquenta e perde eficiência.",
        "On a fuel-injected car, coasting in gear off the throttle cuts fuel, while in neutral the engine needs fuel just to keep idling. That said, if the energy spent on engine braking is greater than what it takes to get back up to speed, you have the exception. Above all, always go down in gear: with no engine braking, the descent rests entirely on the brakes, which heat up and fade."
      ),
    },
    {
      id: "estepe-pressao",
      aula: "tire-calibragem",
      pergunta: T("Com que frequência vale checar a pressão do estepe?", "How often is it worth checking the spare tire's pressure?"),
      opcoes: [
        T("Nunca, ele fica guardado", "Never, it just sits there"),
        T("Junto com os outros, de vez em quando", "Along with the others, every so often"),
        T("Só quando furar um pneu", "Only when you get a flat"),
      ],
      correta: 1,
      porque: T(
        "Pneu perde pressão parado, e o estepe é justamente o que ninguém olha. Descobrir que ele está vazio na beira da estrada, à noite, é o pior momento possível. Checar junto com os outros custa um minuto.",
        "A tire loses pressure just sitting there, and the spare is exactly the one nobody checks. Finding it flat on the roadside at night is the worst possible moment. Checking it with the others costs a minute."
      ),
    },
    {
      id: "carro-usado-historico",
      aula: "vid-comprar-usado",
      pergunta: T("Na compra de um usado, qual documento diz mais sobre o cuidado que o carro teve?", "When buying used, which record says most about how the car was cared for?"),
      opcoes: [
        T("O manual em branco", "A blank owner's manual"),
        T("Notas fiscais das manutenções", "Service receipts and invoices"),
        T("A tabela de preço do modelo", "The model's price guide"),
      ],
      correta: 1,
      porque: T(
        "Nota fiscal mostra o que foi feito, quando e com qual peça. É a única prova difícil de fabricar. Manual carimbado ajuda, mas carimbo sem nota diz pouco. Carro sem histórico nenhum não é necessariamente ruim, só é uma aposta maior.",
        "Invoices show what was done, when and with which parts. It's the one proof that's hard to fake. A stamped booklet helps, but stamps without invoices say little. A car with no history isn't necessarily bad, it's just a bigger bet."
      ),
    },
    {
      id: "cheiro-queimado-freio",
      aula: "diag-smells",
      pergunta: T("Cheiro forte de queimado depois de uma descida longa pede o quê?", "A strong burning smell after a long descent calls for what?"),
      opcoes: [
        T("Seguir, passa sozinho", "Keep going, it passes"),
        T("Parar em lugar seguro e deixar o freio esfriar", "Pull over somewhere safe and let the brakes cool"),
        T("Acelerar para ventilar o freio", "Speed up to air the brakes out"),
      ],
      correta: 1,
      porque: T(
        "Freio superaquecido perde eficiência justamente quando você mais precisa dele, e o cheiro é o aviso antes disso. Parar e esperar esfriar é o certo. Jogar água no disco quente, não: o choque térmico pode empenar.",
        "Overheated brakes lose effectiveness exactly when you need them most, and the smell is the warning before that. Pulling over and waiting is right. Throwing water on a hot disc is not: thermal shock can warp it."
      ),
    },
    {
      id: "pneu-idade",
      aula: "vid-pneu-indices",
      pergunta: T("Pneu com pouco uso mas vários anos de fabricação ainda é seguro?", "Is a tire with little wear but several years old still safe?"),
      opcoes: [
        T("Sim, o que vale é a profundidade do sulco", "Yes, tread depth is what counts"),
        T("A borracha envelhece mesmo parada", "Rubber ages even when unused"),
        T("Só importa se for pneu de estrada", "It only matters for highway tires"),
      ],
      correta: 1,
      porque: T(
        "A borracha resseca e perde aderência com o tempo, mesmo sem rodar, e começa a trincar entre os sulcos. Todo pneu traz a semana e o ano de fabricação marcados na lateral. Sulco fundo em pneu muito velho pode enganar.",
        "Rubber dries out and loses grip over time, even unused, and starts cracking between the grooves. Every tire carries its week and year of manufacture on the sidewall. Deep tread on a very old tire can be misleading."
      ),
    },
    {
      id: "revisao-concessionaria",
      aula: "sit-just-bought",
      pergunta: T("Fazer revisão fora da concessionária cancela a garantia de fábrica?", "Does servicing outside the dealer void the factory warranty?"),
      opcoes: [
        T("Sim, sempre cancela", "Yes, it always voids it"),
        T("Não, desde que siga o plano e guarde as notas", "No, as long as you follow the schedule and keep receipts"),
        T("Só cancela em carro importado", "It only voids on imported cars"),
      ],
      correta: 1,
      porque: T(
        "No Brasil o consumidor pode escolher onde fazer a manutenção, desde que sejam respeitados os itens, os prazos e as especificações do fabricante, com comprovação. O que gera problema é revisão fora do plano, peça fora de especificação ou falta de nota.",
        "In Brazil the consumer may choose where to service the car, as long as the maker's items, intervals and specifications are respected and documented. What causes trouble is skipping the schedule, out-of-spec parts or missing receipts."
      ),
    },
    {
      id: "embreagem-pe",
      aula: "vid-manual-habitos",
      pergunta: T("Dirigir com o pé apoiado na embreagem faz mal?", "Is resting your foot on the clutch pedal harmful?"),
      opcoes: [
        T("Não, o pedal aguenta", "No, the pedal takes it"),
        T("Sim, desgasta o disco antes da hora", "Yes, it wears the disc out early"),
        T("Só em subida", "Only uphill"),
      ],
      correta: 1,
      porque: T(
        "Peso leve no pedal já basta para o disco patinar de leve o tempo todo, e patinar é exatamente o que o desgasta. O mesmo vale para segurar o carro na subida com a embreagem em vez do freio: é o jeito mais rápido de queimar o conjunto.",
        "Even light pressure on the pedal is enough to make the disc slip slightly all the time, and slipping is exactly what wears it. The same goes for holding the car on a hill with the clutch instead of the brake: the fastest way to burn the assembly."
      ),
    },
    {
      id: "luz-oleo-vermelha",
      aula: "fund-dashboard",
      pergunta: T("A luz vermelha de óleo acendeu andando. O que fazer?", "The red oil light came on while driving. What now?"),
      opcoes: [
        T("Completar o óleo no próximo posto", "Top up the oil at the next station"),
        T("Parar assim que for seguro e desligar", "Stop as soon as it's safe and switch off"),
        T("Seguir devagar até em casa", "Drive slowly home"),
      ],
      correta: 1,
      porque: T(
        "Essa luz não fala de nível, fala de PRESSÃO. Sem pressão, as partes internas do motor trabalham sem filme de óleo, e o estrago acontece em segundos, não em quilômetros. Parar e chamar reboque é mais barato que um motor.",
        "That light isn't about level, it's about PRESSURE. Without pressure, the engine's internals run with no oil film, and the damage happens in seconds, not kilometers. Stopping and calling a tow is cheaper than an engine."
      ),
    },
    {
      id: "ipva-multa-revisao",
      aula: "sit-no-history",
      pergunta: T("Comprei um usado sem histórico. Qual a primeira manutenção a fazer?", "I bought a used car with no history. Which service comes first?"),
      opcoes: [
        T("Esperar dar problema", "Wait until something breaks"),
        T("Trocar os fluidos e conferir os itens de segurança", "Change the fluids and check the safety items"),
        T("Trocar o motor por precaução", "Replace the engine as a precaution"),
      ],
      correta: 1,
      porque: T(
        "Sem histórico, você não sabe o que foi feito, então o ponto de partida é zerar o que é barato e crítico: óleo e filtros, fluido de freio, arrefecimento, e uma olhada em pneu, pastilha e correia. Sai bem mais barato que descobrir na estrada.",
        "With no history you don't know what was done, so the starting point is resetting what's cheap and critical: oil and filters, brake fluid, coolant, plus a look at tires, pads and belt. Far cheaper than finding out on the road."
      ),
    },
    {
      id: "estalo-esterco",
      aula: "diag-noises",
      pergunta: T("Estalo ritmado ao fazer curva fechada, principalmente com o volante no fim, aponta para:", "A rhythmic click on tight turns, especially at full lock, points to:"),
      opcoes: [
        T("Junta homocinética", "CV joint"),
        T("Amortecedor", "Shock absorber"),
        T("Escapamento", "Exhaust"),
      ],
      correta: 0,
      porque: T(
        "A homocinética é a peça que transmite força para a roda enquanto ela esterça, e desgastada ela estala nesse movimento. Se em vez de estalo for um ronco contínuo que muda ao curvar para um lado, o suspeito passa a ser rolamento de roda.",
        "The CV joint transmits power to the wheel while it steers, and worn out it clicks in that motion. If instead of a click it's a steady hum that changes when turning one way, the suspect becomes a wheel bearing."
      ),
    },
    {
      id: "combustivel-reserva",
      aula: "money-fuel",
      pergunta: T("Rodar sempre na reserva faz mal ao carro?", "Is always driving on reserve bad for the car?"),
      opcoes: [
        T("Sim, prejudica a bomba de combustível", "Yes, it harms the fuel pump"),
        T("Não prejudica, mas deve ser analisado carro a carro", "It doesn't harm it, but it has to be checked car by car"),
        T("Só em carro a diesel", "Only in diesel cars"),
      ],
      correta: 1,
      porque: T(
        "A bomba é refrigerada pelo próprio combustível, que passa por dentro dela; por fora, há refrigeração em um reservatório que permanece cheio mesmo com o carro na reserva. Existem alguns carros cujo projeto de bomba não possui esse reservatório externo, e, nesses casos, é interessante não andar sempre na reserva.",
        "The pump is cooled by the fuel itself, which flows through it; on the outside, it sits in a reservoir that stays full even when the car is on reserve. Some cars have a pump design without that external reservoir, and on those it is worth not always running on reserve."
      ),
    },
    {
      id: "escapamento-barulho",
      aula: "vid-ressonador",
      pergunta: T("Cortar o escapamento para o carro 'roncar' aumenta a potência?", "Does cutting the exhaust to make the car louder add power?"),
      opcoes: [
        T("Sim, sempre libera o motor", "Yes, it always frees the engine"),
        T("Não necessariamente, e pode piorar", "Not necessarily, and it can make things worse"),
        T("Só em motor aspirado", "Only on naturally aspirated engines"),
      ],
      correta: 1,
      porque: T(
        "O escapamento de fábrica é projetado junto com o motor, e parte dele existe para aproveitar as ondas de pressão em favor do enchimento do cilindro. Cortar sem projeto costuma trocar torque embaixo por barulho, e ainda pode acender luz no painel.",
        "The factory exhaust is designed together with the engine, and part of it exists to use pressure waves in favor of cylinder filling. Cutting it without design usually trades low-end torque for noise, and can even trigger a warning light."
      ),
    },
    {
      id: "hibrido-tomada",
      aula: "cult-hybrid",
      pergunta: T("Todo carro híbrido precisa ser ligado na tomada?", "Does every hybrid need to be plugged in?"),
      opcoes: [
        T("Sim, sempre", "Yes, always"),
        T("Não, o híbrido comum se recarrega sozinho", "No, a conventional hybrid recharges itself"),
        T("Só os importados", "Only imported ones"),
      ],
      correta: 1,
      porque: T(
        "O híbrido comum gera a própria energia com o motor a combustão e com a frenagem regenerativa, sem tomada nenhuma. Quem precisa de tomada é o híbrido plug-in, que tem bateria maior e roda um bom trecho só no elétrico.",
        "A conventional hybrid generates its own energy from the combustion engine and regenerative braking, with no plug involved. The one that needs a plug is the plug-in hybrid, with a bigger battery and a decent electric-only range."
      ),
    },
    {
      id: "eletrico-manutencao",
      aula: "cult-ev",
      pergunta: T("Carro elétrico não tem manutenção nenhuma?", "Does an electric car need no maintenance at all?"),
      opcoes: [
        T("Isso mesmo, zero manutenção", "That's right, zero maintenance"),
        T("Tem menos itens, mas tem", "Fewer items, but it has some"),
        T("Tem mais manutenção que o comum", "It needs more maintenance than a regular car"),
      ],
      correta: 1,
      porque: T(
        "Sem óleo de motor, vela e escapamento, a lista encolhe bastante. Mas continuam existindo pneu, freio, suspensão, filtro de ar da cabine, fluido de arrefecimento da bateria e alinhamento. E, pelo peso maior, pneu costuma gastar mais rápido.",
        "With no engine oil, spark plugs or exhaust, the list shrinks a lot. But tires, brakes, suspension, cabin air filter, battery coolant and alignment are all still there. And because of the extra weight, tires often wear faster."
      ),
    },
    {
      id: "freio-regenerativo",
      aula: "cult-ev",
      pergunta: T("Em elétrico e híbrido, por que a pastilha de freio costuma durar mais?", "In EVs and hybrids, why do brake pads usually last longer?"),
      opcoes: [
        T("A pastilha é de material melhor", "The pads are made of better material"),
        T("O motor elétrico freia o carro boa parte do tempo", "The electric motor does much of the braking"),
        T("O carro é mais leve", "The car is lighter"),
      ],
      correta: 1,
      porque: T(
        "Na frenagem regenerativa, o motor elétrico vira gerador e o esforço de frear vira energia de volta para a bateria. O freio de atrito entra menos, então a pastilha dura mais. O efeito colateral é o disco criar ferrugem por pouco uso.",
        "In regenerative braking, the electric motor becomes a generator and the braking effort turns back into battery energy. The friction brake works less, so pads last longer. The side effect is discs rusting from disuse."
      ),
    },
    {
      id: "cambio-automatico-neutro",
      aula: "gearbox-tipos",
      pergunta: T("Parou no semáforo com câmbio automático. Precisa colocar em neutro?", "Stopped at a light with an automatic. Do you need to shift to neutral?"),
      opcoes: [
        T("Sim, sempre, para poupar o câmbio", "Yes, always, to spare the transmission"),
        T("Em parada curta não precisa", "For a short stop, no"),
        T("Precisa colocar em P", "You need to shift to P"),
      ],
      correta: 1,
      porque: T(
        "Em parada de semáforo, deixar em D com o pé no freio é o uso normal e previsto do câmbio. Em parada longa, tipo trânsito travado ou cancela, o neutro alivia um pouco. Colocar em P a cada parada só desgasta o mecanismo à toa.",
        "At a traffic light, leaving it in D with your foot on the brake is normal, expected use. For a long stop, like gridlock or a barrier, neutral eases things slightly. Shifting to P at every stop just wears the mechanism for nothing."
      ),
    },
    {
      id: "cambio-fluido",
      aula: "gearbox-fluido",
      pergunta: T("Fluido de câmbio automático é 'para a vida toda' e nunca se troca?", "Is automatic transmission fluid 'lifetime fill' and never changed?"),
      opcoes: [
        T("Sim, é selado de fábrica", "Yes, it's sealed from the factory"),
        T("Depende do carro e do uso", "Depends on the car and how it's used"),
        T("Troca todo ano, sempre", "Change it every year, always"),
      ],
      correta: 1,
      porque: T(
        "Alguns fabricantes anunciam o fluido como vitalício, mas 'vida' ali costuma significar um número de quilômetros, não para sempre. Uso pesado, trânsito e reboque aquecem o fluido e envelhecem antes. Câmbio é caro: na dúvida, o manual e a oficina de confiança decidem.",
        "Some makers advertise the fluid as lifetime, but 'life' there usually means a mileage figure, not forever. Heavy use, traffic and towing heat the fluid and age it sooner. Transmissions are expensive: when in doubt, the manual and a trusted shop decide."
      ),
    },
    {
      id: "cambio-solavanco",
      aula: "gearbox-sintomas",
      pergunta: T("Câmbio automático começou a dar trancos na troca. É para esperar piorar?", "The automatic started jerking between gears. Should you wait for it to get worse?"),
      opcoes: [
        T("Sim, alguns trancos são normais", "Yes, some jerking is normal"),
        T("Não, é sinal de olhar cedo", "No, it's a sign to look early"),
        T("Só se acender luz no painel", "Only if a warning light comes on"),
      ],
      correta: 1,
      porque: T(
        "Tranco novo em câmbio que era macio é mudança de comportamento, e mudança de comportamento é o primeiro aviso. Diagnóstico cedo às vezes se resolve com fluido e ajuste; deixar rodar meses costuma transformar em conserto grande.",
        "New jerking in a gearbox that used to be smooth is a change in behavior, and a change in behavior is the first warning. Diagnosing early sometimes means just fluid and adjustment; letting it run for months usually turns into a big repair."
      ),
    },
    {
      id: "aro-grande",
      aula: "vid-roda-grande-1000",
      pergunta: T("Colocar roda de aro maior melhora o desempenho de um carro popular?", "Do bigger wheels improve a small car's performance?"),
      opcoes: [
        T("Sim, sempre melhora", "Yes, always"),
        T("Costuma piorar aceleração e conforto", "It usually hurts acceleration and comfort"),
        T("Não muda nada", "It changes nothing"),
      ],
      correta: 1,
      porque: T(
        "Roda maior costuma ser mais pesada, e peso que gira exige mais do motor para acelerar. O pneu mais baixo perde absorção, então buraco chega mais no corpo e na suspensão. Ganha em visual e, às vezes, em estabilidade em curva.",
        "A bigger wheel is usually heavier, and rotating weight demands more from the engine to accelerate. The lower-profile tire absorbs less, so potholes reach your body and the suspension harder. You gain looks and sometimes cornering stability."
      ),
    },
    {
      id: "diesel-carro-passeio",
      aula: "trait-diesel",
      pergunta: T("Motor diesel gasta menos por natureza?", "Does a diesel engine inherently use less fuel?"),
      opcoes: [
        T("Sim, e por isso é sempre mais barato rodar", "Yes, so it's always cheaper to run"),
        T("Rende mais por litro, mas a conta tem outros itens", "It gives more per liter, but the math has other items"),
        T("Não, gasta mais", "No, it uses more"),
      ],
      correta: 1,
      porque: T(
        "O diesel tem mais energia por litro e, por concepção, é mais eficiente termicamente. Só que a manutenção costuma custar mais, a peça é mais cara, e o preço do combustível varia. Rodar muito por ano é o que costuma fechar a conta.",
        "Diesel packs more energy per liter and, by design, is thermally more efficient. But maintenance usually costs more, parts are pricier, and fuel prices vary. High annual mileage is usually what makes the math work."
      ),
    },
    {
      id: "app-motorista-desgaste",
      aula: "trait-appuse",
      pergunta: T("Rodar como motorista de aplicativo desgasta o carro de forma diferente?", "Does driving for a rideshare app wear a car differently?"),
      opcoes: [
        T("Não, quilômetro é quilômetro", "No, a kilometer is a kilometer"),
        T("Sim, muita parada e arrancada castigam mais", "Yes, constant stop-and-go is harder on it"),
        T("Só o pneu sofre mais", "Only the tires suffer more"),
      ],
      correta: 1,
      porque: T(
        "Trânsito de aplicativo é ciclo curto: acelera, freia, para, fica em marcha lenta. Isso castiga freio, embreagem, câmbio e arrefecimento bem mais que a mesma quilometragem em estrada. Por isso vale antecipar revisão em vez de seguir só o número do manual.",
        "Rideshare traffic is a short cycle: accelerate, brake, stop, idle. That punishes brakes, clutch, transmission and cooling far more than the same mileage on the highway. Which is why bringing service forward beats following the manual's number alone."
      ),
    },
    {
      id: "urbano-curto",
      aula: "trait-urban",
      pergunta: T("Usar o carro só para trajetos curtos na cidade é o uso mais leve possível?", "Is using the car only for short city trips the gentlest possible use?"),
      opcoes: [
        T("Sim, roda pouco e devagar", "Yes, little distance and low speed"),
        T("Não, o motor nem chega à temperatura ideal", "No, the engine never reaches proper temperature"),
        T("Depende do modelo", "It depends on the model"),
      ],
      correta: 1,
      porque: T(
        "Trajeto curto não deixa o motor aquecer o suficiente para evaporar o combustível que se acumula no óleo, e o óleo envelhece mais rápido. Também castiga a bateria, que não recarrega direito. É um uso mais severo do que parece.",
        "Short trips don't let the engine warm enough to evaporate the fuel that builds up in the oil, so the oil ages faster. They also punish the battery, which never fully recharges. It's harsher use than it looks."
      ),
    },
    {
      id: "adas-confianca",
      aula: "cult-adas",
      pergunta: T("Carro com frenagem automática de emergência dispensa atenção do motorista?", "Does automatic emergency braking let the driver stop paying attention?"),
      opcoes: [
        T("Sim, ele freia sozinho", "Yes, it brakes by itself"),
        T("Não, é apoio, não substituto", "No, it's support, not a substitute"),
        T("Só em rodovia", "Only on the highway"),
      ],
      correta: 1,
      porque: T(
        "Esses sistemas reduzem a gravidade de muitas batidas e evitam algumas, mas dependem de câmera e radar, que sofrem com chuva, sujeira, contraluz e situações fora do previsto. Foram feitos para ajudar quem está prestando atenção, não para render o motorista.",
        "These systems reduce the severity of many crashes and prevent some, but they rely on cameras and radar, which struggle with rain, dirt, glare and unusual situations. They were built to assist an attentive driver, not to replace one."
      ),
    },
    {
      id: "pneu-medida-trocar",
      aula: "vid-pneu-medidas",
      pergunta: T("Dá para colocar um pneu de medida diferente da original?", "Can you fit a tire size different from the original?"),
      opcoes: [
        T("Sim, qualquer um que caiba na roda", "Yes, anything that fits the wheel"),
        T("Não é o ideal, mas, respeitando carga, velocidade e diâmetro, é aceitável", "Not ideal, but acceptable if load, speed rating and diameter are respected"),
        T("Nunca, tem que ser idêntico", "Never, it must be identical"),
      ],
      correta: 1,
      porque: T(
        "Existe margem, mas ela tem regra. Índices de carga e velocidade abaixo do especificado são risco direto. E mudar o diâmetro total desregula velocímetro, hodômetro e o comportamento dos sistemas de estabilidade, que contam voltas de roda.",
        "There's room, but with rules. Load and speed ratings below spec are a direct risk. And changing the overall diameter throws off the speedometer, odometer and the stability systems, which count wheel rotations."
      ),
    },
    {
      id: "tres-cilindros",
      aula: "vid-tres-cilindros",
      pergunta: T("Motor 3 cilindros tremer mais que um 4 cilindros é defeito?", "Is a three-cylinder engine shaking more than a four a defect?"),
      opcoes: [
        T("Sim, é falta de manutenção", "Yes, it's poor maintenance"),
        T("Não, é característica do desenho", "No, it's inherent to the design"),
        T("Só treme se for turbo", "It only shakes if it's turbocharged"),
      ],
      correta: 1,
      porque: T(
        "Com três cilindros, as forças dentro do motor não se anulam tão bem quanto com quatro, e sobra vibração. Os fabricantes compensam com eixo balanceador e coxins, mas um resto costuma chegar ao volante e ao banco, principalmente na marcha lenta.",
        "With three cylinders, the internal forces don't cancel as neatly as with four, and vibration is left over. Makers compensate with balance shafts and mounts, but some usually reaches the wheel and the seat, especially at idle."
      ),
    },
    {
      id: "altitude-potencia",
      aula: "vid-altitude",
      pergunta: T("Por que carro aspirado perde força em cidade de altitude alta?", "Why does a naturally aspirated car lose power at high altitude?"),
      opcoes: [
        T("O combustível queima pior no frio", "Fuel burns worse in the cold"),
        T("O ar é mais rarefeito, entra menos oxigênio", "The air is thinner, less oxygen gets in"),
        T("A gravidade muda", "Gravity changes"),
      ],
      correta: 1,
      porque: T(
        "Potência depende de quanto oxigênio entra no cilindro. Em altitude o ar é menos denso, então cabe menos oxigênio e sobra menos força. É também por isso que motores turbo sofrem menos lá: o turbo comprime o ar antes de mandar para dentro.",
        "Power depends on how much oxygen gets into the cylinder. At altitude the air is less dense, so less oxygen fits and less power comes out. It's also why turbo engines suffer less up there: the turbo compresses the air before sending it in."
      ),
    },
    {
      id: "sedan-porta-malas",
      aula: "vid-sedan",
      pergunta: T("A principal diferença prática entre um sedã e o hatch do mesmo modelo é:", "The main practical difference between a sedan and the hatch of the same model is:"),
      opcoes: [
        T("O motor é mais potente no sedã", "The sedan has a more powerful engine"),
        T("O porta-malas fechado e separado da cabine", "A closed trunk, separated from the cabin"),
        T("O sedã gasta menos", "The sedan uses less fuel"),
      ],
      correta: 1,
      porque: T(
        "Em geral é a mesma mecânica com carroceria diferente. O sedã ganha porta-malas maior, fechado e isolado da cabine, o que ajuda em ruído e em segurança da bagagem. O hatch ganha em versatilidade de espaço e em facilidade para manobrar.",
        "It's generally the same mechanicals with a different body. The sedan gains a larger trunk, closed and isolated from the cabin, which helps with noise and luggage security. The hatch gains space versatility and easier maneuvering."
      ),
    },
    {
      id: "tsi-downsizing",
      aula: "vid-tsi",
      pergunta: T("Motor 1.0 turbo entrega força parecida com um 1.6 aspirado como?", "How does a 1.0 turbo deliver power similar to a 1.6 naturally aspirated?"),
      opcoes: [
        T("Girando muito mais alto", "By revving much higher"),
        T("Empurrando mais ar para dentro do cilindro", "By forcing more air into the cylinder"),
        T("Usando combustível diferente", "By using different fuel"),
      ],
      correta: 1,
      porque: T(
        "O turbo comprime o ar antes da admissão, então cabe mais oxigênio no mesmo cilindro pequeno e mais combustível pode ser queimado. É assim que um motor menor entrega força de um maior, com a vantagem de gastar menos quando você anda leve.",
        "The turbo compresses air before intake, so more oxygen fits in the same small cylinder and more fuel can be burnt. That's how a smaller engine delivers a bigger one's power, with the advantage of using less when you drive gently."
      ),
    },
    {
      id: "cilindrada-potencia",
      aula: "vid-cilindrada",
      pergunta: T("Cilindrada maior significa sempre mais potência?", "Does bigger displacement always mean more power?"),
      opcoes: [
        T("Sim, é proporcional", "Yes, it's proportional"),
        T("Não, depende de como o motor respira", "No, it depends on how the engine breathes"),
        T("Só em motor a diesel", "Only in diesel engines"),
      ],
      correta: 1,
      porque: T(
        "Cilindrada é o volume que o motor desloca, e é só um dos fatores. Turbo, comando, injeção e formato dos dutos mudam quanto de ar entra e sai. É por isso que um 1.0 turbo moderno passa fácil de um 1.6 antigo aspirado.",
        "Displacement is the volume the engine moves, and it's only one factor. Turbo, camshaft, injection and port design change how much air gets in and out. That's why a modern 1.0 turbo easily beats an older 1.6 naturally aspirated."
      ),
    },
    {
      id: "balanceamento-motor",
      aula: "vid-balanceamento-motor",
      pergunta: T("Por que motores em linha de 6 cilindros são famosos por serem suaves?", "Why are inline-six engines famous for smoothness?"),
      opcoes: [
        T("Porque são maiores", "Because they're bigger"),
        T("Porque as forças internas se cancelam naturalmente", "Because their internal forces cancel out naturally"),
        T("Porque giram menos", "Because they rev lower"),
      ],
      correta: 1,
      porque: T(
        "No seis em linha, os movimentos dos pistões se compensam de um jeito que anula as principais vibrações, sem precisar de eixo balanceador. É um caso raro de solução que sai suave de graça, pela geometria, e é por isso que ele tem tanta fama.",
        "In an inline-six, the pistons' motions offset each other in a way that cancels the main vibrations, with no balance shaft needed. It's a rare case of smoothness coming free, from geometry alone, which is why it has such a reputation."
      ),
    },
    {
      id: "aerodinamica-asa",
      aula: "sport-aero",
      pergunta: T("Aerofólio em carro de rua melhora a estabilidade no dia a dia?", "Does a wing on a street car improve everyday stability?"),
      opcoes: [
        T("Sim, sempre gruda o carro no chão", "Yes, it always glues the car to the road"),
        T("Em velocidade normal, nada", "At normal speeds, nothing"),
        T("Sim, e melhora o consumo", "Yes, and it improves fuel economy"),
      ],
      correta: 1,
      porque: T(
        "Força aerodinâmica cresce com o quadrado da velocidade, então o efeito útil aparece em velocidades bem acima das de rua. Abaixo disso, o que sobra costuma ser peso e um pouco mais de resistência ao ar. Em pista, com projeto, a história é outra.",
        "Aerodynamic force grows with the square of speed, so the useful effect appears well above street speeds. Below that, what's left is usually weight and a bit more drag. On track, with proper design, it's a different story."
      ),
    },
    {
      id: "tracao-traseira",
      aula: "sport-drivetrain",
      pergunta: T("Qual a vantagem prática da tração dianteira num carro de rua?", "What's the practical advantage of front-wheel drive on a street car?"),
      opcoes: [
        T("É sempre mais rápida", "It's always faster"),
        T("Custa menos, ocupa menos espaço e é previsível", "Cheaper, more space-efficient and predictable"),
        T("Aguenta mais potência", "It handles more power"),
      ],
      correta: 1,
      porque: T(
        "Com motor e tração na frente, some o túnel central e a mecânica fica concentrada, o que barateia e libera espaço interno. O comportamento no limite também tende a ser mais previsível para quem não é piloto. A traseira leva vantagem em equilíbrio e em aguentar potência.",
        "With engine and drive up front, the center tunnel disappears and the mechanicals stay concentrated, which cuts cost and frees cabin space. Behavior at the limit also tends to be more predictable for non-racers. Rear drive wins on balance and power handling."
      ),
    },
    {
      id: "nitro-filme",
      aula: "vid-nitro",
      pergunta: T("O 'nitro' dos filmes é o quê, de verdade?", "What is the movie 'nitro', really?"),
      opcoes: [
        T("Um combustível especial", "A special fuel"),
        T("Óxido nitroso, que leva mais oxigênio ao motor", "Nitrous oxide, which brings more oxygen into the engine"),
        T("Um botão de turbo", "A turbo button"),
      ],
      correta: 1,
      porque: T(
        "O óxido nitroso não queima sozinho: ele carrega oxigênio extra, e é isso que permite queimar mais combustível de uma vez. O ganho é real e imediato, e o risco também: sem preparo do motor, é uma das formas mais rápidas de quebrar peça interna.",
        "Nitrous oxide doesn't burn by itself: it carries extra oxygen, and that's what allows burning more fuel at once. The gain is real and immediate, and so is the risk: without a prepared engine, it's one of the quickest ways to break internals."
      ),
    },
    {
      id: "marca-fiat-brasil",
      aula: "brand-fiat",
      pergunta: T("Por que tantas peças de reposição são baratas em modelos populares?", "Why are spare parts so cheap on popular models?"),
      opcoes: [
        T("Porque são de qualidade inferior", "Because they're lower quality"),
        T("Porque a escala de produção derruba o preço", "Because production scale drives the price down"),
        T("Porque o governo subsidia", "Because the government subsidizes them"),
      ],
      correta: 1,
      porque: T(
        "Modelo com muita unidade rodando tem muita peça sendo fabricada, muita oficina que já conhece o serviço e muita opção de fornecedor. Isso derruba preço e tempo de conserto. É um dos motivos práticos para considerar popularidade na hora de comprar.",
        "A model with many units on the road has many parts being made, many shops that already know the job and many supplier options. That drives down price and repair time. It's one of the practical reasons to weigh popularity when buying."
      ),
    },
    {
      id: "ar-cardan",
      aula: "vid-ar-cardan",
      pergunta: T("Existe 'ar no cardan' para tirar em oficina?", "Is there such a thing as 'air in the driveshaft' to be bled at a shop?"),
      opcoes: [
        T("Sim, é manutenção comum", "Yes, it's routine maintenance"),
        T("Não, é a piada mais antiga do ramo", "No, it's the oldest joke in the trade"),
        T("Só em caminhão", "Only on trucks"),
      ],
      correta: 1,
      porque: T(
        "Cardan é um eixo maciço que transmite giro: não tem líquido nem circuito de ar para sangrar. A brincadeira existe justamente para pegar quem não conhece, e é um bom lembrete de por que vale entender o básico antes de autorizar serviço.",
        "A driveshaft is a solid shaft that transmits rotation: there's no fluid or air circuit to bleed. The prank exists precisely to catch people who don't know, and it's a good reminder of why understanding the basics before authorizing work pays off."
      ),
    },
    {
      id: "revisao-antecipar",
      aula: "sit-overdue",
      pergunta: T("A revisão passou do prazo por alguns meses. O que fazer?", "The service is a few months overdue. What now?"),
      opcoes: [
        T("Esperar o próximo prazo cheio", "Wait for the next full interval"),
        T("Fazer assim que der e retomar o ciclo", "Do it as soon as possible and restart the cycle"),
        T("Pular, já que passou mesmo", "Skip it, since it's late anyway"),
      ],
      correta: 1,
      porque: T(
        "Atraso não se compensa esperando mais. Óleo velho perde propriedade com o tempo, não só com o quilômetro, e filtro saturado deixa de filtrar. Fazer agora e retomar o ciclo a partir daí é mais barato do que esperar o próximo prazo.",
        "Being late isn't fixed by waiting longer. Old oil loses its properties over time, not just mileage, and a saturated filter stops filtering. Doing it now and restarting the cycle from there is cheaper than waiting for the next interval."
      ),
    },
  ];
}
