// E-mail de boas-vindas da lista de espera.
//
// Escrito em tabelas e com estilo em cada tag de propósito: o Outlook ignora
// `<div>` com flex e descarta qualquer `<style>` no cabeçalho. É feio de ler e
// é o único jeito de a mensagem chegar igual no Gmail, no Outlook e no Mail do
// iPhone.
//
// Estrutura: faixa escura da marca no topo (logo + Biela + título), corpo em
// fundo claro, um bloco destacado com o que a pessoa ganha, botão e rodapé.

// Endereço FIXO, não a variável de ambiente.
//
// `NEXT_PUBLIC_SITE_URL` não está definida na Vercel — foi o que fez o
// `canonical` do site apontar para um domínio que não resolve. Num e-mail o
// estrago seria pior: as imagens simplesmente não apareceriam, e não há como
// corrigir depois de enviado.
const SITE = "https://www.mentorque.com.br";

const CREME = "#f4f2ec";
const GRAFITE = "#16181D";
const AMBAR = "#F2A623";
const TEXTO = "#2b2f36";
const SUAVE = "#6b7078";

export type Idioma = "pt" | "en";

type Copy = {
  subject: string;
  preheader: string;
  titulo: string;
  saudacao: string;
  intro: string;
  destaqueTitulo: string;
  destaque: string[];
  fecho: string;
  cta: string;
  nota: string;
  rodape: string;
};

const COPY: Record<Idioma, Copy> = {
  pt: {
    subject: "Você entrou na lista do Mentorque 🚗",
    preheader: "Seu lugar está guardado. Veja o que te espera na garagem.",
    titulo: "Bem-vindo à garagem!",
    saudacao: "E aí!",
    intro:
      "Seu lugar na <b>lista de espera</b> está guardado. Assim que abrirmos o acesso, você é avisado em primeira mão, com as vantagens de quem chegou cedo.",
    destaqueTitulo: "O que você vai encontrar",
    destaque: [
      "Sua garagem organizada: revisões, serviços e lembretes no lugar certo",
      "Diagnóstico por sintoma, com as causas prováveis e o preço justo",
      "O Biela, mecânico de plantão para tirar dúvida a qualquer hora",
    ],
    fecho: "Enquanto isso, dá para conhecer o app por dentro:",
    cta: "Ver o Mentorque",
    nota: "Sem spam. Grátis para sempre no plano base.",
    rodape:
      "Você recebeu este e-mail porque entrou na lista de espera do Mentorque.",
  },
  en: {
    subject: "You're on the Mentorque waitlist 🚗",
    preheader: "Your spot is saved. Here's what's waiting in the garage.",
    titulo: "Welcome to the garage!",
    saudacao: "Hey there!",
    intro:
      "Your spot on the <b>waitlist</b> is saved. The moment we open access, you'll be the first to know, with early-bird perks.",
    destaqueTitulo: "What you'll find",
    destaque: [
      "Your garage, organized: services, history and reminders in one place",
      "Symptom-based diagnosis, with likely causes and a fair price",
      "Biela, the mechanic on call for any question, any time",
    ],
    fecho: "In the meantime, take a look inside:",
    cta: "See Mentorque",
    nota: "No spam. Free forever on the base plan.",
    rodape: "You received this email because you joined the Mentorque waitlist.",
  },
};

function item(texto: string): string {
  return `<tr><td style="padding:0 0 10px 0;font:400 15px/1.55 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${TEXTO}">
    <span style="color:${AMBAR};font-weight:700">•</span>&nbsp;&nbsp;${texto}
  </td></tr>`;
}

export function waitlistWelcome(locale: Idioma): { subject: string; html: string; text: string } {
  const c = COPY[locale];

  const html = `<!doctype html>
<html lang="${locale === "pt" ? "pt-BR" : "en"}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${c.titulo}</title></head>
<body style="margin:0;padding:0;background:${CREME}">
  <!-- Prévia da caixa de entrada: aparece ao lado do assunto e some na leitura. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${c.preheader}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CREME};padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">

        <!-- Faixa da marca -->
        <tr><td align="center" style="background:${GRAFITE};padding:26px 24px 0 24px">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="padding-right:9px"><img src="${SITE}/email/marca.png" width="30" height="30" alt="" style="display:block;border:0"></td>
            <td style="font:700 19px/1 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${CREME};letter-spacing:.2px">Mentorque</td>
          </tr></table>
          <img src="${SITE}/email/biela.png" width="112" alt="Biela" style="display:block;border:0;margin:14px auto 0 auto">
        </td></tr>
        <tr><td align="center" style="background:${GRAFITE};padding:2px 24px 26px 24px">
          <div style="font:700 23px/1.3 Georgia,'Times New Roman',serif;color:${CREME}">${c.titulo}</div>
        </td></tr>

        <!-- Corpo -->
        <tr><td style="padding:28px 28px 4px 28px">
          <p style="margin:0 0 12px 0;font:700 16px/1.5 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${TEXTO}">${c.saudacao}</p>
          <p style="margin:0 0 20px 0;font:400 15px/1.65 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${TEXTO}">${c.intro}</p>
        </td></tr>

        <!-- Bloco destacado -->
        <tr><td style="padding:0 28px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#faf8f3;border-left:3px solid ${AMBAR};border-radius:6px">
            <tr><td style="padding:16px 18px">
              <p style="margin:0 0 12px 0;font:700 12px/1 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${SUAVE};letter-spacing:.6px;text-transform:uppercase">${c.destaqueTitulo}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${c.destaque.map(item).join("")}</table>
            </td></tr>
          </table>
        </td></tr>

        <!-- Chamada -->
        <tr><td align="center" style="padding:24px 28px 4px 28px">
          <p style="margin:0 0 18px 0;font:400 15px/1.6 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${TEXTO}">${c.fecho}</p>
          <a href="${SITE}" style="display:inline-block;background:${AMBAR};color:${GRAFITE};font:700 15px/1 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;text-decoration:none;padding:15px 34px;border-radius:999px">${c.cta}</a>
        </td></tr>

        <tr><td align="center" style="padding:20px 28px 28px 28px">
          <p style="margin:0;font:400 13px/1.5 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${SUAVE}">${c.nota}</p>
        </td></tr>
      </table>

      <!-- Rodapé -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">
        <tr><td align="center" style="padding:18px 24px 6px 24px">
          <p style="margin:0;font:400 12px/1.6 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${SUAVE}">
            Mentorque © 2026 · ${c.rodape}
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  // Versão em texto puro. Quem lê em modo texto, e principalmente os filtros de
  // spam, penalizam mensagem que só tem HTML.
  const text = [
    c.titulo,
    "",
    c.saudacao,
    c.intro.replace(/<[^>]+>/g, ""),
    "",
    c.destaqueTitulo + ":",
    ...c.destaque.map((d) => `- ${d}`),
    "",
    `${c.fecho} ${SITE}`,
    "",
    c.nota,
    c.rodape,
  ].join("\n");

  return { subject: c.subject, html, text };
}
