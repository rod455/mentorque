"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { apiUrl } from "@/lib/app/apiBase";
import { newId, type ServiceRecord, type Vehicle } from "./types";
import { useAuth } from "./auth";
import { getBrowserSupabase } from "@/lib/supabaseBrowser";
import { trackContent } from "./track";

// Client-side session for the car-centric prototype: a garage of vehicles, one
// "active" vehicle, and a flat list of service records. Persisted to
// localStorage so a refresh keeps the whole garage.

type Session = {
  onboarded: boolean;
  name: string | null;
  email: string | null;
  state: string | null; // UF (ex.: "SP") — usada no ajuste regional de preços
  city: string | null; // cidade — cidades grandes têm faixa de preço própria
  premium: boolean;
  vehicles: Vehicle[];
  activeVehicleId: string | null;
  services: ServiceRecord[];
  claimedMilestones: string[]; // badges the user marks by hand
  momentPhotos: Record<string, string>; // momento id → foto (data URL)
  seenLessons: string[]; // aulas concluídas pelo usuário
  savedLessons: string[]; // aulas salvas para ver depois
  pinnedLessons: string[]; // conteúdos fixados na Home (abaixo do carro)
  reminders: string[]; // lembretes de revisão: "vehicleId:itemKey"
  startedAt: string | null; // primeiro dia no app (para marcos de tempo)
  notifications: boolean; // preferência de notificações
  units: "metric" | "imperial"; // preferência de unidades
  avatar: string | null; // foto de perfil (data URL), sobrepõe a do Google
  // Histórico do pedido de nota. Mora na sessão de propósito: sair da conta
  // limpa o aparelho inteiro, então guardar só no armazenamento local faria a
  // pergunta voltar a cada login e a cada reinstalação — exatamente o que as
  // janelas de espera existem para evitar. Aqui ele sobe junto para
  // `user_state` e volta no próximo login, em qualquer aparelho.
  feedback?: FeedbackState;
};

/** Em que pé está a volta do checkout. `null` = não veio de lá. */
export type EstadoCheckout = null | "confirmando" | "liberado" | "demorou";

export type FeedbackState = {
  perguntadoEm: string | null; // último pedido (ISO yyyy-mm-dd)
  respondidoEm: string | null; // última resposta (ISO); null = fechou sem responder
  nota: number | null; // 1..5 da última resposta
  foiParaLoja: boolean; // tocou no botão que abre a ficha da loja
};

const EMPTY: Session = {
  onboarded: false,
  name: null,
  email: null,
  state: null,
  city: null,
  premium: false,
  vehicles: [],
  activeVehicleId: null,
  services: [],
  claimedMilestones: [],
  momentPhotos: {},
  seenLessons: [],
  savedLessons: [],
  pinnedLessons: [],
  reminders: [],
  startedAt: null,
  notifications: false,
  units: "metric",
  avatar: null,
  feedback: undefined,
};

// Today as yyyy-mm-dd (client-side only).
function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

const STORAGE_KEY = "mentorque-garage";

// De QUEM é o estado guardado neste aparelho.
//
// O armazenamento local é do aparelho, não da conta — e sem essa marca não há
// como distinguir "trabalho que um convidado fez e merece ser levado para a
// conta" de "dados da conta anterior que usou este celular". O merge tratava os
// dois igual, e carros de uma conta apareciam dentro de outra.
const DONO_KEY = "mentorque-garage-owner";

