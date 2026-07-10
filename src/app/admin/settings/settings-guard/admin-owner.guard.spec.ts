import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, isObservable, firstValueFrom } from 'rxjs';
import { adminOwnerGuard } from './admin-owner.guard';
import { AuthService } from '../../../core/services/auth.service';

describe('adminOwnerGuard', () => {
  let mockAuth: Partial<AuthService>;
  let router: Router;

  const run = async () => {
    const result = TestBed.runInInjectionContext(() =>
      adminOwnerGuard({} as never, { url: '/admin/settings' } as never)
    );
    return isObservable(result) ? firstValueFrom(result) : result;
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    mockAuth = { isAuthenticated: () => of(true), hasAnyRole: vi.fn().mockReturnValue(true) };
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: AuthService, useValue: mockAuth }] });
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('allows access for AdminOwner', async () => {
    expect(await run()).toBe(true);
  });

  it('redirects to /admin for a non-AdminOwner tenant admin', async () => {
    (mockAuth.hasAnyRole as ReturnType<typeof vi.fn>).mockReturnValue(false);
    expect(await run()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('redirects to /login when unauthenticated', async () => {
    mockAuth.isAuthenticated = () => of(false);
    expect(await run()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/admin/settings' } });
  });
});
