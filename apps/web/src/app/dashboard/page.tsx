'use client';

import Link from 'next/link';
import {
  Rocket, Users, MessageSquare, Bell, TrendingUp, Briefcase, Target,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { useApi } from '@/hooks/use-api';
import { STAGE_LABELS, STARTUP_STATUS_LABELS } from '@/lib/data';
import { formatCurrency, timeAgo } from '@/lib/utils';
import { UserRole } from '@/lib/enums';
import type { Startup, ConnectionRequest, Conversation, Notification } from '@/lib/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const isFounder = user?.role === UserRole.FOUNDER;

  const startupsPath = isFounder ? '/startups?owner=me' : '/startups';
  const { data: startupsData } = useApi<{ items: Startup[] }>(startupsPath);
  const { data: connectionsData } = useApi<{ items: ConnectionRequest[] }>('/connections');
  const { data: conversationsData } = useApi<{ items: Conversation[] }>('/conversations');
  const { data: notificationsData } = useApi<{ items: Notification[] }>('/notifications');

  const startups = startupsData?.items ?? [];
  const pendingRequests = (connectionsData?.items ?? []).filter((c) => c.status === 'PENDING').length;
  const unreadMessages = (conversationsData?.items ?? []).reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
  const notifications = notificationsData?.items ?? [];
  const unreadNotifications = notifications.filter((n) => !n.readAt).length;

  const stats = isFounder
    ? [
        { label: 'My Startups', value: startups.length, icon: Rocket, color: 'text-primary-500' },
        { label: 'Pending Requests', value: pendingRequests, icon: Users, color: 'text-warning-500' },
        { label: 'Unread Messages', value: unreadMessages, icon: MessageSquare, color: 'text-secondary-500' },
        { label: 'Notifications', value: unreadNotifications, icon: Bell, color: 'text-danger-500' },
      ]
    : [
        { label: 'Startups to Explore', value: startups.length, icon: Target, color: 'text-primary-500' },
        { label: 'Pending Requests', value: pendingRequests, icon: Users, color: 'text-warning-500' },
        { label: 'Unread Messages', value: unreadMessages, icon: MessageSquare, color: 'text-secondary-500' },
        { label: 'Shortlisted', value: 0, icon: Briefcase, color: 'text-success-500' },
      ];

  const profileName = user?.founderProfile?.name
    || user?.investorProfile?.bio?.split(' ').slice(0, 2).join(' ')
    || user?.email?.split('@')[0]
    || 'User';

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Welcome back, {profileName.split(' ')[0]} 👋
        </h1>
        <p className="text-neutral-500">
          {isFounder
            ? 'Here\'s what\'s happening with your fundraising journey.'
            : 'Here\'s what\'s happening with your investment journey.'}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <span className={`p-2 rounded-lg bg-neutral-50 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                <p className="text-xs text-neutral-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
<div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title={isFounder ? 'My Startups' : 'Recommended Startups'}
            subtitle={isFounder ? 'Manage your startup profiles' : 'Based on your preferences'}
            action={
              <Link href={isFounder ? '/startups/new' : '/startups'} className="btn-primary btn-sm">
                {isFounder ? 'Create Startup' : 'Discover'}
              </Link>
            }
          />
          <div className="space-y-4">
            {startups.slice(0, 3).map((startup) => (
              <Link
                key={startup.id}
                href={`/startups/${startup.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={startup.name} size="md" />
                  <div>
                    <p className="font-medium text-neutral-900">{startup.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="sector">{startup.sector}</Badge>
                      <Badge variant="stage">{STAGE_LABELS[startup.stage]}</Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary-500">
                    {formatCurrency(startup.amountSought ?? 0)}
                  </p>
                  <Badge variant={startup.status === 'PUBLISHED' ? 'verified' : 'pending'}>
                    {STARTUP_STATUS_LABELS[startup.status]}
                  </Badge>
                </div>
              </Link>
            ))}
            {startups.length === 0 && (
              <div className="text-center py-8">
                <p className="text-neutral-500">
                  {isFounder ? 'You haven\'t created any startups yet.' : 'No startups to show yet.'}
                </p>
                {isFounder && (
                  <Link href="/startups/new" className="btn-tertiary btn-sm mt-2">
                    Create your first startup
                  </Link>
                )}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Recent Activity"
            subtitle="Your latest notifications and updates"
            action={
              <Link href="/notifications" className="btn-tertiary btn-sm">
                View all
              </Link>
            }
          />
          <div className="space-y-4">
            {notifications.slice(0, 4).map((notification) => (
              <div key={notification.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50">
                <span className="p-2 rounded-lg bg-primary-50 text-primary-500">
                  <Bell className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p className="text-sm text-neutral-700">
                    {notification.type === 'CONNECTION_REQUEST' &&
                      `${String(notification.payload?.senderName ?? 'Someone')} sent you a connection request`}
                    {notification.type === 'CONNECTION_ACCEPTED' &&
                      `${String(notification.payload?.senderName ?? 'Someone')} accepted your connection request`}
                    {notification.type === 'CONNECTION_REJECTED' &&
                      `${String(notification.payload?.senderName ?? 'Someone')} rejected your connection request`}
                    {notification.type === 'NEW_MESSAGE' &&
                      `${String(notification.payload?.senderName ?? 'Someone')} sent you a message`}
                    {notification.type === 'SYSTEM' &&
                      String(notification.payload?.message ?? '')}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">{timeAgo(notification.createdAt)}</p>
                </div>
                {!notification.readAt && <span className="h-2 w-2 rounded-full bg-primary-500 mt-1" />}
              </div>
            ))}
            {notifications.length === 0 && (
              <p className="text-sm text-neutral-500 text-center py-8">None yet.</p>
            )}
          </div>
        </Card>
      </div>
<div className="mt-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/matches" className="card p-5 hover:shadow-elevated transition-shadow">
            <Target className="h-6 w-6 text-primary-500 mb-3" />
            <h3 className="font-medium text-neutral-900 mb-1">View Matches</h3>
            <p className="text-sm text-neutral-500">See your compatibility scores</p>
          </Link>
          <Link href="/connections" className="card p-5 hover:shadow-elevated transition-shadow">
            <Users className="h-6 w-6 text-secondary-500 mb-3" />
            <h3 className="font-medium text-neutral-900 mb-1">Connection Requests</h3>
            <p className="text-sm text-neutral-500">Manage pending requests</p>
          </Link>
          <Link href="/messages" className="card p-5 hover:shadow-elevated transition-shadow">
            <MessageSquare className="h-6 w-6 text-warning-500 mb-3" />
            <h3 className="font-medium text-neutral-900 mb-1">Messages</h3>
            <p className="text-sm text-neutral-500">Chat with your connections</p>
          </Link>
          <Link href="/profile" className="card p-5 hover:shadow-elevated transition-shadow">
            <TrendingUp className="h-6 w-6 text-success-500 mb-3" />
            <h3 className="font-medium text-neutral-900 mb-1">Complete Profile</h3>
            <p className="text-sm text-neutral-500">Improve your match quality</p>
          </Link>
        </div>
      </div>
    </div>
  );
}