import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { ReportApiService } from '../shared/services/report-api.service';
import { SummaryReport, SalesPoint, TopProduct, StatusBreakdown } from '../shared/models/report.model';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;
  let mockReportApi: Partial<ReportApiService>;

  // jsdom has no canvas 2D context implementation; chart.js needs a truthy
  // context object to construct a chart. Stub just enough of the Canvas API
  // for chart.js's construction path to succeed in the test environment.
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      canvas: { style: {} },
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  });

  const summary: SummaryReport = {
    revenue: 15420.5, orderCount: 87, avgOrderValue: 177.24,
    newCustomers: 12, pendingReviews: 4, lowStockCount: 3,
  };
  const salesPoints: SalesPoint[] = [
    { periodStart: '2026-06-01', revenue: 1000, orderCount: 5 },
    { periodStart: '2026-06-02', revenue: 1500, orderCount: 7 },
  ];
  const topProducts: TopProduct[] = [
    { productId: 'p1', productName: 'Denim Jacket', revenue: 5000, units: 40 },
  ];
  const statusBreakdown: StatusBreakdown[] = [
    { status: 'delivered', count: 50, revenue: 10000 },
    { status: 'pending', count: 10, revenue: 1200 },
  ];

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockReportApi = {
      getSummary: vi.fn().mockReturnValue(of(summary)),
      getSalesOverTime: vi.fn().mockReturnValue(of(salesPoints)),
      getTopProducts: vi.fn().mockReturnValue(of(topProducts)),
      getStatusBreakdown: vi.fn().mockReturnValue(of(statusBreakdown)),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [{ provide: ReportApiService, useValue: mockReportApi }],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads and displays exact KPI values from the summary report', () => {
    expect(component.summary?.revenue).toBe(15420.5);
    expect(component.summary?.orderCount).toBe(87);
    expect(component.summary?.avgOrderValue).toBe(177.24);
    expect(component.summary?.newCustomers).toBe(12);
    expect(component.summary?.pendingReviews).toBe(4);
    expect(component.summary?.lowStockCount).toBe(3);
  });

  it('builds sales-over-time line chart data from the report points', () => {
    expect(component.salesChartData.labels).toEqual(['2026-06-01', '2026-06-02']);
    expect(component.salesChartData.datasets[0].data).toEqual([1000, 1500]);
  });

  it('builds top-products bar chart data', () => {
    expect(component.topProductsChartData.labels).toEqual(['Denim Jacket']);
    expect(component.topProductsChartData.datasets[0].data).toEqual([5000]);
  });

  it('builds status donut chart data', () => {
    expect(component.statusChartData.labels).toEqual(['delivered', 'pending']);
    expect(component.statusChartData.datasets[0].data).toEqual([50, 10]);
  });

  it('re-fetches all four reports when the date range changes', () => {
    (mockReportApi.getSummary as ReturnType<typeof vi.fn>).mockClear();
    component.onRangeChange({ from: '2026-05-01', to: '2026-05-31' });
    expect(mockReportApi.getSummary).toHaveBeenCalledWith({ from: '2026-05-01', to: '2026-05-31' });
  });

  it('re-fetches sales-over-time with the new interval on interval change', () => {
    (mockReportApi.getSalesOverTime as ReturnType<typeof vi.fn>).mockClear();
    component.onIntervalChange('Week');
    expect(component.interval).toBe('Week');
    expect(mockReportApi.getSalesOverTime).toHaveBeenCalledWith(component.range, 'Week');
  });

  it('shows a loading state while reports are in flight', () => {
    TestBed.resetTestingModule();
    let resolveFn!: (v: SummaryReport) => void;
    const pending = new Promise<SummaryReport>((res) => (resolveFn = res));
    mockReportApi = {
      getSummary: vi.fn().mockReturnValue(pending as unknown as ReturnType<ReportApiService['getSummary']>),
      getSalesOverTime: vi.fn().mockReturnValue(of(salesPoints)),
      getTopProducts: vi.fn().mockReturnValue(of(topProducts)),
      getStatusBreakdown: vi.fn().mockReturnValue(of(statusBreakdown)),
    };
    return TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [{ provide: ReportApiService, useValue: mockReportApi }],
    })
      .compileComponents()
      .then(() => {
        const f = TestBed.createComponent(DashboardComponent);
        f.detectChanges();
        expect(f.componentInstance.loading).toBe(true);
      });
  });

  it('shows an error message when a report call fails', () => {
    TestBed.resetTestingModule();
    mockReportApi = {
      getSummary: vi.fn().mockReturnValue(throwError(() => new Error('network'))),
      getSalesOverTime: vi.fn().mockReturnValue(of(salesPoints)),
      getTopProducts: vi.fn().mockReturnValue(of(topProducts)),
      getStatusBreakdown: vi.fn().mockReturnValue(of(statusBreakdown)),
    };
    return TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [{ provide: ReportApiService, useValue: mockReportApi }],
    })
      .compileComponents()
      .then(() => {
        const f = TestBed.createComponent(DashboardComponent);
        f.detectChanges();
        expect(f.componentInstance.error).toContain('Failed to load dashboard');
      });
  });
});
