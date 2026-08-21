import type { Locale } from "@/lib/i18n";
import type { Access, Severity, SystemKey, Vehicle } from "./types";

// All app copy + mocked catalog data, resolved per locale so every screen is
// bilingual. Per-model depth is intentionally generic (the exact model-year
// detail is where Premium / consulting adds value).

// App version shown in the Profile footer.
export const APP_VERSION = "1.1.0";

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

// Conteúdo "Novo": publicado (addedAt) há no máximo 7 dias. Enquanto durar,
// vai para a 1ª posição do "Para você" com o selo — some antes se o usuário
// concluir ou salvar a aula.
export function isNewLesson(l: { addedAt?: string }, now = new Date()): boolean {
  if (!l.addedAt) return false;
  const d = new Date(l.addedAt + "T00:00:00");
  if (isNaN(d.getTime())) return false;
  return now.getTime() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
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
    Chevrolet: ["Onix", "Onix Plus", "Tracker", "Spin", "Montana", "S10", "Equinox", "Trailblazer", "Cruze", "Cruze Sport6", "Blazer", "Cobalt", "Prisma", "Joy", "Sonic"],
    Fiat: ["Strada", "Argo", "Mobi", "Pulse", "Pulse Abarth", "Fastback", "Toro", "Cronos", "Fiorino", "Titano", "Ducato", "Uno", "Palio", "Punto", "Grand Siena", "500"],
    Toyota: ["Corolla", "Corolla Cross", "Hilux", "Yaris", "Yaris Sedan", "SW4", "RAV4", "Camry", "Etios", "Etios Sedan"],
    Hyundai: ["HB20", "HB20S", "HB20X", "Creta", "Tucson", "Santa Fe", "ix35", "Azera", "Kona"],
    Honda: ["HR-V", "City", "City Hatchback", "Civic", "WR-V", "ZR-V", "CR-V", "Fit", "Accord"],
    Jeep: ["Renegade", "Compass", "Commander", "Wrangler", "Gladiator"],
    Renault: ["Kwid", "Kardian", "Duster", "Oroch", "Sandero", "Logan", "Stepway", "Captur", "Master", "Megane", "Fluence", "Boreal", "Koleos"],
    Nissan: ["Kicks", "Versa", "Frontier", "Sentra", "March", "Leaf", "Livina", "Grand Livina", "Kait", "GT-R"],
    Ford: ["Ranger", "Territory", "Bronco", "Bronco Sport", "Maverick", "Mustang", "Ka", "Ka Sedan", "EcoSport"],
    Peugeot: ["208", "2008", "3008", "5008", "Partner", "Expert", "Boxer", "308", "408"],
    "Citroën": ["C3", "C3 Aircross", "Basalt", "C4 Cactus", "C4 Lounge", "Jumpy", "Jumper"],
    "Caoa Chery": ["Tiggo 2", "Tiggo 3x", "Tiggo 5x", "Tiggo 7", "Tiggo 7 Pro", "Tiggo 8", "Tiggo 8 Pro", "Arrizo 6"],
    BYD: ["Dolphin", "Dolphin Mini", "Dolphin Plus", "Song Plus", "Song Pro", "Yuan Plus", "Yuan Pro", "Seal", "King", "Han", "Tan", "Atto 8"],
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

  // ---- Learn content (2.6) -------------------------------------------------
  // `media` makes the lesson playable in-app. provider "mp4" plays a direct file
  // (self-host: Supabase Storage / R2 / Mux / Cloudflare Stream); "youtube"/
  // "vimeo" embed via iframe. Swap `src` for real content.
  type Media = { provider: "mp4" | "youtube" | "vimeo"; src: string; poster?: string; vertical?: boolean };
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
    // Personalização sem depender do modelo: características do veículo
    // (turbo, cvt, ev, diesel, highKm…) e momento do dono (justBought,
    // overdue, noHistory). Ver lib/app/traits.ts.
    traits?: string[];
    situations?: string[];
    media?: Media;
    // Imagem ilustrativa do card (opcional). Duas formas, e a escolha importa:
    //
    // - Relativa (`/learn/oil-change.png`) para arte que JÁ foi junto num build.
    //   No app da loja o caminho resolve dentro do próprio pacote: carrega
    //   instantâneo e funciona sem rede. É o caso de quase tudo aqui.
    //
    // - Absoluta (`https://www.mentorque.com.br/learn/x.png`) para aula
    //   publicada ENTRE dois builds. O catálogo remoto entrega o texto da aula
    //   pela rede, mas não entrega arquivo: uma capa relativa apontaria para uma
    //   imagem que não existe no aparelho, e o card chegaria vazio.
    //
    // No build seguinte a arte passa a estar no binário e o endereço pode voltar
    // a ser relativo — vale a pena, porque aí volta a funcionar sem rede.
    thumb?: string;
    // Aulas relacionadas ("Continue por aqui" no rodapé do artigo) — ids de
    // outras aulas. Dentro do `body` também vale o link inline
    // `[[id-da-aula|texto do link]]`, renderizado como link âmbar no parágrafo.
    //
    // O `body` aceita ainda três prefixos de estrutura (aula sem prefixo segue
    // renderizando como sempre):
    //   "## Título"  → subtítulo de seção
    //   ">> Texto"   → caixa de destaque ("na prática")
    //   "!! Texto"   → caixa de alerta (segurança/risco)
    related?: string[];
    // Data de publicação (ISO yyyy-mm-dd). Conteúdo com até 7 dias vai para a
    // 1ª posição do "Para você" com o selo "Novo" — defina em TODO conteúdo
    // novo que for adicionado.
    addedAt?: string;
    body?: string[];
    need: string[];
    steps: string[];
    stepsByLevel?: { iniciante: string[]; avancado: string[]; mecanico: string[] };
    safety: string[];
  };
  // Helper for article-style items (no tool list / safety block).
  const art = (o: { id: string; title: string; track: string; system?: SystemKey | "geral"; premium?: boolean; make?: string; model?: string; body: string[]; related?: string[]; media?: Media; thumb?: string; type?: "video" | "article" | "checklist"; traits?: string[]; situations?: string[]; addedAt?: string }): Lesson => ({
    id: o.id, title: o.title, track: o.track, system: o.system ?? "geral", premium: o.premium,
    make: o.make, model: o.model, media: o.media, thumb: o.thumb, type: o.type ?? "article", body: o.body,
    related: o.related, traits: o.traits, situations: o.situations, addedAt: o.addedAt,
    need: [], steps: [], safety: [],
  });
  const lessons: Lesson[] = [
    {
      id: "oil-change",
      thumb: "/learn/oil-change.png?v=4",
      track: "diy",
      title: T("Como trocar o óleo (passo a passo)", "How to change the oil (step by step)"),
      type: "video",
      system: "engine",
      // TODO: troque pelo link/ID do YouTube real desta aula (aceita URL completa ou só o ID).
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
      thumb: "/learn/brake-pads.png?v=4",
      track: "diy",
      title: T("Trocar a pastilha de freio", "Replace the brake pads"),
      type: "video",
      system: "brakes",
      premium: true,
      // TODO: troque pelo link/ID do YouTube real desta aula (aceita URL completa ou só o ID).
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
      thumb: "/learn/read-obd2.png?v=4",
      track: "diagnosis",
      title: T("Luz de injeção ligada? Descubra o que é!", "Check-engine light on? Find out what it is!"),
      type: "article",
      system: "engine",
      addedAt: "2026-08-03",
      need: [T("Adaptador OBD2", "OBD2 adapter"), T("App de leitura", "A reader app")],
      steps: [T("Conecte o adaptador", "Plug in the adapter"), T("Leia os códigos ativos", "Read active codes"), T("Anote e pesquise cada código", "Note and look up each code")],
      safety: [T("Não dirija com a luz piscando", "Don't drive with a flashing light")],
    },
    {
      id: "obd2-scan",
      thumb: "/learn/obd2-scan.png?v=4",
      track: "diagnosis",
      title: T("Como usar seu scanner OBD2", "How to use your OBD2 scanner"),
      type: "video",
      system: "engine",
      // TODO: troque pelo link/ID do YouTube real desta aula.
      need: [T("Leitor OBD2 (Bluetooth ou cabo)", "OBD2 reader (Bluetooth or cable)"), T("App de leitura no celular", "A reader app on your phone")],
      steps: [T("Encontre a porta OBD2", "Find the OBD2 port"), T("Conecte e pareie o leitor", "Plug in and pair the reader"), T("Leia e anote os códigos", "Read and note the codes")],
      safety: [T("Não apague códigos antes de resolver a causa", "Don't clear codes before fixing the cause")],
    },
    {
      id: "fuel-compare",
      thumb: "/learn/fuel-compare.png?v=4",
      track: "money",
      title: T("Etanol ou Gasolina? O que rende mais no meu carro?", "Ethanol or Gasoline? Which goes further in my car?"),
      type: "article",
      system: "engine",
      addedAt: "2026-08-04",
      need: [T("Preços do posto", "Pump prices"), T("Consumo do carro, se souber", "Your car's km/l, if known")],
      steps: [T("Informe os preços do posto", "Enter the pump prices"), T("Conte como é o seu motor", "Tell us about your engine"), T("Veja qual combustível compensa", "See which fuel pays off")],
      safety: [],
    },
    {
      id: "basics",
      thumb: "/learn/basics.png?v=4",
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
      thumb: "/learn/tire-care.png?v=4",
      track: "diy",
      title: T("Cuidando dos pneus", "Taking care of your tires"),
      type: "article",
      system: "tires",
      need: [T("Calibrador", "Pressure gauge")],
      steps: [T("Calibre a cada 15 dias", "Check pressure every 2 weeks"), T("Faça rodízio a cada 10 mil km", "Rotate every 10,000 km"), T("Observe o desgaste", "Watch for uneven wear")],
      safety: [T("Calibre com pneu frio", "Set pressure on cold tires")],
    },

    // ── Fundamentos ─────────────────────────────────────────────
    art({ id: "fund-systems", thumb: "/learn/fund-systems.png?v=4", track: "fundamentals", title: T("Os 6 sistemas do carro", "The 6 systems of a car"), body: [
      T("Todo carro é a soma de seis sistemas: motor (gera força), transmissão (leva a força às rodas), freios, suspensão, direção e elétrica.", "Every car is the sum of six systems: engine (makes power), transmission (sends it to the wheels), brakes, suspension, steering and electrical."),
      T("Entender o que cada um faz te ajuda a saber onde está o problema quando algo sai do normal — e a conversar de igual pra igual com a oficina.", "Understanding what each one does helps you locate a problem when something feels off — and talk to the shop on equal footing."),
    ]}),
    art({ id: "fund-dashboard", thumb: "/learn/fund-dashboard.png?v=4", track: "fundamentals", title: T("Luzes do painel: o que significam", "Dashboard lights: what they mean"), body: [
      T("Verde/azul é informação. Amarelo é atenção: resolva em breve. Vermelho é pare agora — óleo, temperatura ou freio.", "Green/blue is information. Yellow means attention: fix it soon. Red means stop now — oil, temperature or brakes."),
      T("Se a luz do motor pisca, evite acelerar e procure diagnóstico. Fixa, dá pra rodar com cuidado até a oficina.", "If the engine light flashes, avoid accelerating and get it diagnosed. Steady, you can drive gently to the shop."),
    ]}),
    art({ id: "fund-fluids", thumb: "/learn/fund-fluids.png?v=4", track: "fundamentals", title: T("Os 5 fluidos essenciais", "The 5 essential fluids"), system: "engine", body: [
      T("Óleo do motor, fluido de freio, líquido de arrefecimento, fluido de direção e água do limpador. Cada um tem cor e função próprias.", "Engine oil, brake fluid, coolant, steering fluid and washer water. Each has its own color and job."),
      T("Verificar os níveis a cada abastecimento leva 2 minutos e evita a maioria das panes graves.", "Checking levels at each fill-up takes 2 minutes and prevents most serious breakdowns."),
    ]}),
    { id: "fund-calendar", thumb: "/learn/fund-calendar.png?v=4", track: "fundamentals", title: T("Calendário de manutenção", "Maintenance calendar"), type: "checklist", system: "geral",
      need: [], body: [T("Um roteiro do que revisar e quando.", "A guide of what to check and when.")],
      steps: [T("Óleo e filtro: a cada 10 mil km ou 1 ano", "Oil and filter: every 10,000 km or 1 year"), T("Pneus: rodízio a cada 10 mil km, calibragem quinzenal", "Tires: rotate every 10,000 km, pressure every 2 weeks"), T("Freios: inspeção a cada 20 mil km", "Brakes: inspect every 20,000 km"), T("Correia dentada: 50–60 mil km (ver manual)", "Timing belt: 50–60k km (see manual)"), T("Fluido de freio: a cada 2 anos", "Brake fluid: every 2 years")],
      safety: [] },

    // ── Faça Você Mesmo (DIY) ──────────────────────────────────
    { id: "diy-battery", thumb: "/learn/diy-battery.png?v=4", track: "diy", title: T("Trocar a bateria", "Replace the battery"), type: "video", system: "electrical", difficulty: "facil",
      body: [],
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
    { id: "diy-airfilter", thumb: "/learn/diy-airfilter.png?v=4", track: "diy", title: T("Trocar o filtro de ar", "Replace the air filter"), type: "video", system: "engine", difficulty: "facil",
      body: [],
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
    { id: "diy-wipers", thumb: "/learn/diy-wipers.png?v=4", track: "diy", title: T("Trocar as palhetas do limpador", "Replace the wiper blades"), type: "video", system: "electrical", difficulty: "facil",
      body: [],
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
    art({ id: "diag-noises", thumb: "/learn/diag-noises.png?v=4", track: "diagnosis", title: T("Que barulho é esse? Guia de sons", "What's that noise? Sound guide"), body: [
      T("Chiado ao frear = pastilha no fim. Batida em buraco = suspensão. Assobio ao acelerar = correia ou admissão. Estalo ao esterçar = homocinética.", "Squeal when braking = pads worn. Knock over bumps = suspension. Whistle on throttle = belt or intake. Click when turning = CV joint."),
      T("Grave o som com o celular e mostre pro Biela ou pra oficina — ajuda muito no diagnóstico.", "Record the sound with your phone and show Biela or the shop — it helps a lot with the diagnosis."),
    ]}),
    art({ id: "diag-smells", thumb: "/learn/diag-smells.png?v=4", track: "diagnosis", title: T("Cheiros e fumaça: o que indicam", "Smells and smoke: what they mean"), body: [
      T("Fumaça azul = queima de óleo. Branca densa = água no motor (junta). Preta = mistura rica. Cheiro doce = arrefecimento vazando.", "Blue smoke = burning oil. Thick white = water in the engine (gasket). Black = rich mixture. Sweet smell = coolant leak."),
      T("Cheiro de queimado ao frear pede parada imediata: freio superaquecido.", "A burning smell when braking means stop now: overheated brakes."),
    ]}),
    art({ id: "diag-leaks", thumb: "/learn/diag-leaks.png?v=4", track: "diagnosis", title: T("Manchas no chão: qual vazamento?", "Stains on the floor: which leak?"), body: [
      T("Marrom/preto = óleo. Vermelho/rosa = direção ou câmbio. Verde/laranja = arrefecimento. Transparente = ar-condicionado (normal).", "Brown/black = oil. Red/pink = steering or transmission. Green/orange = coolant. Clear = A/C (normal)."),
      T("Coloque um papelão sob o carro à noite para localizar a origem do vazamento.", "Put cardboard under the car overnight to locate where the leak comes from."),
    ]}),

    // ── Economia & Bolso ───────────────────────────────────────
    art({ id: "money-fuel", thumb: "/learn/money-fuel.png?v=4", track: "money", title: T("Dirigir gastando menos", "Drive spending less"), body: [
      T("Calibragem correta, filtro limpo e conduzir suave (sem arrancadas) economizam até 20% de combustível.", "Correct pressure, a clean filter and smooth driving (no jackrabbit starts) save up to 20% of fuel."),
      T("Peso extra e ar-condicionado em alta velocidade pesam menos do que se imagina; janela aberta na estrada pesa mais.", "Extra weight and A/C at high speed matter less than people think; open windows on the highway matter more."),
    ]}),
    art({ id: "money-repair-replace", thumb: "/learn/money-repair-replace.png?v=4", track: "money", title: T("Consertar ou trocar de carro?", "Repair or replace the car?"), body: [
      T("Regra prática: se o conserto passa de 50% do valor do carro, ou se você gasta em reparos mais que uma parcela por mês, reavalie.", "Rule of thumb: if a repair exceeds 50% of the car's value, or you spend more on repairs than a monthly payment, reconsider."),
      T("Some tudo que gastou no último ano (está no seu Histórico) antes de decidir.", "Add up everything you spent in the last year (it's in your History) before deciding."),
    ]}),
    art({ id: "money-quote", thumb: "/learn/money-quote.png?v=4", track: "money", title: T("Ler um orçamento e evitar golpes", "Read a quote and avoid scams"), body: [
      T("Exija orçamento por escrito com peças e mão de obra separadas. Desconfie de 'já que abriu, troca tudo'.", "Demand a written quote with parts and labor itemized. Be wary of 'while it's open, replace everything'."),
      T("Peça as peças velhas de volta e um segundo orçamento em reparos caros.", "Ask for the old parts back and get a second quote on expensive repairs."),
    ]}),
    { id: "money-used", thumb: "/learn/money-used.png?v=4", track: "money", title: T("Checklist para comprar usado", "Used-car checklist"), type: "checklist", system: "geral",
      need: [], body: [T("O que conferir antes de fechar negócio.", "What to check before closing the deal.")],
      steps: [T("Histórico de manutenção e dono anterior", "Service history and previous owner"), T("Alinhamento da pintura e folgas (batida)", "Paint and panel gaps (crash)"), T("Óleo, arrefecimento e fumaça na partida", "Oil, coolant and smoke at startup"), T("Test-drive: freio, câmbio, ruídos", "Test drive: brakes, gearbox, noises"), T("Débitos, multas e vistoria cautelar", "Debts, fines and an independent inspection")],
      safety: [] },

    // ── Por Montadora ──────────────────────────────────────────
    art({ id: "brand-vw", thumb: "/learn/brand-vw.png?v=4", track: "brand", make: "Volkswagen", premium: true, title: T("Volkswagen: pontos de atenção", "Volkswagen: what to watch"), body: [
      T("Linha TSI: atenção à corrente de comando e ao consumo de óleo em motores mais rodados. Turbo pede óleo no ponto certo.", "TSI line: watch the timing chain and oil consumption on higher-mileage engines. The turbo needs oil right on spec."),
      T("Revisões oficiais a cada 10 mil km/1 ano. Consulte o manual do seu modelo para os intervalos exatos.", "Official service every 10,000 km/1 year. Check your model's manual for the exact intervals."),
    ]}),
    art({ id: "brand-chevrolet", thumb: "/learn/brand-chevrolet.png?v=4", track: "brand", make: "Chevrolet", premium: true, title: T("Chevrolet: pontos de atenção", "Chevrolet: what to watch"), body: [
      T("Motores 1.0/1.2 turbo modernos são econômicos, mas exigem óleo correto e troca em dia para proteger o turbo.", "Modern 1.0/1.2 turbo engines are efficient but demand the correct oil and on-time changes to protect the turbo."),
      T("Atenção ao módulo elétrico e ao MyLink em modelos mais antigos.", "Watch the electrical module and MyLink on older models."),
    ]}),
    art({ id: "brand-fiat", thumb: "/learn/brand-fiat.png?v=4", track: "brand", make: "Fiat", premium: true, title: T("Fiat: pontos de atenção", "Fiat: what to watch"), body: [
      T("Firefly (1.0/1.3) é robusto; cuide da correia dentada banhada a óleo nos que a usam. Picapes pedem atenção à suspensão traseira.", "Firefly (1.0/1.3) is sturdy; mind the oil-bathed timing belt where fitted. Pickups need attention to the rear suspension."),
      T("Câmbio automatizado antigo (Dualogic) pede condução adaptada e revisão específica.", "The old automated gearbox (Dualogic) needs an adapted driving style and specific servicing."),
    ]}),
    art({ id: "brand-toyota", thumb: "/learn/brand-toyota.png?v=4", track: "brand", make: "Toyota", premium: true, title: T("Toyota: pontos de atenção", "Toyota: what to watch"), body: [
      T("Fama de confiável se mantém com revisão em dia. Aspirados são tranquilos; híbridos pedem cuidado com a bateria de alta tensão.", "The reliability reputation holds with on-time service. NA engines are easy; hybrids need care with the high-voltage battery."),
      T("Intervalos oficiais a cada 10 mil km. Peças originais costumam durar mais.", "Official intervals every 10,000 km. Genuine parts tend to last longer."),
    ]}),
    art({ id: "brand-byd", thumb: "/learn/brand-byd.png?v=4", track: "brand", make: "BYD", premium: true, title: T("BYD: cuidados com elétricos", "BYD: caring for EVs"), body: [
      T("Sem óleo de motor, mas há fluido de arrefecimento da bateria, freios e filtro de cabine. A manutenção é mais barata, não inexistente.", "No engine oil, but there's battery coolant, brakes and a cabin filter. Maintenance is cheaper, not zero."),
      T("Freio regenerativo faz as pastilhas durarem muito; ainda assim inspecione contra corrosão.", "Regen braking makes pads last a long time; still inspect them for corrosion."),
    ]}),

    // ── Por Modelo ─────────────────────────────────────────────
    art({ id: "model-onix", thumb: "/learn/model-onix.png?v=4", track: "model", make: "Chevrolet", model: "Onix", premium: true, title: T("Chevrolet Onix: guia do dono", "Chevrolet Onix: owner's guide"), body: [
      T("Onix turbo (1.0): use óleo 0W-20/5W-30 conforme o ano e não atrase a troca — o turbo agradece. Revisão a cada 10 mil km.", "Onix turbo (1.0): use 0W-20/5W-30 oil per year and don't delay changes — the turbo thanks you. Service every 10,000 km."),
      T("Pontos comuns: sensores e módulo elétrico; mantenha a bateria em boas condições.", "Common points: sensors and the electrical module; keep the battery healthy."),
    ]}),
    art({ id: "model-hb20", thumb: "/learn/model-hb20.png?v=4", track: "model", make: "Hyundai", model: "HB20", premium: true, title: T("Hyundai HB20: guia do dono", "Hyundai HB20: owner's guide"), body: [
      T("Motores 1.0 aspirado e turbo. O turbo (T-GDI) pede óleo correto e troca em dia. Suspensão firme, boa durabilidade.", "1.0 NA and turbo engines. The turbo (T-GDI) needs the right oil and on-time changes. Firm suspension, good durability."),
      T("Revisões a cada 10 mil km; atenção às buchas da suspensão com o tempo.", "Service every 10,000 km; watch the suspension bushings over time."),
    ]}),
    art({ id: "model-polo", thumb: "/learn/model-polo.png?v=4", track: "model", make: "Volkswagen", model: "Polo", premium: true, title: T("VW Polo: guia do dono", "VW Polo: owner's guide"), body: [
      T("TSI 1.0 é econômico e esperto. Cuide do nível de óleo entre trocas e use combustível de qualidade para o turbo.", "The 1.0 TSI is efficient and clever. Watch the oil level between changes and use quality fuel for the turbo."),
      T("Central multimídia e sensores pedem atenção; revisão a cada 10 mil km.", "Infotainment and sensors need attention; service every 10,000 km."),
    ]}),
    art({ id: "model-strada", thumb: "/learn/model-strada.png?v=4", track: "model", make: "Fiat", model: "Strada", premium: true, title: T("Fiat Strada: guia do dono", "Fiat Strada: owner's guide"), body: [
      T("Picape mais vendida do país. Firefly confiável; atenção à suspensão traseira quando anda carregada e à geometria.", "The country's best-selling pickup. Reliable Firefly; watch the rear suspension when loaded and the alignment."),
      T("Uso de trabalho acelera desgaste de freio e pneu — inspecione com mais frequência.", "Work use speeds up brake and tire wear — inspect more often."),
    ]}),
    art({ id: "model-corolla", thumb: "/learn/model-corolla.png?v=4", track: "model", make: "Toyota", model: "Corolla", premium: true, title: T("Toyota Corolla: guia do dono", "Toyota Corolla: owner's guide"), body: [
      T("Sedã referência em durabilidade. Versão híbrida traz economia enorme; a bateria tem longa vida com uso normal.", "A benchmark sedan for durability. The hybrid brings huge savings; the battery lasts long with normal use."),
      T("Mantenha revisões oficiais para preservar valor de revenda e garantia estendida.", "Keep official service to preserve resale value and the extended warranty."),
    ]}),

    // ── Esportivos / Garagem dos Sonhos ────────────────────────
    art({ id: "sport-drivetrain", thumb: "/learn/sport-drivetrain.png?v=4", track: "sports", title: T("Tração: dianteira, traseira, integral", "Drive: front, rear, all-wheel"), body: [
      T("Dianteira é barata e estável. Traseira é a preferida dos esportivos pela distribuição de peso na aceleração. Integral agarra em qualquer piso.", "Front-wheel is cheap and stable. Rear-wheel is the sports favorite for weight transfer under acceleration. All-wheel grips on any surface."),
      T("Cada uma muda como o carro se comporta na curva e na chuva.", "Each changes how the car behaves in corners and in the rain."),
    ]}),
    art({ id: "sport-dct", thumb: "/learn/sport-dct.png?v=4", track: "sports", premium: true, title: T("Câmbio de dupla embreagem (DCT)", "Dual-clutch gearbox (DCT)"), body: [
      T("Duas embreagens pré-selecionam a próxima marcha: trocas em milésimos, sem cortar a força. É o câmbio dos superesportivos e de muitos populares turbo.", "Two clutches pre-select the next gear: shifts in milliseconds without cutting power. It's the gearbox of supercars and many turbo hatches."),
      T("Exige óleo específico e não gosta de 'segurar na rampa' no ponto de fricção.", "It needs specific oil and dislikes being held on a hill at the friction point."),
    ]}),
    art({ id: "sport-aero", thumb: "/learn/sport-aero.png?v=4", track: "sports", premium: true, title: T("Aerodinâmica e downforce", "Aerodynamics and downforce"), body: [
      T("Asas e difusores invertem o princípio do avião: em vez de sustentar, empurram o carro contra o chão. Mais aderência em alta velocidade.", "Wings and diffusers invert the airplane principle: instead of lift, they push the car into the ground. More grip at high speed."),
      T("Downforce custa arrasto — por isso carros de rua buscam equilíbrio entre grude e velocidade final.", "Downforce costs drag — that's why road cars balance grip and top speed."),
    ]}),
    art({ id: "sport-911", thumb: "/learn/sport-911.png?v=4", track: "sports", premium: true, title: T("Ícone: Porsche 911", "Icon: Porsche 911"), body: [
      T("Desde 1963 com o motor atrás do eixo traseiro — uma 'anomalia' que a Porsche transformou em obra-prima de engenharia geração após geração.", "Since 1963 with the engine behind the rear axle — an 'anomaly' Porsche turned into an engineering masterpiece generation after generation."),
      T("Prova de que evolução constante vale mais que reinvenção: a silhueta é quase a mesma há 60 anos.", "Proof that constant evolution beats reinvention: the silhouette has barely changed in 60 years."),
    ]}),
    art({ id: "sport-gtr", thumb: "/learn/sport-gtr.png?v=4", track: "sports", premium: true, title: T("Ícone: Nissan GT-R", "Icon: Nissan GT-R"), body: [
      T("Apelidado de 'Godzilla', usa tração integral inteligente e motor V6 biturbo montado à mão para humilhar superesportivos que custam o triplo.", "Nicknamed 'Godzilla', it uses smart all-wheel drive and a hand-built twin-turbo V6 to humble supercars costing triple."),
      T("Um marco de como tecnologia pode democratizar a performance.", "A milestone in how technology can democratize performance."),
    ]}),
    art({ id: "sport-muscle", thumb: "/learn/sport-muscle.png?v=4", track: "sports", premium: true, title: T("Muscle cars: a era dos V8", "Muscle cars: the V8 era"), body: [
      T("Anos 60-70 nos EUA: motores V8 gigantes em carros acessíveis. Mustang, Camaro e Charger viraram lenda pela força bruta e pelo som.", "1960s-70s USA: huge V8 engines in affordable cars. Mustang, Camaro and Charger became legends for brute force and sound."),
      T("A filosofia 'sem substituto para cilindrada' moldou a cultura automotiva por décadas.", "The 'no replacement for displacement' philosophy shaped car culture for decades."),
    ]}),

    // ── Cultura & Curiosidades ─────────────────────────────────
    art({ id: "cult-history", thumb: "/learn/cult-history.png?v=4", track: "culture", title: T("Breve história do automóvel", "A brief history of the car"), type: "video", body: [
      T("De 1886, com o Benz Patent-Motorwagen, à linha de montagem de Ford e à eletrificação de hoje — pouco mais de um século que mudou o mundo.", "From 1886, with the Benz Patent-Motorwagen, to Ford's assembly line and today's electrification — just over a century that changed the world."),
    ]}),
    art({ id: "cult-ev", thumb: "/learn/cult-ev.png?v=4", track: "culture", title: T("Como funciona um carro elétrico", "How an electric car works"), body: [
      T("Bateria alimenta um motor elétrico que entrega torque instantâneo. Sem câmbio, sem embreagem, sem óleo de motor.", "A battery feeds an electric motor delivering instant torque. No gearbox, no clutch, no engine oil."),
      T("O freio regenerativo recarrega a bateria ao desacelerar — por isso as pastilhas duram tanto.", "Regenerative braking recharges the battery when slowing down — that's why the pads last so long."),
    ]}),
    art({ id: "cult-hybrid", thumb: "/learn/cult-hybrid.png?v=4", track: "culture", title: T("Híbridos: dois mundos", "Hybrids: two worlds"), body: [
      T("Combinam motor a combustão e elétrico. No trânsito, rodam no elétrico (econômico); na estrada, o motor assume. Alguns recarregam na tomada (plug-in).", "They combine a combustion and an electric motor. In traffic they run electric (efficient); on the highway the engine takes over. Some charge from a plug (plug-in)."),
    ]}),
    art({ id: "cult-adas", thumb: "/learn/cult-adas.png?v=4", track: "culture", title: T("ADAS: os assistentes de direção", "ADAS: driver assists"), body: [
      T("Frenagem automática, alerta de faixa e piloto adaptativo usam câmeras e radares para reduzir acidentes.", "Automatic braking, lane alerts and adaptive cruise use cameras and radars to cut accidents."),
      T("São assistentes, não pilotos: exigem atenção total do motorista.", "They're assistants, not drivers: they require the driver's full attention."),
    ]}),

    // ── Por característica do veículo (traits) ───────────────────────────
    // Servem a centenas de modelos: um conteúdo de turbo vale para Polo TSI,
    // Kicks, Compass, Pulse Abarth… Ver lib/app/traits.ts.
    art({ id: "trait-turbo", thumb: "/learn/trait-turbo.png?v=4", track: "diy", traits: ["turbo"], system: "engine", addedAt: "2026-08-04",
      title: T("Motor turbo: 5 cuidados que dobram a vida dele", "Turbo engine: 5 habits that double its life"), body: [
      T("O turbo trabalha a mais de 100.000 rpm e é lubrificado pelo óleo do motor. Isso muda três coisas na sua rotina: o óleo tem que ser exatamente o especificado, o intervalo de troca é mais curto, e nível baixo é muito mais grave que num aspirado.", "The turbo spins over 100,000 rpm and is lubricated by engine oil. That changes three things: the oil must be exactly the specified one, the interval is shorter, and low level is far more serious than on a naturally aspirated engine."),
      T("1) Use só o óleo da especificação do manual — o turbo é o primeiro a sofrer com óleo errado. 2) Confira o nível a cada 15 dias, não a cada revisão.", "1) Use only the manual's oil spec — the turbo suffers first from wrong oil. 2) Check the level every two weeks, not every service."),
      T("3) Depois de rodar forte (estrada, subida, carga), deixe o motor em marcha lenta por 30–60 segundos antes de desligar: o óleo precisa continuar circulando para o turbo esfriar. Desligar quente é o que mais 'mata' turbina.", "3) After hard driving, idle for 30–60 seconds before shutting off: oil must keep flowing to cool the turbo. Shutting down hot is the top turbo killer."),
      T("4) Nos primeiros minutos com o motor frio, evite acelerar forte — o óleo ainda está grosso e não chegou bem ao turbo. 5) Filtro de ar sujo faz o turbo trabalhar mais: troque no prazo.", "4) In the first minutes when cold, avoid hard acceleration — the oil is still thick and hasn't reached the turbo. 5) A dirty air filter makes the turbo work harder: replace on schedule."),
      T("Sinais de alerta: fumaça azulada, apito agudo que aumenta com a aceleração, perda de força e consumo de óleo entre trocas. Qualquer um deles pede diagnóstico antes de virar prejuízo grande.", "Warning signs: bluish smoke, a high-pitched whine that rises with revs, power loss and oil consumption between changes. Any of these calls for a diagnosis before it becomes expensive."),
    ]}),
    art({ id: "trait-cvt", thumb: "/learn/trait-cvt.png?v=4", track: "fundamentals", traits: ["cvt"], system: "engine", addedAt: "2026-08-04",
      title: T("Câmbio CVT: o que preserva e o que destrói", "CVT gearbox: what preserves it and what kills it"), body: [
      T("O CVT não tem marchas: ele usa uma correia de aço entre polias que mudam de diâmetro. É suave e econômico, mas trabalha por atrito — e é por isso que o fluido dele é item de vida ou morte.", "A CVT has no gears: it uses a steel belt between variable pulleys. It's smooth and efficient, but works by friction — which is why its fluid is a life-or-death item."),
      T("Regra número um: troque o fluido no intervalo do manual (costuma ser entre 40.000 e 60.000 km) e use SÓ o fluido especificado. Fluido genérico de automático destrói um CVT — não é exagero de fabricante.", "Rule one: change the fluid at the manual's interval (usually 40,000–60,000 km) and use ONLY the specified fluid. Generic automatic fluid destroys a CVT — that's not marketing."),
      T("O que desgasta: arrancadas bruscas, sair com o carro atolado forçando na areia/lama, e rebocar acima do permitido. O CVT sofre com torque repentino, justamente o oposto do que ele foi feito para fazer.", "What wears it: hard launches, forcing through sand or mud, and towing over the limit. CVTs suffer from sudden torque — the opposite of what they're built for."),
      T("Sinais de problema: trepidação ao acelerar em baixa velocidade, o motor 'disparar' de rotação sem o carro acompanhar, ou barulho de zumbido que aumenta com a velocidade. Não deixe passar: reparo de CVT é caro.", "Trouble signs: shudder at low speed, engine revving without the car following, or a hum that rises with speed. Don't ignore it: CVT repair is expensive."),
    ]}),
    art({ id: "trait-dct", thumb: "/learn/trait-dct.png?v=4", track: "fundamentals", traits: ["dct", "amt"], system: "engine", addedAt: "2026-08-04",
      title: T("Câmbio automatizado no dia a dia: o que é normal", "Automated gearbox day to day: what's normal"), body: [
      T("Dupla embreagem e câmbio automatizado de uma embreagem são, por dentro, câmbios manuais que o computador opera. Isso explica os 'defeitos' que na verdade são características: pequenos trancos em baixa velocidade e hesitação na saída.", "Dual-clutch and single-clutch automated gearboxes are, inside, manual gearboxes operated by a computer. That explains the 'faults' that are actually traits: small jerks at low speed and hesitation from a stop."),
      T("O que realmente faz mal: ficar em D parado no trânsito com o pé no freio por muito tempo (nas versões secas, a embreagem fica patinando e esquenta) e usar o acelerador para segurar o carro em subida — use o freio de mão.", "What really hurts: sitting in D in traffic with your foot on the brake (on dry-clutch versions the clutch slips and overheats) and holding the car on a hill with the throttle — use the handbrake instead."),
      T("Em engarrafamento pesado, ponha em N nas paradas longas. Em subidas com manobra (rampa de garagem), seja decidido: meia-embreagem prolongada é o que mais queima o conjunto.", "In heavy traffic, shift to N during long stops. On ramps, be decisive: prolonged slipping is what burns the clutch pack."),
      T("Trepidação forte ao sair, cheiro de queimado e luz de câmbio no painel são sinais de embreagem no fim. Diagnóstico cedo pode significar trocar só a embreagem em vez do câmbio inteiro.", "Strong shudder from a stop, a burnt smell and a gearbox light are signs of a worn clutch. An early diagnosis can mean replacing just the clutch instead of the whole box."),
    ]}),
    art({ id: "trait-ev", thumb: "/learn/trait-ev.png?v=4", track: "fundamentals", traits: ["ev"], system: "electrical", addedAt: "2026-08-04",
      title: T("Elétrico: a rotina que preserva a bateria", "Electric: the routine that preserves the battery"), body: [
      T("A bateria é o componente mais caro do carro — e ela envelhece por dois motivos: ciclos de carga e temperatura. A boa notícia é que a rotina que preserva é simples e não atrapalha o uso.", "The battery is the car's most expensive part — and it ages for two reasons: charge cycles and heat. The good news: the routine that preserves it is simple."),
      T("No dia a dia, mantenha entre 20% e 80%. Carga até 100% só quando for viajar, e de preferência saia logo depois (bateria cheia parada, no calor, é o pior cenário). Abaixo de 10% com frequência também desgasta.", "Day to day, keep it between 20% and 80%. Charge to 100% only before a trip, and leave soon after (a full battery sitting in the heat is the worst case). Frequently going below 10% also wears it."),
      T("Carregador rápido é ótimo na estrada, mas não como rotina diária: ele aquece muito mais a bateria. Se puder, deixe a carga lenta em casa como padrão e o rápido para as viagens.", "Fast charging is great on trips, but not as a daily routine: it heats the battery much more. Use slow home charging as the default and fast charging for travel."),
      T("O que muda na manutenção: não tem óleo de motor, vela ou correia — mas continuam existindo freios, suspensão, pneus, fluido de freio e filtro de cabine. E atenção aos pneus: elétrico é mais pesado e desgasta mais rápido.", "What changes: no engine oil, plugs or belts — but brakes, suspension, tires, brake fluid and cabin filter remain. Watch the tires: EVs are heavier and wear them faster."),
      T("Curiosidade útil: o freio regenerativo faz as pastilhas durarem muito mais, mas por rodarem pouco elas podem oxidar. Uma frenagem mais firme de vez em quando ajuda a limpar os discos.", "Useful note: regenerative braking makes pads last much longer, but since they're barely used they can rust. An occasional firmer stop helps clean the discs."),
    ]}),
    art({ id: "trait-diesel", thumb: "/learn/trait-diesel.png?v=4", track: "fundamentals", traits: ["diesel"], system: "engine", addedAt: "2026-08-04",
      title: T("Diesel: os cuidados que evitam prejuízo grande", "Diesel: the care that avoids big bills"), body: [
      T("Motor diesel moderno trabalha com pressão de injeção altíssima, e o inimigo número um é a água no combustível. Por isso o filtro (o famoso 'filtro Racor' ou separador) é o item mais importante da manutenção.", "A modern diesel runs at very high injection pressure, and enemy number one is water in the fuel. That's why the filter/water separator is the single most important maintenance item."),
      T("Drene o separador de água no intervalo indicado e troque o filtro de combustível rigorosamente no prazo. Bico injetor de diesel custa caro, e água ou sujeira acabam com o conjunto em pouco tempo.", "Drain the water separator at the recommended interval and replace the fuel filter strictly on time. Diesel injectors are expensive, and water or dirt destroy them quickly."),
      T("Se o seu tem Arla 32 (SCR), nunca deixe faltar nem complete com água: o sistema entra em modo de emergência e limita a potência. Use Arla de procedência e evite deixar o galão aberto no sol.", "If yours uses DEF (SCR), never run out and never top it up with water: the system goes into limp mode. Use quality DEF and don't leave the jug open in the sun."),
      T("Filtro de partículas (DPF): trajetos curtos e cidade impedem a queima automática da fuligem. Se o painel avisar, faça o que o manual pede — geralmente rodar em velocidade constante por alguns minutos. Ignorar entope o filtro e o reparo é caro.", "Particulate filter (DPF): short city trips prevent automatic soot burn-off. If the dash warns you, do what the manual says — usually drive at steady speed for a few minutes. Ignoring it clogs the filter and repair is costly."),
    ]}),
    art({ id: "trait-highkm", thumb: "/learn/trait-highkm.png?v=4", track: "diagnosis", traits: ["highKm", "oldCar"], system: "geral", addedAt: "2026-08-04",
      title: T("Passou de 100 mil km? Revise estes 7 pontos", "Past 100,000 km? Check these 7 points"), body: [
      T("Carro com quilometragem alta não é problema — carro com quilometragem alta e manutenção adiada é. Nesta faixa, alguns itens saem do 'ainda aguenta' e entram no 'já era para ter trocado'.", "High mileage isn't a problem — high mileage with deferred maintenance is. At this point, some items move from 'still fine' to 'should already have been replaced'."),
      T("1) Correia dentada e tensor (se o seu motor usa correia): passar do intervalo pode destruir o motor. 2) Bomba d'água — costuma ser trocada junto com a correia, e sai muito mais barato assim.", "1) Timing belt and tensioner (if your engine uses a belt): exceeding the interval can destroy the engine. 2) Water pump — usually replaced together with the belt, and much cheaper that way."),
      T("3) Coxins do motor e câmbio (aquele tremor novo em marcha lenta). 4) Amortecedores: raramente 'quebram', vão morrendo devagar — e você só percebe depois de trocar. 5) Buchas e bieletas da suspensão, origem da maioria dos ruídos.", "3) Engine and gearbox mounts (that new idle vibration). 4) Shocks: they rarely 'break', they fade — and you only notice after replacing them. 5) Suspension bushings and links, the source of most noises."),
      T("6) Mangueiras e correia de acessórios: borracha ressecada racha sem aviso. 7) Fluido de freio e de arrefecimento — envelhecem por tempo, não por km, e quase ninguém lembra.", "6) Hoses and accessory belt: dry rubber cracks without warning. 7) Brake and coolant fluid — they age by time, not mileage, and almost everyone forgets."),
      T("Dica de bolso: faça um item por mês em vez de tudo de uma vez. Espalhado, cabe no orçamento; adiado, vira guincho.", "Budget tip: do one item per month instead of everything at once. Spread out it fits the budget; postponed it becomes a tow truck."),
    ]}),
    art({ id: "trait-appuse", thumb: "/learn/trait-appuse.png?v=4", track: "money", traits: ["appUse"], system: "geral", addedAt: "2026-08-04",
      title: T("Rodar de aplicativo: manutenção em ritmo dobrado", "Driving for apps: maintenance at double pace"), body: [
      T("Quem roda de aplicativo faz em um ano a quilometragem que um motorista comum faz em três — e quase toda em cidade, que é o uso mais severo que existe para um carro.", "App drivers cover in one year what a regular driver covers in three — and almost all of it in the city, the most severe use a car can face."),
      T("Na prática, use o intervalo 'severo' do manual, não o normal: costuma ser metade da quilometragem para óleo e filtros. É contraintuitivo, mas trocar mais vezes sai muito mais barato que um motor.", "In practice, use the manual's 'severe' interval, not the normal one: usually half the mileage for oil and filters. Counterintuitive, but changing more often is far cheaper than an engine."),
      T("Itens que somem rápido nesse uso: pastilhas de freio (para-e-anda), embreagem (se manual), amortecedores (peso extra de passageiros) e pneus. Calibrar toda semana economiza combustível e pneu ao mesmo tempo.", "Items that vanish fast: brake pads (stop-and-go), clutch (if manual), shocks (extra passenger weight) and tires. Weekly pressure checks save both fuel and tires."),
      T("Registre TODO serviço aqui no app. Além de organizar, o histórico completo aumenta o valor de revenda — e para quem roda muito, revender bem faz parte do lucro.", "Log EVERY service here. Beyond organization, a complete history raises resale value — and for high-mileage drivers, reselling well is part of the profit."),
    ]}),
    art({ id: "trait-urban", thumb: "/learn/trait-urban.png?v=4", track: "money", traits: ["urbanUse"], system: "engine", addedAt: "2026-08-04",
      title: T("Só cidade e trajeto curto? Isso desgasta mais", "Short city trips? That wears more"), body: [
      T("Parece o contrário, mas rodar pouco e só na cidade é considerado uso SEVERO pelos fabricantes. O motivo: em trajetos curtos o motor não chega à temperatura ideal de trabalho.", "It seems backwards, but low-mileage city driving is classified as SEVERE use by manufacturers. The reason: on short trips the engine never reaches its ideal temperature."),
      T("Sem aquecer direito, sobra combustível não queimado e água da condensação no óleo — o que acelera a formação de borra. Por isso o óleo pode vencer por TEMPO mesmo com poucos quilômetros rodados.", "Without warming up, unburnt fuel and condensation stay in the oil — which speeds up sludge. That's why oil can expire by TIME even with few kilometers driven."),
      T("O que fazer: respeite o prazo em meses (normalmente 12), mesmo que o km não tenha chegado. E, uma vez por semana, faça um trajeto mais longo (20–30 minutos) para o motor aquecer de verdade.", "What to do: respect the interval in months (usually 12) even if the mileage hasn't arrived. And once a week take a longer trip (20–30 minutes) so the engine truly warms up."),
      T("Outros itens que sofrem no para-e-anda: pastilhas de freio, bateria (viagens curtas não recarregam por completo) e escapamento, que acumula umidade e enferruja por dentro.", "Other items that suffer in stop-and-go: brake pads, the battery (short trips never fully recharge it) and the exhaust, which collects moisture and rusts from inside."),
    ]}),

    // ── Por situação do dono (situations) ────────────────────────────────
    art({ id: "sit-just-bought", thumb: "/learn/sit-just-bought.png?v=4", track: "money", situations: ["justBought"], system: "geral", addedAt: "2026-08-04",
      title: T("Comprou agora? Faça isso nos primeiros 30 dias", "Just bought it? Do this in the first 30 days"), body: [
      T("Carro usado vem com um histórico que você não viveu. Estes primeiros 30 dias definem se você vai herdar os problemas do dono anterior ou começar do zero com segurança.", "A used car comes with a history you didn't live. These first 30 days decide whether you inherit the previous owner's problems or start fresh."),
      T("1) Troque o óleo e o filtro, independente do que disseram. É barato e zera a dúvida. 2) Verifique fluido de freio e de arrefecimento — são os mais esquecidos e os que causam os estragos mais caros.", "1) Change oil and filter regardless of what you were told. It's cheap and removes all doubt. 2) Check brake and coolant fluid — the most forgotten and the ones causing the priciest damage."),
      T("3) Descubra quando foi a última troca da correia dentada. Se ninguém souber, considere trocada por você: é o único item em que 'apostar' pode custar um motor.", "3) Find out when the timing belt was last changed. If nobody knows, treat it as due: it's the one item where gambling can cost an engine."),
      T("4) Calibre os pneus e olhe a data de fabricação deles (4 números na lateral: semana e ano). Pneu com mais de 5 anos endurece mesmo com sulco bom. 5) Teste a bateria — a maioria dos vendedores não troca.", "4) Set tire pressure and check their manufacture date (4 digits on the sidewall: week and year). Tires over 5 years old harden even with good tread. 5) Test the battery — most sellers don't replace it."),
      T("6) Registre tudo isso aqui no app com a data de hoje. A partir de agora o histórico é seu, e daqui a três anos você vai agradecer.", "6) Log all of it here with today's date. From now on the history is yours, and in three years you'll be glad."),
    ]}),
    art({ id: "sit-overdue", thumb: "/learn/sit-overdue.png?v=4", track: "fundamentals", situations: ["overdue"], system: "engine", addedAt: "2026-08-04",
      title: T("Atrasou a revisão? O que acontece e por onde começar", "Service overdue? What happens and where to start"), body: [
      T("Primeiro, sem pânico: atraso não é sentença. Mas a ordem em que você resolve importa, porque alguns itens só ficam caros e outros deixam você na estrada.", "First, don't panic: being late isn't a death sentence. But the order matters, because some items just get expensive while others strand you."),
      T("Comece pelo que é SEGURANÇA: freios (pastilha, disco, fluido) e pneus. Não dá para negociar prazo com item que decide se o carro para ou não.", "Start with SAFETY: brakes (pads, discs, fluid) and tires. There's no negotiating deadlines with what decides whether the car stops."),
      T("Depois o que protege o motor: óleo vencido perde a capacidade de lubrificar e vira borra, que entope os canais. Óleo atrasado é o caminho mais curto e mais caro para um motor arruinado.", "Then what protects the engine: expired oil loses its lubricating ability and turns to sludge, clogging passages. Late oil is the shortest and priciest path to a ruined engine."),
      T("Por último, o que é desempenho e economia: filtros de ar e combustível, velas. Atrasar aqui custa em consumo, não em quebra — dá para escalonar por alguns meses.", "Last, performance and economy: air and fuel filters, spark plugs. Delaying here costs fuel, not failures — you can spread these over a few months."),
      T("Exceção importante: correia dentada não entra nessa fila. Se estiver vencida, é a primeira coisa — ela não avisa antes de arrebentar.", "Important exception: the timing belt isn't in this queue. If it's overdue, it comes first — it gives no warning before snapping."),
    ]}),
    art({ id: "sit-no-history", thumb: "/learn/sit-no-history.png?v=4", track: "money", situations: ["noHistory"], system: "geral", addedAt: "2026-08-04",
      title: T("Monte o histórico do seu carro (ele vale dinheiro)", "Build your car's history (it's worth money)"), body: [
      T("Histórico de manutenção não é burocracia: é a diferença entre vender seu carro pela tabela ou aceitar deságio de 10% a 15% porque o comprador não tem como confiar no que você diz.", "A maintenance history isn't bureaucracy: it's the difference between selling at book value or accepting a 10–15% discount because the buyer can't verify what you say."),
      T("Comece pelo que você lembra, mesmo aproximado. Registre a última troca de óleo, o último serviço grande e qualquer peça trocada. Data aproximada vale mais que nenhuma.", "Start with what you remember, even roughly. Log the last oil change, the last big service and any part replaced. An approximate date is worth more than none."),
      T("Depois, procure as notas: oficinas guardam registro por CPF ou placa, e concessionárias têm o histórico completo no sistema. Uma ligação costuma resolver anos de lacuna.", "Then hunt for receipts: shops keep records by tax ID or plate, and dealers have the full history in their system. One phone call often fills years of gaps."),
      T("Daqui pra frente, fotografe a nota assim que sair da oficina e registre na hora. Leva 30 segundos e evita o 'foi ano passado ou retrasado?' que sempre acontece.", "From now on, photograph the receipt as you leave the shop and log it right away. It takes 30 seconds and avoids the 'was it last year or the year before?' that always happens."),
      T("Bônus: com o histórico completo, o app passa a calcular suas revisões com precisão real, em vez de estimar pelo genérico.", "Bonus: with a complete history, the app computes your service schedule with real precision instead of generic estimates."),
    ]}),

    // ── Vídeos do canal (primeira leva) ──────────────────────────────────
    // Shorts próprios. O texto abaixo do player resume o vídeo para quem
    // prefere ler — e é o que alimenta a busca interna.
    art({ id: "vid-turbo-pressao", track: "sports", type: "video", system: "engine", traits: ["turbo"], addedAt: "2026-08-08", thumb: "/learn/vid-turbo-pressao.png",
      media: { provider: "youtube", src: "it8V3v7XEp8", vertical: true },
      title: T("Turbo: o que significa \"1 kg\" de pressão?", "Turbo: what does \"1 kg\" of boost mean?"), related: ["vid-turbo-fabrica", "vid-turbo-aspirado", "vid-avanco-ignicao"],
      body: [
      T("Quando alguém diz que um carro \"tem 1 kg de turbo\", está falando de pressão de sobrealimentação: o quanto de ar o turbo empurra para dentro do motor ALÉM da pressão atmosférica.", "When someone says a car \"runs 1 kg of boost\", they mean forced-induction pressure: how much air the turbo pushes into the engine ON TOP of atmospheric pressure."),
      T("## kg, bar e psi: a mesma coisa em três sotaques", "## kg, bar and psi: the same thing in three accents"),
      T("A unidade de oficina é o kgf/cm². Na prática, 1 kg ≈ 1 bar ≈ 14,7 psi: três formas de dizer quase o mesmo número. É por isso que manômetro importado marca psi e o brasileiro marca \"kg\".", "The shop unit is kgf/cm². In practice, 1 kg ≈ 1 bar ≈ 14.7 psi: three ways of saying nearly the same number. That's why imported gauges read psi and Brazilian ones read \"kg\"."),
      T("## O detalhe que muda tudo: pressão relativa", "## The detail that changes everything: relative pressure"),
      T("O manômetro mede acima da atmosfera. Com 1 kg de pressão, o cilindro recebe aproximadamente o DOBRO de massa de ar de um aspirado igual. E com combustível na mesma proporção, o potencial de potência também quase dobra.", "The gauge reads above atmospheric. At 1 kg of boost, the cylinder takes in roughly DOUBLE the air mass of an equivalent naturally aspirated engine. And with fuel to match, the power potential nearly doubles too."),
      T(">> Na prática: pressão é potencial, não potência. O número só vira força se a injeção, o combustível e o avanço acompanharem: é o conjunto calibrado que faz o carro andar.", ">> In practice: boost is potential, not power. The number only becomes force if fuelling, fuel quality and timing keep up: it's the calibrated package that makes the car go."),
      T("!! Pressão não é número solto: sem combustível, injeção e avanço acompanhando, mais pressão vira mistura pobre e detonação, o caminho mais curto para um motor aberto. Antes de sonhar com \"mais kg\", entenda [[vid-turbo-fabrica|por que o turbo de fábrica não vem no limite]].", "!! Boost isn't a free-floating number: without fuelling, injection and timing keeping up, more pressure becomes a lean mixture and knock, the shortest path to a torn-down engine. Before dreaming of \"more kg\", understand [[vid-turbo-fabrica|why the factory turbo doesn't come maxed out]]."),
    ]}),
    art({ id: "vid-marcha-lenta-preparado", track: "sports", type: "video", system: "engine", addedAt: "2026-08-08", thumb: "/learn/vid-marcha-lenta-preparado.png",
      media: { provider: "youtube", src: "FevmurLQFwg", vertical: true },
      title: T("Por que carro preparado tem marcha lenta \"embaralhada\"", "Why a modified car has a lumpy idle"), related: ["vid-avanco-ignicao", "vid-ressonador", "diag-noises"],
      body: [
      T("Aquele ronco irregular, que parece que o motor vai morrer e não morre, não é defeito num carro preparado: é consequência direta do comando de válvulas escolhido. Entender o porquê é a melhor introdução ao mundo da preparação.", "That uneven lope, like the engine is about to stall but never does, isn't a fault on a built car: it's a direct consequence of the camshaft chosen. Understanding why is the best introduction to the tuning world."),
      T("## O cruzamento de válvulas", "## Valve overlap"),
      T("Um comando mais \"bravo\" mantém as válvulas de admissão e escape abertas ao mesmo tempo por mais tempo: o chamado cruzamento. Em alta rotação, isso ajuda a encher melhor o cilindro: é de lá que a potência extra vem.", "A hotter cam keeps intake and exhaust valves open together for longer, the overlap. At high rpm this helps fill the cylinder better: that's where the extra power comes from."),
      T("## Por que a lenta sofre", "## Why idle suffers"),
      T("Em marcha lenta o efeito se inverte: parte dos gases queimados volta para a admissão e a mistura fica instável de ciclo para ciclo. O resultado audível é a lenta oscilando: o \"popopô\" característico.", "At idle the effect reverses: some burnt gas flows back into the intake and the mixture turns unstable cycle to cycle. The audible result is the rolling idle, the characteristic lope."),
      T(">> É um preço de projeto: quem ganha em cima, perde embaixo. O mesmo raciocínio de compromisso vale para quase tudo em preparação, como mostra [[vid-ressonador|a história do ressonador]].", ">> It's a design trade: gain up top, lose down low. The same compromise logic applies to almost everything in tuning: as [[vid-ressonador|the resonator story]] shows."),
      T("!! Num motor de rua com comando ORIGINAL, marcha lenta irregular não é normal. Aí a suspeita é vela, bico, corpo de borboleta sujo ou falsa entrada de ar, e vale diagnóstico, não admiração.", "!! On a street engine with the STOCK cam, rough idle is not normal. There the suspects are plugs, injectors, a dirty throttle body or a vacuum leak, it deserves diagnosis, not admiration."),
    ]}),
    art({ id: "vid-turbo-fabrica", track: "sports", type: "video", system: "engine", traits: ["turbo"], addedAt: "2026-08-08", thumb: "/learn/vid-turbo-fabrica.png",
      media: { provider: "youtube", src: "PaFA9VnLfUg", vertical: true },
      title: T("Por que o turbo de fábrica não \"estoura\" de pressão", "Why a factory turbo doesn't overboost"), related: ["vid-turbo-pressao", "vid-flutter", "vid-avanco-ignicao"],
      body: [
      T("Se o turbo comprime cada vez mais ar conforme o motor gira, por que a pressão não sobe indefinidamente até quebrar tudo? Porque existe um alívio proposital no sistema.", "If the turbo compresses more air the faster the engine spins, why doesn't boost climb forever until something breaks? Because there's a deliberate relief in the system."),
      T("## A válvula que segura a pressão: wastegate", "## The valve that holds boost: the wastegate"),
      T("A wastegate desvia parte dos gases de escape para fora da turbina assim que a pressão alvo é atingida. Menos gás passando pela turbina, menos rotação no eixo, pressão estabilizada: tudo isso acontecendo dezenas de vezes por segundo.", "The wastegate routes part of the exhaust gas around the turbine once target boost is reached. Less gas through the turbine, less shaft speed, boost held steady: all happening dozens of times a second."),
      T("Nos carros modernos ela é comandada eletronicamente pela central, que ajusta a pressão em tempo real conforme rotação, temperatura, altitude e qualidade do combustível. O \"1 kg\" do manômetro é uma decisão da central, não um acidente. Ver [[vid-turbo-pressao|o que significa 1 kg de pressão]].", "On modern cars it's electronically controlled by the ECU, which trims boost in real time based on rpm, temperature, altitude and fuel quality. The \"1 kg\" on the gauge is an ECU decision, not an accident. See [[vid-turbo-pressao|what 1 kg of boost means]]."),
      T("## A segunda rede de proteção", "## The second safety net"),
      T("Se a central detecta pressão acima do previsto ou sinal de detonação, ela corta a injeção: o famoso corte por sobrepressão. É a diferença entre um susto e um pistão furado.", "If the ECU sees more boost than expected or detects knock, it cuts fuelling, the classic overboost cut. It's the difference between a scare and a holed piston."),
      T("!! Mexer só na pressão, sem recalibrar injeção, avanço e sem combustível à altura, costuma terminar em motor aberto. A margem que a fábrica deixou não é preguiça de projeto: é a diferença entre durar 200 mil km e durar um verão.", "!! Raising boost alone, without recalibrating fuelling and timing and without fuel to match, usually ends with the engine apart. The margin the factory left isn't lazy engineering: it's the difference between lasting 200,000 km and lasting one summer."),
      T(">> Curiosidade que fecha o raciocínio: o barulho de \"pomba\" que alguns turbos fazem ao tirar o pé também é o sistema fora do projeto. Entenda em [[vid-flutter|o barulho de pomba no turbo]].", ">> A closing thought: the fluttering noise some turbos make on lift-off is also the system operating outside its design. See [[vid-flutter|the turbo flutter noise]]."),
    ]}),
    art({ id: "vid-nitro", track: "sports", type: "video", system: "engine", addedAt: "2026-08-08", thumb: "/learn/vid-nitro.png",
      media: { provider: "youtube", src: "21Mmi4ZGzPg", vertical: true },
      title: T("Como funciona o nitro (NOS) de verdade", "How nitrous (NOS) actually works"), related: ["vid-oxido-nitroso", "vid-turbo-nitro", "vid-turbo-pressao"],
      body: [
      T("Ao contrário do que o cinema sugere, nitro não é combustível. É óxido nitroso (N₂O): um gás cujo trabalho é levar MAIS OXIGÊNIO para dentro do motor, e oxigênio é o que permite queimar mais combustível.", "Contrary to what the movies suggest, nitrous isn't fuel. It's nitrous oxide (N₂O): a gas whose job is carrying MORE OXYGEN into the engine, and oxygen is what lets you burn more fuel."),
      T("## O truque químico", "## The chemical trick"),
      T("Dentro da câmara, acima de uns 300 °C, a molécula se quebra e libera oxigênio livre: muito mais concentrado que o do ar, que só tem 21%. Mais oxigênio disponível, mais combustível queimando, mais potência. A química completa está em [[vid-oxido-nitroso|óxido nitroso: por que ele dá potência]].", "Inside the chamber, above roughly 300 °C, the molecule breaks apart and releases free oxygen: far more concentrated than air's 21%. More oxygen available, more fuel burning, more power. The full chemistry is in [[vid-oxido-nitroso|nitrous oxide: why it makes power]]."),
      T("## O bônus térmico", "## The thermal bonus"),
      T("O N₂O é injetado em expansão e resfria bastante a mistura admitida. Ar mais frio é mais denso, e mistura mais fria também resiste melhor à detonação. O efeito se soma ao do oxigênio.", "N₂O expands as it's injected and strongly cools the incoming charge. Colder air is denser, and a cooler mixture also resists knock better. The effect stacks with the oxygen."),
      T("!! O risco mora na dosagem: nitro entrando sem combustível aumentando na MESMA proporção deixa a mistura pobre e a temperatura dispara. É assim que se derrete pistão em segundos. Nitro não perdoa erro de proporção: nunca é um \"apertar o botão\" improvisado.", "!! The risk lives in the ratio: nitrous flowing in without fuel increasing in the SAME proportion leans the mixture and temperature spikes. That's how pistons melt in seconds. Nitrous doesn't forgive dosage mistakes: it's never an improvised button press."),
      T(">> Para escolher entre os dois caminhos de \"mais ar\", compare com o turbo em [[vid-turbo-nitro|turbo ou nitro: dois jeitos de meter mais ar]].", ">> To choose between the two \"more air\" paths, compare with the turbo in [[vid-turbo-nitro|turbo or nitrous: two ways to force more air]]."),
    ]}),
    art({ id: "vid-cortar-molas", track: "diy", type: "video", system: "suspension", addedAt: "2026-08-08", thumb: "/learn/vid-cortar-molas.png",
      media: { provider: "youtube", src: "MItRkRFIazQ", vertical: true },
      title: T("Não rebaixe seu carro cortando as molas", "Never lower your car by cutting the springs"), related: ["vid-roda-grande-1000", "vid-ressonador", "tire-care"],
      body: [
      T("Cortar mola é o jeito barato de rebaixar, e o jeito mais rápido de estragar a suspensão inteira. O que acontece por dentro explica por que essa economia sai cara.", "Cutting springs is the cheap way to lower a car, and the fastest way to ruin the whole suspension. What happens inside explains why the saving costs dear."),
      T("## A mola vira outra peça", "## The spring becomes a different part"),
      T("A mola original é calculada para uma constante específica. Cortada, fica mais curta e mais DURA, de forma imprevisível. Muitas são progressivas, as espiras têm passos diferentes, e o corte leva embora justamente a parte macia, destruindo o projeto.", "The original spring is designed to a specific rate. Cut, it gets shorter and STIFFER, unpredictably. Many are progressive, coils wound at different pitches, and the cut removes precisely the soft section, destroying the design."),
      T("!! A ponta cortada não assenta direito na sede: a mola trabalha torta, faz barulho e pode até SOLTAR do prato numa lombada com a roda no ar. Isso não é desconforto: é risco.", "!! The cut end doesn't seat properly: the spring sits crooked, makes noise and can even JUMP off its perch over a bump with the wheel unloaded. That's not discomfort: that's risk."),
      T("## A conta chega para o conjunto", "## The whole assembly pays"),
      T("O amortecedor passa a trabalhar fora do curso projetado, batendo no fim de curso, e morre cedo. A geometria alterada come pneu e piora a frenagem. No fim, o \"rebaixamento grátis\" custa amortecedores, pneus e segurança.", "The damper starts operating outside its designed travel, slamming its bump stops, and dies early. The altered geometry chews tires and worsens braking. In the end, the \"free drop\" costs dampers, tires and safety."),
      T(">> O caminho certo: kit de molas esportivas projetado para o seu carro, constante certa, altura certa e, de preferência, amortecedores compatíveis. E alteração de altura precisa estar regularizada para passar na vistoria. Mesma família de decisão de [[vid-roda-grande-1000|roda grande num 1.0]].", ">> The right path: a sport spring kit engineered for your car, correct rate, correct height and, ideally, matching dampers. And ride-height changes must be certified to pass inspection. Same decision family as [[vid-roda-grande-1000|big wheels on a 1.0]]."),
    ]}),
    art({ id: "vid-manual-suave", track: "fundamentals", type: "video", system: "engine", traits: ["manualGearbox"], addedAt: "2026-08-08", thumb: "/learn/vid-manual-suave.png",
      media: { provider: "youtube", src: "6Wsp-O5eTuE", vertical: true },
      title: T("Como dirigir um carro manual de forma suave", "How to drive a manual smoothly"), related: ["vid-manual-habitos", "basics", "fund-systems"],
      body: [
      T("Trancos em carro manual quase nunca são do carro: são de sincronismo entre o pé da embreagem e o acelerador. A boa notícia é que isso se aprende rápido: são três situações, cada uma com o seu truque.", "Jerky driving in a manual is almost never the car's fault: it's timing between the clutch foot and the throttle. The good news is it's quickly learned: three situations, each with its trick."),
      T("## Na saída: o ponto de atrito", "## Pulling away: the bite point"),
      T("Solte a embreagem até o carro começar a se mover sozinho, segure ali por um instante e só então acelere e termine de soltar. A pressa nessa fase é o que causa o solavanco.", "Release the clutch until the car starts creeping on its own, hold there for a beat, and only then feed throttle and finish releasing. Rushing this phase is what causes the lurch."),
      T("## Na troca: alivie antes", "## Shifting up: lift first"),
      T("Alivie o acelerador ANTES de pisar na embreagem, e volte a acelerar progressivamente enquanto solta. Motor e caixa chegam à mesma rotação e a troca fica imperceptível.", "Ease off the throttle BEFORE pressing the clutch, then feed it back in progressively as you release. Engine and gearbox meet at the same rpm and the shift disappears."),
      T("## Na redução: o toque de acelerador", "## Downshifting: the throttle blip"),
      T("Reduções pedem o contrário: um toque no acelerador com a embreagem embaixo iguala as rotações e evita o freio-motor brusco que joga todo mundo para a frente.", "Downshifts ask the opposite: a throttle blip with the clutch down matches the revs and avoids the abrupt engine braking that throws everyone forward."),
      T(">> Suavidade não é só conforto: é desgaste: cada tranco é a embreagem absorvendo diferença de rotação. Os dois hábitos que mais matam embreagem estão em [[vid-manual-habitos|2 hábitos para evitar num carro manual]].", ">> Smoothness isn't just comfort: it's wear: every lurch is the clutch absorbing an rpm mismatch. The two habits that kill clutches fastest are in [[vid-manual-habitos|2 habits to avoid in a manual car]]."),
    ]}),
    art({ id: "vid-manual-habitos", track: "fundamentals", type: "video", system: "engine", traits: ["manualGearbox"], addedAt: "2026-08-08", thumb: "/learn/vid-manual-habitos.png",
      media: { provider: "youtube", src: "puVd8XimuV4", vertical: true },
      title: T("2 hábitos para evitar ao dirigir um carro manual", "2 habits to avoid when driving a manual"), related: ["vid-manual-suave", "basics", "money-fuel"],
      body: [
      T("São dois costumes tão comuns que quase ninguém percebe que os tem, e os dois cobram caro na hora de trocar a embreagem.", "Two habits so common almost nobody notices having them, and both charge dearly when the clutch bill arrives."),
      T("## 1. Descansar o pé na embreagem", "## 1. Resting your foot on the clutch"),
      T("Mesmo sem afundar o pedal, o peso da perna já encosta o rolamento no platô. Ele passa a girar o tempo todo sob carga, morre antes da hora, e o disco começa a patinar junto.", "Even without pressing, the leg's weight seats the release bearing against the pressure plate. It spins under load full-time, dies early, and the disc starts slipping along with it."),
      T("## 2. Segurar subida na embreagem", "## 2. Holding hills on the clutch"),
      T("Manter o carro parado na rampa pelo ponto de atrito é o disco patinando DE PROPÓSITO, gerando calor puro. É o jeito mais rápido que existe de queimar uma embreagem.", "Holding the car still on a slope at the bite point is the disc slipping ON PURPOSE, generating pure heat. It's the fastest known way to burn a clutch."),
      T(">> As correções: pé esquerdo no descanso sempre que não estiver trocando; em rampa, freio de mão ou pé no freio até a hora de sair. Só isso pode dobrar a vida da embreagem. E parado no semáforo, prefira ponto morto com o pé no freio: marcha engatada com embreagem pisada mantém o rolamento sob carga à toa.", ">> The fixes: left foot on the dead pedal whenever you're not shifting; on slopes, handbrake or brake pedal until it's time to go. That alone can double a clutch's life. And at red lights, prefer neutral with your foot on the brake: in gear with the clutch down keeps the bearing loaded for nothing."),
      T("A técnica fina de saída, troca e redução está em [[vid-manual-suave|como dirigir um manual de forma suave]].", "The finer technique of pulling away, shifting and downshifting is in [[vid-manual-suave|driving a manual smoothly]]."),
    ]}),
    art({ id: "vid-pneu-indices", track: "fundamentals", type: "video", system: "tires", addedAt: "2026-08-08", thumb: "/learn/vid-pneu-indices.png",
      media: { provider: "youtube", src: "pEELOa-PWBE", vertical: true },
      title: T("Pneu: o que são os índices de carga e velocidade", "Tires: what the load and speed ratings mean"), related: ["vid-pneu-medidas", "tire-care", "vid-roda-grande-1000"],
      body: [
      T("Depois da medida, o pneu traz dois códigos que quase ninguém olha na compra, e são justamente os que dizem se aquele pneu PODE rodar no seu carro.", "Beyond the size, the tire carries two codes almost nobody checks when buying, and they're precisely the ones that say whether that tire CAN run on your car."),
      T("## 91: o índice de carga", "## 91: the load rating"),
      T("É o peso máximo que o pneu aguenta, consultado em tabela. O 91 equivale a 615 kg por pneu: quatro pneus, mais de 2,4 toneladas de capacidade.", "It's the maximum weight the tire can carry, from a lookup table. 91 equals 615 kg per tire: four tires, over 2.4 tonnes of capacity."),
      T("## V: o índice de velocidade", "## V: the speed rating"),
      T("A letra é a velocidade máxima que o pneu suporta de forma contínua com segurança: T é 190 km/h, H é 210, V é 240, W é 270. Não é sugestão: acima disso a estrutura aquece além do previsto.", "The letter is the top speed the tire safely sustains continuously: T is 190 km/h, H is 210, V is 240, W is 270. It's not a suggestion: beyond it the carcass heats past its design."),
      T("!! A regra: nunca monte pneu com índice ABAIXO do que a montadora especifica, está na etiqueta da coluna da porta ou no manual. Índice maior pode; menor compromete a segurança e ainda pode invalidar o seguro num acidente.", "!! The rule: never fit a tire rated BELOW what the carmaker specifies, it's on the door-jamb label or in the manual. Higher is fine; lower compromises safety and can even void insurance in a crash."),
      T(">> Como ler a medida que vem antes desses códigos está em [[vid-pneu-medidas|como ler a medida do pneu]]; calibragem, rodízio e desgaste, em [[tire-care|cuidando dos pneus]].", ">> How to read the size that precedes these codes is in [[vid-pneu-medidas|how to read a tire size]]; pressure, rotation and wear, in [[tire-care|caring for your tires]]."),
    ]}),
    art({ id: "vid-pneu-medidas", track: "fundamentals", type: "video", system: "tires", addedAt: "2026-08-08", thumb: "/learn/vid-pneu-medidas.png",
      media: { provider: "youtube", src: "30LdSYoE_-0", vertical: true },
      title: T("Como ler a medida do pneu (225/45 R17)", "How to read tire size (225/45 R17)"), related: ["vid-pneu-indices", "vid-roda-grande-1000", "tire-care"],
      body: [
      T("Aquela sequência na lateral do pneu, 225/45 R17, não é código secreto: cada número é uma dimensão, e entender a leitura evita comprar errado.", "That sequence on the tire's sidewall, 225/45 R17, isn't a secret code: each number is a dimension, and reading it right keeps you from buying wrong."),
      T("## 225: a largura", "## 225: the width"),
      T("É a largura da banda de rodagem em milímetros, de um flanco ao outro.", "It's the tread width in millimeters, sidewall to sidewall."),
      T("## 45: o perfil, a parte que confunde", "## 45: the profile, the confusing part"),
      T("Não é milímetro: é PORCENTAGEM da largura. A altura do flanco é 45% de 225: cerca de 101 mm. Por isso o mesmo perfil 45 dá alturas diferentes em pneus de larguras diferentes.", "It isn't millimeters: it's a PERCENTAGE of the width. Sidewall height is 45% of 225: about 101 mm. That's why the same 45 profile yields different heights on different widths."),
      T("## R17: construção e aro", "## R17: construction and rim"),
      T("O R indica construção radial, padrão em praticamente todo pneu de passeio. O 17 é o diâmetro do ARO, a única medida em polegadas da sequência.", "The R means radial construction, standard on virtually every passenger tire. The 17 is the RIM diameter, the only inch measurement in the sequence."),
      T(">> Detalhe que salva dinheiro: mudar a medida altera o diâmetro total e desregula velocímetro e hodômetro. Se for mudar, mantenha o diâmetro externo próximo do original: os efeitos de errar essa conta estão em [[vid-roda-grande-1000|roda grande num 1.0]]. E medida certa não basta: confira também [[vid-pneu-indices|os índices de carga e velocidade]].", ">> A money-saving detail: changing the size alters the overall diameter and skews the speedometer and odometer. If you change, keep the outer diameter close to stock, the cost of getting this wrong is in [[vid-roda-grande-1000|big wheels on a 1.0]]. And the right size isn't enough: check [[vid-pneu-indices|the load and speed ratings]] too."),
    ]}),
    art({ id: "vid-gasolina-e30", track: "money", type: "video", system: "engine", addedAt: "2026-08-08", thumb: "/learn/vid-gasolina-e30.png",
      media: { provider: "youtube", src: "GfO31Icr5bg", vertical: true },
      title: T("A gasolina com 30% de etanol: o que muda para você", "Gasoline with 30% ethanol: what changes for you"), related: ["vid-e32", "vid-etanol-gasolina", "fuel-compare"],
      body: [
      T("A gasolina comum vendida no Brasil não é gasolina pura: ela já vem com etanol anidro misturado por lei. Essa fatia subiu para 30%, e isso mexe com o consumo e com a régua de comparação no posto.", "Regular gasoline sold in Brazil isn't pure gasoline: it comes blended with anhydrous ethanol by law. That share rose to 30%, and it moves both fuel economy and the comparison rule at the pump."),
      T("## O efeito no tanque", "## The effect at the tank"),
      T("Etanol tem menos energia por litro que gasolina. Quanto maior a fatia na mistura, um pouco menos o litro rende: diferença pequena, na casa de 1%, mas que existe e aparece na comparação de tanques cheios.", "Ethanol holds less energy per liter than gasoline. The bigger its share in the blend, the slightly less each liter delivers, a small difference, around 1%, but real and visible when comparing full tanks."),
      T("## Quem precisa se preocupar", "## Who needs to worry"),
      T("Carro flex lida com isso sem drama: a central lê o sensor e ajusta a injeção sozinha. A atenção vale para os não-flex antigos, anteriores a 2003: nesses, confirme no manual qual mistura o motor aceita.", "A flex-fuel car handles it without drama: the ECU reads the sensor and trims injection on its own. The attention goes to old non-flex cars, pre-2003, for those, confirm in the manual which blend the engine accepts."),
      T(">> Na prática, o que muda para o bolso é a régua: a regra dos 70% entre etanol e gasolina se desloca quando a mistura muda. Não decida de cabeça, a calculadora [[fuel-compare|Etanol ou Gasolina]] compara com o consumo REAL do seu carro, que é o único número que importa. A conta por trás está em [[vid-etanol-gasolina|a conta que decide]].", ">> In practice, what changes for your wallet is the ruler: the 70% rule between ethanol and gasoline shifts when the blend changes. Don't decide from memory, the [[fuel-compare|Ethanol or Gasoline]] calculator compares against your car's REAL consumption, the only number that matters. The math behind it is in [[vid-etanol-gasolina|the deciding math]]."),
    ]}),
    art({ id: "vid-harley-som", track: "culture", type: "video", system: "engine", addedAt: "2026-08-10", thumb: "/learn/vid-harley-som.png",
      media: { provider: "youtube", src: "sz1L3xrGUtE", vertical: true },
      title: T("Por que a Harley tem aquele ronco inconfundível", "Why a Harley has that unmistakable rumble"), related: ["vid-balanceamento-motor", "vid-tres-cilindros", "cult-history"],
      body: [
      T("Aquele som irregular, meio engasgado, não é ajuste nem escapamento: é geometria de motor. A Harley usa um V-twin de 45 graus, e é esse ângulo que assina o ruído.", "That uneven, stuttering sound isn't tuning or exhaust: it's engine geometry. Harley uses a 45-degree V-twin, and that angle signs the noise."),
      T("## Dois pistões, um pino", "## Two pistons, one crankpin"),
      T("Os dois pistões dividem o MESMO pino de virabrequim. Num V de 45 graus com pino compartilhado, as explosões não ficam igualmente espaçadas: uma vem, a outra logo atrás, e depois um intervalo maior.", "Both pistons share the SAME crankpin. In a 45-degree V with a shared pin, the firing events aren't evenly spaced: one comes, the next follows close behind, then a longer gap."),
      T("## O que o ouvido reconhece", "## What the ear recognizes"),
      T("Espaçamento desigual é o que dá o pulso: motor com explosões regulares soa contínuo; com intervalo irregular, soa pulsado, o famoso \"potato-potato\".", "The uneven spacing is what gives the pulse: an engine with regular firing sounds continuous; with irregular gaps, it throbs, the famous \"potato-potato\"."),
      T(">> O mesmo princípio explica por que um V8 americano soa diferente de um V8 de Fórmula 1: não é o número de cilindros que define o som, é a ORDEM e o espaçamento das explosões. O outro lado dessa história, vibração, está em [[vid-balanceamento-motor|balanceamento de motor]].", ">> The same principle explains why an American V8 sounds nothing like a Formula 1 V8: it isn't the cylinder count that defines the sound, it's the firing ORDER and spacing. The other side of this story, vibration, is in [[vid-balanceamento-motor|engine balance]]."),
    ]}),
    art({ id: "vid-luz-injecao-acendeu", track: "fundamentals", type: "video", system: "electrical", addedAt: "2026-08-10", thumb: "/learn/vid-luz-injecao-acendeu.png",
      media: { provider: "youtube", src: "0DPAPZNXE9s", vertical: true },
      title: T("A luz de injeção acendeu: o que fazer agora", "The check-engine light came on: what to do now"), related: ["vid-luz-injecao-dica", "obd2-scan", "read-obd2"],
      body: [
      T("Primeiro, respire: luz de injeção acesa não significa parar no acostamento. Ela avisa que a central detectou algo fora do esperado: pode ser grave, pode ser uma tampa de tanque mal fechada.", "First, breathe: a lit check-engine light doesn't mean pulling onto the shoulder. It says the ECU spotted something off, it may be serious, it may be a loose fuel cap."),
      T("## Fixa ou piscando? Isso muda tudo", "## Steady or flashing? That changes everything"),
      T(">> Luz acesa FIXA: siga com moderação e procure diagnóstico nos próximos dias.", ">> Light on STEADY: drive gently and get a diagnosis in the next few days."),
      T("!! Luz PISCANDO: reduza já e pare com segurança. Piscando costuma indicar falha de combustão: combustível não queimado descendo pelo escape destrói o catalisador em minutos, e catalisador é peça cara.", "!! Light FLASHING: slow down now and stop safely. Flashing usually means a misfire: unburned fuel going down the exhaust destroys the catalytic converter in minutes, and that's an expensive part."),
      T("## Observe o carro junto com a luz", "## Read the car along with the light"),
      T("Perdeu força, engasga, consumo subiu, cheiro estranho? Esses sinais somados à luz aumentam a urgência. Sem nenhum deles, é quase sempre sensor ou emissões, ainda merece leitura, sem pânico. Antes de qualquer oficina, faça [[vid-luz-injecao-dica|a checagem de 30 segundos da tampa do tanque]].", "Losing power, stumbling, higher consumption, odd smell? Those signs plus the light raise the urgency. With none of them, it's almost always a sensor or emissions: still worth reading, without panic. Before any shop, run [[vid-luz-injecao-dica|the 30-second fuel-cap check]]."),
      T(">> O caminho barato: LER O CÓDIGO antes de autorizar serviço. Um leitor OBD2 diz qual sistema reclamou, e você entra na oficina sabendo do que se trata: o passo a passo está em [[obd2-scan|como usar seu scanner OBD2]] e a consulta de códigos em [[read-obd2|luz de injeção ligada? Descubra o que é]].", ">> The cheap path: READ THE CODE before authorizing work. An OBD2 reader names the system that complained, and you walk into the shop knowing the subject, the walkthrough is in [[obd2-scan|how to use your OBD2 scanner]] and the code lookup in [[read-obd2|check-engine light on? Find out what it is]]."),
    ]}),
    art({ id: "vid-ar-cardan", track: "culture", type: "video", system: "engine", addedAt: "2026-08-10", thumb: "/learn/vid-ar-cardan.png",
      media: { provider: "youtube", src: "q7chR7gDo8Y", vertical: true },
      title: T("O ar-condicionado funcionaria ligado no eixo cardã?", "Could the A/C run off the driveshaft?"), related: ["fund-systems", "cult-hybrid", "cult-ev"],
      body: [
      T("A pergunta parece boba, mas ensina algo real sobre como o carro distribui trabalho: por que o compressor do ar-condicionado é acionado pela correia do motor, e não pela transmissão?", "The question sounds silly, but it teaches something real about how a car distributes work: why is the A/C compressor driven by the engine belt, not the transmission?"),
      T("## O experimento mental", "## The thought experiment"),
      T("Ligado ao eixo cardã, o compressor giraria conforme a VELOCIDADE DO CARRO, não conforme o motor. Parou no semáforo, o eixo para, e o ar gelado para junto.", "Hooked to the driveshaft, the compressor would spin with ROAD SPEED, not engine speed. Stop at a light, the shaft stops, and the cold air stops with it."),
      T("## A regra que isso revela", "## The rule it reveals"),
      T("Tudo que precisa funcionar com o carro PARADO, ar-condicionado, alternador, direção hidráulica, bomba d'água, é acionado pela correia do motor, nunca pela transmissão. Onde cada sistema mora está em [[fund-systems|os 6 sistemas do carro]].", "Everything that must work with the car STOPPED, A/C, alternator, hydraulic steering, water pump, is driven by the engine belt, never the transmission. Where each system lives is in [[fund-systems|the 6 systems of a car]]."),
      T(">> A exceção moderna: elétricos e híbridos usam compressor com motor próprio, alimentado pela bateria. É por isso que um híbrido mantém o ar gelado com o motor a combustão desligado. Mais sobre eles em [[cult-hybrid|híbridos: dois mundos]].", ">> The modern exception: EVs and hybrids use a compressor with its own electric motor, fed by the battery. That's why a hybrid keeps the air cold with the combustion engine off. More on them in [[cult-hybrid|hybrids: two worlds]]."),
    ]}),
    art({ id: "vid-chevette-cg150", track: "culture", type: "video", system: "engine", addedAt: "2026-08-10", thumb: "/learn/vid-chevette-cg150.png",
      media: { provider: "youtube", src: "jDGKfvVzT2A", vertical: true },
      title: T("Chevette com motor de CG 150: por que não anda", "A Chevette with a CG 150 engine: why it won't move"), related: ["vid-cilindrada", "vid-turbo-aspirado", "cult-history"],
      body: [
      T("A brincadeira de colocar motor de moto 150 num carro de mais de 800 kg serve para ensinar UMA coisa, e ela vale na hora de escolher carro de verdade: potência sem TORQUE não move massa.", "The gag of dropping a 150cc bike engine into an 800+ kg car teaches ONE thing, and it matters when choosing a real car: power without TORQUE doesn't move mass."),
      T("## Os números da desproporção", "## The mismatch in numbers"),
      T("O motor da CG entrega ~14 cv, mas o número que importa é o torque: perto de 1,3 kgfm. Um Chevette original faz mais de 8 kgfm: seis vezes mais força para vencer a mesma inércia.", "The CG engine makes ~14 hp, but the number that matters is torque: about 1.3 kgfm. A stock Chevette makes over 8 kgfm: six times the force against the same inertia."),
      T("## \"Mas com marcha curta ele anda\"", "## \"But with short gearing it moves\""),
      T("Anda: caixa de câmbio multiplica torque. Só que cada redução multiplica também o TEMPO: o carro sai do lugar em velocidade de caminhada. Física não negocia.", "It does: gearboxes multiply torque. But every reduction also multiplies TIME, the car pulls away at walking pace. Physics doesn't negotiate."),
      T(">> A lição para a vida real: motor pequeno demais para o peso não é só \"mais lento\", é um motor obrigado a viver em rotação alta, consumindo mais e desgastando antes. O que a cilindrada diz (e o que não diz) está em [[vid-cilindrada|o que significa 1.0, 1.6 ou 2.0]].", ">> The real-life lesson: an engine too small for the weight isn't just \"slower\", it's an engine forced to live at high rpm, drinking more and wearing out sooner. What displacement tells you (and what it doesn't) is in [[vid-cilindrada|what 1.0, 1.6 or 2.0 means]]."),
    ]}),
    art({ id: "vid-roda-grande-1000", track: "diy", type: "video", system: "tires", addedAt: "2026-08-10", thumb: "/learn/vid-roda-grande-1000.png",
      media: { provider: "youtube", src: "TM9r6kvgkrM", vertical: true },
      title: T("Roda grande num 1.0: o que você perde", "Big wheels on a 1.0: what you give up"), related: ["vid-pneu-medidas", "vid-cortar-molas", "tire-care"],
      body: [
      T("Roda maior fica bonita, e piora quase tudo o que você sente ao dirigir. Não é implicância: são três efeitos físicos que chegam juntos, e num 1.0 todos aparecem amplificados.", "Bigger wheels look great, and worsen almost everything you feel while driving. It's not gatekeeping: three physical effects arrive together, and on a 1.0 every one of them is amplified."),
      T("## 1. Peso onde ele custa mais caro", "## 1. Weight where it costs the most"),
      T("Roda de aro maior costuma pesar mais, e esse peso é não suspenso E girante: o motor precisa acelerar essa massa a cada arrancada. Num 1.0, que já tem pouco torque, a perda se sente no ato. Ver [[vid-cilindrada|o que significa um carro ser 1.0]].", "A bigger wheel is usually heavier, and that weight is unsprung AND rotating: the engine must spin that mass up at every launch. On a 1.0, already short on torque, the loss is felt immediately. See [[vid-cilindrada|what 1.0 actually means]]."),
      T("## 2. Menos borracha, mais pancada", "## 2. Less rubber, more impact"),
      T("Para caber no aro maior, o perfil do pneu diminui. Menos borracha entre a roda e o asfalto é menos amortecimento: buraco chega inteiro na suspensão e no seu corpo, e o risco de empenar a roda sobe junto.", "To fit the bigger rim, the tire's sidewall shrinks. Less rubber between wheel and road means less cushioning: potholes arrive whole at the suspension and your spine, and the odds of bending a rim climb too."),
      T("## 3. O velocímetro passa a mentir", "## 3. The speedometer starts lying"),
      T("Se o diâmetro total do conjunto muda, a leitura de velocidade e o comportamento do carro mudam juntos.", "If the assembly's overall diameter changes, the speed reading and the car's behavior change with it."),
      T(">> Se for fazer mesmo assim: procure a combinação aro+pneu que mantém o diâmetro externo PRÓXIMO DO ORIGINAL, preserva velocímetro, marcha e comportamento. Como ler as medidas do pneu para fazer essa conta está em [[vid-pneu-medidas|como ler a medida do pneu]].", ">> If you're doing it anyway: pick the wheel+tire combo that keeps the overall diameter CLOSE TO STOCK, it preserves the speedo, gearing and behavior. How to read tire sizes to run that math is in [[vid-pneu-medidas|how to read a tire size]]."),
    ]}),
    art({ id: "vid-cilindrada", track: "fundamentals", type: "video", system: "engine", addedAt: "2026-08-10", thumb: "/learn/vid-cilindrada.png",
      media: { provider: "youtube", src: "KTTRj-YhqiM", vertical: true },
      title: T("O que significa um carro ser 1.0, 1.6 ou 2.0", "What it means for a car to be 1.0, 1.6 or 2.0"), related: ["vid-turbo-aspirado", "vid-tres-cilindros", "vid-tsi"],
      body: [
      T("1.0, 1.6, 2.0. O número que abre qualquer conversa de carro é a CILINDRADA: o volume total que os pistões deslocam, somando todos os cilindros, medido em litros. Um 1.0 desloca aproximadamente um litro de ar por ciclo completo.", "1.0, 1.6, 2.0, the number that opens any car conversation is DISPLACEMENT: the total volume the pistons sweep, adding all cylinders, measured in liters. A 1.0 displaces roughly one liter of air per full cycle."),
      T("## Por que volume virou sinônimo de força", "## Why volume became a synonym for power"),
      T("Mais volume é mais ar por ciclo, e mais ar permite queimar mais combustível: daí a associação direta com potência. Historicamente, motor maior era motor mais forte, e o número na tampa dizia quase tudo.", "More volume means more air per cycle, and more air lets you burn more fuel: hence the direct link to power. Historically, a bigger engine was a stronger engine, and the badge told most of the story."),
      T("## O turbo quebrou a regra", "## The turbo broke the rule"),
      T("O turbo empurra ar COMPRIMIDO para dentro, então um 1.0 turbo pode receber mais ar que um 1.6 aspirado. É assim que existe 1.0 com mais de 120 cv: impensável há vinte anos. O mecanismo completo está em [[vid-turbo-aspirado|turbo ou aspirado: o que muda]].", "The turbo pushes COMPRESSED air in, so a 1.0 turbo can take in more air than a 1.6 naturally aspirated. That's how a 1.0 makes over 120 hp: unthinkable twenty years ago. The full mechanism is in [[vid-turbo-aspirado|turbo or naturally aspirated: what changes]]."),
      T(">> No Brasil o número também mexe no bolso por outro caminho: IPVA e categoria de seguro costumam seguir a cilindrada, não a potência real. Dois carros de força parecida podem ter custo anual bem diferente: vale conferir antes de comprar, junto com o [[money-used|checklist do usado]].", ">> In Brazil the number also hits your wallet another way: road tax and insurance bands usually follow displacement, not real power. Two cars of similar punch can carry very different yearly costs: worth checking before buying, along with the [[money-used|used-car checklist]]."),
    ]}),
    art({ id: "vid-avanco-ignicao", track: "sports", type: "video", system: "engine", addedAt: "2026-08-10", thumb: "/learn/vid-avanco-ignicao.png",
      media: { provider: "youtube", src: "9dnCVHCqFmc", vertical: true },
      title: T("Avanço de ignição: por que a vela dispara antes da hora", "Ignition timing: why the spark fires early"), related: ["vid-turbo-fabrica", "vid-etanol-gasolina", "vid-marcha-lenta-preparado"],
      body: [
      T("A vela não solta faísca quando o pistão chega ao topo. Ela solta ANTES, e esse adiantamento tem nome: avanço de ignição. É um dos conceitos mais importantes de calibração de motor.", "The spark plug doesn't fire when the piston reaches the top. It fires BEFORE, and that lead has a name: ignition advance. It's one of the most important concepts in engine calibration."),
      T("## Por que a faísca vem antes", "## Why the spark comes early"),
      T("A queima não é instantânea: a chama leva alguns milésimos de segundo para percorrer a câmara. Se a faísca esperasse o pistão chegar lá em cima, a pressão máxima aconteceria tarde demais, com o pistão já descendo: força desperdiçada.", "Combustion isn't instantaneous: the flame takes a few milliseconds to cross the chamber. If the spark waited for the piston to arrive at the top, peak pressure would come too late, with the piston already going down: wasted force."),
      T("## O avanço acompanha a rotação", "## Advance follows rpm"),
      T("Quanto mais rápido o motor gira, menos tempo o pistão dá para a chama, então o avanço precisa aumentar com a rotação. A central recalcula isso continuamente, dezenas de vezes por segundo, cruzando rotação, carga, temperatura e combustível.", "The faster the engine spins, the less time the piston gives the flame, so advance must increase with rpm. The ECU recalculates it continuously, dozens of times a second, crossing rpm, load, temperature and fuel."),
      T("!! Avanço demais é perigoso: a pressão sobe cedo demais e o motor detona, a \"batida de pino\" que quebra pistão. Por isso a central recua o avanço sozinha quando o sensor de detonação escuta o problema ou quando o combustível é de octanagem baixa.", "!! Too much advance is dangerous: pressure rises too early and the engine knocks, the pinging that breaks pistons. That's why the ECU pulls timing on its own when the knock sensor hears trouble or the fuel's octane is low."),
      T(">> Na prática: essa é a razão de motor turbo \"acordar\" com gasolina aditivada de alta octanagem, a central pode usar mais avanço com segurança. E é também metade da explicação de [[vid-turbo-fabrica|por que o turbo de fábrica não vem no limite]].", ">> In practice: this is why turbo engines \"wake up\" on high-octane fuel, the ECU can safely run more advance. It's also half the explanation of [[vid-turbo-fabrica|why the factory turbo doesn't come maxed out]]."),
    ]}),
    art({ id: "vid-sedan", track: "culture", type: "video", addedAt: "2026-08-10", thumb: "/learn/vid-sedan.png",
      media: { provider: "youtube", src: "0z3VOWxlAEA", vertical: true },
      title: T("Por que o porta-malas separado ainda faz sentido", "Why a separate trunk still makes sense"), related: ["vid-comprar-usado", "money-used", "fund-systems"],
      body: [
      T("Sedã não é só \"hatch com porta-malas\". A parede entre cabine e bagageiro muda três coisas concretas, e nenhuma delas aparece na ficha técnica.", "A sedan isn't just \"a hatch with a trunk\". The wall between cabin and cargo changes three concrete things: none of which shows on the spec sheet."),
      T("## 1. Ruído", "## 1. Noise"),
      T("No hatch, o vão de carga divide o mesmo volume de ar da cabine: o som dos pneus e da suspensão traseira entra direto. No sedã há uma parede no meio, e ele roda mais silencioso.", "In a hatch, the cargo bay shares the cabin's air volume: tire and rear-suspension noise comes straight in. The sedan has a wall in between, and it runs quieter."),
      T("## 2. Rigidez", "## 2. Stiffness"),
      T("A mesma parede funciona como reforço estrutural atrás dos bancos. Comparando o mesmo modelo nas duas carrocerias, a versão sedã costuma ser mais firme.", "That same wall doubles as a structural brace behind the seats. Comparing the same model in both bodies, the sedan version is usually stiffer."),
      T("## 3. Flexibilidade: o preço", "## 3. Flexibility, the price"),
      T("Hatch engole objeto alto; sedã, não. A escolha honesta é sobre USO: quem carrega volume ganha com o hatch; quem roda estrada e valoriza silêncio ganha com o sedã.", "A hatch swallows tall objects; a sedan doesn't. The honest choice is about USE: haul bulky stuff, the hatch wins; live on the highway and value quiet, the sedan wins."),
      T(">> Escolhendo um usado de qualquer carroceria? A ordem de inspeção que economiza dinheiro está em [[vid-comprar-usado|comprar usado: o que olhar antes do preço]].", ">> Choosing a used car in either body? The money-saving inspection order is in [[vid-comprar-usado|buying used: what to inspect before the price]]."),
    ]}),
    art({ id: "vid-balanceamento-motor", track: "sports", type: "video", system: "engine", addedAt: "2026-08-10", thumb: "/learn/vid-balanceamento-motor.png",
      media: { provider: "youtube", src: "7SBlL3xgQV0", vertical: true },
      title: T("Balanceamento de motor: por que uns tremem e outros não", "Engine balance: why some shake and others don't"), related: ["vid-tres-cilindros", "vid-cilindrada", "vid-marcha-lenta-preparado"],
      body: [
      T("Todo motor tem massas subindo e descendo milhares de vezes por minuto. Quando essas massas não se cancelam, sobra vibração, e vibração vira barulho, desgaste e coxim quebrado. O \"refinamento\" que você sente é, antes de tudo, geometria.", "Every engine has masses going up and down thousands of times a minute. When those masses don't cancel out, vibration remains, and vibration becomes noise, wear and broken mounts. The \"refinement\" you feel is, first of all, geometry."),
      T("## O caso célebre: seis em linha", "## The celebrated case: the inline six"),
      T("No seis em linha, a ordem de subida e descida dos pistões se anula naturalmente nas duas ordens de vibração. É por isso que o 6 em linha tem fama de suavidade, sem precisar de nenhum artifício mecânico.", "In an inline six, the pistons' rise-and-fall pattern cancels naturally in both orders of vibration. That's why the inline six is famous for smoothness, with no mechanical trickery needed."),
      T("## E os motores comuns?", "## And everyday engines?"),
      T("Motores de 3 e 4 cilindros não têm essa sorte: sobram forças que o virabrequim sozinho não equilibra. A solução é mecânica: eixos balanceadores girando em sentido contrário, criando uma vibração oposta que cancela a original. O caso do 3 cilindros é tão bom que ganhou aula própria: [[vid-tres-cilindros|por que motor 3 cilindros treme mais]].", "3- and 4-cylinder engines aren't so lucky: forces remain that the crankshaft alone can't balance. The fix is mechanical: balance shafts spinning the opposite way, creating an equal and opposite vibration. The 3-cylinder case is so good it earned its own lesson: [[vid-tres-cilindros|why 3-cylinder engines shake more]]."),
      T(">> Na prática, na hora de comparar carros: parte do que se sente como refinamento não é potência nem tecnologia de injeção, é arquitetura decidida no projeto, impossível de corrigir depois. Test-drive em marcha lenta e em subida de giro conta essa história inteira.", ">> In practice, when comparing cars: part of what reads as refinement isn't power or injection tech, it's architecture decided at the drawing board, impossible to fix later. A test drive at idle and through the revs tells that whole story."),
    ]}),
    art({ id: "vid-flutter", track: "sports", type: "video", system: "engine", traits: ["turbo"], addedAt: "2026-08-10", thumb: "/learn/vid-flutter.png",
      media: { provider: "youtube", src: "eHcAs6_PBUk", vertical: true },
      title: T("Aquele barulho de 'pomba' no turbo é defeito", "That turbo 'fluttering' noise is a fault"), related: ["trait-turbo", "vid-turbo-fabrica", "diag-noises"],
      body: [
      T("O som de esvoaçar quando você tira o pé, que muita gente persegue como se fosse prova de carro preparado, tem nome técnico: compressor surge. E ele não é enfeite. É o compressor apanhando.", "The fluttering sound when you lift off, which many people chase as if it proved a modified car, has a technical name: compressor surge. It isn't decoration. It's the compressor taking a beating."),
      T("## O que está acontecendo lá dentro", "## What's happening inside"),
      T("Com a borboleta fechando, o ar comprimido não tem para onde ir e volta contra as pás do turbo, que ainda giram em altíssima rotação. O fluxo inverte, estabiliza, inverte de novo, e é essa oscilação que você ouve como \"pomba\".", "With the throttle closing, compressed air has nowhere to go and pushes back against the turbo blades, still spinning at very high speed. Flow reverses, settles, reverses again, that oscillation is the flutter you hear."),
      T("## A peça que existe para evitar isso", "## The part that exists to prevent it"),
      T("A válvula de alívio (blow-off ou de recirculação) abre no instante em que você solta o acelerador e desvia esse ar, protegendo o eixo e os mancais do turbo do impacto. Carro de fábrica com turbo não faz esse barulho, por projeto.", "The blow-off (or recirculation) valve opens the instant you lift and diverts that air, shielding the turbo shaft and bearings from the hit. A factory turbo car doesn't make that noise: by design."),
      T("!! Quando o som aparece, quase sempre é válvula com defeito, mangueira solta ou alguém que a removeu de propósito atrás do barulho, trocando a vida útil do turbo por efeito sonoro. O eixo gira acima de 100.000 rpm; cada surge é uma pancada nos mancais.", "!! When the sound shows up, it's almost always a faulty valve, a loose hose, or someone who removed it on purpose chasing the noise, trading turbo life for an audio effect. The shaft spins above 100,000 rpm; every surge hammers the bearings."),
      T(">> Na prática: se o seu turbo começou a \"arrulhar\" do nada, procure a válvula de alívio e as mangueiras antes de qualquer outra coisa. Conserto barato agora, turbo caro depois. Os hábitos que preservam o conjunto estão em [[trait-turbo|5 cuidados que dobram a vida do turbo]].", ">> In practice: if your turbo started \"cooing\" out of nowhere, check the blow-off valve and hoses before anything else. Cheap fix now, expensive turbo later. The habits that preserve the system are in [[trait-turbo|5 habits that double a turbo's life]]."),
    ]}),
    art({ id: "vid-e32", track: "money", type: "video", system: "engine", addedAt: "2026-08-10", thumb: "/learn/vid-e32.png",
      media: { provider: "youtube", src: "HuL8rav6www", vertical: true },
      title: T("Gasolina E32: mais etanol na mistura, o que muda", "E32 gasoline: more ethanol in the blend, what changes"), related: ["vid-gasolina-e30", "vid-etanol-gasolina", "fuel-compare"],
      body: [
      T("A mistura de etanol na gasolina brasileira subiu de novo: rumo ao E32. Cada ponto a mais desloca um pouco o rendimento por litro e a conta do posto. Vale entender os dois lados do efeito.", "The ethanol share in Brazilian gasoline rose again: toward E32. Every extra point shifts per-liter yield and the pump math a little. Both sides of the effect are worth understanding."),
      T("## O lado que perde", "## The losing side"),
      T("Etanol tem menos energia por litro. Subir a mistura reduz o rendimento numa fração pequena, na casa de 1%, que aparece quando você compara tanques cheios no mesmo trajeto.", "Ethanol carries less energy per liter. Raising the blend trims yield by a small fraction, around 1%, which shows up when you compare full tanks on the same route."),
      T("## O lado que ganha", "## The winning side"),
      T("Mais etanol eleva a octanagem da mistura, o que dá à central mais margem de avanço antes da detonação: o mecanismo de [[vid-avanco-ignicao|avanço de ignição]]. Em motor turbo moderno, isso pode compensar parte da perda de energia.", "More ethanol raises the blend's octane, giving the ECU more advance margin before knock, the mechanism in [[vid-avanco-ignicao|ignition advance]]. In a modern turbo engine, that can offset part of the energy loss."),
      T(">> Para a decisão no posto o efeito é um só: a régua etanol × gasolina se desloca, e a regra dos 70% deixa de valer redondinha. Use a calculadora [[fuel-compare|Etanol ou Gasolina]] com o consumo real do seu carro. O contexto da mistura anterior está em [[vid-gasolina-e30|a gasolina E30]].", ">> For the pump decision the effect is one: the ethanol × gasoline ruler shifts, and the 70% rule stops being exact. Use the [[fuel-compare|Ethanol or Gasoline]] calculator with your car's real consumption. The previous blend's context is in [[vid-gasolina-e30|E30 gasoline]]."),
    ]}),
    art({ id: "vid-altitude", track: "fundamentals", type: "video", system: "engine", addedAt: "2026-08-10", thumb: "/learn/vid-altitude.png",
      media: { provider: "youtube", src: "KJbVwaXALZU", vertical: true },
      title: T("Por que o carro perde força na serra", "Why a car loses power up in the mountains"), related: ["vid-turbo-pressao", "vid-turbo-aspirado", "vid-cilindrada"],
      body: [
      T("Subiu a serra e o carro pareceu mais fraco? Não é impressão nem falta de manutenção. É física: menos ar disponível.", "Climbed into the mountains and the car felt weaker? It's not your imagination or poor maintenance. It's physics: less air available."),
      T("## Menos pressão, menos oxigênio", "## Less pressure, less oxygen"),
      T("A pressão atmosférica cai com a altitude, então cada litro de ar aspirado carrega menos oxigênio. Menos oxigênio é menos combustível queimado por ciclo, e potência é exatamente isso.", "Atmospheric pressure drops with altitude, so every liter of air drawn in carries less oxygen. Less oxygen means less fuel burned per cycle, and power is exactly that."),
      T(">> A regra de engenheiro: cerca de 1% de perda a cada 100 metros num motor aspirado. A 1.000 metros de altitude já são ~10%: perceptível numa subida com o carro carregado.", ">> The engineer's rule: roughly 1% loss per 100 meters in a naturally aspirated engine. At 1,000 meters that's already ~10%: noticeable on a climb with a loaded car."),
      T("## Por que o turbo quase não sente", "## Why the turbo barely notices"),
      T("O compressor simplesmente trabalha um pouco mais para entregar a MESMA pressão no coletor. É um dos méritos menos comentados do turbo: o carro praticamente não muda entre o litoral e a serra. O mecanismo está em [[vid-turbo-pressao|o que significa 1 kg de pressão]].", "The compressor simply works a little harder to deliver the SAME manifold pressure. It's one of the turbo's least-mentioned merits: the car barely changes between sea level and the mountains. The mechanism is in [[vid-turbo-pressao|what 1 kg of boost means]]."),
    ]}),
    art({ id: "vid-fastback-hibrido-partida", track: "model", type: "video", system: "engine", make: "Fiat", model: "Fastback", addedAt: "2026-08-10", thumb: "/learn/vid-fastback-hibrido-partida.png",
      media: { provider: "youtube", src: "mwdjn2Hry6A", vertical: true },
      title: T("Fiat Fastback híbrido: como funciona a partida", "Fiat Fastback hybrid: how starting works"), related: ["cult-hybrid", "diy-battery", "trait-ev"],
      body: [
      T("No Fastback híbrido, a partida não acontece como num carro comum: não existe o motor de arranque tradicional girando o volante com aquele ruído característico.", "In the hybrid Fastback, start-up doesn't happen like in a regular car: there's no traditional starter motor cranking the flywheel with that familiar grind."),
      T("## A peça que faz dois trabalhos", "## The part with two jobs"),
      T("No lugar dele há uma máquina elétrica acoplada à correia, que acumula duas funções: GERA energia quando o motor gira e VIRA motor de partida quando é hora de ligar. Por isso o carro acorda em silêncio.", "In its place sits an electric machine coupled to the belt, doing double duty: it GENERATES energy while the engine spins and BECOMES the starter when it's time to fire up. That's why the car wakes silently."),
      T("## O start-stop que não incomoda", "## The start-stop that doesn't annoy"),
      T("Como a religada vem pela correia, e não por engrenagem, ela é rápida e suave o bastante para acontecer dezenas de vezes no trânsito sem chamar atenção. A arquitetura híbrida completa está em [[cult-hybrid|híbridos: dois mundos]].", "Because restarts come through the belt, not a gear, they're quick and smooth enough to happen dozens of times in traffic unnoticed. The full hybrid architecture is in [[cult-hybrid|hybrids: two worlds]]."),
      T("!! O cuidado prático é a BATERIA: sistemas assim usam bateria específica, 12V reforçada (EFB/AGM) ou lítio auxiliar. Trocar por uma comum compromete o start-stop e pode acender luz no painel. Na troca, confirme a especificação no manual.", "!! The practical watch-point is the BATTERY: systems like this use a specific battery, reinforced 12V (EFB/AGM) or an auxiliary lithium pack. Fitting a regular one compromises start-stop and can trigger warning lights. When replacing, confirm the spec in the manual."),
      T(">> Vai trocar a bateria você mesmo? O passo a passo geral está em [[diy-battery|trocar a bateria]], com a ressalva de que em híbrido a especificação manda.", ">> Replacing the battery yourself? The general walkthrough is in [[diy-battery|replacing the battery]], with the caveat that in a hybrid, the spec rules."),
    ]}),
    art({ id: "vid-velozes-furiosos", track: "culture", type: "video", system: "engine", addedAt: "2026-08-10", thumb: "/learn/vid-velozes-furiosos.png",
      media: { provider: "youtube", src: "yMY4cUfHWws", vertical: true },
      title: T("O que Velozes e Furiosos errou sobre carros", "What Fast & Furious got wrong about cars"), related: ["vid-nitro", "vid-turbo-nitro", "cult-history"],
      body: [
      T("Nenhum filme popularizou a cultura automotiva como Velozes e Furiosos, e por isso mesmo vale separar a licença poética do que as pessoas passaram a repetir como verdade.", "No movie popularized car culture like The Fast and the Furious, which is exactly why it's worth separating poetic license from what people started repeating as fact."),
      T("## O nitro não é botão de dobra", "## Nitrous isn't a warp button"),
      T("Óxido nitroso funciona por injetar mais oxigênio, permitindo queimar mais combustível. Dura segundos, exige combustível proporcional e motor preparado para a pressão extra, a versão real está em [[vid-nitro|como funciona o nitro de verdade]].", "Nitrous works by injecting more oxygen, allowing more fuel to burn. It lasts seconds, demands proportional fuel and a built engine for the extra pressure, the real version is in [[vid-nitro|how nitrous really works]]."),
      T("## A \"décima marcha\" não existe", "## The \"tenth gear\" doesn't exist"),
      T("Mais marchas não geram velocidade: velocidade final é potência contra arrasto aerodinâmico. Uma marcha longa demais só deixa o motor sem força para puxar.", "More gears don't create speed: top speed is power against aerodynamic drag. An overly tall gear just leaves the engine without the muscle to pull it."),
      T(">> O que o filme ACERTOU tem valor real: o vínculo entre pessoa e máquina, e a ideia de que entender o próprio carro é parte do prazer de dirigir. Essa parte pode levar a sério: é mais ou menos o que este app existe para fazer.", ">> What the movie got RIGHT has real value: the bond between person and machine, and the idea that understanding your own car is part of the joy of driving. That part you can take seriously: it's roughly what this app exists to do."),
    ]}),
    art({ id: "vid-tsi", track: "fundamentals", type: "video", system: "engine", traits: ["turbo"], addedAt: "2026-08-10", thumb: "/learn/vid-tsi.png",
      media: { provider: "youtube", src: "WncKe4SK5QQ", vertical: true },
      title: T("O que quer dizer TSI, TFSI e essas siglas", "What TSI, TFSI and those badges mean"), related: ["vid-turbo-aspirado", "vid-cilindrada", "trait-turbo"],
      body: [
      T("Sigla em tampa de motor não é enfeite: cada letra descreve uma tecnologia. TSI, do grupo Volkswagen, junta duas, injeção direta e sobrealimentação, e o mesmo raciocínio decifra TFSI, T-GDI e parentes.", "Engine-cover badges aren't decoration: each letter describes a technology. TSI, from the Volkswagen group, combines two, direct injection and forced induction, and the same reasoning decodes TFSI, T-GDI and their relatives."),
      T("## O \"I\": injeção direta", "## The \"I\": direct injection"),
      T("O combustível é pulverizado DENTRO do cilindro, não no coletor. Isso resfria a câmara na admissão e permite taxa de compressão mais alta sem detonar: mais eficiência tirada do mesmo litro.", "Fuel is sprayed INSIDE the cylinder, not into the manifold. That cools the chamber during intake and allows a higher compression ratio without knock: more efficiency squeezed from the same liter."),
      T("## O \"T\": turbo", "## The \"T\": turbo"),
      T("O turbo resolve o outro lado: torque cedo, em rotação baixa, que é onde o motorista comum vive. Por isso um 1.0 TSI puxa como um aspirado bem maior no dia a dia, a comparação completa está em [[vid-turbo-aspirado|turbo ou aspirado]].", "The turbo solves the other side: early torque, at low rpm, where everyday driving lives. That's why a 1.0 TSI pulls like a much bigger naturally aspirated engine, the full comparison is in [[vid-turbo-aspirado|turbo or naturally aspirated]]."),
      T("!! O ponto de atenção da injeção direta: o combustível deixa de \"lavar\" as válvulas de admissão, e carvão se acumula nelas com o tempo. Não é defeito do seu carro: é característica da tecnologia inteira.", "!! Direct injection's watch-point: fuel no longer \"washes\" the intake valves, so carbon builds up on them over time. It's not a fault of your car: it's a trait of the whole technology."),
      T(">> Na prática, o que atrasa o acúmulo é simples: combustível de qualidade e [[oil-change|troca de óleo]] rigorosamente em dia. O respiro do motor deposita menos resíduo quando o óleo está saudável.", ">> In practice, what slows the build-up is simple: quality fuel and [[oil-change|oil changes]] strictly on time. The crankcase breather deposits less residue when the oil is healthy."),
    ]}),
    art({ id: "vid-diesel-disparando", track: "fundamentals", type: "video", system: "engine", traits: ["diesel"], addedAt: "2026-08-10", thumb: "/learn/vid-diesel-disparando.png",
      media: { provider: "youtube", src: "XHVtcOAxVes", vertical: true },
      title: T("Motor diesel disparado: por que a chave não desliga", "Diesel runaway: why the key won't shut it off"), related: ["trait-diesel", "diag-smells", "vid-turbo-aspirado"],
      body: [
      T("Existe uma falha em motor diesel que assusta quem vê: o motor acelera sozinho, sobe de rotação e NÃO OBEDECE à chave. Chama-se disparo, e entender o mecanismo explica por que a chave é inútil ali.", "There's a diesel failure that terrifies anyone watching: the engine revs up on its own and DOES NOT obey the key. It's called a runaway, and understanding the mechanism explains why the key is useless there."),
      T("## Por que a chave não desliga", "## Why the key doesn't shut it down"),
      T("Diesel não tem vela: queima por compressão. A chave, num diesel, corta o COMBUSTÍVEL, não a ignição. Se o motor encontrar outra fonte de combustível, cortar o diesel não muda nada.", "A diesel has no spark plug: it burns by compression. The key, in a diesel, cuts FUEL, not ignition. If the engine finds another fuel source, cutting the diesel changes nothing."),
      T("## A outra fonte: o próprio óleo", "## The other source: its own oil"),
      T("Quase sempre é o óleo do motor, aspirado pelo coletor por turbo com retentor gasto ou cárter com óleo em excesso. O motor passa a se alimentar de si mesmo, e cada aumento de rotação puxa mais óleo. É um ciclo que se realimenta até o fim.", "It's almost always engine oil, drawn into the intake through a worn turbo seal or an overfilled crankcase. The engine starts feeding on itself, and every rpm increase pulls more oil. It's a loop that feeds itself to the end."),
      T("!! A única forma de parar um disparo é cortar o AR: bloquear a admissão. É para isso que motores diesel industriais têm válvula de emergência na admissão. Deixado solto, o motor gira até se destruir. Não tente segurar pela chave: afaste-se.", "!! The only way to stop a runaway is cutting the AIR: blocking the intake. That's why industrial diesels carry an emergency intake shut-off valve. Left alone, the engine revs until it destroys itself. Don't fight it with the key: step away."),
      T(">> Prevenção é rotina, não sorte: nível de óleo correto (nunca acima do máximo) e atenção a fumaça azul, que denuncia retentor de turbo cansado. Os cuidados de dono de diesel estão em [[trait-diesel|diesel: os cuidados que evitam prejuízo grande]].", ">> Prevention is routine, not luck: correct oil level (never above max) and attention to blue smoke, which betrays a tired turbo seal. The diesel owner's habits are in [[trait-diesel|diesel: the care that avoids big losses]]."),
    ]}),
    art({ id: "vid-comprar-usado", track: "money", type: "video", addedAt: "2026-08-10", thumb: "/learn/vid-comprar-usado.png",
      media: { provider: "youtube", src: "_IQQoa3ksZ4", vertical: true },
      title: T("Comprar carro usado: o que olhar antes do preço", "Buying used: what to check before the price"), related: ["money-used", "money-quote", "money-repair-replace"],
      body: [
      T("Quem começa pelo preço acaba pagando duas vezes. A ordem que economiza dinheiro é outra: histórico, estrutura, mecânica, e só então a negociação.", "Whoever starts with the price ends up paying twice. The money-saving order is different: history, structure, mechanics, and only then the negotiation."),
      T("## 1. Histórico: o filtro mais barato", "## 1. History: the cheapest filter"),
      T("Consulta de débitos, restrição, sinistro e leilão custa pouco e elimina de cara os carros que dão prejuízo grande. E nota fiscal de serviço vale mais do que qualquer conversa do vendedor: um carro com histórico é um carro que alguém cuidou, como mostra [[sit-no-history|monte o histórico do seu carro]].", "Checking debts, liens, insurance write-offs and auction records costs little and instantly removes the cars that cause big losses. And service receipts beat any seller's story, a documented car is a cared-for car, as [[sit-no-history|build your car's history]] shows."),
      T("## 2. Estrutura: o carro limpo, à luz do dia", "## 2. Structure: clean car, daylight"),
      T("Alinhamento das frestas entre portas e capô, diferença de tom na pintura, parafuso de para-lama com marca de chave. Retoque não é problema; retoque ESCONDENDO batida estrutural é.", "Panel-gap alignment between doors and hood, paint-tone differences, fender bolts with wrench marks. Touch-up paint isn't a problem; touch-up HIDING structural damage is."),
      T("## 3. Mecânica: inspeção de quem defende você", "## 3. Mechanics: an inspection on your side"),
      T(">> Feche com uma inspeção paga por um profissional de SUA confiança, não do vendedor. Custa uma fração do primeiro reparo que evita, e é o único momento em que alguém olha o carro defendendo o seu interesse.", ">> Close with an inspection paid to a professional YOU trust, not the seller's. It costs a fraction of the first repair it prevents, and it's the only moment someone examines the car on your behalf."),
      T("O roteiro item a item para levar no bolso está em [[money-used|checklist para comprar usado]]; a leitura de orçamento sem susto, em [[money-quote|ler um orçamento e evitar golpes]].", "The pocket item-by-item script is in [[money-used|the used-car checklist]]; reading quotes without surprises, in [[money-quote|reading a quote and avoiding scams]]."),
    ]}),
    art({ id: "vid-luz-injecao-dica", track: "fundamentals", type: "video", system: "electrical", addedAt: "2026-08-10", thumb: "/learn/vid-luz-injecao-dica.png",
      media: { provider: "youtube", src: "nYiPnYVZlSI", vertical: true },
      title: T("Dica rápida: a luz de injeção acendeu sozinha", "Quick tip: the check-engine light came on by itself"), related: ["vid-luz-injecao-acendeu", "vid-luz-injecao-como-funciona", "obd2-scan"],
      body: [
      T("Antes de marcar oficina, faça a checagem de trinta segundos que resolve uma parte considerável dos casos de luz de injeção: a tampa do tanque.", "Before booking a shop, run the thirty-second check that resolves a fair share of check-engine cases: the fuel cap."),
      T("## Por que uma tampa acende a luz do motor", "## Why a cap lights up the engine warning"),
      T("O sistema de emissões monitora a pressão do tanque. Tampa mal rosqueada ou com a borracha ressecada deixa vapor escapar, o sensor acusa, e a central acende a luz, sem nenhum problema mecânico por trás.", "The evaporative-emissions system monitors tank pressure. A half-screwed cap or a dried-out seal lets vapor escape, the sensor flags it, and the ECU lights the lamp, with zero mechanical trouble behind it."),
      T(">> O teste: aperte a tampa até ouvir os cliques e rode alguns dias. A luz NÃO apaga na hora, a central precisa repetir o teste por alguns ciclos antes de dar o problema por resolvido.", ">> The test: tighten the cap until it clicks and drive for a few days. The light does NOT go out immediately, the ECU must repeat the test across cycles before declaring the problem solved."),
      T("Se depois disso ela continuar acesa, aí vale ler o código. O caminho está em [[obd2-scan|como usar seu scanner OBD2]] e o contexto completo em [[vid-luz-injecao-acendeu|a luz acendeu: o que fazer agora]].", "If it stays on after that, then it's time to read the code, the path is in [[obd2-scan|how to use your OBD2 scanner]] and the full context in [[vid-luz-injecao-acendeu|the light is on: what to do now]]."),
      T("!! Se em algum momento a luz começar a PISCAR, pare de tratar como dica rápida: piscando indica falha de combustão, que estraga o catalisador rapidamente. Reduza e pare com segurança.", "!! If at any point the light starts FLASHING, stop treating this as a quick tip: flashing means a misfire, which ruins the catalytic converter fast. Slow down and stop safely."),
    ]}),
    art({ id: "vid-luz-injecao-como-funciona", track: "fundamentals", type: "video", system: "electrical", addedAt: "2026-08-10", thumb: "/learn/vid-luz-injecao-como-funciona.png",
      media: { provider: "youtube", src: "ZQzgYUB8POQ", vertical: true },
      title: T("Como a luz de injeção decide acender", "How the check-engine light decides to come on"), related: ["vid-luz-injecao-acendeu", "vid-luz-injecao-dica", "obd2-scan"],
      body: [
      T("A luz de injeção não tem um sensor próprio. Ela é a saída de um sistema de autodiagnóstico que compara, o tempo todo, o que os sensores medem com o que a central espera para aquela condição.", "The check-engine light has no sensor of its own. It's the output of a self-diagnosis system that constantly compares what the sensors read with what the ECU expects for that condition."),
      T("## Dezenas de leituras por segundo", "## Dozens of readings per second"),
      T("Sonda lambda, rotação, temperatura, pressão do coletor, detonação: quando uma leitura fica fora da faixa esperada por tempo suficiente, a central grava um código de falha.", "Oxygen sensor, rpm, temperature, manifold pressure, knock: when one reading strays outside its expected range for long enough, the ECU stores a fault code."),
      T("## O \"tempo suficiente\" importa", "## \"Long enough\" matters"),
      T("A central não acende a luz na primeira leitura estranha: justamente para não alarmar por uma oscilação. Ela confirma o desvio ao longo de ciclos de condução antes de avisar você.", "The ECU doesn't light up on the first odd reading: precisely to avoid crying wolf over a blip. It confirms the deviation across drive cycles before telling you."),
      T(">> Por isso a luz é um começo de conversa, não um diagnóstico: o código diz qual CIRCUITO reclamou, não qual peça está com defeito. Trocar peça só pelo código é o jeito mais comum de gastar sem resolver.", ">> That's why the light is a conversation starter, not a diagnosis: the code names the CIRCUIT that complained, not the faulty part. Swapping parts by code alone is the most common way to spend without fixing."),
      T("Ela acendeu agora? O plano de ação está em [[vid-luz-injecao-acendeu|a luz acendeu: o que fazer agora]], e a leitura do código, em [[obd2-scan|como usar seu scanner OBD2]].", "Did it just come on? The action plan is in [[vid-luz-injecao-acendeu|the light is on: what to do now]], and reading the code, in [[obd2-scan|how to use your OBD2 scanner]]."),
    ]}),
    art({ id: "vid-etanol-gasolina", track: "money", type: "video", system: "engine", addedAt: "2026-08-10", thumb: "/learn/vid-etanol-gasolina.png",
      media: { provider: "youtube", src: "sPmfF7DD3n4", vertical: true },
      title: T("Etanol ou gasolina: a conta que decide", "Ethanol or gasoline: the math that decides"), related: ["fuel-compare", "vid-gasolina-e30", "vid-e32"],
      body: [
      T("A regra dos 70% virou senso comum de posto, mas ela é uma média nacional, e a sua decisão não é sobre a média: é sobre o SEU carro.", "The 70% rule became gas-station common sense, but it's a national average, and your decision isn't about the average: it's about YOUR car."),
      T("## De onde vem o número", "## Where the number comes from"),
      T("Etanol rende menos por litro porque carrega menos energia. Se o litro do etanol custar menos de 70% do da gasolina, compensa; acima disso, a gasolina sai mais barata por quilômetro rodado.", "Ethanol delivers less per liter because it holds less energy. If ethanol costs under 70% of gasoline's price per liter, it wins; above that, gasoline is cheaper per kilometer."),
      T("## Por que 70% é aproximação", "## Why 70% is an approximation"),
      T("Motores turbo modernos aproveitam melhor a octanagem alta do etanol, a central usa mais avanço, como explica [[vid-avanco-ignicao|avanço de ignição]], e chegam perto de 75%. Motores antigos ficam abaixo de 70%. E a fatia de etanol na própria gasolina subiu, deslocando tudo mais um pouco: ver [[vid-gasolina-e30|a gasolina E30]].", "Modern turbo engines exploit ethanol's high octane better, the ECU runs more advance, as [[vid-avanco-ignicao|ignition advance]] explains, and get close to 75%. Older engines sit below 70%. And gasoline's own ethanol share went up, shifting everything a bit more: see [[vid-gasolina-e30|E30 gasoline]]."),
      T(">> O jeito certo é medir: um tanque cheio de cada combustível, no mesmo tipo de trajeto, anotando o consumo. Com esses dois números, a comparação vira a conta do SEU carro, e é exatamente essa conta que a calculadora [[fuel-compare|Etanol ou Gasolina]] do app faz por você.", ">> The right way is measuring: one full tank of each fuel, same kind of route, noting consumption. With those two numbers the comparison becomes YOUR car's math, and that's exactly what the app's [[fuel-compare|Ethanol or Gasoline]] calculator does for you."),
    ]}),
    art({ id: "vid-turbo-aspirado", track: "sports", type: "video", system: "engine", addedAt: "2026-08-10", thumb: "/learn/vid-turbo-aspirado.png",
      media: { provider: "youtube", src: "laI-4DH6kRY", vertical: true },
      title: T("Turbo ou aspirado: o que muda de verdade", "Turbo or naturally aspirated: what really changes"), related: ["vid-turbo-pressao", "trait-turbo", "vid-cilindrada"],
      body: [
      T("Aspirado enche os cilindros com a pressão do ambiente. Turbo comprime esse ar antes de entrar. Toda diferença de caráter entre os dois nasce dessa única frase.", "A naturally aspirated engine fills its cylinders at ambient pressure. A turbo compresses that air before it goes in. Every difference in character between them comes from that single sentence."),
      T("## Por que as montadoras migraram para o turbo", "## Why carmakers moved to turbos"),
      T("O turbo entrega torque cedo. Um 1.0 turbo tem, a 1.800 rpm, força que um aspirado só encontra perto de 4.000 rpm. Na cidade isso significa andar sem esticar marcha, e menos motor girando alto é também menos consumo no uso real.", "The turbo delivers torque early. A 1.0 turbo has, at 1,800 rpm, force a naturally aspirated engine only finds near 4,000 rpm. In town that means driving without stretching gears, and less high-revving also means less real-world fuel use."),
      T("Esse número, a pressão que o turbo soma, é o famoso \"1 kg\" das rodas de conversa. O que ele significa exatamente está em [[vid-turbo-pressao|Turbo: o que significa 1 kg de pressão]].", "That number, the pressure the turbo adds, is the famous \"1 kg\" of bench-racing talk. What it means exactly is in [[vid-turbo-pressao|Turbo: what 1 kg of boost means]]."),
      T("## O que o aspirado ainda faz melhor", "## What the naturally aspirated engine still does better"),
      T("Resposta imediata e previsível: pisou, aconteceu, sem o intervalo que o turbo precisa para acumular pressão. É também um motor mecanicamente mais simples, com menos peças submetidas a calor extremo, menos coisas para dar errado com o passar dos anos.", "Immediate, predictable response: you press, it happens, without the lag a turbo needs to build pressure. It's also a mechanically simpler engine, with fewer parts under extreme heat: fewer things to go wrong as years pass."),
      T("## O que muda na manutenção", "## What changes in maintenance"),
      T("O turbo trabalha a temperaturas altíssimas e é lubrificado pelo óleo do motor: ele depende de óleo limpo e correto para sobreviver. Não é um motor frágil, mas perdoa menos óleo vencido, nível baixo e desligar o motor logo depois de exigir muito dele.", "The turbo runs at extreme temperatures and is lubricated by engine oil: it depends on clean, correct oil to survive. It isn't a fragile engine, but it's less forgiving of overdue oil, low level and shutting off right after working it hard."),
      T(">> Na prática: se o seu carro é turbo, a regra número um é respeitar o óleo do manual, especificação exata e intervalo em dia. Os cinco hábitos que fazem diferença estão em [[trait-turbo|5 cuidados que dobram a vida do turbo]].", ">> In practice: if your car is turbocharged, rule number one is respecting the manual's oil, exact spec and on-time changes. The five habits that matter are in [[trait-turbo|5 habits that double a turbo's life]]."),
    ]}),
    art({ id: "vid-turbo-nitro", track: "sports", type: "video", system: "engine", addedAt: "2026-08-10", thumb: "/learn/vid-turbo-nitro.png",
      media: { provider: "youtube", src: "K4OcLtykijI", vertical: true },
      title: T("Turbo ou nitro: dois jeitos de meter mais ar", "Turbo or nitrous: two ways to force more air in"), related: ["vid-nitro", "vid-turbo-pressao", "vid-turbo-fabrica"],
      body: [
      T("Turbo e nitro resolvem o mesmo problema, colocar mais oxigênio dentro do cilindro, por caminhos opostos. Essa diferença de caminho define quando cada um faz sentido.", "Turbo and nitrous solve the same problem, getting more oxygen into the cylinder, by opposite routes. That difference defines when each one makes sense."),
      T("## O turbo: reaproveitamento contínuo", "## The turbo: continuous recycling"),
      T("O turbo COMPRIME o ar do ambiente usando a energia dos gases de escape, que iriam embora de qualquer jeito. Funciona o tempo todo, a cada aceleração, e não consome nada além do combustível extra correspondente. Como isso vira número no manômetro está em [[vid-turbo-pressao|o que significa 1 kg de pressão]].", "The turbo COMPRESSES ambient air using exhaust-gas energy that would leave anyway. It works all the time, on every pull, and consumes nothing beyond the matching extra fuel. How that becomes a gauge number is in [[vid-turbo-pressao|what 1 kg of boost means]]."),
      T("## O nitro: oxigênio de mochila", "## Nitrous: oxygen in a backpack"),
      T("O nitro CARREGA o oxigênio junto, numa garrafa. Ao se decompor pelo calor, libera oxigênio e ainda resfria a admissão: efeito instantâneo, sem lag nenhum, e limitado ao conteúdo da garrafa.", "Nitrous CARRIES its oxygen along, in a bottle. Breaking down with heat, it releases oxygen and cools the intake too: instant effect, zero lag, limited to what the bottle holds."),
      T(">> A divisão prática: turbo é ganho PERMANENTE, é o que as montadoras adotam. Nitro é ganho de alguns segundos, para arrancada, e exige motor preparado para receber: a pressão no cilindro sobe de uma vez, sem tempo de acomodação.", ">> The practical split: turbo is a PERMANENT gain, it's what carmakers adopt. Nitrous is a seconds-long gain, for launches, and demands a built engine: cylinder pressure jumps at once, with no settling time."),
      T("!! Nos dois caminhos a regra é a mesma: mais oxigênio SEM mais combustível é mistura pobre, detonação e pistão. A dosagem certa do nitro está em [[vid-nitro|como funciona o nitro]]; o limite do turbo, em [[vid-turbo-fabrica|por que o turbo de fábrica não vem cheio]].", "!! On both paths the rule is the same: more oxygen WITHOUT more fuel means a lean mix, knock and pistons. Nitrous dosing is in [[vid-nitro|how nitrous works]]; the turbo's limit is in [[vid-turbo-fabrica|why the factory turbo isn't maxed out]]."),
    ]}),
    art({ id: "vid-tres-cilindros", track: "fundamentals", type: "video", system: "engine", addedAt: "2026-08-10", thumb: "/learn/vid-tres-cilindros.png",
      media: { provider: "youtube", src: "OYPNu3VPfRo", vertical: true },
      title: T("Por que motor 3 cilindros treme mais", "Why a three-cylinder engine shakes more"), related: ["vid-balanceamento-motor", "vid-cilindrada", "diag-noises"],
      body: [
      T("Aquela trepidação do 3 cilindros na marcha lenta não é defeito nem falta de ajuste. É matemática: consequência direta de ter um número ímpar de cilindros.", "That 3-cylinder shimmy at idle isn't a fault or a bad tune. It's math: the direct consequence of an odd cylinder count."),
      T("## O que o número par resolve de graça", "## What an even count solves for free"),
      T("Num 4 cilindros, dois pistões sobem enquanto dois descem: as massas se opõem e boa parte da vibração se cancela sozinha. Num 3, essa simetria não existe: sempre sobra um pistão sem par, e o motor tende a balançar de ponta a ponta.", "In a four, two pistons rise while two fall, the masses oppose each other and much of the vibration cancels by itself. In a three, that symmetry doesn't exist: there's always one piston without a partner, and the engine tends to rock end to end."),
      T("## A solução: eixo balanceador", "## The fix: a balance shaft"),
      T("Um eixo girando em sentido contrário cria exatamente a vibração oposta. Funciona bem: ao custo de peça, peso e uma fração de atrito. O panorama completo do equilíbrio de motores está em [[vid-balanceamento-motor|balanceamento: por que uns tremem e outros não]].", "A shaft spinning the opposite way creates exactly the opposite vibration. It works well: at the cost of a part, weight and a sliver of friction. The full picture of engine balance is in [[vid-balanceamento-motor|balance: why some engines shake and others don't]]."),
      T(">> Em troca vêm vantagens reais: menos atrito interno que um 4 cilindros, menos peso, aquecimento mais rápido, e o ronco rouco que virou assinatura dos 1.0 modernos.", ">> In exchange come real advantages: less internal friction than a four, less weight, faster warm-up, and the gravelly growl that became the signature of modern 1.0s."),
      T("!! O limite entre característica e falha: treme um pouco parado e some ao acelerar → normal. Treme E engasga, falha ou acende luz → investigação. Nesse caso, comece por [[vid-luz-injecao-como-funciona|como a luz de injeção decide acender]].", "!! The line between character and fault: a slight idle shimmy that fades when you accelerate → normal. Shaking AND stumbling, misfiring or a warning light → investigate. In that case, start with [[vid-luz-injecao-como-funciona|how the check-engine light decides to come on]]."),
    ]}),
    art({ id: "vid-ressonador", track: "sports", type: "video", system: "engine", addedAt: "2026-08-10", thumb: "/learn/vid-ressonador.png",
      media: { provider: "youtube", src: "vPxBV6il_A4", vertical: true },
      title: T("Ressonador: a peça que todo mundo remove sem saber", "The resonator: the part everyone removes without knowing"), related: ["vid-cortar-molas", "vid-marcha-lenta-preparado", "diag-noises"],
      body: [
      T("Aquele bojo no meio do escapamento ou da admissão parece enfeite, e é a primeira peça que some numa modificação. Ele existe para cancelar uma frequência específica de ruído, e removê-lo não entrega o que promete.", "That bulge in the middle of the exhaust or intake looks like decoration, and it's the first part to vanish in a modification. It exists to cancel a specific noise frequency, and removing it doesn't deliver what it promises."),
      T("## Como uma câmara vazia cancela som", "## How an empty chamber cancels sound"),
      T("O princípio é acústico, não mecânico: o ressonador tem um volume calculado para que a onda sonora que entra volte defasada e se anule com a que está chegando. Interferência destrutiva: o mesmo princípio do fone com cancelamento de ruído.", "The principle is acoustic, not mechanical: the resonator's volume is tuned so the sound wave entering it bounces back out of phase and cancels the incoming one. Destructive interference, the same principle as noise-cancelling headphones."),
      T("## \"Mas soltar o fluxo não dá potência?\"", "## \"But doesn't freeing the flow add power?\""),
      T("Não neste caso: o ressonador não restringe fluxo de forma relevante. Ele não estava roubando potência: estava matando o drone chato que aparece numa rotação específica, normalmente em velocidade de estrada.", "Not here: the resonator doesn't meaningfully restrict flow. It wasn't stealing power, it was killing the annoying drone that shows up at one specific rpm, usually at highway speed."),
      T(">> O resultado prático de remover costuma ser exatamente este: o carro NÃO fica mais rápido e ganha um zumbido constante na estrada que cansa em viagem longa. Vale saber antes de autorizar o serviço, e vale a mesma lógica de compromisso de [[vid-cortar-molas|não rebaixar cortando as molas]].", ">> The practical result of removing it is usually exactly this: the car does NOT get faster and gains a constant highway drone that wears you down on long trips. Worth knowing before authorizing the job, the same trade-off logic as [[vid-cortar-molas|not lowering by cutting springs]]."),
    ]}),
    art({ id: "vid-oxido-nitroso", track: "sports", type: "video", system: "engine", addedAt: "2026-08-10", thumb: "/learn/vid-oxido-nitroso.png",
      media: { provider: "youtube", src: "zCURAxPuk_I", vertical: true },
      title: T("Óxido nitroso: por que ele dá potência", "Nitrous oxide: why it makes power"), related: ["vid-nitro", "vid-turbo-nitro", "vid-avanco-ignicao"],
      body: [
      T("O N₂O não queima. Ele não é combustível, e é exatamente aí que quase todo mundo entende errado o que o nitro faz num motor.", "N₂O doesn't burn. It isn't a fuel, and that's exactly where almost everyone misunderstands what nitrous does in an engine."),
      T("## A molécula que carrega oxigênio", "## The molecule that carries oxygen"),
      T("Cada molécula tem dois átomos de nitrogênio e um de oxigênio. No cilindro quente, por volta de 300 °C, ela se quebra e LIBERA esse oxigênio. Mais oxigênio disponível permite queimar mais combustível, e é o combustível extra que vira potência.", "Each molecule holds two nitrogen atoms and one oxygen atom. In the hot cylinder, around 300 °C, it breaks apart and RELEASES that oxygen. More available oxygen lets you burn more fuel, and it's the extra fuel that becomes power."),
      T("## O efeito colateral que ajuda", "## The side effect that helps"),
      T("O N₂O é armazenado líquido sob pressão e evapora ao ser injetado, roubando calor da admissão. Ar mais frio é mais denso: o ganho se soma. É o mesmo princípio que faz intercooler valer a pena num turbo.", "N₂O is stored as a pressurized liquid and evaporates on injection, stealing heat from the intake. Colder air is denser, the gains stack. It's the same principle that makes an intercooler worthwhile on a turbo."),
      T("!! O risco mora na proporção: nitro sem combustível acompanhando na mesma medida é mistura pobre com oxigênio de sobra, receita direta de detonação e pistão furado. Não é o nitro que quebra motor; é o nitro sem combustível junto.", "!! The risk lives in the ratio: nitrous without fuel matching it means a lean mixture with surplus oxygen, a straight recipe for knock and holed pistons. It isn't nitrous that breaks engines; it's nitrous without the fuel to match."),
      T(">> Esta é a química por trás do sistema. O funcionamento na prática, garrafa, injeção, quando usar, está em [[vid-nitro|como funciona o nitro (NOS) de verdade]].", ">> This is the chemistry behind the system. The practical side, bottle, injection, when to use it, is in [[vid-nitro|how nitrous (NOS) really works]]."),
    ]}),
      art({ id: "gearbox-tipos", track: "fundamentals", system: "engine", addedAt: "2026-08-20", thumb: "/learn/gearbox-tipos.png",
      title: T("Os 4 tipos de câmbio automático (e como saber o seu)", "The 4 kinds of automatic gearbox (and how to know yours)"), related: ["trait-cvt", "sport-dct", "trait-dct"], body: [
      T("\"Automático\" no anúncio pode significar quatro máquinas completamente diferentes, e cada uma pede um jeito de usar e de manter. Saber qual está no seu carro é o primeiro passo de qualquer cuidado com o câmbio.", "\"Automatic\" in the ad can mean four completely different machines, and each asks for its own way of driving and maintaining. Knowing which one is in your car is step one of any gearbox care."),
      T("## 1. Automático convencional (conversor de torque)", "## 1. Conventional automatic (torque converter)"),
      T("O clássico: engrenagens planetárias e um acoplamento hidráulico no lugar da embreagem. Trocas suaves, arrancada sem drama, e aquela leve \"nadada\" ao acelerar forte. É o mais tolerante ao mau uso, e mesmo assim depende do fluido.", "The classic: planetary gears and a fluid coupling instead of a clutch. Smooth shifts, drama-free launches, and that slight \"swim\" under hard throttle. It's the most abuse-tolerant, and it still lives or dies by its fluid."),
      T("## 2. CVT: sem marchas de verdade", "## 2. CVT: no real gears"),
      T("Duas polias de diâmetro variável e uma correia entre elas: relação continuamente variável, sem trocas. O motor segura a rotação enquanto o carro acelera, o que soa estranho para quem não conhece. O que preserva e o que destrói um CVT está em [[trait-cvt|câmbio CVT: o que preserva e o que destrói]].", "Two variable-diameter pulleys with a belt between them, a continuously variable ratio, no shifts. The engine holds revs while the car gains speed, which sounds odd to the uninitiated. What preserves and what kills a CVT is in [[trait-cvt|CVT: what preserves it and what destroys it]]."),
      T("## 3. Dupla embreagem (DCT)", "## 3. Dual-clutch (DCT)"),
      T("Duas embreagens automatizadas: uma cuida das marchas ímpares, a outra das pares, com a próxima marcha já pré-engatada. Troca em milésimos, direção esportiva, e mais sensível a trânsito parado que os outros. Detalhes em [[sport-dct|câmbio de dupla embreagem]].", "Two automated clutches: one handles odd gears, the other even, with the next gear pre-selected. Millisecond shifts, sporty feel, and more sensitive to stop-and-go traffic than the rest. Details in [[sport-dct|the dual-clutch gearbox]]."),
      T("## 4. Automatizado (AMT)", "## 4. Automated manual (AMT)"),
      T("Um câmbio manual em que um robô pisa a embreagem e troca por você. É o mais barato, e o que mais estranha quem espera suavidade de automático: a pausa entre marchas é característica, não defeito. O que é normal nele está em [[trait-dct|automatizado no dia a dia]].", "A manual gearbox where a robot works the clutch and shifts for you. It's the cheapest, and the most surprising to anyone expecting torque-converter smoothness: the pause between gears is a trait, not a fault. What's normal is in [[trait-dct|the automated manual day to day]]."),
      T(">> Como identificar o seu: manual do carro, ficha técnica, ou o comportamento, rotação que \"segura\" enquanto acelera é CVT; pausa perceptível entre marchas é AMT; trocas instantâneas aos trancos leves em manobra é DCT; suavidade total com leve nadada é o conversor.", ">> How to identify yours: the manual, the spec sheet, or the behavior, revs that \"hang\" while you accelerate mean CVT; a noticeable pause between gears means AMT; instant shifts with light judder in parking moves means DCT; total smoothness with a slight swim means the torque converter."),
    ]}),
    art({ id: "gearbox-fluido", track: "fundamentals", system: "engine", addedAt: "2026-08-20", thumb: "/learn/gearbox-fluido.png",
      title: T("Fluido de câmbio: o mito do \"lubrificado para a vida toda\"", "Gearbox fluid: the \"lubricated for life\" myth"), related: ["gearbox-tipos", "gearbox-sintomas", "trait-cvt"], body: [
      T("Muito manual diz que o fluido do câmbio automático \"não precisa de troca\". A frase merece tradução: para a vida toda... do PERÍODO DE GARANTIA. Para quem pretende ficar com o carro, a história é outra.", "Many manuals say the automatic's fluid \"never needs changing\". The phrase deserves translation: for the life... OF THE WARRANTY PERIOD. For anyone planning to keep the car, the story is different."),
      T("## O que o fluido faz (e por que envelhece)", "## What the fluid does (and why it ages)"),
      T("No automático, o fluido não só lubrifica: ele TRANSMITE força, refrigera e aciona embreagens internas. Trabalha quente e sob pressão, e todo fluido nessas condições oxida e perde propriedades com o tempo, tenha o rótulo que tiver.", "In an automatic, the fluid doesn't just lubricate: it TRANSMITS force, cools and applies internal clutches. It runs hot and pressurized, and any fluid in those conditions oxidizes and degrades over time, whatever the label says."),
      T(">> Referência prática de oficina: troca entre 60 e 80 mil km em uso normal, antes disso em uso severo, trânsito pesado, reboque, aplicativo. O uso severo do motorista de app está em [[trait-appuse|rodar de aplicativo]].", ">> Practical shop reference: change between 60,000 and 80,000 km in normal use, sooner in severe use, heavy traffic, towing, ride-hailing. The app driver's severe-use case is in [[trait-appuse|driving for ride-hailing apps]]."),
      T("## A troca certa importa tanto quanto a época", "## The right procedure matters as much as the timing"),
      T("Cada câmbio pede um fluido específico. CVT, DCT e conversor usam produtos DIFERENTES e incompatíveis entre si. E em câmbios com muita quilometragem sem troca nunca feita, a troca por diálise/completa deve ser avaliada por quem entende do modelo.", "Every gearbox asks for a specific fluid. CVT, DCT and torque converters use DIFFERENT, mutually incompatible products. And on high-mileage boxes never serviced, a full exchange should be judged by someone who knows the model."),
      T("!! Sintomas de fluido vencido: trancos novos, demora para engatar D ou R a frio, patinação em subida. Ignorados, viram conserto de câmbio: uma das contas mais caras do carro. Os sinais em detalhe estão em [[gearbox-sintomas|trancos, atrasos e patinação]].", "!! Symptoms of spent fluid: new judders, delay engaging D or R when cold, slipping uphill. Ignored, they become a gearbox rebuild: one of the priciest bills a car can produce. The signs in detail are in [[gearbox-sintomas|judders, delays and slipping]]."),
    ]}),
    art({ id: "gearbox-sintomas", track: "diagnosis", system: "engine", addedAt: "2026-08-20", thumb: "/learn/gearbox-sintomas.png",
      title: T("Trancos, atrasos e patinação: quando o câmbio pede oficina", "Judders, delays and slipping: when the gearbox needs a shop"), related: ["gearbox-fluido", "gearbox-tipos", "money-quote"], body: [
      T("Câmbio automático raramente quebra de uma vez: ele avisa. Os três avisos clássicos têm nome, e reconhecê-los cedo é a diferença entre trocar fluido e trocar câmbio.", "An automatic rarely fails at once: it warns you. The three classic warnings have names, and catching them early is the difference between changing fluid and changing the gearbox."),
      T("## Tranco: a troca que se sente", "## Judder: the shift you can feel"),
      T("Trocas que eram imperceptíveis e passaram a dar um solavanco: especialmente a frio ou entre 1ª e 2ª. Costuma ser o primeiro sinal de fluido degradado; em DCT, pode ser a embreagem chegando ao fim.", "Shifts that used to be invisible now arrive with a jolt: especially cold or between 1st and 2nd. Usually the first sign of degraded fluid; on a DCT, it can be the clutch pack nearing its end."),
      T("## Atraso: o engate que demora", "## Delay: the engagement that takes its time"),
      T("Você passa para D ou R e o carro leva um segundo ou mais para responder. É pressão hidráulica baixa: fluido velho, nível errado ou bomba cansada. Piora a frio e é fácil de reproduzir para mostrar ao mecânico.", "You select D or R and the car takes a second or more to respond. That's low hydraulic pressure: old fluid, wrong level or a tired pump. It's worse cold and easy to reproduce for the mechanic."),
      T("## Patinação: rotação sobe, carro não acompanha", "## Slipping: revs climb, the car doesn't follow"),
      T("!! O mais sério dos três: o motor gira e a força não chega inteira às rodas, típico em subida ou ultrapassagem. É embreagem interna gastando: siga direto para diagnóstico, porque cada km patinando encurta a vida do conjunto.", "!! The most serious of the three: the engine revs and full force doesn't reach the wheels, typically uphill or overtaking. That's internal clutches wearing: go straight to diagnosis, because every slipping km shortens the gearbox's life."),
      T(">> Antes de aceitar qualquer orçamento grande: verifique nível e estado do fluido ([[gearbox-fluido|o mito do lubrificado para sempre]]), leia os códigos da central ([[obd2-scan|como usar seu scanner OBD2]]) e leve o orçamento para [[money-quote|a leitura sem golpe]]. Muito \"câmbio condenado\" era fluido e sensor.", ">> Before accepting any big quote: check fluid level and condition ([[gearbox-fluido|the lubricated-for-life myth]]), read the ECU codes ([[obd2-scan|how to use your OBD2 scanner]]) and run the quote through [[money-quote|scam-free quote reading]]. Many a \"condemned gearbox\" was fluid and a sensor."),
    ]}),
    art({ id: "tire-calibragem", track: "diy", system: "tires", addedAt: "2026-08-20", thumb: "/learn/tire-calibragem.png",
      title: T("Calibragem e rodízio na prática", "Tire pressure and rotation, hands-on"), related: ["tire-care", "vid-pneu-medidas", "vid-pneu-indices"], body: [
      T("São os dois cuidados mais baratos do carro inteiro, e os que mais gente pula. Calibragem certa e rodízio em dia mudam consumo, frenagem e a vida útil do jogo de pneus.", "They're the two cheapest jobs on the whole car, and the most skipped. Correct pressure and on-time rotation change fuel use, braking and how long the tire set lasts."),
      T("## A pressão certa não está no pneu", "## The right pressure isn't on the tire"),
      T("O número gravado no flanco é o MÁXIMO do pneu, não a recomendação. A pressão certa está na etiqueta da coluna da porta (ou tampa do tanque/manual), e costuma ter dois valores: carga normal e carro cheio.", "The number molded on the sidewall is the tire's MAXIMUM, not the recommendation. The right pressure is on the door-jamb label (or fuel flap/manual), usually with two values: normal load and fully loaded."),
      T(">> A rotina que funciona: calibre a cada 15 dias, com o pneu FRIO (até 3 km rodados ou 3 horas parado). Pneu quente marca pressão maior e engana a leitura. E não esqueça o estepe: ele descalibra parado.", ">> The routine that works: check every two weeks, with tires COLD (under 3 km driven or 3+ hours parked). Warm tires read higher and fool the gauge. And don't forget the spare, it loses pressure just sitting there."),
      T("## Rodízio: desgaste dividido é pneu durando", "## Rotation: shared wear is longer life"),
      T("Os pneus de tração e direção gastam mais e diferente. O rodízio redistribui esse desgaste, a cada 10 mil km, no esquema que o manual do carro indicar (varia entre tração dianteira, traseira e pneus assimétricos).", "Driven and steering tires wear more and differently. Rotation redistributes that wear: every 10,000 km, in the pattern your car's manual specifies (it varies between front-drive, rear-drive and asymmetric tires)."),
      T("!! Desgaste desigual entre as bordas de um MESMO pneu não se resolve com rodízio: borda de fora gasta é alinhamento/geometria; centro gasto é excesso de pressão; as duas bordas gastas é pressão baixa. Rodízio esconde o sintoma, não a causa.", "!! Uneven wear across a SINGLE tire isn't fixed by rotation: a worn outer edge means alignment/geometry; a worn center means overinflation; both edges worn means underinflation. Rotation hides the symptom, not the cause."),
      T("Como ler as medidas e os índices na hora de repor está em [[vid-pneu-medidas|como ler a medida do pneu]] e [[vid-pneu-indices|índices de carga e velocidade]]; o panorama completo, em [[tire-care|cuidando dos pneus]].", "How to read sizes and ratings when replacing is in [[vid-pneu-medidas|reading a tire size]] and [[vid-pneu-indices|load and speed ratings]]; the full picture, in [[tire-care|caring for your tires]]."),
    ]}),
    art({ id: "diag-superaquecimento", track: "diagnosis", system: "engine", addedAt: "2026-08-20", thumb: "/learn/diag-superaquecimento.png",
      title: T("Superaquecimento: o que fazer nos primeiros 5 minutos", "Overheating: what to do in the first 5 minutes"), related: ["diag-leaks", "diag-smells", "fund-fluids"], body: [
      T("O ponteiro subiu além do meio ou acendeu a luz vermelha de temperatura. Os próximos minutos decidem se a conta será uma mangueira ou um motor. A ordem das ações importa mais que a pressa.", "The needle climbed past the middle or the red temperature light came on. The next few minutes decide whether the bill is a hose or an engine. The order of actions matters more than speed."),
      T("## Primeiro minuto: reduza a carga", "## First minute: shed load"),
      T("Desligue o ar-condicionado e, por estranho que pareça, LIGUE o aquecedor no máximo: ele é um pequeno radiador dentro do painel e ajuda a tirar calor do motor enquanto você procura onde parar.", "Switch off the A/C and, odd as it sounds, turn the HEATER on full: it's a small radiator inside the dash and helps pull heat out of the engine while you find a place to stop."),
      T("!! Se o ponteiro chegar ao vermelho, sair vapor do capô ou o motor perder força: pare AGORA, em local seguro, e desligue. Cada minuto rodando superaquecido é junta de cabeçote se despedindo: o conserto sai dez vezes o preço do guincho.", "!! If the needle hits the red, steam rises from the hood or the engine loses power: stop NOW, somewhere safe, and shut it off. Every minute running overheated is the head gasket saying goodbye, the repair costs ten times the tow."),
      T("## Parado: o que NÃO fazer", "## Stopped: what NOT to do"),
      T("!! Não abra a tampa do radiador ou do reservatório com o motor quente: o sistema está pressurizado e a água sai fervendo em jato. Espere esfriar: 30 minutos, no mínimo. E não jogue água fria no bloco quente: choque térmico trinca metal.", "!! Don't open the radiator or reservoir cap while hot: the system is pressurized and the coolant exits as a boiling jet. Wait for it to cool: 30 minutes minimum. And don't pour cold water on a hot block: thermal shock cracks metal."),
      T("## Frio: o diagnóstico rápido", "## Cool: the quick diagnosis"),
      T("Nível do reservatório, mangueiras (estouradas, moles ou vazando), correia da bomba d'água e o ventilador (deve ligar com o motor quente). Nível baixo sem vazamento visível, ou baixando sempre, pede oficina: [[diag-leaks|as manchas no chão]] ajudam a identificar o fluido.", "Reservoir level, hoses (burst, soft or leaking), the water-pump belt and the fan (it must kick in when hot). A low level with no visible leak, or one that keeps dropping, needs a shop: [[diag-leaks|the stains on the ground]] help identify the fluid."),
      T(">> Voltar a rodar \"só até em casa\" com o nível baixo é a aposta mais cara do automobilismo amador. Complete com o fluido correto (ou água desmineralizada em emergência, trocando depois) e trate a causa. Cheiro adocicado na cabine é anticongelante vazando. Ver [[diag-smells|cheiros e fumaça]].", ">> Driving \"just home\" on a low level is amateur motoring's most expensive bet. Top up with the correct coolant (or demineralized water in an emergency, flushing later) and fix the cause. A sweet smell in the cabin is leaking coolant. See [[diag-smells|smells and smoke]]."),
    ]}),
    art({ id: "diag-vibracao", track: "diagnosis", system: "suspension", addedAt: "2026-08-20", thumb: "/learn/diag-vibracao.png",
      title: T("Vibração: a velocidade em que ela aparece diz a causa", "Vibration: the speed where it appears names the cause"), related: ["diag-noises", "tire-calibragem", "money-quote"], body: [
      T("Vibração é dos sintomas mais fáceis de diagnosticar em casa, porque ela entrega a causa pela VELOCIDADE em que aparece e pelo LUGAR onde você a sente. Antes da oficina, colete esses dois dados.", "Vibration is one of the easiest symptoms to pre-diagnose at home, because it betrays its cause through the SPEED where it appears and the PLACE you feel it. Before the shop, collect those two facts."),
      T("## Entre 80 e 110 km/h, no volante", "## Between 80 and 110 km/h, in the wheel"),
      T("A assinatura clássica de RODA DESBALANCEADA. Aparece numa faixa estreita de velocidade, some acima e abaixo dela. Balanceamento é serviço barato, e é a primeira aposta. Se o carro também \"puxa\" para um lado, alinhamento junto.", "The classic signature of an UNBALANCED WHEEL. It shows in a narrow speed band and fades above and below it. Balancing is cheap, and it's the first bet. If the car also pulls to one side, add an alignment."),
      T("## Ao frear, no pedal ou no volante", "## Under braking, in the pedal or wheel"),
      T("Disco de freio empenado ou com desgaste irregular. A vibração só existe com o pé no freio e cresce com a velocidade. É item de segurança: não adie, o caminho está em [[brake-pads|trocar a pastilha de freio]] e no diagnóstico de [[diag-noises|barulhos]].", "A warped or unevenly worn brake disc. The vibration only exists with your foot on the brake and grows with speed. It's a safety item: don't postpone, the path is in [[brake-pads|replacing brake pads]] and the [[diag-noises|noise guide]]."),
      T("## Em marcha lenta, parado", "## At idle, standing still"),
      T("Motor tremendo parado é outro assunto: coxins de motor cansados, falha de combustão ou marcha lenta irregular. Se acompanha luz piscando, é falha de combustão: [[vid-luz-injecao-acendeu|reduza e pare]]. Num 3 cilindros, um leve tremor parado é característica: [[vid-tres-cilindros|entenda o porquê]].", "An engine shaking at a standstill is another subject: tired engine mounts, a misfire or rough idle. With a flashing light, it's a misfire: [[vid-luz-injecao-acendeu|slow down and stop]]. On a 3-cylinder, a slight idle shimmy is character: [[vid-tres-cilindros|here's why]]."),
      T("## Ao acelerar, embaixo do carro", "## Under acceleration, beneath the car"),
      T("Vibração que cresce com a aceleração e vem do assoalho aponta para transmissão: junta homocinética (estala em curva?) ou cardã. Sentiu estalo ao esterçar, a homocinética é a suspeita número um.", "Vibration that grows with acceleration and comes through the floor points to the driveline: a CV joint (does it click in turns?) or the driveshaft. If it clicks on full lock, the CV joint is suspect number one."),
      T(">> Leve esses dois dados para a oficina, \"vibra a 100 no volante\" ou \"vibra só freando\", e você corta o tempo de diagnóstico pela metade, além de conseguir conferir se o orçamento conversa com o sintoma: [[money-quote|ler um orçamento e evitar golpes]].", ">> Bring those two facts to the shop, \"vibrates at 100 in the wheel\" or \"only under braking\", and you halve the diagnosis time, plus you can check whether the quote matches the symptom: [[money-quote|reading a quote and avoiding scams]]."),
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

  // ---- Trilhas guiadas (cursos) --------------------------------------------
  //
  // Diferente das categorias acima (filtros de navegação livre), uma trilha é
  // um CURSO: ordem do simples ao difícil, objetivo declarado e progresso
  // visível ("3 de 7"). O progresso vem de `seenLessons` ∩ `order` — nenhum
  // estado novo, e o que já sincroniza na nuvem continua valendo.
  //
  // `order` só pode citar aulas que existem no catálogo; a tela ignora ids
  // desconhecidos (uma trilha remota nova não pode quebrar num app antigo).
  // A ordem é sugerida, nunca trancada: quem quer pular, pula.
  type Course = {
    id: string;
    icon: string;
    title: string;
    goal: string;
    level: "iniciante" | "intermediario" | "avancado";
    order: string[];
    // Mesmo vocabulário de traits.ts: a trilha certa aparece primeiro para o
    // dono certo (turbo → "Motor turbo") sem o usuário procurar.
    traits?: string[];
    situations?: string[];
  };
  const courses: Course[] = [
    {
      id: "course-first30", icon: "car", level: "iniciante",
      title: T("Primeiros 30 dias", "First 30 days"),
      goal: T("Acabou de pegar o carro? Saia do zero: sistemas, painel, fluidos e o histórico que valoriza o veículo.", "Just got the car? Start from zero: systems, dashboard, fluids and the history that adds value."),
      situations: ["justBought"],
      order: ["fund-systems", "fund-dashboard", "fund-fluids", "basics", "sit-just-bought", "fund-calendar", "sit-no-history"],
    },
    {
      id: "course-signals", icon: "diagnose", level: "iniciante",
      title: T("O que o carro diz", "What the car is telling you"),
      goal: T("Diagnóstico pelos sentidos — som, cheiro, mancha no chão — e a luz de injeção explicada antes do scanner.", "Diagnosis by the senses — sound, smell, stains — and the check-engine light explained before the scanner."),
      order: ["diag-noises", "diag-smells", "diag-leaks", "vid-luz-injecao-como-funciona", "vid-luz-injecao-acendeu", "read-obd2", "obd2-scan", "diag-superaquecimento", "diag-vibracao", "trait-highkm"],
    },
    {
      id: "course-diy", icon: "tools", level: "intermediario",
      title: T("Faça você mesmo", "Do it yourself"),
      goal: T("Os cinco serviços que você faz em casa, em ordem de dificuldade — da palheta à pastilha de freio.", "The five jobs you can do at home, in order of difficulty — wipers to brake pads."),
      order: ["diy-wipers", "diy-airfilter", "diy-battery", "oil-change", "brake-pads"],
    },
    {
      id: "course-fuel", icon: "gauge", level: "iniciante",
      title: T("Combustível e consumo", "Fuel and mileage"),
      goal: T("Da conta etanol × gasolina ao E30/E32 e aos hábitos que fazem o tanque render.", "From the ethanol × gasoline math to E30/E32 and the habits that stretch a tank."),
      order: ["vid-etanol-gasolina", "fuel-compare", "vid-gasolina-e30", "vid-e32", "money-fuel", "trait-urban"],
    },
    {
      id: "course-engine", icon: "engine", level: "intermediario",
      title: T("Motor por dentro", "Inside the engine"),
      goal: T("O vocabulário do motor: cilindrada, 3 cilindros, siglas TSI, altitude e diesel.", "Engine vocabulary: displacement, 3-cylinder shake, TSI badges, altitude and diesel."),
      order: ["vid-cilindrada", "vid-tres-cilindros", "vid-tsi", "vid-altitude", "vid-diesel-disparando", "trait-diesel"],
      traits: ["diesel"],
    },
    {
      id: "course-turbo", icon: "spark", level: "avancado",
      title: T("Motor turbo, do zero", "Turbo engines, from zero"),
      goal: T("Do \"o que muda num turbo\" ao barulho de pomba — e os cuidados que dobram a vida dele.", "From \"what changes with a turbo\" to the flutter noise — and the habits that double its life."),
      traits: ["turbo"],
      order: ["vid-turbo-aspirado", "vid-turbo-pressao", "vid-turbo-fabrica", "vid-flutter", "trait-turbo"],
    },
    {
      id: "course-gearbox", icon: "settings", level: "intermediario",
      title: T("Câmbio automático", "Automatic gearboxes"),
      goal: T("CVT, dupla embreagem e automatizado: o que cada um estranha, o que destrói e o que é normal.", "CVT, dual-clutch and automated manual: what each one does, what kills it and what's normal."),
      traits: ["cvt", "dct", "amt"],
      order: ["gearbox-tipos", "trait-cvt", "sport-dct", "trait-dct", "gearbox-fluido", "gearbox-sintomas"],
    },
    {
      id: "course-tires", icon: "track", level: "iniciante",
      title: T("Pneus e rodas", "Tires and wheels"),
      goal: T("Ler a medida, entender os índices e cuidar do único ponto do carro que toca o chão.", "Read the size, understand the ratings and care for the only part touching the road."),
      order: ["vid-pneu-medidas", "vid-pneu-indices", "tire-care", "tire-calibragem"],
    },
    {
      id: "course-buy", icon: "check", level: "intermediario",
      title: T("Comprar bem", "Buying smart"),
      goal: T("O que olhar antes do preço, o checklist do usado, o orçamento sem golpe e a decisão consertar × trocar.", "What to inspect before the price, the used-car checklist, honest quotes and the fix × replace call."),
      order: ["vid-comprar-usado", "money-used", "money-quote", "money-repair-replace", "sit-no-history"],
    },
    {
      id: "course-prep", icon: "track", level: "avancado",
      title: T("Preparação sem besteira", "Tuning without the nonsense"),
      goal: T("Nove vídeos em sequência: da marcha lenta preparada ao óxido nitroso, passando pelos erros clássicos.", "Nine videos in sequence: from the lopey idle to nitrous, through the classic mistakes."),
      order: ["vid-marcha-lenta-preparado", "vid-avanco-ignicao", "vid-balanceamento-motor", "vid-ressonador", "vid-cortar-molas", "vid-roda-grande-1000", "vid-nitro", "vid-turbo-nitro", "vid-oxido-nitroso"],
    },
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
  const equipment: { section: string; items: { id: string; emoji: string; name: string; use: string; essential?: boolean; star?: boolean }[] }[] = [
    {
      section: T("Emergência no carro (leve sempre)", "Car emergency (always carry)"),
      items: [
        { id: "spare-kit", emoji: "🛞", name: T("Estepe, macaco e chave de roda", "Spare, jack and lug wrench"), use: T("Trocar um pneu furado na estrada.", "Change a flat tire on the road."), essential: true },
        { id: "triangle", emoji: "🔺", name: T("Triângulo de sinalização", "Warning triangle"), use: T("Sinalizar o carro parado — obrigatório por lei.", "Signal a stopped car — required by law."), essential: true },
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
        { id: "obd2", emoji: "🔌", name: T("Scanner OBD2", "OBD2 scanner"), use: T("A 'chave' do painel: plugue na entrada OBD2 (embaixo do volante) e leia os códigos de erro — descubra o que a luz acesa significa. Há versões Bluetooth que ligam num app no celular.", "The dashboard 'key': plug into the OBD2 port (under the wheel) and read the fault codes — find out what a warning light means. Bluetooth versions pair with a phone app."), star: true },
        { id: "multimeter", emoji: "🔧", name: T("Multímetro", "Multimeter"), use: T("Testar bateria, alternador, fusíveis e fiação.", "Test the battery, alternator, fuses and wiring.") },
        { id: "oilgauge", emoji: "🌡️", name: T("Medidor de pressão de óleo", "Oil pressure gauge"), use: T("Confirmar a pressão do óleo do motor.", "Confirm the engine's oil pressure.") },
      ],
    },
    {
      section: T("Ferramentas de garagem", "Garage tools"),
      items: [
        { id: "sockets", emoji: "🧰", name: T("Jogo de chaves e soquetes", "Wrench & socket set"), use: T("A base de quase todo reparo.", "The foundation of almost any repair."), essential: true },
        { id: "pliers", emoji: "🗜️", name: T("Alicate (universal e de bico)", "Pliers (combination and needle-nose)"), use: T("Segurar, cortar e dobrar — mil usos.", "Grip, cut and bend — a thousand uses.") },
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
        T("Encaixe o macaco no ponto de apoio indicado no manual — uma marca reforçada na lateral, perto da roda. Gire a manivela até o pneu furado sair do chão.", "Fit the jack at the lift point shown in the manual — a reinforced mark on the sill near the wheel. Crank until the flat tire is off the ground."),
        T("Termine de soltar os parafusos (guarde todos juntos) e puxe a roda com as duas mãos.", "Finish removing the bolts (keep them together) and pull the wheel off with both hands."),
        T("Encaixe o estepe, rosqueie os parafusos com a mão em ordem de cruz (um oposto ao outro), desça o carro e dê o aperto final com a chave, também em cruz.", "Fit the spare, hand-thread the bolts in a criss-cross order, lower the car and do the final tightening with the wrench, also criss-cross."),
        T("No primeiro posto, calibre o estepe (estepes finos costumam pedir mais pressão — veja o manual) e conserte o pneu furado o quanto antes.", "At the first gas station, inflate the spare (temporary spares often need higher pressure — check the manual) and repair the flat as soon as possible."),
      ],
      safety: [
        T("Nunca coloque qualquer parte do corpo embaixo do carro apoiado só no macaco.", "Never put any part of your body under a car held only by the jack."),
        T("Estepe temporário (fino) tem limite de velocidade — geralmente 80 km/h.", "Temporary (skinny) spares have a speed limit — usually 80 km/h (50 mph)."),
      ],
    },
    triangle: {
      steps: [
        T("Ligue o pisca-alerta assim que parar o carro.", "Turn on the hazard lights as soon as you stop."),
        T("Monte o triângulo e posicione-o atrás do carro, na mesma faixa em que ele está.", "Assemble the triangle and place it behind the car, in the same lane."),
        T("Distância: em via urbana, uns 30 m (~40 passos largos); em rodovia, 80 m ou mais (~100 passos). Quanto mais rápida a via, mais longe.", "Distance: in the city, about 30 m (~40 big steps); on a highway, 80 m or more (~100 steps). The faster the road, the farther away."),
        T("Se parou depois de uma curva ou lombada, posicione o triângulo ANTES dela — quem vem precisa ser avisado antes de te ver.", "If you stopped past a curve or crest, place the triangle BEFORE it — drivers need the warning before they can see you."),
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
        T("Bateria estufada ou vazando: não tente a chupeta — chame socorro.", "Swollen or leaking battery: don't attempt a jump — call for help."),
      ],
    },
    inflator: {
      steps: [
        T("Descubra a pressão certa na etiqueta da coluna da porta do motorista ou na tampa do tanque (ex.: 32 psi). Não use a pressão escrita no pneu — aquele é o máximo.", "Find the right pressure on the driver's door jamb sticker or fuel flap (e.g. 32 psi). Don't use the number on the tire — that's the maximum."),
        T("Calibre com o pneu frio (menos de ~2 km rodados). Pneu quente marca pressão maior e engana.", "Check with cold tires (less than ~2 km driven). Warm tires read higher and mislead."),
        T("Desrosqueie a tampinha da válvula e encaixe o bico firme, sem vazar ar. Leia a pressão atual.", "Unscrew the valve cap and press the chuck on firmly, without hissing. Read the current pressure."),
        T("Ligue o compressor na tomada 12V do carro e encha até a pressão da etiqueta. Confira de novo e recoloque a tampinha.", "Plug the inflator into the car's 12V socket and fill to the sticker pressure. Re-check and refit the cap."),
        T("Uma vez por mês, confira também o estepe — furo com estepe vazio é furo em dobro.", "Once a month, check the spare too — a flat spare doubles the trouble."),
      ],
      safety: [T("Não ultrapasse muito a pressão indicada; excesso desgasta o centro do pneu e piora a aderência.", "Don't overshoot the indicated pressure; excess wears the tire's center and hurts grip.")],
    },
    flashlight: {
      steps: [
        T("Guarde sempre no mesmo lugar (porta-luvas ou porta-malas) — emergência não dá tempo de procurar.", "Keep it always in the same place (glovebox or trunk) — emergencies leave no time to search."),
        T("Prefira LED, recarregável por USB ou com um jogo de pilhas reserva junto.", "Prefer LED, USB-rechargeable or with a spare set of batteries next to it."),
        T("Muitos modelos têm modo piscante — serve como sinalização extra à noite.", "Many models have a strobe mode — extra signaling at night."),
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
      safety: [T("Câmbio automático: confira o manual antes — muitos não podem ser rebocados com as rodas de tração no chão.", "Automatic gearbox: check the manual first — many can't be towed with the drive wheels on the ground.")],
    },
    obd2: {
      steps: [
        T("Localize a porta OBD2: embaixo do painel, do lado do motorista (às vezes atrás de uma tampinha).", "Find the OBD2 port: under the dash on the driver's side (sometimes behind a small cover)."),
        T("Com o carro desligado, encaixe o scanner na porta.", "With the car off, plug the scanner into the port."),
        T("Ligue a ignição sem dar partida. No scanner Bluetooth, abra o app (Car Scanner, Torque…) e pareie.", "Turn the ignition on without starting. For Bluetooth scanners, open the app (Car Scanner, Torque…) and pair."),
        T("Toque em 'Ler códigos' e anote o que aparecer (ex.: P0301).", "Tap 'Read codes' and note what comes up (e.g. P0301)."),
        T("Consulte o significado na nossa página Códigos OBD2 (aba Problemas).", "Look up each code on our OBD2 codes page (Problems tab)."),
        T("Só use 'Apagar códigos' DEPOIS de resolver a causa — apagar não conserta, e some com a pista.", "Only 'Clear codes' AFTER fixing the cause — clearing doesn't repair, and erases the trail."),
      ],
      safety: [T("Luz da injeção PISCANDO = falha ativa grave. Pare o quanto antes.", "FLASHING check-engine light = active serious fault. Stop as soon as possible.")],
    },
    multimeter: {
      steps: [
        T("Teste da bateria: gire o seletor para tensão contínua (V⎓ ou DCV), escala 20V.", "Battery test: set the dial to DC volts (V⎓ or DCV), 20V range."),
        T("Ponta vermelha no polo + da bateria, ponta preta no –.", "Red probe on the battery's + post, black on –."),
        T("Carro desligado: 12,4–12,7V = bateria boa; abaixo de 12V = descarregada ou no fim da vida.", "Car off: 12.4–12.7V = healthy; below 12V = discharged or dying."),
        T("Carro ligado: 13,5–14,7V = alternador carregando; fora dessa faixa, revise o alternador.", "Car running: 13.5–14.7V = alternator charging; outside that range, have the alternator checked."),
        T("Fusível: modo continuidade (símbolo de som). Encoste uma ponta em cada lado — apitou, o fusível está bom.", "Fuse: continuity mode (sound symbol). Touch each end — a beep means the fuse is good."),
      ],
      safety: [T("Não meça corrente (A) sem saber o que está fazendo — queima o aparelho e pode causar curto.", "Don't measure current (A) unless you know what you're doing — it can fry the meter and cause a short.")],
    },
    oilgauge: {
      steps: [
        T("Uso mais avançado: o medidor entra no lugar do sensor de pressão de óleo do motor (rosqueado no bloco).", "More advanced use: the gauge screws into the engine block in place of the oil pressure sensor."),
        T("Com o motor na temperatura normal, compare a leitura em marcha lenta e a ~2.000 rpm com a faixa do manual.", "With the engine at normal temperature, compare the reading at idle and ~2,000 rpm with the manual's range."),
        T("Pressão baixa com nível de óleo correto = investigar bomba de óleo ou folgas internas — caso de oficina.", "Low pressure with correct oil level = oil pump or internal wear to investigate — shop territory."),
        T("Se não se sentir seguro, peça o teste numa oficina: é rápido e barato.", "If unsure, ask a shop to run the test: it's quick and cheap."),
      ],
      safety: [T("Motor e óleo quentes queimam — espere esfriar antes de mexer.", "Hot engine and oil burn — let it cool before working.")],
    },
    sockets: {
      steps: [
        T("Use o soquete do tamanho EXATO do parafuso (em mm). Folgado, ele espana a cabeça.", "Use the EXACT socket size for the bolt (in mm). A loose fit rounds the head."),
        T("Na catraca, a alavanca/trava define o sentido: aperto ou solto. Encaixe fundo e gire com firmeza.", "On the ratchet, the switch sets the direction: tighten or loosen. Seat it fully and turn firmly."),
        T("Parafuso travado: use uma extensão para ganhar alavanca, ou aplique desengripante e espere 10–15 minutos.", "Stuck bolt: use an extension for leverage, or apply penetrating oil and wait 10–15 minutes."),
        T("Guarde cada soquete no seu lugar na maleta — é o que evita perder as medidas mais usadas.", "Return each socket to its slot in the case — that's how you avoid losing the most-used sizes."),
      ],
      safety: [T("Prefira EMPURRAR a chave (mão aberta) a puxá-la — se escapar, machuca menos.", "Prefer PUSHING the wrench (open palm) over pulling — if it slips, you get hurt less.")],
    },
    pliers: {
      steps: [
        T("Alicate universal: segurar, dobrar e cortar (o corte fica na base das mandíbulas).", "Combination pliers: grip, bend and cut (the cutter is at the base of the jaws)."),
        T("Alicate de bico: lugares apertados, presilhas, molas pequenas e conectores.", "Needle-nose: tight spots, clips, small springs and connectors."),
        T("Conector elétrico: puxe sempre pelo CONECTOR, nunca pelo fio — fio arrebentado por dentro é defeito difícil de achar.", "Electrical connector: always pull the CONNECTOR, never the wire — a wire broken inside is a hard fault to find."),
      ],
      safety: [T("Mexendo em fiação: desconecte o polo negativo da bateria antes.", "Working on wiring: disconnect the battery's negative terminal first.")],
    },
    screwdrivers: {
      steps: [
        T("Escolha a ponta do tamanho exato da fenda do parafuso — ponta menor ou maior espana.", "Match the tip exactly to the screw head — too small or too big strips it."),
        T("Pressione firme PARA DENTRO enquanto gira, principalmente em parafuso Phillips.", "Press firmly INWARD while turning, especially with Phillips screws."),
        T("Presilhas plásticas de acabamento: alavanca suave; o ideal é uma espátula plástica pra não marcar o painel.", "Plastic trim clips: gentle prying; a plastic trim tool is ideal to avoid marking panels."),
      ],
      safety: [T("Chave de fenda não é talhadeira nem alavanca pesada — a ponta quebra e voa.", "A screwdriver is not a chisel or a crowbar — the tip can snap and fly.")],
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
        T("Aperte em ordem de cruz até sentir/ouvir o 'clique' — e PARE aí. Continuar passa do torque.", "Tighten in a criss-cross order until you feel/hear the 'click' — and STOP there. Going on over-torques."),
        T("Depois de usar, volte o ajuste para o mínimo da escala — preserva a mola calibrada.", "After use, wind the setting back to the scale's minimum — it preserves the calibrated spring."),
      ],
      safety: [T("Torquímetro é só para APERTAR — soltar parafuso com ele descalibra a ferramenta.", "A torque wrench is for TIGHTENING only — loosening with it ruins the calibration.")],
    },
    drainpan: {
      steps: [
        T("Posicione a bacia sob o bujão ANTES de soltá-lo — e um pouco deslocada na direção do jato, que sai forte no começo.", "Place the pan under the drain plug BEFORE loosening it — slightly offset toward the stream, which shoots out at first."),
        T("Deixe escorrer todo o óleo (5–10 minutos).", "Let all the oil drain (5–10 minutes)."),
        T("Transfira o óleo usado para um recipiente que feche bem — a própria embalagem do óleo novo serve.", "Transfer the used oil to a sealable container — the new oil's bottle works."),
        T("Entregue num ponto de coleta (postos e autopeças recebem). Nunca no ralo, na terra ou no lixo comum.", "Drop it at a collection point (gas stations and parts stores take it). Never down the drain, on soil or in regular trash."),
      ],
      safety: [T("Óleo usado é contaminante e irrita a pele — use luvas.", "Used oil is a contaminant and skin irritant — wear gloves.")],
    },
    spareoil: {
      steps: [
        T("Use o MESMO tipo e viscosidade do óleo que está no motor (ex.: 5W30 sintético) — confira o manual ou a etiqueta da última troca.", "Use the SAME type and viscosity as the oil in the engine (e.g. 5W30 synthetic) — check the manual or the last-change sticker."),
        T("Cheque o nível com o carro frio e em piso plano: tire a vareta, limpe, insira de novo, tire e leia — o óleo deve estar entre MIN e MAX.", "Check the level with the car cold and level: pull the dipstick, wipe, reinsert, pull and read — oil should sit between MIN and MAX."),
        T("Faltando, complete AOS POUCOS pela tampa de óleo (meio copo por vez), conferindo a vareta a cada adição.", "If low, top up LITTLE BY LITTLE through the filler cap (half a cup at a time), re-checking the dipstick each time."),
        T("Não passe do MAX — óleo demais também danifica o motor.", "Don't go past MAX — too much oil also damages the engine."),
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
      safety: [T("NUNCA abra a tampa do radiador/reservatório com o motor quente — o jato ferve e causa queimaduras graves.", "NEVER open the radiator/reservoir cap on a hot engine — the boiling spray causes serious burns.")],
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
        T("Mangueira furada (emergência): seque bem, enrole a fita ESTICANDO, com várias voltas sobrepostas — e vá direto à oficina.", "Leaking hose (emergency): dry it well, wrap the tape STRETCHED with several overlapping turns — then head straight to a shop."),
        T("Fio desencapado: desconecte o negativo da bateria, enrole cobrindo bem além do trecho danificado.", "Exposed wire: disconnect the battery negative, wrap well past the damaged section."),
        T("Abraçadeiras: prenda fiação solta e acabamentos que vibram até o reparo definitivo.", "Zip ties: secure loose wiring and rattling trim until the proper repair."),
      ],
      safety: [T("São reparos PROVISÓRIOS — providencie o conserto definitivo logo.", "These are TEMPORARY fixes — get the proper repair done soon.")],
    },
    gloves: {
      steps: [
        T("Luvas nitrílicas descartáveis para óleo e graxa; luva de vaqueta para peças quentes ou pesadas.", "Disposable nitrile gloves for oil and grease; leather gloves for hot or heavy parts."),
        T("Pano de microfibra para acabamento e vidros; pano de algodão para graxa pesada.", "Microfiber cloth for trim and glass; cotton rags for heavy grease."),
        T("Pano sujo de óleo ou solvente: guarde em recipiente fechado ou descarte — amontoado, pode entrar em combustão espontânea.", "Rags soaked in oil or solvent: store in a closed container or discard — piled up, they can self-combust."),
      ],
      safety: [T("Tire anéis, pulseiras e relógio antes de mexer no motor.", "Remove rings, bracelets and watches before working on the engine.")],
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
    equipmentHowTo,
    studyTracks,
    courses,
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
      history: T("Calendário", "Calendar"),
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
      heroSkipEmpty: T("Explorar sem cadastrar →", "Explore without adding a car →"),
      heroTitle: T("O que vamos cuidar hoje?", "What shall we care for today?"),
      heroCta: T("Diagnosticar um problema", "Diagnose a problem"),
      searchPh: T("Buscar problemas ou serviços", "Search problems or services"),
      premiumTitle: T("Teste o Premium grátis", "Try Premium free"),
      premiumSub: T("Toque para começar", "Tap to start"),
      updateTitle: T("Versão nova disponível", "New version available"),
      updateSub: T("Atualize para receber as melhorias", "Update to get the latest improvements"),
      updateCta: T("Atualizar", "Update"),
      quickTitle: T("Ações rápidas", "Quick actions"),
      qDiagnose: T("Diagnosticar", "Diagnose"),
      qService: T("Registrar serviço", "Log service"),
      qRevisions: T("Plano de revisão", "Service plan"),
      qStudies: T("Aprender", "Learn"),
      yourCar: T("Seu carro", "Your car"),
      viewCar: T("Abrir", "Open"),
      forYouTitle: T("Para você", "For you"),
      newBadge: T("Novo", "New"),
      pinnedTitle: T("Fixados", "Pinned"),
      revisionsCard: T("Próximas revisões", "Upcoming service"),
      completeCarCard: T("Complete os dados do carro", "Finish your car's info"),
      completeCarWhy: T("Faltam dados para revisões precisas", "Missing data for a precise service plan"),
      forYouSub: T("Baseado no seu nível e no seu carro", "Based on your level and your car"),
      memoriesTitle: T("Memórias", "Memories"),
      seeAll: T("Ver todas", "See all"),
      addMemories: T("Adicionar memórias", "Add memories"),
      addMemoriesSub: T("Registre os momentos que viveu com o carro", "Log the moments you've lived with your car"),
    },

    // Anúncios (somente usuários free) — house ads até plugar a rede
    ads: {
      badge: T("Anúncio", "Ad"),
      rewardedHint: T("Assista para continuar", "Watch to continue"),
      closeIn: T("Fechar em {s}s", "Close in {s}s"),
      rewardIn: T("Liberando em {s}s…", "Unlocking in {s}s…"),
      unlocked: T("Liberado! 🎉", "Unlocked! 🎉"),
      cont: T("Continuar", "Continue"),
      houseTitle: T("Cansado de anúncios?", "Tired of ads?"),
      houseBody: T("Assine o Premium e use o Mentorque sem interrupções — com o Biela ilimitado e todos os recursos.", "Go Premium and use Mentorque without interruptions — with unlimited Biela and every feature."),
      houseCta: T("Conhecer o Premium", "See Premium"),
    },

    // Tela de retorno (app volta do segundo plano sem carro cadastrado)
    welcomeBack: {
      title: T("Adicione seu primeiro carro à garagem", "Add your first car to the garage"),
      sub: T("Falta pouco pra começar: cadastre seu carro e eu te ajudo a cuidar dele.", "You're almost there: add your car and I'll help you care for it."),
      bullets: [
        { icon: "diagnose", label: T("Diagnóstico rápido de problemas", "Fast problem diagnosis") },
        { icon: "calendar", label: T("Plano de revisão personalizado", "Personalized service plan") },
        { icon: "clock", label: T("Histórico completo do seu carro", "Your car's full history") },
      ],
      cta: T("Cadastrar meu carro", "Add my car"),
      later: T("Faço isso depois", "I'll do it later"),
    },

    // Tela de busca (aberta pela barra da Home)
    search: {
      ph: T("Buscar problemas ou serviços", "Search problems or services"),
      title: T("Buscar no catálogo", "Search the catalog"),
      hint: T("Digite pelo menos 2 caracteres para encontrar problemas e serviços.", "Type at least 2 characters to find problems and services."),
      empty: T("Não achamos esse assunto. Pergunte à Biela 👇", "We couldn't find that. Ask Biela 👇"),
      askBiela: T("Perguntar à Biela sobre “{q}”", "Ask Biela about “{q}”"),
      problemTag: T("Problema", "Problem"),
      serviceTag: T("Serviço", "Service"),
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
      // Página 4 — prova social
      social: {
        title: T("Amado por motoristas de todo o Brasil", "Loved by drivers everywhere"),
        sub: T("Avaliações e histórias reais", "Real reviews and stories"),
        rating: "4,8",
        ratingNote: T("média das avaliações", "average rating"),
        stat1: "10.000+",
        stat1Label: T("diagnósticos feitos", "diagnoses run"),
        stat2: "5.000+",
        stat2Label: T("motoristas", "drivers"),
        quotes: [
          { quote: T("Descobri o problema do meu carro em minutos. Finalmente sei o que pedir na oficina.", "Found my car's problem in minutes. Finally I know what to ask the shop."), name: "Marina S." },
          { quote: T("O diagnóstico me salvou de pagar um orçamento absurdo. Apontou o problema e o preço justo.", "The diagnosis saved me from an absurd quote. It showed the problem and the fair price."), name: "Carlos E." },
          { quote: T("Os lembretes de revisão mudaram tudo. Não perco mais nenhuma manutenção.", "Service reminders changed everything. I never miss maintenance now."), name: "Juliana M." },
          { quote: T("O melhor app de carro que já usei. O histórico e o Biela são certeiros.", "Best car app I've used. The history and Biela are spot on."), name: "Patrícia L." },
        ],
      },
      // Página 5 — monte seu teste
      trial: {
        notNow: T("Agora não", "Not now"),
        title: T("Monte seu teste", "Build your trial"),
        bullets: [
          T("Aproveite seus primeiros {n} dias, grátis", "Enjoy your first {n} days, free"),
          T("Cancele quando quiser pelo app", "Cancel anytime in the app"),
          T("Diagnóstico rápido e soluções na hora", "Fast diagnosis, instant solutions"),
          T("Informações detalhadas e confiáveis", "Detailed, reliable information"),
        ],
        freeLabel: T("Grátis", "Free"),
        freeDays: T("{n} dias", "{n} days"),
        monthlyLabel: T("1 mês", "1 month"),
        monthlyPrice: "R$ 29,90",
        fineAnnual: T("{n} dias grátis, depois R$ 239,90/ano (R$ 19,99/mês)", "{n} days free, then R$ 239.90/yr (R$ 19.99/mo)"),
        fineMonthly: T("R$ 29,90/mês, cancele quando quiser", "R$ 29.90/mo, cancel anytime"),
        // Versão com o preço em destaque (formato Bloom)
        finePrefix: T("{n} dias grátis, depois", "{n} days free, then"),
        finePrice: "R$ 239,90",
        fineSuffix: T("/ano (R$ 19,99/mês)", "/yr (R$ 19.99/mo)"),
        fineMonthlyPrice: "R$ 29,90",
        fineMonthlySuffix: T("/mês, cancele quando quiser", "/mo, cancel anytime"),
        cta: T("Continuar", "Continue"),
      },
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
      soldSection: T("Carros que já tive", "Cars I used to have"),
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
        history: T("Calendário do carro", "Car calendar"),
        historySub: T("O que já foi feito e o que vem", "What's done and what's next"),
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
      titleNoCar: T("Devemos ir para a oficina?", "Should we go to the shop?"),
      searchPh: T("Descreva o problema (ex: barulho ao frear, luz do motor)", "Describe the problem (e.g. noise when braking, engine light)"),
      none: T("Nenhum sintoma encontrado.", "No symptoms found."),
      browseBySystem: T("Ou explore por sistema", "Or browse by system"),
      common: T("Sintomas comuns", "Common symptoms"),
      commonTitle: T("Problemas comuns", "Common problems"),
      commonSubCar: T("Os que mais aparecem no seu {car} e em carros em geral", "Most common on your {car} and cars in general"),
      commonSubCars: T("Os que mais aparecem nos seus carros e em geral", "Most common on your cars and in general"),
      commonSub: T("Os problemas que mais aparecem nos carros", "The problems that show up most on cars"),
      systemProblems: T("Problemas de {system}", "{system} problems"),
      notListed: T("Não é nenhum desses?", "None of these?"),
      askBielaAbout: T("Perguntar ao Biela sobre isso", "Ask Biela about it"),
      askBielaQ: T("Perguntar ao Biela sobre \"{q}\"", "Ask Biela about \"{q}\""),
      talkToBiela: T("Falar com o Biela", "Talk to Biela"),
      anamneseTitle: T("Antes do diagnóstico, me conta:", "Before the diagnosis, tell me:"),
      anamneseSub: T("Responda pra afinar o diagnóstico do Biela.", "Answer to sharpen Biela's diagnosis."),
      yes: T("Sim", "Yes"),
      no: T("Não", "No"),
      diagnoseWithBiela: T("Aprofundar diagnóstico com o Biela", "Deepen the diagnosis with Biela"),
      detailIntro: T("Veja o que pode ser, a urgência e quanto deve custar — e chegue na oficina sabendo o que pedir.", "See what it could be, how urgent it is and what it should cost — and walk into the shop knowing what to ask."),
      causes: T("Possíveis causas", "Possible causes"),
      urgency: T("Nível de urgência", "Urgency level"),
      price: T("Faixa de preço estimada", "Estimated price range"),
      priceNote: T("varia por região e oficina", "varies by region and shop"),
      regionSet: T("Informar minha região", "Set my region"),
      regionEdit: T("editar", "edit"),
      regionFor: T("Faixa ajustada para {r}", "Range adjusted for {r}"),
      regionForState: T("Faixa ajustada pela média de {r}", "Range adjusted to the {r} average"),
      regionTitle: T("Sua região", "Your region"),
      regionSub: T("Cidades grandes têm faixa de preço própria; nas demais usamos a média do estado.", "Big cities get their own price band; elsewhere we use the state average."),
      regionState: T("Estado", "State"),
      regionStatePh: T("Selecione o estado", "Select the state"),
      regionCity: T("Cidade", "City"),
      regionCityPh: T("ex.: Campinas", "e.g. Campinas"),
      regionSave: T("Salvar região", "Save region"),
      observe: T("O que observar", "What to look for"),
      genChecklist: T("Itens principais a serem avaliados pela oficina", "Key items the shop should assess"),
      knowIt: T("Já sei o que é", "I know what it is"),
      recoNudge: T("Assine o Premium para ver recomendações personalizadas para o seu carro.", "Subscribe to see personalized recommendations for your car."),
      detailedPrice: T("Preço detalhado por peça", "Detailed price per part"),
      km80: T("80.000 km", "80,000 km"),
    },

    // 2.2.E — Códigos OBD2
    fuelCompare: {
      title: T("Etanol ou Gasolina?", "Ethanol or Gasoline?"),
      forCar: T("Cálculo para o seu {car}", "Calculated for your {car}"),
      noCar: T("Cadastre seu carro para um cálculo mais preciso — por enquanto, usamos valores médios.", "Add your car for a more precise result — for now we use average values."),
      intro: T(
        "A famosa \"regra dos 70%\" é só o ponto de partida: o número certo depende do rendimento do SEU carro e do SEU motor. Preencha os preços do posto e a gente faz a conta certa.",
        "The famous \"70% rule\" is just a starting point: the right number depends on YOUR car's mileage and engine. Enter the pump prices and we'll do the real math."
      ),
      pricesTitle: T("Preços no posto (R$/litro)", "Pump prices (R$/liter)"),
      gasPrice: T("Gasolina comum", "Regular gasoline"),
      ethPrice: T("Etanol", "Ethanol"),
      pricePh: T("ex.: 6,09", "e.g. 6.09"),
      consumptionTitle: T("Consumo do seu carro (km/l)", "Your car's mileage (km/l)"),
      consumptionSub: T("Se souber, informe — deixa o cálculo exato. Não sabe? Deixe em branco que estimamos pelo motor.", "If you know it, fill it in — makes the math exact. Don't know? Leave blank and we'll estimate from the engine."),
      gasKmL: T("Na gasolina", "On gasoline"),
      ethKmL: T("No etanol", "On ethanol"),
      kmlPh: T("ex.: 11,5", "e.g. 11.5"),
      engineTitle: T("Sobre o seu motor", "About your engine"),
      engineSub: T("Só usamos isto quando falta algum consumo — motores turbo e de alta compressão aproveitam melhor o etanol.", "Only used when a km/l is missing — turbo and high-compression engines make better use of ethanol."),
      turboQ: T("O motor é turbo de fábrica?", "Is the engine factory-turbocharged?"),
      turboYes: T("Turbo de fábrica", "Factory turbo"),
      turboNo: T("Aspirado (sem turbo)", "Naturally aspirated"),
      compQ: T("Taxa de compressão acima de 12:1?", "Compression ratio above 12:1?"),
      compHint: T("Está na ficha técnica do carro — uma busca rápida por \"taxa de compressão {car}\" resolve.", "It's in the car's spec sheet — a quick search for \"{car} compression ratio\" finds it."),
      compYes: T("Acima de 12:1", "Above 12:1"),
      compNo: T("Até 12:1 / não sei", "Up to 12:1 / not sure"),
      resultEth: T("Abasteça com ETANOL", "Fill up with ETHANOL"),
      resultGas: T("Abasteça com GASOLINA", "Fill up with GASOLINE"),
      resultPending: T("Abasteça com ***", "Fill up with ***"),
      pendingHint: T("Preencha os preços do posto acima para ver o veredito.", "Fill in the pump prices above to see the verdict."),
      ratioLine: T("O etanol está custando {ratio}% do preço da gasolina.", "Ethanol is costing {ratio}% of the gasoline price."),
      thresholdLine: T("No seu carro, ele compensa quando custa menos de {threshold}%.", "In your car, it pays off below {threshold}%."),
      estimatedNote: T("Consumo no etanol estimado pelo perfil do motor (≈ {kml} km/l). Informe os consumos reais para afinar a conta.", "Ethanol mileage estimated from the engine profile (≈ {kml} km/l). Enter real figures to sharpen the math."),
      costKm: T("Custo por km", "Cost per km"),
      costKmGas: T("Gasolina", "Gasoline"),
      costKmEth: T("Etanol", "Ethanol"),
      savings: T("Economia de ~{pct}% por km rodado", "~{pct}% cheaper per km driven"),
      redo: T("Vale refazer a conta a cada abastecimento — os preços mudam de posto para posto.", "Worth redoing at every fill-up — prices change from station to station."),
    },

    obd2: {
      title: T("Códigos OBD2", "OBD2 codes"),
      entryTitle: T("Códigos OBD2", "OBD2 codes"),
      entrySub: T("Descubra o que a luz do painel está dizendo", "Find out what that dashboard light means"),
      intro: T(
        "Todo carro fabricado a partir de ~2010 no Brasil tem uma porta OBD2. Quando algo sai do normal, o carro grava um código de falha — é ele que acende a luz da injeção no painel. Lendo o código, você sai do achismo e descobre exatamente onde investigar.",
        "Every car made since ~2008 has an OBD2 port. When something goes off-spec, the car stores a fault code — that's what turns on the check-engine light. Reading the code takes out the guesswork and tells you exactly where to look."
      ),
      howToRead: T(
        "Como ler: a primeira letra indica a área (P = motor/câmbio, C = chassi, B = carroceria, U = rede elétrica). Os números detalham o sistema e a falha específica.",
        "How to read: the first letter is the area (P = powertrain, C = chassis, B = body, U = network). The digits pinpoint the system and the specific fault."
      ),
      toolTitle: T("Ferramenta necessária", "Tool you'll need"),
      toolBody: T(
        "Um scanner OBD2. Os de tomada Bluetooth (tipo ELM327) custam a partir de ~R$ 30 e funcionam com apps gratuitos no celular. É só plugar na porta (geralmente embaixo do volante), parear e ler os códigos.",
        "An OBD2 scanner. Bluetooth dongles (ELM327-style) start at ~$10 and work with free phone apps. Plug it into the port (usually under the steering wheel), pair it and read the codes."
      ),
      scanCta: T("Como escanear corretamente com o seu leitor", "How to scan correctly with your reader"),
      scanTitle: T("Como usar seu scanner OBD2", "How to use your OBD2 scanner"),
      scanIntro: T(
        "Ler os códigos do carro é mais simples do que parece: são 2 minutos entre plugar o leitor e ter a resposta na tela do celular. Veja onde fica a porta, como conectar e o que fazer com o resultado.",
        "Reading your car's codes is simpler than it looks: about 2 minutes from plugging the reader to seeing the answer on your phone. Here's where the port is, how to connect and what to do with the result."
      ),
      whereTitle: T("Onde fica a porta OBD2", "Where the OBD2 port is"),
      whereBody: T(
        "Na grande maioria dos carros, a porta fica embaixo do painel, do lado do motorista — perto da coluna da direção, na altura dos joelhos. Em alguns modelos ela vem escondida atrás de uma tampinha plástica ou perto da caixa de fusíveis. É um conector trapezoidal de 16 pinos.",
        "In most cars the port sits under the dash on the driver's side — near the steering column, at knee height. In some models it hides behind a small plastic cover or near the fuse box. It's a 16-pin trapezoid connector."
      ),
      stepsTitle: T("Passo a passo da leitura", "Reading, step by step"),
      scanSteps: [
        T("Com o carro desligado, encaixe o leitor na porta OBD2 até firmar.", "With the car off, plug the reader into the OBD2 port until it's snug."),
        T("Ligue a ignição SEM dar partida (painel aceso). Alguns leitores também funcionam com o motor ligado.", "Turn the ignition ON without starting (dash lights on). Some readers also work with the engine running."),
        T("No celular, ative o Bluetooth e abra o app do leitor (ex.: Torque, Car Scanner, ELM327). Pareie com o dispositivo — o PIN costuma ser 1234 ou 0000.", "On your phone, enable Bluetooth and open the reader app (e.g. Torque, Car Scanner, ELM327). Pair with the device — the PIN is usually 1234 or 0000."),
        T("Toque em \"Ler códigos\" (ou \"Diagnóstico\") e aguarde alguns segundos.", "Tap \"Read codes\" (or \"Diagnostics\") and wait a few seconds."),
        T("Anote os códigos que aparecerem (ex.: P0300) e consulte o significado logo abaixo. Evite apagar os códigos antes de resolver a causa — a luz volta e você perde o histórico.", "Note the codes that appear (e.g. P0300) and look up their meaning below. Avoid clearing codes before fixing the cause — the light comes back and you lose the history."),
      ],
      searchTitle: T("Consultar um código", "Look up a code"),
      searchPh: T("Digite o código — ex.: P0300", "Type the code — e.g. P0300"),
      system: T("Sistema", "System"),
      meaning: T("O que significa", "What it means"),
      notFound: T("Não temos esse código na tabela — mas o Biela conhece todos.", "That code isn't in our table — but Biela knows them all."),
      deepen: T("Aprofunde sobre o que pode ser", "Dig into what it could be"),
      deepenSeed: T(
        "Meu scanner OBD2 mostrou o código {code} ({meaning}). O que pode ser, o que devo verificar primeiro e é seguro rodar assim?",
        "My OBD2 scanner shows code {code} ({meaning}). What could it be, what should I check first, and is it safe to drive?"
      ),
      deepenSeedUnknown: T(
        "Meu scanner OBD2 mostrou o código {code}. O que esse código significa, o que pode ser e o que devo verificar primeiro?",
        "My OBD2 scanner shows code {code}. What does it mean, what could it be and what should I check first?"
      ),
      codes: [
        { code: "P0100", meaning: T("Circuito do sensor de fluxo de ar (MAF) com falha", "Mass air flow (MAF) sensor circuit fault"), system: T("Motor", "Engine"), level: "medium" },
        { code: "P0101", meaning: T("Sensor de fluxo de ar (MAF) fora da faixa", "Mass air flow (MAF) sensor out of range"), system: T("Motor", "Engine"), level: "medium" },
        { code: "P0102", meaning: T("Sinal baixo do sensor de fluxo de ar (MAF)", "Mass air flow (MAF) low input"), system: T("Motor", "Engine"), level: "medium" },
        { code: "P0113", meaning: T("Sensor de temperatura do ar de admissão com sinal alto", "Intake air temp sensor high input"), system: T("Motor", "Engine"), level: "low" },
        { code: "P0117", meaning: T("Sensor de temperatura do motor com sinal baixo", "Engine coolant temp sensor low input"), system: T("Motor", "Engine"), level: "medium" },
        { code: "P0118", meaning: T("Sensor de temperatura do motor com sinal alto", "Engine coolant temp sensor high input"), system: T("Motor", "Engine"), level: "medium" },
        { code: "P0120", meaning: T("Sensor de posição da borboleta (TPS) com falha", "Throttle position sensor (TPS) fault"), system: T("Motor", "Engine"), level: "medium" },
        { code: "P0128", meaning: T("Motor demora a esquentar (provável válvula termostática)", "Engine slow to warm up (likely thermostat)"), system: T("Motor", "Engine"), level: "low" },
        { code: "P0130", meaning: T("Sonda lambda (sensor de O2) com falha — banco 1", "O2 sensor fault — bank 1"), system: T("Motor", "Engine"), level: "medium" },
        { code: "P0135", meaning: T("Aquecedor da sonda lambda com falha — banco 1", "O2 sensor heater fault — bank 1"), system: T("Motor", "Engine"), level: "low" },
        { code: "P0141", meaning: T("Aquecedor da sonda lambda pós-catalisador com falha", "Downstream O2 sensor heater fault"), system: T("Motor", "Engine"), level: "low" },
        { code: "P0171", meaning: T("Mistura pobre — banco 1 (ar demais ou combustível de menos)", "System too lean — bank 1"), system: T("Motor", "Engine"), level: "medium" },
        { code: "P0172", meaning: T("Mistura rica — banco 1 (combustível demais)", "System too rich — bank 1"), system: T("Motor", "Engine"), level: "medium" },
        { code: "P0300", meaning: T("Falhas de combustão aleatórias (misfire) em vários cilindros", "Random/multiple cylinder misfire"), system: T("Motor", "Engine"), level: "high" },
        { code: "P0301", meaning: T("Falha de combustão (misfire) no cilindro 1", "Cylinder 1 misfire"), system: T("Motor", "Engine"), level: "high" },
        { code: "P0302", meaning: T("Falha de combustão (misfire) no cilindro 2", "Cylinder 2 misfire"), system: T("Motor", "Engine"), level: "high" },
        { code: "P0303", meaning: T("Falha de combustão (misfire) no cilindro 3", "Cylinder 3 misfire"), system: T("Motor", "Engine"), level: "high" },
        { code: "P0304", meaning: T("Falha de combustão (misfire) no cilindro 4", "Cylinder 4 misfire"), system: T("Motor", "Engine"), level: "high" },
        { code: "P0325", meaning: T("Sensor de detonação (knock) com falha", "Knock sensor fault"), system: T("Motor", "Engine"), level: "medium" },
        { code: "P0335", meaning: T("Sensor de rotação do virabrequim com falha", "Crankshaft position sensor fault"), system: T("Motor", "Engine"), level: "high" },
        { code: "P0340", meaning: T("Sensor de fase do comando de válvulas com falha", "Camshaft position sensor fault"), system: T("Motor", "Engine"), level: "medium" },
        { code: "P0401", meaning: T("Fluxo insuficiente na válvula EGR", "EGR insufficient flow"), system: T("Motor", "Engine"), level: "medium" },
        { code: "P0420", meaning: T("Catalisador com eficiência abaixo do mínimo — banco 1", "Catalyst efficiency below threshold — bank 1"), system: T("Motor", "Engine"), level: "medium" },
        { code: "P0430", meaning: T("Catalisador com eficiência abaixo do mínimo — banco 2", "Catalyst efficiency below threshold — bank 2"), system: T("Motor", "Engine"), level: "medium" },
        { code: "P0440", meaning: T("Falha no sistema de vapores de combustível (EVAP)", "EVAP system fault"), system: T("Motor", "Engine"), level: "low" },
        { code: "P0442", meaning: T("Pequeno vazamento no sistema EVAP (confira a tampa do tanque)", "EVAP small leak (check the gas cap)"), system: T("Motor", "Engine"), level: "low" },
        { code: "P0455", meaning: T("Grande vazamento no sistema EVAP (tampa do tanque solta?)", "EVAP large leak (loose gas cap?)"), system: T("Motor", "Engine"), level: "low" },
        { code: "P0500", meaning: T("Sensor de velocidade do veículo com falha", "Vehicle speed sensor fault"), system: T("Elétrica", "Electrical"), level: "medium" },
        { code: "P0505", meaning: T("Sistema de marcha lenta com falha", "Idle control system fault"), system: T("Motor", "Engine"), level: "low" },
        { code: "P0562", meaning: T("Tensão do sistema baixa (bateria/alternador)", "System voltage low (battery/alternator)"), system: T("Elétrica", "Electrical"), level: "medium" },
        { code: "P0563", meaning: T("Tensão do sistema alta (regulador do alternador)", "System voltage high (alternator regulator)"), system: T("Elétrica", "Electrical"), level: "medium" },
        { code: "P0601", meaning: T("Erro de memória na central do motor (ECU)", "ECU internal memory error"), system: T("Elétrica", "Electrical"), level: "high" },
        { code: "P0605", meaning: T("Erro na memória ROM da central (ECU)", "ECU ROM error"), system: T("Elétrica", "Electrical"), level: "high" },
        { code: "P0620", meaning: T("Circuito de controle do alternador com falha", "Alternator control circuit fault"), system: T("Elétrica", "Electrical"), level: "medium" },
        { code: "P0700", meaning: T("Falha registrada na central do câmbio automático", "Transmission control system fault"), system: T("Câmbio", "Transmission"), level: "medium" },
        { code: "P0715", meaning: T("Sensor de rotação da turbina do câmbio com falha", "Transmission turbine speed sensor fault"), system: T("Câmbio", "Transmission"), level: "medium" },
        { code: "C0035", meaning: T("Sensor de velocidade da roda dianteira esquerda com falha (ABS)", "Left front wheel speed sensor fault (ABS)"), system: T("Freios", "Brakes"), level: "high" },
        { code: "C0040", meaning: T("Sensor de velocidade da roda dianteira direita com falha (ABS)", "Right front wheel speed sensor fault (ABS)"), system: T("Freios", "Brakes"), level: "high" },
        { code: "U0100", meaning: T("Sem comunicação com a central do motor (ECM)", "Lost communication with ECM"), system: T("Elétrica", "Electrical"), level: "high" },
        { code: "U0121", meaning: T("Sem comunicação com o módulo do ABS", "Lost communication with ABS module"), system: T("Freios", "Brakes"), level: "high" },
      ] as { code: string; meaning: string; system: string; level: Severity }[],
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
      howTo: T("Como usar", "How to use"),
      howToSteps: T("Passo a passo", "Step by step"),
      howToSafety: T("Cuidados de segurança", "Safety notes"),
    },

    checklist: {
      title: T("O que verificar", "What to check"),
      intro: T(
        "Estas são as áreas que têm relação com este problema — é aqui que a oficina deve olhar. Se sugerirem serviços fora desta lista, pergunte o motivo antes de aprovar.",
        "These are the areas related to this problem — this is where the shop should look. If they suggest work outside this list, ask why before approving."
      ),
      notes: T("Anotações do orçamento", "Quote notes"),
      notesPh: T("ex.: trocar só as dianteiras", "e.g. front pads only"),
      total: T("Valor total do orçamento (R$)", "Total quote (R$)"),
      totalPh: T("ex.: 480", "e.g. 480"),
      shop: T("Oficina", "Shop"),
      shopPh: T("Nome da oficina", "Shop name"),
      city: T("Cidade", "City"),
      saveToHistory: T("Salvar no histórico", "Save to history"),
      share: T("Compartilhar", "Share"),
      pdf: T("Exportar PDF / WhatsApp", "Export PDF / WhatsApp"),
      premiumNudge: T("Quer checklists completos, ilimitados e em PDF? Assine o Premium.", "Want complete, unlimited checklists in PDF? Subscribe."),
      lockedItems: T("Itens específicos (espessura mínima, tolerâncias) no Premium.", "Specific items (min thickness, tolerances) on Premium."),
    },

    health: {
      title: T("Saúde do seu", "Health of your"),
      scoreLabel: T("Saúde", "Health"),
      // Estado vazio: sem carro cadastrado a tela devolvia só o título.
      noCarTitle: T("Cadastre um carro para ver a saúde dele", "Add a car to see its health"),
      noCarBody: T(
        "A partir da marca, do ano e da quilometragem, o Mentorque calcula uma nota de saúde por sistema — motor, freios, suspensão, pneus e elétrica — e mostra o que está vencido.",
        "From the make, year and mileage, Mentorque computes a health score per system — engine, brakes, suspension, tires and electrical — and shows what's overdue."
      ),
      noCarCta: T("Cadastrar meu carro", "Add my car"),
      noCarBrowse: T("Antes disso, explore os problemas comuns", "Or browse common problems first"),
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
      quizNowInfo: T(
        "VHS (Vehicle Health Score) mede o estado do carro HOJE: é a média ponderada das suas respostas do quiz com o histórico de manutenção. De 0 a 100% — quanto mais alto, melhor o estado atual.",
        "VHS (Vehicle Health Score) measures the car's condition TODAY: a weighted average of your quiz answers and the maintenance history. From 0 to 100% — the higher, the better."
      ),
      quizRiskInfo: T(
        "VRI (Vehicle Risk Index) estima o risco de problemas no FUTURO, olhando idade, quilometragem e a robustez do conjunto motor/câmbio. De 0 a 100 — aqui, quanto MENOR o número, melhor.",
        "VRI (Vehicle Risk Index) estimates the risk of FUTURE problems, based on age, mileage and the robustness of the engine/transmission combo. From 0 to 100 — here, the LOWER, the better."
      ),
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
        // Dizem POR QUE venceu. "Revisão periódica recomendada", sozinho, não
        // dava ao dono como conferir se procedia — e procedia pouco.
        revision_overdue_km: T("Revisão periódica vencida (~{n} km desde a última).", "Periodic service overdue (~{n} km since the last one)."),
        revision_overdue_time: T("Revisão periódica vencida por tempo ({n} meses desde a última).", "Periodic service overdue by time ({n} months since the last one)."),
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
      title: T("Calendário do carro", "Car calendar"),
      none: T("Nenhum serviço registrado ainda.", "No services logged yet."),
      add: T("Adicionar serviço", "Add service"),
      all: T("Todos", "All"),
      noCarTitle: T("Calendário vazio", "Empty calendar"),
      noCarBody: T("Cadastre seu carro para ter as informações!", "Add your car to see the info here!"),
      addCar: T("Cadastrar carro", "Add car"),
    },

    addService: {
      title: T("Adicionar serviço", "Add service"),
      noCarBody: T("Cadastre seu carro para registrar o serviço realizado.", "Add your car to log the service you had done."),
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
      remind: T("Add. ao calendário", "Add to calendar"),
      reminded: T("Adicionado ao calendário", "Added to calendar"),
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
      // Prévia borrada do plano Premium (o que o assinante realmente recebe)
      previewTitle: T("Com o Premium, o plano do seu {car} fica assim", "With Premium, your {car}'s plan looks like this"),
      previewCta: T("Ver meu plano completo", "See my full plan"),
      // Bloco "Próximos serviços" na aba Histórico
      upcomingTitle: T("Próximos serviços", "Upcoming service"),
      nextInMonths: T("{n} meses para a próxima revisão por tempo", "{n} months until the next time-based service"),
      nextInOneMonth: T("1 mês para a próxima revisão por tempo", "1 month until the next time-based service"),
      nextThisMonth: T("Revisão por tempo vence este mês", "Time-based service is due this month"),
      nextOverdue: T("Revisão por tempo vencida há {n} meses", "Time-based service overdue by {n} months"),
      nextKmHint: T("Atualize o km para saber se precisa fazer antes.", "Update the mileage to see if it's needed sooner."),
      remindersTitle: T("No seu calendário", "On your calendar"),
      remindersEmpty: T("Nada agendado. Adicione em Próximas revisões.", "Nothing scheduled. Add from Upcoming service."),
      seeAllRevisions: T("Ver próximas revisões", "See upcoming service"),
      previewItems: [
        { item: T("Óleo e filtro — intervalo do seu motor", "Oil and filter — your engine's interval"), when: T("a cada 10.000 km ou 12 meses", "every 10,000 km or 12 months"), note: T("O manual do seu carro pede óleo 5W30 sintético; a oficina costuma oferecer o mineral, mais barato e fora de especificação.", "Your manual calls for 5W30 synthetic; shops often push cheaper mineral oil, out of spec."), cost: "R$ 210–390" },
        { item: T("Correia dentada — ponto crítico do seu motor", "Timing belt — critical point on your engine"), when: T("faltam ~18.000 km", "~18,000 km to go"), note: T("Neste motor a correia arrebenta sem aviso e danifica as válvulas — não passe do intervalo.", "On this engine the belt snaps without warning and damages the valves — don't exceed the interval."), cost: "R$ 780–1.600" },
        { item: T("Velas de ignição — pelo seu histórico", "Spark plugs — from your history"), when: T("previsto para os próximos 4 meses", "expected in the next 4 months"), note: T("Você registrou consumo alto: trocar as velas antes do previsto costuma resolver.", "You logged high consumption: replacing the plugs early usually fixes it."), cost: "R$ 160–320" },
      ],
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
      tracks: T("Explorar por tema", "Browse by topic"),
      // Trilhas guiadas (cursos com ordem e progresso)
      coursesTitle: T("Trilhas", "Tracks"),
      coursesSub: T("Sequências com começo, meio e fim", "Sequences with a start, middle and end"),
      courseProgress: T("{n} de {total} aulas", "{n} of {total} lessons"),
      courseStart: T("Começar", "Start"),
      courseContinue: T("Continuar", "Continue"),
      courseDoneBadge: T("Concluída", "Completed"),
      courseLessonCtx: T("Aula {n} de {total}", "Lesson {n} of {total}"),
      courseNext: T("Próxima aula", "Next lesson"),
      courseNextUp: T("A seguir na trilha", "Next in this track"),
      completeAndNext: T("Concluir e ir para a próxima", "Complete and go to the next"),
      relatedTitle: T("Continue por aqui", "Keep going"),
      courseLevels: { iniciante: T("Iniciante", "Beginner"), intermediario: T("Intermediário", "Intermediate"), avancado: T("Avançado", "Advanced") },
      courseDoneTitle: T("Trilha concluída! 🏁", "Track completed! 🏁"),
      courseDoneBody: T("Você fechou \"{t}\" — todas as aulas concluídas. Já sabe mais do que a maioria dos donos de carro.", "You finished \"{t}\" — every lesson done. You now know more than most car owners."),
      courseDoneCta: T("Ver outras trilhas", "See other tracks"),
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
      savedLabel: T("Salvo", "Saved"),
      pin: T("Fixar na Home", "Pin to Home"),
      pinned: T("Fixado na Home", "Pinned to Home"),
      savedTitle: T("Salvos", "Saved"),
      savedSub: T("Conteúdos que você guardou para ver depois.", "Content you saved for later."),
      viewSaved: T("Ver salvos", "View saved"),
      savedEmpty: T("Nada salvo ainda. Toque em \"Salvar para ver depois\" em qualquer conteúdo.", "Nothing saved yet. Tap \"Save for later\" on any content."),
    },
    biela: {
      cardTitle: T("Fala com o Biela", "Chat with Biela"),
      cardSub: T("Seu mecânico de IA — tira qualquer dúvida", "Your AI mechanic — ask anything"),
      title: T("Biela", "Biela"),
      contextPrefix: T("Sobre seu", "About your"),
      intro: T("Oi! Sou o Biela 🐻 Manjo tudo de mecânica. Me conta o que está acontecendo com o seu carro que eu te ajudo — pode perguntar de barulho, revisão, orçamento, o que for.", "Hi! I'm Biela 🐻 I know cars inside out. Tell me what's going on and I'll help — noises, service, quotes, anything."),
      inputPh: T("Pergunte ao Biela...", "Ask Biela..."),
      send: T("Enviar", "Send"),
      novaConversa: T("Nova conversa", "New chat"),
      thinking: T("Biela está pensando...", "Biela is thinking..."),
      suggestions: [
        T("Que barulho pode ser esse ao frear?", "What could this braking noise be?"),
        T("Quando devo trocar a correia?", "When should I change the belt?"),
        T("Esse orçamento está caro?", "Is this quote expensive?"),
        T("Como faço a revisão em dia?", "How do I keep service up to date?"),
      ],
      disclaimer: T("O Biela orienta, mas não substitui uma inspeção presencial em itens de segurança (freio, direção, airbag).", "Biela guides you, but doesn't replace an in-person inspection for safety items (brakes, steering, airbags)."),
      freeLeft: T("{n} perguntas grátis restantes hoje", "{n} free questions left today"),
      freeOver: T("O Biela é um recurso Premium. Assine para conversar à vontade com o seu mecânico de IA.", "Biela is a Premium feature. Subscribe to chat freely with your AI mechanic."),
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
      // Vendi o carro (arquivar mantendo o histórico)
      soldTitle: T("Não tenho mais este carro", "I no longer have this car"),
      soldCta: T("Marcar como vendido", "Mark as sold"),
      soldSheetTitle: T("Vendeu ou se desfez do carro?", "Sold or parted with the car?"),
      soldSheetBody: T("Ele sai da sua garagem e para de gerar revisões e alertas — mas todo o histórico, as notas e as memórias ficam guardados.", "It leaves your garage and stops generating service alerts — but the whole history, receipts and memories stay saved."),
      soldWhen: T("Quando foi?", "When was it?"),
      soldSave: T("Confirmar", "Confirm"),
      soldBadge: T("Vendido", "Sold"),
      soldOn: T("Vendido em {d}", "Sold on {d}"),
      unsoldCta: T("Voltei a ter este carro", "I have this car again"),
      danger: T("Zona de risco", "Danger zone"),
      deleteCar: T("Excluir carro", "Delete car"),
      deleteNote: T("Excluir apaga tudo para sempre. Se você só vendeu o carro, use \"Marcar como vendido\" acima.", "Deleting erases everything permanently. If you just sold the car, use \"Mark as sold\" above."),
      deleteConfirm: T("Isso apagará todo o histórico deste carro. Deseja continuar?", "This will erase all history for this car. Continue?"),
    },

    // Pedido de nota. A pergunta não cita a loja: mencioná-la antes da resposta
    // induz a nota, e é o que separa "perguntar" de "colher elogio".
    feedback: {
      pergunta: T("Como está sendo usar o Mentorque?", "How's Mentorque working out for you?"),
      subtitulo: T("Sua resposta chega direto para quem faz o app.", "Your answer goes straight to the people who build the app."),
      estrelaLabel: T("Dar nota {n} de 5", "Rate {n} out of 5"),
      depois: T("Agora não", "Not now"),

      // Nota 4 ou 5
      obrigadoTitulo: T("Que bom saber 🧡", "Great to hear 🧡"),
      obrigadoCorpo: T(
        "Se der um minuto, uma avaliação na loja ajuda outras pessoas a encontrarem o app.",
        "If you have a minute, a store review helps other people find the app."
      ),
      irParaLoja: T("Avaliar na App Store", "Review on the App Store"),
      // Cada loja pelo nome dela. Um rótulo só, dizendo "App Store", mandaria
      // metade dos usuários para uma loja que o aparelho deles não tem.
      irParaLojaPlay: T("Avaliar na Google Play", "Review on Google Play"),
      irParaLojaGenerico: T("Avaliar o app", "Rate the app"),

      // Nota 1 a 3
      contaTitulo: T("O que deu errado?", "What went wrong?"),
      contaCorpo: T(
        "Escreva do seu jeito. Lemos tudo, e o que dá para consertar entra na fila.",
        "Write it however you like. We read everything, and what can be fixed gets queued."
      ),
      placeholder: T("O que te incomodou?", "What bothered you?"),
      emailLabel: T("Seu e-mail (opcional, para respondermos)", "Your email (optional, so we can reply)"),
      enviar: T("Enviar", "Send"),
      enviando: T("Enviando…", "Sending…"),
      enviado: T("Recebemos. Obrigado por escrever.", "Got it. Thanks for writing."),
      erro: T("Não deu para enviar. Tente de novo em instantes.", "Couldn't send. Try again in a moment."),
      // Continua disponível para quem deu nota baixa: esconder a loja de quem
      // está insatisfeito é o que a Apple trata como manipulação da avaliação.
      lojaMesmoAssim: T("Prefiro avaliar na loja", "I'd rather review on the store"),

      // Polegares na resposta da Biela
      bielaUtil: T("Resposta útil", "Helpful answer"),
      bielaInutil: T("Resposta ruim", "Poor answer"),
      // O 👎 sozinho só conta tristeza. O motivo é o que diz onde consertar.
      bielaPorQue: T("O que faltou?", "What was missing?"),
      bielaErrada: T("Errada", "Wrong"),
      bielaIncompleta: T("Não respondeu", "Didn't answer"),
      bielaConfusa: T("Confusa", "Confusing"),
      bielaComentario: T("Quer detalhar? (opcional)", "Want to add detail? (optional)"),
      bielaObrigado: T("Obrigado — isso ajuda a Biela a melhorar.", "Thanks — this helps Biela improve."),
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
      // Retenção pré-cancelamento (Android, assinatura da Play)
      manageStore: T("Gerenciar na Google Play", "Manage on Google Play"),
      saveTitle: T("Antes de você ir…", "Before you go…"),
      saveBody: T("Que tal ficar pagando menos? 2 meses do plano mensal com 30% de desconto, direto na sua conta da Play.", "How about staying for less? 2 months of the monthly plan at 30% off, right on your Play account."),
      saveCta: T("Aceitar {preco}/mês por 2 meses", "Take {preco}/mo for 2 months"),
      saveCtaNoPrice: T("Aceitar 30% off por 2 meses", "Take 30% off for 2 months"),
      saveNo: T("Quero cancelar mesmo assim", "I still want to cancel"),
      saveDone: T("Oferta aplicada! Obrigado por ficar. 💛", "Offer applied! Thanks for staying. 💛"),
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
      // Fica no Perfil, e não só no paywall: quem já assina não passa mais pela
      // tela de compra, e era justamente o assinante — a pessoa com um contrato
      // em vigor — que ficava sem caminho nenhum para reler o que assinou.
      terms: T("Termos de uso", "Terms of use"),
      privacyFull: T("Ler a política completa", "Read the full policy"),
      adPrivacy: T("Preferências de anúncios", "Ad preferences"),
      rate: T("Avaliar o Mentorque", "Rate Mentorque"),
      version: T("Mentorque v{v}", "Mentorque v{v}"),
      aboutTitle: T("Sobre o Mentorque", "About Mentorque"),
      aboutBody: T(
        "O Mentorque é o seu copiloto para cuidar do carro com confiança: organize sua garagem, entenda sintomas, acompanhe revisões e aprenda mecânica no seu ritmo — tudo em português.\n\nNossa missão é deixar o cuidado com o carro simples, econômico e sem depender de achismo na oficina.",
        "Mentorque is your copilot to care for your car with confidence: organize your garage, understand symptoms, track services and learn mechanics at your pace — all in one place.\n\nOur mission is to make car care simple, affordable and free of guesswork at the shop."
      ),
      privacyTitle: T("Política de privacidade", "Privacy policy"),
      privacyBody: T(
        "Levamos sua privacidade a sério. Os dados da sua garagem ficam no seu aparelho e, se você criar uma conta, são sincronizados de forma segura para você acessar de outros dispositivos.\n\nNão vendemos seus dados e não usamos ferramentas de análise de terceiros. Suas perguntas ao Biela e os dados do carro são enviados a provedores de IA para gerar a resposta — sem o seu nome ou e-mail. Se você tocar em 👍 ou 👎 numa resposta, guardamos aquela pergunta e aquela resposta para melhorar o Biela, também sem o seu nome, e apagamos depois de 90 dias.\n\nNa versão gratuita do app Android exibimos anúncios do Google AdMob, que usa o identificador de publicidade do aparelho. Pedimos seu consentimento antes do primeiro anúncio e você pode rever a escolha em Preferências de anúncios. Assinantes Premium não veem anúncios.\n\nVocê pode excluir sua conta e seus dados a qualquer momento aqui no Perfil.",
        "We take your privacy seriously. Your garage data stays on your device and, if you create an account, is securely synced so you can access it from other devices.\n\nWe don't sell your data and use no third-party analytics. Your prompts to Biela and your car details are sent to AI providers to generate the answer — without your name or email. If you tap 👍 or 👎 on an answer, we store that question and answer to improve Biela, also without your name, and delete it after 90 days.\n\nIn the free Android app we show Google AdMob ads, which use your device's advertising identifier. We ask for your consent before the first ad and you can change it under Ad preferences. Premium subscribers see no ads.\n\nYou can delete your account and data at any time here in Profile."
      ),
      signOut: T("Sair", "Sign out"),
      reset: T("Apagar os dados deste aparelho", "Erase this device's data"),
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
      loadingIap: T("Carregando os planos…", "Loading plans…"),
      privacyLink: T("Política de Privacidade", "Privacy Policy"),
      termsLink: T("Termos de Uso", "Terms of Use"),
      // Ficha da assinatura exibida no fluxo de compra do app da Apple.
      //
      // A diretriz 3.1.2(c) exige que título, duração e preço estejam VISÍVEIS
      // dentro do app, junto dos links para os termos e a privacidade. O preço
      // vem da própria Apple (`product.priceString`), então o que fica aqui é o
      // nome e o prazo — o resto o paywall preenche.
      iapProduct: T("Mentorque Premium", "Mentorque Premium"),
      iapAnnualLength: T("Assinatura de 12 meses, renovação automática", "12-month subscription, auto-renewing"),
      iapMonthlyLength: T("Assinatura de 1 mês, renovação automática", "1-month subscription, auto-renewing"),
      iapRenewNote: T(
        "A renovação é automática, pela sua conta Apple, salvo cancelamento até 24 horas antes do fim do período. Gerencie em Ajustes → Assinaturas.",
        "Renews automatically through your Apple account unless cancelled at least 24 hours before the end of the period. Manage in Settings → Subscriptions."
      ),
      // O mesmo aviso, para quem comprou pela Play. Cada loja tem a sua conta e
      // o seu lugar de cancelar — mandar um usuário Android para "Ajustes →
      // Assinaturas" do iPhone é instrução para um aparelho que ele não tem.
      iapRenewNotePlay: T(
        "A renovação é automática, pela sua conta do Google Play, salvo cancelamento até 24 horas antes do fim do período. Gerencie na Play Store → Pagamentos e assinaturas.",
        "Renews automatically through your Google Play account unless cancelled at least 24 hours before the end of the period. Manage in Play Store → Payments and subscriptions."
      ),
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
      // `{preco}` é substituído por quem desenha a tela: na web pelo preço do
      // Stripe, no app da loja pelo `priceString` que a própria loja devolve.
      //
      // Estava escrito à mão ("R$ 239,90") e isso punha DOIS preços diferentes
      // na mesma tela assim que a loja cobrasse outro valor — o cartão do plano
      // dizendo um, a letra miúda dizendo outro. Além de confundir, é o tipo de
      // contradição que a revisão da Apple trata como preço incorreto (3.1.2(c)).
      trialFine: T("Após o período grátis, {preco} cobrado anual. Cancele quando quiser.", "After the free trial, {preco} billed yearly. Cancel anytime."),
      trialFineMonthly: T("Após o período grátis, {preco} por mês. Cancele quando quiser.", "After the free trial, {preco} per month. Cancel anytime."),
      planAnnual: T("Anual", "Yearly"),
      planAnnualPrice: T("R$ 239,90/ano", "R$ 239.90/yr"),
      planAnnualNote: T("R$ 19,99/mês", "R$ 19.99/mo"),
      planBadge: T("Melhor preço", "Best value"),
      planMonthly: T("Mensal", "Monthly"),
      planMonthlyPrice: T("R$ 29,90/mês", "R$ 29.90/mo"),
      // Pop-up de saída do paywall — oferta de 10% de desconto
      exitTitle: T("Desbloqueie o Mentorque Premium com 10% de desconto 🔥", "Unlock Mentorque Premium with 10% off 🔥"),
      exitSub: T("Desbloqueie os recursos premium hoje mesmo por um preço especial. Válido somente para hoje!", "Unlock premium features today at a special price. Today only!"),
      exitExpires: T("Oferta expira em", "Offer expires in"),
      exitBadge: T("10% OFF", "10% OFF"),
      exitPrice: T("R$ 215,91/ano", "R$ 215.91/yr"),
      exitCta: T("Continuar", "Continue"),
      exitFine: T("Cobrança de R$ 215,91 por ano, cancelamento a qualquer momento.", "Billed R$ 215.91 per year, cancel anytime."),
      // Oferta final (tela cheia) — 25% OFF após rejeitar a primeira
      exit2Ribbon: T("OFERTA ÚNICA 🔥", "ONE-TIME OFFER 🔥"),
      exit2Title: "25% OFF 🎉",
      exit2Warn: T("Se sair, perderá esta oferta!", "Leave now and you lose this offer!"),
      exit2Best: T("NOSSA MELHOR OFERTA!", "OUR BEST OFFER!"),
      exit2Old: "R$ 239,90",
      exit2Price: T("R$ 179,90/ano", "R$ 179.90/yr"),
      exit2Fine: T("Cobrança de R$ 179,90 por ano, cancelamento a qualquer momento.", "Billed R$ 179.90 per year, cancel anytime."),
      exit2Cta: T("Aproveitar a oferta", "Claim the offer"),
      exit2Skip: T("Desperdiçar esta oferta única", "Waste this one-time offer"),
      exit2Agree: T("Ao continuar, você concorda com nossos", "By continuing, you agree to our"),
      // Modo leitor (app da loja) — sem compra dentro do app
      readerTitle: T("Assinatura indisponível neste app", "Subscription not available in this app"),
      readerBody: T("O Mentorque Premium não está disponível para compra nesta versão do aplicativo. Se você já é assinante, entre na sua conta e todos os recursos serão liberados automaticamente.", "Mentorque Premium can't be purchased in this version of the app. If you're already a subscriber, sign in and everything unlocks automatically."),
      readerOk: T("Entendi", "Got it"),
      // O corpo manda "entre na sua conta" — e a tela precisa ter esse caminho.
      // Sem ele o texto pedia uma coisa impossível de fazer dali.
      readerSignIn: T("Entrar na minha conta", "Sign in to my account"),
      readerRefresh: T("Já sou assinante — atualizar", "I'm already a subscriber — refresh"),
      readerChecking: T("Conferindo…", "Checking…"),
      readerNotFound: T("Não encontramos uma assinatura ativa nesta conta.", "We couldn't find an active subscription on this account."),
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
