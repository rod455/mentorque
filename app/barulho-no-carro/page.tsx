import type { Metadata } from "next";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/stores";

// LP de palavra-chave: mentorque.com.br/barulho-no-carro
//
// Prima da /landing, e o oposto dela em um ponto decisivo. A /landing é de
// tráfego pago: fica FORA do índice de propósito, não tem link nenhum além dos
// selos e existe para o clique de download. Esta aqui é de tráfego orgânico:
// ela precisa ser INDEXÁVEL, precisa ter link interno, e precisa ganhar a
// posição sendo útil de graça, mesmo para quem nunca vai baixar o app. Página
// que só repete o discurso de venda com uma palavra-chave no título é porta de
// entrada vazia, e é exatamente o que o Google despriorizou.
//
// O ângulo é o método, não a lista de doenças: "barulho no carro" é uma busca
// que quase sempre vem com o som ainda fresco na cabeça de quem digitou, e a
// primeira coisa útil que alguém pode oferecer é COMO ESTREITAR a possibilidade
// (pelo momento em que o som aparece), não um catálogo de peças.
//
// Regras que valem para toda página deste tipo, e o motivo de cada uma:
//   - Sem número inventado. Nada de "90% dos casos" nem "economize R$ X": não
//     temos essa medição, e conteúdo de manutenção com número falso é o tipo de
//     erro que destrói confiança de uma vez só.
//   - Sem preço. Faixa de valor muda por região, por carro e por mês; publicar
//     no site vira promessa. Dentro do app ela é estimativa contextualizada ao
//     carro da pessoa, aqui seria um preço solto.
//   - Sem certeza mecânica absoluta. "Costuma ser", "pode indicar", "na maioria
//     dos carros". Ninguém diagnostica um carro por texto, e a página diz isso
//     com todas as letras em vez de fingir que diagnostica.
//   - Sem depoimento. A /landing usa três depoimentos ilustrativos; numa página
//     indexável isso seria avaliação fabricada, então eles NÃO vêm para cá.
//     Quando houver avaliação real nas lojas, aí entra, com a fonte.
//
// Renderiza no servidor sem nenhum "use client": o HTML que o robô recebe já
// vem com o texto inteiro, sem depender de JavaScript.

const URL_PAGINA = "/barulho-no-carro";

export const metadata: Metadata = {
  title: "Barulho no carro: como descobrir o que pode ser | Mentorque",
  description:
    "Guia para identificar barulho no carro pelo momento em que o som aparece: freando, virando o volante, em buracos, acelerando ou parado. Entenda a urgência e chegue na oficina sabendo o que perguntar.",
  keywords: [
    "barulho no carro",
    "barulho ao frear",
    "barulho na suspensão",
    "barulho ao virar o volante",
    "que barulho é esse no carro",
  ],
  alternates: { canonical: URL_PAGINA },
  openGraph: {
    type: "article",
    title: "Barulho no carro: como descobrir o que pode ser",
    description:
      "Identifique o barulho pelo momento em que ele aparece, entenda a urgência e chegue na oficina sabendo o que perguntar.",
    url: URL_PAGINA,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Mentorque" }],
  },
};

// ── Conteúdo ────────────────────────────────────────────────────────────────
//
// As causas prováveis conversam de propósito com o diagnóstico por sintoma do
// app (lib/app/content.ts): brake-noise, suspension-noise, steering-vibration,
// engine-misfire. Página e app precisam dizer a mesma coisa, senão quem baixa
// depois de ler aqui encontra outro conteúdo e perde a confiança nos dois.

type Bloco = {
  id: string;
  quando: string;
  som: string;
  causas: string[];
  observar: string[];
  urgencia: { rotulo: string; tom: "alta" | "media" | "baixa"; texto: string };
};

