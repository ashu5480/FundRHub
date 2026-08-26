import { handle, json, getCurrentUser, requireUser } from '@/lib/server/http';
import { listStartups, createStartup } from '@/lib/server/repos/startups-repo';

export const GET = handle(async (req) => {
  const user = getCurrentUser();
  requireUser(user);
  const url = new URL(req.url);
  const owner = url.searchParams.get('owner');
  return json(listStartups({
    q: url.searchParams.get('q') ?? undefined,
    sector: url.searchParams.get('sector') ?? undefined,
    stage: url.searchParams.get('stage') ?? undefined,
    location: url.searchParams.get('location') ?? undefined,
    minAmount: url.searchParams.get('minAmount') ? Number(url.searchParams.get('minAmount')) : undefined,
    maxAmount: url.searchParams.get('maxAmount') ? Number(url.searchParams.get('maxAmount')) : undefined,
    status: url.searchParams.get('status') ?? undefined,
    ownerUserId: owner === 'me' ? user.id : (url.searchParams.get('ownerUserId') ?? undefined),
    page: url.searchParams.get('page') ? Number(url.searchParams.get('page')) : 1,
    limit: url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : 20,
  }));
});

export const POST = handle(async (req) => {
  const user = getCurrentUser();
  requireUser(user);
  const body = await req.json();
  const startup = createStartup(user, body);
  return json({ startup }, 201);
});