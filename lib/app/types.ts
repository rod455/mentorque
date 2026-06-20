// Prototype domain types for the Mentorque in-app experience.

// The five onboarding intentions (section 2 of the spec). Each is a weighted
// tag, not a route: tags reorder the Home and the vehicle profile.
export type Tag = "save" | "care" | "learn" | "career" | "urgent";

export type VehicleType = "car" | "moto";

export type Vehicle = {
  type: VehicleType;
  make: string;
  model: string;
  year: number;
};

// Severity dot used across problems / alerts (red / amber / teal).
export type Severity = "high" | "medium" | "low";

// Access gate for a section: free, premium, or human consulting.
export type Access = "free" | "premium" | "consulting";
