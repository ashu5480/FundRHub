import {
  CategoryType,
  ConnectionStatus,
  DeckStatus,
  InvestorType,
  MessageStatus,
  MetricType,
  MetricVisibility,
  NotificationType,
  StartupStage,
  StartupStatus,
  UserRole,
  UserStatus,
  VerificationLevel,
  VerificationStatus,
} from '@/lib/enums';
import type {
  AuditEvent,
  Category,
  ConnectionRequest,
  Conversation,
  FounderProfile,
  InvestmentPreference,
  InvestorProfile,
  Message,
  Notification,
  Report,
  Shortlist,
  Startup,
  User,
  Verification,
} from '@/lib/types';
import {
  mockConnections,
  mockConversations,
  mockInvestors,
  mockMessages,
  mockNotifications,
  mockStartups,
  SECTOR_OPTIONS,
} from '@/lib/data';

import { hashPassword } from './password';

/** Demo password used for every seeded account (documented on the login page). */
export const DEMO_PASSWORD = 'password123';

/** Internal user record — extends the public user with the password hash. */
export interface DbUser extends User {
  passwordHash: string;
}

/** The demo database. Backed by mock data; in-memory and reset on server restart. */
export interface Db {
  users: DbUser[];
  founderProfiles: FounderProfile[];
  investorProfiles: InvestorProfile[];
  investmentPreferences: InvestmentPreference[];
  startups: Startup[];
  connectionRequests: ConnectionRequest[];
  conversations: Conversation[];
  messages: Message[];
  notifications: Notification[];
  shortlists: Shortlist[];
  reports: Report[];
  verifications: Verification[];
  auditEvents: AuditEvent[];
  categories: Category[];
  /** Pitch deck file contents keyed by deck id (object storage stand-in). */
  deckBuffers: Record<string, Buffer>;
}

let idCounter = 0;

