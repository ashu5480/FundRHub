'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { mockConversations, mockMessages } from '@/lib/data';
import { formatTime, timeAgo } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';
import type { Message } from '@/lib/types';
import { MessageStatus } from '@/lib/enums';

export default function MessagesPage() {
  const { user } = useAuth();
  const [activeConvId, setActiveConvId] = useState(mockConversations[0]?.id ?? '');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = mockConversations.find((c) => c.id === activeConvId);
  const activeMessages = messages[activeConvId] ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, activeConvId]);

  const handleSend = () => {
    if (!messageInput.trim() || !user) return;
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: activeConvId,
      senderId: user.id,
      body: messageInput.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: MessageStatus.ACTIVE,
    };
    setMessages((prev) => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] ?? []), newMessage],
    }));
    setMessageInput('');
  };

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">Messages</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Conversation List */}
        <div className="lg:col-span-1 bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="p-4 border-b border-neutral-200">
            <h2 className="font-semibold text-neutral-900">Conversations</h2>
          </div>
          <div className="divide-y divide-neutral-100 max-h-[calc(100vh-16rem)] overflow-y-auto">
            {mockConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`w-full text-left p-4 hover:bg-neutral-50 transition-colors ${
                  activeConvId === conv.id ? 'bg-primary-50 hover:bg-primary-50' : ''
                }`}
                aria-pressed={activeConvId === conv.id}
              >
                <div className="flex items-center gap-3">
                  <Avatar name={conv.otherUser?.name ?? 'User'} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium truncate ${conv.unreadCount ? 'font-semibold text-neutral-900' : 'text-neutral-700'}`}>
                        {conv.otherUser?.name}
                      </p>
                      {conv.lastMessage && (
                        <span className="text-xs text-neutral-400 shrink-0 ml-2">
                          {timeAgo(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 truncate">
                      {conv.lastMessage?.body}
                    </p>
                    {conv.unreadCount ? (
                      <span className="mt-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary-500 text-white text-xs font-medium">
                        {conv.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-neutral-200 overflow-hidden flex flex-col h-[calc(100vh-16rem)]">
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-neutral-200">
                <Avatar name={activeConversation.otherUser?.name ?? 'User'} size="md" />
                <div>
                  <h2 className="font-semibold text-neutral-900">
                    {activeConversation.otherUser?.name}
                  </h2>
                  <p className="text-xs text-success-500">✓ Connected</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg px-4 py-2 ${
                        msg.senderId === user?.id
                          ? 'bg-primary-500 text-white rounded-br-sm'
                          : 'bg-neutral-100 text-neutral-900 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm">{msg.body}</p>
                      <p className={`text-xs mt-1 ${msg.senderId === user?.id ? 'text-primary-100' : 'text-neutral-400'}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-neutral-200">
                <div className="flex gap-3">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type a message..."
                    aria-label="Message input"
                  />
                  <Button onClick={handleSend} aria-label="Send message">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                <p className="text-neutral-500">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}