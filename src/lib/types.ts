import type { LucideIcon } from "lucide-react"

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  level: number;
  managerId?: string | null;
  teamId?: string | null;
  image?: string | null;
}

export interface Team {
  id: string;
  name: string;
  description?: string | null;
  leaderId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  industry?: string | null;
  employeeCount?: number | null;
  notes?: string | null;
  createdBy: string;
  assignedTeamId?: string | null;
  isGlobal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  userId: string;
  companyId?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  position?: string | null;
  status: string;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactPermission {
  id: string;
  userId: string;
  contactId: string;
  grantedBy: string;
  grantedAt: Date;
  createdAt: Date;
}

export interface ContactAccessRequest {
  id: string;
  requestedBy: string;
  contactId: string;
  reason?: string;
  status: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DealStage {
  id: string;
  name: string;
  order: number;
  color: string;
  isDefault: boolean;
  isActive: boolean;
  createdBy?: string | null;
  companyOwnerId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExchangeRate {
  id: string;
  date: Date;
  usdToArs: string;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

export type Currency = "USD" | "ARS"

export interface Deal {
  id: string;
  userId: string;
  contactId?: string | null;
  companyId?: string | null;
  title: string;
  currency: string;
  amountUsd?: number | null;
  amountArs?: number | null;
  dollarRate?: number | null;
  exchangeRateId?: string | null;
  stageId: string;
  probability?: number | null;
  expectedCloseDate?: Date | null;
  closedAt?: Date | null;
  lostReason?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DealHistory {
  id: string;
  dealId: string;
  userId: string;
  fromStageId?: string | null;
  toStageId?: string | null;
  changeType: string;
  fieldName?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  notes?: string | null;
  createdAt: Date;
}

export type ViewType = "dashboard" | "requests" | "kanban" | "companies" | "users" | "teams" | "currency" | "settings/branding";

export interface NavigationItem {
  id: ViewType;
  label: string;
  icon: LucideIcon;
  levelRequired?: number;
}

export interface StageStats {
  stageId: string
  stageName: string
  count: number
  totalAmount: number
}

export interface TeamStats {
  teamId: string | null
  teamName: string
  count: number
  totalAmount: number
}

export interface CompanyRequest {
  id: string
  requestedBy: string
  companyId?: string | null
  companyName: string
  email?: string | null
  phone?: string | null
  website?: string | null
  industry?: string | null
  notes?: string | null
  status: string
  requestType: string
  entityType: string
  potentialDuplicateId?: string | null
  submittedData?: Record<string, unknown> | null
  reviewedBy?: string | null
  reviewedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export type RequestType = "manual" | "fuzzy_match"
export type EntityType = "company" | "contact"

export interface DashboardStatsExtended {
  openNegotiations: {
    count: number
    amount: number
  }
  ongoingProjects: {
    count: number
    amount: number
  }
  finishedProjects: {
    count: number
    amount: number
  }
  lostProjects: {
    count: number
    amount: number
  }
  stageStats: StageStats[]
  teamStats: {
    openNegotiations: TeamStats[]
    ongoingProjects: TeamStats[]
  }
}
