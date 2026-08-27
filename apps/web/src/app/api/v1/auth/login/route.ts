export const dynamic = 'force-dynamic';

import { handle, json, parseBody, setSessionCookie } from '@/lib/server/http';
import { loginUser, attachProfiles } from '@/lib/server/repos/users-repo';

export const POST = handle(async (req) => {
  const { email, password } = await parseBody<{ email: string; password: string }>(req);
  const user = loginUser(email, password);
  const token = setSessionCookie(user.id);
  return json({ token, user: attachProfiles(user) });
});
