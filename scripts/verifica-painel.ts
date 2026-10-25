// O painel abre sem a chave ficar no endereço (25/10/2026).
//
// POR QUE. A rodada 6 da Segurança achou a `DADOS_CHAVE` viajando em
// `/painel?chave=...`, e essa chave abre 12 rotas, cinco delas mandam e-mail
// para a base. O conserto (lib/painelCookie.ts) só vale se TRÊS coisas forem
// verdade juntas, e esta conferência cobra cada uma:
//   1. a chave certa vira redirecionamento para o endereço LIMPO, com selo;
//      a chave errada também sai do endereço, e sem selo;
//   2. o selo não é a chave, depende dela, e não abre as rotas da operação
//      (o `chaveDadosOk` não lê cookie);
//   3. o middleware pega o `/painel`, o cookie é `httpOnly`, `secure`,
//      `sameSite=strict` e preso ao `/painel`, e a página aceita o selo.
//
// Rode com: npm run conferir:painel
import { readFileSync } from "node:fs";
import { destinoDoPainel, iguais, seloDoPainel } from "../lib/painelCookie.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}
const semComentarios = (f: string) => f.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
const leia = (caminho: string) => semComentarios(readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8"));

console.log("Painel: a chave entra uma vez, vira selo em cookie, e o endereço fica limpo.");

const CHAVE = "chave-de-teste-0123456789abcdef";
const base = "https://www.mentorque.com.br";

// ── 1. o destino ────────────────────────────────────────────────────────────
{
  const certo = await destinoDoPainel(new URL(`${base}/painel?chave=${CHAVE}`), CHAVE);
  conferir("chave certa redireciona para o endereço limpo", certo.redirecionar === "/painel", String(certo.redirecionar));
  conferir("e grava o selo", certo.selo === (await seloDoPainel(CHAVE)));

  const outros = await destinoDoPainel(new URL(`${base}/painel?x=1&chave=${CHAVE}`), CHAVE);
  conferir("os outros parâmetros ficam, só a chave sai", outros.redirecionar === "/painel?x=1", String(outros.redirecionar));

  const errada = await destinoDoPainel(new URL(`${base}/painel?chave=errada`), CHAVE);
  conferir("chave errada também sai do endereço", errada.redirecionar === "/painel");
  conferir("e não ganha selo", errada.selo === null);

  const semEnv = await destinoDoPainel(new URL(`${base}/painel?chave=${CHAVE}`), undefined);
  conferir("sem DADOS_CHAVE no servidor, ninguém ganha selo", semEnv.selo === null);

  const nada = await destinoDoPainel(new URL(`${base}/painel`), CHAVE);
  conferir("sem chave no endereço, segue para a página decidir pelo cookie", nada.redirecionar === null && nada.selo === null);
}

// ── 2. o selo não é a chave ─────────────────────────────────────────────────
{
  const selo = await seloDoPainel(CHAVE);
  conferir("o selo não contém a chave", !selo.includes(CHAVE) && selo !== CHAVE);
  conferir("o selo é estável para a mesma chave", selo === (await seloDoPainel(CHAVE)));
  conferir("e muda quando a chave gira", selo !== (await seloDoPainel(CHAVE + "x")));
  conferir("a comparação recusa tamanhos diferentes e aceita iguais", !iguais(selo, selo.slice(1)) && iguais(selo, String(selo)));
  const chaveDados = leia("lib/chaveDados.ts");
  conferir(
    "as rotas da operação não aceitam o cookie do painel (só cabeçalho ou query com a chave)",
    !/cookie/i.test(chaveDados) && /req\.headers\.get\("x-mq-chave"\)/.test(chaveDados),
    "se o chaveDadosOk passar a ler cookie, roubar o cookie do painel volta a mandar e-mail para a base",
  );
}

// ── 3. quem usa ─────────────────────────────────────────────────────────────
{
  const mw = leia("middleware.ts");
  conferir("o middleware pega o /painel", /matcher: \[[^\]]*"\/painel"/.test(mw) && /pathname === "\/painel"\) return painel\(request\)/.test(mw));
  conferir(
    "o cookie é httpOnly, secure, sameSite strict e preso ao /painel",
    /httpOnly: true/.test(mw) && /secure: true/.test(mw) && /sameSite: "strict"/.test(mw) && /path: "\/painel"/.test(mw),
  );
  conferir("o cookie guarda o selo, não a chave", /cookies\.set\(COOKIE_DO_PAINEL, selo,/.test(mw));
  const pagina = leia("app/painel/page.tsx");
  conferir("a página aceita o selo do cookie", /iguais\(selo, await seloDoPainel\(esperada\)\)/.test(pagina));
  conferir("e só abre com uma das duas provas", /if \(!pelaChave && !peloSelo\)/.test(pagina));
}

if (falhas) {
  console.error(`\nPainel: ${falhas} conferência(s) reprovada(s).`);
  process.exit(1);
}
console.log("Painel: chave certa vira selo e endereço limpo; o selo não abre as rotas.");
