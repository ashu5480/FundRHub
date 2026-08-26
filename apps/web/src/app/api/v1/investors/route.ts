import { handle, json, getCurrentUser, requireUser } from '@/lib/server/http';
import { listInvestors, getInvestor } from '@/lib/server/repos/startups-repo';

export const GET = handle(async (req) => {
  const user = getCurrentUser();
  requireUser(user);
  const url = new URL(req.url);
  return json(listInvestors({
    q: url.searchParams.get('q') ?? undefined,
    sector: url.searchParams.get('sector') ?? undefined,
    stage: url.searchParams.get('stage') ?? undefined,
    location: url.searchParams.get('location') ?? undefined,
    investorType: url.searchParams.get('investorType') ?? undefined,
    minTicket: url.searchParams.get('minTicket') ? Number(url.searchParams.get('minTicket')) : undefined,
    maxTicket: url.searchParams.get('maxTicket') ? Number(url.searchParams.get('maxTicket')) : undefined,
    page: url.searchParams.get('page') ? Number(url.searchParams.get('page')) : 1,
    limit: url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : 20,
  }));
});