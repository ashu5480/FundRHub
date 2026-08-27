import Link from 'next/link';
import { Eye, Lock, Server, UserCheck, FileQuestion, Mail } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/card';

const SECTIONS = [
  {
    icon: UserCheck,
    title: 'Information we collect',
    body: 'Account details you provide (email, role), profile content you publish (bios, startup information, pitch decks, metrics) and product usage data such as connection and message activity. The demo build stores everything in memory and no data persists between server restarts.',
  },
  {
    icon: Eye,
    title: 'How we use information',
    body: 'To operate discovery and matching, show your profile to the other side of the network, deliver notifications, moderate listings and keep the platform safe. We never sell personal data.',
  },
  {
    icon: Lock,
    title: 'Access control',
    body: 'Startup drafts are visible only to their owners and administrators. Pitch decks and restricted metrics are unlocked exclusively for accepted connections. Admin tools are restricted to administrator accounts and every administrative action is written to an audit trail.',
  },
  {
    icon: Server,
    title: 'Storage and retention',
    body: 'Pitch decks are stored against an object key and served only through an authorised download endpoint. You can remove a shortlist entry, withdraw a connection request or ask for your account to be deactivated at any time.',
  },
  {
    icon: FileQuestion,
    title: 'Your choices',
    body: 'You can update or remove profile information at any time from the profile page. Reports you file are handled confidentially by the moderation team.',
  },
  {
    icon: Mail,
    title: 'Contact',
    body: 'Questions about this policy? Reach us through the contact page and we will respond promptly.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-500 mb-3">Privacy</p>
        <h1 className="text-4xl font-bold text-neutral-900 mb-4">Privacy policy</h1>
        <p className="text-lg text-neutral-600">
          How FundrHub collects, uses and protects your information. Last updated: August 2025.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
        {SECTIONS.map((section) => (
          <Card key={section.title} className="p-6">
            <span className="inline-flex p-3 rounded-xl bg-primary-50 text-primary-500 mb-4">
              <section.icon className="h-5 w-5" />
            </span>
            <CardHeader title={section.title} />
            <p className="text-sm text-neutral-600">{section.body}</p>
          </Card>
        ))}
      </div>

      <p className="text-center text-sm text-neutral-500">
        See also our{' '}
        <Link href="/terms" className="text-primary-500 hover:underline">
          Terms of Service
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
