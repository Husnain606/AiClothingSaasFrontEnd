import { describe, it, expect } from 'vitest';
import { TENANT_MENU, PLATFORM_MENU, visibleMenuItems } from './menu-config';

describe('visibleMenuItems', () => {
  it('includes an item when the user has one of its required roles', () => {
    const result = visibleMenuItems(TENANT_MENU, ['StoreManager']);
    expect(result.map((i) => i.label)).toContain('Dashboard');
    expect(result.map((i) => i.label)).toContain('Orders');
  });

  it('excludes Settings for non-AdminOwner roles', () => {
    const result = visibleMenuItems(TENANT_MENU, ['StoreManager']);
    expect(result.map((i) => i.label)).not.toContain('Settings');
  });

  it('includes only Inventory-relevant items for InventoryManager', () => {
    const result = visibleMenuItems(TENANT_MENU, ['InventoryManager']);
    expect(result.map((i) => i.label)).toEqual(['Inventory']);
  });

  it('shows every platform item to SuperAdmin', () => {
    const result = visibleMenuItems(PLATFORM_MENU, ['SuperAdmin']);
    expect(result.length).toBe(PLATFORM_MENU.length);
  });

  it('shows no platform items to a tenant-admin role', () => {
    const result = visibleMenuItems(PLATFORM_MENU, ['AdminOwner']);
    expect(result.length).toBe(0);
  });
});
