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
| as 16 de anúncio e medição do Google | [google/skills](https://github.com/google/skills) | Apache 2.0 |
| as 4 de direção visual | [leonxlnx/taste-skill](https://github.com/leonxlnx/taste-skill) | MIT |
| `react-best-practices` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | MIT |
| `click-path-audit` | [affaan-m/ECC](https://github.com/affaan-m/ECC) | MIT |

Commits de 19/09/2026, segunda leva: `react-best-practices` veio do
`063bee94c3f4df8453406c830b0a7df0f2860278` e `click-path-audit` do
`07756cee15788a54506031462794ad645719b028`.

Commit trazido das `product-tracking-*`:
`341f8cf47d8b5dda550222152377c50aee34c723`, em 04/09/2026.
Commit trazido das do Google: `18152e0d310e4d7047e9c2ec25a37b0d22d6893e`, em
19/09/2026. Commit trazido das de direção visual:
`e79ca9ec7e071eb3a3b623c4fb752e853fc3ed58`, também em 19/09/2026. Cada pasta tem
um arquivo `.de-fora` com a origem e o commit.

**Por que essas sete.** O buraco que elas endereçam é real e medido: em 03/09 o
funil respondeu meia verdade três vezes seguidas, e em 04/09 descobrimos que
`terminou_onboarding` nunca dispara na web. As skills desenham o plano de
eventos antes de instrumentar, auditam o que já é medido e modelam a jornada em
degraus. É disciplina de medição, que é exatamente o que faltou.

**Por que as 16 do Google, e quais NÃO vieram.** O repositório
`google/skills` tem 146 skills, e 127 delas são de Google Cloud (GKE, AlloyDB,
Spark, arquitetura de solução). Nenhuma fala da nossa casa, e skill carrega
sozinha por descrição: trazer as 127 seria encher toda sessão de assunto que
não é nosso. Vieram as 14 de `skills/ads` e as 2 de `skills/analytics`, que
cobrem três coisas que a operação já precisa:

- **Google Ads** (`google-ads-api-quickstart`, `google-ads-api-mcp-setup`,
  `google-ads-api-account-diagnostics`): hoje o agente de Mídia paga lê o gasto
  pela coleta do n8n e **não tem credencial de API**. A de MCP é o caminho para
  ele passar a ler a conta direto, e a de diagnóstico endereça exatamente o
  quadro de 19/09: conversão zerada e parcela de impressão perdida.
- **Data Manager API** (`data-manager-api-setup`, `-event-ingestion`,
  `-audience-ingestion`): é por aí que se manda uma conversão offline para o
  Google. É a ação que está parada na lista do dono desde 07/09, trocar a
  conversão de "tocou em baixar" para "criou conta".
- **Google Mobile Ads** (`google-mobile-ads-*`, 6): o Android gratuito mostra
  anúncio, então essas são de produto, não de mídia. A `-validate` serve de
  auditoria antes de release.
- **IMA SDK** (`ima-sdk-client-side`, `ima-dai-sdk`): anúncio dentro de vídeo.
  Não usamos, e vieram só para o conjunto do Google ficar inteiro. Se
  incomodarem, saem sem dó.

**Por que só quatro das treze de direção visual, e o que elas fazem.** O dono
viu no Instagram um post sobre a "Taste Skill" e perguntou como a gente aprende
isso para gerar imagem melhor. O repositório tem treze skills e elas fazem três
coisas diferentes, que o post junta numa só:

- **`taste-skill`**: regra de design para INTERFACE (página, LP, tela). Não gera
  imagem nenhuma; muda como o frontend é escrito;
- **`brandkit`**: direção de arte para imagem de MARCA (quadro de identidade,
  logo, mockup, apresentação);
- **`imagegen-frontend-web`** e **`-mobile`**: geram imagem de REFERÊNCIA de
  tela, uma por seção, para depois alguém construir.

As outras nove ficaram de fora e a razão é a mesma que vale para as do Google:
`brutalist`, `minimalist` e `soft` impõem um gosto genérico, e a marca do
Mentorque já está decidida (grafite, creme, âmbar, e o app é escuro por padrão).
Skill que briga com a marca sem ninguém perceber é pior do que skill nenhuma.

**O VEREDITO DO DONO, depois de duas rodadas na LP (19/09/2026).** Elas foram
testadas na home no mesmo dia em que chegaram, primeiro em modo PRESERVAR e
depois em modo REFORMA, e o dono reprovou as duas:

- **modo preservar**: "não vi nenhuma diferença entre o que foi proposto e o
  original". Ele estava certo, e a medição confirma: mais da metade do que mudou
  era movimento (invisível em foto) e o resto era milímetro, sendo o maior delta
  32px de respiro no topo. A própria tabela da skill manda, nesse modo, igualar
  o que já existe. Quem pede preservação recebe polimento invisível;
- **modo reforma**: uma home alternativa inteira em `/nova`, com a manchete indo
  de 149px para 271px de altura, dobra de uma coluna, celular falso removido e
  ritmo de claro e escuro. Resposta: "ainda não vi nenhuma melhoria. Pode
  descartar. Vamos continuar com a atual". A página e a pasta foram apagadas.

**A lição, e ela vale mais que as skills:** a comparação que motivou o teste era
injusta e ninguém tinha percebido. O post de Instagram que o dono viu mostra uma
página nascendo DO ZERO, com a direção de arte entregue pronta dentro do prompt
(fundo `#f5f5f7`, título de 72 a 92px, peso 800). Do nada para alguma coisa,
qualquer resultado parece um salto. Redesenhar uma marca já decidida, com texto
que tem histórico de teste, nunca vai produzir aquele "antes e depois", e
prometer que vai é vender ilusão.

Então: **não reabrir isto na LP sem um motivo novo.** O que faltava nas duas
versões não era gosto, era matéria-prima. A dobra mostra um celular FALSO
montado com `div`, e nenhuma skill de direção visual conserta a falta de uma
captura real do app.

**O que elas NÃO consertam, e isso importa mais que o que consertam:** as peças
de rede social do Mentorque não são imagem de IA. Elas são a nossa rota
escrevendo texto por cima das chapas da marca (`lib/pecas/chapas.ts`), com
conferência de onde cabe escrever. Melhorar aquilo é mexer em tipografia e
composição no nosso código, ou trocar as chapas. Nenhuma skill de prompt toca
nisso.

**Por que só DUAS do ECC, e por que o arnês dele não entra nunca (19/09/2026).**
O dono viu um post sobre o `affaan-m/ECC`, que se anuncia como "o sistema
operacional para arneses de agente": 292 skills, 68 agentes, 94 comandos. O
catálogo foi explorado inteiro antes de qualquer decisão, e os números contam a
história:

- **819 arquivos executáveis.** Compare com as do Google: 72 arquivos, todos
  `.md`. Das 292 skills, 272 são markdown puro e 20 trazem código;
- **os ganchos dele rodam em TODA chamada de ferramenta.** O `hooks.json`
  registra gatilho em `Bash`, `Write`, `Edit` e um casador `.*`, e cada um
  executa um trecho minificado que procura a raiz do plugin em seis lugares e
  então carrega e roda scripts (`observe-runner.js`, `governance-capture.js`);
- **ele baixa e roda artefatos de um registro próprio**, `registry.nasiko.dev`,
  e fala com `compute.itomarkets.com`. Não é acusação: é exatamente o tipo de
  superfície que a regra desta casa já mandava recusar.

Dos 68 agentes, a maioria esmagadora é revisor ou resolvedor de build de
linguagem que não usamos (C++, C#, Dart, Django, Flutter, Go, Java, Kotlin, PHP,
Rust, Swift, Vue, Cisco IOS). Das 292 skills, tem HIPAA, VLAN de homelab, DeFi,
procurement de energia e Perl.

**E a pergunta que o dono fez, que é a certa: dá para evoluir os nossos agentes
com o material deles?** Para os papéis de marketing, NÃO, e o número mostra por
quê: o `seo` deles tem 4.320 bytes de checklist genérico ("corrija bloqueio
técnico antes de otimizar conteúdo"); o nosso `cro-besci.md` tem 15.185 e o
`midia-paga.md` tem 28.135, cheios do que aconteceu NESTA casa. Misturar
genérico com específico dilui o específico, e o específico é o que vale.

Onde valeu foi onde eles tinham **técnica que a gente não tem**, e não opinião
sobre o nosso negócio:

- **`click-path-audit`**: seguir cada botão pela sequência inteira de mudanças de
  estado, para achar o defeito em que duas funções funcionam sozinhas e se
  anulam juntas. É exatamente o formato dos defeitos de compra que o QA
  encontrou em setembro;
- **`react-best-practices`**: e aqui a decisão mudou no meio do caminho. A skill
  do ECC chama-se `react-performance` e é **adaptação declarada** da do Vercel
  Labs. Pegar a adaptação de um terceiro de uma skill de um quarto deixa a
  atualização duplamente indireta, então veio **a original do Vercel**: MIT,
  autor `vercel`, 72 regras em arquivo separado, de quem faz o Next.js e hospeda
  a gente.

## O que foi conferido antes de trazer

Skill carrega sozinha e roda com a permissão do agente, então revisar é
obrigatório e não formalidade.

Nas `product-tracking-*` (04/09):

- **`hooks/hooks.json` do upstream está vazio** (`{"hooks": {}}`). Nada é
  executado automaticamente, que era a parte que preocupava.
- As URLs que aparecem no conteúdo são **documentação de fornecedores de
  analytics** (Plausible e afins), não envio de dado nosso para lugar nenhum.
- Licença MIT, compatível com o uso aqui.
- 1,1 MB em 82 arquivos, quase tudo markdown de referência.

Nas de direção visual (19/09):

- **Quatro arquivos, todos `.md`**, somando 196 KB. Nenhum script, nenhum
  gancho. O `scripts/` do repositório de origem existe, mas é só para montar o
  README (badge de patrocinador, conversão de imagem) e ficou de fora.
- Os endereços citados são **documentação de sistema de design**: Apple, MDN,
  Atlassian, Carbon da IBM, o design system do governo americano e o do britânico.
  Nada aponta para fora disso e nada manda enviar dado nosso.
- Licença MIT.
- **O que elas fazem é escrever prompt melhor, não desenhar melhor.** Quem
  desenha continua sendo o modelo de imagem de quem chamar; a skill dá a direção
  de arte. Vale saber disso antes de esperar milagre.

Nas duas de técnica (19/09), a segunda leva:

- **`react-best-practices`: 77 arquivos, e só um não é `.md`** (o
  `metadata.json`, que é dado e não executa). 424 KB, com 72 regras em arquivo
  separado, o que também torna barato desligar uma regra que não sirva.
- **`click-path-audit`: dois arquivos**, o `SKILL.md` e o `.de-fora`. Zero
  endereço citado, zero executável.
- Os endereços citados na do Vercel são todos documentação: MDN, `react.dev`,
  `nextjs.org`, `vercel.com`, webpack, vite, esbuild. O resto é `example.com` em
  exemplo de código.
- Licença MIT nas duas.

Nas do Google (19/09):

- **Nenhum arquivo executável.** As 16 pastas somam 596 KB em **72 arquivos, e
  todos são `.md`**. Não há script, não há `hooks/`, não há gancho: a parte de
  `plugins/` do repositório de origem é só de Cloud e ficou de fora.
- **Todo endereço citado é do Google ou de repositório público de pacote**:
  `developers.google.com`, `googleads.googleapis.com`, `github.com`, Maven,
  NuGet, OpenUPM. Nada aponta para fora desse conjunto, e nenhuma skill manda
  enviar dado nosso para lugar nenhum.
- **A de MCP instala servidor, e isso é o que mais pede leitura.** Ela ensina a
  instalar o servidor MCP oficial do Google Ads e exige cinco credenciais que
  esta casa não tem. Ou seja, ela não faz nada sozinha: sem token, ela para no
  primeiro passo e manda pedir credencial ao dono, que é o comportamento certo.
- Licença Apache 2.0, compatível com o uso aqui.

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

A origem muda, o resto é igual: `accoil/product-tracking-skills` para as de
medição de produto, `google/skills` para as de anúncio (e lá as pastas ficam em
`skills/ads/<nome>` e `skills/analytics/<nome>`).

```bash
git clone --depth 1 https://github.com/accoil/product-tracking-skills.git /tmp/pts
# revisar o que mudou, principalmente hooks/ e qualquer coisa que execute
cp -r /tmp/pts/skills/<nome>/. .claude/skills/<nome>/
# recriar o .de-fora com o commit novo e atualizar a linha do commit aqui em cima
npm run conferir
```

A revisão do `hooks/` não é opcional: um upstream que passe a executar coisa
automaticamente muda a natureza do que estamos versionando.
