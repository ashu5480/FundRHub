import { getDb, DbUser } from '../db';
import type { MatchReason, MatchResult } from '@/lib/types';
import { UserRole, StartupStatus, StartupStage } from '@/lib/enums';

/** Documented matching weights (docs/architecture/api-design.md §11). */
export const MATCH_WEIGHTS = {
  SECTOR: 30,
  STAGE: 20,
  TICKET_SIZE: 20,
  GEOGRAPHY: 10,
  BUSINESS_MODEL: 10,
  OTHER: 10,
} as const;

function geoOf(location?: string | null): string | null {
  if (!location) return null;
  const l = location.toLowerCase();
  if (l.includes('india')) return 'INDIA';
  if (l.includes('singapore') || l.includes('vietnam') || l.includes('indonesia') || l.includes('thailand')) return 'SOUTHEAST_ASIA';
  if (l.includes('uae') || l.includes('dubai') || l.includes('saudi')) return 'MIDDLE_EAST';
  if (l.includes('usa') || l.includes('canada')) return 'NORTH_AMERICA';
  if (l.includes('europe') || l.includes('germany')) return 'EUROPE';
  return null;
}

function geoMatch(location: string | null | undefined, geographies?: string[] | null): boolean {
  if (!geographies || geographies.length === 0) return true;
  if (geographies.includes('GLOBAL')) return true;
  const g = geoOf(location);
  return g ? geographies.includes(g) : false;
}

export interface FounderContext {
  sector?: string;
  stage?: StartupStage;
  amountSought?: number;
  location?: string;
  businessModel?: string;
}

function founderContext(user: DbUser): FounderContext | null {
  const db = getDb();
  const startup = db.startups.find(
    (s) => s.ownerUserId === user.id && s.status === StartupStatus.PUBLISHED,
  );
  if (!startup) return null;
  return {
    sector: startup.sector,
    stage: startup.stage,
        amountSought: startup.amountSought ?? startup.fundingRound?.amountSought,
    location: startup.location ?? undefined,
    businessModel: startup.businessModel ?? undefined,
  };
}

function scoreAgainstInvestor(ctx: FounderContext, investor: {
  id: string; name: string; location?: string; bio?: string;
  sectors: string[]; stages: string[]; geographies?: string[] | null;
  minTicket?: number | null; maxTicket?: number | null; portfolioSummary?: string;
}): MatchResult<typeof investor> {
  const sectorMatched = ctx.sector ? investor.sectors.includes(ctx.sector) : false;
  const stageMatched = ctx.stage ? investor.stages.includes(ctx.stage as string) : false;
  const ticket = ctx.amountSought ?? 0;
  const ticketMatched = ticket > 0
    ? ticket >= (investor.minTicket ?? 0) && ticket <= (investor.maxTicket ?? Infinity)
    : false;
  const geo = geoMatch(ctx.location, investor.geographies);
  const bm = !!ctx.businessModel && !!investor.portfolioSummary;

  const reasons: MatchReason[] = [
    { factor: 'SECTOR', weight: MATCH_WEIGHTS.SECTOR, matched: sectorMatched, label: 'Sector match' },
    { factor: 'STAGE', weight: MATCH_WEIGHTS.STAGE, matched: stageMatched, label: 'Stage preference matches' },
    { factor: 'TICKET_SIZE', weight: MATCH_WEIGHTS.TICKET_SIZE, matched: ticketMatched, label: 'Ticket size fits' },
    { factor: 'GEOGRAPHY', weight: MATCH_WEIGHTS.GEOGRAPHY, matched: geo, label: 'Geography matches' },
    { factor: 'BUSINESS_MODEL', weight: MATCH_WEIGHTS.BUSINESS_MODEL, matched: bm, label: 'Business model interest' },
    { factor: 'OTHER', weight: MATCH_WEIGHTS.OTHER, matched: true, label: 'Overall profile fit' },
  ];
  const score = reasons.filter((r) => r.matched).reduce((sum, r) => sum + r.weight, 0);
  return { target: investor, score, reasons };
}
function scoreAgainstStartup(ctx: {
  sectors: string[]; stages: string[]; geographies?: string[] | null;
  minTicket?: number | null; maxTicket?: number | null; portfolioSummary?: string;
}, startup: {
  id: string; name: string; sector: string; stage: StartupStage; location?: string | null;
  businessModel?: string | null; amountSought?: number | null; description: string;
}): MatchResult<typeof startup> {
  const sectorMatched = ctx.sectors.includes(startup.sector);
  const stageMatched = ctx.stages.includes(startup.stage as string);
  const ticket = startup.amountSought ?? 0;
  const ticketMatched = ticket > 0
    ? ticket >= (ctx.minTicket ?? 0) && ticket <= (ctx.maxTicket ?? Infinity)
    : false;
  const geo = geoMatch(startup.location, ctx.geographies);
  const bm = !!startup.businessModel && !!ctx.portfolioSummary;

  const reasons: MatchReason[] = [
    { factor: 'SECTOR', weight: MATCH_WEIGHTS.SECTOR, matched: sectorMatched, label: 'Sector match' },
    { factor: 'STAGE', weight: MATCH_WEIGHTS.STAGE, matched: stageMatched, label: 'Stage preference matches' },
    { factor: 'TICKET_SIZE', weight: MATCH_WEIGHTS.TICKET_SIZE, matched: ticketMatched, label: 'Ticket size fits' },
    { factor: 'GEOGRAPHY', weight: MATCH_WEIGHTS.GEOGRAPHY, matched: geo, label: 'Geography matches' },
    { factor: 'BUSINESS_MODEL', weight: MATCH_WEIGHTS.BUSINESS_MODEL, matched: bm, label: 'Business model interest' },
    { factor: 'OTHER', weight: MATCH_WEIGHTS.OTHER, matched: true, label: 'Overall profile fit' },
  ];
  const score = reasons.filter((r) => r.matched).reduce((sum, r) => sum + r.weight, 0);
  return { target: startup, score, reasons };
}

