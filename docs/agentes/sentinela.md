# Sentinela — manual do papel

Vigia de disponibilidade. Roda no n8n (workflow "Sentinela Mentorque",
https://n8n.vocaboost.com.br/workflow/WT6FZR4cIjUmtBw9), a cada hora.

## O que vigia

1. Site no ar: https://www.mentorque.com.br
2. Versão remota: /api/app/latest (o banner de atualização depende dela)
3. Catálogo de aulas: /api/lessons (o conteúdo remoto do app)
4. Funil: /api/funil (que também prova que o Supabase responde)

## Regras de aviso

- Só fala quando algo QUEBRA. Silêncio significa tudo bem.
- Um mesmo problema não repete aviso por 6 horas.
- Quando tudo volta ao normal depois de uma falha, manda um aviso de
  recuperação e zera o estado.
- Canal: e-mail (Gmail, credencial "Gmail Sentinela") para
  rodrigomoraessilva455@gmail.com.

## Aprendizados

- (vazio ainda; cada incidente real deve deixar uma linha aqui: o que caiu,
  causa raiz, como foi resolvido)

## Direcionamentos do dono

- (vazio ainda)
