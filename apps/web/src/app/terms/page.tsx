import Link from 'next/link';
import { Card, CardHeader } from '@/components/ui/card';

const TERMS = [
  {
    title: '1. Acceptance of terms',
    body: 'By accessing or using FundrHub you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any part of these terms, you may not use the platform.',
  },
  {
    title: '2. Accounts and eligibility',
    body: 'You must provide accurate registration information and keep it up to date. You are responsible for safeguarding your account credentials and for all activity that occurs under your account. One person or organisation may maintain one account per role.',
  },
  {
    title: '3. Platform role',
    body: 'FundrHub is a discovery and connection platform. We do not participate in negotiations, verify investment merits, guarantee the accuracy of user-supplied content, or act as a broker, dealer or investment adviser. Any fundraising or investment decision is solely between users.',
  },
  {
    title: '4. Acceptable conduct',
    body: 'Do not misrepresent your identity, affiliation or the information in your listings; harass or spam other users; scrape the platform; upload malicious files or content you do not have the rights to; or attempt to access decks, metrics or profiles you are not authorised to view.',
  },
  {
    title: '5. Content and listings',
    body: 'You retain ownership of the content you submit. You grant FundrHub a limited licence to host and display it for the purpose of operating the platform. Listings may be submitted for review before publication, and we may reject, suspend or remove any listing or account that violates these terms.',
  },
  {
    title: '6. Connections and messaging',
    body: 'Connections form only when a request is accepted. Messaging is available exclusively between accepted connections. You may withdraw pending requests, and either party may block the other.',
  },
  {
    title: '7. Reporting and moderation',
    body: 'Report abusive users, listings or messages through the in-product report flow. Moderation decisions, including suspensions, may be appealed by contacting support. Administrative actions are recorded in an audit trail.',
  },
  {
    title: '8. Disclaimers and limitation of liability',
    body: 'The platform is provided on an "as is" and "as available" basis without warranties of any kind. To the maximum extent permitted by law, FundrHub is not liable for indirect, incidental or consequential damages, lost profits or lost opportunities arising from your use of the platform.',
  },
  {
    title: '9. Changes and termination',
    body: 'We may update these terms from time to time and will notify material changes in-product. You may stop using the platform and request account deactivation at any time; we may suspend or terminate accounts for violations of these terms.',
  },
];

export default function TermsPage() {
  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-500 mb-3">Legal</p>
        <h1 className="text-4xl font-bold text-neutral-900 mb-4">Terms of Service</h1>
        <p className="text-lg text-neutral-600">
          The ground rules for using FundrHub. Last updated: August 2025.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6 mb-12">
        {TERMS.map((term) => (
          <Card key={term.title} className="p-6">
            <CardHeader title={term.title} />
            <p className="text-sm text-neutral-600">{term.body}</p>
          </Card>
        ))}
      </div>

      <p className="text-center text-sm text-neutral-500">
        Read also our{' '}
        <Link href="/privacy" className="text-primary-500 hover:underline">
          Privacy Policy
        </Link>{' '}
        and{' '}
        <Link href="/disclaimer" className="text-primary-500 hover:underline">
          Disclaimer
        </Link>
        .
      </p>
    </div>
  );
}