/** Compute matches for the current user. */
export function computeMatches(
  user: DbUser,
  targetType?: 'STARTUP' | 'INVESTOR',
  filters?: { sector?: string; stage?: string },
) {
  const db = getDb();
  const type = targetType ?? (user.role === UserRole.INVESTOR ? 'STARTUP' : 'INVESTOR');

  if (type === 'INVESTOR') {
    const ctx = founderContext(user);
    if (!ctx) return [];
    const items = db.investorProfiles.map((inv) => {
      const prefs = db.investmentPreferences.find((p) => p.investorId === inv.id);
      return {
        id: inv.id,
        name: inv.bio?.split(' ').slice(0, 2).join(' ') ?? 'Investor',
        location: inv.location ?? undefined,
        bio: inv.bio ?? undefined,
        sectors: prefs?.sectors ?? [],
        stages: prefs?.stages ?? [],
        geographies: prefs?.geographies ?? null,
        minTicket: prefs?.minTicket ?? null,
        maxTicket: prefs?.maxTicket ?? null,
        portfolioSummary: inv.portfolioSummary ?? undefined,
      };
    });
    return items
      .map((inv) => scoreAgainstInvestor(ctx, inv))
      .filter((m) => {
        if (filters?.sector && !m.target.sectors.includes(filters.sector)) return false;
        if (filters?.stage && !m.target.stages.includes(filters.stage as string)) return false;
        return true;
      })
      .sort((a, b) => b.score - a.score);
  }

  const investorProfile = db.investorProfiles.find((p) => p.userId === user.id);
  if (!investorProfile) return [];
  const prefs = db.investmentPreferences.find((p) => p.investorId === investorProfile.id);
  const ctx = {
    sectors: prefs?.sectors ?? [],
    stages: prefs?.stages ?? [],
    geographies: prefs?.geographies ?? null,
    minTicket: prefs?.minTicket ?? null,
    maxTicket: prefs?.maxTicket ?? null,
    portfolioSummary: investorProfile.portfolioSummary ?? undefined,
  };
  return db.startups
    .filter((s) => s.status === StartupStatus.PUBLISHED)
    .map((s) => scoreAgainstStartup(ctx, s))
    .filter((m) => {
      if (filters?.sector && m.target.sector !== filters.sector) return false;
      if (filters?.stage && m.target.stage !== filters.stage) return false;
      return true;
    })
    .sort((a, b) => b.score - a.score);
}