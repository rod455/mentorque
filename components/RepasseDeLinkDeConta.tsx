"use client";

import { useEffect } from "react";
import { ehSobraDeLinkDeConta } from "@/lib/app/pontePraApp";

// A página inicial repassa para a ponte o link de conta que caiu nela.
//
// O Supabase, quando recusa o destino pedido por um link de e-mail, devolve no
// endereço do site, que é esta página, com a credencial no endereço. Foi o que
// aconteceu com todo cadastro por e-mail feito no app Android desde 28/09: a
// pessoa confirmava o e-mail, caía aqui, e o app continuava deslogado. A ponte
// leva ao app no celular e ao /app no computador (lib/app/pontePraApp.ts).
//
// Não desenha nada e não faz nada no endereço comum da página inicial.
export function RepasseDeLinkDeConta() {
  useEffect(() => {
    const { search, hash } = window.location;
    if (ehSobraDeLinkDeConta(search, hash)) window.location.replace(`/auth-bridge${search}${hash}`);
  }, []);
  return null;
}
