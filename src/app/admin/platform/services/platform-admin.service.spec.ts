import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@env/environment';
import { ApiService } from '../../../core/services/api.service';
import { PlatformAdminService } from './platform-admin.service';

describe('PlatformAdminService', () => {
  let service: PlatformAdminService;
  let httpMock: HttpTestingController;
  const base = environment.apiBaseUrl;
  const wrap = <T>(data: T) => ({ statusCode: 200, message: 'ok', data, errors: null, timestamp: '' });

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PlatformAdminService, ApiService],
    });
    service = TestBed.inject(PlatformAdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('gets a paged tenant list', () => {
    service.getTenants(1, 20).subscribe();
    httpMock
      .expectOne((r) => r.url === `${base}/admin/tenants`)
      .flush(wrap({ items: [], totalCount: 0, pageNumber: 1, pageSize: 20, totalPages: 0 }));
  });

  it('gets a single tenant', () => {
    service.getTenant('t1').subscribe();
    httpMock.expectOne(`${base}/admin/tenants/t1`).flush(wrap({}));
  });

  it('creates a tenant', () => {
    service.createTenant({ name: 'Acme', slug: 'acme', email: 'a@b.com' }).subscribe();
    const req = httpMock.expectOne(`${base}/admin/tenants`);
    expect(req.request.method).toBe('POST');
    req.flush(wrap({}));
  });

  it('updates a tenant', () => {
    service.updateTenant('t1', { name: 'Acme Co' }).subscribe();
    const req = httpMock.expectOne(`${base}/admin/tenants/t1`);
    expect(req.request.method).toBe('PUT');
    req.flush(wrap({}));
  });

  it('suspends a tenant', () => {
    service.suspendTenant('t1').subscribe();
    httpMock.expectOne(`${base}/admin/tenants/t1/suspend`).flush(wrap({}));
  });

  it('activates a tenant', () => {
    service.activateTenant('t1').subscribe();
    httpMock.expectOne(`${base}/admin/tenants/t1/activate`).flush(wrap({}));
  });

  it('deletes a tenant', () => {
    service.deleteTenant('t1').subscribe();
    const req = httpMock.expectOne(`${base}/admin/tenants/t1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(wrap(null));
  });

  it('gets platform users', () => {
    service.getPlatformUsers().subscribe();
    httpMock.expectOne(`${base}/admin/users`).flush(wrap([]));
  });

  it('gets a single platform user', () => {
    service.getPlatformUser('u1').subscribe();
    httpMock.expectOne(`${base}/admin/users/u1`).flush(wrap({}));
  });

  it('unlocks a platform user', () => {
    service.unlockPlatformUser('u1').subscribe();
    httpMock.expectOne(`${base}/admin/users/u1/unlock`).flush(wrap({}));
  });

  it('gets subscription plans', () => {
    service.getPlans().subscribe();
    httpMock.expectOne(`${base}/admin/subscription-plans`).flush(wrap([]));
  });

  it('creates a plan', () => {
    service
      .createPlan({
        planType: 'Monthly',
        name: 'Pro',
        price: 99,
        durationDays: 30,
        trialDays: 0,
        productLimit: 100,
        userLimit: 10,
        aiUsageLimit: 1000,
        storageLimitMb: 5000,
      })
      .subscribe();
    const req = httpMock.expectOne(`${base}/admin/subscription-plans`);
    expect(req.request.method).toBe('POST');
    req.flush(wrap({}));
  });

  it('updates a plan', () => {
    service
      .updatePlan('p1', {
        planType: 'Monthly',
        name: 'Pro',
        price: 149,
        durationDays: 30,
        trialDays: 0,
        productLimit: 200,
        userLimit: 20,
        aiUsageLimit: 2000,
        storageLimitMb: 10000,
      })
      .subscribe();
    const req = httpMock.expectOne(`${base}/admin/subscription-plans/p1`);
    expect(req.request.method).toBe('PUT');
    req.flush(wrap({}));
  });

  it('deletes a plan', () => {
    service.deletePlan('p1').subscribe();
    const req = httpMock.expectOne(`${base}/admin/subscription-plans/p1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(wrap(null));
  });

  it('gets subscriptions', () => {
    service.getSubscriptions().subscribe();
    httpMock.expectOne(`${base}/admin/subscriptions`).flush(wrap([]));
  });

  it('assigns a subscription to a tenant', () => {
    service.assignSubscription('t1', 'p1', '2026-07-01').subscribe();
    const req = httpMock.expectOne(`${base}/admin/subscriptions`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ tenantId: 't1', planId: 'p1', startDate: '2026-07-01' });
    req.flush(wrap({}));
  });

  it('changes a subscription plan', () => {
    service.changeSubscriptionPlan('s1', 'p2').subscribe();
    const req = httpMock.expectOne(`${base}/admin/subscriptions/s1/change-plan`);
    expect(req.request.body).toEqual({ newPlanId: 'p2' });
    req.flush(wrap({}));
  });

  it('suspends a subscription', () => {
    service.suspendSubscription('s1').subscribe();
    httpMock.expectOne(`${base}/admin/subscriptions/s1/suspend`).flush(wrap({}));
  });

  it('reactivates a subscription', () => {
    service.reactivateSubscription('s1').subscribe();
    httpMock.expectOne(`${base}/admin/subscriptions/s1/reactivate`).flush(wrap({}));
  });

  it('gets payments for a subscription', () => {
    service.getPayments('s1').subscribe();
    const req = httpMock.expectOne((r) => r.url === `${base}/admin/payments` && r.params.get('subscriptionId') === 's1');
    req.flush(wrap([]));
  });

  it('confirms a payment', () => {
    service.confirmPayment('pay1').subscribe();
    httpMock.expectOne(`${base}/admin/payments/pay1/confirm`).flush(wrap({}));
  });

  it('gets audit logs with filters', () => {
    service.getAuditLogs({ userId: 'u1' }).subscribe();
    const req = httpMock.expectOne((r) => r.url === `${base}/admin/audit-logs` && r.params.get('userId') === 'u1');
    req.flush(wrap([]));
  });

  it('gets login attempts with filters', () => {
    service.getLoginAttempts({ email: 'a@b.com' }).subscribe();
    const req = httpMock.expectOne((r) => r.url === `${base}/admin/login-attempts` && r.params.get('email') === 'a@b.com');
    req.flush(wrap([]));
  });

  it('sets up MFA', () => {
    service.setupMfa().subscribe();
    const req = httpMock.expectOne(`${base}/admin/mfa/setup`);
    expect(req.request.method).toBe('GET');
    req.flush(wrap({ qrCodeUrl: 'data:...', secretBase32: 'ABC' }));
  });

  it('verifies MFA setup with a code', () => {
    service.verifyMfaSetup('123456').subscribe();
    const req = httpMock.expectOne(`${base}/admin/mfa/verify-setup`);
    expect(req.request.body).toEqual({ code: '123456' });
    req.flush(wrap(null));
  });

  it('gets the platform bank account', () => {
    service.getPlatformBankAccount().subscribe();
    httpMock.expectOne(`${base}/admin/bank-account`).flush(wrap({}));
  });
});
