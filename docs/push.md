# Push de verdade: o que está pronto e o que falta ligar

Decisão do dono (28/08/2026): construir a infraestrutura de push mesmo sem
uso voltado ao usuário ainda, para campanhas internas e reengajamento quando
fizer sentido. Os lembretes do dia a dia (quiz às 9h, fim do teste grátis)
continuam LOCAIS e não dependem de nada desta página.

## O desenho, e por que ele é assim

Dois transportes, um por plataforma:

- **Android → Firebase (FCM)**: o app registra e o servidor manda pelo
  Google. Só precisa do `google-services.json` no repositório (já está).
- **iPhone → APNs direto**: o servidor fala com a Apple usando a chave `.p8`,
  sem SDK do Firebase dentro do app. A alternativa exigiria costurar o
  projeto Xcode à mão, que não dá para compilar e conferir fora de um Mac;
  falando direto com a Apple, o app não muda nada no iPhone.

O registro no app acompanha o interruptor de avisos do Perfil (mesma
permissão dos lembretes), grava na tabela `push_tokens` do Supabase (RLS sem
policy: só o servidor toca) e o envio é a rota `/api/push/enviar`, trancada
pela DADOS_CHAVE e SEM nenhum chamador automático: mensagem a cliente é
alçada do dono, um pedido por vez. Tokens de aparelhos que desinstalaram são
limpos a cada envio.

## Estado (28/08/2026)

- [x] Código do app, tabela, rotas: prontos e no main.
- [x] Projeto Firebase criado (mentorque-5f8b4) e `google-services.json` em
      `android/app/` (o gradle aplica o plugin do Google sozinho).
- [x] Chave APNs `.p8` criada (28/08, Production, Team Scoped). O Team ID é
      GGM89XNN4S; o Key ID e o arquivo ficam com o dono, fora do repositório.
- [x] Capacidade Push Notifications ligada no App ID `mentorque.app` e perfil
      de assinatura regenerado (28/08). Substituir o .mobileprovision no
      Codemagic é parte deste passo.
- [x] `aps-environment` no App.entitlements (entrou DEPOIS do item acima, na
      ordem que não quebra a assinatura).
- [ ] Envs na Vercel (Production + redeploy):
      `FCM_CONTA_SERVICO` (JSON da conta de serviço do Firebase),
      `APNS_CHAVE_P8` (conteúdo do arquivo .p8),
      `APNS_KEY_ID`, `APNS_TEAM_ID`.
- [ ] Build novo nas lojas com o plugin embarcado (a 1.3 preparada já leva).

Observações: o app iOS registrado no Firebase e o `GoogleService-Info.plist`
NÃO são usados neste desenho (registrar não fez mal nenhum; o arquivo não
precisa entrar no repositório). Subir a `.p8` no Firebase também é
dispensável: quem fala com a Apple é o nosso servidor.

## Como testar quando estiver ligado

```
curl -X POST https://mentorque.com.br/api/push/enviar \
  -H "content-type: application/json" -H "x-mq-chave: A_CHAVE" \
  -d '{"titulo": "Teste interno", "corpo": "Chegou? Então está de pé.", "userId": "SEU_UUID"}'
```

A resposta diz quantos aparelhos receberam, quantos tokens mortos foram
limpos e quantos ficaram sem transporte (credencial da plataforma ausente):
dá para ligar uma perna de cada vez.

## Limites combinados

- **Mensagem a cliente é alçada do dono**: a rota de envio não tem nenhum
  chamador automático, e nenhum agente cria um sem decisão explícita dele.
- O envio em massa (`"todos": true`) existe para o dia em que houver uma
  campanha; usar com o mesmo cuidado de um e-mail em massa.
