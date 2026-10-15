-- DE ONDE VEIO CADA ASSINATURA (15/10/2026), gravado por quem escreve a linha.
--
-- POR QUE EXISTE. Até aqui `subscriptions` não dizia de onde a assinatura
-- veio, e a casa deduzia: "tem id do Stripe" era venda, "não tem" era
-- cortesia. Funcionou até a primeira venda de loja (Play, 25/09), que não tem
-- id do Stripe e virou "cortesia" em três lugares ao mesmo tempo: a
-- conferência das assinaturas ("cortesia, nao e venda"), o painel ("0
-- pagando, 1 cortesia") e a conferência da loja, que somava cortesia com
-- venda e podia dizer "batem" com uma venda perdida. Achado do QA em 14/10;
-- decisão do dono em 15/10 de gravar a origem em vez de continuar deduzindo.
--
-- QUEM ESCREVE, e é por isso que a coluna não tem padrão:
--   stripe      → lib/subscriptionSync.ts (webhook e rotas do Stripe)
--   app_store   → app/api/revenuecat/webhook (store APP_STORE ou MAC_APP_STORE)
--   play_store  → idem (store PLAY_STORE)
--   loja        → idem, qualquer outra loja que o RevenueCat mande
--   cortesia    → liberada na mão (revisor das lojas, teste) ou concedida
--                 como PROMOTIONAL no RevenueCat. Nunca foi receita.
-- Linha sem origem é linha que nenhum dos escritores acima gravou: quem der
-- cortesia na mão, grave `origem = 'cortesia'` junto.
--
-- A coluna `provider`, que já existia, nunca foi escrita por código nenhum e
-- está nula nas 13 linhas de 15/10. Ficou como está.

alter table public.subscriptions
  add column if not exists origem text
  check (origem in ('stripe', 'app_store', 'play_store', 'loja', 'cortesia'));

-- O PREENCHIMENTO DAS LINHAS ANTIGAS, lido em 15/10: 13 linhas.
--   3 com id do Stripe (canceladas)                → stripe
--   1 sem Stripe, com `assinou` da loja (Android)  → play_store
--   9 sem Stripe e sem `assinou` nenhum (inativas) → cortesia
-- As nove são DEDUZIDAS: sem id de cobrança e sem evento de venda, a única
-- explicação que sobra é liberação na mão. Os webhooks regravam a origem a
-- cada evento, então este preenchimento só vale até a próxima escrita.
update public.subscriptions s set origem = case
  when s.stripe_subscription_id is not null then 'stripe'
  when exists (select 1 from public.funil_eventos f
                where f.user_id = s.user_id and f.evento = 'assinou'
                  and f.origem = 'revenuecat' and f.plataforma = 'android') then 'play_store'
  when exists (select 1 from public.funil_eventos f
                where f.user_id = s.user_id and f.evento = 'assinou'
                  and f.origem = 'revenuecat' and f.plataforma = 'ios') then 'app_store'
  when exists (select 1 from public.funil_eventos f
                where f.user_id = s.user_id and f.evento = 'assinou'
                  and f.origem = 'revenuecat') then 'loja'
  else 'cortesia'
end
where s.origem is null;
