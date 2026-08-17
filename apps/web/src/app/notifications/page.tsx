'use client';

import { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { mockNotifications } from '@/lib/data';
import { timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import type { Notification } from '@/lib/types';

export default function NotificationsPage() {
  const { success } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
    success('All notifications marked as read');
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
    );
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'CONNECTION_REQUEST':
        return `${String(notification.payload?.senderName ?? 'Someone')} sent you a connection request`;
      case 'CONNECTION_ACCEPTED':
        return `${String(notification.payload?.senderName ?? 'Someone')} accepted your connection request`;
      case 'CONNECTION_REJECTED':
        return `${String(notification.payload?.senderName ?? 'Someone')} rejected your connection request`;
      case 'NEW_MESSAGE':
        return `${String(notification.payload?.senderName ?? 'Someone')} sent you a new message`;
      case 'SYSTEM':
        return String(notification.payload?.message ?? 'System notification');
      default:
        return 'Notification';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-1">Notifications</h1>
          <p className="text-neutral-500">
            {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'You\'re all caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No notifications</h3>
          <p className="text-neutral-500">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card key={notification.id} className="p-4">
              <div className="flex items-start gap-3">
                <span
                  className={`p-2 rounded-lg shrink-0 ${
                    notification.readAt ? 'bg-neutral-100 text-neutral-400' : 'bg-primary-50 text-primary-500'
                  }`}
                >
                  <Bell className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <p className={`text-sm ${notification.readAt ? 'text-neutral-500' : 'text-neutral-900 font-medium'}`}>
                    {getNotificationText(notification)}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {timeAgo(notification.createdAt)}
                  </p>
                </div>
                {!notification.readAt && (
                  <button
                    onClick={() => markRead(notification.id)}
                    className="text-xs text-primary-500 hover:text-primary-600 shrink-0"
                    aria-label="Mark as read"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}