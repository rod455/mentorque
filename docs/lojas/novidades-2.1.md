# Novidades da versão 2.1

Gerada em 09/09/2026, poucas horas depois da 2.0. **No código, a 2.1 é a 2.0
mais o "?" flutuante** (commit `5ea1362`, empurrado minutos antes de o dono
gerar a 2.0; se o build da 2.0 saiu de um commit anterior, o "?" chega ao
aparelho pela primeira vez na 2.1). Nada mais mudou no binário entre as duas.

## O que vai NO BINÁRIO

Tudo o que está em `novidades-2.0.md`, itens 1 a 6:

1. Foto do perfil do Google no Android (sem `Referer`), com a inicial do nome
   como queda se não carregar.
2. Câmera ou galeria ao tocar na foto, no Android.
3. Ajuste da foto com os dedos, no carro e no perfil.
4. Entrar com o Google pela caixinha do sistema no Android, sem `scopes` (o
   conserto que a 1.9 não tinha), com queda para o navegador se a caixinha
   não abrir.
5. O interruptor de avisos que diz a verdade sobre o aparelho, e o convite do
   pós-quiz que leva aos ajustes.
6. O "?" flutuante nas abas, que abre "Fale com a gente" já rolado.

## O que NÃO precisa de binário

Tudo do SEO de 08/09 (datas, links no texto, cartão por guia) e a medição do
site já estão no ar pela Vercel.

## Roteiro de aparelho, e ele é obrigatório

É o roteiro da 2.0, que nunca foi rodado inteiro. No aparelho da Luana
(Android) e num iPhone:

1. **Entrar com o Google no Android** abre a caixinha do sistema, sem sair
   para o Chrome, e o app cai logado. Se abrir o Chrome, o Logcat com filtro
   `GoogleProvider` diz qual SHA-1 e pacote o Google viu. Se abrir o Chrome, o
   login pelo Chrome tem de funcionar mesmo assim.
2. **A foto do perfil do Google aparece** no Perfil. É o item que pode
   reprovar; se reprovar, a inicial do nome aparece no lugar do buraco.
3. **Tocar na foto** pergunta entre "Tirar uma foto" e "Escolher da galeria"
   (Android); no iPhone, abre a folha do sistema de sempre.
4. **O ajuste** aparece depois de escolher a foto; arrastar move, pinça
   aproxima, e a foto guardada é o pedaço escolhido.
5. **O "?"** aparece nas abas, some no Perfil, e ao tocar a tela abre o Perfil
   já rolado em "Fale com a gente".
6. **Avisos**: ligar no Perfil sem permissão leva aos ajustes do aparelho;
   com permissão, ligar e desligar obedecem.

## Antes de enviar

- Versão 2.1 nos três lugares (`npm run conferir:versoes`).
- **Ao publicar, acrescentar `"2.1"` à lista `JA_PUBLICADAS`** em
  `scripts/verifica-versoes.mjs`, no mesmo dia.
- **Na Apple, subir o build não cria a versão.** Depois do Codemagic, criar a
  versão no App Store Connect, anexar o build, colar as notas e enviar para
  revisão. A App Store está na 1.7 desde 03/09 por falta desse passo.

## Notas para as lojas

As mesmas da 2.0 (`novidades-2.0.md`), que falam só do que foi conferido.
Crescem quando o roteiro acima passar.
