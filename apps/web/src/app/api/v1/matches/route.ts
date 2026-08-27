export const dynamic = 'force-dynamic';

import { handle, json, parseBody, getCurrentUser, requireUser } from '@/lib/server/http';
import { computeMatches } from '@/lib/server/repos/matching';
import { UserRole } from '@/lib/enums';

export const POST = handle(async (req) => {
  const user = getCurrentUser();
  requireUser(user);
  const body = await parseBody<{ targetType?: 'STARTUP' | 'INVESTOR'; filters?: { sector?: string; stage?: string } }>(req);
  const type = body.targetType ?? (user.role === UserRole.INVESTOR ? 'STARTUP' : 'INVESTOR');
  const items = computeMatches(user, type, body.filters);
  return json({ items, targetType: type });
});