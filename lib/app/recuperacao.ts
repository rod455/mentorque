// O link de recuperação de senha se reconhece pela URL, nos DOIS caminhos.
//
// POR QUE ISTO É UM ARQUIVO SEPARADO E PURO (20/09/2026). A detecção precisava
// funcionar na web e no app das lojas, e a segunda correção da proposta do QA
// (docs/agentes/propostas/recuperar-senha-nao-recupera.md) explica por quê:
//
//   - na WEB, quem encontra o token na URL é o próprio supabase-js, pelo
//     `detectSessionInUrl`, e ele emite o evento `PASSWORD_RECOVERY`;
//   - no APP NATIVO, quem cria a sessão somos nós, chamando
//     `exchangeCodeForSession` ou `setSession` na mão dentro do
//     `completeOAuth`. Esses emitem `SIGNED_IN`, não `PASSWORD_RECOVERY`.
//
// Ou seja: escutar só o evento funciona no navegador e FALHA CALADO no app,
// que é justamente onde o defeito é pior. O que carrega a intenção nos dois
// caminhos é a própria URL, porque o link do e-mail traz `type=recovery`.
//
// Puro de propósito: sem React, sem Supabase, sem `window`. Assim
// `scripts/verifica-login.ts` consegue provar o comportamento sem subir nada,
// e a suíte de navegador não precisa de e-mail de verdade para isso.

/**
 * A URL é um retorno de recuperação de senha?
 *
 * O `type=recovery` pode vir na QUERY (fluxo PKCE, `?code=...&type=recovery`)
 * ou no FRAGMENTO (fluxo implícito, `#access_token=...&type=recovery`). A
 * ponte `/auth-bridge` repassa os dois inteiros para o esquema próprio, então
 * aqui chega de qualquer um dos jeitos.
 */
export function ehLinkDeRecuperacao(rawUrl: string): boolean {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return false;
  }
  const doFragmento = new URLSearchParams(url.hash.replace(/^#/, ""));
  return (url.searchParams.get("type") ?? doFragmento.get("type")) === "recovery";
}
