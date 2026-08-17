'use client';

import Link from 'next/link';
import { Check, X, Target, Eye, Send, Star } from 'lucide-react';
import { mockStartups, mockInvestors, MATCH_WEIGHTS } from '@/lib/data';
import { STAGE_LABELS, INVESTOR_TYPE_LABELS } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/toast';
import { UserRole } from '@/lib/enums';

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
  const { success } = useToast();
  const isFounder = user?.role === UserRole.FOUNDER;

  // Calculate matches based on user role
  const matches: MatchItem[] = isFounder
    ? mockInvestors.map((investor) => ({
        id: investor.id,
        name: investor.bio?.split(' ').slice(0, 2).join(' ') ?? 'Investor',
        type: 'INVESTOR' as const,
        location: investor.location ?? undefined,
        sector: investor.preferences?.sectors[0] ?? 'SAAS',
        stage: STAGE_LABELS[investor.preferences?.stages[0] ?? 'SEED'],
        description: investor.bio ?? '',
        matchScore: 82,
        reasons: [
          { factor: 'SECTOR', weight: MATCH_WEIGHTS.SECTOR, matched: true, label: 'Sector match' },
          { factor: 'STAGE', weight: MATCH_WEIGHTS.STAGE, matched: true, label: 'Stage preference matches' },
          { factor: 'TICKET_SIZE', weight: MATCH_WEIGHTS.TICKET_SIZE, matched: true, label: 'Ticket size fits' },
          { factor: 'GEOGRAPHY', weight: MATCH_WEIGHTS.GEOGRAPHY, matched: investor.location?.includes('India') ?? false, label: 'Geography matches' },
        ],
      }))
    : mockStartups.map((startup) => ({
        id: startup.id,
        name: startup.name,
        type: 'STARTUP' as const,
        location: startup.location ?? undefined,
        sector: startup.sector,
        stage: STAGE_LABELS[startup.stage],
        description: startup.description,
        matchScore: 87,
        reasons: [
          { factor: 'SECTOR', weight: MATCH_WEIGHTS.SECTOR, matched: true, label: 'Sector match' },
          { factor: 'STAGE', weight: MATCH_WEIGHTS.STAGE, matched: true, label: 'Stage preference matches' },
          { factor: 'TICKET_SIZE', weight: MATCH_WEIGHTS.TICKET_SIZE, matched: true, label: 'Ticket size fits' },
          { factor: 'GEOGRAPHY', weight: MATCH_WEIGHTS.GEOGRAPHY, matched: true, label: 'Geography matches' },
        ],
      }));

  const handleShortlist = (id: string) => {
    success('Added to shortlist!');
  };

  const handleConnect = (id: string) => {
    success('Connection request sent!');
  };

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Your Matches</h1>
        <p className="text-neutral-500">
          {isFounder
            ? 'Investors who match your startup profile'
            : 'Startups that match your investment preferences'}
        </p>
      </div>

      <div className="space-y-6">
        {matches.map((match) => (
          <Card key={match.id} className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Score */}
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

              {/* Details */}
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

                {/* Reasons */}
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

              {/* Actions */}
              <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 lg:justify-center">
                <Link
                  href={match.type === 'STARTUP' ? `/startups/${match.id}` : `/investors/${match.id}`}
                >
                  <Button variant="tertiary" size="sm">
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </Link>
                <Button variant="secondary" size="sm" onClick={() => handleShortlist(match.id)}>
                  <Star className="h-4 w-4" />
                  Shortlist
                </Button>
                <Button size="sm" onClick={() => handleConnect(match.id)}>
                  <Send className="h-4 w-4" />
                  Connect
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}