#!/usr/bin/env node
/**
 * Gera as peças de rede social escrevendo por cima das chapas de fundo.
 *
 * POR QUE UM NAVEGADOR, e não uma biblioteca de imagem. O texto é a peça
 * inteira: quebra de linha, entrelinha, caixa alta no título e caixa mista no
 * corpo, opções com marcador. Fazer isso à mão em canvas é reimplementar
 * tipografia; num navegador é CSS, e o Chromium já está aqui por causa das
 * suítes. O que sai é PNG, e o que entra é a chapa mais um objeto de conteúdo.
 *
 * O QUE ESTE ARQUIVO NÃO FAZ, de propósito: escrever o conteúdo. Ele recebe
 * texto pronto. Quem decide o que a peça diz é o agente, e separar as duas
 * coisas é o que permite conferir o desenho sem depender de modelo nenhum.
 *
 * Uso:
 *   node scripts/pecas.mjs --exemplo                   gera o exemplo de referência
 *   node scripts/pecas.mjs --json peca.json            gera a partir de um arquivo
 *   node scripts/pecas.mjs --json peca.json --telegram manda para aprovação
 *
 * O JSON de uma peça:
 *   {
 *     "secao": "desafio",             desafio | dica | curiosidade | pergunta
 *     "formatos": ["feed","stories"], quais gerar
 *     "titulo": "A luz de injeção acendeu. O que pode ser?",
 *     "opcoes": ["Tampa do tanque mal fechada", "..."],   só no desafio
 *     "corpo": "Texto corrido",                            nas outras seções
 *     "destaque": "ambar"
 *   }
 */
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = join(import.meta.dirname, "..");
const args = process.argv.slice(2);
const opcao = (nome) => { const i = args.indexOf(`--${nome}`); return i >= 0 ? args[i + 1] : undefined; };
const saida = opcao("saida") ?? join(RAIZ, "pecas-geradas");

// A chapa e as cores vêm do registro, que é conferido contra o LEIA-ME pela
// `npm run conferir:pecas`. Aqui nada é medido de novo.
const { CHAPAS, CORES, DESTAQUE_PERMITIDO, NOME_DA_SECAO, RESPIRO_DO_FEED, chapaDe } = await import(
  join(RAIZ, "lib/pecas/chapas.ts")
);

const b64 = (caminho) => readFileSync(caminho).toString("base64");

/**
 * O HTML de uma peça.
 *
 * Tudo embutido (chapa e fontes em base64) porque o navegador roda sem rede: a
 * geração não pode depender do Google Fonts estar de pé no dia em que alguém
 * for publicar.
 *
 * O texto é posicionado em pixels da própria chapa, dentro da zona livre, e o
 * `overflow: hidden` no bloco é rede de segurança e não solução: se o texto não
 * couber, a regra do LEIA-ME é ENCURTAR o texto, nunca diminuir a fonte. Por
 * isso a conferência de transbordo existe.
 */
