# Mapa do código

Onde mexer para cada tipo de mudança. Uma página, para a próxima alteração
começar lendo em vez de garimpando.

## Onde mexer

| Quero mudar… | Vá em |
| --- | --- |
| um texto que aparece na tela | `lib/app/content.ts`, na seção com o nome da tela (`quiz`, `profile`, `subscribe`…) |
| uma aula, trilha ou categoria | `lib/app/conteudo/aulas.ts` |
| um sintoma ("barulho ao frear") | `lib/app/conteudo/sintomas.ts` |
| o kit do motorista | `lib/app/conteudo/equipamentos.ts` |
| marcas e modelos de carro | `lib/app/conteudo/veiculos.ts` |
| uma tela inteira | `components/app/screens/<NomeDaView>.tsx` |
| criar uma tela nova | veja o passo a passo abaixo |
| o que é guardado na sessão | `lib/app/store.tsx` |
| a regra da sequência do quiz | `lib/app/quiz/sequencia.ts` (e confira com `npm run conferir:regras`) |
| um aviso do sininho | `lib/app/avisos.ts` |
| o que acontece na abertura do app | `lib/app/aberturaDoApp.ts` |
| o que aparece por cima de tudo | `components/app/Sobreposicoes.tsx` |
| as barras de cima e de baixo | `components/app/Shell.tsx` |

## A regra que faz o mapa funcionar

**O nome da view no roteador é o nome do arquivo da tela.**

A união `View` em `lib/app/nav.tsx` lista tudo o que o app sabe desenhar. Para
cada nome ali existe `components/app/screens/<Nome>.tsx`: `subscribe` vira
`Subscribe.tsx`, `biela` vira `Biela.tsx`. Não é preciso procurar.

Isso não era verdade até 27/08/2026, e custava caro: o paywall (600 linhas de
argumento de venda) morava dentro de `Profile.tsx`, e a conversa com a Biela
dentro de `Learn.tsx`. Ninguém abre "Perfil" atrás da tela que vende
assinatura.

`components/app/telas.tsx` é o único lugar que faz a ligação de view para tela. O
`switch` dele é exaustivo por construção: `View` é uma união fechada, e
esquecer um caso não compila. É por isso que ele não tem `default`.

## Criar uma tela nova

São quatro passos, e o compilador cobra três deles:

1. some o nome à união `View` em `lib/app/nav.tsx`;
2. crie `components/app/screens/<Nome>.tsx`;
3. some o `case` em `components/app/telas.tsx` (**o tsc cobra**);
4. some a aba dela em `TAB_OF`, em `Shell.tsx` (**o tsc cobra**: é um
   `Record<View["name"], Tab>`).

Os textos vão para uma seção nova em `lib/app/content.ts`, com o mesmo nome.

## Quando um arquivo está grande demais

Tamanho não é o critério. **O critério é o nome mentir.**

`conteudo/aulas.ts` tem mil linhas e está certo: é uma tabela com 35 aulas,
ninguém lê de cima a baixo, procura pelo id. `screens/Symptoms.tsx` tem quatro
telas num arquivo e está certo: são passos do mesmo caminho e o nome diz a
verdade.

O que estava errado era `Profile.tsx` conter o paywall. Separe quando alguém
que procura X não teria motivo para abrir o arquivo Y onde X está.

E quando duas telas compartilham alguma coisa, ela **não** fica dentro de uma
delas: ou vira módulo em `lib/app/` (se for lógica) ou componente próprio (se
for JSX). Foi o caso de `lib/app/cursos.ts` e
`components/app/estudos/ItemDeAula.tsx`.

## Conferir antes de commitar

```
npm run conferir             tipos + estilo + regras       (~5s)
npm run conferir:navegador   as 8 suítes num Chromium      (~6min)
npm run conferir:tudo        os dois mais o build
```

As suítes de navegador precisam do Playwright, que fica fora das dependências
de propósito (entraria no build da Vercel e puxaria download de navegador):
`npm i --no-save playwright`. Detalhes em `scripts/navegador/README.md`.

**A suíte `telas` é a que permite mexer na organização sem medo**: abre todas
as telas principais e confere que cada uma desenha, com o console limpo. Erro
de renderização em React não derruba o app: a tela some e o resto continua.
Sem essa suíte, um arquivo movido para o lugar errado passa em tudo o mais.

### Quanto conferir por mudança (o regime das duas velocidades)

O custo de uma mudança pequena tem que ser o da mudança, não o da cerimônia.
Regra combinada com o dono em 27/08, depois de uma tarde em que colocar um ano
no nome do carro levou uma hora:

- **Mudança localizada** (uma tela, um componente, texto): `npm run conferir`
  + SÓ a suíte da área tocada (`npm run conferir:navegador carro`, ~30s) +
  push. **Sem build local**: a Vercel builda a cada push e reclama alto; o tsc
  pega quase tudo o que o build pegaria. Foto só se a mudança é visual.
- **Bateria completa + build local** apenas quando: a mudança toca código
  compartilhado (store, Shell, roteador, base das suítes), antes de release
  para as lojas, ou quando uma suíte reprova de um jeito que não faz sentido.

## A disciplina que vale para qualquer conferência daqui

**Prove que ela morde antes de confiar no verde.** Plante o defeito que ela
deveria pegar e veja se ela grita.

Não é zelo. Aconteceu duas vezes num dia só:

- o detector de corte lateral ficou **cego** por causa de uma exceção que eu
  mesmo escrevi para os roladores horizontais. `overflow-y: auto` faz o
  `overflow-x` computar como `auto` no CSS, então a exceção engolia a folha de
  avisos inteira e a suíte passava sem conferir nada;
- o comparador do `content.ts` fatiado dizia "zero diferenças", e só valeu
  alguma coisa depois que plantei uma palavra trocada e ele acusou.

## O que sabidamente ainda incomoda

- **`lib/app/store.tsx`, 841 linhas**, com o `PrototypeProvider` de 495 num
  corpo só. É o terceiro arquivo mais mexido. Não foi tocado porque mexer no
  estado da sessão é a mudança mais arriscada que existe aqui (é o que
  sincroniza com a nuvem) e merece um passo dedicado.
- **`content.ts` ainda tem 1.566 linhas** de cópia. Está navegável porque cada
  seção tem o nome da tela, mas não está pequeno.
- **Um registro de serviço malformado derruba o app inteiro.** O `migrate()`
  defende as listas de primeiro nível, mas não os itens dentro delas: um
  `ServiceRecord` sem `parts` cai na tela de erro em vez de sumir sozinho. Hoje
  não acontece porque só o próprio app escreve esses registros; fica a uma
  mudança de schema de acontecer.
