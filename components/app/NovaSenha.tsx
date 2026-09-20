"use client";

// A TELA QUE FALTAVA: definir a senha nova (20/09/2026).
//
// Até aqui, "Esqueci minha senha" mandava um e-mail, o link criava sessão, e a
// senha antiga continuava sendo a única válida. Para sempre. Quem esqueceu
// ganhava um login temporário, não uma recuperação, e pedia o link de novo na
// vez seguinte. O achado é do QA, de 16/09, e o desenho está em
// docs/agentes/propostas/recuperar-senha-nao-recupera.md.
//
// A tela serve DOIS caminhos, e a diferença entre eles não é enfeite:
//
//   recuperação → a pessoa chegou pelo link do e-mail e NÃO sabe a senha
//                 antiga. O link é a prova de que ela tem o e-mail, e é só
//                 isso que se pode exigir. Não é pulável: pular devolve
//                 exatamente o defeito que este arquivo existe para consertar.
//
//   troca       → a pessoa está logada e pediu no Perfil. Aqui a senha atual é
//                 conferida, porque sem isso qualquer um com o aparelho na mão
//                 troca a senha da conta. Dá para fechar no X.
//
// Por que a confirmação em dois campos: senha é o único campo do app que a
// pessoa digita sem ver. Errar por um caractere e só descobrir no próximo
// login é o tipo de defeito que o app não tem como explicar depois.

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/app/auth";
import { useContent } from "./ui";

const MINIMO = 6;

export function NovaSenha() {
  const { modoSenha, definirSenha, trocarSenha, encerrarTrocaDeSenha, user } = useAuth();
  const c = useContent();
  const t = c.auth;

  const pedeAtual = modoSenha === "troca";
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [repetida, setRepetida] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [pronto, setPronto] = useState(false);
  const primeiro = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!modoSenha) return;
    setTimeout(() => primeiro.current?.focus(), 80);
  }, [modoSenha]);

  if (!modoSenha) return null;

  const curta = nova.length > 0 && nova.length < MINIMO;
  const diferentes = repetida.length > 0 && nova !== repetida;
  const podeSalvar = nova.length >= MINIMO && nova === repetida && (!pedeAtual || atual.length > 0) && !salvando;

  const salvar = async () => {
    setErro("");
    setSalvando(true);
    const r = pedeAtual ? await trocarSenha(atual, nova) : await definirSenha(nova);
    setSalvando(false);
    if (r.error) {
      setErro(r.error === "senha_atual_errada" ? t.currentPasswordWrong : t.errGeneric);
      return;
    }
    setPronto(true);
  };

  const fechar = () => encerrarTrocaDeSenha();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center">
      <div className="app-col w-full rounded-t-3xl bg-graphite-800 p-6 pb-8 ring-1 ring-white/10 sm:rounded-3xl">
        {pronto ? (
          <>
            <h2 className="font-display text-xl font-bold text-cream">{t.passwordDoneTitle}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-cream/70">{t.passwordDoneBody}</p>
            <button
              onClick={fechar}
              className="mt-6 h-12 w-full rounded-xl bg-amber font-display font-semibold text-graphite"
            >
              {t.passwordDoneCta}
            </button>
          </>
        ) : (
          <>
            <h2 className="font-display text-xl font-bold text-cream">
              {pedeAtual ? t.changePasswordTitle : t.newPasswordTitle}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-cream/70">
              {pedeAtual ? t.changePasswordBody : t.newPasswordBody}
            </p>
            {user?.email ? <p className="mt-1 text-sm text-cream/45">{user.email}</p> : null}

            {pedeAtual && (
              <input
                ref={primeiro}
                type="password"
                autoComplete="current-password"
                value={atual}
                onChange={(e) => setAtual(e.target.value)}
                placeholder={t.currentPassword}
                className="mt-5 h-12 w-full rounded-xl bg-graphite-700 px-4 text-cream placeholder:text-cream/35 ring-1 ring-white/10 focus:outline-none focus:ring-amber/50"
              />
            )}

            <input
              ref={pedeAtual ? undefined : primeiro}
              type="password"
              autoComplete="new-password"
              value={nova}
              onChange={(e) => setNova(e.target.value)}
              placeholder={t.newPassword}
              className="mt-3 h-12 w-full rounded-xl bg-graphite-700 px-4 text-cream placeholder:text-cream/35 ring-1 ring-white/10 focus:outline-none focus:ring-amber/50"
            />
            <input
              type="password"
              autoComplete="new-password"
              value={repetida}
              onChange={(e) => setRepetida(e.target.value)}
              placeholder={t.repeatPassword}
              className="mt-3 h-12 w-full rounded-xl bg-graphite-700 px-4 text-cream placeholder:text-cream/35 ring-1 ring-white/10 focus:outline-none focus:ring-amber/50"
            />

            {/* O aviso aparece enquanto a pessoa digita, não depois de tentar
                salvar: descobrir que a senha é curta só ao tocar no botão é o
                tipo de ida e volta que faz desistir. */}
            <p className="mt-3 min-h-[1.25rem] text-sm text-coral">
              {erro || (curta ? t.passwordTooShort : diferentes ? t.passwordsDiffer : "")}
            </p>

            <button
              onClick={salvar}
              disabled={!podeSalvar}
              className="mt-2 h-12 w-full rounded-xl bg-amber font-display font-semibold text-graphite disabled:opacity-40"
            >
              {salvando ? t.saving : t.savePassword}
            </button>

            {/* Fechar existe SÓ na troca pelo Perfil. Na recuperação a tela não
                é pulável, porque pular é o defeito. */}
            {pedeAtual && (
              <button onClick={fechar} className="mt-3 h-11 w-full text-sm font-medium text-cream/60">
                {c.common.cancel}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
