export const dynamic = 'force-dynamic';

import { handle, json, getCurrentUser, requireUser, badRequest } from '@/lib/server/http';
import { listPitchDecks, addPitchDeck } from '@/lib/server/repos/startups-repo';

export const GET = handle(async (_req, { params }) => {
  const user = getCurrentUser();
  requireUser(user);
  return json({ items: listPitchDecks(user, params.id) });
});

export const POST = handle(async (req, { params }) => {
  const user = getCurrentUser();
  requireUser(user);
  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) throw badRequest('file is required');
  const version = form.get('version') ? Number(form.get('version')) : undefined;
  const buffer = Buffer.from(await file.arrayBuffer());
  const pitchDeck = addPitchDeck(user, params.id, file.name, buffer, version);
  return json({ pitchDeck }, 201);
});