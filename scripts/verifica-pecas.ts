// As medidas das peças batem com o que veio junto com as chapas?
//
// POR QUE ISTO EXISTE (06/09/2026). As zonas livres não são estética: fora
// delas o texto some. No story, o topo e o rodapé ficam debaixo da interface do
// Instagram; nas duas larguras, a Biela ocupa parte da chapa. Um número errado
// aqui produz peça que parece certa no computador e chega cortada no celular.
//
// E as chapas vão ser trocadas. O próprio LEIA-ME já avisa que existe uma v2
// pedida, com a Biela empurrada para a direita, "mantendo os mesmos nomes de
// arquivo". Quando ela chegar, as larguras de coluna do feed mudam. Se alguém
// trocar os PNGs e esquecer o `chapas.ts`, nada quebra: sai peça com texto em
// cima da Biela, e só se descobre olhando.
//
// Por isso a fonte da verdade é o `assets/pecas/LEIA-ME.txt`, que vem com as
// chapas, e esta conferência compara o registro com ele.
//
// O que ela cobra:
//   1. todo arquivo de chapa declarado existe mesmo, e no tamanho declarado
//   2. as zonas do registro são as mesmas do LEIA-ME
//   3. a regra da régua coral continua de pé (desafio só aceita âmbar)
//
// Rode com: npm run conferir:pecas
import { readFileSync, existsSync } from "node:fs";
import { CHAPAS, DESTAQUE_PERMITIDO, ESCALAS_DO_CORPO, NOME_DA_SECAO, RESPIRO_DO_FEED } from "../lib/pecas/chapas.ts";
import { bordaLivre, perfilDaChapa } from "../lib/pecas/silhueta.ts";
import { perguntasDoQuiz } from "../lib/app/quiz/perguntas.ts";
import { CABEM } from "../lib/pecas/cabem.ts";
import { escolhePeca } from "../lib/pecas/conteudo.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

const leiame = readFileSync(new URL("../assets/pecas/LEIA-ME.txt", import.meta.url), "utf8");

console.log("Peças: as medidas batem com o que veio junto com as chapas?");

// ── 1. os arquivos existem, e no tamanho que o registro declara ────────────
//
// O tamanho sai do cabeçalho do PNG, sem biblioteca: largura e altura são dois
// inteiros de 32 bits logo depois da assinatura, sempre nas mesmas posições.
{
  for (const c of CHAPAS) {
    const caminho = new URL(`../assets/pecas/${c.formato}/${c.arquivo}`, import.meta.url);
    if (!existsSync(caminho)) {
      conferir(`a chapa de ${c.secao} em ${c.formato} existe`, false, c.arquivo);
      continue;
    }
    const b = readFileSync(caminho);
    const larg = b.readUInt32BE(16);
    const alt = b.readUInt32BE(20);
    conferir(
      `${c.secao}/${c.formato}: o PNG tem o tamanho declarado`,
      larg === c.largura && alt === c.altura,
      `arquivo ${larg}x${alt}, registro ${c.largura}x${c.altura}`
    );
    conferir(
      `${c.secao}/${c.formato}: a zona de texto cabe na chapa`,
      c.texto.x2 <= larg && c.texto.y2 <= alt && c.texto.x1 >= 0 && c.texto.y1 >= 0,
      JSON.stringify(c.texto)
    );
  }
  if (!falhas) console.log(`  ✓ ${CHAPAS.length} chapas, todas no tamanho declarado`);
}

