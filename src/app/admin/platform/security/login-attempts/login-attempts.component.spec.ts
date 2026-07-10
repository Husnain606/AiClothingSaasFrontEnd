import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { LoginAttemptsComponent } from './login-attempts.component';
import { PlatformAdminService } from '../../services/platform-admin.service';

describe('LoginAttemptsComponent', () => {
  let fixture: ComponentFixture<LoginAttemptsComponent>;
  let component: LoginAttemptsComponent;
  let mockPlatform: Partial<PlatformAdminService>;

  const attempt = { id: 'l1', email: 'a@b.com', ipAddress: '1.1.1.1', isSuccess: false, failureReason: 'bad password', createdAt: '2026-07-01' };
  const attempt2 = { ...attempt, id: 'l2', isSuccess: true, failureReason: null };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockPlatform = {
      getLoginAttempts: vi.fn().mockReturnValue(
        of({ items: [attempt, attempt2], totalCount: 2, page: 1, pageSize: 50, totalPages: 1 })
      ),
    };

    await TestBed.configureTestingModule({
      imports: [LoginAttemptsComponent],
      providers: [{ provide: PlatformAdminService, useValue: mockPlatform }],
    }).compileComponents();
    fixture = TestBed.createComponent(LoginAttemptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not search on init (email is required, no default search)', () => {
    expect(mockPlatform.getLoginAttempts).not.toHaveBeenCalled();
    expect(component.attempts.length).toBe(0);
  });

  it('disables search while the email is empty', () => {
    expect(component.canSearch).toBe(false);
  });

  it('does not call the API when searching with an empty email', () => {
    component.onSearch();
    expect(mockPlatform.getLoginAttempts).not.toHaveBeenCalled();
  });

  it('searches with the entered email once submitted', () => {
    component.emailInput = 'a@b.com';
    expect(component.canSearch).toBe(true);
    component.onSearch();
    expect(mockPlatform.getLoginAttempts).toHaveBeenCalledWith({ email: 'a@b.com' }, 1, 50);
    expect(component.attempts.length).toBe(2);
    expect(component.totalCount).toBe(2);
  });

  it('renders exactly one row per attempt after a search (no duplicate rendering)', () => {
    component.emailInput = 'a@b.com';
    component.onSearch();
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('table tbody tr');
    expect(rows.length).toBe(component.attempts.length);
    expect(rows.length).toBe(2);
  });

  it('re-queries with the new page when pagination changes', () => {
    component.emailInput = 'a@b.com';
    component.onSearch();
    (mockPlatform.getLoginAttempts as ReturnType<typeof vi.fn>).mockClear();
    component.onPageChange(2);
    expect(mockPlatform.getLoginAttempts).toHaveBeenCalledWith({ email: 'a@b.com' }, 2, 50);
  });
});