function html({ chapa, conteudo }) {
  const fundo = b64(join(RAIZ, "assets/pecas", chapa.formato, chapa.arquivo));
  const sg = b64(join(RAIZ, "assets/fontes/space-grotesk-700.woff2"));
  const i400 = b64(join(RAIZ, "assets/fontes/inter-400.woff2"));
  const i600 = b64(join(RAIZ, "assets/fontes/inter-600.woff2"));
  const cor = CORES[conteudo.destaque ?? "ambar"];
  const z = chapa.texto;
  // DUAS LARGURAS. A Biela não é um retângulo: em cima da cabeça dela sobra
  // quadro que o braço estendido come mais embaixo. O título PODE usar a faixa
  // larga de cima; a citação, o corpo e as opções descem ao lado dela e ficam
  // sempre na coluna estreita. O porquê completo está em lib/pecas/chapas.ts.
  //
  // O `largo` não é escolha de quem chama: é veredito da medição. Título que
  // não termina antes do corte desce com a largura de cima e encosta na Biela,
  // então nesse caso ele volta para a coluna estreita, onde pode descer à
  // vontade. Quem decide é o --medir, e grava em lib/pecas/cabem.ts.
  const estreito = z.x2 - z.x1;
  const larg = conteudo.largo ? chapa.titulo.x2 - z.x1 : estreito;
  const alt = z.y2 - z.y1;
  const grande = chapa.formato === "stories";

  // AS OPÇÕES SÓ SÃO DESENHADAS NO FEED.
  //
  // Nos stories elas viram a FIGURINHA DE QUIZ do Instagram, e é por isso que a
  // zona de texto do story tem só 520px de altura enquanto existe uma zona de
  // figurinha separada logo abaixo (y 850 a 1180, no LEIA-ME). Desenhar as
  // quatro opções ali dentro estoura a zona, e foi exatamente o que a
  // conferência de transbordo acusou na primeira tentativa.
  //
  // Elas não se perdem: saem no texto que acompanha a peça, para quem for
  // publicar digitar na figurinha.
  const opcoes = grande
    ? ""
    : (conteudo.opcoes ?? []).map((o) => `<li>${escapa(o)}</li>`).join("");

  return `<!doctype html><meta charset="utf-8"><style>
    @font-face { font-family: "SG"; src: url(data:font/woff2;base64,${sg}) format("woff2"); font-weight: 700; }
    @font-face { font-family: "IN"; src: url(data:font/woff2;base64,${i400}) format("woff2"); font-weight: 400; }
    @font-face { font-family: "IN"; src: url(data:font/woff2;base64,${i600}) format("woff2"); font-weight: 600; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: ${chapa.largura}px; height: ${chapa.altura}px; }
    body {
      background: url(data:image/png;base64,${fundo}) no-repeat center/cover;
      -webkit-font-smoothing: antialiased;
    }
    /* O RESPIRO DO TOPO não é capricho: a zona livre do LEIA-ME começa colada
       na régua da etiqueta, e o título encostava nela. A zona continua a mesma;
       o que muda é onde o texto começa DENTRO dela. */
    .zona {
      position: absolute; left: ${z.x1}px; top: ${z.y1}px;
      width: ${larg}px; height: ${alt}px; overflow: hidden;
      padding-top: ${grande ? 0 : RESPIRO_DO_FEED}px;
    }
    h1 {
      font-family: "SG", sans-serif; font-weight: 700; text-transform: uppercase;
      color: ${cor}; font-size: ${grande ? 84 : 62}px; line-height: 1.04;
      letter-spacing: -0.01em; text-wrap: balance;
    }
    /* A citação é a pergunta de quem escreveu, e vem ANTES do título: branco,
       caixa mista, com aspas. Só a pergunta da comunidade usa. */
    .citacao { font-family: "IN", sans-serif; font-weight: 400; color: ${CORES.giz};
        font-size: ${grande ? 44 : 34}px; line-height: 1.3; width: ${estreito}px;
        margin-bottom: ${grande ? 28 : 20}px; }
    p { font-family: "IN", sans-serif; font-weight: 400; color: ${CORES.giz};
        font-size: ${grande ? 46 : 34}px; line-height: 1.35; margin-top: ${grande ? 40 : 28}px;
        width: ${estreito}px; }
    ul { list-style: none; margin-top: ${grande ? 48 : 34}px; width: ${estreito}px; }
    li { font-family: "IN", sans-serif; font-weight: 400; color: ${CORES.giz};
         font-size: ${grande ? 44 : 32}px; line-height: 1.25;
         margin-bottom: ${grande ? 34 : 24}px; padding-left: ${grande ? 66 : 50}px; position: relative; }
    li::before {
      content: ""; position: absolute; left: 0; top: ${grande ? 6 : 4}px;
      width: ${grande ? 40 : 30}px; height: ${grande ? 40 : 30}px;
      border: ${grande ? 4 : 3}px solid ${CORES.giz}; border-radius: 50%;
    }
  </style>
  <div class="zona" id="zona">
    ${conteudo.citacao ? `<div class="citacao">“${escapa(conteudo.citacao)}</div>` : ""}
    <h1 id="titulo">${escapa(conteudo.titulo)}</h1>
    ${conteudo.corpo ? `<p>${escapa(conteudo.corpo)}</p>` : ""}
    ${opcoes ? `<ul>${opcoes}</ul>` : ""}
  </div>`;
}

const escapa = (s) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);

function valida(conteudo) {
  const erros = [];
  if (!NOME_DA_SECAO[conteudo.secao]) erros.push(`seção desconhecida: ${conteudo.secao}`);
  if (!conteudo.titulo) erros.push("peça sem título");
  const d = conteudo.destaque ?? "ambar";
  if (!CORES[d]) erros.push(`cor de destaque desconhecida: ${d}`);
  else if (!DESTAQUE_PERMITIDO[conteudo.secao]?.includes(d)) {
    erros.push(
      `destaque "${d}" não é permitido na seção ${conteudo.secao} (só ${DESTAQUE_PERMITIDO[conteudo.secao].join(", ")}). ` +
        "Ver a regra da régua coral no LEIA-ME."
    );
  }
  return erros;
}

