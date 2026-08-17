'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Target, Lightbulb, Users, TrendingUp, FileText, Send } from 'lucide-react';
import { mockStartups } from '@/lib/data';
import { STAGE_LABELS, STARTUP_STATUS_LABELS } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';

export default function StartupDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { success } = useToast();
  const startup = mockStartups.find((s) => s.id === params.id);

  if (!startup) {
    return (
      <div className="max-w-content mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">Startup not found</h1>
        <Link href="/startups" className="btn-primary">
          Back to startups
        </Link>
      </div>
    );
  }

  const handleConnect = () => {
    success('Connection request sent!');
    router.push('/connections');
  };

  const handleShortlist = () => {
    success('Added to your shortlist!');
  };

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/startups"
        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-primary-500 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to startups
      </Link>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <Avatar name={startup.name} size="xl" />
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-neutral-900">{startup.name}</h1>
                <Badge variant="stage">{STAGE_LABELS[startup.stage]}</Badge>
                <Badge variant={startup.status === 'PUBLISHED' ? 'verified' : 'pending'}>
                  {STARTUP_STATUS_LABELS[startup.status]}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-neutral-500">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {startup.location}
                </span>
                <span className="inline-flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  {startup.sector}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleShortlist}>
              Shortlist
            </Button>
            <Button onClick={handleConnect}>
              <Send className="h-4 w-4" />
              Connect
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader title="About" />
            <p className="text-neutral-700">{startup.description}</p>
          </Card>

          {/* Problem & Solution */}
          <div className="grid sm:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <span className="p-2 rounded-lg bg-danger-50 text-danger-500">
                  <Target className="h-5 w-5" />
                </span>
                <h3 className="font-semibold text-neutral-900">Problem</h3>
              </div>
              <p className="text-sm text-neutral-600">{startup.problem}</p>
            </Card>
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <span className="p-2 rounded-lg bg-success-50 text-success-500">
                  <Lightbulb className="h-5 w-5" />
                </span>
                <h3 className="font-semibold text-neutral-900">Solution</h3>
              </div>
              <p className="text-sm text-neutral-600">{startup.solution}</p>
            </Card>
          </div>

          {/* Team */}
          <Card>
            <CardHeader
              title="Team"
              subtitle="The people building this"
            />
            <div className="space-y-4">
              {startup.teamMembers?.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <Avatar name={member.name} size="md" />
                  <div>
                    <p className="font-medium text-neutral-900">{member.name}</p>
                    <p className="text-sm text-neutral-500">{member.role}</p>
                    {member.bio && <p className="text-xs text-neutral-400 mt-0.5">{member.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Funding */}
          <Card>
            <CardHeader title="Funding Round" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">Amount seeking</span>
                <span className="font-semibold text-primary-500">
                  {formatCurrency(startup.fundingRound?.amountSought ?? 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">Valuation</span>
                <span className="font-medium text-neutral-900">
                  {formatCurrency(startup.fundingRound?.valuation ?? 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">Equity offered</span>
                <span className="font-medium text-neutral-900">
                  {startup.fundingRound?.equityOffered}%
                </span>
              </div>
              {startup.fundingRound?.useOfFunds && (
                <div className="pt-3 border-t border-neutral-100">
                  <p className="text-sm font-medium text-neutral-700 mb-1">Use of funds</p>
                  <p className="text-xs text-neutral-500">{startup.fundingRound.useOfFunds}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Pitch Deck */}
          <Card>
            <CardHeader title="Pitch Deck" />
            <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-lg bg-primary-50 text-primary-500">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{startup.name}-pitch-v1.pdf</p>
                  <p className="text-xs text-neutral-500">Version 1 · 3.2 MB</p>
                </div>
              </div>
              <Button variant="tertiary" size="sm">
                View
              </Button>
            </div>
          </Card>

          {/* Metrics */}
          {startup.metrics && startup.metrics.length > 0 && (
            <Card>
              <CardHeader title="Traction" />
              <div className="space-y-3">
                {startup.metrics.map((metric) => (
                  <div key={metric.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-neutral-900 capitalize">
                        {metric.metricType.toLowerCase()}
                      </p>
                      <p className="text-xs text-neutral-400">{metric.period}</p>
                    </div>
                    <span className="font-semibold text-neutral-900">
                      {metric.metricType === 'REVENUE'
                        ? formatCurrency(metric.value)
                        : metric.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}