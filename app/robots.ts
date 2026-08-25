import type { MetadataRoute } from "next";

// robots.txt.
//
// Também não existia. Sem arquivo, o padrão é "pode tudo", então isto não abre
// nada novo: ele fecha o que não deveria ser rastreado e, principalmente,
// aponta o sitemap, que é como um site novo encurta o tempo até a primeira
// indexação.
//
// Cuidado registrado para quem mexer aqui: bloquear um caminho no robots NÃO
// tira a página do índice, só impede o robô de ler o conteúdo dela. Página que
// precisa sair do índice usa `robots: { index: false }` no metadata, como faz a
// /landing. Bloquear no robots uma página com noindex é o pior dos mundos: o
// robô nunca lê o noindex e a página pode ficar indexada sem descrição.
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mentorque.com.br";

// Caminhos que nenhum robô precisa ler, de IA ou de busca.
const FECHADOS = ["/api/", "/painel", "/auth-bridge", "/embed"];

// Robôs de IA, nomeados um a um DE PROPÓSITO.
//
// Tecnicamente é redundante: sem regra, o padrão já é "pode". Mas a decisão de
// aparecer nas respostas de IA é grande demais para ficar dependendo de um
// padrão que qualquer edição futura no bloco "*" derruba junto. Nomeados, eles
// têm regra própria, e quem for restringir o site amanhã vê o que está
// escolhendo desligar.
//
// A escolha por trás disso: o conteúdo que o Mentorque publica na WEB é
// material de topo de funil, escrito para ser encontrado. Ser lido por um
// modelo e virar resposta para quem pergunta "meu carro está fazendo barulho"
// é exatamente o objetivo. O acervo que é produto (as trilhas e as aulas) não
// mora aqui: mora dentro do app, atrás de conta, e nenhum destes robôs alcança.
//
// Vale saber o que cada família faz, porque não é a mesma coisa:
//   busca com IA   respondem perguntas citando a fonte, com link de volta
//   treino         usam o texto para treinar o modelo, sem link de volta
//   sob demanda    buscam a página na hora porque um usuário pediu
// Fechar os de treino protege o texto e some das respostas; para um site novo
// que precisa ser descoberto, some é o custo maior.
const ROBOS_DE_IA = [
  // OpenAI: treino, índice de busca do ChatGPT e busca na hora a pedido de alguém.
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  // Anthropic.
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  // Perplexity.
  "PerplexityBot",
  "Perplexity-User",
  // Gemini e resumos de IA do Google. Separado do Googlebot: bloquear este NÃO
  // tira o site da busca, só o tira das respostas geradas.
  "Google-Extended",
  // Apple Intelligence e Siri. Mesma lógica do anterior em relação ao Applebot.
  "Applebot-Extended",
  // Copilot e o Bing, que é o índice por trás dele.
  "Bingbot",
  // Meta AI (WhatsApp, Instagram).
  "meta-externalagent",
  // Alexa e a IA da Amazon.
  "Amazonbot",
  // Assistente do DuckDuckGo.
  "DuckAssistBot",
  "Mistral-User",
  // Common Crawl: acervo público que alimenta MUITOS modelos de uma vez só.
  // É o de maior alcance indireto da lista.
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Rotas de dados, ferramenta interna e passos técnicos do login. A
        // /landing NÃO entra aqui: ela sai do índice pelo noindex dela, e o
        // robô precisa poder ler a página para enxergar esse noindex.
        disallow: FECHADOS,
      },
      // Mesmo tratamento do robô de busca comum: pode o site, menos o que não
      // é conteúdo. Um bloco por robô, para cada nome aparecer no arquivo.
      ...ROBOS_DE_IA.map((nome) => ({
        userAgent: nome,
        allow: "/",
        disallow: FECHADOS,
      })),
    ],
    sitemap: new URL("/sitemap.xml", SITE).toString(),
    host: SITE,
  };
}
