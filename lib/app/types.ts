// Domain types for the car-centric Mentorque app (multi-vehicle garage).

export type VehicleType = "car" | "moto";

// A vehicle in the user's garage. Each one carries its own km, photo and, for
// Premium, the exact engine + version (ultra-personalization).
export type Vehicle = {
  id: string;
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  engine?: string; // motorização (e.g. "1.0 Turbo")
  version?: string; // exact trim / version (Premium)
  plate?: string; // placa (optional)
  odometerKm?: number; // km atual
  photo?: string; // downscaled data URL
};

// A logged maintenance/service event, always tied to a vehicle.
export type ServiceRecord = {
  id: string;
  vehicleId: string;
  type: string; // serviceType key (oil, brakes, revision, other…)
  date: string; // ISO yyyy-mm-dd
  km: number; // odometer at the service
  shop?: string; // oficina
  total?: number; // valor total (BRL)
  parts: ServicePart[]; // peças trocadas
  notes?: string;
  photo?: string; // foto da nota (data URL)
  category?: "preventive" | "corrective" | "upgrade"; // Premium classification
};

export type ServicePart = { name: string; value?: number };

// Severity used across problems / attention points (red / amber / teal).
export type Severity = "high" | "medium" | "low";

// Access gate for a section: free, premium, or human consulting.
export type Access = "free" | "premium" | "consulting";

// Vehicle sub-systems the health view breaks down into.
export type SystemKey = "engine" | "brakes" | "suspension" | "tires" | "electrical";

// Small id generator (browser runtime — crypto when available).
export function newId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  } catch {
    /* ignore */
  }
  return "v" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}
