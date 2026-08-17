// Conversa com a Biela: guardar no aparelho e recortar o que vai para a IA.
//
// A tela do chat vive num `useState` dentro do componente, e o Shell monta uma
// tela por vez — sair da Biela desmontava o componente e a conversa sumia. Aqui
// ela passa a sobreviver à navegação e a fechar o app.
//
// Fica em chave PRÓPRIA do localStorage, de propósito: o `Session` inteiro é
// reenviado para o `user_state` a cada alteração (store.tsx), então guardar o
// transcript lá dentro faria cada mensagem digitada virar um upsert do objeto
// todo — e a conversa passaria a seguir o login entre aparelhos. Conversa é
// coisa do aparelho.

export type Msg = {
  role: "user" | "biela";
  text: string;
  note?: string;
  // Guardados na mensagem para o voto poder mandar o contexto exato daquela
  // resposta — e não o estado da tela no instante do polegar, que já mudou.
  pergunta?: string;
  modo?: string;
  comManual?: boolean;
  // O polegar mora na mensagem, não num mapa por índice: assim ele sobrevive ao
  // recorte (que desloca os índices) e a pessoa não vota duas vezes na mesma
  // resposta só porque saiu da tela e voltou.
  voto?: "up" | "down";
};

const CHAVE = "mentorque-biela-chat";

// Quinze interações = quinze pares pergunta+resposta. Sem teto o item cresce
// sem limite e um dia estoura a cota do localStorage — que falha calada e
// derruba o `mentorque-garage` junto, porque dividem o mesmo armazenamento.
export const LIMITE_TURNOS = 15;

// Quantos pares a IA recebe de volta. Menor que o que a tela mostra porque são
// coisas diferentes: a tela é memória do usuário (barata), isto é contexto que
// se paga por token em toda pergunta seguinte.
export const TURNOS_PARA_IA = 3;

type Arquivo = { v: 1; conversas: Record<string, Msg[]> };

// Sem carro cadastrado a conversa ainda precisa de um lugar.
export const idConversa = (idVeiculo: string | null | undefined) => idVeiculo ?? "sem-carro";

function ler(): Arquivo {
  if (typeof window === "undefined") return { v: 1, conversas: {} };
  try {
    const cru = window.localStorage.getItem(CHAVE);
    if (!cru) return { v: 1, conversas: {} };
    const dado = JSON.parse(cru) as Arquivo;
    if (dado?.v !== 1 || typeof dado.conversas !== "object" || !dado.conversas) return { v: 1, conversas: {} };
    return dado;
  } catch {
    // JSON torto ou armazenamento bloqueado: a conversa antiga não vale uma
    // tela quebrada.
    return { v: 1, conversas: {} };
  }
}

function escrever(arq: Arquivo) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(arq));
  } catch {
    // Cota estourada é o caso real aqui. Descartar as conversas todas e gravar
    // só a atual é melhor que deixar a escrita falhar para sempre.
    try {
      window.localStorage.setItem(CHAVE, JSON.stringify({ v: 1, conversas: {} } satisfies Arquivo));
    } catch { /* armazenamento indisponível: segue sem persistir */ }
  }
}

// Mantém as últimas N interações. Conta em PARES para o recorte nunca começar
// numa resposta órfã, sem a pergunta que a gerou logo acima.
function recortar(msgs: Msg[]): Msg[] {
  return msgs.slice(-LIMITE_TURNOS * 2);
}

// A saudação NÃO é guardada: ela é remontada na tela a cada abertura, a partir
// do idioma atual. Guardá-la deixaria a conversa em português no topo de um app
// que a pessoa acabou de passar para inglês.
export function carregarConversa(id: string): Msg[] {
  return recortar(ler().conversas[id] ?? []);
}

// `idsVivos` limpa conversas de carros que já foram removidos da garagem —
// senão elas ficariam ocupando espaço para sempre, sem tela que as alcance.
export function salvarConversa(id: string, msgs: Msg[], idsVivos?: string[]) {
  const arq = ler();
  const conversas: Record<string, Msg[]> = {};
  for (const [chave, valor] of Object.entries(arq.conversas)) {
    if (chave === id) continue;
    if (idsVivos && chave !== "sem-carro" && !idsVivos.includes(chave)) continue;
    conversas[chave] = valor;
  }
  const recortada = recortar(msgs);
  if (recortada.length > 0) conversas[id] = recortada;
  escrever({ v: 1, conversas });
}

export function limparConversa(id: string) {
  const arq = ler();
  delete arq.conversas[id];
  escrever(arq);
}

// O que a Biela recebe de volta como memória.
//
// Regras: só pares completos (a API exige alternância user → assistant), nada
// de respostas em modo básico/offline (são texto enlatado — reenviá-las ensina
// a Biela a repetir o enlatado) e teto por mensagem, para uma pergunta enorme
// não arrastar o custo de todas as seguintes.
export function historicoParaIA(msgs: Msg[]): { role: "user" | "assistant"; content: string }[] {
  const pares: { role: "user" | "assistant"; content: string }[][] = [];
  for (let i = 0; i < msgs.length - 1; i++) {
    const p = msgs[i];
    const r = msgs[i + 1];
    if (p.role !== "user" || r.role !== "biela") continue;
    if (r.modo && r.modo !== "ai") continue;
    const pergunta = p.text.trim().slice(0, 500);
    const resposta = r.text.trim().slice(0, 1500);
    if (!pergunta || !resposta) continue;
    pares.push([
      { role: "user", content: pergunta },
      { role: "assistant", content: resposta },
    ]);
  }
  return pares.slice(-TURNOS_PARA_IA).flat();
}
