import type { Locale } from "@/lib/i18n";
import type { Access, Severity, SystemKey, Vehicle } from "./types";

// All app copy + mocked catalog data, resolved per locale so every screen is
// bilingual. Per-model depth is intentionally generic (the exact model-year
// detail is where Premium / consulting adds value).

// App version shown in the Profile footer.
export const APP_VERSION = "1.0.0";

export function formatBRL(n: number): string {
  return "R$ " + Math.round(n).toLocaleString("pt-BR");
}

// Earliest plausible purchase date for a model year. Brazilian cars launch in
// the second half of the previous calendar year, so we floor at Jan 1 of
// (year - 1) — generous enough to allow the real launch window while blocking
// impossible dates (e.g. a 2025 model "bought" years earlier).
export function minPurchaseDate(year: number): string {
  return `${year - 1}-01-01`;
}

// Months since an ISO date (yyyy-mm-dd), or null if unset/invalid.
export function monthsSinceDate(iso?: string, now = new Date()): number | null {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return null;
  return Math.max(0, (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth()));
}

// Human "1 ano e 2 meses" / "1 year and 2 months" from a month count.
export function formatMonths(n: number, locale: Locale): string {
  const y = Math.floor(n / 12);
  const m = n % 12;
  const pt = locale === "pt";
  const yr = y > 0 ? `${y} ${y === 1 ? (pt ? "ano" : "year") : pt ? "anos" : "years"}` : "";
  const mo = m > 0 ? `${m} ${m === 1 ? (pt ? "mês" : "month") : pt ? "meses" : "months"}` : "";
  if (yr && mo) return `${yr} ${pt ? "e" : "and"} ${mo}`;
  return yr || mo || (pt ? "menos de 1 mês" : "less than 1 month");
}

// "Make Model Year" label for a vehicle.
export function vehicleLabel(v: Vehicle | null, fallback = "—"): string {
  if (!v) return fallback;
  return `${v.make} ${v.model} ${v.year}`;
}

// Short display name for a vehicle: the user's nickname if set, else the model.
export function carName(v: Vehicle | null, fallback = "—"): string {
  if (!v) return fallback;
  return v.nickname || v.model;
}

