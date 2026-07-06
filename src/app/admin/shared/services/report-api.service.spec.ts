import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@env/environment';
import { ApiService } from '../../../core/services/api.service';
import { ReportApiService } from './report-api.service';

describe('ReportApiService', () => {
  let service: ReportApiService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiBaseUrl}/tenant/reports`;
  const range = { from: '2026-06-01', to: '2026-07-01' };
  const wrap = <T>(data: T) => ({ statusCode: 200, message: 'ok', data, errors: null, timestamp: '' });

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReportApiService, ApiService],
    });
    service = TestBed.inject(ReportApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('gets the summary report', () => {
    service.getSummary(range).subscribe();
    const req = httpMock.expectOne((r) => r.url === `${base}/summary`);
    expect(req.request.params.get('from')).toBe('2026-06-01');
    req.flush(wrap({ revenue: 100, orderCount: 2, avgOrderValue: 50, newCustomers: 1, pendingReviews: 0, lowStockCount: 0 }));
  });

  it('gets sales-over-time with an interval', () => {
    service.getSalesOverTime(range, 'Week').subscribe();
    const req = httpMock.expectOne((r) => r.url === `${base}/sales-over-time` && r.params.get('interval') === 'Week');
    req.flush(wrap([]));
  });

  it('gets top products with take and sort key', () => {
    service.getTopProducts(range, 5, 'units').subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === `${base}/top-products` && r.params.get('take') === '5' && r.params.get('by') === 'units'
    );
    req.flush(wrap([]));
  });

  it('gets order status breakdown', () => {
    service.getStatusBreakdown(range).subscribe();
    const req = httpMock.expectOne((r) => r.url === `${base}/order-status-breakdown`);
    req.flush(wrap([]));
  });

  it('gets customer analytics', () => {
    service.getCustomerAnalytics(range, 'Month').subscribe();
    const req = httpMock.expectOne((r) => r.url === `${base}/customer-analytics`);
    req.flush(wrap({ newCustomersOverTime: [], repeatPurchaseRate: 0, topCustomers: [] }));
  });

  it('gets inventory trends', () => {
    service.getInventoryTrends(range).subscribe();
    const req = httpMock.expectOne((r) => r.url === `${base}/inventory-trends`);
    req.flush(wrap({ adjustmentsOverTime: [], lowStock: [] }));
  });

  it('gets category sales, optionally scoped to a category', () => {
    service.getCategorySales(range, 'cat-1').subscribe();
    const req = httpMock.expectOne((r) => r.url === `${base}/category-sales` && r.params.get('categoryId') === 'cat-1');
    req.flush(wrap([]));
  });
});

describe('ReportApiService.downloadCsv', () => {
  let service: ReportApiService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiBaseUrl}/tenant/reports`;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReportApiService, ApiService],
    });
    service = TestBed.inject(ReportApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('requests the CSV as a blob and triggers a download', () => {
    const clickSpy = vi.fn();
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
      set href(_v: string) {},
      set download(_v: string) {},
      click: clickSpy,
    } as unknown as HTMLAnchorElement);
    vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:mock');
    vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});

    service.downloadCsv('summary', { from: '2026-06-01', to: '2026-07-01' });

    const req = httpMock.expectOne(
      (r) => r.url === `${base}/summary` && r.params.get('format') === 'csv'
    );
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['csv,data']));

    expect(clickSpy).toHaveBeenCalled();
    createElementSpy.mockRestore();
  });
});
