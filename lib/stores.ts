// Endereços do app nas lojas.
//
// Ficam num lugar só porque o id da Apple já aparecia escrito à mão em mais de
// um ponto — e um id errado é o tipo de defeito que ninguém vê até alguém tocar
// no botão e cair numa App Store dizendo que o app não existe.

/** Id numérico do app na App Store (o mesmo da URL do App Store Connect). */
export const APPLE_APP_ID = "6797291865";

/** Ficha do app na App Store. */
export const APP_STORE_URL = `https://apps.apple.com/br/app/mentorque/id${APPLE_APP_ID}`;

/**
 * A landing já anuncia a App Store?
 *
 * O app FOI aprovado e a ficha existe — este interruptor não é sobre isso. Ele
 * é sobre a landing, que ainda está escrita para o pré-lançamento: "acesso
 * antecipado", "lote de fundadores", "antes de chegar às lojas". Um botão de
 * baixar no meio disso se contradiz, e a página perde os dois discursos de uma
 * vez.
 *
 * Fica `false` até a landing ser reescrita para app publicado. Aí basta virar
 * para `true` — o endereço já está aqui, testado, e os selos voltam sozinhos
 * nos dois lugares onde aparecem.
 */
export const APP_STORE_PUBLICADO = false;

/**
 * Folha de avaliação, para o "Avaliar o Mentorque" dentro do app.
 * `?action=write-review` abre direto a caixa de nota, em vez da ficha.
 */
export const APP_STORE_REVIEW_URL = `https://apps.apple.com/app/id${APPLE_APP_ID}?action=write-review`;

/** Ficha do app na Google Play. Publicada. */
export const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=mentorque.app";

/**
 * Endereço usado pelo "Avaliar o Mentorque" dentro do app Android.
 *
 * A Play não tem equivalente ao `?action=write-review` da Apple: não existe URL
 * que abra a caixa de nota direto. O caminho oficial para isso é a API de
 * avaliação dentro do app (Play In-App Review), que exigiria código nativo. Até
 * lá, a ficha é o melhor destino — o formulário de avaliação está nela, logo
 * abaixo da descrição.
 *
 * Fica em `https://` e não em `market://`: a saída do app passa pelo plugin
 * Browser (aba do sistema), que não sabe abrir esquemas de aplicativo. O
 * endereço da Play é um link verificado do próprio app da loja, então o Android
 * o entrega ao aplicativo da Play mesmo assim.
 */
export const PLAY_STORE_REVIEW_URL = PLAY_STORE_URL;

/**
 * O Android já saiu?
 *
 * O app FOI aprovado e a ficha existe — este interruptor, como o da Apple, é
 * sobre a LANDING, que ainda está escrita para o pré-lançamento. Vira `true`
 * junto com a reescrita da página; o endereço aqui já é o real e o app já o usa
 * (o "Avaliar o Mentorque" não depende deste interruptor).
 */
export const PLAY_STORE_PUBLICADO = false;
