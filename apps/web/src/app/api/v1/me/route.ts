import { handle, json, getCurrentUser } from '@/lib/server/http';
import { attachProfiles } from '@/lib/server/repos/users-repo';

export const GET = handle(async () => {
  const user = getCurrentUser();
  return json({ user: attachProfiles(user) });
});