// O que está gravado NESTE aparelho, lido direto. Serve de rede de segurança
// para o login: `commit` escreve aqui a cada mudança, então é a versão
// persistida do que o convidado fez.
function lerDoAparelho(): Session {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem("mentorque-proto");
    return raw ? migrate(JSON.parse(raw)) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function lerDono(): string | null {
  try { return window.localStorage.getItem(DONO_KEY); } catch { return null; }
}
function gravarDono(id: string | null): void {
  try {
    if (id) window.localStorage.setItem(DONO_KEY, id);
    else window.localStorage.removeItem(DONO_KEY);
  } catch { /* modo privado: sem marca, o merge cai no caminho conservador */ }
}

type StoreValue = {
  s: Session;
  // Carros feitos como convidado esperando o dono decidir se entram na conta.
  importacaoPendente: ImportacaoPendente | null;
  resolverImportacao: (ids: string[]) => void;
  /** Volta do checkout: a tela mostra o que está acontecendo. */
  checkoutVoltando: EstadoCheckout;
  fecharAvisoCheckout: () => void;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setState: (state: string) => void;
  setCity: (city: string) => void;
  setPremium: (v: boolean) => void;
  addVehicle: (v: Omit<Vehicle, "id">) => string;
  updateVehicle: (id: string, patch: Partial<Vehicle>) => void;
  removeVehicle: (id: string) => void;
  setActiveVehicle: (id: string) => void;
  addService: (rec: Omit<ServiceRecord, "id">) => string;
  updateService: (id: string, patch: Partial<ServiceRecord>) => void;
  removeService: (id: string) => void;
  toggleMilestone: (id: string) => void;
  markLessonSeen: (id: string) => void; // alterna concluído/não concluído
  toggleLessonSaved: (id: string) => void; // alterna salvo para ver depois
  toggleLessonPinned: (id: string) => void; // alterna fixado na Home
  moveLessonPinned: (id: string, delta: -1 | 1) => void; // sobe/desce um fixado
  toggleReminder: (vehicleId: string, itemKey: string) => void; // lembrete de revisão
  setMomentPhoto: (id: string, dataUrl: string | null) => void;
  setNotifications: (v: boolean) => void;
  setUnits: (v: "metric" | "imperial") => void;
  setAvatar: (dataUrl: string | null) => void;
  patchFeedback: (parte: Partial<FeedbackState>) => void; // registra o pedido de nota
  subscribed: boolean; // assinatura Stripe ativa (fonte da verdade do premium)
  subscriptionEndsAt: string | null; // fim do período atual (ISO)
  subscriptionCanceling: boolean; // marcada para cancelar no fim do período
  refreshSubscription: () => void;
  finishOnboarding: () => void;
  reset: () => void;
};

const Ctx = createContext<StoreValue | null>(null);

// Migrate the old single-vehicle shape (mentorque-proto) if present.
function migrate(parsed: any): Session {
  if (parsed && Array.isArray(parsed.vehicles)) {
    const sess = { ...EMPTY, ...parsed } as Session;
    if (!Array.isArray(sess.claimedMilestones)) sess.claimedMilestones = [];
    if (!sess.momentPhotos || typeof sess.momentPhotos !== "object") sess.momentPhotos = {};
    if (!Array.isArray(sess.seenLessons)) sess.seenLessons = [];
    if (!Array.isArray(sess.savedLessons)) sess.savedLessons = [];
    if (!Array.isArray(sess.pinnedLessons)) sess.pinnedLessons = [];
    if (!Array.isArray(sess.reminders)) sess.reminders = [];
    if (!sess.startedAt) sess.startedAt = todayISO();
    return sess;
  }
  const next: Session = { ...EMPTY };
  next.startedAt = parsed?.startedAt ?? todayISO();
  if (parsed?.vehicle) {
    const id = newId();
    next.vehicles = [{ id, ...parsed.vehicle, odometerKm: parsed.odometerKm ?? undefined, photo: parsed.photo ?? undefined }];
    next.activeVehicleId = id;
    if (parsed.lastService) {
      next.services = [{ id: newId(), vehicleId: id, type: "revision", date: parsed.lastService.date, km: parsed.lastService.km, parts: [], notes: parsed.lastService.notes }];
    }
  }
  next.name = parsed?.name ?? null;
  next.email = parsed?.email ?? null;
  next.state = parsed?.state ?? null;
  next.premium = !!parsed?.premium;
  next.onboarded = !!parsed?.onboarded && next.vehicles.length > 0;
  return next;
}

// Union two lists of entities by id (keeps items from both, cloud winning ties).
function mergeById<T extends { id: string }>(cloud: T[], local: T[]): T[] {
  const map = new Map<string, T>();
  for (const x of [...(local ?? []), ...(cloud ?? [])]) map.set(x.id, x);
  return [...map.values()];
}
// Merge cloud + local so logging in never loses guest work: cloud scalars win
// when set, but local-only vehicles/services are kept.
// Exportada para poder ser testada sozinha: são regras de correção de DADOS
// (quem fica com o Premium, qual carro fica ativo) e quebrar qualquer uma delas
// é invisível na tela até alguém perder trabalho ou ganhar assinatura de graça.
export function mergeSessions(cloud: Session, local: Session): Session {
  return {
    onboarded: !!cloud.onboarded || !!local.onboarded,
    name: cloud.name ?? local.name,
    email: cloud.email ?? local.email,
    state: cloud.state ?? local.state,
    city: cloud.city ?? local.city,
    // Premium vem SÓ da nuvem. Antes era `cloud || local`, e a marca gravada no
    // aparelho vazava para a conta seguinte: quem entrasse com um e-mail novo
    // num aparelho onde alguém já fora assinante nascia Premium sem ter pago.
    // Assinatura pertence à conta, não ao aparelho.
    premium: !!cloud.premium,
    vehicles: mergeById(cloud.vehicles ?? [], local.vehicles ?? []),
    // O carro ATIVO é o local, quando existe.
    //
    // A nuvem ganhando aqui era o que fazia os serviços "sumirem" ao entrar na
    // conta: as telas listam o histórico do carro ativo, então trocar o carro
    // debaixo do usuário esconde tudo o que ele acabou de cadastrar. Nada era
    // perdido — os dois carros e os dois históricos seguem na garagem —, mas do
    // lado de cá é indistinguível de perda de dados.
    activeVehicleId: local.activeVehicleId ?? cloud.activeVehicleId ?? null,
    services: mergeById(cloud.services ?? [], local.services ?? []),
    claimedMilestones: [...new Set([...(cloud.claimedMilestones ?? []), ...(local.claimedMilestones ?? [])])],
    momentPhotos: { ...(local.momentPhotos ?? {}), ...(cloud.momentPhotos ?? {}) },
    seenLessons: [...new Set([...(cloud.seenLessons ?? []), ...(local.seenLessons ?? [])])],
    savedLessons: [...new Set([...(cloud.savedLessons ?? []), ...(local.savedLessons ?? [])])],
    pinnedLessons: [...new Set([...(cloud.pinnedLessons ?? []), ...(local.pinnedLessons ?? [])])],
    reminders: [...new Set([...(cloud.reminders ?? []), ...(local.reminders ?? [])])],
    startedAt: [cloud.startedAt, local.startedAt].filter(Boolean).sort()[0] ?? todayISO(),
    notifications: cloud.notifications ?? local.notifications ?? false,
    units: cloud.units ?? local.units ?? "metric",
    avatar: cloud.avatar ?? local.avatar ?? null,
    feedback: mergeFeedback(cloud.feedback, local.feedback),
  };
}

// O que o convidado fez NESTE APARELHO e a conta ainda não tem.
//
// Só entra aqui o que é inequivocamente do usuário e some se ninguém decidir:
// carros, o histórico deles e os lembretes deles. Aula lida, marco e
// preferência continuam se somando sozinhos — somar isso não confunde ninguém
// nem deixa lixo na garagem, e perguntar sobre cada aula seria absurdo.
export type ImportacaoPendente = {
  veiculos: Vehicle[];
  servicos: ServiceRecord[];
  lembretes: string[];
};

function daGaragemDoConvidado(cloud: Session, local: Session): ImportacaoPendente | null {
  const naNuvem = new Set((cloud.vehicles ?? []).map((v) => v.id));
  const veiculos = (local.vehicles ?? []).filter((v) => !naNuvem.has(v.id));
  if (!veiculos.length) return null;
  const ids = new Set(veiculos.map((v) => v.id));
  return {
    veiculos,
    servicos: (local.services ?? []).filter((r) => ids.has(r.vehicleId)),
    // Lembrete é "vehicleId:itemKey" — vai junto com o carro dele.
    lembretes: (local.reminders ?? []).filter((r) => ids.has(r.split(":")[0])),
  };
}

// A sessão local SEM o que está esperando decisão: é ela que entra no merge,
// para a conta nunca mostrar carro que o dono ainda não aprovou.
function semOsPendentes(local: Session, p: ImportacaoPendente): Session {
  const ids = new Set(p.veiculos.map((v) => v.id));
  return {
    ...local,
    vehicles: (local.vehicles ?? []).filter((v) => !ids.has(v.id)),
    services: (local.services ?? []).filter((r) => !ids.has(r.vehicleId)),
    reminders: (local.reminders ?? []).filter((r) => !ids.has(r.split(":")[0])),
    // Carro ativo que não entrou não pode seguir apontado: a Home abriria
    // lendo um carro que não está na garagem.
    activeVehicleId: local.activeVehicleId && ids.has(local.activeVehicleId) ? null : local.activeVehicleId,
  };
}

// Feedback: junta pelo lado mais RESTRITIVO, não pelo mais recente.
//
// Aqui o `||` é seguro, ao contrário do que aconteceu com o premium: lá ele
// concedia um benefício e por isso vazava entre contas; aqui ele só cala o app.
// Na dúvida entre perguntar e não perguntar, não perguntar é o erro barato.
function mergeFeedback(cloud?: FeedbackState, local?: FeedbackState): FeedbackState | undefined {
  if (!cloud) return local;
  if (!local) return cloud;
  // A data mais recente manda: é a que adia mais o próximo pedido.
  const maisNovo = (a: string | null, b: string | null) => [a, b].filter(Boolean).sort().pop() ?? null;
  const recente = (cloud.respondidoEm ?? "") >= (local.respondidoEm ?? "") ? cloud : local;
  return {
    perguntadoEm: maisNovo(cloud.perguntadoEm, local.perguntadoEm),
    respondidoEm: maisNovo(cloud.respondidoEm, local.respondidoEm),
    nota: recente.nota ?? cloud.nota ?? local.nota ?? null,
    foiParaLoja: !!cloud.foiParaLoja || !!local.foiParaLoja,
  };
}

// Piso entre duas reconferências da assinatura ao trazer o app de volta.
// A diferença entre os dois está explicada no efeito que os usa.
const ESPERA_SEM_ASSINATURA = 60_000;
const ESPERA_COM_ASSINATURA = 6 * 60 * 60 * 1000;

export function PrototypeProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<Session>(EMPTY);
  const [sub, setSub] = useState<{ active: boolean; endsAt: string | null; canceling: boolean }>({ active: false, endsAt: null, canceling: false });
  const subActive = sub.active;
  const { user, ready: authReady } = useAuth();
  const supabase = getBrowserSupabase();
  const loadedFor = useRef<string | null>(null);
  const teveSessao = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [importacaoPendente, setImportacaoPendente] = useState<ImportacaoPendente | null>(null);
  // Espelho da sessão para ler o estado atual DEPOIS de um await, sem
  // depender de atualização funcional: o merge do login precisa comparar a
  // nuvem com o que existe no aparelho e decidir fora da fase de render.
  const sRef = useRef(s);
  useEffect(() => { sRef.current = s; }, [s]);

  // Reads the user's Stripe subscription from the `subscriptions` table.
  const refreshSubscription = useCallback(async () => {
    if (!user || !supabase) { setSub({ active: false, endsAt: null, canceling: false }); return; }
    const { data } = await supabase.from("subscriptions").select("status, current_period_end, cancel_at_period_end").eq("user_id", user.id).maybeSingle();
    setSub({
      active: !!data && ["active", "trialing"].includes(String(data.status)),
      endsAt: (data?.current_period_end as string | null) ?? null,
      canceling: !!data?.cancel_at_period_end,
    });
  }, [user, supabase]);

  useEffect(() => { refreshSubscription(); }, [refreshSubscription]);

  // Reconferir a assinatura toda vez que o app volta para a frente.
  //
  // Sem isto, o app só descobria mudança de assinatura quando o usuário
  // mudava, ou seja, praticamente só ao abrir do zero. Um app aberto nunca
  // reconferia nada, e daí saía a queixa de 25/08: o cliente comprou pelo
  // navegador com o app já aberto, o app continuou achando que ele era do
  // plano gratuito, e só liberou depois de fechar e abrir.
  //
  // Isso vale muito além do checkout. Cobre comprar num aparelho e usar em
  // outro, cancelar pelo site e voltar ao app, e o teste grátis virando
  // assinatura enquanto o app dorme em segundo plano.
  //
  // `visibilitychange` serve para os dois mundos: no navegador dispara ao
  // trocar de aba, e dentro do app das lojas a WebView dispara ao voltar do
  // segundo plano, no iPhone e no Android. Sem plugin nenhum.
  //
  // NÃO é uma varredura de tempo em tempo: nada roda com o app parado. Só
  // roda quando a pessoa TRAZ o app de volta, e as esperas abaixo são um piso
  // entre duas idas, não um relógio.
  //
  // A espera muda conforme o que pode ter mudado:
  //
  // - Sem assinatura ativa, a pessoa pode ter acabado de comprar no navegador
  //   ao lado ou em outro aparelho. Errar aqui é mostrar paywall para quem
  //   pagou, que é a queixa que originou tudo isso. Um minuto.
  //
  // - Com assinatura ativa, o que pode mudar é um cancelamento feito no site,
  //   e descobrir isso algumas horas depois não muda nada para ninguém: a
  //   pessoa segue com o acesso que ela pagou. Seis horas.
  //
  // Na prática isso é uma consulta por abertura para quem ainda não assina, e
  // no máximo quatro por dia para quem já assina.
  const ultimaConferida = useRef(0);
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!user) return;
    const aoVoltar = () => {
      if (document.visibilityState !== "visible") return;
      const espera = subActive ? ESPERA_COM_ASSINATURA : ESPERA_SEM_ASSINATURA;
      if (Date.now() - ultimaConferida.current < espera) return;
      ultimaConferida.current = Date.now();
      refreshSubscription();
    };
    document.addEventListener("visibilitychange", aoVoltar);
    return () => document.removeEventListener("visibilitychange", aoVoltar);
  }, [refreshSubscription, user, subActive]);

  // Volta do Stripe Checkout (/app?checkout=success).
  //
  // O QUE DEU ERRADO ANTES, e que um cliente pagou para descobrir em 25/08:
  // a versão anterior chamava `refreshSubscription()` logo depois de
  // sincronizar. Só que na volta do checkout a página recarrega do zero, e a
  // sessão do Supabase leva alguns segundos para ser restaurada. Nesse
  // intervalo `user` ainda é null, então a função capturada pelo efeito era a
  // versão "sem usuário", que simplesmente marca a assinatura como inativa. O
  // temporizador de 3s repetia a MESMA função velha. Quando a sessão enfim
  // resolvia, sobrava um único read; se ele demorasse um segundo, a pessoa já
  // tinha tocado em algo e batido no paywall.
  //
  // Foi exatamente isso: pagou 23:52:23, voltou 23:52:27, e às 23:52:34 viu o
  // paywall de novo e COMEÇOU UM SEGUNDO CHECKOUT. Quase pagou duas vezes.
  //
  // Agora: espera a sessão existir, sincroniza com o Stripe e PERGUNTA AO
  // BANCO até a assinatura aparecer, com teto de tempo. E, principalmente,
  // avisa a tela em que pé está, porque silêncio depois de pagar é o que faz
  // alguém pagar de novo.
  const [checkoutVoltando, setCheckoutVoltando] = useState<EstadoCheckout>(null);

  // Só lê o endereço e limpa. NÃO consome a informação antes da hora: o que
  // dispara o trabalho é o efeito seguinte, quando a sessão estiver de pé.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (!params.has("checkout")) return;
    window.history.replaceState({}, "", window.location.pathname);
    setCheckoutVoltando("confirmando");
  }, []);

  useEffect(() => {
    if (checkoutVoltando !== "confirmando") return;
    // Sem sessão restaurada não dá para ler a assinatura de ninguém. Espera.
    if (!authReady || !user || !supabase) return;
    let vivo = true;
    (async () => {
      // Estado autoritativo, direto do Stripe: não depende do webhook chegar.
      try {
        const token = (await supabase.auth.getSession()).data.session?.access_token;
        if (token) await fetch(apiUrl("/api/stripe/sync"), { method: "POST", headers: { authorization: `Bearer ${token}` } });
      } catch { /* segue: o banco ainda pode ter a linha pelo webhook */ }

      const limite = Date.now() + 30000;
      while (vivo) {
        const { data } = await supabase
          .from("subscriptions")
          .select("status, current_period_end, cancel_at_period_end")
          .eq("user_id", user.id)
          .maybeSingle();
        const ativa = !!data && ["active", "trialing"].includes(String(data.status));
        if (!vivo) return;
        if (ativa) {
          setSub({
            active: true,
            endsAt: (data?.current_period_end as string | null) ?? null,
            canceling: !!data?.cancel_at_period_end,
          });
          setCheckoutVoltando("liberado");
          return;
        }
        if (Date.now() > limite) {
          // Não some em silêncio: a tela explica o que fazer.
          setCheckoutVoltando("demorou");
          return;
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
    })();
    return () => { vivo = false; };
  }, [checkoutVoltando, authReady, user, supabase]);

  const fecharAvisoCheckout = useCallback(() => setCheckoutVoltando(null), []);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" && (window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem("mentorque-proto"));
      if (raw) setS(migrate(JSON.parse(raw)));
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  const commit = useCallback((next: Session) => {
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota errors */
    }
    return next;
  }, []);

  const patch = useCallback((fn: (prev: Session) => Session) => setS((prev) => commit(fn(prev))), [commit]);

  // On login: pull the user's cloud state and merge the local (guest) work into
  // it. Conta nova leva tudo; conta que já existe PERGUNTA antes (ver abaixo).
  useEffect(() => {
    if (!user || !supabase) { loadedFor.current = null; return; }
    if (loadedFor.current === user.id) return;
    loadedFor.current = user.id;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("user_state").select("data").eq("user_id", user.id).maybeSingle();
      if (cancelled) return;
      const cloud = (data?.data ?? null) as Session | null;
      // De quem era o que está guardado aqui. `null` = convidado: ninguém
      // logou neste aparelho desde a última limpeza, então o trabalho é de quem
      // está entrando agora.
      const dono = lerDono();
      const deOutraConta = dono !== null && dono !== user.id;
      gravarDono(user.id);

      // Estado de OUTRA conta não se mistura nem se oferece. Era isto que fazia
      // os carros de um usuário aparecerem na garagem de outro que entrasse no
      // mesmo aparelho: dados pessoais atravessando contas, e a vítima sem como
      // saber de onde vieram. Nada se perde — o dono anterior tem tudo na
      // nuvem dele.
      //
      // Vale o estado em memória; se ele ainda não tiver garagem, cai no que
      // está gravado no aparelho. Os dois efeitos (ler o armazenamento e
      // consultar a nuvem) começam juntos, e sem essa rede de segurança
      // existiria uma janela em que o convidado parece não ter feito nada e o
      // app deixaria de perguntar, descartando os carros em silêncio.
      const naMemoria = sRef.current;
      const doAparelho = naMemoria.vehicles.length ? naMemoria : lerDoAparelho();
      const local = deOutraConta ? EMPTY : doAparelho;

      // Conta NOVA (sem estado na nuvem): leva o trabalho de convidado sem
      // perguntar. Não há garagem com que comparar, o carro é claramente de
      // quem acabou de criar a conta, e uma pergunta aqui seria fricção pura.
      // O Premium NÃO vem junto: a compra exige estar logado, então conta sem
      // registro na nuvem nunca assinou nada. Quem pagou e reinstalou recupera
      // pelo "Restaurar compra" da própria loja.
      if (!cloud) {
        setS(commit({ ...local, premium: false, email: local.email ?? user.email ?? null }));
        return;
      }

      // Conta que JÁ TEM garagem: o que foi feito como convidado neste aparelho
      // não entra sozinho. Juntar por conta própria é como o dono acabou com
      // cinco carros sem ter pedido — e num aparelho emprestado seria pior,
      // porque o carro de outra pessoa entraria na conta de quem logou.
      // Então o merge sobe SEM esses carros e o dono decide um a um.
      const pendente = daGaragemDoConvidado(cloud, local);
      const merged = mergeSessions(cloud, pendente ? semOsPendentes(local, pendente) : local);
      if (!merged.email) merged.email = user.email ?? null;
      setS(commit(merged));
      setImportacaoPendente(pendente);
    })();
    return () => { cancelled = true; };
  }, [user, supabase, commit]);

  // Resposta do dono à pergunta acima. Lista vazia = não importar nada: a conta
  // fica exatamente como estava na nuvem, e o que o convidado fez neste
  // aparelho não sobe. É uma escolha, não um acidente — a tela não fecha sem
  // que um dos dois botões seja tocado.
  const resolverImportacao = useCallback((ids: string[]) => {
    const pend = importacaoPendente;
    setImportacaoPendente(null);
    if (!pend) return;
    const escolhidos = new Set(ids);
    const veiculos = pend.veiculos.filter((v) => escolhidos.has(v.id));
    if (!veiculos.length) return;
    patch((p) => {
      const jaTem = new Set(p.vehicles.map((v) => v.id));
      const novos = veiculos.filter((v) => !jaTem.has(v.id));
      return {
        ...p,
        vehicles: [...p.vehicles, ...novos],
        services: [...p.services, ...pend.servicos.filter((r) => escolhidos.has(r.vehicleId))],
        reminders: [...new Set([...p.reminders, ...pend.lembretes.filter((r) => escolhidos.has(r.split(":")[0]))])],
        // Garagem vazia até aqui: o primeiro importado vira o ativo, senão a
        // Home abriria sem carro selecionado tendo carro na garagem.
        activeVehicleId: p.activeVehicleId ?? novos[0]?.id ?? null,
      };
    });
  }, [importacaoPendente, patch]);

  // Ao sair da conta, o aparelho volta a zero.
  //
  // Antes só o `premium` era apagado, e a garagem continuava na tela. Parece
  // gentil e não é: os dados ficavam visíveis para a próxima pessoa que
  // abrisse o app neste celular, e voltavam a se misturar no login seguinte.
  // Nada se perde — tudo o que existia foi para a nuvem enquanto a sessão
  // estava aberta, e volta no próximo login.
  //
  // Só depois de `authReady`: no boot o usuário ainda é null enquanto a sessão
  // é restaurada, e limpar aí apagaria a tela de quem está logado.
  useEffect(() => {
    if (!authReady) return;
    if (user) { teveSessao.current = true; return; }
    if (!teveSessao.current) return;
    teveSessao.current = false;
    gravarDono(null);
    setS(() => commit({ ...EMPTY, startedAt: todayISO() }));
  }, [user, authReady, commit]);

  // Debounced push of the whole session to the cloud while logged in.
  useEffect(() => {
    if (!user || !supabase) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      supabase.from("user_state").upsert({ user_id: user.id, data: s }).then(({ error }) => {
        if (error) console.warn("[sync] save failed:", error.message);
      });
    }, 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [s, user, supabase]);

  const setName = useCallback((name: string) => patch((p) => ({ ...p, name: name.trim() || null })), [patch]);
  const setEmail = useCallback((email: string) => patch((p) => ({ ...p, email: email.trim() || null })), [patch]);
  const setState = useCallback((state: string) => patch((p) => ({ ...p, state: state || null })), [patch]);
  const setCity = useCallback((city: string) => patch((p) => ({ ...p, city: city.trim() || null })), [patch]);
  const setPremium = useCallback((v: boolean) => patch((p) => ({ ...p, premium: v })), [patch]);

  const addVehicle = useCallback(
    (v: Omit<Vehicle, "id">) => {
      const id = newId();
      patch((p) => ({ ...p, vehicles: [...p.vehicles, { ...v, id }], activeVehicleId: id }));
      return id;
    },
    [patch]
  );

  const updateVehicle = useCallback(
    (id: string, up: Partial<Vehicle>) =>
      patch((p) => ({
        ...p,
        vehicles: p.vehicles.map((v) => {
          if (v.id !== id) return v;
          // Km novo ganha carimbo de quando foi informado — é ele que dispara
          // (e adia) o lembrete mensal de atualizar o km. Centralizado aqui
          // para valer em toda tela que mexa no odômetro.
          const carimbo = "odometerKm" in up && up.odometerKm !== v.odometerKm ? { kmUpdatedAt: new Date().toISOString() } : {};
          return { ...v, ...up, ...carimbo };
        }),
      })),
    [patch]
  );

  const removeVehicle = useCallback(
    (id: string) =>
      patch((p) => {
        const vehicles = p.vehicles.filter((v) => v.id !== id);
        const services = p.services.filter((r) => r.vehicleId !== id);
        const activeVehicleId = p.activeVehicleId === id ? vehicles[0]?.id ?? null : p.activeVehicleId;
        return { ...p, vehicles, services, activeVehicleId };
      }),
    [patch]
  );

  const setActiveVehicle = useCallback((id: string) => patch((p) => ({ ...p, activeVehicleId: id })), [patch]);

  const addService = useCallback(
    (rec: Omit<ServiceRecord, "id">) => {
      const id = newId();
      patch((p) => {
        // Logging a service also advances the vehicle's odometer if higher.
        const vehicles = p.vehicles.map((v) => (v.id === rec.vehicleId && rec.km > (v.odometerKm ?? 0) ? { ...v, odometerKm: rec.km } : v));
        return { ...p, services: [{ ...rec, id }, ...p.services], vehicles };
      });
      return id;
    },
    [patch]
  );

  const updateService = useCallback(
    (id: string, up: Partial<ServiceRecord>) => patch((p) => ({ ...p, services: p.services.map((r) => (r.id === id ? { ...r, ...up } : r)) })),
    [patch]
  );

  const removeService = useCallback((id: string) => patch((p) => ({ ...p, services: p.services.filter((r) => r.id !== id) })), [patch]);

  const toggleMilestone = useCallback(
    (id: string) =>
      patch((p) => {
        const has = p.claimedMilestones.includes(id);
        return { ...p, claimedMilestones: has ? p.claimedMilestones.filter((m) => m !== id) : [...p.claimedMilestones, id] };
      }),
    [patch]
  );

  const markLessonSeen = useCallback(
    (id: string) =>
      patch((p) => {
        const had = p.seenLessons.includes(id);
        trackContent(id, had ? "uncomplete" : "complete");
        return { ...p, seenLessons: had ? p.seenLessons.filter((l) => l !== id) : [...p.seenLessons, id] };
      }),
    [patch]
  );

  const toggleLessonSaved = useCallback(
    (id: string) =>
      patch((p) => {
        const had = p.savedLessons.includes(id);
        trackContent(id, had ? "unsave" : "save");
        return { ...p, savedLessons: had ? p.savedLessons.filter((l) => l !== id) : [...p.savedLessons, id] };
      }),
    [patch]
  );

  const toggleLessonPinned = useCallback(
    (id: string) =>
      patch((p) => {
        const had = p.pinnedLessons.includes(id);
        trackContent(id, had ? "unpin" : "pin");
        return { ...p, pinnedLessons: had ? p.pinnedLessons.filter((l) => l !== id) : [...p.pinnedLessons, id] };
      }),
    [patch]
  );

  // Lembrete de revisão por carro+item — aparece em "Próximos serviços"
  // (aba Histórico) e persiste/sincroniza como o resto do perfil.
  const toggleReminder = useCallback(
    (vehicleId: string, itemKey: string) =>
      patch((p) => {
        const id = `${vehicleId}:${itemKey}`;
        const had = p.reminders.includes(id);
        return { ...p, reminders: had ? p.reminders.filter((r) => r !== id) : [...p.reminders, id] };
      }),
    [patch]
  );

  // Reordena um fixado (delta -1 sobe, +1 desce) — o usuário escolhe a ordem.
  const moveLessonPinned = useCallback(
    (id: string, delta: -1 | 1) =>
      patch((p) => {
        const arr = [...p.pinnedLessons];
        const i = arr.indexOf(id);
        const j = i + delta;
        if (i < 0 || j < 0 || j >= arr.length) return p;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        return { ...p, pinnedLessons: arr };
      }),
    [patch]
  );

  const setMomentPhoto = useCallback(
    (id: string, dataUrl: string | null) =>
      patch((p) => {
        const photos = { ...p.momentPhotos };
        if (dataUrl) photos[id] = dataUrl;
        else delete photos[id];
        return { ...p, momentPhotos: photos };
      }),
    [patch]
  );

  const setNotifications = useCallback((v: boolean) => patch((p) => ({ ...p, notifications: v })), [patch]);
  const setUnits = useCallback((v: "metric" | "imperial") => patch((p) => ({ ...p, units: v })), [patch]);
  const setAvatar = useCallback((dataUrl: string | null) => patch((p) => ({ ...p, avatar: dataUrl })), [patch]);

  // Registra o que aconteceu no pedido de nota. Recebe um pedaço, não o objeto
  // inteiro, para nunca apagar sem querer o `foiParaLoja` de quem já avaliou.
  const patchFeedback = useCallback(
    (parte: Partial<FeedbackState>) =>
      patch((p) => ({
        ...p,
        feedback: {
          perguntadoEm: null,
          respondidoEm: null,
          nota: null,
          foiParaLoja: false,
          ...(p.feedback ?? {}),
          ...parte,
        },
      })),
    [patch]
  );

  const finishOnboarding = useCallback(() => patch((p) => ({ ...p, onboarded: true, startedAt: p.startedAt ?? todayISO() })), [patch]);
  const reset = useCallback(() => patch(() => ({ ...EMPTY, momentPhotos: {} })), [patch]);

  // Effective session: a real Stripe subscription forces premium on. The raw
  // `s` (synced to the cloud) is left untouched to avoid drift with the webhook.
  const es = useMemo(() => (subActive && !s.premium ? { ...s, premium: true } : s), [s, subActive]);

  const value = useMemo<StoreValue>(
    () => ({ s: es, importacaoPendente, resolverImportacao, checkoutVoltando, fecharAvisoCheckout, setName, setEmail, setState, setCity, setPremium, addVehicle, updateVehicle, removeVehicle, setActiveVehicle, addService, updateService, removeService, toggleMilestone, markLessonSeen, toggleLessonSaved, toggleLessonPinned, moveLessonPinned, toggleReminder, setMomentPhoto, setNotifications, setUnits, setAvatar, patchFeedback, subscribed: subActive, subscriptionEndsAt: sub.endsAt, subscriptionCanceling: sub.canceling, refreshSubscription, finishOnboarding, reset }),
    [es, importacaoPendente, resolverImportacao, checkoutVoltando, fecharAvisoCheckout, setName, setEmail, setState, setCity, setPremium, addVehicle, updateVehicle, removeVehicle, setActiveVehicle, addService, updateService, removeService, toggleMilestone, markLessonSeen, toggleLessonSaved, toggleLessonPinned, moveLessonPinned, toggleReminder, setMomentPhoto, setNotifications, setUnits, setAvatar, patchFeedback, subActive, sub.endsAt, sub.canceling, refreshSubscription, finishOnboarding, reset]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePrototype() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePrototype must be used within PrototypeProvider");
  return ctx;
}

// ---- Selectors -------------------------------------------------------------
// Carros ativos = os que o usuário ainda tem (vendidos ficam arquivados).
export function ownedVehicles(s: Session): Vehicle[] {
  return s.vehicles.filter((v) => !v.soldAt);
}
export function soldVehicles(s: Session): Vehicle[] {
  return s.vehicles.filter((v) => !!v.soldAt);
}
export function activeVehicle(s: Session): Vehicle | null {
  const active = s.vehicles.find((v) => v.id === s.activeVehicleId);
  if (active && !active.soldAt) return active;
  // Vendeu o carro ativo → cai para outro que ainda tem; se só restarem
  // vendidos, mantém o selecionado para o histórico seguir acessível.
  return ownedVehicles(s)[0] ?? active ?? s.vehicles[0] ?? null;
}
export function servicesFor(s: Session, vehicleId: string | null | undefined): ServiceRecord[] {
  if (!vehicleId) return [];
  return s.services.filter((r) => r.vehicleId === vehicleId).sort((a, b) => b.date.localeCompare(a.date) || b.km - a.km);
}
