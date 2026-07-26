import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@env/environment';
import { ApiService } from '../../../core/services/api.service';
import { SettingsAdminService } from './settings-admin.service';

describe('SettingsAdminService', () => {
  let service: SettingsAdminService;
  let httpMock: HttpTestingController;
  const wrap = <T>(data: T) => ({ statusCode: 200, message: 'ok', data, errors: null, timestamp: '' });

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SettingsAdminService, ApiService],
    });
    service = TestBed.inject(SettingsAdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('gets the tenant profile', () => {
    service.getProfile().subscribe();
    httpMock.expectOne(`${environment.apiBaseUrl}/tenant/profile`).flush(wrap({}));
  });

  it('updates the tenant profile', () => {
    service.updateProfile({ name: 'New Name' }).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/profile`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ name: 'New Name' });
    req.flush(wrap({}));
  });

  it('includes paymentInstructions in the update request body', () => {
    service.updateProfile({ name: 'New Name', paymentInstructions: 'Pay via bank transfer.' }).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/profile`);
    expect(req.request.body).toEqual({ name: 'New Name', paymentInstructions: 'Pay via bank transfer.' });
    req.flush(wrap({}));
  });

  it('gets tenant users', () => {
    service.getUsers().subscribe();
    httpMock.expectOne(`${environment.apiBaseUrl}/tenant/users`).flush(wrap([]));
  });

  it('creates a tenant user', () => {
    service.createUser({ email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'StoreManager' }).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/users`);
    expect(req.request.method).toBe('POST');
    req.flush(wrap({}));
  });

  it('assigns a role to a user', () => {
    service.assignRole('u1', 'InventoryManager').subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/users/u1/assign-role`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toBe('InventoryManager');
    req.flush(wrap({}));
  });

  it('deletes a tenant user', () => {
    service.deleteUser('u1').subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/users/u1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(wrap(null));
  });

  it('gets the subscription', () => {
    service.getSubscription().subscribe();
    httpMock.expectOne(`${environment.apiBaseUrl}/tenant/subscription`).flush(wrap({}));
  });

  it('gets subscription payments', () => {
    service.getPayments().subscribe();
    httpMock.expectOne(`${environment.apiBaseUrl}/tenant/subscription/payments`).flush(wrap([]));
  });

  it('gets the masked bank account', () => {
    service.getBankAccount().subscribe();
    httpMock.expectOne(`${environment.apiBaseUrl}/tenant/bank-account`).flush(wrap({}));
  });

  it('gets the full bank account with a TOTP code', () => {
    service.getBankAccountFull('123456').subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/bank-account/full`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ totpCode: '123456' });
    req.flush(wrap({}));
  });
});
