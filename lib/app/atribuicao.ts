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
import { funil } from "./funil";
import { motivoDaFalha } from "./motivoDaFalha";

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

const MARCA = "mq-atrib";

/**
 * Quantas vezes tentar subir o SDK na MESMA abertura, e por que mais de uma.
 *
 * MEDIDO EM 03/10/2026: 23,1% dos aparelhos Android (94 de 407, janela de 21
 * dias) NUNCA subiram o SDK. Em 22/09 eram 25%, então duas versões passaram sem
 * mudar nada. Nenhum caso foi `sem-plugin`, ou seja o plugin ESTÁ no binário em
 * todos: o que falha é o `initSDK`, e falha de verdade.
 *
 * O desenho antigo tentava UMA vez por abertura e deixava a próxima abertura
 * tentar de novo. O problema é que o aparelho médio abre 1,5 vez (medido pelo
 * QA em 30/09), então "a próxima abertura" quase nunca chega: na prática era
 * uma tentativa na vida do aparelho. Três tentativas com espera crescente
 * custam uns 7 segundos de trabalho de fundo, silencioso, e cobrem a falha
 * transitória, que é a hipótese mais provável para algo que falha em um quinto
 * dos aparelhos e funciona nos outros quatro quintos.
 */
const TENTATIVAS = 3;
const ESPERA_BASE_MS = 2500;

const espera = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));


/**
 * O desfecho da subida do SDK, gravado no NOSSO funil.
 *
 * POR QUE ISSO EXISTE (29/08): silêncio por contrato é a decisão certa para o
 * motorista e a pior possível para quem opera. Com a 1.4 instalada e o painel
 * da AppsFlyer vazio, não havia como distinguir "o SDK não subiu" de "o painel
 * deles ainda não atualizou" — restava adivinhar, e adivinhar antes de ligar
 * campanha custa dinheiro de verdade.
 *
 * O CUSTO É PROPORCIONAL A INSTALAÇÕES, NÃO A USO, e isso foi projetado: a
 * marca no aparelho e o índice único (evento, anon_id, origem) garantem no
 * máximo uma linha por aparelho por desfecho. Um aparelho que falha e depois
 * dá certo grava as duas, o que é exatamente o sinal de falha transitória.
 */
function registrar(desfecho: string): void {
  try {
    // A CHAVE É A FAMÍLIA, não o texto inteiro: `erro:timeout` e `erro:rede`
    // no mesmo aparelho são a mesma notícia ("este aparelho não sobe"), e
    // guardar uma linha por mensagem faria o custo crescer com a variedade de
    // erro em vez de com o número de aparelhos, que é o oposto do que esta
    // marca foi feita para garantir.
    const k = `${MARCA}-${desfecho.split(":")[0]}`;
    if (window.localStorage.getItem(k)) return;
    funil("atribuicao", { origem: desfecho });
    window.localStorage.setItem(k, "1");
  } catch {
    // Sem localStorage o índice único do banco segura a duplicata.
    funil("atribuicao", { origem: desfecho });
  }
}

/**
 * Liga a atribuição, uma vez por abertura do app. Silenciosa por contrato:
 * atribuição é infraestrutura de medição, e falha dela não pode custar nada
 * ao motorista (nem tela, nem espera, nem erro). O que ela não é mais é
 * INVISÍVEL: o desfecho vai para o nosso funil (ver `registrar`).
 */
export async function iniciarAtribuicao(): Promise<void> {
  if (iniciado) return;
  if (!isNativeApp() || !nativePlatform()) return;
  const c = await carregar();
  if (!c) {
    // O app é das lojas mas o plugin não respondeu: ele não entrou no binário.
    registrar("sem-plugin");
    return;
  }
  iniciado = true;
  let ultimo = "erro:sem-mensagem";
  for (let tentativa = 1; tentativa <= TENTATIVAS; tentativa++) {
    try {
      // appID é só do iPhone (o id numérico da App Store); o Android ignora.
      await c.plugin.initSDK({ devKey: DEV_KEY, appID: APPLE_APP_ID, isDebug: false });
      registrar("ok");
      return;
    } catch (e) {
      // O MOTIVO SÓ É GRAVADO NO FIM, e isso é de propósito: registrar a falha
      // da primeira tentativa faria o aparelho que deu certo na terceira
      // aparecer como falha no número, e aí a conta de 23% mediria "tropeçou"
      // em vez de "não subiu". Uma linha por aparelho, com o desfecho final.
      ultimo = motivoDaFalha(e);
      if (tentativa < TENTATIVAS) await espera(ESPERA_BASE_MS * tentativa);
    }
  }
  // Sem rede ou SDK indisponível depois de todas: a próxima abertura tenta de
  // novo, e agora o diagnóstico viaja junto.
  iniciado = false;
  registrar(ultimo);
}
