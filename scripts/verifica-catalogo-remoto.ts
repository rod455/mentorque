// O catálogo remoto de aulas: publicar sem build sem apagar o catálogo bom.
//
// POR QUE ISTO EXISTE (varredura dirigida do QA, 11/11/2026, na data que o dono
// marcou no retorno de 04/11 depois de eu adiar duas vezes). Este é o mecanismo
// que entrega conteúdo novo ao app sem passar por build, revisão da Apple e
// atualização na mão do usuário, e a partir de 11/11 ele carrega UMA AULA POR
// SEMANA, porque o Conteúdo mudou o ritmo. Ele também é o único lugar da casa
// onde um dado vindo da rede SOBREPÕE o que está no binário.
//
// E ele não tinha conferência nenhuma. Nenhum script citava `/api/lessons`,
// `remoteLessons` ou `montarPopulares` antes desta.
//
// O que pode dar errado aqui não é um número torto num relatório: é a tela de
// estudos do motorista ficar vazia, ou texto de aula que ainda não estreou
// viajar pela rede. As duas coisas já aconteceram nesta casa de formas
// parecidas, e as duas estão anotadas nos comentários das regras que esta
// conferência guarda.
//
// SÃO ASSERÇÕES DE FONTE, e isso é escolha, não preguiça: `remoteLessons.ts` é
// `"use client"` e importa `./apiBase` sem extensão, então `node
// --experimental-strip-types` não resolve o módulo. Mesmo padrão da
// `conferir:saude`, que lê a tela do quiz como texto. O preço é conhecido:
// asserção de fonte prova que a REGRA está escrita, não que ela roda. É por
// isso que cada uma abaixo diz qual estrago ela evita, e todas foram plantadas.
//
// Rode com: npm run conferir:catalogo-remoto
import { readFileSync } from "node:fs";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

const leia = (caminho: string) => readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8");
/** O fonte sem comentário: conferência de texto só vale sobre o que o motor executa. */
const semComentarios = (f: string) => f.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const rota = semComentarios(leia("app/api/lessons/route.ts"));
const cliente = semComentarios(leia("lib/app/remoteLessons.ts"));

console.log("Catálogo remoto: publica aula sem build sem apagar o catálogo bom?");

// ── 1. O PISO: PACOTE TORTO NÃO SOBREPÕE O CATÁLOGO DO BINÁRIO ──────────────
//
// Esta é a seção que protege a tela do motorista. O app nasce com o catálogo
// dentro do binário, e o remoto só SOBREPÕE. Se a validação aceitasse lixo, o
// lixo viraria o catálogo e ficaria GRAVADO no aparelho, porque o pacote vai
// para o `localStorage`: o estrago sobreviveria ao fim da rede.
{
  conferir(
    "pacote sem aula nenhuma é recusado",
    /!Array\.isArray\(lessons\) \|\| lessons\.length === 0/.test(cliente),
    "sem o teste de vazio, um payload com zero aulas sobrepõe o embutido e a tela de estudos fica vazia",
  );
  conferir(
    "os três campos que a tela lê direto são exigidos",
    /Array\.isArray\(a\.need\) && Array\.isArray\(a\.steps\) && Array\.isArray\(a\.safety\)/.test(cliente),
    "a tela lê `.length` deles; sem isto o app derrubava ao abrir a aula, que foi o defeito da primeira versão disto",
  );
  conferir(
    "e a validação vale também para o que já está guardado",
    /const p = JSON\.parse\(cru\);[\s\S]{0,120}if \(valido\(p\)\)[\s\S]{0,120}removeItem\(CHAVE\)/.test(cliente),
    "pacote gravado por uma versão anterior do app precisa passar pela mesma régua, senão o lixo antigo fica para sempre",
  );
  conferir(
    "pacote recusado na rede não substitui o que está em memória",
    /if \(!valido\(p\)\) return;/.test(cliente),
    "aceitar e só depois conferir já teria trocado o catálogo bom",
  );
}

// ── 2. AULA AGENDADA NÃO VIAJA, E O CORTE É NOS DOIS LADOS ──────────────────
//
// O corte do SERVIDOR é o que vale, porque o relógio do aparelho não é
// confiável e porque o texto da aula não pode trafegar antes de estrear (quem
// abrisse a resposta da rota leria o conteúdo). O corte do APARELHO não é
// redundância: o catálogo do binário não passa por servidor nenhum, então se um
// build sair entre escrever a aula e a data dela, ela viaja DENTRO do app.
{
  conferir(
    "o servidor não manda aula agendada",
    /if \(!lessonPublicada\(a\)\) continue;/.test(rota),
    "sem isto o texto da aula de estreia futura fica disponível na rota para quem abrir",
  );
  conferir(
    "e o aparelho filtra de novo, que é a única defesa do catálogo embutido",
    /p\.lessons\.filter\(\(a\) => lessonPublicada\(a\)\)/.test(cliente),
    "o embutido não passa por servidor: sem este filtro, aula escrita antes da data aparece no app que a carregou no binário",
  );
}

