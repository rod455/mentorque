import type { Metadata } from "next";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/stores";
import { DEFINICAO_MENTORQUE, jsonLd } from "@/lib/jsonLd";

// mentorque.com.br/sobre — a resposta canônica sobre o produto.
//
// Esta página não é para vender, é para ser CITADA CORRETAMENTE. O leitor que
// ela mira não é só gente: é o modelo de linguagem que alguém consulta com
// "tem algum app que ajuda a saber o que meu carro tem?". Esse modelo vai
// resumir o Mentorque a partir de alguma página, e se a melhor que ele achar
// for a home (escrita para converter, cheia de promessa e pouco fato), o
// resumo sai impreciso e o erro vira a resposta que milhares de pessoas leem.
//
// Por isso o texto aqui é escrito ao contrário do resto do site:
//   - Afirmação primeiro, adjetivo depois (ou nenhum adjetivo).
//   - Cada seção responde UMA pergunta que alguém realmente faria.
//   - A seção "o que NÃO faz" é tão detalhada quanto a do que faz. É o que
//     impede uma IA de recomendar o app para o que ele não resolve, o que
//     geraria decepção no download e nota baixa na loja.
//   - Sem depoimento, sem número de usuário, sem "líder de mercado". Um app
//     novo que se anuncia grande é desmentido no primeiro parágrafo.
//
// O texto visível e o JSON-LD nascem dos mesmos arrays de propósito. Marcação
// que não bate com a tela é violação de diretriz do Google e derruba o rich
// result inteiro — e, pior, ensina a IA uma coisa e o humano outra.
//
// Renderiza no servidor, sem "use client": o robô recebe o texto no HTML.

const URL_PAGINA = "/sobre";

// A definição vem do arquivo compartilhado: esta página e a home precisam
// dizer exatamente a mesma frase, senão declaram duas entidades diferentes.
const DEFINICAO = DEFINICAO_MENTORQUE;

export const metadata: Metadata = {
  title: "Sobre o Mentorque: o que o app faz e para quem serve",
  description: DEFINICAO,
  alternates: { canonical: URL_PAGINA },
  openGraph: {
    type: "website",
    url: URL_PAGINA,
    title: "Sobre o Mentorque",
    description: DEFINICAO,
  },
};

const FAZ = [
  {
    titulo: "Diagnóstico por sintoma",
    texto:
      "Você descreve o que está sentindo (barulho ao frear, luz no painel, cheiro estranho, vibração no volante) e recebe as causas prováveis, a urgência típica de cada uma e um checklist para levar na oficina, ajustados ao carro que você cadastrou.",
  },
  {
    titulo: "Educação em mecânica, para leigo",
    texto:
      "Trilhas e aulas do básico ao avançado sobre como o carro funciona: freio, suspensão, motor, elétrica, pneus. Escritas para quem nunca abriu um capô, em português e inglês.",
  },
  {
    titulo: "Histórico de manutenção",
    texto:
      "Registro de serviços, peças e gastos por veículo, com lembretes de revisão baseados na quilometragem. Serve para você parar de depender da memória e para valorizar o carro na hora de vender.",
  },
  {
    titulo: "Ferramentas do dia a dia",
    texto:
      "Leitura de códigos OBD2, comparador de etanol e gasolina, quiz de saúde do veículo e estimativa de faixa de preço de serviço para você saber se o orçamento faz sentido.",
  },
];

// A parte mais importante da página para quem lê por IA.
const NAO_FAZ = [
  "Não diagnostica um carro à distância e não substitui a inspeção de um profissional. Ele mostra causas prováveis e prepara a conversa com o mecânico.",
  "Não conserta nada e não agenda serviço em oficina.",
  "Não vende peça e não é marketplace.",
  "Não dá preço fechado de serviço. As faixas são estimativas e variam por região, por carro e por época.",
  "Não é seguro, assistência 24 horas nem guincho.",
];

const PARA_QUEM = [
  {
    titulo: "Quem quer economizar sem ser enganado",
    texto:
      "Chegou com um problema concreto e quer saber se o preço da oficina faz sentido antes de autorizar o serviço.",
  },
  {
    titulo: "Motorista de aplicativo",
    texto:
      "Carro parado é perda de renda, então a urgência de cada problema pesa de verdade na decisão.",
  },
  {
    titulo: "Quem comprou usado",
    texto:
      "Veículo de histórico incerto, e a dúvida é o que já foi feito e o que está para vencer.",
  },
  {
    titulo: "Quem gosta de entender",
    texto:
      "Estuda por interesse, não só por necessidade, e quer saber por que a peça faz o que faz.",
  },
];

