import Link from 'next/link';
import { Compass, HeartHandshake, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';

const VALUES = [
  {
    icon: Compass,
    title: 'Structured discovery',
    description:
      'Searchable startup and investor profiles with consistent, comparable information — no more scattered spreadsheets and cold emails.',
  },
  {
    icon: Zap,
    title: 'Explainable matching',
    description:
      'Every match comes with the reasons behind it: sector, stage, ticket size, geography and business model, each with its own weight.',
  },
  {
    icon: HeartHandshake,
    title: 'Controlled connections',
    description:
      'Founders and investors connect through explicit, consent-based requests. Messaging opens only after a request is accepted.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust and safety',
    description:
      'Verification levels, profile completeness, admin review of listings and an in-product reporting flow keep the network high-signal.',
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-500 mb-3">About FundrHub</p>
        <h1 className="text-4xl font-bold text-neutral-900 mb-4">
          Fundraising discovery, minus the noise
        </h1>
        <p className="text-lg text-neutral-600">
          FundrHub is a structured founder–investor discovery and connection platform. We make fundraising
          searchable, relevant and efficient — so founders spend time building and investors spend time on
          deals that actually fit their mandate.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {VALUES.map((value) => (
          <Card key={value.title} className="p-6">
            <span className="inline-flex p-3 rounded-xl bg-primary-50 text-primary-500 mb-4">
              <value.icon className="h-6 w-6" />
            </span>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">{value.title}</h2>
            <p className="text-sm text-neutral-600">{value.description}</p>
          </Card>
        ))}
      </div>

      <Card className="p-8 text-center bg-primary-50 border-primary-100">
        <h2 className="text-xl font-semibold text-neutral-900 mb-3">Join the network</h2>
        <p className="text-neutral-600 max-w-xl mx-auto mb-6">
          Whether you are raising your first round or deploying your next cheque, FundrHub gives you the
          structure to find the right counterpart faster.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/register">
            <Button>Create your profile</Button>
          </Link>
          <Link href="/how-it-works">
            <Button variant="secondary">See how it works</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
