"use client";

import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { cursosParaIdioma, paraIdioma, populares, serverSnapshot, snapshot, subscribe } from "@/lib/app/remoteLessons";
import { getContent } from "@/lib/app/content";
import { siteOrigin } from "@/lib/app/apiBase";
import { usePrototype } from "@/lib/app/store";
import { useNav } from "@/lib/app/nav";
import { sellsInApp } from "@/lib/app/wrapper";
import { privacyUrl, termsUrl } from "@/lib/app/legal";
import type { Access, Severity } from "@/lib/app/types";
import {
  IconAlert,
  IconArrow,
  IconBolt,
  IconBook,
  IconBrake,
  IconCalendar,
  IconCar,
  IconCheck,
  IconClock,
  IconClose,
  IconCommunity,
  IconCompass,
  IconConsult,
  IconDiagnose,
  IconEngine,
  IconGauge,
  IconHome,
  IconLock,
  IconMoto,
  IconPlus,
  IconSettings,
  IconShield,
  IconSpark,
  IconSuspension,
  IconTire,
  IconTools,
  IconTrack,
  IconUser,
} from "@/lib/icons";

// Resolve all copy/data for the active locale.
//
// O catálogo de aulas pode vir da rede: publicar aula nova passa a ser um
// deploy do site, sem build nem revisão de loja. A lista embutida continua
// sendo a base — a remota só entra quando existe e é válida, então rede ruim,
// primeira abertura e modo avião seguem mostrando o app cheio.
export function useContent() {
  const { locale } = useI18n();
  const base = getContent(locale);
  const remoto = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return useMemo(() => {
    if (!remoto) return base;
    const cursos = cursosParaIdioma(remoto, locale);
    return { ...base, lessons: paraIdioma(remoto, locale), ...(cursos ? { courses: cursos } : {}) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, remoto, locale]);
}

/** Os ids das aulas mais vistas por todo mundo (catálogo remoto), ou vazio. */
export function usePopulares(): string[] {
  const remoto = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return useMemo(() => populares(remoto), [remoto]);
}

const ICON_REGISTRY: Record<string, (p: { className?: string }) => JSX.Element> = {
  tools: IconTools,
  car: IconCar,
  moto: IconMoto,
  track: IconTrack,
  community: IconCommunity,
  diagnose: IconDiagnose,
  consult: IconConsult,
  home: IconHome,
  user: IconUser,
  check: IconCheck,
  alert: IconAlert,
  calendar: IconCalendar,
  plus: IconPlus,
  explore: IconCompass,
  spark: IconSpark,
  gauge: IconGauge,
  clock: IconClock,
  book: IconBook,
  settings: IconSettings,
  engine: IconEngine,
  brakes: IconBrake,
  suspension: IconSuspension,
  tires: IconTire,
  electrical: IconBolt,
  shield: IconShield,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICON_REGISTRY[name] ?? IconCheck;
  return <Cmp className={className} />;
}

/**
 * Links para os Termos de Uso e a Política de Privacidade.
 *
 * Existe como componente para não haver "a versão do paywall" e "a versão do
 * onboarding": a Apple exige esses dois links em TODA tela onde a assinatura é
 * vendida, e a versão anterior tinha três cópias soltas — todas apontando para
 * `/privacidade`, inclusive a dos termos, e todas relativas, o que dentro do
 * app da loja não levava a lugar nenhum. Foi o que reprovou a versão pela
 * diretriz 3.1.2(c).
 */
export function LegalLinks({ className = "", underline = false }: { className?: string; underline?: boolean }) {
  const { locale } = useI18n();
  const c = useContent();
  const cls = `hover:text-cream ${underline ? "underline underline-offset-2" : ""}`;
  return (
    <span className={`inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 ${className}`}>
      <a href={termsUrl(locale)} target="_blank" rel="noreferrer" className={cls}>{c.subscribe.termsLink}</a>
      <span aria-hidden>·</span>
      <a href={privacyUrl(locale)} target="_blank" rel="noreferrer" className={cls}>{c.subscribe.privacyLink}</a>
    </span>
  );
}

// The phone frame: centers a fixed-width column on a graphite backdrop so the
// web prototype reads as a device. Children scroll inside.
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="app-backdrop min-h-screen w-full overflow-x-hidden text-cream antialiased">
      <div className="app-col flex min-h-screen flex-col bg-graphite pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] shadow-card sm:my-0 sm:min-h-screen">
        {children}
      </div>
    </div>
  );
}

