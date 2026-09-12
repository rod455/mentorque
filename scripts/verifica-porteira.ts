// A porteira da web: no site em produção, sem conta, o app não abre.
//
// DECISÃO DO DONO (12/09/2026): o caminho da web sai; usuário precisa baixar
// o app. A regra é pura (lib/app/porteiraDaWeb.ts) e os casos que ela não
// pode errar são os dois lados: fechar para quem chega sem conta no domínio
// de produção, e NUNCA fechar no app das lojas, em localhost (onde as suítes
// entram como convidado) nem para quem já tem conta (as três pessoas que
// pagam pelo Stripe entram pela web).
//
// E a ligação: a página do app tem de consultar a regra e mostrar a tela de
// "baixe o app"; o site não pode mais ter o link "use pelo navegador".
//
// Rode com: npm run conferir:porteira
import { readFileSync } from "node:fs";
import { porteiraFechada } from "../lib/app/porteiraDaWeb.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}
const semComentarios = (f: string) => f.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/gm, " ");
const leia = (caminho: string) => semComentarios(readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8"));

console.log("Porteira: no site em produção, sem conta, o app não abre.");

conferir("produção, sem conta: fechada", porteiraFechada({ nativo: false, hostname: "www.mentorque.com.br", temConta: false }));
conferir("produção sem www, sem conta: fechada", porteiraFechada({ nativo: false, hostname: "mentorque.com.br", temConta: false }));
conferir("produção, COM conta: aberta (quem paga pelo Stripe entra pela web)", !porteiraFechada({ nativo: false, hostname: "www.mentorque.com.br", temConta: true }));
conferir("app das lojas: sempre aberta", !porteiraFechada({ nativo: true, hostname: "localhost", temConta: false }));
conferir("localhost (as suítes entram como convidado): aberta", !porteiraFechada({ nativo: false, hostname: "localhost", temConta: false }));
conferir("prévia da Vercel: aberta", !porteiraFechada({ nativo: false, hostname: "mentorque-git-x-rod455.vercel.app", temConta: false }));
conferir("maiúscula no domínio não escapa", porteiraFechada({ nativo: false, hostname: "WWW.Mentorque.com.br", temConta: false }));

const pagina = leia("app/app/page.tsx");
conferir("a página do app consulta a porteira antes de abrir", /porteiraFechada\(\{/.test(pagina) && /<BaixeOApp/.test(pagina), "regra escrita e não chamada é o defeito silencioso de sempre");
conferir("e espera a sessão ser resolvida antes de decidir", /!ready\) return null/.test(pagina), "decidir antes do `ready` mostraria 'baixe o app' para quem já tem conta, por um instante ou para sempre");

const baixe = leia("components/app/BaixeOApp.tsx");
conferir("a tela de 'baixe o app' tem os selos das lojas e a entrada de quem já tem conta", /<StoreBadges/.test(baixe) && /signInGoogle/.test(baixe) && /signInApple/.test(baixe) && /onEntrarComEmail/.test(baixe));
conferir("o link de venda sobrevive à porteira", /guardaVenda\(\{/.test(baixe), "sem isso, quem clica em 'assinar' no e-mail perde o plano e o cupom no login");

const hero = leia("components/sections/Hero.tsx");
conferir("o site não oferece mais o app pelo navegador", !/href="\/app/.test(hero) && !/usarNoNavegador/.test(hero));
const abertura = leia("lib/app/aberturaDoApp.ts");
conferir("'entrar com e-mail' abre o app na tela de login", /d === "auth"[\s\S]{0,40}go\(\{ name: "auth" \}\)/.test(abertura));

if (falhas) {
  console.error(`\n${falhas} conferência(s) da porteira reprovaram.`);
  process.exit(1);
}
console.log("Porteira: fecha para quem não tem conta no site, e só lá.");