async function gerar(conteudo, { tolerante = false, semArquivo = false } = {}) {
  const erros = valida(conteudo);
  if (erros.length) { console.error("Peça recusada:\n  " + erros.join("\n  ")); process.exit(1); }

  const { chromium } = await import("playwright");
  // Mesmo caminho que as suítes de navegador usam (scripts/navegador/base.mjs):
  // o Chromium muda de lugar por máquina, e o que o Playwright procura sozinho
  // nem sempre está instalado no ambiente remoto.
  const caminho = process.env.CHROMIUM ?? "/opt/pw-browsers/chromium";
  const nav = await chromium.launch(existsSync(caminho) ? { executablePath: caminho } : {});
  mkdirSync(saida, { recursive: true });
  const feitos = [];

  for (const formato of conteudo.formatos ?? ["feed"]) {
    const chapa = chapaDe(conteudo.secao, formato);
    const pg = await nav.newPage({ viewport: { width: chapa.largura, height: chapa.altura } });
    await pg.setContent(html({ chapa, conteudo }), { waitUntil: "load" });
    await pg.evaluate(() => document.fonts.ready);

    // TRANSBORDO: o texto não pode passar da zona livre. A regra do LEIA-ME é
    // encurtar o texto, então aqui a peça é RECUSADA em vez de sair cortada.
    const sobra = await pg.evaluate(() => {
      const z = document.getElementById("zona");
      const t = document.getElementById("titulo");
      return {
        altura: z.scrollHeight,
        cabe: z.clientHeight,
        largura: z.scrollWidth,
        cabeLargura: z.clientWidth,
        // Em coordenadas da própria chapa, porque a janela tem o tamanho dela.
        fimDoTitulo: Math.ceil(t.getBoundingClientRect().bottom),
      };
    });
    // TRANSBORDO NA LARGURA, e não só na altura. Palavra que não quebra e é mais
    // larga que a coluna sai CORTADA pelo `overflow: hidden`, e a peça parece
    // pronta: foi assim que saiu uma dica com "BALANCEAMENTC" no lugar de
    // "BALANCEAMENTO". Medir só a altura deixava isso passar.
    if (sobra.largura > sobra.cabeLargura) {
      const aviso =
        `alguma palavra é mais larga que a coluna: o texto pede ${sobra.largura}px e a coluna tem ${sobra.cabeLargura}px em ${formato}. ` +
        "Sai cortada, e a saída é outra palavra ou outra peça.";
      await pg.close();
      if (tolerante) { await nav.close(); return { transbordou: aviso }; }
      console.error(`Peça recusada: ${aviso}`);
      await nav.close();
      process.exit(1);
    }
    // O TÍTULO NÃO PODE PASSAR DO CORTE, quando está na faixa larga: ela acaba
    // onde a Biela começa. Na coluna estreita a regra não vale, porque essa
    // largura é livre até embaixo.
    if (conteudo.largo && sobra.fimDoTitulo > chapa.titulo.y2) {
      const aviso =
        `o título termina em y ${sobra.fimDoTitulo} e a faixa larga acaba em ${chapa.titulo.y2} em ${formato}. ` +
        "Dali para baixo a Biela ocupa: título mais curto é a saída.";
      await pg.close();
      if (tolerante) { await nav.close(); return { transbordou: aviso }; }
      console.error(`Peça recusada: ${aviso}`);
      await nav.close();
      process.exit(1);
    }
    if (sobra.altura > sobra.cabe) {
      const aviso =
        `o texto ocupa ${sobra.altura}px e a zona livre tem ${sobra.cabe}px em ${formato}. ` +
        "Encurtar o texto é a saída; diminuir a fonte é proibido pelo LEIA-ME.";
      await pg.close();
      if (tolerante) { await nav.close(); return { transbordou: aviso }; }
      console.error(`Peça recusada: ${aviso}`);
      await nav.close();
      process.exit(1);
    }

    if (semArquivo) { await pg.close(); continue; }
    const arquivo = join(saida, `${conteudo.secao}-${formato}.png`);
    await pg.screenshot({ path: arquivo });
    await pg.close();
    feitos.push(arquivo);
    console.log(`  ✓ ${formato}: ${arquivo}`);
  }
  await nav.close();
  return { feitos };
}

/**
 * Manda as peças para o Telegram, para o dono aprovar antes de qualquer
 * publicação. A publicação em si NUNCA é automática: a regra da casa é que
 * mensagem a cliente e publicação passam pelo dono.
 */