const BLOCOS: Bloco[] = [
  {
    id: "freando",
    quando: "Aparece quando você pisa no freio",
    som: "Chiado agudo, rangido metálico ou um raspar contínuo que some assim que você tira o pé.",
    causas: [
      "Pastilhas no fim do curso. A maioria dos carros modernos traz uma lingueta de metal que encosta no disco justamente para chiar e avisar antes de acabar o material.",
      "Disco empenado ou marcado, que costuma vir acompanhado de trepidação no pedal.",
      "Pinça travada, quando o barulho não some ao soltar o freio e uma roda esquenta mais que as outras.",
      "Pastilha nova ainda em assentamento, que pode chiar nos primeiros dias sem indicar defeito.",
    ],
    observar: [
      "O barulho aumenta em frenagem forte ou aparece já na frenagem leve?",
      "O pedal treme ou vibra junto com o som?",
      "Vem de uma roda só ou dos dois lados?",
    ],
    urgencia: {
      rotulo: "Atenção",
      tom: "media",
      texto:
        "Freio é sistema de segurança, e chiado que virou raspar seco costuma significar que o material de atrito acabou. Vale marcar a inspeção em vez de deixar para a próxima revisão.",
    },
  },
  {
    id: "buraco",
    quando: "Aparece ao passar em buraco, lombada ou piso ruim",
    som: "Estalo seco, batida oca ou um 'toc-toc' que acompanha as irregularidades da rua.",
    causas: [
      "Bieletas e buchas da barra estabilizadora, origem de boa parte dos estalos de suspensão.",
      "Amortecedores gastos, que raramente quebram de uma vez: eles vão perdendo firmeza e você só percebe depois de trocar.",
      "Batentes ressecados ou coxins do amortecedor, que endurecem com o tempo e passam a bater.",
      "Algo solto que não é suspensão, de protetor de cárter a peça do escapamento encostando na carroceria.",
    ],
    observar: [
      "O barulho é sempre no mesmo canto do carro?",
      "O carro continua balançando depois de uma ondulação, em vez de assentar de uma vez?",
      "Piorou depois de um impacto específico, tipo um buraco fundo?",
    ],
    urgencia: {
      rotulo: "Atenção",
      tom: "media",
      texto:
        "Costuma piorar devagar e mexe com estabilidade e desgaste de pneu. Não é motivo para parar o carro hoje, mas é o tipo de item que fica mais caro quanto mais espera.",
    },
  },
  {
    id: "volante",
    quando: "Aparece ao virar o volante",
    som: "Zumbido que muda com o esterço, estalo ritmado em curva fechada ou rangido ao manobrar parado.",
    causas: [
      "Junta homocinética, quando o estalo é ritmado, aparece em curva fechada e acompanha a velocidade da roda.",
      "Rolamento de roda, que costuma dar um zumbido que muda de volume conforme o carro pende para um lado.",
      "Direção elétrica ou hidráulica reclamando, comum ao esterçar com o carro parado.",
      "Suspensão sob torção, quando buchas já gastas aparecem só na curva.",
    ],
    observar: [
      "Só em um sentido do volante ou nos dois?",
      "Aparece parado, andando devagar, ou em velocidade?",
      "O volante ficou mais pesado ou mais leve do que era?",
    ],
    urgencia: {
      rotulo: "Atenção",
      tom: "media",
      texto:
        "Rolamento e junta homocinética são itens que dão aviso antes de falhar, e o aviso é justamente esse barulho. Vale diagnosticar antes de viagem longa.",
    },
  },
  {
    id: "acelerando",
    quando: "Aparece ao acelerar",
    som: "Estouro, falha, apito agudo que sobe com a rotação ou um ronco que ficou mais alto do que era.",
    causas: [
      "Falha de ignição por velas, cabos ou bobinas, que costuma vir com solavanco e às vezes com a luz do motor.",
      "Escapamento furado ou com junta vazando, quando o ronco aumentou sem você ter mexido em nada.",
      "Correia de acessórios patinando, no caso de apito que aparece na aceleração e some depois.",
      "Turbo, nos carros que têm: apito agudo que acompanha a aceleração merece diagnóstico, ainda mais junto com perda de força.",
    ],
    observar: [
      "A luz do motor acendeu? Ela está fixa ou piscando?",
      "Perdeu força, engasgou ou o consumo mudou?",
      "O som acompanha a rotação do motor ou a velocidade do carro?",
    ],
    urgencia: {
      rotulo: "Prioridade",
      tom: "alta",
      texto:
        "Luz do motor PISCANDO junto com falha é o caso em que a recomendação dos fabricantes é evitar acelerar e procurar diagnóstico, porque falha de combustão pode danificar o catalisador.",
    },
  },
  {
    id: "parado",
    quando: "Aparece com o carro parado, em marcha lenta",
    som: "Tique-taque, chiado, zumbido de fundo ou uma trepidação nova que balança o câmbio e o volante.",
    causas: [
      "Coxins do motor ou do câmbio ressecados, causa comum de trepidação que apareceu 'do nada'.",
      "Correia de acessórios ou tensor, quando o chiado está lá desde a partida e some ao aquecer.",
      "Ventoinha do radiador entrando, que é normal, principalmente parado no trânsito e com ar ligado.",
      "Marcha lenta irregular por sujeira no corpo de borboleta ou por falha de ignição em um cilindro.",
    ],
    observar: [
      "O som muda quando você liga o ar-condicionado?",
      "Some depois que o motor aquece?",
      "Vem acompanhado de cheiro diferente ou de luz no painel?",
    ],
    urgencia: {
      rotulo: "Observar",
      tom: "baixa",
      texto:
        "Boa parte do que se ouve parado é comportamento normal do carro que você só passou a notar. Anote em que situação aparece e leve essa informação para a próxima revisão.",
    },
  },
  {
    id: "velocidade",
    quando: "Um som constante que aumenta com a velocidade",
    som: "Zumbido de fundo, como um avião distante, que cresce conforme o velocímetro sobe.",
    causas: [
      "Pneu com desgaste irregular, que costuma ser a causa mais comum e a mais barata de resolver.",
      "Rolamento de roda, quando o zumbido muda ao fazer uma curva longa para um lado e para o outro.",
      "Pneu fora do padrão do carro, incluindo medida trocada em uma troca recente.",
      "Alinhamento e balanceamento fora do ponto, que costumam vir junto com vibração no volante.",
    ],
    observar: [
      "Muda quando você troca de faixa em curva longa?",
      "Os pneus estão gastando mais de um lado da banda de rodagem?",
      "Começou logo depois de trocar ou rodiziar pneus?",
    ],
    urgencia: {
      rotulo: "Atenção",
      tom: "media",
      texto:
        "Vale começar pelo mais barato: olhar o desgaste dos pneus e a calibragem antes de autorizar qualquer serviço de suspensão.",
    },
  },
];

