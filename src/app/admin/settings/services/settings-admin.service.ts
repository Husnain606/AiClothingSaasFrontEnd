import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  TenantProfileDto,
  UpdateTenantProfileRequest,
  TenantUserDto,
  CreateTenantUserRequest,
  TenantRole,
  TenantSubscriptionDto,
  TenantPaymentDto,
  BankAccountDto,
} from '../models/settings-admin.model';

@Injectable({ providedIn: 'root' })
export class SettingsAdminService {
  constructor(private apiService: ApiService) {}

  getProfile(): Observable<TenantProfileDto> {
    return this.apiService.get<TenantProfileDto>('tenant/profile').pipe(map((r: ApiResponse<TenantProfileDto>) => r.data));
  }

  updateProfile(req: UpdateTenantProfileRequest): Observable<TenantProfileDto> {
    return this.apiService
      .put<TenantProfileDto>('tenant/profile', req)
      .pipe(map((r: ApiResponse<TenantProfileDto>) => r.data));
  }

  getUsers(): Observable<TenantUserDto[]> {
    return this.apiService.get<TenantUserDto[]>('tenant/users').pipe(map((r: ApiResponse<TenantUserDto[]>) => r.data));
  }

  createUser(req: CreateTenantUserRequest): Observable<TenantUserDto> {
    return this.apiService.post<TenantUserDto>('tenant/users', req).pipe(map((r: ApiResponse<TenantUserDto>) => r.data));
  }

  assignRole(userId: string, role: TenantRole): Observable<TenantUserDto> {
    return this.apiService
      .put<TenantUserDto>(`tenant/users/${userId}/assign-role`, role)
      .pipe(map((r: ApiResponse<TenantUserDto>) => r.data));
  }

  deleteUser(userId: string): Observable<void> {
    return this.apiService.delete<void>(`tenant/users/${userId}`).pipe(map((r: ApiResponse<void>) => r.data));
  }

  getSubscription(): Observable<TenantSubscriptionDto> {
    return this.apiService
      .get<TenantSubscriptionDto>('tenant/subscription')
      .pipe(map((r: ApiResponse<TenantSubscriptionDto>) => r.data));
  }

  getPayments(): Observable<TenantPaymentDto[]> {
    return this.apiService
      .get<TenantPaymentDto[]>('tenant/subscription/payments')
      .pipe(map((r: ApiResponse<TenantPaymentDto[]>) => r.data));
  }

  getBankAccount(): Observable<BankAccountDto> {
    return this.apiService
      .get<BankAccountDto>('tenant/bank-account')
      .pipe(map((r: ApiResponse<BankAccountDto>) => r.data));
  }

  getBankAccountFull(totpCode: string): Observable<BankAccountDto> {
    return this.apiService
      .post<BankAccountDto>('tenant/bank-account/full', { totpCode })
      .pipe(map((r: ApiResponse<BankAccountDto>) => r.data));
  }
}
