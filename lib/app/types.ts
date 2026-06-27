// Prototype domain types for the Mentorque in-app experience.

// Onboarding "what do you want to do here?" intentions (Q2). Multiple choice,
// up to three. Each is a weighted tag, not a route: tags reorder Home and the
// vehicle profile and decide whether the learn-first or fix-first thread leads.
export type Tag =
  | "learn_cars" // Aprender mais sobre carros
  | "understand" // Entender melhor o meu carro
  | "fix" // Resolver um problema que apareceu
  | "mechanics" // Aprender mecânica
  | "electronics" // Aprender eletrônica automotiva
  | "career" // Me preparar para trabalhar na área
  | "maintenance" // Melhorar a manutenção do meu carro
  | "curiosity"; // Apenas matar a curiosidade

// Onboarding "what's your level?" (Q3). Single choice. The pro tiers
// (mechanic / engineering) unlock the "knowledge from the industry" shortcut.
export type Level =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "mechanic"
  | "eng_student"
  | "engineer";

export type VehicleType = "car" | "moto";

export type Vehicle = {
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  engine?: string; // optional motorização / trim (e.g. "1.0 TSI", "2.0 Flex")
};

// Severity dot used across problems / alerts (red / amber / teal).
export type Severity = "high" | "medium" | "low";

// Access gate for a section: free, premium, or human consulting.
export type Access = "free" | "premium" | "consulting";

// A logged maintenance/service event (the "última revisão").
export type ServiceRecord = {
  date: string; // ISO yyyy-mm-dd
  km: number; // odometer at the service
  items: string[]; // keys of changed parts (see content.serviceItems)
  notes?: string;
};
