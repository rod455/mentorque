// Os guias de sintoma seguem as regras que a gente mesmo escreveu?
//
// POR QUE ISTO EXISTE. As regras de conteúdo dos guias (sem número inventado,
// sem preço, sem certeza mecânica absoluta, sem depoimento) nasceram como
// COMENTÁRIO no topo da primeira página. Comentário não reprova nada: ele
// depende de quem escreve o guia seguinte ter lido a página anterior inteira, e
// essa é justamente a parte que falha.
//
// Elas não são preciosismo editorial. Conteúdo de manutenção com número falso
// ou com preço solto é o tipo de erro que a pessoa descobre na oficina, contra
// nós, e que destrói de uma vez a confiança que a página levou meses para
// construir.
//
// Confere, guia a guia:
//   1. está no registro E o registro alimenta o sitemap (página fora do mapa é
//      página que ninguém acha, sem dar erro nenhum)
//   2. existe a pasta em app/<caminho>/page.tsx
//   3. título e descrição cabem no que o buscador mostra
//   4. sem preço em real no corpo
//   5. sem porcentagem sem data e sem fonte por perto
//   6. as âncoras dos blocos são únicas dentro do guia
//   7. o FAQ tem pergunta e resposta de verdade, não título solto
//
// Rode com: npm run conferir:guias
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const PASTA = join(RAIZ, "lib/site/guias");

