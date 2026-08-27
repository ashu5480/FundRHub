import { badRequest, conflict, notFound } from '../http';
import { getDb, nextId, nowIso, paginate, pushNotification, recordAudit, type DbUser } from '../db';
import { displayName } from './users-repo';
import { enrichStartup } from './startups-repo';
import { CategoryType, NotificationType, StartupStatus, UserStatus, VerificationStatus } from '@/lib/enums';
import type {
  AuditEvent,
  Category,
  PaginatedResponse,
  Report,
  Startup,
  User,
  Verification,
} from '@/lib/types';

/** Strip secrets and attach profiles for admin user listings. */
function enrichUser(u: DbUser): User {
  const db = getDb();
  const { passwordHash: _hash, ...rest } = u;
  return {
    ...rest,
    founderProfile: db.founderProfiles.find((p) => p.userId === u.id) ?? null,
    investorProfile: db.investorProfiles.find((p) => p.userId === u.id) ?? null,
  };
}

export interface ListUsersQuery {
  status?: string;
  role?: string;
  page?: number;
  limit?: number;
}

/** List platform users (admin only). */
export function listUsers(query: ListUsersQuery): PaginatedResponse<User> {
  const db = getDb();
  let items = [...db.users];
  if (query.status) items = items.filter((u) => u.status === query.status);
  if (query.role) items = items.filter((u) => u.role === query.role);
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return paginate(items.map(enrichUser), query.page, query.limit);
}

/** Activate or suspend a user account. */
export function setUserStatus(admin: User, id: string, status: UserStatus, reason?: string): User {
  const db = getDb();
  const user = db.users.find((u) => u.id === id);
  if (!user) throw notFound('User not found');
  if (!Object.values(UserStatus).includes(status)) throw badRequest('Invalid user status');
  if (user.id === admin.id) throw conflict('You cannot change your own status');

  user.status = status;
  user.updatedAt = nowIso();
  recordAudit(admin.id, 'USER_STATUS_UPDATED', 'USER', user.id, { status, reason: reason ?? null });
  if (status === UserStatus.SUSPENDED) {
    pushNotification(user.id, NotificationType.SYSTEM, {
      message: reason
        ? `Your account has been suspended: ${reason}`
        : 'Your account has been suspended. Contact support for details.',
    });
  } else if (status === UserStatus.ACTIVE) {
    pushNotification(user.id, NotificationType.SYSTEM, { message: 'Your account has been re-activated.' });
  }
  return enrichUser(user);
}

/** Approve, reject or suspend a startup listing. Notifies the owner. */
export function setStartupStatus(admin: User, id: string, status: StartupStatus, note?: string): Startup {
  const db = getDb();
  const startup = db.startups.find((s) => s.id === id);
  if (!startup) throw notFound('Startup not found');
  if (!Object.values(StartupStatus).includes(status)) throw badRequest('Invalid startup status');
  if (startup.status === status) throw conflict('Startup is already in this status');
  if (status === StartupStatus.DRAFT) throw badRequest('Use the owner-facing update flow to return a listing to draft');

  startup.status = status;
  startup.updatedAt = nowIso();
  recordAudit(admin.id, 'STARTUP_STATUS_UPDATED', 'STARTUP', startup.id, { status, note: note ?? null });

  const message = status === StartupStatus.PUBLISHED
    ? `Your startup ${startup.name} has been approved and published.`
    : status === StartupStatus.REJECTED
      ? `Your startup ${startup.name} was rejected${note ? `: ${note}` : '.'}`
      : `Your startup ${startup.name} has been suspended${note ? `: ${note}` : '.'}`;
  pushNotification(startup.ownerUserId, NotificationType.SYSTEM, { message, startupId: startup.id });
  return enrichStartup(startup);
}

export interface ListReportsQuery {
  status?: string;
  page?: number;
  limit?: number;
}

/** Attach the reporter's display name for admin tables. */
function enrichReport(r: Report): Report {
  const db = getDb();
  const reporter = db.users.find((u) => u.id === r.reporterId);
  return { ...r, reporterName: reporter ? displayName(reporter) : undefined } as Report;
}

/** List abuse reports (admin only). */
export function listReports(query: ListReportsQuery): PaginatedResponse<Report> {
  const db = getDb();
  let items = [...db.reports];
  if (query.status) items = items.filter((r) => r.status === query.status);
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return paginate(items.map(enrichReport), query.page, query.limit);
}

