'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/toast';
import { UserRole } from '@/lib/enums';
import type { PanelProps } from '@/components/admin/panels';
import {
  AuditPanel,
  CategoriesPanel,
  ReportsPanel,
  StartupsPanel,
  UsersPanel,
  VerificationsPanel,
} from '@/components/admin/panels';

const TABS = [
  { id: 'users', label: 'Users' },
  { id: 'startups', label: 'Startups' },
  { id: 'reports', label: 'Reports' },
  { id: 'verifications', label: 'Verifications' },
  { id: 'categories', label: 'Categories' },
  { id: 'audit', label: 'Audit trail' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<TabId>('users');
  const [refreshToken, setRefreshToken] = useState(0);

  if (!isAuthenticated || user?.role !== UserRole.ADMIN) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Admin access required</h1>
        <p className="mt-3 text-neutral-600">
          This console is restricted to platform administrators. Sign in with an admin
          account (e.g. <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm">admin@fundrhub.com</code>).
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Go to login
        </Link>
      </div>
    );
  }

  const onError = (message: string) => toast.error(message);
  const panelProps: PanelProps = { refreshToken, onError };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Admin Console</h1>
        <p className="text-sm text-neutral-500">
          Manage users, moderate startup listings, review reports and verifications, and inspect the audit trail.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-1 rounded-xl border border-neutral-200 bg-white p-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-primary-600 text-white'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'users' && <UsersPanel {...panelProps} />}
        {tab === 'startups' && <StartupsPanel {...panelProps} />}
        {tab === 'reports' && <ReportsPanel {...panelProps} />}
        {tab === 'verifications' && <VerificationsPanel {...panelProps} />}
        {tab === 'categories' && <CategoriesPanel {...panelProps} />}
        {tab === 'audit' && <AuditPanel {...panelProps} />}
      </div>
    </div>
  );
}
