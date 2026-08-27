'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, MapPin, TrendingUp, FileText, Send, Star, Upload, Download,
  StarOff, ClipboardList, AlertCircle, Target, Lightbulb,
} from 'lucide-react';
import { STAGE_LABELS, STARTUP_STATUS_LABELS } from '@/lib/data';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  errorMessage, getStartup, listPitchDecks, uploadPitchDeck, pitchDeckDownloadUrl,
  createConnection, addShortlist, listShortlists, submitStartup,
} from '@/lib/api';
import { UserRole } from '@/lib/enums';
import type { PitchDeck, Startup, User } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';

export default function StartupDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth() as { user: User | null; isAuthenticated: boolean };
  const { success, error } = useToast();

  const [startup, setStartup] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [decks, setDecks] = useState<PitchDeck[] | null>(null);
  const [decksError, setDecksError] = useState<string | null>(null);
  const [shortlisted, setShortlisted] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [connectMessage, setConnectMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOwner = !!user && !!startup && startup.ownerUserId === user.id;
  const isAdmin = user?.role === UserRole.ADMIN;

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const { startup: data } = await getStartup(params.id);
      setStartup(data);
    } catch (err) {
      setNotFound(true);
      error(errorMessage(err));
      return;
    } finally {
      setLoading(false);
    }
    // Pitch decks are connection-gated; a 403 is expected for strangers.
    try {
      const { items } = await listPitchDecks(params.id);
      setDecks(items);
      setDecksError(null);
    } catch (err) {
      setDecks(null);
      setDecksError(errorMessage(err));
    }
  }, [params.id, error]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    listShortlists()
      .then(({ items }) => setShortlisted(items.some((s) => s.startupId === params.id)))
      .catch(() => undefined);
  }, [isAuthenticated, user, params.id]);

  const handleShortlist = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    try {
      await addShortlist({ startupId: params.id });
      setShortlisted(true);
      success('Added to your shortlist');
    } catch (err) {
      error(errorMessage(err));
    }
  };

  const handleConnect = async () => {
    setBusy(true);
    try {
      await createConnection({
        recipientId: startup!.ownerUserId,
        startupId: startup!.id,
        message: connectMessage.trim() || undefined,
      });
      success('Connection request sent!');
      setConnectOpen(false);
      setConnectMessage('');
      // Re-fetch decks â€” accepted connections unlock them, and the state may have changed.
      listPitchDecks(params.id).then(({ items }) => setDecks(items)).catch(() => undefined);
    } catch (err) {
      error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleUpload = async (file: File) => {
    setBusy(true);
    try {
      await uploadPitchDeck(params.id, file);
      success('Pitch deck uploaded');
      const { items } = await listPitchDecks(params.id);
      setDecks(items);
    } catch (err) {
      error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitForReview = async () => {
    setBusy(true);
    try {
      const { startup: updated } = await submitStartup(params.id);
      setStartup(updated);
      success('Submitted for review');
    } catch (err) {
      error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-content mx-auto px-4 py-16 text-center text-neutral-400">
        Loading startupâ€¦
      </div>
    );
  }

  if (notFound || !startup) {
    return (
      <div className="max-w-content mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Startup not found</h1>
        <p className="text-neutral-500 mb-6">It may be a draft, or it may have been removed.</p>
        <Link href="/startups" className="btn-primary">Back to startups</Link>
      </div>
    );
  }

// __SD_PART3__


  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/startups"
        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-primary-500 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to startups
      </Link>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <Avatar name={startup.name} size="xl" />
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-neutral-900">{startup.name}</h1>
                <Badge variant="stage">{STAGE_LABELS[startup.stage]}</Badge>
                <Badge variant={startup.status === 'PUBLISHED' ? 'verified' : 'pending'}>
                  {STARTUP_STATUS_LABELS[startup.status]}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-neutral-500">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {startup.location}
                </span>
                <span className="inline-flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  {startup.sector}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {!isAuthenticated ? (
              <Button onClick={() => router.push('/login')}>
                <Send className="h-4 w-4" />
                Log in to connect
              </Button>
            ) : isOwner ? (
              <>
                {(startup.status === 'DRAFT' || startup.status === 'REJECTED') && (
                  <Button variant="secondary" disabled={busy} onClick={handleSubmitForReview}>
                    <ClipboardList className="h-4 w-4" />
                    Submit for review
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.ppt,.pptx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                    e.target.value = '';
                  }}
                />
                <Button disabled={busy} onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4" />
                  Upload deck
                </Button>
              </>
            ) : (
              !isAdmin && (
                <>
                  <Button variant="secondary" onClick={handleShortlist} disabled={shortlisted}>
                    {shortlisted ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                    {shortlisted ? 'Shortlisted' : 'Shortlist'}
                  </Button>
                  <Button onClick={() => setConnectOpen(true)}>
                    <Send className="h-4 w-4" />
                    Connect
                  </Button>
                </>
              )
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader title="About" />
            <p className="text-neutral-700">{startup.description}</p>
          </Card>

          {/* Problem & Solution */}
          <div className="grid sm:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <span className="p-2 rounded-lg bg-danger-50 text-danger-500">
                  <Target className="h-5 w-5" />
                </span>
                <h3 className="font-semibold text-neutral-900">Problem</h3>
              </div>
              <p className="text-sm text-neutral-600">{startup.problem}</p>
            </Card>
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <span className="p-2 rounded-lg bg-success-50 text-success-500">
                  <Lightbulb className="h-5 w-5" />
                </span>
                <h3 className="font-semibold text-neutral-900">Solution</h3>
              </div>
              <p className="text-sm text-neutral-600">{startup.solution}</p>
            </Card>
          </div>

          {/* Team */}
          <Card>
            <CardHeader
              title="Team"
              subtitle="The people building this"
            />
            <div className="space-y-4">
              {startup.teamMembers?.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <Avatar name={member.name} size="md" />
                  <div>
                    <p className="font-medium text-neutral-900">{member.name}</p>
                    <p className="text-sm text-neutral-500">{member.role}</p>
                    {member.bio && <p className="text-xs text-neutral-400 mt-0.5">{member.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Funding */}
          <Card>
            <CardHeader title="Funding Round" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">Amount seeking</span>
                <span className="font-semibold text-primary-500">
                  {formatCurrency(startup.fundingRound?.amountSought ?? 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">Valuation</span>
                <span className="font-medium text-neutral-900">
                  {formatCurrency(startup.fundingRound?.valuation ?? 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">Equity offered</span>
                <span className="font-medium text-neutral-900">
                  {startup.fundingRound?.equityOffered}%
                </span>
              </div>
              {startup.fundingRound?.useOfFunds && (
                <div className="pt-3 border-t border-neutral-100">
                  <p className="text-sm font-medium text-neutral-700 mb-1">Use of funds</p>
                  <p className="text-xs text-neutral-500">{startup.fundingRound.useOfFunds}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Pitch Deck */}
          <Card>
            <CardHeader title="Pitch Deck" />
            {decks && decks.length > 0 ? (
              <div className="space-y-2">
                {decks.map((deck) => (
                  <div
                    key={deck.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-neutral-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-lg bg-primary-50 text-primary-500">
                        <FileText className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{deck.fileName}</p>
                        <p className="text-xs text-neutral-500">
                          v{deck.version} Â· {formatDate(deck.uploadedAt)}
                          {deck.status === 'ARCHIVED' && ' Â· archived'}
                        </p>
                      </div>
                    </div>
                    <a
                      href={pitchDeckDownloadUrl(deck.id)}
                      download={deck.fileName}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-500 hover:text-primary-600"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  </div>
                ))}
              </div>
            ) : decksError ? (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-neutral-50 text-sm text-neutral-500">
                <Send className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{isOwner ? decksError : `Pitch decks are only available to connected investors. ${decksError}`}</span>
              </div>
            ) : (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-neutral-50 text-sm text-neutral-500">
                <FileText className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{isOwner ? 'No pitch deck uploaded yet.' : 'No pitch deck available yet.'}</span>
              </div>
            )}
          </Card>

          {/* Metrics */}
          {startup.metrics && startup.metrics.length > 0 && (
            <Card>
              <CardHeader title="Traction" />
              <div className="space-y-3">
                {startup.metrics.map((metric) => (
                  <div key={metric.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-neutral-900 capitalize">
                        {metric.metricType.toLowerCase()}
                      </p>
                      <p className="text-xs text-neutral-400">{metric.period}</p>
                    </div>
                    <span className="font-semibold text-neutral-900">
                      {metric.metricType === 'REVENUE'
                        ? formatCurrency(metric.value)
                        : metric.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Connect modal */}
      <Modal
        isOpen={connectOpen}
        onClose={() => setConnectOpen(false)}
        title={`Connect with ${startup.owner?.name ?? 
'the founder'
}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConnectOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={handleConnect} disabled={busy}>
              <Send className="h-4 w-4" />
              {busy ? 
'Sending…'
 : 
'Send request'
}
            </Button>
          </>
        }
      >
        <p className="text-sm text-neutral-500 mb-3">
          Introduce yourself and explain why you&apos;re a good fit. The founder will review your
          request before a conversation opens.
        </p>
        <textarea
          value={connectMessage}
          onChange={(e) => setConnectMessage(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Hi, I would love to learn more about your plans and share how we could help…"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
        <p className="text-xs text-neutral-400 mt-1">{connectMessage.length}/2000</p>
      </Modal>
    </div>
  );
}
