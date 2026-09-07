import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CORES, DESTAQUE_PERMITIDO, NOME_DA_SECAO, RESPIRO_DO_FEED, chapaDe, type Formato, type Secao } from "@/lib/pecas/chapas";
import { candidatosQueCabem } from "@/lib/pecas/conteudo";

// A peça de rede social, desenhada aqui e não num navegador.
//
// POR QUE AQUI (06/09/2026). O dono escolheu o n8n como agendador, e o n8n
// chama uma rota nossa. O renderizador local usa Chromium, e Chromium não roda
// numa função da Vercel sem um pacote pesado à parte. O `next/og` resolve isso
// por outro caminho: ele mede e desenha com Satori mais resvg, sem navegador
// nenhum, e aceita a fonte como arquivo em vez de depender de o sistema ter a
// fonte instalada.
//
// O PREÇO, e ele está escrito aqui para ninguém se surpreender: Satori não é um
// navegador. Ele entende um subconjunto de flexbox e ignora coisas como
// `text-wrap: balance`. Então o desenho daqui é PARECIDO com o do
// scripts/pecas.mjs, não idêntico. Ter dois renderizadores é dívida conhecida:
// a saída é o script passar a chamar esta rota, e isso está anotado como o
// próximo passo em docs/agentes/pecas.md.
//
// A rota é pública de leitura de propósito: ela só desenha texto que já está
// publicado no app (o banco do quiz) sobre uma chapa da marca. Não há dado de
// usuário, não há segredo, e o n8n precisa buscá-la sem carregar chave.

export const runtime = "nodejs";

const fonte = (arquivo: string) => readFileSync(join(process.cwd(), "assets/fontes", arquivo));

/**
 * Escolhe a peça a desenhar.
 *
 * `pular` é o que faz o "me manda outra" do Telegram funcionar: o n8n devolve
 * as fontes já recusadas e a rota anda para o próximo candidato. Sem isso, pedir
 * outra devolveria a mesma, porque a rotação é determinística de propósito.
 */
