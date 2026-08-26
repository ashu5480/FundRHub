import { handle, json, parseBody, getCurrentUser, requireUser, forbidden } from '@/lib/server/http';
import { upsertInvestorProfile } from '@/lib/server/repos/users-repo';
import { UserRole } from '@/lib/enums';
import { getDb } from '@/lib/server/db';

export const GET = handle(async () => {
  const user = getCurrentUser();
  const profile = getDb().investorProfiles.find((p) => p.userId === user.id);
  return json({ investorProfile: profile ?? null });
});

export const PUT = handle(async (req) => {
  const user = getCurrentUser();
  requireUser(user);
  if (user.role !== UserRole.INVESTOR) throw forbidden('Investor profile required');
  const body = await parseBody<{ investorType?: string; bio?: string; location?: string; portfolioSummary?: string }>(req);
  const investorProfile = upsertInvestorProfile(user, body);
  return json({ investorProfile });
});