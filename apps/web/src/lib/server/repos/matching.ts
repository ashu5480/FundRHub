import { getDb } from '../db';
import { displayName } from './users-repo';
import { MatchFactor, StartupStatus } from '@/lib/enums';
import type {
  InvestmentPreference,
  InvestorProfile,
  MatchReason,
  MatchResult,
  Startup,
  User,
} from '@/lib/types';

/** Match weights per the PRD: sector 30, stage 20, ticket 20, geo 10, biz model 10, other 10. */
export const MATCH_WEIGHTS = {
  SECTOR: 30,
  STAGE: 20,
  TICKET_SIZE: 20,
  GEOGRAPHY: 10,
  BUSINESS_MODEL: 10,
  OTHER: 10,
} as const;

/** Map a free-form location string to a geography bucket. */
function geographyOf(location?: string | null): string {
  const loc = (location ?? '').toLowerCase();
  if (loc.includes('india')) return 'INDIA';
  if (loc.includes('singapore') || loc.includes('asia')) return 'SOUTHEAST_ASIA';
  if (loc.includes('dubai') || loc.includes('middle')) return 'MIDDLE_EAST';
  if (loc.includes('usa') || loc.includes('america') || loc.includes('york')) return 'NORTH_AMERICA';
  if (loc.includes('europe') || loc.includes('london') || loc.includes('uk')) return 'EUROPE';
  return 'GLOBAL';
}

/** Ticket size overlap between an amount and the investor's range. */
function ticketMatches(prefs: InvestmentPreference | null | undefined, amount: number): boolean {
  if (!prefs) return false;
  const min = prefs.minTicket ?? 0;
  const max = prefs.maxTicket ?? Number.MAX_SAFE_INTEGER;
  return amount >= min && amount <= max;
}

/** Build a reason row. */
function reason(factor: MatchFactor, weight: number, matched: boolean, label: string): MatchReason {
  return { factor, weight, matched, label };
}

/** Score a startup against an investor's preferences. */
function scoreStartupForInvestor(startup: Startup, prefs: InvestmentPreference | null): MatchResult<Startup> {
  const reasons: MatchReason[] = [];

  const sectorMatched = !!prefs?.sectors?.includes(startup.sector);
  reasons.push(reason(MatchFactor.SECTOR, MATCH_WEIGHTS.SECTOR, sectorMatched, `Sector: ${startup.sector}`));

  const stageMatched = !!prefs?.stages?.includes(startup.stage);
  reasons.push(reason(MatchFactor.STAGE, MATCH_WEIGHTS.STAGE, stageMatched, `Stage: ${startup.stage}`));

  const amount = startup.amountSought ?? startup.fundingRound?.amountSought ?? 0;
  const ticketMatched = amount > 0 && ticketMatches(prefs, amount);
  reasons.push(reason(MatchFactor.TICKET_SIZE, MATCH_WEIGHTS.TICKET_SIZE, ticketMatched, 'Ticket size'));

  const geoMatched = !prefs?.geographies?.length
    ? false
    : prefs.geographies.includes(geographyOf(startup.location)) || prefs.geographies.includes('GLOBAL');
  reasons.push(reason(MatchFactor.GEOGRAPHY, MATCH_WEIGHTS.GEOGRAPHY, geoMatched, `Geography: ${startup.location ?? 'Unknown'}`));

  const modelMatched = !!startup.businessModel;
  reasons.push(reason(MatchFactor.BUSINESS_MODEL, MATCH_WEIGHTS.BUSINESS_MODEL, modelMatched, 'Business model defined'));

  const depth = [startup.problem, startup.solution, (startup.teamMembers?.length ?? 0) > 0, (startup.pitchDecks?.length ?? 0) > 0]
    .filter(Boolean).length;
  const otherMatched = depth >= 3;
  reasons.push(reason(MatchFactor.OTHER, MATCH_WEIGHTS.OTHER, otherMatched, 'Profile depth'));

  const score = reasons.reduce((sum, r) => sum + (r.matched ? r.weight : 0), 0);
  return { target: startup, score, reasons };
}

/** Score an investor against a founder's startup. */
function scoreInvestorForStartup(investor: InvestorProfile, startup: Startup): MatchResult<InvestorProfile> {
  const prefs = investor.preferences ?? null;
  const reasons: MatchReason[] = [];

  const sectorMatched = !!prefs?.sectors?.includes(startup.sector);
  reasons.push(reason(MatchFactor.SECTOR, MATCH_WEIGHTS.SECTOR, sectorMatched, `Interested in ${startup.sector}`));

  const stageMatched = !!prefs?.stages?.includes(startup.stage);
  reasons.push(reason(MatchFactor.STAGE, MATCH_WEIGHTS.STAGE, stageMatched, `Invests at ${startup.stage} stage`));

  const amount = startup.amountSought ?? startup.fundingRound?.amountSought ?? 0;
  const ticketMatched = amount > 0 && ticketMatches(prefs, amount);
  reasons.push(reason(MatchFactor.TICKET_SIZE, MATCH_WEIGHTS.TICKET_SIZE, ticketMatched, 'Ticket size'));

  const geoMatched = !prefs?.geographies?.length
    ? false
    : prefs.geographies.includes(geographyOf(startup.location)) || prefs.geographies.includes('GLOBAL');
  reasons.push(reason(MatchFactor.GEOGRAPHY, MATCH_WEIGHTS.GEOGRAPHY, geoMatched, `Geography: ${startup.location ?? 'Unknown'}`));

  const modelMatched = !!startup.businessModel;
  reasons.push(reason(MatchFactor.BUSINESS_MODEL, MATCH_WEIGHTS.BUSINESS_MODEL, modelMatched, 'Business model defined'));

  const otherMatched = !!investor.portfolioSummary;
  reasons.push(reason(MatchFactor.OTHER, MATCH_WEIGHTS.OTHER, otherMatched, 'Track record shared'));

  const score = reasons.reduce((sum, r) => sum + (r.matched ? r.weight : 0), 0);
  return { target: investor, score, reasons };
}

export interface MatchFilters {
  sector?: string;
  stage?: string;
}

/**
 * Compute explainable matches for the current user.
 * - Investors are matched with PUBLISHED startups.
 * - Founders are matched with investor profiles (based on their primary startup).
 */
export function computeMatches(
  user: User,
  targetType: 'STARTUP' | 'INVESTOR',
  filters?: MatchFilters,
): MatchResult<Startup | InvestorProfile>[] {
  const db = getDb();

  if (targetType === 'STARTUP') {
    const prefs = db.investorProfiles.find((p) => p.userId === user.id)?.preferences ?? null;
    let startups = db.startups.filter((s) => s.status === StartupStatus.PUBLISHED);
    if (filters?.sector) startups = startups.filter((s) => s.sector.toLowerCase() === filters.sector!.toLowerCase());
    if (filters?.stage) startups = startups.filter((s) => s.stage === filters.stage);

    return startups
      .map((s) => scoreStartupForInvestor(s, prefs))
      .sort((a, b) => b.score - a.score);
  }

  // Founder → investors. Anchored on the founder's primary startup.
  const myStartups = db.startups.filter((s) => s.ownerUserId === user.id);
  const anchor = myStartups.find((s) => s.status === StartupStatus.PUBLISHED) ?? myStartups[0];
  if (!anchor) return [];

  const investors = [...db.investorProfiles];
  return investors
    .map((inv) => scoreInvestorForStartup(inv, anchor))
    .sort((a, b) => b.score - a.score);
}


