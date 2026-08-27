"use client";

import { useEffect, useRef, useState } from "react";
import { apiPost, apiUrl } from "@/lib/app/apiBase";
import { carregarConversa, historicoParaIA, idConversa, limparConversa, salvarConversa, type Msg } from "@/lib/app/bielaChat";
import { pedirFeedback } from "@/lib/app/feedbackPrompt";
import { useI18n } from "@/lib/i18n";
import { activeVehicle, usePrototype } from "@/lib/app/store";
import { APP_VERSION, vehicleLabel } from "@/lib/app/content";
import { useNav } from "@/lib/app/nav";
import { isNativeApp, nativePlatform } from "@/lib/app/wrapper";
import { Button } from "@/components/ui/Button";
import { AppHeader, Chip, Icon, useContent } from "../ui";

// A conversa com a Biela.
//
// MOROU DENTRO DE Learn.tsx: o chat com a IA, trezentas linhas, escondido no
// fim de um arquivo chamado "Estudos". Era a coisa menos encontrável do
// repositório, e é uma das mais caras de operar (chama API, guarda conversa,
// tem limite por assinatura).

const FREE_BIELA_QUESTIONS = 0; // Biela é sempre Premium (sem perguntas grátis)

// Id anônimo do aparelho — o mesmo que o Perfil já usa nas mensagens de
// suporte. Serve só para agrupar votos do mesmo celular; não identifica conta.
function aparelhoId(): string {
  if (typeof window === "undefined") return "—";
  try {
    let id = window.localStorage.getItem("mentorque-uid");
    if (!id) { id = crypto?.randomUUID?.() ?? String(Math.random()).slice(2); window.localStorage.setItem("mentorque-uid", id); }
    return id;
  } catch { return "—"; }
}

