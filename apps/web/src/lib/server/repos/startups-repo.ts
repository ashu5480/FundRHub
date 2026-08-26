import fs from 'fs';
import path from 'path';
import { getDb, saveDb, uid, nowIso, DbUser } from '../db';
import { badRequest, conflict, forbidden, notFound } from '../http';
import type { Startup, PitchDeck, FundingRound, StartupTeamMember, StartupMetric } from '@/lib/types';
import { StartupStatus, DeckStatus, VerificationStatus } from '@/lib/enums';
import { slugify } from '@/lib/utils';

export interface StartupListInput {
  q?: string; sector?: string; stage?: string; location?: string;
  minAmount?: number; maxAmount?: number; status?: string; ownerUserId?: string;
  page?: number; limit?: number;
}

export function paginate<T>(items: T[], page = 1, limit = 20) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return {
    items: items.slice((safePage - 1) * limit, safePage * limit),
    pagination: { page: safePage, limit, total, totalPages },
  };
}

export function listStartups(input: StartupListInput = {}) {
  const db = getDb();
  const q = input.q?.toLowerCase().trim() ?? '';
  let items = db.startups.filter((s) => {
    if (input.ownerUserId && s.ownerUserId !== input.ownerUserId) return false;
    if (input.status && s.status !== input.status) return false;
    if (input.sector && s.sector !== input.sector) return false;
    if (input.stage && s.stage !== input.stage) return false;
    if (input.location && !(s.location ?? '').toLowerCase().includes(input.location.toLowerCase())) return false;
    if (input.minAmount !== undefined && (s.amountSought ?? 0) < input.minAmount) return false;
    if (input.maxAmount !== undefined && (s.amountSought ?? 0) > input.maxAmount) return false;
    if (q && !(`${s.name} ${s.description} ${s.sector}`).toLowerCase().includes(q)) return false;
    return true;
  });
  items = items.sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
  return paginate<Startup>(items, input.page, input.limit);
}

export function getStartup(id: string): Startup {
  const startup = getDb().startups.find((s) => s.id === id);
  if (!startup) throw notFound('Startup not found');
  return startup;
}

