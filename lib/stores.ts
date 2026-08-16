// Endereços do app nas lojas.
//
// Ficam num lugar só porque o id da Apple já aparecia escrito à mão em mais de
// um ponto — e um id errado é o tipo de defeito que ninguém vê até alguém tocar
// no botão e cair numa App Store dizendo que o app não existe.

/** Id numérico do app na App Store (o mesmo da URL do App Store Connect). */
export const APPLE_APP_ID = "6797291865";

/** Ficha do app na App Store. Publicada em agosto de 2026. */
export const APP_STORE_URL = `https://apps.apple.com/br/app/mentorque/id${APPLE_APP_ID}`;

/**
 * Folha de avaliação, para o "Avaliar o Mentorque" dentro do app.
 * `?action=write-review` abre direto a caixa de nota, em vez da ficha.
 */
export const APP_STORE_REVIEW_URL = `https://apps.apple.com/app/id${APPLE_APP_ID}?action=write-review`;

/** Play Store. Ainda NÃO publicado — o link existe, a ficha não. */
export const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=mentorque.app";

/**
 * O Android já saiu?
 *
 * Enquanto for `false`, a landing mostra "Em breve" no lugar do link — apontar
 * para uma ficha que não existe é pior que não apontar: quem toca recebe um
 * erro da própria Play Store e conclui que o app foi tirado do ar.
 */
export const PLAY_STORE_PUBLICADO = false;
