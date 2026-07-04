import { describe, it, expect } from 'vitest';
import { adminRoutes } from './admin.routes';
import { adminRoleGuard } from '../features/auth/guards/admin-role.guard';

describe('admin routes configuration', () => {
  it('guards the root admin route with adminRoleGuard', () => {
    const root = adminRoutes.find((r) => r.path === '')!;
    expect(root.canActivate).toContain(adminRoleGuard);
  });

  it('lazily loads dashboard, orders, catalog, inventory, customers, discounts, reviews, reports, settings, and platform', () => {
    const expectedPaths = [
      '', 'orders', 'catalog', 'inventory', 'customers', 'discounts', 'reviews', 'reports', 'settings', 'platform',
    ];
    const root = adminRoutes.find((r) => r.path === '')!;
    const childPaths = root.children!.map((c) => c.path);
    for (const p of expectedPaths) {
      expect(childPaths).toContain(p);
    }
  });

  it('every child route (except platform, which nests its own children) lazy-loads a component or children', () => {
    const root = adminRoutes.find((r) => r.path === '')!;
    for (const child of root.children!) {
      if (child.path === 'platform') {
        expect(typeof child.loadChildren).toBe('function');
      } else {
        expect(typeof child.loadComponent === 'function' || typeof child.loadChildren === 'function').toBe(true);
      }
    }
  });
});