/** Resolve, dismiss or progress a report. */
export function updateReport(admin: User, id: string, status: Report['status'], resolution?: string): Report {
  const db = getDb();
  const report = db.reports.find((r) => r.id === id);
  if (!report) throw notFound('Report not found');
  report.status = status;
  if (resolution !== undefined) report.resolution = resolution;
  report.updatedAt = nowIso();
  recordAudit(admin.id, 'REPORT_UPDATED', 'REPORT', report.id, { status, resolution: resolution ?? null });
  return enrichReport(report);
}

export interface ListVerificationsQuery {
  status?: string;
  level?: string;
  page?: number;
  limit?: number;
}

/** Attach requester info for admin tables. */
function enrichVerification(v: Verification): Verification {
  const db = getDb();
  const user = db.users.find((u) => u.id === v.userId);
  return {
    ...v,
    userEmail: user?.email,
    userName: user ? displayName(user) : undefined,
  } as Verification;
}

/** List verification requests (admin only). */
export function listVerifications(query: ListVerificationsQuery): PaginatedResponse<Verification> {
  const db = getDb();
  let items = [...db.verifications];
  if (query.status) items = items.filter((v) => v.status === query.status);
  if (query.level) items = items.filter((v) => v.level === query.level);
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return paginate(items.map(enrichVerification), query.page, query.limit);
}

/** Approve or reject a verification request. Approving EMAIL also activates the user. */
export function updateVerification(admin: User, id: string, status: VerificationStatus): Verification {
  const db = getDb();
  const verification = db.verifications.find((v) => v.id === id);
  if (!verification) throw notFound('Verification request not found');
  if (!Object.values(VerificationStatus).includes(status)) throw badRequest('Invalid verification status');
  if (verification.status !== VerificationStatus.PENDING && verification.status !== VerificationStatus.EXPIRED) {
    throw conflict('This verification request has already been reviewed');
  }

  verification.status = status;
  verification.reviewedBy = admin.id;
  verification.reviewedAt = nowIso();
  verification.updatedAt = nowIso();

  if (status === VerificationStatus.APPROVED && verification.level === 'EMAIL') {
    const user = db.users.find((u) => u.id === verification.userId);
    if (user && user.status === UserStatus.PENDING_VERIFICATION) {
      user.status = UserStatus.ACTIVE;
      user.updatedAt = nowIso();
    }
  }
  recordAudit(admin.id, 'VERIFICATION_REVIEWED', 'VERIFICATION', verification.id, {
    level: verification.level,
    status,
  });
  pushNotification(verification.userId, NotificationType.SYSTEM, {
    message: status === VerificationStatus.APPROVED
      ? `Your ${verification.level} verification was approved.`
      : `Your ${verification.level} verification was rejected.`,
  });
  return enrichVerification(verification);
}

/** List taxonomy categories. */
export function listCategories(): Category[] {
  const db = getDb();
  return [...db.categories].sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
}

/** Create a taxonomy category (admin only). */
export function createCategory(admin: User, body: { type: CategoryType; name: string }): Category {
  const db = getDb();
  if (!Object.values(CategoryType).includes(body.type)) throw badRequest('Invalid category type');
  const name = (body.name ?? '').trim();
  if (!name) throw badRequest('Category name is required');
  if (db.categories.some((c) => c.type === body.type && c.name.toLowerCase() === name.toLowerCase())) {
    throw conflict('A category with this name already exists');
  }
  const now = nowIso();
  const category: Category = {
    id: nextId('cat'),
    type: body.type,
    name: name,
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  db.categories.push(category);
  recordAudit(admin.id, 'CATEGORY_CREATED', 'CATEGORY', category.id, { type: category.type, name });
  return category;
}

export interface ListAuditEventsQuery {
  actorId?: string;
  entityType?: string;
  page?: number;
  limit?: number;
}

/** List the audit trail (admin only), newest first. */
export function listAuditEvents(query: ListAuditEventsQuery): PaginatedResponse<AuditEvent> {
  const db = getDb();
  let items = [...db.auditEvents];
  if (query.actorId) items = items.filter((e) => e.actorId === query.actorId);
  if (query.entityType) items = items.filter((e) => e.entityType === query.entityType);
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return paginate(items, query.page, query.limit);
}

