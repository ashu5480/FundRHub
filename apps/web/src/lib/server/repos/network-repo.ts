import { getDb, saveDb, uid, nowIso, DbUser } from '../db';
import { badRequest, forbidden, notFound } from '../http';
import type {
  Shortlist, ConnectionRequest, Conversation, Message, Notification, Report,
} from '@/lib/types';
import {
  ConnectionStatus, MessageStatus, NotificationType, ReportStatus, ReportTargetType,
} from '@/lib/enums';

function notify(userId: string, type: NotificationType, payload: Record<string, unknown>): void {
  getDb().notifications.push({ id: uid(), userId, type, payload, createdAt: nowIso() });
}

export function addShortlist(user: DbUser, input: { startupId?: string; investorId?: string }): Shortlist {
  const db = getDb();
  if (!input.startupId && !input.investorId) throw badRequest('Either startupId or investorId is required');
  if (input.startupId && !db.startups.some((s) => s.id === input.startupId)) throw notFound('Startup not found');
  if (input.investorId && !db.investorProfiles.some((i) => i.id === input.investorId)) throw notFound('Investor not found');
  if (db.shortlists.some((s) => s.ownerUserId === user.id && s.startupId === input.startupId && s.investorId === input.investorId)) {
    throw badRequest('Already in your shortlist');
  }
  const entry: Shortlist = {
    id: uid(), ownerUserId: user.id, startupId: input.startupId, investorId: input.investorId,
    createdAt: nowIso(), updatedAt: nowIso(),
  };
  db.shortlists.push(entry);
  saveDb(db);
  return entry;
}

