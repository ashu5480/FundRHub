'use client';

import Link from 'next/link';
import { Star, Trash2 } from 'lucide-react';
import { mockStartups, mockInvestors, STAGE_LABELS } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/context/auth-context';
import { UserRole } from '@/lib/enums';

export default function ShortlistPage() {
  const { user } = useAuth();
  const { success } = useToast();
  const isFounder = user?.role === UserRole.FOUNDER;

  const shortlistedStartups = mockStartups.slice(0, 2);
  const shortlistedInvestors = mockInvestors.slice(0, 2);

  const handleRemove = () => {
    success('Removed from shortlist');
  };

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">My Shortlist</h1>

      {isFounder ? (
        <>
          <Card className="mb-6">
            <CardHeader
              title="Shortlisted Investors"
              subtitle={`${shortlistedInvestors.length} investors saved`}
            />
            <div className="space-y-4">
              {shortlistedInvestors.map((investor) => (
                <Link
                  key={investor.id}
                  href={`/investors/${investor.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={investor.bio?.split(' ')[0] ?? 'Investor'} size="md" />
                    <div>
                      <p className="font-medium text-neutral-900">
                        {investor.bio?.split(' ').slice(0, 2).join(' ') ?? 'Investor'}
                      </p>
                      <p className="text-sm text-neutral-500">{investor.location}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.preventDefault(); handleRemove(); }}>
                    <Trash2 className="h-4 w-4 text-danger-500" />
                  </Button>
                </Link>
              ))}
              {shortlistedInvestors.length === 0 && (
                <div className="text-center py-8">
                  <Star className="h-10 w-10 mx-auto text-neutral-300 mb-3" />
                  <p className="text-neutral-500">Your investor shortlist is empty</p>
                  <Link href="/investors" className="btn-tertiary btn-sm mt-2">
                    Discover Investors
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </>
      ) : (
        <>
          <Card>
            <CardHeader
              title="Shortlisted Startups"
              subtitle={`${shortlistedStartups.length} startups saved`}
            />
            <div className="space-y-4">
              {shortlistedStartups.map((startup) => (
                <Link
                  key={startup.id}
                  href={`/startups/${startup.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={startup.name} size="md" />
                    <div>
                      <p className="font-medium text-neutral-900">{startup.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="sector">{startup.sector}</Badge>
                        <Badge variant="stage">{STAGE_LABELS[startup.stage]}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-primary-500">
                      {formatCurrency(startup.amountSought ?? 0)}
                    </span>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.preventDefault(); handleRemove(); }}>
                      <Trash2 className="h-4 w-4 text-danger-500" />
                    </Button>
                  </div>
                </Link>
              ))}
              {shortlistedStartups.length === 0 && (
                <div className="text-center py-8">
                  <Star className="h-10 w-10 mx-auto text-neutral-300 mb-3" />
                  <p className="text-neutral-500">Your startup shortlist is empty</p>
                  <Link href="/startups" className="btn-tertiary btn-sm mt-2">
                    Discover Startups
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}