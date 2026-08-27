export const dynamic = 'force-dynamic';

import { handle, json, parseBody, getCurrentUser, requireAdmin } from '@/lib/server/http';
import { setUserStatus } from '@/lib/server/repos/admin-repo';
import { UserStatus } from '@/lib/enums';

export const PATCH = handle(async (req, { params }) => {
  const admin = getCurrentUser();
  requireAdmin(admin);
  const { status, reason } = await parseBody<{ status: UserStatus; reason?: string }>(req);
  const user = setUserStatus(admin, params.id, status, reason);
  return json({ user });
});