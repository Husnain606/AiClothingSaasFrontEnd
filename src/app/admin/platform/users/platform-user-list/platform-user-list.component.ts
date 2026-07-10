import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { PlatformUserDto } from '../../models/platform.model';
import { ToastService } from '../../../shared/services/toast.service';
import { DataTableComponent, DataTableColumn } from '../../../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-platform-user-list',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  templateUrl: './platform-user-list.component.html',
})
export class PlatformUserListComponent implements OnInit {
  columns: DataTableColumn<PlatformUserDto>[] = [
    { key: 'firstName', header: 'Name', cellTemplate: 'custom' },
    { key: 'email', header: 'Email' },
    { key: 'roles', header: 'Roles', cellTemplate: 'custom' },
    { key: 'isActive', header: 'Status', cellTemplate: 'custom' },
    { key: 'id', header: 'Actions', cellTemplate: 'custom' },
  ];
  users: PlatformUserDto[] = [];
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

  onUnlock(user: PlatformUserDto): void {
    this.platform.unlockPlatformUser(user.id).subscribe({
      next: () => {
        this.toast.success('User unlocked.');
        this.load();
      },
      error: () => this.toast.error('Failed to unlock user.'),
    });
  }

  private load(): void {
    this.loading = true;
    this.platform.getPlatformUsers(this.pageNumber, this.pageSize).subscribe((result) => {
      this.users = result.items;
      this.totalCount = result.totalCount;
      this.loading = false;
    });
  }
}