function roundFrom(body: Record<string, unknown>): FundingRound | undefined {
  const f = body.fundingRound as Partial<FundingRound> | undefined;
  if (!f) return undefined;
  return {
    id: uid(),
    startupId: '',
    amountSought: Number(f.amountSought ?? 0),
    valuation: f.valuation !== undefined ? Number(f.valuation) : undefined,
    equityOffered: f.equityOffered !== undefined ? Number(f.equityOffered) : undefined,
    useOfFunds: f.useOfFunds,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}

export function createStartup(user: DbUser, body: Record<string, unknown>): Startup {
  const db = getDb();
  const name = String(body.name ?? '').trim();
  if (!name) throw badRequest('Startup name is required', [{ field: 'name', message: 'Startup name is required' }]);
  if (!body.sector) throw badRequest('Sector is required');
  if (!body.stage) throw badRequest('Stage is required');
  if (db.startups.some((s) => s.slug === slugify(name))) throw conflict('A startup with this name already exists');

  const id = uid();
  const round = roundFrom(body);
  const startup: Startup = {
    id,
    ownerUserId: user.id,
    name,
    slug: slugify(name),
    description: String(body.description ?? ''),
    problem: body.problem ? String(body.problem) : undefined,
    solution: body.solution ? String(body.solution) : undefined,
    sector: String(body.sector),
    stage: String(body.stage) as Startup['stage'],
    location: body.location ? String(body.location) : undefined,
    businessModel: body.businessModel ? String(body.businessModel) : undefined,
    status: StartupStatus.DRAFT,
    owner: { id: user.id, name: user.founderProfile?.name ?? user.email },
    fundingRound: round,
    teamMembers: (body.teamMembers as StartupTeamMember[] | undefined)?.length
      ? (body.teamMembers as StartupTeamMember[]).map((m) => ({
          id: uid(), startupId: id, name: m.name, role: m.role, bio: m.bio, profileLink: m.profileLink,
        }))
      : undefined,
    metrics: (body.metrics as StartupMetric[] | undefined)?.length
      ? (body.metrics as StartupMetric[]).map((m) => ({ ...m, id: m.id ?? uid(), startupId: id }))
      : undefined,
    amountSought: round?.amountSought,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  if (round) round.startupId = id;
  db.startups.push(startup);
  saveDb(db);
  return startup;
}

export function updateStartup(user: DbUser, id: string, body: Record<string, unknown>): Startup {
  const db = getDb();
  const startup = db.startups.find((s) => s.id === id);
  if (!startup) throw notFound('Startup not found');
  if (startup.ownerUserId !== user.id) throw forbidden('Only the owner can edit this startup');
  const updatable = ['name', 'description', 'problem', 'solution', 'sector', 'stage', 'location', 'businessModel'] as const;
  for (const key of updatable) {
        if (body[key] !== undefined) (startup as unknown as Record<string, unknown>)[key] = body[key];
  }
  if (body.name) startup.slug = slugify(String(body.name));
  startup.updatedAt = nowIso();
  saveDb(db);
  return startup;
}

export function submitStartup(user: DbUser, id: string): Startup {
  const db = getDb();
  const startup = db.startups.find((s) => s.id === id);
  if (!startup) throw notFound('Startup not found');
  if (startup.ownerUserId !== user.id) throw forbidden('Only the owner can submit this startup');
  startup.status = StartupStatus.PENDING_REVIEW;
  startup.updatedAt = nowIso();
  saveDb(db);
  return startup;
}
const DECK_DIR = path.join(process.cwd(), '.data', 'decks');

export function addPitchDeck(user: DbUser, startupId: string, fileName: string, buffer: Buffer, version?: number): PitchDeck {
  const db = getDb();
  const startup = db.startups.find((s) => s.id === startupId);
  if (!startup) throw notFound('Startup not found');
  if (startup.ownerUserId !== user.id) throw forbidden('Only the owner can upload a pitch deck');
  if (!/\.(pdf|ppt|pptx)$/i.test(fileName)) throw badRequest('Only PDF or PPT/PPTX files are allowed');

  const id = uid();
  const safeName = fileName.replace(/[^\w.\- ]/g, '_');
  if (!fs.existsSync(DECK_DIR)) fs.mkdirSync(DECK_DIR, { recursive: true });
  fs.writeFileSync(path.join(DECK_DIR, id), buffer);

  const deck: PitchDeck = {
    id,
    startupId,
    objectKey: id,
    fileName: safeName,
    version: version ?? (startup.pitchDecks?.length ?? 0) + 1,
        status: DeckStatus.ACTIVE,
    uploadedAt: nowIso(),
  };
  startup.pitchDecks = [...(startup.pitchDecks ?? []), deck];
  saveDb(db);
  return deck;
}

export function listPitchDecks(user: DbUser, startupId: string): PitchDeck[] {
  const db = getDb();
  const startup = db.startups.find((s) => s.id === startupId);
  if (!startup) throw notFound('Startup not found');
  const isOwner = startup.ownerUserId === user.id;
  if (!isOwner && user.role !== 'ADMIN') throw forbidden('Pitch decks are private');
  return startup.pitchDecks ?? [];
}

export function getDeckBuffer(deckId: string): { deck: PitchDeck; buffer: Buffer } {
  const db = getDb();
  const deck = db.startups.flatMap((s) => s.pitchDecks ?? []).find((d) => d.id === deckId);
  if (!deck) throw notFound('Pitch deck not found');
  const file = path.join(DECK_DIR, deck.objectKey);
  if (!fs.existsSync(file)) throw notFound('Pitch deck file missing');
  return { deck, buffer: fs.readFileSync(file) };
}

export interface InvestorListItem {
  id: string; name: string; investorType: string; bio?: string; location?: string;
  portfolioSummary?: string; sectors: string[]; stages: string[];
  geographies?: string[] | null; minTicket?: number | null; maxTicket?: number | null;
  verificationStatus: string; completeness: number;
}

export function investorName(inv: { bio?: string | null; location?: string | null }): string {
  const words = (inv.bio ?? '').split(' ').filter(Boolean);
  return words.slice(0, 2).join(' ') || inv.location || 'Investor';
}

export function listInvestors(input: {
  q?: string; sector?: string; stage?: string; location?: string;
  investorType?: string; minTicket?: number; maxTicket?: number; page?: number; limit?: number;
} = {}) {
  const db = getDb();
  const q = input.q?.toLowerCase().trim() ?? '';
  const items: InvestorListItem[] = db.investorProfiles.map((inv) => {
    const prefs = db.investmentPreferences.find((p) => p.investorId === inv.id);
    const verification = db.verifications.find(
      (v) => v.userId === inv.userId && v.status === VerificationStatus.APPROVED,
    );
    return {
      id: inv.id,
      name: investorName(inv),
      investorType: inv.investorType,
      bio: inv.bio ?? undefined,
      location: inv.location ?? undefined,
      portfolioSummary: inv.portfolioSummary ?? undefined,
      sectors: prefs?.sectors ?? [],
      stages: prefs?.stages ?? [],
      geographies: prefs?.geographies ?? null,
      minTicket: prefs?.minTicket ?? null,
      maxTicket: prefs?.maxTicket ?? null,
      verificationStatus: verification ? 'APPROVED' : 'PENDING',
      completeness: inv.completeness,
    };
  });

  const filtered = items.filter((it) => {
    if (input.sector && !it.sectors.includes(input.sector)) return false;
    if (input.stage && !it.stages.includes(input.stage)) return false;
    if (input.investorType && it.investorType !== input.investorType) return false;
    if (input.location && !(it.location ?? '').toLowerCase().includes(input.location.toLowerCase())) return false;
    if (input.minTicket !== undefined && (it.maxTicket ?? Infinity) < input.minTicket) return false;
    if (input.maxTicket !== undefined && (it.minTicket ?? 0) > input.maxTicket) return false;
    if (q && !(`${it.name} ${it.bio ?? ''} ${it.sectors.join(' ')}`).toLowerCase().includes(q)) return false;
    return true;
  });
  return paginate<InvestorListItem>(filtered, input.page, input.limit);
}

export function getInvestor(id: string): InvestorListItem {
  const result = listInvestors({});
  const item = result.items.find((i) => i.id === id);
  if (!item) throw notFound('Investor not found');
  return item;
}