const PARE_AGORA = [
  "Cheiro de queimado junto com o barulho, principalmente depois de descida longa ou de frear muito.",
  "Luz vermelha no painel acesa junto com o som: óleo, temperatura ou freio.",
  "Pedal de freio afundando mais que o normal ou com sensação de esponja.",
  "Barulho metálico forte vindo de uma roda, que aumenta com a velocidade e não some.",
  "Fumaça, vazamento visível embaixo do carro ou perda súbita de força.",
];

const OFICINA = [
  {
    titulo: "Grave o som no celular",
    texto:
      "Trinta segundos com a janela aberta na situação em que o barulho aparece valem mais que qualquer descrição. Mecânico bom reconhece som, e som gravado não depende da sua memória.",
  },
  {
    titulo: "Anote QUANDO ele aparece",
    texto:
      "Frio ou quente, parado ou andando, virando para que lado, em que velocidade. É exatamente esse recorte que estreita a investigação e encurta a mão de obra de diagnóstico.",
  },
  {
    titulo: "Peça orçamento detalhado",
    texto:
      "Peça e mão de obra separadas, item por item. Orçamento com um valor único e a palavra 'revisão' é o formato que mais esconde serviço que você não pediu.",
  },
  {
    titulo: "Peça a peça velha de volta",
    texto:
      "É um direito seu e é o jeito mais simples de conferir que a troca aconteceu. Só avise antes do serviço, não depois.",
  },
];

