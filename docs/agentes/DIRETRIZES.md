# Time de agentes do Mentorque — diretrizes gerais

Este diretório é a MEMÓRIA INSTITUCIONAL do time de agentes. Modelos de IA não
aprendem sozinhos entre uma rodada e outra; o que aprende é este diretório.
Cada agente, antes de agir, lê estas diretrizes, o próprio manual e os
registros das rodadas anteriores. Cada rodada termina atualizando o próprio
manual com o que foi aprendido. É assim que um agente "júnior" vira "sênior":
o manual dele engorda de decisões, heurísticas e contexto do negócio.

## O ciclo de aprendizado

1. **Antes de agir**: ler `DIRETRIZES.md`, o manual do próprio papel
   (`docs/agentes/<papel>.md`) e o `DIARIO.md`.
2. **Agir** dentro da alçada (abaixo).
3. **Depois de agir**: registrar no `DIARIO.md` (data, o que fez, o que
   encontrou, o que recomenda) e, se aprendeu uma regra nova que vale para as
   próximas rodadas, gravar no próprio manual na seção "Aprendizados".
4. **Feedback do Rodrigo**: direcionamentos dele entram no manual do agente na
   seção "Direcionamentos do dono" e valem como regra dali em diante. Quando o
   Rodrigo corrigir algo numa conversa, o agente da rodada seguinte deve
   encontrar essa correção escrita aqui, não redescobrir o erro.

## O método agora carrega sozinho (skills de projeto)

Desde 04/09/2026 o método deixou de depender de alguém lembrar de lê-lo. As
skills em `.claude/skills/` entram na conversa sozinhas quando o assunto
encosta nelas:

| skill | entra quando |
|---|---|
| `ler-a-operacao` | qualquer número: funil, assinatura, receita, CAC, UTM |
| `concluir-com-prova` | investigar defeito, explicar causa, número estranho |
| `conferir-que-morde` | criar ou mexer em conferência, e depois de todo conserto |
| `release-nas-lojas` | versão, build, Codemagic, notas das lojas |
| `mensagem-a-cliente` | e-mail ou push para cliente, cupom em link, campanha |

Além dessas, sete skills de fora (`product-tracking-*`) vivem no repositório
para valer também em sessão remota. Elas entram quando o assunto é plano de
eventos, instrumentação ou auditoria do que é medido. Procedência, o que foi
conferido antes de trazer e como atualizar estão em `docs/skills-de-fora.md`.
A regra com elas é uma só: não editar. O que fazemos diferente vira skill
nossa.

**Por que isto foi feito.** O ciclo de aprendizado abaixo depende de o agente
LEMBRAR de abrir o manual certo, e essa é a parte que falha. Em 03/09 uma
sessão inteira leu o funil pelo caminho errado da consulta e tirou três
conclusões falsas seguidas; o método que evitaria isso estava escrito em
`docs/agentes/skills/analise-da-operacao.md` desde agosto, e ninguém mandou
abrir.

As skills carregam a armadilha (o que faz errar) e apontam para os documentos
longos quando a tarefa pede o método completo. Elas NÃO substituem os manuais
de papel: o que cada agente faz continua em `docs/agentes/<papel>.md`.

Ao aprender uma regra nova que valeria para vários papéis, o lugar dela é uma
skill, não o manual de um papel só. `npm run conferir:skills` reprova se uma
skill parar de carregar ou passar a apontar para arquivo que não existe mais.

## Alçada (autonomia ampla, com guarda-corpos)

PODE sem pedir: analisar qualquer dado; editar código do app e do site com
build e tipos passando; corrigir texto e UX; escrever artigos e conteúdo;
subir na main; publicar artifacts; abrir issues.

NUNCA sem o Rodrigo pedir explicitamente: mudar preço ou planos; mexer em
cobrança (Stripe, RevenueCat, Play, App Store); enviar qualquer coisa a
clientes (e-mail, push, notificação); apagar dados; alterar banco além de
tabelas novas; gastar dinheiro; publicar nas lojas; mudar chaves ou segredos.

Na dúvida entre fazer e recomendar: recomendar, com o raciocínio.

## Fontes de dados (a verdade única)

- **Funil**: GET https://www.mentorque.com.br/api/funil — semanas com
  aberturas, visitantes, cadastros, paywall, checkouts, assinaturas, churn.
  Detalhe fino na tabela `funil_eventos` (Supabase, via painel do Rodrigo).
- **Receita web**: Stripe (integração conectada nas sessões).
- **Tráfego do site**: Vercel Analytics (integração conectada).
- **Código e histórico**: este repositório (`rod455/mentorque`, branch main).
- **Relatórios anteriores**: artifacts da conta + `DIARIO.md`.

