import {
  ConnectionStatus,
  InvestorType,
  MessageStatus,
  MetricType,
  MetricVisibility,
  NotificationType,
  StartupStage,
  StartupStatus,
  UserRole,
  UserStatus,
} from './enums';
import type {
  FounderProfile,
  InvestorProfile,
  Startup,
  User,
  ConnectionRequest,
  Conversation,
  Message,
  Notification,
  InvestmentPreference,
} from './types';

/** Mock current user for demo purposes */
export const currentUser: User = {
  id: 'user-001',
  email: 'founder@fundrhub.com',
  role: UserRole.FOUNDER,
  status: UserStatus.ACTIVE,
  createdAt: '2025-01-10T10:00:00Z',
  updatedAt: '2025-06-15T14:30:00Z',
  founderProfile: {
    id: 'founder-001',
    userId: 'user-001',
    name: 'Ashutosh Singh',
    bio: 'Serial entrepreneur building FundrHub. 10+ years in SaaS and marketplace products.',
    location: 'Bengaluru, India',
    experience: 'Founded 2 startups. Previously led product at a fintech unicorn.',
    links: {
      linkedin: 'https://linkedin.com/in/ashutosh',
      twitter: 'https://twitter.com/ashutosh',
    },
    completeness: 85,
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-06-15T14:30:00Z',
  } as FounderProfile,
};

/** Mock investor user */
export const investorUser: User = {
  id: 'user-002',
  email: 'investor@fundrhub.com',
  role: UserRole.INVESTOR,
  status: UserStatus.ACTIVE,
  createdAt: '2025-02-01T09:00:00Z',
  updatedAt: '2025-07-10T11:00:00Z',
  investorProfile: {
    id: 'investor-001',
    userId: 'user-002',
    investorType: InvestorType.ANGEL,
    bio: 'Angel investor focused on early-stage SaaS and fintech startups across India.',
    location: 'Mumbai, India',
    portfolioSummary: 'Invested in 8 startups across fintech, SaaS and healthtech.',
    completeness: 90,
    createdAt: '2025-02-01T09:00:00Z',
    updatedAt: '2025-07-10T11:00:00Z',
    preferences: {
      id: 'pref-001',
      investorId: 'investor-001',
      sectors: ['SAAS', 'FINTECH'],
      stages: [StartupStage.SEED, StartupStage.EARLY],
      geographies: ['INDIA', 'SOUTHEAST_ASIA'],
      minTicket: 100000,
      maxTicket: 1000000,
      createdAt: '2025-02-01T09:00:00Z',
      updatedAt: '2025-07-10T11:00:00Z',
    } as InvestmentPreference,
  } as InvestorProfile,
};

