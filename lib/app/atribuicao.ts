"use client";

// Atribuição de instalações (AppsFlyer), ligada em 29/08 para os anúncios de
// segunda: Meta e Google Ads precisam saber quais campanhas viram instalação,
// e quem conta isso para eles é o SDK dentro do app.
//
// O DESENHO É O MÍNIMO que resolve atribuição, de propósito:
//
// - só inicializa: nada de evento manual por aqui. O funil de negócio já
//   nasce no servidor (lib/funilServidor.ts), confirmado pelo processador;
//   duplicar eventos no SDK seria duas fontes brigando pelo mesmo número.
// - no iPhone, SEM a folha de rastreamento (ATT) e portanto sem IDFA: a
//   atribuição vem agregada pelo SKAdNetwork, que é o caminho que Meta e
//   Google usam hoje de qualquer jeito. Pedir ATT na abertura custa uma
//   permissão assustadora no primeiro contato e uma revisão da Apple mais
//   arisca, por um ganho marginal. Se um dia precisarmos de IDFA, é decisão
//   nova, com tela própria.
// - a dev key fica no código como o client id do Google (ela viaja dentro do
//   binário de qualquer forma; env só adicionaria o modo de falha "esqueceu a
//   variável no build").
//
// A caixa é obrigatória, não estilo: o plugin cru do Capacitor responde a
// qualquer propriedade, inclusive `then`, e devolvê-lo de função async trava
// a espera para sempre (a lição dos lembretes mudos, 28/08).
import { APPLE_APP_ID } from "@/lib/stores";
import { isNativeApp, nativePlatform } from "./wrapper";

const DEV_KEY = "BdcX8hssR4U7ifDf7reF7n";

type PluginAppsFlyer = {
  initSDK: (o: { devKey: string; appID: string; isDebug?: boolean }) => Promise<unknown>;
};
type Caixa = { plugin: PluginAppsFlyer };

let caixa: Caixa | null = null;
let iniciado = false;

async function carregar(): Promise<Caixa | null> {
  if (caixa) return caixa;
  if (!isNativeApp() || !nativePlatform()) return null;
  try {
    const mod = await import("appsflyer-capacitor-plugin");
    caixa = { plugin: mod.AppsFlyer as unknown as PluginAppsFlyer };
    return caixa;
  } catch {
    return null;
  }
}

/**
 * Liga a atribuição, uma vez por abertura do app. Silenciosa por contrato:
 * atribuição é infraestrutura de medição, e falha dela não pode custar nada
 * ao motorista (nem tela, nem espera, nem erro).
 */
export async function iniciarAtribuicao(): Promise<void> {
  if (iniciado) return;
  const c = await carregar();
  if (!c) return;
  iniciado = true;
  try {
    // appID é só do iPhone (o id numérico da App Store); o Android ignora.
    await c.plugin.initSDK({ devKey: DEV_KEY, appID: APPLE_APP_ID, isDebug: false });
  } catch {
    // Sem rede ou SDK indisponível: a próxima abertura tenta de novo.
    iniciado = false;
  }
}
