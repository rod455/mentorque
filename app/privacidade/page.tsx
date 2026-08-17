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
      updated="Última atualização: 7 de agosto de 2026"
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
        <li><strong>Não vendemos</strong> os seus dados.</li>
        <li>A versão gratuita do <strong>app Android</strong> exibe anúncios do Google AdMob, que usa o
          identificador de publicidade do aparelho. Pedimos o seu consentimento antes do primeiro anúncio e
          você pode rever a escolha quando quiser. No site e no app iOS <strong>não há anúncios</strong>.</li>
        <li>Suas perguntas ao assistente <strong>Biela</strong> e os dados do seu carro são enviados a
          provedores de IA para gerar a resposta.</li>
        <li>Você pode <strong>excluir sua conta e seus dados</strong> direto no app, a qualquer momento.</li>
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
        <li><strong>Login social:</strong> ao entrar com Google ou Apple, recebemos seu e-mail, nome, a foto do perfil (quando houver) e um identificador da conta do provedor.</li>
        <li><strong>Sua garagem:</strong> marca, modelo, ano, apelido, quilometragem e histórico de serviços dos veículos que você cadastra.</li>
        <li><strong>Fotos:</strong> a foto de perfil e as imagens que você opcionalmente adiciona às suas conquistas/experiências.</li>
        <li><strong>Preferências:</strong> idioma, unidades, notificações e o estado (UF) que você informar.</li>
        <li><strong>Orçamentos que você registra:</strong> quando você informa quanto pagou por um serviço, guardamos o valor, o sintoma relacionado e — se você preencher — a cidade, o estado e o nome da oficina. Isso alimenta a estimativa de preço por região mostrada a todos os usuários.</li>
        <li><strong>Mensagens de suporte:</strong> conteúdo enviado em &quot;Fale com a gente&quot; e o e-mail para resposta.</li>
        <li><strong>Perguntas à IA (Biela):</strong> o texto que você digita ao usar o assistente.</li>
      </ul>

      <h3>Dados coletados automaticamente</h3>
      <ul>
        <li><strong>Uso de conteúdo:</strong> registramos quais aulas e conteúdos você abre, conclui ou salva, ligados à sua conta quando você está logado. Usamos para saber o que funciona e priorizar o que produzir.</li>
        <li><strong>Identificador de publicidade (só no app Android, versão gratuita):</strong> o SDK do Google AdMob acessa o identificador de publicidade do seu aparelho para exibir e medir anúncios. Ver a seção 6.</li>
        <li><strong>Dados técnicos:</strong> informações básicas de funcionamento e registros de erro, para segurança e para corrigir problemas.</li>
      </ul>

      <h3>O que NÃO coletamos</h3>
      <ul>
        <li>Não coletamos sua <strong>localização precisa (GPS)</strong>. &quot;Localização&quot; no app é apenas o estado ou a cidade que você digita.</li>
        <li>Não recebemos os <strong>dados do seu cartão</strong>. O pagamento acontece dentro do formulário do provedor (Stripe, Apple ou Google), que nunca passa os dados do cartão para nós.</li>
        <li>Não coletamos dados pessoais sensíveis (origem racial, saúde, biometria, etc.).</li>
        <li>Não usamos ferramentas de análise de terceiros (Google Analytics, Meta Pixel e similares) nem cookies de rastreamento no site.</li>
      </ul>

      <h2>3. Como usamos os seus dados</h2>
      <ul>
        <li>Operar o app: manter sua garagem, histórico, revisões e conquistas.</li>
        <li>Sincronizar seus dados entre aparelhos quando você tem conta.</li>
        <li>Enviar e-mails transacionais (confirmação de conta, redefinição de senha, respostas de suporte).</li>
        <li>Gerar respostas do assistente Biela e os planos de revisão personalizados para o seu carro.</li>
        <li>Melhorar as respostas do Biela: quando <strong>você toca em 👍 ou 👎</strong> numa resposta, guardamos
          aquela pergunta e aquela resposta, junto do motivo que você marcar. É o que nos permite descobrir onde ele
          erra e corrigir. Esse registro <strong>não leva seu nome, e-mail nem identificador de conta</strong>, e é
          apagado automaticamente após 90 dias. Sem o seu toque no polegar, nada da conversa é guardado por nós.</li>
        <li>Calcular a estimativa de preço por região a partir dos orçamentos informados pelos usuários.</li>
        <li>Processar sua assinatura Premium e liberar os recursos pagos.</li>
        <li>Exibir e medir anúncios na versão gratuita do app Android, quando você consente.</li>
        <li>Garantir segurança, prevenir fraudes e resolver problemas.</li>
        <li>Melhorar o Serviço e desenvolver novos recursos.</li>
      </ul>

      <h2>4. Base legal (LGPD)</h2>
      <p>Tratamos seus dados com base em:</p>
      <ul>
        <li><strong>Execução de contrato</strong> — para fornecer as funcionalidades que você solicita, incluindo a assinatura Premium.</li>
        <li><strong>Consentimento</strong> — por exemplo, ao criar conta, enviar uma foto/mensagem ou aceitar anúncios personalizados no app Android.</li>
        <li><strong>Legítimo interesse</strong> — segurança, prevenção a fraudes e melhoria do Serviço.</li>
        <li><strong>Cumprimento de obrigação legal</strong>, quando aplicável.</li>
      </ul>

      <h2>5. Compartilhamento e provedores</h2>
      <p>
        <strong>Não vendemos seus dados.</strong> Compartilhamos informações apenas com prestadores que nos
        ajudam a operar o Serviço (operadores/subprocessadores), sob obrigações de confidencialidade e segurança:
      </p>
      <ul>
        <li><strong>Supabase</strong> — autenticação, banco de dados e armazenamento das suas fotos.</li>
        <li><strong>Vercel</strong> — hospedagem do app e do site.</li>
        <li><strong>Resend</strong> — envio de e-mails transacionais e das suas mensagens de suporte para a nossa caixa de entrada.</li>
        <li><strong>Google e Apple</strong> — quando você escolhe entrar com essas contas.</li>
        <li><strong>Anthropic e OpenAI</strong> — recebem o texto que você envia ao Biela e os dados do carro necessários para a resposta (marca, modelo, ano, quilometragem e, no plano de revisões, o histórico de serviços). Não recebem seu nome, e-mail nem identificador de conta. Não envie informações confidenciais que você não queira processar por esses provedores.</li>
        <li><strong>Stripe</strong> — processa os pagamentos de assinatura feitos pelo site. Recebe seu e-mail e um identificador da sua conta Mentorque, e coleta diretamente os dados do seu cartão.</li>
        <li><strong>Apple e Google</strong> — quando a assinatura é comprada dentro do app da loja, o pagamento é processado pela plataforma correspondente, segundo a política de privacidade dela.</li>
        <li><strong>RevenueCat</strong> — valida as compras feitas dentro do app iOS e nos informa se a assinatura está ativa.</li>
        <li><strong>Google AdMob</strong> — exibe e mede os anúncios na versão gratuita do app Android. Ver a seção 6.</li>
      </ul>
      <p>
        As consultas de tabela FIPE (BrasilAPI/Parallelum) e de recalls e avaliações de segurança (NHTSA)
        passam pelos nossos servidores e enviam apenas marca, modelo e ano do veículo — nenhum dado que
        identifique você.
      </p>
      <p>Também podemos divulgar dados se exigido por lei ou ordem judicial.</p>

      <h2>6. Publicidade no app Android</h2>
      <p>
        A versão <strong>gratuita do app Android</strong> exibe anúncios do <strong>Google AdMob</strong>. Para
        isso, o SDK do Google acessa o <strong>identificador de publicidade</strong> do seu aparelho e
        informações do dispositivo, e pode usá-los para escolher e medir os anúncios exibidos.
      </p>
      <ul>
        <li>
          Antes do primeiro anúncio, mostramos o formulário de consentimento do Google (UMP). Você escolhe se
          aceita anúncios personalizados. Se recusar, o app continua funcionando normalmente.
        </li>
        <li>
          Você pode rever essa escolha a qualquer momento em <strong>Perfil → Preferências de anúncios</strong>.
        </li>
        <li>
          No Android você também pode redefinir ou excluir o identificador de publicidade nas configurações do
          sistema (Configurações → Google → Anúncios).
        </li>
        <li>
          <strong>Assinantes Premium não veem anúncios.</strong> O site (qualquer navegador) e o app iOS também
          não exibem anúncios de terceiros.
        </li>
      </ul>
      <p>
        O uso dos dados pelo Google é regido pela política de privacidade dele:{" "}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a>.
      </p>

      <h2>7. Transferência internacional de dados</h2>
      <p>
        Alguns dos nossos provedores estão localizados fora do Brasil (por exemplo, nos Estados Unidos). Ao usar
        o Serviço, seus dados podem ser transferidos e processados nesses países, sempre com salvaguardas
        adequadas e em conformidade com a LGPD.
      </p>

      <h2>8. Retenção e armazenamento</h2>
      <ul>
        <li>Dados de conta são mantidos enquanto sua conta existir.</li>
        <li>Dados usados como <strong>convidado</strong> ficam apenas no seu aparelho (armazenamento local) até você limpá-los.</li>
        <li>
          Ao excluir a conta, apagamos a sua garagem, as suas fotos, os dados da assinatura e o seu cadastro de
          acesso. Os <strong>orçamentos informados</strong> e os <strong>registros de uso de conteúdo</strong>{" "}
          são <strong>anonimizados</strong> (perdem o vínculo com você) e permanecem apenas como estatística
          agregada — sem eles a estimativa de preço por região deixaria de funcionar para os outros usuários.
        </li>
        <li>Registros exigidos por lei podem ser mantidos pelo prazo legal.</li>
      </ul>

      <h2>9. Seus direitos</h2>
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

      <h2>10. Como excluir sua conta e seus dados</h2>
      <ul>
        <li>
          <strong>No app (imediato):</strong> em <strong>Perfil → Excluir conta</strong>. A exclusão é
          processada na hora: cancelamos a assinatura ativa, apagamos suas fotos e removemos a sua conta.
        </li>
        <li>
          <strong>Pelo site:</strong> em{" "}
          <a href="/excluir-conta">mentorque.com.br/excluir-conta</a>, sem precisar instalar o app.
        </li>
        <li>
          <strong>Por e-mail:</strong> escreva para <a href={`mailto:${CONTACT}`}>{CONTACT}</a> com o assunto
          &quot;Excluir minha conta&quot;. Confirmaremos e removeremos sua conta em até 30 dias.
        </li>
      </ul>
      <p>
        Se você usa o app como <strong>convidado</strong>, não há conta a excluir: basta limpar os dados do app
        nas configurações do aparelho (ou os dados do site no navegador).
      </p>

      <h2>11. Segurança</h2>
      <p>
        Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo criptografia em trânsito
        e controle de acesso por usuário no banco de dados. Nenhum sistema é 100% seguro, mas trabalhamos
        continuamente para proteger suas informações.
      </p>
      <p>
        <strong>Sobre as fotos:</strong> as imagens que você envia (foto de perfil e fotos de momentos) ficam
        num endereço de leitura pública, com nome imprevisível. Elas não são listadas nem indexadas em lugar
        nenhum, e só o seu aparelho conhece o endereço — mas quem receber esse link consegue abrir a imagem.
        Não envie fotos com informações que você não queira compartilhar (documentos, placas, endereços).
      </p>

      <h2>12. Crianças</h2>
      <p>
        O Serviço não é destinado a menores de 13 anos e não coletamos intencionalmente dados de crianças. O
        app não é direcionado ao público infantil e não é distribuído em programas para famílias nas lojas. Se
        acreditar que uma criança nos forneceu dados, entre em contato para que possamos removê-los.
      </p>

      <h2>13. Armazenamento local e cookies</h2>
      <p>
        Usamos o armazenamento local do seu navegador/aparelho para manter o app funcionando: a sua sessão, a
        sua garagem e as suas preferências. Não usamos cookies de rastreamento nem ferramentas de análise de
        terceiros no site.
      </p>
      <p>
        No <strong>app Android gratuito</strong>, o SDK do Google AdMob guarda no aparelho a sua escolha de
        consentimento e dados necessários para exibir e limitar a frequência dos anúncios (ver a seção 6).
      </p>

      <h2>14. Alterações nesta política</h2>
      <p>
        Podemos atualizar esta Política periodicamente. Quando houver mudanças relevantes, atualizaremos a data
        no topo e, quando apropriado, avisaremos no app. O uso contínuo após as alterações significa que você
        concorda com a versão revisada.
      </p>

      <h2>15. Contato</h2>
      <p>
        Dúvidas sobre privacidade ou sobre esta Política? Fale com o nosso Encarregado (DPO):{" "}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>
    </LegalPage>
  );
}
