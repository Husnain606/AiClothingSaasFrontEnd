import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { DiscountAdminService } from '../services/discount-admin.service';
import { DiscountType } from '../models/discount-admin.model';
import { ToastService } from '../../shared/services/toast.service';

interface DiscountErrorBody {
  message?: string;
  errors?: string[] | null;
}

@Component({
  selector: 'app-discount-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './discount-form.component.html',
})
export class DiscountFormComponent implements OnInit {
  isEditMode = false;
  discountId: string | null = null;

  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    code: this.fb.nonNullable.control('', Validators.required),
    type: this.fb.nonNullable.control<DiscountType>('Percentage', Validators.required),
    value: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0.01)]),
    startsAt: this.fb.nonNullable.control('', Validators.required),
    endsAt: this.fb.nonNullable.control('', Validators.required),
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private discounts: DiscountAdminService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.discountId = id;
      this.discounts.getDiscount(id).subscribe((discount) =>
        this.form.setValue({
          code: discount.code,
          type: discount.type,
          value: discount.value,
          startsAt: discount.startsAt,
          endsAt: discount.endsAt,
        })
      );
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.form.getRawValue();
    const save =
      this.isEditMode && this.discountId
        ? this.discounts.updateDiscount(this.discountId, payload)
        : this.discounts.createDiscount(payload);

    save.subscribe({
      next: () => {
        this.toast.success(this.isEditMode ? 'Discount updated.' : 'Discount created.');
        this.router.navigate(['/admin/discounts']);
      },
      error: (err: unknown) => this.toast.error(this.extractErrorMessage(err)),
    });
  }

  private extractErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as DiscountErrorBody | null;
      const message = body?.message ?? body?.errors?.[0];
      if (message) return message;
    }
    return 'Failed to save discount.';
  }
}
