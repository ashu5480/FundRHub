import { handle, json, parseBody, getCurrentUser, requireAdmin } from '@/lib/server/http';
import { updateVerification } from '@/lib/server/repos/admin-repo';
import { VerificationStatus } from '@/lib/enums';

export const PATCH = handle(async (req, { params }) => {
  const admin = getCurrentUser();
  requireAdmin(admin);
  const { status } = await parseBody<{ status: VerificationStatus }>(req);
  const verification = updateVerification(admin, params.id, status);
  return json({ verification });
});