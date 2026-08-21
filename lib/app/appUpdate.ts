// Banner de "versão nova disponível" (tela inicial do app da loja).
//
// O app é empacotado: telas e textos só mudam com build novo na loja, e quem
// fica para trás convive com bugs já corrigidos. O site publica o número do
// build mais recente em /api/app/latest (constante em código, sobe por deploy
// da Vercel); o app compara com o próprio número via Capacitor (App.getInfo)
// e acende o banner quando está atrás. Na web não existe: lá o deploy já
// entrega a versão nova a todo mundo.
import { useEffect, useState } from "react";
import { apiUrl } from "./apiBase";
import { nativePlatform, openExternal } from "./wrapper";

type AppInfoPlugin = { getInfo?: () => Promise<{ build?: string }> };

function appPlugin(): AppInfoPlugin | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { Capacitor?: { Plugins?: { App?: AppInfoPlugin } } };
  return w.Capacitor?.Plugins?.App;
}

// Uma checagem por abertura do app: o resultado não muda no meio da sessão, e
// repetir o fetch a cada visita ao Início seria ruído.
let cache: boolean | null = null;

/** true quando a loja tem um build mais novo que o instalado. */
export function useUpdateAvailable(): boolean {
  const [avail, setAvail] = useState(cache === true);
  useEffect(() => {
    if (cache !== null) { setAvail(cache); return; }
    const platform = nativePlatform();
    const plugin = appPlugin();
    if (!platform || !plugin?.getInfo) { cache = false; return; }
    (async () => {
      try {
        const [info, res] = await Promise.all([
          plugin.getInfo!(),
          fetch(apiUrl("/api/app/latest"), { cache: "no-store" }),
        ]);
        if (!res.ok) return;
        const latest = (await res.json()) as { android?: number; ios?: number };
        const local = Number(info?.build ?? 0);
        const remoto = Number(latest?.[platform] ?? 0);
        // Sem número local confiável, melhor calar do que gritar à toa.
        cache = local > 0 && remoto > local;
        setAvail(cache);
      } catch { /* offline ou erro: sem banner nesta sessão */ }
    })();
  }, []);
  return avail;
}

/** Abre a ficha do app na loja da plataforma (para atualizar). */
export function openStorePage(): void {
  const p = nativePlatform();
  if (p === "android") openExternal("https://play.google.com/store/apps/details?id=mentorque.app");
  else openExternal("https://apps.apple.com/app/id6797291865");
}
