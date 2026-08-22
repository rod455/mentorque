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
| Diretor de operação | Rotina Claude | semanal (seg) | a criar |
| QA/Produto | Rotina Claude | semanal (qua) | a criar |
| CRO/BeSci | Rotina Claude | semanal (sex) | a criar |
| Conteúdo & SEO | Rotina Claude | semanal | a criar |
| ASO & Lojas | Rotina Claude | quinzenal | a criar |
