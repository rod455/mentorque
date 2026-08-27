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
- Quando tudo volta ao normal depois de uma falha confirmada, manda UM aviso
  de recuperação e zera o estado. Um, não um por rodada.
- Estado de problema com mais de 24h é considerado travado: some em silêncio,
  sem e-mail. Ver Aprendizados.
- Canal: e-mail (credencial "Gmail account", Gmail OAuth2) para
  rodrigomoraessilva455@gmail.com e mentorque.ar@gmail.com.

## Aprendizados

- **A memória do workflow (`$getWorkflowStaticData`) só persiste o que o n8n
  enxerga como ATRIBUIÇÃO. `delete` não persiste.** Foi este o defeito de
  22 a 26/08: um 401 antigo no `/api/funil` ficou gravado, o
  `delete sd.assinatura` apagava a chave dentro da execução e ela reaparecia
  intacta na rodada seguinte, então toda rodada mandava um "voltou ao normal"
  sobre um problema que não existia mais havia dias. Oito e-mails de nada.
  A prova estava no próprio histórico: a GRAVAÇÃO da falha durou dias, a
  LIMPEZA nunca durou uma rodada. Limpar sempre por `sd.x = ""` / `sd.x = 0`.
- **Todo estado guardado precisa de prazo de validade.** A correção acima
  sozinha ainda deixaria o mesmo defeito voltar se a persistência falhasse
  por outro motivo. Por isso o carimbo do problema expira em 24h: a Sentinela
  roda a cada 12h e refaz o carimbo a cada rodada durante uma queda de
  verdade, então carimbo com mais de um dia significa que já passaram duas
  rodadas com tudo certo — é lixo preso, não queda em curso. Nesse caso ela
  limpa em SILÊNCIO, sem e-mail de recuperação. Vale como regra geral para
  qualquer agente que guarde estado entre execuções.
- **Alerta que chega quando está tudo bem é pior que não alertar.** Oito
  e-mails de "voltou ao normal" ensinaram o dono a ignorar o remetente. O
  próximo aviso REAL competiria com essa memória. Silêncio é a promessa do
  papel, e quebrá-la custa mais que uma queda não avisada.
- Setup OAuth: o secret de um client não é copiável nem do n8n nem do console
  do Google depois de criado; a saída é criar um secret ADICIONAL no client
  (sem apagar o antigo, que as outras credenciais usam).

## Direcionamentos do dono

- 2026-08-22: checar 2x por dia basta; não vigiar de hora em hora.
- 2026-08-22: dupla homologação obrigatória — nunca alertar por uma leitura
  única; esperar 1 minuto e confirmar antes de reportar.
- 2026-08-27: "se está tudo funcionando, não deveria ficar avisando". E-mail
  só quando encontra um problema e quando ele volta ao normal. Nada de
  confirmação periódica de que está tudo bem: se a Sentinela está calada, é
  porque está tudo bem.
