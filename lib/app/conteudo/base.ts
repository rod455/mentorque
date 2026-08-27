import type { Locale } from "@/lib/i18n";

// O tradutor que todo módulo de conteúdo recebe.
//
// `T("português", "english")` devolve a versão do idioma corrente. É o único
// jeito de escrever texto bilíngue aqui, e é de propósito: com as duas versões
// LADO A LADO na mesma linha, é impossível traduzir metade e esquecer o resto,
// que é o defeito clássico de arquivos de tradução separados por idioma.
export type Tradutor = (pt: string, en: string) => string;

export const tradutor = (locale: Locale): Tradutor => (pt, en) => (locale === "pt" ? pt : en);
