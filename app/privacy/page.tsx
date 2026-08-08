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
      updated="Last updated: August 7, 2026"
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
        <li>We <strong>do not sell</strong> your data.</li>
        <li>The free <strong>Android app</strong> shows Google AdMob ads, which use your device&apos;s advertising
          identifier. We ask for your consent before the first ad and you can change it at any time. The website
          and the iOS app show <strong>no ads</strong>.</li>
        <li>Your prompts to the <strong>Biela</strong> assistant and your car details are sent to AI providers to
          generate the answer.</li>
        <li>You can <strong>delete your account and data</strong> from inside the app, at any time.</li>
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
        <li><strong>Social sign-in:</strong> when using Google or Apple, we receive your email, name, profile picture (if any) and a provider account identifier.</li>
        <li><strong>Your garage:</strong> make, model, year, nickname, mileage and service history of the vehicles you add.</li>
        <li><strong>Photos:</strong> your profile picture and the images you optionally add to your achievements/experiences.</li>
        <li><strong>Preferences:</strong> language, units, notifications and the state/region you enter.</li>
        <li><strong>Prices you report:</strong> when you log what you paid for a service, we store the amount, the related symptom and — if you fill them in — the city, state and shop name. This feeds the regional price estimate shown to all users.</li>
        <li><strong>Support messages:</strong> content you send via &quot;Talk to us&quot; and your reply email.</li>
        <li><strong>AI (Biela) prompts:</strong> the text you type when using the assistant.</li>
      </ul>
      <h3>Data collected automatically</h3>
      <ul>
        <li><strong>Content usage:</strong> which lessons and content you open, complete or save, linked to your account while you are signed in. We use it to know what works and what to produce next.</li>
        <li><strong>Advertising identifier (free Android app only):</strong> the Google AdMob SDK accesses your device&apos;s advertising identifier to serve and measure ads. See section 6.</li>
        <li><strong>Technical data:</strong> basic operational data and error logs, for security and troubleshooting.</li>
      </ul>
      <h3>What we do NOT collect</h3>
      <ul>
        <li>We do not collect your <strong>precise (GPS) location</strong>. &quot;Location&quot; is only the state or city you type.</li>
        <li>We never receive your <strong>card details</strong>. Payment happens inside the provider&apos;s form (Stripe, Apple or Google), which never passes card data to us.</li>
        <li>We do not collect sensitive personal data.</li>
        <li>We use no third-party analytics (Google Analytics, Meta Pixel and the like) and no tracking cookies on the website.</li>
      </ul>

      <h2>3. How we use your data</h2>
      <ul>
        <li>Operate the app: keep your garage, history, services and achievements.</li>
        <li>Sync your data across devices when you have an account.</li>
        <li>Send transactional emails (account confirmation, password reset, support replies).</li>
        <li>Generate Biela assistant responses and the maintenance plans tailored to your car.</li>
        <li>Compute the regional price estimate from the prices users report.</li>
        <li>Process your Premium subscription and unlock paid features.</li>
        <li>Serve and measure ads in the free Android app, when you consent.</li>
        <li>Ensure security, prevent fraud and troubleshoot.</li>
        <li>Improve the Service and build new features.</li>
      </ul>

      <h2>4. Legal bases</h2>
      <ul>
        <li><strong>Performance of a contract</strong> — to provide the features you request, including the Premium subscription.</li>
        <li><strong>Consent</strong> — e.g., when you create an account, submit a photo/message or accept personalized ads in the Android app.</li>
        <li><strong>Legitimate interests</strong> — security, fraud prevention and improvement.</li>
        <li><strong>Legal obligations</strong>, where applicable.</li>
      </ul>

      <h2>5. Sharing and processors</h2>
      <p><strong>We do not sell your data.</strong> We share information only with providers that help us run the Service, under confidentiality and security obligations:</p>
      <ul>
        <li><strong>Supabase</strong> — authentication, database and storage for your photos.</li>
        <li><strong>Vercel</strong> — app and website hosting.</li>
        <li><strong>Resend</strong> — transactional email delivery and forwarding your support messages to our inbox.</li>
        <li><strong>Google and Apple</strong> — when you choose to sign in with those accounts.</li>
        <li><strong>Anthropic and OpenAI</strong> — receive the text you send to Biela and the car details needed for the answer (make, model, year, mileage and, for maintenance plans, your service history). They do not receive your name, email or account identifier. Do not send confidential information you don&apos;t want processed by these providers.</li>
        <li><strong>Stripe</strong> — processes subscription payments made on the website. It receives your email and a Mentorque account identifier, and collects your card details directly.</li>
        <li><strong>Apple and Google</strong> — when a subscription is purchased inside a store app, payment is processed by that platform under its own privacy policy.</li>
        <li><strong>RevenueCat</strong> — validates purchases made inside the iOS app and tells us whether the subscription is active.</li>
        <li><strong>Google AdMob</strong> — serves and measures ads in the free Android app. See section 6.</li>
      </ul>
      <p>
        Lookups for the Brazilian FIPE price table (BrasilAPI/Parallelum) and for recalls and safety ratings
        (NHTSA) go through our servers and send only the vehicle&apos;s make, model and year — nothing that
        identifies you.
      </p>
      <p>We may also disclose data where required by law or valid legal process.</p>

      <h2>6. Advertising in the Android app</h2>
      <p>
        The <strong>free Android app</strong> shows ads from <strong>Google AdMob</strong>. To do so, Google&apos;s
        SDK accesses your device&apos;s <strong>advertising identifier</strong> and device information, and may use
        them to select and measure the ads shown.
      </p>
      <ul>
        <li>Before the first ad, we show Google&apos;s consent form (UMP). You choose whether to accept
          personalized ads. If you decline, the app keeps working normally.</li>
        <li>You can change that choice any time under <strong>Profile → Ad preferences</strong>.</li>
        <li>On Android you can also reset or delete the advertising identifier in system settings
          (Settings → Google → Ads).</li>
        <li><strong>Premium subscribers see no ads.</strong> The website (any browser) and the iOS app also show
          no third-party ads.</li>
      </ul>
      <p>
        Google&apos;s use of this data is governed by its own privacy policy:{" "}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a>.
      </p>

      <h2>7. International data transfers</h2>
      <p>
        Some providers are located outside Brazil (e.g., in the United States). By using the Service, your data
        may be transferred and processed in those countries, always with appropriate safeguards.
      </p>

      <h2>8. Retention and storage</h2>
      <ul>
        <li>Account data is kept while your account exists.</li>
        <li>Guest data stays only on your device (local storage) until you clear it.</li>
        <li>
          When you delete your account, we erase your garage, your photos, your subscription data and your
          sign-in record. The <strong>prices you reported</strong> and the <strong>content usage records</strong>{" "}
          are <strong>anonymized</strong> (they lose any link to you) and remain only as aggregate statistics —
          without them the regional price estimate would stop working for everyone else.
        </li>
        <li>Records required by law may be kept for the applicable legal period.</li>
      </ul>

      <h2>9. Your rights</h2>
      <p>You may request to access, correct, delete, export or restrict your data, and withdraw consent. To exercise any right, use &quot;Talk to us&quot; in the app or email <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>

      <h2>10. How to delete your account and data</h2>
      <ul>
        <li><strong>In the app (immediate):</strong> under <strong>Profile → Delete account</strong>. Deletion runs right away: we cancel any active subscription, erase your photos and remove your account.</li>
        <li><strong>On the website:</strong> at <a href="/excluir-conta">mentorque.com.br/excluir-conta</a>, without installing the app.</li>
        <li><strong>By email:</strong> write to <a href={`mailto:${CONTACT}`}>{CONTACT}</a> with the subject &quot;Delete my account&quot;. We will confirm and remove your account within 30 days.</li>
      </ul>
      <p>If you use the app as a <strong>guest</strong>, there is no account to delete: just clear the app&apos;s data in your device settings (or the site data in your browser).</p>

      <h2>11. Security</h2>
      <p>We use technical and organizational measures to protect your data, including encryption in transit and per-user access control in the database. No system is 100% secure, but we work continuously to protect your information.</p>
      <p><strong>About photos:</strong> the images you upload (profile picture and moment photos) live at a publicly readable address with an unguessable name. They are not listed or indexed anywhere, and only your device knows the address — but anyone who receives that link can open the image. Do not upload photos containing information you would not want to share (documents, license plates, addresses).</p>

      <h2>12. Children</h2>
      <p>The Service is not directed to children under 13, and we do not knowingly collect their data. The app is not aimed at a child audience and is not distributed in store family programs. If you believe a child provided us data, contact us so we can remove it.</p>

      <h2>13. Local storage and cookies</h2>
      <p>We use local storage to keep the app working: your session, your garage and your preferences. We use no tracking cookies and no third-party analytics on the website.</p>
      <p>In the <strong>free Android app</strong>, the Google AdMob SDK stores your consent choice on the device along with data needed to serve and frequency-cap ads (see section 6).</p>

      <h2>14. Changes to this policy</h2>
      <p>We may update this Policy from time to time. When there are material changes, we will update the date above and, where appropriate, notify you in the app.</p>

      <h2>15. Contact</h2>
      <p>Questions about privacy or this Policy? Contact our Data Protection Officer: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>
    </LegalPage>
  );
}
