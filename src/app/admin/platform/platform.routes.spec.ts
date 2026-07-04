import { describe, it, expect } from 'vitest';
import { platformRoutes } from './platform.routes';
import { superAdminGuard } from '../../features/auth/guards/super-admin.guard';

describe('platform routes configuration', () => {
  it('guards the platform root with superAdminGuard', () => {
    const root = platformRoutes.find((r) => r.path === '')!;
    expect(root.canActivate).toContain(superAdminGuard);
  });

  it('defines routes for home, tenants, plans, subscriptions, payments, users, security', () => {
    const root = platformRoutes.find((r) => r.path === '')!;
    const paths = root.children!.map((c) => c.path);
    expect(paths).toEqual(
      expect.arrayContaining(['', 'tenants', 'plans', 'subscriptions', 'payments', 'users', 'security'])
    );
  });
});
