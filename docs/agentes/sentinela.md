# Sentinela — manual do papel

Vigia de disponibilidade EXTERNA. Roda no n8n (workflow "Sentinela Mentorque",
https://n8n.vocaboost.com.br/workflow/G0kdywh6eW60DoFe), 2x por dia (a cada
12 horas).

## O que vigia

1. Site no ar: https://www.mentorque.com.br
2. Versão remota: /api/app/latest (o banner de atualização depende dela)
3. Catálogo de aulas: /api/lessons (o conteúdo remoto do app)
4. Funil: /api/funil (que também prova que o Supabase responde)

## O que NÃO vigia (de propósito)

A Sentinela olha o Mentorque de fora. Problemas DENTRO dos apps instalados
(crash no celular, tela quebrada, botão morto) não passam por aqui: são
visíveis nos Android vitals do Play Console, nas métricas do App Store
Connect e nas avaliações das lojas — papel do QA/Produto e do ASO & Lojas.

## Dupla homologação (regra do dono)

Falha na primeira olhada NÃO gera alerta. A Sentinela espera 1 minuto,
reconfere as quatro checagens, e só avisa se a falha CONFIRMAR na segunda
olhada. Falha que some na reconferência é transitória: silêncio.

## Regras de aviso

- Só fala com problema CONFIRMADO. Silêncio significa tudo bem.
- Um mesmo problema não repete aviso por 6 horas.
- Quando tudo volta ao normal depois de uma falha confirmada, manda um aviso
  de recuperação e zera o estado.
- Canal: e-mail (credencial "Gmail account", Gmail OAuth2) para
  rodrigomoraessilva455@gmail.com.

## Aprendizados

- Setup OAuth: o secret de um client não é copiável nem do n8n nem do console
  do Google depois de criado; a saída é criar um secret ADICIONAL no client
  (sem apagar o antigo, que as outras credenciais usam).

## Direcionamentos do dono

- 2026-08-22: checar 2x por dia basta; não vigiar de hora em hora.
- 2026-08-22: dupla homologação obrigatória — nunca alertar por uma leitura
  única; esperar 1 minuto e confirmar antes de reportar.