// ── 2. o registro é o mesmo LEIA-ME ────────────────────────────────────────
//
// Lido do arquivo e não repetido à mão: repetir seria criar uma terceira cópia
// do número, e a próxima divergência ficaria entre as duas cópias nossas.
{
  const numero = (re: RegExp, onde: string) => {
    const m = leiame.match(re);
    conferir(`o LEIA-ME ainda declara ${onde}`, !!m, "o formato do arquivo mudou; releia antes de confiar nesta conferência");
    return m ? Number(m[1]) : NaN;
  };

  // Stories: "Texto:      x 70 a 1010   ·   y 300 a 820"
  const sx1 = numero(/Texto:\s+x\s+(\d+)\s+a\s+\d+/, "a coluna de texto do story");
  const sx2 = numero(/Texto:\s+x\s+\d+\s+a\s+(\d+)/, "o fim da coluna do story");
  const sy1 = numero(/Texto:[^\n]*y\s+(\d+)\s+a\s+\d+/, "o topo do texto do story");
  const sy2 = numero(/Texto:[^\n]*y\s+\d+\s+a\s+(\d+)/, "o fim do texto do story");

  for (const c of CHAPAS.filter((x) => x.formato === "stories")) {
    conferir(
      `story de ${c.secao}: a zona de texto é a do LEIA-ME`,
      c.texto.x1 === sx1 && c.texto.x2 === sx2 && c.texto.y1 === sy1 && c.texto.y2 === sy2,
      `registro ${JSON.stringify(c.texto)}, LEIA-ME x ${sx1} a ${sx2}, y ${sy1} a ${sy2}`
    );
  }

  // Feed: a largura MUDA por chapa, e é o erro mais fácil de cometer. Cada
  // linha do LEIA-ME é "01_desafio-da-semana ... x 60 a 520".
  const porArquivo: Record<string, number> = {};
  for (const m of leiame.matchAll(/^\s*(\d{2})_[a-z-]+\s*\.+\s*x\s+\d+\s+a\s+(\d+)/gm)) {
    porArquivo[m[1]] = Number(m[2]);
  }
  conferir("o LEIA-ME lista as larguras do feed por chapa", Object.keys(porArquivo).length === 4, JSON.stringify(porArquivo));

  for (const c of CHAPAS.filter((x) => x.formato === "feed")) {
    const n = c.arquivo.match(/FUNDO_FEED_(\d{2})_/)?.[1] ?? "";
    conferir(
      `feed de ${c.secao}: a coluna termina onde o LEIA-ME manda`,
      porArquivo[n] === c.texto.x2,
      `registro x2 ${c.texto.x2}, LEIA-ME ${porArquivo[n]}. A Biela não está na mesma altura nas quatro chapas: usar a largura da chapa errada encosta o texto nela.`
    );
  }
}

// ── 2b. as faixas declaradas são livres NA CHAPA DE VERDADE ────────────────
//
// POR QUE (06/09/2026). O bloco 2 confere o registro contra o LEIA-ME, que é
// texto escrito por gente. Ele pega cópia divergente, mas não pega número
// errado nos dois lugares, e não tem como pegar chapa nova com a Biela em
// outro lugar: o LEIA-ME já avisa que a v2 vem "mantendo os mesmos nomes de
// arquivo", ou seja, trocando o desenho por baixo sem trocar nada aqui.
//
// Este bloco abre o PNG e mede. É o único que continua valendo depois da
// troca. Ele também é o que sustenta a FAIXA LARGA do título: ela não sai do
// LEIA-ME, sai da medição, e sem medir seria chute.
{
  const FOLGA = 20;
  for (const c of CHAPAS) {
    const caminho = new URL(`../assets/pecas/${c.formato}/${c.arquivo}`, import.meta.url);
    if (!existsSync(caminho)) continue;
    const perfil = perfilDaChapa(caminho.pathname);
    const topo = c.texto.y1 + (c.formato === "feed" ? RESPIRO_DO_FEED : 0);

    const livreEmCima = bordaLivre(perfil, topo, c.titulo.y2);
    conferir(
      `${c.secao}/${c.formato}: a faixa larga do título está livre na chapa`,
      c.titulo.x2 + FOLGA <= livreEmCima,
      `título declarado até x ${c.titulo.x2}, mas entre y ${topo} e ${c.titulo.y2} a chapa já tem desenho a partir de x ${livreEmCima}`
    );

    const livreEmbaixo = bordaLivre(perfil, topo, c.texto.y2);
    conferir(
      `${c.secao}/${c.formato}: a coluna estreita está livre na chapa`,
      c.texto.x2 + FOLGA <= livreEmbaixo,
      `coluna declarada até x ${c.texto.x2}, mas entre y ${topo} e ${c.texto.y2} a chapa já tem desenho a partir de x ${livreEmbaixo}`
    );

    // A faixa larga só tem razão de existir se for mais larga. Se alguém
    // igualar as duas, o título volta a ser espremido sem ninguém perceber.
    conferir(
      `${c.secao}/${c.formato}: a faixa do título não é mais estreita que a coluna`,
      c.titulo.x2 >= c.texto.x2,
      `título ${c.titulo.x2}, coluna ${c.texto.x2}`
    );
  }
}

