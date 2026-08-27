import { handle, json, parseBody, publicUser } from '@/lib/server/http';
import { registerUser } from '@/lib/server/repos/users-repo';
import { UserRole } from '@/lib/enums';

export const POST = handle(async (req) => {
  const body = await parseBody<{ email: string; password: string; role: UserRole }>(req);
  const user = registerUser(body);
  return json({ user: publicUser(user) }, 201);
});