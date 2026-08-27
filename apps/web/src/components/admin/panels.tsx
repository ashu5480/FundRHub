'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardBody } from '@/components/ui/card';
import {
  adminCreateCategory,
  adminListAuditEvents,
  adminListCategories,
  adminListReports,
  adminListStartups,
  adminListUsers,
  adminListVerifications,
  adminSetStartupStatus,
  adminSetUserStatus,
  adminUpdateReport,
  adminUpdateVerification,
  errorMessage,
} from '@/lib/api';
import { Input } from '@/components/ui/input';
import { CategoryType, ReportStatus, StartupStatus, UserStatus, VerificationStatus } from '@/lib/enums';
import type {
  AuditEvent,
  Category,
  PaginatedResponse,
  Report,
  Startup,
  User,
  Verification,
} from '@/lib/types';
import { STAGE_LABELS, STARTUP_STATUS_LABELS } from '@/lib/data';
import { formatDate, timeAgo } from '@/lib/utils';

export interface PanelProps {
  /** Incremented by the shell to force a refresh. */
  refreshToken: number;
  onError: (message: string) => void;
}

const selectClasses =
  'rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none';

function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8 text-center text-sm text-gray-500">
        {label}
      </td>
    </tr>
  );
}

function Pager({
  pagination,
  onPage,
}: {
  pagination?: PaginatedResponse<unknown>['pagination'];
  onPage: (page: number) => void;
}) {
  if (!pagination || pagination.totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
      <span className="text-xs text-gray-500">
        Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
      </span>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={pagination.page <= 1} onClick={() => onPage(pagination.page - 1)}>
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPage(pagination.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

const th = 'px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500';
const td = 'px-4 py-3 text-sm text-gray-700';

/** Platform users management. */
export function UsersPanel({ refreshToken, onError }: PanelProps) {
  const [data, setData] = useState<PaginatedResponse<User> | null>(null);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      setData(await adminListUsers({ status: status || undefined, page, limit: 10 }));
    } catch (err) {
      onError(errorMessage(err));
    }
  }, [status, page, onError]);

  useEffect(() => {
    load();
  }, [load, refreshToken]);

  const changeStatus = async (id: string, next: UserStatus) => {
    const reason = next === UserStatus.SUSPENDED ? window.prompt('Reason for suspension:') ?? undefined : undefined;
    try {
      await adminSetUserStatus(id, next, reason);
      load();
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-900">Users</h2>
        <select className={selectClasses} value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
          <option value="">All statuses</option>
          {Object.values(UserStatus).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <table className="w-full">
        <thead className="bg-gray-50"><tr><th className={th}>User</th><th className={th}>Role</th><th className={th}>Status</th><th className={th}>Joined</th><th className={th}>Actions</th></tr></thead>
        <tbody className="divide-y divide-gray-100">
          {data?.items.length ? data.items.map((u) => (
            <tr key={u.id}>
              <td className={td}><div className="font-medium text-gray-900">{u.email}</div><div className="text-xs text-gray-500">{u.id}</div></td>
              <td className={td}><Badge variant="sector">{u.role}</Badge></td>
              <td className={td}><Badge variant={u.status === 'ACTIVE' ? 'verified' : u.status === 'SUSPENDED' ? 'suspended' : 'pending'}>{u.status}</Badge></td>
              <td className={td}>{formatDate(u.createdAt)}</td>
              <td className={td}>
                {u.status === UserStatus.SUSPENDED ? (
                  <Button size="sm" onClick={() => changeStatus(u.id, UserStatus.ACTIVE)}>Activate</Button>
                ) : (
                  <Button size="sm" variant="danger" disabled={u.role === 'ADMIN'} onClick={() => changeStatus(u.id, UserStatus.SUSPENDED)}>Suspend</Button>
                )}
              </td>
            </tr>
          )) : <EmptyRow colSpan={5} label="No users found" />}
        </tbody>
      </table>
      <Pager pagination={data?.pagination} onPage={setPage} />
    </Card>
  );
}

/** Startup listings moderation. */
export function StartupsPanel({ refreshToken, onError }: PanelProps) {
  const [data, setData] = useState<PaginatedResponse<Startup> | null>(null);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      setData(await adminListStartups({ status: status || undefined, page, limit: 10 }));
    } catch (err) {
      onError(errorMessage(err));
    }
  }, [status, page, onError]);

  useEffect(() => {
    load();
  }, [load, refreshToken]);

  const setStatusFor = async (id: string, next: StartupStatus) => {
    const note = next === StartupStatus.REJECTED ? window.prompt('Reason for rejection:') ?? undefined : undefined;
    try {
      await adminSetStartupStatus(id, next, note);
      load();
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-900">Startup listings</h2>
        <select className={selectClasses} value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
          <option value="">All statuses</option>
          {Object.values(StartupStatus).map((s) => <option key={s} value={s}>{STARTUP_STATUS_LABELS[s]}</option>)}
        </select>
      </div>
      <table className="w-full">
        <thead className="bg-gray-50"><tr><th className={th}>Startup</th><th className={th}>Sector / Stage</th><th className={th}>Status</th><th className={th}>Updated</th><th className={th}>Actions</th></tr></thead>
        <tbody className="divide-y divide-gray-100">
          {data?.items.length ? data.items.map((s) => (
            <tr key={s.id}>
              <td className={td}><div className="font-medium text-gray-900">{s.name}</div><div className="text-xs text-gray-500">{s.owner?.name ?? s.ownerUserId}</div></td>
              <td className={td}>{s.sector}<div className="text-xs text-gray-500">{STAGE_LABELS[s.stage]}</div></td>
              <td className={td}><Badge variant={s.status === 'PUBLISHED' ? 'verified' : s.status === 'PENDING_REVIEW' ? 'pending' : 'suspended'}>{STARTUP_STATUS_LABELS[s.status]}</Badge></td>
              <td className={td}>{timeAgo(s.updatedAt)}</td>
              <td className={td}>
                <div className="flex gap-2">
                  {s.status === StartupStatus.PENDING_REVIEW && (
                    <>
                      <Button size="sm" onClick={() => setStatusFor(s.id, StartupStatus.PUBLISHED)}>Publish</Button>
                      <Button size="sm" variant="danger" onClick={() => setStatusFor(s.id, StartupStatus.REJECTED)}>Reject</Button>
                    </>
                  )}
                  {s.status === StartupStatus.PUBLISHED && (
                    <Button size="sm" variant="secondary" onClick={() => setStatusFor(s.id, StartupStatus.SUSPENDED)}>Suspend</Button>
                  )}
                  {s.status === StartupStatus.SUSPENDED && (
                    <Button size="sm" onClick={() => setStatusFor(s.id, StartupStatus.PUBLISHED)}>Re-publish</Button>
                  )}
                </div>
              </td>
            </tr>
          )) : <EmptyRow colSpan={5} label="No startups found" />}
        </tbody>
      </table>
      <Pager pagination={data?.pagination} onPage={setPage} />
    </Card>
  );
}

