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
const { CHAPAS, CORES, DESTAQUE_PERMITIDO, NOME_DA_SECAO, chapaDe } = await import(
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
  const larg = z.x2 - z.x1;
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
      padding-top: ${grande ? 0 : 48}px;
    }
    h1 {
      font-family: "SG", sans-serif; font-weight: 700; text-transform: uppercase;
      color: ${cor}; font-size: ${grande ? 84 : 62}px; line-height: 1.04;
      letter-spacing: -0.01em; text-wrap: balance;
    }
    p { font-family: "IN", sans-serif; font-weight: 400; color: ${CORES.giz};
        font-size: ${grande ? 46 : 34}px; line-height: 1.35; margin-top: ${grande ? 40 : 28}px; }
    ul { list-style: none; margin-top: ${grande ? 48 : 34}px; }
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
    <h1>${escapa(conteudo.titulo)}</h1>
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

async function gerar(conteudo) {
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
      return { altura: z.scrollHeight, cabe: z.clientHeight };
    });
    if (sobra.altura > sobra.cabe) {
      console.error(
        `Peça recusada em ${formato}: o texto ocupa ${sobra.altura}px e a zona livre tem ${sobra.cabe}px.\n` +
          "  Encurte o texto. Diminuir a fonte é proibido pelo LEIA-ME."
      );
      await nav.close();
      process.exit(1);
    }

    const arquivo = join(saida, `${conteudo.secao}-${formato}.png`);
    await pg.screenshot({ path: arquivo });
    await pg.close();
    feitos.push(arquivo);
    console.log(`  ✓ ${formato}: ${arquivo}`);
  }
  await nav.close();
  return feitos;
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

const conteudo = args.includes("--exemplo")
  ? EXEMPLO
  : JSON.parse(readFileSync(opcao("json") ?? (() => { console.error("Passe --json peca.json ou --exemplo"); process.exit(1); })(), "utf8"));

console.log(`Gerando: ${NOME_DA_SECAO[conteudo.secao]}`);
const feitos = await gerar(conteudo);
if (args.includes("--telegram")) await paraTelegram(feitos, conteudo);
