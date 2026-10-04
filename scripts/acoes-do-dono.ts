// Há quantos dias cada ação do dono está parada.
//
// Lê docs/agentes/acoes-do-dono.md e ordena pela mais velha. Sem opinião, sem
// análise: a análise é do relatório semanal, e esta lista existe justamente
// porque uma coisa parada há quatro dias ainda não chegou a nenhuma cobrança
// semanal (ver o cabeçalho do próprio documento).
//
//   npm run acoes            imprime a lista
//   npm run conferir:acoes   confere só o formato, e reprova se ele mentir
//
// A conferência NÃO reprova por idade, de propósito. Bloquear o push de quem
// programa porque alguém não entrou num console de terceiro seria castigar a
// pessoa errada, e conferência que castiga errado é conferência que alguém
// desliga.
//
// AGRUPADA POR DESTINO DESDE 02/10/2026, e o motivo é uma conta. Naquele dia a
// lista tinha 13 itens e parecia 13 tarefas. Por painel, eram SEIS destinos, e
// CINCO dos treze estavam no mesmo console do Google Ads, o mais antigo há 29
// dias: uma sessão de vinte minutos fechava cinco. A fila não era grande, era
// mal apresentada, e a semana inteira de rodadas tinha travado nela.
//
// O destino é ETIQUETA na tabela, nunca palavra adivinhada no texto da ação,
// pelo mesmo motivo que as perguntas da Biela são etiquetadas na gravação:
// classificação por palavra apodrece quando o texto muda, e apodrece calada.
import { readFileSync } from "node:fs";

const CAMINHO = "docs/agentes/acoes-do-dono.md";
const texto = readFileSync(new URL(`../${CAMINHO}`, import.meta.url), "utf8");
const soConferir = process.argv.includes("--conferir");

type Acao = { desde: string; onde: string; dias: number; acao: string; porque: string; quem: string; prazo: string | null };

/** Os painéis onde o dono resolve. Fora desta lista, a conferência reprova. */
const DESTINOS = ["google-ads", "play-console", "app-store", "lojas", "meta", "n8n", "revenuecat", "stripe", "appsflyer", "vercel"] as const;

/** O nome de cada painel como ele aparece para quem vai abrir. */
const NOME_DO_DESTINO: Record<string, string> = {
  "google-ads": "Google Ads",
  "play-console": "Play Console",
  "app-store": "App Store Connect",
  lojas: "Avaliações das lojas",
  meta: "Painel da Meta",
  n8n: "n8n",
  revenuecat: "RevenueCat",
  stripe: "Stripe",
  appsflyer: "AppsFlyer",
  vercel: "Vercel",
};

/**
 * Passado disto, repetir a recomendação não é cobrança, é ruído.
 *
 * Três semanas é tempo de o mundo mudar embaixo do item: a etiqueta da busca
 * esperou oito dias e virou proposta condicionada porque a campanha parou
 * antes de alguém chegar nela. Então item velho volta com o custo de HOJE, ou
 * com a decisão de não fazer.
 */
const DIAS_PARA_REPRECIFICAR = 21;

/**
 * O prazo, quando a ação tem um.
 *
 * POR QUE (03/10/2026, no mesmo dia em que a lista virou sessão). Entrou um
 * item novo com 28 dias de prazo: resolver a verificação de pagamento no Play
 * Console, ou o perfil e os nove apps saem da loja em 31/10. Ordenado por
 * idade, ele aparece por último, atrás de uma negativa de Google Ads que espera
 * há 29 dias e custa uns R$ 65 por mês. **Idade não é urgência**: a lista media
 * quanto tempo uma coisa esperou, e não o que acontece se ela não for feita.
 *
 * Aqui a data é LIDA DO TEXTO, e isso contradiz a regra que o destino seguiu
 * dois parágrafos acima. A diferença é real: destino é classificação, que é
 * palpite e apodrece quando o texto muda; prazo é um dado literal num formato
 * fixo, e a conferência reprova quem escrever "PRAZO" sem uma data que o
 * calendário tenha. Um "PRAZO: fim do mês" não passa.
 */
const MOLDE_DO_PRAZO = /PRAZO (\d{4}-\d{2}-\d{2})/;

const hoje = new Date();
hoje.setUTCHours(0, 0, 0, 0);

const problemas: string[] = [];
const acoes: Acao[] = [];