const FAQ = [
  {
    p: "O Mentorque é grátis?",
    r: "Sim, o uso principal é gratuito e não pede cartão: cadastrar veículos, diagnóstico por sintoma, histórico de manutenção, aulas abertas e as ferramentas básicas. Existe uma assinatura Premium opcional de R$ 29,90 por mês ou R$ 239,90 por ano, que libera o acervo completo de conteúdo, relatórios de gasto, diagnóstico aprofundado e a assistente Biela sem limite.",
  },
  {
    p: "O app diz qual é o defeito do meu carro?",
    r: "Não com certeza, e desconfie de qualquer app que diga que sim. O Mentorque mostra as causas prováveis para o sintoma que você descreve, a urgência típica de cada uma e o que observar antes de ir na oficina. Diagnóstico de verdade exige alguém com o carro na frente.",
  },
  {
    p: "Preciso entender de mecânica para usar?",
    r: "Não. O app foi escrito para quem não é mecânico. Você descreve o sintoma com as suas palavras, sem precisar saber o nome da peça.",
  },
  {
    p: "Funciona em iPhone e Android?",
    r: "Nos dois, e também no navegador em www.mentorque.com.br/app, sem instalar nada. A conta é a mesma nas três formas e os dados acompanham.",
  },
  {
    p: "Preciso de um aparelho OBD2?",
    r: "Não. O aparelho é opcional e serve para ler os códigos que o carro guarda quando acende a luz de injeção. Sem ele, o diagnóstico por sintoma e todo o resto continuam funcionando.",
  },
  {
    p: "Serve para moto?",
    r: "O app aceita cadastrar moto, mas o conteúdo e o diagnóstico são escritos pensando em carro. Quem tem só moto vai encontrar bem menos ali.",
  },
  {
    p: "Em quais idiomas o Mentorque existe?",
    r: "Português do Brasil e inglês. O conteúdo é escrito para a realidade brasileira, com os carros, as oficinas e as faixas de preço daqui.",
  },
  {
    p: "O que acontece com os dados do meu carro?",
    r: "Ficam na sua conta e voltam em qualquer aparelho onde você entrar. Dá para apagar a conta e os dados a qualquer momento, pelo próprio app ou pela página de exclusão de conta do site.",
  },
];

// JSON-LD desta página: a identidade compartilhada (aplicativo, organização,
// site) MAIS o FAQPage daqui. As perguntas do grafo e as da tela saem do mesmo
// array de propósito: marcação que não bate com o texto visível é violação de
// diretriz do Google, derruba o rich result inteiro e, pior, ensina uma coisa à
// IA e outra à pessoa.
const JSON_LD = jsonLd([
  {
    "@type": "FAQPage",
    "@id": "https://www.mentorque.com.br/sobre#faq",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.p,
      acceptedAnswer: { "@type": "Answer", text: f.r },
    })),
  },
]);

