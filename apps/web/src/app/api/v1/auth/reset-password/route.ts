import { handle, json, parseBody, badRequest } from '@/lib/server/http';
import { resetPassword } from '@/lib/server/repos/users-repo';
import { getDb } from '@/lib/server/db';

export const POST = handle(async (req) => {
  const { token, password } = await parseBody<{ token: string; password: string }>(req);
  if (!token) throw badRequest('Reset token is required');
  const user = getDb().users.find((u) => u.id === token);
  if (!user) throw badRequest('Invalid or expired reset token');
  resetPassword(user.id, password);
  return json({ message: 'Password reset successfully' });
});
