// O ajuste de foto do carro, de ponta a ponta: escolhe o arquivo, ajusta, usa.
//
// O que a conferência de lógica (conferir:recorte) NÃO prova é a LIGAÇÃO: o
// arquivo escolhido chega na tela de ajuste, o botão de usar recorta de
// verdade, o resultado vai para o carro e sobrevive. E prova também o
// contrário, que é a foto pequena e quadrada entrar direto sem a tela a mais.
//
// A foto de teste é gerada aqui, em PNG cru, porque precisa ser de um tamanho
// escolhido: 800x600 para forçar o ajuste (proporção 4:3), 200x200 para
// dispensá-lo. Um arquivo fixo no repositório serviria só um dos dois casos.
import { deflateSync } from "node:zlib";
import { garagem, abrirApp } from "./base.mjs";

export const nome = "foto";
export const sobre = "a foto do carro passa pelo ajuste quando precisa, e só quando precisa";

// ── um PNG mínimo, RGB 8 bits, sem entrelaçamento ──────────────────────────
const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return (buf) => {
    let c = 0xffffffff;
    for (const b of buf) c = t[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
})();
function pedaco(tipo, dados) {
  const tam = Buffer.alloc(4);
  tam.writeUInt32BE(dados.length);
  const corpo = Buffer.concat([Buffer.from(tipo, "ascii"), dados]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(CRC(corpo));
  return Buffer.concat([tam, corpo, crc]);
}
/** Um PNG com um degradê, para ser uma imagem de verdade e não um bloco liso. */
export function pngDeTeste(largura, altura) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(largura, 0);
  ihdr.writeUInt32BE(altura, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const linhas = Buffer.alloc((1 + largura * 3) * altura);
  for (let y = 0; y < altura; y++) {
    const base = y * (1 + largura * 3);
    linhas[base] = 0;
    for (let x = 0; x < largura; x++) {
      const i = base + 1 + x * 3;
      linhas[i] = Math.round((255 * x) / largura);
      linhas[i + 1] = Math.round((255 * y) / altura);
      linhas[i + 2] = 120;
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pedaco("IHDR", ihdr),
    pedaco("IDAT", deflateSync(linhas)),
    pedaco("IEND", Buffer.alloc(0)),
  ]);
}

/** Tamanho real de uma imagem gravada como data URL, lido de dentro da página. */
async function tamanhoDaFoto(pg, dataUrl) {
  return pg.evaluate(
    (src) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ largura: img.naturalWidth, altura: img.naturalHeight });
        img.onerror = () => resolve(null);
        img.src = src;
      }),
    dataUrl
  );
}

