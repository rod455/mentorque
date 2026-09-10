// A comparação de preço com a região: a faixa, a posição do valor, e quem
// chama.
//
// POR QUE (10/09/2026). Registrar um serviço com valor passou a terminar numa
// resposta ("na sua região costuma ficar entre X e Y; você pagou Z"), e o
// valor pago vai para a tabela precos_observados, sem ninguém dentro. Três
// coisas podem falhar em silêncio: a faixa sair errada (fator da região
// aplicado ao contrário), a observação carregar dado de pessoa, e a ligação
// entre o formulário e o cartão sumir numa refatoração. Cada uma tem a sua
// asserção aqui.
//
// Rode com: npm run conferir:precos
import { readFileSync } from "node:fs";
import { FAIXAS_NACIONAIS, faixaDaRegiao, observacaoDePreco, posicaoNaFaixa } from "../lib/app/faixaDePreco.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}
const semComentarios = (f: string) => f.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/gm, " ");
const META = { plataforma: "android", versao: "2.4.0" };
const leia = (caminho: string) => semComentarios(readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8"));

console.log("Preços: a faixa da região e a observação sem ninguém dentro.");

// ── a faixa ────────────────────────────────────────────────────────────────
{
  const nacional = faixaDaRegiao("oil", null, null);
  conferir("sem região, a faixa é a nacional", !!nacional && nacional.min === FAIXAS_NACIONAIS.oil.min && nacional.max === FAIXAS_NACIONAIS.oil.max && nacional.regiao === null);
  const sp = faixaDaRegiao("oil", "SP", null)!;
  const pi = faixaDaRegiao("oil", "PI", null)!;
  conferir("estado mais caro sobe a faixa, mais barato desce", sp.min > FAIXAS_NACIONAIS.oil.min && pi.max < FAIXAS_NACIONAIS.oil.max);
  const campinas = faixaDaRegiao("oil", "SP", "Campinas")!;
  conferir("cidade conhecida manda sobre o estado", campinas.especifica && campinas.regiao === "Campinas/SP");
  conferir("a faixa é arredondada em dezenas", sp.min % 10 === 0 && sp.max % 10 === 0);
  conferir("tipo sem referência não tem faixa", faixaDaRegiao("other", "SP", null) === null);
  conferir("todo tipo com faixa tem mínimo menor que máximo", Object.values(FAIXAS_NACIONAIS).every((f) => f.min > 0 && f.min < f.max));
}

// ── a posição ──────────────────────────────────────────────────────────────
{
  const f = { min: 150, max: 450 };
  conferir("abaixo", posicaoNaFaixa(100, f) === "abaixo");
  conferir("no mínimo é dentro", posicaoNaFaixa(150, f) === "dentro");
  conferir("no máximo é dentro", posicaoNaFaixa(450, f) === "dentro");
  conferir("acima", posicaoNaFaixa(451, f) === "acima");
}

// ── a observação não carrega ninguém ───────────────────────────────────────
{
  const o = observacaoDePreco({ tipo: "oil", valor: 230.4, uf: "sp", cidade: "São Paulo", tipoVeiculo: "car", ano: 2016 }, META);
  conferir("a observação existe e normaliza", !!o && o.valor === 230 && o.uf === "SP" && o.cidade === "sao paulo");
  const chaves = Object.keys(o ?? {});
  conferir(
    "sem nome, e-mail, id, placa, oficina ou nota",
    !chaves.some((k) => /nome|name|email|user|anon|placa|plate|shop|oficina|nota|notes|id$/i.test(k)),
    `chaves: ${chaves.join(", ")}`
  );
  conferir("'other' não é observado", observacaoDePreco({ tipo: "other", valor: 100 }, META) === null);
  conferir("valor zero ou absurdo não é observado", observacaoDePreco({ tipo: "oil", valor: 0 }, META) === null && observacaoDePreco({ tipo: "oil", valor: 1_000_000 }, META) === null);
}

// ── quem chama ─────────────────────────────────────────────────────────────
{
  const history = leia("components/app/screens/History.tsx");
  conferir("salvar um serviço com valor guarda a comparação e observa o preço", /guardarComparacao\(\{/.test(history) && /observarPreco\(\{/.test(history));
  conferir("e só na gravação nova, não na edição", /\} else \{[\s\S]*?addService\(rec\(svc, i === 0\)\)\);[\s\S]*?guardarComparacao\(/.test(history), "a comparação na edição repetiria a observação e inflaria a tabela");
  conferir("a tela do histórico mostra o cartão", /consumirComparacao\(\)/.test(history) && /<ComparacaoDaRegiao/.test(history));
  conferir("o cartão diz que é faixa de referência", /comparacaoNota/.test(history));
  const rota = leia("app/api/precos/route.ts");
  conferir("a rota recusa tipo desconhecido e valor fora da faixa", /tipo_desconhecido/.test(rota) && /valor_fora_da_faixa/.test(rota));
  conferir("a rota não grava id de usuário", !/user_id|anon_id/.test(rota));
  const sql = readFileSync(new URL("../supabase/precos_observados.sql", import.meta.url), "utf8");
  conferir("a tabela tem RLS ligado e sem política", /enable row level security/.test(sql) && !/create policy/.test(sql));
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) de preços reprovaram.`);
  process.exit(1);
}
console.log("Preços: a faixa acompanha a região, o valor vira dado sem ninguém dentro, e a tela mostra.");