/** Abuse reports queue. */
export function ReportsPanel({ refreshToken, onError }: PanelProps) {
  const [data, setData] = useState<PaginatedResponse<Report> | null>(null);
  const [status, setStatus] = useState(ReportStatus.OPEN);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      setData(await adminListReports({ status: status || undefined, page, limit: 10 }));
    } catch (err) {
      onError(errorMessage(err));
    }
  }, [status, page, onError]);

  useEffect(() => {
    load();
  }, [load, refreshToken]);

  const act = async (id: string, next: ReportStatus) => {
    const resolution = next === ReportStatus.RESOLVED ? window.prompt('Resolution note:') ?? undefined : undefined;
    try {
      await adminUpdateReport(id, next, resolution);
      load();
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-900">Abuse reports</h2>
        <select className={selectClasses} value={status} onChange={(e) => { setPage(1); setStatus(e.target.value as ReportStatus); }}>
          <option value="">All statuses</option>
          {Object.values(ReportStatus).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <table className="w-full">
        <thead className="bg-gray-50"><tr><th className={th}>Target</th><th className={th}>Reason</th><th className={th}>Status</th><th className={th}>Filed</th><th className={th}>Actions</th></tr></thead>
        <tbody className="divide-y divide-gray-100">
          {data?.items.length ? data.items.map((r) => (
            <tr key={r.id}>
              <td className={td}><Badge variant="stage">{r.targetType}</Badge><div className="mt-1 text-xs text-gray-500">{r.targetId}</div></td>
              <td className={`${td} max-w-xs`}>{r.reason}</td>
              <td className={td}><Badge variant={r.status === 'OPEN' ? 'pending' : r.status === 'RESOLVED' ? 'verified' : 'default'}>{r.status}</Badge></td>
              <td className={td}>{timeAgo(r.createdAt)}</td>
              <td className={td}>
                <div className="flex gap-2">
                  {r.status === ReportStatus.OPEN && (
                    <Button size="sm" variant="secondary" onClick={() => act(r.id, ReportStatus.IN_REVIEW)}>Review</Button>
                  )}
                  {r.status !== ReportStatus.RESOLVED && r.status !== ReportStatus.DISMISSED && (
                    <>
                      <Button size="sm" onClick={() => act(r.id, ReportStatus.RESOLVED)}>Resolve</Button>
                      <Button size="sm" variant="ghost" onClick={() => act(r.id, ReportStatus.DISMISSED)}>Dismiss</Button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          )) : <EmptyRow colSpan={5} label="No reports found" />}
        </tbody>
      </table>
      <Pager pagination={data?.pagination} onPage={setPage} />
    </Card>
  );
}

/** Verification requests queue. */
export function VerificationsPanel({ refreshToken, onError }: PanelProps) {
  const [data, setData] = useState<PaginatedResponse<Verification> | null>(null);
  const [status, setStatus] = useState(VerificationStatus.PENDING);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      setData(await adminListVerifications({ status: status || undefined, page, limit: 10 }));
    } catch (err) {
      onError(errorMessage(err));
    }
  }, [status, page, onError]);

  useEffect(() => {
    load();
  }, [load, refreshToken]);

  const act = async (id: string, next: VerificationStatus) => {
    try {
      await adminUpdateVerification(id, next);
      load();
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-900">Verification requests</h2>
        <select className={selectClasses} value={status} onChange={(e) => { setPage(1); setStatus(e.target.value as VerificationStatus); }}>
          <option value="">All statuses</option>
          {Object.values(VerificationStatus).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <table className="w-full">
        <thead className="bg-gray-50"><tr><th className={th}>Requester</th><th className={th}>Level</th><th className={th}>Status</th><th className={th}>Requested</th><th className={th}>Actions</th></tr></thead>
        <tbody className="divide-y divide-gray-100">
          {data?.items.length ? data.items.map((v) => (
            <tr key={v.id}>
              <td className={td}>
                <div className="font-medium text-gray-900">{(v as Verification & { userName?: string }).userName ?? v.userId}</div>
                <div className="text-xs text-gray-500">{(v as Verification & { userEmail?: string }).userEmail ?? ''}</div>
              </td>
              <td className={td}><Badge variant="sector">{v.level}</Badge></td>
              <td className={td}><Badge variant={v.status === 'APPROVED' ? 'verified' : v.status === 'PENDING' ? 'pending' : 'suspended'}>{v.status}</Badge></td>
              <td className={td}>{formatDate(v.createdAt)}</td>
              <td className={td}>
                {v.status === VerificationStatus.PENDING ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => act(v.id, VerificationStatus.APPROVED)}>Approve</Button>
                    <Button size="sm" variant="danger" onClick={() => act(v.id, VerificationStatus.REJECTED)}>Reject</Button>
                  </div>
                ) : <span className="text-xs text-gray-400">Reviewed</span>}
              </td>
            </tr>
          )) : <EmptyRow colSpan={5} label="No verification requests" />}
        </tbody>
      </table>
      <Pager pagination={data?.pagination} onPage={setPage} />
    </Card>
  );
}