// Small "Premium" pill.
export function PremiumBadge({ className }: { className?: string }) {
  return <span className={`inline-flex items-center gap-0.5 rounded-md bg-amber/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber ${className ?? ""}`}>★ Premium</span>;
}

// "Recomendado para o seu carro" pill.
export function RecoBadge({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center gap-1 rounded-md bg-teal/15 px-1.5 py-0.5 text-[10px] font-medium text-teal">✦ {children}</span>;
}

// O PORTÃO ÚNICO DO PREMIUM (06/10/2026, aposta 9 de
// docs/design/limpeza-visual-nubank.md, antecipada a pedido do dono: "dar mais
// destaque para o Premium, para o usuário entender o que está perdendo").
//
// Até aqui o app dizia "isso é pago" de seis jeitos: banner com quatro
// contextos, card trancado, preview borrado, cadeado por item, card no fim do
// Início, caixa no chat. A pessoa aprendia seis linguagens para a mesma
// mensagem, e nenhuma dizia O QUE ela ganharia. Agora é uma linha só, igual em
// toda tela: o rótulo "Premium", o título é o que a pessoa GANHA, a linha de
// contexto diz o que destrava (os benefícios do próprio paywall daquele
// contexto), e a seta leva ao paywall com o `ctx` de sempre, então
// `viu_paywall` por contexto continua dizendo onde o valor está.
export function LinhaPremium({ ctx, titulo, sub, className }: { ctx: string; titulo: string; sub?: string; className?: string }) {
  const { go } = useNav();
  const c = useContent();
  // Modo leitor (só Android): sem convites de assinatura.
  if (!sellsInApp()) return null;
  const beneficios = (c.paywalls as Record<string, { benefits?: string[] } | undefined>)[ctx]?.benefits ?? [];
  const contexto = sub ?? (beneficios.length ? beneficios.slice(0, 2).join(" · ") : c.common.unlock);
  // COM CONTORNO ÂMBAR (06/10/2026, dono: "coloque uma cor em volta dos
  // premiuns, para dar um destaque maior"). É a única linha do app com borda
  // de cor, de propósito: o resto separa por fio, e o portão do Premium é o
  // que tem que saltar.
  return (
    <Linha
      data-premium={ctx}
      className={["my-2 rounded-2xl border border-amber/40 bg-amber/[0.06] px-3.5 last:border-b", className].filter(Boolean).join(" ")}
      esquerda={
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber/15 text-amber">
          <IconLock className="h-4 w-4" />
        </span>
      }
      rotulo={c.common.premium}
      titulo={titulo}
      sub={contexto}
      direita={<IconArrow className="h-4 w-4 shrink-0 text-amber" />}
      onClick={() => go({ name: "subscribe", ctx })}
    />
  );
}

// Os dois nomes antigos continuam existindo para as telas que os chamam, e
// desenham a mesma linha: trocar o visual num lugar troca em todas.
export function UpgradeBanner({ ctx, text }: { ctx: string; text: string }) {
  return <LinhaPremium ctx={ctx} titulo={text} className="mt-3" />;
}

export function LockedCard({ ctx, title, body }: { ctx: string; title: string; body?: string }) {
  return <LinhaPremium ctx={ctx} titulo={title} sub={body} />;
}

// Standard screen header: back arrow (when the nav stack can pop) + title.
// Bloom-style header: back arrow on the left, title centered, right slot
// (optional action) balanced by a spacer so the title stays truly centered.
export function AppHeader({ title, subtitle, action, onBack }: { title: string; subtitle?: string; action?: ReactNode; onBack?: () => void }) {
  const { canBack, back } = useNav();
  const showBack = onBack ? true : canBack;
  const doBack = onBack ?? back;

  return (
    <header className="flex items-center gap-3 pb-3 pt-5">
      {showBack ? (
        <button onClick={doBack} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-graphite-700 text-cream/70 hover:text-cream" aria-label="back">
          <IconArrow className="h-4 w-4 rotate-180" />
        </button>
      ) : (
        <span className="h-9 w-9 shrink-0" />
      )}
      <div className="min-w-0 flex-1 text-center">
        {/* Display, não serifa (06/10/2026): a serifa ficou só na pergunta do
            Início, que é a voz da marca; o resto do app tem uma fonte de título. */}
        <h1 className="text-balance font-display text-xl font-semibold leading-tight tracking-normal text-cream">{title}</h1>
        {subtitle ? <p className="truncate text-xs text-cream/55">{subtitle}</p> : null}
      </div>
      {/* Largura mínima de um botão, mas aceita dois (o chat do Biela tem
          sintomas e nova conversa). O título continua centrado pelo flex-1. */}
      <span className="flex h-9 min-w-9 shrink-0 items-center justify-end" style={{ minWidth: 36 }}>{action}</span>
    </header>
  );
}

// Shared input styling for forms.
export const inputCls =
  "w-full rounded-xl bg-graphite-800 px-3.5 py-3 text-cream ring-1 ring-white/10 outline-none placeholder:text-cream/40 focus:ring-amber";

// Free-text input with a suggestion dropdown (same pattern as the car brand
// field): the list opens on focus and filters as you type. `options` are the
// candidate suggestions; the user can still type anything not in the list.
export function Autocomplete({
  value,
  onChange,
  options,
  placeholder,
  className,
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
  inputMode?: "text" | "numeric";
}) {
  const [open, setOpen] = useState(false);
  const q = value.trim().toLowerCase();
  const matches = options.filter(
    (o) => !q || (o.toLowerCase().includes(q) && o.toLowerCase() !== q)
  );
  return (
    <div className={`relative ${className ?? ""}`}>
      <input
        value={value}
        inputMode={inputMode}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        placeholder={placeholder}
        autoComplete="off"
        className={inputCls}
      />
      {open && matches.length > 0 && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl bg-graphite-700 p-1 shadow-card ring-1 ring-white/10">
          {matches.map((m) => (
            <button
              key={m}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(m); setOpen(false); }}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-cream hover:bg-white/5"
            >
              {m}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Chip({
  active,
  children,
  onClick,
  className,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full px-3.5 py-1.5 text-sm font-display transition-colors ring-1",
        active ? "bg-amber text-graphite ring-amber" : "bg-graphite-700 text-cream/80 ring-white/10 hover:bg-graphite-600",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}

const SEVERITY_COLOR: Record<Severity, string> = {
  high: "bg-coral",
  medium: "bg-amber",
  low: "bg-teal",
};

export function SeverityDot({ level }: { level: Severity }) {
  return <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${SEVERITY_COLOR[level]}`} />;
}

// Small badge marking a row's access tier.
export function AccessBadge({ access }: { access: Access }) {
  const content = useContent();
  if (access === "free") {
    return <span className="rounded-md bg-teal/15 px-2 py-0.5 text-[11px] font-medium text-teal">{content.common.free}</span>;
  }
  const label = access === "consulting" ? content.common.consulting : content.common.premium;
  const tone = access === "consulting" ? "bg-coral/15 text-coral" : "bg-amber/15 text-amber";
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${tone}`}>
      <IconLock className="h-3 w-3" />
      {label}
    </span>
  );
}

// A list row whose detail is gated. Free rows render fully; gated rows show the
// title but route the tap to the paywall (the lock pattern, spec §5).
export function GateRow({
  title,
  subtitle,
  access,
  left,
  right,
  onLockedTap,
}: {
  title: string;
  subtitle?: string;
  access: Access;
  left?: ReactNode;
  right?: ReactNode;
  onLockedTap?: () => void;
}) {
  const gated = access !== "free";
  return (
    <button
      type="button"
      onClick={gated ? onLockedTap : undefined}
      className={[
        "flex w-full items-center gap-3 rounded-xl bg-graphite-800 px-3.5 py-3 text-left ring-1 ring-white/5",
        gated ? "hover:ring-amber/30" : "cursor-default",
      ].join(" ")}
    >
      {left}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-[15px] text-cream">{title}</span>
        {subtitle ? <span className="block truncate text-xs text-cream/55">{subtitle}</span> : null}
      </span>
      {right ?? <AccessBadge access={access} />}
    </button>
  );
}

// SEM ANEL DESDE 06/10/2026 (limpeza visual, docs/design/limpeza-visual-nubank.md):
// o card tinha fundo E borda, e borda dentro de borda era o que deixava a tela
// pesada. O fundo sozinho já separa; o resto é respiro.
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={["rounded-2xl bg-graphite-800 p-4", className].filter(Boolean).join(" ")}>{children}</div>;
}

// A LINHA (06/10/2026): a unidade de tela da limpeza visual, no lugar do card.
//
// É a gramática do Nubank lida em docs/design/limpeza-visual-nubank.md: um
// rótulo pequeno em cima (opcional), o título, uma linha de contexto, e a
// seta. Linhas se separam por um fio de 1px, não por caixa. O detalhe mora um
// toque abaixo. Quem precisa de um número grande usa `valor`, que vem no
// lugar do título em tamanho de display.
export function Linha({
  rotulo,
  titulo,
  valor,
  sub,
  esquerda,
  direita,
  onClick,
  tom = "normal",
  className,
  ...resto
}: {
  rotulo?: string;
  titulo?: string;
  valor?: string;
  sub?: ReactNode;
  esquerda?: ReactNode;
  direita?: ReactNode;
  onClick?: () => void;
  tom?: "normal" | "alerta" | "mudo";
  className?: string;
} & Record<`data-${string}`, string | boolean | undefined>) {
  const corTitulo = tom === "alerta" ? "text-coral" : tom === "mudo" ? "text-cream/70" : "text-cream";
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={["flex w-full items-center gap-3 border-b border-white/[0.06] py-3.5 text-left", onClick ? "active:bg-white/[0.03]" : "", className].filter(Boolean).join(" ")}
      {...resto}
    >
      {esquerda}
      <span className="min-w-0 flex-1">
        {rotulo ? <span className="block text-[11px] uppercase tracking-wide text-cream/45">{rotulo}</span> : null}
        {valor ? <span className={`block font-display text-xl font-semibold leading-tight ${corTitulo}`}>{valor}</span> : null}
        {titulo ? <span className={`block font-display text-[15px] font-semibold leading-snug ${corTitulo}`}>{titulo}</span> : null}
        {sub ? <span className="mt-0.5 block text-xs leading-snug text-cream/55">{sub}</span> : null}
      </span>
      {direita !== undefined ? direita : onClick ? <IconArrow className="h-4 w-4 shrink-0 text-cream/35" /> : null}
    </Tag>
  );
}

// O ATALHO (06/10/2026): o botão redondo com rótulo de uma palavra, em fila
// de quatro, logo abaixo do número que a pessoa veio ver. É o "Pix, Pagar,
// Transferir" da home do Nubank.
export function Atalho({ icone, rotulo, onClick, ...resto }: { icone: string; rotulo: string; onClick: () => void } & Record<`data-${string}`, string | undefined>) {
  return (
    <button onClick={onClick} className="flex min-w-0 flex-1 flex-col items-center gap-1.5 py-1 active:scale-[0.97]" {...resto}>
      <span className="grid h-13 w-13 place-items-center rounded-full bg-graphite-800 text-amber" style={{ height: 52, width: 52 }}>
        <Icon name={icone} className="h-6 w-6" />
      </span>
      <span className="max-w-full truncate text-[12px] text-cream/80">{rotulo}</span>
    </button>
  );
}

// Campo de data que tolera digitação parcial.
//
// O <input type="date"> reporta valores intermediários enquanto a pessoa
// digita (ano "2025" passa por 0002, 0020, 0202...). O padrão antigo validava
// a CADA tecla e, ao rejeitar um intermediário, o React forçava o campo de
// volta ao valor guardado — apagando os segmentos já digitados. Aqui o campo
// segue a digitação livremente (rascunho local); um valor válido é entregue
// na hora, e um inválido só é corrigido quando a pessoa SAI do campo, preso
// ao limite mais próximo (min/max). Sair da tela no meio da digitação
// descarta o rascunho e mantém o último valor válido.
export function DateField({ value, min, max, onCommit, className }: {
  value: string;
  min?: string;
  max?: string;
  onCommit: (val: string) => void;
  className?: string;
}) {
  const [prev, setPrev] = useState(value);
  const [draft, setDraft] = useState(value);
  if (prev !== value) { setPrev(value); setDraft(value); } // mudou por fora (outro carro, restauração)
  const dentro = (val: string) => !val || ((!min || val >= min) && (!max || val <= max));
  return (
    <input
      type="date"
      value={draft}
      min={min}
      max={max}
      className={className}
      onChange={(e) => {
        const val = e.target.value;
        setDraft(val);
        if (dentro(val)) onCommit(val);
      }}
      onBlur={() => {
        if (dentro(draft)) return;
        const preso = min && draft < min ? min : max ?? draft;
        setDraft(preso);
        onCommit(preso);
      }}
    />
  );
}

// Capa de aula com fallback para o site.
//
// No app da loja as capas moram DENTRO do binário: capa adicionada depois do
// build não existe no aparelho e o <img> quebrava em silêncio. Aqui, quando o
// arquivo local falha, a mesma imagem é buscada em mentorque.com.br, que a
// Vercel já serve desde o deploy. Assim capa nova chega sem build (remota,
// exige internet) e vira local no build seguinte, voltando a abrir offline.
// A troca só acontece uma vez: a URL absoluta não começa com "/" e o onError
// não tem para onde escalar, então um 404 real não entra em laço.
export function Thumb({ src, className }: { src: string; className?: string }) {
  const [prev, setPrev] = useState(src);
  const [url, setUrl] = useState(src);
  if (prev !== src) { setPrev(src); setUrl(src); } // outra aula no mesmo card: recomeça do local
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      draggable={false}
      className={className}
      onError={() => {
        if (url.startsWith("/")) setUrl(`${siteOrigin()}${url.split("?")[0]}`);
      }}
    />
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2.5 mt-5 flex items-center justify-between">
      <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-cream/50">{children}</h3>
      {action}
    </div>
  );
}

// Bottom sheet overlay (paywall, diagnose, swap).
export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true">
      <button aria-label="close" className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative app-col animate-fade-up rounded-t-3xl bg-graphite-800 p-5 pb-[calc(1.75rem+env(safe-area-inset-bottom))] ring-1 ring-white/10">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-graphite-700 text-cream/70 hover:text-cream"
          aria-label="close"
        >
          <IconClose className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function ProgressDots({ total, index }: { total: number; index: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-amber" : i < index ? "w-1.5 bg-amber/50" : "w-1.5 bg-white/15"}`}
        />
      ))}
    </div>
  );
}

// Botão 📌 de fixar conteúdo na Home (seção "Fixados", abaixo do carro).
// Quadrado, entra ao lado de Concluir/Salvar no rodapé das aulas.
export function PinButton({ id }: { id: string }) {
  const c = useContent();
  const { s, toggleLessonPinned } = usePrototype();
  const pinned = (s.pinnedLessons ?? []).includes(id);
  return (
    <button
      onClick={() => toggleLessonPinned(id)}
      aria-label={pinned ? c.learn.pinned : c.learn.pin}
      title={pinned ? c.learn.pinned : c.learn.pin}
      className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-lg ring-1 transition-colors ${
        pinned ? "bg-amber/15 ring-amber" : "bg-transparent ring-white/15 opacity-60 hover:opacity-100"
      }`}
    >
      📌
    </button>
  );
}