// ── 3. a régua coral ───────────────────────────────────────────────────────
//
// A chapa do desafio já tem régua coral desenhada, e coral significa alerta no
// nosso sistema. Destaque coral por cima dela vira aviso de perigo inteiro. É
// regra do LEIA-ME e some fácil numa refatoração de cores.
{
  conferir(
    "o desafio só aceita âmbar como destaque",
    DESTAQUE_PERMITIDO.desafio.length === 1 && DESTAQUE_PERMITIDO.desafio[0] === "ambar",
    JSON.stringify(DESTAQUE_PERMITIDO.desafio)
  );
  conferir("nenhuma seção libera coral como destaque", !Object.values(DESTAQUE_PERMITIDO).some((l) => l.includes("coral")));
  conferir("toda seção do registro tem nome humano", CHAPAS.every((c) => !!NOME_DA_SECAO[c.secao]));
  conferir("cada seção tem as duas larguras", CHAPAS.length === Object.keys(NOME_DA_SECAO).length * 2, `${CHAPAS.length} chapas`);
}

// -- 4. O VEREDITO DE QUEM CABE ESTA FRESCO -------------------------------
//
// POR QUE (06/09/2026). Existem dois desenhistas: o script local, em Chromium,
// e o `next/og` da rota /api/pecas, que e o que o n8n chama porque Chromium nao
// roda na Vercel. Satori nao e navegador, entao os dois medem diferente, e na
// primeira chamada real a rota desenhou uma peca que o script tinha recusado:
// saiu titulo por cima das opcoes.
//
// A regua passou a ser UMA SO. Quem mede e o script, com navegador de verdade,
// e o veredito vai para lib/pecas/cabem.ts, versionado. A rota obedece.
//
// O risco que sobra e o arquivo envelhecer: alguem acrescenta pergunta no banco
// do quiz, ou trocam as chapas pela v2, e o veredito continua falando do mundo
// antigo. Sem esta conferencia isso nao quebra nada: a peca nova simplesmente
// nunca e escolhida, ou pior, uma que nao cabe mais continua sendo.
{
  const banco = perguntasDoQuiz("pt");
  const ids = new Set(banco.map((q) => `quiz:${q.id}`));
  const tabela = CABEM;
  const fontesDe = (chave: string) => (tabela[chave] ?? []).map((v) => v.fonte);

  conferir(
    "o veredito cobre as quatro secoes nas duas larguras",
    Object.keys(tabela).length === 8,
    `${Object.keys(tabela).length} chaves: ${Object.keys(tabela).join(", ")}`
  );

  const orfaos = Object.values(tabela).flat().map((v) => v.fonte).filter((f) => !ids.has(f));
  conferir(
    "nenhum candidato aprovado saiu do banco do quiz",
    orfaos.length === 0,
    `${orfaos.length} sobrando: ${[...new Set(orfaos)].slice(0, 4).join(", ")}. Rode: npm run pecas -- --medir`
  );

  // Toda pergunta do banco precisa ter sido MEDIDA, mesmo que o veredito seja
  // "nao cabe". Pergunta nova que ninguem mediu nunca vai virar peca, e isso
  // acontece em silencio.
  const medidos = new Set(Object.values(tabela).flat().map((v) => v.fonte));
  const naoMedidos = [...ids].filter((id) => !medidos.has(id));
  conferir(
    "existe candidato aprovado para o desafio e para a pergunta",
    fontesDe("desafio:feed").length > 0 && fontesDe("pergunta:feed").length > 0,
    "sem candidato aprovado a rota devolve 409 e o agente nao tem o que mandar"
  );
  // O PISO DA FONTE. O dono abriu a exceção de encolher o corpo, com limite, e
  // limite sem conferência é intenção. Escala fora da lista, ou abaixo do piso,
  // significa peça ilegível no celular ou desenho que os dois renderizadores
  // não sabem reproduzir igual.
  const piso = ESCALAS_DO_CORPO[ESCALAS_DO_CORPO.length - 1];
  const apertadas = Object.values(tabela).flat().filter((v) => v.escala < piso || !ESCALAS_DO_CORPO.includes(v.escala as never));
  conferir(
    "nenhuma peça foi medida com a fonte abaixo do piso",
    apertadas.length === 0,
    `${apertadas.length} fora da régua: ${apertadas.slice(0, 3).map((v) => `${v.fonte}=${v.escala}`).join(", ")}. O piso é ${piso}.`
  );
  const cheias = Object.values(tabela).flat().filter((v) => v.escala === 1).length;
  const total = Object.values(tabela).flat().length;
  console.log(`  · ${cheias} de ${total} peças cabem com a fonte cheia (informativo)`);

  if (naoMedidos.length) {
    console.log(`  · ${naoMedidos.length} pergunta(s) do banco nao cabem em nenhuma chapa (informativo)`);
  }
}