/** Mock startups */
export const mockStartups: Startup[] = [
  {
    id: 'startup-001',
    ownerUserId: 'user-001',
    name: 'FundrHub',
    slug: 'fundrhub',
    description:
      'Structured founder-investor discovery and connection platform. We make fundraising discovery searchable, relevant and efficient.',
    problem:
      'Founders waste months finding the right investors through unstructured networking and cold outreach.',
    solution:
      'Structured profiles, compatibility-based matching and controlled connection flows that reduce irrelevant outreach.',
    sector: 'FINTECH',
    stage: StartupStage.SEED,
    location: 'Bengaluru, India',
    businessModel: 'Subscription + featured listings for startups; premium tools for investors.',
    status: StartupStatus.PUBLISHED,
    owner: { id: 'user-001', name: 'Ashutosh Singh' },
    fundingRound: {
      id: 'round-001',
      startupId: 'startup-001',
      amountSought: 500000,
      valuation: 5000000,
      equityOffered: 10,
      useOfFunds: 'Product development, team expansion and go-to-market.',
      createdAt: '2025-03-01T10:00:00Z',
      updatedAt: '2025-08-01T10:00:00Z',
    },
    teamMembers: [
      {
        id: 'member-001',
        startupId: 'startup-001',
        name: 'Ashutosh Singh',
        role: 'Founder & CEO',
        bio: '10+ years in SaaS and marketplaces.',
        profileLink: 'https://linkedin.com/in/ashutosh',
      },
      {
        id: 'member-002',
        startupId: 'startup-001',
        name: 'Priya Sharma',
        role: 'CTO',
        bio: 'Ex-Google engineer. Expert in distributed systems.',
        profileLink: 'https://linkedin.com/in/priya',
      },
    ],
    metrics: [
      {
        id: 'metric-001',
        startupId: 'startup-001',
        metricType: MetricType.REVENUE,
        value: 25000,
        period: '2025-Q2',
        visibility: MetricVisibility.RESTRICTED,
      },
      {
        id: 'metric-002',
        startupId: 'startup-001',
        metricType: MetricType.USERS,
        value: 2500,
        period: '2025-Q2',
        visibility: MetricVisibility.PUBLIC,
      },
    ],
    createdAt: '2025-03-01T10:00:00Z',
    updatedAt: '2025-08-01T10:00:00Z',
    amountSought: 500000,
  },
  {
    id: 'startup-002',
    ownerUserId: 'user-003',
    name: 'HealthNow',
    slug: 'healthnow',
    description:
      'AI-powered preventive healthcare platform that helps users manage chronic conditions with personalized insights.',
    problem:
      'Chronic disease management is fragmented and reactive. Patients lack a unified view of their health.',
    solution:
      'Aggregates health data from wearables and labs to deliver personalized, actionable preventive care plans.',
    sector: 'HEALTHTECH',
    stage: StartupStage.EARLY,
    location: 'Delhi, India',
    businessModel: 'B2C subscription + B2B employer wellness programs.',
    status: StartupStatus.PUBLISHED,
    owner: { id: 'user-003', name: 'Rahul Verma' },
    fundingRound: {
      id: 'round-002',
      startupId: 'startup-002',
      amountSought: 2000000,
      valuation: 15000000,
      equityOffered: 12,
      useOfFunds: 'Clinical validation, product expansion and sales team.',
      createdAt: '2025-04-15T10:00:00Z',
      updatedAt: '2025-07-20T10:00:00Z',
    },
    teamMembers: [
      {
        id: 'member-003',
        startupId: 'startup-002',
        name: 'Rahul Verma',
        role: 'Co-Founder & CEO',
        bio: 'Ex-PharmEasy, healthcare domain expert.',
      },
    ],
    metrics: [
      {
        id: 'metric-003',
        startupId: 'startup-002',
        metricType: MetricType.REVENUE,
        value: 180000,
        period: '2025-Q2',
        visibility: MetricVisibility.RESTRICTED,
      },
    ],
    createdAt: '2025-04-15T10:00:00Z',
    updatedAt: '2025-07-20T10:00:00Z',
    amountSought: 2000000,
  },
  {
    id: 'startup-003',
    ownerUserId: 'user-004',
    name: 'LogiSwift',
    slug: 'logiswift',
    description:
      'Last-mile logistics optimization platform for e-commerce, reducing delivery costs by up to 30% with AI route planning.',
    problem:
      'Last-mile delivery is the most expensive part of e-commerce logistics, with inefficient routes and high failed-delivery rates.',
    solution:
      'AI-powered route optimization, real-time tracking and delivery prediction that cuts costs and improves success rates.',
    sector: 'SAAS',
    stage: StartupStage.GROWTH,
    location: 'Hyderabad, India',
    businessModel: 'Per-delivery SaaS fee + enterprise licensing.',
    status: StartupStatus.PUBLISHED,
    owner: { id: 'user-004', name: 'Ananya Patel' },
    fundingRound: {
      id: 'round-003',
      startupId: 'startup-003',
      amountSought: 5000000,
      valuation: 40000000,
      equityOffered: 8,
      useOfFunds: 'Sales expansion, R&D for AI models, and customer success.',
      createdAt: '2025-05-01T10:00:00Z',
      updatedAt: '2025-08-05T10:00:00Z',
    },
    teamMembers: [
      {
        id: 'member-004',
        startupId: 'startup-003',
        name: 'Ananya Patel',
        role: 'CEO',
        bio: 'Supply chain expert, ex-Flipkart.',
      },
    ],
    metrics: [
      {
        id: 'metric-004',
        startupId: 'startup-003',
        metricType: MetricType.REVENUE,
        value: 1200000,
        period: '2025-Q2',
        visibility: MetricVisibility.RESTRICTED,
      },
      {
        id: 'metric-005',
        startupId: 'startup-003',
        metricType: MetricType.GROWTH,
        value: 45,
        period: '2025-Q2',
        visibility: MetricVisibility.PUBLIC,
      },
    ],
    createdAt: '2025-05-01T10:00:00Z',
    updatedAt: '2025-08-05T10:00:00Z',
    amountSought: 5000000,
  },
];

