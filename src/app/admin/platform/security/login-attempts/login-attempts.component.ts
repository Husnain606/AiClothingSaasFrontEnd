import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { LoginAttemptDto } from '../../models/platform.model';
import { DataTableComponent, DataTableColumn } from '../../../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-login-attempts',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  templateUrl: './login-attempts.component.html',
})
export class LoginAttemptsComponent {
  columns: DataTableColumn<LoginAttemptDto>[] = [
    { key: 'createdAt', header: 'Date', cellTemplate: 'date' },
    { key: 'email', header: 'Email' },
    { key: 'isSuccess', header: 'Success', cellTemplate: 'custom' },
    { key: 'ipAddress', header: 'IP' },
  ];
  attempts: LoginAttemptDto[] = [];
  totalCount = 0;
  pageNumber = 1;
  pageSize = 50;
  loading = false;
  emailInput = '';
  searched = false;

  constructor(private platform: PlatformAdminService) {}

  get canSearch(): boolean {
    return this.emailInput.trim().length > 0;
  }

  onSearch(): void {
    if (!this.canSearch) return;
    this.searched = true;
    this.pageNumber = 1;
    this.load();
  }

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.load();
  }

  private load(): void {
    if (!this.canSearch) return;
    this.loading = true;
    this.platform
      .getLoginAttempts({ email: this.emailInput.trim() }, this.pageNumber, this.pageSize)
      .subscribe((result) => {
        this.attempts = result.items;
        this.totalCount = result.totalCount;
        this.loading = false;
      });
  }
}
