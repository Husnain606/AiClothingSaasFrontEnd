import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CustomerAdminService } from '../services/customer-admin.service';
import { CustomerDto } from '../models/customer-admin.model';
import { DataTableComponent, DataTableColumn } from '../../shared/components/data-table/data-table.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DataTableComponent, StatusBadgeComponent],
  templateUrl: './customer-list.component.html',
})
export class CustomerListComponent implements OnInit {
  columns: DataTableColumn<CustomerDto>[] = [
    { key: 'email', header: 'Email', cellTemplate: 'custom' },
    { key: 'firstName', header: 'First name' },
    { key: 'lastName', header: 'Last name' },
    { key: 'isActive', header: 'Status', cellTemplate: 'custom' },
    { key: 'createdAt', header: 'Joined', cellTemplate: 'date' },
  ];
  rows: CustomerDto[] = [];
  totalCount = 0;
  pageNumber = 1;
  pageSize = 20;
  loading = false;
  search = '';

  constructor(private customers: CustomerAdminService) {}

  ngOnInit(): void {
    this.load();
  }

  onSearchChange(term: string): void {
    this.search = term;
    this.pageNumber = 1;
    this.load();
  }

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.customers.getCustomers(this.pageNumber, this.pageSize, this.search || undefined).subscribe((result) => {
      this.rows = result.items;
      this.totalCount = result.totalCount;
      this.loading = false;
    });
  }
}
