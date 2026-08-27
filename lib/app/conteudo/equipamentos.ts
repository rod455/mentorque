import type { Tradutor } from "./base";

// O kit do motorista e o passo a passo de cada equipamento.
export function equipamentos(T: Tradutor) {

// Kit do motorista — equipamentos úteis, por categoria.
const equipment: { section: string; items: { id: string; emoji: string; name: string; use: string; essential?: boolean; star?: boolean }[] }[] = [
  {
    section: T("Emergência no carro (leve sempre)", "Car emergency (always carry)"),
    items: [
      { id: "spare-kit", emoji: "🛞", name: T("Estepe, macaco e chave de roda", "Spare, jack and lug wrench"), use: T("Trocar um pneu furado na estrada.", "Change a flat tire on the road."), essential: true },
      { id: "triangle", emoji: "🔺", name: T("Triângulo de sinalização", "Warning triangle"), use: T("Sinalizar o carro parado: obrigatório por lei.", "Signal a stopped car: required by law."), essential: true },
      { id: "jumper", emoji: "🔋", name: T("Cabo de chupeta (ou bateria auxiliar)", "Jumper cables (or jump-starter)"), use: T("Dar partida quando a bateria descarrega. A bateria auxiliar funciona sem outro carro.", "Start the car when the battery dies. A jump-starter works without another car."), essential: true },
      { id: "inflator", emoji: "💨", name: T("Calibrador + compressor portátil", "Gauge + portable inflator"), use: T("Calibrar e encher o pneu em qualquer lugar.", "Check and inflate a tire anywhere.") },
      { id: "flashlight", emoji: "🔦", name: T("Lanterna", "Flashlight"), use: T("Enxergar embaixo do capô ou trocar pneu à noite.", "See under the hood or change a tire at night.") },
      { id: "firstaid", emoji: "🩹", name: T("Kit de primeiros socorros", "First-aid kit"), use: T("O básico para pequenos acidentes.", "The basics for minor incidents.") },
      { id: "towstrap", emoji: "🪢", name: T("Corda/cabo de reboque", "Tow strap"), use: T("Rebocar ou ser rebocado numa emergência.", "Tow or be towed in an emergency.") },
    ],
  },
  {
    section: T("Diagnóstico", "Diagnostics"),
    items: [
      { id: "obd2", emoji: "🔌", name: T("Scanner OBD2", "OBD2 scanner"), use: T("A 'chave' do painel: plugue na entrada OBD2 (embaixo do volante) e leia os códigos de erro, descubra o que a luz acesa significa. Há versões Bluetooth que ligam num app no celular.", "The dashboard 'key': plug into the OBD2 port (under the wheel) and read the fault codes, find out what a warning light means. Bluetooth versions pair with a phone app."), star: true },
      { id: "multimeter", emoji: "🔧", name: T("Multímetro", "Multimeter"), use: T("Testar bateria, alternador, fusíveis e fiação.", "Test the battery, alternator, fuses and wiring.") },
      { id: "oilgauge", emoji: "🌡️", name: T("Medidor de pressão de óleo", "Oil pressure gauge"), use: T("Confirmar a pressão do óleo do motor.", "Confirm the engine's oil pressure.") },
    ],
  },
  {
    section: T("Ferramentas de garagem", "Garage tools"),
    items: [
      { id: "sockets", emoji: "🧰", name: T("Jogo de chaves e soquetes", "Wrench & socket set"), use: T("A base de quase todo reparo.", "The foundation of almost any repair."), essential: true },
      { id: "pliers", emoji: "🗜️", name: T("Alicate (universal e de bico)", "Pliers (combination and needle-nose)"), use: T("Segurar, cortar e dobrar: mil usos.", "Grip, cut and bend, a thousand uses.") },
      { id: "screwdrivers", emoji: "🪛", name: T("Chaves de fenda e Philips", "Flathead & Phillips screwdrivers"), use: T("Parafusos de painéis, presilhas e tampas.", "Panel screws, clips and covers.") },
      { id: "filterwrench", emoji: "⭕", name: T("Chave de filtro de óleo", "Oil filter wrench"), use: T("Soltar o filtro na troca de óleo.", "Loosen the filter during an oil change.") },
      { id: "jackstands", emoji: "🛠️", name: T("Macaco hidráulico + cavaletes", "Trolley jack + stands"), use: T("Levantar o carro com segurança. Nunca só o macaco.", "Lift the car safely. Never on the jack alone.") },
      { id: "torque", emoji: "🔩", name: T("Torquímetro", "Torque wrench"), use: T("Apertar rodas e peças no torque correto.", "Tighten wheels and parts to the correct torque.") },
      { id: "drainpan", emoji: "🪣", name: T("Bacia de dreno", "Drain pan"), use: T("Recolher o óleo velho sem sujeira.", "Catch old oil without a mess.") },
    ],
  },
  {
    section: T("Consumíveis úteis", "Handy consumables"),
    items: [
      { id: "spareoil", emoji: "🛢️", name: T("Óleo do motor de reserva", "Spare engine oil"), use: T("Completar o nível entre as trocas.", "Top up the level between changes.") },
      { id: "coolant", emoji: "❄️", name: T("Líquido de arrefecimento", "Coolant"), use: T("Completar o radiador e evitar superaquecer.", "Top up the radiator and avoid overheating.") },
      { id: "wd40", emoji: "🧴", name: T("Desengripante (WD-40)", "Penetrating oil (WD-40)"), use: T("Soltar parafusos presos e proteger contatos.", "Free stuck bolts and protect contacts.") },
      { id: "tape", emoji: "🎗️", name: T("Fita isolante e abraçadeiras", "Electrical tape & zip ties"), use: T("Reparos rápidos de fio e mangueira.", "Quick wire and hose fixes.") },
      { id: "gloves", emoji: "🧤", name: T("Luvas e panos", "Gloves & rags"), use: T("Manter as mãos limpas e seguras.", "Keep your hands clean and safe.") },
    ],
  },
];

// "Como usar" de cada equipamento — versão fácil, passo a passo detalhado.
const equipmentHowTo: Record<string, { steps: string[]; safety: string[] }> = {
  "spare-kit": {
    steps: [
      T("Pare num lugar plano e seguro, longe do fluxo. Puxe o freio de mão, ligue o pisca-alerta e posicione o triângulo atrás do carro.", "Stop somewhere flat and safe, away from traffic. Set the handbrake, turn on the hazards and place the triangle behind the car."),
      T("Com o carro AINDA NO CHÃO, afrouxe (só afrouxe) os parafusos da roda furada girando a chave no sentido anti-horário. Pode usar o peso do corpo na chave.", "With the car STILL ON THE GROUND, loosen (just loosen) the flat tire's bolts counterclockwise. Use your body weight on the wrench if needed."),
      T("Encaixe o macaco no ponto de apoio indicado no manual, uma marca reforçada na lateral, perto da roda. Gire a manivela até o pneu furado sair do chão.", "Fit the jack at the lift point shown in the manual, a reinforced mark on the sill near the wheel. Crank until the flat tire is off the ground."),
      T("Termine de soltar os parafusos (guarde todos juntos) e puxe a roda com as duas mãos.", "Finish removing the bolts (keep them together) and pull the wheel off with both hands."),
      T("Encaixe o estepe, rosqueie os parafusos com a mão em ordem de cruz (um oposto ao outro), desça o carro e dê o aperto final com a chave, também em cruz.", "Fit the spare, hand-thread the bolts in a criss-cross order, lower the car and do the final tightening with the wrench, also criss-cross."),
      T("No primeiro posto, calibre o estepe (estepes finos costumam pedir mais pressão. Veja o manual) e conserte o pneu furado o quanto antes.", "At the first gas station, inflate the spare (temporary spares often need higher pressure. Check the manual) and repair the flat as soon as possible."),
    ],
    safety: [
      T("Nunca coloque qualquer parte do corpo embaixo do carro apoiado só no macaco.", "Never put any part of your body under a car held only by the jack."),
      T("Estepe temporário (fino) tem limite de velocidade: geralmente 80 km/h.", "Temporary (skinny) spares have a speed limit: usually 80 km/h (50 mph)."),
    ],
  },
  triangle: {
    steps: [
      T("Ligue o pisca-alerta assim que parar o carro.", "Turn on the hazard lights as soon as you stop."),
      T("Monte o triângulo e posicione-o atrás do carro, na mesma faixa em que ele está.", "Assemble the triangle and place it behind the car, in the same lane."),
      T("Distância: em via urbana, uns 30 m (~40 passos largos); em rodovia, 80 m ou mais (~100 passos). Quanto mais rápida a via, mais longe.", "Distance: in the city, about 30 m (~40 big steps); on a highway, 80 m or more (~100 steps). The faster the road, the farther away."),
      T("Se parou depois de uma curva ou lombada, posicione o triângulo ANTES dela: quem vem precisa ser avisado antes de te ver.", "If you stopped past a curve or crest, place the triangle BEFORE it: drivers need the warning before they can see you."),
      T("À noite ou na chuva, aumente a distância e vista colete refletivo se tiver.", "At night or in rain, increase the distance and wear a reflective vest if you have one."),
    ],
    safety: [T("Ande pelo acostamento, nunca pela pista, e não fique parado entre o carro e o tráfego.", "Walk on the shoulder, never on the road, and don't stand between the car and traffic.")],
  },
  jumper: {
    steps: [
      T("Aproxime o carro socorrista até os capôs ficarem próximos. Desligue os dois carros e abra os capôs.", "Bring the helper car close, hoods near each other. Turn both cars off and open the hoods."),
      T("Conecte NESTA ordem: garra vermelha no + da bateria descarregada → vermelha no + da bateria boa → preta no – da bateria boa → preta numa parte metálica sem pintura do motor do carro descarregado (não no – da bateria).", "Connect IN THIS order: red clamp to the dead battery's + → red to the good battery's + → black to the good battery's – → black to bare metal on the dead car's engine (not the battery's –)."),
      T("Ligue o carro socorrista e deixe funcionando, acelerando de leve, por 2–3 minutos.", "Start the helper car and let it run, revving lightly, for 2–3 minutes."),
      T("Dê partida no carro descarregado. Se não pegar em 3 tentativas, aguarde mais alguns minutos carregando e tente de novo.", "Try starting the dead car. If it doesn't catch in 3 tries, let it charge a few more minutes and try again."),
      T("Pegou? Remova os cabos na ordem INVERSA (preta do motor primeiro). Rode 20–30 minutos para o alternador recarregar a bateria.", "Started? Remove the cables in REVERSE order (black on the engine first). Drive 20–30 minutes so the alternator recharges the battery."),
    ],
    safety: [
      T("Nunca deixe as garras vermelha e preta se tocarem com os cabos conectados.", "Never let the red and black clamps touch while connected."),
      T("Bateria estufada ou vazando: não tente a chupeta, chame socorro.", "Swollen or leaking battery: don't attempt a jump, call for help."),
    ],
  },
  inflator: {
    steps: [
      T("Descubra a pressão certa na etiqueta da coluna da porta do motorista ou na tampa do tanque (ex.: 32 psi). Não use a pressão escrita no pneu, aquele é o máximo.", "Find the right pressure on the driver's door jamb sticker or fuel flap (e.g. 32 psi). Don't use the number on the tire: that's the maximum."),
      T("Calibre com o pneu frio (menos de ~2 km rodados). Pneu quente marca pressão maior e engana.", "Check with cold tires (less than ~2 km driven). Warm tires read higher and mislead."),
      T("Desrosqueie a tampinha da válvula e encaixe o bico firme, sem vazar ar. Leia a pressão atual.", "Unscrew the valve cap and press the chuck on firmly, without hissing. Read the current pressure."),
      T("Ligue o compressor na tomada 12V do carro e encha até a pressão da etiqueta. Confira de novo e recoloque a tampinha.", "Plug the inflator into the car's 12V socket and fill to the sticker pressure. Re-check and refit the cap."),
      T("Uma vez por mês, confira também o estepe: furo com estepe vazio é furo em dobro.", "Once a month, check the spare too, a flat spare doubles the trouble."),
    ],
    safety: [T("Não ultrapasse muito a pressão indicada; excesso desgasta o centro do pneu e piora a aderência.", "Don't overshoot the indicated pressure; excess wears the tire's center and hurts grip.")],
  },
  flashlight: {
    steps: [
      T("Guarde sempre no mesmo lugar (porta-luvas ou porta-malas): emergência não dá tempo de procurar.", "Keep it always in the same place (glovebox or trunk): emergencies leave no time to search."),
      T("Prefira LED, recarregável por USB ou com um jogo de pilhas reserva junto.", "Prefer LED, USB-rechargeable or with a spare set of batteries next to it."),
      T("Muitos modelos têm modo piscante: serve como sinalização extra à noite.", "Many models have a strobe mode: extra signaling at night."),
      T("Teste uma vez por mês; recarregue ou troque as pilhas antes de viagens.", "Test it monthly; recharge or swap batteries before trips."),
    ],
    safety: [T("Trocando pneu à noite: apoie a lanterna iluminando a roda e mantenha o colete refletivo.", "Changing a tire at night: prop the light on the wheel and keep your reflective vest on.")],
  },
  firstaid: {
    steps: [
      T("Monte o kit com: curativos, gaze, esparadrapo, soro fisiológico, luvas descartáveis, tesoura sem ponta e um analgésico simples.", "Stock the kit with: band-aids, gauze, tape, saline, disposable gloves, blunt scissors and a basic painkiller."),
      T("Guarde em estojo fechado, longe do sol (porta-malas ou embaixo do banco).", "Keep it in a closed case away from sunlight (trunk or under a seat)."),
      T("Corte pequeno: lave com soro, seque ao redor e cubra com gaze + esparadrapo.", "Small cut: rinse with saline, dry around it and cover with gauze + tape."),
      T("Confira a validade dos itens a cada 6 meses e reponha o que usar.", "Check expiry dates every 6 months and restock what you use."),
    ],
    safety: [T("Acidente sério: NÃO mova a vítima. Ligue 192 (SAMU) ou 193 (Bombeiros) e sinalize a via.", "Serious accident: do NOT move the victim. Call emergency services and signal the road.")],
  },
  towstrap: {
    steps: [
      T("Confira a capacidade da corda: precisa ser maior que o peso do carro rebocado.", "Check the strap's rating: it must exceed the towed car's weight."),
      T("Prenda SOMENTE nos ganchos de reboque (olhal). Na maioria dos carros, fica atrás de uma tampinha no para-choque; o parafuso-olhal costuma estar junto do estepe.", "Attach ONLY to the tow hooks (eyelets). On most cars they're behind a small cover in the bumper; the screw-in eyelet is usually stored with the spare."),
      T("Deixe 3–5 m de corda entre os carros e combinem sinais antes (buzina = parar, farol = atenção).", "Leave 3–5 m of strap between cars and agree on signals first (horn = stop, lights = attention)."),
      T("Quem reboca sai bem devagar, sem trancos. Quem é rebocado liga a ignição (destrava a direção e o freio funciona), e mantém a corda esticada freando de leve.", "The towing driver starts very gently, no jerks. The towed driver switches the ignition on (unlocks steering, brakes work) and keeps the strap taut by braking lightly."),
      T("Velocidade máxima de 40–60 km/h, pisca-alerta ligado nos dois carros, e só por trajetos curtos.", "Max 40–60 km/h, hazards on in both cars, short distances only."),
    ],
    safety: [T("Câmbio automático: confira o manual antes, muitos não podem ser rebocados com as rodas de tração no chão.", "Automatic gearbox: check the manual first, many can't be towed with the drive wheels on the ground.")],
  },
  obd2: {
    steps: [
      T("Localize a porta OBD2: embaixo do painel, do lado do motorista (às vezes atrás de uma tampinha).", "Find the OBD2 port: under the dash on the driver's side (sometimes behind a small cover)."),
      T("Com o carro desligado, encaixe o scanner na porta.", "With the car off, plug the scanner into the port."),
      T("Ligue a ignição sem dar partida. No scanner Bluetooth, abra o app (Car Scanner, Torque…) e pareie.", "Turn the ignition on without starting. For Bluetooth scanners, open the app (Car Scanner, Torque…) and pair."),
      T("Toque em 'Ler códigos' e anote o que aparecer (ex.: P0301).", "Tap 'Read codes' and note what comes up (e.g. P0301)."),
      T("Consulte o significado na nossa página Códigos OBD2 (aba Problemas).", "Look up each code on our OBD2 codes page (Problems tab)."),
      T("Só use 'Apagar códigos' DEPOIS de resolver a causa: apagar não conserta, e some com a pista.", "Only 'Clear codes' AFTER fixing the cause: clearing doesn't repair, and erases the trail."),
    ],
    safety: [T("Luz da injeção PISCANDO = falha ativa grave. Pare o quanto antes.", "FLASHING check-engine light = active serious fault. Stop as soon as possible.")],
  },
  multimeter: {
    steps: [
      T("Teste da bateria: gire o seletor para tensão contínua (V⎓ ou DCV), escala 20V.", "Battery test: set the dial to DC volts (V⎓ or DCV), 20V range."),
      T("Ponta vermelha no polo + da bateria, ponta preta no –.", "Red probe on the battery's + post, black on –."),
      T("Carro desligado: 12,4–12,7V = bateria boa; abaixo de 12V = descarregada ou no fim da vida.", "Car off: 12.4–12.7V = healthy; below 12V = discharged or dying."),
      T("Carro ligado: 13,5–14,7V = alternador carregando; fora dessa faixa, revise o alternador.", "Car running: 13.5–14.7V = alternator charging; outside that range, have the alternator checked."),
      T("Fusível: modo continuidade (símbolo de som). Encoste uma ponta em cada lado: apitou, o fusível está bom.", "Fuse: continuity mode (sound symbol). Touch each end, a beep means the fuse is good."),
    ],
    safety: [T("Não meça corrente (A) sem saber o que está fazendo: queima o aparelho e pode causar curto.", "Don't measure current (A) unless you know what you're doing, it can fry the meter and cause a short.")],
  },
  oilgauge: {
    steps: [
      T("Uso mais avançado: o medidor entra no lugar do sensor de pressão de óleo do motor (rosqueado no bloco).", "More advanced use: the gauge screws into the engine block in place of the oil pressure sensor."),
      T("Com o motor na temperatura normal, compare a leitura em marcha lenta e a ~2.000 rpm com a faixa do manual.", "With the engine at normal temperature, compare the reading at idle and ~2,000 rpm with the manual's range."),
      T("Pressão baixa com nível de óleo correto = investigar bomba de óleo ou folgas internas: caso de oficina.", "Low pressure with correct oil level = oil pump or internal wear to investigate: shop territory."),
      T("Se não se sentir seguro, peça o teste numa oficina: é rápido e barato.", "If unsure, ask a shop to run the test: it's quick and cheap."),
    ],
    safety: [T("Motor e óleo quentes queimam: espere esfriar antes de mexer.", "Hot engine and oil burn: let it cool before working.")],
  },
  sockets: {
    steps: [
      T("Use o soquete do tamanho EXATO do parafuso (em mm). Folgado, ele espana a cabeça.", "Use the EXACT socket size for the bolt (in mm). A loose fit rounds the head."),
      T("Na catraca, a alavanca/trava define o sentido: aperto ou solto. Encaixe fundo e gire com firmeza.", "On the ratchet, the switch sets the direction: tighten or loosen. Seat it fully and turn firmly."),
      T("Parafuso travado: use uma extensão para ganhar alavanca, ou aplique desengripante e espere 10–15 minutos.", "Stuck bolt: use an extension for leverage, or apply penetrating oil and wait 10–15 minutes."),
      T("Guarde cada soquete no seu lugar na maleta: é o que evita perder as medidas mais usadas.", "Return each socket to its slot in the case: that's how you avoid losing the most-used sizes."),
    ],
    safety: [T("Prefira EMPURRAR a chave (mão aberta) a puxá-la, se escapar, machuca menos.", "Prefer PUSHING the wrench (open palm) over pulling, if it slips, you get hurt less.")],
  },
  pliers: {
    steps: [
      T("Alicate universal: segurar, dobrar e cortar (o corte fica na base das mandíbulas).", "Combination pliers: grip, bend and cut (the cutter is at the base of the jaws)."),
      T("Alicate de bico: lugares apertados, presilhas, molas pequenas e conectores.", "Needle-nose: tight spots, clips, small springs and connectors."),
      T("Conector elétrico: puxe sempre pelo CONECTOR, nunca pelo fio, fio arrebentado por dentro é defeito difícil de achar.", "Electrical connector: always pull the CONNECTOR, never the wire, a wire broken inside is a hard fault to find."),
    ],
    safety: [T("Mexendo em fiação: desconecte o polo negativo da bateria antes.", "Working on wiring: disconnect the battery's negative terminal first.")],
  },
  screwdrivers: {
    steps: [
      T("Escolha a ponta do tamanho exato da fenda do parafuso: ponta menor ou maior espana.", "Match the tip exactly to the screw head: too small or too big strips it."),
      T("Pressione firme PARA DENTRO enquanto gira, principalmente em parafuso Phillips.", "Press firmly INWARD while turning, especially with Phillips screws."),
      T("Presilhas plásticas de acabamento: alavanca suave; o ideal é uma espátula plástica pra não marcar o painel.", "Plastic trim clips: gentle prying; a plastic trim tool is ideal to avoid marking panels."),
    ],
    safety: [T("Chave de fenda não é talhadeira nem alavanca pesada, a ponta quebra e voa.", "A screwdriver is not a chisel or a crowbar, the tip can snap and fly.")],
  },
  filterwrench: {
    steps: [
      T("Usada na troca de óleo: abrace a cinta (ou encaixe o copo do tamanho certo) em volta do filtro.", "Used during oil changes: wrap the strap (or fit the right-size cap) around the filter."),
      T("Gire no sentido anti-horário SÓ para soltar. Deixe a bacia embaixo: vai escorrer óleo.", "Turn counterclockwise ONLY to loosen. Keep the drain pan under it: oil will run out."),
      T("O filtro NOVO vai apertado só com a mão: passe óleo limpo na borracha de vedação e rosqueie até encostar + 3/4 de volta.", "The NEW filter goes on hand-tight only: smear clean oil on the gasket and screw until seated + 3/4 turn."),
    ],
    safety: [T("Faça com o motor morno, nunca quente.", "Work with the engine warm, never hot.")],
  },
  jackstands: {
    steps: [
      T("Só em chão plano e firme (concreto). Freio de mão puxado e calços nas rodas que ficam no chão.", "Only on flat, solid ground (concrete). Handbrake on and chocks on the wheels staying down."),
      T("Posicione o macaco no ponto de apoio indicado no manual e levante até a altura desejada.", "Place the jack at the lift point shown in the manual and raise to the height you need."),
      T("Coloque os cavaletes nos pontos reforçados e DESÇA o carro até apoiar neles. O macaco fica como reserva, não como apoio principal.", "Set the stands at reinforced points and LOWER the car onto them. The jack stays as backup, not the main support."),
      T("Balance o carro de leve para conferir a firmeza ANTES de colocar qualquer parte do corpo embaixo.", "Give the car a light shake to confirm it's solid BEFORE any part of you goes underneath."),
      T("Para descer: levante de novo com o macaco, tire os cavaletes e desça devagar.", "To come down: raise slightly with the jack, remove the stands and lower slowly."),
    ],
    safety: [
      T("NUNCA trabalhe embaixo do carro apoiado só no macaco.", "NEVER work under a car held only by the jack."),
      T("Cavaletes sempre em par, no mesmo eixo.", "Stands always in pairs, on the same axle."),
    ],
  },
  torque: {
    steps: [
      T("Descubra o torque correto no manual (rodas costumam pedir 110–120 N·m).", "Find the correct torque in the manual (wheels usually take 110–120 N·m)."),
      T("Ajuste o valor girando o cabo do torquímetro até a marca na escala (N·m).", "Set the value by turning the handle to the mark on the N·m scale."),
      T("Aperte em ordem de cruz até sentir/ouvir o 'clique', e PARE aí. Continuar passa do torque.", "Tighten in a criss-cross order until you feel/hear the 'click', and STOP there. Going on over-torques."),
      T("Depois de usar, volte o ajuste para o mínimo da escala: preserva a mola calibrada.", "After use, wind the setting back to the scale's minimum, it preserves the calibrated spring."),
    ],
    safety: [T("Torquímetro é só para APERTAR: soltar parafuso com ele descalibra a ferramenta.", "A torque wrench is for TIGHTENING only: loosening with it ruins the calibration.")],
  },
  drainpan: {
    steps: [
      T("Posicione a bacia sob o bujão ANTES de soltá-lo, e um pouco deslocada na direção do jato, que sai forte no começo.", "Place the pan under the drain plug BEFORE loosening it: slightly offset toward the stream, which shoots out at first."),
      T("Deixe escorrer todo o óleo (5–10 minutos).", "Let all the oil drain (5–10 minutes)."),
      T("Transfira o óleo usado para um recipiente que feche bem, a própria embalagem do óleo novo serve.", "Transfer the used oil to a sealable container, the new oil's bottle works."),
      T("Entregue num ponto de coleta (postos e autopeças recebem). Nunca no ralo, na terra ou no lixo comum.", "Drop it at a collection point (gas stations and parts stores take it). Never down the drain, on soil or in regular trash."),
    ],
    safety: [T("Óleo usado é contaminante e irrita a pele. Use luvas.", "Used oil is a contaminant and skin irritant: wear gloves.")],
  },
  spareoil: {
    steps: [
      T("Use o MESMO tipo e viscosidade do óleo que está no motor (ex.: 5W30 sintético). Confira o manual ou a etiqueta da última troca.", "Use the SAME type and viscosity as the oil in the engine (e.g. 5W30 synthetic). Check the manual or the last-change sticker."),
      T("Cheque o nível com o carro frio e em piso plano: tire a vareta, limpe, insira de novo, tire e leia, o óleo deve estar entre MIN e MAX.", "Check the level with the car cold and level: pull the dipstick, wipe, reinsert, pull and read, oil should sit between MIN and MAX."),
      T("Faltando, complete AOS POUCOS pela tampa de óleo (meio copo por vez), conferindo a vareta a cada adição.", "If low, top up LITTLE BY LITTLE through the filler cap (half a cup at a time), re-checking the dipstick each time."),
      T("Não passe do MAX: óleo demais também danifica o motor.", "Don't go past MAX: too much oil also damages the engine."),
    ],
    safety: [T("Nunca abra a tampa do óleo com o motor funcionando.", "Never open the oil cap with the engine running.")],
  },
  coolant: {
    steps: [
      T("Só confira e complete com o motor FRIO (de preferência antes do primeiro uso do dia).", "Only check and top up with a COLD engine (ideally before the first drive of the day)."),
      T("Olhe o reservatório plástico translúcido perto do radiador: o nível deve estar entre MIN e MAX.", "Look at the translucent plastic reservoir near the radiator: level should be between MIN and MAX."),
      T("Complete com o aditivo correto já diluído (ou pronto-uso). Não use só água, e não misture aditivos de cores diferentes.", "Top up with the correct coolant pre-mixed (or ready-to-use). Don't use plain water, and don't mix different coolant colors."),
      T("Nível baixando sempre = vazamento ou consumo interno. Investigue na oficina.", "Level always dropping = leak or internal consumption. Have a shop investigate."),
    ],
    safety: [T("NUNCA abra a tampa do radiador/reservatório com o motor quente, o jato ferve e causa queimaduras graves.", "NEVER open the radiator/reservoir cap on a hot engine, the boiling spray causes serious burns.")],
  },
  wd40: {
    steps: [
      T("Parafuso preso: aplique, espere 10–15 minutos agindo, dê batidinhas leves e tente soltar de novo.", "Stuck bolt: spray, let it work 10–15 minutes, tap lightly and try again."),
      T("Dobradiças e fechaduras rangendo: um jato curto resolve.", "Squeaky hinges and locks: a short burst fixes it."),
      T("Contatos oxidados (ex.: terminal da bateria): desconecte antes, aplique e limpe com pano.", "Oxidized contacts (e.g. battery terminal): disconnect first, spray and wipe clean."),
      T("Não é lubrificante permanente: para dobradiças e trilhos, aplique graxa própria depois.", "It's not a permanent lubricant: follow up with proper grease on hinges and rails."),
    ],
    safety: [
      T("Inflamável: longe de faíscas e do motor quente.", "Flammable: keep away from sparks and a hot engine."),
      T("JAMAIS aplique em discos ou pastilhas de freio.", "NEVER spray on brake discs or pads."),
    ],
  },
  tape: {
    steps: [
      T("Mangueira furada (emergência): seque bem, enrole a fita ESTICANDO, com várias voltas sobrepostas, e vá direto à oficina.", "Leaking hose (emergency): dry it well, wrap the tape STRETCHED with several overlapping turns, then head straight to a shop."),
      T("Fio desencapado: desconecte o negativo da bateria, enrole cobrindo bem além do trecho danificado.", "Exposed wire: disconnect the battery negative, wrap well past the damaged section."),
      T("Abraçadeiras: prenda fiação solta e acabamentos que vibram até o reparo definitivo.", "Zip ties: secure loose wiring and rattling trim until the proper repair."),
    ],
    safety: [T("São reparos PROVISÓRIOS: providencie o conserto definitivo logo.", "These are TEMPORARY fixes: get the proper repair done soon.")],
  },
  gloves: {
    steps: [
      T("Luvas nitrílicas descartáveis para óleo e graxa; luva de vaqueta para peças quentes ou pesadas.", "Disposable nitrile gloves for oil and grease; leather gloves for hot or heavy parts."),
      T("Pano de microfibra para acabamento e vidros; pano de algodão para graxa pesada.", "Microfiber cloth for trim and glass; cotton rags for heavy grease."),
      T("Pano sujo de óleo ou solvente: guarde em recipiente fechado ou descarte, amontoado, pode entrar em combustão espontânea.", "Rags soaked in oil or solvent: store in a closed container or discard, piled up, they can self-combust."),
    ],
    safety: [T("Tire anéis, pulseiras e relógio antes de mexer no motor.", "Remove rings, bracelets and watches before working on the engine.")],
  },
};

  return { equipment, equipmentHowTo };
}
