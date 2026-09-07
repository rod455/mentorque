// A conta do recorte de foto, sem tela nenhuma.
//
// PEDIDO DO DONO (07/09/2026): "usuário escolhe a foto, se for grande, aparece
// um campo para selecionar qual parte da foto ele quer, da mesma forma que
// funciona no WhatsApp e no Facebook". Vale para a foto do carro e a do perfil.
//
// O que o WhatsApp faz, dito em regras: a foto aparece atrás de uma MOLDURA
// fixa; a pessoa arrasta e aproxima; a moldura nunca fica com borda vazia
// (a foto sempre cobre a moldura inteira); e o que sai é exatamente o pedaço
// que estava dentro da moldura. Todas as quatro regras moram aqui, em funções
// puras, para a conferência exercitá-las sem navegador e sem aparelho. A tela
// (components/app/AjusteDeFoto.tsx) só desenha e obedece.
//
// UNIDADES, porque é aqui que recorte costuma errar: a moldura e o deslocamento
// são em pixels DE TELA; a imagem e o retângulo de saída são em pixels DA
// IMAGEM. A escala converte entre os dois, e é sempre "quantos pixels de tela
// por pixel de imagem".

export type Tamanho = { largura: number; altura: number };

/** O estado do ajuste: quanto a pessoa aproximou e para onde arrastou. */
export type Ajuste = {
  /** Multiplicador sobre a escala de cobertura. 1 = a foto só cobre a moldura. */
  zoom: number;
  /** Deslocamento do CENTRO da foto em relação ao centro da moldura, em px de tela. */
  dx: number;
  dy: number;
};

export type Retangulo = { x: number; y: number; largura: number; altura: number };

/** O zoom máximo. Mais que isto vira pixel gigante e não ajuda ninguém. */
export const ZOOM_MAXIMO = 4;

/**
 * A menor escala em que a foto cobre a moldura inteira, sem borda vazia.
 * É o "object-fit: cover" em número.
 */
export function escalaDeCobertura(imagem: Tamanho, moldura: Tamanho): number {
  return Math.max(moldura.largura / imagem.largura, moldura.altura / imagem.altura);
}

/** A escala efetiva: cobertura vezes o zoom que a pessoa escolheu. */
export function escalaEfetiva(imagem: Tamanho, moldura: Tamanho, zoom: number): number {
  return escalaDeCobertura(imagem, moldura) * limitaZoom(zoom);
}

export function limitaZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) return 1;
  return Math.min(ZOOM_MAXIMO, Math.max(1, zoom));
}

/**
 * Segura o arrasto para a moldura NUNCA mostrar borda vazia.
 *
 * A foto desenhada tem `imagem * escala` de tamanho. O centro dela pode se
 * afastar do centro da moldura no máximo metade da sobra em cada eixo; passou
 * disso, entra fundo pela borda. Quando a foto é exatamente do tamanho da
 * moldura naquele eixo, a sobra é zero e o deslocamento é zero.
 */
export function limitaDeslocamento(imagem: Tamanho, moldura: Tamanho, ajuste: Ajuste): Ajuste {
  const zoom = limitaZoom(ajuste.zoom);
  const escala = escalaEfetiva(imagem, moldura, zoom);
  const sobraX = Math.max(0, (imagem.largura * escala - moldura.largura) / 2);
  const sobraY = Math.max(0, (imagem.altura * escala - moldura.altura) / 2);
  const dx = Number.isFinite(ajuste.dx) ? Math.min(sobraX, Math.max(-sobraX, ajuste.dx)) : 0;
  const dy = Number.isFinite(ajuste.dy) ? Math.min(sobraY, Math.max(-sobraY, ajuste.dy)) : 0;
  return { zoom, dx, dy };
}

/**
 * O pedaço da IMAGEM que está dentro da moldura, em pixels da imagem.
 *
 * É a única conta que vai para o canvas, e por isso ela parte do ajuste já
 * limitado: um retângulo que saísse da imagem produziria borda preta no
 * resultado, que é exatamente o que a regra da cobertura proíbe.
 */
export function retanguloDoRecorte(imagem: Tamanho, moldura: Tamanho, ajuste: Ajuste): Retangulo {
  const a = limitaDeslocamento(imagem, moldura, ajuste);
  const escala = escalaEfetiva(imagem, moldura, a.zoom);
  // Onde o canto superior esquerdo da foto cai na tela, medido a partir do
  // canto superior esquerdo da moldura.
  const fotoX = moldura.largura / 2 + a.dx - (imagem.largura * escala) / 2;
  const fotoY = moldura.altura / 2 + a.dy - (imagem.altura * escala) / 2;
  // Arredonda para o pixel mais próximo e depois PRENDE o retângulo dentro da
  // imagem, tamanho primeiro e posição depois. A ordem importa, e a primeira
  // versão errou nela: arredondava `x` para baixo e o tamanho para cima, cada
  // um por conta própria, e no limite da borda `x + largura` passava da imagem
  // em 1 pixel, por erro de ponto flutuante. A conferência pegou isso em cinco
  // gestos antes de a tela existir. Um pixel a mais pedido ao canvas é uma
  // linha preta na borda da foto pronta, que é exatamente o que a regra da
  // cobertura promete que não acontece.
  const largura = Math.min(imagem.largura, Math.round(moldura.largura / escala));
  const altura = Math.min(imagem.altura, Math.round(moldura.altura / escala));
  const x = Math.min(imagem.largura - largura, Math.max(0, Math.round(-fotoX / escala)));
  const y = Math.min(imagem.altura - altura, Math.max(0, Math.round(-fotoY / escala)));
  return { x, y, largura, altura };
}

/**
 * A foto precisa passar pelo ajuste?
 *
 * "Se for grande", nas palavras do dono. Lido assim: a foto precisa de ajuste
 * quando NÃO cabe na moldura do jeito que está, ou seja, quando a proporção é
 * outra (alguma parte vai ficar de fora e alguém tem de escolher qual) ou
 * quando ela é maior do que o que vai ser guardado (dá para escolher um pedaço
 * em vez de encolher tudo). Uma foto já quadrada e pequena entra direto: pedir
 * ajuste ali seria uma tela a mais para não decidir nada.
 */
export function precisaDeAjuste(imagem: Tamanho, alvo: Tamanho): boolean {
  if (imagem.largura <= 0 || imagem.altura <= 0) return false;
  const proporcaoDaImagem = imagem.largura / imagem.altura;
  const proporcaoDoAlvo = alvo.largura / alvo.altura;
  const proporcaoDiferente = Math.abs(proporcaoDaImagem - proporcaoDoAlvo) > 0.01;
  const maiorQueOAlvo = imagem.largura > alvo.largura || imagem.altura > alvo.altura;
  return proporcaoDiferente || maiorQueOAlvo;
}

/**
 * O gesto de pinça: dois dedos que se afastam aproximam a foto.
 * Devolve o zoom novo a partir da razão entre as distâncias dos dedos.
 */
export function zoomDaPinca(zoomAntes: number, distanciaAntes: number, distanciaAgora: number): number {
  if (distanciaAntes <= 0) return limitaZoom(zoomAntes);
  return limitaZoom(zoomAntes * (distanciaAgora / distanciaAntes));
}
