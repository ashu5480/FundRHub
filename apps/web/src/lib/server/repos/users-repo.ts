import {
  getDb, saveDb, uid, nowIso, hashPassword, verifyPassword, DbUser,
} from '../db';
import { badRequest, conflict, notFound, unauthorized } from '../http';
import type {
  User, FounderProfile, InvestorProfile, InvestmentPreference,
} from '@/lib/types';
import { UserRole, UserStatus, VerificationLevel, VerificationStatus, InvestorType } from '@/lib/enums';

/** Attach nested profiles to a user for API responses. */
export function attachProfiles(user: DbUser): User {
  const db = getDb();
  const founderProfile = db.founderProfiles.find((p) => p.userId === user.id);
  const investorProfile = db.investorProfiles.find((p) => p.userId === user.id);
  return {
    ...user,
    founderProfile: founderProfile ?? null,
    investorProfile: investorProfile ?? null,
  };
}

export function registerUser(input: { email: string; password: string; role: UserRole }): DbUser {
  const db = getDb();
  const email = input.email.trim().toLowerCase();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw badRequest('Enter a valid email address');
  if (!input.password || input.password.length < 8) {
    throw badRequest('Password must be at least 8 characters', [{ field: 'password', message: 'Password must be at least 8 characters' }]);
  }
  if (db.users.some((u) => u.email.toLowerCase() === email)) {
    throw conflict('An account with this email already exists');
  }
  const user: DbUser = {
    id: uid(),
    email,
    role: input.role,
    status: UserStatus.PENDING_VERIFICATION,
    passwordHash: hashPassword(input.password),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  db.users.push(user);
  db.verifications.push({
    id: uid(), userId: user.id, level: VerificationLevel.EMAIL,
    status: VerificationStatus.PENDING, createdAt: nowIso(), updatedAt: nowIso(),
  });
  saveDb(db);
  return user;
}

export function loginUser(email: string, password: string): DbUser {
  const db = getDb();
  const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    throw unauthorized('Invalid email or password');
  }
  return user;
}

export function verifyEmail(userId: string): void {
  const db = getDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw notFound('User not found');
  user.status = UserStatus.ACTIVE;
  user.updatedAt = nowIso();
  const ver = db.verifications.find((v) => v.userId === userId && v.level === VerificationLevel.EMAIL);
  if (ver) {
    ver.status = VerificationStatus.APPROVED;
    ver.updatedAt = nowIso();
  }
  saveDb(db);
}

export function findUserByEmail(email: string): DbUser | undefined {
  return getDb().users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function resetPassword(userId: string, password: string): void {
  if (!password || password.length < 8) {
    throw badRequest('Password must be at least 8 characters');
  }
  const db = getDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw notFound('User not found');
  user.passwordHash = hashPassword(password);
  user.updatedAt = nowIso();
  saveDb(db);
}
/** Compute a 0-100 completeness score for a profile from filled fields. */
function completenessScore(fields: Array<string | null | undefined>): number {
  const filled = fields.filter((f) => f && String(f).trim().length > 0).length;
  return fields.length === 0 ? 0 : Math.round((filled / fields.length) * 100);
}

export function upsertFounderProfile(user: DbUser, data: {
  name?: string; bio?: string; location?: string; experience?: string; links?: Record<string, string>;
}): FounderProfile {
  const db = getDb();
  let profile = db.founderProfiles.find((p) => p.userId === user.id);
  if (!profile) {
    profile = {
      id: uid(), userId: user.id, name: '', completeness: 0, createdAt: nowIso(), updatedAt: nowIso(),
    };
    db.founderProfiles.push(profile);
  }
  if (data.name !== undefined) profile.name = data.name;
  if (data.bio !== undefined) profile.bio = data.bio;
  if (data.location !== undefined) profile.location = data.location;
  if (data.experience !== undefined) profile.experience = data.experience;
  if (data.links !== undefined) profile.links = data.links;
  profile.completeness = completenessScore([profile.name, profile.bio, profile.location, profile.experience]);
  profile.updatedAt = nowIso();
  saveDb(db);
  return profile;
}

export function upsertInvestorProfile(user: DbUser, data: {
  investorType?: string; bio?: string; location?: string; portfolioSummary?: string;
}): InvestorProfile {
  const db = getDb();
  let profile = db.investorProfiles.find((p) => p.userId === user.id);
  if (!profile) {
    profile = {
      id: uid(), userId: user.id,       investorType: InvestorType.ANGEL, completeness: 0, createdAt: nowIso(), updatedAt: nowIso(),
    };
    db.investorProfiles.push(profile);
  }
  if (data.investorType !== undefined) profile.investorType = data.investorType as InvestorProfile['investorType'];
  if (data.bio !== undefined) profile.bio = data.bio;
  if (data.location !== undefined) profile.location = data.location;
  if (data.portfolioSummary !== undefined) profile.portfolioSummary = data.portfolioSummary;
  profile.completeness = completenessScore([profile.bio, profile.location, profile.portfolioSummary]);
  profile.updatedAt = nowIso();
  saveDb(db);
  return profile;
}

export function upsertPreferences(user: DbUser, data: {
  sectors: string[]; stages: string[]; geographies?: string[]; minTicket?: number; maxTicket?: number;
}): InvestmentPreference {
  const db = getDb();
  const investor = db.investorProfiles.find((p) => p.userId === user.id);
  if (!investor) throw badRequest('Investor profile must be created before preferences');
  let prefs = db.investmentPreferences.find((p) => p.investorId === investor.id);
  if (!prefs) {
    prefs = {
      id: uid(), investorId: investor.id, sectors: [], stages: [], createdAt: nowIso(), updatedAt: nowIso(),
    };
    db.investmentPreferences.push(prefs);
  }
  if (data.sectors !== undefined) prefs.sectors = data.sectors;
  if (data.stages !== undefined) prefs.stages = data.stages as InvestmentPreference['stages'];
  if (data.geographies !== undefined) prefs.geographies = data.geographies;
  if (data.minTicket !== undefined) prefs.minTicket = data.minTicket;
  if (data.maxTicket !== undefined) prefs.maxTicket = data.maxTicket;
  prefs.updatedAt = nowIso();
  saveDb(db);
  return prefs;
}