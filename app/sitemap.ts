import type { MetadataRoute } from "next";

// Mapa do site para os buscadores.
//
// Não existia. O site subiu, a propriedade foi verificada no Search Console e
// nunca houve um sitemap: descoberta 100% por link, que é o caminho mais lento
// justamente para página nova. Com a primeira LP de palavra-chave indo ao ar,
// isto deixa de ser detalhe.
//
// Só entram páginas INDEXÁVEIS de conteúdo. Ficam de fora, de propósito:
//   /landing        noindex por decisão (é a página de tráfego pago)
//   /painel         portão por chave, é ferramenta interna
//   /app            aplicação renderizada no cliente: o HTML servido é casca
//   /embed          destinada a iframe dentro do app
//   /auth-bridge    passo técnico do login, não é destino de leitura
//   /api/*          rotas de dados
//
// As páginas legais existem em dois idiomas (/privacidade e /privacy). As duas
// entram: são conteúdos distintos, cada uma na sua língua, e nenhuma é cópia
// da outra no mesmo idioma.
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mentorque.com.br";

type Pagina = { caminho: string; prioridade: number; frequencia: MetadataRoute.Sitemap[number]["changeFrequency"] };

const PAGINAS: Pagina[] = [
  { caminho: "/", prioridade: 1, frequencia: "weekly" },
  { caminho: "/barulho-no-carro", prioridade: 0.8, frequencia: "monthly" },
  // Página de referência do produto: é a que uma IA cita quando alguém
  // pergunta por app de manutenção de carro. Prioridade alta de propósito.
  { caminho: "/sobre", prioridade: 0.9, frequencia: "monthly" },
  { caminho: "/privacidade", prioridade: 0.3, frequencia: "yearly" },
  { caminho: "/termos", prioridade: 0.3, frequencia: "yearly" },
  { caminho: "/privacy", prioridade: 0.3, frequencia: "yearly" },
  { caminho: "/terms", prioridade: 0.3, frequencia: "yearly" },
  { caminho: "/excluir-conta", prioridade: 0.3, frequencia: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGINAS.map((p) => ({
    url: new URL(p.caminho, SITE).toString(),
    changeFrequency: p.frequencia,
    priority: p.prioridade,
  }));
}
