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

export interface DealStage {
  id: string;
  name: string;
  order: number;
  color: string;
  isDefault: boolean;
  isActive: boolean;
  createdBy?: string | null;
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

export interface Deal {
  id: string;
  userId: string;
  contactId?: string | null;
  companyId?: string | null;
  title: string;
  currency: string;
  amountUsd?: string | null;
  amountArs?: string | null;
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

export type ViewType = "dashboard" | "kanban" | "companies" | "users" | "currency";

export interface NavigationItem {
  id: ViewType;
  label: string;
  icon: any; // lucide-react icon component
  levelRequired?: number;
}
