import type { Locale } from "@/lib/i18n";
import type { Severity, SystemKey, Vehicle } from "./types";
import { tradutor } from "./conteudo/base";
import { aulas } from "./conteudo/aulas";
import { consultoria } from "./conteudo/consultoria";
import { equipamentos } from "./conteudo/equipamentos";
import { servicos } from "./conteudo/servicos";
import { sintomas } from "./conteudo/sintomas";
import { veiculos } from "./conteudo/veiculos";


// All app copy + mocked catalog data, resolved per locale so every screen is
// bilingual. Per-model depth is intentionally generic (the exact model-year
// detail is where Premium / consulting adds value).

// Versão do app: aparece no rodapé do Perfil, viaja em CADA evento do funil,
// em cada erro capturado e em cada mensagem de suporte.
//
// Ela ficou parada em "1.2.0" durante a 1.3 e a 1.4 inteiras, e isso não é
// cosmético: em 29/08, tentando descobrir se um iPhone estava rodando a 1.4
// com o SDK de atribuição, o funil respondeu "1.2.0" para todo mundo e não
// serviu para nada. Um campo que mente é pior que um campo ausente, porque a
// gente confia nele.
//
// Por isso `npm run conferir` agora reprova se este número divergir do
// versionName do Android e do MARKETING_VERSION do iOS (scripts/verifica-versoes.mjs).
export const APP_VERSION = "1.8.0";

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

// As duas regras de data de uma aula moram num arquivo folha, sem imports, para
// poderem ser exercitadas pelo `npm run conferir:agenda` no node puro. Aqui
// ficam reexportadas para quem já as importava daqui.
export { isNewLesson, lessonPublicada } from "./regrasDeConteudo";

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

