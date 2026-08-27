import { badRequest, conflict, forbidden, notFound } from '../http';
import { getDb, nextId, nowIso, pushNotification } from '../db';
import { displayName } from './users-repo';
import { ConnectionStatus, MessageStatus, NotificationType, ReportTargetType } from '@/lib/enums';
import type {
  ConnectionRequest,
  Conversation,
  InvestorProfile,
  Message,
  Notification,
  Report,
  Shortlist,
  Startup,
  User,
} from '@/lib/types';

/** Attach sender/recipient/startup summaries for API output. */
function enrichConnection(c: ConnectionRequest): ConnectionRequest {
  const db = getDb();
  const sender = db.users.find((u) => u.id === c.senderId);
  const recipient = db.users.find((u) => u.id === c.recipientId);
  const startup = c.startupId ? db.startups.find((s) => s.id === c.startupId) : undefined;
  return {
    ...c,
    sender: sender ? { id: sender.id, name: displayName(sender) } : undefined,
    recipient: recipient ? { id: recipient.id, name: displayName(recipient) } : undefined,
    startup: startup ? { id: startup.id, name: startup.name } : null,
  };
}

/** List the user's connection requests (sent, received or both). */
export function listConnections(
  user: User,
  filters: { status?: string; direction?: string } = {},
): ConnectionRequest[] {
  const db = getDb();
  let items = db.connectionRequests.filter((c) => c.senderId === user.id || c.recipientId === user.id);

  if (filters.status) items = items.filter((c) => c.status === filters.status);
  if (filters.direction === 'sent') items = items.filter((c) => c.senderId === user.id);
  if (filters.direction === 'received') items = items.filter((c) => c.recipientId === user.id);

  return items
    .map(enrichConnection)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** Send a connection request to another user. */
export function createConnection(
  user: User,
  body: { recipientId: string; startupId?: string; message?: string },
): ConnectionRequest {
  const db = getDb();
  const recipient = db.users.find((u) => u.id === body.recipientId);
  if (!recipient) throw notFound('Recipient not found');
  if (recipient.id === user.id) throw badRequest('You cannot connect with yourself');
  if (recipient.status !== 'ACTIVE') throw badRequest('This user cannot receive connection requests right now');
  if (body.startupId) {
    const startup = db.startups.find((s) => s.id === body.startupId);
    if (!startup) throw notFound('Startup not found');
  }

  const duplicate = db.connectionRequests.some(
    (c) => c.startupId === (body.startupId ?? null)
      && ((c.senderId === user.id && c.recipientId === recipient.id)
        || (c.senderId === recipient.id && c.recipientId === user.id))
      && (c.status === ConnectionStatus.PENDING || c.status === ConnectionStatus.ACCEPTED),
  );
  if (duplicate) throw conflict('A connection request already exists between you for this startup');

  const now = nowIso();
  const connection: ConnectionRequest = {
    id: nextId('conn'),
    senderId: user.id,
    recipientId: recipient.id,
    startupId: body.startupId ?? null,
    status: ConnectionStatus.PENDING,
    message: body.message ?? null,
    createdAt: now,
    updatedAt: now,
  };
  db.connectionRequests.push(connection);

  const startup = body.startupId ? db.startups.find((s) => s.id === body.startupId) : undefined;
  pushNotification(recipient.id, NotificationType.CONNECTION_REQUEST, {
    connectionId: connection.id,
    senderName: displayName(user),
    startupName: startup?.name,
  });
  return enrichConnection(connection);
}

/** Accept / reject / withdraw / block a connection request. */
export function updateConnectionStatus(user: User, id: string, status: ConnectionStatus): ConnectionRequest {
  const db = getDb();
  const connection = db.connectionRequests.find((c) => c.id === id);
  if (!connection) throw notFound('Connection request not found');

  const isSender = connection.senderId === user.id;
  const isRecipient = connection.recipientId === user.id;
  if (!isSender && !isRecipient) throw forbidden('You are not part of this connection request');

  if (status === ConnectionStatus.ACCEPTED || status === ConnectionStatus.REJECTED) {
    if (!isRecipient) throw forbidden('Only the recipient can respond to this request');
    if (connection.status !== ConnectionStatus.PENDING) {
      throw conflict('This request has already been resolved');
    }
  } else if (status === ConnectionStatus.WITHDRAWN) {
    if (!isSender) throw forbidden('Only the sender can withdraw this request');
    if (connection.status !== ConnectionStatus.PENDING) {
      throw conflict('Only pending requests can be withdrawn');
    }
  } else if (status === ConnectionStatus.BLOCKED) {
    if (connection.status === ConnectionStatus.WITHDRAWN) {
      throw conflict('This request was withdrawn');
    }
  } else {
    throw badRequest('Invalid connection status');
  }

  connection.status = status;
  connection.updatedAt = nowIso();

  const otherId = isSender ? connection.recipientId : connection.senderId;
  const other = db.users.find((u) => u.id === otherId);

  if (status === ConnectionStatus.ACCEPTED) {
    // A conversation materialises the first time a request is accepted.
    const exists = db.conversations.some((conv) => conv.connectionRequestId === connection.id);
    if (!exists) {
      db.conversations.push({
        id: nextId('conv'),
        connectionRequestId: connection.id,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      } as Conversation);
    }
    pushNotification(otherId, NotificationType.CONNECTION_ACCEPTED, {
      connectionId: connection.id,
      senderName: displayName(user),
    });
  } else if (status === ConnectionStatus.REJECTED && other) {
    pushNotification(otherId, NotificationType.CONNECTION_REJECTED, {
      connectionId: connection.id,
      senderName: displayName(user),
    });
  }

  return enrichConnection(connection);
}

/** Ensure the user participates in the conversation (throws otherwise). */
function getConversationFor(user: User, conversationId: string): { conversation: Conversation; connection: ConnectionRequest } {
  const db = getDb();
  const conversation = db.conversations.find((c) => c.id === conversationId);
  if (!conversation) throw notFound('Conversation not found');
  const connection = db.connectionRequests.find((c) => c.id === conversation.connectionRequestId);
  if (!connection) throw notFound('Connection for this conversation no longer exists');
  if (connection.senderId !== user.id && connection.recipientId !== user.id) {
    throw forbidden('You are not part of this conversation');
  }
  return { conversation, connection };
}

/** The other participant in a conversation. */
function otherUserId(connection: ConnectionRequest, userId: string): string {
  return connection.senderId === userId ? connection.recipientId : connection.senderId;
}

/** List conversations with the other user, last message and unread count. */
export function listConversations(user: User): Conversation[] {
  const db = getDb();
  const items = db.conversations
    .filter((conv) => {
      const connection = db.connectionRequests.find((c) => c.id === conv.connectionRequestId);
      return !!connection && (connection.senderId === user.id || connection.recipientId === user.id);
    })
    .map((conv) => {
      const connection = db.connectionRequests.find((c) => c.id === conv.connectionRequestId)!;
      const other = db.users.find((u) => u.id === otherUserId(connection, user.id));
      const messages = db.messages
        .filter((m) => m.conversationId === conv.id && m.status !== MessageStatus.REMOVED)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      const lastMessage = messages.length ? messages[messages.length - 1] : null;
      const unreadCount = messages.filter((m) => m.senderId !== user.id && !m.readAt).length;
      return {
        ...conv,
        otherUser: other ? { id: other.id, name: displayName(other) } : undefined,
        lastMessage,
        unreadCount,
        updatedAt: lastMessage?.createdAt ?? conv.updatedAt,
      } satisfies Conversation;
    })
    .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
  return items;
}

/** List messages in a conversation, marking incoming ones as read. */
export function listMessages(user: User, conversationId: string): Message[] {
  const db = getDb();
  getConversationFor(user, conversationId);
  const messages = db.messages
    .filter((m) => m.conversationId === conversationId && m.status !== MessageStatus.REMOVED)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  // Reading the thread clears unread badges.
  let changed = false;
  messages.forEach((m) => {
    if (m.senderId !== user.id && !m.readAt) {
      m.readAt = nowIso();
      changed = true;
    }
  });
  if (changed) {
    const conversation = db.conversations.find((c) => c.id === conversationId);
    if (conversation) conversation.updatedAt = nowIso();
  }
  return messages;
}

/** Send a message in a conversation. */
export function sendMessage(user: User, conversationId: string, body: string): Message {
  const db = getDb();
  const { conversation, connection } = getConversationFor(user, conversationId);
  if (connection.status !== ConnectionStatus.ACCEPTED) {
    throw forbidden('You can only message accepted connections');
  }
  const text = (body ?? '').trim();
  if (!text) throw badRequest('Message body is required');
  if (text.length > 5000) throw badRequest('Message is too long (max 5000 characters)');

  const now = nowIso();
  const message: Message = {
    id: nextId('msg'),
    conversationId,
    senderId: user.id,
    body: text,
    readAt: null,
    status: MessageStatus.ACTIVE,
    createdAt: now,
    updatedAt: now,
  };
  db.messages.push(message);
  conversation.updatedAt = now;

  const other = otherUserId(connection, user.id);
  pushNotification(other, NotificationType.NEW_MESSAGE, {
    conversationId,
    senderName: displayName(user),
  });
  return message;
}

/** List the current user's notifications (newest first). */
export function listNotifications(user: User): Notification[] {
  const db = getDb();
  return db.notifications
    .filter((n) => n.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Mark a single notification as read (owner only). */
export function markNotificationRead(user: User, id: string): Notification {
  const db = getDb();
  const notification = db.notifications.find((n) => n.id === id);
  if (!notification) throw notFound('Notification not found');
  if (notification.userId !== user.id) throw forbidden('This notification belongs to another user');
  if (!notification.readAt) notification.readAt = nowIso();
  return notification;
}

/** Mark all of the user's notifications as read. */
export function markAllNotificationsRead(user: User): void {
  const db = getDb();
  const now = nowIso();
  db.notifications.forEach((n) => {
    if (n.userId === user.id && !n.readAt) n.readAt = now;
  });
}

/** Attach startup/investor summaries to a shortlist entry. */
function enrichShortlist(s: Shortlist): Shortlist {
  const db = getDb();
  const startup = s.startupId ? db.startups.find((x) => x.id === s.startupId) : null;
  const investor = s.investorId ? db.investorProfiles.find((x) => x.id === s.investorId) ?? null : null;
  return { ...s, startup: startup ?? null, investor: investor as InvestorProfile | null };
}

/** List the current user's shortlist. */
export function listShortlists(user: User): Shortlist[] {
  const db = getDb();
  return db.shortlists
    .filter((s) => s.ownerUserId === user.id)
    .map(enrichShortlist)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Add a startup or investor to the current user's shortlist. */
export function addShortlist(user: User, body: { startupId?: string; investorId?: string }): Shortlist {
  const db = getDb();
  const { startupId, investorId } = body;
  if (!startupId && !investorId) throw badRequest('startupId or investorId is required');

  if (startupId) {
    if (!db.startups.some((s) => s.id === startupId)) throw notFound('Startup not found');
    const existing = db.shortlists.find((s) => s.ownerUserId === user.id && s.startupId === startupId);
    if (existing) return enrichShortlist(existing);
  }
  if (investorId) {
    if (!db.investorProfiles.some((p) => p.id === investorId)) throw notFound('Investor not found');
    const existing = db.shortlists.find((s) => s.ownerUserId === user.id && s.investorId === investorId);
    if (existing) return enrichShortlist(existing);
  }

  const now = nowIso();
  const shortlist: Shortlist = {
    id: nextId('sl'),
    ownerUserId: user.id,
    startupId: startupId ?? null,
    investorId: investorId ?? null,
    createdAt: now,
    updatedAt: now,
  };
  db.shortlists.push(shortlist);
  return enrichShortlist(shortlist);
}

/** Remove an entry from the current user's shortlist. */
export function removeShortlist(user: User, id: string): void {
  const db = getDb();
  const index = db.shortlists.findIndex((s) => s.id === id);
  if (index === -1) throw notFound('Shortlist entry not found');
  if (db.shortlists[index].ownerUserId !== user.id) {
    throw forbidden('This shortlist entry belongs to another user');
  }
  db.shortlists.splice(index, 1);
}

/** File a report against a user, startup or message. */
export function createReport(
  user: User,
  body: { targetType: ReportTargetType; targetId: string; reason: string },
): Report {
  const db = getDb();
  const reason = (body.reason ?? '').trim();
  if (!reason) throw badRequest('A reason is required');
  if (reason.length > 2000) throw badRequest('Reason is too long (max 2000 characters)');

  const now = nowIso();
  const report: Report = {
    id: nextId('rep'),
    reporterId: user.id,
    targetType: body.targetType,
    targetId: body.targetId,
    reason,
    status: 'OPEN' as Report['status'],
    resolution: null,
    createdAt: now,
    updatedAt: now,
  };
  db.reports.push(report);
  return report;
}


