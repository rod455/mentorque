// Coorte que ainda está enchendo não pode ser lida como resultado.
//
// POR QUE ISTO EXISTE (23/09/2026). O retrato mostra as quatro coortes mais
// recentes lado a lado, com a mesma cara, e as duas primeiras ainda estão
// ENCHENDO. A prova está no histórico do próprio retrato, no git: a coorte de
// 14/09 foi lida como 2 de 8 no dia 19, 2 de 11 no dia 20 e 3 de 16 no dia 21.
//
// Quem lê "0 de 15 ativaram" na semana corrente lê uma queda que ainda não
// aconteceu, e é esse número que chega ao relatório de segunda. As views
// ganharam colunas dizendo se a janela fechou (`semana_fechada`,
// `janela_fechada`, `d1_7_fechada`, `d8_30_fechada`).
//
// O QUE ELA CONFERE, e o limite é grande e declarado: ela lê os ARQUIVOS de
// `supabase/`, não o banco. Ela existe porque o arquivo ficar atrás do banco
// já custou caro aqui uma vez (o `check` de funil_eventos.sql estava três
// eventos atrás do aplicado, e rodar o arquivo teria matado a ativação em
// silêncio). Se alguém editar estas views e deixar as colunas de fora, rodar o
// arquivo apaga a proteção sem barulho, e é isso que ela pega.
//
// O que ela NÃO pega: o banco divergir do arquivo por alguém ter rodado SQL à
// mão. Para isso não há conferência de repositório possível; a régua é
// `pg_get_viewdef`, e ela mora numa sessão com banco.
//
// Rode com: npm run conferir:coorte
import { readFileSync } from "node:fs";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) {
    console.log(`✓ ${nome}`);
    return;
  }
  falhas++;
  console.error(`✗ ${nome}${detalhe ? `  ${detalhe}` : ""}`);
}

/** Comentário satisfaz busca, e aqui o cabeçalho cita os nomes das colunas. */
const semComentarios = (f: string) =>
  f.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*--.*$/gm, " ");

type Alvo = { arquivo: string; view: string; colunas: string[] };

const ALVOS: Alvo[] = [
  {
    arquivo: "supabase/vendas_e_ativacao.sql",
    view: "ativacao_coortes",
    colunas: ["semana_fechada", "janela_fechada"],
  },
  {
    arquivo: "supabase/uso_views.sql",
    view: "retencao_coortes",
    colunas: ["semana_fechada", "d1_7_fechada", "d8_30_fechada"],
  },
];

for (const alvo of ALVOS) {
  const fonte = semComentarios(readFileSync(alvo.arquivo, "utf8"));
  // Recorta só o corpo DESTA view: o arquivo tem mais de uma, e uma coluna
  // declarada na vizinha aprovaria a errada.
  const inicio = fonte.indexOf(`view public.${alvo.view}`);
  const corpo = inicio === -1 ? "" : fonte.slice(inicio, fonte.indexOf(";", inicio));

  conferir(`${alvo.view}: a view existe no arquivo`, inicio !== -1, alvo.arquivo);

  for (const coluna of alvo.colunas) {
    conferir(
      `${alvo.view}: declara ${coluna}`,
      new RegExp(`\\bas\\s+${coluna}\\b`).test(corpo),
      "sem ela, quem lê a coorte não sabe se pode concluir",
    );
  }

  // A JANELA FECHA PELO ÚLTIMO MEMBRO, NÃO PELO COMEÇO DA COORTE (06/10/2026).
  //
  // Achado do Diretor em 05/10: `coorte + 14` em DATA dizia "fechada" até 24
  // horas antes de a janela da última pessoa fechar, e o retrato das 6h
  // imprimiu 8 de 51 sem ressalva quando o número final era 9. A regra está em
  // DIRETRIZES; aqui ela vira texto cobrado: cada coluna de janela (não a de
  // semana) tem que vir de `max(c.cadastrado_em) + interval`, e nenhuma pode
  // voltar ao `+ 14` / `+ 37` em data.
  const deJanela = alvo.colunas.filter((c) => c !== "semana_fechada");
  for (const coluna of deJanela) {
    conferir(
      `${alvo.view}: ${coluna} fecha pelo último membro da coorte`,
      new RegExp(`max\\(c\\.cadastrado_em\\)\\s*\\+\\s*interval\\s*'\\d+ days'\\s*<=\\s*now\\(\\)\\s+as\\s+${coluna}\\b`).test(corpo),
      "coorte + N em data fecha ate 24 horas antes da janela da ultima pessoa, e o retrato publica numero parcial como final",
    );
  }
  conferir(
    `${alvo.view}: nenhuma janela volta a fechar por data da coorte`,
    !/::date\s*\+\s*(14|37)\)/.test(corpo),
    "o `+ 14` e o `+ 37` em data sao o defeito de 05/10",
  );
}

if (falhas) {
  console.error(`\nCoorte: ${falhas} conferência(s) reprovada(s).`);
  console.error("Coorte da semana corrente ainda enche: o denominador cresce até");
  console.error("a semana fechar e o numerador até a janela de cada pessoa fechar.");
  console.error("Sem a coluna, quem lê o número lê uma queda que não aconteceu.\n");
  process.exit(1);
}

console.log("\nCoorte: as views dizem quando a janela fechou.");
