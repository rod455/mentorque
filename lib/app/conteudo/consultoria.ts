import type { Access } from "../types";
import type { Tradutor } from "./base";

// Os níveis de consultoria oferecidos dentro do Premium.
export function consultoria(T: Tradutor) {

// Consulting tiers (moved under Premium/Perfil).
const consultingTiers: { name: string; body: string; access: Access }[] = [
  { name: T("Comunidade", "Community"), body: T("Poste sua dúvida e receba orientação da comunidade e de moderadores.", "Post your question and get guidance from the community and moderators."), access: "free" },
  { name: T("Diagnóstico pela equipe", "Team diagnosis"), body: T("A equipe analisa sintomas, fotos e códigos OBD2 e devolve um plano de ação.", "The team reviews symptoms, photos and OBD2 codes and returns an action plan."), access: "premium" },
  { name: T("1:1 com o creator", "1:1 with the creator"), body: T("Sessão individual para casos difíceis ou decisão de compra. Vagas limitadas.", "One-on-one session for hard cases or buying decisions. Limited slots."), access: "consulting" },
];

  return { consultingTiers };
}
