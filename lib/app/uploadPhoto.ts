import { getBrowserSupabase } from "@/lib/supabaseBrowser";

// Bucket compartilhado das fotos do usuário (avatar + momentos). Cada arquivo
// vive em "<user_id>/<key>.jpg", então as policies por pasta do usuário valem
// pra todos. Confira o nome exato do bucket no painel do Supabase.
const BUCKET = "Avatars";

const pathFor = (userId: string, key: string) => `${userId}/${key}.jpg`;

// Sobe um data URL pro Storage e devolve a URL pública (com cache-buster).
// Retorna null se não der (convidado / sem supabase / erro) — aí o chamador
// guarda o próprio data URL localmente, como fallback.
export async function uploadUserPhoto(userId: string, key: string, dataUrl: string): Promise<string | null> {
  const supabase = getBrowserSupabase();
  if (!supabase) return null;
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const { error } = await supabase.storage.from(BUCKET).upload(pathFor(userId, key), blob, { upsert: true, contentType: "image/jpeg" });
    if (error) {
      console.warn("[photo] upload failed:", error.message);
      return null;
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(pathFor(userId, key));
    return `${data.publicUrl}?t=${Date.now()}`;
  } catch {
    return null;
  }
}

// Best-effort: remove a foto do Storage (ignora falhas).
export async function deleteUserPhoto(userId: string, key: string): Promise<void> {
  const supabase = getBrowserSupabase();
  if (!supabase) return;
  try {
    await supabase.storage.from(BUCKET).remove([pathFor(userId, key)]);
  } catch {
    /* ignore */
  }
}
