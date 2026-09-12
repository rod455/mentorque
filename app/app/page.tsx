"use client";

import { useEffect, useState } from "react";
import { usePrototype } from "@/lib/app/store";
import { useAuth } from "@/lib/app/auth";
import { isNativeApp } from "@/lib/app/wrapper";
import { porteiraFechada } from "@/lib/app/porteiraDaWeb";
import { veioComprar } from "@/lib/app/vendaPendente";
import { OnboardingFlow } from "@/components/app/OnboardingFlow";
import { BaixeOApp } from "@/components/app/BaixeOApp";
import { Shell } from "@/components/app/Shell";
import { SplashScreen } from "@/components/app/SplashScreen";

// The prototype is a client-side state machine: brand splash on entry, then
// run onboarding until the activation loop completes, then the app shell.
export default function AppPrototypePage() {
  const { s } = usePrototype();
  const { user, ready } = useAuth();
  const [splashDone, setSplashDone] = useState(false);
  // A porteira da web (12/09/2026): no site em produção, sem conta, o app
  // não abre: "baixe o app". Decidida num efeito porque depende de `window`.
  // `entrando` é quem tocou em "entrar com e-mail": a tela de login do app
  // abre (destino "auth", lido em useDestinoDoOnboarding). Ver
  // lib/app/porteiraDaWeb.ts.
  const [hostname, setHostname] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);
  useEffect(() => {
    setHostname(window.location.hostname);
  }, []);

  if (!splashDone) return <SplashScreen onDone={() => setSplashDone(true)} />;

  if (hostname === null || !ready) return null;
  if (!entrando && porteiraFechada({ nativo: isNativeApp(), hostname, temConta: !!user })) {
    return (
      <BaixeOApp
        onEntrarComEmail={() => {
          try { window.sessionStorage.setItem("mentorque-onboarding-destino", "auth"); } catch { /* ignore */ }
          setEntrando(true);
        }}
      />
    );
  }
  if (entrando && !user) return <Shell />;

  // QUEM VEIO PELO LINK DE VENDA NÃO PASSA PELO ONBOARDING.
  //
  // O DEFEITO, relatado pelo dono em 05/09/2026 e visível no funil daquele
  // minuto: ele abriu mentorque.com.br/ALE100, entrou com o Google e caiu na
  // tela inicial, sem checkout e sem cupom. De novo, depois de o conserto de
  // 02/09 já ter atacado a parte da travessia do login.
  //
  // A CAUSA é esta linha aqui embaixo, e não o login. Todo o tratamento do
  // link de venda mora em `usePlanoPendente`, que é chamado dentro do Shell
  // (components/app/Shell.tsx). E o Shell só nasce quando `s.onboarded` é
  // verdadeiro. Num aparelho novo, que é o caso de qualquer pessoa para quem
  // esse link é mandado, o Shell não nasce: nasce o OnboardingFlow. O plano e
  // o cupom nunca são lidos da URL, nada é guardado, e a pessoa faz as cinco
  // páginas de apresentação até cair no Início.
  //
  // O rastro que provou: às 21:49:27 o aparelho registrou `comecou_onboarding`
  // com `utm_campaign = ale100`, e às 21:49:34 `terminou_onboarding` com
  // origem "agora-nao". Um link de compra direta produzindo onboarding. E o
  // `viu_paywall` que veio depois tinha origem "direto", que é o paywall
  // aberto por conta própria; se a venda pendente tivesse guiado a navegação,
  // a origem seria "onb-monthly" ou a tela seria o checkout, que nem emite
  // esse evento.
  //
  // O conserto é deixar o Shell nascer para quem chegou comprando. Não é só
  // consertar o caminho: é o desenho certo. Quem clicou num link que diz
  // "assinar mensal com este cupom" já foi convencido na conversa, e mostrar
  // cinco páginas de apresentação para essa pessoa é vender de novo para quem
  // veio comprar, que é exatamente o que o comentário do
  // lib/app/aberturaDoApp.ts diz para não fazer.
  //
  // `onboarded` NÃO é marcado como feito por baixo do pano. Se a pessoa
  // desistir da compra, ela continua sendo alguém que nunca viu a
  // apresentação, e a próxima abertura mostra o onboarding normalmente.
  // E O `s.premium` FECHA O BURACO QUE O CONSERTO DE CIMA DEIXAVA ABERTO.
  //
  // `onboarded` não é só o que o `finishOnboarding` gravou: na leitura do
  // armazenamento ele é recalculado como `onboarded && vehicles.length > 0`
  // (lib/app/store.tsx). Ou seja, quem assina pelo link e ainda não cadastrou
  // carro continua contando como não-onboardado.
  //
  // Sem esta segunda condição, a pessoa pagava, fechava o app, abria de novo e
  // levava na cara as cinco páginas de apresentação, com a página de "monte seu
  // teste" no fim. Vender de novo para quem acabou de pagar é pior do que o
  // defeito original.
  //
  // `s` aqui já é a sessão EFETIVA: uma assinatura ativa no Stripe força
  // `premium`, mesmo que a sessão local ainda não saiba (store.tsx, `es`).
  if (!s.onboarded && (veioComprar() || s.premium)) return <Shell />;

  return s.onboarded ? <Shell /> : <OnboardingFlow />;
}
