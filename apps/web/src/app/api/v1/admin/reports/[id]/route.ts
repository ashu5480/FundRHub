import { handle, json, parseBody, getCurrentUser, requireAdmin } from '@/lib/server/http';
import { updateReport } from '@/lib/server/repos/admin-repo';
import { ReportStatus } from '@/lib/enums';

export const PATCH = handle(async (req, { params }) => {
  const admin = getCurrentUser();
  requireAdmin(admin);
  const { status, resolution } = await parseBody<{ status: ReportStatus; resolution?: string }>(req);
  const report = updateReport(admin, params.id, status, resolution);
  return json({ report });
});