# Novidades da versão 2.6

Aberta em 13/09/2026, com a 2.5 pronta para o Codemagic. Tudo o que entra
aqui já roda na web pelo deploy da Vercel; o binário só importa para o app
das lojas.

## O que vai NO BINÁRIO

1. **Análise de orçamento por foto** (13/09, aprovada pelo dono a partir da
   proposta `docs/agentes/propostas/plataforma-10m.md`). A pessoa tira foto
   do orçamento da oficina; a Biela lê linha a linha, explica para que serve
   cada item, compara com a faixa da região quando há referência e monta as
   perguntas para fazer antes de aprovar. Nunca diz "está sendo enganado".
   Entra por três lugares: o checklist do sintoma, o formulário de serviço
   novo e a Biela. "Salvar no histórico" abre o serviço pré-preenchido
   (serviço principal, oficina, total, as linhas nas notas).
   - Limite: **2 análises por mês no gratuito** (decisão do dono, 13/09),
     sem limite no Premium. O servidor conta (`orcamentos_analisados`) e
     confere o Premium pela tabela `subscriptions` com o Bearer, não pelo que
     o app diz.
   - A foto não é guardada: vai reduzida (1600 px) para a rota, que manda ao
     modelo e descarta. A tabela guarda só mês, identidade, quantos itens,
     total e as chaves de serviço com valor.
   - Onde mora: `lib/orcamento/analise.ts` (puro), `app/api/orcamento`,
     `components/app/screens/Orcamento.tsx`. Conferido por
     `conferir:orcamento` (limite, leitura de resposta suja, comparação,
     ligações) e pela suíte `conferir:navegador orcamento` (foto, resultado,
     limite, salvar no histórico), as duas provadas com defeito plantado.
   - Evento: `analisou_orcamento`, com a origem. A leitura que importa em 30
     dias: quem analisou volta e registra serviço mais que quem não analisou?
   - **Universal links** ficam aqui também (vindos da 2.5), quando o dono
     mandar o SHA-256 do Play.

## Roteiro de aparelho, e ele é obrigatório

Escrito antes do build. O que a bateria não alcança: a câmera do aparelho
dentro do WebView e a resposta do modelo de verdade (a suíte simula a rota).

1. **Câmera no app das lojas**: Problemas, um sintoma, "O que verificar",
   "Tirar foto do orçamento". O botão abre a câmera do aparelho (não só a
   galeria) no Android e no iPhone; a foto aparece na tela; "Analisar
   orçamento" devolve o resultado em até 30 segundos.
2. **Resultado de verdade**: com um orçamento impresso, as linhas batem com
   o papel, os valores conferem, e nenhuma frase acusa a oficina.
3. **Limite**: deslogado, na terceira análise do mês a tela oferece o
   Premium. Logado com Premium, a terceira passa.
4. **Salvar no histórico** chega ao formulário com oficina e total.
