// Toda função SECURITY DEFINER nomeia o `pg_temp`, e por último?
//
// POR QUE ISTO EXISTE (20/09/2026). A primeira rodada do agente de segurança
// achou duas funções `SECURITY DEFINER` que leem `auth.users` com
// `set search_path = public, auth`, sem `pg_temp` na lista.
//
// A pegadinha do Postgres: QUANDO `pg_temp` NÃO É NOMEADO, ELE É PESQUISADO
// PRIMEIRO. Numa função que roda com os privilégios do dono, isso é a porta
// clássica de sequestro de nome: alguém cria um objeto temporário com o nome
// de uma tabela usada lá dentro, chama a função, e ela lê o objeto dele.
//
// É irmã da pegadinha de 19/09, em que a defesa estava escrita no arquivo e
// era decorativa: o `revoke ... from anon` não fazia nada porque quem tinha a
// permissão era o papel `PUBLIC`. As duas ensinam a mesma coisa, que é por que
// esta conferência é de TEXTO e o agente confere no ESTADO do banco: são duas
// perguntas diferentes. Aqui: "o arquivo do repositório está certo?". Lá: "o
// banco está como o arquivo diz?". Nenhuma das duas substitui a outra, e foi
// justamente a distância entre elas que deixou a lista de e-mail exposta.
//
// Rode com: npm run conferir:banco
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const PASTA = "supabase";
let falhas = 0;

console.log("Banco: as funções que rodam como dono fecham a porta do pg_temp?");

const arquivos = readdirSync(join(RAIZ, PASTA)).filter((f) => f.endsWith(".sql"));
let definers = 0;

/**
 * Tira comentário de SQL antes de qualquer leitura.
 *
 * A primeira versão desta conferência não fazia isso e reprovou na estreia,
 * acusando `estado_da_base.sql`. O que ela tinha achado era um COMENTÁRIO
 * explicando que outra função virou SECURITY DEFINER, e logo abaixo uma VIEW
 * com `security_invoker = off`. Nenhum dos dois é uma função.
 *
 * (E a view está fora desta regra com razão: o corpo dela é resolvido na hora
 * em que ela é criada, então não há busca de nome depois para sequestrar.)
 */
function semComentarios(sql) {
  return sql.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/--.*$/gm, " ");
}

for (const arquivo of arquivos) {
  const fonte = semComentarios(readFileSync(join(RAIZ, PASTA, arquivo), "utf8"));
  // Cada bloco começa num `create ... function` e vai até o próximo.
  const blocos = fonte.split(/(?=create\s+(?:or\s+replace\s+)?function)/i);
  for (const bloco of blocos) {
    if (!/security\s+definer/i.test(bloco)) continue;
    definers++;
    const nome = (bloco.match(/function\s+([\w.]+)/i) ?? [, "?"])[1];
    // Só o que vem ANTES do corpo (`as $$`): dentro do corpo é consulta.
    const cabeca = bloco.split(/as\s+\$\$/i)[0];
    const caminho = (cabeca.match(/set\s+search_path\s*=\s*([^\n;]+)/i) ?? [, ""])[1].trim();

    if (!caminho) {
      falhas++;
      console.error(`FALHA  ${nome} (${arquivo}) é SECURITY DEFINER e não fixa search_path`);
      console.error("       sem lista fixa, quem chama escolhe onde os nomes são procurados");
      continue;
    }
    const partes = caminho.split(",").map((p) => p.trim().replace(/;$/, ""));
    if (!partes.includes("pg_temp")) {
      falhas++;
      console.error(`FALHA  ${nome} (${arquivo}) não nomeia pg_temp: search_path = ${caminho}`);
      console.error("       não nomeado, o pg_temp é pesquisado PRIMEIRO, e vira sequestro de nome");
      continue;
    }
    if (partes[partes.length - 1] !== "pg_temp") {
      falhas++;
      console.error(`FALHA  ${nome} (${arquivo}) põe pg_temp fora do fim: search_path = ${caminho}`);
      console.error("       nomear resolve metade; o lugar dele é o ÚLTIMO da ordem de busca");
    }
  }
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) de banco reprovaram.`);
  process.exit(1);
}
console.log(`Banco: ${definers} função(ões) SECURITY DEFINER, todas com pg_temp por último.`);
