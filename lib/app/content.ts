import type { Locale } from "@/lib/i18n";
import type { Access, Severity, Tag, Vehicle } from "./types";

// All prototype copy + mocked data live here, resolved per locale so every
// screen is bilingual from day one. Data is intentionally generic / "by
// platform" — the exact model-year depth becomes consulting work (spec §1).

export type Intention = { tag: Tag; icon: string; label: string; blurb: string };

export function getContent(locale: Locale) {
  const T = (pt: string, en: string) => (locale === "pt" ? pt : en);

  const intentions: Intention[] = [
    { tag: "save", icon: "tools", label: T("Economizar e não cair em golpe na oficina", "Save money & avoid garage scams"), blurb: T("Preço justo e segunda opinião", "Fair price & a second opinion") },
    { tag: "care", icon: "car", label: T("Entender e cuidar do meu carro/moto", "Understand & care for my vehicle"), blurb: T("Manutenção no tempo certo", "Maintenance at the right time") },
    { tag: "learn", icon: "track", label: T("Aprender mecânica do zero", "Learn mechanics from scratch"), blurb: T("Do básico ao avançado", "From basics to advanced") },
    { tag: "career", icon: "community", label: T("Trabalhar com mecânica / certificado", "Work in mechanics / get certified"), blurb: T("Trilhas + certificado", "Tracks + certificate") },
    { tag: "urgent", icon: "diagnose", label: T("Resolver um problema que tô tendo agora", "Fix a problem I'm having right now"), blurb: T("Diagnóstico imediato", "Diagnose it now") },
  ];

  // ---- Vehicle picker data -------------------------------------------------
  const makes: Record<"car" | "moto", string[]> = {
    car: ["Volkswagen", "Chevrolet", "Fiat", "Toyota", "Honda", "Hyundai", "Ford", "Renault"],
    moto: ["Honda", "Yamaha", "Suzuki", "Royal Enfield"],
  };
  const modelsByMake: Record<string, string[]> = {
    Volkswagen: ["Gol", "Polo", "T-Cross", "Nivus"],
    Chevrolet: ["Onix", "Tracker", "Cruze", "S10"],
    Fiat: ["Argo", "Strada", "Mobi", "Toro"],
    Toyota: ["Corolla", "Hilux", "Yaris", "Corolla Cross"],
    Honda: ["Civic", "City", "HR-V", "CG 160", "CB 500", "PCX"],
    Hyundai: ["HB20", "Creta", "Tucson"],
    Ford: ["Ka", "Ranger", "Bronco"],
    Renault: ["Kwid", "Duster", "Sandero"],
    Yamaha: ["Fazer 250", "MT-03", "Factor 150"],
    Suzuki: ["GSX-S750", "Burgman", "DR 160"],
    "Royal Enfield": ["Meteor 350", "Himalayan", "Classic 350"],
  };
  const years = Array.from({ length: 16 }, (_, i) => 2025 - i);

  // ---- Mocked vehicle profile ---------------------------------------------
  const problems: { title: string; severity: Severity; cost: string; detail: Access }[] = [
    { title: T("Pastilhas de freio gastas", "Worn brake pads"), severity: "high", cost: "R$ 250–600", detail: "premium" },
    { title: T("Falha na ignição (velas)", "Misfire (spark plugs)"), severity: "medium", cost: "R$ 180–450", detail: "premium" },
    { title: T("Ruído na suspensão dianteira", "Front suspension noise"), severity: "medium", cost: "R$ 300–900", detail: "premium" },
    { title: T("Bateria perdendo carga", "Battery losing charge"), severity: "low", cost: "R$ 350–700", detail: "premium" },
  ];

  const maintenance: { title: string; when: string; cost: string; detail: Access }[] = [
    { title: T("Troca de óleo e filtro", "Oil & filter change"), when: T("a cada 10.000 km / 12 meses", "every 10,000 km / 12 months"), cost: "R$ 180–350", detail: "premium" },
    { title: T("Filtro de ar", "Air filter"), when: T("a cada 20.000 km", "every 20,000 km"), cost: "R$ 60–140", detail: "premium" },
    { title: T("Correia / corrente de distribuição", "Timing belt / chain"), when: T("a cada 60.000 km", "every 60,000 km"), cost: "R$ 600–1.500", detail: "premium" },
    { title: T("Fluido de freio", "Brake fluid"), when: T("a cada 2 anos", "every 2 years"), cost: "R$ 120–260", detail: "premium" },
  ];

  const symptoms: { id: string; label: string; causes: string[] }[] = [
    {
      id: "brake",
      label: T("Barulho ao frear", "Noise when braking"),
      causes: [T("Pastilhas de freio no fim", "Brake pads worn out"), T("Disco empenado ou riscado", "Warped or scored rotor"), T("Falta de lubrificação nas pinças", "Caliper needs lubrication")],
    },
    {
      id: "misfire",
      label: T("Carro engasga / perde força", "Engine hesitates / loses power"),
      causes: [T("Velas ou bobinas gastas", "Worn spark plugs or coils"), T("Filtro de combustível sujo", "Clogged fuel filter"), T("Sensor de oxigênio com falha", "Faulty oxygen sensor")],
    },
    {
      id: "cel",
      label: T("Luz da injeção acesa", "Check-engine light on"),
      causes: [T("Código de emissão (EGR/sonda)", "Emissions code (EGR/O2)"), T("Tampa de combustível solta", "Loose fuel cap"), T("Falha intermitente de ignição", "Intermittent misfire")],
    },
    {
      id: "start",
      label: T("Dificuldade para ligar", "Hard to start"),
      causes: [T("Bateria fraca", "Weak battery"), T("Motor de arranque", "Starter motor"), T("Bomba de combustível", "Fuel pump")],
    },
  ];

  const specs: { label: string; value: string; access: Access }[] = [
    { label: T("Motor (plataforma)", "Engine (platform)"), value: T("1.0–1.6 aspirado / turbo flex", "1.0–1.6 NA / turbo flex"), access: "free" },
    { label: T("Combustível", "Fuel"), value: T("Flex (etanol/gasolina)", "Flex (ethanol/gasoline)"), access: "free" },
    { label: T("Câmbio", "Transmission"), value: T("Manual 5/6 ou automático", "5/6-speed manual or automatic"), access: "free" },
    { label: T("Óleo recomendado", "Recommended oil"), value: "5W-30 / 5W-40", access: "free" },
    { label: T("Detalhe exato do seu ano", "Exact spec for your year"), value: T("confirmar com a equipe", "confirm with the team"), access: "consulting" },
  ];

  const tracks: { title: string; level: string; lessons: number; access: Access }[] = [
    { title: T("Fundamentos do carro", "Car fundamentals"), level: T("Iniciante", "Beginner"), lessons: 8, access: "free" },
    { title: T("Sistema de freios", "Brake systems"), level: T("Intermediário", "Intermediate"), lessons: 6, access: "premium" },
    { title: T("Motor e injeção eletrônica", "Engine & fuel injection"), level: T("Avançado", "Advanced"), lessons: 10, access: "premium" },
    { title: T("Diagnóstico com OBD2", "Diagnostics with OBD2"), level: T("Intermediário", "Intermediate"), lessons: 5, access: "premium" },
  ];

  const consultingTiers: { name: string; body: string; access: Access; cta: string }[] = [
    { name: T("Comunidade", "Community"), body: T("Poste sua dúvida e receba orientação da comunidade e de moderadores.", "Post your question and get guidance from the community and moderators."), access: "free", cta: T("Abrir comunidade", "Open community") },
    { name: T("Diagnóstico pela equipe", "Team diagnosis"), body: T("A equipe analisa sintomas, fotos e códigos OBD2 e devolve um plano de ação.", "The team reviews symptoms, photos and OBD2 codes and returns an action plan."), access: "premium", cta: T("Pedir diagnóstico", "Request diagnosis") },
    { name: T("1:1 com o creator", "1:1 with the creator"), body: T("Sessão individual para casos difíceis ou decisão de compra. Vagas limitadas.", "One-on-one session for hard cases or buying decisions. Limited slots."), access: "consulting", cta: T("Agendar sessão", "Book a session") },
  ];

  // Parts/services that can be logged in a "última revisão".
  const serviceItems: { key: string; label: string }[] = [
    { key: "oil", label: T("Óleo do motor", "Engine oil") },
    { key: "oilfilter", label: T("Filtro de óleo", "Oil filter") },
    { key: "airfilter", label: T("Filtro de ar", "Air filter") },
    { key: "brakepads", label: T("Pastilhas de freio", "Brake pads") },
    { key: "belt", label: T("Correia / corrente", "Belt / chain") },
    { key: "spark", label: T("Velas", "Spark plugs") },
    { key: "brakefluid", label: T("Fluido de freio", "Brake fluid") },
    { key: "tires", label: T("Pneus", "Tires") },
    { key: "battery", label: T("Bateria", "Battery") },
    { key: "coolant", label: T("Arrefecimento", "Coolant") },
  ];

  // ---- UI strings ----------------------------------------------------------
  return {
    intentions,
    makes,
    modelsByMake,
    years,
    problems,
    maintenance,
    symptoms,
    specs,
    tracks,
    consultingTiers,
    serviceItems,

    onboarding: {
      welcomeEyebrow: T("Mentorque", "Mentorque"),
      welcomeTitle: T("Seu especialista de mecânica, no bolso", "Your mechanic mentor, in your pocket"),
      welcomeBody: T("Entenda seu carro, economize na oficina e tenha ajuda humana quando travar.", "Understand your car, save at the shop, and get human help when you're stuck."),
      welcomeCreator: T("Apresentado pelo creator — não é mais um curso genérico.", "Hosted by the creator — not another generic course."),
      start: T("Vamos lá", "Let's go"),
      haveAccount: T("Já tenho conta", "I already have an account"),

      intentTitle: T("O que você busca?", "What are you here for?"),
      intentHint: T("Marque quantas quiser.", "Pick as many as you like."),
      principalTitle: T("E o principal?", "And the main one?"),
      principalHint: T("Isso define o fio condutor da sua experiência.", "This sets the main thread of your experience."),

      vehicleTitle: T("Seu veículo", "Your vehicle"),
      vehicleHint: T("Tudo se ajusta a ele.", "Everything adapts to it."),
      car: T("Carro", "Car"),
      moto: T("Moto", "Motorcycle"),
      make: T("Marca", "Make"),
      model: T("Modelo", "Model"),
      year: T("Ano", "Year"),
      noVehicle: T("Ainda não tenho / quero só aprender", "I don't have one yet / just here to learn"),

      ahaTitleDiag: T("Olha só o que já dá pra ver", "Look what we can already see"),
      ahaTitleLearn: T("Sua primeira aula", "Your first lesson"),
      ahaDiagBody: T("Com base no seu veículo, estes são os pontos que mais pesam no bolso — e a faixa de preço justa.", "Based on your vehicle, these are the items that hit your wallet hardest — with a fair price range."),
      ahaLearnBody: T("Comece pelos fundamentos, na voz do creator. Conclua e ganhe certificado.", "Start with the fundamentals, in the creator's voice. Finish and earn a certificate."),
      ahaContinue: T("Quero ver mais", "Show me more"),

      accountTitle: T("Salve sua garagem e esse diagnóstico", "Save your garage and this diagnosis"),
      accountBody: T("Crie sua conta pra não perder nada — é grátis.", "Create your account so you don't lose anything — it's free."),
      accountCta: T("Criar conta grátis", "Create free account"),
      accountSkip: T("Continuar sem conta", "Continue without an account"),
      emailPh: T("Seu melhor e-mail", "Your best email"),

      offerTitle: T("Você está no plano grátis", "You're on the free plan"),
      offerBody: T("Veja o que está incluído — e o que o Premium destrava quando precisar.", "Here's what's included — and what Premium unlocks when you need it."),
      offerEnter: T("Entrar no app", "Enter the app"),
    },

    nav: {
      home: T("Início", "Home"),
      garage: T("Minha garagem", "My garage"),
      learn: T("Aprender", "Learn"),
      consulting: T("Consultoria", "Consulting"),
      diagnose: T("Diagnosticar", "Diagnose"),
      account: T("Conta", "Account"),
    },

    common: {
      free: T("Grátis", "Free"),
      premium: "Premium",
      consulting: T("Consultoria", "Consulting"),
      locked: T("Premium", "Premium"),
      seeAll: T("Ver tudo", "See all"),
      back: T("Voltar", "Back"),
      typicalCost: T("Custo típico", "Typical cost"),
      unlock: T("Destravar com Premium", "Unlock with Premium"),
    },

    home: {
      greeting: T("Bem-vindo de volta", "Welcome back"),
      needsAttention: T("Precisa de atenção", "Needs attention"),
      continueTrack: T("Continue de onde parou", "Pick up where you left off"),
      commonProblems: T("Problemas comuns e custos", "Common problems & costs"),
      maintenanceNow: T("Manutenção: o que fazer agora", "Maintenance: what to do now"),
      diagnoseHighlight: T("Algo errado agora? Diagnostique", "Something wrong now? Diagnose it"),
      swapTitle: T("Vale a pena consertar ou trocar?", "Worth repairing or trading in?"),
      swapBody: T("Vimos sinais de custo de manutenção subindo. Veja uma análise antes de decidir.", "We've seen maintenance costs rising. See an analysis before you decide."),
      swapCta: T("Analisar troca", "Analyze trade-in"),
      consultingShortcut: T("Falar com a equipe", "Talk to the team"),
    },

    garage: {
      title: T("Minha garagem", "My garage"),
      add: T("Adicionar veículo", "Add vehicle"),
      tabs: {
        overview: T("Visão geral", "Overview"),
        maintenance: T("Manutenção", "Maintenance"),
        diagnosis: T("Diagnóstico", "Diagnosis"),
        specs: T("Ficha técnica", "Spec sheet"),
      },
      detected: T("Código/sintoma detectado", "Code/symptom detected"),
      detectedBody: T("Leitura OBD2 sugere falha de ignição no cilindro 3.", "OBD2 reading suggests a misfire on cylinder 3."),
      problemsTitle: T("Problemas comuns por severidade", "Common problems by severity"),
      recalls: T("Recalls e alertas de segurança", "Recalls & safety alerts"),
      recallNone: T("Nenhum recall em aberto para esta plataforma.", "No open recalls for this platform."),
      stepByStep: T("Passo a passo do reparo", "Repair step-by-step"),
      fairPrice: T("Estimador de preço justo + negociação", "Fair-price estimator + negotiation guide"),
      teamReview: T("Revisão do diagnóstico pela equipe", "Team review of your diagnosis"),
      planTitle: T("Plano por km / tempo", "Plan by km / time"),
      checklist: T("Checklist: o que fazer agora", "Checklist: what to do now"),
      oilAffiliate: T("Óleo e peças recomendadas", "Recommended oil & parts"),
      affiliateTag: T("link parceiro", "affiliate link"),
      history: T("Histórico do veículo", "Vehicle history"),
      symptomTitle: T("Diagnóstico por sintoma", "Symptom diagnosis"),
      symptomHint: T("Escolha o que você sente:", "Pick what you're noticing:"),
      probableCauses: T("Causas prováveis", "Probable causes"),
      obdBasic: T("Leitura OBD2 básica", "Basic OBD2 reading"),
      obdFull: T("Leitura OBD2 completa", "Full OBD2 reading"),
      deepDiag: T("Diagnóstico aprofundado + reparo", "Deep diagnosis + repair"),
      specsConfirm: T("Confirmação do detalhe exato do seu ano", "Confirm the exact spec for your year"),
      learnOnlyTitle: T("Você está na trilha de aprender", "You're on the learning track"),
      learnOnlyBody: T("Cadastre um veículo quando tiver um — aí a garagem ganha vida.", "Add a vehicle when you have one — the garage comes alive then."),
    },

    hero: {
      addPhoto: T("Adicionar foto", "Add photo"),
      changePhoto: T("Trocar foto", "Change photo"),
      odometer: T("km rodados", "km driven"),
      setOdometer: T("Informe a quilometragem", "Set the odometer"),
    },

    service: {
      cardTitle: T("Última revisão", "Last service"),
      register: T("Cadastrar última revisão", "Log last service"),
      update: T("Atualizar revisão", "Update service"),
      none: T("Nenhuma revisão cadastrada ainda", "No service logged yet"),
      sheetTitle: T("Última revisão", "Last service"),
      date: T("Data da revisão", "Service date"),
      km: T("Quilometragem (km)", "Odometer (km)"),
      kmPh: T("ex.: 45000", "e.g. 45000"),
      what: T("O que foi trocado / feito", "What was changed / done"),
      notes: T("Observações (opcional)", "Notes (optional)"),
      notesPh: T("ex.: feito na concessionária", "e.g. done at the dealership"),
      save: T("Salvar revisão", "Save service"),
      on: T("em", "on"),
      atKm: T("aos", "at"),
      kmShort: "km",
      itemsLabel: T("Itens", "Items"),
      oilAlertTitle: T("Alerta de troca de óleo", "Oil-change reminder"),
      oilAlertBody: T("Avisamos quando faltar pouco pra próxima troca.", "We'll remind you as the next change gets close."),
      oilAlertCreate: T("Criar alerta", "Create reminder"),
      oilAlertOn: T("Alerta ativo", "Reminder on"),
      oilAlertPremium: T("Recurso Premium", "Premium feature"),
      nextOil: T("Próxima troca por volta de", "Next change around"),
    },

    learn: {
      title: T("Aprender", "Learn"),
      intro: T("Do iniciante ao avançado, na voz do creator. Certificado ao concluir.", "From beginner to advanced, in the creator's voice. Certificate on completion."),
      continue: T("Continuar", "Continue"),
      start: T("Começar", "Start"),
      lessons: T("aulas", "lessons"),
      certificate: T("com certificado", "with certificate"),
    },

    consulting: {
      title: T("Consultoria", "Consulting"),
      intro: T("Ajuda humana de verdade quando o vídeo não basta — em três níveis.", "Real human help when video isn't enough — in three tiers."),
      inlineNote: T("A maioria das conversas começa a partir de um problema do seu carro.", "Most conversations start from a problem with your car."),
    },

    account: {
      title: T("Conta", "Account"),
      plan: T("Plano atual", "Current plan"),
      free: T("Grátis", "Free"),
      premium: "Premium",
      upgrade: T("Fazer upgrade para Premium", "Upgrade to Premium"),
      manage: T("Gerenciar assinatura", "Manage subscription"),
      restore: T("Restaurar compra", "Restore purchase"),
      language: T("Idioma", "Language"),
      notifications: T("Notificações", "Notifications"),
      vehicles: T("Veículos cadastrados", "Saved vehicles"),
      terms: T("Termos e privacidade", "Terms & privacy"),
      reset: T("Reiniciar protótipo", "Reset prototype"),
      downgrade: T("Voltar ao grátis (demo)", "Back to free (demo)"),
    },

    diagnose: {
      title: T("Diagnosticar", "Diagnose"),
      bySymptom: T("Por sintoma", "By symptom"),
      byObd: T("Ler OBD2", "Read OBD2"),
      obdConnecting: T("Conectando ao adaptador OBD2…", "Connecting to OBD2 adapter…"),
      obdResult: T("1 código encontrado: P0303 — falha de ignição cil. 3", "1 code found: P0303 — cylinder 3 misfire"),
      resultTitle: T("Resultado", "Result"),
      oneFree: T("1 resultado no grátis. A profundidade é Premium.", "1 result on free. Depth is Premium."),
    },

    paywall: {
      title: T("Destrave o Premium", "Unlock Premium"),
      body: T("Profundidade, passo a passo, OBD2 completo, preço justo personalizado, trilhas com certificado e diagnóstico pela equipe.", "Depth, step-by-step, full OBD2, personalized fair price, tracks with certificate and team diagnosis."),
      bullets: [
        T("Passo a passo de cada problema e serviço", "Step-by-step for every problem and service"),
        T("Estimador de preço justo + guia de negociação", "Fair-price estimator + negotiation guide"),
        T("Trilhas completas com certificado", "Full tracks with certificate"),
        T("Diagnóstico revisado pela equipe", "Diagnosis reviewed by the team"),
      ],
      cta: T("Assinar Premium (demo)", "Subscribe to Premium (demo)"),
      later: T("Agora não", "Not now"),
      anchor: T("O cadeado-âncora é a revisão humana da equipe.", "The anchor lock is the team's human review."),
    },
  };
}

export type Content = ReturnType<typeof getContent>;

// Vehicle label helper used across screens.
export function vehicleLabel(v: Vehicle | null, fallback: string): string {
  if (!v) return fallback;
  return `${v.make} ${v.model} ${v.year}`;
}
