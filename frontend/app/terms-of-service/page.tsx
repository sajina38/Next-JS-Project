import type { Metadata } from "next";
import Link from "next/link";
import LegalDocShell, { LegalSection } from "@/component/LegalDocShell";

export const metadata: Metadata = {
  title: "Terms of Service | Urban Boutique Hotel",
  description:
    "Terms and conditions for using the Urban Boutique Hotel website, accounts, and booking services.",
};

export default function TermsOfServicePage() {
  return (
    <LegalDocShell title="Terms of Service" lastUpdated="Last updated: April 18, 2026">
      <p className="text-gray-600">
        These Terms of Service (“Terms”) govern your access to and use of the
        Urban Boutique Hotel website, mobile experience, accounts, and booking
        services. By using our services, you agree to these Terms.
      </p>

      <LegalSection title="Eligibility and accounts">
        <p>
          You must provide accurate information when creating an account or
          making a booking. You are responsible for maintaining the
          confidentiality of your login credentials and for activity under your
          account. Notify us promptly if you suspect unauthorized access.
        </p>
      </LegalSection>

      <LegalSection title="Bookings and payments">
        <p>
          Room availability, rates, taxes, and fees displayed at checkout are
          offered subject to confirmation. We may use third-party payment
          providers; their terms may also apply. You authorize us and our
          payment partners to charge the payment method you provide for the
          total amount shown, including applicable taxes and fees.
        </p>
        <p>
          Cancellation, modification, no-show, and refund rules depend on the
          rate plan and policies shown at the time of booking. Where policies
          conflict, the terms stated on your reservation confirmation prevail.
        </p>
      </LegalSection>

      <LegalSection title="Guest conduct">
        <p>
          You agree to comply with hotel rules, local laws, and reasonable
          instructions from our staff. We may refuse service or remove guests
          whose behavior endangers others, damages property, or seriously
          disrupts operations, without refund where permitted by law and policy.
        </p>
      </LegalSection>

      <LegalSection title="Loyalty and promotions">
        <p>
          Any loyalty, rewards, or promotional programs are subject to separate
          rules published on our website. We may change or discontinue program
          features with reasonable notice where required.
        </p>
      </LegalSection>

      <LegalSection title="Intellectual property">
        <p>
          Content on our website (including text, graphics, logos, and images)
          is owned by Urban Boutique Hotel or its licensors and is protected by
          applicable intellectual property laws. You may not copy, scrape, or
          reuse our content for commercial purposes without our written consent.
        </p>
      </LegalSection>

      <LegalSection title="Disclaimer and limitation of liability">
        <p>
          Our services are provided “as is” to the fullest extent permitted by
          law. We do not warrant uninterrupted or error-free operation. To the
          maximum extent permitted by applicable law, we are not liable for
          indirect, incidental, special, consequential, or punitive damages,
          or for any loss of profits, data, or goodwill, arising from your use
          of our services.
        </p>
        <p>
          Nothing in these Terms excludes or limits liability that cannot be
          excluded or limited under applicable law.
        </p>
      </LegalSection>

      <LegalSection title="Personal information">
        <p>
          Questions about how we handle personal data may be directed to us
          using the contact details below. Additional privacy disclosures may be
          published on this website from time to time.
        </p>
      </LegalSection>

      <LegalSection title="Changes to these Terms">
        <p>
          We may update these Terms periodically. The “Last updated” date
          indicates the current version. Material changes may be communicated
          through the website or by email where appropriate.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about these Terms:{" "}
          <a
            href="mailto:info@urbanboutiquehotel.com"
            className="text-emerald-700 font-medium hover:underline"
          >
            info@urbanboutiquehotel.com
          </a>{" "}
          or via our{" "}
          <Link href="/contact" className="text-emerald-700 font-medium hover:underline">
            Contact
          </Link>{" "}
          page.
        </p>
      </LegalSection>
    </LegalDocShell>
  );
}
