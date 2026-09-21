// Travessão em texto que o usuário lê.
//
// POR QUE ISTO EXISTE (01/09/2026): "sem travessão" é regra do dono desde o
// começo, está no CLAUDE.md, e mesmo assim o título da home foi para o ar como
// "Mentorque — aprenda mecânica...". Esse título é o que aparece no resultado
// do Google, na aba do navegador e no card de link compartilhado. Ninguém
// tinha percebido porque regra sem conferência é torcida, não regra.
//
// O QUE ELA PEGA, e por que a mira é estreita de propósito. A primeira versão
// desta conferência acusou 81 lugares e quase todos eram comentário de código
// ou o traço usado como "campo vazio" (`?? "—"`), que é uso tipográfico e não
// é frase. Conferência que reprova por causa de comentário é conferência que
// todo mundo passa a ignorar, e aí ela não serve para nada. Então:
//
//   PEGA   → travessão dentro de uma frase (texto com letras dos dois lados,
//            ou letra de um lado e fim da frase do outro)
//   IGNORA → comentário de linha e de bloco, inclusive {/* comentário JSX */}
//   IGNORA → o traço sozinho como campo vazio: "—", " — " entre variáveis
//   IGNORA → app/api/**, que é prompt de modelo, log e e-mail de operação
//
// Se um dia o traço como separador entre dois VALORES também for proibido, o
// lugar de mudar é a função `ehFrase` aqui embaixo, e o custo é conhecido:
// volta a acusar as telas que usam "{carro} — {n} serviços".
//
// Rode com: npm run conferir:travessao
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const TRAVESSAO = "—";

/** Pastas varridas por inteiro: tudo ali é texto que a pessoa lê. */
//
// `lib/email` entrou em 03/09/2026, e a falta dela era um buraco na regra e não
// um esquecimento pequeno: o CLAUDE.md diz "vale para app, LP, e-mails e docs",
// e a conferência cobria tudo menos e-mail. Dois travessões estavam no
// e-mail de boas-vindas da lista de espera desde sempre, no texto que chega na
// caixa de entrada de quem se cadastra. E-mail é o pior lugar para descobrir
// isso depois: não dá para corrigir o que já foi enviado.
//
// `lib/i18n` entrou no mesmo dia, pelo mesmo motivo e com o mesmo espanto: são
// os textos da LANDING, a página que o CLAUDE.md cita por extenso na regra, e
// eram 37 linhas com travessão entre os dois idiomas. A conferência cobria as
// telas do app e não cobria a página que recebe o anúncio pago.
//
// `docs` entrou em 21/09/2026, e a falta era do mesmo tamanho das anteriores.
// O CLAUDE.md diz, desde sempre, "vale para app, LP, e-mails E DOCS", e a
// conferência cobria tudo menos docs. Eram 68 linhas com travessão em 12
// arquivos, entre eles os manuais que os agentes leem antes de cada rodada.
//
// Quem achou foi o agente de segurança, fora do escopo dele, e provou plantando
// o defeito. Ficou na lista sem dono até o dono mandar executar.
//
// Por que docs importa, se não é tela: é o texto que ensina a escrever o resto.
// Manual com travessão é manual que produz travessão, e a regra existe para o
// que sai daqui, não para o que fica.
const TELAS = ["components", "lib/app/conteudo", "lib/email", "lib/i18n", "emails", "docs"];
/** Arquivos avulsos de texto de tela. */
const AVULSOS = ["lib/app/content.ts"];
/** Em app/, só os campos que viram título e descrição de página. */
const METADADOS = /^\s*(title|description|siteName|alt):\s*["'`]/;

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
    // O `.html` entrou em 20/09/2026, e faltava por um motivo que não é
    // desculpa: os modelos de e-mail de autenticação (emails/supabase/) são
    // HTML colado à mão no painel do Supabase, e por não serem TypeScript
    // ficavam fora de toda conferência desta casa. Um deles carregava um
    // travessão na linha que a pessoa lê, desde 06/09, e a conferência passava
    // verde porque nem abria o arquivo.
    else if (/\.(ts|tsx|html|md)$/.test(item)) saida.push(caminho);
  }
  return saida;
}

/**
 * Tira os comentários do arquivo, preservando as linhas (para o número bater).
 * Cobre `//`, `/* *\/` e a forma JSX `{/* *\/}`, que é a mais comum aqui.
 */
