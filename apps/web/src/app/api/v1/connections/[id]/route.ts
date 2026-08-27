export const dynamic = 'force-dynamic';

import { handle, json, parseBody, getCurrentUser, requireUser, badRequest } from '@/lib/server/http';
import { updateConnectionStatus } from '@/lib/server/repos/network-repo';
import { ConnectionStatus } from '@/lib/enums';

export const PATCH = handle(async (req, { params }) => {
  const user = getCurrentUser();
  requireUser(user);
  const { status } = await parseBody<{ status: ConnectionStatus }>(req);
  if (!Object.values(ConnectionStatus).includes(status)) throw badRequest('Invalid connection status');
  const connection = updateConnectionStatus(user, params.id, status);
  return json({ connection });
});