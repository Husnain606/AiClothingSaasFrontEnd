import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { AuditLogDto, AuditLogFilter } from '../../models/platform.model';
import { DateRangePickerComponent, DateRange } from '../../../shared/components/date-range-picker/date-range-picker.component';
import { DataTableComponent, DataTableColumn } from '../../../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, DateRangePickerComponent, DataTableComponent],
  templateUrl: './audit-logs.component.html',
})
export class AuditLogsComponent implements OnInit {
  columns: DataTableColumn<AuditLogDto>[] = [
    { key: 'createdAt', header: 'Date', cellTemplate: 'date' },
    { key: 'userId', header: 'User', cellTemplate: 'custom' },
    { key: 'action', header: 'Action' },
    { key: 'entityName', header: 'Entity' },
    { key: 'ipAddress', header: 'IP' },
  ];
  logs: AuditLogDto[] = [];
  totalCount = 0;
  pageNumber = 1;
  pageSize = 50;
  loading = false;
  range: DateRange = { from: '', to: '' };

  constructor(private platform: PlatformAdminService) {}

  ngOnInit(): void {
    this.load();
  }

  onRangeChange(range: DateRange): void {
    this.range = range;
    this.pageNumber = 1;
    this.load();
  }

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.load();
  }

  private load(): void {
    this.loading = true;
    const filter: AuditLogFilter =
      this.range.from && this.range.to ? { from: this.range.from, to: this.range.to } : {};
    this.platform.getAuditLogs(filter, this.pageNumber, this.pageSize).subscribe((result) => {
      this.logs = result.items;
      this.totalCount = result.totalCount;
      this.loading = false;
    });
  }
}
