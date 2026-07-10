import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ReportApiService } from '../../shared/services/report-api.service';
import {
  DateRangePickerComponent,
  DateRange,
} from '../../shared/components/date-range-picker/date-range-picker.component';
import { DataTableComponent, DataTableColumn } from '../../shared/components/data-table/data-table.component';

export type ReportKey =
  | 'summary'
  | 'sales-over-time'
  | 'top-products'
  | 'order-status-breakdown'
  | 'customer-analytics'
  | 'inventory-trends'
  | 'category-sales';

const REPORT_COLUMNS: Record<ReportKey, DataTableColumn<Record<string, unknown>>[]> = {
  summary: [
    { key: 'revenue', header: 'Revenue', cellTemplate: 'currency' },
    { key: 'orderCount', header: 'Orders' },
    { key: 'avgOrderValue', header: 'Avg order value', cellTemplate: 'currency' },
    { key: 'newCustomers', header: 'New customers' },
    { key: 'pendingReviews', header: 'Pending reviews' },
    { key: 'lowStockCount', header: 'Low stock items' },
  ],
  'sales-over-time': [
    { key: 'periodStart', header: 'Period', cellTemplate: 'date' },
    { key: 'revenue', header: 'Revenue', cellTemplate: 'currency' },
    { key: 'orderCount', header: 'Orders' },
  ],
  'top-products': [
    { key: 'productName', header: 'Product' },
    { key: 'revenue', header: 'Revenue', cellTemplate: 'currency' },
    { key: 'units', header: 'Units' },
  ],
  'order-status-breakdown': [
    { key: 'status', header: 'Status' },
    { key: 'count', header: 'Count' },
    { key: 'revenue', header: 'Revenue', cellTemplate: 'currency' },
  ],
  'customer-analytics': [
    { key: 'email', header: 'Customer' },
    { key: 'totalSpend', header: 'Total spend', cellTemplate: 'currency' },
    { key: 'orderCount', header: 'Orders' },
  ],
  'inventory-trends': [
    { key: 'productName', header: 'Product' },
    { key: 'sku', header: 'SKU' },
    { key: 'stockQuantity', header: 'Stock' },
  ],
  'category-sales': [
    { key: 'categoryName', header: 'Category' },
    { key: 'revenue', header: 'Revenue', cellTemplate: 'currency' },
    { key: 'units', header: 'Units' },
  ],
};

function defaultRange(): DateRange {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { from: iso(from), to: iso(to) };
}

@Component({
  selector: 'app-report-page',
  standalone: true,
  imports: [CommonModule, DateRangePickerComponent, DataTableComponent],
  templateUrl: './report-page.component.html',
})
export class ReportPageComponent implements OnInit {
  reportKey!: ReportKey;
  title = '';
  columns: DataTableColumn<Record<string, unknown>>[] = [];
  rows: Record<string, unknown>[] = [];
  range: DateRange = defaultRange();
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private reportApi: ReportApiService
  ) {}

  ngOnInit(): void {
    this.reportKey = this.route.snapshot.data['reportKey'] as ReportKey;
    this.title = this.route.snapshot.data['title'] as string;
    this.columns = REPORT_COLUMNS[this.reportKey];
    this.load();
  }

  onRangeChange(range: DateRange): void {
    this.range = range;
    this.load();
  }

  onDownloadCsv(): void {
    this.reportApi.downloadCsv(this.reportKey, { from: this.range.from, to: this.range.to });
  }

  private load(): void {
    this.loading = true;
    const finish = (rows: Record<string, unknown>[]): void => {
      this.rows = rows;
      this.loading = false;
    };

    switch (this.reportKey) {
      case 'summary':
        this.reportApi
          .getSummary(this.range)
          .subscribe((r) => finish([r as unknown as Record<string, unknown>]));
        break;
      case 'sales-over-time':
        this.reportApi
          .getSalesOverTime(this.range, 'Day')
          .subscribe((r) => finish(r as unknown as Record<string, unknown>[]));
        break;
      case 'top-products':
        this.reportApi
          .getTopProducts(this.range, 10, 'revenue')
          .subscribe((r) => finish(r as unknown as Record<string, unknown>[]));
        break;
      case 'order-status-breakdown':
        this.reportApi
          .getStatusBreakdown(this.range)
          .subscribe((r) => finish(r as unknown as Record<string, unknown>[]));
        break;
      case 'customer-analytics':
        this.reportApi
          .getCustomerAnalytics(this.range, 'Day')
          .subscribe((r) => finish(r.topCustomers as unknown as Record<string, unknown>[]));
        break;
      case 'inventory-trends':
        this.reportApi
          .getInventoryTrends(this.range)
          .subscribe((r) => finish(r.lowStock as unknown as Record<string, unknown>[]));
        break;
      case 'category-sales':
        this.reportApi
          .getCategorySales(this.range)
          .subscribe((r) => finish(r as unknown as Record<string, unknown>[]));
        break;
    }
  }
}
