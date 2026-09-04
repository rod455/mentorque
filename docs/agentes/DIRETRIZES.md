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

## O time

| Papel | Onde roda | Cadência | Manual |
|---|---|---|---|
| Sentinela | n8n (workflow "Sentinela Mentorque") | 2x por dia | sentinela.md |
| Analista de Dados | n8n (coletores) | diário | analista-dados.md |
| Diretor de operação | Rotina Claude | semanal (seg 08h) | diretor.md |
| QA/Produto | Rotina Claude | semanal (qua 08h) | qa-produto.md |
| CRO/BeSci | Rotina Claude | semanal (sex 08h) | cro-besci.md |
| Conteúdo & SEO | Rotina Claude | semanal (ter 08h) | conteudo-seo.md |
| ASO & Lojas | Rotina Claude | dias 1 e 15 (08h) | aso-lojas.md |

Só o Diretor notifica o Rodrigo por padrão; os especialistas publicam
artifact e registram no diário, e o Diretor consolida na segunda.