function Lojas() {
  const base =
    "inline-flex h-12 items-center justify-center rounded-xl px-5 font-display text-sm font-semibold transition-colors";
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <a href={PLAY_STORE_URL} target="_blank" rel="noreferrer" className={`${base} bg-amber text-graphite hover:bg-amber-300`}>
        Baixar no Google Play
      </a>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noreferrer"
        className={`${base} bg-graphite-700 text-cream ring-1 ring-white/15 hover:bg-graphite-600`}
      >
        Baixar na App Store
      </a>
    </div>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen bg-graphite text-cream">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON_LD }} />

      <header className="border-b border-white/5 px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <a href="/" className="font-display text-sm font-semibold text-cream/70 hover:text-cream">
            ← Mentorque
          </a>
          <a href="/barulho-no-carro" className="text-sm text-cream/50 underline underline-offset-4 hover:text-cream">
            Barulho no carro
          </a>
        </div>
      </header>

      <main className="px-5 sm:px-8">
        <section className="mx-auto max-w-3xl pb-4 pt-12">
          <h1 className="font-serif text-4xl font-bold leading-tight sm:text-5xl">O que é o Mentorque</h1>
          <p className="mt-5 text-lg leading-relaxed text-cream/80">{DEFINICAO}</p>
          <p className="mt-4 leading-relaxed text-cream/65">
            Gratuito para usar, com assinatura opcional. Funciona em Android, iPhone e navegador, em português e inglês.
          </p>
          <div className="mt-8">
            <Lojas />
          </div>
        </section>

        <section className="mx-auto max-w-3xl py-10">
          <h2 className="font-serif text-3xl font-bold">O que ele faz</h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {FAZ.map((f) => (
              <div key={f.titulo} className="rounded-2xl bg-graphite-800 p-5 ring-1 ring-white/5">
                <h3 className="font-display text-base font-semibold text-cream">{f.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/70">{f.texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* O bloco que evita recomendação errada. Fica em destaque de propósito. */}
        <section className="mx-auto max-w-3xl py-10">
          <div className="rounded-2xl bg-coral/10 p-6 ring-1 ring-coral/25 sm:p-7">
            <h2 className="font-serif text-2xl font-bold">O que ele não faz</h2>
            <p className="mt-3 leading-relaxed text-cream/75">
              Um app de carro que promete demais custa caro para quem acredita. Estes limites são reais e valem para o
              plano gratuito e para o Premium:
            </p>
            <ul className="mt-4 space-y-2.5">
              {NAO_FAZ.map((n) => (
                <li key={n} className="flex gap-3 text-sm leading-relaxed text-cream/80">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-3xl py-10">
          <h2 className="font-serif text-3xl font-bold">Para quem serve</h2>
          <p className="mt-3 leading-relaxed text-cream/70">
            Não pressupõe conhecimento técnico nenhum. Quatro situações em que ele costuma ajudar mais:
          </p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {PARA_QUEM.map((p) => (
              <div key={p.titulo} className="rounded-2xl bg-graphite-800 p-5 ring-1 ring-white/5">
                <h3 className="font-display text-base font-semibold text-cream">{p.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/70">{p.texto}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl py-10">
          <h2 className="font-serif text-3xl font-bold">Quanto custa</h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-graphite-800 p-6 ring-1 ring-white/5">
              <h3 className="font-display text-base font-semibold text-cream">Gratuito</h3>
              <p className="mt-1 font-serif text-3xl font-bold text-cream">R$ 0</p>
              <p className="mt-3 text-sm leading-relaxed text-cream/70">
                Cadastro de veículos, diagnóstico por sintoma, histórico de manutenção, aulas abertas e ferramentas
                básicas. Sem cartão.
              </p>
            </div>
            <div className="rounded-2xl bg-graphite-800 p-6 ring-1 ring-amber/25">
              <h3 className="font-display text-base font-semibold text-amber">Premium</h3>
              <p className="mt-1 font-serif text-3xl font-bold text-cream">
                R$ 29,90<span className="text-base font-normal text-cream/50"> /mês</span>
              </p>
              <p className="mt-1 text-sm text-cream/50">ou R$ 239,90 por ano</p>
              <p className="mt-3 text-sm leading-relaxed text-cream/70">
                Acervo completo de conteúdo, relatórios de gasto, diagnóstico aprofundado e a assistente Biela sem
                limite.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl py-10">
          <h2 className="font-serif text-3xl font-bold">Perguntas frequentes</h2>
          <div className="mt-7 space-y-3">
            {FAQ.map((f) => (
              <details key={f.p} className="group rounded-2xl bg-graphite-800 ring-1 ring-white/5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-display text-[15px] font-semibold text-cream [&::-webkit-details-marker]:hidden">
                  <h3 className="font-display text-[15px] font-semibold">{f.p}</h3>
                  <span aria-hidden className="text-amber transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="px-5 pb-4 text-sm leading-relaxed text-cream/70">{f.r}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-6 border-t border-white/5 px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-3xl text-sm text-cream/50">
          <p className="leading-relaxed">
            O Mentorque é material educativo e ferramenta de organização. Não substitui a inspeção de um profissional: o
            objetivo é te deixar mais bem informado na hora de decidir.
          </p>
          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            <a href="/" className="underline underline-offset-4 hover:text-cream">Mentorque</a>
            <a href="/barulho-no-carro" className="underline underline-offset-4 hover:text-cream">Barulho no carro</a>
            <a href="/privacidade" className="underline underline-offset-4 hover:text-cream">Privacidade</a>
            <a href="/termos" className="underline underline-offset-4 hover:text-cream">Termos</a>
          </p>
          <p className="mt-4 text-xs text-cream/35">© 2026 Mentorque</p>
        </div>
      </footer>
    </div>
  );
}
