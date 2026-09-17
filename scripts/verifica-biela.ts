// A Biela no gratuito: quem conta, quem paga e o que a tela acredita.
//
// POR QUE (15/09/2026). O dono abriu a Biela para quem não assina, com cinco
// perguntas por mês. Trocar o zero por cinco na tela seria o conserto errado,
// porque os dois lados que seguravam o limite eram de mentira:
//
//   - o contador do gratuito vivia num `useState(0)`, que zera a cada abertura
//     do app, então o teto seria por abertura e não por mês;
//   - a rota `/api/biela` não conferia nada: sem sessão, sem Premium, sem
//     contagem. O único freio era o zero da tela.
//
// Cada pergunta é uma chamada paga. Um defeito em qualquer regra daqui não
// aparece como tela quebrada: aparece como fatura, no fim do mês, ou como
// gente trancada fora de um recurso que deveria estar aberto.
//
// Rode com: npm run conferir:biela
import { readFileSync } from "node:fs";
import { LIMITE_GRATIS_POR_MES, mesDe, podePerguntar, restantes } from "../lib/biela/limite.ts";
import { mesDe as mesDoOrcamento } from "../lib/orcamento/analise.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}
const semComentarios = (f: string) => f.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/gm, " ");
const leia = (caminho: string) => semComentarios(readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8"));

console.log("Biela: o limite do gratuito, e quem o segura.");

// ── a conta ─────────────────────────────────────────────────────────────────
{
  conferir("o limite do gratuito é cinco por mês (decisão do dono, 15/09)", LIMITE_GRATIS_POR_MES === 5, String(LIMITE_GRATIS_POR_MES));
  conferir("com zero feitas, pode", podePerguntar(0, false));
  conferir(`com ${LIMITE_GRATIS_POR_MES - 1} feitas, ainda pode`, podePerguntar(LIMITE_GRATIS_POR_MES - 1, false));
  conferir(`com ${LIMITE_GRATIS_POR_MES} feitas, NÃO pode`, !podePerguntar(LIMITE_GRATIS_POR_MES, false));
  conferir("Premium passa por cima do teto", podePerguntar(999, true));
  conferir("o saldo do Premium é nulo, não um número", restantes(999, true) === null);
  conferir("o saldo nunca fica negativo", restantes(LIMITE_GRATIS_POR_MES + 3, false) === 0, String(restantes(LIMITE_GRATIS_POR_MES + 3, false)));
  conferir("com uma feita, sobram quatro", restantes(1, false) === LIMITE_GRATIS_POR_MES - 1);

  // O mês é o MESMO do orçamento por foto, e não uma cópia. Dois relógios
  // diferentes para os dois limites gratuitos da mesma pessoa é o tipo de
  // divergência que só aparece na virada do mês, uma vez a cada trinta dias.
  const d = new Date("2026-09-15T12:00:00Z");
  conferir("o mês é o mesmo do orçamento por foto", mesDe(d) === mesDoOrcamento(d) && mesDe(d) === "2026-09", `${mesDe(d)} vs ${mesDoOrcamento(d)}`);
  conferir("o mês vira na virada, em UTC", mesDe(new Date("2026-09-30T23:59:59Z")) === "2026-09" && mesDe(new Date("2026-10-01T00:00:01Z")) === "2026-10");
}

// ── a rota, que é onde o limite existe de verdade ───────────────────────────
{
  const rota = leia("app/api/biela/route.ts");

  conferir(
    "a rota identifica pela conta (Bearer) e pelo aparelho (anonId)",
    /admin\.auth\.getUser\(bearer\)/.test(rota) && /body\.anonId === "string"/.test(rota),
    "sem identidade não há o que contar, e o limite vira enfeite",
  );
  conferir(
    "o Premium sai da tabela subscriptions, não do que o app diz",
    /from\("subscriptions"\)\.select\("status"\)/.test(rota) && /status === "active" \|\| sub\?\.status === "trialing"/.test(rota),
    "app comprometido diria que é Premium e a conta seria nossa",
  );
  conferir(
    "a rota CONTA no banco antes de chamar a API",
    /from\("biela_perguntas"\)\.select\("id", \{ count: "exact", head: true \}\)\.eq\("mes", mes\)/.test(rota),
  );
  conferir(
    "e recusa com 429 quando o mês acabou",
    /if \(!podePerguntar\(feitas, premium\)\)[\s\S]{0,260}status: 429/.test(rota),
  );
  conferir(
    "quem não tem identidade nenhuma é recusado",
    /if \(!userId && !anonId\) return NextResponse\.json\(\{ ok: false, error: "sem_identidade" \}/.test(rota),
  );
  // A ORDEM IMPORTA: contar depois de responder, e só no caminho que deu
  // certo. O `catch` é a chamada que NÃO completou.
  conferir(
    "a pergunta é gravada DEPOIS da resposta boa, não antes",
    /const data = await res\.json\(\)[\s\S]{0,900}from\("biela_perguntas"\)\.insert/.test(rota),
    "gravar antes cobraria uma das cinco por uma chamada que pode falhar",
  );
  conferir(
    "o Premium não gera linha de contagem",
    /if \(admin && !premium\) \{[\s\S]{0,120}from\("biela_perguntas"\)\.insert/.test(rota),
  );
  conferir(
    "falha ao gravar NÃO derruba a resposta, mas vira registro",
    /if \(error\) console\.error\("\[biela\] não gravei a pergunta para o limite"/.test(rota),
    "contagem que não grava é limite que não existe, e isso some em silêncio",
  );
  conferir(
    "a rota devolve o saldo para a tela",
    /restantes: restantes\(feitas, premium\)/.test(rota),
  );
  // A tabela não guarda pergunta nem resposta, e isso é decisão, não esquecimento.
  conferir(
    "a rota não grava a pergunta nem a resposta na tabela do limite",
    !/insert\(\{[\s\S]{0,300}(question|answer|pergunta:|resposta:)/.test(rota),
    "o limite precisa saber quantas, não o quê",
  );
}

// ── a tela, que não pode voltar a contar sozinha ────────────────────────────
{
  const tela = leia("components/app/screens/Biela.tsx");

  conferir(
    "o contador em estado de React SUMIU (ele zerava a cada abertura do app)",
    !/setUsed\(/.test(tela) && !/FREE_BIELA_QUESTIONS/.test(tela),
    "era ele que transformaria cinco por mês em cinco por abertura",
  );
  conferir(
    "o saldo vem do servidor",
    /if \(typeof data\.restantes === "number"\) setRestantes\(data\.restantes\)/.test(tela),
  );
  // `restantes` nulo é "ainda não perguntei", não "acabou". Tratar desconhecido
  // como esgotado trancaria a Biela para todo mundo na primeira abertura.
  conferir(
    "saldo desconhecido NÃO tranca a tela",
    /const gated = !s\.premium && restantes !== null && restantes <= 0/.test(tela),
    "nulo significa 'não perguntei ao servidor ainda'",
  );
  conferir(
    "o 429 fecha a tela e não vira mensagem de erro solta",
    /if \(res\.status === 429\) \{[\s\S]{0,120}setRestantes\(0\)/.test(tela),
  );
  conferir(
    "a identidade viaja no pedido",
    /anonId: anonId\(\)/.test(tela) && /token \? \{ authorization: `Bearer \$\{token\}` \} : \{\}/.test(tela),
    "sem isto o servidor não sabe de quem é a pergunta e conta todo mundo junto",
  );
  conferir(
    "o saldo aparece para a pessoa",
    /c\.biela\.freeLeft\.replace\("\{n\}", String\(restantes\)\)/.test(tela),
    "quem não sabe que tem pergunta grátis não usa, e o ponto era o uso",
  );
}

// ── as PORTAS de entrada, que é onde o defeito de 17/09 morava ──────────────
//
// A conferência original olhou a rota, o limite, a tela e os textos, e deixou
// passar o que o dono viu no aparelho: a Biela continuava mostrando paywall.
// O motivo é o erro clássico da casa, o de conferir o meio do caminho e não o
// fim. Eu abri a porta DENTRO da sala e deixei SETE fechaduras do lado de
// fora, cada uma em uma tela, todas na forma
// `go(s.premium ? { name: "biela" } : { name: "subscribe" })`. Quem não
// assinava nunca chegava ao chat para descobrir que tinha cinco perguntas.
//
// Conferência de texto porque o alvo é navegação espalhada por sete arquivos,
// e o elo que ela cobra é exatamente o que manteve o defeito de pé.
{
  const telas = [
    "components/app/screens/Learn.tsx",
    "components/app/screens/Equipment.tsx",
    "components/app/screens/Symptoms.tsx",
    "components/app/screens/Search.tsx",
    "components/app/screens/Obd2.tsx",
  ];
  for (const caminho of telas) {
    const fonte = leia(caminho);
    const portao = /s\.premium\s*[\s\S]{0,40}?\{\s*name:\s*"biela"/.test(fonte);
    conferir(
      `${caminho.split("/").pop()}: a entrada da Biela NÃO passa por Premium`,
      !portao,
      "quem não assina tem cinco perguntas por mês e precisa CHEGAR na tela para usá-las",
    );
  }
  // O selo e o cadeado são a promessa visual do portão. Sobreviver a ele é
  // dizer "é pago" numa tela que é grátis, que afasta quem devia entrar.
  conferir(
    "o card da Biela em Estudos não tem mais selo de Premium",
    !/\{c\.biela\.cardTitle\}[\s\S]{0,120}<PremiumBadge \/>/.test(leia("components/app/screens/Learn.tsx")),
  );
  conferir(
    "o botão de diagnóstico não mostra mais cadeado",
    !/s\.premium \? "🐻" : "🔒"/.test(leia("components/app/screens/Symptoms.tsx")),
  );
}

// ── os textos ───────────────────────────────────────────────────────────────
{
  const content = readFileSync(new URL("../lib/app/content.ts", import.meta.url), "utf8");
  const bloco = content.slice(content.indexOf("freeLeft:"), content.indexOf("premiumCta:"));
  conferir(
    "o saldo fala do MÊS, que é a janela que o servidor conta",
    /restantes neste mês/.test(bloco) && !/restantes hoje/.test(bloco),
    "texto que diz uma janela e código que conta outra é reclamação certa",
  );
  conferir(
    "o texto de esgotado diz que as grátis acabaram, e não que a Biela é Premium",
    /perguntas grátis deste mês acabaram/.test(bloco) && !/é um recurso Premium/.test(bloco),
    bloco.slice(0, 200),
  );
  conferir("sem travessão nos dois", !/—/.test(bloco), bloco);
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) da Biela reprovaram.`);
  process.exit(1);
}
console.log("Biela: conta, rota, tela e textos conferidos.");