let falhas = 0;
function conferir(nome, condicao, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

// Lê os guias como TEXTO, e isso é decisão, não preguiça: importar TypeScript
// aqui exigiria compilar, e o que interessa conferir é o texto publicado.
const NAO_SAO_GUIAS = new Set(["tipos.ts", "index.ts", "links.ts"]);
const arquivos = readdirSync(PASTA).filter((f) => f.endsWith(".ts") && !NAO_SAO_GUIAS.has(f));
conferir("existe pelo menos um guia", arquivos.length > 0);

const registro = readFileSync(join(PASTA, "index.ts"), "utf8");
const sitemap = readFileSync(join(RAIZ, "app/sitemap.ts"), "utf8");

// O sitemap precisa ler do registro, e não repetir a lista. Se alguém voltar a
// escrever os caminhos à mão lá, o próximo guia nasce fora do mapa.
conferir(
  "o sitemap lê os guias do registro",
  /GUIAS\.map/.test(sitemap),
  "app/sitemap.ts precisa espalhar GUIAS, senão guia novo não entra no mapa do site"
);

/** O corpo do guia sem os COMENTÁRIOS. */
function semComentarios(fonte) {
  // Os comentários explicam as regras citando exatamente o que elas proíbem
  // (o comentário do guia de gasolina cita "35%" para dizer que está errado).
  // Sem esta limpeza a conferência acusaria a própria documentação da regra, e
  // uma conferência que reprova o certo é uma conferência que a pessoa
  // aprende a ignorar. Foi assim que a `conferir:aviso` já aprovou um defeito
  // plantado, em 03/09.
  return fonte.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
}

for (const arquivo of arquivos) {
  const nome = arquivo.replace(/\.ts$/, "");
  const fonte = readFileSync(join(PASTA, arquivo), "utf8");
  const corpo = semComentarios(fonte);

  const caminho = (corpo.match(/caminho:\s*"([^"]+)"/) ?? [])[1];
  conferir(`${nome}: declara o caminho`, !!caminho);
  if (!caminho) continue;

  conferir(`${nome}: o caminho bate com o arquivo`, caminho === `/${nome}`, `caminho é "${caminho}"`);
  conferir(
    `${nome}: está no registro`,
    registro.includes(`./${nome}`),
    "guia fora de lib/site/guias/index.ts não entra no sitemap nem nos links entre guias"
  );
  conferir(
    `${nome}: a página existe`,
    existsSync(join(RAIZ, "app", nome, "page.tsx")),
    `falta app/${nome}/page.tsx`
  );

  // Título e descrição: o buscador corta o que passar, e corte no meio da
  // frase é o que faz um bom título parecer descuido.
  const titulo = (corpo.match(/tituloSeo:\s*\n?\s*"([^"]+)"/) ?? [])[1] ?? "";
  const descricao = (corpo.match(/descricaoSeo:\s*\n?\s*"([^"]+)"/) ?? [])[1] ?? "";
  conferir(`${nome}: o título cabe no resultado`, titulo.length > 0 && titulo.length <= 65, `${titulo.length} caracteres`);
  conferir(`${nome}: a descrição cabe no resultado`, descricao.length >= 100 && descricao.length <= 175, `${descricao.length} caracteres`);

  // SEM PREÇO. Faixa de valor muda por região, por carro e por mês; no site
  // vira promessa. Dentro do app é estimativa contextualizada ao carro.
  const precos = corpo.match(/R\$\s?[\d.,]+/g) ?? [];
  conferir(`${nome}: sem preço em real`, precos.length === 0, precos.join(", "));

  // SEM NÚMERO SOLTO. Porcentagem é o formato preferido do número inventado
  // ("90% dos casos"). Aqui ela só passa acompanhada de data, que é o que
  // permite conferir e o que avisa quando envelheceu.
  for (const trecho of corpo.split(/(?<=[.!?])\s+/)) {
    if (!/\d+\s?%/.test(trecho)) continue;
    const temData = /\b\d{2}\/\d{2}\/\d{4}\b|\bCNPE\b|cerca de|aproximadamente/.test(trecho);
    conferir(
      `${nome}: porcentagem com data ou fonte`,
      temData,
      `"${trecho.trim().slice(0, 120)}" — número sem data envelhece contra nós`
    );
  }

  // Âncoras repetidas quebram o índice em silêncio: os dois links levam ao
  // primeiro bloco e o segundo vira inalcançável.
  const ids = [...corpo.matchAll(/^\s{6}id:\s*"([^"]+)"/gm)].map((m) => m[1]);
  conferir(`${nome}: tem blocos`, ids.length >= 3, `${ids.length} blocos`);
  conferir(`${nome}: as âncoras são únicas`, new Set(ids).size === ids.length, ids.join(", "));

  // O FAQ vira dado estruturado; pergunta sem resposta de verdade é marcação
  // vazia e o Google derruba o rich result inteiro.
  //
  // RECORTA O BLOCO DO FAQ ANTES DE PROCURAR. A primeira versão procurava
  // `r:` no arquivo inteiro e casava com `observar:`, que também termina em
  // "r": ela contava as listas de observação como respostas e reprovava um
  // guia correto. Padrão frouxo em conferência não é detalhe, é a conferência
  // medindo outra coisa e ninguém percebendo.
  const faq = (corpo.match(/faq:\s*\[([\s\S]*)\]\s*,?\s*\}\s*;?\s*$/) ?? [])[1] ?? "";
  conferir(`${nome}: tem bloco de FAQ`, faq.length > 0);
  const respostas = [...faq.matchAll(/(?:^|[\s{,])r:\s*\n?\s*"([^"]+)"/g)].map((m) => m[1]);
  const perguntas = [...faq.matchAll(/(?:^|[\s{,])p:\s*\n?\s*"([^"]+)"/g)].map((m) => m[1]);
  conferir(`${nome}: o FAQ tem ao menos 4 perguntas`, perguntas.length >= 4, `${perguntas.length}`);
  conferir(`${nome}: toda pergunta tem resposta`, perguntas.length === respostas.length, `${perguntas.length} perguntas, ${respostas.length} respostas`);
  const curtas = respostas.filter((r) => r.length < 120);
  conferir(`${nome}: as respostas respondem`, curtas.length === 0, curtas.map((r) => r.slice(0, 50)).join(" | "));
}

// ── TODO GUIA TEM LINK A PARTIR DA HOME ─────────────────────────────────────
//
// O DEFEITO QUE ISTO PEGA, e ele estava de pé em 07/09/2026. O rodapé, que é o
// que liga a home aos guias, tinha o `/barulho-no-carro` ESCRITO À MÃO, de
// quando ele era o único. Os três guias seguintes subiram, entraram no sitemap
// por construção (o registro cuida disso), abriram, funcionaram, e ficaram sem
// nenhum link a partir da home: o único caminho até eles era o bloco de irmãos
// no pé de outro guia.
//
// Nada deu erro. O sitemap estava certo, as páginas estavam certas, e três das
// quatro páginas de palavra-chave do site eram quase órfãs. Para site novo,
// link interno é metade da chance de a página ser rastreada, e o Search Console
// não diz "faltou link": diz "detectada, mas não indexada".
//
// A lista do rodapé mora separada do registro de propósito (o rodapé é
// componente de cliente e importar o registro arrastaria o corpo dos guias para
// o pacote do navegador). Esta conferência é o que torna a separação segura:
// duas listas que ninguém compara divergem, e foi assim que a primeira divergiu.
const links = readFileSync(join(PASTA, "links.ts"), "utf8");

// As páginas por onde o robô entra no site. As duas tinham o MESMO caminho
// escrito à mão, e por isso são cobradas as duas: consertar só uma deixaria a
// outra sangrando igual.
const PORTAS = [
  ["o rodapé da home", "components/sections/Footer.tsx"],
  ["o rodapé da /sobre", "app/sobre/page.tsx"],
];

for (const [nome, caminho] of PORTAS) {
  const fonte = readFileSync(join(RAIZ, caminho), "utf8");
  conferir(
    `${nome} lê os guias da lista, e não escreve caminho à mão`,
    /LINKS_DOS_GUIAS\.map/.test(fonte),
    `com o caminho escrito em ${caminho}, o próximo guia nasce sem link a partir dali`
  );
}

const noRegistro = [...registro.matchAll(/^import \{ guia as \w+ \} from "\.(\/[^"]+)";$/gm)].map((m) => m[1]);
const naLista = [...links.matchAll(/caminho:\s*"([^"]+)"/g)].map((m) => m[1]);

for (const caminho of noRegistro) {
  conferir(
    `${caminho}: tem link no rodapé`,
    naLista.includes(caminho),
    "guia publicado e fora de lib/site/guias/links.ts é página sem link a partir da home"
  );
}
for (const caminho of naLista) {
  conferir(
    `${caminho}: o link do rodapé aponta para um guia que existe`,
    noRegistro.includes(caminho),
    "link para guia que não está no registro é link quebrado no rodapé de todo o site"
  );
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) de guias reprovaram.`);
  process.exit(1);
}
console.log(`Guias: ${arquivos.length} no ar, no sitemap, com link na home, sem preço e sem número solto.`);
