import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/Legal";

export const metadata: Metadata = {
  title: "Política de Privacidade — Mentorque",
  description:
    "Como o Mentorque coleta, usa, compartilha e protege os seus dados. Seus direitos sob a LGPD e como excluir sua conta e dados.",
  alternates: { canonical: "/privacidade", languages: { "en": "/privacy" } },
  robots: { index: true, follow: true },
};

const CONTACT = "contato@mentorque.com.br";

export default function PrivacidadePage() {
  return (
    <LegalPage
      title="Política de Privacidade"
      updated="Última atualização: 1 de agosto de 2026"
      altHref="/privacy"
      altLabel="English"
      homeLabel="Voltar para o início"
    >
      <p>
        Esta Política de Privacidade explica como o <strong>Mentorque</strong> (&quot;Mentorque&quot;, &quot;nós&quot;)
        coleta, usa, compartilha e protege as suas informações quando você usa nosso aplicativo e site
        (&quot;Serviço&quot;). Levamos a sua privacidade a sério e seguimos a Lei Geral de Proteção de Dados
        (Lei nº 13.709/2018 — &quot;LGPD&quot;).
      </p>
      <p>
        Ao usar o Serviço, você concorda com as práticas descritas aqui. Se não concordar, por favor não
        utilize o Serviço.
      </p>

      <h2>Resumo rápido</h2>
      <ul>
        <li>Você pode usar o app como <strong>convidado</strong>, sem criar conta — seus dados ficam no seu aparelho.</li>
        <li>Se você criar uma conta, sincronizamos seus dados de forma segura para acessar de outros aparelhos.</li>
        <li><strong>Não vendemos</strong> os seus dados e não usamos rastreadores de publicidade de terceiros.</li>
        <li>Você pode <strong>solicitar a exclusão</strong> da sua conta e dados a qualquer momento.</li>
      </ul>

      <h2>1. Quem é o controlador dos dados</h2>
      <p>
        O responsável pelo tratamento dos seus dados é o Mentorque. Para qualquer assunto relacionado a
        privacidade ou para exercer seus direitos, fale com o nosso Encarregado (DPO) pelo e-mail{" "}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>

      <h2>2. Dados que coletamos</h2>
      <p>Coletamos apenas o necessário para o app funcionar:</p>

      <h3>Dados que você fornece</h3>
      <ul>
        <li><strong>Conta:</strong> nome (opcional) e e-mail, ao criar conta ou entrar com Google/Apple.</li>
        <li><strong>Login social:</strong> ao entrar com Google ou Apple, recebemos seu e-mail, nome e um identificador da conta do provedor.</li>
        <li><strong>Sua garagem:</strong> marca, modelo, ano, apelido, quilometragem e histórico de serviços dos veículos que você cadastra.</li>
        <li><strong>Fotos de momentos:</strong> imagens que você opcionalmente adiciona às suas conquistas/experiências.</li>
        <li><strong>Preferências:</strong> idioma, unidades, notificações e o estado (UF) que você informar.</li>
        <li><strong>Mensagens de suporte:</strong> conteúdo enviado em &quot;Fale com a gente&quot; e o e-mail para resposta.</li>
        <li><strong>Perguntas à IA (Biela):</strong> o texto que você digita ao usar o assistente.</li>
      </ul>

      <h3>Dados coletados automaticamente</h3>
      <ul>
        <li><strong>Identificador do dispositivo:</strong> um ID local gerado no seu aparelho, usado para rastrear solicitações de suporte.</li>
        <li><strong>Dados técnicos e de uso:</strong> informações básicas de funcionamento, registros de erro e interações, para segurança e melhoria do Serviço.</li>
      </ul>

      <h3>O que NÃO coletamos</h3>
      <ul>
        <li>Não coletamos sua <strong>localização precisa (GPS)</strong>. &quot;Localização&quot; no app é apenas o estado (UF) que você digita.</li>
        <li>Não coletamos dados de pagamento no app (pagamentos, quando existirem, são processados por parceiros especializados).</li>
        <li>Não coletamos dados pessoais sensíveis (origem racial, saúde, biometria, etc.).</li>
      </ul>

      <h2>3. Como usamos os seus dados</h2>
      <ul>
        <li>Operar o app: manter sua garagem, histórico, revisões e conquistas.</li>
        <li>Sincronizar seus dados entre aparelhos quando você tem conta.</li>
        <li>Enviar e-mails transacionais (confirmação de conta, redefinição de senha, respostas de suporte).</li>
        <li>Gerar respostas do assistente Biela às suas perguntas.</li>
        <li>Garantir segurança, prevenir fraudes e resolver problemas.</li>
        <li>Melhorar o Serviço e desenvolver novos recursos.</li>
      </ul>

      <h2>4. Base legal (LGPD)</h2>
      <p>Tratamos seus dados com base em:</p>
      <ul>
        <li><strong>Execução de contrato</strong> — para fornecer as funcionalidades que você solicita.</li>
        <li><strong>Consentimento</strong> — por exemplo, ao criar conta ou enviar uma foto/mensagem.</li>
        <li><strong>Legítimo interesse</strong> — segurança, prevenção a fraudes e melhoria do Serviço.</li>
        <li><strong>Cumprimento de obrigação legal</strong>, quando aplicável.</li>
      </ul>

      <h2>5. Compartilhamento e provedores</h2>
      <p>
        <strong>Não vendemos seus dados.</strong> Compartilhamos informações apenas com prestadores que nos
        ajudam a operar o Serviço (operadores/subprocessadores), sob obrigações de confidencialidade e segurança:
      </p>
      <ul>
        <li><strong>Supabase</strong> — autenticação e banco de dados (armazenamento da sua conta e garagem).</li>
        <li><strong>Vercel</strong> — hospedagem do app e do site.</li>
        <li><strong>Resend</strong> — envio de e-mails transacionais.</li>
        <li><strong>Google e Apple</strong> — quando você escolhe entrar com essas contas.</li>
        <li><strong>OpenAI e Anthropic</strong> — processam as perguntas que você envia ao assistente Biela para gerar as respostas. Não envie informações confidenciais que você não queira processar por esses provedores.</li>
      </ul>
      <p>Também podemos divulgar dados se exigido por lei ou ordem judicial.</p>

      <h2>6. Transferência internacional de dados</h2>
      <p>
        Alguns dos nossos provedores estão localizados fora do Brasil (por exemplo, nos Estados Unidos). Ao usar
        o Serviço, seus dados podem ser transferidos e processados nesses países, sempre com salvaguardas
        adequadas e em conformidade com a LGPD.
      </p>

      <h2>7. Retenção e armazenamento</h2>
      <ul>
        <li>Dados de conta são mantidos enquanto sua conta existir.</li>
        <li>Dados usados como <strong>convidado</strong> ficam apenas no seu aparelho (armazenamento local) até você limpá-los.</li>
        <li>Após a exclusão da conta, removemos ou anonimizamos seus dados dentro de um prazo razoável, salvo quando a lei exigir retenção.</li>
      </ul>

      <h2>8. Seus direitos</h2>
      <p>Sob a LGPD, você tem direito a:</p>
      <ul>
        <li>Confirmar a existência de tratamento e <strong>acessar</strong> seus dados.</li>
        <li><strong>Corrigir</strong> dados incompletos ou desatualizados.</li>
        <li><strong>Excluir</strong> seus dados e a sua conta.</li>
        <li>Solicitar a <strong>portabilidade</strong> dos seus dados.</li>
        <li><strong>Revogar o consentimento</strong> e se opor a tratamentos.</li>
        <li>Obter informações sobre com quem compartilhamos seus dados.</li>
      </ul>
      <p>
        Para exercer qualquer direito, use o &quot;Fale com a gente&quot; dentro do app ou escreva para{" "}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. Respondemos no menor prazo possível.
      </p>

      <h2>9. Como excluir sua conta e seus dados</h2>
      <p>Você pode excluir seus dados de duas formas:</p>
      <ul>
        <li><strong>No app:</strong> em Perfil, use &quot;Reiniciar protótipo&quot; para apagar os dados do aparelho.</li>
        <li><strong>Por solicitação:</strong> envie um e-mail para <a href={`mailto:${CONTACT}`}>{CONTACT}</a> com o assunto &quot;Excluir minha conta&quot;. Confirmaremos e removeremos sua conta e dados associados, normalmente em até 30 dias.</li>
      </ul>

      <h2>10. Segurança</h2>
      <p>
        Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo criptografia em trânsito
        e controle de acesso. Nenhum sistema é 100% seguro, mas trabalhamos continuamente para proteger suas
        informações.
      </p>

      <h2>11. Crianças</h2>
      <p>
        O Serviço não é destinado a menores de 13 anos e não coletamos intencionalmente dados de crianças. Se
        acreditar que uma criança nos forneceu dados, entre em contato para que possamos removê-los.
      </p>

      <h2>12. Armazenamento local e cookies</h2>
      <p>
        Usamos o armazenamento local do seu navegador/aparelho para manter o app funcionando (sua sessão,
        garagem e preferências). Não usamos cookies de publicidade nem rastreadores de terceiros para anúncios.
      </p>

      <h2>13. Alterações nesta política</h2>
      <p>
        Podemos atualizar esta Política periodicamente. Quando houver mudanças relevantes, atualizaremos a data
        no topo e, quando apropriado, avisaremos no app. O uso contínuo após as alterações significa que você
        concorda com a versão revisada.
      </p>

      <h2>14. Contato</h2>
      <p>
        Dúvidas sobre privacidade ou sobre esta Política? Fale com o nosso Encarregado (DPO):{" "}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>
    </LegalPage>
  );
}
