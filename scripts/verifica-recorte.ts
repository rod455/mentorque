// A conta do recorte de foto faz o que o WhatsApp faz?
//
// As quatro regras de lib/app/recorte.ts, exercitadas DE VERDADE, com números.
// Recorte errado não aparece em conferência de texto: ele aparece como foto com
// borda preta, ou com a cabeça da pessoa fora do círculo, e só quem olha a
// foto pronta percebe. Aqui a foto pronta é um retângulo com quatro números, e
// dá para olhar para eles.
//
// Rode com: npm run conferir:recorte
import {
  ZOOM_MAXIMO,
  escalaDeCobertura,
  limitaDeslocamento,
  precisaDeAjuste,
  retanguloDoRecorte,
  zoomDaPinca,
} from "../lib/app/recorte.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}
const perto = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) <= tol;

console.log("Recorte: a moldura nunca fica com borda vazia, e o que sai é o que estava dentro dela?");

const MOLDURA = { largura: 300, altura: 300 };
const PAISAGEM = { largura: 1200, altura: 900 }; // 4:3, como sai do celular deitado
const RETRATO = { largura: 900, altura: 1600 }; // 9:16, como sai do celular em pé

// ── 1. cobertura: a foto sempre cobre a moldura inteira ────────────────────
{
  const e = escalaDeCobertura(PAISAGEM, MOLDURA);
  conferir("paisagem em moldura quadrada: a escala é a que encosta na ALTURA", perto(e, 300 / 900), `escala ${e}`);
  conferir("e na largura sobra foto", PAISAGEM.largura * e >= MOLDURA.largura);

  const r = escalaDeCobertura(RETRATO, MOLDURA);
  conferir("retrato em moldura quadrada: a escala é a que encosta na LARGURA", perto(r, 300 / 900), `escala ${r}`);
  conferir("e na altura sobra foto", RETRATO.altura * r >= MOLDURA.altura);

  const pequena = escalaDeCobertura({ largura: 100, altura: 100 }, MOLDURA);
  conferir("foto menor que a moldura é ESTICADA até cobrir, nunca fica com borda", perto(pequena, 3));
}

// ── 2. o arrasto para na borda ─────────────────────────────────────────────
{
  // Paisagem 4:3 na moldura quadrada com zoom 1: desenhada com 400x300. Sobra
  // 100 na largura (50 para cada lado) e nada na altura.
  const a = limitaDeslocamento(PAISAGEM, MOLDURA, { zoom: 1, dx: 999, dy: 999 });
  conferir("arrastar demais para a direita para em +50", perto(a.dx, 50), `dx ${a.dx}`);
  conferir("no eixo em que a foto encosta na moldura, não há para onde arrastar", perto(a.dy, 0), `dy ${a.dy}`);
  const b = limitaDeslocamento(PAISAGEM, MOLDURA, { zoom: 1, dx: -999, dy: -999 });
  conferir("arrastar demais para a esquerda para em -50", perto(b.dx, -50), `dx ${b.dx}`);

  // Com zoom 2 a foto vira 800x600: sobra 250 e 150 para cada lado.
  const z = limitaDeslocamento(PAISAGEM, MOLDURA, { zoom: 2, dx: 999, dy: -999 });
  conferir("com zoom, a sobra cresce e o arrasto ganha espaço", perto(z.dx, 250) && perto(z.dy, -150), `dx ${z.dx} dy ${z.dy}`);

  const dentro = limitaDeslocamento(PAISAGEM, MOLDURA, { zoom: 1, dx: 20, dy: 0 });
  conferir("um arrasto que cabe fica como está", perto(dentro.dx, 20));

  conferir("zoom abaixo de 1 volta para 1", limitaDeslocamento(PAISAGEM, MOLDURA, { zoom: 0.3, dx: 0, dy: 0 }).zoom === 1);
  conferir("zoom acima do teto para no teto", limitaDeslocamento(PAISAGEM, MOLDURA, { zoom: 99, dx: 0, dy: 0 }).zoom === ZOOM_MAXIMO);
  const lixo = limitaDeslocamento(PAISAGEM, MOLDURA, { zoom: NaN, dx: NaN, dy: Infinity });
  conferir("número inválido não derruba a conta", lixo.zoom === 1 && lixo.dx === 0 && lixo.dy === 0);
}