// ── 3. O ESPALHAMENTO, QUE É UM DEFEITO JÁ PAGO ────────────────────────────
//
// A primeira versão da rota enumerava campo por campo e esqueceu `need`,
// `steps` e `safety`. Chegavam `undefined` no aparelho e TODA aula derrubava o
// app ao abrir. O espalhamento faz campo novo entrar sozinho no payload.
{
  conferir(
    "a rota espalha a aula inteira antes de trocar os campos de texto",
    /saida\.push\(\{\s*\.\.\.a,/.test(rota),
    "enumerar campo a campo foi o que fez toda aula derrubar o app; campo novo em Lesson tem que entrar sozinho",
  );
  conferir(
    "e o tipo do payload é DERIVADO do tipo da aula, não escrito à mão",
    /Omit<Aula, "title" \| "body" \| "need" \| "steps" \| "safety" \| "stepsByLevel">/.test(cliente),
    "tipo escrito à mão deixa campo novo sumir calado em vez de virar erro de compilação",
  );
}

// ── 4. AS AULAS MAIS VISTAS SÃO MEDIDA, NÃO FATIA DO BANCO ─────────────────
//
// O achado de código desta varredura. `montarPopulares` lia `funil_eventos` com
// `.limit(5000)` e SEM ORDEM, e um limite sem ordem devolve um pedaço escolhido
// pelo banco. Enquanto couber no teto, tanto faz; passando dele, "o que mais
// gente acessa" no Início passa a ser o ranking de uma fatia arbitrária, sem
// aviso nenhum. É a doença de 28/10, quando uma janela de oito dias fabricou um
// salto que por semana de calendário não existia.
//
// TAMANHO MEDIDO EM 11/11, para não parecer urgente: o retrato daquele dia dá
// 389 eventos de `viu_aula` na semana mais cheia das quatro, ou seja algo entre
// mil e mil e quatrocentos em 30 dias, contra o teto de 5.000. Desarmado hoje
// pelo volume. O que muda a conta é o ritmo novo de uma aula por semana.
{
  conferir(
    "a leitura das mais vistas é ordenada, senão o teto devolve fatia arbitrária",
    /\.order\("criado_em", \{ ascending: false \}\)[\s\S]{0,40}\.limit\(5000\)/.test(rota),
    "limite sem ordem = ranking de um pedaço que o banco escolhe; com a ordem, passar do teto é uma definição honesta (os 5.000 mais recentes)",
  );
  conferir(
    "sem banco, as mais vistas voltam VAZIAS e não inventam aula",
    /if \(!admin\) return \[\];/.test(rota) && /if \(error \|\| !data\) return \[\];/.test(rota),
    "ausência de medida virando lista escolhida à mão é o zero estrutural desta casa",
  );
  conferir(
    "e conta APARELHOS distintos por aula, não eventos",
    /porAula\.get\(r\.origem\)!\.add\(r\.anon_id \?\? ""\)/.test(rota),
    "contar eventos deixaria uma pessoa que reabre a mesma aula dez vezes decidir o ranking de todo mundo",
  );
}

// ── 5. O INTERRUPTOR DESLIGA DE VERDADE ────────────────────────────────────
//
// Desligar o remoto sem apagar o guardado deixaria o aparelho que já baixou
// seguindo com um catálogo que a casa decidiu não usar mais. Foi por isto que o
// interruptor existiu durante o envio à App Store.
{
  conferir(
    "desligar o remoto apaga o pacote guardado no aparelho",
    /if \(!REMOTO_LIGADO\)[\s\S]{0,200}removeItem\(CHAVE\)/.test(cliente),
    "sem isto, quem já baixou continua com o catálogo que desligamos",
  );
  conferir(
    "e o instantâneo também respeita o interruptor",
    /if \(!REMOTO_LIGADO \|\| typeof window === "undefined"\) return null;/.test(cliente),
    "o interruptor tem que valer em todos os caminhos de leitura, não só na assinatura",
  );
}

// ── 6. A VERSÃO É RESUMO DO CONTEÚDO, E O APP NÃO REESCREVE À TOA ──────────
{
  conferir(
    "a versão é hash do próprio conteúdo",
    /createHash\("sha1"\)\.update\(JSON\.stringify\(\{ lessons, courses, populares \}\)\)/.test(rota),
    "versão que não deriva do conteúdo faz o app reescrever o catálogo sem motivo, ou pior, não reescrever quando devia",
  );
  conferir(
    "e o app pula a regravação quando a versão não mudou",
    /if \(memoria\?\.version === p\.version\) return;/.test(cliente),
    "sem isto cada abertura reescreve o localStorage com o mesmo pacote",
  );
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) do catálogo remoto reprovaram.`);
  process.exit(1);
}
console.log(
  "Catálogo remoto: pacote torto não sobrepõe o embutido, aula agendada não viaja,\n" +
    "as mais vistas saem de leitura ordenada e o interruptor apaga o que guardou.",
);
