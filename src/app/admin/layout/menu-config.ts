import { AppRole } from '../../features/auth/models/auth.model';

export interface AdminMenuItem {
  label: string;
  icon: string; // bi-* class suffix, e.g. 'speedometer2'
  path: string; // relative to /admin or /admin/platform
  roles: AppRole[]; // menu item visible iff current user hasAnyRole(roles)
}

export const TENANT_MENU: AdminMenuItem[] = [
  { label: 'Dashboard', icon: 'speedometer2', path: '/admin', roles: ['AdminOwner', 'StoreManager'] },
  { label: 'Orders', icon: 'bag-check', path: '/admin/orders', roles: ['AdminOwner', 'OrderManager', 'StoreManager'] },
  { label: 'Catalog', icon: 'grid', path: '/admin/catalog', roles: ['AdminOwner', 'StoreManager', 'ContentManager'] },
  { label: 'Inventory', icon: 'boxes', path: '/admin/inventory', roles: ['AdminOwner', 'InventoryManager'] },
  { label: 'Customers', icon: 'people', path: '/admin/customers', roles: ['AdminOwner', 'StoreManager'] },
  { label: 'Discounts', icon: 'tag', path: '/admin/discounts', roles: ['AdminOwner', 'StoreManager'] },
  { label: 'Reviews', icon: 'star', path: '/admin/reviews', roles: ['AdminOwner', 'StoreManager'] },
  { label: 'Reports', icon: 'bar-chart', path: '/admin/reports', roles: ['AdminOwner', 'StoreManager'] },
  { label: 'Settings', icon: 'gear', path: '/admin/settings', roles: ['AdminOwner'] },
];

export const PLATFORM_MENU: AdminMenuItem[] = [
  { label: 'Home', icon: 'speedometer2', path: '/admin/platform', roles: ['SuperAdmin'] },
  { label: 'Tenants', icon: 'building', path: '/admin/platform/tenants', roles: ['SuperAdmin'] },
  { label: 'Plans', icon: 'card-list', path: '/admin/platform/plans', roles: ['SuperAdmin'] },
  { label: 'Subscriptions', icon: 'receipt', path: '/admin/platform/subscriptions', roles: ['SuperAdmin'] },
  { label: 'Payments', icon: 'credit-card', path: '/admin/platform/payments', roles: ['SuperAdmin'] },
  { label: 'Platform Users', icon: 'people-fill', path: '/admin/platform/users', roles: ['SuperAdmin'] },
  { label: 'Security', icon: 'shield-lock', path: '/admin/platform/security', roles: ['SuperAdmin'] },
];

export function visibleMenuItems(items: AdminMenuItem[], userRoles: AppRole[]): AdminMenuItem[] {
  return items.filter((item) => item.roles.some((r) => userRoles.includes(r)));
}