/** Mock investor profiles */
export const mockInvestors: InvestorProfile[] = [
  {
    id: 'investor-001',
    userId: 'user-002',
    investorType: InvestorType.ANGEL,
    bio: 'Angel investor focused on early-stage SaaS and fintech startups across India and Southeast Asia.',
    location: 'Mumbai, India',
    portfolioSummary: 'Invested in 8 startups across fintech, SaaS and healthtech.',
    completeness: 90,
    createdAt: '2025-02-01T09:00:00Z',
    updatedAt: '2025-07-10T11:00:00Z',
    preferences: {
      id: 'pref-001',
      investorId: 'investor-001',
      sectors: ['SAAS', 'FINTECH'],
      stages: [StartupStage.SEED, StartupStage.EARLY],
      geographies: ['INDIA', 'SOUTHEAST_ASIA'],
      minTicket: 100000,
      maxTicket: 1000000,
      createdAt: '2025-02-01T09:00:00Z',
      updatedAt: '2025-07-10T11:00:00Z',
    },
  },
  {
    id: 'investor-002',
    userId: 'user-005',
    investorType: InvestorType.VC,
    bio: 'Venture capital firm investing in early to growth-stage technology companies in India.',
    location: 'Bengaluru, India',
    portfolioSummary: '25+ portfolio companies across SaaS, fintech, healthtech and logistics.',
    completeness: 95,
    createdAt: '2025-01-20T09:00:00Z',
    updatedAt: '2025-07-15T11:00:00Z',
    preferences: {
      id: 'pref-002',
      investorId: 'investor-002',
      sectors: ['SAAS', 'FINTECH', 'HEALTHTECH', 'LOGISTICS'],
      stages: [StartupStage.EARLY, StartupStage.GROWTH],
      geographies: ['INDIA'],
      minTicket: 500000,
      maxTicket: 10000000,
      createdAt: '2025-01-20T09:00:00Z',
      updatedAt: '2025-07-15T11:00:00Z',
    },
  },
  {
    id: 'investor-003',
    userId: 'user-006',
    investorType: InvestorType.ACCELERATOR,
    bio: 'Early-stage accelerator supporting pre-seed and seed startups with capital, mentorship and network.',
    location: 'Singapore',
    portfolioSummary: '60+ startups accelerated across Southeast Asia and India.',
    completeness: 80,
    createdAt: '2025-03-10T09:00:00Z',
    updatedAt: '2025-06-20T11:00:00Z',
    preferences: {
      id: 'pref-003',
      investorId: 'investor-003',
      sectors: ['SAAS', 'HEALTHTECH', 'EDTECH'],
      stages: [StartupStage.IDEA, StartupStage.SEED],
      geographies: ['INDIA', 'SOUTHEAST_ASIA'],
      minTicket: 50000,
      maxTicket: 250000,
      createdAt: '2025-03-10T09:00:00Z',
      updatedAt: '2025-06-20T11:00:00Z',
    },
  },
];

