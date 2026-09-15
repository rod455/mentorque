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
import {
  CHAVES as CHAVES_AP,
  escolherPush,
  ESPACO_MINIMO_DIAS as ESPACO_MINIMO_DIAS_AP,
  JANELA_DO_TETO as JANELA_DO_TETO_AP,
  TETO_POR_JANELA as TETO_POR_JANELA_AP,
  TEXTOS as TEXTOS_AP,
  type AparelhoDaJornada,
} from "../lib/jornada/aparelho.ts";

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

// ── a jornada do aparelho sem conta (15/09/2026) ────────────────────────────
// Cada regra aqui erra em silêncio do pior jeito: push a mais faz a pessoa
// desligar os avisos, e aí ela some para sempre e ninguém fica sabendo.
{
  const hoje = "2026-09-15";
  const diasAtras = (n: number) => {
    const d = new Date(`${hoje}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - n);
    return d.toISOString().slice(0, 10);
  };
  const ap = (extra: Partial<AparelhoDaJornada> = {}): AparelhoDaJornada => ({
    anonId: "a1",
    plataforma: "android",
    eventos: { abriu_app: diasAtras(3), comecou_onboarding: diasAtras(3), terminou_onboarding: diasAtras(3) },
    envios: [],
    ...extra,
  });
  const k = (x: AparelhoDaJornada, dia = hoje) => escolherPush(x, dia)?.chave ?? null;

  // os cortes que valem antes de tudo
  const comCarro = ap({ eventos: { abriu_app: diasAtras(3), terminou_onboarding: diasAtras(3), cadastrou_carro: diasAtras(3) } });
  conferir("cadastrou o carro e não tem conta: guardar:carro", k(comCarro) === "guardar:carro", `veio ${k(comCarro)}`);
  conferir(
    "QUEM TEM CONTA não recebe nada desta jornada",
    k({ ...comCarro, eventos: { ...comCarro.eventos, cadastro: diasAtras(1) } }) === null,
    "ela pede para criar a conta que a pessoa já tem",
  );
  conferir("mexeu no app HOJE não recebe hoje", k({ ...comCarro, eventos: { ...comCarro.eventos, abriu_app: hoje } }) === null);
  conferir(
    "recebeu ontem: nada hoje",
    k({ ...comCarro, envios: [{ chave: "falta:carro", dia: diasAtras(1) }] }) === null,
  );
  conferir(
    `recebeu há ${ESPACO_MINIMO_DIAS_AP} dias: pode`,
    k({ ...comCarro, envios: [{ chave: "falta:carro", dia: diasAtras(ESPACO_MINIMO_DIAS_AP) }] }) === "guardar:carro",
  );
  // O teto: três em trinta dias, mais apertado que o do e-mail de propósito.
  const tres = [4, 9, 14].map((d, i) => ({ chave: `x${i}`, dia: diasAtras(d) }));
  conferir(
    `${TETO_POR_JANELA_AP} push em ${JANELA_DO_TETO_AP} dias: nada mais`,
    k({ ...comCarro, envios: tres }) === null,
    `veio ${k({ ...comCarro, envios: tres })}`,
  );
  conferir(
    "envio fora da janela não ocupa vaga",
    k({ ...comCarro, envios: [...tres.slice(0, 2), { chave: "velho", dia: diasAtras(JANELA_DO_TETO_AP + 1) }] }) === "guardar:carro",
  );

  // esfriar: não falar de uma coisa que a pessoa fez agora
  conferir(
    "cadastrou o carro HOJE: não recebe 'guardar' hoje",
    k(ap({ eventos: { abriu_app: diasAtras(1), cadastrou_carro: hoje } })) !== "guardar:carro",
  );
  conferir(
    "cadastrou o carro ONTEM: ainda não (esfria em 2 dias)",
    k(ap({ eventos: { abriu_app: diasAtras(2), cadastrou_carro: diasAtras(1) } })) !== "guardar:carro",
  );

  // a ordem é a do que a pessoa tem a perder
  const comDado = ap({ eventos: { abriu_app: diasAtras(3), cadastrou_carro: diasAtras(3), registrou_servico: diasAtras(3) } });
  conferir("quem registrou serviço ouve falar do DADO, não do carro", k(comDado) === "guardar:dados", `veio ${k(comDado)}`);

  // os degraus de quem não chegou lá
  const abriuNaoCadastrou = ap({ eventos: { abriu_app: diasAtras(3), terminou_onboarding: diasAtras(3), abriu_cadastro_de_carro: diasAtras(3) } });
  conferir("abriu o cadastro e não cadastrou: falta:carro", k(abriuNaoCadastrou) === "falta:carro", `veio ${k(abriuNaoCadastrou)}`);
  conferir(
    "quem CADASTROU não recebe 'falta:carro'",
    k({ ...abriuNaoCadastrou, eventos: { ...abriuNaoCadastrou.eventos, cadastrou_carro: diasAtras(3) } }) !== "falta:carro",
  );
  const parouNoOnboarding = ap({ eventos: { abriu_app: diasAtras(3), comecou_onboarding: diasAtras(3) } });
  conferir("começou e não terminou o onboarding: falta:onboarding", k(parouNoOnboarding) === "falta:onboarding", `veio ${k(parouNoOnboarding)}`);

  // sumiu, e o último push oferece a saída
  const sumido = ap({ eventos: { abriu_app: diasAtras(12), comecou_onboarding: diasAtras(12), terminou_onboarding: diasAtras(12) } });
  conferir("sem abrir há 12 dias: voltar:10", k(sumido) === "voltar:10", `veio ${k(sumido)}`);
  const sumidoMais = ap({ eventos: { abriu_app: diasAtras(40), comecou_onboarding: diasAtras(40), terminou_onboarding: diasAtras(40) } });
  conferir("sem abrir há 40 dias: voltar:25", k(sumidoMais) === "voltar:25", `veio ${k(sumidoMais)}`);

  // PEDE UMA VEZ E PARA. Esgotadas as chaves, silêncio para sempre.
  const tudoJa = ap({
    eventos: { abriu_app: diasAtras(60), comecou_onboarding: diasAtras(60), terminou_onboarding: diasAtras(60), cadastrou_carro: diasAtras(60), registrou_servico: diasAtras(60) },
    envios: CHAVES_AP.map((c, i) => ({ chave: c, dia: diasAtras(40 + i) })),
  });
  conferir("com todas as chaves já enviadas, silêncio para sempre", k(tudoJa) === null, `veio ${k(tudoJa)}`);
  conferir("cada chave sai uma vez só", k({ ...comCarro, envios: [{ chave: "guardar:carro", dia: diasAtras(30) }] }) !== "guardar:carro");

  // os textos
  for (const chave of CHAVES_AP) {
    const t = TEXTOS_AP[chave];
    conferir(`${chave}: tem texto`, !!t?.titulo && !!t?.corpo);
    if (!t) continue;
    const tudo = `${t.titulo}\n${t.corpo}`;
    conferir(`${chave}: sem travessão`, !/—/.test(tudo), tudo);
    conferir(
      `${chave}: sem preço, plano ou Premium (esta jornada pede conta, que é de graça)`,
      !/premium|assin|plano|R\$|grátis|gratuito|desconto|oferta/i.test(tudo),
      tudo.match(/premium|assin|plano|R\$|grátis|gratuito|desconto|oferta/i)?.[0],
    );
    // O servidor não sabe carro, número nem data de quem não tem conta.
    conferir(
      `${chave}: não promete número nem data`,
      !/\d/.test(tudo),
      `${tudo}; qualquer número aqui é invenção, o servidor não conhece o carro de quem não tem conta`,
    );
    conferir(`${chave}: push curto`, t.titulo.length <= 70 && t.corpo.length <= 160, `${t.titulo.length}/${t.corpo.length}`);
  }
  conferir(
    "o último push oferece desligar os avisos em vez de insistir",
    /desligar os avisos/.test(TEXTOS_AP["voltar:25"].corpo),
    TEXTOS_AP["voltar:25"].corpo,
  );
}

// ── as ligações da jornada do aparelho ──────────────────────────────────────
{
  const cron = leia("app/api/cron/jornada/route.ts");

  // O FREIO. Mandar mensagem a cliente é alçada do dono, e esta jornada fala
  // com gente que nenhuma outra alcançava. Sem estas duas linhas, um deploy
  // manda push para todo mundo sem ninguém ter decidido.
  conferir(
    "a jornada do aparelho tem freio PRÓPRIO e ele não é o do e-mail",
    /const aparelhoLiberado = process\.env\.JORNADA_APARELHO === "sim"/.test(cron),
    "sem freio próprio, ligar a jornada por e-mail ligaria esta também",
  );
  conferir(
    "e o freio de mão geral continua valendo por cima",
    /const aparelhoAtiva = ativa && aparelhoLiberado/.test(cron),
    "JORNADA_PAUSADA tem que calar as duas",
  );
  conferir(
    "em ensaio ela calcula e NÃO manda",
    /candidatos\.push\(\{ anonId[\s\S]{0,120}if \(!ativa\) continue;/.test(cron),
    "o dono lê o que sairia antes de sair",
  );

  conferir(
    "só entra aparelho SEM conta (quem criou conta é atendido pelo e-mail)",
    /from\("push_tokens"\)[\s\S]{0,80}\.is\("user_id", null\)/.test(cron),
    "sem este filtro a mesma pessoa recebe o e-mail e o push de criar conta no mesmo dia",
  );
  conferir(
    "o envio mira o aparelho, não a conta",
    /enviarPush\(admin, \{ anonId: ap\.anonId \}/.test(cron),
  );
  conferir(
    "o envio só é registrado quando ALGUÉM recebeu",
    /if \(r\.enviados > 0\) \{[\s\S]{0,160}jornada_envios_aparelho"\)\.insert/.test(cron),
    "registrar antes de entregar faria a chave queimar sem a pessoa ver nada",
  );
  conferir(
    "o dia do evento é lido no fuso de Brasília, o mesmo do `hoje`",
    /const dia = hojeEmBrasilia\(new Date\(e\.criado_em as string\)\)/.test(cron),
    "misturar UTC com Brasília aqui erra por um dia nas duas pontas",
  );

  const sqlEnvios = "supabase/jornada_aparelho.sql";
  const envios = readFileSync(new URL(`../${sqlEnvios}`, import.meta.url), "utf8");
  conferir(
    "o banco tem a trava 'nunca dois no mesmo dia' também para o aparelho",
    /unique index[\s\S]{0,120}\(anon_id, dia\)/.test(envios),
    "é a única defesa que sobrevive ao cron rodando duas vezes",
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
