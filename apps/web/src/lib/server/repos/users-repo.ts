import { conflict, forbidden, unauthorized } from '../http';
import { verifyPassword, hashPassword } from '../password';
import { getDb, nextId, nowIso, pushNotification, type DbUser } from '../db';
import {
  InvestorType,
  NotificationType,
  StartupStage,
  UserStatus,
  UserRole,
  VerificationLevel,
  VerificationStatus,
} from '@/lib/enums';
import type { FounderProfile, InvestmentPreference, InvestorProfile, User } from '@/lib/types';

/** Names for seeded investors that have no profile-level name field. */
const SEED_DISPLAY_NAMES: Record<string, string> = {
  'user-000': 'FundrHub Admin',
  'user-002': 'Ananya Angel',
  'user-005': 'Summit Capital',
  'user-006': 'Accelerate Team',
};

/** Best-effort display name for a user (profile name when available). */
export function displayName(user: Pick<User, 'id' | 'email'>): string {
  const db = getDb();
  const founder = db.founderProfiles.find((p) => p.userId === user.id);
  if (founder) return founder.name;
  return SEED_DISPLAY_NAMES[user.id] ?? user.email.split('@')[0];
}

/** Remove the password hash from a user record. */
export function publicUser(user: DbUser): User {
  const { passwordHash: _hash, ...rest } = user;
  return rest;
}

/** Attach founder/investor profiles (and nested preferences) to a user. Always strips secrets. */
export function attachProfiles(user: User): User {
  const db = getDb();
  const { passwordHash: _hash, ...safeUser } = user as DbUser;
  const founderProfile = db.founderProfiles.find((p) => p.userId === user.id) ?? null;
  const investorProfile = db.investorProfiles.find((p) => p.userId === user.id) ?? null;
  return { ...safeUser, founderProfile, investorProfile };
}

/** Validate an email address shape. */
function isEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Register a new user. Duplicate emails are rejected. */
export function registerUser(input: { email: string; password: string; role: UserRole }): DbUser {
  const db = getDb();
  const email = (input.email ?? '').trim().toLowerCase();
  if (!isEmail(email)) throw conflict('Please provide a valid email address');
  if (!input.password || input.password.length < 8) {
    throw conflict('Password must be at least 8 characters');
  }
  if (!Object.values(UserRole).includes(input.role)) throw conflict('Invalid role');
  if (db.users.some((u) => u.email.toLowerCase() === email)) {
    throw conflict('An account with this email already exists');
  }

  const user: DbUser = {
    id: nextId('user'),
    email,
    role: input.role,
    status: UserStatus.PENDING_VERIFICATION,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    passwordHash: hashPassword(input.password),
  };
  db.users.push(user);

  // Seed an email verification request so the verify flow can be completed.
  db.verifications.push({
    id: nextId('ver'),
    userId: user.id,
    level: VerificationLevel.EMAIL,
    status: VerificationStatus.PENDING,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });
  pushNotification(user.id, NotificationType.SYSTEM, {
    message: 'Welcome to FundrHub! Complete your profile to get discovered.',
  });
  return user;
}

/** Authenticate by email + password. */
export function loginUser(email: string, password: string): DbUser {
  const db = getDb();
  const user = db.users.find((u) => u.email.toLowerCase() === (email ?? '').trim().toLowerCase());
  if (!user || !verifyPassword(password ?? '', user.passwordHash)) {
    throw unauthorized('Invalid email or password');
  }
  if (user.status === UserStatus.SUSPENDED) {
    throw forbidden('Your account has been suspended. Contact support.');
  }
  return user;
}

/** Find a user by email (or null). */
export function findUserByEmail(email: string): User | null {
  const db = getDb();
  const found = db.users.find((u) => u.email.toLowerCase() === (email ?? '').trim().toLowerCase());
  return found ? publicUser(found) : null;
}

/** Mark the user's EMAIL verification approved and activate the account. */
export function verifyEmail(userId: string): void {
  const db = getDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return;
  user.status = UserStatus.ACTIVE;
  user.updatedAt = nowIso();
  const ver = db.verifications.find(
    (v) => v.userId === userId && v.level === VerificationLevel.EMAIL && v.status === VerificationStatus.PENDING,
  );
  if (ver) {
    ver.status = VerificationStatus.APPROVED;
    ver.reviewedAt = nowIso();
    ver.updatedAt = nowIso();
  }
  pushNotification(userId, NotificationType.SYSTEM, { message: 'Your email has been verified. Welcome aboard!' });
}