export function listShortlists(user: DbUser): Shortlist[] {
  const db = getDb();
  return db.shortlists
    .filter((s) => s.ownerUserId === user.id)
    .map((s) => {
      const startup = s.startupId ? db.startups.find((st) => st.id === s.startupId) : null;
      const investor = s.investorId ? db.investorProfiles.find((i) => i.id === s.investorId) : null;
      return { ...s, startup: startup ?? null, investor: investor ?? null };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function removeShortlist(user: DbUser, id: string): void {
  const db = getDb();
  const entry = db.shortlists.find((s) => s.id === id);
  if (!entry) throw notFound('Shortlist item not found');
  if (entry.ownerUserId !== user.id) throw forbidden('Cannot remove this item');
  db.shortlists = db.shortlists.filter((s) => s.id !== id);
  saveDb(db);
}

export function createConnection(user: DbUser, input: { recipientId: string; startupId?: string; message?: string }): ConnectionRequest {
  const db = getDb();
  if (user.status !== 'ACTIVE') throw forbidden('Verify your account before sending connection requests');
  if (input.recipientId === user.id) throw badRequest('You cannot connect with yourself');
  if (!db.users.some((u) => u.id === input.recipientId)) throw notFound('Recipient not found');
  if (db.connectionRequests.some(
    (c) => c.senderId === user.id && c.recipientId === input.recipientId && c.status === ConnectionStatus.PENDING,
  )) {
    throw badRequest('A pending connection request already exists');
  }
  const recipient = db.users.find((u) => u.id === input.recipientId)!;
  const recipientName = db.founderProfiles.find((p) => p.userId === recipient.id)?.name
    ?? db.investorProfiles.find((p) => p.userId === recipient.id)?.bio?.split(' ').slice(0, 2).join(' ')
    ?? recipient.email;
  const req: ConnectionRequest = {
    id: uid(),
    senderId: user.id,
    recipientId: input.recipientId,
    startupId: input.startupId,
    status: ConnectionStatus.PENDING,
    message: input.message ?? null,
    sender: { id: user.id, name: user.founderProfile?.name ?? user.email },
    recipient: { id: recipient.id, name: recipientName },
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  if (input.startupId) {
    const startup = db.startups.find((s) => s.id === input.startupId);
    if (startup) req.startup = { id: startup.id, name: startup.name };
  }
  db.connectionRequests.push(req);
    notify(input.recipientId, NotificationType.CONNECTION_REQUEST, { connectionId: req.id, senderName: req.sender?.name ?? req.senderId });
  saveDb(db);
  return req;
}

export function listConnections(user: DbUser, input: { status?: string; direction?: string } = {}) {
  const db = getDb();
  return db.connectionRequests
    .filter((c) => {
      const isMine = c.senderId === user.id || c.recipientId === user.id;
      if (!isMine) return false;
      if (input.status && c.status !== input.status) return false;
      if (input.direction === 'sent' && c.senderId !== user.id) return false;
      if (input.direction === 'received' && c.recipientId !== user.id) return false;
      return true;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function updateConnectionStatus(user: DbUser, id: string, status: ConnectionStatus): ConnectionRequest {
  const db = getDb();
  const req = db.connectionRequests.find((c) => c.id === id);
  if (!req) throw notFound('Connection request not found');
  if (req.recipientId !== user.id && req.senderId !== user.id) throw forbidden('Not part of this request');
  if ((status === ConnectionStatus.ACCEPTED || status === ConnectionStatus.REJECTED) && req.recipientId !== user.id) {
    throw forbidden('Only the recipient can accept or reject');
  }
  if (status === ConnectionStatus.WITHDRAWN && req.senderId !== user.id) throw forbidden('Only the sender can withdraw');
  if (req.status !== ConnectionStatus.PENDING) throw badRequest('Request is no longer pending');

  req.status = status;
  req.updatedAt = nowIso();

  if (status === ConnectionStatus.ACCEPTED) {
    const otherId = req.senderId === user.id ? req.recipientId : req.senderId;
    if (!db.conversations.some((c) => c.connectionRequestId === req.id)) {
      db.conversations.push({ id: uid(), connectionRequestId: req.id, createdAt: nowIso(), updatedAt: nowIso() });
    }
    notify(otherId, NotificationType.CONNECTION_ACCEPTED, { connectionId: req.id, senderName: user.founderProfile?.name ?? user.email });
  }
  if (status === ConnectionStatus.REJECTED) {
    notify(req.senderId, NotificationType.CONNECTION_REJECTED, { connectionId: req.id, senderName: user.founderProfile?.name ?? user.email });
  }
  saveDb(db);
  return req;
}

export function listConversations(user: DbUser): Conversation[] {
  const db = getDb();
  return db.conversations
    .filter((c) => {
      const req = db.connectionRequests.find((r) => r.id === c.connectionRequestId);
      return req !== undefined && (req.senderId === user.id || req.recipientId === user.id);
    })
    .map((c) => {
            const req = db.connectionRequests.find((r) => r.id === c.connectionRequestId);
      if (!req) return { ...c, otherUser: { id: '', name: 'Unknown' }, lastMessage: null, unreadCount: 0 };
      const otherId = req.senderId === user.id ? req.recipientId : req.senderId;
      const other = db.users.find((u) => u.id === otherId);
      const otherName = db.founderProfiles.find((p) => p.userId === otherId)?.name
        ?? db.investorProfiles.find((p) => p.userId === otherId)?.bio?.split(' ').slice(0, 2).join(' ')
        ?? other?.email ?? 'User';
      const msgs = db.messages.filter((m) => m.conversationId === c.id);
      const last = msgs.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
      const unreadCount = msgs.filter((m) => m.senderId !== user.id && !m.readAt).length;
      return { ...c, otherUser: { id: otherId, name: otherName }, lastMessage: last, unreadCount };
    })
    .sort((a, b) => (b.lastMessage?.createdAt ?? b.createdAt).localeCompare(a.lastMessage?.createdAt ?? a.createdAt));
}

function getConvForUser(user: DbUser, convId: string): Conversation {
  const db = getDb();
  const conv = db.conversations.find((c) => c.id === convId);
  if (!conv) throw notFound('Conversation not found');
  const req = db.connectionRequests.find((r) => r.id === conv.connectionRequestId);
  if (!req || (req.senderId !== user.id && req.recipientId !== user.id)) throw forbidden('Not part of this conversation');
  return conv;
}

export function listMessages(user: DbUser, convId: string): Message[] {
  const db = getDb();
  getConvForUser(user, convId);
  const msgs = db.messages.filter((m) => m.conversationId === convId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  let changed = false;
  for (const m of msgs) {
    if (m.senderId !== user.id && !m.readAt) { m.readAt = nowIso(); changed = true; }
  }
  if (changed) saveDb(db);
  return msgs;
}

export function sendMessage(user: DbUser, convId: string, body: string): Message {
  if (!body || !body.trim()) throw badRequest('Message body is required');
  const db = getDb();
  getConvForUser(user, convId);
  const message: Message = {
    id: uid(), conversationId: convId, senderId: user.id, body: body.trim(),
    createdAt: nowIso(), updatedAt: nowIso(), status: MessageStatus.ACTIVE,
  };
  db.messages.push(message);
  const conv = db.conversations.find((c) => c.id === convId)!;
  const req = db.connectionRequests.find((r) => r.id === conv.connectionRequestId)!;
  const otherId = req.senderId === user.id ? req.recipientId : req.senderId;
  notify(otherId, NotificationType.NEW_MESSAGE, { conversationId: convId, senderName: user.founderProfile?.name ?? user.email });
  saveDb(db);
  return message;
}

export function listNotifications(user: DbUser): Notification[] {
  return getDb().notifications
    .filter((n) => n.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function markNotificationRead(user: DbUser, id: string): Notification {
  const db = getDb();
  const n = db.notifications.find((x) => x.id === id && x.userId === user.id);
  if (!n) throw notFound('Notification not found');
  n.readAt = nowIso();
  saveDb(db);
  return n;
}

export function markAllNotificationsRead(user: DbUser): void {
  const db = getDb();
  for (const n of db.notifications) if (n.userId === user.id && !n.readAt) n.readAt = nowIso();
  saveDb(db);
}

export function createReport(user: DbUser, input: { targetType: ReportTargetType; targetId: string; reason: string }): Report {
  const db = getDb();
  if (!input.reason || !input.reason.trim()) throw badRequest('Report reason is required');
  const report: Report = {
    id: uid(), reporterId: user.id, targetType: input.targetType, targetId: input.targetId,
    reason: input.reason.trim(), status: ReportStatus.OPEN, createdAt: nowIso(), updatedAt: nowIso(),
  };
  db.reports.push(report);
  saveDb(db);
  return report;
}