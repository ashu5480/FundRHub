import { handle, json, getCurrentUser, requireUser } from '@/lib/server/http';
import { markAllNotificationsRead } from '@/lib/server/repos/network-repo';

export const POST = handle(async () => {
  const user = getCurrentUser();
  requireUser(user);
  markAllNotificationsRead(user);
  return json({ message: 'All notifications marked as read' });
});