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
    mockPlatform = { getLoginAttempts: vi.fn().mockReturnValue(of([attempt, attempt2])) };

    await TestBed.configureTestingModule({
      imports: [LoginAttemptsComponent],
      providers: [{ provide: PlatformAdminService, useValue: mockPlatform }],
    }).compileComponents();
    fixture = TestBed.createComponent(LoginAttemptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads login attempts on init', () => {
    expect(mockPlatform.getLoginAttempts).toHaveBeenCalledWith({});
    expect(component.attempts.length).toBe(2);
  });

  it('renders exactly one row per attempt (no duplicate rendering)', () => {
    const rows = fixture.nativeElement.querySelectorAll('table tbody tr');
    expect(rows.length).toBe(component.attempts.length);
    expect(rows.length).toBe(2);
  });

  it('filters by email', () => {
    (mockPlatform.getLoginAttempts as ReturnType<typeof vi.fn>).mockClear();
    component.onEmailFilterChange('a@b.com');
    expect(mockPlatform.getLoginAttempts).toHaveBeenCalledWith({ email: 'a@b.com' });
  });
});
