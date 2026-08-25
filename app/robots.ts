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

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Rotas de dados, ferramenta interna e passos técnicos do login. A
        // /landing NÃO entra aqui: ela sai do índice pelo noindex dela, e o
        // robô precisa poder ler a página para enxergar esse noindex.
        disallow: ["/api/", "/painel", "/auth-bridge", "/embed"],
      },
    ],
    sitemap: new URL("/sitemap.xml", SITE).toString(),
  };
}
