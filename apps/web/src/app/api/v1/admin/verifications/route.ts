export const dynamic = 'force-dynamic';

import { handle, json, getCurrentUser, requireAdmin } from '@/lib/server/http';
import { listVerifications } from '@/lib/server/repos/admin-repo';

export const GET = handle(async (req) => {
  const user = getCurrentUser();
  requireAdmin(user);
  const url = new URL(req.url);
  return json(listVerifications({
    status: url.searchParams.get('status') ?? undefined,
    level: url.searchParams.get('level') ?? undefined,
    page: url.searchParams.get('page') ? Number(url.searchParams.get('page')) : 1,
    limit: url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : 20,
  }));
});