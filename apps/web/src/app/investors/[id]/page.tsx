'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Star } from 'lucide-react';
import { INVESTOR_TYPE_LABELS, STAGE_LABELS, GEOGRAPHY_OPTIONS } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { useApi } from '@/hooks/use-api';
import { useAuth } from '@/context/auth-context';
import { apiPost, ApiError } from '@/lib/api';
import { InvestorType } from '@/lib/enums';
import type { StartupStage } from '@/lib/enums';

interface InvestorDetail {
  id: string;
  name: string;
  investorType: InvestorType;
  bio?: string;
  location?: string;
  portfolioSummary?: string;
  sectors: string[];
  stages: StartupStage[];
  geographies?: string[] | null;
  minTicket?: number | null;
  maxTicket?: number | null;
  verificationStatus: string;
  completeness: number;
}

function geoLabels(geos?: string[] | null): string {
  if (!geos?.length) return 'Any';
  return geos
    .map((g) => g.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(', ');
}

export default function InvestorDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const { user } = useAuth();
  const { data, loading, error } = useApi<{ investor: InvestorDetail }>(`/investors/${params.id}`);
  const investor = data?.investor;

  if (loading) {
    return (
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          <div className="skeleton h-8 w-3/4" />
          <div className="skeleton h-4 w-1/2" />
          <div className="skeleton h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !investor) {
    return (
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">Investor not found</h1>
        <Link href="/investors" className="btn-primary">Back to investors</Link>
      </div>
    );
  }

  const handleConnect = async () => {
    if (!user || user.role !== 'FOUNDER') return;
    try {
      await apiPost('/connections', { recipientId: investor.id });
      success('Connection request sent!');
      router.push('/connections');
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : 'Failed to send connection request');
    }
  };

  const handleShortlist = async () => {
    if (!user) return;
    try {
      await apiPost('/shortlists', { investorId: investor.id });
      success('Added to your shortlist!');
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : 'Failed to shortlist');
    }
  };

    return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/investors"
        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-primary-500 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to investors
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div>
          <Card className="p-6 text-center">
            <Avatar name={investor.name} size="xl" className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-neutral-900 mb-1">{investor.name}</h1>
            <Badge variant="verified">
              {INVESTOR_TYPE_LABELS[investor.investorType]}
            </Badge>
            <p className="text-sm text-neutral-500 mt-2">{investor.location}</p>
            <p className="text-xs text-neutral-400 mt-2">{investor.completeness}% profile complete</p>
          </Card>

          <Card className="p-6 mt-6">
            <CardHeader title="Investment Preferences" />
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-neutral-500">Ticket size</span>
                <span className="font-medium text-neutral-900 ml-2">
                  {investor.minTicket != null || investor.maxTicket != null
                    ? `${formatCurrency(investor.minTicket ?? 0)} – ${formatCurrency(investor.maxTicket ?? 0)}`
                    : 'Any'}
                </span>
              </div>
              <div>
                <span className="text-neutral-500">Geographies</span>
                <span className="font-medium text-neutral-900 ml-2">{geoLabels(investor.geographies)}</span>
              </div>
              <div>
                <span className="text-neutral-500">Stages</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {investor.stages.map((s) => (
                    <Badge key={s} variant="stage">{STAGE_LABELS[s]}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {user?.role === 'FOUNDER' && (
            <div className="flex gap-3">
              <Button onClick={handleConnect}>
                <Send className="h-4 w-4 mr-2" />
                Send Connection Request
              </Button>
              <Button variant="secondary" onClick={handleShortlist}>
                <Star className="h-4 w-4 mr-2" />
                Add to Shortlist
              </Button>
            </div>
          )}

          <Card className="p-6">
            <CardHeader title="About" />
            <p className="text-neutral-700">{investor.bio ?? 'No bio provided.'}</p>
          </Card>

          {investor.portfolioSummary && (
            <Card className="p-6">
              <CardHeader title="Portfolio Summary" />
              <p className="text-neutral-700">{investor.portfolioSummary}</p>
            </Card>
          )}

          <Card className="p-6">
            <CardHeader title="Preferred Sectors" />
            <div className="flex flex-wrap gap-2">
              {investor.sectors.map((s) => (
                <Badge key={s} variant="sector">{s}</Badge>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

