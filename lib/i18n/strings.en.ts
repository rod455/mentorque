import type { Strings } from "./strings.pt";

export const en: Strings = {
  code: "en",
  label: "EN",
  meta: {
    title: "Mentorque: understand your car and stop overpaying at the shop",
    description:
      "Mentorque teaches you mechanics from basics to advanced, shows the fair price before the shop, and puts a real expert in your pocket. Download it free on the App Store and Google Play.",
    ogTitle: "Mentorque: a mechanic expert in your pocket",
    ogDescription:
      "Guided tracks, symptom-based diagnosis, fair pricing and consulting with someone who's in the industry. Download it free on the App Store.",
  },
  nav: {
    how: "How it works",
    plans: "Plans",
    cta: "Get the app",
    toggleLang: "Português",
    skipToContent: "Skip to content",
    menu: "Menu",
  },
  hero: {
    eyebrow: "Now on the App Store and Google Play",
    headline: { a: "Know what your car has ", b: "before you go to the shop." },
    subheadline:
      "Describe the noise, the dashboard light or the smell. Biela, the Mentorque mechanic, answers with the likely causes, how urgent it is and what to ask at the shop.",
    ctaNote: "Free to start, no card. Up to 2 cars in your garage.",
    proof: "Rated 5.0 in store reviews. Over 170 diagnoses and 250 drivers.",
    downloadOn: "Download on the",
    comingSoon: "Coming soon to",
    appStore: "App Store",
    googlePlay: "Google Play",
    demo: {
      alt: "Biela answering a question about a brake noise",
      car: "Golf GTI 2014 · 98,000 km",
      you: "You",
      biela: "Biela",
      question: "A metallic noise started when I brake, mostly at low speed.",
      answer:
        "Almost certainly brake pads at the end of their life: a metallic noise at low speed is the wear indicator scraping the disc. You can drive a few days, but the longer you wait, the higher the chance of taking the disc with it. At the shop, ask how many millimetres of pad are left, whether the disc is at minimum thickness, and get the part priced separately from labour. Brakes need an in-person inspection.",
      typing: "Answering for your car",
    },
  },
  waitlist: {
    placeholder: "Your best email",
    button: "Join the waitlist",
    loading: "Sending…",
    successTitle: "Done! Your founder spot is locked in.",
    successBody: "You're in with locked pricing and early access. We'll be the first to tell you when the app opens.",
    again: "Add another email",
    errorRequired: "Please enter your email.",
    errorEmail: "Hmm, that email doesn't look valid.",
    errorGeneric: "Something went wrong. Please try again in a moment.",
    privacy: "Free. No card. Cancel anytime. Your email is only used to tell you about launch.",
    emailLabel: "Email address",
  },
  // Empty on purpose — see the note in strings.pt.ts. Fill `items` in both
  // files when real testimonials exist and the section comes back on its own.
  gains: {
    title: "What changes when you understand your car",
    items: [
      { title: "Save on the service", body: "Walk into the shop knowing what to ask for and what not to accept." },
      { title: "Understand your car", body: "Short lessons for people who are not mechanics and do not want to be." },
      { title: "Never miss the next service", body: "A mileage-based plan and a phone reminder that calls your car by name." },
    ],
  },
  social: {
    eyebrow: "Store reviews",
    title: "People describe the result, not the app",
    intro: "Two public App Store reviews, in full. Originally in Portuguese.",
    items: [
      {
        quote: "I managed to save money. Very good for managing services, oil changes and that kind of thing.",
        name: "munizluiz",
        context: "via App Store, 5 stars",
      },
      {
        quote: "I know nothing about cars and mechanics, and with the app's videos I have been learning more and more.",
        name: "aminoru",
        context: "via App Store, 5 stars",
      },
    ] as { quote: string; name: string; context: string }[],
  },
  plans: {
    title: "Start free. Premium is for people who use it every week.",
    intro: "No card to start. Premium has a 7-day free trial, and you cancel in the app.",
    items: [
      {
        name: "Free",
        price: "R$ 0",
        priceNote: "forever",
        features: [
          "5 questions to Biela per month",
          "Garage with up to 2 cars",
          "Symptom diagnosis, history and service reminders",
          "Open lessons",
        ],
        cta: "Download free",
        highlight: false,
      },
      {
        name: "Premium",
        price: "R$ 29.90",
        priceNote: "per month, or R$ 239.90 per year",
        features: [
          "Unlimited questions to Biela",
          "Your car's mileage-based service plan",
          "Garage with no car limit",
          "Full lesson library",
        ],
        cta: "See it in the app",
        highlight: true,
        badge: "7 days free",
      },
    ],
    consulting: {
      title: "Need a real person?",
      body: "The Mentorque specialist answers on WhatsApp for the cases the app cannot solve.",
      cta: "Talk on WhatsApp",
    },
  },
  finalCta: {
    title: "Ask Biela before your next shop visit.",
    body:
      "Download it free, describe what the car is doing and walk into the shop knowing what to ask.",
    urgency: "Free to start · no card",
  },
  footer: {
    tagline: "The app that explains your car before the shop does.",
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
