export interface TenantDto {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  email: string;
  phone?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
}

export interface UpdateTenantRequest {
  name: string;
  phone?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
}

export interface PlatformUserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  tenantId: string | null;
  isActive: boolean;
  roles: string[];
  createdAt: string;
}

export type SubscriptionPlanType = 'FreeTrial' | 'Monthly' | 'Yearly';

export interface SubscriptionPlanDto {
  id: string;
  planType: SubscriptionPlanType;
  name: string;
  price: number;
  durationDays: number;
  trialDays: number;
  productLimit: number;
  userLimit: number;
  aiUsageLimit: number;
  storageLimitMb: number;
  isActive: boolean;
}

export interface CreatePlanRequest {
  planType: SubscriptionPlanType;
  name: string;
  price: number;
  durationDays: number;
  trialDays: number;
  productLimit: number;
  userLimit: number;
  aiUsageLimit: number;
  storageLimitMb: number;
}

export interface PlatformSubscriptionDto {
  id: string;
  tenantId: string;
  planName: string;
  status: string;
  startDate: string;
  endDate: string;
  price: number;
}

export interface PlatformPaymentDto {
  id: string;
  tenantId: string;
  subscriptionId: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  status: string;
}

export interface AuditLogDto {
  id: string;
  userId: string | null;
  tenantId: string | null;
  action: string;
  entityName: string;
  entityId: string;
  oldValues: string | null;
  newValues: string | null;
  ipAddress: string;
  createdAt: string;
}

export interface LoginAttemptDto {
  id: string;
  email: string;
  ipAddress: string;
  isSuccess: boolean;
  failureReason: string | null;
  createdAt: string;
}

export interface MfaSetupResponse {
  qrCodeUrl: string;
  secretBase32: string;
}

export interface PlatformBankAccountDto {
  id: string;
  tenantId: string | null;
  accountTitle: string;
  accountNumber: string;
  bankName: string;
  branchCode: string;
  iban: string;
  isActive: boolean;
}
