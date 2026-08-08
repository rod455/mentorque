/** @type {import('next').NextConfig} */

// BUILD_TARGET=native gera a versão que vai DENTRO do app da loja: HTML/CSS/JS
// estáticos, empacotados no binário. Sem servidor, sem rede na abertura.
// As rotas de API continuam existindo só no build da Vercel — o app nativo
// chama elas por URL absoluta (ver lib/app/apiBase.ts).
const native = process.env.BUILD_TARGET === "native";

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
    : {}),
};

export default nextConfig;
