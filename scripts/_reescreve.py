# Troca o `body:` de uma aula em lib/app/conteudo/aulas.ts.
#
# Existe porque fazer isso com recorte de string à mão já quebrou o arquivo uma
# vez (sobrou um `]}),` duplicado e o tsc reclamou de sintaxe 700 linhas
# adiante). Aqui o começo e o fim do trecho são achados de um jeito só, e o
# resultado é conferido antes de gravar.
import sys, json

ARQ = "lib/app/conteudo/aulas.ts"


def bloco_do_body(s: str, marca: str) -> tuple[int, int]:
    """Devolve (inicio, fim) do trecho `body: [ ... ]` da aula, fim exclusivo."""
    i = s.index(marca)
    j = s.index("body: [", i)
    # TRAVA: o `body` achado tem de ser da MESMA aula. Sem isto, uma aula que
    # não tem campo `body` (existem: as que só têm need/steps/safety) faz a
    # busca cair no `body` da aula SEGUINTE e sobrescrever o conteúdo dela.
    # Aconteceu: o corpo de `tire-care` foi parar dentro de `fund-systems` e
    # apagou uma reescrita inteira, em silêncio, com o tsc passando.
    if 'id: "' in s[i + len(marca) : j]:
        raise SystemExit(
            f"{marca!r} não tem campo `body:` próprio — o `body` mais próximo é de outra aula.\n"
            "Some `body: [],` na aula antes de reescrever."
        )
    # Acha o `]` que FECHA este `[`, contando profundidade. Procurar por um
    # texto de fechamento ("\n  ]}),") parecia funcionar e não funciona: um
    # `body` escrito numa linha só não tem esse texto, a busca passa direto e
    # engole a aula inteira até o próximo fechamento parecido. Foi assim que
    # `fund-calendar` perdeu os `steps` e o `safety` de uma vez.
    d = 0
    for k in range(j + len("body: ["), len(s)):
        c = s[k]
        if c == "[":
            d += 1
        elif c == "]":
            if d == 0:
                return j, k + 1
            d -= 1
    raise SystemExit(f"não achei o fim do body de {marca!r}")


def main() -> None:
    entrada = json.load(sys.stdin)
    s = open(ARQ, encoding="utf-8").read()
    for item in entrada:
        marca, corpo = item["marca"], item["corpo"].strip()
        ini, fim = bloco_do_body(s, marca)
        # O trecho substituído vai de `body: [` até o `]` que o fecha,
        # inclusive. O que vier depois (`}),` ou `,`) é do arquivo e fica.
        if not corpo.startswith("body: ["):
            raise SystemExit(f"{marca!r}: o corpo novo precisa começar com 'body: ['")
        s = s[:ini] + corpo.rstrip().rstrip(",") + "\n  ]" + s[fim:]
        print("reescrita:", marca)
    open(ARQ, "w", encoding="utf-8").write(s)


main()
