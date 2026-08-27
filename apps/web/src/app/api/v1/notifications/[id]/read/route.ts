export const dynamic = 'force-dynamic';

import { handle, json, getCurrentUser, requireUser } from '@/lib/server/http';
import { markNotificationRead } from '@/lib/server/repos/network-repo';

export const PATCH = handle(async (_req, { params }) => {
  const user = getCurrentUser();
  requireUser(user);
  const notification = markNotificationRead(user, params.id);
  return json({ notification });
});