"use client";

import { useEffect, useState } from "react";
import { abastecimentosFor, activeVehicle, ganhosFor, servicesFor, usePrototype } from "@/lib/app/store";
import { custoPorKm, gastoDaSemana } from "@/lib/app/combustivel";
import { contaDoDia, contaDoMes } from "@/lib/app/motorista";
import { brlCentavos } from "./Abastecimento";
import { dataParaOInicio } from "@/lib/app/datasDoCarro";
import { mesAnterior, nomeDoMes, resumoDoMes } from "@/lib/app/resumoDoMes";
import { quandoVence } from "../DatasDoCarro";
import type { Vehicle } from "@/lib/app/types";
import { personalScore, vehicleSituations, vehicleTraits } from "@/lib/app/traits";
import type { ServiceRecord } from "@/lib/app/types";
import { computeQuizHealth } from "@/lib/app/healthQuiz";
import { computeStatus } from "@/lib/app/gamification";
import { carName, formatBRL, isNewLesson, vehicleLabel } from "@/lib/app/content";
import { useNav } from "@/lib/app/nav";
import { openStorePage, useUpdateAvailable } from "@/lib/app/appUpdate";
import { sellsInApp } from "@/lib/app/wrapper";
import { funil } from "@/lib/app/funil";
import { Button } from "@/components/ui/Button";
import { useContent, usePopulares, Atalho, Icon, inputCls, Linha, LinhaPremium, Sheet, Thumb } from "../ui";
import { LIMITS } from "@/lib/app/premium";
import { healthColor } from "./Cars";
import { ProblemaLinha, problemasComuns } from "./Symptoms";
import { ConviteDeAviso } from "../ConviteDeAviso";
import { consumirConviteNoOnboarding } from "@/lib/app/pedidoDeAviso";

type Lesson = ReturnType<typeof useContent>["lessons"][number];

// Dificuldade sugerida conforme a fase do motorista.
function levelPref(phaseIndex: number): "facil" | "medio" | "avancado" {
  if (phaseIndex <= 1) return "facil";
  if (phaseIndex <= 3) return "medio";
  return "avancado";
}

// "Descubra mais": ranqueia as aulas por marca do carro + nível. Concluído
// e não salvo sai; conteúdo novo (addedAt ≤ 7 dias) vai para a frente; o
// resto segue por relevância.
function forYou(lessons: Lesson[], opts: { car?: ReturnType<typeof activeVehicle>; services?: ServiceRecord[]; pref: string; seen: string[]; saved: string[]; pinned: string[] }): Lesson[] {
  // Mesma personalização da tela de Estudos: características do veículo +
  // situação do dono (ver lib/app/traits.ts), com fallback genérico.
  const car = opts.car;
  const traits = car ? vehicleTraits(car) : new Set<never>();
  const situations = car ? vehicleSituations(car, opts.services ?? []) : new Set<never>();
  const score = (l: Lesson) =>
    personalScore(l, { make: car?.make, model: car?.model, traits: traits as never, situations: situations as never, pref: opts.pref });
  // "obd2-scan" vive só na área de Estudos — no Descubra mais fica a aula
  // "Luz de injeção ligada? Descubra!" (read-obd2), que leva até ela.
  const pool = lessons.filter(
    (l) => l.id !== "obd2-scan" && !opts.seen.includes(l.id) && !opts.saved.includes(l.id) && !opts.pinned.includes(l.id)
  );
  const news = pool.filter((l) => isNewLesson(l)).sort((a, b) => (b.addedAt ?? "").localeCompare(a.addedAt ?? ""));
  const rest = pool.filter((l) => !isNewLesson(l)).sort((a, b) => score(b) - score(a));
  return [...news, ...rest];
}

function typeIcon(t: string) {
  return t === "video" ? "diagnose" : t === "checklist" ? "check" : "book";
}

