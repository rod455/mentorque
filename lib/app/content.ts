import type { Locale } from "@/lib/i18n";
import type { Access, Level, Severity, Tag, Vehicle } from "./types";

// All prototype copy + mocked data live here, resolved per locale so every
// screen is bilingual from day one. Data is intentionally generic / "by
// platform" — the exact model-year depth becomes consulting work (spec §1).

export type Intention = { tag: Tag; icon: string; label: string; blurb: string };
export type LevelOption = { key: Level; label: string; blurb: string; pro?: boolean };

// Rough "new price" per model in BRL thousands — only to drive a believable
// FIPE-style estimate in the trade-in flow (mocked; real FIPE API comes later).
const FIPE_BASE_K: Record<string, number> = {
  Gol: 75, Polo: 95, "T-Cross": 140, Nivus: 130,
  Onix: 90, Tracker: 130, Cruze: 130, S10: 230,
  Argo: 85, Strada: 110, Mobi: 70, Toro: 180,
  Corolla: 160, Hilux: 280, Yaris: 100, "Corolla Cross": 200,
  Civic: 200, City: 130, "HR-V": 180, "CG 160": 16, "CB 500": 45, PCX: 22,
  HB20: 90, Creta: 150, Tucson: 230,
  Ka: 80, Ranger: 280, Bronco: 400,
  Kwid: 75, Duster: 130, Sandero: 90,
  "Fazer 250": 22, "MT-03": 35, "Factor 150": 16,
  "GSX-S750": 55, Burgman: 25, "DR 160": 18,
  "Meteor 350": 30, Himalayan: 45, "Classic 350": 30,
};

// Estimate a vehicle's resale value: base price depreciated ~8%/yr, then a
// condition factor (1.0 great … 0.85 fair). Rounded to a tidy figure.
export function estimateFipe(model: string, year: number, conditionFactor = 1): number {
  const baseK = FIPE_BASE_K[model] ?? 90;
  const age = Math.max(0, 2026 - year);
  const v = baseK * 1000 * Math.pow(0.92, age) * conditionFactor;
  return Math.max(5000, Math.round(v / 500) * 500);
}

export function formatBRL(n: number): string {
  return "R$ " + Math.round(n).toLocaleString("pt-BR");
}

