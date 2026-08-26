import { handle, json, parseBody, badRequest } from '@/lib/server/http';
import { verifyEmail } from '@/lib/server/repos/users-repo';
import { getDb } from '@/lib/server/db';

export const POST = handle(async (req) => {
  const { token } = await parseBody<{ token: string }>(req);
  if (!token) throw badRequest('Verification token is required');
  const ver = getDb().verifications.find((v) => v.id === token);
  if (!ver) throw badRequest('Invalid or expired verification token');
  verifyEmail(ver.userId);
  return json({ message: 'Email verified successfully' });
});
