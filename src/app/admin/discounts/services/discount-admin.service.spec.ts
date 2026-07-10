import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@env/environment';
import { ApiService } from '../../../core/services/api.service';
import { DiscountAdminService } from './discount-admin.service';

describe('DiscountAdminService', () => {
  let service: DiscountAdminService;
  let httpMock: HttpTestingController;
  const wrap = <T>(data: T) => ({ statusCode: 200, message: 'ok', data, errors: null, timestamp: '' });

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DiscountAdminService, ApiService],
    });
    service = TestBed.inject(DiscountAdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('gets a paged discount list', () => {
    service.getDiscounts(1, 20).subscribe();
    httpMock
      .expectOne((r) => r.url === `${environment.apiBaseUrl}/tenant/discounts`)
      .flush(wrap({ items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 }));
  });

  it('gets a single discount', () => {
    service.getDiscount('d1').subscribe();
    httpMock.expectOne(`${environment.apiBaseUrl}/tenant/discounts/d1`).flush(wrap({}));
  });

  it('creates a discount', () => {
    service
      .createDiscount({ code: 'SAVE10', type: 'Percentage', value: 10, startsAt: '2026-07-01', endsAt: '2026-08-01' })
      .subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/discounts`);
    expect(req.request.method).toBe('POST');
    req.flush(wrap({}));
  });

  it('updates a discount', () => {
    service
      .updateDiscount('d1', { code: 'SAVE10', type: 'Percentage', value: 15, startsAt: '2026-07-01', endsAt: '2026-08-01' })
      .subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/discounts/d1`);
    expect(req.request.method).toBe('PUT');
    req.flush(wrap({}));
  });

  it('deactivates a discount', () => {
    service.deactivateDiscount('d1').subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/discounts/d1/deactivate`);
    expect(req.request.method).toBe('POST');
    req.flush(wrap({}));
  });

  it('deletes a discount', () => {
    service.deleteDiscount('d1').subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/discounts/d1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(wrap(null));
  });
});
