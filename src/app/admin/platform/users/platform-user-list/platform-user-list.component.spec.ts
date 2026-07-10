import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PlatformUserListComponent } from './platform-user-list.component';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { ToastService } from '../../../shared/services/toast.service';
import { PlatformUserDto } from '../../models/platform.model';

describe('PlatformUserListComponent', () => {
  let fixture: ComponentFixture<PlatformUserListComponent>;
  let component: PlatformUserListComponent;
  let mockPlatform: Partial<PlatformAdminService>;
  let mockToast: Partial<ToastService>;

  const user: PlatformUserDto = {
    id: 'u1',
    firstName: 'Super',
    lastName: 'Admin',
    email: 'x@y.com',
    tenantId: null,
    isActive: false,
    roles: ['SuperAdmin'],
    createdAt: '2026-01-01',
  };
  const user2: PlatformUserDto = { ...user, id: 'u2', email: 'z@y.com', isActive: true };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockPlatform = {
      getPlatformUsers: vi.fn().mockReturnValue(
        of({ items: [user, user2], totalCount: 2, page: 1, pageSize: 20, totalPages: 1 })
      ),
      unlockPlatformUser: vi.fn().mockReturnValue(of({ ...user, isActive: true })),
    };
    mockToast = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [PlatformUserListComponent],
      providers: [{ provide: PlatformAdminService, useValue: mockPlatform }, { provide: ToastService, useValue: mockToast }],
    }).compileComponents();
    fixture = TestBed.createComponent(PlatformUserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads a paged platform user list on init', () => {
    expect(mockPlatform.getPlatformUsers).toHaveBeenCalledWith(1, 20);
    expect(component.users.length).toBe(2);
    expect(component.totalCount).toBe(2);
  });

  it('renders exactly one row per user (no duplicate rendering)', () => {
    const rows = fixture.nativeElement.querySelectorAll('table tbody tr');
    expect(rows.length).toBe(component.users.length);
    expect(rows.length).toBe(2);
  });

  it('unlocks a locked user', () => {
    component.onUnlock(user);
    expect(mockPlatform.unlockPlatformUser).toHaveBeenCalledWith('u1');
  });

  it('re-queries with the new page when pagination changes', () => {
    (mockPlatform.getPlatformUsers as ReturnType<typeof vi.fn>).mockClear();
    component.onPageChange(2);
    expect(mockPlatform.getPlatformUsers).toHaveBeenCalledWith(2, 20);
  });
});
