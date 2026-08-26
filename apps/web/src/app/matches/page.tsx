'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, X, Eye, Send, Star, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { apiPost, ApiError } from '@/lib/api';
import { UserRole } from '@/lib/enums';
import type { MatchResult } from '@/lib/types';

interface MatchItem {
  id: string;
  name: string;
  type: 'STARTUP' | 'INVESTOR';
  location?: string;
  sector: string;
  stage: string;
  description: string;
  matchScore: number;
  reasons: Array<{ factor: string; weight: number; matched: boolean; label: string }>;
}

export default function MatchesPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const isFounder = user?.role === UserRole.FOUNDER;

  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiPost<{ items: MatchResult<unknown>[]; targetType: string }>(
        '/matches',
        { targetType: isFounder ? 'INVESTOR' : 'STARTUP' },
      );
      setMatches(data.items.map((m) => {
        const target = m.target as Record<string, unknown>;
        const name = (target.name as string) || (target.bio as string)?.split(' ').slice(0, 2).join(' ') || 'Item';
        return {
          id: target.id as string,
          name,
          type: data.targetType === 'INVESTOR' ? 'INVESTOR' : 'STARTUP',
          location: target.location as string | undefined,
          sector: (target.sectors as string[])?.[0] ?? (target.sector as string) ?? '',
          stage: (target.stage as string) ?? '',
          description: (target.description as string) ?? (target.bio as string) ?? '',
          matchScore: m.score,
          reasons: m.reasons ?? [],
        };
      }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchMatches();
  }, [user]);

  const handleShortlist = async (match: MatchItem) => {
    try {
      await apiPost('/shortlists', match.type === 'INVESTOR' ? { investorId: match.id } : { startupId: match.id });
      success('Added to shortlist!');
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : 'Failed to shortlist');
    }
  };

  const handleConnect = async (match: MatchItem) => {
    try {
      await apiPost('/connections', { recipientId: match.id });
      success('Connection request sent!');
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : 'Failed to send connection request');
    }
  };

  if (loading) {
    return (
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 mx-auto text-neutral-300 animate-spin mb-4" />
          <p className="text-neutral-500">Finding your matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-danger-600 mb-4">{error}</p>
        <Button onClick={fetchMatches}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Your Matches</h1>
        <p className="text-neutral-500">
          {isFounder
            ? 'Investors matched to your startups based on compatibility scores'
            : 'Startups matched to your investment preferences'}
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-neutral-300 mb-4">
            <RefreshCw className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No matches found</h3>
          <p className="text-neutral-500">Update your profile to improve match quality</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <Card key={match.id} className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex flex-col items-center justify-center lg:w-32 shrink-0">
                  <div
                    className="flex items-center justify-center h-20 w-20 rounded-full border-4 border-primary-500 bg-primary-50"
                    role="img"
                    aria-label={`${match.matchScore}% match`}
                  >
                    <span className="text-2xl font-bold text-primary-500">{match.matchScore}%</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">Match score</p>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={match.name} size="lg" />
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900">{match.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="sector">{match.sector}</Badge>
                          <Badge variant="stage">{match.stage}</Badge>
                          {match.location && (
                            <span className="text-xs text-neutral-400">{match.location}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant="verified">✓ Verified</Badge>
                  </div>

                  <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{match.description}</p>

                  <div className="grid sm:grid-cols-2 gap-2">
                    {match.reasons.map((reason) => (
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

                <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 lg:justify-center">
                  <Link
                    href={match.type === 'STARTUP' ? `/startups/${match.id}` : `/investors/${match.id}`}
                  >
                    <Button variant="tertiary" size="sm">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </Link>
                  <Button variant="secondary" size="sm" onClick={() => handleShortlist(match)}>
                    <Star className="h-4 w-4" />
                    Shortlist
                  </Button>
                  {match.type === 'INVESTOR' && isFounder && (
                    <Button size="sm" onClick={() => handleConnect(match)}>
                      <Send className="h-4 w-4" />
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
