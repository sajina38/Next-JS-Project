import type { Metadata } from "next";
import Link from "next/link";
import LegalDocShell, { LegalSection } from "@/component/LegalDocShell";

export const metadata: Metadata = {
  title: "Help Center | Urban Boutique Hotel",
  description:
    "Get help with bookings, payments, account access, loyalty cards, and contacting Urban Boutique Hotel support.",
};

export default function HelpCenterPage() {
  return (
    <LegalDocShell title="Help Center" lastUpdated="Last updated: May 9, 2026">
      <p className="text-gray-600">
        Welcome to Urban Boutique Hotel support. Find quick help for common questions about your account, reservations,
        payments, and loyalty rewards.
      </p>

      <LegalSection title="Booking help">
        <ul className="list-disc pl-5 space-y-2">
          <li>Browse available rooms on the Rooms page and choose check-in/check-out dates.</li>
          <li>Complete your booking details carefully, including guest information and ID upload.</li>
          <li>You can review your upcoming bookings anytime from your profile page.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Payment help">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            You can pay online with Khalti or choose pay-at-check-in, depending on your booking preference.
          </li>
          <li>
            If Khalti payment is interrupted, return to the booking flow and try again after confirming dates.
          </li>
          <li>For payment issues, contact the hotel with your booking details and date of stay.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Account and login support">
        <ul className="list-disc pl-5 space-y-2">
          <li>Use Forgot Password on the login page to receive a password reset link.</li>
          <li>Make sure you enter your correct username and password.</li>
          <li>If login still fails, contact support and mention the email used for your account.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Loyalty card support">
        <ul className="list-disc pl-5 space-y-2">
          <li>You earn 1 breakfast card after every 5 completed stays.</li>
          <li>Cards can be used during booking confirmation when available.</li>
          <li>Card balance and progress are visible on your Loyalty and Profile pages.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Need direct assistance?">
        <p>
          If your issue is urgent or not covered here, please use our{" "}
          <Link href="/contact" className="text-emerald-700 font-medium hover:underline">
            Contact
          </Link>{" "}
          page or email{" "}
          <a href="mailto:info@urbanboutiquehotel.com" className="text-emerald-700 font-medium hover:underline">
            info@urbanboutiquehotel.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalDocShell>
  );
}
