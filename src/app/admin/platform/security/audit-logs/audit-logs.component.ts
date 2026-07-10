import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { AuditLogDto } from '../../models/platform.model';
import { DateRangePickerComponent, DateRange } from '../../../shared/components/date-range-picker/date-range-picker.component';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, DateRangePickerComponent],
  templateUrl: './audit-logs.component.html',
})
export class AuditLogsComponent implements OnInit {
  logs: AuditLogDto[] = [];
  range: DateRange = { from: '', to: '' };

  constructor(private platform: PlatformAdminService) {}

  ngOnInit(): void {
    this.load();
  }

  onRangeChange(range: DateRange): void {
    this.range = range;
    this.load();
  }

  private load(): void {
    const filter = this.range.from && this.range.to ? { from: this.range.from, to: this.range.to } : {};
    this.platform.getAuditLogs(filter).subscribe((logs) => (this.logs = logs));
  }
}