async function paraTelegram(arquivos, conteudo) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) {
    console.error("Faltam TELEGRAM_BOT_TOKEN e/ou TELEGRAM_CHAT_ID no .env.local.");
    process.exit(1);
  }
  const legenda =
    `*${NOME_DA_SECAO[conteudo.secao]}*\n\n${conteudo.titulo}` +
    (conteudo.corpo ? `\n\n${conteudo.corpo}` : "") +
    ((conteudo.opcoes ?? []).length ? `\n\n${conteudo.opcoes.map((o) => `• ${o}`).join("\n")}` : "") +
    "\n\nAprova?";

  const media = arquivos.map((a, i) => ({
    type: "photo",
    media: `attach://f${i}`,
    ...(i === 0 ? { caption: legenda, parse_mode: "Markdown" } : {}),
  }));

  const form = new FormData();
  form.append("chat_id", chat);
  form.append("media", JSON.stringify(media));
  arquivos.forEach((a, i) => form.append(`f${i}`, new Blob([readFileSync(a)]), `f${i}.png`));

  const r = await fetch(`https://api.telegram.org/bot${token}/sendMediaGroup`, { method: "POST", body: form });
  const js = await r.json();
  if (!js.ok) { console.error(`Telegram recusou: ${js.description}`); process.exit(1); }
  console.log("  ✓ enviado para o Telegram, esperando aprovação");
}

// ── O EXEMPLO DE REFERÊNCIA ────────────────────────────────────────────────
//
// É a peça que o dono desenhou à mão para dizer "é assim que tem que ficar".
// Fica no código porque é o alvo: qualquer mexida no desenho pode ser comparada
// com ela, e a conferência usa esta mesma peça para medir transbordo.
const EXEMPLO = {
  secao: "desafio",
  formatos: ["feed", "stories"],
  titulo: "A luz de injeção acendeu. O que pode ser?",
  opcoes: ["Tampa do tanque mal fechada", "Sensor de oxigênio", "Falha de combustão", "Todas as anteriores"],
  destaque: "ambar",
};

// MEDIR QUAIS CANDIDATOS CABEM, e gravar o veredito no repositório.
//
// POR QUE ISTO EXISTE (06/09/2026). Passaram a existir DOIS renderizadores: este
// aqui, em Chromium, para ver localmente, e o `next/og` da rota /api/pecas, que
// é o que o n8n chama porque Chromium não roda na Vercel. Na primeira chamada
// real a rota desenhou uma peça que este script tinha recusado, e o resultado
// foi título por cima das opções.
//
// Dois desenhistas com réguas diferentes é dívida. A saída é a medida ser UMA
// SÓ: aqui, que é onde existe um navegador de verdade, e o veredito vai para um
// arquivo versionado que os dois lados leem. A rota não mede nada; ela obedece.
//
// Rode de novo quando as chapas ou o banco do quiz mudarem.
if (args.includes("--medir")) {
  const { writeFileSync } = await import("node:fs");
  const destino = join(RAIZ, "lib/pecas/cabem.ts");
  // O OVO E A GALINHA: quem mede importa o conteudo.ts, e o conteudo.ts importa
  // justamente o arquivo que a medição vai escrever. Sem esta semente, apagar o
  // veredito impede de gerar o veredito. Aconteceu.
  if (!existsSync(destino)) writeFileSync(destino, "export const CABEM: Record<string, { fonte: string; largo: boolean }[]> = {};\n");
  const { candidatosDaSemana } = await import(join(RAIZ, "lib/pecas/conteudo.ts"));
  const cabem = {};
  for (const lista of candidatosDaSemana()) {
    for (const peca of lista) {
      for (const formato of ["feed", "stories"]) {
        const chave = `${peca.secao}:${formato}`;
        (cabem[chave] ??= []);
        // O LARGO PRIMEIRO, e o estreito como saída. Título na faixa larga é
        // o enquadramento dos exemplos do dono, e é o que faz manchete comprida
        // caber onde a coluna do braço não deixaria. Quando ele não termina
        // antes do corte, a peça não é descartada: ela é desenhada na coluna
        // estreita, que é livre até embaixo. Sem esta segunda tentativa o
        // desafio perdia 28 dos 45 candidatos que já tinha.
        const opts = { tolerante: true, semArquivo: true };
        const largo = await gerar({ ...peca, largo: true, formatos: [formato] }, opts);
        if (!largo.transbordou) { cabem[chave].push({ fonte: peca.fonte, largo: true }); continue; }
        const estreito = await gerar({ ...peca, largo: false, formatos: [formato] }, opts);
        if (!estreito.transbordou) cabem[chave].push({ fonte: peca.fonte, largo: false });
      }
    }
  }
  // GRAVADO COMO MÓDULO, e não como JSON, por um motivo bobo e caro: o Node
  // exige `with { type: "json" }` em import de JSON e o bundler do Next não
  // combina com isso. Como este arquivo é lido pelos dois lados, um .ts com
  // uma constante evita a briga inteira. Ele continua sendo GERADO: não se
  // edita à mão.
  const cabeçalho = [
    "// GERADO por `npm run pecas -- --medir`. Não editar à mão.",
    "//",
    "// Quem cabe em cada chapa, medido num Chromium de verdade. A rota",
    "// /api/pecas desenha sem navegador e não tem como medir, então ela obedece",
    "// a este arquivo. Rode o --medir de novo quando o banco do quiz mudar ou",
    "// quando as chapas forem trocadas; a `npm run conferir:pecas` cobra o",
    "// frescor.",
    "//",
    "// `largo` diz se o TÍTULO daquela peça coube na faixa larga do topo da",
    "// chapa. Quando é falso, ele desce na coluna estreita. Os dois",
    "// desenhistas leem daqui, para não medirem diferente.",
    "export const CABEM: Record<string, { fonte: string; largo: boolean }[]> = ",
  ].join("\n");
  writeFileSync(destino, `${cabeçalho}${JSON.stringify(cabem, null, 2)};\n`);
  for (const [k, v] of Object.entries(cabem)) console.log(`  ${k.padEnd(24)} ${String(v.length).padStart(2)} cabem  (${v.filter((p) => p.largo).length} com título largo)`);
  console.log(`\nVeredito gravado em ${destino}`);
  process.exit(0);
}

