// O que o motorista pergunta ao Biela sai legível, ou sai medindo a nossa tela?
//
// POR QUE ISTO EXISTE (29/09/2026), e o pedido é do dono: "vamos começar a
// usar as perguntas, relevante para conseguirmos entender melhor nossos
// usuários". A tabela contava 46 perguntas e não dizia nada sobre elas.
//
// O QUE ESTA CONFERÊNCIA PROTEGE:
//   1. atalho da tela NÃO conta como demanda. Das 24 perguntas que a casa tem
//      em texto, OITO são o primeiro dos quatro atalhos. Somadas às digitadas,
//      fariam "freios" parecer o que mais aflige o motorista, quando o número
//      mede a ordem dos botões que nós mesmos pusemos na tela;
//   2. a lista de atalhos acompanha o `content.ts`. Atalho novo na tela que
//      esta régua não conheça vira "livre", ou seja, vira demanda inventada;
//   3. o tema sai das palavras da PESSOA, e não do molde que a tela põe em
//      volta nem do nome do carro dela;
//   4. os casos reais que já estão no banco continuam classificados certo,
//      inclusive o do painel, que nasceu com erro de digitação;
//   5. o retrato PUBLICA o quadro e a ressalva, senão a régua existe e
//      ninguém usa, que é o defeito da semana inteira;
//   6. a rota grava as etiquetas, e o texto NÃO. A política de privacidade
//      promete que o texto só fica guardado quando a pessoa vota, e regra de
//      privacidade que só existe no comentário é regra que a próxima rodada
//      apaga sem perceber.
//
// Rode com: npm run conferir:perguntas
import { readFileSync } from "node:fs";
import {
  ATALHOS_DA_TELA,
  ETIQUETA_DESDE,
  MINIMO_PARA_LER_TEMA,
  lerPergunta,
  linhaDePerguntas,
  normaliza,
  origemDaPergunta,
  quadroDeTemas,
  temaDaPergunta,
  textoDaPessoa,
} from "../lib/biela/perguntaLida.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

console.log("Biela: a pergunta vira tema sem virar medida da nossa própria tela?");

