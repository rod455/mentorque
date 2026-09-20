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

// Atalhos de rede social: o link curto que vai na bio, com a etiqueta embutida.
//
// POR QUE (19/09/2026, pergunta do dono: "coloco o /baixar limpo?"). Não: o
// `/baixar` sozinho manda a pessoa para a loja certa e chega SEM NOME no
// funil, que é o problema que ele foi criado para resolver. Mas link comprido
// cheio de `utm_` na bio é feio e convida a pessoa a apagar o rabo dele.
//
// O atalho resolve os dois: ele é curto para quem lê e carrega a etiqueta para
// quem mede. Mesma ideia dos atalhos de venda acima, temporários pelo mesmo
// motivo (atalho permanente fica gravado no navegador para sempre).
const ATALHOS_SOCIAIS = [
  { de: "ig", origem: "instagram", meio: "social", campanha: "bio" },
  { de: "yt", origem: "youtube", meio: "social", campanha: "descricao" },
];

const nextConfig = {
  reactStrictMode: true,
  // O OTIMIZADOR DE IMAGEM FOI DESLIGADO INTEIRO (20/09/2026).
  //
  // Achado da primeira rodada do agente de segurança. O `next` 14.2.5 carrega
  // uma crítica de execução remota na API de imagem que só tem conserto na
  // linha 15, e a configuração daqui ligava `image/avif` de propósito.
  //
  // O TAMANHO REAL DO RISCO, que vale registrar para ninguém se assustar nem
  // relaxar demais: sem `remotePatterns` nem `domains`, o `/_next/image` recusa
  // endereço de fora. Ou seja, para explorar, o arquivo malicioso teria que ser
  // servido pelo NOSSO site. É estreito, mas não é fechado.
  //
  // O que fecha de verdade é não ter otimizador nenhum, e isso aqui custa ZERO:
  // `next/image` não é importado em lugar nenhum do repositório (conferido, e a
  // conferência em scripts/verifica-imagem.mjs guarda isso). Todas as imagens
  // são `<img>` comum servida de `public/`. O `formats` saiu junto porque sem
  // otimizador ele não decide mais nada.
  //
  // Se um dia alguém precisar do `next/image`, a conferência reprova e este
  // comentário é o lugar de reabrir a conversa: aí a decisão passa a ser entre
  // subir para a linha 15 ou viver sem AVIF.
  images: {
    unoptimized: true,
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
          const venda = ATALHOS.flatMap(({ de, para }) => {
            const destino = `${para}&utm_source=atalho&utm_campaign=${de.toLowerCase()}`;
            return [
              { source: `/${de}`, destination: destino, permanent: false },
              { source: `/${de.toLowerCase()}`, destination: destino, permanent: false },
            ];
          });
          const social = ATALHOS_SOCIAIS.flatMap(({ de, origem, meio, campanha }) => {
            const destino = `/baixar?utm_source=${origem}&utm_medium=${meio}&utm_campaign=${campanha}`;
            return [
              { source: `/${de}`, destination: destino, permanent: false },
              { source: `/${de.toUpperCase()}`, destination: destino, permanent: false },
            ];
          });
          return [...venda, ...social];
        },
      }),
};

export default nextConfig;
