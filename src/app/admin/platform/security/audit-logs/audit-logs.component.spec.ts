import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuditLogsComponent } from './audit-logs.component';
import { PlatformAdminService } from '../../services/platform-admin.service';

describe('AuditLogsComponent', () => {
  let fixture: ComponentFixture<AuditLogsComponent>;
  let component: AuditLogsComponent;
  let mockPlatform: Partial<PlatformAdminService>;

  const log = {
    id: 'a1',
    userId: 'u1',
    tenantId: null,
    action: 'login',
    entityName: 'User',
    entityId: 'u1',
    oldValues: null,
    newValues: null,
    ipAddress: '1.1.1.1',
    createdAt: '2026-07-01',
  };
  const log2 = { ...log, id: 'a2', action: 'logout' };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockPlatform = { getAuditLogs: vi.fn().mockReturnValue(of([log, log2])) };

    await TestBed.configureTestingModule({
      imports: [AuditLogsComponent],
      providers: [{ provide: PlatformAdminService, useValue: mockPlatform }],
    }).compileComponents();
    fixture = TestBed.createComponent(AuditLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads audit logs with an empty filter by default', () => {
    expect(mockPlatform.getAuditLogs).toHaveBeenCalledWith({});
    expect(component.logs.length).toBe(2);
  });

  it('renders exactly one row per log entry (no duplicate rendering)', () => {
    const rows = fixture.nativeElement.querySelectorAll('table tbody tr');
    expect(rows.length).toBe(component.logs.length);
    expect(rows.length).toBe(2);
  });

  it('re-queries when the range filter changes', () => {
    (mockPlatform.getAuditLogs as ReturnType<typeof vi.fn>).mockClear();
    component.onRangeChange({ from: '2026-06-01', to: '2026-07-01' });
    expect(mockPlatform.getAuditLogs).toHaveBeenCalledWith({ from: '2026-06-01', to: '2026-07-01' });
  });
});