/** Set a new password for a user. */
export function resetPassword(userId: string, password: string): void {
  const db = getDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return;
  if (!password || password.length < 8) throw conflict('Password must be at least 8 characters');
  user.passwordHash = hashPassword(password);
  user.updatedAt = nowIso();
}

/** Profile completeness: share of key fields present. */
function computeFounderCompleteness(p: FounderProfile): number {
  const fields = [p.name, p.bio, p.location, p.experience, p.links && Object.keys(p.links).length > 0];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

/** Profile completeness: share of key fields present. */
function computeInvestorCompleteness(p: InvestorProfile): number {
  const fields = [p.investorType, p.bio, p.location, p.portfolioSummary];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

/** Create or update the current founder's profile. */
export function upsertFounderProfile(
  user: User,
  body: { name?: string; bio?: string; location?: string; experience?: string; links?: Record<string, string> },
): FounderProfile {
  const db = getDb();
  let profile = db.founderProfiles.find((p) => p.userId === user.id);
  if (!profile) {
    profile = {
      id: nextId('founder'),
      userId: user.id,
      name: '',
      bio: null,
      location: null,
      experience: null,
      links: null,
      completeness: 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    db.founderProfiles.push(profile);
  }
  if (body.name !== undefined) profile.name = body.name.trim();
  if (body.bio !== undefined) profile.bio = body.bio;
  if (body.location !== undefined) profile.location = body.location;
  if (body.experience !== undefined) profile.experience = body.experience;
  if (body.links !== undefined) profile.links = body.links;
  profile.completeness = computeFounderCompleteness(profile);
  profile.updatedAt = nowIso();
  return profile;
}

/** Create or update the current investor's profile. */
export function upsertInvestorProfile(
  user: User,
  body: { investorType?: string; bio?: string; location?: string; portfolioSummary?: string },
): InvestorProfile {
  const db = getDb();
  let profile = db.investorProfiles.find((p) => p.userId === user.id);
  if (!profile) {
    profile = {
      id: nextId('investor'),
      userId: user.id,
      investorType: InvestorType.ANGEL,
      bio: null,
      location: null,
      portfolioSummary: null,
      completeness: 0,
      preferences: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    db.investorProfiles.push(profile);
  }
  if (body.investorType && Object.values(InvestorType).includes(body.investorType as InvestorType)) {
    profile.investorType = body.investorType as InvestorType;
  }
  if (body.bio !== undefined) profile.bio = body.bio;
  if (body.location !== undefined) profile.location = body.location;
  if (body.portfolioSummary !== undefined) profile.portfolioSummary = body.portfolioSummary;
  profile.completeness = computeInvestorCompleteness(profile);
  profile.updatedAt = nowIso();
  return profile;
}

/** Create or update the current investor's investment preferences. */
export function upsertPreferences(
  user: User,
  body: { sectors?: string[]; stages?: string[]; geographies?: string[]; minTicket?: number; maxTicket?: number },
): InvestmentPreference {
  const db = getDb();
  const profile = db.investorProfiles.find((p) => p.userId === user.id);
  if (!profile) throw conflict('Create your investor profile first');

  let prefs = db.investmentPreferences.find((p) => p.investorId === profile.id);
  if (!prefs) {
    prefs = {
      id: nextId('pref'),
      investorId: profile.id,
      sectors: [],
      stages: [],
      geographies: null,
      minTicket: null,
      maxTicket: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    db.investmentPreferences.push(prefs);
  }
  if (body.sectors !== undefined) prefs.sectors = body.sectors;
  if (body.stages !== undefined) {
    prefs.stages = body.stages.filter((s) => Object.values(StartupStage).includes(s as StartupStage)) as StartupStage[];
  }
  if (body.geographies !== undefined) prefs.geographies = body.geographies;
  if (body.minTicket !== undefined) prefs.minTicket = body.minTicket;
  if (body.maxTicket !== undefined) prefs.maxTicket = body.maxTicket;
  prefs.updatedAt = nowIso();
  profile.preferences = prefs;
  return prefs;
}


