import { handle, json, parseBody, getCurrentUser, requireAdmin } from '@/lib/server/http';
import { listCategories, createCategory } from '@/lib/server/repos/admin-repo';
import { CategoryType } from '@/lib/enums';

export const GET = handle(async () => {
  const user = getCurrentUser();
  requireAdmin(user);
  return json({ items: listCategories() });
});

export const POST = handle(async (req) => {
  const admin = getCurrentUser();
  requireAdmin(admin);
  const body = await parseBody<{ type: CategoryType; name: string }>(req);
  const category = createCategory(admin, body);
  return json({ category }, 201);
});