'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, ShieldCheck } from 'lucide-react';
import { SECTOR_OPTIONS, INVESTOR_TYPE_LABELS } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Input, Select } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useApi } from '@/hooks/use-api';
import { InvestorType } from '@/lib/enums';

interface InvestorCard {
  id: string;
  name: string;
  investorType: InvestorType;
  bio?: string;
  location?: string;
  sectors: string[];
  stages: string[];
  minTicket?: number | null;
  maxTicket?: number | null;
  verificationStatus: string;
}

export default function InvestorsPage() {
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('');
  const [investorType, setInvestorType] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const params = new URLSearchParams();
  if (search.trim()) params.set('q', search.trim());
  if (sector) params.set('sector', sector);
  if (investorType) params.set('investorType', investorType);

  const { data, loading, error } = useApi<{ items: InvestorCard[] }>(
    `/investors${params.toString() ? `?${params.toString()}` : ''}`,
    [search, sector, investorType],
  );

  const filtered = data?.items ?? [];

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Discover Investors</h1>
        <p className="text-neutral-500">Find investors who match your startup criteria</p>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            type="search"
            placeholder="Search investors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search investors"
          />
        </div>
        <button
          className="btn-secondary btn-md"
          onClick={() => setShowFilters(!showFilters)}
          aria-expanded={showFilters}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </div>

      {showFilters && (
        <Card className="mb-6 p-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Sector"
              options={[{ value: '', label: 'All sectors' }, ...SECTOR_OPTIONS.map((s) => ({ value: s, label: s }))]}
              value={sector}
              onChange={(e) => setSector(e.target.value)}
            />
            <Select
              label="Investor Type"
              options={[
                { value: '', label: 'All types' },
                ...Object.values(InvestorType).map((t) => ({ value: t, label: INVESTOR_TYPE_LABELS[t] })),
              ]}
              value={investorType}
              onChange={(e) => setInvestorType(e.target.value)}
            />
          </div>
        </Card>
      )}

      {error && (
        <div className="bg-danger-50 text-danger-700 text-sm rounded-lg p-4 mb-6">{error}</div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card p-5"><div className="skeleton h-16 mb-4" /><div className="skeleton h-4 mb-2" /><div className="skeleton h-4 w-2/3" /></div>
        ))}
        {!loading && filtered.map((investor) => (
          <Link
            key={investor.id}
            href={`/investors/${investor.id}`}
            className="card p-5 hover:shadow-elevated transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar name={investor.name} size="lg" />
                <div>
                  <h3 className="font-semibold text-neutral-900">{investor.name}</h3>
                  <p className="text-sm text-neutral-500">{investor.location}</p>
                </div>
              </div>
              <Badge variant={investor.verificationStatus === 'APPROVED' ? 'verified' : 'pending'}>
                <ShieldCheck className="h-3 w-3 mr-1" />
                {investor.verificationStatus === 'APPROVED' ? 'Verified' : 'Pending'}
              </Badge>
            </div>
            <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{investor.bio}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {investor.sectors.slice(0, 3).map((s) => (
                <Badge key={s} variant="sector">{s}</Badge>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">{INVESTOR_TYPE_LABELS[investor.investorType]}</span>
              {investor.minTicket != null && investor.maxTicket != null ? (
                <span className="font-medium text-primary-500">
                  {formatCurrency(investor.minTicket)} - {formatCurrency(investor.maxTicket)}
                </span>
              ) : (
                <span className="text-neutral-400">Ticket size N/A</span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No investors found</h3>
          <p className="text-neutral-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}