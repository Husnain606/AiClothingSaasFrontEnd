import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ReportPageComponent } from './report-page.component';
import { ReportApiService } from '../../shared/services/report-api.service';

describe('ReportPageComponent', () => {
  let fixture: ComponentFixture<ReportPageComponent>;
  let component: ReportPageComponent;
  let mockReportApi: Partial<ReportApiService>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockReportApi = {
      getSalesOverTime: vi.fn().mockReturnValue(of([{ periodStart: '2026-07-01', revenue: 100, orderCount: 2 }])),
      downloadCsv: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ReportPageComponent],
      providers: [
        { provide: ReportApiService, useValue: mockReportApi },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: { reportKey: 'sales-over-time', title: 'Sales over time' } } },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ReportPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the report identified by route data', () => {
    expect(mockReportApi.getSalesOverTime).toHaveBeenCalled();
    expect(component.rows.length).toBe(1);
  });

  it('renders exactly one row per record (no duplicate rendering)', () => {
    const rows = fixture.nativeElement.querySelectorAll('table tbody tr');
    expect(rows.length).toBe(component.rows.length);
    expect(rows.length).toBe(1);
  });

  it('triggers a CSV download with the current date range', () => {
    component.onDownloadCsv();
    expect(mockReportApi.downloadCsv).toHaveBeenCalledWith('sales-over-time', {
      from: component.range.from,
      to: component.range.to,
    });
  });

  it('reloads when the date range changes', () => {
    (mockReportApi.getSalesOverTime as ReturnType<typeof vi.fn>).mockClear();
    component.onRangeChange({ from: '2026-06-01', to: '2026-06-30' });
    expect(mockReportApi.getSalesOverTime).toHaveBeenCalled();
  });
});