// O INÍCIO EM OITO BLOCOS (06/10/2026, docs/design/limpeza-visual-nubank.md).
//
// Até aqui a tela tinha dezesseis blocos, todos em card, três carrosséis e seis
// emojis. A gramática nova é a do Nubank: a pergunta no topo (o número que a
// pessoa veio ver), uma fila de atalhos, e dali para baixo LINHAS com seta,
// separadas por um fio. O detalhe mora um toque abaixo. A ordem é fixa:
//
//   1. cabeçalho (TopBar)         5. a linha do carro
//   2. aviso de versão nova       6. UMA pendência (data, km parado, km faltando)
//   3. a pergunta, com atalhos    7. gastos do mês
//   4. a fila de quatro atalhos   8. Descubra mais, problemas comuns, Premium
//
// O que saiu daqui e para onde foi: a busca (o Biela é a busca de verdade);
// fixados e salvos (três linhas do Descubra mais, e o Aprender); Memórias
// (Perfil); o kit do motorista (Aprender); a folha mensal de km (virou a
// pendência da linha 6); o card do Premium (virou linha). A arte da Biela na
// garagem fica: é a marca (dono, 04/10). Apostas `inicio-pergunta-unica` e
// `aba-biela` continuam abertas e a ficha delas diz que a versão B mudou
// neste dia.

// A conta do dia de quem trabalha com o carro por aplicativo (peça 4 da
// rotina). Com o modo ligado, a linha dos gastos vira a conta do dia: ganhou,
// custou, sobrou. Sem lançamento hoje, convida.
function DiaDoMotorista({ vehicleId, nome }: { vehicleId: string; nome: string }) {
  const c = useContent();
  const t = c.motorista;
  const { s } = usePrototype();
  const { go } = useNav();
  const hoje = new Date().toISOString().slice(0, 10);
  const conta = contaDoDia({ ganhos: ganhosFor(s, vehicleId), abastecimentos: abastecimentosFor(s, vehicleId), servicos: servicesFor(s, vehicleId), hoje });
  const lancouHoje = conta.dias > 0;
  return (
    <Linha
      data-dia-do-motorista
      rotulo={lancouHoje ? t.cardTitulo.replace("{carro}", nome) : undefined}
      titulo={!lancouHoje ? t.cardVazioTitulo.replace("{carro}", nome) : undefined}
      valor={
        lancouHoje
          ? conta.custou != null && conta.sobrou != null
            ? t.cardConta.replace("{ganhou}", formatBRL(conta.ganhou)).replace("{custou}", formatBRL(conta.custou)).replace("{sobrou}", formatBRL(conta.sobrou))
            : t.cardSemCusto.replace("{ganhou}", formatBRL(conta.ganhou)).replace("{km}", conta.km.toLocaleString("pt-BR"))
          : undefined
      }
      sub={!lancouHoje ? t.cardVazioSub : undefined}
      onClick={() => go({ name: "ganhos", origem: "inicio" })}
    />
  );
}

