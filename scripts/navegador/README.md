# Conferências de navegador

O que prova que o app funciona de verdade, num Chromium, com a sessão semeada.

```
npm run conferir:navegador             # todas
npm run conferir:navegador quiz km     # só essas
```

Sobe o servidor de desenvolvimento sozinho se não houver um de pé, e o derruba
no final.

## Instalar o Playwright

Ele **não** faz parte das dependências do projeto de propósito: entraria no
`npm install` da Vercel e puxaria o download de navegadores para dentro do
build do site, que não precisa de nenhum.

```
npm i --no-save playwright
```

O Chromium é procurado em `/opt/pw-browsers/chromium` e, se não estiver lá, o
próprio Playwright resolve. Para apontar outro: `CHROMIUM=/caminho/do/chromium`.

## As suítes

| arquivo | o que prova |
| --- | --- |
| `quiz.mjs` | a pergunta do dia: faixa, resposta, sequência, envio para `/api/quiz` |
| `historico.mjs` | o calendário e a resposta remostrada; que o passado **não** mexe na sequência |
| `primeiro-quiz.mjs` | os dois gatilhos da folha do primeiro quiz, e os casos de silêncio |
| `km.mjs` | o lembrete mensal de quilometragem |
| `selo.mjs` | o selo do foguinho nos três estados |
| `avisos.mjs` | o sino, o X que dispensa, e os botões alcançáveis em tela estreita |
| `site.mjs` | vazamento lateral das páginas do site em 320/360/390/430px |

## Escrever uma nova

Uma suíte é um módulo com três exportações. O `base.mjs` cuida do resto.

```js
import { garagem, abrirApp } from "./base.mjs";

export const nome = "minha-coisa";
export const sobre = "uma frase do que isto prova";

export async function rodar({ nav, ok }) {
  const app = await abrirApp(nav, { sessao: garagem() });
  ok("o que tem de ser verdade", /texto esperado/.test(await app.corpo()));
  await app.fechar();
}
```

Depois é só somar o nome à lista `SUITES` em `todos.mjs`.

## A regra que vale para qualquer detector daqui

**Prove que ele morde antes de confiar no verde.** Plante o defeito que ele
deveria pegar e confira que ele grita.

Isto não é zelo: o detector de corte lateral já ficou **cego** aqui. A exceção
que eu tinha escrito para os roladores horizontais (a fileira de carros da Home
mostra um chip pela metade de propósito) engolia a folha de avisos inteira,
porque `overflow-y: auto` faz o `overflow-x` computar como `auto` no CSS. A
suíte ficou verde sem conferir nada. Só apareceu porque plantei um elemento
largo demais lá dentro e ele não acusou.

Por isso `controlesForaDaTela` pergunta outra coisa, que não tem como ser
enganada: existe algum **botão ou campo** cuja caixa passa da borda? Decoração
saindo não machuca ninguém; controle que não dá para tocar, sim.
