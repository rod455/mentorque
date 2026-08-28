# Push de verdade: o que está pronto e o que falta ligar

Decisão do dono (28/08/2026): construir a infraestrutura de push mesmo sem
uso voltado ao usuário ainda, para campanhas internas e reengajamento quando
fizer sentido. Os lembretes do dia a dia (quiz às 9h, fim do teste grátis)
continuam LOCAIS e não dependem de nada desta página.

## O que já está no código (embarcado desligado)

- **App**: quando a pessoa está logada e liga os avisos no Perfil, o aparelho
  registra e manda o token para o servidor; ao desligar, o servidor esquece o
  token (`lib/app/push.ts`, chamado por `useLembretes`). Nunca pede permissão
  sozinho: a permissão do sistema é a mesma dos lembretes locais e quem pede
  é o toque no Perfil.
- **Banco**: tabela `push_tokens` no Supabase (RLS ligada sem policy: só o
  servidor lê e escreve). Token é por aparelho, amarrado à conta.
- **Rotas**: `/api/push/registrar` (autenticada pelo Bearer do Supabase) e
  `/api/push/enviar` (trancada pela DADOS_CHAVE, uso interno; apaga sozinha
  os tokens que o FCM devolver como mortos).
- **Plugin**: `@capacitor/push-notifications` nas listas das duas
  plataformas. Sem as chaves de console tudo degrada em silêncio, então nada
  disso muda o comportamento do app publicado.

## O que só o dono pode fazer (nesta ordem)

1. **Criar o projeto no Firebase** (console.firebase.google.com, gratuito) e
   registrar o app Android (pacote `app.mentorque`; conferir o id em
   `android/app/build.gradle`). Baixar o `google-services.json` e colocar em
   `android/app/google-services.json` (o build já aplica o plugin do Google
   sozinho quando o arquivo existe).
2. **iPhone**: no portal da Apple (developer.apple.com → Identifiers), ligar
   a capacidade Push Notifications no App ID e gerar um perfil de assinatura
   NOVO, substituindo a cópia guardada no Codemagic (o perfil velho não
   carrega a capacidade e o build falharia na assinatura). Criar uma APNs
   Auth Key (.p8) em Keys e subir no Firebase (Configurações do projeto →
   Cloud Messaging → Apple). Depois disso, e só depois, adicionar ao
   `ios/App/App/App.entitlements`:

   ```xml
   <key>aps-environment</key>
   <string>production</string>
   ```

3. **Vercel**: criar a conta de serviço no Firebase (Configurações →
   Contas de serviço → Gerar nova chave privada) e colar o JSON inteiro na
   env `FCM_CONTA_SERVICO`. É segredo: não entra no repositório nunca.
4. **Release**: build novo nas lojas (o registro do token só existe no app
   empacotado com o plugin).

## Como testar quando estiver ligado

```
curl -X POST https://mentorque.com.br/api/push/enviar \
  -H "content-type: application/json" -H "x-mq-chave: A_CHAVE" \
  -d '{"titulo": "Teste interno", "corpo": "Chegou? Então está de pé.", "userId": "SEU_UUID"}'
```

A resposta diz quantos aparelhos receberam e quantos tokens mortos foram
limpos.

## Limites combinados

- **Mensagem a cliente é alçada do dono**: a rota de envio não tem nenhum
  chamador automático, e nenhum agente cria um sem decisão explícita dele.
- O envio em massa (`"todos": true`) existe para o dia em que houver uma
  campanha; usar com o mesmo cuidado de um e-mail em massa.
