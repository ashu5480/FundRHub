import { badRequest, conflict, forbidden, notFound } from '../http';
import { getDb, nextId, nowIso, paginate, recordAudit } from '../db';
import { displayName } from './users-repo';
import { ConnectionStatus, DeckStatus, StartupStage, StartupStatus } from '@/lib/enums';
import { slugify } from '@/lib/utils';
import type {
  FundingRound,
  InvestorProfile,
  PaginatedResponse,
  PitchDeck,
  Startup,
  StartupTeamMember,
  User,
} from '@/lib/types';

export interface ListStartupsQuery {
  q?: string;
  sector?: string;
  stage?: string;
  location?: string;
  minAmount?: number;
  maxAmount?: number;
  status?: string;
  ownerUserId?: string;
  page?: number;
  limit?: number;
}

/** Compute the effective amount sought for a startup. */
function amountSought(s: Startup): number {
  return s.amountSought ?? s.fundingRound?.amountSought ?? 0;
}

/** Attach owner + derived fields for API output. */
export function enrichStartup(s: Startup): Startup {
  const db = getDb();
  const owner = db.users.find((u) => u.id === s.ownerUserId);
  return {
    ...s,
    owner: owner ? { id: owner.id, name: displayName(owner) } : undefined,
    amountSought: amountSought(s),
  };
}

/** Can this user see a non-published startup? */
function canViewDraft(user: User, s: Startup): boolean {
  return s.ownerUserId === user.id || user.role === 'ADMIN';
}

/** True when the user has an ACCEPTED connection touching this startup. */
function hasAcceptedConnection(userId: string, startupId: string): boolean {
  const db = getDb();
  return db.connectionRequests.some(
    (c) => c.status === ConnectionStatus.ACCEPTED && c.startupId === startupId
      && (c.senderId === userId || c.recipientId === userId),
  );
}

/** Search + filter + paginate startups. Defaults to PUBLISHED listings. */
export function listStartups(query: ListStartupsQuery): PaginatedResponse<Startup> {
  const db = getDb();
  let items = [...db.startups];

  if (query.status && query.status !== 'ALL') {
    items = items.filter((s) => s.status === query.status);
  } else if (!query.status) {
    items = items.filter((s) => s.status === StartupStatus.PUBLISHED);
  }
  if (query.ownerUserId) items = items.filter((s) => s.ownerUserId === query.ownerUserId);
  if (query.q) {
    const q = query.q.toLowerCase();
    items = items.filter(
      (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q),
    );
  }
  if (query.sector) items = items.filter((s) => s.sector.toLowerCase() === query.sector!.toLowerCase());
  if (query.stage) items = items.filter((s) => s.stage === query.stage);
  if (query.location) {
    const loc = query.location.toLowerCase();
    items = items.filter((s) => (s.location ?? '').toLowerCase().includes(loc));
  }
  if (query.minAmount !== undefined) items = items.filter((s) => amountSought(s) >= query.minAmount!);
  if (query.maxAmount !== undefined) items = items.filter((s) => amountSought(s) <= query.maxAmount!);

  items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return paginate(items.map(enrichStartup), query.page, query.limit);
}

