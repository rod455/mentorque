// Quem é o aparelho que relatou, em uma linha curta.
//
// POR QUE ISTO EXISTE (27/09/2026). A `app_erros` sabia O QUE aconteceu, QUANDO
// e em qual versão, e não sabia EM QUE. Isso é o bastante para um erro de
// JavaScript, que é o mesmo em todo lugar, e é pouco demais para o relato de
// "app fechou sozinho", que é a única linha da tabela que fala de RECURSO do
// aparelho. "Morre na tela de cadastro do carro" e "morre na tela de cadastro
// do carro num Android de 2GB" pedem consertos diferentes, e em 27/09 não havia
// como saber em qual dos dois a gente estava. No mesmo dia o catálogo de
// veículos quadruplicou de tamanho com a entrada das motos, o que torna a
// pergunta de memória concreta e não teórica.
//
// SEM PLUGIN NATIVO, de propósito. O `@capacitor/device` traria modelo e
// memória mais certos, e traria junto uma dependência nativa, um build para
// conferir e um roteiro de aparelho antes de subir, pela regra da casa. O
// `navigator` já responde o suficiente: no Android a WebView carimba o MODELO
// no user agent, e o Chromium expõe a memória aproximada. É de graça e vai ao
// ar no mesmo build de tudo o mais.
//
// O QUE ELE NÃO ALCANÇA, e é por isso que está escrito aqui: no iPhone o user
// agent não diz o modelo (a Apple não publica) e `deviceMemory` não existe no
// WebKit. De iOS sai "iPhone" e a versão do sistema, e ponto. Como o defeito
// que motivou isto é do Android, o lado que importa é o que responde.
//
// NADA AQUI IDENTIFICA NINGUÉM. Modelo, versão do sistema, memória aproximada
// e número de núcleos são os mesmos para milhões de aparelhos iguais. É a
// descrição do hardware, não da pessoa.

/** O que o navegador conta sobre a máquina. Separado para a conferência poder mentir. */
export type SinaisDoAparelho = {
  ua: string;
  /** `navigator.deviceMemory`: GB aproximados, só no Chromium. */
  memoriaGb?: number;
  /** `navigator.hardwareConcurrency`: núcleos de CPU. */
  nucleos?: number;
};

/**
 * Uma linha curta descrevendo o aparelho, ou string vazia quando nada dá.
 *
 * Exemplos do que sai:
 *   "Android 13 · SM-A135M · 4GB · 8 nucleos"
 *   "Android 10 · moto g(8) power lite · 2GB · 8 nucleos"
 *   "iPhone · iOS 17.5 · 6 nucleos"
 *   "web"
 */
export function descreveAparelho(s: SinaisDoAparelho): string {
  const partes: string[] = [];
  const ua = s.ua ?? "";

  const android = /Android\s+([\d.]+);\s*/.exec(ua);
  const ios = /(iPhone|iPad|iPod)[^)]*?OS\s+([\d_]+)/.exec(ua);

  if (android) {
    partes.push(`Android ${android[1]}`);
    const modelo = modeloAndroid(ua.slice(android.index + android[0].length));
    if (modelo) partes.push(modelo);
  } else if (ios) {
    partes.push(ios[1]);
    partes.push(`iOS ${ios[2].replace(/_/g, ".")}`);
  } else if (ua) {
    partes.push("web");
  }

  // Memória só do Chromium, e ela vem ARREDONDADA pelo próprio navegador (0.25,
  // 0.5, 1, 2, 4, 8) de propósito, para não virar impressão digital. Vai como
  // veio: fingir precisão que a fonte não tem seria pior que não ter o campo.
  if (typeof s.memoriaGb === "number" && s.memoriaGb > 0) partes.push(`${s.memoriaGb}GB`);
  if (typeof s.nucleos === "number" && s.nucleos > 0) partes.push(`${s.nucleos} nucleos`);

  return partes.join(" · ").slice(0, 120);
}

/**
 * O modelo, a partir do que vem DEPOIS de "Android 11; " no user agent.
 *
 * NÃO é um regex, e a razão está num aparelho de verdade: a Motorola vende o
 * "moto g(8) power lite", com parêntese no meio do nome. Qualquer expressão
 * que pare no primeiro `)` corta o modelo ao meio e grava "moto g(8" no banco.
 * Foi assim que a primeira versão disto saiu, e a conferência pegou antes de
 * subir, com esse aparelho exato no caso de teste.
 *
 * As três formas que a WebView do Android usa na prática:
 *   "... Android 10; SM-G960F Build/QP1A.190711.020; wv) AppleWebKit/537.36"
 *   "... Android 11; moto g(8) power lite) AppleWebKit/537.36"
 *   "... Android 13; SM-A135M) AppleWebKit/537.36"
 */
function modeloAndroid(resto: string): string {
  // O fim do bloco de identificação é o ") " que abre o AppleWebKit. Sem ele
  // (user agent estranho), vale o último parêntese que houver.
  const fim = resto.indexOf(") AppleWebKit");
  let modelo = fim >= 0 ? resto.slice(0, fim) : resto.slice(0, resto.lastIndexOf(")") + 1 || undefined);
  // O que vem depois do nome e não é nome: a build do fabricante e a marca de
  // WebView. Os dois são ruído para a pergunta "que aparelho é este?".
  modelo = modelo.replace(/\s+Build\/[^;)]*/i, "").replace(/;\s*wv\s*$/i, "").trim();
  // "K" é o modelo que o Chrome mais novo manda quando ele ANONIMIZA o user
  // agent. Não é aparelho nenhum, então não vale linha no banco.
  if (!modelo || modelo.toUpperCase() === "K") return "";
  // Teto contra user agent adulterado, que existe e é fácil de mandar.
  return modelo.slice(0, 40);
}

/** Lê os sinais do navegador de verdade. Devolve string vazia fora dele. */
export function aparelhoAtual(): string {
  if (typeof navigator === "undefined") return "";
  try {
    const n = navigator as Navigator & { deviceMemory?: number };
    return descreveAparelho({
      ua: n.userAgent ?? "",
      memoriaGb: typeof n.deviceMemory === "number" ? n.deviceMemory : undefined,
      nucleos: typeof n.hardwareConcurrency === "number" ? n.hardwareConcurrency : undefined,
    });
  } catch {
    return "";
  }
}
