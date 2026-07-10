import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TenantUsersComponent } from './tenant-users.component';
import { SettingsAdminService } from '../services/settings-admin.service';
import { ToastService } from '../../shared/services/toast.service';

describe('TenantUsersComponent', () => {
  let fixture: ComponentFixture<TenantUsersComponent>;
  let component: TenantUsersComponent;
  let mockSettings: Partial<SettingsAdminService>;
  let mockToast: Partial<ToastService>;

  const user = {
    id: 'u1',
    firstName: 'A',
    lastName: 'B',
    email: 'a@b.com',
    tenantId: 't1',
    isActive: true,
    roles: ['StoreManager'],
    createdAt: '2026-01-01',
  };
  const user2 = { ...user, id: 'u2', email: 'c@d.com' };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockSettings = {
      getUsers: vi.fn().mockReturnValue(of([user, user2])),
      createUser: vi.fn().mockReturnValue(of(user)),
      assignRole: vi.fn().mockReturnValue(of({ ...user, roles: ['InventoryManager'] })),
      deleteUser: vi.fn().mockReturnValue(of(undefined)),
    };
    mockToast = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TenantUsersComponent, FormsModule],
      providers: [
        { provide: SettingsAdminService, useValue: mockSettings },
        { provide: ToastService, useValue: mockToast },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(TenantUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads tenant users on init', () => {
    expect(component.users.length).toBe(2);
  });

  it('renders exactly one row per user (no duplicate rendering)', () => {
    const rows = fixture.nativeElement.querySelectorAll('table tbody tr');
    expect(rows.length).toBe(component.users.length);
    expect(rows.length).toBe(2);
  });

  it('creates a new user', () => {
    const request = { email: 'c@d.com', firstName: 'C', lastName: 'D', role: 'OrderManager' as const };
    component.newUser = { ...request };
    component.onCreate();
    expect(mockSettings.createUser).toHaveBeenCalledWith(request);
    expect(mockToast.success).toHaveBeenCalled();
  });

  it('assigns a role to an existing user', () => {
    component.onAssignRole(user as never, 'InventoryManager');
    expect(mockSettings.assignRole).toHaveBeenCalledWith('u1', 'InventoryManager');
    expect(mockToast.success).toHaveBeenCalled();
  });

  it('deletes a user', () => {
    component.onDelete(user as never);
    expect(mockSettings.deleteUser).toHaveBeenCalledWith('u1');
    expect(mockToast.success).toHaveBeenCalled();
  });
});
