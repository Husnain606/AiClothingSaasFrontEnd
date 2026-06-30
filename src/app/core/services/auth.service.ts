import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { LoginRequest, LoginResponse, RegisterRequest, CurrentUser } from '../../features/auth/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser$ = new BehaviorSubject<CurrentUser | null>(null);
  private isAuthenticated$ = new BehaviorSubject<boolean>(false);

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
        this.setToken(loginResponse.accessToken);
        this.isAuthenticated$.next(true);
        this.loadCurrentUser();
      }),
      map((response: ApiResponse<LoginResponse>) => response.data)
    );
  }

  register(request: RegisterRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('auth/register', request).pipe(
      tap((response: ApiResponse<LoginResponse>) => {
        const loginResponse = response.data;
        this.setToken(loginResponse.accessToken);
        this.isAuthenticated$.next(true);
        this.loadCurrentUser();
      }),
      map((response: ApiResponse<LoginResponse>) => response.data)
    );
  }

  logout(): void {
    this.clearToken();
    this.isAuthenticated$.next(false);
    this.currentUser$.next(null);
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
          roles: payload.roles || [],
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
