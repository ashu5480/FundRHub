export const dynamic = 'force-dynamic';

import { handle, json, parseBody, getCurrentUser, requireUser, forbidden } from '@/lib/server/http';
import { upsertPreferences } from '@/lib/server/repos/users-repo';
import { UserRole } from '@/lib/enums';
import { getDb } from '@/lib/server/db';

export const GET = handle(async () => {
  const user = getCurrentUser();
  const profile = getDb().investorProfiles.find((p) => p.userId === user.id);
  const prefs = profile ? getDb().investmentPreferences.find((p) => p.investorId === profile.id) : null;
  return json({ preferences: prefs ?? null });
});

export const PUT = handle(async (req) => {
  const user = getCurrentUser();
  requireUser(user);
  if (user.role !== UserRole.INVESTOR) throw forbidden('Investment preferences are for investors');
  const body = await parseBody<{ sectors: string[]; stages: string[]; geographies?: string[]; minTicket?: number; maxTicket?: number }>(req);
  const preferences = upsertPreferences(user, body);
  return json({ preferences });
});