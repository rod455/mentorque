import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getContent } from "@/lib/app/content";

// Catálogo de aulas servido pela rede, para publicar conteúdo sem gerar build.
//
// O app das lojas nasce com o catálogo embutido no binário — é ele que garante
// primeira abertura instantânea, funcionamento sem rede e uma tela cheia na
// revisão da Apple, que testa em conexão ruim de propósito. Esta rota entrega a
// versão mais recente; quando ela é mais nova, o app passa a usá-la e guarda
// para a próxima abertura.
//
// Só DADOS trafegam aqui. A diretriz 3.3.1 da Apple restringe baixar código
// executável; texto e metadados de conteúdo são livres, e é assim que qualquer
// app de notícia ou de curso funciona.
//
// O payload é bilíngue: `getContent` resolve o idioma na hora de montar, então
// chamamos as duas versões e casamos por id. Assim um único arquivo serve PT e
// EN, e não existe a chance de as duas listas divergirem.

export const revalidate = 300;

type Bilingue = { pt: string; en: string };
type AulaRemota = {
  id: string;
  title: Bilingue;
  body: Bilingue[];
  type: string;
  track: string;
  system?: string;
  premium?: boolean;
  make?: string;
  model?: string;
  difficulty?: string;
  traits?: string[];
  situations?: string[];
  media?: unknown;
  thumb?: string;
  addedAt?: string;
};

function montar(): AulaRemota[] {
  const pt = getContent("pt").lessons;
  const en = getContent("en").lessons;
  const porId = new Map(en.map((l) => [l.id, l]));

  const saida: AulaRemota[] = [];
  for (const a of pt) {
    const b = porId.get(a.id);
    // Sem par em inglês a aula fica de fora: melhor servir menos do que servir
    // um card que aparece vazio para metade dos usuários.
    if (!b || !a.body || !b.body || a.body.length !== b.body.length) continue;
    saida.push({
      id: a.id,
      title: { pt: a.title, en: b.title },
      body: a.body.map((texto, i) => ({ pt: texto, en: b.body![i] })),
      type: a.type,
      track: a.track,
      system: a.system,
      premium: a.premium,
      make: a.make,
      model: a.model,
      difficulty: a.difficulty,
      traits: a.traits,
      situations: a.situations,
      media: a.media,
      thumb: a.thumb,
      addedAt: a.addedAt,
    });
  }
  return saida;
}

export function GET() {
  const lessons = montar();
  // A versão é o resumo do próprio conteúdo: muda quando (e só quando) alguma
  // aula muda. O app compara com o que tem guardado e evita reescrever à toa.
  const version = createHash("sha1").update(JSON.stringify(lessons)).digest("hex").slice(0, 12);

  return NextResponse.json(
    { version, count: lessons.length, lessons },
    {
      headers: {
        // Cache curto na borda: publicar uma aula chega ao aparelho em minutos,
        // sem transformar cada abertura do app numa consulta ao servidor.
        "cache-control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
    }
  );
}