// -- 5. O "ME MANDA OUTRA" ANDA MESMO ------------------------------------
//
// POR QUE (07/09/2026). O fluxo do Telegram tem um botao "Outra", e ele so
// funciona porque a rota aceita `salto`. Se andar por indice devolvesse a mesma
// peca, o dono clicaria e nada mudaria: falha muda, sem erro nenhum na tela.
//
// Andar por INDICE e nao pela lista de recusadas nao foi preguica: o callback
// de um botao do Telegram tem 64 bytes NO TOTAL, e uma lista de fontes estoura
// isso na terceira ou quarta recusa. O preco e que a lista precisa estar
// estavel durante a conversa, e ela esta: o veredito e versionado.
{
  const quando = new Date();
  for (const secao of ["desafio", "dica"] as const) {
    const zero = escolhePeca(secao, "feed", { quando });
    const um = escolhePeca(secao, "feed", { salto: 1, quando });
    conferir(`${secao}: pedir outra devolve outra peca`, !!zero && !!um && zero.fonte !== um.fonte, `salto 0 ${zero?.fonte}, salto 1 ${um?.fonte}`);

    // Andar ate o fim tem que acabar em nada, e nao repetir para sempre: e o
    // 409 que faz o n8n avisar o dono em vez de mandar peca repetida.
    const total = (CABEM[`${secao}:feed`] ?? []).length;
    conferir(`${secao}: passar do ultimo candidato acaba em nada`, escolhePeca(secao, "feed", { salto: total, quando }) === null, `${total} candidatos`);

    // E o `pular`, que e o caminho preciso, precisa concordar com o indice.
    const pulandoOZero = escolhePeca(secao, "feed", { pular: [zero!.fonte], quando });
    conferir(`${secao}: pular a primeira da na mesma que saltar uma`, pulandoOZero?.fonte === um?.fonte, `pulando ${pulandoOZero?.fonte}, saltando ${um?.fonte}`);
  }
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) das peças reprovaram.`);
  process.exit(1);
}
console.log("Peças: chapas, zonas livres e regra da régua coral conferem com o LEIA-ME.");
