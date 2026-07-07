import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DiscountAdminService } from '../services/discount-admin.service';
import { DiscountDto } from '../models/discount-admin.model';
import { DataTableComponent, DataTableColumn } from '../../shared/components/data-table/data-table.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-discount-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DataTableComponent, ConfirmModalComponent, StatusBadgeComponent],
  templateUrl: './discount-list.component.html',
})
export class DiscountListComponent implements OnInit {
  columns: DataTableColumn<DiscountDto>[] = [
    { key: 'code', header: 'Code' },
    { key: 'type', header: 'Type' },
    { key: 'value', header: 'Value' },
    { key: 'isActive', header: 'Status', cellTemplate: 'custom' },
    { key: 'endsAt', header: 'Ends', cellTemplate: 'date' },
    { key: 'id', header: 'Actions', cellTemplate: 'custom' },
  ];
  rows: DiscountDto[] = [];
  totalCount = 0;
  pageNumber = 1;
  pageSize = 20;
  loading = false;
  deleteModalOpen = false;
  discountPendingDelete: DiscountDto | null = null;

  constructor(
    private discounts: DiscountAdminService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.load();
  }

  onDeactivate(discount: DiscountDto): void {
    this.discounts.deactivateDiscount(discount.id).subscribe({
      next: () => {
        this.toast.success('Discount deactivated.');
        this.load();
      },
      error: () => this.toast.error('Failed to deactivate discount.'),
    });
  }

  openDeleteModal(discount: DiscountDto): void {
    this.discountPendingDelete = discount;
    this.deleteModalOpen = true;
  }

  onDeleteCancelled(): void {
    this.deleteModalOpen = false;
    this.discountPendingDelete = null;
  }

  onDeleteConfirmed(): void {
    if (!this.discountPendingDelete) return;
    this.discounts.deleteDiscount(this.discountPendingDelete.id).subscribe({
      next: () => {
        this.toast.success('Discount deleted.');
        this.deleteModalOpen = false;
        this.load();
      },
      error: () => {
        this.toast.error('Failed to delete discount.');
        this.deleteModalOpen = false;
      },
    });
  }

  private load(): void {
    this.loading = true;
    this.discounts.getDiscounts(this.pageNumber, this.pageSize).subscribe((result) => {
      this.rows = result.items;
      this.totalCount = result.totalCount;
      this.loading = false;
    });
  }
}
