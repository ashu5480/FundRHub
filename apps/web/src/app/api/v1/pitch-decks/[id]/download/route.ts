import { NextResponse } from 'next/server';
import { handle, getCurrentUser, requireUser, forbidden, notFound } from '@/lib/server/http';
import { getDeckBuffer } from '@/lib/server/repos/startups-repo';
import { getDb } from '@/lib/server/db';
import { ConnectionStatus } from '@/lib/enums';

export const GET = handle(async (_req, { params }) => {
  const user = getCurrentUser();
  requireUser(user);
  const db = getDb();
  const deck = db.startups.flatMap((s) => s.pitchDecks ?? []).find((d) => d.id === params.id);
  if (!deck) throw notFound('Pitch deck not found');
  const startup = db.startups.find((s) => s.id === deck.startupId);
  if (!startup) throw notFound('Startup not found');
  const isOwner = startup.ownerUserId === user.id;
  const isAdmin = user.role === 'ADMIN';
  const isConnected = db.connectionRequests.some(
    (c) => c.status === ConnectionStatus.ACCEPTED
      && (c.senderId === user.id || c.recipientId === user.id)
      && (c.startupId === startup.id),
  );
  if (!isOwner && !isAdmin && !isConnected) throw forbidden('You are not authorized to download this deck');
  const { buffer } = getDeckBuffer(params.id);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${deck.fileName}"`,
    },
  });
});