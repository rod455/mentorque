"use client";

import { useEffect, useState } from "react";
import { destinoDaPonteDaJanela, type DestinoDaPonte } from "@/lib/app/pontePraApp";

// Ponte de retorno dos links de autenticação para o app das lojas.
//
// O problema que a fez nascer: o GoTrue do Supabase recusa
// `mentorque://auth-callback` na validação de Redirect URLs — mesmo cadastrado,
// mesmo com curinga — e cai no Site URL. Resultado: a sessão nascia no site
// dentro da janelinha do Safari e o app continuava deslogado.
//
// A saída é não depender disso. Pedimos o retorno para ESTA página, que é um
// endereço https comum e passa na validação sem discussão. Daqui, uma navegação
// para o esquema próprio entrega o código ao app — e isso o
// SFSafariViewController faz sem problema, porque é o iOS abrindo um app
// instalado, não o Supabase validando uma URL.
//
// O QUE MUDOU EM 20/09/2026. Antes, só os links pedidos DE DENTRO do app
// passavam por aqui; quem pedia pelo site voltava para o site. O dono decidiu o
// contrário: "sempre direcione para o app que o usuário tem, vamos utilizar o
// mínimo possível do aplicativo web" — e, logo depois, "se for aberto pelo pc,
// pode cair na web". Então TODO link de e-mail volta para cá, e é aqui que a
// bifurcação acontece, olhando o aparelho de quem abriu.
//
// A regra está em lib/app/pontePraApp.ts, pura e conferida. Esta página é só a
// mão que executa: computador segue reto para a web; celular tenta o app e,
// se ninguém atender no tempo combinado, segue para a web sozinho.
export default function AuthBridgePage() {
  const [destino, setDestino] = useState<DestinoDaPonte | null>(null);

  useEffect(() => {
    const d = destinoDaPonteDaJanela();
    setDestino(d);

    if (d.tipo === "web") {
      window.location.replace(d.url);
      return;
    }

    // Imediato: na maioria dos casos o app abre antes de a página pintar.
    window.location.replace(d.url);

    // A RESERVA, e por que ela é por relógio.
    //
    // Não existe forma de o navegador perguntar "este aparelho tem o app?". O
    // que existe é o efeito colateral: se o app assumiu, o navegador vai para
    // segundo plano e a página fica escondida. Então o sinal de que DEU CERTO é
    // a página sumir, e o sinal de que não deu é ela continuar aqui.
    //
    // Sem isto, quem não tem o app instalado ficaria numa tela parada olhando
    // para "Abrindo o Mentorque…" para sempre, segurando na mão um link de
    // recuperação de senha que só funciona uma vez.
    let seguiu = false;
    const irParaWeb = () => {
      if (seguiu || document.hidden) return;
      seguiu = true;
      window.location.replace(d.reserva);
    };
    const cancelar = () => { seguiu = true; };

    const relogio = window.setTimeout(irParaWeb, d.esperaMs);
    document.addEventListener("visibilitychange", cancelar);
    window.addEventListener("pagehide", cancelar);
    return () => {
      window.clearTimeout(relogio);
      document.removeEventListener("visibilitychange", cancelar);
      window.removeEventListener("pagehide", cancelar);
    };
  }, []);

  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100dvh",
        margin: 0,
        padding: "24px",
        textAlign: "center",
        background: "#16181d",
        color: "#f4f2ec",
        font: '15px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div>
        <p style={{ fontWeight: 600 }}>Abrindo o Mentorque…</p>
        <p style={{ opacity: 0.6, fontSize: 13 }}>Se não abrir sozinho, toque no botão abaixo.</p>
        {destino?.tipo === "app" && (
          <>
            <a
              href={destino.url}
              style={{
                display: "inline-block",
                marginTop: 16,
                padding: "12px 24px",
                borderRadius: 999,
                background: "#f2a623",
                color: "#16181d",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Abrir o Mentorque
            </a>
            {/* A saída manual: quem não tem o app não fica preso esperando o
                relógio, e quem prefere o navegador escolhe. */}
            <p style={{ marginTop: 14 }}>
              <a href={destino.reserva} style={{ color: "#f4f2ec", opacity: 0.55, fontSize: 13 }}>
                Continuar no navegador
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
