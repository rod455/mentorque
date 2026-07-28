import type { Locale } from "@/lib/i18n";
import type { Access, Severity, SystemKey, Vehicle } from "./types";

// All app copy + mocked catalog data, resolved per locale so every screen is
// bilingual. Per-model depth is intentionally generic (the exact model-year
// detail is where Premium / consulting adds value).

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
    car: ["Volkswagen", "Chevrolet", "Fiat", "Toyota", "Honda", "Hyundai", "Ford", "Renault", "Jeep", "Nissan"],
    moto: ["Honda", "Yamaha", "Suzuki", "Royal Enfield"],
  };
  const modelsByMake: Record<string, string[]> = {
    Volkswagen: ["Gol", "Polo", "T-Cross", "Nivus", "Virtus", "Voyage", "Saveiro", "Tera"],
    Chevrolet: ["Onix", "Tracker", "Cruze", "S10", "Spin"],
    Fiat: ["Argo", "Strada", "Mobi", "Toro", "Pulse"],
    Toyota: ["Corolla", "Hilux", "Yaris", "Corolla Cross"],
    Honda: ["Civic", "City", "HR-V", "CG 160", "CB 500", "PCX"],
    Hyundai: ["HB20", "Creta", "Tucson"],
    Ford: ["Ka", "Ranger", "Bronco"],
    Renault: ["Kwid", "Duster", "Sandero"],
    Jeep: ["Renegade", "Compass", "Commander"],
    Nissan: ["Kicks", "Versa", "Frontier"],
    Yamaha: ["Fazer 250", "MT-03", "Factor 150"],
    Suzuki: ["GSX-S750", "Burgman", "DR 160"],
    "Royal Enfield": ["Meteor 350", "Himalayan", "Classic 350"],
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
      safety: [T("Negativo sai primeiro, entra por último", "Negative off first, on last"), T("Não encoste as duas chaves nos polos", "Don't bridge both terminals")] },
    { id: "diy-airfilter", track: "diy", title: T("Trocar o filtro de ar", "Replace the air filter"), type: "video", system: "engine", difficulty: "facil",
      media: { provider: "youtube", src: "jNQXAC9IVRw" }, body: [],
      need: [T("Filtro de ar novo", "New air filter")],
      steps: [T("Abra a caixa do filtro (presilhas ou parafusos)", "Open the airbox (clips or screws)"), T("Retire o filtro velho e limpe a caixa", "Remove the old filter and clean the box"), T("Encaixe o novo na posição correta e feche", "Fit the new one the right way and close")],
      safety: [T("Não ligue o motor com a caixa aberta", "Don't run the engine with the box open")] },
    { id: "diy-wipers", track: "diy", title: T("Trocar as palhetas do limpador", "Replace the wiper blades"), type: "video", system: "electrical", difficulty: "facil",
      media: { provider: "youtube", src: "jNQXAC9IVRw" }, body: [],
      need: [T("Palhetas do tamanho correto", "Correct-size blades")],
      steps: [T("Levante o braço e aperte a trava", "Lift the arm and press the tab"), T("Deslize a palheta velha para fora", "Slide the old blade out"), T("Encaixe a nova até ouvir o clique", "Clip the new one until it clicks")],
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
    years,
    symptoms,
    symptomPremium,
    lessons,
    serviceTypes,
    partsByType,
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
      cars: T("Meus Carros", "My Cars"),
      problems: T("Problemas", "Problems"),
      history: T("Histórico", "History"),
      studies: T("Estudos", "Studies"),
      profile: T("Perfil", "Profile"),
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
      searchPh: T("Busque por sintoma (ex: freio, motor, barulho)", "Search a symptom (e.g. brakes, engine, noise)"),
      none: T("Nenhum sintoma encontrado.", "No symptoms found."),
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
      seePlans: T("Ver planos", "See plans"),
      perksTitle: T("Seus benefícios", "Your benefits"),
      perksFreeTitle: T("Com o Premium você desbloqueia", "Premium unlocks"),
      perks: [
        T("Sintomas com todas as causas e preço por peça", "Symptoms with all causes and per-part pricing"),
        T("Saúde por sistema + projeção de custo", "Per-system health + cost projection"),
        T("Plano de revisão do seu modelo", "Maintenance plan for your model"),
        T("Histórico e relatórios ilimitados", "Unlimited history and reports"),
        T("Biblioteca de aulas completa", "Full lesson library"),
        T("Consultoria com especialista", "Expert consulting"),
      ],
      support: {
        title: T("Dúvidas ou sugestões?", "Questions or suggestions?"),
        subtitle: T("Fale direto com a gente", "Talk to us directly"),
        doubt: T("Dúvida", "Question"),
        suggestion: T("Sugestão", "Suggestion"),
        bug: "Bug",
        messagePh: T("Escreva sua mensagem aqui...", "Write your message here..."),
        send: T("Enviar mensagem", "Send message"),
        empty: T("Escreva uma mensagem antes de enviar.", "Write a message before sending."),
      },
      disclaimer: T(
        "Este app é independente e não possui vínculo com montadoras ou entidades oficiais. Marcas e modelos são citados apenas para fins informativos.",
        "This app is independent and not affiliated with automakers or official entities. Brands and models are cited for informational purposes only."
      ),
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
      later: T("Talvez depois", "Maybe later"),
      terms: T("Termos e política de privacidade", "Terms & privacy policy"),
      restore: T("Restaurar compra", "Restore purchase"),
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
