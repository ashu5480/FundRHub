import { handle, json, getCurrentUser, requireUser } from '@/lib/server/http';
import { removeShortlist } from '@/lib/server/repos/network-repo';

export const DELETE = handle(async (_req, { params }) => {
  const user = getCurrentUser();
  requireUser(user);
  removeShortlist(user, params.id);
  return json({}, 204);
});