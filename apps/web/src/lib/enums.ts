/** User role enum */
export enum UserRole {
  FOUNDER = 'FOUNDER',
  INVESTOR = 'INVESTOR',
  ADMIN = 'ADMIN',
}

/** User status enum */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

/** Investor type enum */
export enum InvestorType {
  ANGEL = 'ANGEL',
  VC = 'VC',
  ACCELERATOR = 'ACCELERATOR',
  FAMILY_OFFICE = 'FAMILY_OFFICE',
  OTHER = 'OTHER',
}

/** Startup stage enum */
export enum StartupStage {
  IDEA = 'IDEA',
  SEED = 'SEED',
  EARLY = 'EARLY',
  GROWTH = 'GROWTH',
  LATER = 'LATER',
}

/** Startup status enum */
export enum StartupStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

/** Pitch deck status enum */
export enum DeckStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

/** Metric type enum */
export enum MetricType {
  REVENUE = 'REVENUE',
  USERS = 'USERS',
  GROWTH = 'GROWTH',
  OTHER = 'OTHER',
}

/** Metric visibility enum */
export enum MetricVisibility {
  PUBLIC = 'PUBLIC',
  RESTRICTED = 'RESTRICTED',
  PRIVATE = 'PRIVATE',
}

/** Connection request status enum */
export enum ConnectionStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
  BLOCKED = 'BLOCKED',
}

/** Message status enum */
export enum MessageStatus {
  ACTIVE = 'ACTIVE',
  REPORTED = 'REPORTED',
  REMOVED = 'REMOVED',
}

/** Notification type enum */
export enum NotificationType {
  CONNECTION_REQUEST = 'CONNECTION_REQUEST',
  CONNECTION_ACCEPTED = 'CONNECTION_ACCEPTED',
  CONNECTION_REJECTED = 'CONNECTION_REJECTED',
  NEW_MESSAGE = 'NEW_MESSAGE',
  SYSTEM = 'SYSTEM',
}

/** Report status enum */
export enum ReportStatus {
  OPEN = 'OPEN',
  IN_REVIEW = 'IN_REVIEW',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

/** Report target type enum */
export enum ReportTargetType {
  USER = 'USER',
  STARTUP = 'STARTUP',
  MESSAGE = 'MESSAGE',
}

/** Verification level enum */
export enum VerificationLevel {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  IDENTITY = 'IDENTITY',
  BUSINESS = 'BUSINESS',
}

/** Verification status enum */
export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

/** Category type enum */
export enum CategoryType {
  SECTOR = 'SECTOR',
  STAGE = 'STAGE',
  INVESTOR_TYPE = 'INVESTOR_TYPE',
}

/** Match factor enum for explainable matching */
export enum MatchFactor {
  SECTOR = 'SECTOR',
  STAGE = 'STAGE',
  TICKET_SIZE = 'TICKET_SIZE',
  GEOGRAPHY = 'GEOGRAPHY',
  BUSINESS_MODEL = 'BUSINESS_MODEL',
  OTHER = 'OTHER',
}