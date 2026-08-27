export const dynamic = 'force-dynamic';

import { handle, json, getCurrentUser, requireAdmin } from '@/lib/server/http';
import { listAuditEvents } from '@/lib/server/repos/admin-repo';

export const GET = handle(async (req) => {
  const user = getCurrentUser();
  requireAdmin(user);
  const url = new URL(req.url);
  return json(listAuditEvents({
    actorId: url.searchParams.get('actorId') ?? undefined,
    entityType: url.searchParams.get('entityType') ?? undefined,
    page: url.searchParams.get('page') ? Number(url.searchParams.get('page')) : 1,
    limit: url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : 20,
  }));
});