// Só as linhas da tabela: começam com barra, têm cinco colunas, e a primeira
// precisa ser uma data. O cabeçalho e o separador caem fora por isso mesmo.
for (const linha of texto.split("\n")) {
  if (!linha.trim().startsWith("|")) continue;
  const col = linha.split("|").slice(1, -1).map((c) => c.trim());
  if (col.length !== 5) {
    if (col.length && /^\d{4}-\d{2}-\d{2}$/.test(col[0])) problemas.push(`linha com ${col.length} colunas em vez de 5: ${linha.trim().slice(0, 60)}`);
    continue;
  }
  const [desde, onde, acao, porque, quem] = col;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(desde)) {
    // Cabeçalho e separador caem fora, e SÓ eles. Uma linha de ação cuja data
    // virou texto ("ontem", "semana passada") era ignorada em silêncio: o item
    // saía da lista inteiro e o total continuava parecendo certo, porque 14 de
    // 15 não parece com nada. Sair da lista é pior que data errada.
    if (desde !== "Desde" && !/^-+$/.test(desde)) {
      problemas.push(`linha de ação sem data no lugar da data: "${desde.slice(0, 20)}" (${acao.slice(0, 40)})`);
    }
    continue;
  }
  if (!DESTINOS.includes(onde as (typeof DESTINOS)[number])) {
    // Destino inventado agrupa errado e ninguém percebe, porque o total
    // continua certo: some um item de uma sessão e aparece uma sessão de um.
    problemas.push(`destino "${onde}" fora da lista, na linha de ${desde}. Os válidos: ${DESTINOS.join(", ")}`);
  }

  const d = new Date(`${desde}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) {
    problemas.push(`data que não existe: ${desde}`);
    continue;
  }
  // E a data que EXISTE depois de o JavaScript consertar sozinho (02/10/2026).
  //
  // `new Date("2026-02-31T00:00:00Z")` não é inválida: vira 03/03/2026, calada.
  // Um 31/02 digitado na pressa passaria pela conferência e a idade sairia três
  // dias errada, que é exatamente o tipo de número que mente com cara de dado.
  // A volta ao texto é a única prova de que a data é a que está escrita.
  if (d.toISOString().slice(0, 10) !== desde) {
    problemas.push(`data que o calendário não tem: ${desde} (o JavaScript leu como ${d.toISOString().slice(0, 10)})`);
    continue;
  }
  const dias = Math.round((hoje.getTime() - d.getTime()) / 86400000);
  if (dias < 0) problemas.push(`data no futuro: ${desde} (${acao.slice(0, 40)})`);
  if (!acao) problemas.push(`ação sem texto na linha de ${desde}`);
  if (!quem) problemas.push(`falta quem levantou, na linha de ${desde}`);
  // O PRAZO, quando houver. Escrever a palavra sem a data reprova: "PRAZO: fim
  // do mês" não dá para contar, e prazo que não dá para contar não ordena nada.
  const prazo = acao.match(MOLDE_DO_PRAZO)?.[1] ?? null;
  if (/\bPRAZO\b/i.test(acao) && !prazo) {
    problemas.push(`a ação de ${desde} fala em PRAZO sem uma data no formato AAAA-MM-DD: ${acao.slice(0, 60)}`);
  }
  if (prazo) {
    const d2 = new Date(`${prazo}T00:00:00Z`);
    if (Number.isNaN(d2.getTime()) || d2.toISOString().slice(0, 10) !== prazo) {
      problemas.push(`prazo que o calendário não tem: ${prazo} (${acao.slice(0, 40)})`);
    }
  }

  acoes.push({ desde, onde, dias, acao, porque, quem, prazo });
}

if (soConferir) {
  console.log("Ações do dono: a lista de idade está com data que dá para acreditar?");
  if (!acoes.length) problemas.push(`${CAMINHO} não tem nenhuma linha de ação; se a lista zerou de verdade, tudo bem, mas quase sempre é a tabela que quebrou`);
  for (const p of problemas) console.error(`FALHA  ${p}`);
  if (problemas.length) {
    console.error(`\n${problemas.length} problema(s) na lista de ações. Uma lista de idade com data errada mente com cara de dado.`);
    process.exit(1);
  }
  const painéis = new Set(acoes.map((a) => a.onde)).size;
  console.log(
    `Ações do dono: ${acoes.length} na lista, em ${painéis} painel(is), todas com data que o calendário tem, nenhuma no futuro e nenhuma com destino inventado.`,
  );
  process.exit(0);
}

acoes.sort((a, b) => b.dias - a.dias);

if (!acoes.length) {
  console.log("Nada parado esperando o dono. Se isso te surpreendeu, confira a tabela em " + CAMINHO + ".");
  process.exit(0);
}

const idadeDe = (dias: number) => (dias === 0 ? "entrou hoje" : dias === 1 ? "1 dia" : `${dias} dias`);
/** "há 29 dias", mas "entrou hoje" sem o "há" na frente, que ficava torto. */
const esperaDe = (dias: number) => (dias === 0 ? "entrou hoje" : `há ${idadeDe(dias)}`);

// POR SESSÃO, e não por item. A ordem é a do item mais velho de cada painel:
// quem abre um console abre por causa do que está esperando mais tempo, e de
// graça fecha os vizinhos.
const porDestino = new Map<string, Acao[]>();
for (const a of acoes) porDestino.set(a.onde, [...(porDestino.get(a.onde) ?? []), a]);
const sessoes = [...porDestino.entries()].sort((x, y) => y[1][0]!.dias - x[1][0]!.dias);

// ── O QUE TEM PRAZO VEM PRIMEIRO, E NÃO O QUE ESPEROU MAIS ────────────────
//
// Idade mede quanto tempo uma coisa esperou. Prazo mede o que acontece se ela
// não for feita. São perguntas diferentes, e a segunda ganha: em 03/10 entrou
// um item que, se vencer, tira os nove apps da Play, e por idade ele apareceria
// por último, atrás de uma lista de negativas que custa uns R$ 65 por mês.
const comPrazo = acoes
  .filter((a) => a.prazo)
  .map((a) => ({ ...a, faltam: Math.round((new Date(`${a.prazo}T00:00:00Z`).getTime() - hoje.getTime()) / 86400000) }))
  .sort((x, y) => x.faltam - y.faltam);
if (comPrazo.length) {
  console.log(`\nCOM PRAZO (${comPrazo.length}), e prazo não espera idade:\n`);
  for (const a of comPrazo) {
    const quanto = a.faltam < 0 ? `VENCEU HÁ ${-a.faltam} DIA(S)` : a.faltam === 0 ? "VENCE HOJE" : `faltam ${a.faltam} dia(s)`;
    console.log(`  ${quanto}  (${NOME_DO_DESTINO[a.onde] ?? a.onde})  ${a.acao.slice(0, 110)}`);
    console.log(`      ${a.porque.slice(0, 200)}\n`);
  }
}

console.log(`\nPARADO ESPERANDO O DONO: ${acoes.length} item(ns) em ${sessoes.length} painel(is).\n`);
console.log(`Por painel, do mais atrasado para o mais novo. Abrir UM fecha todos os dele:\n`);
for (const [onde, lista] of sessoes) {
  const nome = NOME_DO_DESTINO[onde] ?? onde;
  const quantos = lista.length === 1 ? "1 item" : `${lista.length} itens`;
  console.log(`  ${nome}  (${quantos}, o mais antigo ${esperaDe(lista[0]!.dias)})`);
  for (const a of lista) {
    console.log(`     ${idadeDe(a.dias).padStart(11)}  ${a.acao}`);
    console.log(`                  ${a.porque}`);
    console.log(`                  desde ${a.desde}, levantada por ${a.quem}`);
  }
  console.log("");
}

// O BLOCO QUE EXISTE PARA O AGENTE, não para o dono: passados 21 dias, a
// rodada que levantou o item não repete a recomendação, traz o custo de hoje
// ou a decisão de não fazer.
const velhos = acoes.filter((a) => a.dias > DIAS_PARA_REPRECIFICAR);
if (velhos.length) {
  console.log(`PRECISA DE PREÇO NOVO (parado há mais de ${DIAS_PARA_REPRECIFICAR} dias): ${velhos.length}.`);
  console.log(`Quem levantou não repete a recomendação na próxima rodada: ou traz o custo acumulado de hoje, ou propõe fechar o item.\n`);
  for (const a of velhos) console.log(`  ${idadeDe(a.dias).padStart(11)}  ${a.acao.slice(0, 90)}  (${a.quem})`);
  console.log("");
}

const maior = sessoes.reduce((m, s) => (s[1].length > m[1].length ? s : m), sessoes[0]!);
if (maior[1].length > 1) {
  console.log(`A sessão mais barata é ${NOME_DO_DESTINO[maior[0]] ?? maior[0]}: ${maior[1].length} itens de uma vez, o mais antigo ${esperaDe(maior[1][0]!.dias)}.`);
}
const velha = acoes[0]!;
if (velha.dias >= 3) {
  console.log(`A mais velha de todas está parada há ${velha.dias} dias. Quando isso custa dinheiro por dia, o custo já passou de "lembrete".`);
}