// AS QUATRO PEÇAS DA SEMANA, tiradas do que o app já tem escrito.
// A escolha do conteúdo mora em lib/pecas/conteudo.ts; aqui só se desenha.
if (args.includes("--semana")) {
  const { candidatosDaSemana } = await import(join(RAIZ, "lib/pecas/conteudo.ts"));
  const formatos = (opcao("formatos") ?? "feed,stories").split(",");
  const todos = [];
  const semSaida = [];
  for (const lista of candidatosDaSemana()) {
    // Anda pelos candidatos até achar um que CABE. Medir é desenhar, então a
    // tentativa que transborda simplesmente não vira arquivo.
    let escolhido = null;
    for (const peca of lista) {
      const r = await gerar({ ...peca, formatos }, { tolerante: true });
      if (r.transbordou) { console.log(`  · ${peca.fonte} não cabe (${r.transbordou.split(".")[0]})`); continue; }
      escolhido = { peca, feitos: r.feitos };
      break;
    }
    if (!escolhido) {
      // NÃO ABORTA A SEMANA INTEIRA por causa de uma seção. As outras três já
      // estão prontas e são publicáveis; parar aqui jogaria fora trabalho bom
      // por causa de uma chapa apertada. O que falta sai no resumo do fim.
      semSaida.push(NOME_DA_SECAO[lista[0].secao]);
      continue;
    }
    console.log(`${NOME_DA_SECAO[escolhido.peca.secao]}: ${escolhido.peca.fonte}`);
    todos.push(...escolhido.feitos);
  }
  if (args.includes("--telegram")) {
    console.error("O envio ao Telegram das quatro de uma vez ainda não existe: use --json por peça.");
    process.exit(1);
  }
  console.log(`\n${todos.length} peça(s) geradas em ${saida}`);
  if (semSaida.length) {
    console.warn(
      `\n⚠️  Sem peça esta semana: ${semSaida.join(", ")}.\n` +
        "   Nenhum texto do banco coube na zona livre dessa chapa. As saídas são\n" +
        "   escrever um texto curto para a seção ou esperar a v2 das chapas, que o\n" +
        "   LEIA-ME já anuncia com a Biela empurrada para a direita."
    );
    process.exitCode = 1;
  }
  process.exit(process.exitCode ?? 0);
}

const conteudo = args.includes("--exemplo")
  ? EXEMPLO
  : JSON.parse(readFileSync(opcao("json") ?? (() => { console.error("Passe --json peca.json ou --exemplo"); process.exit(1); })(), "utf8"));

console.log(`Gerando: ${NOME_DA_SECAO[conteudo.secao]}`);
const { feitos } = await gerar(conteudo);
if (args.includes("--telegram")) await paraTelegram(feitos, conteudo);
