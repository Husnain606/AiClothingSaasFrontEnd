import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@env/environment';
import { ApiService } from '../../../core/services/api.service';
import { OrderAdminService } from './order-admin.service';
import { OrderDto } from '../models/order-admin.model';

describe('OrderAdminService', () => {
  let service: OrderAdminService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiBaseUrl}/tenant/orders`;

  const order: OrderDto = {
    orderId: 'ORD-2026-000001',
    id: 'guid-1',
    customerId: 'cust-1',
    orderDate: '2026-07-01T00:00:00Z',
    status: 'pending',
    items: [],
    shippingAddress: {
      firstName: 'A', lastName: 'B', email: 'a@b.com', phone: '555',
      street: 's', city: 'c', state: 'st', zipCode: 'z', country: 'US',
    },
    subtotal: 10, tax: 1, shippingCost: 0, total: 11,
  };

  const wrap = <T>(data: T) => ({ statusCode: 200, message: 'ok', data, errors: null, timestamp: '' });

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrderAdminService, ApiService],
    });
    service = TestBed.inject(OrderAdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('gets a paged list of orders with filter params', () => {
    service.getOrders({ status: 'pending', page: 2, pageSize: 10 }).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === base && r.params.get('status') === 'pending' && r.params.get('page') === '2'
    );
    expect(req.request.method).toBe('GET');
    req.flush(wrap({ items: [order], totalCount: 1, page: 2, pageSize: 10, totalPages: 1 }));
  });

  it('gets a single order by id', () => {
    service.getOrder('guid-1').subscribe((o) => expect(o.id).toBe('guid-1'));
    const req = httpMock.expectOne(`${base}/guid-1`);
    expect(req.request.method).toBe('GET');
    req.flush(wrap(order));
  });

  it('confirms an order', () => {
    service.confirm('guid-1').subscribe();
    const req = httpMock.expectOne(`${base}/guid-1/confirm`);
    expect(req.request.method).toBe('PUT');
    req.flush(wrap(order));
  });

  it('ships an order with a tracking number', () => {
    service.ship('guid-1', 'TRACK123').subscribe();
    const req = httpMock.expectOne(`${base}/guid-1/ship`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ trackingNumber: 'TRACK123' });
    req.flush(wrap(order));
  });

  it('ships an order without a tracking number', () => {
    service.ship('guid-1').subscribe();
    const req = httpMock.expectOne(`${base}/guid-1/ship`);
    expect(req.request.body).toEqual({ trackingNumber: null });
    req.flush(wrap(order));
  });

  it('marks an order delivered', () => {
    service.deliver('guid-1').subscribe();
    const req = httpMock.expectOne(`${base}/guid-1/deliver`);
    expect(req.request.method).toBe('PUT');
    req.flush(wrap(order));
  });

  it('cancels an order with a reason', () => {
    service.cancel('guid-1', 'Customer request').subscribe();
    const req = httpMock.expectOne(`${base}/guid-1/cancel`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ reason: 'Customer request' });
    req.flush(wrap(order));
  });

  it('requests the payment proof as a blob', () => {
    service.getPaymentProof('order-1').subscribe();
    const req = httpMock.expectOne(`${base}/order-1/payment-proof`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['pdf-bytes'], { type: 'application/pdf' }));
  });
});
