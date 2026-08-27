import type { Severity, SystemKey } from "../types";
import type { Tradutor } from "./base";

// Os sintomas: o que a pessoa sente no carro, a causa provável, a urgência e
// o que observar antes de ir à oficina.
export function sintomas(T: Tradutor) {

// ---- Symptoms (2.2) ------------------------------------------------------
type Sym = {
  id: string;
  label: string;
  category: SystemKey;
  causes: string[];
  urgency: { level: Severity; text: string };
  price: string;
  observe: string[];
  checklist: string[];
};
const symptoms: Sym[] = [
  {
    id: "brake-noise",
    label: T("Barulho ao frear", "Noise when braking"),
    category: "brakes",
    causes: [T("Pastilhas gastas", "Worn brake pads"), T("Discos empenados", "Warped rotors"), T("Pinças de freio travadas", "Seized brake calipers")],
    urgency: { level: "medium", text: T("Médio – procure uma oficina em até 7 dias", "Medium – get it checked within 7 days") },
    price: "R$ 250–600",
    observe: [T("O barulho aumenta em frenagens fortes?", "Does the noise get worse under hard braking?"), T("O pedal treme ao frear?", "Does the pedal shudder when braking?")],
    checklist: [
      T("Verificar espessura das pastilhas dianteiras e traseiras", "Check front and rear pad thickness"),
      T("Medir espessura e empenamento dos discos", "Measure rotor thickness and warping"),
      T("Verificar funcionamento das pinças de freio", "Check the calipers are working freely"),
      T("Pedir orçamento detalhado (peças + mão de obra)", "Ask for an itemized quote (parts + labor)"),
    ],
  },
  {
    id: "cel",
    label: T("Luz do motor acesa", "Check-engine light on"),
    category: "engine",
    causes: [T("Falha de ignição (velas/bobinas)", "Misfire (plugs/coils)"), T("Sonda lambda / emissão", "O2 sensor / emissions"), T("Tampa de combustível solta", "Loose fuel cap")],
    urgency: { level: "medium", text: T("Médio – evite viagens longas até diagnosticar", "Medium – avoid long trips until diagnosed") },
    price: "R$ 180–700",
    observe: [T("A luz pisca ou fica fixa?", "Is the light flashing or steady?"), T("Perdeu força ou aumentou o consumo?", "Any power loss or higher consumption?")],
    checklist: [
      T("Ler os códigos com scanner OBD2", "Read the codes with an OBD2 scanner"),
      T("Verificar velas, bobinas e cabos", "Check plugs, coils and wires"),
      T("Checar sonda lambda e sistema de emissão", "Check O2 sensor and emissions system"),
      T("Pedir orçamento detalhado", "Ask for an itemized quote"),
    ],
  },
  {
    id: "consumption",
    label: T("Carro bebendo muito", "Drinking too much fuel"),
    category: "engine",
    causes: [T("Filtros sujos (ar/combustível)", "Dirty filters (air/fuel)"), T("Bicos injetores sujos", "Clogged injectors"), T("Pressão dos pneus baixa", "Low tire pressure")],
    urgency: { level: "low", text: T("Baixo – resolva na próxima manutenção", "Low – handle at the next service") },
    price: "R$ 150–500",
    observe: [T("Piorou de repente ou aos poucos?", "Did it worsen suddenly or gradually?"), T("Anda muito no trânsito parado?", "Lots of stop-and-go traffic?")],
    checklist: [
      T("Verificar estado dos filtros de ar e de combustível", "Check the condition of the air and fuel filters"),
      T("Verificar se os bicos injetores estão sujos", "Check whether the injectors are clogged"),
      T("Conferir a pressão dos pneus", "Check tire pressure"),
      T("Verificar sensores de mistura", "Check air/fuel sensors"),
    ],
  },
  {
    id: "hard-start",
    label: T("Dificuldade para ligar", "Hard to start"),
    category: "electrical",
    causes: [T("Bateria fraca", "Weak battery"), T("Motor de arranque", "Starter motor"), T("Bomba de combustível", "Fuel pump")],
    urgency: { level: "high", text: T("Alto – pode te deixar na mão a qualquer momento", "High – could strand you at any time") },
    price: "R$ 350–900",
    observe: [T("O painel apaga ao dar partida?", "Does the dash dim when cranking?"), T("Faz clique sem girar o motor?", "A click without the engine turning over?")],
    checklist: [
      T("Testar carga da bateria e do alternador", "Test battery charge and alternator"),
      T("Verificar motor de arranque", "Check the starter motor"),
      T("Checar pressão da bomba de combustível", "Check fuel pump pressure"),
      T("Pedir orçamento detalhado", "Ask for an itemized quote"),
    ],
  },
  {
    id: "steering-vibration",
    label: T("Vibração no volante", "Steering wheel vibration"),
    category: "tires",
    causes: [T("Balanceamento / alinhamento", "Balancing / alignment"), T("Pneus desgastados", "Worn tires"), T("Discos de freio empenados", "Warped brake rotors")],
    urgency: { level: "medium", text: T("Médio – acelera o desgaste dos pneus", "Medium – speeds up tire wear") },
    price: "R$ 80–400",
    observe: [T("Vibra em alguma velocidade específica?", "Does it vibrate at a specific speed?"), T("Vibra só ao frear?", "Only when braking?")],
    checklist: [
      T("Verificar balanceamento e alinhamento", "Check balancing and alignment"),
      T("Inspecionar desgaste dos pneus", "Inspect tire wear"),
      T("Medir empenamento dos discos", "Measure rotor warping"),
    ],
  },
  {
    id: "suspension-noise",
    label: T("Barulho na suspensão", "Suspension noise"),
    category: "suspension",
    causes: [T("Amortecedores gastos", "Worn shocks"), T("Bieletas / buchas", "Sway-bar links / bushings"), T("Batentes ressecados", "Dry bump-stops")],
    urgency: { level: "medium", text: T("Médio – piora com o tempo e afeta a dirigibilidade", "Medium – worsens over time and affects handling") },
    price: "R$ 300–1.200",
    observe: [T("O barulho vem ao passar em buracos?", "Does the noise come over bumps?"), T("O carro balança demais depois de ondulações?", "Does the car float after dips?")],
    checklist: [
      T("Testar amortecedores (rebote)", "Test the shocks (bounce test)"),
      T("Verificar bieletas, buchas e batentes", "Check links, bushings and bump-stops"),
      T("Se precisar trocar: exigir a troca aos pares", "If replacing: insist parts are replaced in pairs"),
      T("Pedir orçamento detalhado", "Ask for an itemized quote"),
    ],
  },
  {
    id: "overheating",
    label: T("Temperatura subindo", "Temperature rising"),
    category: "engine",
    causes: [T("Nível de água/aditivo baixo", "Low coolant level"), T("Válvula termostática", "Thermostat"), T("Bomba d'água ou ventoinha", "Water pump or fan")],
    urgency: { level: "high", text: T("Alto – pare o carro se passar do meio; risco de fundir o motor", "High – stop if it goes past midpoint; risk of engine damage") },
    price: "R$ 200–1.500",
    observe: [T("Sobe parado no trânsito ou em subida?", "Rises in traffic or uphill?"), T("Há cheiro doce ou vazamento embaixo?", "Sweet smell or leak underneath?")],
    checklist: [
      T("Verificar nível e vazamentos do arrefecimento", "Check coolant level and leaks"),
      T("Testar válvula termostática", "Test the thermostat"),
      T("Checar bomba d'água e ventoinha", "Check water pump and fan"),
      T("Pedir orçamento detalhado", "Ask for an itemized quote"),
    ],
  },

  // ── Motor ────────────────────────────────────────────────
  {
    id: "engine-misfire",
    label: T("Motor falhando / engasgando", "Engine misfiring / stumbling"),
    category: "engine",
    causes: [T("Velas ou bobinas de ignição", "Spark plugs or coils"), T("Bicos injetores sujos", "Clogged injectors"), T("Filtro de combustível", "Fuel filter")],
    urgency: { level: "medium", text: T("Médio – piora o consumo e pode danificar o catalisador", "Medium – worsens consumption and can damage the catalytic converter") },
    price: "R$ 200–800",
    observe: [T("Falha mais na aceleração ou em marcha lenta?", "Misfires more on acceleration or at idle?"), T("A luz do motor piscou?", "Did the engine light flash?")],
    checklist: [T("Verificar velas, cabos e bobinas", "Check plugs, wires and coils"), T("Ler códigos com scanner OBD2", "Read codes with an OBD2 scanner"), T("Verificar se os bicos injetores precisam de limpeza", "Check whether the injectors need cleaning"), T("Pedir orçamento detalhado", "Ask for an itemized quote")],
  },
  {
    id: "engine-power-loss",
    label: T("Perda de força", "Loss of power"),
    category: "engine",
    causes: [T("Filtro de ar ou combustível sujo", "Dirty air or fuel filter"), T("Turbo / pressão", "Turbo / boost"), T("Sensor de fluxo de ar (MAF)", "Air-flow sensor (MAF)")],
    urgency: { level: "medium", text: T("Médio – diagnostique antes de viagens longas", "Medium – diagnose before long trips") },
    price: "R$ 150–1.200",
    observe: [T("Entrou em 'modo de emergência' (rpm limitado)?", "Did it go into limp mode (limited rpm)?"), T("Perdeu força de repente ou aos poucos?", "Sudden or gradual power loss?")],
    checklist: [T("Verificar estado dos filtros de ar e combustível", "Check the condition of the air and fuel filters"), T("Ler códigos OBD2", "Read OBD2 codes"), T("Verificar sistema de turbo/admissão", "Check the turbo/intake system"), T("Pedir orçamento detalhado", "Ask for an itemized quote")],
  },
  {
    id: "engine-smoke",
    label: T("Fumaça no escapamento", "Exhaust smoke"),
    category: "engine",
    causes: [T("Azul: queima de óleo", "Blue: burning oil"), T("Branca: água no motor (junta)", "White: water in engine (gasket)"), T("Preta: mistura rica", "Black: rich mixture")],
    urgency: { level: "high", text: T("Alto – fumaça branca densa pede parar já", "High – thick white smoke means stop now") },
    price: "R$ 300–4.000",
    observe: [T("Qual a cor da fumaça?", "What color is the smoke?"), T("Sai o tempo todo ou só na partida?", "All the time or only at startup?")],
    checklist: [T("Verificar nível de óleo e de água", "Check oil and coolant levels"), T("Teste de compressão do motor", "Engine compression test"), T("Checar junta do cabeçote", "Check the head gasket"), T("Pedir orçamento detalhado", "Ask for an itemized quote")],
  },

  // ── Freios ───────────────────────────────────────────────
  {
    id: "brake-soft-pedal",
    label: T("Pedal de freio baixo ou mole", "Soft or low brake pedal"),
    category: "brakes",
    causes: [T("Ar no sistema de freio", "Air in the brake system"), T("Fluido de freio baixo/velho", "Low/old brake fluid"), T("Vazamento no circuito", "Leak in the circuit")],
    urgency: { level: "high", text: T("Alto – item de segurança; não rode assim", "High – safety item; don't drive like this") },
    price: "R$ 120–600",
    observe: [T("O pedal vai quase até o fundo?", "Does the pedal go almost to the floor?"), T("O nível do fluido está baixo?", "Is the fluid level low?")],
    checklist: [T("Verificar nível e cor do fluido de freio", "Check brake fluid level and color"), T("Verificar se há ar no sistema (pede sangria)", "Check for air in the system (needs bleeding)"), T("Procurar vazamentos nas rodas", "Look for leaks at the wheels"), T("Pedir orçamento detalhado", "Ask for an itemized quote")],
  },
  {
    id: "brake-pull",
    label: T("Carro puxa para um lado ao frear", "Car pulls to one side when braking"),
    category: "brakes",
    causes: [T("Pinça travada de um lado", "Seized caliper on one side"), T("Pastilhas desgastadas de forma desigual", "Unevenly worn pads"), T("Pressão dos pneus diferente", "Uneven tire pressure")],
    urgency: { level: "medium", text: T("Médio – afeta a segurança em frenagens fortes", "Medium – affects safety under hard braking") },
    price: "R$ 150–700",
    observe: [T("Puxa só ao frear ou o tempo todo?", "Pulls only when braking or all the time?"), T("Para qual lado puxa?", "Which side does it pull to?")],
    checklist: [T("Verificar pinças e pistões", "Check calipers and pistons"), T("Medir espessura das pastilhas dos dois lados", "Measure pad thickness on both sides"), T("Conferir a pressão dos pneus", "Check tire pressure"), T("Pedir orçamento detalhado", "Ask for an itemized quote")],
  },

  // ── Suspensão / Direção ──────────────────────────────────
  {
    id: "steering-hard",
    label: T("Direção pesada ou dura", "Heavy or stiff steering"),
    category: "suspension",
    causes: [T("Fluido da direção hidráulica baixo", "Low power-steering fluid"), T("Bomba ou correia da direção", "Steering pump or belt"), T("Sensor/motor da direção elétrica", "Electric steering sensor/motor")],
    urgency: { level: "medium", text: T("Médio – piora a dirigibilidade; verifique logo", "Medium – hurts handling; check soon") },
    price: "R$ 150–1.500",
    observe: [T("Fica dura a frio ou o tempo todo?", "Stiff when cold or all the time?"), T("Acendeu alguma luz de direção no painel?", "Any steering warning light on?")],
    checklist: [T("Verificar fluido (se hidráulica)", "Check fluid (if hydraulic)"), T("Checar correia e bomba", "Check belt and pump"), T("Ler códigos da direção elétrica", "Read electric-steering codes"), T("Pedir orçamento detalhado", "Ask for an itemized quote")],
  },
  {
    id: "suspension-bounce",
    label: T("Carro balançando demais", "Car floating / bouncing too much"),
    category: "suspension",
    causes: [T("Amortecedores gastos", "Worn shocks"), T("Molas fracas", "Weak springs"), T("Batentes e coxins", "Bump stops and mounts")],
    urgency: { level: "medium", text: T("Médio – aumenta a distância de frenagem", "Medium – increases braking distance") },
    price: "R$ 400–1.800",
    observe: [T("Continua balançando depois de uma lombada?", "Keeps bouncing after a speed bump?"), T("Desce mais de um lado?", "Sits lower on one side?")],
    checklist: [T("Teste de amortecedores (bate-e-solta)", "Bounce test on the shocks"), T("Verificar molas e batentes", "Check springs and bump stops"), T("Se trocar amortecedores: alinhar e balancear depois", "If replacing shocks: align and balance afterward"), T("Pedir orçamento detalhado", "Ask for an itemized quote")],
  },

  // ── Pneus & Rodas ────────────────────────────────────────
  {
    id: "tire-uneven-wear",
    label: T("Desgaste irregular dos pneus", "Uneven tire wear"),
    category: "tires",
    causes: [T("Alinhamento/geometria", "Alignment/geometry"), T("Balanceamento", "Balancing"), T("Suspensão desgastada", "Worn suspension")],
    urgency: { level: "medium", text: T("Médio – encurta a vida do pneu e da segurança", "Medium – shortens tire life and safety") },
    price: "R$ 80–500",
    observe: [T("Gasta mais na borda interna ou externa?", "Wears more on the inner or outer edge?"), T("O volante está centralizado em reta?", "Is the wheel centered when going straight?")],
    checklist: [T("Verificar alinhamento e geometria", "Check alignment and geometry"), T("Inspecionar componentes da suspensão", "Inspect suspension parts"), T("Conferir se o rodízio dos pneus está em dia", "Check whether tire rotation is up to date"), T("Conferir a pressão correta", "Check for correct pressure")],
  },
  {
    id: "tire-pressure-loss",
    label: T("Pneu perdendo pressão", "Tire losing pressure"),
    category: "tires",
    causes: [T("Furo ou objeto no pneu", "Puncture or object in the tire"), T("Válvula com vazamento", "Leaking valve"), T("Roda empenada / borda oxidada", "Bent wheel / corroded bead")],
    urgency: { level: "medium", text: T("Médio – calibre e inspecione antes de rodar muito", "Medium – inflate and inspect before driving far") },
    price: "R$ 30–300",
    observe: [T("Esvazia rápido ou aos poucos?", "Deflates fast or slowly?"), T("Só um pneu ou vários?", "One tire or several?")],
    checklist: [T("Localizar o furo (água e sabão)", "Find the leak (soapy water)"), T("Verificar a válvula", "Check the valve"), T("Conferir se a roda está empenada", "Check if the wheel is bent"), T("Avaliar se o pneu tem reparo ou precisa trocar", "Assess whether the tire can be repaired or must be replaced")],
  },

  // ── Elétrica ─────────────────────────────────────────────
  {
    id: "battery-draining",
    label: T("Bateria descarregando", "Battery draining"),
    category: "electrical",
    causes: [T("Bateria no fim da vida", "Battery at end of life"), T("Alternador não carrega", "Alternator not charging"), T("Fuga de corrente (algo ligado)", "Parasitic drain (something on)")],
    urgency: { level: "high", text: T("Alto – pode te deixar na mão", "High – could strand you") },
    price: "R$ 350–900",
    observe: [T("Descarrega da noite pro dia?", "Drains overnight?"), T("A luz da bateria acende andando?", "Does the battery light come on while driving?")],
    checklist: [T("Testar carga da bateria", "Test battery charge"), T("Medir saída do alternador", "Measure alternator output"), T("Procurar fuga de corrente", "Check for parasitic drain"), T("Pedir orçamento detalhado", "Ask for an itemized quote")],
  },
  {
    id: "lights-dim",
    label: T("Luzes fracas ou piscando", "Dim or flickering lights"),
    category: "electrical",
    causes: [T("Alternador irregular", "Irregular alternator"), T("Bateria ou terminais ruins", "Bad battery or terminals"), T("Mau contato / aterramento", "Poor contact / grounding")],
    urgency: { level: "medium", text: T("Médio – pode indicar problema de carga", "Medium – may point to a charging problem") },
    price: "R$ 80–800",
    observe: [T("Enfraquecem em marcha lenta?", "Do they dim at idle?"), T("Piora ao ligar o ar ou o som?", "Worse with A/C or stereo on?")],
    checklist: [T("Medir tensão com o motor ligado", "Measure voltage with engine running"), T("Verificar terminais (folga e oxidação)", "Check terminals (looseness and corrosion)"), T("Verificar alternador", "Check the alternator"), T("Checar aterramentos", "Check grounding points")],
  },
  {
    id: "ac-not-cooling",
    label: T("Ar-condicionado não gela", "A/C not cooling"),
    category: "electrical",
    causes: [T("Gás do ar baixo / vazamento", "Low refrigerant / leak"), T("Compressor", "Compressor"), T("Filtro de cabine sujo", "Dirty cabin filter")],
    urgency: { level: "low", text: T("Baixo – conforto; resolva quando puder", "Low – comfort; handle when convenient") },
    price: "R$ 120–1.500",
    observe: [T("Sai ar, mas quente?", "Air comes out, but warm?"), T("Faz barulho ao ligar o A/C?", "Any noise when turning on A/C?")],
    checklist: [T("Verificar carga de gás e vazamentos", "Check refrigerant charge and leaks"), T("Testar o compressor", "Test the compressor"), T("Verificar filtro de cabine (sujeira)", "Check the cabin filter (dirt)"), T("Avaliar se precisa de higienização", "Assess whether it needs sanitizing")],
  },
];

// Premium-only depth per symptom (ranked prices, shop scripts, regional band).
type SymPremium = { priceDetail: { label: string; range: string }[]; shopSuggests: string[]; questionBefore: string[]; regional: string };
const symptomPremium: Record<string, SymPremium> = {
  "brake-noise": {
    priceDetail: [
      { label: T("Pastilhas dianteiras", "Front pads"), range: "R$ 250–450" },
      { label: T("Discos (par)", "Rotors (pair)"), range: "R$ 400–900" },
      { label: T("Mão de obra", "Labor"), range: "R$ 120–250" },
    ],
    shopSuggests: [T("Trocar pastilhas + discos “por garantia”", "Replace pads AND rotors “to be safe”"), T("Trocar fluido de freio junto", "Change brake fluid too")],
    questionBefore: [T("Os discos realmente estão fora da tolerância? Peça a medição.", "Are the rotors truly out of spec? Ask for the measurement."), T("Dá pra retificar em vez de trocar?", "Can they be resurfaced instead of replaced?")],
    regional: T("Na sua região, freios dianteiros costumam ficar entre R$ 380 e R$ 650.", "In your area, front brakes usually run R$ 380–650."),
  },
  cel: {
    priceDetail: [
      { label: T("Jogo de velas", "Spark plug set"), range: "R$ 120–320" },
      { label: T("Bobina", "Coil"), range: "R$ 180–450" },
      { label: T("Diagnóstico + leitura", "Diagnosis + scan"), range: "R$ 80–150" },
    ],
    shopSuggests: [T("Trocar todo o kit de ignição", "Replace the whole ignition kit"), T("Limpeza de bicos “preventiva”", "“Preventive” injector cleaning")],
    questionBefore: [T("Qual o código exato lido? Peça o número (ex.: P0301).", "What's the exact code? Ask for the number (e.g. P0301)."), T("Dá pra trocar só a peça com defeito?", "Can you replace only the faulty part?")],
    regional: T("Falha de ignição costuma sair por R$ 200–500 na sua região.", "Misfire repairs usually run R$ 200–500 in your area."),
  },
  "hard-start": {
    priceDetail: [
      { label: T("Bateria", "Battery"), range: "R$ 350–700" },
      { label: T("Motor de arranque", "Starter"), range: "R$ 400–900" },
      { label: T("Bomba de combustível", "Fuel pump"), range: "R$ 500–1.200" },
    ],
    shopSuggests: [T("Trocar bateria e arranque juntos", "Replace battery and starter together")],
    questionBefore: [T("Testaram a carga da bateria e o alternador antes?", "Did they test the battery and alternator first?")],
    regional: T("Diagnóstico de partida costuma custar R$ 80–150 na sua região.", "A starting-system diagnosis usually runs R$ 80–150 in your area."),
  },
};


// Subsistemas do carro — grade de navegação em "Problemas".
const problemSystems: { key: SystemKey; label: string; icon: string; sub: string }[] = [
  { key: "engine", label: T("Motor", "Engine"), icon: "engine", sub: T("Partida, força, consumo, luz", "Start, power, consumption, light") },
  { key: "brakes", label: T("Freios", "Brakes"), icon: "brakes", sub: T("Barulho, pedal, frenagem", "Noise, pedal, braking") },
  { key: "suspension", label: T("Suspensão", "Suspension"), icon: "suspension", sub: T("Barulhos, buracos, direção", "Noises, bumps, steering") },
  { key: "tires", label: T("Pneus & Rodas", "Tires & Wheels"), icon: "tires", sub: T("Vibração, desgaste, calibragem", "Vibration, wear, pressure") },
  { key: "electrical", label: T("Elétrica", "Electrical"), icon: "electrical", sub: T("Bateria, partida, luzes", "Battery, starting, lights") },
];

// Peças comuns por tipo de serviço — alimenta o autocomplete de "Peças trocadas".

  return { symptoms, symptomPremium, problemSystems };
}
