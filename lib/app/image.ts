import type { Retangulo, Tamanho } from "./recorte";

export type ImagemLida = Tamanho & { dataUrl: string };

/** Lê o arquivo escolhido e descobre o tamanho dele, sem mexer em nada. */
export function lerImagem(file: File): Promise<ImagemLida> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => resolve({ dataUrl, largura: img.naturalWidth, altura: img.naturalHeight });
      img.onerror = reject;
      img.src = dataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Recorta o pedaço `r` da imagem (em pixels da imagem) e devolve um JPEG do
 * tamanho `saida`. A conta de QUAL pedaço mora em lib/app/recorte.ts; aqui só
 * o canvas.
 */
export function recortarImagem(dataUrl: string, r: Retangulo, saida: Tamanho, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = saida.largura;
      canvas.height = saida.altura;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("no ctx"));
      ctx.drawImage(img, r.x, r.y, r.largura, r.altura, 0, 0, saida.largura, saida.altura);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// Downscale an uploaded image to a small JPEG data URL so it fits localStorage.
export function resizeImage(file: File, max = 1000, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no ctx"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
