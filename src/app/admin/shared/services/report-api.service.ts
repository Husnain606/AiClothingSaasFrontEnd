import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  SummaryReport,
  SalesPoint,
  TopProduct,
  StatusBreakdown,
  CustomerAnalytics,
  InventoryTrends,
  CategorySales,
  ReportInterval,
  ReportDateParams,
} from '../models/report.model';

const REPORT_PATHS: Record<string, string> = {
  summary: 'summary',
  'sales-over-time': 'sales-over-time',
  'top-products': 'top-products',
  'order-status-breakdown': 'order-status-breakdown',
  'customer-analytics': 'customer-analytics',
  'inventory-trends': 'inventory-trends',
  'category-sales': 'category-sales',
};

@Injectable({ providedIn: 'root' })
export class ReportApiService {
  private readonly base = 'tenant/reports';

  constructor(private apiService: ApiService, private http: HttpClient) {}

  private rangeParams(params: ReportDateParams): HttpParams {
    return new HttpParams().set('from', params.from).set('to', params.to);
  }

  getSummary(params: ReportDateParams): Observable<SummaryReport> {
    return this.apiService
      .get<SummaryReport>(`${this.base}/summary`, this.rangeParams(params))
      .pipe(map((r: ApiResponse<SummaryReport>) => r.data));
  }

  getSalesOverTime(params: ReportDateParams, interval: ReportInterval): Observable<SalesPoint[]> {
    const p = this.rangeParams(params).set('interval', interval);
    return this.apiService
      .get<SalesPoint[]>(`${this.base}/sales-over-time`, p)
      .pipe(map((r: ApiResponse<SalesPoint[]>) => r.data));
  }

  getTopProducts(params: ReportDateParams, take: number, by: string): Observable<TopProduct[]> {
    const p = this.rangeParams(params).set('take', String(take)).set('by', by);
    return this.apiService
      .get<TopProduct[]>(`${this.base}/top-products`, p)
      .pipe(map((r: ApiResponse<TopProduct[]>) => r.data));
  }

  getStatusBreakdown(params: ReportDateParams): Observable<StatusBreakdown[]> {
    return this.apiService
      .get<StatusBreakdown[]>(`${this.base}/order-status-breakdown`, this.rangeParams(params))
      .pipe(map((r: ApiResponse<StatusBreakdown[]>) => r.data));
  }

  getCustomerAnalytics(params: ReportDateParams, interval: ReportInterval): Observable<CustomerAnalytics> {
    const p = this.rangeParams(params).set('interval', interval);
    return this.apiService
      .get<CustomerAnalytics>(`${this.base}/customer-analytics`, p)
      .pipe(map((r: ApiResponse<CustomerAnalytics>) => r.data));
  }

  getInventoryTrends(params: ReportDateParams): Observable<InventoryTrends> {
    return this.apiService
      .get<InventoryTrends>(`${this.base}/inventory-trends`, this.rangeParams(params))
      .pipe(map((r: ApiResponse<InventoryTrends>) => r.data));
  }

  getCategorySales(params: ReportDateParams, categoryId?: string): Observable<CategorySales[]> {
    let p = this.rangeParams(params);
    if (categoryId) p = p.set('categoryId', categoryId);
    return this.apiService
      .get<CategorySales[]>(`${this.base}/category-sales`, p)
      .pipe(map((r: ApiResponse<CategorySales[]>) => r.data));
  }

  downloadCsv(report: string, params: Record<string, string>): void {
    const path = REPORT_PATHS[report] ?? report;
    const httpParams = new HttpParams({ fromObject: params }).set('format', 'csv');
    this.http
      .get(`${environment.apiBaseUrl}/${this.base}/${path}`, { params: httpParams, responseType: 'blob' })
      .subscribe((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${path}-${params['from']}-${params['to']}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }
}
