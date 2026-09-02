// A compra pendente sobrevive ao login social, e só a ele.
//
// Esta conferência nasce de um defeito real (02/09/2026): o link de venda
// mentorque.com.br/ALE100 levava à tela de entrar, e depois do login com o
// Google a pessoa caía na tela inicial. Sem pagamento e sem cupom. O plano e o
// cupom viviam na MEMÓRIA da página, e login social na web recarrega a página
// inteira: o navegador sai do nosso domínio, vai ao provedor e volta.
//
// O que ela protege, e as duas metades brigam entre si de propósito:
//
//   1. a compra ATRAVESSA uma recarga de página, senão o link não vende
//   2. e não ressuscita depois: consumida, ela some; velha, ela não volta
//
// A segunda metade é o que impede o conserto de virar outro defeito. Uma
// pendência eterna despejaria a pessoa numa tela de pagamento que ela não
// pediu, dias depois, com um cupom que ela já esqueceu.
//
// Rode com: npm run conferir:venda
import { esqueceVenda, guardaVenda, vendaPendente } from "../lib/app/vendaPendente.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

// Um navegador de mentira, com só a gaveta que a compra pendente usa.
const gaveta = new Map<string, string>();
(globalThis as Record<string, unknown>).window = {
  localStorage: {
    getItem: (k: string) => gaveta.get(k) ?? null,
    setItem: (k: string, v: string) => void gaveta.set(k, v),
    removeItem: (k: string) => void gaveta.delete(k),
  },
};

const CHAVE = "mq-venda-pendente";

// ── 1. o caso do relato: /ALE100, login, pagamento ──────────────────────────
//
// A recarga do login social é simulada do jeito honesto: ninguém guarda nada
// nesta "página", a gaveta já chega escrita pela página ANTERIOR. É o que faz
// esta conferência morder se alguém devolver o plano para a memória: um
// `useRef` não estaria escrito aqui.
{
  gaveta.clear();
  gaveta.set(CHAVE, JSON.stringify({ plano: "monthly", direto: true, cupom: "ALESSANDRO1MES", t: Date.now() - 12_000 }));

  const v = vendaPendente();
  conferir("a compra sobrevive à recarga do login social", v !== null);
  conferir("o plano volta inteiro", v?.plano === "monthly", `veio ${v?.plano}`);
  conferir("o cupom volta inteiro", v?.cupom === "ALESSANDRO1MES", `veio ${v?.cupom}`);
  conferir("o link de venda continua indo DIRETO ao pagamento", v?.direto === true);
}

// ── 2. ida e volta pela nossa própria escrita ───────────────────────────────
{
  gaveta.clear();
  guardaVenda({ plano: "annual", direto: true, cupom: "PREMIUM30" });
  const v = vendaPendente();
  conferir("o que foi guardado é o que volta", v?.plano === "annual" && v?.cupom === "PREMIUM30" && v?.direto === true);
}

// ── 3. o onboarding para no paywall, não no pagamento ───────────────────────
//
// A distinção existe porque são pessoas diferentes: quem clicou no link de
// venda já foi convencido, quem está no onboarding ainda está conhecendo.
{
  gaveta.clear();
  guardaVenda({ plano: "monthly", direto: false });
  const v = vendaPendente();
  conferir("compra do onboarding não é direta", v?.direto === false);
  conferir("e não inventa cupom", v?.cupom === undefined, `veio ${v?.cupom}`);
}

// ── 4. consumida, some ──────────────────────────────────────────────────────
//
// É esta linha que mantém de pé a regra antiga: recarregar a página depois de
// chegar ao pagamento não pode reabrir compra nenhuma.
{
  gaveta.clear();
  guardaVenda({ plano: "annual", direto: true });
  esqueceVenda();
  conferir("compra consumida não volta na recarga", vendaPendente() === null);
}

// ── 5. velha, não ressuscita ────────────────────────────────────────────────
{
  gaveta.clear();
  gaveta.set(CHAVE, JSON.stringify({ plano: "annual", direto: true, cupom: "PREMIUM30", t: Date.now() - 45 * 60 * 1000 }));
  conferir("compra de 45 minutos atrás não empurra pagamento nenhum", vendaPendente() === null);
  conferir("e sai da gaveta ao ser recusada", gaveta.get(CHAVE) === undefined);
}

// ── 6. gaveta vazia ou suja não vira compra ─────────────────────────────────
{
  gaveta.clear();
  conferir("abertura limpa não abre pagamento", vendaPendente() === null);

  gaveta.set(CHAVE, "isto não é json");
  conferir("lixo na gaveta não vira compra", vendaPendente() === null);

  gaveta.set(CHAVE, JSON.stringify({ plano: "vitalicio", direto: true, t: Date.now() }));
  conferir("plano que não existe não vira compra", vendaPendente() === null);

  gaveta.set(CHAVE, JSON.stringify({ plano: "annual", direto: true }));
  conferir("compra sem carimbo de tempo não vira compra", vendaPendente() === null);
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) da compra pendente reprovaram.`);
  process.exit(1);
}
console.log("Compra pendente: atravessa o login social, e some depois de usada ou velha.");
