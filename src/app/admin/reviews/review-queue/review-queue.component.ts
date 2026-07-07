import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewAdminService } from '../services/review-admin.service';
import { ReviewDto } from '../models/review-admin.model';
import { DataTableComponent, DataTableColumn } from '../../shared/components/data-table/data-table.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-review-queue',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, ConfirmModalComponent],
  templateUrl: './review-queue.component.html',
})
export class ReviewQueueComponent implements OnInit {
  columns: DataTableColumn<ReviewDto>[] = [
    { key: 'productId', header: 'Product' },
    { key: 'customerId', header: 'Customer' },
    { key: 'rating', header: 'Rating' },
    { key: 'title', header: 'Title' },
    { key: 'body', header: 'Comment' },
    { key: 'createdAt', header: 'Submitted', cellTemplate: 'date' },
    { key: 'id', header: 'Actions', cellTemplate: 'custom' },
  ];
  rows: ReviewDto[] = [];
  totalCount = 0;
  pageNumber = 1;
  pageSize = 20;
  loading = false;

  rejectModalOpen = false;
  reviewPendingReject: ReviewDto | null = null;
  rejectReasonInput = '';

  constructor(
    private reviewApi: ReviewAdminService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.load();
  }

  onApprove(review: ReviewDto): void {
    this.reviewApi.approve(review.id).subscribe({
      next: () => {
        this.toast.success('Review approved.');
        this.load();
      },
      error: () => this.toast.error('Failed to approve review.'),
    });
  }

  openRejectModal(review: ReviewDto): void {
    this.reviewPendingReject = review;
    this.rejectReasonInput = '';
    this.rejectModalOpen = true;
  }

  onRejectCancelled(): void {
    this.rejectModalOpen = false;
    this.reviewPendingReject = null;
  }

  onRejectConfirmed(): void {
    if (!this.reviewPendingReject) return;
    this.reviewApi.reject(this.reviewPendingReject.id, this.rejectReasonInput).subscribe({
      next: () => {
        this.toast.success('Review rejected.');
        this.rejectModalOpen = false;
        this.load();
      },
      error: () => {
        this.toast.error('Failed to reject review.');
        this.rejectModalOpen = false;
      },
    });
  }

  private load(): void {
    this.loading = true;
    this.reviewApi.getReviews('Pending').subscribe((result) => {
      this.rows = result.items;
      this.totalCount = result.totalCount;
      this.loading = false;
    });
  }
}
