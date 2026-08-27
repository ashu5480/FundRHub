export const dynamic = 'force-dynamic';

import { handle, json, getCurrentUser, requireUser } from '@/lib/server/http';
import { submitStartup } from '@/lib/server/repos/startups-repo';

export const POST = handle(async (_req, { params }) => {
  const user = getCurrentUser();
  requireUser(user);
  return json({ startup: submitStartup(user, params.id) });
});