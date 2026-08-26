import { handle, json, parseBody, getCurrentUser, requireUser } from '@/lib/server/http';
import { listMessages, sendMessage } from '@/lib/server/repos/network-repo';

export const GET = handle(async (_req, { params }) => {
  const user = getCurrentUser();
  requireUser(user);
  const items = listMessages(user, params.id);
  return json({ items, pagination: { nextCursor: null, hasMore: false } });
});

export const POST = handle(async (req, { params }) => {
  const user = getCurrentUser();
  requireUser(user);
  const { body } = await parseBody<{ body: string }>(req);
  const message = sendMessage(user, params.id, body);
  return json({ message }, 201);
});