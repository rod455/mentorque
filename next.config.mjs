/** @type {import('next').NextConfig} */

// BUILD_TARGET=native gera a versão que vai DENTRO do app da loja: HTML/CSS/JS
// estáticos, empacotados no binário. Sem servidor, sem rede na abertura.
// As rotas de API continuam existindo só no build da Vercel — o app nativo
// chama elas por URL absoluta (ver lib/app/apiBase.ts).
const native = process.env.BUILD_TARGET === "native";

// Atalhos de venda: mentorque.com.br/ALE100 no lugar do link comprido, para
// falar em voz alta e mandar em conversa. Cada atalho já leva o plano, o
// cupom aplicado E o rastreio (utm_campaign = o próprio atalho), então o
// funil conta as vendas de cada link sem trabalho extra.
//
// São gerados nas duas grafias (ALE100 e ale100) porque a comparação de rota
// diferencia maiúsculas. E são temporários (307) de propósito: atalho
// permanente fica gravado no navegador das pessoas para sempre, e a gente
// perde o direito de mudar para onde ele aponta.
const ATALHOS = [
  { de: "ALE100", para: "/app?assinar=mensal&cupom=ALESSANDRO1MES" },
  { de: "MES100", para: "/app?assinar=mensal&cupom=PREMIUM1MES" },
  { de: "ANUAL30", para: "/app?assinar=anual&cupom=PREMIUM30" },
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // A exportação estática não tem servidor para otimizar imagem.
    unoptimized: native,
  },
  ...(native
    ? {
        output: "export",
        // Cada rota vira uma pasta com index.html — é o que a WebView abre
        // ao carregar um caminho, já que não há servidor para reescrever.
        trailingSlash: true,
        distDir: ".next-native",
      }
    : {
        // Só no site: o export estático não suporta redirect (e o app da
        // loja não é lugar de link de venda).
        async redirects() {
          return ATALHOS.flatMap(({ de, para }) => {
            const destino = `${para}&utm_source=atalho&utm_campaign=${de.toLowerCase()}`;
            return [
              { source: `/${de}`, destination: destino, permanent: false },
              { source: `/${de.toLowerCase()}`, destination: destino, permanent: false },
            ];
          });
        },
      }),
};

export default nextConfig;
