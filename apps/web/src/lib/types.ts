import {
  ConnectionStatus,
  DeckStatus,
  InvestorType,
  MessageStatus,
  MetricType,
  MetricVisibility,
  NotificationType,
  ReportStatus,
  ReportTargetType,
  StartupStage,
  StartupStatus,
  UserRole,
  UserStatus,
  VerificationLevel,
  VerificationStatus,
} from './enums';

/** Base entity with id and timestamps */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/** User model */
export interface User extends BaseEntity {
  email: string;
  role: UserRole;
  status: UserStatus;
  founderProfile?: FounderProfile | null;
  investorProfile?: InvestorProfile | null;
}

/** Founder profile model */
export interface FounderProfile extends BaseEntity {
  userId: string;
  name: string;
  bio?: string | null;
  location?: string | null;
  experience?: string | null;
  links?: Record<string, string> | null;
  completeness: number;
}

/** Investor profile model */
export interface InvestorProfile extends BaseEntity {
  userId: string;
  investorType: InvestorType;
  bio?: string | null;
  location?: string | null;
  portfolioSummary?: string | null;
  completeness: number;
  preferences?: InvestmentPreference | null;
}

/** Investment preference model */
export interface InvestmentPreference extends BaseEntity {
  investorId: string;
  sectors: string[];
  stages: StartupStage[];
  geographies?: string[] | null;
  minTicket?: number | null;
  maxTicket?: number | null;
}

/** Startup team member model */
export interface StartupTeamMember {
  id: string;
  startupId: string;
  name: string;
  role: string;
  bio?: string | null;
  profileLink?: string | null;
}

/** Funding round model */
export interface FundingRound extends BaseEntity {
  startupId: string;
  amountSought: number;
  valuation?: number | null;
  equityOffered?: number | null;
  useOfFunds?: string | null;
}

/** Pitch deck model */
export interface PitchDeck {
  id: string;
  startupId: string;
  objectKey: string;
  fileName: string;
  version: number;
  status: DeckStatus;
  uploadedAt: string;
}

/** Startup metric model */
export interface StartupMetric {
  id: string;
  startupId: string;
  metricType: MetricType;
  value: number;
  period?: string | null;
  visibility: MetricVisibility;
}

/** Startup model */
export interface Startup extends BaseEntity {
  ownerUserId: string;
  name: string;
  slug: string;
  description: string;
  problem?: string | null;
  solution?: string | null;
  sector: string;
  stage: StartupStage;
  location?: string | null;
  businessModel?: string | null;
  status: StartupStatus;
  owner?: { id: string; name: string };
  fundingRound?: FundingRound | null;
  teamMembers?: StartupTeamMember[];
  metrics?: StartupMetric[];
  pitchDecks?: PitchDeck[];
  matchScore?: number | null;
  amountSought?: number | null;
}

/** Shortlist model */
export interface Shortlist extends BaseEntity {
  ownerUserId: string;
  startupId?: string | null;
  investorId?: string | null;
  startup?: Startup | null;
  investor?: InvestorProfile | null;
}

/** Connection request model */
export interface ConnectionRequest extends BaseEntity {
  senderId: string;
  recipientId: string;
  startupId?: string | null;
  status: ConnectionStatus;
  message?: string | null;
  sender?: { id: string; name: string };
  recipient?: { id: string; name: string };
  startup?: { id: string; name: string } | null;
}

/** Conversation model */
export interface Conversation extends BaseEntity {
  connectionRequestId: string;
  otherUser?: { id: string; name: string };
  lastMessage?: Message | null;
  unreadCount?: number;
}

/** Message model */
export interface Message extends BaseEntity {
  conversationId: string;
  senderId: string;
  body: string;
  readAt?: string | null;
  status: MessageStatus;
}

/** Notification model */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  payload?: Record<string, unknown> | null;
  readAt?: string | null;
  createdAt: string;
}

/** Report model */
export interface Report extends BaseEntity {
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  status: ReportStatus;
  resolution?: string | null;
}

/** Verification model */
export interface Verification extends BaseEntity {
  userId: string;
  level: VerificationLevel;
  status: VerificationStatus;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
}

/** Audit event model */
export interface AuditEvent {
  id: string;
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

/** Category model */
export interface Category extends BaseEntity {
  type: 'SECTOR' | 'STAGE' | 'INVESTOR_TYPE';
  name: string;
  active: boolean;
}

/** Match reason for explainable matching */
export interface MatchReason {
  factor: string;
  weight: number;
  matched: boolean;
  label: string;
}

/** Match result */
export interface MatchResult<T> {
  target: T;
  score: number;
  reasons: MatchReason[];
}

/** Pagination metadata */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Paginated response */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

// ─── API DTOs ──────────────────────────────────────────────────────────────

/** API error detail */
export interface ApiErrorDetail {
  field: string;
  message: string;
}

/** API error response */
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

/** Register request */
export interface RegisterRequest {
  email: string;
  password: string;
  role: UserRole;
}

/** Login request */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Login response */
export interface LoginResponse {
  token: string;
  user: User;
}

/** Update founder profile request */
export interface FounderProfileRequest {
  name: string;
  bio?: string;
  location?: string;
  experience?: string;
  links?: Record<string, string>;
}

/** Update investor profile request */
export interface InvestorProfileRequest {
  investorType: InvestorType;
  bio?: string;
  location?: string;
  portfolioSummary?: string;
}

/** Update investment preferences request */
export interface InvestmentPreferenceRequest {
  sectors: string[];
  stages: StartupStage[];
  geographies?: string[];
  minTicket?: number;
  maxTicket?: number;
}

/** Create startup request */
export interface CreateStartupRequest {
  name: string;
  description: string;
  problem?: string;
  solution?: string;
  sector: string;
  stage: StartupStage;
  location?: string;
  businessModel?: string;
  fundingRound?: {
    amountSought: number;
    valuation?: number;
    equityOffered?: number;
    useOfFunds?: string;
  };
  teamMembers?: Array<{
    name: string;
    role: string;
    bio?: string;
    profileLink?: string;
  }>;
}

/** Create connection request */
export interface CreateConnectionRequest {
  recipientId: string;
  startupId?: string;
  message?: string;
}

/** Create report request */
export interface CreateReportRequest {
  targetType: 'USER' | 'STARTUP' | 'MESSAGE';
  targetId: string;
  reason: string;
}

/** Match request */
export interface MatchRequest {
  targetType: 'STARTUP' | 'INVESTOR';
  filters?: {
    sector?: string;
    stage?: StartupStage;
    location?: string;
  };
  page?: number;
  limit?: number;
}