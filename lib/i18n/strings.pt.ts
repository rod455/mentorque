export const pt = {
  code: "pt",
  label: "PT",
  meta: {
    title: "Mentorque: entenda seu carro e pare de pagar caro na oficina",
    description:
      "Mentorque é o app que te ensina mecânica do básico ao avançado, mostra o preço justo antes da oficina e coloca um especialista de verdade no seu bolso. Baixe grátis na App Store e no Google Play.",
    ogTitle: "Mentorque: um especialista de mecânica no seu bolso",
    ogDescription:
      "Trilhas guiadas, diagnóstico por sintoma, preço justo e consultoria com quem é da indústria. Baixe grátis na App Store.",
  },
  nav: {
    how: "Como funciona",
    plans: "Planos",
    cta: "Baixar o app",
    toggleLang: "English",
    skipToContent: "Pular para o conteúdo",
    menu: "Menu",
  },
  // A LANDING TEM SEIS BLOCOS DESDE 04/10/2026, e uma manchete só.
  //
  // Antes eram treze seções e um carrossel de três promessas girando a cada
  // cinco segundos. A aposta `landing-em-seis-blocos` (caderno de
  // experimentos) troca isso por uma promessa, o Biela em ação na primeira
  // dobra, três ganhos, duas avaliações reais, o preço uma vez e as lojas no
  // topo e no fim. O único destino da página é a loja (decisão do dono, 12/09
  // e 04/10): sem formulário e sem "funciona no navegador".
  hero: {
    eyebrow: "Já disponível na App Store e no Google Play",
    headline: { a: "Saiba o que o carro tem ", b: "antes de ir na oficina." },
    subheadline:
      "Descreva o barulho, a luz do painel ou o cheiro. O Biela, o mecânico do Mentorque, responde com as causas prováveis, a urgência e o que perguntar na oficina.",
    ctaNote: "Grátis para começar, sem cartão. Até 2 carros na garagem.",
    // Os três números são MEDIDOS e têm a fonte em lib/app/content.ts (bloco
    // `stats`): 12 avaliações nas duas lojas, todas 5 estrelas; 178 consultas
    // de sintoma gravadas no funil desde 13/09; 254 aparelhos Android com o
    // app instalado em 25/09. Quem mudar um número aqui muda lá também.
    proof: "Nota 5,0 nas avaliações das lojas. Mais de 170 diagnósticos e 250 motoristas.",
    downloadOn: "Baixe na",
    comingSoon: "Em breve na",
    appStore: "App Store",
    googlePlay: "Google Play",
    // A demonstração mostra o Biela COMO ELE RESPONDE HOJE: texto corrido,
    // curto, direto, com a urgência e o que perguntar dentro da prosa (é o
    // que o prompt em app/api/biela/route.ts pede). A resposta em três blocos
    // é a aposta 3 da fila de simplificação; quando ela for ao ar, esta
    // demonstração muda junto. Mostrar aqui um formato que o app não entrega
    // seria promessa que o produto não cumpre.
    demo: {
      alt: "Demonstração do Biela respondendo a uma pergunta sobre barulho no freio",
      car: "Golf GTI 2014 · 98.000 km",
      you: "Você",
      biela: "Biela",
      question: "Começou um barulho de metal quando eu freio, principalmente devagar.",
      answer:
        "Pastilha de freio no fim, quase certo: barulho de metal em baixa velocidade é o aviso de desgaste raspando no disco. Dá para rodar uns dias, mas quanto mais tempo, mais chance de levar o disco junto. Na oficina, pergunte quantos milímetros restam de pastilha, se o disco está na espessura mínima, e peça o valor da peça separado da mão de obra. Freio pede inspeção presencial.",
      typing: "Respondendo para o seu carro",
    },
  },
  waitlist: {
    placeholder: "Seu melhor e-mail",
    button: "Entrar na lista de espera",
    loading: "Enviando…",
    successTitle: "Pronto! Seu lugar de fundador está garantido.",
    successBody: "Você entra com preço travado e acesso antecipado. Avisamos em primeira mão quando o app abrir.",
    again: "Cadastrar outro e-mail",
    errorRequired: "Digite seu e-mail.",
    errorEmail: "Hmm, esse e-mail não parece válido.",
    errorGeneric: "Algo deu errado. Tente de novo em instantes.",
    privacy: "Grátis. Sem cartão. Cancele quando quiser. Seu e-mail só serve pra te avisar do lançamento.",
    emailLabel: "Endereço de e-mail",
  },
  // Depoimentos.
  //
  // A lista está VAZIA de propósito, e com ela a seção inteira some da página
  // (ver components/sections/SocialProof.tsx). Antes havia três exemplos
  // inventados, marcados com uma etiqueta "exemplo · substituir" — que é pior
  // que não ter seção nenhuma: quem chega pelo Instagram não lê a etiqueta,
  // lê "Nome do usuário · Gol 2014" e entende que o app inventa gente.
  //
  // Para publicar depoimentos de verdade, basta preencher `items` aqui e no
  // arquivo em inglês. A seção volta sozinha.
  gains: {
    title: "O que muda quando você entende o carro",
    items: [
      { title: "Economize na revisão", body: "Chegue na oficina sabendo o que pedir e o que não aceitar." },
      { title: "Entenda o seu carro", body: "Aulas curtas para quem não é mecânico e nem quer ser." },
      { title: "Não perca a próxima revisão", body: "Plano por quilometragem e aviso no celular com o carro pelo nome." },
    ],
  },
  // DUAS AVALIAÇÕES REAIS, COM O TEXTO INTEIRO E O NOME PÚBLICO. São as mesmas
  // de lib/app/content.ts (blocos `quotes` e `testimonials`), copiadas sem
  // cortar, porque encurtar depoimento é o mesmo erro que inventar um: o que
  // torna a frase conferível é ela estar igual na loja. Não acrescentar
  // avaliação aqui sem ela existir na App Store ou na Play.
  social: {
    eyebrow: "Avaliações nas lojas",
    title: "Quem usa descreve o resultado, não o app",
    intro: "Duas avaliações públicas na App Store, com o texto inteiro.",
    items: [
      {
        quote: "Consegui economizar. Muito bom para gerenciar revisões e troca de óleo e coisas do tipo.",
        name: "munizluiz",
        context: "via App Store, 5 estrelas",
      },
      {
        quote: "Eu não conheço nada sobre carro e mecânica, e com os vídeos do app tenho aprendido cada vez mais.",
        name: "aminoru",
        context: "via App Store, 5 estrelas",
      },
    ] as { quote: string; name: string; context: string }[],
  },
  // O PREÇO APARECE UMA VEZ, e é o mesmo que está no dado estruturado
  // (lib/jsonLd.ts) e nas fichas das lojas. Mudar valor, plano ou o que cada
  // um destrava é decisão do dono; aqui só se escreve o que já está em vigor.
  plans: {
    title: "Comece de graça. O Premium é para quem usa toda semana.",
    intro: "Sem cartão para começar. O Premium tem 7 dias grátis para conhecer, e cancela pelo próprio app.",
    items: [
      {
        name: "Grátis",
        price: "R$ 0",
        priceNote: "para sempre",
        features: [
          "5 perguntas ao Biela por mês",
          "Garagem com até 2 carros",
          "Diagnóstico por sintoma, histórico e lembretes de revisão",
          "Aulas abertas",
        ],
        cta: "Baixar grátis",
        highlight: false,
      },
      {
        name: "Premium",
        price: "R$ 29,90",
        priceNote: "por mês, ou R$ 239,90 por ano",
        features: [
          "Biela sem limite de perguntas",
          "Plano de revisão do seu carro, por quilometragem",
          "Garagem sem limite de carros",
          "Biblioteca completa de aulas",
        ],
        cta: "Conhecer no app",
        highlight: true,
        badge: "7 dias grátis",
      },
    ],
    // A única porta de "falar com gente" do site. Ela morava numa seção
    // inteira de consultoria com três níveis que não existem mais como
    // produto; o contato continua, com o mesmo evento `clicou_consultoria`.
    consulting: {
      title: "Precisa de gente de verdade?",
      body: "O especialista do Mentorque atende pelo WhatsApp para o caso que o app não resolve.",
      cta: "Falar no WhatsApp",
    },
  },
  finalCta: {
    title: "Pergunte para o Biela antes da próxima oficina.",
    body:
      "Baixe grátis, descreva o que o carro está fazendo e chegue na oficina sabendo o que perguntar.",
    urgency: "Grátis para começar · sem cartão",
  },
  footer: {
    tagline: "O app que explica o seu carro antes da oficina.",
    navTitle: "Navegação",
    socialTitle: "Redes",
    legalTitle: "Legal",
    privacy: "Privacidade",
    terms: "Termos",
    contact: "Contato",
    rights: "Todos os direitos reservados.",
    builtFor: "Brasil e EUA · iOS e Android",
  },
};

export type Strings = typeof pt;
