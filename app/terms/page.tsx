import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/Legal";

// Terms of Use — also serves as the subscriptions' EULA. See app/termos for
// the Portuguese original and the note on Apple guideline 3.1.2(c).

export const metadata: Metadata = {
  title: "Terms of Use — Mentorque",
  description:
    "Terms governing the use of the Mentorque app and website, including the rules of the auto-renewing Premium subscription.",
  alternates: { canonical: "/terms", languages: { "pt-BR": "/termos" } },
  robots: { index: true, follow: true },
};

const CONTACT = "contato@mentorque.com.br";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      updated="Last updated: August 13, 2026"
      altHref="/termos"
      altLabel="Português"
      homeLabel="Back to home"
    >
      <p>
        These Terms of Use (&quot;Terms&quot;) govern your use of the <strong>Mentorque</strong> app and
        website (the &quot;Service&quot;). By creating an account, subscribing, or simply using the Service,
        you agree to these Terms. If you do not agree, please do not use the Service.
      </p>
      <p>
        These Terms also serve as the end-user license agreement (EULA) for the application distributed
        through the App Store and Google Play.
      </p>

      <h2>1. What Mentorque is — and what it isn&apos;t</h2>
      <p>
        Mentorque organizes your vehicle&apos;s maintenance: service history, maintenance reminders,
        educational content and guidance on symptoms. It is a tool for{" "}
        <strong>information and organization</strong>.
      </p>
      <p>
        The Service <strong>does not replace inspection by a qualified professional</strong> or your
        vehicle&apos;s owner manual. This is doubly true for safety items — brakes, steering, suspension,
        airbags, tires and the electrical system. Guidance from Biela (our AI assistant) and the content in
        the app are starting points for a conversation with your shop, not a diagnosis. Decisions about your
        vehicle are yours, and responsibility for any work performed lies with whoever performs it.
      </p>
      <p>
        Price estimates, cost projections and market values are approximations based on averages and public
        data. They vary by region, by shop and by the condition of the vehicle, and they are not offers.
      </p>

      <h2>2. Who may use the Service</h2>
      <p>
        You must be 13 or older. If you are under 18, use must occur with the consent of a legal guardian. By
        using the Service, you represent that the information you provide is accurate.
      </p>

      <h2>3. Account</h2>
      <p>
        Much of the app can be used as a <strong>guest</strong>, with no account — in that case your data
        stays on your device only. If you create an account, you are responsible for keeping your credentials
        safe and for everything that happens under it. Contact us at{" "}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a> if you suspect unauthorized use.
      </p>
      <p>
        You may delete your account and data at any time, from the app or at{" "}
        <a href="/excluir-conta">mentorque.com.br/excluir-conta</a>.
      </p>

      <h2>4. Free plan</h2>
      <p>
        The free plan is permanent and requires no card. It includes limits — number of vehicles, logged
        services and parts per service — as well as part of the content library. On Android, the free version
        shows ads; on the Apple app and on the website, it does not.
      </p>

      <h2>5. Premium subscription (auto-renewing)</h2>
      <p>
        <strong>Mentorque Premium</strong> is an auto-renewing subscription that removes the free plan&apos;s
        limits and unlocks the exclusive features: the Biela assistant, detailed vehicle health, the
        personalized service plan, reports and PDF export.
      </p>
      <h3>Plans, length and price</h3>
      <ul>
        <li>
          <strong>Mentorque Premium Monthly</strong> — 1 month, at <strong>R$ 29.90</strong> per month.
        </li>
        <li>
          <strong>Mentorque Premium Annual</strong> — 12 months, at <strong>R$ 239.90</strong> per year, which
          works out to R$ 19.99 per month.
        </li>
      </ul>
      <p>
        Prices are in Brazilian reais and include applicable taxes. The price charged is always the one shown
        on the subscription screen at the time of purchase, in your store account&apos;s currency. We may
        change prices in the future; any change applies only to later periods, and you will be notified in
        advance as the store requires, with a chance to cancel first.
      </p>
      <h3>Free trial</h3>
      <p>
        Where offered, the free trial lasts <strong>3 days on the Apple app</strong> and{" "}
        <strong>7 days on the website and the Android app</strong>. When the trial ends, the subscription
        begins and is charged automatically unless you cancel first. If you subscribe during a free trial, any
        unused portion of that trial is forfeited.
      </p>
      <h3>Renewal and cancellation</h3>
      <p>
        The subscription <strong>renews automatically</strong> at the end of each period, for the same length,
        and is charged to the account used for the purchase. Renewal is cancelled if you turn it off at least{" "}
        <strong>24 hours before</strong> the end of the current period.
      </p>
      <ul>
        <li>
          <strong>App Store purchases:</strong> payment is charged to your Apple account upon confirmation of
          purchase. To manage or cancel, go to <em>Settings → [your name] → Subscriptions</em> on your device,
          or <em>Settings → Subscriptions</em> in the App Store. Deleting the app alone does not cancel the
          subscription.
        </li>
        <li>
          <strong>Google Play purchases:</strong> manage under <em>Play Store → Payments and subscriptions →
          Subscriptions</em>.
        </li>
        <li>
          <strong>Website purchases:</strong> manage from your profile in the app, or write to{" "}
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
        </li>
      </ul>
      <p>
        When you cancel, you keep Premium access until the end of the period already paid for. There is no
        pro-rated refund for partially used periods, except where required by applicable law.
      </p>
      <h3>Refunds</h3>
      <p>
        In-app purchases are processed by Apple or Google, and refund requests follow those stores&apos;
        policies — we have no access to your payment method. You also hold the rights granted by the Brazilian
        Consumer Protection Code, including the right to withdraw within 7 days of a distance purchase.
      </p>

      <h2>6. Acceptable use</h2>
      <p>By using the Service, you agree not to:</p>
      <ul>
        <li>use the Service for unlawful purposes or in ways that infringe third-party rights;</li>
        <li>circumvent free plan limits, subscription mechanisms or security controls;</li>
        <li>bulk-extract the content, by any automated means, for redistribution;</li>
        <li>reverse engineer the application, except to the extent permitted by law;</li>
        <li>submit content that is offensive, illegal, or not yours.</li>
      </ul>
      <p>We may suspend or terminate accounts that violate these Terms, with notice whenever possible.</p>

      <h2>7. Content and intellectual property</h2>
      <p>
        The application, the Mentorque brand, and the text, illustrations and videos we produce are protected
        by copyright and remain ours or our licensors&apos;. A subscription grants you a{" "}
        <strong>personal, limited, revocable and non-transferable</strong> license to use them, not a transfer
        of ownership.
      </p>
      <p>
        Content <strong>you</strong> enter — vehicles, services, notes and photos — remains yours. You grant
        us only the license needed to store, process and display that content back to you within the Service.
      </p>
      <p>
        Some videos are hosted by third parties (YouTube) and displayed inside the app. Use of that content is
        also subject to those platforms&apos; terms.
      </p>

      <h2>8. Artificial intelligence</h2>
      <p>
        Biela uses language models to generate answers from your question, your vehicle&apos;s context and,
        where available, excerpts from the manufacturer&apos;s manual. AI-generated answers may contain errors
        or omissions. Do not make safety decisions based on them alone — confirm with the vehicle manual and
        with a professional.
      </p>

      <h2>9. Availability</h2>
      <p>
        We work to keep the Service available, but it may go down for maintenance, third-party failure or
        reasons outside our control. Features may change, be added or be discontinued. If we discontinue a
        core Premium feature, we will give reasonable advance notice.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, Mentorque is not liable for indirect damages, lost profits or
        losses arising from decisions made based on information in the Service, including work performed or
        not performed on your vehicle. Nothing in these Terms waives rights that the law grants consumers on a
        non-waivable basis.
      </p>

      <h2>11. Privacy</h2>
      <p>
        How we handle your data is described in our <a href="/privacy">Privacy Policy</a>, which forms part of
        these Terms.
      </p>

      <h2>12. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. When changes are material, we will update the date at the
        top and, where appropriate, notify you in the app. Continued use after the changes means you agree to
        the revised version.
      </p>

      <h2>13. Governing law and venue</h2>
      <p>
        These Terms are governed by the laws of the Federative Republic of Brazil. The consumer&apos;s
        domicile is the elected venue for disputes, as provided by the Consumer Protection Code.
      </p>

      <h2>14. Contact</h2>
      <p>
        Questions about these Terms or your subscription? Write to{" "}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>
    </LegalPage>
  );
}
