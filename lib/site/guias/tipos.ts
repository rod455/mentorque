// A forma de um guia de sintoma do site.
//
// POR QUE ISTO VIROU TIPO EM VEZ DE CONTINUAR JSX SOLTO. A
// `/barulho-no-carro` nasceu como uma página inteira de 491 linhas, com a
// estrutura e o conteúdo misturados. Copiar aquilo três vezes seria copiar
// também as REGRAS que moram nos comentários dela (sem número inventado, sem
// preço, sem certeza mecânica, sem depoimento), e regra copiada é regra que
// diverge: bastaria uma das cópias esquecer um detalhe para a página virar
// outra coisa sem ninguém notar.
//
// Com um tipo e um componente só, cada guia novo é CONTEÚDO, e a estrutura
// (cabeçalho, índice, blocos, bloco de segurança, FAQ, dados estruturados,
// rodapé) é a mesma por construção. O `npm run conferir:guias` cobra as regras
// que antes eram só comentário.

/** Um trecho do guia: um momento, uma condição, um recorte do sintoma. */
export type Bloco = {
  /** Âncora da URL (#freando). Precisa ser estável: vira link que outros usam. */
  id: string;
  /** O título do bloco, escrito como a pessoa descreveria. */
  quando: string;
  /** A descrição sensorial, para a pessoa se reconhecer antes de ler causa. */
  som: string;
  causas: string[];
  observar: string[];
  urgencia: { rotulo: string; tom: "alta" | "media" | "baixa"; texto: string };
};

export type Pergunta = { p: string; r: string };

export type Guia = {
  /** Caminho da página, com barra na frente. É a chave do registro. */
  caminho: string;
  /** Etiqueta acima do H1. */
  rotulo: string;
  h1: string;
  /** `title` e `description` da aba e do resultado de busca. */
  tituloSeo: string;
  descricaoSeo: string;
  palavras: string[];
  /** Como o guia se apresenta nos links internos dos irmãos. */
  chamada: string;

  /** Parágrafos de abertura, na ordem. */
  abertura: string[];
  indiceTitulo: string;
  blocos: Bloco[];

  pareAgora: { titulo: string; intro: string; itens: string[] };
  oficina: { titulo: string; intro: string; cartoes: { titulo: string; texto: string }[] };
  convite: { titulo: string; texto: string };
  faq: Pergunta[];
};
