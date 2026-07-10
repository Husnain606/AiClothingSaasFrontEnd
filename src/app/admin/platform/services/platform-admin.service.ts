import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse, PagedResult } from '../../../core/models/api-response.model';
import {
  TenantDto,
  CreateTenantRequest,
  UpdateTenantRequest,
  PlatformUserDto,
  SubscriptionPlanDto,
  CreatePlanRequest,
  PlatformSubscriptionDto,
  PlatformPaymentDto,
  AuditLogDto,
  LoginAttemptDto,
  MfaSetupResponse,
  PlatformBankAccountDto,
} from '../models/platform.model';

@Injectable({ providedIn: 'root' })
export class PlatformAdminService {
  constructor(private apiService: ApiService) {}

  private unwrap<T>(obs: Observable<ApiResponse<T>>): Observable<T> {
    return obs.pipe(map((r) => r.data));
  }

  getTenants(page: number, pageSize: number): Observable<PagedResult<TenantDto>> {
    const params = new HttpParams().set('page', String(page)).set('pageSize', String(pageSize));
    return this.unwrap(this.apiService.get<PagedResult<TenantDto>>('admin/tenants', params));
  }

  getTenant(id: string): Observable<TenantDto> {
    return this.unwrap(this.apiService.get<TenantDto>(`admin/tenants/${id}`));
  }

  createTenant(req: CreateTenantRequest): Observable<TenantDto> {
    return this.unwrap(this.apiService.post<TenantDto>('admin/tenants', req));
  }

  updateTenant(id: string, req: UpdateTenantRequest): Observable<TenantDto> {
    return this.unwrap(this.apiService.put<TenantDto>(`admin/tenants/${id}`, req));
  }

  suspendTenant(id: string): Observable<TenantDto> {
    return this.unwrap(this.apiService.put<TenantDto>(`admin/tenants/${id}/suspend`, {}));
  }

  activateTenant(id: string): Observable<TenantDto> {
    return this.unwrap(this.apiService.put<TenantDto>(`admin/tenants/${id}/activate`, {}));
  }

  deleteTenant(id: string): Observable<void> {
    return this.unwrap(this.apiService.delete<void>(`admin/tenants/${id}`));
  }

  getPlatformUsers(): Observable<PlatformUserDto[]> {
    return this.unwrap(this.apiService.get<PlatformUserDto[]>('admin/users'));
  }

  getPlatformUser(id: string): Observable<PlatformUserDto> {
    return this.unwrap(this.apiService.get<PlatformUserDto>(`admin/users/${id}`));
  }

  unlockPlatformUser(id: string): Observable<PlatformUserDto> {
    return this.unwrap(this.apiService.put<PlatformUserDto>(`admin/users/${id}/unlock`, {}));
  }

  getPlans(): Observable<SubscriptionPlanDto[]> {
    return this.unwrap(this.apiService.get<SubscriptionPlanDto[]>('admin/subscription-plans'));
  }

  createPlan(req: CreatePlanRequest): Observable<SubscriptionPlanDto> {
    return this.unwrap(this.apiService.post<SubscriptionPlanDto>('admin/subscription-plans', req));
  }

  updatePlan(id: string, req: CreatePlanRequest): Observable<SubscriptionPlanDto> {
    return this.unwrap(this.apiService.put<SubscriptionPlanDto>(`admin/subscription-plans/${id}`, req));
  }

  deletePlan(id: string): Observable<void> {
    return this.unwrap(this.apiService.delete<void>(`admin/subscription-plans/${id}`));
  }

  getSubscriptions(): Observable<PlatformSubscriptionDto[]> {
    return this.unwrap(this.apiService.get<PlatformSubscriptionDto[]>('admin/subscriptions'));
  }

  assignSubscription(tenantId: string, planId: string, startDate: string): Observable<PlatformSubscriptionDto> {
    return this.unwrap(
      this.apiService.post<PlatformSubscriptionDto>('admin/subscriptions', { tenantId, planId, startDate })
    );
  }

  changeSubscriptionPlan(id: string, newPlanId: string): Observable<PlatformSubscriptionDto> {
    return this.unwrap(
      this.apiService.put<PlatformSubscriptionDto>(`admin/subscriptions/${id}/change-plan`, { newPlanId })
    );
  }

  suspendSubscription(id: string): Observable<PlatformSubscriptionDto> {
    return this.unwrap(this.apiService.put<PlatformSubscriptionDto>(`admin/subscriptions/${id}/suspend`, {}));
  }

  reactivateSubscription(id: string): Observable<PlatformSubscriptionDto> {
    return this.unwrap(this.apiService.put<PlatformSubscriptionDto>(`admin/subscriptions/${id}/reactivate`, {}));
  }

  getPayments(subscriptionId: string): Observable<PlatformPaymentDto[]> {
    const params = new HttpParams().set('subscriptionId', subscriptionId);
    return this.unwrap(this.apiService.get<PlatformPaymentDto[]>('admin/payments', params));
  }

  confirmPayment(id: string): Observable<PlatformPaymentDto> {
    return this.unwrap(this.apiService.put<PlatformPaymentDto>(`admin/payments/${id}/confirm`, {}));
  }

  getAuditLogs(filter: { userId?: string; from?: string; to?: string }): Observable<AuditLogDto[]> {
    let params = new HttpParams();
    if (filter.userId) params = params.set('userId', filter.userId);
    if (filter.from) params = params.set('from', filter.from);
    if (filter.to) params = params.set('to', filter.to);
    return this.unwrap(this.apiService.get<AuditLogDto[]>('admin/audit-logs', params));
  }

  getLoginAttempts(filter: { email?: string; ipAddress?: string }): Observable<LoginAttemptDto[]> {
    let params = new HttpParams();
    if (filter.email) params = params.set('email', filter.email);
    if (filter.ipAddress) params = params.set('ipAddress', filter.ipAddress);
    return this.unwrap(this.apiService.get<LoginAttemptDto[]>('admin/login-attempts', params));
  }

  setupMfa(): Observable<MfaSetupResponse> {
    return this.unwrap(this.apiService.get<MfaSetupResponse>('admin/mfa/setup'));
  }

  verifyMfaSetup(code: string): Observable<void> {
    return this.unwrap(this.apiService.post<void>('admin/mfa/verify-setup', { code }));
  }

  getPlatformBankAccount(): Observable<PlatformBankAccountDto> {
    return this.unwrap(this.apiService.get<PlatformBankAccountDto>('admin/bank-account'));
  }
}
