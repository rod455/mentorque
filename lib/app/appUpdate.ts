// Banner de "versão nova disponível" (tela inicial do app da loja).
//
// O app é empacotado: telas e textos só mudam com build novo na loja, e quem
// fica para trás convive com bugs já corrigidos. O site publica o número do
// build mais recente em /api/app/latest (constante em código, sobe por deploy
// da Vercel); o app compara com o próprio número via Capacitor (App.getInfo)
// e acende o banner quando está atrás. Na web não existe: lá o deploy já
// entrega a versão nova a todo mundo.
import { useEffect, useState } from "react";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/stores";
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

/**
 * Abre a ficha do app na loja da plataforma (para atualizar).
 *
 * Os endereços vêm de lib/stores.ts, e não escritos à mão aqui. Eram duas
 * cópias dos mesmos dois links, com o id numérico da Apple digitado de novo:
 * exatamente o tipo de duplicação que ninguém percebe até alguém tocar no
 * botão e cair numa loja dizendo que o app não existe.
 *
 * Sem plataforma nativa não há o que atualizar (na web o deploy já entregou a
 * versão nova), então a função não faz nada em vez de chutar uma loja. Hoje
 * isso é inalcançável, porque quem chama só aparece quando `useUpdateAvailable`
 * é true e ele exige plataforma nativa — mas o `else` anterior mandava o
 * navegador para a App Store, e é uma armadilha esperando o próximo uso.
 */
export function openStorePage(): void {
  const p = nativePlatform();
  if (p === "android") openExternal(PLAY_STORE_URL);
  else if (p === "ios") openExternal(APP_STORE_URL);
}
