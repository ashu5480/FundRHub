import { AlertTriangle, FlaskConical, Landmark, ShieldAlert } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const POINTS = [
  {
    icon: FlaskConical,
    title: 'Demo build',
    badge: 'Important',
    body: 'This deployment is a functional demonstration. All people, startups, investors, metrics, messages and pitch decks are sample data created for evaluation. Nothing here represents a real company, person, fund or investment opportunity. Data resets when the server restarts.',
  },
  {
    icon: Landmark,
    title: 'No investment advice',
    badge: 'Not advice',
    body: 'Nothing on FundrHub constitutes financial, legal or tax advice, nor an offer to sell or a solicitation to buy securities. Match scores are heuristic indicators of profile compatibility only — they are not recommendations, valuations or endorsements.',
  },
  {
    icon: ShieldAlert,
    title: 'No guarantee of outcomes',
    badge: 'No guarantee',
    body: 'FundrHub does not guarantee that connections will lead to meetings, term sheets or funding, that listings are accurate or complete, or that counterparties are who they claim to be. Perform your own due diligence before sharing sensitive information.',
  },
  {
    icon: AlertTriangle,
    title: 'Forward-looking statements',
    badge: 'Notice',
    body: 'Sample profiles may describe plans, projections or targets. Such statements are illustrative, involve assumptions and should not be relied upon as predictions of actual results.',
  },
];

export default function DisclaimerPage() {
  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-500 mb-3">Disclaimer</p>
        <h1 className="text-4xl font-bold text-neutral-900 mb-4">Please read before you proceed</h1>
        <p className="text-lg text-neutral-600">
          Key limitations you should understand while using FundrHub.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
        {POINTS.map((point) => (
          <Card key={point.title} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex p-3 rounded-xl bg-primary-50 text-primary-500">
                <point.icon className="h-5 w-5" />
              </span>
              <Badge variant="pending">{point.badge}</Badge>
            </div>
            <CardHeader title={point.title} />
            <p className="text-sm text-neutral-600">{point.body}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6 max-w-3xl mx-auto bg-neutral-50">
        <p className="text-sm text-neutral-600">
          By continuing to use the platform you acknowledge that you have read this disclaimer together with
          our Terms of Service and Privacy Policy.
        </p>
      </Card>
    </div>
  );
}
