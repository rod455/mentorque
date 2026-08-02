import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/Legal";
import { DeleteAccountForm } from "@/components/legal/DeleteAccountForm";

export const metadata: Metadata = {
  title: "Excluir conta — Mentorque",
  description:
    "Como excluir sua conta Mentorque e todos os dados associados: pelo próprio app ou por solicitação nesta página.",
  alternates: { canonical: "/excluir-conta" },
  robots: { index: true, follow: true },
};

const CONTACT = "contato@mentorque.com.br";

export default function ExcluirContaPage() {
  return (
    <LegalPage
      title="Excluir sua conta e dados"
      updated="Última atualização: 2 de agosto de 2026"
      altHref="/privacidade"
      altLabel="Política de Privacidade"
      homeLabel="Voltar para o início"
    >
      <p>
        Esta página explica como excluir a sua conta do <strong>Mentorque</strong> (app e site) e o que
        acontece com os seus dados. A exclusão é definitiva e vale para qualquer forma de login (e-mail e
        senha, Google ou Apple).
      </p>

      <h2>Opção 1 — Excluir pelo próprio app (imediato)</h2>
      <ol>
        <li>Abra o Mentorque e entre na sua conta.</li>
        <li>Toque na sua foto (canto superior direito) para abrir o <strong>Perfil</strong>.</li>
        <li>Role até a seção <strong>Conta</strong>, no final da página.</li>
        <li>Toque em <strong>&quot;Excluir conta&quot;</strong> e confirme.</li>
      </ol>
      <p>A exclusão pelo app é processada imediatamente.</p>

      <h2>Opção 2 — Solicitar a exclusão por aqui</h2>
      <p>
        Se preferir (ou se não conseguir acessar o app), preencha o formulário abaixo com o e-mail da sua
        conta. Confirmaremos a titularidade pelo próprio e-mail e concluiremos a exclusão em até{" "}
        <strong>30 dias</strong>.
      </p>
      <DeleteAccountForm />
      <p style={{ marginTop: 12 }}>
        Você também pode escrever diretamente para <a href={`mailto:${CONTACT}`}>{CONTACT}</a> com o assunto
        &quot;Excluir minha conta&quot;.
      </p>

      <h2>O que é excluído</h2>
      <ul>
        <li>Sua conta de acesso (e-mail/senha ou vínculo com Google/Apple).</li>
        <li>Sua garagem: veículos, quilometragem e apelidos.</li>
        <li>Histórico de serviços, peças e notas.</li>
        <li>Fotos enviadas (perfil, veículos e momentos).</li>
        <li>Conquistas, preferências e dados de uso associados à conta.</li>
        <li>Sua assinatura Premium é <strong>cancelada</strong> (nenhuma cobrança futura).</li>
      </ul>

      <h2>O que pode ser retido</h2>
      <ul>
        <li>
          Registros fiscais e de pagamento (notas/faturas da assinatura) podem ser mantidos pelo período
          exigido por lei, de forma segura e apenas para cumprimento de obrigações legais.
        </li>
        <li>Registros técnicos anonimizados, que não identificam você.</li>
      </ul>

      <h2>Dúvidas</h2>
      <p>
        Consulte a nossa <a href="/privacidade">Política de Privacidade</a> ou fale com o nosso Encarregado
        (DPO): <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>
    </LegalPage>
  );
}
