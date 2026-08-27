import type {
  ConnectionRequest,
  Conversation,
  FounderProfile,
  InvestmentPreference,
  InvestorProfile,
  Message,
  Notification,
  PaginatedResponse,
  Pagination,
  PitchDeck,
  Report,
  Shortlist,
  Startup,
  User,
  Verification,
  AuditEvent,
  Category,
  RegisterRequest,
  LoginResponse,
  FounderProfileRequest,
  InvestorProfileRequest,
  InvestmentPreferenceRequest,
  CreateStartupRequest,
  CreateConnectionRequest,
  CreateReportRequest,
  MatchRequest,
  MatchResult,
} from './types';
import {
  CategoryType,
  ConnectionStatus,
  ReportStatus,
  StartupStatus,
  UserStatus,
  VerificationStatus,
} from './enums';

/** Simple fetch wrapper for the FundrHub v1 API. */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/v1${path}`, {
    headers: init?.body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...init,
  });
  if (res.status === 204) return undefined as T;

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // No body — fall through to error handling below.
  }

  if (!res.ok) {
    const err = (data as { error?: { message?: string } } | null)?.error;
    throw new Error(err?.message ?? `Request failed (${res.status})`);
  }
  return data as T;
}

/** Extract a readable message from a thrown API error. */
export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong. Please try again.';
}

function toQuery(params: object): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

// ─── Auth & Profile ─────────────────────────────────────────────────────────

/** Register a new account. */
export const registerUser = (body: RegisterRequest) =>
  request<{ user: User }>(`/auth/register`, { method: 'POST', body: JSON.stringify(body) });

/** Log in and receive the session user. */
export const login = (email: string, password: string) =>
  request<LoginResponse>(`/auth/login`, { method: 'POST', body: JSON.stringify({ email, password }) });

/** Log out. */
export const logout = () => request<void>(`/auth/logout`, { method: 'POST' });

/** Get the current session user. */
export const getMe = () => request<{ user: User }>(`/me`);

/** Update the founder profile. */
export const updateFounderProfile = (body: Partial<FounderProfileRequest>) =>
  request<{ founderProfile: FounderProfile }>(`/founder/profile`, { method: 'PUT', body: JSON.stringify(body) });

/** Update the investor profile. */
export const updateInvestorProfile = (body: Partial<InvestorProfileRequest>) =>
  request<{ investorProfile: InvestorProfile }>(`/investor/profile`, { method: 'PUT', body: JSON.stringify(body) });

/** Update investment preferences. */
export const updatePreferences = (body: Partial<InvestmentPreferenceRequest>) =>
  request<{ preferences: InvestmentPreference }>(`/investor/preferences`, { method: 'PUT', body: JSON.stringify(body) });

/** Request a password reset email (demo build returns the token). */
export const forgotPassword = (email: string) =>
  request<{ message: string; demoToken?: string }>(`/auth/forgot-password`, { method: 'POST', body: JSON.stringify({ email }) });

/** Reset a password with a token. */
export const resetPassword = (token: string, password: string) =>
  request<{ message: string }>(`/auth/reset-password`, { method: 'POST', body: JSON.stringify({ token, password }) });

// ─── Startups & Investors ───────────────────────────────────────────────────

export interface StartupQuery {
  q?: string;
  sector?: string;
  stage?: string;
  location?: string;
  minAmount?: number;
  maxAmount?: number;
  status?: string;
  owner?: 'me';
  ownerUserId?: string;
  page?: number;
  limit?: number;
}

/** Search startups. */
export const listStartups = (query: StartupQuery = {}) =>
  request<PaginatedResponse<Startup>>(`/startups${toQuery(query)}`);

/** Get one startup. */
export const getStartup = (id: string) => request<{ startup: Startup }>(`/startups/${id}`);

/** Create a startup. */
export const createStartup = (body: CreateStartupRequest) =>
  request<{ startup: Startup }>(`/startups`, { method: 'POST', body: JSON.stringify(body) });

/** Update a startup. */
export const updateStartup = (id: string, body: Partial<CreateStartupRequest>) =>
  request<{ startup: Startup }>(`/startups/${id}`, { method: 'PUT', body: JSON.stringify(body) });

/** Submit a startup for review. */
export const submitStartup = (id: string) =>
  request<{ startup: Startup }>(`/startups/${id}/submit`, { method: 'POST' });

/** List pitch decks of a startup. */
export const listPitchDecks = (startupId: string) =>
  request<{ items: PitchDeck[] }>(`/startups/${startupId}/pitch-decks`);

/** Upload a pitch deck. */
export const uploadPitchDeck = (startupId: string, file: File, version?: number) => {
  const form = new FormData();
  form.append('file', file);
  if (version) form.append('version', String(version));
  return request<{ pitchDeck: PitchDeck }>(`/startups/${startupId}/pitch-decks`, { method: 'POST', body: form });
};

/** Build the download URL for a pitch deck. */
export const pitchDeckDownloadUrl = (deckId: string) => `/api/v1/pitch-decks/${deckId}/download`;

export interface InvestorQuery {
  q?: string;
  sector?: string;
  stage?: string;
  location?: string;
  investorType?: string;
  minTicket?: number;
  maxTicket?: number;
  page?: number;
  limit?: number;
}

/** Search investors. */
export const listInvestors = (query: InvestorQuery = {}) =>
  request<PaginatedResponse<InvestorProfile>>(`/investors${toQuery(query)}`);

/** Get one investor. */
export const getInvestor = (id: string) => request<{ investor: InvestorProfile }>(`/investors/${id}`);

/** Send a connection request. */
export const createConnection = (body: CreateConnectionRequest) =>
  request<{ connection: ConnectionRequest }>(`/connections`, { method: 'POST', body: JSON.stringify(body) });

/** Respond to a connection request (accept/reject/withdraw/block). */
export const updateConnectionStatus = (id: string, status: ConnectionStatus) =>
  request<{ connection: ConnectionRequest }>(`/connections/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });

