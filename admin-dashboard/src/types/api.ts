export type AppRole = 'SECURITY_SEWADAR' | 'SUPER_ADMIN';

export type AppUser = {
  id: number;
  username: string;
  fullName: string;
  role: AppRole;
};

export type LoginResponse = {
  accessToken: string;
  user: AppUser;
};

export type DashboardSummary = {
  counters: {
    foundItemTotal: number;
    lostReportTotal: number;
  };
  foundByStatus: Array<{ status: string; _count: { _all: number } }>;
  lostByStatus: Array<{ status: string; _count: { _all: number } }>;
  recentFound: Array<{ id: number; itemCode: string; itemName: string; status: string; createdAt: string }>;
  recentLost: Array<{ id: number; reportCode: string; itemName: string; status: string; createdAt: string }>;
};

export type PaginatedResponse<T> = {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
} & T;

export type AdminUser = {
  id: number;
  username: string;
  fullName: string;
  phone?: string | null;
  role: AppRole;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ActivityLog = {
  id: number;
  userId?: number | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    fullName: string;
    role: AppRole;
  } | null;
};

export type Category = {
  id: number;
  name: string;
  description?: string | null;
  isActive: boolean;
};

export type Location = {
  id: number;
  name: string;
  description?: string | null;
  isActive: boolean;
};

export type HealthResponse = {
  status: string;
  service: string;
  timestamp: string;
};

export type IncidentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type Incident = {
  id: number;
  incidentCode: string;
  title: string;
  description?: string | null;
  priority: IncidentPriority;
  location: string;
  incidentAt: string;
  reporterName: string;
  reporterContact: string;
  status: IncidentStatus;
  createdAt: string;
  category?: Category | null;
  createdBy?: {
    id: number;
    username: string;
    fullName: string;
  };
};