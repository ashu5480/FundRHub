import { handle, json, clearSessionCookie } from '@/lib/server/http';

export const POST = handle(async () => {
  clearSessionCookie();
  return json({}, 204);
});
