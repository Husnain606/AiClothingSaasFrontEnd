import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { LoginResponse } from '../../features/auth/models/auth.model';

function makeToken(roles: string[], overrides: Record<string, unknown> = {}): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: 'user-1',
    email: 'admin@example.com',
    role: roles.length === 1 ? roles[0] : roles,
    tenant_id: 'tenant-1',
    mfa_verified: 'false',
    ...overrides,
  };
  const encode = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encode(header)}.${encode(payload)}.signature`;
}

describe('AuthService — role parsing and redirect', () => {
  let service: AuthService;
  let mockApiService: Partial<ApiService>;

  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();

    mockApiService = { post: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: mockApiService },
        { provide: HttpClient, useValue: {} },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  it('returns no roles when there is no token', () => {
    expect(service.getRoles()).toEqual([]);
  });

  it('parses a single role claim into a one-element array', () => {
    service.setToken(makeToken(['AdminOwner']));
    expect(service.getRoles()).toEqual(['AdminOwner']);
  });

  it('parses a multi-role claim array', () => {
    service.setToken(makeToken(['AdminOwner', 'StoreManager']));
    expect(service.getRoles()).toEqual(['AdminOwner', 'StoreManager']);
  });

  it('hasAnyRole matches when at least one role overlaps', () => {
    service.setToken(makeToken(['StoreManager']));
    expect(service.hasAnyRole(['AdminOwner', 'StoreManager'])).toBe(true);
  });

  it('hasAnyRole is false when there is no overlap', () => {
    service.setToken(makeToken(['Customer']));
    expect(service.hasAnyRole(['AdminOwner'])).toBe(false);
  });

  it('isSuperAdmin is true only for SuperAdmin role', () => {
    service.setToken(makeToken(['SuperAdmin']));
    expect(service.isSuperAdmin()).toBe(true);
    expect(service.isTenantAdmin()).toBe(false);
  });

  it('isTenantAdmin is true for any tenant-admin role', () => {
    service.setToken(makeToken(['InventoryManager']));
    expect(service.isTenantAdmin()).toBe(true);
    expect(service.isSuperAdmin()).toBe(false);
  });

  it('postLoginRedirectPath routes SuperAdmin to /admin/platform', () => {
    service.setToken(makeToken(['SuperAdmin']));
    expect(service.postLoginRedirectPath()).toBe('/admin/platform');
  });

  it('postLoginRedirectPath routes tenant admin roles to /admin', () => {
    service.setToken(makeToken(['OrderManager']));
    expect(service.postLoginRedirectPath()).toBe('/admin');
  });

  it('postLoginRedirectPath routes Customer to /products', () => {
    service.setToken(makeToken(['Customer']));
    expect(service.postLoginRedirectPath()).toBe('/products');
  });

  it('postLoginRedirectPath routes a role-less token to /products', () => {
    service.setToken(makeToken([]));
    expect(service.postLoginRedirectPath()).toBe('/products');
  });

  it('loginMfa posts to auth/login/mfa and stores the returned access token', () => {
    const response: LoginResponse = {
      accessToken: makeToken(['SuperAdmin']),
      refreshToken: null,
      mfaRequired: false,
      mfaToken: null,
    };
    (mockApiService.post as ReturnType<typeof vi.fn>).mockReturnValue(
      of({ statusCode: 200, message: 'ok', data: response, errors: null, timestamp: '' })
    );

    service.loginMfa({ mfaToken: 'challenge-token', code: '123456' }).subscribe((result) => {
      expect(result.accessToken).toBe(response.accessToken);
    });

    expect(mockApiService.post).toHaveBeenCalledWith('auth/login/mfa', {
      mfaToken: 'challenge-token',
      code: '123456',
    });
    expect(service.getToken()).toBe(response.accessToken);
  });

  it('logout emits loggedOut$ and clears the token (NotificationHubService disconnects via this event)', () => {
    service.setToken(makeToken(['Customer']));
    const loggedOutEvents: void[] = [];
    service.loggedOut$.subscribe((event) => loggedOutEvents.push(event));

    service.logout();

    expect(loggedOutEvents.length).toBe(1);
    expect(service.getToken()).toBeNull();
  });
});
