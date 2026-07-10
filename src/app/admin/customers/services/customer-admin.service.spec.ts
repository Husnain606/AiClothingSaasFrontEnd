import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@env/environment';
import { ApiService } from '../../../core/services/api.service';
import { CustomerAdminService } from './customer-admin.service';

describe('CustomerAdminService', () => {
  let service: CustomerAdminService;
  let httpMock: HttpTestingController;
  const wrap = <T>(data: T) => ({ statusCode: 200, message: 'ok', data, errors: null, timestamp: '' });

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CustomerAdminService, ApiService],
    });
    service = TestBed.inject(CustomerAdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('gets a paged customer list', () => {
    service.getCustomers(1, 20).subscribe();
    httpMock
      .expectOne((r) => r.url === `${environment.apiBaseUrl}/tenant/customers`)
      .flush(wrap({ items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 }));
  });

  it('gets a paged customer list filtered by search', () => {
    service.getCustomers(1, 20, 'a@b.com').subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiBaseUrl}/tenant/customers` && r.params.get('search') === 'a@b.com'
    );
    req.flush(wrap({ items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 }));
  });

  it('gets a single customer', () => {
    service.getCustomer('c1').subscribe();
    httpMock.expectOne(`${environment.apiBaseUrl}/tenant/customers/c1`).flush(wrap({}));
  });

  it('deactivates a customer', () => {
    service.deactivateCustomer('c1').subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/customers/c1/deactivate`);
    expect(req.request.method).toBe('POST');
    req.flush(wrap({}));
  });

  it('gets a customer wishlist', () => {
    service.getWishlist('c1').subscribe();
    httpMock.expectOne(`${environment.apiBaseUrl}/tenant/customers/c1/wishlist`).flush(wrap({ id: 'w1', customerId: 'c1', items: [] }));
  });
});
