import type { Metadata } from "next";
import Link from "next/link";
import LegalDocShell, { LegalSection } from "@/component/LegalDocShell";

export const metadata: Metadata = {
  title: "Privacy Policy | Urban Boutique Hotel",
  description:
    "How Urban Boutique Hotel collects, uses, and protects your personal information when you use our website and services.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalDocShell title="Privacy Policy" lastUpdated="Last updated: April 18, 2026">
      <p className="text-gray-600">
        Urban Boutique Hotel (“we”, “us”, “our”) respects your privacy. This
        policy describes how we handle personal information when you visit our
        website, create an account, make a booking, or use related services
        (including loyalty rewards where applicable).
      </p>

      <LegalSection title="Information we collect">
        <p>
          We may collect information you provide directly, such as your name,
          email address, phone number, guest details, payment-related
          confirmations, identity documentation when required for check-in or
          verification, and messages you send through contact or booking forms.
        </p>
        <p>
          We also receive technical data automatically, such as IP address,
          browser type, device information, and approximate location, to secure
          our services and improve performance.
        </p>
      </LegalSection>

      <LegalSection title="How we use your information">
        <p>We use personal information to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Process and manage reservations, payments, and guest requests</li>
          <li>Communicate about your stay, account, or loyalty program</li>
          <li>Comply with legal obligations and protect the safety of guests and staff</li>
          <li>Analyze usage in aggregate to improve our website and services</li>
        </ul>
      </LegalSection>

      <LegalSection title="Sharing and retention">
        <p>
          We may share information with payment processors, booking technology
          providers, and other service providers who assist us in operating the
          hotel and website, subject to appropriate safeguards. We do not sell
          your personal information.
        </p>
        <p>
          We retain information only as long as needed for the purposes above,
          including legal, accounting, and dispute-resolution requirements.
        </p>
      </LegalSection>

      <LegalSection title="Security">
        <p>
          We implement reasonable technical and organizational measures to
          protect personal information. No method of transmission over the
          internet is completely secure; we encourage you to use strong
          passwords and protect your account credentials.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <p>
          Depending on applicable law, you may request access, correction, or
          deletion of certain personal information, or object to some
          processing. To make a request, contact us using the details on our{" "}
          <Link href="/contact" className="text-emerald-700 font-medium hover:underline">
            Contact
          </Link>{" "}
          page.
        </p>
      </LegalSection>

      <LegalSection title="Relationship to our Terms">
        <p>
          Use of our website and services is also governed by our{" "}
          <Link
            href="/terms-of-service"
            className="text-emerald-700 font-medium hover:underline"
          >
            Terms of Service
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          We may update this policy from time to time. The “Last updated” date
          at the top reflects the latest version. Continued use of our services
          after changes constitutes acceptance of the updated policy where
          permitted by law.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Urban Boutique Hotel, Lakeside, Pokhara - 6, Nepal. Email:{" "}
          <a
            href="mailto:info@urbanboutiquehotel.com"
            className="text-emerald-700 font-medium hover:underline"
          >
            info@urbanboutiquehotel.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalDocShell>
  );
}
