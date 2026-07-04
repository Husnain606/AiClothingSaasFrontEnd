import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, isObservable, firstValueFrom } from 'rxjs';
import { superAdminGuard } from './super-admin.guard';
import { AuthService } from '../../../core/services/auth.service';

describe('superAdminGuard', () => {
  let mockAuth: Partial<AuthService>;
  let router: Router;

  const run = async () => {
    const result = TestBed.runInInjectionContext(() =>
      superAdminGuard({} as never, { url: '/admin/platform' } as never)
    );
    return isObservable(result) ? firstValueFrom(result) : result;
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    mockAuth = {
      isAuthenticated: () => of(true),
      isSuperAdmin: vi.fn().mockReturnValue(true),
    };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: mockAuth }],
    });
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('allows access for an authenticated SuperAdmin', async () => {
    const result = await run();
    expect(result).toBe(true);
  });

  it('redirects to /login when not authenticated', async () => {
    mockAuth.isAuthenticated = () => of(false);
    const result = await run();
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/admin/platform' } });
  });

  it('redirects to /admin when authenticated but not SuperAdmin', async () => {
    (mockAuth.isSuperAdmin as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const result = await run();
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
  });
});
