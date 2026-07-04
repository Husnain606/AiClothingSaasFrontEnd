import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, isObservable, firstValueFrom } from 'rxjs';
import { adminRoleGuard } from './admin-role.guard';
import { AuthService } from '../../../core/services/auth.service';

describe('adminRoleGuard', () => {
  let mockAuth: Partial<AuthService>;
  let router: Router;

  const run = async () => {
    const result = TestBed.runInInjectionContext(() =>
      adminRoleGuard({} as never, { url: '/admin' } as never)
    );
    return isObservable(result) ? firstValueFrom(result) : result;
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    mockAuth = {
      isAuthenticated: () => of(true),
      hasAnyRole: vi.fn().mockReturnValue(true),
    };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: mockAuth }],
    });
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('allows access for an authenticated tenant-admin or SuperAdmin role', async () => {
    const result = await run();
    expect(result).toBe(true);
  });

  it('redirects to /login when not authenticated', async () => {
    mockAuth.isAuthenticated = () => of(false);
    const result = await run();
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/admin' } });
  });

  it('redirects to /products when authenticated but role-less', async () => {
    (mockAuth.hasAnyRole as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const result = await run();
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });
});
