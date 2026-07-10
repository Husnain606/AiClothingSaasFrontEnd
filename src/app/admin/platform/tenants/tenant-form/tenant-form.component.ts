import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-tenant-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './tenant-form.component.html',
})
export class TenantFormComponent {
  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    name: this.fb.nonNullable.control('', Validators.required),
    slug: this.fb.nonNullable.control('', Validators.required),
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
  });

  constructor(
    private router: Router,
    private platform: PlatformAdminService,
    private toast: ToastService
  ) {}

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.platform.createTenant(this.form.getRawValue()).subscribe({
      next: () => {
        this.toast.success('Tenant created.');
        this.router.navigate(['/admin/platform/tenants']);
      },
      error: () => this.toast.error('Failed to create tenant.'),
    });
  }
}