export function getContent(locale: Locale) {
  const T = (pt: string, en: string) => (locale === "pt" ? pt : en);

  // Q2 — "O que você quer fazer no MentorQ?" (multiple choice, up to 3).
  const intentions: Intention[] = [
    { tag: "learn_cars", icon: "track", label: T("Aprender mais sobre carros", "Learn more about cars"), blurb: T("Curiosidade que vira conhecimento", "Curiosity that becomes know-how") },
    { tag: "understand", icon: "car", label: T("Entender melhor o meu carro", "Understand my car better"), blurb: T("Saiba o que cada peça faz", "Know what each part does") },
    { tag: "fix", icon: "diagnose", label: T("Resolver um problema que apareceu", "Fix a problem that came up"), blurb: T("Diagnóstico imediato", "Diagnose it now") },
    { tag: "mechanics", icon: "tools", label: T("Aprender mecânica", "Learn mechanics"), blurb: T("Do básico ao avançado", "From basics to advanced") },
    { tag: "electronics", icon: "diagnose", label: T("Aprender eletrônica automotiva", "Learn automotive electronics"), blurb: T("Sensores, injeção e diagnóstico", "Sensors, injection & diagnostics") },
    { tag: "career", icon: "community", label: T("Me preparar para trabalhar na área", "Get ready to work in the field"), blurb: T("Trilhas + certificado", "Tracks + certificate") },
    { tag: "maintenance", icon: "calendar", label: T("Melhorar a manutenção do meu carro", "Improve my car's upkeep"), blurb: T("Manutenção no tempo certo", "Maintenance at the right time") },
    { tag: "curiosity", icon: "check", label: T("Apenas matar minha curiosidade", "Just satisfy my curiosity"), blurb: T("Sem compromisso", "No strings attached") },
  ];

  // Q3 — "Qual seu nível?" (single choice). Pro tiers unlock the industry shortcut.
  const levels: LevelOption[] = [
    { key: "beginner", label: T("Iniciante", "Beginner"), blurb: T("Tô começando agora", "Just getting started") },
    { key: "intermediate", label: T("Intermediário", "Intermediate"), blurb: T("Já mexo no básico", "I handle the basics") },
    { key: "advanced", label: T("Avançado", "Advanced"), blurb: T("Faço boa parte sozinho", "I do most of it myself") },
    { key: "mechanic", label: T("Sou mecânico", "I'm a mechanic"), blurb: T("Trabalho com isso", "It's my trade"), pro: true },
    { key: "eng_student", label: T("Sou estudante de engenharia", "Engineering student"), blurb: T("Estudando a área", "Studying the field"), pro: true },
    { key: "engineer", label: T("Sou engenheiro", "I'm an engineer"), blurb: T("Formado na área", "Qualified in the field"), pro: true },
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
  // Include the latest model year (2026 versions are already out).
  const years = Array.from({ length: 17 }, (_, i) => 2026 - i);

  // ---- Mocked vehicle profile ---------------------------------------------
  const problems: { title: string; severity: Severity; cost: string; detail: Access; cause: string; solution: string }[] = [
    { title: T("Pastilhas de freio gastas", "Worn brake pads"), severity: "high", cost: "R$ 250–600", detail: "premium", cause: T("Atrito normal ao longo dos km; piora com trânsito parado.", "Normal friction over the kms; worse in stop-and-go traffic."), solution: T("Trocar as pastilhas e, se houver vibração, retificar os discos.", "Replace the pads and, if there's vibration, resurface the rotors.") },
    { title: T("Falha na ignição (velas)", "Misfire (spark plugs)"), severity: "medium", cost: "R$ 180–450", detail: "premium", cause: T("Velas ou bobinas desgastadas deixam de queimar bem a mistura.", "Worn plugs or coils stop burning the mixture cleanly."), solution: T("Trocar o jogo de velas (e bobina, se acusar) e limpar bicos.", "Replace the plug set (and coil, if flagged) and clean injectors.") },
    { title: T("Ruído na suspensão dianteira", "Front suspension noise"), severity: "medium", cost: "R$ 300–900", detail: "premium", cause: T("Bandeja, bieleta ou batente desgastados batem em buracos.", "Worn control arm, link or bump-stop knocking over bumps."), solution: T("Identificar a peça folgada e trocar aos pares para alinhar o desgaste.", "Find the loose part and replace in pairs to even out wear.") },
    { title: T("Bateria perdendo carga", "Battery losing charge"), severity: "low", cost: "R$ 350–700", detail: "premium", cause: T("Bateria no fim da vida ou alternador carregando de menos.", "Battery near end of life or alternator undercharging."), solution: T("Testar carga e alternador; trocar a bateria se não segurar.", "Test charge and alternator; replace the battery if it won't hold.") },
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
    levels,
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
      welcomeCreator: T("Apresentado por quem trabalha na indústria — não é mais um curso genérico.", "Hosted by someone who works in the industry — not another generic course."),
      start: T("Vamos lá", "Let's go"),
      next: T("Continuar", "Continue"),
      haveAccount: T("Já tenho conta", "I already have an account"),

      // Q1 — vehicle
      vehicleTitle: T("Qual carro você dirige?", "Which car do you drive?"),
      vehicleHint: T("Marca, modelo e ano. Tudo no app se ajusta a ele.", "Make, model and year. Everything in the app adapts to it."),
      car: T("Carro", "Car"),
      moto: T("Moto", "Motorcycle"),
      make: T("Marca", "Make"),
      model: T("Modelo", "Model"),
      year: T("Ano", "Year"),
      engine: T("Motorização (opcional)", "Engine / trim (optional)"),
      enginePh: T("ex.: 1.0 TSI, 2.0 Flex", "e.g. 1.0 TSI, 2.0 Flex"),
      noVehicle: T("Ainda não tenho / quero só aprender", "I don't have one yet / just here to learn"),

      // Q2 — intentions (multiple choice, up to 3)
      intentTitle: T("O que você quer fazer no Mentorque?", "What do you want to do on Mentorque?"),
      intentHint: T("Escolha até 3.", "Pick up to 3."),
      intentCount: T("{n}/3 escolhidas", "{n}/3 selected"),

      // Q3 — level
      levelTitle: T("Qual é o seu nível?", "What's your level?"),
      levelHint: T("Pra calibrar a profundidade do conteúdo pra você.", "So we can calibrate how deep the content goes."),

      // Social proof / industry
      proofTitle: T("Conhecimento direto da indústria", "Knowledge straight from the industry"),
      proofBody: T("Quem te ensina trabalha no ramo automotivo de verdade — não é teoria de internet.", "The person teaching you actually works in the auto industry — not internet theory."),
      proofQuote: T("“Em uma semana entendi mais do meu carro do que em anos.”", "“In a week I understood more about my car than in years.”"),
      proofAuthor: T("— Marina, primeira turma", "— Marina, first cohort"),
      proofStat1: T("+2.000 na lista de espera", "+2,000 on the waitlist"),
      proofStat2: T("Aulas na voz de quem é da área", "Lessons from someone in the field"),

      ahaTitleDiag: T("Olha só o que já dá pra ver", "Look what we can already see"),
      ahaTitleLearn: T("Sua primeira aula", "Your first lesson"),
      ahaDiagBody: T("Com base no seu veículo, estes são os pontos que mais pesam no bolso — e a faixa de preço justa.", "Based on your vehicle, these are the items that hit your wallet hardest — with a fair price range."),
      ahaLearnBody: T("Comece pelos fundamentos, na voz de quem é da indústria. Conclua e ganhe certificado.", "Start with the fundamentals, from someone in the industry. Finish and earn a certificate."),
      ahaContinue: T("Quero ver mais", "Show me more"),

      accountTitle: T("Como podemos te chamar?", "What should we call you?"),
      accountBody: T("Seu nome e e-mail salvam sua garagem e seu progresso — é grátis.", "Your name and email save your garage and progress — it's free."),
      accountCta: T("Criar conta grátis", "Create free account"),
      accountSkip: T("Continuar sem conta", "Continue without an account"),
      namePh: T("Seu primeiro nome", "Your first name"),
      emailPh: T("Seu melhor e-mail", "Your best email"),

      offerTitle: T("Você está no plano grátis", "You're on the free plan"),
      offerBody: T("Veja o que está incluído — e o que o Premium destrava quando precisar.", "Here's what's included — and what Premium unlocks when you need it."),
      offerEnter: T("Entrar no app", "Enter the app"),
    },

    nav: {
      home: T("Início", "Home"),
      garage: T("Meu carro", "My car"),
      learn: T("Aprender", "Learn"),
      consulting: T("Consultoria", "Consulting"),
      diagnose: T("Diagnosticar", "Diagnose"),
      account: T("Conta", "Account"),
      profile: T("Perfil", "Profile"),
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
      morning: T("Bom dia", "Good morning"),
      afternoon: T("Boa tarde", "Good afternoon"),
      evening: T("Boa noite", "Good evening"),
      needsAttention: T("Precisa de atenção", "Needs attention"),
      continueTrack: T("Continue de onde parou", "Pick up where you left off"),
      commonProblems: T("Problemas comuns e custos", "Common problems & costs"),
      maintenanceNow: T("Manutenção: o que fazer agora", "Maintenance: what to do now"),
      diagnoseHighlight: T("Algo errado agora? Diagnostique", "Something wrong now? Diagnose it"),
      swapTitle: T("Vale a pena consertar ou trocar?", "Worth repairing or trading in?"),
      swapBody: T("Vimos sinais de custo de manutenção subindo. Veja uma análise antes de decidir.", "We've seen maintenance costs rising. See an analysis before you decide."),
      swapCta: T("Analisar troca", "Analyze trade-in"),
      consultingShortcut: T("Falar com a equipe", "Talk to the team"),

      // Big action cards on Home (post-onboarding)
      cards: {
        study: T("Estudar", "Study"),
        studySub: T("Cursos do básico ao avançado", "Courses from basics to advanced"),
        myCar: T("Meu carro", "My car"),
        myCarSub: T("Diagnóstico, manutenção e ficha", "Diagnosis, upkeep & spec sheet"),
        solve: T("Resolver um problema", "Solve a problem"),
        solveSub: T("Sintoma ou código OBD2", "By symptom or OBD2 code"),
        explore: T("Explorar", "Explore"),
        exploreSub: T("Bastidores da indústria e lives", "Industry behind-the-scenes & lives"),
        progress: T("Aprendizado", "My learning"),
        progressSub: T("Continue de onde parou", "Pick up where you left off"),
        ask: T("Perguntar ao MentorQ", "Ask MentorQ"),
        askSub: T("Ajuda humana quando travar", "Human help when you're stuck"),
      },
    },

    explore: {
      title: T("Explorar", "Explore"),
      intro: T("Conteúdo e bastidores de quem vive a indústria automotiva por dentro.", "Content and behind-the-scenes from people who live the auto industry."),
      items: [
        { title: T("Bastidores da indústria", "Industry behind-the-scenes"), body: T("O que a engenharia de montadora não conta — e você precisa saber.", "What carmaker engineering won't tell you — and you should know."), access: "premium" as Access },
        { title: T("Lives com a equipe", "Live sessions with the team"), body: T("Tira-dúvidas ao vivo e estudos de caso reais.", "Live Q&A and real case studies."), access: "free" as Access },
        { title: T("Comunidade Mentorque", "Mentorque community"), body: T("Troque experiências com outros donos e estudantes.", "Swap experiences with other owners and students."), access: "free" as Access },
        { title: T("Carreira na área automotiva", "A career in the auto field"), body: T("Trilhas e orientação pra quem quer trabalhar no ramo.", "Tracks and guidance for those aiming to work in the field."), access: "premium" as Access },
      ],
    },

    ask: {
      title: T("Perguntar ao MentorQ", "Ask MentorQ"),
      intro: T("Ajuda humana de verdade quando o vídeo não basta — em três níveis.", "Real human help when video isn't enough — in three tiers."),
    },

    industry: {
      badge: T("Direto da indústria", "Straight from the industry"),
      title: T("Atalho da indústria", "Industry shortcut"),
      body: T("Conteúdo e mentoria de quem trabalha no ramo — feito pra quem quer seguir na área.", "Content and mentoring from people in the trade — built for those pursuing the field."),
      cta: T("Acessar", "Open"),
    },

    critical: {
      title: T("Problemas críticos do seu carro", "Your car's critical problems"),
      intro: T("Os pontos que mais aparecem nesse modelo — com causa e solução.", "The issues that show up most on this model — with cause and fix."),
      cause: T("Causa provável", "Likely cause"),
      solution: T("Como resolver", "How to fix it"),
      solutionLocked: T("Veja a solução passo a passo no Premium.", "See the step-by-step fix on Premium."),
      open: T("Ver problemas críticos", "See critical problems"),
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

      // Premium ultra-personalization: exact engine + version of the car
      ultraTitle: T("Ultrapersonalização", "Ultra-personalization"),
      ultraBody: T("Informe o motor e a versão exatos do seu carro para deixar diagnósticos, peças e custos sob medida.", "Tell us your car's exact engine and version so diagnostics, parts and costs become tailor-made."),
      ultraEngine: T("Motor exato", "Exact engine"),
      ultraEnginePh: T("ex.: 1.4 TSI 250", "e.g. 1.4 TSI 250"),
      ultraVersion: T("Versão / acabamento", "Version / trim"),
      ultraVersionPh: T("ex.: Highline, Comfortline", "e.g. Highline, Comfortline"),
      ultraSave: T("Salvar personalização", "Save personalization"),
      ultraSaved: T("Personalização salva", "Personalization saved"),
      ultraLockedTitle: T("Ultrapersonalização do seu carro", "Ultra-personalize your car"),
      ultraLockedBody: T("Motor e versão exatos para deixar tudo sob medida. Recurso Premium.", "Exact engine and version to make everything tailor-made. Premium feature."),

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

    swap: {
      flowTitle: T("Trocar meu carro", "Trade in my car"),
      intro: T("Apoio à decisão — não é vitrine. Vamos montar um plano realista pra você trocar com segurança.", "Decision support — not a storefront. Let's build a realistic plan to swap with confidence."),
      start: T("Começar", "Start"),
      next: T("Continuar", "Continue"),
      back: T("Voltar", "Back"),

      targetTitle: T("Qual carro você está de olho?", "Which car do you have your eye on?"),
      targetHint: T("Escolha marca, modelo e ano do carro desejado.", "Pick the make, model and year you want."),

      currentTitle: T("Sobre o seu carro atual", "About your current car"),
      currentHint: T("Usamos isso pra estimar o valor na tabela FIPE.", "We use this to estimate the FIPE value."),
      odometer: T("Quilometragem atual (km)", "Current mileage (km)"),
      odometerPh: T("ex.: 60000", "e.g. 60000"),
      condition: T("Estado de conservação", "Condition"),
      condGreat: T("Ótimo", "Great"),
      condGood: T("Bom", "Good"),
      condFair: T("Regular", "Fair"),

      planTitle: T("Seu planejamento", "Your plan"),
      planHint: T("Sem julgamento — só pra montar o caminho.", "No judgment — just to map the path."),
      down: T("Quanto você tem de entrada hoje?", "How much can you put down today?"),
      downPh: T("ex.: 10000", "e.g. 10000"),
      monthly: T("Quanto consegue separar por mês?", "How much can you set aside monthly?"),
      monthlyPh: T("ex.: 800", "e.g. 800"),
      timeframe: T("Em quanto tempo quer trocar?", "When do you want to swap?"),
      tf6: T("6 meses", "6 months"),
      tf12: T("1 ano", "1 year"),
      tf24: T("2 anos", "2 years"),
      tf36: T("3 anos", "3 years"),

      result: T("Como você pode chegar lá", "How you can get there"),
      currentValue: T("Seu carro hoje (FIPE est.)", "Your car today (est. FIPE)"),
      targetValue: T("Carro desejado (est.)", "Target car (est.)"),
      difference: T("Diferença a cobrir", "Gap to cover"),
      coveredAlready: T("Boa! Seu carro + entrada já cobrem o desejado. Sobra cerca de {x}.", "Nice! Your car + down payment already cover it. About {x} to spare."),
      coveredBySaving: T("Guardando {m}/mês por {n}, você troca sem financiar.", "Saving {m}/month for {n}, you swap without financing."),
      coveredByFinance: T("Juntando o que dá, faltaria financiar cerca de {x} — parcela estimada {p}/mês.", "After saving what you can, you'd finance about {x} — est. {p}/month."),
      saveNeeded: T("Precisa guardar", "Need to save"),
      perMonth: T("por mês", "per month"),
      financeEst: T("Financiamento estimado", "Estimated financing"),
      disclaimer: T("Estimativas para planejamento. Em breve, propostas reais de parceiros (financiamento, seguro, lojistas) aqui dentro.", "Planning estimates. Soon, real partner offers (financing, insurance, dealers) right here."),
      missingVehicle: T("Cadastre seu carro atual primeiro pra estimarmos a FIPE.", "Add your current car first so we can estimate the FIPE."),
      finish: T("Concluir", "Done"),
      redo: T("Refazer", "Redo"),
      searchBrand: T("Buscar marca…", "Search make…"),
      searchModel: T("Buscar modelo…", "Search model…"),
      pickYearVersion: T("Ano e versão", "Year & version"),
      loadingFipe: T("Consultando a tabela FIPE…", "Querying the FIPE table…"),
      fipeSource: T("Fonte: tabela FIPE · BrasilAPI", "Source: FIPE table · BrasilAPI"),
      fipeOffline: T("FIPE indisponível agora — usando estimativa.", "FIPE unavailable now — using an estimate."),
      estimatedTag: T("estimado", "estimated"),
      fipeTag: "FIPE",
      noResults: T("Nada encontrado", "No results"),
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
