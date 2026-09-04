# Skills de fora que moram no repositório

Aqui ficam registradas as skills de terceiro que a gente decidiu **trazer para
dentro do repositório**, e por quê.

## Por que trazer, se dá para instalar

O `npx skills add` instala em `.agents/skills/` e cria um link simbólico dentro
de `.claude/skills/`. Isso funciona bem numa máquina só, e não serve para nós:
os agentes semanais (Diretor, QA, CRO, Conteúdo, ASO) rodam em **sessão
remota**, onde o repositório é clonado do zero e a máquina do dono não existe.
Skill que vive só no PC dele não chega neles.

Então elas entram versionadas. O preço aceito é conhecido: a atualização passa a
ser nossa (o upstream lança versão nova e a gente não recebe sozinho), e o
repositório engorda.

## O que está aqui

| skill | origem | licença |
|---|---|---|
| `product-tracking-*` (7) | [accoil/product-tracking-skills](https://github.com/accoil/product-tracking-skills) | MIT |

Commit trazido: `341f8cf47d8b5dda550222152377c50aee34c723`, em 04/09/2026.
Cada pasta tem um arquivo `.de-fora` com a origem e esse commit.

**Por que essas sete.** O buraco que elas endereçam é real e medido: em 03/09 o
funil respondeu meia verdade três vezes seguidas, e em 04/09 descobrimos que
`terminou_onboarding` nunca dispara na web. As skills desenham o plano de
eventos antes de instrumentar, auditam o que já é medido e modelam a jornada em
degraus. É disciplina de medição, que é exatamente o que faltou.

## O que foi conferido antes de trazer

Skill carrega sozinha e roda com a permissão do agente, então revisar é
obrigatório e não formalidade:

- **`hooks/hooks.json` do upstream está vazio** (`{"hooks": {}}`). Nada é
  executado automaticamente, que era a parte que preocupava.
- As URLs que aparecem no conteúdo são **documentação de fornecedores de
  analytics** (Plausible e afins), não envio de dado nosso para lugar nenhum.
- Licença MIT, compatível com o uso aqui.
- 1,1 MB em 82 arquivos, quase tudo markdown de referência.

Só as skills vieram. Os `agents/` e `hooks/` do repositório de origem ficaram de
fora de propósito: agente e gancho de terceiro rodando no nosso projeto é uma
porta maior do que a necessidade.

## As regras de convivência

**Não editar.** Elas chegam sem modificação, e é isso que torna a atualização
barata. Se alguma parte não servir para nós, a resposta não é editar lá dentro:
é escrever uma skill NOSSA que diga o que fazemos diferente. Skill de fora
editada vira fork particular que ninguém consegue atualizar.

**A `conferir:skills` não julga elas.** Ela reconhece o arquivo `.de-fora` e
pula, contando quantas ignorou. Os caminhos que elas citam são delas, e cobrar
que existam aqui daria reprovação diária sem ação possível.

**O `.gitignore` libera uma a uma.** A regra de `.claude/skills/` é invertida
(ignora tudo, libera o que a gente escolheu), então uma instalação nova feita
com `npx skills add` fica ignorada sozinha, sem virar commit por acidente.

## Como atualizar

```bash
git clone --depth 1 https://github.com/accoil/product-tracking-skills.git /tmp/pts
# revisar o que mudou, principalmente hooks/ e qualquer coisa que execute
cp -r /tmp/pts/skills/<nome>/. .claude/skills/<nome>/
# recriar o .de-fora com o commit novo e atualizar a linha do commit aqui em cima
npm run conferir
```

A revisão do `hooks/` não é opcional: um upstream que passe a executar coisa
automaticamente muda a natureza do que estamos versionando.