/** Mock connection requests */
export const mockConnections: ConnectionRequest[] = [
  {
    id: 'conn-001',
    senderId: 'user-005',
    recipientId: 'user-001',
    startupId: 'startup-001',
    status: ConnectionStatus.PENDING,
    message:
      'I came across FundrHub in your discovery feed. Your approach to structured fundraising is compelling. Would love to discuss synergies with our portfolio.',
    sender: { id: 'user-005', name: 'Summit Capital' },
    recipient: { id: 'user-001', name: 'Ashutosh Singh' },
    startup: { id: 'startup-001', name: 'FundrHub' },
    createdAt: '2025-08-10T09:00:00Z',
    updatedAt: '2025-08-10T09:00:00Z',
  },
  {
    id: 'conn-002',
    senderId: 'user-001',
    recipientId: 'user-002',
    startupId: 'startup-001',
    status: ConnectionStatus.ACCEPTED,
    message: 'Following up on your interest. I would love to walk you through the FundrHub platform.',
    sender: { id: 'user-001', name: 'Ashutosh Singh' },
    recipient: { id: 'user-002', name: 'Ananya Angel' },
    startup: { id: 'startup-001', name: 'FundrHub' },
    createdAt: '2025-07-15T10:00:00Z',
    updatedAt: '2025-07-16T10:00:00Z',
  },
  {
    id: 'conn-003',
    senderId: 'user-003',
    recipientId: 'user-005',
    startupId: 'startup-002',
    status: ConnectionStatus.PENDING,
    message:
      'HealthNow is expanding across India. We would value your expertise in healthcare investments.',
    sender: { id: 'user-003', name: 'Rahul Verma' },
    recipient: { id: 'user-005', name: 'Summit Capital' },
    startup: { id: 'startup-002', name: 'HealthNow' },
    createdAt: '2025-08-12T14:00:00Z',
    updatedAt: '2025-08-12T14:00:00Z',
  },
];

/** Mock conversations */
export const mockConversations: Conversation[] = [
  {
    id: 'conv-001',
    connectionRequestId: 'conn-002',
    otherUser: { id: 'user-002', name: 'Ananya Angel' },
    lastMessage: {
      id: 'msg-005',
      conversationId: 'conv-001',
      senderId: 'user-002',
      body: 'Looking forward to the demo call next week.',
      createdAt: '2025-08-14T11:00:00Z',
      updatedAt: '2025-08-14T11:00:00Z',
      status: MessageStatus.ACTIVE,
    },
    unreadCount: 1,
    createdAt: '2025-07-16T10:00:00Z',
    updatedAt: '2025-08-14T11:00:00Z',
  },
  {
    id: 'conv-002',
    connectionRequestId: 'conn-001',
    otherUser: { id: 'user-005', name: 'Summit Capital' },
    lastMessage: {
      id: 'msg-006',
      conversationId: 'conv-002',
      senderId: 'user-001',
      body: 'Happy to share our latest metrics and deck.',
      createdAt: '2025-08-11T10:00:00Z',
      updatedAt: '2025-08-11T10:00:00Z',
      status: MessageStatus.ACTIVE,
    },
    unreadCount: 0,
    createdAt: '2025-08-10T09:00:00Z',
    updatedAt: '2025-08-11T10:00:00Z',
  },
];

/** Mock messages for conversation 1 */
export const mockMessages: Record<string, Message[]> = {
  'conv-001': [
    {
      id: 'msg-001',
      conversationId: 'conv-001',
      senderId: 'user-001',
      body: 'Hi Ananya, thanks for accepting my connection request!',
      createdAt: '2025-07-16T10:05:00Z',
      updatedAt: '2025-07-16T10:05:00Z',
      status: MessageStatus.ACTIVE,
    },
    {
      id: 'msg-002',
      conversationId: 'conv-001',
      senderId: 'user-002',
      body: 'Hi Ashutosh! Glad to connect. Your platform looks interesting.',
      createdAt: '2025-07-16T10:10:00Z',
      updatedAt: '2025-07-16T10:10:00Z',
      status: MessageStatus.ACTIVE,
    },
    {
      id: 'msg-003',
      conversationId: 'conv-001',
      senderId: 'user-001',
      body: 'Would you be open to a quick demo next week? I can walk you through the matching engine.',
      createdAt: '2025-07-20T14:00:00Z',
      updatedAt: '2025-07-20T14:00:00Z',
      status: MessageStatus.ACTIVE,
    },
    {
      id: 'msg-004',
      conversationId: 'conv-001',
      senderId: 'user-002',
      body: 'Absolutely, let me check my calendar. How about Tuesday 3 PM?',
      createdAt: '2025-07-21T09:30:00Z',
      updatedAt: '2025-07-21T09:30:00Z',
      status: MessageStatus.ACTIVE,
    },
    {
      id: 'msg-005',
      conversationId: 'conv-001',
      senderId: 'user-002',
      body: 'Looking forward to the demo call next week.',
      createdAt: '2025-08-14T11:00:00Z',
      updatedAt: '2025-08-14T11:00:00Z',
      status: MessageStatus.ACTIVE,
    },
  ],
  'conv-002': [
    {
      id: 'msg-006',
      conversationId: 'conv-002',
      senderId: 'user-005',
      body: 'Hi, we reviewed your startup profile. We have some questions about the matching algorithm.',
      createdAt: '2025-08-10T09:30:00Z',
      updatedAt: '2025-08-10T09:30:00Z',
      status: MessageStatus.ACTIVE,
    },
    {
      id: 'msg-007',
      conversationId: 'conv-002',
      senderId: 'user-001',
      body: 'Happy to share our latest metrics and deck.',
      createdAt: '2025-08-11T10:00:00Z',
      updatedAt: '2025-08-11T10:00:00Z',
      status: MessageStatus.ACTIVE,
    },
  ],
};