// ── 3. o que sai é exatamente o que estava dentro da moldura ───────────────
{
  // Centro: a paisagem 1200x900 mostra os 900x900 do meio, começando em x=150.
  const centro = retanguloDoRecorte(PAISAGEM, MOLDURA, { zoom: 1, dx: 0, dy: 0 });
  conferir("centrada, sai o quadrado do meio", centro.x === 150 && centro.y === 0 && centro.largura === 900 && centro.altura === 900, JSON.stringify(centro));

  // Foto arrastada TODA para a direita (+50): a moldura mostra a ponta ESQUERDA.
  const esquerda = retanguloDoRecorte(PAISAGEM, MOLDURA, { zoom: 1, dx: 50, dy: 0 });
  conferir("arrastada para a direita, sai a ponta esquerda", esquerda.x === 0 && esquerda.largura === 900, JSON.stringify(esquerda));

  // E para a esquerda (-50): a ponta DIREITA, que termina exatamente no fim.
  const direita = retanguloDoRecorte(PAISAGEM, MOLDURA, { zoom: 1, dx: -50, dy: 0 });
  conferir("arrastada para a esquerda, sai a ponta direita, até o fim e não além",
    direita.x === 300 && direita.x + direita.largura === PAISAGEM.largura, JSON.stringify(direita));

  // Zoom 2 centrado: a moldura vale 450x450 da imagem, no meio.
  const zoom = retanguloDoRecorte(PAISAGEM, MOLDURA, { zoom: 2, dx: 0, dy: 0 });
  conferir("com zoom 2 sai um pedaço com metade do lado, centrado",
    zoom.largura === 450 && zoom.altura === 450 && zoom.x === 375 && zoom.y === 225, JSON.stringify(zoom));

  // A REGRA QUE VALE PARA QUALQUER GESTO: o retângulo nunca sai da imagem. É
  // isto que garante "sem borda preta" para todo arrasto e todo zoom, e por
  // isso roda em muitos pontos, não em três.
  let fora = 0;
  let quadradoErrado = 0;
  for (const imagem of [PAISAGEM, RETRATO, { largura: 4000, altura: 3000 }, { largura: 120, altura: 80 }]) {
    for (let zoom = 1; zoom <= ZOOM_MAXIMO; zoom += 0.5) {
      for (const dx of [-5000, -37, 0, 41, 5000]) {
        for (const dy of [-5000, -13, 0, 29, 5000]) {
          const r = retanguloDoRecorte(imagem, MOLDURA, { zoom, dx, dy });
          if (r.x < 0 || r.y < 0 || r.x + r.largura > imagem.largura || r.y + r.altura > imagem.altura) fora++;
          // Moldura quadrada tem de sair quadrada (tolerância de 1px do arredondamento).
          if (Math.abs(r.largura - r.altura) > 1) quadradoErrado++;
        }
      }
    }
  }
  conferir("em nenhum gesto o recorte sai da imagem (é isto que evita borda preta)", fora === 0, `${fora} casos fora`);
  conferir("moldura quadrada produz recorte quadrado", quadradoErrado === 0, `${quadradoErrado} casos`);
}

// ── 4. quando pedir o ajuste ───────────────────────────────────────────────
{
  const ALVO = { largura: 400, altura: 400 };
  conferir("foto quadrada e pequena entra direto, sem tela a mais", !precisaDeAjuste({ largura: 300, altura: 300 }, ALVO));
  conferir("foto do tamanho exato do alvo entra direto", !precisaDeAjuste({ largura: 400, altura: 400 }, ALVO));
  conferir("foto 4:3 pede ajuste: alguém tem de escolher o que fica de fora", precisaDeAjuste(PAISAGEM, ALVO));
  // PEQUENA e 4:3: é o caso que só a proporção pega. A primeira versão desta
  // conferência só tinha a paisagem grande, e aí uma regra que ignorasse a
  // proporção passava, porque o tamanho sozinho já dizia sim. Plantado o
  // defeito, a conferência aprovou; este caso é o conserto dela.
  conferir("foto 4:3 mesmo PEQUENA pede ajuste: a proporção decide sozinha", precisaDeAjuste({ largura: 320, altura: 240 }, ALVO));
  conferir("foto quadrada mas GRANDE pede ajuste: dá para escolher um pedaço", precisaDeAjuste({ largura: 3000, altura: 3000 }, ALVO));
  conferir("tamanho inválido não pede ajuste nem quebra", !precisaDeAjuste({ largura: 0, altura: 0 }, ALVO));
}

// ── 5. a pinça ─────────────────────────────────────────────────────────────
{
  conferir("dedos que se afastam ao dobro dobram o zoom", perto(zoomDaPinca(1, 100, 200), 2));
  conferir("dedos que se aproximam reduzem o zoom", perto(zoomDaPinca(2, 200, 100), 1));
  conferir("a pinça não passa do teto", zoomDaPinca(3, 100, 900) === ZOOM_MAXIMO);
  conferir("a pinça não desce de 1", zoomDaPinca(1, 200, 10) === 1);
  conferir("distância zero (dedos no mesmo ponto) não divide por zero", zoomDaPinca(2, 0, 100) === 2);
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) de recorte reprovaram.`);
  process.exit(1);
}
console.log("Recorte: a foto cobre a moldura sempre, o arrasto para na borda, e sai o que estava dentro.");
