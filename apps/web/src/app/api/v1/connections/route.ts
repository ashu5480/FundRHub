export const dynamic = 'force-dynamic';

import { handle, json, parseBody, getCurrentUser, requireUser } from '@/lib/server/http';
import { createConnection, listConnections } from '@/lib/server/repos/network-repo';

export const GET = handle(async (req) => {
  const user = getCurrentUser();
  requireUser(user);
  const url = new URL(req.url);
  return json({
    items: listConnections(user, {
      status: url.searchParams.get('status') ?? undefined,
      direction: url.searchParams.get('direction') ?? undefined,
    }),
  });
});

export const POST = handle(async (req) => {
  const user = getCurrentUser();
  requireUser(user);
  const body = await parseBody<{ recipientId: string; startupId?: string; message?: string }>(req);
  const connection = createConnection(user, body);
  return json({ connection }, 201);
});