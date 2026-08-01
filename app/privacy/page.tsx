import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/Legal";

export const metadata: Metadata = {
  title: "Privacy Policy — Mentorque",
  description:
    "How Mentorque collects, uses, shares and protects your data. Your rights and how to delete your account and data.",
  alternates: { canonical: "/privacy", languages: { "pt-BR": "/privacidade" } },
  robots: { index: true, follow: true },
};

const CONTACT = "contato@mentorque.com.br";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="Last updated: August 1, 2026"
      altHref="/privacidade"
      altLabel="Português"
      homeLabel="Back to home"
    >
      <p>
        This Privacy Policy explains how <strong>Mentorque</strong> (&quot;Mentorque&quot;, &quot;we&quot;)
        collects, uses, shares and protects your information when you use our app and website (the
        &quot;Service&quot;). We take your privacy seriously and comply with Brazil&apos;s General Data
        Protection Law (LGPD) and applicable data protection rules.
      </p>
      <p>By using the Service, you agree to the practices described here. If you disagree, please do not use the Service.</p>

      <h2>Quick summary</h2>
      <ul>
        <li>You can use the app as a <strong>guest</strong>, without an account — your data stays on your device.</li>
        <li>If you create an account, we securely sync your data so you can access it from other devices.</li>
        <li>We <strong>do not sell</strong> your data and use no third-party advertising trackers.</li>
        <li>You can <strong>request deletion</strong> of your account and data at any time.</li>
      </ul>

      <h2>1. Data controller</h2>
      <p>
        Mentorque is the controller of your personal data. For any privacy matter or to exercise your rights,
        contact our Data Protection Officer at <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>

      <h2>2. Data we collect</h2>
      <h3>Data you provide</h3>
      <ul>
        <li><strong>Account:</strong> name (optional) and email when you sign up or sign in with Google/Apple.</li>
        <li><strong>Social sign-in:</strong> when using Google or Apple, we receive your email, name and a provider account identifier.</li>
        <li><strong>Your garage:</strong> make, model, year, nickname, mileage and service history of the vehicles you add.</li>
        <li><strong>Moment photos:</strong> images you optionally add to your achievements/experiences.</li>
        <li><strong>Preferences:</strong> language, units, notifications and the state/region you enter.</li>
        <li><strong>Support messages:</strong> content you send via &quot;Talk to us&quot; and your reply email.</li>
        <li><strong>AI (Biela) prompts:</strong> the text you type when using the assistant.</li>
      </ul>
      <h3>Data collected automatically</h3>
      <ul>
        <li><strong>Device identifier:</strong> a local ID generated on your device, used to trace support requests.</li>
        <li><strong>Technical and usage data:</strong> basic operational data, error logs and interactions, for security and improvement.</li>
      </ul>
      <h3>What we do NOT collect</h3>
      <ul>
        <li>We do not collect your <strong>precise (GPS) location</strong>. &quot;Location&quot; is only the state/region you type.</li>
        <li>We do not collect payment data in the app.</li>
        <li>We do not collect sensitive personal data.</li>
      </ul>

      <h2>3. How we use your data</h2>
      <ul>
        <li>Operate the app: keep your garage, history, services and achievements.</li>
        <li>Sync your data across devices when you have an account.</li>
        <li>Send transactional emails (account confirmation, password reset, support replies).</li>
        <li>Generate Biela assistant responses to your prompts.</li>
        <li>Ensure security, prevent fraud and troubleshoot.</li>
        <li>Improve the Service and build new features.</li>
      </ul>

      <h2>4. Legal bases</h2>
      <ul>
        <li><strong>Performance of a contract</strong> — to provide the features you request.</li>
        <li><strong>Consent</strong> — e.g., when you create an account or submit a photo/message.</li>
        <li><strong>Legitimate interests</strong> — security, fraud prevention and improvement.</li>
        <li><strong>Legal obligations</strong>, where applicable.</li>
      </ul>

      <h2>5. Sharing and processors</h2>
      <p><strong>We do not sell your data.</strong> We share information only with providers that help us run the Service, under confidentiality and security obligations:</p>
      <ul>
        <li><strong>Supabase</strong> — authentication and database (your account and garage).</li>
        <li><strong>Vercel</strong> — app and website hosting.</li>
        <li><strong>Resend</strong> — transactional email delivery.</li>
        <li><strong>Google and Apple</strong> — when you choose to sign in with those accounts.</li>
        <li><strong>OpenAI and Anthropic</strong> — process the prompts you send to the Biela assistant to generate responses. Do not send confidential information you don&apos;t want processed by these providers.</li>
      </ul>
      <p>We may also disclose data where required by law or valid legal process.</p>

      <h2>6. International data transfers</h2>
      <p>
        Some providers are located outside Brazil (e.g., in the United States). By using the Service, your data
        may be transferred and processed in those countries, always with appropriate safeguards.
      </p>

      <h2>7. Retention and storage</h2>
      <ul>
        <li>Account data is kept while your account exists.</li>
        <li>Guest data stays only on your device (local storage) until you clear it.</li>
        <li>After account deletion, we remove or anonymize your data within a reasonable period, except where law requires retention.</li>
      </ul>

      <h2>8. Your rights</h2>
      <p>You may request to access, correct, delete, export or restrict your data, and withdraw consent. To exercise any right, use &quot;Talk to us&quot; in the app or email <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>

      <h2>9. How to delete your account and data</h2>
      <ul>
        <li><strong>In the app:</strong> in Profile, use &quot;Reset prototype&quot; to erase device data.</li>
        <li><strong>By request:</strong> email <a href={`mailto:${CONTACT}`}>{CONTACT}</a> with the subject &quot;Delete my account&quot;. We will confirm and remove your account and associated data, typically within 30 days.</li>
      </ul>

      <h2>10. Security</h2>
      <p>We use technical and organizational measures to protect your data, including encryption in transit and access controls. No system is 100% secure, but we work continuously to protect your information.</p>

      <h2>11. Children</h2>
      <p>The Service is not directed to children under 13, and we do not knowingly collect their data. If you believe a child provided us data, contact us so we can remove it.</p>

      <h2>12. Local storage and cookies</h2>
      <p>We use local storage to keep the app working (your session, garage and preferences). We do not use advertising cookies or third-party ad trackers.</p>

      <h2>13. Changes to this policy</h2>
      <p>We may update this Policy from time to time. When there are material changes, we will update the date above and, where appropriate, notify you in the app.</p>

      <h2>14. Contact</h2>
      <p>Questions about privacy or this Policy? Contact our Data Protection Officer: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>
    </LegalPage>
  );
}
