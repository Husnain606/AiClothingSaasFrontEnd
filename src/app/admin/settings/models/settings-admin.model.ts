export interface TenantProfileDto {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface UpdateTenantProfileRequest {
  name: string;
  phone?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
}

export interface TenantUserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  tenantId: string | null;
  isActive: boolean;
  roles: string[];
  createdAt: string;
}

export type TenantRole = 'AdminOwner' | 'StoreManager' | 'InventoryManager' | 'OrderManager' | 'ContentManager';

export interface CreateTenantUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: TenantRole;
}

export interface TenantSubscriptionDto {
  id: string;
  tenantId: string;
  planName: string;
  status: string;
  startDate: string;
  endDate: string;
  price: number;
}

export interface TenantPaymentDto {
  id: string;
  tenantId: string;
  subscriptionId: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  status: string;
}

export interface BankAccountDto {
  id: string;
  tenantId: string | null;
  accountTitle: string;
  accountNumber: string; // masked (****1234) unless returned by getBankAccountFull
  bankName: string;
  branchCode: string;
  iban: string;
  isActive: boolean;
}
