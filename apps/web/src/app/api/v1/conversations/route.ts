import { handle, json, getCurrentUser, requireUser } from '@/lib/server/http';
import { listConversations } from '@/lib/server/repos/network-repo';

export const GET = handle(async () => {
  const user = getCurrentUser();
  requireUser(user);
  return json({ items: listConversations(user) });
});