function semComentarios(texto) {
  const linhas = texto.split("\n");
  let dentroDeBloco = false;
  return linhas.map((linha) => {
    let saida = "";
    let i = 0;
    while (i < linha.length) {
      if (dentroDeBloco) {
        const fim = linha.indexOf("*/", i);
        if (fim === -1) return saida;
        dentroDeBloco = false;
        i = fim + 2;
        continue;
      }
      if (linha.startsWith("//", i)) return saida;
      if (linha.startsWith("/*", i)) {
        dentroDeBloco = true;
        i += 2;
        continue;
      }
      saida += linha[i];
      i++;
    }
    return saida;
  });
}

/** Os pedaços de texto literal de uma linha de código. */
function literais(linha) {
  const achados = [];
  const re = /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|`([^`\\]*(?:\\.[^`\\]*)*)`/g;
  let m;
  while ((m = re.exec(linha)) !== null) achados.push(m[1] ?? m[2] ?? m[3] ?? "");
  return achados;
}

/**
 * O travessão está dentro de uma FRASE, e não sendo usado como campo vazio ou
 * separador entre duas variáveis? Frase = tem letra colada nele de algum lado,
 * ignorando um espaço.
 */
function ehFrase(literal) {
  const i = literal.indexOf(TRAVESSAO);
  if (i === -1) return false;
  const antes = literal.slice(0, i).replace(/\s+$/, "");
  const depois = literal.slice(i + 1).replace(/^\s+/, "");
  const temLetra = (s) => /\p{L}{2}/u.test(s);

  // Frase inteira dentro de um literal só.
  if (temLetra(antes) && temLetra(depois)) return true;

  // FRASE PARTIDA EM DOIS LITERAIS VIZINHOS (19/09/2026). O travessão fica
  // PENDURADO na ponta, com texto de um lado e nada do outro, e a mira antiga
  // exigia letra dos dois lados DO MESMO literal. A manchete da home estava
  // assim desde sempre, com a conferência verde:
  //
  //   { a: "Saiba o que o carro tem antes da oficina — ", b: "e nunca mais..." }
  //
  // Na tela os dois campos são renderizados colados, então a pessoa lê o
  // travessão no meio da frase. Foi a manchete que gira na primeira dobra,
  // ou seja, o texto mais visto do site inteiro.
  //
  // O traço sozinho como campo vazio (`?? "—"`) e o separador entre duas
  // variáveis (`" — "`) continuam de fora: nos dois casos não há letra de lado
  // nenhum. O preço desta linha é um falso positivo possível, um literal que
  // seja prefixo de valor ("Mentorque — " antes de uma variável). Medido em
  // 19/09/2026 nas quatro pastas varridas: zero casos assim.
  if (temLetra(antes) && depois === "") return true;
  if (antes === "" && temLetra(depois)) return true;

  return false;
}

const achados = [];

/**
 * HTML não é código, e tratar como código não funciona (20/09/2026).
 *
 * A primeira versão desta extensão só acrescentou `.html` à lista de
 * extensões, e a conferência passou VERDE sobre um travessão que estava lá.
 * Duas razões, e as duas ensinam:
 *
 *   1. em TypeScript a frase mora entre ASPAS, e é isso que `literais()`
 *      procura. Em HTML a frase mora ENTRE TAGS, e não tem aspas nenhuma;
 *   2. o `semComentarios` corta a linha no `//`, e todo endereço de imagem do
 *      e-mail tem `https://`. Metade de cada linha desaparecia antes de
 *      qualquer leitura.
 *
 * Então HTML entra por outro caminho: tira comentário `<!-- -->`, tira as
 * tags, e o que sobra é a frase que a pessoa lê na caixa de entrada.
 */
function textoDeHtml(fonte) {
  return fonte
    .replace(/<!--[\s\S]*?-->/g, " ")
    .split("\n")
    .map((linha) => linha.replace(/<[^>]*>/g, " "));
}

/**
 * Markdown entra por um terceiro caminho, e pelos mesmos motivos do HTML.
 *
 * Em TypeScript a frase mora entre aspas; em HTML, entre tags; em markdown ela
 * é a linha inteira. O que precisa sair antes de ler:
 *
 *   - BLOCO DE CÓDIGO (```). É onde moram os exemplos de código dos manuais, e
 *     código citado não é frase que alguém lê. Foi assim que a mira ficou
 *     estreita nas outras pastas, e aqui o risco é maior: os manuais dos
 *     agentes são metade prosa e metade exemplo;
 *   - CÓDIGO NA LINHA (`assim`), pelo mesmo motivo, em escala menor;
 *   - LINHA DE SEPARAÇÃO DE TABELA (|---|---|), que é desenho e não texto.
 *
 * O traço sozinho de célula vazia numa tabela continua passando, porque o
 * `ehFrase` já exige letra de algum lado e ali não há.
 */
function textoDeMarkdown(fonte) {
  let dentroDeBloco = false;
  return fonte.split("\n").map((linha) => {
    if (/^\s*```/.test(linha)) {
      dentroDeBloco = !dentroDeBloco;
      return "";
    }
    if (dentroDeBloco) return "";
    if (/^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(linha)) return "";

    // A LINHA ESTÁ CITANDO O CARACTERE, não usando ele.
    //
    // Sem isto a conferência proibiria escrever a própria regra: o CLAUDE.md,
    // o DIRETRIZES.md e o manual do Diretor todos dizem "sem travessão (—)", e
    // essa frase precisa mostrar qual caractere é. A forma `(—)` é curta,
    // inconfundível e não serve para escrever frase nenhuma.
    if (linha.includes("(" + TRAVESSAO + ")")) return "";

    // A SAÍDA DE EMERGÊNCIA, e ela é estreita de propósito.
    //
    // Existe uma coisa que o conserto não pode tocar: NOME DE FORA. O diário
    // registra um fluxo do n8n chamado "TEMP — Página QR Evolution", e trocar
    // aquele travessão por dois pontos falsifica um registro para agradar uma
    // regra de estilo nossa. O nome é o que é.
    //
    // Então a exceção tem que ser escrita, na própria linha, com o motivo:
    //   ... "TEMP — Página QR" ... <!-- travessao-ok: nome de fluxo no n8n -->
    //
    // É comentário de markdown, então não aparece para ninguém que lê o
    // documento, e aparece inteiro para quem lê o arquivo. Quem usar isso para
    // escapar de prosa comum está mentindo por escrito, e fica registrado.
    if (/<!--\s*travessao-ok\b/.test(linha)) return "";

    return linha.replace(/`[^`]*`/g, " ");
  });
}

function olhar(alvo, sóMetadados) {
  if (alvo.endsWith(".md")) {
    textoDeMarkdown(readFileSync(join(RAIZ, alvo), "utf8")).forEach((linha, i) => {
      if (!linha.includes(TRAVESSAO)) return;
      if (ehFrase(linha)) achados.push({ arquivo: alvo, linha: i + 1, trecho: linha.trim().slice(0, 95) });
    });
    return;
  }
  if (alvo.endsWith(".html")) {
    textoDeHtml(readFileSync(join(RAIZ, alvo), "utf8")).forEach((linha, i) => {
      if (!linha.includes(TRAVESSAO)) return;
      if (ehFrase(linha)) achados.push({ arquivo: alvo, linha: i + 1, trecho: linha.trim().slice(0, 95) });
    });
    return;
  }
  const linhas = semComentarios(readFileSync(join(RAIZ, alvo), "utf8"));
  linhas.forEach((linha, i) => {
    if (!linha.includes(TRAVESSAO)) return;
    if (sóMetadados && !METADADOS.test(linha)) return;
    for (const lit of literais(linha)) {
      if (ehFrase(lit)) {
        achados.push({ arquivo: alvo, linha: i + 1, trecho: lit.trim().slice(0, 95) });
        break;
      }
    }
  });
}

for (const alvo of [...TELAS.flatMap(arquivos), ...AVULSOS]) olhar(alvo, false);
for (const alvo of arquivos("app")) {
  if (alvo.startsWith(join("app", "api"))) continue;
  olhar(alvo, true);
}

if (achados.length) {
  console.error(`\nTravessão em frase que o usuário lê (${achados.length} ocorrência(s)).`);
  console.error("A regra está no CLAUDE.md: português natural, sem travessão.");
  console.error("Troque por dois pontos, vírgula, ponto, ou barra vertical no título.\n");
  for (const a of achados) {
    console.error(`  ${a.arquivo}:${a.linha}`);
    console.error(`    ${a.trecho}`);
  }
  process.exit(1);
}

console.log("Travessão: nenhum nas frases das telas, do conteúdo e dos títulos das páginas.");