const FAQ = [
  {
    p: "Dá para descobrir o barulho do carro pela internet?",
    r: "Dá para estreitar bastante as possibilidades, e é isso que este guia faz. Diagnóstico fechado, não: ele depende de ouvir o carro, inspecionar e às vezes rodar com ele. O que um guia bem-feito entrega é você chegar na oficina sabendo o que perguntar, em vez de aceitar a primeira resposta.",
  },
  {
    p: "Barulho ao frear é sempre pastilha gasta?",
    r: "Não. Pastilha no fim é a causa mais comum, porque a maioria dos carros tem uma lingueta que chia de propósito para avisar. Mas disco empenado, pinça travada e até pastilha nova em assentamento fazem barulho parecido. A diferença costuma estar no detalhe: se o pedal treme, se o som some ao soltar o freio, se vem de um lado só.",
  },
  {
    p: "Posso continuar dirigindo com barulho no carro?",
    r: "Depende do barulho e de quem olhou. Estalo de suspensão em buraco geralmente permite rodar até marcar a oficina. Já barulho junto com luz vermelha no painel, cheiro de queimado ou pedal de freio esponjoso é caso de parar em lugar seguro e procurar ajuda. Na dúvida, trate como o caso mais sério.",
  },
  {
    p: "O que é aquele chiado que some quando o motor esquenta?",
    r: "Costuma ser correia de acessórios ou tensor: com o motor frio a borracha está mais dura e escorrega, e ao aquecer o chiado some. Não é o único motivo possível, mas é o primeiro item que um mecânico costuma checar quando o som tem esse padrão.",
  },
  {
    p: "O Mentorque diz qual é o problema do meu carro?",
    r: "O Mentorque mostra as causas prováveis para o sintoma que você descreve, a urgência típica de cada uma e um checklist para levar na oficina, tudo ajustado ao carro que você cadastra. Ele te prepara para a conversa com o mecânico, não substitui a inspeção presencial.",
  },
];

// FAQPage estruturado: mesma pergunta e mesma resposta que aparecem na tela.
// Marcação que não bate com o texto visível é violação de diretriz do Google e
// derruba o rich result inteiro, então as duas leem do mesmo array.
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.p,
    acceptedAnswer: { "@type": "Answer", text: f.r },
  })),
};

// ── Peças de layout ─────────────────────────────────────────────────────────

