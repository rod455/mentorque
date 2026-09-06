// Onde a Biela está desenhada em cada chapa, lido da própria chapa.
//
// POR QUE ISTO EXISTE (06/09/2026). A zona livre de cada chapa estava anotada
// como UM número por arquivo, copiado do LEIA-ME para o registro. Esse número é
// o pior caso da chapa inteira: a linha em que a Biela avança mais para a
// esquerda. Só que a Biela não é um retângulo. Na chapa da curiosidade ela
// entra até x 434 na altura do braço estendido, mas em cima da cabeça dela
// sobram 724px de quadro vazio.
//
// Com um número só, o título era obrigado a caber nos 405px do braço, e o
// resultado foi medido: das 63 perguntas do banco, ZERO cabiam na curiosidade.
// Os exemplos que o dono mandou usam justamente a faixa larga de cima para o
// título, e a estreita para o corpo.
//
// Então o registro passou a declarar DUAS faixas, e alguém precisa provar que
// as duas são livres de verdade. É o que este módulo faz: abre o PNG e mede.
// Ele não roda em produção; serve à `npm run conferir:pecas`. A rota confia no
// registro, porque decodificar PNG a cada chamada seria caro e inútil.
//
// A CONSEQUÊNCIA QUE IMPORTA: quando a v2 das chapas chegar (o LEIA-ME já
// avisa que ela vem, "mantendo os mesmos nomes de arquivo"), a conferência
// mede as chapas novas e reprova sozinha se as faixas declaradas deixarem de
// ser livres. Não é preciso lembrar de reconferir nada.
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

/**
 * Descompacta um PNG RGB de 8 bits, sem biblioteca.
 *
 * As chapas são todas `color type 2` (RGB), 8 bits, sem entrelaçamento, o que
 * é o caso mais simples do formato: os dados são uma sequência de linhas, cada
 * uma com um byte de filtro na frente. Trazer uma dependência de imagem para
 * ler oito arquivos nossos seria pior do que estas quarenta linhas.
 */
function pixels(caminho: string): { largura: number; altura: number; dados: Buffer } {
  const b = readFileSync(caminho);
  const largura = b.readUInt32BE(16);
  const altura = b.readUInt32BE(20);
  const bits = b[24];
  const tipo = b[25];
  const entrelacado = b[28];
  if (bits !== 8 || tipo !== 2 || entrelacado !== 0) {
    throw new Error(`${caminho}: esperava PNG RGB de 8 bits sem entrelaçamento, veio bits=${bits} tipo=${tipo} entrelaçado=${entrelacado}`);
  }

  const partes: Buffer[] = [];
  let p = 8;
  while (p + 8 <= b.length) {
    const len = b.readUInt32BE(p);
    const nome = b.toString("ascii", p + 4, p + 8);
    if (nome === "IDAT") partes.push(b.subarray(p + 8, p + 8 + len));
    if (nome === "IEND") break;
    p += 12 + len;
  }

  const cru = inflateSync(Buffer.concat(partes));
  const bpp = 3;
  const passo = largura * bpp;
  const dados = Buffer.alloc(altura * passo);

  // Desfaz os filtros por linha. Cada um se apoia no pixel da esquerda (a), no
  // de cima (b) e no da diagonal (c), e a linha de cima já vem reconstruída.
  for (let y = 0; y < altura; y++) {
    const filtro = cru[y * (passo + 1)];
    const linha = cru.subarray(y * (passo + 1) + 1, y * (passo + 1) + 1 + passo);
    for (let i = 0; i < passo; i++) {
      const a = i >= bpp ? dados[y * passo + i - bpp] : 0;
      const c = y > 0 && i >= bpp ? dados[(y - 1) * passo + i - bpp] : 0;
      const acima = y > 0 ? dados[(y - 1) * passo + i] : 0;
      let v = linha[i];
      if (filtro === 1) v += a;
      else if (filtro === 2) v += acima;
      else if (filtro === 3) v += (a + acima) >> 1;
      else if (filtro === 4) {
        const pp = a + acima - c;
        const pa = Math.abs(pp - a), pb = Math.abs(pp - acima), pc = Math.abs(pp - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? acima : c;
      }
      dados[y * passo + i] = v & 0xff;
    }
  }
  return { largura, altura, dados };
}

/**
 * Para cada linha da chapa, o menor x em que já existe desenho.
 *
 * O quadro-negro tem textura, então um pixel claro solto não conta: exige-se
 * uma sequência. E "desenho" é pixel claro OU colorido, porque o macacão da
 * Biela é escuro mas azulado, enquanto o quadro é cinza neutro.
 */
export function perfilDaChapa(caminho: string, xDe = 60): number[] {
  const { largura, altura, dados } = pixels(caminho);
  const CLARO = 78;
  const COLORIDO = 26;
  const CORRIDA = 10;
  const perfil: number[] = [];
  for (let y = 0; y < altura; y++) {
    let inicio = largura;
    let corrida = 0;
    for (let x = xDe; x < largura; x++) {
      const i = y * largura * 3 + x * 3;
      const r = dados[i], g = dados[i + 1], b = dados[i + 2];
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      if (max > CLARO || max - min > COLORIDO) {
        if (++corrida >= CORRIDA) { inicio = x - (CORRIDA - 1); break; }
      } else corrida = 0;
    }
    perfil.push(inicio);
  }
  return perfil;
}

/** Até onde dá para escrever, à esquerda de tudo que já está desenhado, na faixa y1..y2. */
export function bordaLivre(perfil: number[], y1: number, y2: number): number {
  return Math.min(...perfil.slice(y1, y2));
}
