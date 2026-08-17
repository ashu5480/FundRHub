'use client';

import { useState } from 'react';
import { Check, X, Inbox } from 'lucide-react';
import { mockConnections } from '@/lib/data';
import { timeAgo } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/context/auth-context';
import { ConnectionStatus } from '@/lib/enums';

type FilterType = 'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED';

export default function ConnectionsPage() {
  const { user } = useAuth();
  const { success } = useToast();
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [connections, setConnections] = useState(mockConnections);

  const filtered = connections.filter((c) => {
    const isMine = c.recipientId === user?.id || c.senderId === user?.id;
    if (!isMine) return false;
    if (filter === 'ALL') return true;
    return c.status === filter;
  });

  const tabs: Array<{ key: FilterType; label: string }> = [
    { key: 'ALL', label: 'All' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'ACCEPTED', label: 'Accepted' },
    { key: 'REJECTED', label: 'Rejected' },
  ];

  const getStatusBadge = (status: ConnectionStatus) => {
    switch (status) {
      case ConnectionStatus.PENDING:
        return <Badge variant="pending">Pending</Badge>;
      case ConnectionStatus.ACCEPTED:
        return <Badge variant="verified">Accepted</Badge>;
      case ConnectionStatus.REJECTED:
        return <Badge variant="suspended">Rejected</Badge>;
      case ConnectionStatus.WITHDRAWN:
        return <Badge>Withdrawn</Badge>;
      case ConnectionStatus.BLOCKED:
        return <Badge variant="suspended">Blocked</Badge>;
    }
  };

  const handleAction = (id: string, action: 'accepted' | 'rejected' | 'withdrawn') => {
    setConnections((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status:
                action === 'accepted'
                  ? ConnectionStatus.ACCEPTED
                  : action === 'rejected'
                    ? ConnectionStatus.REJECTED
                    : ConnectionStatus.WITHDRAWN,
            }
          : c,
      ),
    );
    success(
      action === 'accepted'
        ? 'Connection accepted!'
        : action === 'rejected'
          ? 'Connection rejected'
          : 'Request withdrawn',
    );
  };

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Connection Requests</h1>
        <p className="text-neutral-500">Manage your incoming and outgoing connection requests</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto" role="tablist" aria-label="Connection filters">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={filter === tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab.key
                ? 'bg-primary-500 text-white'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No connection requests</h3>
          <p className="text-neutral-500">Discover startups and investors to start connecting</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((connection) => {
            const isIncoming = connection.recipientId === user?.id;
            const otherName = isIncoming
              ? connection.sender?.name
              : connection.recipient?.name;

            return (
              <Card key={connection.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Avatar name={otherName ?? 'User'} size="lg" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-neutral-900">{otherName}</h3>
                        {getStatusBadge(connection.status)}
                      </div>
                      {connection.startup && (
                        <p className="text-sm text-neutral-500 mb-1">
                          Regarding: <span className="font-medium text-neutral-700">{connection.startup.name}</span>
                        </p>
                      )}
                      {connection.message && (
                        <p className="text-sm text-neutral-600 mb-2">{connection.message}</p>
                      )}
                      <p className="text-xs text-neutral-400">
                        {isIncoming ? 'Received' : 'Sent'} {timeAgo(connection.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {connection.status === ConnectionStatus.PENDING && isIncoming && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleAction(connection.id, 'accepted')}
                        >
                          <Check className="h-4 w-4" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleAction(connection.id, 'rejected')}
                        >
                          <X className="h-4 w-4" />
                          Reject
                        </Button>
                      </>
                    )}
                    {connection.status === ConnectionStatus.PENDING && !isIncoming && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAction(connection.id, 'withdrawn')}
                      >
                        Withdraw
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}