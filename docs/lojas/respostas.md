# Respostas às avaliações das lojas

Rascunhos prontos para o Rodrigo colar no console. Este agente NÃO responde
avaliação: ele escreve, o dono cola. Ao colar uma, marcar `respondido = true`
na tabela `lojas_avaliacoes`, senão a rodada seguinte rascunha de novo.

Limites das lojas, já conferidos em cada texto abaixo: Google Play aceita 350
caracteres na resposta pública; App Store aceita bem mais, mas resposta curta e
específica é a que a pessoa lê.

Regra de tom: agradecer sem bajular, citar o que a PESSOA disse (não um elogio
genérico), e oferecer o caminho de volta ("Fale com a gente", o atalho fixo
acima da barra de abas). Nunca prometer funcionalidade com data, nunca falar de
preço, nunca pedir que a pessoa mude a nota.

---

## Rodada de 15/09/2026: as 8 primeiras avaliações

Nenhuma delas tinha sido respondida (`respondido = false` nas 8). Todas são 5
estrelas. Não há nenhuma nota de 1 a 3 até hoje, então não há caso de
recuperação nesta lista.

### Google Play

**Luiz Fernando Muniz Viana** (5 estrelas, avaliada em 06/09)
> para quem gosta de melhoramento automotivo é o melhor que tem.

```
Que bom ler isso, Luiz Fernando. O app nasceu para quem gosta de entender o carro por dentro, e saber que serviu para você vale o trabalho. Se faltar alguma coisa que você gostaria de ver, escreve pela tela Fale com a gente dentro do app: a gente lê tudo. Obrigado por estar com a gente desde o começo.
```
302 de 350 caracteres.

**Sorriso da Pele** (5 estrelas, avaliada em 06/09)
> usamos para gerências as manutenções e dúvidas dos carros aqui da clínica

```
Obrigado por contar como vocês usam. Cuidar dos carros da clínica sem precisar virar mecânico é exatamente o problema que a gente quer resolver. Se em algum momento fizer falta enxergar os carros num lugar só, escreve pela tela Fale com a gente: isso ajuda a decidir o que construir primeiro.
```
292 de 350 caracteres.

**Mindmill Brasil** (5 estrelas, avaliada em 06/09)
> Ajuda a tomar decisões e ter controle de frota. Eu também uso para meu carro particular

```
Obrigado, e que bom que ajuda nas duas pontas, a frota e o seu carro. Decidir com informação na mão é o que a gente quer que o app faça. Se você sentir falta de algo para acompanhar vários carros de uma vez, escreve pela tela Fale com a gente: esse tipo de pedido entra na fila de verdade.
```
289 de 350 caracteres.

**Triplyze** (5 estrelas, avaliada em 06/09)
> me fez economizar quase 40% quando tive um problema no carro. bom que é grátis para 1 carro

```
Isso é exatamente o que a gente quer ouvir: chegar na oficina sabendo o que perguntar muda o orçamento. Um detalhe que talvez ajude: no plano gratuito cabem até 2 carros, não só 1. Se precisar de mais, escreve pela tela Fale com a gente. Obrigado por reservar um minuto para escrever.
```
284 de 350 caracteres. Esta resposta corrige um fato, em público e sem
constranger: a pessoa acha que o grátis dá 1 carro e ele dá 2
(`LIMITS.freeCars`). Quem lê a ficha depois vai encontrar a mesma informação,
porque é o que a proposta desta quinzena conserta.

**Luana David** (5 estrelas, versão 1.7, avaliada em 04/09)
> Aplicativo sensacional para estudos e identificação de problemas no carro.

```
Obrigado, Luana. Estudar e identificar problema são justamente as duas pontas que a gente tentou juntar num app só, então ler isso de você é ótimo. Se alguma aula ficar confusa ou faltar um assunto, escreve pela tela Fale com a gente: é assim que a gente descobre o que melhorar.
```
279 de 350 caracteres.

### App Store

**luana david**, "muito bomm" (5 estrelas, versão 1.0, coletada em 02/09)
> não sei muito de carros e o premium está me SALVANDO. suporte muito rápido também
> parabéns pelo app