/** List conversations. */
export const listConversations = () => request<{ items: Conversation[] }>(`/conversations`);

/** List messages in a conversation. */
export const listMessages = (conversationId: string) =>
  request<{ items: Message[]; pagination: { nextCursor: string | null; hasMore: boolean } }>(
    `/conversations/${conversationId}/messages`,
  );

/** Send a message in a conversation. */
export const sendMessage = (conversationId: string, body: string) =>
  request<{ message: Message }>(`/conversations/${conversationId}/messages`, { method: 'POST', body: JSON.stringify({ body }) });

/** List the current user's shortlist. */
export const listShortlists = () => request<{ items: Shortlist[] }>(`/shortlists`);

/** Add a startup or investor to the shortlist. */
export const addShortlist = (body: { startupId?: string; investorId?: string }) =>
  request<{ shortlist: Shortlist }>(`/shortlists`, { method: 'POST', body: JSON.stringify(body) });

/** Remove an entry from the shortlist. */
export const removeShortlist = (id: string) => request<void>(`/shortlists/${id}`, { method: 'DELETE' });

/** List notifications. */
export const listNotifications = (unreadOnly = false) =>
  request<{ items: Notification[]; pagination: Pagination }>(`/notifications${unreadOnly ? '?unreadOnly=true' : ''}`);

/** Mark a notification as read. */
export const markNotificationRead = (id: string) =>
  request<{ notification: Notification }>(`/notifications/${id}/read`, { method: 'PATCH' });

/** Mark all notifications as read. */
export const markAllNotificationsRead = () =>
  request<{ message: string }>(`/notifications/read-all`, { method: 'POST' });

/** File a report. */
export const createReport = (body: CreateReportRequest) =>
  request<{ report: Report }>(`/reports`, { method: 'POST', body: JSON.stringify(body) });

/** Request explainable matches. */
export const computeMatches = (body: MatchRequest = { targetType: 'STARTUP' }) =>
  request<{ items: MatchResult<Startup | InvestorProfile>[]; targetType: string }>(`/matches`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

// ─── Admin ──────────────────────────────────────────────────────────────────

export interface AdminListQuery {
  status?: string;
  role?: string;
  level?: string;
  entityType?: string;
  actorId?: string;
  page?: number;
  limit?: number;
}

/** Admin: list users. */
export const adminListUsers = (query: AdminListQuery = {}) =>
  request<PaginatedResponse<User>>(`/admin/users${toQuery(query)}`);

/** Admin: set a user's status. */
export const adminSetUserStatus = (id: string, status: UserStatus, reason?: string) =>
  request<{ user: User }>(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, reason }) });

/** Admin: list all startups (any status). */
export const adminListStartups = (query: AdminListQuery = {}) =>
  request<PaginatedResponse<Startup>>(`/admin/startups${toQuery(query)}`);

/** Admin: moderate a startup's status. */
export const adminSetStartupStatus = (id: string, status: StartupStatus, note?: string) =>
  request<{ startup: Startup }>(`/admin/startups/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, note }) });

/** Admin: list abuse reports. */
export const adminListReports = (query: AdminListQuery = {}) =>
  request<PaginatedResponse<Report>>(`/admin/reports${toQuery(query)}`);

/** Admin: update a report. */
export const adminUpdateReport = (id: string, status: ReportStatus, resolution?: string) =>
  request<{ report: Report }>(`/admin/reports/${id}`, { method: 'PATCH', body: JSON.stringify({ status, resolution }) });

/** Admin: list verification requests. */
export const adminListVerifications = (query: AdminListQuery = {}) =>
  request<PaginatedResponse<Verification>>(`/admin/verifications${toQuery(query)}`);

/** Admin: approve/reject a verification. */
export const adminUpdateVerification = (id: string, status: VerificationStatus) =>
  request<{ verification: Verification }>(`/admin/verifications/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });

/** Admin: list taxonomy categories. */
export const adminListCategories = () => request<{ items: Category[] }>(`/admin/categories`);

/** Admin: create a taxonomy category. */
export const adminCreateCategory = (body: { type: CategoryType; name: string }) =>
  request<{ category: Category }>(`/admin/categories`, { method: 'POST', body: JSON.stringify(body) });

/** Admin: list audit events. */
export const adminListAuditEvents = (query: AdminListQuery = {}) =>
  request<PaginatedResponse<AuditEvent>>(`/admin/audit-events${toQuery(query)}`);


