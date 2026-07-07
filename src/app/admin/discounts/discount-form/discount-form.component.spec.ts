import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { DiscountFormComponent } from './discount-form.component';
import { DiscountAdminService } from '../services/discount-admin.service';
import { ToastService } from '../../shared/services/toast.service';
import { DiscountDto } from '../models/discount-admin.model';

describe('DiscountFormComponent', () => {
  let fixture: ComponentFixture<DiscountFormComponent>;
  let component: DiscountFormComponent;
  let mockDiscounts: Partial<DiscountAdminService>;
  let mockToast: Partial<ToastService>;

  const existing: DiscountDto = {
    id: 'd1',
    code: 'SAVE10',
    type: 'Percentage',
    value: 10,
    redemptionCount: 0,
    isActive: true,
    startsAt: '2026-07-01',
    endsAt: '2026-08-01',
    createdAt: '2026-06-01',
  };

  function setup(paramId: string | null): void {
    mockDiscounts = {
      createDiscount: vi.fn().mockReturnValue(of({ ...existing, id: 'd2' })),
      updateDiscount: vi.fn().mockReturnValue(of(existing)),
      getDiscount: vi.fn().mockReturnValue(of(existing)),
    };
    mockToast = { success: vi.fn(), error: vi.fn() };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [DiscountFormComponent],
      providers: [
        provideRouter([]),
        { provide: DiscountAdminService, useValue: mockDiscounts },
        { provide: ToastService, useValue: mockToast },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => paramId } } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DiscountFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('creates a discount on submit in create mode', () => {
    setup(null);
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.form.setValue({ code: 'SAVE20', type: 'Percentage', value: 20, startsAt: '2026-07-01', endsAt: '2026-08-01' });
    component.onSubmit();
    expect(mockDiscounts.createDiscount).toHaveBeenCalled();
    expect(mockToast.success).toHaveBeenCalled();
    expect(navSpy).toHaveBeenCalledWith(['/admin/discounts']);
  });

  it('surfaces a duplicate-code error via a toast (409 Conflict)', () => {
    setup(null);
    (mockDiscounts.createDiscount as ReturnType<typeof vi.fn>).mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { isSuccess: false, statusCode: 409, message: "Code 'SAVE10' is already in use.", data: null, errors: null },
          })
      )
    );
    component.form.setValue({ code: 'SAVE10', type: 'Percentage', value: 10, startsAt: '2026-07-01', endsAt: '2026-08-01' });
    component.onSubmit();
    expect(mockToast.error).toHaveBeenCalledWith("Code 'SAVE10' is already in use.");
  });

  it('falls back to a generic message when the error body has no message', () => {
    setup(null);
    (mockDiscounts.createDiscount as ReturnType<typeof vi.fn>).mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500, error: null }))
    );
    component.form.setValue({ code: 'SAVE30', type: 'Percentage', value: 30, startsAt: '2026-07-01', endsAt: '2026-08-01' });
    component.onSubmit();
    expect(mockToast.error).toHaveBeenCalledWith('Failed to save discount.');
  });

  it('loads an existing discount in edit mode', () => {
    setup('d1');
    expect(component.isEditMode).toBe(true);
    expect(component.form.value.code).toBe('SAVE10');
  });

  it('updates a discount on submit in edit mode', () => {
    setup('d1');
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.onSubmit();
    expect(mockDiscounts.updateDiscount).toHaveBeenCalledWith('d1', expect.any(Object));
    expect(navSpy).toHaveBeenCalledWith(['/admin/discounts']);
  });

  it('does not submit an invalid form', () => {
    setup(null);
    component.form.controls.code.setValue('');
    component.onSubmit();
    expect(mockDiscounts.createDiscount).not.toHaveBeenCalled();
  });
});
