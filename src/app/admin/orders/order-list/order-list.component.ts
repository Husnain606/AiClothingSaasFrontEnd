import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OrderAdminService } from '../../shared/services/order-admin.service';
import { OrderDto, OrderFilter, OrderStatus } from '../../shared/models/order-admin.model';
import { DataTableComponent, DataTableColumn } from '../../shared/components/data-table/data-table.component';
import { DateRangePickerComponent, DateRange } from '../../shared/components/date-range-picker/date-range-picker.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DataTableComponent, DateRangePickerComponent],
  templateUrl: './order-list.component.html',
})
export class OrderListComponent implements OnInit {
  columns: DataTableColumn<OrderDto>[] = [
    { key: 'orderId', header: 'Order #' },
    { key: 'orderDate', header: 'Date', cellTemplate: 'date' },
    { key: 'status', header: 'Status' },
    { key: 'total', header: 'Total', cellTemplate: 'currency' },
  ];
  rows: OrderDto[] = [];
  totalCount = 0;
  pageNumber = 1;
  pageSize = 20;
  loading = false;
  statusFilter: OrderStatus | '' = '';
  search = '';
  range: DateRange = { from: '', to: '' };

  constructor(
    private orderApi: OrderAdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  onRowSelect(index: number): void {
    const row = this.rows[index];
    if (row) this.router.navigate(['/admin/orders', row.id]);
  }

  handleTableClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const tr = target.closest('tbody tr');
    if (!tr) return;
    const index = Array.from(tr.parentElement?.children ?? []).indexOf(tr);
    this.onRowSelect(index);
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter = status as OrderStatus | '';
    this.pageNumber = 1;
    this.load();
  }

  onSearchChange(term: string): void {
    this.search = term;
    this.pageNumber = 1;
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
    const filter: OrderFilter = {
      page: this.pageNumber,
      pageSize: this.pageSize,
      ...(this.statusFilter ? { status: this.statusFilter } : {}),
      ...(this.search ? { search: this.search } : {}),
      ...(this.range.from ? { from: this.range.from } : {}),
      ...(this.range.to ? { to: this.range.to } : {}),
    };
    this.orderApi.getOrders(filter).subscribe((result) => {
      this.rows = result.items;
      this.totalCount = result.totalCount;
      this.loading = false;
    });
  }
}
