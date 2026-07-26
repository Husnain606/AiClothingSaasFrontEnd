import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import {
  LoginRequest,
  LoginResponse,
  LoginMfaRequest,
  RegisterRequest,
  CurrentUser,
  AppRole,
  TENANT_ADMIN_ROLES,
} from '../../features/auth/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser$ = new BehaviorSubject<CurrentUser | null>(null);
  private isAuthenticated$ = new BehaviorSubject<boolean>(false);
  private readonly loggedOut = new Subject<void>();

  /**
   * Emits whenever `logout()` runs. `NotificationHubService` subscribes to this to disconnect
   * its SignalR connection — this is a one-way dependency (AuthService knows nothing about the
   * hub) to avoid a circular dependency, since the hub's `accessTokenFactory` already calls back
   * into `AuthService.getToken()`.
   */
  readonly loggedOut$: Observable<void> = this.loggedOut.asObservable();

  constructor(private apiService: ApiService) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getToken();
    if (token) {
      this.isAuthenticated$.next(true);
      this.loadCurrentUser();
    }
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('auth/login', request).pipe(
      tap((response: ApiResponse<LoginResponse>) => {
        const loginResponse = response.data;
        if (loginResponse.accessToken) {
          this.setToken(loginResponse.accessToken);
          this.isAuthenticated$.next(true);
          this.loadCurrentUser();
        }
      }),
      map((response: ApiResponse<LoginResponse>) => response.data)
    );
  }

  loginMfa(request: LoginMfaRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('auth/login/mfa', request).pipe(
      tap((response: ApiResponse<LoginResponse>) => {
        if (response.data.accessToken) {
          this.setToken(response.data.accessToken);
          this.isAuthenticated$.next(true);
          this.loadCurrentUser();
        }
      }),
      map((response: ApiResponse<LoginResponse>) => response.data)
    );
  }

  register(request: RegisterRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('auth/register', request).pipe(
      tap((response: ApiResponse<LoginResponse>) => {
        const loginResponse = response.data;
        if (loginResponse.accessToken) {
          this.setToken(loginResponse.accessToken);
          this.isAuthenticated$.next(true);
          this.loadCurrentUser();
        }
      }),
      map((response: ApiResponse<LoginResponse>) => response.data)
    );
  }

  logout(): void {
    this.clearToken();
    this.isAuthenticated$.next(false);
    this.currentUser$.next(null);
    // Since this is an SPA with no full page reload on logout, anything holding a live
    // connection under the previous user's session (e.g. the SignalR notification hub) must
    // be told to tear down explicitly — see `loggedOut$` above.
    this.loggedOut.next();
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  clearToken(): void {
    localStorage.removeItem('access_token');
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticated$.asObservable();
  }

  getCurrentUser(): Observable<CurrentUser | null> {
    return this.currentUser$.asObservable();
  }

  private static readonly ROLE_CLAIM_TYPE =
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

  getRoles(): AppRole[] {
    const token = this.getToken();
    if (!token) return [];
    try {
      const payload = this.decodeToken(token);
      const raw = payload[AuthService.ROLE_CLAIM_TYPE];
      if (!raw) return [];
      return (Array.isArray(raw) ? raw : [raw]) as AppRole[];
    } catch {
      return [];
    }
  }

  hasAnyRole(roles: AppRole[]): boolean {
    const mine = this.getRoles();
    return roles.some((r) => mine.includes(r));
  }

  isSuperAdmin(): boolean {
    return this.hasAnyRole(['SuperAdmin']);
  }

  isTenantAdmin(): boolean {
    return this.hasAnyRole(TENANT_ADMIN_ROLES);
  }

  postLoginRedirectPath(): string {
    if (this.isSuperAdmin()) return '/admin/platform';
    if (this.isTenantAdmin()) return '/admin';
    return '/products';
  }

  private loadCurrentUser(): void {
    // For MVP, we'll parse the JWT token or fetch from a /me endpoint
    // This is a simplified version that sets current user from auth response
    // In production, you'd decode the JWT or fetch from API
    const token = this.getToken();
    if (token) {
      try {
        // Simple JWT decode (in production use a proper JWT library)
        const payload = this.decodeToken(token);
        const currentUser: CurrentUser = {
          id: payload.sub || '',
          email: payload.email || '',
          firstName: payload.firstName || '',
          lastName: payload.lastName || '',
          roles: this.getRoles(),
        };
        this.currentUser$.next(currentUser);
      } catch (e) {
        console.error('Failed to load current user from token', e);
      }
    }
  }

  private decodeToken(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }
}
