import { handle, json, getCurrentUser, requireAdmin } from '@/lib/server/http';
import { listReports } from '@/lib/server/repos/admin-repo';

export const GET = handle(async (req) => {
  const user = getCurrentUser();
  requireAdmin(user);
  const url = new URL(req.url);
  return json(listReports({
    status: url.searchParams.get('status') ?? undefined,
    page: url.searchParams.get('page') ? Number(url.searchParams.get('page')) : 1,
    limit: url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : 20,
  }));
});