const TOM: Record<Bloco["urgencia"]["tom"], string> = {
  alta: "bg-coral/15 text-coral ring-coral/25",
  media: "bg-amber/15 text-amber ring-amber/25",
  baixa: "bg-teal/15 text-teal ring-teal/25",
};

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      {/* Cabeçalho próprio: o Header do site é feito de âncoras da home
          (#features, #plans) e num subpágina levaria a lugar nenhum. Aqui basta
          o caminho de volta, que também é o link interno que o robô segue. */}
      <header className="border-b border-white/5 px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2.5" aria-label="Mentorque">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/mark.svg" alt="" className="h-7 w-7" />
            <span className="font-display text-sm font-semibold text-cream/80">Mentorque</span>
          </a>
          <a href="/" className="text-sm text-cream/55 transition-colors hover:text-cream">
            Ver o app
          </a>
        </div>
      </header>

      <main className="px-5 sm:px-8">
        {/* 1. ABERTURA */}
        <section className="mx-auto max-w-3xl pb-10 pt-12">
          <p className="font-display text-xs font-semibold uppercase tracking-widest text-amber">Guia de diagnóstico</p>
          <h1 className="mt-3 font-serif text-4xl font-bold leading-tight sm:text-5xl">
            Barulho no carro: descubra o que pode ser antes de ir na oficina
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-cream/75">
            Quase todo mundo procura por &ldquo;barulho no carro&rdquo; com o som ainda fresco na cabeça e uma lista enorme de
            possibilidades pela frente. A boa notícia é que existe um atalho, e ele não é decorar peça: é reparar em QUANDO o
            barulho aparece. Freando, virando, em buraco, acelerando ou parado. Cada momento aponta para um conjunto diferente
            de suspeitos.
          </p>
          <p className="mt-4 leading-relaxed text-cream/60">
            Este guia não diagnostica o seu carro, e nenhum texto na internet consegue fazer isso com honestidade. O que ele
            faz é te dar o vocabulário e as perguntas certas, para você chegar na oficina sabendo do que se trata em vez de
            aceitar a primeira resposta que aparecer.
          </p>

          <nav aria-label="Índice do guia" className="mt-8 rounded-2xl bg-graphite-800 p-5 ring-1 ring-white/5">
            <p className="font-display text-sm font-semibold text-cream">Quando o seu barulho aparece?</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {BLOCOS.map((b) => (
                <li key={b.id}>
                  <a href={`#${b.id}`} className="text-sm text-cream/70 underline decoration-white/20 underline-offset-4 hover:text-amber">
                    {b.quando}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </section>

        {/* 2. OS BLOCOS POR MOMENTO */}
        <section className="mx-auto max-w-3xl space-y-6 py-6">
          {BLOCOS.map((b) => (
            <article key={b.id} id={b.id} className="scroll-mt-6 rounded-2xl bg-graphite-800 p-6 ring-1 ring-white/5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="font-serif text-2xl font-bold leading-snug">{b.quando}</h2>
                <span className={`shrink-0 rounded-full px-3 py-1 font-display text-[11px] font-semibold uppercase tracking-wider ring-1 ${TOM[b.urgencia.tom]}`}>
                  {b.urgencia.rotulo}
                </span>
              </div>

              <p className="mt-3 leading-relaxed text-cream/75">{b.som}</p>

              <h3 className="mt-6 font-display text-sm font-semibold uppercase tracking-wider text-cream/50">
                O que costuma estar por trás
              </h3>
              <ul className="mt-3 space-y-2.5">
                {b.causas.map((c) => (
                  <li key={c} className="flex gap-3 text-sm leading-relaxed text-cream/75">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>

              <h3 className="mt-6 font-display text-sm font-semibold uppercase tracking-wider text-cream/50">
                Repare nisto antes de ir na oficina
              </h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-cream/70">
                {b.observar.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>

              <p className="mt-6 rounded-xl bg-graphite-700/60 p-4 text-sm leading-relaxed text-cream/75">
                {b.urgencia.texto}
              </p>
            </article>
          ))}
        </section>

        {/* 3. O BLOCO DE SEGURANÇA */}
        <section className="mx-auto max-w-3xl py-10">
          <div className="rounded-2xl bg-coral/10 p-6 ring-1 ring-coral/25 sm:p-7">
            <h2 className="font-serif text-2xl font-bold">Quando não vale deixar para depois</h2>
            <p className="mt-3 leading-relaxed text-cream/75">
              A maioria dos barulhos permite marcar a oficina com calma. Estes sinais, não. Se algum deles estiver junto com o
              som, pare em lugar seguro e procure ajuda profissional antes de continuar:
            </p>
            <ul className="mt-4 space-y-2.5">
              {PARE_AGORA.map((s) => (
                <li key={s} className="flex gap-3 text-sm leading-relaxed text-cream/80">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 4. COMO CHEGAR NA OFICINA */}
        <section className="mx-auto max-w-3xl py-10">
          <h2 className="font-serif text-3xl font-bold">Como chegar na oficina sem pagar no escuro</h2>
          <p className="mt-3 leading-relaxed text-cream/70">
            Quatro hábitos que custam nada e mudam a conversa. Valem para qualquer barulho da lista acima.
          </p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {OFICINA.map((o, i) => (
              <div key={o.titulo} className="rounded-2xl bg-graphite-800 p-5 ring-1 ring-white/5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-amber/15 font-display font-bold text-amber">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-display text-base font-semibold text-cream">{o.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/70">{o.texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. CONVITE (honesto: diz o que o app faz, não promete resultado) */}
        <section className="mx-auto max-w-3xl py-10">
          <div className="rounded-2xl bg-graphite-800 p-6 ring-1 ring-white/5 sm:p-8">
            <h2 className="font-serif text-2xl font-bold">Levar isso para o seu carro</h2>
            <p className="mt-3 leading-relaxed text-cream/75">
              Este guia é geral de propósito, porque não sabe qual carro é o seu. No Mentorque você cadastra marca, modelo, ano
              e motor, descreve o sintoma com as suas palavras e recebe as causas prováveis, a urgência típica e o checklist
              para levar na oficina, ajustados ao seu carro. Também dá para registrar o que já foi feito, para o histórico não
              morar mais na sua memória.
            </p>
            <p className="mt-3 leading-relaxed text-cream/60">
              O plano gratuito cobre a garagem, o diagnóstico por sintoma e as aulas introdutórias, sem cartão.
            </p>
            <div className="mt-6">
              <Lojas />
            </div>
          </div>
        </section>

        {/* 6. FAQ */}
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
            Conteúdo educativo do Mentorque. Não substitui a inspeção de um profissional: o objetivo é te deixar mais bem
            informado na hora de decidir.
          </p>
          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            <a href="/" className="underline underline-offset-4 hover:text-cream">Mentorque</a>
            <a href="/privacidade" className="underline underline-offset-4 hover:text-cream">Privacidade</a>
            <a href="/termos" className="underline underline-offset-4 hover:text-cream">Termos</a>
          </p>
          <p className="mt-4 text-xs text-cream/35">© 2026 Mentorque</p>
        </div>
      </footer>
    </div>
  );
}
