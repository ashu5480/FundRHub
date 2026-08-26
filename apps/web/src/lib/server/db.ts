import fs from 'fs';
import path from 'path';
import { randomUUID, scryptSync, randomBytes, timingSafeEqual } from 'crypto';

import type {
  User, FounderProfile, InvestorProfile, InvestmentPreference, Startup,
  Shortlist, ConnectionRequest, Conversation, Message, Notification,
  Report, Verification, AuditEvent, Category,
} from '@/lib/types';
import { UserRole, UserStatus, InvestorType, StartupStage } from '@/lib/enums';
import {
  currentUser, investorUser, mockStartups, mockInvestors, mockConnections,
  mockConversations, mockMessages, mockNotifications, SECTOR_OPTIONS,
} from '@/lib/data';

/** User record with server-side hash (never exposed to the API). */
export interface DbUser extends User {
  passwordHash?: string;
}

export interface Session {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface DbShape {
  users: DbUser[];
  founderProfiles: FounderProfile[];
  investorProfiles: InvestorProfile[];
  investmentPreferences: InvestmentPreference[];
  startups: Startup[];
  shortlists: Shortlist[];
  connectionRequests: ConnectionRequest[];
  conversations: Conversation[];
  messages: Message[];
  notifications: Notification[];
  reports: Report[];
  verifications: Verification[];
  categories: Category[];
  sessions: Session[];
  auditEvents: AuditEvent[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

export const uid = (): string => randomUUID();
export const nowIso = (): string => new Date().toISOString();

/** Hash a password with a random salt (scrypt). */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const key = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${key}`;
}

/** Verify a plaintext password against a stored hash. */
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(':');
  if (!salt || !key) return false;
  const actual = Buffer.from(key, 'hex');
  const expected = scryptSync(password, salt, 64);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function emptyDb(): DbShape {
  return {
    users: [], founderProfiles: [], investorProfiles: [], investmentPreferences: [],
    startups: [], shortlists: [], connectionRequests: [], conversations: [],
    messages: [], notifications: [], reports: [], verifications: [],
    categories: [], sessions: [], auditEvents: [],
  };
}

function seedDb(): DbShape {
  const db = emptyDb();
  const passwordHash = hashPassword('password123');
  const makeUser = (id: string, email: string, role: UserRole, status: UserStatus): DbUser => ({
    id, email, role, status, passwordHash, createdAt: nowIso(), updatedAt: nowIso(),
  });

  const founder = { ...currentUser, passwordHash };
  const investor = { ...investorUser, passwordHash };
  db.users.push(
    founder,
    investor,
    makeUser('user-003', 'rahul@healthnow.com', UserRole.FOUNDER, UserStatus.ACTIVE),
    makeUser('user-004', 'ananya@logiswift.com', UserRole.FOUNDER, UserStatus.ACTIVE),
    makeUser('user-005', 'summit@cap.com', UserRole.INVESTOR, UserStatus.ACTIVE),
    makeUser('user-006', 'caseed@accelerator.co', UserRole.INVESTOR, UserStatus.ACTIVE),
    makeUser('user-admin', 'admin@fundrhub.com', UserRole.ADMIN, UserStatus.ACTIVE),
  );

  if (founder.founderProfile) db.founderProfiles.push(founder.founderProfile);

  for (const inv of mockInvestors) {
    const { preferences, ...profile } = inv as InvestorProfile & { preferences: InvestmentPreference };
    db.investorProfiles.push(JSON.parse(JSON.stringify(profile)));
    if (preferences) {
      db.investmentPreferences.push({
        ...preferences, investorId: profile.id,
        sectors: preferences.sectors ?? [], stages: preferences.stages ?? [],
      });
    }
  }
  const invPref = investorUser.investorProfile?.preferences;
  if (investorUser.investorProfile && invPref) {
    db.investmentPreferences.push({ ...invPref, investorId: investorUser.investorProfile.id });
  }

  for (const s of mockStartups) db.startups.push(JSON.parse(JSON.stringify(s)));
  db.connectionRequests = mockConnections.map((c) => ({ ...c }));
  db.conversations = mockConversations.map((c) => ({ ...c, lastMessage: null }));
  for (const key of Object.keys(mockMessages)) {
    for (const m of mockMessages[key] ?? []) db.messages.push({ ...m });
  }
  db.notifications = mockNotifications.map((n) => ({ ...n }));

  for (const name of SECTOR_OPTIONS) {
    db.categories.push({ id: uid(), type: 'SECTOR', name, active: true, createdAt: nowIso(), updatedAt: nowIso() });
  }
  for (const stage of Object.values(StartupStage)) {
    db.categories.push({ id: uid(), type: 'STAGE', name: stage, active: true, createdAt: nowIso(), updatedAt: nowIso() });
  }
  for (const type of Object.values(InvestorType)) {
    db.categories.push({ id: uid(), type: 'INVESTOR_TYPE', name: type, active: true, createdAt: nowIso(), updatedAt: nowIso() });
  }
  return db;
}

let cache: DbShape | null = null;

/** Load (and seed if missing) the database. */
export function getDb(): DbShape {
  if (cache) return cache;
  if (fs.existsSync(DB_PATH)) {
    cache = JSON.parse(fs.readFileSync(DB_PATH, 'utf8')) as DbShape;
    return cache;
  }
  cache = seedDb();
  saveDb(cache);
  return cache;
}

/** Persist the in-memory database to disk. */
export function saveDb(db?: DbShape): void {
  if (db) cache = db;
  if (!cache) return;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(cache, null, 2), 'utf8');
}

export function resetDb(): DbShape {
  cache = seedDb();
  saveDb();
  return cache;
}