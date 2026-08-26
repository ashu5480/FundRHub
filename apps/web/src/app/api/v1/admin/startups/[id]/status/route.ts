import { handle, json, parseBody, getCurrentUser, requireAdmin } from '@/lib/server/http';
import { setStartupStatus } from '@/lib/server/repos/admin-repo';
import { StartupStatus } from '@/lib/enums';

export const PATCH = handle(async (req, { params }) => {
  const admin = getCurrentUser();
  requireAdmin(admin);
  const { status, note } = await parseBody<{ status: StartupStatus; note?: string }>(req);
  const startup = setStartupStatus(admin, params.id, status, note);
  return json({ startup });
});