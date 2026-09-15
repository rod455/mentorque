// O registro de push: quem é o dono do token, e o que trava cada caminho.
//
// POR QUE (15/09/2026). Até hoje a rota exigia sessão e a tabela exigia
// `user_id`. O efeito, medido: 26 aparelhos Android em 5 dias, ZERO eventos
// com conta, 1 token no banco inteiro. O push não alcançava ninguém e o
// único sinal disso era uma linha em `app_erros` que o Vigia levou dois dias
// para juntar. O dono decidiu mandar push para quem baixou o app.
//
// Cada regra abaixo erra em silêncio, que é a marca deste arquivo inteiro:
// registro que não acontece não reclama, e registro que acontece com o dono
// ERRADO é pior, porque a pessoa com conta cai na jornada que pede para criar
// conta. Conferência de texto onde não há função pura para chamar (rota e
// efeito de React), e está dito em cada caso por quê.
//
// Rode com: npm run conferir:push
import { readFileSync } from "node:fs";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}
const semComentarios = (f: string) => f.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/gm, " ");
const leia = (caminho: string) => semComentarios(readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8"));

console.log("Push: de quem é o token, e quem pode gravar.");

// ── a rota ──────────────────────────────────────────────────────────────────
{
  const rota = leia("app/api/push/registrar/route.ts");

  conferir(
    "a rota aceita registro SEM sessão (era isto que deixava o Android inteiro de fora)",
    !/if \(!bearer\) return NextResponse\.json\(\{ error: "unauthorized" \}/.test(rota),
    "voltou a recusar quem não tem conta",
  );
  conferir(
    "Bearer inválido é RECUSADO, nunca rebaixado para aparelho",
    /if \(bearer\)[\s\S]{0,260}return NextResponse\.json\(\{ error: "unauthorized" \}, \{ status: 401 \}\)/.test(rota),
    "sem isto, quem tem conta cai na jornada que pede para criar conta",
  );
  conferir(
    "sem dono nenhum a rota recusa",
    /if \(!userId && !anonId\) return NextResponse\.json\(\{ error: "sem_dono" \}/.test(rota),
  );
  conferir(
    "id de aparelho sem armazenamento não vira linha (ele morre quando o app fecha)",
    /startsWith\(SEM_ARMAZENAMENTO\)/.test(rota) && /const SEM_ARMAZENAMENTO = "sem-armazenamento"/.test(rota),
  );
  conferir(
    "o upsert grava os dois donos: user_id e anon_id",
    /\.upsert\(\{ token, user_id: userId, anon_id: anonId, platform/.test(rota),
    "o anon_id junto do user_id é o que liga o aparelho de antes à conta de depois",
  );
  conferir(
    "apagar filtra pelo dono (uma conta não apaga o token de outra, nem um aparelho)",
    /\.delete\(\)\.eq\("token", token\)/.test(rota) && /userId \? q\.eq\("user_id", userId\) : q\.eq\("anon_id"/.test(rota),
  );
}

// ── o app ───────────────────────────────────────────────────────────────────
{
  const push = leia("lib/app/push.ts");

  conferir(
    "o dono é a conta quando há sessão, e o aparelho quando não há",
    /const dono = sessao\?\.user\?\.id \?\? \(temIdentidade \? anon : null\)/.test(push),
  );
  conferir(
    "o anonId vai no corpo do POST",
    /anonId: temIdentidade \? anon : undefined/.test(push),
  );
  conferir(
    "o Bearer só entra quando existe (senão a rota recusa um cabeçalho vazio)",
    /\.\.\.\(bearer \? \{ authorization: `Bearer \$\{bearer\}` \} : \{\}\)/.test(push),
  );
  // A marca com o dono é o que faz o login reentregar. Sem ela, quem usou o
  // app sem conta e criou conta depois ficava anônimo para sempre: o token
  // não muda, e a comparação por token dizia "já entreguei".
  conferir(
    "a marca guarda dono E token, não só o token",
    /window\.localStorage\.setItem\(MARCA, `\$\{dono\}\|\$\{token\}`\)/.test(push),
  );
  conferir(
    "a entrega para cedo só quando o token E o dono batem",
    /marca\.token === token && marca\.dono === dono/.test(push),
  );
  // Quem já tem o app carrega a marca no formato antigo (só o token). Ela tem
  // que forçar UMA reentrega, senão esses aparelhos nunca gravam o anon_id.
  conferir(
    "marca em formato antigo (sem a barra) não conta como entregue",
    /return i > 0 \? \{ dono: v\.slice\(0, i\), token: v\.slice\(i \+ 1\) \} : null/.test(push),
  );
  conferir(
    "mas o 'esqueça' ainda acha o token no formato antigo",
    /function tokenGuardado[\s\S]{0,200}return i > 0 \? v\.slice\(i \+ 1\) : v/.test(push),
    "senão quem desliga os avisos deixa um token vivo no banco",
  );

  // Conferência de texto porque o alvo é um efeito de React, que não dá para
  // chamar daqui sem subir a árvore inteira. O elo que ela protege é o que,
  // quando faltou, deixava o defeito de pé: sem `user?.id` na lista, criar
  // conta não reexecuta o registro.
  const abertura = leia("lib/app/aberturaDoApp.ts");
  conferir(
    "o registro roda de novo quando a pessoa entra na conta",
    /void sincronizarPush\(s\.notifications\);[\s\S]{0,80}\}, \[s\.notifications, user\?\.id, ready\]\)/.test(abertura),
    "sem user?.id na lista, a linha do banco fica anônima para sempre",
  );
  conferir(
    "e espera o `ready` antes de decidir que não há conta",
    /if \(!ready\) return;[\s\S]{0,80}void sincronizarPush/.test(abertura),
    "user nulo por carregamento não é user nulo por não ter conta",
  );
}

// ── o banco ─────────────────────────────────────────────────────────────────
{
  const sql = readFileSync(new URL("../supabase/push_anonimo.sql", import.meta.url), "utf8");
  conferir("a migração solta o NOT NULL do user_id", /alter column user_id drop not null/.test(sql));
  conferir("e cria o anon_id", /add column if not exists anon_id text/.test(sql));
  conferir(
    "linha sem dono nenhum é proibida pelo banco",
    /check \(user_id is not null or anon_id is not null\)/.test(sql),
  );
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) do push reprovaram.`);
  process.exit(1);
}
console.log("Push: rota, app e banco conferidos.");
