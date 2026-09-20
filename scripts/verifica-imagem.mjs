// O otimizador de imagem do Next continua desligado?
//
// POR QUE ISTO EXISTE (20/09/2026). A primeira rodada do agente de segurança
// achou uma crítica de execução remota na API de imagem do `next` 14.2.5, com
// conserto só na linha 15. A configuração daqui ligava `image/avif` de
// propósito, então o caminho estava aberto.
//
// O conserto foi desligar o otimizador inteiro, e ele custou zero por um motivo
// que pode deixar de ser verdade a qualquer momento: NINGUÉM USA `next/image`
// neste repositório. Todas as imagens são `<img>` comum servida de `public/`.
//
// É exatamente esse tipo de conserto que apodrece calado. Alguém acrescenta um
// `next/image` daqui a três meses, ele não otimiza nada (porque
// `unoptimized: true`), ninguém percebe, e a primeira pessoa a "consertar" isso
// vai tirar o `unoptimized` e reabrir a porta sem saber que ela existia.
//
// Então a conferência guarda as duas pontas: o desligamento E a premissa dele.
//
// Rode com: npm run conferir:imagem
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const PASTAS = ["app", "components", "lib"];
let falhas = 0;

function conferir(nome, condicao, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

function arquivos(dir) {
  const saida = [];
  let itens;
  try {
    itens = readdirSync(join(RAIZ, dir));
  } catch {
    return saida;
  }
  for (const item of itens) {
    const caminho = join(dir, item);
    if (statSync(join(RAIZ, caminho)).isDirectory()) saida.push(...arquivos(caminho));
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(item)) saida.push(caminho);
  }
  return saida;
}

/** Sem comentários: este arquivo e a config falam dos mesmos nomes o tempo todo. */
function semComentarios(fonte) {
  return fonte.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/gm, " ");
}

console.log("Imagem: o otimizador continua desligado, e a premissa disso continua de pé?");

const config = semComentarios(readFileSync(join(RAIZ, "next.config.mjs"), "utf8"));

conferir(
  "o otimizador de imagem está desligado",
  /unoptimized:\s*true/.test(config),
  "com ele ligado, o /_next/image do next 14 volta a expor a crítica de AVIF",
);

conferir(
  "o AVIF não voltou para a configuração",
  !/image\/avif/.test(config),
  "é o formato citado na crítica, e sem otimizador ele não serve para nada mesmo",
);

// A PREMISSA. Se ela cair, o conserto acima deixa de ser de graça.
const usos = [];
for (const pasta of PASTAS) {
  for (const alvo of arquivos(pasta)) {
    const fonte = semComentarios(readFileSync(join(RAIZ, alvo), "utf8"));
    if (/from\s+["']next\/image["']/.test(fonte)) usos.push(alvo);
  }
}

conferir(
  "ninguém passou a usar next/image",
  usos.length === 0,
  usos.length
    ? `usado em: ${usos.join(", ")}\n       ` +
      "com `unoptimized: true` esse componente não otimiza nada. A decisão volta a ser\n       " +
      "entre subir para a linha 15 do next ou viver sem otimização. Ver o comentário\n       " +
      "do bloco `images` em next.config.mjs."
    : "",
);

if (falhas) {
  console.error(`\n${falhas} conferência(s) de imagem reprovaram.`);
  process.exit(1);
}
console.log("Imagem: otimizador desligado, AVIF fora, e nenhum next/image no caminho.");
