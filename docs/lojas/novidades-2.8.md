# Novidades da versão 2.8

Aberta em 17/09/2026, logo depois de a 2.7 ser aprovada. Tudo o que entra aqui
**já roda na web** pelo deploy da Vercel; o binário só importa para o app das
lojas.

**Onde a 2.7 está:** aprovada em 17/09, build 67, nas duas lojas.

## O que vai NO BINÁRIO, e o que já está no ar

A separação importa: sem ela a conta do release sai dobrada e a ficha promete o
que a loja não entrega.

### Vai no binário, e a pessoa sente

1. **Recuperar senha passa a recuperar senha** (20/09). Até aqui o link do
   e-mail criava SESSÃO e a senha antiga continuava valendo, para sempre: não
   existia tela nenhuma para escolher uma nova, e não havia um
   `updateUser({ password })` no repositório inteiro. Entrou
   `components/app/NovaSenha.tsx`, montada em `Sobreposicoes.tsx`, não pulável.
2. **"Esqueci minha senha" ganhou tela própria** (21/09, pedido do dono). Um
   campo de e-mail só, o que já estava digitado vai junto, e no fim um aviso
   dizendo PARA QUAL endereço as instruções foram.
3. **"Trocar senha" no Perfil troca senha** (20/09). Ele chamava o mesmo
   `resetPassword`: mandava e-mail e escrevia "link enviado", sem trocar nada.
   Agora abre a mesma tela, com a senha atual conferida antes.
4. **Saída para quem o e-mail não alcança** (20/09). Lembrete de spam e um
   "não chegou?" que abre o formulário de suporte com a mensagem e o e-mail já
   preenchidos, sem precisar estar logado.
5. **O link do e-mail volta para o APP** (21/09). Computador segue para a web;
   celular tenta o app e, se ninguém atender em 2,5 segundos, segue para a web.

### Vai no binário e ninguém vê (medição)

6. **`tentou_assinar`** (18/09): a tentativa de compra de quem não tem conta,
   emitida ANTES do desvio para o login, nos seis caminhos do paywall.
   **Atenção ao tamanho disto:** no Android não há botão de compra (modo
   leitor), então o ganho real é iPhone e web. Ver `docs/agentes/qa-produto.md`.
7. **`user_id` em todo evento** (21/09): catorze dos dezoito tipos chegavam ao
   banco sem identificação, e retenção era contada por armazenamento de
   navegador.

### Já está no ar, NÃO conta como novidade da loja

- `clicou_baixar` e `clicou_consultoria`: os dois moram em `components/site/`
  e `components/sections/`, que são páginas do site, servidas pela Vercel.
- O otimizador de imagem desligado e a subida do `next` para 14.2.35: build do
  site.
- Os modelos de e-mail de conta na marca: painel do Supabase.

## A nota da App Store

Escrita pela regra da casa: fala do ganho, não do defeito; verbo na ação da
pessoa; nada que não tenha sido conferido. Cabe também no limite de 500
caracteres da Play.

```
Sua senha, no seu controle.

Esqueceu a senha? Toque em "Esqueci minha senha", confirme o e-mail e abra o
link que chega: o Mentorque abre direto na tela para você escolher a senha
nova.

A tela lembra de olhar o spam e, se o e-mail demorar, abre um caminho para
falar com a gente sem precisar entrar.

No Perfil, você troca a senha quando quiser, confirmando a atual antes.

E os links que enviamos por e-mail passam a abrir o app.
```

**O que ficou DE FORA da nota, de propósito:** os dois itens de medição. Eles
não mudam nada que a pessoa sinta, e "melhoramos nossa telemetria" na ficha da
App Store é texto que só serve para ocupar espaço.

## Roteiro de aparelho, escrito ANTES do build

Regra do dono de 09/09/2026: build sem roteiro não sai, e conferência verde
prova o que a conferência olha, não o binário. Nenhuma suíte daqui alcança a
WebView do aparelho.

**O que NENHUMA conferência alcança nesta versão:**

1. **Recuperar senha, ponta a ponta, no celular.** É o passo que decide.
   1. no app, tocar em "Esqueci minha senha" com o e-mail já digitado na tela
      de entrar, e confirmar que ele veio junto;
   2. enviar, e conferir que o aviso diz o endereço certo;
   3. abrir o link **no celular, com o app instalado**, e confirmar que o
      MENTORQUE abre, não o navegador;
   4. definir a senha nova;
   5. **fechar o app, abrir e entrar com ela.** O passo 5 é o único que prova.
      Chegar logado no passo 3 não prova nada, e é exatamente o que a versão
      antiga fazia.
2. **Trocar senha pelo Perfil**, com a senha atual ERRADA de propósito na
   primeira tentativa, para ver a recusa.
3. **"Não chegou?"** na tela de instruções enviadas: a folha abre, a mensagem
   vem escrita e o e-mail vem preenchido.
4. **O paywall no iPhone**, tocando em comprar SEM conta, para ver se o desvio
   para o login acontece e se a pessoa volta ao paywall depois de entrar.

**O que este build NÃO conserta, e não pode ser dito como se consertasse:** a
falha do SDK da AppsFlyer em 25% dos aparelhos Android (15 de 61 na 2.7.0,
última em 21/09). A causa não foi encontrada e a versão nova não garante que
some. Sobre ela, a frase honesta continua sendo "sem sinal ainda".

## Antes de promover a produção

- `npm run conferir` inteiro, a bateria completa de navegador e o build local;
- `npm run conferir:versoes` já diz 2.8 nos três lugares e ainda não publicada;
- acrescentar `2.8` à lista `JA_PUBLICADAS` em `scripts/verifica-versoes.mjs`
  **só depois** da aprovação;
- o `/api/app/latest` aponta para o que está em PRODUÇÃO: bumpar com a versão
  em análise acende o aviso de "versão nova" para todo mundo, apontando para
  algo que ninguém consegue baixar.
