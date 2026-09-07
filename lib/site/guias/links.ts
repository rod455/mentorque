// Os guias como LINK, e nada mais: caminho e o texto que aparece no rodapé.
//
// POR QUE ESTA LISTA EXISTE SEPARADA do registro em `index.ts`. O rodapé é
// componente de cliente, e importar o `GUIAS` de lá arrastaria o CORPO INTEIRO
// dos quatro guias para o pacote que o navegador baixa em toda página do site,
// para desenhar quatro links. O registro carrega parágrafos, blocos, FAQ e
// dados estruturados; aqui cabem duas palavras por guia.
//
// O PREÇO DE SEPARAR é o de sempre: duas listas divergem. Quem escrever o
// quinto guia vai mexer no `index.ts`, porque é de lá que sai a página, e não
// tem motivo nenhum para lembrar deste arquivo. Foi exatamente assim que os
// três guias publicados depois do primeiro ficaram sem link na home: o rodapé
// tinha o `/barulho-no-carro` escrito à mão de quando ele era o único.
//
// Por isso a `npm run conferir:guias` compara as duas listas e reprova se
// divergirem. A conferência é o que torna a separação segura; sem ela, isto
// aqui é só o mesmo defeito com outro nome.
export type LinkDeGuia = { caminho: string; rotulo: string };

export const LINKS_DOS_GUIAS: LinkDeGuia[] = [
  { caminho: "/barulho-no-carro", rotulo: "Barulho no carro" },
  { caminho: "/luz-da-injecao-acesa", rotulo: "Luz da injeção acesa" },
  { caminho: "/carro-nao-pega", rotulo: "Carro não pega" },
  { caminho: "/carro-gastando-muita-gasolina", rotulo: "Carro gastando gasolina" },
];
