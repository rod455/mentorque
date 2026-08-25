import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/stores";

// Identidade do Mentorque em dado estruturado (schema.org).
//
// Para que serve, em português claro: buscador e modelo de linguagem não leem
// a página como uma pessoa lê. Eles procuram uma declaração legível por máquina
// dizendo "isto é um aplicativo, chama-se X, custa Y, roda em Z". Sem isso, o
// resumo que sai numa resposta de IA é chute a partir do texto de marketing, e
// texto de marketing é justamente onde estão as metáforas ("especialista no
// bolso") que viram descrição errada.
//
// Mora num arquivo só porque a home e a /sobre precisam declarar a MESMA
// entidade. Se cada página inventasse a sua, com preço ou nome levemente
// diferente, o buscador veria duas coisas e não confiaria em nenhuma.
//
// A âncora disso é o `@id`: as duas páginas apontam para
// https://www.mentorque.com.br/#app, então tudo o que qualquer página disser
// sobre esse id é entendido como a mesma coisa, não como um app novo.

const SITE = "https://www.mentorque.com.br";

// A definição do produto em uma frase, sem metáfora e sem adjetivo de venda.
// É esta que tende a virar a citação quando uma IA resume o Mentorque, então
// ela é escrita para ser copiada inteira e continuar verdadeira fora daqui.
export const DEFINICAO_MENTORQUE =
  "Mentorque é um aplicativo brasileiro de manutenção e educação automotiva. " +
  "Ele ajuda o dono de carro a entender o que o carro dele tem, a decidir a urgência " +
  "de um problema e a chegar na oficina sabendo o que perguntar.";

const RECURSOS = [
  "Diagnóstico por sintoma com causas prováveis e urgência",
  "Trilhas e aulas de mecânica para leigos",
  "Histórico de manutenção e lembretes de revisão",
  "Leitura de códigos OBD2",
  "Comparador de etanol e gasolina",
  "Estimativa de faixa de preço de serviço",
];

// O aplicativo. Sem `aggregateRating` DE PROPÓSITO: não existe avaliação real
// nas lojas ainda, e nota inventada em dado estruturado é penalidade além de
// ser mentira. Quando houver avaliação de verdade, ela entra aqui com a fonte.
const APLICATIVO = {
  "@type": "MobileApplication",
  "@id": `${SITE}/#app`,
  name: "Mentorque",
  description: DEFINICAO_MENTORQUE,
  applicationCategory: "AutoAndVehiclesApplication",
  operatingSystem: "Android, iOS, Web",
  inLanguage: ["pt-BR", "en"],
  url: SITE,
  installUrl: [PLAY_STORE_URL, APP_STORE_URL],
  featureList: RECURSOS,
  offers: [
    {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL",
      description: "Uso gratuito: garagem, diagnóstico por sintoma, histórico e aulas abertas.",
    },
    {
      "@type": "Offer",
      price: "29.90",
      priceCurrency: "BRL",
      description: "Premium mensal: acervo completo, relatórios e diagnóstico aprofundado.",
    },
    {
      "@type": "Offer",
      price: "239.90",
      priceCurrency: "BRL",
      description: "Premium anual.",
    },
  ],
  publisher: { "@id": `${SITE}/#org` },
};

const ORGANIZACAO = {
  "@type": "Organization",
  "@id": `${SITE}/#org`,
  name: "Mentorque",
  url: SITE,
  description: DEFINICAO_MENTORQUE,
  logo: `${SITE}/og-image.png`,
};

const SITE_WEB = {
  "@type": "WebSite",
  "@id": `${SITE}/#site`,
  name: "Mentorque",
  url: SITE,
  inLanguage: "pt-BR",
  publisher: { "@id": `${SITE}/#org` },
};

/** Quem o Mentorque é. Vai na home e serve de base para as outras páginas. */
export const GRAFO_BASE = [APLICATIVO, ORGANIZACAO, SITE_WEB];

/** Monta o bloco pronto para o `<script type="application/ld+json">`. */
export function jsonLd(extra: Record<string, unknown>[] = []): string {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": [...GRAFO_BASE, ...extra] });
}
