'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Check, X, Eye, Send, Star, Target } from 'lucide-react';
import { STAGE_LABELS, INVESTOR_TYPE_LABELS } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { computeMatches, addShortlist, createConnection, errorMessage } from '@/lib/api';
import { UserRole } from '@/lib/enums';
import type { InvestorProfile, MatchResult, Startup } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/toast';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type Target = Startup | InvestorProfile;

function isStartup(target: Target): target is Startup {
  return (target as Startup).ownerUserId !== undefined;
}

function targetName(target: Target): string {
  return isStartup(target) ? target.name : (target as InvestorProfile).userName ?? 'Investor';
}

export default function MatchesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { success, error } = useToast();

  const targetType = user?.role === UserRole.INVESTOR ? 'STARTUP' : 'INVESTOR';
  const [items, setItems] = useState<MatchResult<Startup | InvestorProfile>[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [shortlisted, setShortlisted] = useState<Record<string, boolean>>({});
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadMatches = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await computeMatches({ targetType });
      setItems(res.items);
    } catch (err) {
      setLoadError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [targetType]);

  useEffect(() => {
    if (!authLoading && user) void loadMatches();
    else if (!authLoading && !user) setLoading(false);
  }, [authLoading, user, loadMatches]);

  const handleShortlist = async (match: MatchResult<Target>) => {
    if (shortlisted[match.target.id]) return;
    setBusyId(match.target.id);
    try {
      await addShortlist(
        isStartup(match.target) ? { startupId: match.target.id } : { investorId: match.target.id },
      );
      setShortlisted((prev) => ({ ...prev, [match.target.id]: true }));
      success('Added to your shortlist');
    } catch (err) {
      error(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleConnect = async (match: MatchResult<Target>) => {
    if (connected[match.target.id]) return;
    setBusyId(match.target.id);
    try {
      await createConnection(
        isStartup(match.target)
          ? { recipientId: match.target.ownerUserId, startupId: match.target.id }
          : { recipientId: match.target.userId },
      );
      setConnected((prev) => ({ ...prev, [match.target.id]: true }));
      success('Connection request sent');
    } catch (err) {
      error(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  if (!authLoading && !user) {
    return (
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Target className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Sign in to see your matches</h1>
        <p className="text-neutral-500 mb-6">Matches are computed from your profile and preferences.</p>
        <Link href="/login"><Button>Sign in</Button></Link>
      </div>
    );
  }

  if (loading || authLoading) {
    return (
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-8 w-48 bg-neutral-100 rounded animate-pulse mb-2" />
        <div className="h-4 w-72 bg-neutral-100 rounded animate-pulse mb-8" />
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 mb-6 animate-pulse">
            <div className="flex gap-6">
              <div className="h-20 w-20 rounded-full bg-neutral-100 shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-56 bg-neutral-100 rounded" />
                <div className="h-4 w-full bg-neutral-100 rounded" />
                <div className="h-4 w-2/3 bg-neutral-100 rounded" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Your Matches</h1>
        <p className="text-neutral-500">
          {targetType === 'STARTUP'
            ? 'Startups that match your investment preferences — scored across sector, stage, ticket size and geography.'
            : 'Investors that match your startup profile — scored across sector, stage, ticket size and geography.'}
        </p>
      </div>

      {loadError && (
        <Card className="p-6 mb-6 border-danger-200 bg-danger-50">
          <p className="text-sm text-danger-500 mb-3">{loadError}</p>
          <Button variant="secondary" size="sm" onClick={() => void loadMatches()}>Try again</Button>
        </Card>
      )}

      {!loadError && items.length === 0 && (
        <Card className="p-10 text-center">
          <Target className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">
            {targetType === 'INVESTOR' ? 'No matches yet' : 'No startup matches yet'}
          </h2>
          <p className="text-neutral-500 mb-6 max-w-md mx-auto">
            {targetType === 'INVESTOR'
              ? 'Create your startup profile and our matching engine will find compatible investors for you.'
              : 'No published startups match your current preferences. Try broadening your sectors or stages.'}
          </p>
          {targetType === 'INVESTOR' ? (
            <Link href="/startups/new"><Button>Create your startup</Button></Link>
          ) : (
            <Link href="/startups"><Button>Browse startups</Button></Link>
          )}
        </Card>
      )}

      <div className="space-y-6">
        {items.map((match) => {
          const { target, score, reasons } = match;
          const startup = isStartup(target) ? target : null;
          const investor = isStartup(target) ? null : (target as InvestorProfile);
          return (
            <Card key={target.id} className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Score */}
                <div className="flex flex-col items-center justify-center lg:w-32 shrink-0">
                  <div
                    className="flex items-center justify-center h-20 w-20 rounded-full border-4 border-primary-500 bg-primary-50"
                    role="img"
                    aria-label={`${score}% match`}
                  >
                    <span className="text-2xl font-bold text-primary-500">{score}%</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">Match score</p>
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={targetName(target)} size="lg" />
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900">{targetName(target)}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="sector">
                            {startup ? startup.sector : investor?.preferences?.sectors?.[0] ?? '—'}
                          </Badge>
                          <Badge variant="stage">
                            {startup
                              ? STAGE_LABELS[startup.stage]
                              : INVESTOR_TYPE_LABELS[investor?.investorType ?? 'OTHER']}
                          </Badge>
                          {(startup?.location ?? investor?.location) && (
                            <span className="text-xs text-neutral-400">
                              {startup?.location ?? investor?.location}
                            </span>
                          )}
                          {startup?.amountSought ? (
                            <span className="text-xs text-neutral-500">
                              Raising {formatCurrency(startup.amountSought)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <Badge variant="verified">✓ Active</Badge>
                  </div>

                  <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                    {startup ? startup.description : investor?.bio}
                  </p>

                  {/* Explainable reasons */}
                  <div className="grid sm:grid-cols-2 gap-2">
                    {reasons.map((reason) => (
                      <div
                        key={reason.factor}
                        className="flex items-center gap-2 text-sm p-2 rounded-lg bg-neutral-50"
                      >
                        {reason.matched ? (
                          <Check className="h-4 w-4 text-success-500 shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-danger-500 shrink-0" />
                        )}
                        <span className="text-neutral-700">{reason.label}</span>
                        <span className="text-xs text-neutral-400 ml-auto">{reason.weight}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 lg:justify-center">
                  <Link href={startup ? `/startups/${target.id}` : `/investors/${target.id}`}>
                    <Button variant="tertiary" size="sm">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={busyId === target.id || shortlisted[target.id]}
                    onClick={() => void handleShortlist(match)}
                  >
                    <Star className="h-4 w-4" />
                    {shortlisted[target.id] ? 'Shortlisted' : 'Shortlist'}
                  </Button>
                  <Button
                    size="sm"
                    disabled={busyId === target.id || connected[target.id]}
                    onClick={() => void handleConnect(match)}
                  >
                    <Send className="h-4 w-4" />
                    {connected[target.id] ? 'Request sent' : 'Connect'}
                  </Button>
                </div>
              </div>
            </Card>
          );

        })}
      </div>
    </div>
  );

}