export function getContent(locale: Locale) {
  const T = (pt: string, en: string) => (locale === "pt" ? pt : en);

  // ---- Vehicle catalog (for Adicionar carro) -------------------------------
  const makes: Record<"car" | "moto", string[]> = {
    car: [
      "Volkswagen", "Chevrolet", "Fiat", "Toyota", "Hyundai", "Honda", "Jeep", "Renault",
      "Nissan", "Ford", "Peugeot", "Citroën", "Caoa Chery", "BYD", "Mitsubishi", "Kia",
      "Ram", "GWM", "Volvo", "BMW", "Mercedes-Benz", "Audi", "Land Rover", "Suzuki",
    ],
    moto: ["Honda", "Yamaha", "Suzuki", "Royal Enfield", "BMW", "Kawasaki"],
  };
  // Car models by make — the ~150 best-sellers in Brazil (current + recent).
  const modelsByMake: Record<string, string[]> = {
    Volkswagen: ["Polo", "Nivus", "T-Cross", "Virtus", "Gol", "Saveiro", "Amarok", "Taos", "Jetta", "Tera", "Voyage", "Fusca", "Fox", "Up!", "Golf", "Tiguan Allspace", "Passat"],
    Chevrolet: ["Onix", "Onix Plus", "Tracker", "Spin", "Montana", "S10", "Equinox", "Trailblazer", "Cruze", "Cruze Sport6", "Blazer", "Cobalt", "Prisma", "Joy"],
    Fiat: ["Strada", "Argo", "Mobi", "Pulse", "Fastback", "Toro", "Cronos", "Fiorino", "Titano", "Ducato", "Uno", "Palio", "Punto", "Grand Siena", "500"],
    Toyota: ["Corolla", "Corolla Cross", "Hilux", "Yaris", "Yaris Sedan", "SW4", "RAV4", "Camry", "Etios", "Etios Sedan"],
    Hyundai: ["HB20", "HB20S", "HB20X", "Creta", "Tucson", "Santa Fe", "ix35", "Azera", "Kona"],
    Honda: ["HR-V", "City", "City Hatchback", "Civic", "WR-V", "ZR-V", "CR-V", "Fit", "Accord"],
    Jeep: ["Renegade", "Compass", "Commander", "Wrangler", "Gladiator"],
    Renault: ["Kwid", "Kardian", "Duster", "Oroch", "Sandero", "Logan", "Stepway", "Captur", "Master", "Megane", "Fluence"],
    Nissan: ["Kicks", "Versa", "Frontier", "Sentra", "March", "Leaf"],
    Ford: ["Ranger", "Territory", "Bronco", "Bronco Sport", "Maverick", "Mustang", "Ka", "Ka Sedan", "EcoSport"],
    Peugeot: ["208", "2008", "3008", "5008", "Partner", "Expert", "Boxer", "308", "408"],
    "Citroën": ["C3", "C3 Aircross", "Basalt", "C4 Cactus", "C4 Lounge", "Jumpy", "Jumper"],
    "Caoa Chery": ["Tiggo 2", "Tiggo 3x", "Tiggo 5x", "Tiggo 7", "Tiggo 7 Pro", "Tiggo 8", "Tiggo 8 Pro", "Arrizo 6"],
    BYD: ["Dolphin", "Dolphin Mini", "Dolphin Plus", "Song Plus", "Song Pro", "Yuan Plus", "Yuan Pro", "Seal", "King", "Han", "Tan"],
    Mitsubishi: ["L200 Triton", "Triton Sport", "Pajero Sport", "Eclipse Cross", "Outlander", "ASX", "Pajero"],
    Kia: ["Sportage", "Seltos", "Sorento", "Stonic", "Carnival", "Cerato", "Bongo"],
    Ram: ["Rampage", "1500", "2500", "3500", "Classic"],
    GWM: ["Haval H6", "Haval H6 GT", "Ora 03", "Poer"],
    Volvo: ["XC40", "XC60", "XC90", "C40", "EX30", "S60", "EX90"],
    BMW: ["320i", "118i", "X1", "X3", "X4", "X5", "X6", "Z4"],
    "Mercedes-Benz": ["C180", "C200", "A200", "GLA 200", "GLB 200", "GLC 300", "Sprinter"],
    Audi: ["A3", "A4", "Q3", "Q5", "Q7", "Q8"],
    "Land Rover": ["Range Rover Evoque", "Discovery Sport", "Defender", "Range Rover Velar", "Discovery"],
    Suzuki: ["Jimny", "Jimny Sierra", "S-Cross", "Vitara"],
  };
  // Motorcycle models by make (kept separate so the car search never lists motos).
  const motoModelsByMake: Record<string, string[]> = {
    Honda: ["CG 160", "Biz", "Pop 110", "Bros 160", "XRE 300", "CB 300", "CB 500", "PCX", "Elite 125", "ADV"],
    Yamaha: ["Fazer 250", "Factor 150", "YBR 150", "Crosser 150", "MT-03", "MT-07", "NMAX", "Lander 250", "XTZ 250"],
    Suzuki: ["Intruder 150", "GSX-S750", "Burgman", "DR 160", "GSX-R1000"],
    "Royal Enfield": ["Meteor 350", "Hunter 350", "Classic 350", "Bullet 350", "Himalayan"],
    BMW: ["G 310", "F 850 GS", "R 1250 GS", "S 1000 RR"],
    Kawasaki: ["Ninja 400", "Z400", "Versys 650", "Ninja 650"],
  };
  const years = Array.from({ length: 27 }, (_, i) => 2026 - i);

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
        T("Trocar filtro de ar e de combustível", "Replace air and fuel filters"),
        T("Limpeza de bicos injetores", "Clean the injectors"),
        T("Calibrar os pneus", "Set tire pressure"),
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
        T("Balancear e alinhar", "Balance and align"),
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
        T("Trocar peças aos pares", "Replace parts in pairs"),
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
      checklist: [T("Verificar velas, cabos e bobinas", "Check plugs, wires and coils"), T("Ler códigos com scanner OBD2", "Read codes with an OBD2 scanner"), T("Limpeza de bicos injetores", "Clean the injectors"), T("Pedir orçamento detalhado", "Ask for an itemized quote")],
    },
    {
      id: "engine-power-loss",
      label: T("Perda de força", "Loss of power"),
      category: "engine",
      causes: [T("Filtro de ar ou combustível sujo", "Dirty air or fuel filter"), T("Turbo / pressão", "Turbo / boost"), T("Sensor de fluxo de ar (MAF)", "Air-flow sensor (MAF)")],
      urgency: { level: "medium", text: T("Médio – diagnostique antes de viagens longas", "Medium – diagnose before long trips") },
      price: "R$ 150–1.200",
      observe: [T("Entrou em 'modo de emergência' (rpm limitado)?", "Did it go into limp mode (limited rpm)?"), T("Perdeu força de repente ou aos poucos?", "Sudden or gradual power loss?")],
      checklist: [T("Trocar filtros de ar e combustível", "Replace air and fuel filters"), T("Ler códigos OBD2", "Read OBD2 codes"), T("Verificar sistema de turbo/admissão", "Check the turbo/intake system"), T("Pedir orçamento detalhado", "Ask for an itemized quote")],
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
      checklist: [T("Verificar nível e cor do fluido de freio", "Check brake fluid level and color"), T("Sangrar o sistema (tirar o ar)", "Bleed the system (remove air)"), T("Procurar vazamentos nas rodas", "Look for leaks at the wheels"), T("Pedir orçamento detalhado", "Ask for an itemized quote")],
    },
    {
      id: "brake-pull",
      label: T("Carro puxa para um lado ao frear", "Car pulls to one side when braking"),
      category: "brakes",
      causes: [T("Pinça travada de um lado", "Seized caliper on one side"), T("Pastilhas desgastadas de forma desigual", "Unevenly worn pads"), T("Pressão dos pneus diferente", "Uneven tire pressure")],
      urgency: { level: "medium", text: T("Médio – afeta a segurança em frenagens fortes", "Medium – affects safety under hard braking") },
      price: "R$ 150–700",
      observe: [T("Puxa só ao frear ou o tempo todo?", "Pulls only when braking or all the time?"), T("Para qual lado puxa?", "Which side does it pull to?")],
      checklist: [T("Verificar pinças e pistões", "Check calipers and pistons"), T("Medir espessura das pastilhas dos dois lados", "Measure pad thickness on both sides"), T("Calibrar os pneus", "Set tire pressure"), T("Pedir orçamento detalhado", "Ask for an itemized quote")],
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
      checklist: [T("Teste de amortecedores (bate-e-solta)", "Bounce test on the shocks"), T("Verificar molas e batentes", "Check springs and bump stops"), T("Alinhar e balancear depois", "Align and balance afterward"), T("Pedir orçamento detalhado", "Ask for an itemized quote")],
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
      checklist: [T("Alinhar e balancear", "Align and balance"), T("Inspecionar componentes da suspensão", "Inspect suspension parts"), T("Fazer rodízio dos pneus", "Rotate the tires"), T("Calibrar corretamente", "Set correct pressure")],
    },
    {
      id: "tire-pressure-loss",
      label: T("Pneu perdendo pressão", "Tire losing pressure"),
      category: "tires",
      causes: [T("Furo ou objeto no pneu", "Puncture or object in the tire"), T("Válvula com vazamento", "Leaking valve"), T("Roda empenada / borda oxidada", "Bent wheel / corroded bead")],
      urgency: { level: "medium", text: T("Médio – calibre e inspecione antes de rodar muito", "Medium – inflate and inspect before driving far") },
      price: "R$ 30–300",
      observe: [T("Esvazia rápido ou aos poucos?", "Deflates fast or slowly?"), T("Só um pneu ou vários?", "One tire or several?")],
      checklist: [T("Localizar o furo (água e sabão)", "Find the leak (soapy water)"), T("Verificar a válvula", "Check the valve"), T("Conferir se a roda está empenada", "Check if the wheel is bent"), T("Reparar ou trocar o pneu", "Repair or replace the tire")],
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
      checklist: [T("Medir tensão com o motor ligado", "Measure voltage with engine running"), T("Limpar e apertar terminais", "Clean and tighten terminals"), T("Verificar alternador", "Check the alternator"), T("Checar aterramentos", "Check grounding points")],
    },
    {
      id: "ac-not-cooling",
      label: T("Ar-condicionado não gela", "A/C not cooling"),
      category: "electrical",
      causes: [T("Gás do ar baixo / vazamento", "Low refrigerant / leak"), T("Compressor", "Compressor"), T("Filtro de cabine sujo", "Dirty cabin filter")],
      urgency: { level: "low", text: T("Baixo – conforto; resolva quando puder", "Low – comfort; handle when convenient") },
      price: "R$ 120–1.500",
      observe: [T("Sai ar, mas quente?", "Air comes out, but warm?"), T("Faz barulho ao ligar o A/C?", "Any noise when turning on A/C?")],
      checklist: [T("Verificar carga de gás e vazamentos", "Check refrigerant charge and leaks"), T("Testar o compressor", "Test the compressor"), T("Trocar filtro de cabine", "Replace the cabin filter"), T("Higienizar o sistema", "Sanitize the system")],
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

  // ---- Learn content (2.6) -------------------------------------------------
  // `media` makes the lesson playable in-app. provider "mp4" plays a direct file
  // (self-host: Supabase Storage / R2 / Mux / Cloudflare Stream); "youtube"/
  // "vimeo" embed via iframe. Swap `src` for real content.
  type Media = { provider: "mp4" | "youtube" | "vimeo"; src: string; poster?: string };
  // A study item. Tutorials use need/steps/safety; articles use `body`
  // (paragraphs). `track` places it in the knowledge tree; make/model tag
  // manufacturer- and model-specific content.
  type Lesson = {
    id: string;
    title: string;
    type: "video" | "article" | "checklist";
    track: string;
    system: SystemKey | "geral";
    premium?: boolean;
    make?: string;
    model?: string;
    difficulty?: "facil" | "medio" | "avancado";
    media?: Media;
    body?: string[];
    need: string[];
    steps: string[];
    stepsByLevel?: { iniciante: string[]; avancado: string[]; mecanico: string[] };
    safety: string[];
  };
  // Helper for article-style items (no tool list / safety block).
  const art = (o: { id: string; title: string; track: string; system?: SystemKey | "geral"; premium?: boolean; make?: string; model?: string; body: string[]; media?: Media; type?: "video" | "article" | "checklist" }): Lesson => ({
    id: o.id, title: o.title, track: o.track, system: o.system ?? "geral", premium: o.premium,
    make: o.make, model: o.model, media: o.media, type: o.type ?? "article", body: o.body,
    need: [], steps: [], safety: [],
  });
  const lessons: Lesson[] = [
    {
      id: "oil-change",
      track: "diy",
      title: T("Como trocar o óleo (passo a passo)", "How to change the oil (step by step)"),
      type: "video",
      system: "engine",
      // TODO: troque pelo link/ID do YouTube real desta aula (aceita URL completa ou só o ID).
      media: { provider: "youtube", src: "jNQXAC9IVRw" },
      need: [T("Óleo e filtro corretos", "Correct oil and filter"), T("Chave de filtro e bacia", "Filter wrench and drain pan"), T("Luvas", "Gloves")],
      steps: [T("Aqueça o motor e desligue", "Warm the engine, then turn off"), T("Drene o óleo velho", "Drain the old oil"), T("Troque o filtro", "Replace the filter"), T("Complete com o óleo novo e confira o nível", "Refill and check the level")],
      stepsByLevel: {
        iniciante: [
          T("Estacione num lugar plano, puxe o freio de mão e deixe o motor ligado 2-3 min só pra amornar o óleo (morno escorre melhor). Depois desligue e tire a chave.", "Park on a flat spot, set the handbrake and let the engine run 2-3 min just to warm the oil (warm oil flows better). Then switch off and remove the key."),
          T("Abra o capô (alavanca embaixo do painel, lado do motorista, + trava na frente do carro). Em cima do motor, ache a tampa de óleo — geralmente tem o desenho de uma lata de óleo. Abra: ajuda o óleo velho a escorrer.", "Open the hood (lever under the dash on the driver's side + latch at the front). On top of the engine find the oil filler cap — usually marked with an oil-can icon. Open it: it helps the old oil drain."),
          T("Levante o carro com o macaco num ponto firme e ponha os cavaletes (NUNCA fique embaixo só com o macaco). Embaixo do motor, ache o bujão de dreno: um parafuso grande sextavado no ponto mais baixo do cárter (a 'panela' de metal embaixo do motor).", "Lift the car with the jack at a solid point and set the stands (NEVER get under it on the jack alone). Under the engine find the drain plug: a large hex bolt at the lowest point of the oil pan (the metal 'pan' under the engine)."),
          T("Ponha a bacia embaixo do bujão. Com a chave, gire o bujão no sentido anti-horário até soltar e deixe TODO o óleo velho escorrer (5-10 min). Cuidado, pode estar morno. Recoloque o bujão e aperte firme (sem exagerar).", "Put the pan under the plug. With a wrench, turn the plug counterclockwise to loosen it and let ALL the old oil drain (5-10 min). Careful, it may be warm. Refit the plug and tighten firmly (don't overdo it)."),
          T("Ache o filtro de óleo: um cilindro (metal ou plástico) rosqueado no bloco do motor. Com a chave de filtro, gire anti-horário e remova. Passe um pouco de óleo novo na borrachinha de vedação do filtro novo e rosqueie à mão até encostar + 3/4 de volta.", "Find the oil filter: a cylinder (metal or plastic) screwed into the engine block. With the filter wrench, turn it counterclockwise and remove. Smear a little new oil on the new filter's rubber seal and screw it on by hand until it seats + 3/4 turn."),
          T("Com o carro no chão de novo, despeje o óleo novo aos poucos pela tampa de cima. Confira o nível pela vareta (a haste com alça, quase sempre amarela): deve ficar entre as marcas MIN e MAX.", "With the car back on the ground, pour the new oil slowly through the top cap. Check the level with the dipstick (the handled rod, almost always yellow): it should sit between the MIN and MAX marks."),
          T("Ligue o motor 1 min, desligue, espere 2 min e confira o nível de novo pela vareta. Complete se faltar. Olhe embaixo: não pode ter vazamento no bujão nem no filtro.", "Run the engine 1 min, switch off, wait 2 min and check the dipstick again. Top up if needed. Look underneath: there should be no leak at the plug or the filter."),
        ],
        avancado: [T("Aqueça o motor e desligue", "Warm the engine, then turn off"), T("Drene o óleo velho pelo bujão do cárter", "Drain the old oil via the sump plug"), T("Troque o filtro (lubrifique o o-ring)", "Replace the filter (oil the o-ring)"), T("Complete com o óleo/viscosidade corretos e confira o nível", "Refill with the correct oil/viscosity and check the level")],
        mecanico: [T("Motor na temperatura, veículo nivelado sobre cavaletes.", "Engine at temp, vehicle level on stands."), T("Dreno: solte o bujão, drene, troque a arruela, reaperte no torque de spec (~25-30 N·m, confira o manual).", "Drain: pull the plug, drain, replace the crush washer, torque to spec (~25-30 N·m, check the manual)."), T("Filtro: remova, lubrifique o o-ring novo, rosqueie 3/4 de volta após contato.", "Filter: remove, oil the new o-ring, 3/4 turn after contact."), T("Reabasteça na viscosidade de spec, cheque a vareta, dê partida, verifique estanqueidade e complete.", "Refill to spec viscosity, check the dipstick, start, verify for leaks and top up.")],
      },
      safety: [T("Motor morno, nunca quente", "Warm engine, never hot"), T("Descarte o óleo em ponto de coleta", "Dispose of oil at a collection point")],
    },
    {
      id: "brake-pads",
      track: "diy",
      title: T("Trocar a pastilha de freio", "Replace the brake pads"),
      type: "video",
      system: "brakes",
      premium: true,
      // TODO: troque pelo link/ID do YouTube real desta aula (aceita URL completa ou só o ID).
      media: { provider: "youtube", src: "jNQXAC9IVRw" },
      need: [T("Pastilhas novas", "New pads"), T("Macaco e cavalete", "Jack and stands"), T("Chave de roda", "Lug wrench")],
      steps: [T("Suspenda e remova a roda", "Lift and remove the wheel"), T("Solte a pinça", "Unbolt the caliper"), T("Troque as pastilhas", "Swap the pads"), T("Monte e teste o freio devagar", "Reassemble and test brakes gently")],
      stepsByLevel: {
        iniciante: [
          T("Com o carro ainda no chão, afrouxe (só um pouco) as porcas da roda. Depois levante com o macaco num ponto firme, ponha o cavalete e remova a roda.", "With the car still on the ground, slightly loosen the wheel nuts. Then lift with the jack at a solid point, set the stand and remove the wheel."),
          T("Atrás da roda está a pinça de freio: uma peça de metal 'abraçando' o disco (a peça redonda e lisa). Ela é presa por 2 parafusos atrás — solte-os e levante a pinça. Não a deixe pendurada pela mangueira: apoie num gancho ou arame.", "Behind the wheel is the caliper: a metal part 'hugging' the disc (the round, smooth part). It's held by 2 bolts at the back — undo them and lift the caliper. Don't let it hang by the hose: rest it on a hook or wire."),
          T("As pastilhas são as duas plaquinhas com material de atrito, uma de cada lado do disco. Tire as velhas observando a posição. Empurre o pistão da pinça de volta devagar (uma ferramenta de recuo ou um grampo tipo sargento ajuda) pra caber a pastilha nova, mais grossa.", "The pads are the two plates with friction material, one on each side of the disc. Remove the old ones, noting their position. Push the caliper piston back slowly (a wind-back tool or a C-clamp helps) so the thicker new pad fits."),
          T("Encaixe as pastilhas novas no mesmo lugar das velhas, recoloque a pinça e aperte os 2 parafusos firme. Repita no outro lado do MESMO eixo (freio se troca sempre em par).", "Fit the new pads where the old ones were, refit the caliper and tighten the 2 bolts firmly. Repeat on the other side of the SAME axle (brakes are always replaced in pairs)."),
          T("Monte a roda, abaixe o carro e aperte as porcas em cruz. ANTES de sair, pise no pedal de freio várias vezes até ele endurecer (as pastilhas precisam encostar no disco). Faça as primeiras freadas devagar.", "Refit the wheel, lower the car and tighten the nuts in a star pattern. BEFORE driving, press the brake pedal several times until it firms up (the pads need to seat against the disc). Take the first few stops gently."),
        ],
        avancado: [T("Suspenda e remova a roda", "Lift and remove the wheel"), T("Solte a pinça (2 parafusos) e apoie sem tensionar a mangueira", "Unbolt the caliper (2 bolts) and support it without stressing the hose"), T("Recolha o pistão e troque as pastilhas em par", "Wind the piston back and replace the pads in pairs"), T("Monte, aperte no torque e bombeie o pedal antes de testar", "Reassemble, torque and pump the pedal before testing")],
        mecanico: [T("Roda fora, veículo em cavalete.", "Wheel off, vehicle on stands."), T("Solte a pinça (2 parafusos), suspenda sem tensionar a mangueira.", "Unbolt the caliper (2 bolts), support without stressing the hose."), T("Recolha o pistão, troque as pastilhas em par por eixo, cheque disco/espessura.", "Wind the piston back, replace pads in pairs per axle, check disc/thickness."), T("Remonte no torque, bombeie o pedal, teste em baixa antes de liberar.", "Reassemble to torque, pump the pedal, test at low speed before release.")],
      },
      safety: [T("Use cavalete, nunca só o macaco", "Use stands, never the jack alone"), T("Bombeie o pedal antes de sair", "Pump the pedal before driving")],
    },
    {
      id: "read-obd2",
      track: "diagnosis",
      title: T("Lendo códigos OBD2", "Reading OBD2 codes"),
      type: "article",
      system: "engine",
      premium: true,
      need: [T("Adaptador OBD2", "OBD2 adapter"), T("App de leitura", "A reader app")],
      steps: [T("Conecte o adaptador", "Plug in the adapter"), T("Leia os códigos ativos", "Read active codes"), T("Anote e pesquise cada código", "Note and look up each code")],
      safety: [T("Não dirija com a luz piscando", "Don't drive with a flashing light")],
    },
    {
      id: "basics",
      track: "fundamentals",
      title: T("Mecânica básica para donos", "Basic mechanics for owners"),
      type: "article",
      system: "geral",
      need: [T("Só vontade de aprender", "Just the will to learn")],
      steps: [T("Entenda os sistemas do carro", "Understand your car's systems"), T("Aprenda a ler o painel", "Learn to read the dashboard"), T("Saiba o básico de manutenção", "Know maintenance basics")],
      safety: [T("Na dúvida, procure a equipe", "When in doubt, ask the team")],
    },
    {
      id: "tire-care",
      track: "diy",
      title: T("Cuidando dos pneus", "Taking care of your tires"),
      type: "article",
      system: "tires",
      need: [T("Calibrador", "Pressure gauge")],
      steps: [T("Calibre a cada 15 dias", "Check pressure every 2 weeks"), T("Faça rodízio a cada 10 mil km", "Rotate every 10,000 km"), T("Observe o desgaste", "Watch for uneven wear")],
      safety: [T("Calibre com pneu frio", "Set pressure on cold tires")],
    },

    // ── Fundamentos ─────────────────────────────────────────────
    art({ id: "fund-systems", track: "fundamentals", title: T("Os 6 sistemas do carro", "The 6 systems of a car"), body: [
      T("Todo carro é a soma de seis sistemas: motor (gera força), transmissão (leva a força às rodas), freios, suspensão, direção e elétrica.", "Every car is the sum of six systems: engine (makes power), transmission (sends it to the wheels), brakes, suspension, steering and electrical."),
      T("Entender o que cada um faz te ajuda a saber onde está o problema quando algo sai do normal — e a conversar de igual pra igual com a oficina.", "Understanding what each one does helps you locate a problem when something feels off — and talk to the shop on equal footing."),
    ]}),
    art({ id: "fund-dashboard", track: "fundamentals", title: T("Luzes do painel: o que significam", "Dashboard lights: what they mean"), body: [
      T("Verde/azul é informação. Amarelo é atenção: resolva em breve. Vermelho é pare agora — óleo, temperatura ou freio.", "Green/blue is information. Yellow means attention: fix it soon. Red means stop now — oil, temperature or brakes."),
      T("Se a luz do motor pisca, evite acelerar e procure diagnóstico. Fixa, dá pra rodar com cuidado até a oficina.", "If the engine light flashes, avoid accelerating and get it diagnosed. Steady, you can drive gently to the shop."),
    ]}),
    art({ id: "fund-fluids", track: "fundamentals", title: T("Os 5 fluidos essenciais", "The 5 essential fluids"), system: "engine", body: [
      T("Óleo do motor, fluido de freio, líquido de arrefecimento, fluido de direção e água do limpador. Cada um tem cor e função próprias.", "Engine oil, brake fluid, coolant, steering fluid and washer water. Each has its own color and job."),
      T("Verificar os níveis a cada abastecimento leva 2 minutos e evita a maioria das panes graves.", "Checking levels at each fill-up takes 2 minutes and prevents most serious breakdowns."),
    ]}),
    { id: "fund-calendar", track: "fundamentals", title: T("Calendário de manutenção", "Maintenance calendar"), type: "checklist", system: "geral",
      need: [], body: [T("Um roteiro do que revisar e quando.", "A guide of what to check and when.")],
      steps: [T("Óleo e filtro: a cada 10 mil km ou 1 ano", "Oil and filter: every 10,000 km or 1 year"), T("Pneus: rodízio a cada 10 mil km, calibragem quinzenal", "Tires: rotate every 10,000 km, pressure every 2 weeks"), T("Freios: inspeção a cada 20 mil km", "Brakes: inspect every 20,000 km"), T("Correia dentada: 50–60 mil km (ver manual)", "Timing belt: 50–60k km (see manual)"), T("Fluido de freio: a cada 2 anos", "Brake fluid: every 2 years")],
      safety: [] },

    // ── Faça Você Mesmo (DIY) ──────────────────────────────────
    { id: "diy-battery", track: "diy", title: T("Trocar a bateria", "Replace the battery"), type: "video", system: "electrical", difficulty: "facil",
      media: { provider: "youtube", src: "jNQXAC9IVRw" }, body: [],
      need: [T("Bateria nova compatível", "Compatible new battery"), T("Chave de boca 10mm", "10mm wrench")],
      steps: [T("Desligue tudo e solte o polo negativo (−) primeiro", "Turn everything off and remove the negative (−) first"), T("Solte o positivo (+) e a presilha", "Remove the positive (+) and the clamp"), T("Troque a bateria e reaperte na ordem inversa", "Swap the battery and refit in reverse order")],
      stepsByLevel: {
        iniciante: [
          T("Carro desligado e chave fora. Abra o capô e ache a bateria: uma caixa retangular com 2 bornes em cima, um marcado (+) e outro (−). Se o rádio tiver senha, tenha o código à mão (ele apaga sem energia).", "Car off and key out. Open the hood and find the battery: a rectangular box with 2 terminals on top, one marked (+) and one (−). If the radio has a code, have it handy (it resets without power)."),
          T("SEMPRE comece pelo negativo (−, quase sempre cabo preto): solte a porca do borne com a chave (geralmente 10mm) e afaste o cabo pro lado, sem deixar encostar em nada de metal.", "ALWAYS start with the negative (−, almost always the black cable): loosen the terminal nut with the wrench (usually 10mm) and move the cable aside, not letting it touch any metal."),
          T("Depois solte o positivo (+, cabo vermelho) e a presilha/suporte que prende a bateria. Retire a bateria velha com cuidado — ela é pesada.", "Then loosen the positive (+, red cable) and the clamp/bracket holding the battery. Lift out the old battery carefully — it's heavy."),
          T("Ponha a nova na mesma posição, prenda o suporte, e reconecte na ORDEM INVERSA: primeiro o positivo (+), depois o negativo (−). Aperte bem os dois bornes.", "Put the new one in the same position, secure the bracket, and reconnect in REVERSE ORDER: positive (+) first, then negative (−). Tighten both terminals well."),
          T("Passe um pouco de vaselina/spray nos bornes contra corrosão. Ligue o carro pra testar. Se o rádio pedir código, digite o do manual.", "Dab a little grease/spray on the terminals against corrosion. Start the car to test. If the radio asks for a code, enter the one from the manual."),
        ],
        avancado: [T("Desligue tudo; solte o negativo (−) primeiro", "Everything off; remove the negative (−) first"), T("Solte o positivo (+) e a presilha", "Remove the positive (+) and the clamp"), T("Instale a nova e reconecte (+) depois (−)", "Fit the new one and reconnect (+) then (−)"), T("Proteja os bornes e teste a partida", "Protect the terminals and test the start")],
        mecanico: [T("Ignição off; preserve memória se necessário (alimentação auxiliar).", "Ignition off; preserve memory if needed (aux power)."), T("Desconecte (−), depois (+); remova a fixação.", "Disconnect (−), then (+); remove the hold-down."), T("Instale bateria de spec, fixe, reconecte (+) e (−); proteja bornes.", "Fit spec battery, secure, reconnect (+) and (−); protect terminals."), T("Teste carga/alternador; reprograme módulos se aplicável.", "Test charge/alternator; reprogram modules if applicable.")],
      },
      safety: [T("Negativo sai primeiro, entra por último", "Negative off first, on last"), T("Não encoste as duas chaves nos polos", "Don't bridge both terminals")] },
    { id: "diy-airfilter", track: "diy", title: T("Trocar o filtro de ar", "Replace the air filter"), type: "video", system: "engine", difficulty: "facil",
      media: { provider: "youtube", src: "jNQXAC9IVRw" }, body: [],
      need: [T("Filtro de ar novo", "New air filter")],
      steps: [T("Abra a caixa do filtro (presilhas ou parafusos)", "Open the airbox (clips or screws)"), T("Retire o filtro velho e limpe a caixa", "Remove the old filter and clean the box"), T("Encaixe o novo na posição correta e feche", "Fit the new one the right way and close")],
      stepsByLevel: {
        iniciante: [
          T("Motor frio e desligado. Abra o capô e ache a caixa do filtro de ar: uma caixa de plástico preta, geralmente grande, ligada a uma mangueira grossa que vai pro motor.", "Engine cold and off. Open the hood and find the airbox: a large black plastic box, usually connected to a thick hose going to the engine."),
          T("Abra a caixa: solte as presilhas de metal nas laterais (ou os parafusos, dependendo do carro) e levante a tampa.", "Open the box: release the metal clips on the sides (or the screws, depending on the car) and lift the lid."),
          T("Tire o filtro velho (parece uma sanfona de papel numa moldura). Repare o lado que fica pra cima. Limpe a poeira de dentro da caixa com um pano — não deixe cair nada na mangueira.", "Remove the old filter (it looks like a paper accordion in a frame). Note which side faces up. Wipe the dust inside the box with a cloth — don't let anything fall into the hose."),
          T("Coloque o filtro novo na mesma posição do velho, encaixando a borracha na borda. Feche a tampa e prenda as presilhas/parafusos. Confirme que fechou bem, sem folga.", "Put the new filter in the same position as the old one, seating the rubber on the edge. Close the lid and secure the clips/screws. Make sure it's fully closed, no gaps."),
        ],
        avancado: [T("Abra a caixa do filtro (presilhas ou parafusos)", "Open the airbox (clips or screws)"), T("Retire o filtro velho e limpe a carcaça", "Remove the old filter and clean the housing"), T("Encaixe o novo alinhado e feche vedando bem", "Fit the new one aligned and close it sealed")],
        mecanico: [T("Motor frio. Abra o airbox (presilhas/parafusos).", "Engine cold. Open the airbox (clips/screws)."), T("Remova o elemento, limpe a carcaça, verifique vedação.", "Remove the element, clean the housing, check sealing."), T("Instale o novo alinhado, feche garantindo estanqueidade da admissão.", "Fit the new one aligned, close ensuring intake sealing.")],
      },
      safety: [T("Não ligue o motor com a caixa aberta", "Don't run the engine with the box open")] },
    { id: "diy-wipers", track: "diy", title: T("Trocar as palhetas do limpador", "Replace the wiper blades"), type: "video", system: "electrical", difficulty: "facil",
      media: { provider: "youtube", src: "jNQXAC9IVRw" }, body: [],
      need: [T("Palhetas do tamanho correto", "Correct-size blades")],
      steps: [T("Levante o braço e aperte a trava", "Lift the arm and press the tab"), T("Deslize a palheta velha para fora", "Slide the old blade out"), T("Encaixe a nova até ouvir o clique", "Clip the new one until it clicks")],
      stepsByLevel: {
        iniciante: [
          T("Levante o braço do limpador afastando-o do vidro até ele travar em pé. Cuidado pra não soltar e ele bater no para-brisa (pode trincar).", "Lift the wiper arm away from the glass until it locks upright. Be careful not to let it snap back onto the windshield (it can crack it)."),
          T("Ache a trava: um botão/lingueta onde a palheta encaixa no braço. Aperte a lingueta e deslize a palheta velha pra baixo, saindo do gancho do braço.", "Find the latch: a tab/button where the blade clips onto the arm. Press the tab and slide the old blade downward, off the arm's hook."),
          T("Pegue a palheta nova do tamanho certo pra aquele lado (os dois lados costumam ter tamanhos diferentes). Encaixe no gancho e empurre até ouvir um CLIQUE.", "Take the new blade of the correct size for that side (the two sides are usually different lengths). Clip it onto the hook and push until it CLICKS."),
          T("Abaixe o braço com cuidado de volta no vidro. Faça o mesmo no outro limpador. Teste com o vidro molhado (nunca a seco, pra não riscar).", "Lower the arm carefully back onto the glass. Do the same on the other wiper. Test with the glass wet (never dry, to avoid scratching)."),
        ],
        avancado: [T("Levante o braço até travar", "Lift the arm until it locks"), T("Aperte a trava e remova a palheta velha", "Press the tab and remove the old blade"), T("Encaixe a nova (tamanho por lado) até o clique e teste molhado", "Clip the new one (size per side) until it clicks and test wet")],
        mecanico: [T("Levante o braço, trave.", "Lift the arm, lock."), T("Solte a lingueta, remova a palheta.", "Release the tab, remove the blade."), T("Encaixe a nova (tamanho por lado) até o clique; teste com vidro molhado.", "Clip the new one (size per side) until it clicks; test with wet glass.")],
      },
      safety: [T("Segure o braço para não bater no vidro", "Hold the arm so it doesn't snap onto the glass")] },

    // ── Diagnóstico ────────────────────────────────────────────
    art({ id: "diag-noises", track: "diagnosis", title: T("Que barulho é esse? Guia de sons", "What's that noise? Sound guide"), body: [
      T("Chiado ao frear = pastilha no fim. Batida em buraco = suspensão. Assobio ao acelerar = correia ou admissão. Estalo ao esterçar = homocinética.", "Squeal when braking = pads worn. Knock over bumps = suspension. Whistle on throttle = belt or intake. Click when turning = CV joint."),
      T("Grave o som com o celular e mostre pro Biela ou pra oficina — ajuda muito no diagnóstico.", "Record the sound with your phone and show Biela or the shop — it helps a lot with the diagnosis."),
    ]}),
    art({ id: "diag-smells", track: "diagnosis", title: T("Cheiros e fumaça: o que indicam", "Smells and smoke: what they mean"), body: [
      T("Fumaça azul = queima de óleo. Branca densa = água no motor (junta). Preta = mistura rica. Cheiro doce = arrefecimento vazando.", "Blue smoke = burning oil. Thick white = water in the engine (gasket). Black = rich mixture. Sweet smell = coolant leak."),
      T("Cheiro de queimado ao frear pede parada imediata: freio superaquecido.", "A burning smell when braking means stop now: overheated brakes."),
    ]}),
    art({ id: "diag-leaks", track: "diagnosis", title: T("Manchas no chão: qual vazamento?", "Stains on the floor: which leak?"), body: [
      T("Marrom/preto = óleo. Vermelho/rosa = direção ou câmbio. Verde/laranja = arrefecimento. Transparente = ar-condicionado (normal).", "Brown/black = oil. Red/pink = steering or transmission. Green/orange = coolant. Clear = A/C (normal)."),
      T("Coloque um papelão sob o carro à noite para localizar a origem do vazamento.", "Put cardboard under the car overnight to locate where the leak comes from."),
    ]}),

    // ── Economia & Bolso ───────────────────────────────────────
    art({ id: "money-fuel", track: "money", title: T("Dirigir gastando menos", "Drive spending less"), body: [
      T("Calibragem correta, filtro limpo e conduzir suave (sem arrancadas) economizam até 20% de combustível.", "Correct pressure, a clean filter and smooth driving (no jackrabbit starts) save up to 20% of fuel."),
      T("Peso extra e ar-condicionado em alta velocidade pesam menos do que se imagina; janela aberta na estrada pesa mais.", "Extra weight and A/C at high speed matter less than people think; open windows on the highway matter more."),
    ]}),
    art({ id: "money-repair-replace", track: "money", title: T("Consertar ou trocar de carro?", "Repair or replace the car?"), body: [
      T("Regra prática: se o conserto passa de 50% do valor do carro, ou se você gasta em reparos mais que uma parcela por mês, reavalie.", "Rule of thumb: if a repair exceeds 50% of the car's value, or you spend more on repairs than a monthly payment, reconsider."),
      T("Some tudo que gastou no último ano (está no seu Histórico) antes de decidir.", "Add up everything you spent in the last year (it's in your History) before deciding."),
    ]}),
    art({ id: "money-quote", track: "money", title: T("Ler um orçamento e evitar golpes", "Read a quote and avoid scams"), body: [
      T("Exija orçamento por escrito com peças e mão de obra separadas. Desconfie de 'já que abriu, troca tudo'.", "Demand a written quote with parts and labor itemized. Be wary of 'while it's open, replace everything'."),
      T("Peça as peças velhas de volta e um segundo orçamento em reparos caros.", "Ask for the old parts back and get a second quote on expensive repairs."),
    ]}),
    { id: "money-used", track: "money", title: T("Checklist para comprar usado", "Used-car checklist"), type: "checklist", system: "geral",
      need: [], body: [T("O que conferir antes de fechar negócio.", "What to check before closing the deal.")],
      steps: [T("Histórico de manutenção e dono anterior", "Service history and previous owner"), T("Alinhamento da pintura e folgas (batida)", "Paint and panel gaps (crash)"), T("Óleo, arrefecimento e fumaça na partida", "Oil, coolant and smoke at startup"), T("Test-drive: freio, câmbio, ruídos", "Test drive: brakes, gearbox, noises"), T("Débitos, multas e vistoria cautelar", "Debts, fines and an independent inspection")],
      safety: [] },

    // ── Por Montadora ──────────────────────────────────────────
    art({ id: "brand-vw", track: "brand", make: "Volkswagen", premium: true, title: T("Volkswagen: pontos de atenção", "Volkswagen: what to watch"), body: [
      T("Linha TSI: atenção à corrente de comando e ao consumo de óleo em motores mais rodados. Turbo pede óleo no ponto certo.", "TSI line: watch the timing chain and oil consumption on higher-mileage engines. The turbo needs oil right on spec."),
      T("Revisões oficiais a cada 10 mil km/1 ano. Consulte o manual do seu modelo para os intervalos exatos.", "Official service every 10,000 km/1 year. Check your model's manual for the exact intervals."),
    ]}),
    art({ id: "brand-chevrolet", track: "brand", make: "Chevrolet", premium: true, title: T("Chevrolet: pontos de atenção", "Chevrolet: what to watch"), body: [
      T("Motores 1.0/1.2 turbo modernos são econômicos, mas exigem óleo correto e troca em dia para proteger o turbo.", "Modern 1.0/1.2 turbo engines are efficient but demand the correct oil and on-time changes to protect the turbo."),
      T("Atenção ao módulo elétrico e ao MyLink em modelos mais antigos.", "Watch the electrical module and MyLink on older models."),
    ]}),
    art({ id: "brand-fiat", track: "brand", make: "Fiat", premium: true, title: T("Fiat: pontos de atenção", "Fiat: what to watch"), body: [
      T("Firefly (1.0/1.3) é robusto; cuide da correia dentada banhada a óleo nos que a usam. Picapes pedem atenção à suspensão traseira.", "Firefly (1.0/1.3) is sturdy; mind the oil-bathed timing belt where fitted. Pickups need attention to the rear suspension."),
      T("Câmbio automatizado antigo (Dualogic) pede condução adaptada e revisão específica.", "The old automated gearbox (Dualogic) needs an adapted driving style and specific servicing."),
    ]}),
    art({ id: "brand-toyota", track: "brand", make: "Toyota", premium: true, title: T("Toyota: pontos de atenção", "Toyota: what to watch"), body: [
      T("Fama de confiável se mantém com revisão em dia. Aspirados são tranquilos; híbridos pedem cuidado com a bateria de alta tensão.", "The reliability reputation holds with on-time service. NA engines are easy; hybrids need care with the high-voltage battery."),
      T("Intervalos oficiais a cada 10 mil km. Peças originais costumam durar mais.", "Official intervals every 10,000 km. Genuine parts tend to last longer."),
    ]}),
    art({ id: "brand-byd", track: "brand", make: "BYD", premium: true, title: T("BYD: cuidados com elétricos", "BYD: caring for EVs"), body: [
      T("Sem óleo de motor, mas há fluido de arrefecimento da bateria, freios e filtro de cabine. A manutenção é mais barata, não inexistente.", "No engine oil, but there's battery coolant, brakes and a cabin filter. Maintenance is cheaper, not zero."),
      T("Freio regenerativo faz as pastilhas durarem muito; ainda assim inspecione contra corrosão.", "Regen braking makes pads last a long time; still inspect them for corrosion."),
    ]}),

    // ── Por Modelo ─────────────────────────────────────────────
    art({ id: "model-onix", track: "model", make: "Chevrolet", model: "Onix", premium: true, title: T("Chevrolet Onix: guia do dono", "Chevrolet Onix: owner's guide"), body: [
      T("Onix turbo (1.0): use óleo 0W-20/5W-30 conforme o ano e não atrase a troca — o turbo agradece. Revisão a cada 10 mil km.", "Onix turbo (1.0): use 0W-20/5W-30 oil per year and don't delay changes — the turbo thanks you. Service every 10,000 km."),
      T("Pontos comuns: sensores e módulo elétrico; mantenha a bateria em boas condições.", "Common points: sensors and the electrical module; keep the battery healthy."),
    ]}),
    art({ id: "model-hb20", track: "model", make: "Hyundai", model: "HB20", premium: true, title: T("Hyundai HB20: guia do dono", "Hyundai HB20: owner's guide"), body: [
      T("Motores 1.0 aspirado e turbo. O turbo (T-GDI) pede óleo correto e troca em dia. Suspensão firme, boa durabilidade.", "1.0 NA and turbo engines. The turbo (T-GDI) needs the right oil and on-time changes. Firm suspension, good durability."),
      T("Revisões a cada 10 mil km; atenção às buchas da suspensão com o tempo.", "Service every 10,000 km; watch the suspension bushings over time."),
    ]}),
    art({ id: "model-polo", track: "model", make: "Volkswagen", model: "Polo", premium: true, title: T("VW Polo: guia do dono", "VW Polo: owner's guide"), body: [
      T("TSI 1.0 é econômico e esperto. Cuide do nível de óleo entre trocas e use combustível de qualidade para o turbo.", "The 1.0 TSI is efficient and clever. Watch the oil level between changes and use quality fuel for the turbo."),
      T("Central multimídia e sensores pedem atenção; revisão a cada 10 mil km.", "Infotainment and sensors need attention; service every 10,000 km."),
    ]}),
    art({ id: "model-strada", track: "model", make: "Fiat", model: "Strada", premium: true, title: T("Fiat Strada: guia do dono", "Fiat Strada: owner's guide"), body: [
      T("Picape mais vendida do país. Firefly confiável; atenção à suspensão traseira quando anda carregada e à geometria.", "The country's best-selling pickup. Reliable Firefly; watch the rear suspension when loaded and the alignment."),
      T("Uso de trabalho acelera desgaste de freio e pneu — inspecione com mais frequência.", "Work use speeds up brake and tire wear — inspect more often."),
    ]}),
    art({ id: "model-corolla", track: "model", make: "Toyota", model: "Corolla", premium: true, title: T("Toyota Corolla: guia do dono", "Toyota Corolla: owner's guide"), body: [
      T("Sedã referência em durabilidade. Versão híbrida traz economia enorme; a bateria tem longa vida com uso normal.", "A benchmark sedan for durability. The hybrid brings huge savings; the battery lasts long with normal use."),
      T("Mantenha revisões oficiais para preservar valor de revenda e garantia estendida.", "Keep official service to preserve resale value and the extended warranty."),
    ]}),

    // ── Esportivos / Garagem dos Sonhos ────────────────────────
    art({ id: "sport-turbo", track: "sports", title: T("Turbo vs aspirado", "Turbo vs naturally aspirated"), body: [
      T("O turbo usa os gases do escape para 'empurrar' mais ar ao motor — mais potência de um motor pequeno. Aspirado respira sozinho: resposta linear e simplicidade.", "A turbo uses exhaust gases to force more air in — more power from a small engine. NA breathes on its own: linear response and simplicity."),
      T("Turbo pede óleo em dia e alguns segundos de marcha lenta antes de desligar após uso forte.", "Turbos need on-time oil and a few seconds of idle before shutting off after hard use."),
    ]}),
    art({ id: "sport-drivetrain", track: "sports", title: T("Tração: dianteira, traseira, integral", "Drive: front, rear, all-wheel"), body: [
      T("Dianteira é barata e estável. Traseira é a preferida dos esportivos pela distribuição de peso na aceleração. Integral agarra em qualquer piso.", "Front-wheel is cheap and stable. Rear-wheel is the sports favorite for weight transfer under acceleration. All-wheel grips on any surface."),
      T("Cada uma muda como o carro se comporta na curva e na chuva.", "Each changes how the car behaves in corners and in the rain."),
    ]}),
    art({ id: "sport-dct", track: "sports", premium: true, title: T("Câmbio de dupla embreagem (DCT)", "Dual-clutch gearbox (DCT)"), body: [
      T("Duas embreagens pré-selecionam a próxima marcha: trocas em milésimos, sem cortar a força. É o câmbio dos superesportivos e de muitos populares turbo.", "Two clutches pre-select the next gear: shifts in milliseconds without cutting power. It's the gearbox of supercars and many turbo hatches."),
      T("Exige óleo específico e não gosta de 'segurar na rampa' no ponto de fricção.", "It needs specific oil and dislikes being held on a hill at the friction point."),
    ]}),
    art({ id: "sport-aero", track: "sports", premium: true, title: T("Aerodinâmica e downforce", "Aerodynamics and downforce"), body: [
      T("Asas e difusores invertem o princípio do avião: em vez de sustentar, empurram o carro contra o chão. Mais aderência em alta velocidade.", "Wings and diffusers invert the airplane principle: instead of lift, they push the car into the ground. More grip at high speed."),
      T("Downforce custa arrasto — por isso carros de rua buscam equilíbrio entre grude e velocidade final.", "Downforce costs drag — that's why road cars balance grip and top speed."),
    ]}),
    art({ id: "sport-911", track: "sports", premium: true, title: T("Ícone: Porsche 911", "Icon: Porsche 911"), body: [
      T("Desde 1963 com o motor atrás do eixo traseiro — uma 'anomalia' que a Porsche transformou em obra-prima de engenharia geração após geração.", "Since 1963 with the engine behind the rear axle — an 'anomaly' Porsche turned into an engineering masterpiece generation after generation."),
      T("Prova de que evolução constante vale mais que reinvenção: a silhueta é quase a mesma há 60 anos.", "Proof that constant evolution beats reinvention: the silhouette has barely changed in 60 years."),
    ]}),
    art({ id: "sport-gtr", track: "sports", premium: true, title: T("Ícone: Nissan GT-R", "Icon: Nissan GT-R"), body: [
      T("Apelidado de 'Godzilla', usa tração integral inteligente e motor V6 biturbo montado à mão para humilhar superesportivos que custam o triplo.", "Nicknamed 'Godzilla', it uses smart all-wheel drive and a hand-built twin-turbo V6 to humble supercars costing triple."),
      T("Um marco de como tecnologia pode democratizar a performance.", "A milestone in how technology can democratize performance."),
    ]}),
    art({ id: "sport-muscle", track: "sports", premium: true, title: T("Muscle cars: a era dos V8", "Muscle cars: the V8 era"), body: [
      T("Anos 60-70 nos EUA: motores V8 gigantes em carros acessíveis. Mustang, Camaro e Charger viraram lenda pela força bruta e pelo som.", "1960s-70s USA: huge V8 engines in affordable cars. Mustang, Camaro and Charger became legends for brute force and sound."),
      T("A filosofia 'sem substituto para cilindrada' moldou a cultura automotiva por décadas.", "The 'no replacement for displacement' philosophy shaped car culture for decades."),
    ]}),

    // ── Cultura & Curiosidades ─────────────────────────────────
    art({ id: "cult-history", track: "culture", title: T("Breve história do automóvel", "A brief history of the car"), media: { provider: "youtube", src: "jNQXAC9IVRw" }, type: "video", body: [
      T("De 1886, com o Benz Patent-Motorwagen, à linha de montagem de Ford e à eletrificação de hoje — pouco mais de um século que mudou o mundo.", "From 1886, with the Benz Patent-Motorwagen, to Ford's assembly line and today's electrification — just over a century that changed the world."),
    ]}),
    art({ id: "cult-ev", track: "culture", title: T("Como funciona um carro elétrico", "How an electric car works"), body: [
      T("Bateria alimenta um motor elétrico que entrega torque instantâneo. Sem câmbio, sem embreagem, sem óleo de motor.", "A battery feeds an electric motor delivering instant torque. No gearbox, no clutch, no engine oil."),
      T("O freio regenerativo recarrega a bateria ao desacelerar — por isso as pastilhas duram tanto.", "Regenerative braking recharges the battery when slowing down — that's why the pads last so long."),
    ]}),
    art({ id: "cult-hybrid", track: "culture", title: T("Híbridos: dois mundos", "Hybrids: two worlds"), body: [
      T("Combinam motor a combustão e elétrico. No trânsito, rodam no elétrico (econômico); na estrada, o motor assume. Alguns recarregam na tomada (plug-in).", "They combine a combustion and an electric motor. In traffic they run electric (efficient); on the highway the engine takes over. Some charge from a plug (plug-in)."),
    ]}),
    art({ id: "cult-adas", track: "culture", title: T("ADAS: os assistentes de direção", "ADAS: driver assists"), body: [
      T("Frenagem automática, alerta de faixa e piloto adaptativo usam câmeras e radares para reduzir acidentes.", "Automatic braking, lane alerts and adaptive cruise use cameras and radars to cut accidents."),
      T("São assistentes, não pilotos: exigem atenção total do motorista.", "They're assistants, not drivers: they require the driver's full attention."),
    ]}),
  ];

  // ---- Study tracks (knowledge tree) ---------------------------------------
  type StudyTrack = { id: string; icon: string; title: string; subtitle: string; accent: string; premium?: boolean };
  const studyTracks: StudyTrack[] = [
    { id: "fundamentals", icon: "book", title: T("Fundamentos", "Fundamentals"), subtitle: T("Como o carro funciona", "How a car works"), accent: "bg-teal/15 text-teal" },
    { id: "diy", icon: "tools", title: T("Faça Você Mesmo", "Do It Yourself"), subtitle: T("Tutoriais passo a passo", "Step-by-step tutorials"), accent: "bg-amber/15 text-amber" },
    { id: "diagnosis", icon: "diagnose", title: T("Diagnóstico", "Diagnosis"), subtitle: T("Barulhos, luzes e sintomas", "Noises, lights and symptoms"), accent: "bg-coral/15 text-coral" },
    { id: "money", icon: "gauge", title: T("Economia & Bolso", "Money & Savings"), subtitle: T("Gaste menos e evite golpes", "Spend less, avoid scams"), accent: "bg-teal/15 text-teal" },
    { id: "brand", icon: "shield", title: T("Por Montadora", "By Manufacturer"), subtitle: T("Cuidados de cada marca", "Care tips per brand"), accent: "bg-amber/15 text-amber" },
    { id: "model", icon: "car", title: T("Por Modelo", "By Model"), subtitle: T("Guias dos carros populares", "Guides for popular cars"), accent: "bg-teal/15 text-teal" },
    { id: "sports", icon: "track", title: T("Esportivos", "Sports Cars"), subtitle: T("Garagem dos sonhos", "The dream garage"), accent: "bg-coral/15 text-coral" },
    { id: "culture", icon: "spark", title: T("Cultura & Curiosidades", "Culture & Trivia"), subtitle: T("História e tecnologia", "History and technology"), accent: "bg-amber/15 text-amber" },
  ];

  // ---- Service types (2.4) -------------------------------------------------
  const serviceTypes: { key: string; label: string }[] = [
    { key: "oil", label: T("Troca de óleo", "Oil change") },
    { key: "brakes", label: T("Freios", "Brakes") },
    { key: "revision", label: T("Revisão", "Full service") },
    { key: "suspension", label: T("Suspensão", "Suspension") },
    { key: "tires", label: T("Pneus", "Tires") },
    { key: "battery", label: T("Bateria", "Battery") },
    { key: "timing", label: T("Correia/corrente", "Timing belt/chain") },
    { key: "airfilter", label: T("Filtro de ar", "Air filter") },
    { key: "brakefluid", label: T("Fluido de freio", "Brake fluid") },
    { key: "other", label: T("Outro", "Other") },
  ];

  // Kit do motorista — equipamentos úteis, por categoria.
  const equipment: { section: string; items: { emoji: string; name: string; use: string; essential?: boolean; star?: boolean }[] }[] = [
    {
      section: T("Emergência no carro (leve sempre)", "Car emergency (always carry)"),
      items: [
        { emoji: "🛞", name: T("Estepe, macaco e chave de roda", "Spare, jack and lug wrench"), use: T("Trocar um pneu furado na estrada.", "Change a flat tire on the road."), essential: true },
        { emoji: "🔺", name: T("Triângulo de sinalização", "Warning triangle"), use: T("Sinalizar o carro parado — obrigatório por lei.", "Signal a stopped car — required by law."), essential: true },
        { emoji: "🔋", name: T("Cabo de chupeta (ou bateria auxiliar)", "Jumper cables (or jump-starter)"), use: T("Dar partida quando a bateria descarrega. A bateria auxiliar funciona sem outro carro.", "Start the car when the battery dies. A jump-starter works without another car."), essential: true },
        { emoji: "💨", name: T("Calibrador + compressor portátil", "Gauge + portable inflator"), use: T("Calibrar e encher o pneu em qualquer lugar.", "Check and inflate a tire anywhere.") },
        { emoji: "🔦", name: T("Lanterna", "Flashlight"), use: T("Enxergar embaixo do capô ou trocar pneu à noite.", "See under the hood or change a tire at night.") },
        { emoji: "🩹", name: T("Kit de primeiros socorros", "First-aid kit"), use: T("O básico para pequenos acidentes.", "The basics for minor incidents.") },
        { emoji: "🪢", name: T("Corda/cabo de reboque", "Tow strap"), use: T("Rebocar ou ser rebocado numa emergência.", "Tow or be towed in an emergency.") },
      ],
    },
    {
      section: T("Diagnóstico", "Diagnostics"),
      items: [
        { emoji: "🔌", name: T("Scanner OBD2", "OBD2 scanner"), use: T("A 'chave' do painel: plugue na entrada OBD2 (embaixo do volante) e leia os códigos de erro — descubra o que a luz acesa significa. Há versões Bluetooth que ligam num app no celular.", "The dashboard 'key': plug into the OBD2 port (under the wheel) and read the fault codes — find out what a warning light means. Bluetooth versions pair with a phone app."), star: true },
        { emoji: "🔧", name: T("Multímetro", "Multimeter"), use: T("Testar bateria, alternador, fusíveis e fiação.", "Test the battery, alternator, fuses and wiring.") },
        { emoji: "🌡️", name: T("Medidor de pressão de óleo", "Oil pressure gauge"), use: T("Confirmar a pressão do óleo do motor.", "Confirm the engine's oil pressure.") },
      ],
    },
    {
      section: T("Ferramentas de garagem", "Garage tools"),
      items: [
        { emoji: "🧰", name: T("Jogo de chaves e soquetes", "Wrench & socket set"), use: T("A base de quase todo reparo.", "The foundation of almost any repair."), essential: true },
        { emoji: "🗜️", name: T("Alicate (universal e de bico)", "Pliers (combination and needle-nose)"), use: T("Segurar, cortar e dobrar — mil usos.", "Grip, cut and bend — a thousand uses.") },
        { emoji: "🪛", name: T("Chaves de fenda e Philips", "Flathead & Phillips screwdrivers"), use: T("Parafusos de painéis, presilhas e tampas.", "Panel screws, clips and covers.") },
        { emoji: "⭕", name: T("Chave de filtro de óleo", "Oil filter wrench"), use: T("Soltar o filtro na troca de óleo.", "Loosen the filter during an oil change.") },
        { emoji: "🛠️", name: T("Macaco hidráulico + cavaletes", "Trolley jack + stands"), use: T("Levantar o carro com segurança. Nunca só o macaco.", "Lift the car safely. Never on the jack alone.") },
        { emoji: "🔩", name: T("Torquímetro", "Torque wrench"), use: T("Apertar rodas e peças no torque correto.", "Tighten wheels and parts to the correct torque.") },
        { emoji: "🪣", name: T("Bacia de dreno", "Drain pan"), use: T("Recolher o óleo velho sem sujeira.", "Catch old oil without a mess.") },
      ],
    },
    {
      section: T("Consumíveis úteis", "Handy consumables"),
      items: [
        { emoji: "🛢️", name: T("Óleo do motor de reserva", "Spare engine oil"), use: T("Completar o nível entre as trocas.", "Top up the level between changes.") },
        { emoji: "❄️", name: T("Líquido de arrefecimento", "Coolant"), use: T("Completar o radiador e evitar superaquecer.", "Top up the radiator and avoid overheating.") },
        { emoji: "🧴", name: T("Desengripante (WD-40)", "Penetrating oil (WD-40)"), use: T("Soltar parafusos presos e proteger contatos.", "Free stuck bolts and protect contacts.") },
        { emoji: "🎗️", name: T("Fita isolante e abraçadeiras", "Electrical tape & zip ties"), use: T("Reparos rápidos de fio e mangueira.", "Quick wire and hose fixes.") },
        { emoji: "🧤", name: T("Luvas e panos", "Gloves & rags"), use: T("Manter as mãos limpas e seguras.", "Keep your hands clean and safe.") },
      ],
    },
  ];

  // Subsistemas do carro — grade de navegação em "Problemas".
  const problemSystems: { key: SystemKey; label: string; icon: string; sub: string }[] = [
    { key: "engine", label: T("Motor", "Engine"), icon: "engine", sub: T("Partida, força, consumo, luz", "Start, power, consumption, light") },
    { key: "brakes", label: T("Freios", "Brakes"), icon: "brakes", sub: T("Barulho, pedal, frenagem", "Noise, pedal, braking") },
    { key: "suspension", label: T("Suspensão", "Suspension"), icon: "suspension", sub: T("Barulhos, buracos, direção", "Noises, bumps, steering") },
    { key: "tires", label: T("Pneus & Rodas", "Tires & Wheels"), icon: "tires", sub: T("Vibração, desgaste, calibragem", "Vibration, wear, pressure") },
    { key: "electrical", label: T("Elétrica", "Electrical"), icon: "electrical", sub: T("Bateria, partida, luzes", "Battery, starting, lights") },
  ];

  // Peças comuns por tipo de serviço — alimenta o autocomplete de "Peças trocadas".
  const partsByType: Record<string, string[]> = locale === "pt"
    ? {
        oil: ["Óleo do motor", "Filtro de óleo", "Filtro de ar", "Aditivo do radiador"],
        brakes: ["Pastilha dianteira", "Pastilha traseira", "Disco de freio", "Fluido de freio", "Lona de freio", "Cilindro de freio"],
        revision: ["Óleo do motor", "Filtro de óleo", "Filtro de ar", "Filtro de combustível", "Filtro de cabine", "Velas de ignição", "Fluido de freio"],
        suspension: ["Amortecedor dianteiro", "Amortecedor traseiro", "Mola", "Bieleta", "Batente", "Coxim", "Pivô", "Terminal de direção", "Bandeja"],
        tires: ["Pneu Aro 13", "Pneu Aro 14", "Pneu Aro 15", "Pneu Aro 16", "Pneu Aro 17", "Pneu Aro 18", "Pneu Aro 19", "Pneu Aro 20", "Alinhamento", "Balanceamento", "Rodízio de pneus", "Válvula"],
        battery: ["Bateria 60Ah", "Bateria 70Ah", "Terminal de bateria", "Alternador"],
        timing: ["Correia dentada", "Tensor", "Bomba d'água", "Correia do alternador", "Kit correia dentada"],
        airfilter: ["Filtro de ar", "Filtro de cabine (ar-condicionado)"],
        brakefluid: ["Fluido de freio DOT 3", "Fluido de freio DOT 4"],
        other: [],
      }
    : {
        oil: ["Engine oil", "Oil filter", "Air filter", "Radiator additive"],
        brakes: ["Front brake pads", "Rear brake pads", "Brake disc", "Brake fluid", "Brake shoe", "Brake cylinder"],
        revision: ["Engine oil", "Oil filter", "Air filter", "Fuel filter", "Cabin filter", "Spark plugs", "Brake fluid"],
        suspension: ["Front shock", "Rear shock", "Spring", "Sway bar link", "Bump stop", "Strut mount", "Ball joint", "Tie rod end", "Control arm"],
        tires: ["Tire 13\"", "Tire 14\"", "Tire 15\"", "Tire 16\"", "Tire 17\"", "Tire 18\"", "Tire 19\"", "Tire 20\"", "Alignment", "Balancing", "Tire rotation", "Valve"],
        battery: ["Battery 60Ah", "Battery 70Ah", "Battery terminal", "Alternator"],
        timing: ["Timing belt", "Tensioner", "Water pump", "Alternator belt", "Timing belt kit"],
        airfilter: ["Air filter", "Cabin filter (A/C)"],
        brakefluid: ["Brake fluid DOT 3", "Brake fluid DOT 4"],
        other: [],
      };

  // Consulting tiers (moved under Premium/Perfil).
  const consultingTiers: { name: string; body: string; access: Access }[] = [
    { name: T("Comunidade", "Community"), body: T("Poste sua dúvida e receba orientação da comunidade e de moderadores.", "Post your question and get guidance from the community and moderators."), access: "free" },
    { name: T("Diagnóstico pela equipe", "Team diagnosis"), body: T("A equipe analisa sintomas, fotos e códigos OBD2 e devolve um plano de ação.", "The team reviews symptoms, photos and OBD2 codes and returns an action plan."), access: "premium" },
    { name: T("1:1 com o creator", "1:1 with the creator"), body: T("Sessão individual para casos difíceis ou decisão de compra. Vagas limitadas.", "One-on-one session for hard cases or buying decisions. Limited slots."), access: "consulting" },
  ];

  return {
    makes,
    modelsByMake,
    motoModelsByMake,
    years,
    symptoms,
    symptomPremium,
    lessons,
    serviceTypes,
    partsByType,
    problemSystems,
    equipment,
    studyTracks,
    consultingTiers,

    common: {
      free: T("Grátis", "Free"),
      premium: "Premium",
      consulting: T("Consultoria", "Consulting"),
      locked: "Premium",
      back: T("Voltar", "Back"),
      save: T("Salvar", "Save"),
      cancel: T("Cancelar", "Cancel"),
      edit: T("Editar", "Edit"),
      delete: T("Excluir", "Delete"),
      share: T("Compartilhar", "Share"),
      seeAll: T("Ver tudo", "See all"),
      add: T("Adicionar", "Add"),
      km: "km",
      of: T("de", "of"),
      unlock: T("Destravar com Premium", "Unlock with Premium"),
    },

    nav: {
      home: T("Início", "Home"),
      cars: T("Meus Carros", "My Cars"),
      carsShort: T("Carros", "Cars"),
      problems: T("Problemas", "Problems"),
      history: T("Histórico", "History"),
      studies: T("Estudos", "Studies"),
      profile: T("Perfil", "Profile"),
    },

    // 0.0 — Início (dashboard)
    home: {
      morning: T("Bom dia", "Good morning"),
      afternoon: T("Boa tarde", "Good afternoon"),
      evening: T("Boa noite", "Good evening"),
      driver: T("motorista", "driver"),
      heroTitleEmpty: T("Vamos cadastrar o seu primeiro carro", "Let's add your first car"),
      heroCtaEmpty: T("Cadastrar meu carro", "Add my car"),
      heroTitle: T("O que vamos cuidar hoje?", "What shall we care for today?"),
      heroCta: T("Diagnosticar um problema", "Diagnose a problem"),
      searchPh: T("Buscar problemas ou serviços", "Search problems or services"),
      premiumTitle: T("Teste o Premium grátis", "Try Premium free"),
      premiumSub: T("Toque para começar", "Tap to start"),
      quickTitle: T("Ações rápidas", "Quick actions"),
      qDiagnose: T("Diagnosticar", "Diagnose"),
      qService: T("Registrar serviço", "Log service"),
      qRevisions: T("Plano de revisão", "Service plan"),
      qStudies: T("Aprender", "Learn"),
      yourCar: T("Seu carro", "Your car"),
      viewCar: T("Abrir", "Open"),
    },

    // Shared Premium labels across screens.
    premium: {
      badge: "Premium",
      recommended: T("Recomendado para o seu carro", "Recommended for your car"),
      recoReason: T("comum em {car} com mais de {km}", "common on {car} over {km}"),
      lastService: T("Última revisão: {t}", "Last service: {t}"),
      monthsAgo: T("há {n} meses", "{n} months ago"),
      never: T("sem revisão registrada", "no service logged"),
      saved: T("Você já economizou ~{v} evitando serviços desnecessários", "You've saved ~{v} avoiding unnecessary work"),
      projection: T("Se nada for feito, você pode gastar {low}–{high} nos próximos 6 meses.", "If nothing is done, you could spend {low}–{high} in the next 6 months."),
      priorityNow: T("Faça agora", "Do it now"),
      prioritySoon: T("Nos próximos 3 meses", "In the next 3 months"),
      priorityWatch: T("Apenas acompanhe", "Just keep an eye on it"),
      shopSuggests: T("O que a maioria das oficinas costuma sugerir", "What most shops tend to suggest"),
      questionBefore: T("O que você pode questionar antes de autorizar", "What to question before you approve"),
      regionalTitle: T("Comparativo na sua região", "Comparison in your area"),
      remainingLife: T("Vida útil restante", "Remaining life"),
      actionOrder: T("Ordem sugerida de ações", "Suggested order of actions"),
      lockedCauses: T("Assine o Premium para ver todas as causas e preços detalhados para o seu {car}.", "Subscribe to see all causes and detailed prices for your {car}."),
      lockedSystem: T("Detalhamento completo disponível no Premium.", "Full breakdown available on Premium."),
      chartsTitle: T("Relatório de gastos", "Spending report"),
      perYear: T("Gasto por ano", "Spend per year"),
      perKm: T("Gasto médio por km", "Average spend per km"),
      preventive: T("Preventivo", "Preventive"),
      corrective: T("Corretivo", "Corrective"),
      upgrade: T("Upgrade", "Upgrade"),
      suggestedParts: T("Peças comuns para este serviço", "Common parts for this service"),
      compareQuotes: T("Comparar orçamentos", "Compare quotes"),
      exportPdf: T("Exportar em PDF", "Export as PDF"),
      vsAverage: T("Este serviço está na média para o seu modelo.", "This service is in line with the average for your model."),
      startHere: T("Comece por aqui", "Start here"),
    },

    // Contextual paywalls ({car} replaced by the active model).
    paywalls: {
      generic: { title: T("Desbloqueie o Premium", "Unlock Premium"), benefits: [] as string[] },
      cars: {
        title: T("Cuide de mais carros", "Care for more cars"),
        benefits: [T("Carros ilimitados na sua garagem", "Unlimited cars in your garage"), T("Diagnósticos avançados para cada um", "Advanced diagnostics for each"), T("Saúde detalhada e economia estimada", "Detailed health and estimated savings")],
      },
      symptomCauses: {
        title: T("Veja todas as causas do seu {car}", "See every cause for your {car}"),
        benefits: [T("Causas ranqueadas por probabilidade", "Causes ranked by likelihood"), T("Faixas de preço detalhadas por peça", "Detailed price ranges per part"), T("O que questionar antes de autorizar", "What to question before you approve")],
      },
      symptomReco: {
        title: T("Recomendações para o seu {car}", "Recommendations for your {car}"),
        benefits: [T("Sintomas comuns no seu modelo/ano/km", "Symptoms common on your model/year/km"), T("Prioridade do que olhar primeiro", "Priority of what to check first")],
      },
      checklist: {
        title: T("Checklists completos e em PDF", "Complete checklists, in PDF"),
        benefits: [T("Checklist específico para o sintoma + modelo", "Symptom + model specific checklist"), T("Ilimitados e exportáveis em PDF", "Unlimited and PDF-exportable"), T("Compare vários orçamentos", "Compare multiple quotes")],
      },
      health: {
        title: T("Saúde detalhada do seu {car}", "Detailed health for your {car}"),
        benefits: [T("Saúde por sistema, peça a peça", "Health per system, part by part"), T("Projeção de custos dos próximos 6 meses", "6-month cost projection"), T("Recomendações priorizadas", "Prioritized recommendations")],
      },
      systemDetail: {
        title: T("Detalhe completo por componente", "Full component-level detail"),
        benefits: [T("Vida útil restante estimada", "Estimated remaining life"), T("Ordem sugerida de ações", "Suggested order of actions")],
      },
      history: {
        title: T("Histórico ilimitado + relatórios", "Unlimited history + reports"),
        benefits: [T("Serviços ilimitados por carro", "Unlimited services per car"), T("Filtros avançados e gráficos de gasto", "Advanced filters and spending charts"), T("Relatório para valorizar na venda", "A report to boost resale value")],
      },
      parts: {
        title: T("Registre peças ilimitadas", "Log unlimited parts"),
        benefits: [T("Peças ilimitadas por serviço", "Unlimited parts per service"), T("Classifique preventivo/corretivo/upgrade", "Tag preventive/corrective/upgrade"), T("Sugestão automática de peças", "Automatic parts suggestions")],
      },
      exportPdf: {
        title: T("Exporte um relatório bonito", "Export a polished report"),
        benefits: [T("PDF pronto para oficina ou venda", "PDF ready for the shop or resale"), T("Comparativo com a média do modelo", "Comparison with the model average")],
      },
      revisions: {
        title: T("Revisões personalizadas do seu {car}", "Personalized service for your {car}"),
        benefits: [T("Lista de itens por modelo/ano/motor", "Item list by model/year/engine"), T("Alertas inteligentes pelo seu histórico", "Smart alerts from your history"), T("Custo estimado da próxima revisão", "Estimated cost of the next service")],
      },
      learn: {
        title: T("Biblioteca completa e trilhas", "Full library and tracks"),
        benefits: [T("Todos os vídeos e artigos", "All videos and articles"), T("Trilhas por modelo do seu carro", "Tracks by your car's model"), T("Sequência recomendada e certificados", "Recommended sequence and certificates")],
      },
    } as Record<string, { title: string; benefits: string[] }>,

    splash: {
      cards: [
        { icon: "car", title: T("Cadastre seu carro", "Add your car"), body: T("Sua garagem digital: modelo, ano, km e foto.", "Your digital garage: model, year, mileage and photo.") },
        { icon: "diagnose", title: T("Entenda sintomas e evite gastos", "Understand symptoms, avoid overspending"), body: T("Descubra causas prováveis e o preço justo antes da oficina.", "See likely causes and the fair price before the shop.") },
        { icon: "clock", title: T("Tenha o histórico completo", "Keep the full history"), body: T("Todo serviço, peça e nota do seu veículo em um só lugar.", "Every service, part and receipt of your vehicle in one place.") },
      ],
      start: T("Começar", "Get started"),
      next: T("Continuar", "Continue"),
    },

    cars: {
      title: T("Meus Carros", "My Cars"),
      emptyTitle: T("Sua garagem está vazia", "Your garage is empty"),
      emptyBody: T("Adicione seu primeiro carro para começar.", "Add your first car to get started."),
      add: T("Adicionar carro", "Add car"),
      health: T("Saúde", "Health"),
      noKm: T("km não informado", "mileage not set"),
      alertOverdue: T("Revisão vencida", "Service overdue"),
      alertPending: T("Serviço pendente", "Service pending"),
      ok: T("Tudo em dia", "All up to date"),
      nameCar: T("Nome do carro", "Car name"),
      nameCarPh: T("Ex.: meu Fusquinha", "e.g. my little Bug"),
    },

    addCar: {
      title: T("Adicionar carro", "Add car"),
      editTitle: T("Editar carro", "Edit car"),
      car: T("Carro", "Car"),
      moto: T("Moto", "Motorcycle"),
      make: T("Marca", "Make"),
      makePh: T("Digite ou escolha a marca", "Type or pick the make"),
      carField: T("Carro (marca e modelo)", "Car (make and model)"),
      carFieldPh: T("Digite a marca ou o modelo (ex.: Onix, Volks...)", "Type the make or model (e.g. Onix, VW...)"),
      manualEntry: T("Não encontrou? Digitar manualmente", "Can't find it? Enter manually"),
      backToSearch: T("← Voltar para a busca", "← Back to search"),
      noCarMatch: T("Nenhum carro encontrado.", "No car found."),
      model: T("Modelo", "Model"),
      modelPh: T("Digite o modelo", "Type the model"),
      year: T("Ano", "Year"),
      yearPh: T("Selecione o ano", "Select the year"),
      engine: T("Versão / motor (opcional, recomendado)", "Version / engine (optional, recommended)"),
      enginePh: T("ex.: 1.0 Turbo", "e.g. 1.0 Turbo"),
      version: T("Versão exata", "Exact version"),
      versionPh: T("ex.: LTZ, Highline", "e.g. LTZ, Highline"),
      versionPremium: T("Ultrapersonalização é um recurso Premium.", "Ultra-personalization is a Premium feature."),
      plate: T("Placa (opcional)", "Plate (optional)"),
      platePh: "ABC-1D23",
      km: T("KM atual", "Current mileage"),
      kmPh: T("ex.: 45000", "e.g. 45000"),
      photo: T("Foto ou avatar (opcional)", "Photo or avatar (optional)"),
      avatarLabel: T("Selecione um avatar", "Pick an avatar"),
      chooseAvatar: T("Escolher avatar ou foto", "Choose avatar or photo"),
      changeAvatar: T("Trocar avatar ou foto", "Change avatar or photo"),
      removePhoto: T("Remover", "Remove"),
      addPhoto: T("Adicionar foto", "Add photo"),
      changePhoto: T("Trocar foto", "Change photo"),
      needModel: T("Escolha marca, modelo e ano.", "Pick make, model and year."),
    },

    carHub: {
      km: T("km atual", "current km"),
      editKm: T("Atualizar km", "Update km"),
      updateKmTitle: T("Atualizar quilometragem", "Update mileage"),
      health: T("Saúde", "Health"),
      cards: {
        health: T("Saúde do carro", "Car health"),
        healthSub: T("Como está seu veículo hoje", "How your vehicle is doing"),
        problem: T("Estou com um problema", "I have a problem"),
        problemSub: T("Sintomas e diagnósticos", "Symptoms & diagnosis"),
        history: T("Histórico de serviços", "Service history"),
        historySub: T("Tudo que já foi feito", "Everything that's been done"),
        revisions: T("Próximas revisões", "Upcoming service"),
        revisionsSub: T("O que vem por km e tempo", "What's due by km and time"),
        learn: T("Aprenda mecânica", "Learn mechanics"),
        learnSub: T("Conteúdo para este carro", "Content for this car"),
        settings: T("Configurações do carro", "Car settings"),
        settingsSub: T("Dados, exportar, excluir", "Data, export, delete"),
      },
    },

    symptomsUi: {
      title: T("O que está acontecendo com seu", "What's going on with your"),
      titleCar: T("Será que precisamos levar seu {car} para a oficina?", "Should we take your {car} to the shop?"),
      searchPh: T("Descreva o problema (ex: barulho ao frear, luz do motor)", "Describe the problem (e.g. noise when braking, engine light)"),
      none: T("Nenhum sintoma encontrado.", "No symptoms found."),
      browseBySystem: T("Ou explore por sistema", "Or browse by system"),
      common: T("Sintomas comuns", "Common symptoms"),
      systemProblems: T("Problemas de {system}", "{system} problems"),
      notListed: T("Não é nenhum desses?", "None of these?"),
      askBielaAbout: T("Perguntar ao Biela sobre isso", "Ask Biela about it"),
      askBielaQ: T("Perguntar ao Biela sobre \"{q}\"", "Ask Biela about \"{q}\""),
      talkToBiela: T("Falar com o Biela", "Talk to Biela"),
      anamneseTitle: T("Antes do diagnóstico, me conta:", "Before the diagnosis, tell me:"),
      anamneseSub: T("Responda pra afinar o diagnóstico do Biela.", "Answer to sharpen Biela's diagnosis."),
      yes: T("Sim", "Yes"),
      no: T("Não", "No"),
      diagnoseWithBiela: T("Diagnóstico com o Biela", "Diagnose with Biela"),
      causes: T("Possíveis causas", "Possible causes"),
      urgency: T("Nível de urgência", "Urgency level"),
      price: T("Faixa de preço estimada", "Estimated price range"),
      priceNote: T("varia por região e oficina", "varies by region and shop"),
      observe: T("O que observar", "What to look for"),
      genChecklist: T("Gerar checklist para oficina", "Generate a shop checklist"),
      knowIt: T("Já sei o que é", "I know what it is"),
      recoNudge: T("Assine o Premium para ver recomendações personalizadas para o seu carro.", "Subscribe to see personalized recommendations for your car."),
      detailedPrice: T("Preço detalhado por peça", "Detailed price per part"),
      km80: T("80.000 km", "80,000 km"),
    },
    auth: {
      signInTitle: T("Entrar", "Sign in"),
      signUpTitle: T("Criar conta", "Create account"),
      subtitle: T("Salve sua garagem e acesse de qualquer aparelho.", "Save your garage and access it from any device."),
      name: T("Nome", "Name"),
      namePh: T("Como podemos te chamar?", "What should we call you?"),
      email: T("E-mail", "Email"),
      emailPh: T("voce@email.com", "you@email.com"),
      password: T("Senha", "Password"),
      passwordPh: T("mínimo 6 caracteres", "at least 6 characters"),
      google: T("Continuar com o Google", "Continue with Google"),
      apple: T("Continuar com a Apple", "Continue with Apple"),
      socialNote: T("Rápido e sem precisar de senha", "Fast, no password needed"),
      or: T("ou", "or"),
      orEmail: T("ou entre com e-mail", "or use your e-mail"),
      forgot: T("Esqueci minha senha", "Forgot my password"),
      resetSent: T("Enviamos um link para redefinir sua senha.", "We sent a link to reset your password."),
      resetNeedEmail: T("Digite seu e-mail acima primeiro.", "Enter your e-mail above first."),
      tagline: T("Salve sua garagem e cuide do seu carro de qualquer aparelho.", "Save your garage and care for your car from any device."),
      toSignUp: T("Não tem conta? Criar conta", "No account? Create one"),
      toSignIn: T("Já tem conta? Entrar", "Have an account? Sign in"),
      submitSignIn: T("Entrar", "Sign in"),
      submitSignUp: T("Criar conta", "Create account"),
      working: T("Aguarde...", "Please wait..."),
      confirmTitle: T("Confira seu e-mail 📬", "Check your email 📬"),
      confirmBody: T("Enviamos um link de confirmação para {email}. Clique nele para ativar sua conta.", "We sent a confirmation link to {email}. Click it to activate your account."),
      guestNote: T("Você pode continuar como convidado — seus dados ficam salvos neste aparelho.", "You can keep using it as a guest — your data stays on this device."),
      account: T("Conta", "Account"),
      signedInAs: T("Conectado como", "Signed in as"),
      signOut: T("Sair da conta", "Sign out"),
      createOrSignIn: T("Entrar ou criar conta", "Sign in or create account"),
      syncNote: T("Sincronize sua garagem entre aparelhos.", "Sync your garage across devices."),
      errInvalid: T("E-mail ou senha inválidos.", "Invalid email or password."),
      errGeneric: T("Algo deu errado. Tente de novo.", "Something went wrong. Try again."),
    },
    equipmentUi: {
      cardTitle: T("Kit do motorista", "Driver's kit"),
      cardSub: T("Equipamentos úteis para o dia a dia", "Handy gear for everyday driving"),
      title: T("Equipamentos úteis", "Useful equipment"),
      intro: T("Ferramentas e itens que ajudam a diagnosticar, socorrer e cuidar do carro.", "Tools and items that help you diagnose, rescue and care for your car."),
      essential: T("Essencial", "Essential"),
      bielaCta: T("Não sabe qual comprar? Pergunte ao Biela.", "Not sure which to buy? Ask Biela."),
      bielaSeed: T("Quais equipamentos e ferramentas você recomenda eu ter para o meu carro?", "What equipment and tools do you recommend I keep for my car?"),
    },

    checklist: {
      title: T("Checklist", "Checklist"),
      intro: T("Leve isto para a oficina — peça item por item.", "Take this to the shop — ask item by item."),
      notes: T("Anotações do orçamento", "Quote notes"),
      notesPh: T("ex.: trocar só as dianteiras", "e.g. front pads only"),
      total: T("Valor total do orçamento (R$)", "Total quote (R$)"),
      totalPh: T("ex.: 480", "e.g. 480"),
      shop: T("Oficina", "Shop"),
      shopPh: T("Nome da oficina", "Shop name"),
      saveToHistory: T("Salvar no histórico", "Save to history"),
      share: T("Compartilhar", "Share"),
      pdf: T("Exportar PDF / WhatsApp", "Export PDF / WhatsApp"),
      premiumNudge: T("Quer checklists completos, ilimitados e em PDF? Assine o Premium.", "Want complete, unlimited checklists in PDF? Subscribe."),
      lockedItems: T("Itens específicos (espessura mínima, tolerâncias) no Premium.", "Specific items (min thickness, tolerances) on Premium."),
    },

    health: {
      title: T("Saúde do seu", "Health of your"),
      scoreLabel: T("Saúde", "Health"),
      attention: T("Pontos de atenção", "Points of attention"),
      allGood: T("Nenhum ponto crítico no momento. Continue registrando os serviços.", "Nothing critical right now. Keep logging services."),
      systemsTitle: T("Sistemas", "Systems"),
      seeRevisions: T("Ver próximas revisões", "See upcoming service"),
      quizCta: T("Fazer o Quiz de Saúde do carro", "Take the car Health Quiz"),
      quizCtaSub: T("10 perguntas para ter um diagnóstico mais preciso", "10 questions for a more accurate diagnosis"),
      quizRedo: T("Refazer o quiz de saúde", "Retake the health quiz"),
      quizBasedOn: T("Diagnóstico baseado no seu quiz", "Diagnosis based on your quiz"),
      quizProvisional: T("Provisório — faça o quiz para o cálculo real", "Provisional — take the quiz for the real score"),
      quizTitle: T("Quiz de Saúde", "Health Quiz"),
      quizIntro: T("Responda com sinceridade — quanto mais preciso, melhor o diagnóstico.", "Answer honestly — the more accurate, the better the diagnosis."),
      quizSubmit: T("Ver resultado", "See result"),
      quizProgress: T("{a} de {b} respondidas", "{a} of {b} answered"),
      quizNow: T("Estado atual (VHS)", "Current condition (VHS)"),
      quizRisk: T("Risco futuro (VRI)", "Future risk (VRI)"),
      statusLabels: { ok: T("Em dia", "Up to date"), attention: T("Atenção", "Attention"), overdue: T("Verificar", "Check it") },
      systemLabels: {
        engine: T("Motor", "Engine"),
        brakes: T("Freios", "Brakes"),
        suspension: T("Suspensão", "Suspension"),
        tires: T("Pneus", "Tires"),
        electrical: T("Elétrica", "Electrical"),
      } as Record<SystemKey, string>,
      findings: {
        no_km: T("Informe o km atual para planejar melhor.", "Set the current mileage for better planning."),
        oil_overdue: T("Troca de óleo atrasada (~{n} km além do intervalo).", "Oil change overdue (~{n} km past the interval)."),
        oil_due_soon: T("Troca de óleo próxima (em ~{n} km).", "Oil change coming up (in ~{n} km)."),
        oil_unknown: T("Sem registro de troca de óleo.", "No oil change on record."),
        revision_overdue: T("Revisão periódica recomendada.", "Periodic service recommended."),
        system_no_history: T("{s}: sem histórico registrado.", "{s}: no service on record."),
      } as Record<string, string>,
    },

    systemDetail: {
      state: T("Estado atual", "Current state"),
      recommendations: T("Recomendações", "Recommendations"),
      related: T("Histórico relacionado", "Related history"),
      addRelated: T("Adicionar serviço relacionado", "Add related service"),
      noHistory: T("Nenhum serviço registrado para este sistema.", "No services logged for this system."),
      lastAt: T("último em", "last at"),
      never: T("sem registro", "no record"),
    },

    history: {
      title: T("Histórico de serviços", "Service history"),
      none: T("Nenhum serviço registrado ainda.", "No services logged yet."),
      add: T("Adicionar serviço", "Add service"),
      all: T("Todos", "All"),
      noCarTitle: T("Nenhum histórico", "No history"),
      noCarBody: T("Cadastre seu carro para ter as informações!", "Add your car to see the info here!"),
      addCar: T("Cadastrar carro", "Add car"),
    },

    addService: {
      title: T("Adicionar serviço", "Add service"),
      editTitle: T("Editar serviço", "Edit service"),
      type: T("Tipo de serviço", "Service type"),
      services: T("Serviços realizados", "Services done"),
      servicesHint: T("Digite ou escolha — dá pra adicionar vários de uma vez.", "Type or pick — you can add several at once."),
      servicePh: T("Ex.: troca de óleo, pastilha de freio…", "e.g. oil change, brake pads…"),
      subsystem: T("Subsistema", "Subsystem"),
      systemGeneral: T("Geral", "General"),
      needService: T("Adicione ao menos um serviço.", "Add at least one service."),
      classify: T("Classificação", "Classification"),
      date: T("Data", "Date"),
      km: T("KM", "Mileage"),
      kmPh: T("ex.: 45000", "e.g. 45000"),
      shop: T("Oficina", "Shop"),
      shopPh: T("Nome da oficina", "Shop name"),
      total: T("Valor total (R$)", "Total (R$)"),
      totalPh: T("ex.: 250", "e.g. 250"),
      parts: T("Peças trocadas", "Parts replaced"),
      addPart: T("Adicionar peça", "Add part"),
      partName: T("Nome da peça", "Part name"),
      partValue: T("Valor", "Value"),
      notes: T("Observações", "Notes"),
      notesPh: T("ex.: feito na concessionária", "e.g. done at the dealership"),
      photo: T("Anexar foto da nota (opcional)", "Attach receipt photo (optional)"),
    },

    serviceDetail: {
      parts: T("Peças trocadas", "Parts replaced"),
      notes: T("Observações", "Notes"),
      photo: T("Foto da nota", "Receipt photo"),
      deleteConfirm: T("Excluir este serviço do histórico?", "Delete this service from the history?"),
      at: T("aos", "at"),
    },

    revisions: {
      title: T("Próximas revisões", "Upcoming service"),
      byKm: T("Baseadas no km atual", "Based on current mileage"),
      byTime: T("Baseadas no tempo", "Based on time"),
      none: T("Sem revisões pendentes. Mantenha o km atualizado.", "Nothing pending. Keep the mileage updated."),
      needKm: T("Informe o km atual para calcular as revisões.", "Set the current mileage to compute upcoming service."),
      setKm: T("Informar km", "Set mileage"),
      setPurchase: T("Quando você comprou o carro?", "When did you buy the car?"),
      setPurchaseCta: T("Informar data de compra", "Set purchase date"),
      planTitle: T("Plano do Biela para o seu {car}", "Biela's plan for your {car}"),
      planLoading: T("Biela está montando seu plano com o manual e seu histórico...", "Biela is building your plan from the manual and your history..."),
      fromManual: T("do manual", "from the manual"),
      general: T("geral", "general"),
      basedOn: T("Baseado no manual, no seu histórico, no km e no tempo de uso.", "Based on the manual, your history, mileage and time owned."),
      ownedFor: T("Você tem esse carro há {n}", "You've owned this car for {n}"),
      remind: T("Agendar lembrete", "Set a reminder"),
      reminded: T("Lembrete criado", "Reminder set"),
      didIt: T("Já fiz esse serviço", "I already did this"),
      statusLabels: { overdue: T("Vencida", "Overdue"), soon: T("Em breve", "Soon"), ok: T("Em dia", "OK"), unknown: T("A confirmar", "To confirm") },
      ruleLabels: {
        oil: T("Troca de óleo", "Oil change"),
        airfilter: T("Filtro de ar", "Air filter"),
        brakes: T("Freios", "Brakes"),
        brakefluid: T("Fluido de freio", "Brake fluid"),
        timing: T("Correia/corrente", "Timing belt/chain"),
        tires: T("Pneus (rodízio/troca)", "Tires (rotation/replace)"),
        battery: T("Bateria", "Battery"),
      } as Record<string, string>,
      overdueKm: T("vencida há {n} km", "{n} km overdue"),
      inKm: T("em {n} km", "in {n} km"),
      monthsAgo: T("última há {n} meses", "last done {n} months ago"),
      estCost: T("Custo estimado", "Estimated cost"),
      nudge: T("Assine o Premium para a lista completa de itens e o custo estimado do seu {car}.", "Subscribe for the full item list and estimated cost for your {car}."),
      smartAlert: T("Pelo seu histórico, os freios devem pedir atenção nos próximos 10.000 km.", "Based on your history, brakes should need attention within the next 10,000 km."),
      cost: {
        oil: "R$ 180–350", airfilter: "R$ 60–140", brakes: "R$ 300–700", brakefluid: "R$ 120–260",
        timing: "R$ 600–1.500", tires: "R$ 800–2.000", battery: "R$ 350–700",
      } as Record<string, string>,
    },

    learn: {
      title: T("Estudos", "Studies"),
      searchPh: T("O que você quer aprender?", "What do you want to learn?"),
      forYourCar: T("Para o seu {car}", "For your {car}"),
      forYourCarSub: T("Selecionado pelo seu carro e pela saúde dele", "Picked for your car and its health"),
      tracks: T("Trilhas de conhecimento", "Knowledge tracks"),
      recommended: T("Recomendados para o seu carro", "Recommended for your car"),
      all: T("Todos os conteúdos", "All content"),
      empty: T("Nada por aqui ainda.", "Nothing here yet."),
      searchEmpty: T("Nenhum conteúdo encontrado.", "No content found."),
      video: T("Vídeo", "Video"),
      article: T("Artigo", "Article"),
      checklist: T("Checklist", "Checklist"),
      need: T("Você vai precisar", "You'll need"),
      steps: T("Passo a passo", "Step by step"),
      level: T("Nível", "Level"),
      levels: { iniciante: T("Iniciante", "Beginner"), avancado: T("Avançado", "Advanced"), mecanico: T("Mecânico", "Mechanic") },
      levelLoading: T("Biela está adaptando os passos...", "Biela is adapting the steps..."),
      forYourCarCount: T("{n} conteúdos escolhidos pro seu carro", "{n} picks for your car"),
      safety: T("Dicas de segurança", "Safety tips"),
      complete: T("Marcar como concluído", "Mark as complete"),
      completed: T("Concluído", "Completed"),
      saveLater: T("Salvar para ver depois", "Save for later"),
    },
    biela: {
      cardTitle: T("Fala com o Biela", "Chat with Biela"),
      cardSub: T("Seu mecânico de IA — tira qualquer dúvida", "Your AI mechanic — ask anything"),
      title: T("Biela", "Biela"),
      contextPrefix: T("Sobre seu", "About your"),
      intro: T("Oi! Sou o Biela 🐻 Manjo tudo de mecânica. Me conta o que está acontecendo com o seu carro que eu te ajudo — pode perguntar de barulho, revisão, orçamento, o que for.", "Hi! I'm Biela 🐻 I know cars inside out. Tell me what's going on and I'll help — noises, service, quotes, anything."),
      inputPh: T("Pergunte ao Biela...", "Ask Biela..."),
      send: T("Enviar", "Send"),
      thinking: T("Biela está pensando...", "Biela is thinking..."),
      suggestions: [
        T("Que barulho pode ser esse ao frear?", "What could this braking noise be?"),
        T("Quando devo trocar a correia?", "When should I change the belt?"),
        T("Esse orçamento está caro?", "Is this quote expensive?"),
        T("Como faço a revisão em dia?", "How do I keep service up to date?"),
      ],
      disclaimer: T("O Biela orienta, mas não substitui uma inspeção presencial em itens de segurança (freio, direção, airbag).", "Biela guides you, but doesn't replace an in-person inspection for safety items (brakes, steering, airbags)."),
      freeLeft: T("{n} perguntas grátis restantes hoje", "{n} free questions left today"),
      freeOver: T("Você usou suas perguntas grátis. Assine o Premium para conversar sem limites com o Biela.", "You've used your free questions. Go Premium to chat with Biela without limits."),
      premiumCta: T("Conversar sem limites", "Chat without limits"),
      offlineNote: T("(Respondendo em modo básico — a IA completa com os manuais está sendo conectada.)", "(Answering in basic mode — the full AI with manuals is being connected.)"),
    },

    carSettings: {
      title: T("Configurações do carro", "Car settings"),
      data: T("Dados do carro", "Car data"),
      purchaseDate: T("Data de compra", "Purchase date"),
      purchaseHint: T("Ajuda a calcular revisões por tempo de uso.", "Helps compute time-based service."),
      notSet: T("Não informada", "Not set"),
      export: T("Exportar histórico em PDF", "Export history as PDF"),
      shareLink: T("Compartilhar link do histórico", "Share history link"),
      danger: T("Zona de risco", "Danger zone"),
      deleteCar: T("Excluir carro", "Delete car"),
      deleteConfirm: T("Isso apagará todo o histórico deste carro. Deseja continuar?", "This will erase all history for this car. Continue?"),
    },

    profile: {
      title: T("Perfil", "Profile"),
      guest: T("Convidado", "Guest"),
      name: T("Seu nome", "Your name"),
      namePh: T("Como podemos te chamar?", "What should we call you?"),
      plan: T("Plano atual", "Current plan"),
      free: T("Plano gratuito", "Free plan"),
      premium: "Premium",
      renew: T("Renova em", "Renews on"),
      subscribe: T("Assinar Premium", "Subscribe to Premium"),
      manage: T("Gerenciar assinatura", "Manage subscription"),
      myCars: T("Meus carros", "My cars"),
      carsCount: T("{n} carro(s) cadastrado(s)", "{n} car(s) registered"),
      consulting: T("Consultoria e conteúdos exclusivos", "Consulting & exclusive content"),
      language: T("Idioma", "Language"),
      preferences: T("Preferências", "Preferences"),
      notifications: T("Notificações", "Notifications"),
      units: T("Unidades", "Units"),
      metric: T("Métrico", "Metric"),
      imperial: T("Imperial", "Imperial"),
      location: T("Localização", "Location"),
      // Informações
      info: T("Informações", "Information"),
      about: T("Sobre o app", "About the app"),
      talkToUs: T("Fale com a gente", "Talk to us"),
      privacy: T("Política de privacidade", "Privacy policy"),
      rate: T("Avaliar o Mentorque", "Rate Mentorque"),
      version: T("Mentorque v{v}", "Mentorque v{v}"),
      aboutTitle: T("Sobre o Mentorque", "About Mentorque"),
      aboutBody: T(
        "O Mentorque é o seu copiloto para cuidar do carro com confiança: organize sua garagem, entenda sintomas, acompanhe revisões e aprenda mecânica no seu ritmo — tudo em português.\n\nNossa missão é deixar o cuidado com o carro simples, econômico e sem depender de achismo na oficina.",
        "Mentorque is your copilot to care for your car with confidence: organize your garage, understand symptoms, track services and learn mechanics at your pace — all in one place.\n\nOur mission is to make car care simple, affordable and free of guesswork at the shop."
      ),
      privacyTitle: T("Política de privacidade", "Privacy policy"),
      privacyBody: T(
        "Levamos sua privacidade a sério. Os dados da sua garagem ficam no seu aparelho e, se você criar uma conta, são sincronizados de forma segura para você acessar de outros dispositivos.\n\nNão vendemos seus dados. Usamos suas informações apenas para operar e melhorar o app. Você pode solicitar a exclusão dos seus dados a qualquer momento pelo Fale com a gente.\n\nVersão completa em mentorque.com.br/privacidade.",
        "We take your privacy seriously. Your garage data stays on your device and, if you create an account, is securely synced so you can access it from other devices.\n\nWe don't sell your data. We use your information only to operate and improve the app. You can request deletion of your data anytime via Talk to us.\n\nFull version at mentorque.com.br/privacy."
      ),
      signOut: T("Sair", "Sign out"),
      reset: T("Reiniciar protótipo", "Reset prototype"),
      demo: "Demo",
      downgrade: T("Voltar ao grátis (demo)", "Back to free (demo)"),
      account: T("Detalhes da conta", "Account details"),
      email: T("E-mail", "Email"),
      emailPh: T("seu@email.com", "you@email.com"),
      stateLabel: T("Seu estado", "Your state"),
      stateSelect: T("Selecione", "Select"),
      notSet: T("Não informado", "Not set"),
      cancelPlan: T("Cancelar assinatura", "Cancel subscription"),
      cancelConfirm: T("Cancelar a assinatura? Você continua Premium até o fim do período já pago.", "Cancel the subscription? You keep Premium until the end of the paid period."),
      canceledNote: T("Assinatura cancelada. Você segue Premium até o fim do período.", "Subscription canceled. You stay Premium until the end of the period."),
      activeUntil: T("Premium ativo · renova em {d}", "Premium active · renews {d}"),
      expiresOn: T("Sua assinatura expira em {d}", "Your subscription expires on {d}"),
      reactivate: T("Continuar aproveitando tudo", "Keep enjoying everything"),
      seePlans: T("Ver planos", "See plans"),
      perksTitle: T("Seus benefícios", "Your benefits"),
      perksFreeTitle: T("Com o Premium você desbloqueia", "Premium unlocks"),
      perks: [
        T("Sintomas com todas as causas e preço por peça", "Symptoms with all causes and per-part pricing"),
        T("Saúde por sistema + projeção de custo", "Per-system health + cost projection"),
        T("Plano de revisão do seu modelo", "Maintenance plan for your model"),
        T("Histórico e relatórios ilimitados", "Unlimited history and reports"),
        T("Biblioteca de aulas completa", "Full lesson library"),
      ],
      driverDefault: T("Motorista", "Driver"),
      changePhoto: T("Trocar foto de perfil", "Change profile photo"),
      accountTitle: T("Conta", "Account"),
      connectedWith: T("Conectado com {p}", "Connected with {p}"),
      changePassword: T("Trocar senha", "Change password"),
      passwordSent: T("Link enviado ✓", "Link sent ✓"),
      deleteAccount: T("Excluir conta", "Delete account"),
      deleteConfirm: T("Tem certeza? Isso apaga sua conta e todos os seus dados — não dá pra desfazer.", "Are you sure? This deletes your account and all your data — it can't be undone."),
      // Login card (login-only, sem convidado)
      save: {
        title: T("Salve sua garagem", "Save your garage"),
        body: T("Entre para manter sua garagem e histórico seguros em qualquer aparelho.", "Sign in to keep your garage and history safe on any device."),
        cta: T("Entrar no Mentorque", "Sign in to Mentorque"),
      },
      // Card "Desbloqueie o Premium" em destaque (compacto)
      unlock: {
        title: T("Desbloqueie o Premium", "Unlock Premium"),
        body: T("Garagem ilimitada, conteúdos exclusivos e diagnóstico ilimitado com o Biela.", "Unlimited garage, exclusive content and unlimited diagnosis with Biela."),
        cta: T("Ver planos Premium", "See Premium plans"),
        benefits: [
          T("Garagem ilimitada", "Unlimited garage"),
          T("Conteúdos exclusivos para o seu carro", "Exclusive content for your car"),
          T("Diagnóstico ilimitado com o Biela", "Unlimited diagnosis with Biela"),
        ],
      },
      support: {
        title: T("Dúvidas ou sugestões?", "Questions or suggestions?"),
        subtitle: T("Fale direto com a gente", "Talk to us directly"),
        doubt: T("Dúvida", "Question"),
        suggestion: T("Sugestão", "Suggestion"),
        bug: "Bug",
        messagePh: T("Escreva sua mensagem aqui...", "Write your message here..."),
        emailPh: T("Seu e-mail (pra gente responder)", "Your email (so we can reply)"),
        send: T("Enviar mensagem", "Send message"),
        sending: T("Enviando...", "Sending..."),
        empty: T("Escreva uma mensagem antes de enviar.", "Write a message before sending."),
        sent: T("Mensagem enviada! Obrigado — respondemos em breve. 🐻", "Message sent! Thanks — we'll reply soon. 🐻"),
        error: T("Não deu pra enviar agora. Tente de novo em instantes.", "Couldn't send right now. Please try again shortly."),
      },
      disclaimer: T(
        "Este app é independente e não possui vínculo com montadoras ou entidades oficiais. Marcas e modelos são citados apenas para fins informativos.",
        "This app is independent and not affiliated with automakers or official entities. Brands and models are cited for informational purposes only."
      ),
    },

    gamification: {
      // Level card (no Perfil)
      cardTitle: T("Sua jornada", "Your journey"),
      phaseLabel: T("SUA FASE", "YOUR PHASE"),
      next: T("Próximo: {phase}", "Next: {phase}"),
      pointsShort: "pts",
      toNext: T("Faltam {n} pts para {phase}", "{n} pts to {phase}"),
      maxLevel: T("Você chegou ao topo! 🏆", "You reached the top! 🏆"),
      howBtn: T("Como funciona?", "How it works?"),
      acervoBtn: T("Seu acervo", "Your collection"),

      // Fases (badges)
      phases: {
        aprendiz: { name: T("Aprendiz", "Beginner"), desc: T("O começo. Você acabou de chegar.", "The start. You just arrived.") },
        piloto: { name: T("Piloto", "Driver"), desc: T("Você pegou o ritmo dos primeiros cuidados.", "You're getting the hang of caring.") },
        cuidador: { name: T("Cuidador", "Caretaker"), desc: T("Cuidar do carro já virou rotina.", "Caring for your car is now routine.") },
        mecanico: { name: T("Mecânico de Garagem", "Garage Mechanic"), desc: T("Você domina o histórico e as revisões.", "You master history and services.") },
        mestre: { name: T("Mestre da Garagem", "Garage Master"), desc: T("Cuidado impecável, ano após ano.", "Flawless care, year after year.") },
        lenda: { name: T("Lenda Mentorque", "Mentorque Legend"), desc: T("Cuidado raro. O topo do Mentorque.", "Rare care. The top of Mentorque.") },
      } as Record<string, { name: string; desc: string }>,

      // "Como funciona?" — fases + atividades
      howTitle: T("Como as fases funcionam", "How phases work"),
      howIntro: T("Cada fase reflete o quanto você cuida do carro. Você avança conforme cuida.", "Each phase reflects how much you care for your car. You advance as you care."),
      phasesTitle: T("As fases", "The phases"),
      advanceTitle: T("O que faz você avançar", "What moves you forward"),
      activities: [
        { emoji: "🚗", label: T("Adicionar um carro à garagem", "Add a car to your garage"), pts: "+20" },
        { emoji: "🧾", label: T("Registrar um serviço no histórico", "Log a service in your history"), pts: "+15" },
        { emoji: "🪪", label: T("Completar seu perfil", "Complete your profile"), pts: "+15" },
        { emoji: "🔍", label: T("Fazer um diagnóstico de sintoma", "Run a symptom diagnosis"), pts: "+10" },
        { emoji: "📚", label: T("Concluir uma aula nos Estudos", "Finish a lesson in Studies"), pts: "+15" },
        { emoji: "💬", label: T("Tirar uma dúvida com o Biela", "Ask Biela a question"), pts: "+10" },
        { emoji: "✅", label: T("Manter a revisão em dia", "Keep your service on time"), pts: "+25" },
        { emoji: "🏅", label: T("Desbloquear um marco", "Unlock a milestone"), pts: "+5" },
      ],
      noRushTitle: T("Sem pressa", "No rush"),
      noRushBody: T("Sua fase mais alta fica sempre salva. Mesmo longe por um tempo, você não perde o nível.", "Your highest phase is always saved. Away for a while? You keep your level."),
      gotIt: T("Entendi", "Got it"),

      // "Seu acervo" — marcos & momentos
      acervoTitle: T("Seu acervo", "Your collection"),
      acervoIntro: T("Marcos e momentos da sua jornada cuidando do carro.", "Milestones and moments from your car-care journey."),
      tabMarcos: T("Marcos", "Milestones"),
      tabMomentos: T("Momentos", "Moments"),
      earnedCount: T("{n} de {total} conquistados", "{n} of {total} earned"),
      mark: T("Marcar", "Mark"),
      marked: T("Feito ✓", "Done ✓"),
      // Momentos (experiências com foto)
      momentsIntro: T("Momentos que você viveu com o carro. Registre e adicione uma foto.", "Moments you lived with your car. Register and add a photo."),
      tapToRegister: T("Toque para registrar", "Tap to register"),
      addPhoto: T("Adicionar foto", "Add photo"),
      changePhoto: T("Trocar foto", "Change photo"),
      photoSub: T("Adicione uma foto desse momento (opcional).", "Add a photo of this moment (optional)."),
      markLived: T("Marcar como vivido", "Mark as lived"),
      livedBadge: T("Vivido ✓", "Lived ✓"),
      removeMoment: T("Remover do acervo", "Remove from collection"),
      milestones: {
        // Marcos — cuidado / uso
        welcome: { title: T("Bem-vindo a bordo", "Welcome aboard"), desc: T("Você começou a cuidar do seu carro com o Mentorque.", "You started caring for your car with Mentorque.") },
        firstCar: { title: T("Primeiro carro", "First car"), desc: T("Você cadastrou seu primeiro carro na garagem.", "You registered your first car in the garage.") },
        named: { title: T("Batizou o carro", "You named it"), desc: T("Deu um apelido carinhoso pro seu carro.", "Gave your car a nickname.") },
        profileDone: { title: T("Perfil completo", "Complete profile"), desc: T("Nome, e-mail e estado preenchidos.", "Name, email and state all set.") },
        firstService: { title: T("Primeiro registro", "First log"), desc: T("Você registrou o primeiro serviço no histórico.", "You logged your first service in the history.") },
        fiveServices: { title: T("Cinco serviços", "Five services"), desc: T("Cinco serviços registrados. Histórico ganhando forma!", "Five services logged. Your history is taking shape!") },
        garageFull: { title: T("Garagem cheia", "Full garage"), desc: T("Três ou mais carros na sua garagem.", "Three or more cars in your garage.") },
        tenServices: { title: T("Histórico de mestre", "Master history"), desc: T("Dez serviços registrados. Cuidado exemplar!", "Ten services logged. Exemplary care!") },
        supporter: { title: T("Apoiador Premium", "Premium supporter"), desc: T("Você desbloqueou o Premium e apoia o projeto.", "You unlocked Premium and support the project.") },
        firstMonth: { title: T("Um mês juntos", "One month together"), desc: T("Um mês cuidando do carro por aqui.", "A month of caring for your car here.") },
        firstYear: { title: T("Um ano juntos", "One year together"), desc: T("Um ano de estrada ao lado do Mentorque.", "A year on the road with Mentorque.") },
        // Marcos — o motorista marca
        onTime: { title: T("Revisão em dia", "Service on time"), desc: T("Fez a revisão dentro do prazo recomendado.", "Did the service within the recommended window.") },
        streak: { title: T("Sequência de cuidados", "Care streak"), desc: T("Vários cuidados seguidos, sem deixar passar.", "Several cares in a row, nothing slipping.") },
        explorer: { title: T("Explorador dos Estudos", "Studies explorer"), desc: T("Concluiu aulas e aprendeu sobre o seu carro.", "Finished lessons and learned about your car.") },
        diagnostician: { title: T("Bom de diagnóstico", "Sharp diagnostician"), desc: T("Investigou sintomas e resolveu problemas.", "Investigated symptoms and solved problems.") },
        comeback: { title: T("Você voltou", "You're back"), desc: T("Retomou os cuidados depois de um tempo longe.", "Back to caring after some time away.") },
        // Momentos — experiências (com foto)
        firstTrip: { title: T("Primeira viagem", "First trip"), desc: T("Sua primeira viagem de verdade com ele.", "Your first real trip together.") },
        roadTrip: { title: T("Pegou a estrada", "Hit the road"), desc: T("Encarou uma viagem longa de carro.", "Took on a long road trip.") },
        firstWash: { title: T("Primeira lavagem", "First wash"), desc: T("Deixou ele brilhando pela primeira vez.", "Made it shine for the first time.") },
        nightDrive: { title: T("Rolê à noite", "Night drive"), desc: T("Uma volta noturna, só você e o carro.", "A night drive, just you and the car.") },
        rain: { title: T("Encarou a chuva", "Braved the rain"), desc: T("Dirigiu com firmeza no tempo fechado.", "Drove steady through the rain.") },
        sunset: { title: T("Pôr do sol na estrada", "Sunset on the road"), desc: T("Aquela vista de tirar o fôlego pela janela.", "That breathtaking view through the window.") },
        fullTank: { title: T("Tanque cheio, mundo aberto", "Full tank, open road"), desc: T("Aquele sentimento de tanque cheio e liberdade.", "That full-tank feeling of freedom.") },
        accessory: { title: T("Primeiro upgrade", "First upgrade"), desc: T("Um acessório ou melhoria nova pro carro.", "A new accessory or upgrade for the car.") },
      } as Record<string, { title: string; desc: string }>,
    },

    subscribe: {
      title: T("Assine o Mentorque", "Subscribe to Mentorque"),
      intro: T("Destrave tudo para cuidar do seu carro com confiança.", "Unlock everything to care for your car with confidence."),
      benefits: [
        T("Diagnósticos avançados", "Advanced diagnostics"),
        T("Checklists ilimitados para oficina", "Unlimited shop checklists"),
        T("Histórico ilimitado de serviços", "Unlimited service history"),
        T("Conteúdo exclusivo para o seu carro", "Exclusive content for your car"),
        T("Ultrapersonalização (motor + versão)", "Ultra-personalization (engine + version)"),
        T("Consultoria com a equipe e o creator", "Consulting with the team and creator"),
      ],
      monthly: { name: T("Mensal", "Monthly"), price: "R$ 29,90", note: T("por mês", "per month") },
      annual: { name: T("Anual", "Annual"), price: "R$ 239,90", note: T("por ano", "per year"), save: T("economia de 33%", "save 33%") },
      cta: T("Assinar agora", "Subscribe now"),
      working: T("Abrindo o pagamento...", "Opening checkout..."),
      checkoutError: T("Não foi possível iniciar o pagamento. Tente novamente.", "Couldn't start checkout. Please try again."),
      needLogin: T("Entre na sua conta para assinar.", "Sign in to subscribe."),
      later: T("Talvez depois", "Maybe later"),
      terms: T("Termos e política de privacidade", "Terms & privacy policy"),
      restore: T("Restaurar compra", "Restore purchase"),
      privacyLink: T("Privacidade", "Privacy"),
      termsLink: T("Termos", "Terms"),
      // Paywall com teste grátis
      trialTitle: T("Experimente o Premium", "Try Premium"),
      trialDays: 7,
      bullets: [
        T("Cancele a qualquer momento", "Cancel anytime"),
        T("Diagnóstico rápido e soluções na hora", "Fast diagnosis, instant solutions"),
        T("Informações detalhadas sobre o seu carro", "Detailed info about your car"),
      ],
      testimonials: [
        { quote: T("Melhor app pra cuidar do carro!", "Best app to care for your car!"), name: "Pedro S." },
        { quote: T("Economizei numa revisão que quase paguei a mais.", "Saved money on a service I nearly overpaid."), name: "Juliana M." },
      ],
      knowTitle: T("Conheça o Mentorque Premium", "Meet Mentorque Premium"),
      ltd: "Ltd",
      features: [
        { icon: "clock", label: T("Registrar serviços", "Log services"), free: "check" },
        { icon: "diagnose", label: T("Diagnóstico por sintoma", "Symptom diagnosis"), free: "ltd" },
        { icon: "calendar", label: T("Lembretes de revisão", "Service reminders"), free: "ltd" },
        { icon: "gauge", label: T("Saúde por sistema", "Per-system health"), free: "lock" },
        { icon: "book", label: T("Plano de revisão do seu carro", "Your car's service plan"), free: "lock" },
        { icon: "spark", label: T("Diagnóstico ilimitado com o Biela", "Unlimited diagnosis with Biela"), free: "lock" },
        { icon: "book", label: T("Biblioteca de aulas completa", "Full lesson library"), free: "lock" },
      ] as { icon: string; label: string; free: "check" | "ltd" | "lock" }[],
      reminder: T("Lembrar antes do teste terminar", "Remind me before the trial ends"),
      trialCta: T("Começar {n} dias grátis", "Start {n}-day free trial"),
      trialFine: T("Após o período grátis, R$ 239,90 cobrado anual. Cancele quando quiser.", "After the free trial, R$ 239.90 billed yearly. Cancel anytime."),
      compareTitle: T("Free vs Premium", "Free vs Premium"),
      colFree: T("Grátis", "Free"),
      colPremium: "Premium",
      compare: [
        { label: T("Carros", "Cars"), free: T("Até 2", "Up to 2"), premium: T("Ilimitados", "Unlimited") },
        { label: T("Diagnósticos", "Diagnostics"), free: T("Básicos", "Basic"), premium: T("Avançados e personalizados", "Advanced & personalized") },
        { label: T("Checklist p/ oficina", "Shop checklist"), free: T("Básico", "Basic"), premium: T("Completo + PDF", "Full + PDF") },
        { label: T("Histórico de serviços", "Service history"), free: T("Até 20", "Up to 20"), premium: T("Ilimitado + relatórios", "Unlimited + reports") },
        { label: T("Saúde do carro", "Car health"), free: T("Genérica", "Generic"), premium: T("Por sistema + projeção", "Per system + projection") },
        { label: T("Conteúdo", "Content"), free: T("Limitado", "Limited"), premium: T("Completo + trilhas", "Full + tracks") },
        { label: T("Exportar PDF / preços", "Export PDF / prices"), free: "—", premium: "✓" },
      ] as { label: string; free: string; premium: string }[],
    },

    // Live recalls / complaints / safety (NHTSA) — used by SafetyPanel.
    safety: {
      title: T("Recalls e segurança", "Recalls & safety"),
      source: T("Fonte: NHTSA · mercado dos EUA", "Source: NHTSA · US market"),
      loading: T("Consultando a NHTSA…", "Checking NHTSA…"),
      noMatch: T("Sem dados da NHTSA para este modelo (catálogo dos EUA). Fonte nacional em breve.", "No NHTSA data for this model (US catalog). A local source is coming soon."),
      recallsTitle: T("Recalls", "Recalls"),
      recallsNone: T("Nenhum recall em aberto encontrado.", "No open recalls found."),
      recallsFound: T("{n} recall(s) encontrado(s)", "{n} recall(s) found"),
      remedy: T("Solução", "Remedy"),
      complaintsTitle: T("Reclamações de donos", "Owner complaints"),
      complaintsCount: T("{n} reclamações registradas na NHTSA", "{n} complaints filed with NHTSA"),
      ratingTitle: T("Nota de segurança", "Safety rating"),
      ratingOverall: T("Geral", "Overall"),
      ratingFront: T("Colisão frontal", "Front crash"),
      ratingSide: T("Colisão lateral", "Side crash"),
      ratingRollover: T("Capotamento", "Rollover"),
    },
  };
}

export type Content = ReturnType<typeof getContent>;