/** Taxonomy category management. */
export function CategoriesPanel({ refreshToken, onError }: PanelProps) {
  const [items, setItems] = useState<Category[]>([]);
  const [type, setType] = useState<CategoryType>(CategoryType.SECTOR);
  const [name, setName] = useState('');

  const load = useCallback(async () => {
    try {
      setItems((await adminListCategories()).items);
    } catch (err) {
      onError(errorMessage(err));
    }
  }, [onError]);

  useEffect(() => {
    load();
  }, [load, refreshToken]);

  const create = async () => {
    if (!name.trim()) return;
    try {
      await adminCreateCategory({ type, name: name.trim() });
      setName('');
      load();
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-end gap-3 p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Type</label>
            <select className={selectClasses} value={type} onChange={(e) => setType(e.target.value as CategoryType)}>
              {Object.values(CategoryType).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="min-w-[220px]">
            <label className="mb-1 block text-xs font-medium text-gray-600">Name</label>
            <Input value={name} placeholder="e.g. GREENTECH" onChange={(e) => setName(e.target.value)} />
          </div>
          <Button onClick={create} disabled={!name.trim()}>Add category</Button>
        </div>
      </Card>
      <Card>
        <table className="w-full">
          <thead className="bg-gray-50"><tr><th className={th}>Type</th><th className={th}>Name</th><th className={th}>Created</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {items.length ? items.map((c) => (
              <tr key={c.id}>
                <td className={td}><Badge variant="stage">{c.type}</Badge></td>
                <td className={`${td} font-medium text-gray-900`}>{c.name}</td>
                <td className={td}>{formatDate(c.createdAt)}</td>
              </tr>
            )) : <EmptyRow colSpan={3} label="No categories" />}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/** Audit trail. */
export function AuditPanel({ refreshToken, onError }: PanelProps) {
  const [data, setData] = useState<PaginatedResponse<AuditEvent> | null>(null);
  const [entityType, setEntityType] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      setData(await adminListAuditEvents({ entityType: entityType || undefined, page, limit: 15 }));
    } catch (err) {
      onError(errorMessage(err));
    }
  }, [entityType, page, onError]);

  useEffect(() => {
    load();
  }, [load, refreshToken]);

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-900">Audit trail</h2>
        <select className={selectClasses} value={entityType} onChange={(e) => { setPage(1); setEntityType(e.target.value); }}>
          <option value="">All entities</option>
          {['USER', 'STARTUP', 'REPORT', 'VERIFICATION', 'CATEGORY', 'SYSTEM'].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <table className="w-full">
        <thead className="bg-gray-50"><tr><th className={th}>Action</th><th className={th}>Entity</th><th className={th}>Actor</th><th className={th}>When</th></tr></thead>
        <tbody className="divide-y divide-gray-100">
          {data?.items.length ? data.items.map((e) => (
            <tr key={e.id}>
              <td className={`${td} font-medium text-gray-900`}>{e.action}</td>
              <td className={td}>{e.entityType}<div className="text-xs text-gray-500">{e.entityId}</div></td>
              <td className={td}>{e.actorId ?? 'system'}</td>
              <td className={td}>{timeAgo(e.createdAt)}</td>
            </tr>
          )) : <EmptyRow colSpan={4} label="No audit events" />}
        </tbody>
      </table>
      <Pager pagination={data?.pagination} onPage={setPage} />
    </Card>
  );
}





