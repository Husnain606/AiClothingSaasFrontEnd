import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsAdminService } from '../services/settings-admin.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-tenant-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tenant-profile.component.html',
})
export class TenantProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private settings = inject(SettingsAdminService);
  private toast = inject(ToastService);

  form = this.fb.group({
    name: this.fb.nonNullable.control('', Validators.required),
    phone: this.fb.nonNullable.control(''),
    logoUrl: this.fb.nonNullable.control(''),
    paymentInstructions: this.fb.nonNullable.control('', Validators.maxLength(2000)),
  });

  ngOnInit(): void {
    this.settings.getProfile().subscribe((profile) => {
      this.form.setValue({
        name: profile.name,
        phone: profile.phone ?? '',
        logoUrl: profile.logoUrl ?? '',
        paymentInstructions: profile.paymentInstructions ?? '',
      });
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.settings
      .updateProfile({
        name: raw.name,
        phone: raw.phone || null,
        logoUrl: raw.logoUrl || null,
        // Not `|| null`: the backend only skips assignment when this is null (so an
        // omitted field never wipes a previously-set value) - sending '' here is how
        // the admin actually clears it, and the public read side already treats an
        // empty string as "no instructions set".
        paymentInstructions: raw.paymentInstructions,
      })
      .subscribe({
        next: () => this.toast.success('Profile updated.'),
        error: () => this.toast.error('Failed to update profile.'),
      });
  }
}
