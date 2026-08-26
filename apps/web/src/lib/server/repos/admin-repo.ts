import { getDb, saveDb, uid, nowIso, DbUser } from '../db';
import { notFound } from '../http';
import type { User, Category, AuditEvent, Verification } from '@/lib/types';
import { UserStatus, StartupStatus, ReportStatus, VerificationStatus, CategoryType } from '@/lib/enums';
import { attachProfiles } from './users-repo';
import { paginate } from './startups-repo';

export function logAudit(actorId: string | null, action: string, entityType: string, entityId: string, metadata?: Record<string, unknown>): void {
  const db = getDb();
  const event: AuditEvent = {
    id: uid(), actorId, action, entityType, entityId, metadata, createdAt: nowIso(),
  };
  db.auditEvents.push(event);
  saveDb(db);
}

export function listUsers(input: { status?: string; role?: string; page?: number; limit?: number } = {}) {
  const db = getDb();
  const items = db.users.filter((u) => {
    if (input.status && u.status !== input.status) return false;
    if (input.role && u.role !== input.role) return false;
    return true;
  });
  const page = paginate<DbUser>(items, input.page, input.limit);
  return { items: page.items.map((u) => attachProfiles(u)), pagination: page.pagination };
}

export function setUserStatus(admin: DbUser, userId: string, status: UserStatus, reason?: string): User {
  const db = getDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw notFound('User not found');
  if (user.id === admin.id) throw notFound('You cannot modify your own status');
  user.status = status;
  user.updatedAt = nowIso();
  logAudit(admin.id, 'USER_STATUS_UPDATE', 'USER', userId, { status, reason });
  saveDb(db);
  return attachProfiles(user);
}

export function setStartupStatus(admin: DbUser, startupId: string, status: StartupStatus, note?: string) {
  const db = getDb();
  const startup = db.startups.find((s) => s.id === startupId);
  if (!startup) throw notFound('Startup not found');
  startup.status = status;
  startup.updatedAt = nowIso();
  logAudit(admin.id, 'STARTUP_STATUS_UPDATE', 'STARTUP', startupId, { status, note });
  saveDb(db);
  return startup;
}

export function listReports(input: { status?: string; page?: number; limit?: number } = {}) {
  const db = getDb();
  const items = db.reports.filter((r) => (input.status ? r.status === input.status : true));
  return paginate(items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)), input.page, input.limit);
}

export function updateReport(admin: DbUser, id: string, status: ReportStatus, resolution?: string) {
  const db = getDb();
  const report = db.reports.find((r) => r.id === id);
  if (!report) throw notFound('Report not found');
  report.status = status;
  if (resolution !== undefined) report.resolution = resolution;
  report.updatedAt = nowIso();
  logAudit(admin.id, 'REPORT_UPDATE', 'REPORT', id, { status });
  saveDb(db);
  return report;
}

export function listVerifications(input: { status?: string; level?: string; page?: number; limit?: number } = {}) {
  const db = getDb();
  const items = db.verifications.filter((v) => {
    if (input.status && v.status !== input.status) return false;
    if (input.level && v.level !== input.level) return false;
    return true;
  });
  return paginate(items, input.page, input.limit);
}

export function updateVerification(admin: DbUser, id: string, status: VerificationStatus) {
  const db = getDb();
  const ver = db.verifications.find((v) => v.id === id);
  if (!ver) throw notFound('Verification not found');
  ver.status = status;
  ver.reviewedBy = admin.id;
  ver.reviewedAt = nowIso();
  ver.updatedAt = nowIso();
  if (status === VerificationStatus.APPROVED) {
    const user = db.users.find((u) => u.id === ver.userId);
    if (user) { user.status = UserStatus.ACTIVE; user.updatedAt = nowIso(); }
  }
  logAudit(admin.id, 'VERIFICATION_UPDATE', 'VERIFICATION', id, { status });
  saveDb(db);
  return ver;
}

export function listCategories(): Category[] {
  return getDb().categories;
}

export function createCategory(admin: DbUser, input: { type: CategoryType; name: string }): Category {
  const db = getDb();
  const name = input.name.trim().toUpperCase();
  if (!name) throw notFound('Category name is required');
  if (db.categories.some((c) => c.type === input.type && c.name === name)) throw notFound('Category already exists');
  const cat: Category = {
    id: uid(), type: input.type, name, active: true, createdAt: nowIso(), updatedAt: nowIso(),
  };
  db.categories.push(cat);
  logAudit(admin.id, 'CATEGORY_CREATE', 'CATEGORY', cat.id, { type: input.type, name });
  saveDb(db);
  return cat;
}

export function listAuditEvents(input: { actorId?: string; entityType?: string; page?: number; limit?: number } = {}) {
  const db = getDb();
  const items = db.auditEvents.filter((e) => {
    if (input.actorId && e.actorId !== input.actorId) return false;
    if (input.entityType && e.entityType !== input.entityType) return false;
    return true;
  });
  return paginate(items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)), input.page, input.limit);
}