/** Create a startup owned by the current founder. */
export function createStartup(
  user: User,
  body: {
    name?: string;
    description?: string;
    problem?: string;
    solution?: string;
    sector?: string;
    stage?: string;
    location?: string;
    businessModel?: string;
    fundingRound?: { amountSought?: number; valuation?: number; equityOffered?: number; useOfFunds?: string };
    teamMembers?: Array<{ name: string; role: string; bio?: string; profileLink?: string }>;
  },
): Startup {
  const db = getDb();
  if (!body.name || !body.name.trim()) throw badRequest('Startup name is required');
  if (!body.description || !body.description.trim()) throw badRequest('Description is required');
  if (!body.sector) throw badRequest('Sector is required');
  if (!body.stage || !Object.values(StartupStage).includes(body.stage as StartupStage)) {
    throw badRequest('A valid stage is required');
  }

  // Build a unique slug.
  const base = slugify(body.name);
  let slug = base || nextId('startup');
  let n = 2;
  while (db.startups.some((s) => s.slug === slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }

  const now = nowIso();
  const startup: Startup = {
    id: nextId('startup'),
    ownerUserId: user.id,
    name: body.name.trim(),
    slug,
    description: body.description.trim(),
    problem: body.problem ?? null,
    solution: body.solution ?? null,
    sector: body.sector,
    stage: body.stage as Startup['stage'],
    location: body.location ?? null,
    businessModel: body.businessModel ?? null,
    status: StartupStatus.DRAFT,
    createdAt: now,
    updatedAt: now,
    fundingRound: null,
    teamMembers: [],
    metrics: [],
    pitchDecks: [],
    matchScore: null,
  };
  if (body.fundingRound?.amountSought) {
    startup.fundingRound = {
      id: nextId('round'),
      startupId: startup.id,
      amountSought: body.fundingRound.amountSought,
      valuation: body.fundingRound.valuation ?? null,
      equityOffered: body.fundingRound.equityOffered ?? null,
      useOfFunds: body.fundingRound.useOfFunds ?? null,
      createdAt: now,
      updatedAt: now,
    } satisfies FundingRound;
    startup.amountSought = body.fundingRound.amountSought;
  }
  if (body.teamMembers?.length) {
    startup.teamMembers = body.teamMembers.map((m) => ({
      id: nextId('member'),
      startupId: startup.id,
      name: m.name,
      role: m.role,
      bio: m.bio ?? null,
      profileLink: m.profileLink ?? null,
    })) as StartupTeamMember[];
  }
  db.startups.push(startup);
  recordAudit(user.id, 'STARTUP_CREATED', 'STARTUP', startup.id, { name: startup.name });
  return enrichStartup(startup);
}

/** Get one startup (drafts visible to owner/admin only). */
export function getStartup(id: string, user?: User): Startup {
  const db = getDb();
  const startup = db.startups.find((s) => s.id === id);
  if (!startup) throw notFound('Startup not found');
  if (startup.status !== StartupStatus.PUBLISHED && user && !canViewDraft(user, startup)) {
    throw notFound('Startup not found');
  }
  return enrichStartup(startup);
}

/** Update a startup (owner or admin). Rejected startups return to draft. */
export function updateStartup(
  user: User,
  id: string,
  body: {
    name?: string;
    description?: string;
    problem?: string;
    solution?: string;
    sector?: string;
    stage?: string;
    location?: string;
    businessModel?: string;
    fundingRound?: { amountSought?: number; valuation?: number; equityOffered?: number; useOfFunds?: string };
    teamMembers?: Array<{ name: string; role: string; bio?: string; profileLink?: string }>;
  },
): Startup {
  const db = getDb();
  const startup = db.startups.find((s) => s.id === id);
  if (!startup) throw notFound('Startup not found');
  if (startup.ownerUserId !== user.id && user.role !== 'ADMIN') {
    throw forbidden('Only the startup owner can update it');
  }

  if (body.name !== undefined && body.name.trim()) {
    startup.name = body.name.trim();
    startup.slug = slugify(startup.name) || startup.slug;
  }
  if (body.description !== undefined && body.description.trim()) startup.description = body.description.trim();
  if (body.problem !== undefined) startup.problem = body.problem;
  if (body.solution !== undefined) startup.solution = body.solution;
  if (body.sector !== undefined) startup.sector = body.sector;
  if (body.stage !== undefined && Object.values(StartupStage).includes(body.stage as StartupStage)) {
    startup.stage = body.stage as Startup['stage'];
  }
  if (body.location !== undefined) startup.location = body.location;
  if (body.businessModel !== undefined) startup.businessModel = body.businessModel;
  if (body.fundingRound) {
    const fr = startup.fundingRound ?? {
      id: nextId('round'),
      startupId: startup.id,
      amountSought: 0,
      valuation: null,
      equityOffered: null,
      useOfFunds: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    if (body.fundingRound.amountSought !== undefined) fr.amountSought = body.fundingRound.amountSought;
    if (body.fundingRound.valuation !== undefined) fr.valuation = body.fundingRound.valuation;
    if (body.fundingRound.equityOffered !== undefined) fr.equityOffered = body.fundingRound.equityOffered;
    if (body.fundingRound.useOfFunds !== undefined) fr.useOfFunds = body.fundingRound.useOfFunds;
    fr.updatedAt = nowIso();
    startup.fundingRound = fr;
    startup.amountSought = fr.amountSought;
  }
  if (body.teamMembers) {
    startup.teamMembers = body.teamMembers.map((m) => ({
      id: nextId('member'),
      startupId: startup.id,
      name: m.name,
      role: m.role,
      bio: m.bio ?? null,
      profileLink: m.profileLink ?? null,
    })) as StartupTeamMember[];
  }

  // Editing a rejected listing re-opens it as a draft for another review cycle.
  if (startup.status === StartupStatus.REJECTED) {
    startup.status = StartupStatus.DRAFT;
  }
  startup.updatedAt = nowIso();
  return enrichStartup(startup);
}

/** Submit a draft (or rejected) startup for admin review. */
export function submitStartup(user: User, id: string): Startup {
  const db = getDb();
  const startup = db.startups.find((s) => s.id === id);
  if (!startup) throw notFound('Startup not found');
  if (startup.ownerUserId !== user.id && user.role !== 'ADMIN') {
    throw forbidden('Only the startup owner can submit it for review');
  }
  if (startup.status !== StartupStatus.DRAFT && startup.status !== StartupStatus.REJECTED) {
    throw conflict('Only draft or rejected startups can be submitted for review');
  }
  startup.status = StartupStatus.PENDING_REVIEW;
  startup.updatedAt = nowIso();
  recordAudit(user.id, 'STARTUP_SUBMITTED', 'STARTUP', startup.id, { name: startup.name });
  return enrichStartup(startup);
}

/** List pitch decks for a startup (owner, admin or connected users only). */
export function listPitchDecks(user: User, startupId: string): PitchDeck[] {
  const db = getDb();
  const startup = db.startups.find((s) => s.id === startupId);
  if (!startup) throw notFound('Startup not found');
  const allowed = startup.ownerUserId === user.id
    || user.role === 'ADMIN'
    || hasAcceptedConnection(user.id, startup.id);
  if (!allowed) throw forbidden('Connect with the startup to access its pitch decks');
  return [...(startup.pitchDecks ?? [])].sort((a, b) => b.version - a.version);
}

/** Upload a new pitch deck version (owner only). Previous ACTIVE decks are archived. */
export function addPitchDeck(
  user: User,
  startupId: string,
  fileName: string,
  buffer: Buffer,
  version?: number,
): PitchDeck {
  const db = getDb();
  const startup = db.startups.find((s) => s.id === startupId);
  if (!startup) throw notFound('Startup not found');
  if (startup.ownerUserId !== user.id) throw forbidden('Only the startup owner can upload pitch decks');

  const decks = startup.pitchDecks ?? [];
  const nextVersion = version && version > 0 ? version : Math.max(0, ...decks.map((d) => d.version)) + 1;
  decks.forEach((d) => {
    if (d.status === DeckStatus.ACTIVE) d.status = DeckStatus.ARCHIVED;
  });
  const deck: PitchDeck = {
    id: nextId('deck'),
    startupId,
    objectKey: `startups/${startupId}/decks/${nextId('deck')}/${fileName}`,
    fileName,
    version: nextVersion,
    status: DeckStatus.ACTIVE,
    uploadedAt: nowIso(),
  };
  decks.push(deck);
  startup.pitchDecks = decks;
  db.deckBuffers[deck.id] = buffer;
  startup.updatedAt = nowIso();
  recordAudit(user.id, 'PITCH_DECK_UPLOADED', 'STARTUP', startupId, { fileName, version: nextVersion });
  return deck;
}

/** Get the stored buffer for a deck (or throw 404). */
export function getDeckBuffer(deckId: string): { buffer: Buffer } {
  const db = getDb();
  const buffer = db.deckBuffers[deckId];
  if (!buffer) throw notFound('Pitch deck file not found');
  return { buffer };
}

export interface ListInvestorsQuery {
  q?: string;
  sector?: string;
  stage?: string;
  location?: string;
  investorType?: string;
  minTicket?: number;
  maxTicket?: number;
  page?: number;
  limit?: number;
}

/** Attach the underlying user display name for card rendering. */
function enrichInvestor(p: InvestorProfile): InvestorProfile {
  const db = getDb();
  const user = db.users.find((u) => u.id === p.userId);
  return { ...p, userName: user ? displayName(user) : undefined } as InvestorProfile;
}

/** Search + filter + paginate investor profiles. */
export function listInvestors(query: ListInvestorsQuery): PaginatedResponse<InvestorProfile> {
  const db = getDb();
  let items = [...db.investorProfiles];

  if (query.q) {
    const q = query.q.toLowerCase();
    items = items.filter(
      (p) => (p.bio ?? '').toLowerCase().includes(q) || (p.portfolioSummary ?? '').toLowerCase().includes(q),
    );
  }
  if (query.sector) {
    const sector = query.sector.toLowerCase();
    items = items.filter((p) => (p.preferences?.sectors ?? []).some((s) => s.toLowerCase() === sector));
  }
  if (query.stage) items = items.filter((p) => (p.preferences?.stages ?? []).includes(query.stage as never));
  if (query.location) {
    const loc = query.location.toLowerCase();
    items = items.filter((p) => (p.location ?? '').toLowerCase().includes(loc));
  }
  if (query.investorType) items = items.filter((p) => p.investorType === query.investorType);
  if (query.minTicket !== undefined) {
    items = items.filter((p) => (p.preferences?.maxTicket ?? 0) >= query.minTicket!);
  }
  if (query.maxTicket !== undefined) {
    items = items.filter((p) => (p.preferences?.minTicket ?? Number.MAX_SAFE_INTEGER) <= query.maxTicket!);
  }

  items.sort((a, b) => b.completeness - a.completeness);
  return paginate(items.map(enrichInvestor), query.page, query.limit);
}

/** Get one investor profile (or throw 404). */
export function getInvestor(id: string): InvestorProfile {
  const db = getDb();
  const profile = db.investorProfiles.find((p) => p.id === id);
  if (!profile) throw notFound('Investor not found');
  return enrichInvestor(profile);
}




