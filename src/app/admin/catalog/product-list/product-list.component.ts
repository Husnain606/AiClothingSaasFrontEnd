import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CatalogAdminService } from '../services/catalog-admin.service';
import { ProductSummaryDto } from '../models/catalog-admin.model';
import { DataTableComponent, DataTableColumn } from '../../shared/components/data-table/data-table.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DataTableComponent, StatusBadgeComponent, ConfirmModalComponent],
  templateUrl: './product-list.component.html',
})
export class ProductListComponent implements OnInit {
  columns: DataTableColumn<ProductSummaryDto>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'status', header: 'Status' },
    { key: 'basePrice', header: 'Price', cellTemplate: 'currency' },
    { key: 'createdAt', header: 'Created', cellTemplate: 'date' },
  ];
  rows: ProductSummaryDto[] = [];
  totalCount = 0;
  pageNumber = 1;
  pageSize = 20;
  loading = false;
  search = '';
  deleteModalOpen = false;
  productPendingDelete: ProductSummaryDto | null = null;

  constructor(
    private catalog: CatalogAdminService,
    private toast: ToastService
  ) {}

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

  onPublish(product: ProductSummaryDto): void {
    this.catalog.publishProduct(product.id).subscribe({
      next: () => {
        this.toast.success('Product published.');
        this.load();
      },
      error: () => this.toast.error('Failed to publish product.'),
    });
  }

  onArchive(product: ProductSummaryDto): void {
    this.catalog.archiveProduct(product.id).subscribe({
      next: () => {
        this.toast.success('Product archived.');
        this.load();
      },
      error: () => this.toast.error('Failed to archive product.'),
    });
  }

  openDeleteModal(product: ProductSummaryDto): void {
    this.productPendingDelete = product;
    this.deleteModalOpen = true;
  }

  onDeleteCancelled(): void {
    this.deleteModalOpen = false;
    this.productPendingDelete = null;
  }

  onDeleteConfirmed(): void {
    if (!this.productPendingDelete) return;
    this.catalog.deleteProduct(this.productPendingDelete.id).subscribe({
      next: () => {
        this.toast.success('Product deleted.');
        this.deleteModalOpen = false;
        this.load();
      },
      error: () => {
        this.toast.error('Failed to delete product.');
        this.deleteModalOpen = false;
      },
    });
  }

  private load(): void {
    this.loading = true;
    this.catalog.getProducts({ page: this.pageNumber, pageSize: this.pageSize, search: this.search || undefined }).subscribe((result) => {
      this.rows = result.items;
      this.totalCount = result.totalCount;
      this.loading = false;
    });
  }
}