/** Generate a unique, readable id for a new entity. */
export function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}`;
}

/** Current ISO timestamp. */
export function nowIso(): string {
  return new Date().toISOString();
}

/** Build a paginated response envelope. */
export function paginate<T>(items: T[], page = 1, limit = 20) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return {
    items: items.slice((safePage - 1) * limit, safePage * limit),
    pagination: { page: safePage, limit, total, totalPages },
  };
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** A tiny but valid PDF used as the seeded demo pitch deck content. */
const DEMO_PDF = [
  '%PDF-1.4',
  '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj',
  '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj',
  '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj',
  'trailer<</Root 1 0 R>>',
  '%%EOF',
].join('\n');

function createDb(): Db {
  const passwordHash = hashPassword(DEMO_PASSWORD);
  const users: DbUser[] = [
    { id: 'user-000', email: 'admin@fundrhub.com', role: UserRole.ADMIN, status: UserStatus.ACTIVE, createdAt: '2025-01-05T09:00:00Z', updatedAt: '2025-08-01T09:00:00Z', passwordHash },
    { id: 'user-001', email: 'founder@fundrhub.com', role: UserRole.FOUNDER, status: UserStatus.ACTIVE, createdAt: '2025-01-10T10:00:00Z', updatedAt: '2025-06-15T14:30:00Z', passwordHash },
    { id: 'user-002', email: 'investor@fundrhub.com', role: UserRole.INVESTOR, status: UserStatus.ACTIVE, createdAt: '2025-02-01T09:00:00Z', updatedAt: '2025-07-10T11:00:00Z', passwordHash },
    { id: 'user-003', email: 'rahul@healthnow.in', role: UserRole.FOUNDER, status: UserStatus.ACTIVE, createdAt: '2025-04-10T09:00:00Z', updatedAt: '2025-07-20T10:00:00Z', passwordHash },
    { id: 'user-004', email: 'ananya@logiswift.io', role: UserRole.FOUNDER, status: UserStatus.ACTIVE, createdAt: '2025-04-28T09:00:00Z', updatedAt: '2025-08-05T10:00:00Z', passwordHash },
    { id: 'user-005', email: 'summit@capital.vc', role: UserRole.INVESTOR, status: UserStatus.ACTIVE, createdAt: '2025-01-18T09:00:00Z', updatedAt: '2025-07-15T11:00:00Z', passwordHash },
    { id: 'user-006', email: 'team@accelerate.sg', role: UserRole.INVESTOR, status: UserStatus.ACTIVE, createdAt: '2025-03-10T09:00:00Z', updatedAt: '2025-06-20T11:00:00Z', passwordHash },
  ];

  const founderProfiles: FounderProfile[] = [
    {
      id: 'founder-001', userId: 'user-001', name: 'Ashutosh Singh',
      bio: 'Serial entrepreneur building FundrHub. 10+ years in SaaS and marketplace products.',
      location: 'Bengaluru, India',
      experience: 'Founded 2 startups. Previously led product at a fintech unicorn.',
      links: { linkedin: 'https://linkedin.com/in/ashutosh', twitter: 'https://twitter.com/ashutosh' },
      completeness: 85, createdAt: '2025-01-10T10:00:00Z', updatedAt: '2025-06-15T14:30:00Z',
    },
    {
      id: 'founder-002', userId: 'user-003', name: 'Rahul Verma',
      bio: 'Healthcare entrepreneur on a mission to make preventive care accessible.',
      location: 'Delhi, India',
      experience: 'Ex-PharmEasy. Built consumer health products at scale.',
      links: { linkedin: 'https://linkedin.com/in/rahulverma' },
      completeness: 80, createdAt: '2025-04-10T09:00:00Z', updatedAt: '2025-07-20T10:00:00Z',
    },
    {
      id: 'founder-003', userId: 'user-004', name: 'Ananya Patel',
      bio: 'Logistics operator turned founder, optimizing last-mile delivery with AI.',
      location: 'Hyderabad, India',
      experience: 'Ex-Flipkart supply chain lead.',
      links: { linkedin: 'https://linkedin.com/in/ananyapatel' },
      completeness: 75, createdAt: '2025-04-28T09:00:00Z', updatedAt: '2025-08-05T10:00:00Z',
    },
  ];

  const investmentPreferences: InvestmentPreference[] = clone(mockInvestors).map((p) => p.preferences!);
  const investorProfiles: InvestorProfile[] = clone(mockInvestors);

  const startups: Startup[] = clone(mockStartups);
  startups[0].pitchDecks = [
    {
      id: 'deck-001',
      startupId: 'startup-001',
      objectKey: 'startups/startup-001/decks/deck-001/fundrhub-seed-deck.pdf',
      fileName: 'fundrhub-seed-deck.pdf',
      version: 1,
      status: DeckStatus.ACTIVE,
      uploadedAt: '2025-06-01T10:00:00Z',
    },
  ];

  const connectionRequests: ConnectionRequest[] = clone(mockConnections).map((c) => ({
    ...c,
    sender: undefined,
    recipient: undefined,
    startup: undefined,
  })) as ConnectionRequest[];

  const conversations: Conversation[] = clone(mockConversations).map((c) => ({
    id: c.id,
    connectionRequestId: c.connectionRequestId,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  })) as Conversation[];

  const messages: Message[] = Object.values(mockMessages).flat().map((m) => clone(m));

  const notifications: Notification[] = [
    ...clone(mockNotifications),
    {
      id: 'notif-101', userId: 'user-002', type: NotificationType.CONNECTION_REQUEST,
      payload: { connectionId: 'conn-002', senderName: 'Ashutosh Singh' },
      readAt: '2025-07-15T12:00:00Z', createdAt: '2025-07-15T10:00:00Z',
    },
    {
      id: 'notif-102', userId: 'user-005', type: NotificationType.CONNECTION_REQUEST,
      payload: { connectionId: 'conn-001', senderName: 'Summit Capital' },
      createdAt: '2025-08-10T09:00:00Z',
    },
  ];

  const shortlists: Shortlist[] = [
    { id: 'sl-001', ownerUserId: 'user-002', startupId: 'startup-001', investorId: null, createdAt: '2025-07-20T10:00:00Z', updatedAt: '2025-07-20T10:00:00Z' },
    { id: 'sl-002', ownerUserId: 'user-002', startupId: 'startup-003', investorId: null, createdAt: '2025-08-02T10:00:00Z', updatedAt: '2025-08-02T10:00:00Z' },
    { id: 'sl-003', ownerUserId: 'user-001', startupId: null, investorId: 'investor-002', createdAt: '2025-08-06T10:00:00Z', updatedAt: '2025-08-06T10:00:00Z' },
  ];

  const reports: Report[] = [
    {
      id: 'rep-001', reporterId: 'user-003', targetType: 'USER' as never, targetId: 'user-005',
      reason: 'Sent repeated unsolicited messages after I declined to connect.',
      status: 'OPEN' as never, resolution: null, createdAt: '2025-08-13T10:00:00Z', updatedAt: '2025-08-13T10:00:00Z',
    },
    {
      id: 'rep-002', reporterId: 'user-004', targetType: 'STARTUP' as never, targetId: 'startup-002',
      reason: 'This listing appears to duplicate an existing registered company.',
      status: 'IN_REVIEW' as never, resolution: null, createdAt: '2025-08-14T10:00:00Z', updatedAt: '2025-08-14T10:00:00Z',
    },
  ];

  const verifications: Verification[] = [
    { id: 'ver-001', userId: 'user-001', level: VerificationLevel.EMAIL, status: VerificationStatus.PENDING, reviewedBy: null, reviewedAt: null, createdAt: '2025-01-10T10:00:00Z', updatedAt: '2025-01-10T10:00:00Z' },
    { id: 'ver-002', userId: 'user-002', level: VerificationLevel.EMAIL, status: VerificationStatus.APPROVED, reviewedBy: 'user-000', reviewedAt: '2025-02-02T09:00:00Z', createdAt: '2025-02-01T09:00:00Z', updatedAt: '2025-02-02T09:00:00Z' },
    { id: 'ver-003', userId: 'user-003', level: VerificationLevel.BUSINESS, status: VerificationStatus.PENDING, reviewedBy: null, reviewedAt: null, createdAt: '2025-08-01T09:00:00Z', updatedAt: '2025-08-01T09:00:00Z' },
  ];

  const auditEvents: AuditEvent[] = [
    { id: 'audit-001', actorId: 'user-000', action: 'STARTUP_STATUS_UPDATED', entityType: 'STARTUP', entityId: 'startup-001', metadata: { status: StartupStatus.PUBLISHED }, createdAt: '2025-06-02T09:00:00Z' },
    { id: 'audit-002', actorId: 'user-000', action: 'VERIFICATION_REVIEWED', entityType: 'VERIFICATION', entityId: 'ver-002', metadata: { status: VerificationStatus.APPROVED }, createdAt: '2025-02-02T09:00:00Z' },
    { id: 'audit-003', actorId: null, action: 'SEED', entityType: 'SYSTEM', entityId: 'bootstrap', metadata: { note: 'Demo data seeded' }, createdAt: '2025-01-05T09:00:00Z' },
  ];

  const categories: Category[] = [
    ...SECTOR_OPTIONS.map((name, i) => ({ id: `cat-sector-${i + 1}`, type: CategoryType.SECTOR, name, active: true, createdAt: '2025-01-05T09:00:00Z', updatedAt: '2025-01-05T09:00:00Z' })),
    ...Object.values(StartupStage).map((name, i) => ({ id: `cat-stage-${i + 1}`, type: CategoryType.STAGE, name, active: true, createdAt: '2025-01-05T09:00:00Z', updatedAt: '2025-01-05T09:00:00Z' })),
    ...Object.values(InvestorType).map((name, i) => ({ id: `cat-invtype-${i + 1}`, type: CategoryType.INVESTOR_TYPE, name, active: true, createdAt: '2025-01-05T09:00:00Z', updatedAt: '2025-01-05T09:00:00Z' })),
  ];

  return {
    users, founderProfiles, investorProfiles, investmentPreferences, startups,
    connectionRequests, conversations, messages, notifications, shortlists,
    reports, verifications, auditEvents, categories,
    deckBuffers: { 'deck-001': Buffer.from(DEMO_PDF, 'utf8') },
  };
}

const globalForDb = globalThis as unknown as { __fundrHubDb?: Db };

/** Get (or lazily create) the demo database singleton. */
export function getDb(): Db {
  if (!globalForDb.__fundrHubDb) {
    globalForDb.__fundrHubDb = createDb();
  }
  return globalForDb.__fundrHubDb;
}

/** Create an in-app notification for a user. */
export function pushNotification(userId: string, type: NotificationType, payload: Record<string, unknown>): void {
  const db = getDb();
  db.notifications.unshift({
    id: nextId('notif'),
    userId,
    type,
    payload,
    readAt: null,
    createdAt: nowIso(),
  });
}

/** Record an audit trail entry. */
export function recordAudit(
  actorId: string | null,
  action: string,
  entityType: string,
  entityId: string,
  metadata?: Record<string, unknown>,
): void {
  const db = getDb();
  db.auditEvents.unshift({
    id: nextId('audit'),
    actorId,
    action,
    entityType,
    entityId,
    metadata: metadata ?? null,
    createdAt: nowIso(),
  });
}


// Re-export enums so repo modules can import a single db module when convenient.
export {
  CategoryType,
  ConnectionStatus,
  DeckStatus,
  InvestorType,
  MessageStatus,
  MetricType,
  MetricVisibility,
  NotificationType,
  StartupStage,
  StartupStatus,
  UserRole,
  UserStatus,
};

