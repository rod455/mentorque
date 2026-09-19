// O link inteligente manda cada aparelho para a loja certa, e deixa rastro?
//
// POR QUE ISTO EXISTE (19/09/2026). A página `/baixar` é o link que vai na bio
// do Instagram. Ela tem dois jeitos de falhar, e os dois são caros e calados:
//
//   1. MANDAR PARA A LOJA ERRADA. Um iPhone que cai no Google Play vê uma
//      página que não serve para ele e vai embora. Ninguém reclama, e o clique
//      (pago ou orgânico) vira nada. Quem decide isso é uma leitura de texto do
//      navegador, que é exatamente o tipo de código que quebra quando alguém
//      "simplifica" a expressão.
//   2. NÃO DEIXAR RASTRO. A razão de a página existir, em vez de o link ir
//      direto para a loja, é que loja não conta de onde a pessoa veio: em todos
//      os eventos desde 23/08 as origens são google, atalho e email, e
//      `instagram` não aparece uma vez. Se o evento sumir do caminho, o link
//      continua funcionando para a pessoa e volta a ser invisível para nós, que
//      é o defeito que ele foi feito para consertar.
//
// Os textos de navegador abaixo são reais, inclusive os do navegador de DENTRO
// do Instagram, que é por onde a maior parte desse tráfego chega.
//
// Rode com: npm run conferir:baixar
import { readFileSync, existsSync } from "node:fs";
import { lojaDoAparelho } from "../lib/site/lojaDoAparelho.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}
const leia = (caminho: string) => readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8");

console.log("Link inteligente: cada aparelho na sua loja, e o clique deixa rastro?");

// ── 1. o aparelho certo na loja certa ──────────────────────────────────────
const APARELHOS: [string, string, number, string][] = [
  ["iPhone no Safari", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1", 5, "app_store"],
  ["iPhone dentro do Instagram", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 339.0.0.30.99 (iPhone14,5; iOS 17_5; pt_BR)", 5, "app_store"],
  ["Android no Chrome", "Mozilla/5.0 (Linux; Android 14; SM-A546E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36", 5, "play"],
  ["Android dentro do Instagram", "Mozilla/5.0 (Linux; Android 13; motorola edge 30) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36 Instagram 338.0.0.27.104 Android", 5, "play"],
  ["iPad moderno (se anuncia como Mac)", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15", 5, "app_store"],
  ["Mac de verdade, sem toque", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36", 0, "escolha"],
  ["Windows", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36", 0, "escolha"],
  ["navegador que não diz nada", "", 0, "escolha"],
];
for (const [nome, ua, toques, esperado] of APARELHOS) {
  const deu = lojaDoAparelho(ua, toques);
  conferir(`${nome} vai para ${esperado}`, deu === esperado, `foi para ${deu}`);
}

// ── 2. a página existe, fica fora do buscador e não leva ao /app ───────────
{
  conferir("a página /baixar existe", existsSync(new URL("../app/baixar/page.tsx", import.meta.url)));
  const pagina = leia("app/baixar/page.tsx");
  conferir(
    "ela fica fora do buscador",
    /robots:\s*\{\s*index:\s*false/.test(pagina),
    "página de desvio indexada compete com a home pelas mesmas palavras e entrega um redirecionamento no lugar de conteúdo",
  );
}

// ── 3. o rastro, que é a razão de a página existir ─────────────────────────
{
  const componente = leia("components/site/LevaParaALoja.tsx");
  conferir(
    "o clique vira evento no funil",
    /funil\("clicou_baixar"/.test(componente),
    "sem o evento, a página só atrasa a pessoa em 400ms e a origem continua invisível",
  );
  conferir(
    "a etiqueta da campanha é guardada antes do desvio",
    componente.indexOf("capturaCampanha") < componente.indexOf("clicou_baixar"),
    "guardar a UTM depois de mandar para a loja é não guardar",
  );
  conferir(
    "o desvio acontece DEPOIS do evento",
    componente.indexOf("clicou_baixar") < componente.indexOf("window.location.replace"),
    "o navegador não garante que um pedido em voo sobreviva à troca de página",
  );
  conferir(
    "os dois botões continuam na página",
    /data-loja="play"/.test(componente) && /data-loja="app-store"/.test(componente),
    "quando o desvio não pega (navegador estranho, desktop), o botão é a saída",
  );

  // O evento precisa existir nos TRÊS lugares, senão a rota recusa com 400 e o
  // clique se perde em silêncio (o funil é fire-and-forget de propósito).
  conferir("o evento está declarado na régua do funil", /clicou_baixar/.test(leia("lib/funilCorreto.ts")));
  conferir("e na união do cliente", /clicou_baixar/.test(leia("lib/app/funil.ts")));
  conferir(
    "e a rota /api/funil aceita ele",
    /"clicou_baixar"/.test(leia("app/api/funil/route.ts")),
    "a rota tem lista fechada: evento fora dela vira 400 e o clique some sem ninguém perceber",
  );
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) do link inteligente reprovaram.`);
  process.exit(1);
}
console.log(`Link inteligente: ${APARELHOS.length} aparelhos na loja certa, e o clique deixa rastro antes de sair.`);
