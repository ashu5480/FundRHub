import { handle, json, parseBody, getCurrentUser, requireUser } from '@/lib/server/http';
import { getStartup, updateStartup } from '@/lib/server/repos/startups-repo';

export const GET = handle(async (_req, { params }) => {
  getCurrentUser();
  return json({ startup: getStartup(params.id) });
});

export const PUT = handle(async (req, { params }) => {
  const user = getCurrentUser();
  requireUser(user);
  const body = await req.json();
  return json({ startup: updateStartup(user, params.id, body) });
});