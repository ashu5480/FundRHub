export const dynamic = 'force-dynamic';

import { handle, json, parseBody, getCurrentUser, requireUser, forbidden } from '@/lib/server/http';
import { upsertFounderProfile } from '@/lib/server/repos/users-repo';
import { UserRole } from '@/lib/enums';
import { getDb } from '@/lib/server/db';

export const GET = handle(async () => {
  const user = getCurrentUser();
  const profile = getDb().founderProfiles.find((p) => p.userId === user.id);
  return json({ founderProfile: profile ?? null });
});

export const PUT = handle(async (req) => {
  const user = getCurrentUser();
  requireUser(user);
  if (user.role !== UserRole.FOUNDER) throw forbidden('Founder profile required');
  const body = await parseBody<{ name?: string; bio?: string; location?: string; experience?: string; links?: Record<string, string> }>(req);
  const founderProfile = upsertFounderProfile(user, body);
  return json({ founderProfile });
});