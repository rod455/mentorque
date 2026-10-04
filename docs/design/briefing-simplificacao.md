# Briefing: Mentorque mais simples (app e landing), com o Biela na porta

Escrito em 04/10/2026 para uma sessão com acesso ao Behance e a este repositório
(`rod455/mentorque`). Quem lê isto tem que sair com: referências visuais de UI
limpa e com poucas ações, e uma proposta de evolução da landing e das telas do
app, mais clara sobre o que fazer lá dentro e com o Biela em destaque.

## O que é o Mentorque, em um parágrafo

App de cuidado com o carro para quem não é mecânico (Next.js 14 + Capacitor;
está na App Store e na Google Play, versão 3.0 subindo em 04/10). A pessoa
descreve um sintoma (barulho, luz do painel, cheiro) e o **Biela**, a
assistente com IA (uma capivara mecânica, mascote da marca), responde com
causas prováveis, urgência e o que perguntar na oficina. Em volta disso: garagem
(até 2 carros no grátis), plano de revisão por quilometragem, histórico de
serviços e gastos, aulas de mecânica para leigos, códigos OBD2. Premium a
R$ 29,90 por mês ou R$ 239,90 por ano. O dono é uma pessoa só (Rodrigo), e ele
decide tudo que é preço, plano e publicação.

## Onde cada coisa mora no repositório

- Landing page: `app/page.tsx` monta 12 seções de `components/sections/`
  (Hero, TrustBar, ProblemSolution, Features, HowItWorks, SocialProof,
  Consulting, Plans, Benefits, FAQ, FinalCta, Footer). Textos em
  `lib/i18n/strings.pt.ts` (bloco `hero` tem um carrossel com três manchetes).
- App: casca em `components/app/Shell.tsx` (barra de abas, cabeçalho), telas em
  `components/app/screens/` (`Home.tsx`, `Biela.tsx`, `Cars.tsx`,
  `Symptoms.tsx`, `Subscribe.tsx` é o paywall, `Learn.tsx`...), onboarding em
  `components/app/OnboardingFlow.tsx`. Todos os textos do app em
  `lib/app/content.ts` (função `T(pt, en)`); o bloco `home:` começa com a
  decisão de 28/09 explicada em comentário.
- Marca: `tailwind.config.ts`. Fundo grafite `#16181D` (900 `#101216`, 800
  `#1E222B`, 700 `#272C35`), âmbar `#F2A623` como único acento, creme
  `#F4F2EC` para texto, teal `#0F8A66` e coral `#C24D26` só para estado.
  Fontes em `app/layout.tsx`: Space Grotesk (títulos), Inter (texto), Lora
  (serifa, pouco usada). Mascote: `public/` tem as artes da Biela.
- Ficha das lojas (textos no ar e propostas): `docs/lojas/ficha.md`. Notas da
  versão atual: `docs/lojas/novidades-3.0.md`.
- Diário dos agentes: `docs/agentes/DIARIO.md` (o mais novo em cima). Manual do
  CRO: `docs/agentes/cro-besci.md`. Mapa do código: `docs/mapa-do-codigo.md`.
- Proposta já desenhada em 04/10 (quatro pranchas, sem código): canvas em
  https://claude.ai/artifact/P7h7C33vTbziokaWcxGics (o dono precisa
  compartilhar para outra sessão abrir). Resumo dela na seção "O que já foi
  proposto".

## O que o CRO aprendeu em seis semanas (e que a proposta tem que respeitar)

Tudo medido, com a fonte entre parênteses. Datas são de 2026.

1. **A porta de entrada era o maior vazamento** (28/09). A primeira tela pedia
   "cadastre o seu carro"; 78,7% de quem chegava pela web parava no onboarding
   e cinco em seis que abriam o formulário de carro não terminavam. A troca foi
   de ORDEM: perguntar primeiro ("O que está acontecendo com o seu carro?",
   botão "Perguntar para o Biela"), carro depois. O carro deixou de ser o preço
   da entrada.
2. **Tirar campo é a alavanca mais barata** (02/10). Formulário de carro com
   marca, modelo e ano venceu o de sete campos: 108 contra 78 de 173
   aparelhos por braço. Virou padrão.
3. **O onboarding de cinco páginas é inconclusivo e o dono manteve a página de
   prova social** (01/09 e 02/10). Os depoimentos dessa página eram inventados;
   em 04/10 dois viraram trechos literais de avaliações da App Store, e os
   números viraram medidos (5,0 em 12 avaliações; 170+ diagnósticos; 250+
   motoristas). Regra: nenhum número inventado em tela nenhuma.
4. **As pessoas descrevem o app pelo desfecho, não pelo recurso** (avaliações,
   todas 5 estrelas): "consegui economizar na revisão", "não sei nada de carro
   e tenho aprendido". A palavra mais repetida é economizar. Nenhuma avaliação
   elogia uma funcionalidade pelo nome.
5. **O Biela é o uso real**: 66 perguntas em 30 dias, 16 com palavras da pessoa
   (os atalhos de tela não contam como demanda, contam a ordem dos nossos
   botões). Temas: motor, elétrica, freios, partida.
6. **O fundo do funil tinha portão sem rastro** (18/09): seis caminhos de compra
   no paywall levavam ao login sem gravar nada, e a tela de entrar não sabia que
   a pessoa veio comprar. Corrigido. Lição: cada passo que pede conta ou carro
   precisa dizer o que ele destrava.