export function BielaChatScreen({ seed }: { seed?: string }) {
  const c = useContent();
  const { locale } = useI18n();
  const { s } = usePrototype();
  const { go } = useNav();
  const v = activeVehicle(s);
  // Uma conversa por carro: quem tem um só nunca percebe, e quem tem dois não
  // vê resposta sobre o Argo pendurada acima de uma pergunta sobre o outro.
  const idChat = idConversa(v?.id);
  // A saudação é sempre remontada aqui (fica fora do que é gravado), então ela
  // acompanha o idioma atual.
  const abertura = (): Msg[] => [{ role: "biela", text: c.biela.intro }];
  const [msgs, setMsgs] = useState<Msg[]>(() => [...abertura(), ...carregarConversa(idChat)]);
  const [input, setInput] = useState(seed ?? "");
  const [busy, setBusy] = useState(false);
  const [used, setUsed] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [motivoDe, setMotivoDe] = useState<number | null>(null); // índice da resposta esperando motivo
  const [comentario, setComentario] = useState("");
  const relogio = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Grava a cada mudança. `msgs.slice(1)` tira a saudação; o recorte das 15
  // últimas interações é feito lá dentro.
  useEffect(() => {
    salvarConversa(idChat, msgs.slice(1), s.vehicles.map((x) => x.id));
  }, [msgs, idChat, s.vehicles]);

  // Trocar de carro com a tela montada não acontece hoje (não há seletor de
  // veículo aqui), mas se um dia houver, a conversa recarrega em vez de ser
  // gravada no carro errado. `pular` evita o retrabalho na primeira montagem,
  // onde o useState já leu o mesmo dado.
  const pular = useRef(true);
  useEffect(() => {
    if (pular.current) { pular.current = false; return; }
    setMsgs([...abertura(), ...carregarConversa(idChat)]);
    setMotivoDe(null);
    setComentario("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idChat]);

  const gated = !s.premium && used >= FREE_BIELA_QUESTIONS;

  // O 👍 ARMA o pedido de nota; quem dispara é o silêncio.
  //
  // Perguntar na hora do polegar interromperia alguém no meio de um problema no
  // carro — o pior momento possível para pedir estrelas. Trinta segundos sem
  // pergunta nova é o sinal de que a conversa acabou bem.
  //
  // O 👎 fica guardado só na tela por ora: ele é o melhor material para corrigir
  // a Biela, mas mandar cada polegar para baixo por e-mail encheria a caixa.
  const desarmar = () => {
    if (relogio.current) { clearTimeout(relogio.current); relogio.current = null; }
  };
  // Sair da tela cancela: a folha não deve pular numa tela onde o momento não
  // aconteceu.
  useEffect(() => desarmar, []);

  const novaConversa = () => {
    desarmar();
    limparConversa(idChat);
    setMsgs(abertura());
    setMotivoDe(null);
    setComentario("");
    setInput("");
  };

  // Manda o voto para /api/biela-voto, que guarda o par pergunta+resposta.
  // Falhar aqui não pode atrapalhar ninguém: quem tocou no polegar já seguiu a
  // vida, e uma mensagem de erro por causa disso seria pior que o silêncio.
  const registrar = (i: number, voto: "up" | "down", motivo?: string, comentario?: string) => {
    const msg = msgs[i];
    if (!msg?.pergunta) return;
    void apiPost("/api/biela-voto", {
      voto, motivo, comentario,
      pergunta: msg.pergunta, resposta: msg.text,
      carro: v ? `${v.make} ${v.model} ${v.year}` : undefined,
      comManual: msg.comManual, modo: msg.modo, locale,
      plataforma: isNativeApp() ? (nativePlatform() ?? "nativo") : "web",
      versao: APP_VERSION, aparelho: aparelhoId(),
    }).catch(() => undefined);
  };

  const votar = (i: number, v: "up" | "down") => {
    setMsgs((m) => m.map((msg, j) => (j === i ? { ...msg, voto: v } : msg)));
    desarmar();
    if (v === "down") { setMotivoDe(i); return; } // o motivo é que vale; o voto vai com ele
    // Voltar para 👍 fecha o "O que faltou?".
    //
    // Sem isto, quem tocasse 👎 e se arrependesse ficava com a pergunta de
    // motivo aberta embaixo de um polegar para cima — a tela dizia duas coisas
    // contrárias ao mesmo tempo, e um toque no motivo teria gravado um voto
    // negativo que a pessoa já tinha desfeito.
    setMotivoDe((atual) => (atual === i ? null : atual));
    setComentario("");
    registrar(i, "up");
    relogio.current = setTimeout(() => {
      relogio.current = null;
      // Meia pergunta escrita não é fim de conversa, é alguém formulando —
      // e interromper aí é pior do que interromper logo.
      if (inputRef.current?.value.trim()) return;
      pedirFeedback(s, "biela-util");
    }, 30_000);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  // Campo cresce conforme o texto (inclusive quando já vem preenchido pelo seed).
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }, [input, gated]);

  const ask = async (question: string) => {
    const text = question.trim();
    if (!text || busy || gated) return;
    desarmar(); // ainda está resolvendo algo: o próximo 👍 arma de novo
    setInput("");
    // Recortado ANTES de empilhar a pergunta nova: `historicoParaIA` só junta
    // pares fechados, e a pergunta que acabou de sair ainda não tem resposta.
    const historico = historicoParaIA(msgs);
    setMsgs((m) => [...m, { role: "user", text }]);
    setBusy(true);
    if (!s.premium) setUsed((n) => n + 1);
    try {
      const res = await apiPost("/api/biela", {
        question: text,
        locale,
        historico,
        car: v ? { make: v.make, model: v.model, year: v.year, km: v.odometerKm, engine: v.engine, version: v.version } : null,
      });
      const data = await res.json();
      setMsgs((m) => [...m, {
        role: "biela", text: data.answer, note: data.mode === "ai" ? undefined : c.biela.offlineNote,
        pergunta: text, modo: data.mode, comManual: data.usedManual,
      }]);
    } catch (e) {
      // No app, mostra o motivo real da falha junto do aviso. Sem isto a tela
      // ficava idêntica para "sem internet", "endereço errado" e "navegador
      // bloqueou" — e cada diagnóstico custava um build inteiro.
      const detalhe = isNativeApp()
        ? ` · ${apiUrl("/api/biela")} → ${e instanceof Error ? e.message : String(e)}`
        : "";
      setMsgs((m) => [...m, { role: "biela", text: fallbackAnswer(v, locale), note: c.biela.offlineNote + detalhe, pergunta: text, modo: "offline" }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <AppHeader
        title={c.biela.title}
        subtitle={v ? `${c.biela.contextPrefix} ${vehicleLabel(v)}${v.odometerKm != null ? " · " + v.odometerKm.toLocaleString() + " km" : ""}` : undefined}
        action={
          msgs.length > 1 ? (
            <button
              onClick={novaConversa}
              aria-label={c.biela.novaConversa}
              title={c.biela.novaConversa}
              className="grid h-9 w-9 place-items-center rounded-full bg-graphite-700 text-cream/70 hover:text-cream"
            >
              <Icon name="plus" className="h-4 w-4" />
            </button>
          ) : undefined
        }
      />

      {/* Conversa.
          `mt-auto` no miolo encosta as mensagens embaixo enquanto elas cabem na
          tela, como em qualquer conversa — antes a saudação ficava colada no
          topo e sobrava um vão até as sugestões. Quando passam da altura, o
          `mt-auto` deixa de ter efeito e a rolagem volta ao normal (é por isso
          que não dá para usar `justify-end`, que corta o começo). */}
      <div ref={scrollRef} className="flex flex-1 flex-col overflow-y-auto pb-2">
        <div className="mt-auto space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex items-end gap-2"}>
            {m.role === "biela" && (
              <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-graphite-800 ring-1 ring-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/biela/biela-idle.png" alt="" className="h-full w-full object-contain" />
              </span>
            )}
            <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "bg-amber text-graphite" : "bg-graphite-800 text-cream/90 ring-1 ring-white/5"}`}>
              <p className="whitespace-pre-wrap">{m.text}</p>
              {m.note && <p className="mt-1.5 text-[11px] italic text-cream/45">{m.note}</p>}
              {m.role === "biela" && i > 0 && (
                <div className="mt-2 border-t border-white/5 pt-2">
                  <div className="flex gap-1">
                    {([["up", "\u{1F44D}", c.feedback.bielaUtil], ["down", "\u{1F44E}", c.feedback.bielaInutil]] as const).map(([opcao, icone, rotulo]) => (
                      <button
                        key={opcao}
                        onClick={() => votar(i, opcao)}
                        aria-label={rotulo}
                        aria-pressed={m.voto === opcao}
                        className={`rounded-lg px-2 py-1 text-sm transition-colors ${m.voto === opcao ? "bg-amber/20" : "opacity-45 hover:opacity-100"}`}
                      >
                        {icone}
                      </button>
                    ))}
                  </div>

                  {/* O motivo é o que transforma "resposta ruim" em conserto. */}
                  {motivoDe === i && (
                    <div className="mt-2">
                      <p className="text-xs text-cream/50">{c.feedback.bielaPorQue}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {([["errada", c.feedback.bielaErrada], ["incompleta", c.feedback.bielaIncompleta], ["confusa", c.feedback.bielaConfusa]] as const).map(([chave, rotulo]) => (
                          <button
                            key={chave}
                            onClick={() => { registrar(i, "down", chave, comentario.trim() || undefined); setMotivoDe(null); setComentario(""); }}
                            className="rounded-full bg-graphite-700 px-2.5 py-1 text-xs text-cream/80 ring-1 ring-white/10 hover:bg-graphite-600"
                          >
                            {rotulo}
                          </button>
                        ))}
                      </div>
                      <input
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        placeholder={c.feedback.bielaComentario}
                        className="mt-2 w-full rounded-lg bg-graphite-900 px-2.5 py-1.5 text-xs text-cream placeholder:text-cream/30 ring-1 ring-white/10 focus:outline-none focus:ring-amber/40"
                      />
                    </div>
                  )}
                  {m.voto === "down" && motivoDe !== i && (
                    <p className="mt-1.5 text-xs text-cream/40">{c.feedback.bielaObrigado}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-sm text-cream/50">
            <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-graphite-800 ring-1 ring-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/biela/biela-idle.png" alt="" className="h-full w-full object-contain" />
            </span>
            {c.biela.thinking}
          </div>
        )}
        </div>
      </div>

      {/* Sugestões (só no início) */}
      {msgs.length <= 1 && !gated && (
        <div className="mb-2 flex flex-wrap gap-2">
          {c.biela.suggestions.map((sug) => (
            <Chip key={sug} onClick={() => ask(sug)}>{sug}</Chip>
          ))}
        </div>
      )}

      {gated ? (
        <div className="mb-2 rounded-2xl bg-amber/10 p-4 text-center ring-1 ring-amber/25">
          <p className="text-sm text-cream/85">{c.biela.freeOver}</p>
          <Button className="mt-3 w-full" onClick={() => go({ name: "subscribe", ctx: "biela" })}>{c.biela.premiumCta}</Button>
        </div>
      ) : (
        <>
          <div className="mb-2 flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input); } }}
              rows={1}
              placeholder={c.biela.inputPh}
              className="max-h-44 flex-1 resize-none overflow-y-auto rounded-xl bg-graphite-800 px-3.5 py-3 text-cream ring-1 ring-white/10 outline-none placeholder:text-cream/40 focus:ring-amber"
            />
            <button
              onClick={() => ask(input)}
              disabled={busy || !input.trim()}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber text-graphite disabled:opacity-40"
              aria-label={c.biela.send}
            >
              <Icon name="explore" className="h-5 w-5 rotate-90" />
            </button>
          </div>
        </>
      )}
      <p className="pb-1 text-center text-[11px] text-cream/40">{c.biela.disclaimer}</p>
    </div>
  );
}

// Client-side safety net when the API is unreachable.
function fallbackAnswer(v: ReturnType<typeof activeVehicle>, locale: string): string {
  const car = v ? `${v.make} ${v.model} ${v.year}` : locale === "pt" ? "seu carro" : "your car";
  return locale === "pt"
    ? `Boa pergunta! Sobre o ${car}: o caminho seguro é começar pelo manual do fabricante e pelos sintomas exatos (barulho, quando acontece, luz no painel). Se for item de segurança — freio, direção — não arrisque: leve a uma oficina de confiança. Me dá mais detalhes que eu te ajudo a afunilar.`
    : `Great question! About ${car}: the safe path is to start with the maker's manual and the exact symptoms (noise, when it happens, dashboard light). For safety items — brakes, steering — don't risk it: take it to a trusted shop. Give me more detail and I'll help narrow it down.`;
}
