import { handle, json, getCurrentUser, requireUser } from '@/lib/server/http';
import { listNotifications } from '@/lib/server/repos/network-repo';

export const GET = handle(async (req) => {
  const user = getCurrentUser();
  requireUser(user);
  const url = new URL(req.url);
  let items = listNotifications(user);
  if (url.searchParams.get('unreadOnly') === 'true') items = items.filter((n) => !n.readAt);
  return json({ items, pagination: { page: 1, limit: items.length, total: items.length, totalPages: 1 } });
});