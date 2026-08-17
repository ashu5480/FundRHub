'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal } from 'lucide-react';
import { mockStartups, SECTOR_OPTIONS, STAGE_LABELS } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Input, Select } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { StartupStage } from '@/lib/enums';

export default function StartupsPage() {
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('');
  const [stage, setStage] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = mockStartups.filter((startup) => {
    const matchesSearch = startup.name.toLowerCase().includes(search.toLowerCase());
    const matchesSector = !sector || startup.sector === sector;
    const matchesStage = !stage || startup.stage === stage;
    return matchesSearch && matchesSector && matchesStage;
  });

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Discover Startups</h1>
        <p className="text-neutral-500">
          Find promising startups looking for investment
        </p>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            type="search"
            placeholder="Search startups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search startups"
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
              label="Stage"
              options={[
                { value: '', label: 'All stages' },
                ...Object.values(StartupStage).map((s) => ({ value: s, label: STAGE_LABELS[s] })),
              ]}
              value={stage}
              onChange={(e) => setStage(e.target.value)}
            />
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((startup) => (
          <Link
            key={startup.id}
            href={`/startups/${startup.id}`}
            className="card p-5 hover:shadow-elevated transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar name={startup.name} size="lg" />
                <div>
                  <h3 className="font-semibold text-neutral-900">{startup.name}</h3>
                  <p className="text-sm text-neutral-500">{startup.location}</p>
                </div>
              </div>
              <Badge variant="stage">{STAGE_LABELS[startup.stage]}</Badge>
            </div>
            <p className="text-sm text-neutral-600 mb-4 line-clamp-3">{startup.description}</p>
            <div className="flex items-center justify-between">
              <Badge variant="sector">{startup.sector}</Badge>
              <div className="text-right">
                <p className="text-xs text-neutral-500">Seeking</p>
                <p className="text-sm font-semibold text-primary-500">
                  {formatCurrency(startup.amountSought ?? 0)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No startups found</h3>
          <p className="text-neutral-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}