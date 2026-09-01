import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/Legal";

// Termos de Uso — vale também como EULA das assinaturas.
//
// A diretriz 3.1.2(c) da Apple exige que um app com assinatura de renovação
// automática traga, DENTRO do app, título, duração e preço da assinatura mais
// links funcionais para a privacidade e para os termos. Esta página é o
// destino desse link; a seção 5 concentra o que a Apple pede por escrito.

export const metadata: Metadata = {
  title: "Termos de Uso | Mentorque",
  description:
    "Condições de uso do aplicativo e do site Mentorque, incluindo as regras da assinatura Premium de renovação automática.",
  alternates: { canonical: "/termos", languages: { en: "/terms" } },
  robots: { index: true, follow: true },
};

const CONTACT = "contato@mentorque.com.br";

export default function TermosPage() {
  return (
    <LegalPage
      title="Termos de Uso"
      updated="Última atualização: 13 de agosto de 2026"
      altHref="/terms"
      altLabel="English"
      homeLabel="Voltar para o início"
    >
      <p>
        Estes Termos de Uso (&quot;Termos&quot;) regem o uso do aplicativo e do site{" "}
        <strong>Mentorque</strong> (&quot;Serviço&quot;). Ao criar uma conta, assinar ou simplesmente usar o
        Serviço, você concorda com estes Termos. Se não concordar, não utilize o Serviço.
      </p>
      <p>
        Estes Termos também servem como o contrato de licença de usuário final (EULA) do aplicativo. No
        aplicativo distribuído pela App Store aplica-se ainda o{" "}
        <a
          href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
          target="_blank"
          rel="noreferrer"
        >
          Contrato de Licença de Usuário Final Padrão da Apple
        </a>
        , e estes Termos o complementam no que não conflitar com ele.
      </p>

      <h2>1. O que o Mentorque é — e o que não é</h2>
      <p>
        O Mentorque organiza a manutenção do seu veículo: histórico de serviços, lembretes de revisão,
        conteúdo educativo e orientação sobre sintomas. É uma ferramenta de <strong>informação e
        organização</strong>.
      </p>
      <p>
        O Serviço <strong>não substitui a inspeção de um profissional habilitado</strong> nem o manual do
        fabricante do seu veículo. Isso vale em dobro para itens de segurança — freios, direção, suspensão,
        airbags, pneus e sistema elétrico. As orientações do Biela (nosso assistente de inteligência
        artificial) e os conteúdos do app são pontos de partida para uma conversa com a sua oficina, não um
        laudo. Decisões sobre o seu veículo são suas, e a responsabilidade pela execução de qualquer serviço é
        de quem o executa.
      </p>
      <p>
        Estimativas de preço, projeções de custo e valores de mercado são aproximações, baseadas em médias e
        em dados públicos. Eles variam por região, por oficina e por estado do veículo, e não são ofertas.
      </p>

      <h2>2. Quem pode usar</h2>
      <p>
        Você precisa ter 13 anos ou mais. Se for menor de 18, o uso deve acontecer com o consentimento de um
        responsável legal. Ao usar o Serviço, você declara que as informações que fornece são verdadeiras.
      </p>

      <h2>3. Conta</h2>
      <p>
        É possível usar boa parte do app como <strong>convidado</strong>, sem conta — nesse caso, os dados
        ficam apenas no seu aparelho. Ao criar uma conta, você é responsável por manter suas credenciais em
        segurança e por tudo o que acontecer nela. Avise-nos em{" "}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a> se suspeitar de uso não autorizado.
      </p>
      <p>
        Você pode excluir sua conta e seus dados a qualquer momento, pelo app ou em{" "}
        <a href="/excluir-conta">mentorque.com.br/excluir-conta</a>.
      </p>

      <h2>4. Plano gratuito</h2>
      <p>
        O plano gratuito é permanente e não exige cartão. Ele inclui limites — número de veículos, de serviços
        registrados e de peças por serviço — além de parte da biblioteca de conteúdo. No aplicativo Android,
        a versão gratuita exibe anúncios; no aplicativo da Apple e no site, não há anúncios.
      </p>

      <h2>5. Assinatura Premium (renovação automática)</h2>
      <p>
        O <strong>Mentorque Premium</strong> é uma assinatura de renovação automática que remove os limites do
        plano gratuito e libera os recursos exclusivos: o assistente Biela, a saúde detalhada do veículo, o
        plano de revisões personalizado, os relatórios e a exportação em PDF.
      </p>
      <h3>Planos, duração e preço</h3>
      <ul>
        <li>
          <strong>Mentorque Premium Mensal</strong> — duração de 1 mês, por <strong>R$ 29,90</strong> por mês.
        </li>
        <li>
          <strong>Mentorque Premium Anual</strong> — duração de 12 meses, por <strong>R$ 239,90</strong> por
          ano, o equivalente a R$ 19,99 por mês.
        </li>
      </ul>
      <p>
        Os preços são em reais e incluem os tributos aplicáveis. O preço cobrado é sempre o exibido na tela de
        assinatura no momento da compra, na moeda da sua conta na loja. Podemos alterar preços no futuro;
        quando isso ocorrer, a mudança só vale para períodos posteriores e você será avisado com antecedência,
        na forma exigida pela loja, com a chance de cancelar antes.
      </p>
      <h3>Período de teste gratuito</h3>
      <p>
        Quando oferecido, o teste gratuito dura <strong>3 dias no aplicativo da Apple</strong> e{" "}
        <strong>7 dias no site e no aplicativo Android</strong>. Ao final do teste, a assinatura começa e a
        cobrança é feita automaticamente, a menos que você cancele antes. Se você assinar durante um teste
        gratuito, a parte não utilizada do teste é perdida.
      </p>
      <h3>Renovação e cancelamento</h3>
      <p>
        A assinatura <strong>renova automaticamente</strong> ao fim de cada período, pelo mesmo prazo, e a
        cobrança ocorre na conta usada na compra. A renovação é cancelada se você desligá-la com pelo menos{" "}
        <strong>24 horas de antecedência</strong> em relação ao fim do período vigente.
      </p>
      <ul>
        <li>
          <strong>Compras pela App Store:</strong> o pagamento é debitado da sua conta Apple na confirmação da
          compra. Para gerenciar ou cancelar, vá em <em>Ajustes → [seu nome] → Assinaturas</em> no seu
          aparelho, ou em <em>Ajustes → Assinaturas</em> na App Store. A exclusão do aplicativo, sozinha, não
          cancela a assinatura.
        </li>
        <li>
          <strong>Compras pelo Google Play:</strong> gerencie em <em>Play Store → Pagamentos e assinaturas →
          Assinaturas</em>.
        </li>
        <li>
          <strong>Compras pelo site:</strong> gerencie no seu perfil dentro do app ou escrevendo para{" "}
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
        </li>
      </ul>
      <p>
        Ao cancelar, você mantém o acesso Premium até o fim do período já pago. Não há reembolso proporcional
        por períodos parcialmente utilizados, salvo quando a lei aplicável exigir.
      </p>
      <h3>Reembolsos</h3>
      <p>
        Compras feitas dentro do aplicativo são processadas pela Apple ou pelo Google, e os pedidos de
        reembolso seguem as políticas dessas lojas — nós não temos acesso ao seu meio de pagamento. Você
        também tem os direitos previstos no Código de Defesa do Consumidor, incluindo o direito de
        arrependimento em até 7 dias da contratação à distância.
      </p>

      <h2>6. Uso aceitável</h2>
      <p>Ao usar o Serviço, você concorda em não:</p>
      <ul>
        <li>usar o Serviço para fins ilícitos ou que violem direitos de terceiros;</li>
        <li>tentar burlar limites do plano gratuito, mecanismos de assinatura ou de segurança;</li>
        <li>extrair o conteúdo em massa, por qualquer meio automatizado, para redistribuição;</li>
        <li>fazer engenharia reversa do aplicativo, exceto na medida permitida por lei;</li>
        <li>enviar conteúdo ofensivo, ilegal ou que não seja seu.</li>
      </ul>
      <p>
        Podemos suspender ou encerrar contas que violem estes Termos, com aviso sempre que possível.
      </p>

      <h2>7. Conteúdo e propriedade intelectual</h2>
      <p>
        O aplicativo, a marca Mentorque, os textos, as ilustrações e os vídeos produzidos por nós são
        protegidos por direitos autorais e permanecem nossos ou dos nossos licenciantes. A assinatura concede
        a você uma licença <strong>pessoal, limitada, revogável e intransferível</strong> de uso, não uma
        transferência de propriedade.
      </p>
      <p>
        O conteúdo que <strong>você</strong> cadastra — veículos, serviços, notas e fotos — continua sendo
        seu. Você nos concede apenas a licença necessária para armazenar, processar e exibir esse conteúdo a
        você dentro do Serviço.
      </p>
      <p>
        Alguns vídeos são hospedados por terceiros (YouTube) e exibidos dentro do app. O uso desses conteúdos
        também se sujeita aos termos das respectivas plataformas.
      </p>

      <h2>8. Inteligência artificial</h2>
      <p>
        O Biela usa modelos de linguagem para gerar respostas a partir da sua pergunta, do contexto do seu
        veículo e, quando disponível, de trechos do manual do fabricante. Respostas geradas por IA podem
        conter erros ou omissões. Não tome decisões de segurança com base apenas nelas — confirme com o manual
        do veículo e com um profissional.
      </p>

      <h2>9. Disponibilidade</h2>
      <p>
        Trabalhamos para manter o Serviço disponível, mas ele pode ficar fora do ar por manutenção, falha de
        terceiros ou motivos fora do nosso controle. Recursos podem ser alterados, adicionados ou
        descontinuados. Se descontinuarmos um recurso central do Premium, avisaremos com antecedência
        razoável.
      </p>

      <h2>10. Limitação de responsabilidade</h2>
      <p>
        Na máxima extensão permitida pela lei, o Mentorque não responde por danos indiretos, lucros cessantes
        ou perdas decorrentes de decisões tomadas com base nas informações do Serviço, incluindo serviços
        executados ou deixados de executar em seu veículo. Nada nestes Termos afasta direitos que a lei
        garante ao consumidor de forma inafastável.
      </p>

      <h2>11. Privacidade</h2>
      <p>
        O tratamento dos seus dados está descrito na nossa{" "}
        <a href="/privacidade">Política de Privacidade</a>, que faz parte destes Termos.
      </p>

      <h2>12. Alterações nestes Termos</h2>
      <p>
        Podemos atualizar estes Termos periodicamente. Quando houver mudanças relevantes, atualizaremos a data
        no topo e, quando apropriado, avisaremos no app. O uso contínuo após as alterações significa que você
        concorda com a versão revisada.
      </p>

      <h2>13. Lei aplicável e foro</h2>
      <p>
        Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro do domicílio
        do consumidor para dirimir controvérsias, conforme o Código de Defesa do Consumidor.
      </p>

      <h2>14. Contato</h2>
      <p>
        Dúvidas sobre estes Termos ou sobre a sua assinatura? Escreva para{" "}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>
    </LegalPage>
  );
}