```
Obrigado, Luana. Esse é o motivo do app existir: você não precisa saber de carro para tomar uma decisão boa sobre o seu. Fico feliz que o Premium esteja valendo a pena, e que o suporte tenha respondido rápido. Se aparecer qualquer dúvida, é só chamar pela tela Fale com a gente.
```

**joserenatom**, "Mt bom" (5 estrelas, versão 1.0, coletada em 02/09)
> Me ajudou demais, exatamente o que eu precisava!

```
Obrigado! Saber que chegou na hora que você precisava é o melhor retorno que a gente podia ter. Se em algum momento faltar alguma coisa, escreve pela tela Fale com a gente dentro do app: a gente lê tudo e o que dá para consertar entra na fila.
```

**Moraes455**, "Economia no bolso" (5 estrelas, versão 1.0, coletada em 02/09)

**Sem rascunho, de propósito.** O autor é quase certamente o próprio Rodrigo:
o nome bate com o sobrenome e o número batem com o e-mail do dono. Responder
como empresa a uma avaliação que a empresa escreveu é o tipo de coisa que não
se desfaz depois. Duas perguntas para o dono, nesta ordem: é você? Se for, a
recomendação é apagar a avaliação pela própria conta que a escreveu, porque
avaliação do desenvolvedor no próprio app é manipulação de avaliação pelas
regras das duas lojas, e o custo de ser pego é desproporcional ao ganho de uma
estrela. Se NÃO for você, é só um homônimo e vale uma resposta normal, que eu
escrevo na próxima rodada.

---

## Depoimentos REAIS liberados para a LP

A seção de depoimentos da LP está vazia de propósito desde agosto
(`lib/i18n/strings.pt.ts` e `.en.ts`, `social.items: []`), com um comentário
dizendo que ela volta sozinha quando houver depoimento real. **Agora há.**
Estes são públicos, verificáveis nas lojas e podem ser colados com nome.

O formato da LP pede `quote`, `name` e `context`.

| Texto exato | Nome | Contexto sugerido | Por que este |
|---|---|---|---|
| "não sei muito de carros e o premium está me SALVANDO. suporte muito rápido também" | Luana D. | App Store | É o público-alvo falando com as palavras dele: alguém que não entende de carro. O melhor da lista. |
| "Ajuda a tomar decisões e ter controle de frota. Eu também uso para meu carro particular" | Mindmill Brasil | Google Play | Traz um caso de uso que a ficha nunca citou: mais de um carro, uso profissional. |
| "usamos para gerências as manutenções e dúvidas dos carros aqui da clínica" | Sorriso da Pele | Google Play | Concreto e específico. Empresa pequena que não tem frota formal, mas tem carros. |
| "Me ajudou demais, exatamente o que eu precisava!" | José Renato M. | App Store | Curto, serve de fecho. Genérico, então não deve ser o primeiro. |

**Com ressalva, decisão do dono:**

- **Triplyze**, "me fez economizar quase 40% quando tive um problema no carro.
  bom que é grátis para 1 carro". A primeira frase é ótima e a segunda está
  errada (o grátis dá 2 carros). Cortar a segunda frase é edição legítima, mas
  é edição. E o "40%" só pode aparecer como fala da pessoa, entre aspas e com o
  nome: virar título de página ("economize 40%") transforma a experiência de um
  usuário em promessa da empresa, que é o que a regra 3 da ficha proíbe.
- **Luiz Fernando Muniz Viana**: avaliação pública e real, mas é um dos
  assinantes de lançamento, com cupom de 100% (diário de 31/08). Usar não é
  errado; é só bom o dono saber de quem é a voz.

**Fora:** Moraes455, pelo motivo acima.

---

## O tamanho honesto do 5,0

São 8 avaliações. Média 5,0, nenhuma abaixo de 5, e isso é uma notícia boa de
verdade: ninguém baixou o app e se sentiu enganado. Mas 8 é um número pequeno o
bastante para virar de lado com uma avaliação só, e a conta está na proposta
desta quinzena. Nenhum texto de loja, LP ou anúncio deve dizer "5 estrelas" ou
"nota máxima" como se fosse posição consolidada de mercado. O que dá para dizer
com verdade é o que as pessoas escreveram, com o nome delas.