## Estilo

Relatórios em português natural, sem travessão (—), números com comparação
contra o período anterior, e SEMPRE terminando com no máximo 3 recomendações
priorizadas. Ruído é inimigo: só notificar o Rodrigo com substância.

## A régua de cada papel, e quem corrige (19/09/2026)

Todo manual tem uma seção **"A régua da rodada"**: a lista do que é uma rodada
bem feita, em critérios que alguém de fora consegue conferir. "Está bom" não é
critério; "tem o número e a janela do lado" é.

Duas obrigações saem disso, e elas valem para todos:

1. **Antes de publicar, a rodada se mede contra a própria régua** e diz, no
   artifact e no diário, qual critério não cumpriu e por quê. Falhar com o
   motivo escrito é rodada honesta; falhar em silêncio é o que a régua existe
   para impedir.
2. **O Diretor corrige de fora, na segunda.** Autoavaliação tem o defeito de
   quem se avalia, então quem lê a semana inteira dá o veredito de cada rodada
   contra a régua daquele papel. E na primeira segunda do mês ele faz o
   trabalho mais lento: lê o mês inteiro, acha o que se repete e **propõe a
   mudança no manual** para o dono aprovar.

**Por que não é automático.** O dono perguntou sobre a função Outcomes do
Claude, que é exatamente isto com um corretor de máquina: rubrica escrita, um
agente separado corrigindo, e o trabalho refeito até passar. Ela existe em
outro produto (agentes gerenciados pela API) e não nas rotinas agendadas que
rodam estes papéis. A rubrica, que é a metade que faz o trabalho melhorar, não
depende de produto nenhum: depende de estar escrita.

**A memória também não é automática aqui, e isso é escolha.** O que os agentes
aprendem vira linha no manual, com commit e motivo, e não memória opaca que se
escreve sozinha: o dono lê, discorda e apaga quando quiser. O preço é que
alguém precisa escrever a lição; a vantagem é que ela é auditável e vale para
os sete papéis ao mesmo tempo.

## O time

| Papel | Onde roda | Cadência | Manual |
|---|---|---|---|
| Sentinela | n8n (workflow "Sentinela Mentorque") | 2x por dia | sentinela.md |
| Analista de Dados | n8n (coletores) | diário | analista-dados.md |
| Diretor de operação | Rotina Claude | semanal (seg 08h) | diretor.md |
| QA/Produto | Rotina Claude | semanal (qua 08h) | qa-produto.md |
| CRO/BeSci | Rotina Claude | semanal (sex 08h) | cro-besci.md |
| Conteúdo & SEO | Rotina Claude | semanal (ter 08h) | conteudo-seo.md |
| Mídia paga | Rotina Claude | semanal (qui 08h) | midia-paga.md |
| ASO & Lojas | Rotina Claude | dias 1 e 15 (08h) | aso-lojas.md |
| Guardião das conferências | Rotina Claude | semanal (sáb 08h) | guardiao-conferencias.md |
| Segurança e dependências | Rotina Claude | semanal (dom 08h) | seguranca-dependencias.md |

## Mexeu em workflow do n8n? Publique, senão não vale (19/09/2026)

A ferramenta `update_workflow` salva um RASCUNHO. O workflow continua rodando a
versão publicada, e a execução manual também: ela roda verde, com o
comportamento antigo, e nada avisa que o seu conserto ficou de fora.

Foi o que aconteceu com o Vigia de anomalias. O conserto do alarme sobre erro
já morto foi escrito às 12h11 de 19/09, dado como feito, e às 16h58 a versão
ativa ainda era a antiga: o aviso falso sairia de novo no dia seguinte.

Então: depois de `update_workflow`, `publish_workflow`, SEMPRE. E confira com
`get_workflow_details` que `versionId` e `activeVersionId` são iguais, porque
essa igualdade é a única prova de que o que você escreveu é o que roda.

E o irmão dessa armadilha, achado pelo agente de Mídia no mesmo dia: **execução
verde do n8n não prova gravação.** Ele subiu o teto de termos do coletor, o
fluxo rodou verde, e a linha de `google_ads` simplesmente não foi gravada: a
rota recusou o pacote com 413 porque ele passou de 20.000 bytes, e o nó de
gravação segue em frente no erro. As outras dez fontes gravaram, nada gritou. O
que prova gravação é o `coletado_em` da linha no banco, comparado com o das
outras fontes do mesmo dia.

Só o Diretor notifica o Rodrigo por padrão; os especialistas publicam
artifact e registram no diário, e o Diretor consolida na segunda.