// ── 1. OS ATALHOS DA TELA, LIDOS DO CONTENT.TS ──────────────────────────────
//
// A lista do script é o MÍNIMO exigido, e a fonte da verdade é o `content.ts`.
// Lição de 07/09/2026: conferência que compara a lista escrita à mão contra o
// código só pega falta, nunca sobra, e um atalho novo na tela passaria por
// fora dela inteira virando "pergunta livre".
{
  const content = readFileSync(new URL("../lib/app/content.ts", import.meta.url), "utf8");
  const bloco = content.match(/suggestions:\s*\[([\s\S]*?)\]/);
  conferir("achei o bloco de atalhos no content.ts", !!bloco, "se o nome mudou, esta conferência ficou cega");
  const frases = [...(bloco?.[1] ?? "").matchAll(/T\(\s*"([^"]+)"\s*,\s*"([^"]+)"/g)].flatMap((m) => [m[1]!, m[2]!]);
  conferir("o content.ts tem atalhos declarados", frases.length >= 8, `achei ${frases.length}`);
  for (const f of frases) {
    conferir(
      `o atalho "${f.slice(0, 40)}" é reconhecido como atalho`,
      origemDaPergunta(f) === "sugerida",
      `saiu como ${origemDaPergunta(f)}; atalho não reconhecido vira demanda inventada`,
    );
  }
  conferir(
    "e a lista da régua não inventa atalho que a tela não tem",
    ATALHOS_DA_TELA.every((a) => frases.some((f) => normaliza(f) === a)),
    `sobrando: ${ATALHOS_DA_TELA.filter((a) => !frases.some((f) => normaliza(f) === a)).join(" | ")}`,
  );
}

// ── 2. O MOLDE DA TELA DE SINTOMA ───────────────────────────────────────────
//
// `components/app/screens/Symptoms.tsx` monta "Meu {Carro} está com: {X}. O
// que pode ser e o que devo fazer?". O tema tem de sair do X.
{
  const p = "Meu Prisma (2012, 172.100 km) está com: Perda de força. O que pode ser e o que devo fazer?";
  conferir("a pergunta de sintoma é reconhecida", origemDaPergunta(p) === "sintoma", origemDaPergunta(p));
  conferir("e o miolo é só o que a pessoa marcou", textoDaPessoa(p) === "perda de forca", textoDaPessoa(p));
  conferir("o tema vem do miolo", temaDaPergunta(p) === "motor", temaDaPergunta(p));

  // O NOME DO CARRO NÃO PODE DECIDIR O TEMA, e o caso não é hipotético:
  // "Turbo" está no nome de meia dúzia de versões que se vendem no Brasil
  // (Onix Plus Turbo, Creta 1.0 Turbo, Compass Turbo Diesel), e `turbo` é
  // palavra de MOTOR nesta régua. Lida a frase inteira, "Meu Onix Turbo está
  // com: os vidros não sobem" vira problema de motor.
  //
  // ESTA LINHA NASCEU DE DOIS DEFEITOS PLANTADOS QUE NÃO MORDERAM, e os dois
  // erros foram meus, na escolha do caso:
  //
  //   1º o primeiro caso usava um Freemont para casar com "frear". Não casa:
  //      frear tem A, Freemont tem O;
  //   2º o segundo usou Turbo com um miolo de vidro elétrico. Também não
  //      mordeu, porque `eletrica` é testada ANTES de `motor`, então o miolo
  //      ganhava de qualquer jeito e a régua parecia certa por acaso.
  //
  // O caso que morde é o miolo SEM tema nenhum, que é o mais comum de todos:
  // aí não há nada para disputar com o "turbo" do nome, e a pergunta de uma
  // pessoa que sente cheiro estranho vira "problema de motor". Caso de teste
  // escolhido de cabeça só prova o que já se acreditava.
  const semTema = "Meu Onix Turbo 2023 está com: um cheiro estranho dentro do carro. O que pode ser e o que devo fazer?";
  conferir(
    "o nome do carro não sequestra o tema quando o miolo não tem tema",
    temaDaPergunta(semTema) === "outro",
    `${temaDaPergunta(semTema)}; o molde tem de ser descascado antes de procurar palavra`,
  );
  const carro = "Meu Onix Turbo 2023 está com: os vidros não sobe e nem desce. O que pode ser e o que devo fazer?";
  conferir("e o miolo com tema continua mandando", temaDaPergunta(carro) === "eletrica", temaDaPergunta(carro));
}

// ── 3. OS CASOS REAIS DO BANCO ──────────────────────────────────────────────
//
// Todos estavam em `biela_votos` em 29/09/2026. Ficam aqui porque foram eles
// que calibraram a ordem dos temas, e mudar a ordem sem rodar isto é como
// mexer numa régua sem conferir onde ela encosta.
{
  const casos: [string, string, string][] = [
    ["Que barulho pode ser esse ao frear?", "sugerida", "freios"],
    ["Posso lavar o motor do carro", "livre", "limpeza"],
    ["os vidros não sobe e nem desce", "livre", "eletrica"],
    ["Quantos litros de gasolina meu gol pega", "livre", "combustivel"],
    ["Volante tremendo a 100km", "livre", "direcao"],
    ["Quando devo trocar a correia?", "sugerida", "motor"],
    ["Esse orçamento está caro?", "sugerida", "orcamento"],
    ["Como faço a revisão em dia?", "sugerida", "manutencao"],
    ["O que o manual do meu carro fala sobre a calibragem do pneu, eu estou com", "livre", "pneus"],
    ["Ok", "continuacao", "outro"],
  ];
  for (const [texto, origem, tema] of casos) {
    const lida = lerPergunta(texto);
    conferir(`"${texto.slice(0, 38)}" -> ${origem}`, lida.origem === origem, lida.origem);
    conferir(`"${texto.slice(0, 38)}" -> ${tema}`, lida.tema === tema, lida.tema);
  }

  // O CASO DO PAINEL, e ele nasceu de um erro de digitação REAL: "meu marcado
  // de combustível e a temperatura não esta funcionando". Com a palavra
  // inteira ("marcador"), a régua lia "temperatura" e mandava para
  // arrefecimento, que é o sistema errado. Quem escreve para o Biela está com
  // o carro na rua, não revisando o texto.
  const painel = "meu marcado de combustível e a temperatura não esta funcionando não consigo resolver";
  conferir("o painel com erro de digitação vai para elétrica", temaDaPergunta(painel) === "eletrica", temaDaPergunta(painel));
}

// ── 4. O QUADRO SEPARA ATALHO DE PALAVRA DA PESSOA ──────────────────────────
//
// É a razão de a coluna `origem` existir. Sem a separação, oito toques no
// primeiro botão da tela viram "o motorista brasileiro se preocupa com freio".
{
  const perguntas = [
    ...Array.from({ length: 8 }, () => ({ origem: "sugerida", tema: "freios" })),
    { origem: "livre", tema: "eletrica" },
    { origem: "livre", tema: "combustivel" },
    { origem: "sintoma", tema: "motor" },
    { origem: "continuacao", tema: "outro" },
  ];
  const q = quadroDeTemas(perguntas);
  conferir("o atalho NÃO entra na conta da pessoa", !q.daPessoa.some((t) => t.tema === "freios"), JSON.stringify(q.daPessoa));
  conferir("e aparece separado, no quadro de atalho", q.deAtalho[0]?.tema === "freios" && q.deAtalho[0]?.total === 8, JSON.stringify(q.deAtalho));
  conferir("a continuação não vira demanda", !q.daPessoa.some((t) => t.tema === "outro"), JSON.stringify(q.daPessoa));
  conferir("o total conta tudo", q.total === 12, String(q.total));
  conferir("e a origem fica visível", q.porOrigem.sugerida === 8 && q.porOrigem.livre === 2, JSON.stringify(q.porOrigem));
}

// ── 5. A FRASE DO RETRATO DIZ QUANDO NÃO DÁ PARA LER ────────────────────────
{
  const poucas = quadroDeTemas([
    { origem: "livre", tema: "eletrica" },
    ...Array.from({ length: 30 }, () => ({ origem: "sugerida", tema: "freios" })),
  ]);
  const l = linhaDePerguntas(poucas, "2026-09-30");
  conferir("com 1 pergunta da pessoa o ranking NÃO é legível", l.legivel === false, l.motivo);
  conferir("e a frase diz que atalho não é demanda", /atalho NAO e demanda/.test(l.texto), l.texto);
  conferir("e marca o número como PISO", /PISO/.test(l.texto), l.texto);

  const muitas = quadroDeTemas(
    Array.from({ length: MINIMO_PARA_LER_TEMA }, (_, i) => ({ origem: "livre", tema: i % 2 ? "freios" : "motor" })),
  );
  conferir("no mínimo, passa a ser legível", linhaDePerguntas(muitas, "2026-09-30").legivel === true);

  const vazio = linhaDePerguntas(quadroDeTemas([]), "2026-09-30");
  conferir("sem nenhuma etiqueta, diz desde quando grava", vazio.legivel === false && vazio.texto.includes(ETIQUETA_DESDE), vazio.texto);

  // AS LINHAS ANTIGAS PRECISAM APARECER COMO ANTIGAS.
  //
  // Na primeira execução de verdade a frase saiu "50 em 30 dias, 1 com
  // palavras da pessoa e 0 de atalho": os três números certos e a frase
  // enganando, porque 49 eram de antes de a etiqueta existir. Quem lesse
  // rápido concluiria que quase ninguém escreve as próprias perguntas.
  const comVelhas = quadroDeTemas([
    { origem: "livre", tema: "motor" },
    ...Array.from({ length: 49 }, () => ({ origem: null, tema: null })),
  ]);
  const l2 = linhaDePerguntas(comVelhas, "2026-09-30");
  conferir("a fatia sem etiqueta é dita", /49 ainda SEM ETIQUETA/.test(l2.texto), l2.texto);
  conferir("e diz que ela não cresce mais", /nao cresce mais/.test(l2.texto), l2.texto);
  conferir(
    "e as antigas NÃO viram atalho nem palavra da pessoa",
    /1 com palavras da pessoa e 0 de atalho/.test(l2.texto),
    l2.texto,
  );
}

// ── 6. O RETRATO PUBLICA, E A ROTA GRAVA A ETIQUETA E NÃO O TEXTO ───────────
{
  const operacao = readFileSync(new URL("../lib/operacao.ts", import.meta.url), "utf8");
  conferir("o retrato publica o quadro do Biela", /biela: \{/.test(operacao));
  conferir("e a frase pronta", /linha: linhaDePerguntas\(/.test(operacao));
  conferir("e o aviso de que não existe voto negativo", /semNegativo/.test(operacao));

  const rota = readFileSync(new URL("../app/api/biela/route.ts", import.meta.url), "utf8");
  const semComentarios = rota.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  conferir("a rota grava origem e tema", /origem,/.test(semComentarios) && /tema,/.test(semComentarios));
  conferir(
    "a rota NÃO grava o texto da pergunta em biela_perguntas",
    !/pergunta:\s*question/.test(semComentarios),
    "a politica de privacidade promete que o texto so fica quando a pessoa vota; mudar isso e decisao do dono",
  );
  conferir(
    "a pergunta de quem é Premium também é gravada",
    /if \(admin\) \{/.test(semComentarios),
    "sem isso o quadro mede a curiosidade de quem ainda nao pagou e chama de 'nossos usuarios'",
  );
  conferir(
    "e a contagem do limite gratuito filtra premium",
    /\.eq\("premium", false\)/.test(semComentarios),
    "sem o filtro, quem cancelar o Premium herda as proprias perguntas como se fossem do mes gratis",
  );
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) das perguntas reprovaram.`);
  process.exit(1);
}
console.log("Biela: atalho separado de palavra da pessoa, tema pelo miolo, e o retrato publica com a ressalva.");