function escolhe(secao: Secao, formato: Formato, pular: string[]) {
  // Só entram candidatos que CABEM naquela chapa, medidos com navegador de
  // verdade e gravados em lib/pecas/cabem.json. Esta rota não mede: obedece.
  return candidatosQueCabem(secao, formato).find((p) => !pular.includes(p.fonte)) ?? null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secao = (url.searchParams.get("secao") ?? "desafio") as Secao;
  const formato = (url.searchParams.get("formato") ?? "feed") as Formato;
  const pular = (url.searchParams.get("pular") ?? "").split(",").map((s) => s.trim()).filter(Boolean);

  if (!NOME_DA_SECAO[secao]) return Response.json({ erro: `seção desconhecida: ${secao}` }, { status: 400 });
  if (formato !== "feed" && formato !== "stories") return Response.json({ erro: `formato desconhecido: ${formato}` }, { status: 400 });

  const formatoDoDesenho: Formato = formato === "stories" ? "stories" : "feed";
  const peca = escolhe(secao, formatoDoDesenho, pular);
  if (!peca) return Response.json({ erro: `acabaram os candidatos de ${NOME_DA_SECAO[secao]}` }, { status: 409 });

  // O modo lista existe para o n8n montar a legenda e saber o que recusar
  // depois, sem ter que adivinhar a partir da imagem.
  if (url.searchParams.get("formato") === "json" || url.searchParams.get("json") === "1") {
    return Response.json({ nome: NOME_DA_SECAO[secao], ...peca });
  }

  const chapa = chapaDe(secao, formato);
  const destaque = peca.destaque ?? "ambar";
  const cor = DESTAQUE_PERMITIDO[secao].includes(destaque) ? CORES[destaque] : CORES.ambar;
  const grande = formato === "stories";
  const z = chapa.texto;
  // A coluna estreita, para tudo que desce ao lado da Biela. O título pode usar
  // a faixa larga do topo, mas só quando a medição disse que ele cabe lá: essa
  // é a razão de `largo` vir do cabem.ts e não de um palpite desta rota.
  const estreito = z.x2 - z.x1;
  const larguraDoTitulo = peca.largo ? chapa.titulo.x2 - z.x1 : estreito;
  // A ESCALA DO CORPO vem medida, como o `largo`. O título não encolhe nunca.
  const px = (base: number) => Math.round(base * (peca.escala ?? 1));
  const chapaB64 = readFileSync(join(process.cwd(), "assets/pecas", formato, chapa.arquivo)).toString("base64");

  // As opções só entram no feed: no story elas viram a figurinha de quiz do
  // Instagram, que tem zona própria. Ver o comentário em scripts/pecas.mjs.
  const opcoes = grande ? [] : peca.opcoes ?? [];

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: chapa.largura, height: chapa.altura, position: "relative" }}>
        <img
          src={`data:image/png;base64,${chapaB64}`}
          width={chapa.largura}
          height={chapa.altura}
          style={{ position: "absolute", left: 0, top: 0 }}
          alt=""
        />
        {/*
          DUAS LARGURAS, e o motivo está em lib/pecas/chapas.ts: a Biela não é
          um retângulo. O título fica na faixa larga de cima; a citação, o corpo
          e as opções descem ao lado dela e usam a coluna estreita.
        */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            left: z.x1,
            top: z.y1 + (grande ? 0 : RESPIRO_DO_FEED),
            width: larguraDoTitulo,
            height: z.y2 - z.y1 - (grande ? 0 : RESPIRO_DO_FEED),
          }}
        >
          {peca.citacao ? (
            <div
              style={{
                display: "flex",
                fontFamily: "IN",
                color: CORES.giz,
                fontSize: px(grande ? 44 : 34),
                lineHeight: 1.3,
                width: estreito,
                marginBottom: px(grande ? 28 : 20),
              }}
            >
              {`“${peca.citacao}`}
            </div>
          ) : null}
          <div
            style={{
              fontFamily: "SG",
              fontWeight: 700,
              textTransform: "uppercase",
              color: cor,
              fontSize: grande ? 84 : 62,
              lineHeight: 1.04,
              // O MESMO ENTRELETRAS DO SCRIPT. Sem isto o Satori media o título
              // mais largo que o Chromium e quebrava numa linha a mais, o que
              // derrubava o corpo para fora da zona: a peça medida como boa
              // saía estourada. Quem mede é o script, então a rota precisa
              // desenhar com os mesmos números.
              letterSpacing: "-0.01em",
            }}
          >
            {peca.titulo}
          </div>
          {peca.corpo ? (
            <div
              style={{
                fontFamily: "IN",
                color: CORES.giz,
                fontSize: px(grande ? 46 : 34),
                lineHeight: 1.35,
                marginTop: px(grande ? 40 : 28),
                width: estreito,
              }}
            >
              {peca.corpo}
            </div>
          ) : null}
          {opcoes.length ? (
            <div style={{ display: "flex", flexDirection: "column", marginTop: px(34), width: estreito }}>
              {opcoes.map((o) => (
                <div key={o} style={{ display: "flex", alignItems: "flex-start", marginBottom: px(24) }}>
                  <div
                    style={{
                      width: px(30),
                      height: px(30),
                      borderRadius: px(30) / 2,
                      border: `3px solid ${CORES.giz}`,
                      marginRight: px(20),
                      marginTop: px(6),
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ fontFamily: "IN", color: CORES.giz, fontSize: px(32), lineHeight: 1.25 }}>{o}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    ),
    {
      width: chapa.largura,
      height: chapa.altura,
      fonts: [
        { name: "SG", data: fonte("space-grotesk-700.ttf"), weight: 700, style: "normal" },
        { name: "IN", data: fonte("inter-400.ttf"), weight: 400, style: "normal" },
        { name: "IN", data: fonte("inter-600.ttf"), weight: 600, style: "normal" },
      ],
      headers: {
        // A peça da semana muda uma vez por semana, e o n8n pode pedir a mesma
        // várias vezes numa conversa de aprovação. Uma hora de cache tira o
        // trabalho repetido sem congelar a troca de semana.
        "cache-control": "public, max-age=3600",
        // Para o n8n saber qual candidato veio, e poder mandar no "pular" da
        // próxima chamada quando o dono pedir outra.
        "x-peca-fonte": peca.fonte,
      },
    }
  );
}
