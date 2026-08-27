export const dynamic = 'force-dynamic';

import { handle, json, getCurrentUser, requireAdmin } from '@/lib/server/http';
import { listUsers } from '@/lib/server/repos/admin-repo';

export const GET = handle(async (req) => {
  const user = getCurrentUser();
  requireAdmin(user);
  const url = new URL(req.url);
  return json(listUsers({
    status: url.searchParams.get('status') ?? undefined,
    role: url.searchParams.get('role') ?? undefined,
    page: url.searchParams.get('page') ? Number(url.searchParams.get('page')) : 1,
    limit: url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : 20,
  }));
});