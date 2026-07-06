import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, catchError, of as rxOf } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData } from 'chart.js';
import { ReportApiService } from '../shared/services/report-api.service';
import { SummaryReport, SalesPoint, TopProduct, StatusBreakdown, ReportInterval } from '../shared/models/report.model';
import { DateRangePickerComponent, DateRange } from '../shared/components/date-range-picker/date-range-picker.component';
import { KpiCardComponent } from '../shared/components/kpi-card/kpi-card.component';

function defaultRange(): DateRange {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { from: iso(from), to: iso(to) };
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, DateRangePickerComponent, KpiCardComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  interval: ReportInterval = 'Day';
  range: DateRange = defaultRange();
  loading = true;
  error: string | null = null;
  summary: SummaryReport | null = null;

  salesChartData: ChartData<'line'> = { labels: [], datasets: [{ data: [], label: 'Revenue' }] };
  topProductsChartData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: 'Revenue' }] };
  statusChartData: ChartData<'doughnut'> = { labels: [], datasets: [{ data: [] }] };

  constructor(private reportApi: ReportApiService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  onRangeChange(range: DateRange): void {
    this.range = range;
    this.loadAll();
  }

  onIntervalChange(interval: ReportInterval): void {
    this.interval = interval;
    this.reportApi.getSalesOverTime(this.range, this.interval).subscribe((points) => {
      this.applySalesPoints(points);
    });
  }

  private loadAll(): void {
    this.loading = true;
    this.error = null;
    forkJoin({
      summary: this.reportApi.getSummary(this.range),
      sales: this.reportApi.getSalesOverTime(this.range, this.interval),
      topProducts: this.reportApi.getTopProducts(this.range, 5, 'revenue'),
      status: this.reportApi.getStatusBreakdown(this.range),
    })
      .pipe(
        catchError(() => {
          this.error = 'Failed to load dashboard data. Please try again.';
          return rxOf(null);
        })
      )
      .subscribe((result) => {
        this.loading = false;
        if (!result) return;
        this.summary = result.summary;
        this.applySalesPoints(result.sales);
        this.applyTopProducts(result.topProducts);
        this.applyStatusBreakdown(result.status);
      });
  }

  private applySalesPoints(points: SalesPoint[]): void {
    this.salesChartData = {
      labels: points.map((p) => p.periodStart),
      datasets: [{ data: points.map((p) => p.revenue), label: 'Revenue' }],
    };
  }

  private applyTopProducts(products: TopProduct[]): void {
    this.topProductsChartData = {
      labels: products.map((p) => p.productName),
      datasets: [{ data: products.map((p) => p.revenue), label: 'Revenue' }],
    };
  }

  private applyStatusBreakdown(breakdown: StatusBreakdown[]): void {
    this.statusChartData = {
      labels: breakdown.map((b) => b.status),
      datasets: [{ data: breakdown.map((b) => b.count) }],
    };
  }
}