// Os gastos do mês, numa linha (a peça 1 da rotina, o caderno de gastos).
// Sem abastecimento, a linha convida ao primeiro; com um, diz o mês, a
// semana e o custo por km. Na primeira semana do mês, o mês fechado entra
// como contexto (peça 3 da rotina), em vez de um card próprio.
function CustoDoCarro({ car, nome }: { car: Vehicle; nome: string }) {
  const c = useContent();
  const t = c.combustivel;
  const h = c.home;
  const { s } = usePrototype();
  const { go, root } = useNav();
  const lista = abastecimentosFor(s, car.id);
  if (s.motoristaDeApp) return <DiaDoMotorista vehicleId={car.id} nome={nome} />;
  const semana = gastoDaSemana(lista);
  const porKm = custoPorKm(lista);

  const hoje = new Date().toISOString().slice(0, 10);
  const servicos = servicesFor(s, car.id);
  const mesAtual = resumoDoMes({ abastecimentos: lista, servicos, mes: hoje.slice(0, 7) });
  // O mês fechado, na primeira semana, só para quem teve lançamento nele.
  let fechado: string | null = null;
  if (Number(hoje.slice(8, 10)) <= 7) {
    const mes = mesAnterior(hoje);
    const r = resumoDoMes({ abastecimentos: lista, servicos, mes });
    if (r.lancamentos > 0 && r.total > 0) {
      const conta = s.motoristaDeApp ? contaDoMes({ ganhos: ganhosFor(s, car.id), abastecimentos: lista, servicos, mes }) : null;
      fechado =
        conta && conta.ganhou > 0 && conta.sobrou != null && conta.lucroPorKm != null
          ? c.resumoDoMes.subMotorista.replace("{ganhou}", formatBRL(conta.ganhou)).replace("{sobrou}", formatBRL(conta.sobrou)).replace("{lucro}", brlCentavos(conta.lucroPorKm))
          : h.gastosFechado.replace("{mes}", nomeDoMes(mes)).replace("{valor}", formatBRL(r.total));
    }
  }

  if (lista.length === 0) {
    return (
      <Linha
        data-custo-do-carro
        rotulo={h.gastosTitle}
        titulo={t.cardVazioTitulo.replace("{carro}", nome)}
        sub={fechado ?? t.cardVazioSub}
        onClick={() => go({ name: "abastecimento", origem: "inicio" })}
      />
    );
  }
  return (
    <Linha
      data-custo-do-carro
      data-resumo-do-mes={fechado ? "sim" : undefined}
      rotulo={h.gastosTitle}
      valor={formatBRL(mesAtual.total)}
      sub={
        <>
          {t.cardSemana.replace("{valor}", formatBRL(semana))}
          {porKm != null ? ` · ${t.cardPorKm.replace("{valor}", brlCentavos(porKm))}` : ` · ${t.cardFaltaUm}`}
          {fechado ? <><br />{fechado}</> : null}
        </>
      }
      onClick={() => root({ name: "history" })}
    />
  );
}

// A UMA pendência do carro: a mais próxima, e só ela. A ordem é a urgência:
// uma data vencida ou a 30 dias; depois o km parado há mais de um mês (era a
// folha mensal, que abria por cima de tudo); depois o km que nunca foi
// informado, que é o dado que mais destrava.
function Pendencia({ car, kmParado, onKm }: { car: Vehicle; kmParado: boolean; onKm: () => void }) {
  const c = useContent();
  const t = c.datasDoCarro;
  const h = c.home;
  const { go, root } = useNav();
  const d = dataParaOInicio(car);
  if (d) {
    const vencida = d.dias < 0;
    return (
      <Linha
        data-data-a-vencer
        data-pendencia="data"
        tom={vencida ? "alerta" : "normal"}
        titulo={t.homeTitulo.replace("{tipo}", t.tipos[d.tipo]).replace("{carro}", carName(car)).replace("{quando}", quandoVence(d.dias, t))}
        sub={`${d.estimada ? `${t.estimadaLinha} · ` : ""}${d.valor != null ? t.homeSubValor.replace("{valor}", formatBRL(d.valor)) : t.homeSub}`}
        onClick={() => root({ name: "revisions" })}
      />
    );
  }
  if (kmParado && car.odometerKm != null) {
    return (
      <Linha
        data-pendencia="km-parado"
        titulo={h.kmPendTitle}
        sub={h.kmPendSub.replace("{km}", car.odometerKm.toLocaleString("pt-BR"))}
        onClick={onKm}
      />
    );
  }
  if (car.odometerKm == null && !car.purchaseDate) {
    return <Linha data-pendencia="sem-km" titulo={h.completeCarCard} sub={h.completeCarWhy} onClick={() => go({ name: "car" })} />;
  }
  return null;
}