7. **As três primeiras assinaturas pagantes cancelaram na virada para dinheiro**
   (01/10). Todas entraram com cupom de 100% do primeiro mês. Com n igual a 3
   não separa de nada, mas o timing do pedido de dinheiro é assunto aberto.
8. **Os fechamentos do app se concentram na Home e na abertura** (retrato de
   04/10: 7 em 4 aparelhos na home, 6 em 2 na abertura). Tela mais leve é
   menos coisa para quebrar.
9. **Engajamento**: uns 200 usuários ativos por semana, 1,4 aberturas por
   usuário por semana. Ativação (primeira ação de valor em 7 dias): 3 de 16 e
   6 de 11 nas últimas coortes legíveis. Amostras pequenas; direção, não medida.
10. **Lembretes**: a máquina de trazer de volta estava desligada até 28/08. O
    convite de aviso funciona melhor com motivo concreto e o carro pelo nome
    ("Quer que a gente avise a próxima revisão do Golf?").
11. **A LP não recebe lead** (decisão do dono, 04/10): o único destino é a
    loja. Sem formulário de e-mail, sem "funciona no navegador".
12. **Regra de medir antes de mexer** (manual do CRO): cada mudança de tela é
    uma aposta, uma por vez, com o degrau que ela mede escrito no dia em que
    abre; instrumento primeiro, aposta depois; o braço menor tem que alcançar
    o critério de parada no dia em que a aposta abre. Área com experimento
    aberto fica congelada até o veredito.

## O que já foi proposto (04/10), para evoluir e não repetir

- **Início**: o Biela vira o hero e a única ação primária (pergunta grande,
  caixa "Descreva o barulho, a luz ou o cheiro", três chips de sintoma). O
  carro é um chip com a próxima revisão ("Golf GTI 2014 · 98.000 km. Próxima:
  troca de óleo em 1.200 km"), não uma tarefa. Duas ações secundárias
  (Registrar serviço, Aprender). Quatro abas (Início, Biela, Garagem,
  Aprender). Hoje a Home tem saudação, hero, busca, card de Premium, quatro
  ações rápidas, seu carro, "Para você", fixados e cinco abas.
- **Biela**: resposta sempre em três blocos (causas prováveis, urgência, o que
  perguntar na oficina), polegar que grava no toque, chips de continuação
  ("Quanto costuma custar?", "Posso viajar assim?", "Guardar no histórico").
  Sem carro cadastrado, a resposta termina oferecendo guardar para o carro, e
  aí entra o cadastro curto.
- **Primeira abertura sem conta**: a pergunta é a porta; "Ou cadastrar meu
  carro primeiro" como segunda opção; "Já tem conta? Entrar" pequeno. Sem
  onboarding de cinco páginas.
- **Landing**: seis blocos em vez de doze; uma manchete em vez de carrossel
  ("Saiba o que o carro tem antes de ir na oficina."); o Biela em ação ao lado
  (pergunta e resposta em três blocos); três ganhos; os dois depoimentos reais
  com "via App Store"; o preço uma vez, com o grátis na frente; botões das
  lojas no topo e no fim; rodapé mínimo.

## O que pedir ao Behance

Referências de interface **mega simples, limpa, poucas ações por tela**, em
dois grupos: (a) apps mobile onde a primeira tela é uma pergunta ou uma caixa
de entrada (assistentes, apps de saúde, bancos digitais) com no máximo três
ações visíveis; (b) landing pages de app com uma promessa só, uma CTA e a
demonstração do produto na primeira dobra. Fundo escuro com um acento quente
ajuda, porque é a marca. Para cada referência, dizer o que exatamente se
aproveita (hierarquia, densidade, posição da ação primária, como o chat é
apresentado), e não só "é bonito".

## O que entregar

1. Referências com link e a frase do que se aproveita em cada uma.
2. Proposta de evolução da LP e das telas Início, Biela, primeira abertura e
   paywall: o que sai, o que fica, o que muda de lugar, com a lição acima que
   sustenta cada decisão. Pode evoluir as pranchas já desenhadas ou propor
   outra direção, dizendo por quê.
3. Para cada tela, o degrau do funil que a mudança mede (eventos existentes em
   `funil_eventos`: `comecou_onboarding`, `terminou_onboarding`,
   `abriu_cadastro_de_carro`, `cadastrou_carro`, `perguntou_biela`,
   `consultou_sintoma`, `viu_paywall`, `iniciou_checkout`, `assinou`).
4. Ordem sugerida de apostas, uma por vez, começando pela mais barata.

## O que NÃO fazer

- Não mexer em preço, plano, cupom ou texto de cobrança: é do dono.
- Não inventar número, depoimento ou nota. Os reais estão acima e em
  `docs/lojas/respostas.md` (avaliações) e `docs/dados/retrato.md` (métricas).
- Texto visível ao usuário em português natural, **sem travessão** (o caractere
  de traço longo). Vale para mockup, copy e documento.
- Não propor lead na web nem formulário na LP: o destino é a loja.
- Não tirar a página de prova social por conta própria: o dono decidiu
  mantê-la (agora com depoimentos reais).
- Não entregar mudança de código direto na `main`: aqui tudo entra como aposta
  medida, uma por vez. Proposta e mockup são o entregável.
