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
 * SIM, desde 03/09/2026. Este interruptor nunca foi sobre a loja: o app estava
 * aprovado e a ficha existia havia dias. Ele era sobre a LANDING, que continuava
 * escrita para pré-lançamento (acesso antecipado, lote de fundadores, antes de
 * chegar às lojas). Um botão de baixar no meio daquilo se contradizia, e a
 * página perdia os dois discursos de uma vez.
 *
 * A landing foi reescrita para app publicado no mesmo commit em que isto virou
 * `true`, e essa amarração é a regra: os dois andam juntos ou a página volta a
 * mentir. Se algum dia for preciso desligar de novo, o texto tem que voltar
 * junto.
 */
export const APP_STORE_PUBLICADO = true;

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
 * Sim, e o interruptor virou junto com o da Apple em 03/09/2026, pela mesma
 * razão: ele era sobre a landing, não sobre a loja. O "Avaliar o Mentorque"
 * dentro do app nunca dependeu dele.
 */
export const PLAY_STORE_PUBLICADO = true;
