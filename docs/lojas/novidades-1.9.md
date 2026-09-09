# Novidades da versão 1.9

Nasceu de teste em aparelho de verdade: o dono instalou a segunda 1.8 no Android
da Luana e trouxe dois relatos que nenhuma suíte nossa alcança, porque os dois
moram no WebView do Android.

## O que vai NO BINÁRIO

Só isto. Se algo não estiver na lista, não veio nesta versão.

1. **A foto do perfil do Google aparece no Android.** A busca da imagem passou a
   sair sem `Referer`. O dado sempre esteve certo (a conta tem `avatar_url` e
   `picture`, com a URL completa do lh3 terminando em `=s96-c`); quem falhava
   era o carregamento, e a assimetria aponta a causa: o Android serve a página
   de `https://localhost` e manda esse Referer, enquanto o iPhone usa
   `capacitor://`, que não é http e não manda Referer nenhum, e é justamente
   onde a foto sempre funcionou.
2. **Foto que não carrega vira a inicial do nome.** Vale com causa ou sem
   causa, e é o que garante o resto: antes o `<img>` quebrado desenhava um
   buraco vazio, que foi o que o dono viu.
3. **Tocar na foto pergunta entre câmera e galeria, no Android.** A ponte do
   Capacitor lê o atributo `capture` do campo e escolhe UM caminho: com ele,
   câmera direta; sem ele, seletor de arquivos. Não existe o terceiro, que é
   oferecer os dois. A pergunta agora é nossa, com dois campos por trás. No
   iPhone nada muda: lá o sistema já pergunta.

4. **A pessoa escolhe qual pedaço da foto fica**, no carro e no perfil, como no
   WhatsApp: a foto atrás de uma moldura fixa, arrasta e aproxima (pinça ou
   barra), e sai exatamente o que estava dentro. Aparece quando a foto precisa
   (proporção diferente da moldura, ou maior do que o que é guardado); foto já
   quadrada e pequena entra direto como sempre entrou. A conta mora em
   `lib/app/recorte.ts` e a `conferir:recorte` a exercita com números; a
   ligação inteira (arquivo entra, ajuste abre, botão recorta, foto vai para o
   carro) roda no navegador em `conferir:navegador foto`.

5. **Entrar com o Google abre a caixinha do sistema no Android**, como no
   iPhone, em vez de sair para o Chrome (decisão do dono: "vamos fazer na
   caixinha"). O plugin `@capgo/capacitor-social-login` entrou no binário do
   Android com o Facebook desligado por configuração, que era o que o segurava
   fora. Precisa do `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID` no build (já está no
   Codemagic) E de um cliente OAuth do tipo Android no Google Cloud com o
   pacote e os SHA-1 (lista do dono). **Se o Google não reconhecer a
   assinatura, o app cai no navegador sozinho**, que é o caminho de hoje e
   funciona: a folha nunca é beco sem saída (`conferir:login`).

   **O primeiro build da 1.9 (08/09) tinha isto quebrado**, visto no aparelho
   da Luana em 09/09: "You CANNOT use scopes without modifying the main
   activity". O plugin recusa qualquer lista de `scopes` no Android sem uma
   MainActivity modificada, e acrescenta `profile` e `email` sozinho; a gente
   mandava justamente esses dois. O Android deixou de mandar `scopes`
   (lib/app/socialLogin.ts) e a `conferir:login` cobra isso. **Precisa de build
   novo**: o de 08/09 não serve.

**Nenhuma permissão nova.** O Capacitor só pede `CAMERA` quando o app declara
essa permissão no manifesto, e o nosso não declara: a foto sai por
`ACTION_IMAGE_CAPTURE`, que é o app de câmera do aparelho fazendo o trabalho.
Declarar `CAMERA` para isto seria pedir na ficha da Play um acesso que o app não
usa.

## O que NÃO precisa de binário

Nada desta lista. Tudo aqui é WebView e só muda com build novo.

## Roteiro de aparelho, e ele é obrigatório

As três coisas desta versão são de Android e NENHUMA suíte alcança: o WebView do
aparelho não existe na bateria de navegador, e a decisão entre câmera e seletor
mora em código Java do Capacitor. A `conferir:aviso` cobra que as ligações não
sumam, e isso é tudo o que ela pode fazer.

1. Entrar com o Google numa conta que tenha foto e conferir que a foto aparece
   no Perfil. **Este é o item que pode reprovar**: a explicação do Referer
   encaixa no que se observou, mas não foi vista num aparelho. Se a foto
   continuar sem aparecer, o que se ganhou foi a inicial no lugar do buraco, e
   a causa é outra.
2. Tocar na foto e conferir que aparece a pergunta com "Tirar uma foto" e
   "Escolher da galeria".
3. Tocar em "Tirar uma foto": tem de abrir a câmera, e a foto tirada tem de
   virar o avatar.
4. Tocar em "Escolher da galeria": tem de abrir a galeria, e a imagem escolhida
   tem de virar o avatar.
5. **No iPhone**, tocar na foto tem de continuar abrindo a folha do SISTEMA, a
   de sempre, e não a nossa.
6. **Entrar com o Google no Android** tem de abrir a caixinha do sistema com
   as contas, sem sair do app. Se abrir o Chrome, o Google não reconheceu
   pacote + SHA-1: o Logcat com filtro `GoogleProvider` imprime o SHA-1 e o
   pacote que ele viu, para comparar com o cliente Android do Google Cloud. E
   nesse caso o login pelo Chrome tem de continuar funcionando, que é a queda.
7. **O ajuste com os dedos**, nos dois aparelhos: escolher uma foto do celular
   (é 4:3 ou 9:16, então o ajuste TEM de abrir), arrastar com um dedo, fazer
   pinça com dois, e conferir que a moldura nunca mostra borda vazia. Usar a
   foto e conferir que o que ficou no carro é o pedaço que estava na moldura.
   A pinça é o único gesto que a conferência de navegador não faz.

## Antes de enviar

- O nome da versão já está em 1.9 nos três lugares (`npm run conferir:versoes`).
- Ao publicar, acrescentar `"1.9"` à lista `JA_PUBLICADAS` em
  `scripts/verifica-versoes.mjs`. Foi esquecer isto na 1.8 que produziu duas
  versões com o mesmo nome e cegou o funil para a diferença entre elas.

## Notas para as lojas

A escrever quando a versão fechar, e seguindo as três regras da `ficha.md`:
falar do ganho e não do defeito, com o verbo na ação da pessoa, e sem prometer
nada que não tenha sido conferido em aparelho. **O item 1 do roteiro decide o
texto**: enquanto a foto não for vista funcionando num Android, a nota não pode
falar dela.
