import type { Strings } from "./strings.pt";

export const en: Strings = {
  code: "en",
  label: "EN",
  meta: {
    title: "Mentorque — learn auto mechanics with an expert in your pocket",
    description:
      "Mentorque is the auto-mechanics learning app from basics to advanced, with expert consulting. Understand your car, save money at the shop, and get human help when you get stuck.",
    ogTitle: "Mentorque — mechanics from basics to advanced, with consulting in your pocket",
    ogDescription:
      "Guided tracks, symptom-based diagnosis, real tools (OBD2, fair price, checklists) and consulting with the creator and team. Join the waitlist.",
  },
  nav: {
    features: "Features",
    how: "How it works",
    consulting: "Consulting",
    plans: "Plans",
    faq: "FAQ",
    cta: "Join the waitlist",
    toggleLang: "Português",
    skipToContent: "Skip to content",
    menu: "Menu",
  },
  hero: {
    eyebrow: "iOS and Android · coming soon",
    headlines: [
      { a: "Understand your car. Save money. ", b: "Stop being at the mechanic's mercy." },
      { a: "Mechanics from basics to advanced, ", b: "with an expert in your pocket." },
      { a: "Learn to care for your car — ", b: "with someone you trust when you get stuck." },
    ],
    subheadline:
      "Learn auto mechanics from basics to advanced — with expert consulting in your pocket. Content teaches you; the real edge is a trusted expert for when a video isn't enough.",
    ctaNote: "No spam. We'll let you know the moment the app launches, with early-bird perks.",
    comingSoon: "Coming soon to",
    appStore: "App Store",
    googlePlay: "Google Play",
    mockupAlt: "Preview of the Mentorque app showing a learning track and symptom-based diagnosis",
    carouselLabel: "Highlighted headlines",
    prev: "Previous headline",
    next: "Next headline",
    goTo: "Go to headline",
  },
  waitlist: {
    placeholder: "Your best email",
    button: "Join the waitlist",
    loading: "Sending…",
    successTitle: "You're on the list!",
    successBody: "Done. We'll be the first to tell you when Mentorque arrives.",
    again: "Add another email",
    errorRequired: "Please enter your email.",
    errorEmail: "Hmm, that email doesn't look valid.",
    errorGeneric: "Something went wrong. Please try again in a moment.",
    privacy: "By joining, you agree to receive Mentorque updates. Unsubscribe anytime.",
    emailLabel: "Email address",
  },
  trust: {
    ledBy: "Led by an automotive creator — not just another generic platform course.",
    waitlistCountPre: "Over",
    waitlistCount: "8,000",
    waitlistCountPost: "people already on the waitlist.",
    pressLabel: "As seen in",
    pressPlaceholders: ["Press", "Partner", "Channel", "Garage"],
  },
  problem: {
    title: "Caring for a car today is expensive, confusing and full of traps",
    intro:
      "You don't need to become a mechanic. You need to understand enough to decide well — and have someone to guide you when the bill doesn't add up.",
    items: [
      {
        pain: "Expensive, unpredictable maintenance",
        turn: "Learn what actually matters and use the fair-price estimator to walk into the shop already knowing the cost.",
      },
      {
        pain: "Fear of being ripped off",
        turn: "Symptom-based diagnosis and a second opinion from the team: you arrive informed and avoid made-up repairs.",
      },
      {
        pain: "Free content is chaos",
        turn: "Structured tracks from basics to advanced, in the voice of someone who knows — no more hunting random videos.",
      },
      {
        pain: "Old car, lost manual",
        turn: "Everything personalized to your vehicle (make, model, year): checklists and steps that fit YOUR car.",
      },
    ],
  },
  features: {
    title: "Everything to understand, maintain and decide with confidence",
    intro: "Learning, tools and human help in one place — built around your vehicle.",
    items: [
      {
        icon: "track",
        title: "Tracks from beginner to advanced",
        body: "Guided courses in the creator's voice, from zero to autonomy, with a certificate when you finish each track.",
      },
      {
        icon: "diagnose",
        title: "Symptom-based diagnosis",
        body: "Describe what you feel (\"a noise when braking\") and get a step-by-step of likely causes and what to check.",
      },
      {
        icon: "tools",
        title: "Real tools",
        body: "OBD2 code reader, per-vehicle maintenance checklist, fair-price estimator and car history.",
      },
      {
        icon: "consult",
        title: "Expert consulting",
        body: "Talk to the creator and team when a video isn't enough. Human help, straight to the point.",
      },
      {
        icon: "car",
        title: "Built for your car",
        body: "Personalized by make, model and year: everything you see is relevant to the vehicle you actually own.",
      },
      {
        icon: "community",
        title: "Community and live streams",
        body: "Ask questions, follow live sessions and learn alongside people who live and breathe cars and bikes.",
      },
    ],
  },
  how: {
    title: "How it works",
    intro: "Four steps, from registering your car to expert help.",
    steps: [
      { n: "01", title: "Register your vehicle", body: "Make, model and year. From there, everything adapts to your car or bike." },
      { n: "02", title: "Learn on the track", body: "Follow courses from basics to advanced, at your pace, and earn a certificate." },
      { n: "03", title: "Diagnose with the tools", body: "Use symptom-based diagnosis, OBD2 and the checklist to understand what's happening." },
      { n: "04", title: "Ask for help when stuck", body: "Tap into consulting — community, team or 1:1 with the creator — and solve it safely." },
    ],
  },
  consulting: {
    eyebrow: "The edge",
    title: "Real human help when a video isn't enough",
    intro:
      "Content teaches, but every car has its quirk. Mentorque's consulting puts a trusted expert by your side — in three levels, from free to 1:1.",
    tiers: [
      {
        name: "Community",
        body: "Post your question and get guidance from the community and moderators who know their stuff.",
        note: "Included in the free plan",
      },
      {
        name: "Diagnosis by the team",
        body: "The creator's team reviews your case (symptoms, photos, OBD2 codes) and sends back a clear action plan.",
        note: "On Premium",
      },
      {
        name: "1:1 with the creator",
        body: "A one-on-one session with the creator for tough cases or buy/restore decisions. Limited spots.",
        note: "Consulting · limited spots",
      },
    ],
  },
  plans: {
    title: "Plans for every stage",
    intro:
      "Start free and level up when you need more tools and human help. Final pricing at launch.",
    items: [
      {
        name: "Free",
        price: "$0",
        priceNote: "forever",
        features: [
          "Intro tracks",
          "Symptom-based diagnosis (basic)",
          "Maintenance checklist",
          "Community access",
        ],
        cta: "Start free",
        highlight: false,
      },
      {
        name: "Premium",
        price: "Subscription",
        priceNote: "monthly or yearly",
        features: [
          "All tracks + certificates",
          "Full tools (OBD2, fair price, history)",
          "Diagnosis by the team",
          "Exclusive content and live streams",
        ],
        cta: "Get Premium",
        highlight: true,
        badge: "Most popular",
      },
      {
        name: "Consulting",
        price: "Custom",
        priceNote: "packages and 1:1",
        features: [
          "Everything in Premium",
          "1:1 sessions with the creator",
          "Project/restoration follow-up",
          "Priority support",
        ],
        cta: "Talk about consulting",
        highlight: false,
      },
    ],
    note: "Final pricing and plan structure will be confirmed at launch.",
  },
  benefits: {
    title: "Why join Mentorque",
    items: [
      "Save at the shop by knowing the fair price before you approve any work.",
      "Actually learn, with structure from basics to advanced — not scattered videos.",
      "Get human help when you're stuck, not just an automated chat.",
      "Everything built for your car: make, model and year.",
      "The trust of a creator who lives off mechanics, not marketing.",
      "Decide with data: OBD2 codes, history and checklists in your pocket.",
    ],
  },
  faq: {
    title: "Frequently asked questions",
    intro: "Still unsure? Just reply to the welcome email.",
    items: [
      {
        q: "Is it for people who've never touched a car?",
        a: "Yes. Tracks start from absolute zero, in plain language, and build up to technical topics. You choose how far to go.",
      },
      {
        q: "Does it work for my car or motorcycle?",
        a: "You register make, model and year, and the content, checklists and tools adapt to your vehicle — car or bike.",
      },
      {
        q: "Do I need to buy equipment for OBD2?",
        a: "To read your car's codes you use a common OBD2 adapter (available for a small price). The app guides the reading and explains what each code means.",
      },
      {
        q: "How does consulting work?",
        a: "Three levels: the community (free), diagnosis by the team, and a 1:1 session with the creator for tough cases. You pick what you need.",
      },
      {
        q: "Is there a certificate?",
        a: "Yes. When you complete a track you receive a Mentorque certificate of completion.",
      },
      {
        q: "Is it paid? Is there a free plan?",
        a: "There's a free plan with intro tracks and community. Advanced features and consulting are on the paid plans.",
      },
      {
        q: "Which countries and platforms?",
        a: "We're launching in Brazil and the United States, for iOS and Android, with content in Portuguese and English.",
      },
      {
        q: "When will the app be available?",
        a: "We're wrapping up. Join the waitlist to hear first and lock in early-bird perks.",
      },
    ],
  },
  finalCta: {
    title: "Get in early. Stay ahead.",
    body:
      "Lock in your spot on the waitlist and be among the first to learn mechanics with an expert in your pocket — with founder perks.",
  },
  footer: {
    tagline: "Mechanics from basics to advanced, with expert consulting in your pocket.",
    navTitle: "Navigation",
    socialTitle: "Social",
    legalTitle: "Legal",
    privacy: "Privacy",
    terms: "Terms",
    contact: "Contact",
    rights: "All rights reserved.",
    builtFor: "Brazil and USA · iOS and Android",
  },
};
