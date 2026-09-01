// Quem conta como gente, e quem não conta.
//
// Esta conferência nasce de um caso real (01/09/2026): o app gravava o texto
// fixo "sem-armazenamento" como id de todo aparelho sem localStorage, e o
// banco tratava esse texto como UMA pessoa. O relatório do Diretor saiu com
// "17 pessoas" no título, e não eram pessoas.
//
// O que ela protege, e a ordem importa:
//   1. aparelho sem armazenamento NÃO conta como gente
//   2. e também não vira "todo mundo": dois aparelhos assim não podem colar
//      os eventos um do outro
//   3. dentro da mesma sessão o id é estável, senão uma abertura vira várias
//
// O gêmeo desta regra mora no banco, na função `public.identidade`, e o elo
// entre os dois é o prefixo exportado por lib/app/anon.ts. Se ele mudar de um
// lado só, o banco volta a contar aparelho sem identidade como pessoa.
//
// Rode com: npm run conferir:identidade
import { SEM_ARMAZENAMENTO, ehIdentidade } from "../lib/app/anon.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

// ── o caso real ─────────────────────────────────────────────────────────────
{
  conferir(
    "o texto antigo e cru NÃO conta como gente",
    ehIdentidade("sem-armazenamento") === false,
  );
  conferir(
    "o id novo, com sufixo de sessão, também NÃO conta como gente",
    ehIdentidade(`${SEM_ARMAZENAMENTO}-3f9a1c02-0000-4000-8000-000000000000`) === false,
  );
  conferir(
    "um uuid de aparelho de verdade CONTA como gente",
    ehIdentidade("6850fe79-021d-401c-af29-df88b96b0c58") === true,
  );
}

// ── nada de identidade fantasma ─────────────────────────────────────────────
{
  conferir("nulo não conta", ehIdentidade(null) === false);
  conferir("indefinido não conta", ehIdentidade(undefined) === false);
  conferir("vazio não conta", ehIdentidade("") === false);
  conferir("só espaço não conta", ehIdentidade("   ") === false);
}

// ── o elo com o banco ───────────────────────────────────────────────────────
{
  conferir(
    "o prefixo é o que o banco procura (like 'sem-armazenamento%')",
    SEM_ARMAZENAMENTO === "sem-armazenamento",
    `hoje é "${SEM_ARMAZENAMENTO}"; se mudar aqui, mude a função public.identidade no mesmo commit`,
  );
}

// ── o id da sessão: estável por dentro, diferente por fora ──────────────────
//
// anonId() usa window, que não existe aqui. Em vez de simular um navegador,
// a conferência replica a regra do caminho de exceção, que é o que importa:
// um sorteio por sessão, com o prefixo na frente.
{
  const sessao = () => `${SEM_ARMAZENAMENTO}-${crypto.randomUUID()}`;
  const a = sessao();
  const b = sessao();
  conferir("duas sessões não recebem o mesmo id", a !== b, `${a} / ${b}`);
  conferir("as duas seguem fora da contagem de gente", !ehIdentidade(a) && !ehIdentidade(b));
  conferir(
    "o prefixo sobrevive ao sufixo",
    a.startsWith(SEM_ARMAZENAMENTO) && b.startsWith(SEM_ARMAZENAMENTO),
  );
}

// ── o que NÃO pode acontecer: um id de verdade ser descartado ───────────────
{
  // Nada que apenas CONTENHA o texto no meio pode ser descartado: a regra é
  // de prefixo, e um uuid nunca começa com letra de palavra nossa.
  conferir(
    "id que só contém o texto no meio continua contando",
    ehIdentidade("abc-sem-armazenamento-xyz") === true,
  );
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) de identidade reprovaram.`);
  process.exit(1);
}
console.log("Identidade: aparelho sem armazenamento não vira pessoa, nem vira todo mundo.");
