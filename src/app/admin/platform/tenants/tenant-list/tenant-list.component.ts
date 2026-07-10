import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { TenantDto } from '../../models/platform.model';
import { DataTableComponent, DataTableColumn } from '../../../shared/components/data-table/data-table.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DataTableComponent, StatusBadgeComponent],
  templateUrl: './tenant-list.component.html',
})
export class TenantListComponent implements OnInit {
  columns: DataTableColumn<TenantDto>[] = [
    { key: 'name', header: 'Name' },
    { key: 'slug', header: 'Slug' },
    { key: 'isActive', header: 'Status', cellTemplate: 'custom' },
    { key: 'createdAt', header: 'Created', cellTemplate: 'date' },
    { key: 'id', header: 'Actions', cellTemplate: 'custom' },
  ];
  rows: TenantDto[] = [];
  totalCount = 0;
  pageNumber = 1;
  pageSize = 20;
  loading = false;

  constructor(
    private platform: PlatformAdminService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.load();
  }

  onSuspend(tenant: TenantDto): void {
    this.platform.suspendTenant(tenant.id).subscribe({
      next: () => {
        this.toast.success('Tenant suspended.');
        this.load();
      },
      error: () => this.toast.error('Failed to suspend tenant.'),
    });
  }

  onActivate(tenant: TenantDto): void {
    this.platform.activateTenant(tenant.id).subscribe({
      next: () => {
        this.toast.success('Tenant activated.');
        this.load();
      },
      error: () => this.toast.error('Failed to activate tenant.'),
    });
  }

  private load(): void {
    this.loading = true;
    this.platform.getTenants(this.pageNumber, this.pageSize).subscribe((result) => {
      this.rows = result.items;
      this.totalCount = result.totalCount;
      this.loading = false;
    });
  }
}
