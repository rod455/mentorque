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
    // Personalização sem depender do modelo: características do veículo
    // (turbo, cvt, ev, diesel, highKm…) e momento do dono (justBought,
    // overdue, noHistory). Ver lib/app/traits.ts.
    traits?: string[];
    situations?: string[];
    media?: Media;
    thumb?: string; // imagem ilustrativa do card (opcional; ex.: /learn/oil.jpg)
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
  const art = (o: { id: string; title: string; track: string; system?: SystemKey | "geral"; premium?: boolean; make?: string; model?: string; body: string[]; media?: Media; thumb?: string; type?: "video" | "article" | "checklist"; traits?: string[]; situations?: string[]; addedAt?: string }): Lesson => ({
    id: o.id, title: o.title, track: o.track, system: o.system ?? "geral", premium: o.premium,
    make: o.make, model: o.model, media: o.media, thumb: o.thumb, type: o.type ?? "article", body: o.body,
    traits: o.traits, situations: o.situations, addedAt: o.addedAt,
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
    art({ id: "sport-turbo", thumb: "/learn/sport-turbo.png?v=4", track: "sports", title: T("Turbo vs aspirado", "Turbo vs naturally aspirated"), body: [
      T("O turbo usa os gases do escape para 'empurrar' mais ar ao motor — mais potência de um motor pequeno. Aspirado respira sozinho: resposta linear e simplicidade.", "A turbo uses exhaust gases to force more air in — more power from a small engine. NA breathes on its own: linear response and simplicity."),
      T("Turbo pede óleo em dia e alguns segundos de marcha lenta antes de desligar após uso forte.", "Turbos need on-time oil and a few seconds of idle before shutting off after hard use."),
    ]}),
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
    art({ id: "vid-turbo-pressao", track: "sports", type: "video", system: "engine", traits: ["turbo"], addedAt: "2026-08-08",
      media: { provider: "youtube", src: "it8V3v7XEp8" },
      title: T("Turbo: o que significa \"1 kg\" de pressão?", "Turbo: what does \"1 kg\" of boost mean?"), body: [
      T("Quando o pessoal fala \"esse carro tem 1 kg de turbo\", está falando de pressão de sobrealimentação — o quanto o turbo empurra de ar a mais para dentro do motor, além da pressão atmosférica.", "When people say \"this car runs 1 kg of boost\", they mean forced-induction pressure — how much extra air the turbo pushes into the engine, on top of atmospheric pressure."),
      T("A unidade de oficina é o kgf/cm². Na prática: 1 kg ≈ 1 bar ≈ 14,7 psi. São três formas de dizer quase a mesma coisa, e é por isso que manômetro importado marca psi e o brasileiro marca kg.", "The shop unit is kgf/cm². In practice: 1 kg ≈ 1 bar ≈ 14.7 psi. Three ways of saying nearly the same thing — which is why imported gauges read psi and Brazilian ones read kg."),
      T("O detalhe que importa: é pressão RELATIVA, acima da atmosférica. Com 1 kg de pressão o motor recebe aproximadamente o dobro de massa de ar — e, com combustível proporcional, o potencial de potência também quase dobra.", "The key detail: it's RELATIVE pressure, above atmospheric. At 1 kg of boost the engine takes in roughly twice the air mass — and, with matching fuel, the power potential nearly doubles too."),
      T("Por isso pressão não é um número solto: sem combustível, injeção e refrigeração acompanhando, subir a pressão só aproxima o motor da detonação.", "That's why boost isn't a number on its own: without fuel, tuning and cooling to match, raising it only brings the engine closer to detonation."),
    ]}),
    art({ id: "vid-marcha-lenta-preparado", track: "sports", type: "video", system: "engine", addedAt: "2026-08-08",
      media: { provider: "youtube", src: "FevmurLQFwg" },
      title: T("Por que carro preparado tem marcha lenta \"embaralhada\"", "Why a modified car has a lumpy idle"), body: [
      T("Aquele ronco irregular, que parece que o motor vai morrer e não morre, não é defeito: é consequência direta do comando de válvulas usado em motor preparado.", "That uneven lope, like the engine is about to stall but never does, isn't a fault: it's a direct consequence of the camshaft used in a built engine."),
      T("Um comando mais \"bravo\" fica com as válvulas de admissão e escape abertas ao mesmo tempo por mais tempo — o chamado cruzamento. Em alta rotação isso enche melhor o cilindro e é onde a potência aparece.", "A more aggressive cam keeps the intake and exhaust valves open together for longer — what's called overlap. At high rpm that fills the cylinder better, and that's where the power shows up."),
      T("Em marcha lenta o efeito se inverte: parte dos gases queimados volta para a admissão e a mistura fica instável de ciclo para ciclo. O resultado audível é a lenta oscilando.", "At idle the effect reverses: some burnt gas flows back into the intake and the mixture becomes unstable cycle to cycle. What you hear is that oscillating idle."),
      T("Ou seja, é o preço de projeto: quem ganha em cima perde embaixo. Num motor de rua com comando original, marcha lenta irregular NÃO é normal — aí vale investigar vela, bico, corpo de borboleta ou falsa entrada de ar.", "So it's a design trade-off: gain up top, lose down low. On a stock street engine, a rough idle is NOT normal — there it's worth checking plugs, injectors, throttle body or a vacuum leak."),
    ]}),
    art({ id: "vid-turbo-fabrica", track: "sports", type: "video", system: "engine", traits: ["turbo"], addedAt: "2026-08-08",
      media: { provider: "youtube", src: "PaFA9VnLfUg" },
      title: T("Por que o turbo de fábrica não \"estoura\" de pressão", "Why a factory turbo doesn't overboost"), body: [
      T("Se o turbo comprime cada vez mais ar conforme o motor gira, por que a pressão não sobe indefinidamente até quebrar tudo? Porque existe um alívio proposital no sistema.", "If the turbo compresses more air the faster the engine spins, why doesn't boost climb forever until something breaks? Because there's a deliberate relief in the system."),
      T("Quem faz esse trabalho é a wastegate: uma válvula que desvia parte dos gases de escape para fora da turbina assim que a pressão alvo é atingida. Menos gás na turbina, menos rotação, pressão estabilizada.", "The wastegate does that job: a valve that routes part of the exhaust gas around the turbine once target boost is reached. Less gas through the turbine, less speed, boost holds steady."),
      T("Nos carros modernos ela é comandada eletronicamente pela central, que ajusta a pressão em tempo real conforme rotação, temperatura, altitude e qualidade do combustível.", "On modern cars it's electronically controlled by the ECU, which trims boost in real time based on rpm, temperature, altitude and fuel quality."),
      T("E existe uma segunda rede de proteção: se a central detecta pressão acima do previsto ou sinal de detonação, ela corta — o famoso \"corte por sobrepressão\". Por isso mexer só na pressão, sem acompanhar o resto, costuma terminar em motor aberto.", "And there's a second safety net: if the ECU sees more boost than expected or detects knock, it cuts — the classic overboost cut. Which is why raising boost alone, without the rest, usually ends with the engine apart."),
    ]}),
    art({ id: "vid-nitro", track: "sports", type: "video", system: "engine", addedAt: "2026-08-08",
      media: { provider: "youtube", src: "21Mmi4ZGzPg" },
      title: T("Como funciona o nitro (NOS) de verdade", "How nitrous (NOS) actually works"), body: [
      T("Ao contrário do que o cinema sugere, o nitro não é um combustível. É óxido nitroso (N₂O), um gás que serve para levar MAIS OXIGÊNIO para dentro do motor.", "Unlike what the movies suggest, nitrous isn't a fuel. It's nitrous oxide (N₂O), a gas used to carry MORE OXYGEN into the engine."),
      T("Dentro da câmara, acima de mais ou menos 300 °C, a molécula se quebra e libera oxigênio livre — bem mais concentrado do que o do ar, que só tem 21%. Com mais oxigênio disponível, dá para queimar mais combustível.", "Inside the chamber, above roughly 300 °C, the molecule breaks down and releases free oxygen — far more concentrated than air, which is only 21% oxygen. With more oxygen available, you can burn more fuel."),
      T("Tem um bônus: o N₂O sai do cilindro em expansão e resfria bastante a mistura admitida, o que aumenta a densidade do ar e ajuda contra a detonação.", "There's a bonus: N₂O expands as it leaves the bottle and cools the intake charge considerably, which raises air density and helps fight detonation."),
      T("E tem o risco: se entrar nitro sem aumentar o combustível na mesma proporção, a mistura fica pobre e a temperatura dispara. É assim que se derrete pistão em segundos — o nitro não perdoa erro de dosagem.", "And there's the risk: if nitrous goes in without a matching increase in fuel, the mixture runs lean and temperature spikes. That's how you melt a piston in seconds — nitrous doesn't forgive a dosing mistake."),
    ]}),
    art({ id: "vid-cortar-molas", track: "diy", type: "video", system: "suspension", addedAt: "2026-08-08",
      media: { provider: "youtube", src: "MItRkRFIazQ" },
      title: T("Não rebaixe seu carro cortando as molas", "Never lower your car by cutting the springs"), body: [
      T("Cortar mola é o jeito barato de rebaixar — e é também o jeito mais rápido de estragar a suspensão inteira. Vale entender o que acontece por dentro.", "Cutting springs is the cheap way to lower a car — and also the fastest way to ruin the whole suspension. It's worth understanding what happens inside."),
      T("A mola original é calculada para uma constante específica. Ao cortar, ela fica mais curta e mais DURA, de forma imprevisível. Muitas são progressivas: as espiras têm passos diferentes, e cortar justamente a parte macia destrói o projeto.", "The original spring is calculated for a specific rate. Cutting it makes it shorter and STIFFER, in an unpredictable way. Many are progressive: the coils have different pitches, and cutting exactly the soft section destroys the design."),
      T("Pior: a ponta cortada não assenta direito na sede. A mola trabalha torta, faz barulho e pode até se soltar do prato numa lombada com a roda no ar.", "Worse: the cut end doesn't seat properly. The spring works crooked, makes noise and can even pop out of its seat over a bump with the wheel unloaded."),
      T("O amortecedor também paga a conta: ele passa a trabalhar fora do curso para o qual foi projetado, batendo no fim de curso, e morre cedo. Some a isso a geometria alterada, que come pneu e piora a frenagem.", "The shock pays too: it starts working outside its designed travel, bottoming out, and dies early. Add the altered geometry, which eats tires and hurts braking."),
      T("Se quiser rebaixar, use kit de molas esportivas projetado para o seu carro — vem com a constante certa, a altura certa e, de preferência, amortecedor compatível. E lembre: alteração de altura precisa estar regularizada para passar na vistoria.", "If you want to lower it, use a sport spring kit designed for your car — correct rate, correct height and, ideally, matching shocks. And remember: a ride-height change must be properly registered to pass inspection."),
    ]}),
    art({ id: "vid-manual-suave", track: "fundamentals", type: "video", system: "engine", traits: ["manualGearbox"], addedAt: "2026-08-08",
      media: { provider: "youtube", src: "6Wsp-O5eTuE" },
      title: T("Como dirigir um carro manual de forma suave", "How to drive a manual smoothly"), body: [
      T("Trancos em carro manual quase nunca são do carro: são de sincronismo entre o pé da embreagem e o acelerador. A boa notícia é que isso se aprende rápido.", "Jerky shifts in a manual are almost never the car: they're a timing mismatch between the clutch foot and the throttle. The good news is that it's quickly learned."),
      T("Na saída, o segredo é o ponto de atrito: solte a embreagem até o carro começar a se mover sozinho, segure ali por um instante e só então acelere e termine de soltar. Pressa nessa fase é o que causa o solavanco.", "Pulling away, the secret is the friction point: release the clutch until the car starts moving on its own, hold there a moment, then add throttle and finish releasing. Rushing this is what causes the lurch."),
      T("Na troca, alivie o acelerador ANTES de pisar na embreagem, e volte a acelerar de forma progressiva enquanto solta. O motor e a caixa chegam na mesma rotação e a troca fica imperceptível.", "When shifting, ease off the throttle BEFORE pressing the clutch, and feed it back progressively as you release. Engine and gearbox meet at the same speed and the shift becomes invisible."),
      T("Reduções pedem o contrário: um toque no acelerador com a embreagem embaixo iguala as rotações e evita aquele \"freio motor\" brusco que joga todo mundo para frente.", "Downshifts need the opposite: a blip of throttle with the clutch in matches revs and avoids that abrupt engine braking that throws everyone forward."),
    ]}),
    art({ id: "vid-manual-habitos", track: "fundamentals", type: "video", system: "engine", traits: ["manualGearbox"], addedAt: "2026-08-08",
      media: { provider: "youtube", src: "puVd8XimuV4" },
      title: T("2 hábitos para evitar ao dirigir um carro manual", "2 habits to avoid when driving a manual"), body: [
      T("São dois costumes tão comuns que quase ninguém percebe que está fazendo — e os dois cobram caro na hora de trocar a embreagem.", "Two habits so common that almost nobody notices they're doing them — and both get expensive when it's time to replace the clutch."),
      T("O primeiro: descansar o pé sobre o pedal da embreagem enquanto dirige. Mesmo sem afundar, o peso da perna já encosta o rolamento no platô. Ele gira o tempo todo sob carga e morre bem antes da hora — e o disco começa a patinar.", "The first: resting your foot on the clutch pedal while driving. Even without pressing, the weight of your leg touches the release bearing against the pressure plate. It spins under load all the time and dies early — and the disc starts slipping."),
      T("O segundo: segurar o carro parado em subida usando a embreagem no ponto de atrito, em vez do freio. Nessa hora o disco está patinando de propósito, gerando calor puro. É o jeito mais rápido de queimar embreagem que existe.", "The second: holding the car on a hill with the clutch at the friction point instead of the brake. The disc is slipping on purpose, generating pure heat. It's the fastest way to burn a clutch there is."),
      T("As correções são simples: pé esquerdo no descanso sempre que não estiver trocando, e em subida use o freio de mão ou o pé no freio até a hora de sair. Sua embreagem pode durar o dobro só com isso.", "The fixes are simple: left foot on the dead pedal whenever you're not shifting, and on a hill use the handbrake or footbrake until you move off. Your clutch can last twice as long from that alone."),
      T("Bônus: parado no semáforo, prefira ponto morto com o pé no freio. Ficar com a marcha engatada e a embreagem pisada mantém o rolamento sob carga sem necessidade.", "Bonus: at a red light, prefer neutral with your foot on the brake. Sitting in gear with the clutch down keeps the bearing loaded for no reason."),
    ]}),
    art({ id: "vid-pneu-indices", track: "fundamentals", type: "video", system: "tires", addedAt: "2026-08-08",
      media: { provider: "youtube", src: "pEELOa-PWBE" },
      title: T("Pneu: o que são os índices de carga e velocidade", "Tires: what the load and speed ratings mean"), body: [
      T("Depois da medida, o pneu traz dois códigos que quase ninguém olha na hora de comprar — e são justamente os que dizem se aquele pneu pode ou não rodar no seu carro.", "After the size, a tire carries two codes almost nobody checks when buying — and they're exactly the ones that say whether that tire may run on your car."),
      T("Num 91V, o 91 é o índice de CARGA: o peso máximo que aquele pneu aguenta, consultado numa tabela. O 91 equivale a 615 kg por pneu. Quatro pneus, mais de 2,4 toneladas de capacidade.", "In a 91V, the 91 is the LOAD index: the maximum weight that tire supports, read from a table. 91 equals 615 kg per tire. Four tires, over 2.4 tonnes of capacity."),
      T("A letra é o índice de VELOCIDADE, a máxima que o pneu suporta com segurança de forma contínua. T é 190 km/h, H é 210, V é 240, W é 270. Não é sugestão: acima disso a estrutura aquece além do previsto.", "The letter is the SPEED rating, the maximum the tire safely sustains. T is 190 km/h, H is 210, V is 240, W is 270. It's not a suggestion: beyond that the carcass heats past its design limit."),
      T("A regra prática: nunca monte pneu com índice ABAIXO do que a montadora especifica — está na etiqueta da coluna da porta ou no manual. Índice maior pode; menor compromete segurança e ainda pode invalidar seguro em caso de acidente.", "Rule of thumb: never fit a tire rated BELOW what the manufacturer specifies — it's on the door-jamb label or in the manual. Higher is fine; lower compromises safety and may even void insurance in a crash."),
    ]}),
    art({ id: "vid-pneu-medidas", track: "fundamentals", type: "video", system: "tires", addedAt: "2026-08-08",
      media: { provider: "youtube", src: "30LdSYoE_-0" },
      title: T("Como ler a medida do pneu (225/45 R17)", "How to read tire size (225/45 R17)"), body: [
      T("Aquela sequência na lateral do pneu não é código secreto: cada número diz uma dimensão, e entender isso evita comprar errado.", "That sequence on the sidewall isn't a secret code: each number is a dimension, and understanding it keeps you from buying the wrong tire."),
      T("No 225/45 R17, o 225 é a LARGURA da banda de rodagem em milímetros — de um flanco ao outro.", "In 225/45 R17, the 225 is the tread WIDTH in millimetres — from one sidewall to the other."),
      T("O 45 é o PERFIL, e essa é a parte que confunde: não é milímetro, é porcentagem da largura. A altura do flanco é 45% de 225, ou seja, cerca de 101 mm. Por isso o mesmo perfil 45 dá alturas diferentes em larguras diferentes.", "The 45 is the ASPECT RATIO, and this is the confusing part: it's not millimetres, it's a percentage of the width. Sidewall height is 45% of 225 — about 101 mm. That's why the same 45 profile gives different heights at different widths."),
      T("O R indica construção radial, padrão em praticamente todo pneu de passeio. E o 17 é o diâmetro do ARO, esse sim em polegadas — a única medida em polegada da sequência.", "The R means radial construction, standard on virtually every passenger tire. And 17 is the RIM diameter, this one in inches — the only imperial measurement in the sequence."),
      T("Detalhe que salva dinheiro: mudar a medida altera o diâmetro total da roda e desregula o velocímetro e o hodômetro. Se for mudar, procure uma combinação que mantenha o diâmetro externo próximo do original.", "A money-saving detail: changing the size alters overall rolling diameter and throws off the speedometer and odometer. If you do change, look for a combination that keeps the outer diameter close to stock."),
    ]}),
    art({ id: "vid-gasolina-e30", track: "money", type: "video", system: "engine", addedAt: "2026-08-08",
      media: { provider: "youtube", src: "GfO31Icr5bg" },
      title: T("A gasolina com 30% de etanol: o que muda para você", "Gasoline with 30% ethanol: what changes for you"), body: [
      T("A gasolina comum vendida no Brasil não é gasolina pura: ela já vem misturada com etanol anidro. Essa proporção subiu, e isso mexe com consumo e com a conta do posto.", "Regular gasoline sold in Brazil isn't pure gasoline: it already comes blended with anhydrous ethanol. That share went up, and it affects both consumption and what you pay at the pump."),
      T("O etanol tem menos energia por litro que a gasolina. Quanto maior a fatia de etanol na mistura, um pouco menos o litro rende — a diferença é pequena, na casa de 1%, mas existe e aparece no tanque cheio.", "Ethanol carries less energy per litre than gasoline. The bigger the ethanol share, the slightly less each litre delivers — the difference is small, around 1%, but it's real and shows up over a full tank."),
      T("Carro flex lida com isso sem drama: a central lê o sensor e ajusta a injeção sozinha. Modelos antigos não-flex, anteriores a 2003, são os que pedem atenção — vale confirmar no manual qual mistura o motor aceita.", "Flex-fuel cars handle it without drama: the ECU reads the sensor and adjusts fuelling on its own. Older non-flex models, before 2003, are the ones needing attention — check the manual for the blend the engine accepts."),
      T("Na prática o que muda para o seu bolso é a régua de comparação. Aquela regra dos 70% entre etanol e gasolina se desloca um pouco quando a mistura muda, então não decida de cabeça.", "In practice what changes for your wallet is the yardstick. That 70% rule between ethanol and gasoline shifts a little when the blend changes, so don't decide from memory."),
      T("Use a calculadora de Etanol × Gasolina aqui do app: ela compara com o consumo REAL do seu carro, que é o único número que importa para a sua decisão no posto.", "Use the Ethanol × Gasoline calculator here in the app: it compares using your car's REAL consumption, the only number that matters for your decision at the pump."),
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
      forYouTitle: T("Para você", "For you"),
      newBadge: T("Novo", "New"),
      pinnedTitle: T("Fixados", "Pinned"),
      revisionsCard: T("Próximas revisões", "Upcoming service"),
      completeCarCard: T("Complete os dados do carro", "Finish your car's info"),
      completeCarWhy: T("Faltam dados para revisões precisas", "Missing data for a precise service plan"),
      forYouSub: T("Baseado no seu nível e no seu carro", "Based on your level and your car"),
      memoriesTitle: T("Memórias", "Memories"),
      seeAll: T("Ver todas", "See all"),
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
      trialFineMonthly: T("Após o período grátis, R$ 29,90 por mês. Cancele quando quiser.", "After the free trial, R$ 29.90 per month. Cancel anytime."),
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