// A cópia das telas + a montagem do conteúdo.
//
// O CATÁLOGO NÃO MORA MAIS AQUI. Aulas, sintomas, equipamentos, veículos,
// serviços e consultoria viraram módulos em ./conteudo/, e este arquivo os
// compõe. Eram 1.700 linhas de DADOS misturadas com o texto da interface, e as
// duas coisas mudam por motivos diferentes: um modelo de carro novo por ano,
// uma frase reescrita por semana.
//
// O que sobrou aqui é a cópia, seção por seção, com o nome da seção igual ao
// da tela que a usa (`quiz`, `profile`, `subscribe`...). Para achar um texto,
// procure pelo nome da tela.
//
// `Content` continua sendo o tipo inferido deste retorno, então nada mudou
// para quem consome: `c.quiz.titulo` é o mesmo `c.quiz.titulo`.
export function getContent(locale: Locale) {
  const T = tradutor(locale);

  const cat = {
    ...veiculos(T),
    ...sintomas(T),
    ...aulas(T),
    ...servicos(T, locale),
    ...equipamentos(T),
    ...consultoria(T),
  };
  return {
    ...cat,

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
      kmAskTitle: T("Hora de atualizar o km", "Time to update the mileage"),
      kmAskBody: T("Faz um mês desde a última atualização. O último valor foi {km} km. Quanto marca o painel hoje?", "It's been a month since the last update. The last value was {km} km. What does the dash show today?"),
      kmAskPh: T("km atual: {km}", "current km: {km}"),
      kmAskSave: T("Salvar km", "Save mileage"),
      kmAskLater: T("Agora não", "Not now"),
      kmAskLower: T("O valor informado ({novo} km) é menor que o registrado ({atual} km). O km só anda para frente; confira o painel.", "The value entered ({novo} km) is lower than the recorded one ({atual} km). Mileage only goes up; check the dash."),
      kmAskInvalid: T("Digite o km em números, ex.: 45300.", "Type the mileage in numbers, e.g. 45300."),
      kmAskDone: T("Km atualizado!", "Mileage updated!"),
      quickTitle: T("Ações rápidas", "Quick actions"),
      qDiagnose: T("Diagnosticar", "Diagnose"),
      qService: T("Registrar serviço", "Log service"),
      qRevisions: T("Plano de revisão", "Service plan"),
      qStudies: T("Aprender", "Learn"),
      yourCar: T("Seu carro", "Your car"),
      switchCar: T("Trocar de carro", "Switch car"),
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
      houseBody: T("Assine o Premium e use o Mentorque sem interrupções, com o Biela ilimitado e todos os recursos.", "Go Premium and use Mentorque without interruptions, with unlimited Biela and every feature."),
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

    // Convite a criar conta logo depois de cadastrar o primeiro carro, para
    // quem está como convidado. O momento é escolhido: a pessoa acabou de
    // digitar marca, modelo, ano e km, e é aí que ela mais sente que tem algo
    // a perder. Convidar antes disso é pedir cadastro por nada.
    salvarGaragem: {
      title: T("Salve sua garagem", "Save your garage"),
      body: T(
        "Seu {carro} está guardado só neste aparelho. Criando sua conta, ele fica salvo e volta no celular novo, no tablet ou no navegador.",
        "Your {carro} is stored on this device only. Create your account and it comes back on a new phone, on a tablet or in the browser.",
      ),
      cta: T("Criar minha conta", "Create my account"),
      later: T("Agora não", "Not now"),
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
        // O botão diz o que o clique faz, por plano: quem escolheu o anual vê o
        // teste grátis que acabou de montar; quem escolheu o mensal sabe que a
        // cobrança é imediata. Achado da rodada do CRO de 23/08.
        cta: T("Continuar", "Continue"),
        ctaAnnual: T("Começar teste grátis", "Start free trial"),
        ctaMonthly: T("Assinar agora", "Subscribe now"),
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
      detailIntro: T("Veja o que pode ser, a urgência e quanto deve custar, e chegue na oficina sabendo o que pedir.", "See what it could be, how urgent it is and what it should cost, and walk into the shop knowing what to ask."),
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
      noCar: T("Cadastre seu carro para um cálculo mais preciso, por enquanto, usamos valores médios.", "Add your car for a more precise result, for now we use average values."),
      intro: T(
        "A famosa \"regra dos 70%\" é só o ponto de partida: o número certo depende do rendimento do SEU carro e do SEU motor. Preencha os preços do posto e a gente faz a conta certa.",
        "The famous \"70% rule\" is just a starting point: the right number depends on YOUR car's mileage and engine. Enter the pump prices and we'll do the real math."
      ),
      pricesTitle: T("Preços no posto (R$/litro)", "Pump prices (R$/liter)"),
      gasPrice: T("Gasolina comum", "Regular gasoline"),
      ethPrice: T("Etanol", "Ethanol"),
      pricePh: T("ex.: 6,09", "e.g. 6.09"),
      consumptionTitle: T("Consumo do seu carro (km/l)", "Your car's mileage (km/l)"),
      consumptionSub: T("Se souber, informe: deixa o cálculo exato. Não sabe? Deixe em branco que estimamos pelo motor.", "If you know it, fill it in: makes the math exact. Don't know? Leave blank and we'll estimate from the engine."),
      gasKmL: T("Na gasolina", "On gasoline"),
      ethKmL: T("No etanol", "On ethanol"),
      kmlPh: T("ex.: 11,5", "e.g. 11.5"),
      engineTitle: T("Sobre o seu motor", "About your engine"),
      engineSub: T("Só usamos isto quando falta algum consumo: motores turbo e de alta compressão aproveitam melhor o etanol.", "Only used when a km/l is missing: turbo and high-compression engines make better use of ethanol."),
      turboQ: T("O motor é turbo de fábrica?", "Is the engine factory-turbocharged?"),
      turboYes: T("Turbo de fábrica", "Factory turbo"),
      turboNo: T("Aspirado (sem turbo)", "Naturally aspirated"),
      compQ: T("Taxa de compressão acima de 12:1?", "Compression ratio above 12:1?"),
      compHint: T("Está na ficha técnica do carro, uma busca rápida por \"taxa de compressão {car}\" resolve.", "It's in the car's spec sheet, a quick search for \"{car} compression ratio\" finds it."),
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
      redo: T("Vale refazer a conta a cada abastecimento, os preços mudam de posto para posto.", "Worth redoing at every fill-up: prices change from station to station."),
    },

    obd2: {
      title: T("Códigos OBD2", "OBD2 codes"),
      entryTitle: T("Códigos OBD2", "OBD2 codes"),
      entrySub: T("Descubra o que a luz do painel está dizendo", "Find out what that dashboard light means"),
      intro: T(
        "Todo carro fabricado a partir de ~2010 no Brasil tem uma porta OBD2. Quando algo sai do normal, o carro grava um código de falha: é ele que acende a luz da injeção no painel. Lendo o código, você sai do achismo e descobre exatamente onde investigar.",
        "Every car made since ~2008 has an OBD2 port. When something goes off-spec, the car stores a fault code: that's what turns on the check-engine light. Reading the code takes out the guesswork and tells you exactly where to look."
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
        "Na grande maioria dos carros, a porta fica embaixo do painel, do lado do motorista: perto da coluna da direção, na altura dos joelhos. Em alguns modelos ela vem escondida atrás de uma tampinha plástica ou perto da caixa de fusíveis. É um conector trapezoidal de 16 pinos.",
        "In most cars the port sits under the dash on the driver's side: near the steering column, at knee height. In some models it hides behind a small plastic cover or near the fuse box. It's a 16-pin trapezoid connector."
      ),
      stepsTitle: T("Passo a passo da leitura", "Reading, step by step"),
      scanSteps: [
        T("Com o carro desligado, encaixe o leitor na porta OBD2 até firmar.", "With the car off, plug the reader into the OBD2 port until it's snug."),
        T("Ligue a ignição SEM dar partida (painel aceso). Alguns leitores também funcionam com o motor ligado.", "Turn the ignition ON without starting (dash lights on). Some readers also work with the engine running."),
        T("No celular, ative o Bluetooth e abra o app do leitor (ex.: Torque, Car Scanner, ELM327). Pareie com o dispositivo, o PIN costuma ser 1234 ou 0000.", "On your phone, enable Bluetooth and open the reader app (e.g. Torque, Car Scanner, ELM327). Pair with the device, the PIN is usually 1234 or 0000."),
        T("Toque em \"Ler códigos\" (ou \"Diagnóstico\") e aguarde alguns segundos.", "Tap \"Read codes\" (or \"Diagnostics\") and wait a few seconds."),
        T("Anote os códigos que aparecerem (ex.: P0300) e consulte o significado logo abaixo. Evite apagar os códigos antes de resolver a causa, a luz volta e você perde o histórico.", "Note the codes that appear (e.g. P0300) and look up their meaning below. Avoid clearing codes before fixing the cause, the light comes back and you lose the history."),
      ],
      searchTitle: T("Consultar um código", "Look up a code"),
      searchPh: T("Digite o código: ex.: P0300", "Type the code, e.g. P0300"),
      system: T("Sistema", "System"),
      meaning: T("O que significa", "What it means"),
      notFound: T("Não temos esse código na tabela, mas o Biela conhece todos.", "That code isn't in our table, but Biela knows them all."),
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
        { code: "P0130", meaning: T("Sonda lambda (sensor de O2) com falha: banco 1", "O2 sensor fault: bank 1"), system: T("Motor", "Engine"), level: "medium" },
        { code: "P0135", meaning: T("Aquecedor da sonda lambda com falha: banco 1", "O2 sensor heater fault: bank 1"), system: T("Motor", "Engine"), level: "low" },
        { code: "P0141", meaning: T("Aquecedor da sonda lambda pós-catalisador com falha", "Downstream O2 sensor heater fault"), system: T("Motor", "Engine"), level: "low" },
        { code: "P0171", meaning: T("Mistura pobre: banco 1 (ar demais ou combustível de menos)", "System too lean: bank 1"), system: T("Motor", "Engine"), level: "medium" },
        { code: "P0172", meaning: T("Mistura rica: banco 1 (combustível demais)", "System too rich: bank 1"), system: T("Motor", "Engine"), level: "medium" },
        { code: "P0300", meaning: T("Falhas de combustão aleatórias (misfire) em vários cilindros", "Random/multiple cylinder misfire"), system: T("Motor", "Engine"), level: "high" },
        { code: "P0301", meaning: T("Falha de combustão (misfire) no cilindro 1", "Cylinder 1 misfire"), system: T("Motor", "Engine"), level: "high" },
        { code: "P0302", meaning: T("Falha de combustão (misfire) no cilindro 2", "Cylinder 2 misfire"), system: T("Motor", "Engine"), level: "high" },
        { code: "P0303", meaning: T("Falha de combustão (misfire) no cilindro 3", "Cylinder 3 misfire"), system: T("Motor", "Engine"), level: "high" },
        { code: "P0304", meaning: T("Falha de combustão (misfire) no cilindro 4", "Cylinder 4 misfire"), system: T("Motor", "Engine"), level: "high" },
        { code: "P0325", meaning: T("Sensor de detonação (knock) com falha", "Knock sensor fault"), system: T("Motor", "Engine"), level: "medium" },
        { code: "P0335", meaning: T("Sensor de rotação do virabrequim com falha", "Crankshaft position sensor fault"), system: T("Motor", "Engine"), level: "high" },
        { code: "P0340", meaning: T("Sensor de fase do comando de válvulas com falha", "Camshaft position sensor fault"), system: T("Motor", "Engine"), level: "medium" },
        { code: "P0401", meaning: T("Fluxo insuficiente na válvula EGR", "EGR insufficient flow"), system: T("Motor", "Engine"), level: "medium" },
        { code: "P0420", meaning: T("Catalisador com eficiência abaixo do mínimo: banco 1", "Catalyst efficiency below threshold: bank 1"), system: T("Motor", "Engine"), level: "medium" },
        { code: "P0430", meaning: T("Catalisador com eficiência abaixo do mínimo: banco 2", "Catalyst efficiency below threshold: bank 2"), system: T("Motor", "Engine"), level: "medium" },
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
      guestNote: T("Você pode continuar como convidado: seus dados ficam salvos neste aparelho.", "You can keep using it as a guest: your data stays on this device."),
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
        "Estas são as áreas que têm relação com este problema: é aqui que a oficina deve olhar. Se sugerirem serviços fora desta lista, pergunte o motivo antes de aprovar.",
        "These are the areas related to this problem, this is where the shop should look. If they suggest work outside this list, ask why before approving."
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
        "A partir da marca, do ano e da quilometragem, o Mentorque calcula uma nota de saúde por sistema, motor, freios, suspensão, pneus e elétrica, e mostra o que está vencido.",
        "From the make, year and mileage, Mentorque computes a health score per system, engine, brakes, suspension, tires and electrical, and shows what's overdue."
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
      quizProvisional: T("Provisório: faça o quiz para o cálculo real", "Provisional: take the quiz for the real score"),
      quizTitle: T("Quiz de Saúde", "Health Quiz"),
      quizIntro: T("Responda com sinceridade: quanto mais preciso, melhor o diagnóstico.", "Answer honestly, the more accurate, the better the diagnosis."),
      quizSubmit: T("Ver resultado", "See result"),
      quizProgress: T("{a} de {b} respondidas", "{a} of {b} answered"),
      quizNow: T("Estado atual (VHS)", "Current condition (VHS)"),
      quizRisk: T("Risco futuro (VRI)", "Future risk (VRI)"),
      quizNowInfo: T(
        "VHS (Vehicle Health Score) mede o estado do carro HOJE: é a média ponderada das suas respostas do quiz com o histórico de manutenção. De 0 a 100%: quanto mais alto, melhor o estado atual.",
        "VHS (Vehicle Health Score) measures the car's condition TODAY: a weighted average of your quiz answers and the maintenance history. From 0 to 100%, the higher, the better."
      ),
      quizRiskInfo: T(
        "VRI (Vehicle Risk Index) estima o risco de problemas no FUTURO, olhando idade, quilometragem e a robustez do conjunto motor/câmbio. De 0 a 100: aqui, quanto MENOR o número, melhor.",
        "VRI (Vehicle Risk Index) estimates the risk of FUTURE problems, based on age, mileage and the robustness of the engine/transmission combo. From 0 to 100: here, the LOWER, the better."
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

    // Pergunta que aparece ao entrar numa conta que já tem garagem, quando o
    // aparelho tem carros cadastrados como convidado.
    importar: {
      title: T("Levar para a sua conta?", "Add to your account?"),
      body: T(
        "Estes carros foram cadastrados neste aparelho antes de você entrar na conta. Marque os que são seus.",
        "These cars were added on this device before you signed in. Check the ones that are yours."
      ),
      aviso: T(
        "O que não for marcado não vai para a sua conta.",
        "Anything left unchecked will not be added to your account."
      ),
      servico: T("serviço no histórico", "service logged"),
      servicos: T("serviços no histórico", "services logged"),
      semServico: T("sem histórico", "no history"),
      importar: T("Levar os marcados", "Add the checked ones"),
      importarNenhum: T("Não levar nenhum", "Do not add any"),
    },

    // Quiz diário. O tom aqui decide se a pessoa volta amanhã: a explicação
    // ensina, nunca corrige; errar não leva bronca; e a sequência é celebrada
    // sem virar chantagem ("não perca sua sequência!" é a frase que faz alguém
    // desinstalar em vez de voltar).
    quiz: {
      titulo: T("Pergunta do dia", "Question of the day"),
      abrirHome: T("Pergunta do dia", "Question of the day"),
      // O chip da barra de cima. Curto porque divide a linha com o carro e o sininho.
      chipTitulo: T("Quiz Diário", "Daily Quiz"),
      abrirHomeSub: T("Um minuto. Vale a sequência.", "One minute. Keeps your streak."),
      acertou: T("Acertou!", "Correct!"),
      errou: T("Não é essa", "Not this one"),
      // Depois de errar, o rótulo da opção certa. "A resposta é" e não "o
      // correto seria": a segunda soa como professor corrigindo prova.
      aRespostaE: T("A resposta é:", "The answer is:"),
      verAula: T("Ver a aula completa", "See the full lesson"),
      seguir: T("Seguir", "Continue"),
      // Sequência.
      sequenciaUm: T("1 dia seguido", "1 day in a row"),
      sequenciaN: T("{n} dias seguidos", "{n} days in a row"),
      sequenciaComecou: T("Sua sequência começou hoje", "Your streak starts today"),
      recorde: T("Seu recorde: {n}", "Your best: {n}"),
      recordeNovo: T("Novo recorde!", "New best!"),
      perdaoUsado: T(
        "Você faltou ontem e a sequência foi mantida. Todo mundo tem direito a um dia por semana.",
        "You missed yesterday and your streak was kept. Everyone gets one day a week."
      ),
      // Estatística do dia. Só aparece quando há gente suficiente; a tela
      // simplesmente omite a frase quando não há.
      placarCertos: T("{p}% acertaram hoje", "{p}% got it right today"),
      placarPoucos: T("Você foi um dos primeiros hoje", "You were one of the first today"),
      // Já respondeu.
      suaResposta: T("sua resposta", "your answer"),
      verAnteriores: T("Ver perguntas anteriores", "See earlier questions"),
      // Calendário do quiz.
      historicoTitulo: T("Perguntas anteriores", "Earlier questions"),
      historicoVazio: T(
        "As perguntas que você responder ficam guardadas aqui, e as que passaram continuam disponíveis.",
        "The questions you answer are kept here, and the ones you missed stay available."
      ),
      historicoLegendaAcerto: T("acertou", "correct"),
      historicoLegendaErro: T("errou", "wrong"),
      historicoLegendaAberto: T("em aberto", "unanswered"),
      historicoEscolhaDia: T("Toque num dia para ver ou responder", "Tap a day to see it or answer"),
      historicoDiaAberto: T("Você não respondeu neste dia", "You didn't answer on this day"),
      // A frase que evita a decepção de responder o passado esperando sequência.
      historicoSemSequencia: T(
        "Responder um dia que passou conta como estudo, mas não muda a sua sequência.",
        "Answering a past day counts as study, but doesn't change your streak."
      ),
      historicoForaDeAlcance: T("Fora do período disponível", "Outside the available period"),
      // A cerca do arquivo: grátis volta 7 dias, Premium volta tudo.
      historicoPremium: T(
        "No grátis, o calendário guarda 7 dias. Com o Premium, você volta em todas as perguntas desde o início.",
        "The free plan keeps 7 days. With Premium, you can go back to every question since the start."
      ),
      // O resumo é montado em duas metades justamente por causa da concordância:
      // "2 respondidas, 1 certas" está errado, e uma frase única não tem como
      // acertar os dois números ao mesmo tempo.
      historicoRespondidaUma: T("1 respondida", "1 answered"),
      historicoRespondidasN: T("{n} respondidas", "{n} answered"),
      historicoCertaUma: T("1 certa", "1 correct"),
      historicoCertasN: T("{n} certas", "{n} correct"),
      jaRespondeuTitulo: T("Você já respondeu hoje", "You've answered today"),
      jaRespondeuCorpo: T("A próxima sai amanhã. Vale a pena não perder.", "The next one is tomorrow. Worth not missing."),
      // Convite para ligar o aviso, mostrado depois de responder.
      avisoTitulo: T("Quer o de amanhã no celular?", "Want tomorrow's on your phone?"),
      avisoCorpo: T(
        "A gente manda um aviso quando a pergunta do dia sair. Nada além disso.",
        "We'll send one notification when the day's question is out. Nothing else."
      ),
      // Depois de 2+ dias de sequência o convite muda de argumento: aí a
      // pessoa tem algo a perder, e falar disso é honesto em vez de genérico.
      avisoCorpoSequencia: T(
        "Você está com {n} dias seguidos. O aviso é o que evita perder a sequência por esquecimento.",
        "You're on {n} days in a row. The reminder is what keeps a forgotten day from breaking it."
      ),
      avisoSim: T("Quero o aviso", "Yes, remind me"),
      avisoNao: T("Agora não", "Not now"),
      // Texto do aviso que sai na bandeja do celular. Curto porque a bandeja
      // corta, e sem ameaça porque notificação que cobra vira notificação
      // desligada.
      avisoPushTitulo: T("Pergunta do dia", "Question of the day"),
      avisoPushCorpo: T("A de hoje já saiu. Um minuto e a sequência continua.", "Today's is out. One minute keeps your streak going."),
      // Faixa no calendário.
      faixaResponder: T("Responda a pergunta do dia", "Answer today's question"),
      faixaFeito: T("Pergunta de hoje: feita", "Today's question: done"),
      // Com a sequência no selo da direita, o subtítulo ficou livre para dizer
      // o que interessa depois de responder: existe uma amanhã.
      faixaFeitoSub: T("A próxima sai amanhã", "The next one is tomorrow"),
      // A primeira vez. Dois textos porque são dois momentos: quem acabou de
      // cadastrar o carro merece a ligação com o que acabou de fazer; quem não
      // cadastrou recebe no dia seguinte e precisa de um convite que funcione
      // sem esse gancho.
      primeiroComCarro: T(
        "Carro na garagem. Enquanto você está aqui, uma pergunta rápida:",
        "Car in the garage. While you're here, a quick question:"
      ),
      primeiroSemCarro: T(
        "Toda manhã tem uma pergunta nova sobre carro. Esta é a de estreia:",
        "Every morning there's a new question about cars. Here's your first:"
      ),
      primeiroFecho: T(
        "É só isso: uma por dia, um minuto. Sua sequência começou hoje, e errar não quebra ela.",
        "That's it: one a day, one minute. Your streak starts today, and getting it wrong doesn't break it."
      ),
    },

    // Sino do cabeçalho. Todo aviso aqui é derivado do estado atual do app
    // (ver lib/app/avisos.ts), então os textos falam de coisa que a pessoa
    // ainda pode resolver. Nada de "você perdeu": aviso que só informa perda é
    // cobrança.
    avisos: {
      titulo: T("Avisos", "Alerts"),
      abrir: T("Abrir avisos", "Open alerts"),
      dispensar: T("Dispensar aviso", "Dismiss alert"),
      vazioTitulo: T("Nada por aqui", "All clear"),
      vazioCorpo: T(
        "Revisão perto do prazo, cobrança chegando ou aula nova aparecem nesta lista.",
        "Service coming due, an upcoming charge or a new lesson show up in this list."
      ),
      // Dois pontos, e não "no {carro}": o nome vem do apelido que a pessoa
      // deu, e apelido não combina com preposição fixa. "Revisão vencida no A
      // moto" é o tipo de frase que denuncia o modelo de texto.
      revisaoVencidaTitulo: T("Revisão vencida: {carro}", "Service overdue: {carro}"),
      revisaoVencidaCorpo: T("1 item passou do prazo.", "1 item is past due."),
      revisaoVencidaCorpoN: T("{n} itens passaram do prazo.", "{n} items are past due."),
      revisaoPertoTitulo: T("Revisão chegando: {carro}", "Service coming up: {carro}"),
      revisaoPertoCorpo: T("1 item está perto do prazo.", "1 item is close to due."),
      revisaoPertoCorpoN: T("{n} itens estão perto do prazo.", "{n} items are close to due."),
      assinaturaTituloHoje: T("Sua assinatura renova hoje", "Your subscription renews today"),
      assinaturaTitulo1: T("Sua assinatura renova amanhã", "Your subscription renews tomorrow"),
      assinaturaTituloN: T("Sua assinatura renova em {dias} dias", "Your subscription renews in {dias} days"),
      assinaturaCorpo: T(
        "A cobrança entra nessa data. Dá para cancelar antes no seu perfil.",
        "The charge goes through on that date. You can cancel before then in your profile."
      ),
      versaoTitulo: T("Versão nova na loja", "New version in the store"),
      versaoCorpo: T("Atualize para pegar as correções.", "Update to get the fixes."),
      aulaTitulo: T("Aula nova: {titulo}", "New lesson: {titulo}"),
      aulaCorpo: T("Toque para abrir.", "Tap to open."),
      aulaCorpoN: T("E mais {n} novas em Estudos.", "And {n} more in Learn."),
    },

    // Volta do checkout. Textos escritos para NÃO mandar tentar de novo: o
    // pagamento pode já ter entrado, e foi assim que um cliente quase pagou
    // duas vezes em 25/08.
    checkout: {
      confirmandoTitulo: T("Confirmando seu pagamento", "Confirming your payment"),
      confirmandoCorpo: T(
        "Leva alguns segundos. Pode deixar esta tela aberta, não precisa pagar de novo.",
        "This takes a few seconds. You can leave this screen open, there's no need to pay again."
      ),
      liberadoTitulo: T("Premium liberado", "Premium unlocked"),
      liberadoCorpo: T(
        "Tudo certo, o acesso já está valendo nesta conta e em qualquer aparelho onde você entrar.",
        "All set. Your access is live on this account and on any device where you sign in."
      ),
      liberadoBotao: T("Começar", "Get started"),
      // Bloco das lojas, só no navegador. Duas coisas ao mesmo tempo: quem
      // pagou pelo site ainda não tem o app instalado, e quem já tem pode estar
      // com ele aberto em segundo plano desde antes da compra. O aviso de
      // fechar e abrir é para as versões que já estão nas lojas, anteriores à
      // reconferência automática ao voltar para o app.
      liberadoAppTitulo: T("Leve no celular", "Take it on your phone"),
      liberadoAppCorpo: T(
        "Entre com o mesmo e-mail e o Premium vem junto. Se o app já estiver aberto no celular, feche e abra de novo para o acesso aparecer.",
        "Sign in with the same email and Premium comes with it. If the app is already open on your phone, close it and open it again for the access to show up."
      ),
      liberadoAppAndroid: T("Baixar para Android", "Get it on Android"),
      liberadoAppApple: T("Baixar para iPhone", "Get it for iPhone"),
      demorouTitulo: T("Ainda confirmando", "Still confirming"),
      demorouCorpo: T(
        "O pagamento pode já ter entrado, então NÃO pague de novo. O acesso costuma aparecer em alguns minutos, e você vai receber o recibo por e-mail. Se não liberar, fale com a gente com o e-mail da compra em mãos.",
        "The payment may already have gone through, so do NOT pay again. Access usually appears within a few minutes and you'll get the receipt by email. If it doesn't unlock, contact us with the purchase email at hand."
      ),
      demorouBotao: T("Entendi", "Got it"),
    },

    history: {
      title: T("Calendário do carro", "Car calendar"),
      // "Calendário do seu Golfinho": o título nomeia o carro ativo (pedido
      // do dono, 27/08). Com o seletor na barra de cima, o título é a
      // confirmação de qual carro a tela inteira está mostrando. Duas formas
      // por causa do gênero: "do seu" carro, "da sua" moto.
      titleCar: T("Calendário do seu {carro}", "Your {carro} calendar"),
      titleMoto: T("Calendário da sua {carro}", "Your {carro} calendar"),
      none: T("Nenhum serviço registrado ainda.", "No services logged yet."),
      add: T("Adicionar serviço", "Add service"),
      all: T("Todos", "All"),
      noCarTitle: T("Calendário vazio", "Empty calendar"),
      noCarBody: T("Cadastre seu carro para ter as informações!", "Add your car to see the info here!"),
      addCar: T("Cadastrar carro", "Add car"),
      // Convite do Premium para quem JÁ registrou serviços: a promessa
      // (relatório de gastos) só faz sentido com histórico na mão, e por isso
      // só aparece do segundo serviço em diante, longe do pedido de nota na
      // loja que acontece no primeiro. Rodada de 23/08.
      upsellHistorico: T(
        "Veja quanto já gastou com o carro e guarde histórico sem limite",
        "See how much you have spent and keep unlimited history",
      ),
    },

    addService: {
      title: T("Adicionar serviço", "Add service"),
      noCarBody: T("Cadastre seu carro para registrar o serviço realizado.", "Add your car to log the service you had done."),
      editTitle: T("Editar serviço", "Edit service"),
      type: T("Tipo de serviço", "Service type"),
      services: T("Serviços realizados", "Services done"),
      servicesHint: T("Digite ou escolha: dá pra adicionar vários de uma vez.", "Type or pick: you can add several at once."),
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
      // Versão curta para o cartão do carro, que divide uma linha com o
      // percentual de saúde. A longa cabia enquanto o valor era "3 anos"; com
      // "menos de 1 mês" ela passou da borda no Android de 360px (relatado com
      // foto pelo dono em 30/08). Ao lado do ícone de calendário, a frase curta
      // diz a mesma coisa.
      ownedForShort: T("Com você há {n}", "Yours for {n}"),
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
      // Convite a cadastrar a última revisão, mostrado quando o plano está
      // rodando em estimativa (nenhum registro de serviço). Dispensável com X,
      // por veículo, e some sozinho quando o primeiro serviço é cadastrado.
      baseTitulo: T("Sabe quando foi a última revisão?", "Know when the last service was?"),
      baseCorpo: T(
        "Cadastre a última troca de óleo ou revisão, mesmo que de forma aproximada. A partir dela o plano passa a contar com as suas datas, em vez de estimativas.",
        "Log your last oil change or service, even roughly. From then on the plan runs on your real dates instead of estimates.",
      ),
      baseCta: T("Cadastrar última revisão", "Log last service"),
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
      // Cada item do calendário passou a dizer QUANDO cai, em data e em km.
      // Antes era só o nome da regra e um botão "já fiz", que responde à
      // pergunta errada: quem abre ali quer saber quando precisa fazer.
      planPara: T("Prevista para {data}", "Due {data}"),
      planVencidaData: T("Estava prevista para {data}", "Was due {data}"),
      planEmKm: T("ou em {n} km", "or in {n} km"),
      planSoKm: T("Prevista em {n} km", "Due in {n} km"),
      planPassouKm: T("e o km já passou {n}", "and the mileage is {n} past"),
      planManualAmbos: T("a cada {meses} meses ou {km} km, segundo o manual", "every {meses} months or {km} km, per the manual"),
      planManualMeses: T("a cada {meses} meses, segundo o manual", "every {meses} months, per the manual"),
      planManualKm: T("a cada {km} km, segundo o manual", "every {km} km, per the manual"),
      planDesdeCompra: T("contado desde a compra do carro", "counted from when you bought the car"),
      planKmEstimado: T("km estimado: não há registro da última vez", "mileage estimated: no record of the last one"),
      planAvisamos: T("Avisamos você nesse dia", "We'll remind you that day"),
      planAvisoTitulo: T("{item} do seu {carro}", "{item} on your {carro}"),
      planAvisoCorpo: T("É hoje, segundo o plano do seu carro. Vale ligar para a oficina.", "It's due today, per your car's plan. Worth calling the shop."),
      planAvisosDesligados: T("Ligue as notificações no Perfil para ser avisado", "Turn notifications on in your profile to be reminded"),
      // A sugestão de resolver tudo numa ida só. O custo de levar o carro não
      // é o serviço, é o dia sem carro.
      visitaTitulo: T("Leve tudo numa visita só", "One trip, everything done"),
      visitaCorpo: T(
        "{lista} caem por perto. Levando no dia {data} você resolve tudo de uma vez.",
        "{lista} fall close together. Going on {data} settles them all at once.",
      ),
      visitaCorpoVencida: T(
        "{lista} já estão em cima da hora. Uma ida só resolve as duas.",
        "{lista} are already due. A single trip settles both.",
      ),
      visitaE: T("e", "and"),
      seeAllRevisions: T("Ver próximas revisões", "See upcoming service"),
      previewItems: [
        { item: T("Óleo e filtro: intervalo do seu motor", "Oil and filter: your engine's interval"), when: T("a cada 10.000 km ou 12 meses", "every 10,000 km or 12 months"), note: T("O manual do seu carro pede óleo 5W30 sintético; a oficina costuma oferecer o mineral, mais barato e fora de especificação.", "Your manual calls for 5W30 synthetic; shops often push cheaper mineral oil, out of spec."), cost: "R$ 210–390" },
        { item: T("Correia dentada: ponto crítico do seu motor", "Timing belt: critical point on your engine"), when: T("faltam ~18.000 km", "~18,000 km to go"), note: T("Neste motor a correia arrebenta sem aviso e danifica as válvulas. Não passe do intervalo.", "On this engine the belt snaps without warning and damages the valves. Don't exceed the interval."), cost: "R$ 780–1.600" },
        { item: T("Velas de ignição: pelo seu histórico", "Spark plugs: from your history"), when: T("previsto para os próximos 4 meses", "expected in the next 4 months"), note: T("Você registrou consumo alto: trocar as velas antes do previsto costuma resolver.", "You logged high consumption: replacing the plugs early usually fixes it."), cost: "R$ 160–320" },
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
      courseDoneBody: T("Você fechou \"{t}\": todas as aulas concluídas. Já sabe mais do que a maioria dos donos de carro.", "You finished \"{t}\": every lesson done. You now know more than most car owners."),
      courseDoneCta: T("Ver outras trilhas", "See other tracks"),
      // Convite do Premium no momento em que a pessoa ACABOU de concluir uma
      // trilha: valor sentido primeiro, pedido depois (timing do pedido,
      // skill besci). Mapeado como oportunidade na rodada de 23/08.
      courseDoneUpsell: T(
        "Continue: trilhas completas e sem limite no Premium",
        "Keep going: full, unlimited tracks with Premium",
      ),
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
      cardSub: T("Seu mecânico de IA: tira qualquer dúvida", "Your AI mechanic: ask anything"),
      title: T("Biela", "Biela"),
      contextPrefix: T("Sobre seu", "About your"),
      intro: T("Oi! Sou o Biela 🐻 Manjo tudo de mecânica. Me conta o que está acontecendo com o seu carro que eu te ajudo: pode perguntar de barulho, revisão, orçamento, o que for.", "Hi! I'm Biela 🐻 I know cars inside out. Tell me what's going on and I'll help: noises, service, quotes, anything."),
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
      offlineNote: T("(Respondendo em modo básico, a IA completa com os manuais está sendo conectada.)", "(Answering in basic mode, the full AI with manuals is being connected.)"),
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
      soldSheetBody: T("Ele sai da sua garagem e para de gerar revisões e alertas, mas todo o histórico, as notas e as memórias ficam guardados.", "It leaves your garage and stops generating service alerts, but the whole history, receipts and memories stay saved."),
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
      // Desktop: sem loja no aparelho, mas a pessoa TEM conta numa das duas —
      // ela escolhe qual avaliar pelo navegador.
      escolhaLoja: T("Avaliar o app:", "Rate the app:"),
      lojaAndroid: T("Android", "Android"),
      lojaIphone: T("iPhone", "iPhone"),

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
      bielaObrigado: T("Obrigado, isso ajuda a Biela a melhorar.", "Thanks, this helps Biela improve."),
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
      // O rótulo virou "Notificações" (pedido do dono, 28/08): o interruptor
      // passou a cobrir o lembrete do quiz, o aviso de cobrança e o push, e
      // "avisar antes de cobrar" descrevia só um deles.
      notifications: T("Notificações", "Notifications"),
      notificationsSub: T("Pergunta do dia e aviso antes de cobrar", "Daily question and a heads-up before charging"),
      // No navegador a linha aparece, mas sem interruptor: toggle que não
      // agenda nada é a promessa falsa que já nos mordeu (fim-do-lembrete-
      // falso, no caderno de experimentos).
      notificationsWeb: T("Disponível no aplicativo do celular", "Available in the mobile app"),
      // Quando o SISTEMA já negou: a folha de permissão só aparece uma vez;
      // depois disso, ligar o interruptor abre os ajustes do aparelho, e este
      // texto explica o que aconteceu (curto de propósito: a linha trunca).
      notifBloqueado: T("Bloqueado no aparelho: libere nos ajustes", "Blocked by the device: allow it in settings"),
      // Aviso que sai 2 dias antes do fim do teste. Escrito para ser honesto,
      // não para segurar: diz que a cobrança vem e onde cancelar. Texto de
      // retenção ("não perca seu acesso") no único momento em que a pessoa
      // confia no app é o que faz ela cancelar ali mesmo.
      avisoTesteTitulo: T("Seu teste grátis acaba em 2 dias", "Your free trial ends in 2 days"),
      avisoTesteCorpo: T(
        "Depois disso a cobrança entra automaticamente. Se não quiser continuar, dá para cancelar agora mesmo no app, em Perfil.",
        "After that the charge goes through automatically. If you'd rather not continue, you can cancel right now in the app, under Profile."
      ),
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
        "O Mentorque é o seu copiloto para cuidar do carro com confiança: organize sua garagem, entenda sintomas, acompanhe revisões e aprenda mecânica no seu ritmo, tudo em português.\n\nNossa missão é deixar o cuidado com o carro simples, econômico e sem depender de achismo na oficina.",
        "Mentorque is your copilot to care for your car with confidence: organize your garage, understand symptoms, track services and learn mechanics at your pace, all in one place.\n\nOur mission is to make car care simple, affordable and free of guesswork at the shop."
      ),
      privacyTitle: T("Política de privacidade", "Privacy policy"),
      privacyBody: T(
        "Levamos sua privacidade a sério. Os dados da sua garagem ficam no seu aparelho e, se você criar uma conta, são sincronizados de forma segura para você acessar de outros dispositivos.\n\nNão vendemos seus dados e não usamos ferramentas de análise de terceiros. Suas perguntas ao Biela e os dados do carro são enviados a provedores de IA para gerar a resposta, sem o seu nome ou e-mail. Se você tocar em 👍 ou 👎 numa resposta, guardamos aquela pergunta e aquela resposta para melhorar o Biela, também sem o seu nome, e apagamos depois de 90 dias.\n\nNa versão gratuita do app Android exibimos anúncios do Google AdMob, que usa o identificador de publicidade do aparelho. Pedimos seu consentimento antes do primeiro anúncio e você pode rever a escolha em Preferências de anúncios. Assinantes Premium não veem anúncios.\n\nVocê pode excluir sua conta e seus dados a qualquer momento aqui no Perfil.",
        "We take your privacy seriously. Your garage data stays on your device and, if you create an account, is securely synced so you can access it from other devices.\n\nWe don't sell your data and use no third-party analytics. Your prompts to Biela and your car details are sent to AI providers to generate the answer, without your name or email. If you tap 👍 or 👎 on an answer, we store that question and answer to improve Biela, also without your name, and delete it after 90 days.\n\nIn the free Android app we show Google AdMob ads, which use your device's advertising identifier. We ask for your consent before the first ad and you can change it under Ad preferences. Premium subscribers see no ads.\n\nYou can delete your account and data at any time here in Profile."
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
      deleteConfirm: T("Tem certeza? Isso apaga sua conta e todos os seus dados. Não dá pra desfazer.", "Are you sure? This deletes your account and all your data, it can't be undone."),
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
        sent: T("Mensagem enviada! Obrigado: respondemos em breve. 🐻", "Message sent! Thanks: we'll reply soon. 🐻"),
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
      // Era um interruptor "Lembrar antes do teste terminar" que NÃO agendava
      // aviso nenhum (estado morto na tela). Prometer aviso e não avisar é o
      // caminho curto para a cobrança surpresa e a avaliação de uma estrela.
      // Virou a informação verdadeira que responde ao mesmo medo: o controle
      // do cancelamento está com a pessoa, e ela sabe onde. Quando existir
      // notificação local de verdade no app, o lembrete volta como recurso.
      reminder: T(
        "Cancele quando quiser pelo Perfil, sem falar com ninguém.",
        "Cancel anytime from your Profile, no need to talk to anyone.",
      ),
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
      readerRefresh: T("Já sou assinante: atualizar", "I'm already a subscriber: refresh"),
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
