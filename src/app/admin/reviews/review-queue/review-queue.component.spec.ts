import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { ReviewQueueComponent } from './review-queue.component';
import { ReviewAdminService } from '../services/review-admin.service';
import { ToastService } from '../../shared/services/toast.service';
import { ReviewDto } from '../models/review-admin.model';

describe('ReviewQueueComponent', () => {
  let fixture: ComponentFixture<ReviewQueueComponent>;
  let component: ReviewQueueComponent;
  let mockReviews: Partial<ReviewAdminService>;
  let mockToast: Partial<ToastService>;

  const review: ReviewDto = {
    id: 'r1',
    productId: 'p1',
    customerId: 'c1',
    rating: 4,
    title: 'Nice jacket',
    body: 'Fits well.',
    status: 'Pending',
    createdAt: '2026-07-01',
  };

  const review2: ReviewDto = {
    id: 'r2',
    productId: 'p2',
    customerId: 'c2',
    rating: 1,
    title: 'Bad',
    body: 'Terrible quality.',
    status: 'Pending',
    createdAt: '2026-07-02',
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockReviews = {
      getReviews: vi
        .fn()
        .mockReturnValue(of({ items: [review, review2], totalCount: 2, page: 1, pageSize: 20, totalPages: 1 })),
      approve: vi.fn().mockReturnValue(of({ ...review, status: 'Approved' })),
      reject: vi.fn().mockReturnValue(of({ ...review, status: 'Rejected' })),
    };
    mockToast = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ReviewQueueComponent],
      providers: [
        provideRouter([]),
        { provide: ReviewAdminService, useValue: mockReviews },
        { provide: ToastService, useValue: mockToast },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ReviewQueueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads pending reviews by default', () => {
    expect(mockReviews.getReviews).toHaveBeenCalledWith('Pending');
    expect(component.rows.length).toBe(2);
  });

  it('renders exactly one row per review (no duplicate rendering)', () => {
    const rows = fixture.nativeElement.querySelectorAll('table tbody tr');
    expect(rows.length).toBe(component.rows.length);
    expect(rows.length).toBe(2);
  });

  it('approves a review', () => {
    component.onApprove(review);
    expect(mockReviews.approve).toHaveBeenCalledWith('r1');
    expect(mockToast.success).toHaveBeenCalled();
  });

  it('surfaces an approve failure via a toast', () => {
    (mockReviews.approve as ReturnType<typeof vi.fn>).mockReturnValue(
      new Observable((subscriber) => subscriber.error(new Error('fail')))
    );
    component.onApprove(review);
    expect(mockToast.error).toHaveBeenCalled();
  });

  it('opens the reject modal and rejects with a reason typed inside the modal dialog', async () => {
    const rejectBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.btn-outline-danger');
    rejectBtn.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const dialog: HTMLElement = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();

    const reasonInput: HTMLInputElement | null = dialog.querySelector('#confirmReason');
    expect(reasonInput).toBeTruthy();
    expect(reasonInput).toBe(document.activeElement);

    reasonInput!.value = 'Inappropriate content';
    reasonInput!.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    const confirmBtn: HTMLButtonElement = dialog.querySelector('[data-testid="confirm-btn"]')!;
    confirmBtn.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mockReviews.reject).toHaveBeenCalledWith('r1', 'Inappropriate content');
    expect(component.rejectModalOpen).toBe(false);
  });

  it('cancels the reject modal without rejecting', () => {
    component.openRejectModal(review);
    component.onRejectCancelled();
    expect(component.rejectModalOpen).toBe(false);
    expect(mockReviews.reject).not.toHaveBeenCalled();
  });
});
