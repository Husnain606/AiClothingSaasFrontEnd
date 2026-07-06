import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@env/environment';
import { ApiService } from '../../../core/services/api.service';
import { InventoryAdminService } from './inventory-admin.service';

describe('InventoryAdminService', () => {
  let service: InventoryAdminService;
  let httpMock: HttpTestingController;
  const wrap = <T>(data: T) => ({ statusCode: 200, message: 'ok', data, errors: null, timestamp: '' });

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InventoryAdminService, ApiService],
    });
    service = TestBed.inject(InventoryAdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('adjusts stock with a delta and reason', () => {
    service.adjustStock({ variantId: 'v1', delta: -2, reason: 'Damage' }).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/inventory/adjust`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ variantId: 'v1', delta: -2, reason: 'Damage' });
    req.flush(wrap(null));
  });

  it('gets low-stock items with an optional threshold', () => {
    service.getLowStock(3).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiBaseUrl}/tenant/inventory/low-stock` && r.params.get('threshold') === '3'
    );
    req.flush(wrap([]));
  });

  it('gets low-stock items without a threshold param when omitted', () => {
    service.getLowStock().subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/inventory/low-stock`);
    expect(req.request.params.has('threshold')).toBe(false);
    req.flush(wrap([]));
  });

  it('gets stock history for a variant', () => {
    service.getStockHistory('v1').subscribe();
    httpMock.expectOne(`${environment.apiBaseUrl}/tenant/inventory/variants/v1/history`).flush(wrap([]));
  });
});
