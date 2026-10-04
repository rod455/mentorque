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
 * (A view está fora DESTA regra com razão: o corpo dela é resolvido na hora em
 * que ela é criada, então não há busca de nome depois para sequestrar. Mas ela
 * tem a regra DELA, no segundo bloco lá embaixo, por outro motivo: o
 * `security_invoker`. Em 27/09 esta ressalva foi lida como "view não é assunto
 * daqui", e o pedido do agente de segurança ficou sete dias sem dono por causa
 * disso.)
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

// ---------------------------------------------------------------------------
// SEGUNDA ASSERÇÃO: toda view declara `security_invoker` de forma EXPLÍCITA.
//
// POR QUE ISTO EXISTE (04/10/2026). O agente de segurança pediu isto em 27/09 e
// pediu para OUTRO papel, e sete dias depois continuava do mesmo jeito. O dono
// devolveu a regra: recomendação que cabe na própria alçada é trabalho, não
// recomendação. Então está aqui, escrita por quem achou.
//
// O QUE A OMISSÃO FAZ. Sem cláusula, a view herda `security_invoker = off` e
// roda com os privilégios do DONO dela, passando por cima do RLS das tabelas de
// origem. Foi o caso da `assinaturas_conferencia`, que carrega `user_id`,
// `status`, `plan` e `current_period_end`, trinta linhas abaixo de um comentário
// que promete o contrário sobre a view vizinha.
//
// Hoje não era buraco: nenhuma view é legível por `anon` nem por
// `authenticated`. O risco é o dia em que alguém liberar uma delas para um
// painel, e aí a cláusula ausente decide se todo mundo logado lê a linha de
// todo mundo.
//
// POR QUE A REGRA É "EXPLÍCITO" E NÃO "SEMPRE ON". O `estado_da_base` é `off` de
// propósito, com o motivo escrito desde 14/09. Exigir `on` apagaria uma decisão
// boa; exigir EXPLÍCITO só proíbe o silêncio, que é o que engana quem lê.
//
// E O QUE ESTA CONFERÊNCIA NÃO ALCANÇA, porque é de texto. Ela só vê as views
// que têm `create` em `supabase/*.sql`. A `contas_criadas` existia no banco sem
// arquivo nenhum no repositório até 04/10, e por isso era invisível aqui: só a
// leitura do ESTADO (`reloptions` no `pg_class`) acha esse caso. As duas
// perguntas são diferentes, como no bloco de cima: aqui, "o arquivo está
// certo?"; na rodada do agente, "o banco está como o arquivo diz?".
const VALORES = ["on", "off"];
let views = 0;

for (const arquivo of arquivos) {
  const fonte = semComentarios(readFileSync(join(RAIZ, PASTA, arquivo), "utf8"));
  const blocos = fonte.split(/(?=create\s+(?:or\s+replace\s+)?(?:materialized\s+)?view)/i);
  for (const bloco of blocos) {
    if (!/^create\s+(?:or\s+replace\s+)?(?:materialized\s+)?view/i.test(bloco.trim())) continue;
    views++;
    const nome = (bloco.match(/view\s+([\w.]+)/i) ?? [, "?"])[1];
    // Só a CABEÇA do comando: depois do `as` começa a consulta, e lá dentro
    // pode haver qualquer palavra. `with (...)` fica sempre antes do `as`.
    const cabeca = bloco.split(/\bas\b/i)[0];
    const opcao = cabeca.match(/security_invoker\s*=\s*(\w+)/i);

    if (!opcao) {
      falhas++;
      console.error(`FALHA  a view ${nome} (${arquivo}) não declara security_invoker`);
      console.error("       sem cláusula ela herda `off` e roda como o dono, furando o RLS");
      console.error("       escreva `with (security_invoker = on)`, ou `off` com o motivo do lado");
      continue;
    }
    if (!VALORES.includes(opcao[1].toLowerCase())) {
      falhas++;
      console.error(`FALHA  a view ${nome} (${arquivo}) tem security_invoker = ${opcao[1]}`);
      console.error("       o Postgres aceita só `on` ou `off`; qualquer outra coisa é erro de digitação");
    }
  }
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) de banco reprovaram.`);
  process.exit(1);
}
console.log(`Banco: ${definers} função(ões) SECURITY DEFINER, todas com pg_temp por último.`);
console.log(`Banco: ${views} view(s) no repositório, todas declarando security_invoker.`);
