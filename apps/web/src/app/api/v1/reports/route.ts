import { handle, json, parseBody, getCurrentUser, requireUser, badRequest } from '@/lib/server/http';
import { createReport } from '@/lib/server/repos/network-repo';
import { ReportTargetType } from '@/lib/enums';

export const POST = handle(async (req) => {
  const user = getCurrentUser();
  requireUser(user);
  const body = await parseBody<{ targetType: ReportTargetType; targetId: string; reason: string }>(req);
  if (!Object.values(ReportTargetType).includes(body.targetType)) throw badRequest('Invalid target type');
  const report = createReport(user, body);
  return json({ report }, 201);
});