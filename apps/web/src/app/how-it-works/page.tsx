import Link from 'next/link';
import { Search, Target, Send, LineChart, Building2, UserRoundSearch } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const FOUNDER_STEPS = [
  { icon: Building2, title: 'Build your startup profile', description: 'Describe the problem, solution, sector, stage, business model and funding round. Complete profiles rank higher.' },
  { icon: LineChart, title: 'Submit for review', description: 'Our team reviews each listing before it goes live, keeping the directory trustworthy for investors.' },
  { icon: Target, title: 'Get matched', description: 'See investors ranked by compatibility, with the reasons behind every score spelled out.' },
  { icon: Send, title: 'Connect and pitch', description: 'Send a connection request. Once accepted, share your pitch deck and chat in a structured thread.' },
];

const INVESTOR_STEPS = [
  { icon: UserRoundSearch, title: 'Set your mandate', description: 'Define sectors, stages, geographies and ticket size so discovery reflects how you actually invest.' },
  { icon: Search, title: 'Discover startups', description: 'Filter the reviewed startup directory by what matters — or let matching surface relevant deals.' },
  { icon: Target, title: 'Review with context', description: 'Every startup shows stage, traction and funding ask alongside a match score you can interrogate.' },
  { icon: Send, title: 'Request access', description: 'Connect with founders you like. Accepted connections unlock metrics and pitch decks.' },
];

const FACTORS = [
  { label: 'Sector alignment', weight: 30 },
  { label: 'Stage fit', weight: 20 },
  { label: 'Ticket size', weight: 20 },
  { label: 'Geography', weight: 10 },
  { label: 'Business model', weight: 10 },
  { label: 'Profile depth', weight: 10 },
];

export default function HowItWorksPage() {
  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-500 mb-3">How it works</p>
        <h1 className="text-4xl font-bold text-neutral-900 mb-4">From profile to connection in four steps</h1>
        <p className="text-lg text-neutral-600">
          FundrHub replaces unstructured networking with a guided flow for both sides of the table.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {[
          { title: 'For founders', steps: FOUNDER_STEPS },
          { title: 'For investors', steps: INVESTOR_STEPS },
        ].map((group) => (
          <Card key={group.title} className="p-6">
            <CardHeader title={group.title} />
            <ol className="space-y-5">
              {group.steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-500 shrink-0">
                      <step.icon className="h-4 w-4" />
                    </span>
                    {index < group.steps.length - 1 && <span className="w-px flex-1 bg-neutral-200 my-1" />}
                  </div>
                  <div className="pb-2">
                    <p className="font-semibold text-neutral-900">
                      {index + 1}. {step.title}
                    </p>
                    <p className="text-sm text-neutral-600 mt-1">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        ))}
      </div>

      <Card className="p-8 mb-10">
        <CardHeader title="How match scores are computed" />
        <p className="text-neutral-600 mb-6 max-w-2xl">
          Matching is deterministic and explainable — no black box. Each factor contributes a fixed weight
          to the total score, and every result lists which factors matched.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FACTORS.map((factor) => (
            <div key={factor.label} className="p-4 rounded-xl bg-neutral-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-900">{factor.label}</span>
                <Badge variant="sector">{factor.weight}%</Badge>
              </div>
              <div className="h-1.5 rounded-full bg-neutral-200">
                <div className="h-1.5 rounded-full bg-primary-500" style={{ width: `${factor.weight * 2}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="text-center">
        <Link href="/register">
          <Button size="lg">Start with FundrHub</Button>
        </Link>
      </div>
    </div>
  );
}
