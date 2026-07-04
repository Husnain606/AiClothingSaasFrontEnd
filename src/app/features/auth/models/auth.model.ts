export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string | null;
  refreshToken: string | null;
  mfaRequired: boolean;
  mfaToken: string | null;
}

export interface LoginMfaRequest {
  mfaToken: string;
  code: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type AppRole =
  | 'SuperAdmin'
  | 'AdminOwner'
  | 'StoreManager'
  | 'InventoryManager'
  | 'OrderManager'
  | 'ContentManager'
  | 'Customer';

export interface CurrentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: AppRole[];
}

export const TENANT_ADMIN_ROLES: AppRole[] = [
  'AdminOwner',
  'StoreManager',
  'InventoryManager',
  'OrderManager',
  'ContentManager',
];