/** Mock notifications */
export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    userId: 'user-001',
    type: NotificationType.CONNECTION_REQUEST,
    payload: { connectionId: 'conn-001', senderName: 'Summit Capital' },
    createdAt: '2025-08-10T09:00:00Z',
  },
  {
    id: 'notif-002',
    userId: 'user-001',
    type: NotificationType.CONNECTION_ACCEPTED,
    payload: { connectionId: 'conn-002', senderName: 'Ananya Angel' },
    readAt: '2025-07-16T10:00:00Z',
    createdAt: '2025-07-16T10:00:00Z',
  },
  {
    id: 'notif-003',
    userId: 'user-001',
    type: NotificationType.NEW_MESSAGE,
    payload: { conversationId: 'conv-001', senderName: 'Ananya Angel' },
    createdAt: '2025-08-14T11:00:00Z',
  },
  {
    id: 'notif-004',
    userId: 'user-001',
    type: NotificationType.SYSTEM,
    payload: { message: 'Your startup FundrHub has been approved and published.' },
    readAt: '2025-08-01T10:00:00Z',
    createdAt: '2025-08-01T10:00:00Z',
  },
];

/** Sector options */
export const SECTOR_OPTIONS = [
  'FINTECH',
  'SAAS',
  'HEALTHTECH',
  'EDTECH',
  'LOGISTICS',
  'E-COMMERCE',
  'AI',
  'CLEANTECH',
  'CONSUMER',
  'ENTERPRISE',
  'OTHER',
];

/** Geography options */
export const GEOGRAPHY_OPTIONS = [
  'INDIA',
  'SOUTHEAST_ASIA',
  'MIDDLE_EAST',
  'NORTH_AMERICA',
  'EUROPE',
  'GLOBAL',
];

/** Investor type labels */
export const INVESTOR_TYPE_LABELS: Record<InvestorType, string> = {
  [InvestorType.ANGEL]: 'Angel',
  [InvestorType.VC]: 'Venture Capital',
  [InvestorType.ACCELERATOR]: 'Accelerator',
  [InvestorType.FAMILY_OFFICE]: 'Family Office',
  [InvestorType.OTHER]: 'Other',
};

/** Stage labels */
export const STAGE_LABELS: Record<StartupStage, string> = {
  [StartupStage.IDEA]: 'Idea',
  [StartupStage.SEED]: 'Seed',
  [StartupStage.EARLY]: 'Early',
  [StartupStage.GROWTH]: 'Growth',
  [StartupStage.LATER]: 'Later',
};

/** Startup status labels */
export const STARTUP_STATUS_LABELS: Record<StartupStatus, string> = {
  [StartupStatus.DRAFT]: 'Draft',
  [StartupStatus.PENDING_REVIEW]: 'Pending Review',
  [StartupStatus.PUBLISHED]: 'Published',
  [StartupStatus.REJECTED]: 'Rejected',
  [StartupStatus.SUSPENDED]: 'Suspended',
};

/** Match weights per documentation */
export const MATCH_WEIGHTS = {
  SECTOR: 30,
  STAGE: 20,
  TICKET_SIZE: 20,
  GEOGRAPHY: 10,
  BUSINESS_MODEL: 10,
  OTHER: 10,
};