export async function rodar({ nav, ok }) {
  const app = await abrirApp(nav, { sessao: garagem({ startedAt: "2026-08-23" }), chaves: { "mq-primeiro-quiz-nao": "1" } });
  const { pg } = app;

  // Até a tela do carro pelo cartão SEU CARRO da home, que leva ao hub do
  // carro ativo. (A lista da aba Carros usa <div role="button">, e um seletor
  // por tag `button` não a encontra; foi assim que a primeira versão desta
  // suíte quebrou antes de chegar na foto.)
  await pg.locator("main button").filter({ hasText: /Golfinho/i }).first().click();
  await pg.waitForTimeout(1200);
  ok("a tela do carro abriu", (await pg.getByRole("button", { name: /Escolher avatar ou foto/i }).count()) > 0, (await app.tela()).slice(0, 120).replace(/\n/g, " | "));

  const abrirEscolha = async () => {
    await pg.getByRole("button", { name: /Escolher avatar ou foto/i }).first().click();
    await pg.waitForTimeout(600);
  };
  const escolherArquivo = async (largura, altura) => {
    await pg.locator('input[type="file"]').last().setInputFiles({
      name: `foto-${largura}x${altura}.png`,
      mimeType: "image/png",
      buffer: pngDeTeste(largura, altura),
    });
    await pg.waitForTimeout(1200);
  };
  const ajuste = () => pg.getByRole("dialog", { name: /Ajuste a foto/i });
  const fotoDoCarro = async () => (await app.sessaoGravada()).vehicles?.[0]?.photo ?? null;

  // ---- foto grande e 4:3: a tela de ajuste aparece e recorta ---------------
  await abrirEscolha();
  await escolherArquivo(800, 600);
  ok("foto 4:3 abre a tela de ajuste", (await ajuste().count()) > 0, (await app.corpo()).slice(0, 120).replace(/\n/g, " | "));

  const barra = ajuste().getByRole("slider");
  ok("há uma barra de zoom para quem não faz pinça", (await barra.count()) > 0);
  if (await barra.count()) {
    await barra.fill("2");
    await pg.waitForTimeout(300);
  }

  // Arrasta a moldura com o mouse: o gesto de um dedo.
  const moldura = ajuste().locator("[data-moldura]");
  const caixa = await moldura.boundingBox();
  if (caixa) {
    await pg.mouse.move(caixa.x + caixa.width / 2, caixa.y + caixa.height / 2);
    await pg.mouse.down();
    await pg.mouse.move(caixa.x + caixa.width / 2 - 60, caixa.y + caixa.height / 2 + 10, { steps: 6 });
    await pg.mouse.up();
    await pg.waitForTimeout(300);
  }
  const posicaoDaFoto = await moldura.locator("img").evaluate((el) => ({ left: el.style.left, width: el.style.width }));
  ok("o arrasto e o zoom mexeram na foto de verdade", posicaoDaFoto.width !== "" && posicaoDaFoto.left !== "", JSON.stringify(posicaoDaFoto));

  await ajuste().getByRole("button", { name: /Usar esta foto/i }).click();
  await pg.waitForTimeout(1500);
  ok("usar a foto fecha o ajuste", (await ajuste().count()) === 0);

  const gravada = await fotoDoCarro();
  ok("a foto recortada foi para o carro", typeof gravada === "string" && gravada.startsWith("data:image/jpeg"), String(gravada).slice(0, 40));
  const tamanho = gravada ? await tamanhoDaFoto(pg, gravada) : null;
  ok("e saiu QUADRADA, que é a moldura, e não 4:3, que era a foto",
    !!tamanho && tamanho.largura === tamanho.altura && tamanho.largura === 800, JSON.stringify(tamanho));
  ok("a tela do carro mostra a foto", (await pg.locator('main img[src^="data:image/jpeg"]').count()) > 0);

  // ---- cancelar não mexe na foto que já estava --------------------------------
  await abrirEscolha();
  await escolherArquivo(1000, 700);
  ok("outra foto grande abre o ajuste de novo", (await ajuste().count()) > 0);
  await ajuste().getByRole("button", { name: /Cancelar/i }).click();
  await pg.waitForTimeout(600);
  ok("cancelar fecha o ajuste", (await ajuste().count()) === 0);
  ok("e a foto do carro continua a de antes", (await fotoDoCarro()) === gravada);

  // ---- foto pequena e quadrada: entra direto, sem tela a mais -----------------
  // Cancelar devolve a pessoa à folha de escolha, que continua aberta: escolher
  // outra foto dali é exatamente o caminho de quem se arrependeu. (E é por isso
  // que não há "fechar" aqui: a folha tem dois botões `close`, o fundo e o X,
  // e o fundo fica coberto pelo painel; foi nele que a primeira versão desta
  // suíte travou.)
  ok("cancelar devolve à folha de escolha", (await pg.locator('input[type="file"]').count()) > 0);
  await escolherArquivo(200, 200);
  ok("foto pequena e quadrada NÃO abre o ajuste", (await ajuste().count()) === 0);
  const direta = await fotoDoCarro();
  ok("e vira a foto do carro mesmo assim", typeof direta === "string" && direta.startsWith("data:image/jpeg") && direta !== gravada);

  // ---- sobrevive à recarga ------------------------------------------------------
  await app.recarregar();
  ok("a foto sobrevive à recarga", (await fotoDoCarro()) === direta);

  ok("nenhum erro de página", app.erros.length === 0, app.erros[0] ?? "");
  await app.fechar();
}
