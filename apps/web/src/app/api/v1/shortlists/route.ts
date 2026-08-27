export const dynamic = 'force-dynamic';

import { handle, json, parseBody, getCurrentUser, requireUser } from '@/lib/server/http';
import { addShortlist, listShortlists } from '@/lib/server/repos/network-repo';

export const GET = handle(async () => {
  const user = getCurrentUser();
  requireUser(user);
  return json({ items: listShortlists(user) });
});

export const POST = handle(async (req) => {
  const user = getCurrentUser();
  requireUser(user);
  const body = await parseBody<{ startupId?: string; investorId?: string }>(req);
  const shortlist = addShortlist(user, body);
  return json({ shortlist }, 201);
});