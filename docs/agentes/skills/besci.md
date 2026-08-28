# Skill: BeSci aplicada ao Mentorque

A biblioteca de princípios comportamentais do time, traduzida para ESTE app
e ESTE público (dono de carro no Brasil, quer economizar e não ser enganado
na oficina). O CRO lê antes de toda rodada; os vereditos do caderno de
experimentos alimentam a seção final.

## Os princípios, na língua do Mentorque

- **Fricção**: cada campo, tela ou decisão a mais derruba gente. Perguntar
  só o que muda a experiência AGORA; o resto se pede depois, no contexto.
- **Prova social**: "outros como você" move mais que argumento. Depoimento
  real de loja > número de usuários > frase institucional. NUNCA inventar.
- **Aversão à perda**: mostrar o que a pessoa PERDE por não agir (dinheiro
  na oficina, garantia, vida útil) pesa mais que o que ganha. Usar com
  honestidade: perda real, nunca medo fabricado.
- **Efeito de progresso**: barra, checklist e "falta pouco" puxam conclusão.
  Trilha começada com progresso visível volta mais que lista fria.
- **Timing do pedido**: pedir avaliação, permissão ou upgrade logo APÓS um
  momento de valor percebido (resolveu um sintoma, completou uma trilha),
  nunca na chegada.
- **Enquadramento de preço**: âncora anual perto do custo de UMA visita à
  oficina; preço por dia; a comparação certa não é "grátis vs pago", é
  "app vs prejuízo".
- **Compromisso e consistência**: pequenas ações (cadastrar o carro, marcar
  a primeira aula) criam identidade de "cuido do meu carro"; a jornada deve
  pedir o micro antes do macro.
- **Clareza do próximo passo**: toda tela responde "e agora?". Tela sem
  próxima ação óbvia é onde a jornada morre.

## Regras de uso

- Um princípio por mudança; mudança com três princípios misturados não gera
  aprendizado nenhum quando o número se move.
- Copy honesta sempre: nada de urgência falsa, contador fake ou prova
  social inventada. Reputação de app de confiança É o produto.
- Medo tem teto: apontar risco real do carro sim, terrorismo mecânico não.

## Aprendizados com os nossos experimentos

- **2026-08-28, do achado que abriu lembrete-que-chega: elemento que a
  pessoa TOCA e que não responde é pior que elemento ausente.** O interruptor
  de avisos do Perfil não reagia ao toque e o convite depois do quiz nunca
  aparecia. Nenhuma tela vermelha, nenhuma reclamação, nada no funil: um
  recurso morto some sem fazer barulho. A regra que fica para as próximas
  rodadas: antes de escrever copy para um elemento que promete algo (aviso,
  lembrete, envio, agendamento), CONFERIR que a promessa tem como ser
  cumprida. Copy boa em cima de promessa que não sai é o jeito mais caro de
  perder confiança, porque a pessoa acredita primeiro.
- **2026-08-28: "sem erro" não é sinal de que funciona.** O caso de hoje não
  gerava erro na tela porque a espera simplesmente nunca terminava. Auditoria
  de jornada que se apoia só em app_erros e no funil não enxerga recurso
  parado: o funil mostra ausência, e ausência parece desinteresse do usuário.
  Quando uma etapa der zero absoluto, a primeira hipótese é máquina quebrada,
  não gente desinteressada.
- **2026-08-28 (correção, no mesmo dia): o inverso também vale, e derrubou
  metade do achado.** O padrão do `then` foi generalizado para o login social
  sem conferir o pacote, e o teste do dono em aparelho real provou que o
  login sempre funcionou: o pacote de login embrulha o proxy numa classe
  comum, sem `then`. Leitura de código é hipótese até passar por aparelho, e
  a diferença entre os dois casos era visível de antemão: os lembretes tinham
  prova de campo (erros nos aparelhos), o login não tinha nenhuma. Detalhe
  técnico que decide: a armadilha só existe em quem exporta o
  `registerPlugin` cru; classe que embrulha o proxy não a tem.