export function HomeScreen() {
  const c = useContent();
  const h = c.home;
  const { s, updateVehicle } = usePrototype();
  const { go, root } = useNav();

  const car = activeVehicle(s);
  const hasCar = s.vehicles.length > 0;
  const updateReady = useUpdateAvailable();
  const populares = usePopulares();

  // O km parado há mais de um mês vira a pendência da linha 6 (06/10/2026).
  // Até aqui era uma folha que abria por cima da tela; agora a folha só abre
  // no toque da linha. O carimbo kmUpdatedAt diz há quanto tempo o número
  // está parado; "Agora não" adia por 3 dias (marcador local por veículo).
  // Km menor que o registrado não passa: o odômetro só anda para frente.
  const [kmAsk, setKmAsk] = useState(false);
  const [kmNovo, setKmNovo] = useState("");
  const [kmErro, setKmErro] = useState<string | null>(null);
  const [kmParado, setKmParado] = useState(false);
  const KM_SNOOZE = "mq-km-snooze-";
  useEffect(() => {
    setKmParado(false);
    if (!car || car.odometerKm == null) return;
    const DIA = 24 * 60 * 60 * 1000;

    // Carro SEM carimbo: cadastrado antes deste campo existir, importado da
    // garagem de convidado, ou simplesmente recém-cadastrado. Carimba agora e
    // começa a contar daqui. (Era aqui o defeito de 1970: a ausência do
    // carimbo virava `informado = 0`, e o app pedia o km no dia do cadastro.)
    if (!car.kmUpdatedAt) {
      updateVehicle(car.id, { kmUpdatedAt: new Date().toISOString() });
      return;
    }

    let adiado = 0;
    try { adiado = Number(window.localStorage.getItem(KM_SNOOZE + car.id) ?? 0); } catch { /* sem armazenamento: pergunta */ }
    const informado = Date.parse(car.kmUpdatedAt);
    if (Number.isNaN(informado)) return;
    if (Date.now() - informado > 30 * DIA && Date.now() - adiado > 3 * DIA) setKmParado(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [car?.id, car?.kmUpdatedAt]);
  const abrirKm = () => {
    setKmNovo("");
    setKmErro(null);
    setKmAsk(true);
  };
  const adiarKm = () => {
    try { window.localStorage.setItem(KM_SNOOZE + (car?.id ?? ""), String(Date.now())); } catch { /* ignore */ }
    setKmAsk(false);
    setKmParado(false);
  };
  const salvarKm = () => {
    if (!car) return;
    const n = parseInt(kmNovo.replace(/\D/g, ""), 10);
    if (!Number.isFinite(n)) { setKmErro(h.kmAskInvalid); return; }
    if (car.odometerKm != null && n < car.odometerKm) {
      setKmErro(h.kmAskLower.replace("{novo}", n.toLocaleString()).replace("{atual}", car.odometerKm.toLocaleString()));
      return;
    }
    updateVehicle(car.id, { odometerKm: n });
    setKmAsk(false);
    setKmParado(false);
  };

  const status = computeStatus(s);
  const seen = s.seenLessons ?? [];
  const savedIds = s.savedLessons ?? [];
  const pinnedIds = s.pinnedLessons ?? [];
  // DESCUBRA MAIS, na ordem que o dono pediu em 06/10 ("ser dinâmico com o
  // carro cadastrado e os itens fixados; o OBD2 entre os três primeiros;
  // depois um com selo de novo, e um que tem mais acesso por todos"):
  //   1. o que a pessoa fixou (escolha dela vence tudo);
  //   2. a leitura da luz do painel (OBD2), que é a porta mais usada;
  //   3. uma aula nova (addedAt a 7 dias), com o selo, quando existir;
  //   4. a aula mais vista por todo mundo nos últimos 30 dias (catálogo
  //      remoto, `populares`, contado no funil), quando existir;
  //   5. as sugestões pelo carro e pelo nível, que completam até quatro.
  // Repetição é cortada: cada aula entra uma vez, na primeira regra que a
  // alcançar.
  const byId = (ids: string[]) => ids.map((id) => c.lessons.find((l) => l.id === id)).filter((l): l is Lesson => !!l);
  const picks = forYou(c.lessons, { car, services: car ? servicesFor(s, car.id) : [], pref: levelPref(status.phaseIndex), seen, saved: savedIds, pinned: pinnedIds });
  const obd2 = c.lessons.find((l) => l.id === "read-obd2");
  const nova = picks.find((l) => isNewLesson(l) && !seen.includes(l.id));
  const popular = byId(populares).find((l) => !seen.includes(l.id));
  const motivo = new Map<string, string>();
  if (nova) motivo.set(nova.id, h.newBadge);
  if (popular) motivo.set(popular.id, h.descubraPopular);
  const descubra: Lesson[] = [];
  for (const l of [...byId(pinnedIds), ...(obd2 ? [obd2] : []), ...(nova ? [nova] : []), ...(popular ? [popular] : []), ...picks]) {
    if (!descubra.some((x) => x.id === l.id)) descubra.push(l);
    if (descubra.length >= 4) break;
  }
  const problemas = problemasComuns(c, s);

  // O convite de aviso logo depois do onboarding (12/09/2026). Lido uma vez,
  // na montagem: a marca é de módulo e some ao ser consumida.
  const [convidarNoOnboarding] = useState(() => consumirConviteNoOnboarding());

  const daParaEstimar = !!car && (car.odometerKm != null || !!car.purchaseDate);
  const atalho = (nome: string, ir: () => void) => () => {
    funil("clicou_atalho", { origem: nome });
    ir();
  };
  const nome = car ? vehicleLabel(car) : "";

  return (
    <div className="pb-4">
      {/* 2. Versão nova na loja. Só no app empacotado, e só quando o build
          instalado está atrás do publicado (lib/app/appUpdate.ts). */}
      {updateReady && (
        <Linha
          className="border-b-0"
          esquerda={<span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal/15 text-teal"><Icon name="spark" className="h-5 w-5" /></span>}
          titulo={h.updateTitle}
          sub={h.updateSub}
          direita={<span className="shrink-0 rounded-full bg-teal px-3.5 py-1.5 text-xs font-bold text-graphite">{h.updateCta}</span>}
          onClick={openStorePage}
        />
      )}

      {convidarNoOnboarding && (
        <ConviteDeAviso
          momento="onboarding"
          sequencia={0}
          titulo={car ? h.conviteAvisoTitulo.replace("{carro}", vehicleLabel(car)) : h.conviteAvisoTituloSemCarro}
          corpo={h.conviteAvisoCorpo}
        />
      )}

      {/* 3. O HERÓI É A PERGUNTA, COM OU SEM CARRO (04/10/2026, aposta
          `inicio-pergunta-unica`): a única ação primária, com três atalhos que
          abrem o chat já preenchido. A serifa fica só aqui: é a voz da marca. */}
      <div className="relative mt-3 overflow-hidden rounded-3xl bg-graphite-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/biela/cena-chegada.webp"
          alt=""
          className="aspect-[16/12] w-full object-cover"
          style={{ objectPosition: "center 52%" }}
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-graphite-900 via-graphite-900/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h2 className="max-w-[15rem] font-serif text-2xl font-bold leading-tight text-cream">
            {h.heroTitleEmpty}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {h.heroChips.map((chip) => (
              <button
                key={chip.label}
                onClick={() => go({ name: "biela", seed: chip.seed })}
                className="rounded-full bg-graphite-900/70 px-3 py-1.5 text-[13px] text-cream ring-1 ring-white/15 backdrop-blur hover:ring-amber/60 active:scale-[0.98]"
              >
                {chip.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => go({ name: "biela" })}
            className="mt-3 w-full rounded-full bg-amber py-3.5 text-center font-display text-[15px] font-semibold text-graphite active:scale-[0.99]"
          >
            {h.heroCtaEmpty}
          </button>
          {!hasCar && (
            <button
              onClick={() => go({ name: "addCar", origem: "inicio" })}
              className="mt-2 w-full py-1.5 text-center text-[13px] text-cream/60 hover:text-cream"
            >
              {h.heroSecEmpty}
            </button>
          )}
        </div>
      </div>

      {/* 4. A fila de atalhos: quatro ações frequentes, ícone redondo e rótulo
          de uma palavra. Cada toque vira `clicou_atalho` com o nome, senão a
          fila não tem leitura. Com o modo motorista, "Orçamento" dá lugar ao
          dia de trabalho, que é o lançamento mais frequente dessa pessoa. */}
      {car && (
        <div className="mt-4 flex items-start gap-1" data-atalhos>
          <Atalho icone="gauge" rotulo={h.atalhos.abastecer} onClick={atalho("abastecer", () => go({ name: "abastecimento", origem: "inicio" }))} data-atalho="abastecer" />
          <Atalho icone="tools" rotulo={h.atalhos.servico} onClick={atalho("servico", () => go({ name: "addService" }))} data-atalho="servico" />
          <Atalho icone="calendar" rotulo={h.atalhos.revisoes} onClick={atalho("revisoes", () => (daParaEstimar ? root({ name: "revisions" }) : go({ name: "car" })))} data-atalho="revisoes" />
          {s.motoristaDeApp ? (
            <Atalho icone="track" rotulo={h.atalhos.dia} onClick={atalho("dia", () => go({ name: "ganhos", origem: "inicio" }))} data-atalho="dia" />
          ) : (
            <Atalho icone="consult" rotulo={h.atalhos.orcamento} onClick={atalho("orcamento", () => go({ name: "orcamento", origem: "inicio" }))} data-atalho="orcamento" />
          )}
        </div>
      )}

      <div className="mt-3">
        {/* 5. O carro, numa linha: rótulo, nome, estado, seta. A saúde é a
            mesma fórmula do quiz usada na Saúde e no hub: um número só. */}
        {car && (
          <Linha
            data-seu-carro
            esquerda={
              <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-graphite-800 text-teal">
                {car.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={car.photo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Icon name={car.type === "moto" ? "moto" : "car"} className="h-6 w-6" />
                )}
              </span>
            }
            rotulo={h.yourCar}
            titulo={car.nickname || vehicleLabel(car)}
            sub={(() => {
              const score = computeQuizHealth(car.quiz ?? {}, car).score;
              const saude = <span className={healthColor(score)}>{score}%</span>;
              const texto = car.odometerKm != null ? h.carState.replace("{km}", car.odometerKm.toLocaleString("pt-BR")) : h.carStateNoKm;
              const [antes, depois] = texto.split("{score}%");
              return <>{antes}{saude}{depois}</>;
            })()}
            onClick={() => root({ name: "car" })}
          />
        )}

        {/* 6. UMA pendência, a mais próxima. */}
        {car && <Pendencia car={car} kmParado={kmParado} onKm={abrirKm} />}

        {/* 7. Os gastos do mês (ou a conta do dia, no modo motorista). */}
        {car && <CustoDoCarro car={car} nome={nome} />}

        {/* 8. Descubra mais: três aulas em linha, e o resto no Aprender. */}
        {descubra.length > 0 && (
          <>
            <div className="mt-6 flex items-baseline justify-between">
              <h3 className="font-display text-[15px] font-semibold text-cream">{h.descubraTitle}</h3>
              <button onClick={() => root({ name: "learn" })} className="text-xs font-medium text-amber">{c.common.seeAll}</button>
            </div>
            {descubra.map((l) => {
              const locked = l.premium && !s.premium;
              return (
                <Linha
                  key={l.id}
                  data-descubra={l.id}
                  esquerda={
                    <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-graphite-800 text-amber/80">
                      {l.thumb ? <Thumb src={l.thumb} className="h-full w-full object-contain" /> : <Icon name={typeIcon(l.type)} className="h-5 w-5" />}
                    </span>
                  }
                  titulo={l.title}
                  sub={locked ? c.common.premium : motivo.get(l.id) ?? (isNewLesson(l) && !seen.includes(l.id) ? h.newBadge : undefined)}
                  onClick={() => go(locked ? { name: "subscribe", ctx: "home" } : { name: "content", id: l.id })}
                />
              );
            })}
          </>
        )}

        {/* Problemas comuns: dois à vista, em linha, e "ver todos" leva à tela
            de sintomas (a tela 2 da aba Biela). Pedido do dono em 06/10: só a
            linha "ficou perdida sobre como chegar lá". `consultou_sintoma`
            segue tendo porta no Início (é a guarda da aposta `aba-biela`). */}
        <div className="mt-6 flex items-baseline justify-between" data-problemas-comuns>
          <h3 className="font-display text-[15px] font-semibold text-cream">{c.symptomsUi.commonTitle}</h3>
        </div>
        {problemas.picks.slice(0, 2).map((sx) => (
          <ProblemaLinha key={sx.id} sx={sx} reco={problemas.isReco(sx)} />
        ))}
        <Linha
          data-problemas-ver-todos
          tom="mudo"
          titulo={h.problemasVerTodos}
          sub={car ? c.symptomsUi.commonSubCar.replace("{car}", carName(car)) : c.symptomsUi.commonSub}
          onClick={() => go({ name: "symptoms" })}
        />

        {/* O PREMIUM, NO FIM, DIZENDO O QUE FICA DE FORA (06/10/2026, pedido
            do dono). Três linhas, cada uma o que a pessoa ganha, com o seu
            `ctx` no paywall. Oculto no app da loja em modo leitor. */}
        {!s.premium && sellsInApp() && (
          <>
            <div className="mt-6" data-premium-bloco>
              <h3 className="font-display text-[15px] font-semibold text-cream">{h.premiumTitle}</h3>
              <p className="mt-0.5 text-xs text-cream/45">{h.premiumBlocoSub}</p>
            </div>
            <LinhaPremium ctx="home" titulo={h.premiumBiela} sub={h.premiumBielaSub} />
            {car && <LinhaPremium ctx="revisions" titulo={h.premiumRevisoes.replace("{carro}", nome)} sub={h.premiumRevisoesSub} />}
            <LinhaPremium ctx="history" titulo={h.premiumHistorico} sub={h.premiumHistoricoSub.replace("{n}", String(LIMITS.freeServices))} />
          </>
        )}
      </div>

      {/* A folha do km, aberta pela pendência da linha 6. */}
      <Sheet open={kmAsk} onClose={adiarKm}>
        <h2 className="font-display text-xl font-bold text-cream">{h.kmAskTitle}</h2>
        <p className="mt-1 text-sm leading-relaxed text-cream/60">
          {h.kmAskBody.replace("{km}", (car?.odometerKm ?? 0).toLocaleString())}
        </p>
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          value={kmNovo}
          onChange={(e) => { setKmNovo(e.target.value); setKmErro(null); }}
          placeholder={h.kmAskPh.replace("{km}", (car?.odometerKm ?? 0).toLocaleString())}
          className={`mt-4 ${inputCls} placeholder:text-cream/30`}
        />
        {kmErro && (
          <p className="mt-2 rounded-lg bg-coral/10 px-3 py-2 text-sm leading-relaxed text-coral ring-1 ring-coral/20">{kmErro}</p>
        )}
        <Button size="lg" className="mt-4 w-full" onClick={salvarKm}>{h.kmAskSave}</Button>
        <button onClick={adiarKm} className="mx-auto mt-3 block py-1 text-sm text-cream/50 hover:text-cream">
          {h.kmAskLater}
        </button>
      </Sheet>
    </div>
  );
}
