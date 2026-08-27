export const dynamic = 'force-dynamic';

import { handle, json, getCurrentUser, requireUser } from '@/lib/server/http';
import { getInvestor } from '@/lib/server/repos/startups-repo';

export const GET = handle(async (_req, { params }) => {
  const user = getCurrentUser();
  requireUser(user);
  return json({ investor: getInvestor(params.id) });
});