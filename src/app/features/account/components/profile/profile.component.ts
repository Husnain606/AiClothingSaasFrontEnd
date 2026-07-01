import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { AccountService } from '../../services/account.service';
import { AccountStateService } from '../../services/account-state.service';
import { CustomerProfile } from '../../models/account.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  @Input() profile!: CustomerProfile | null;

  form!: FormGroup;
  isEditing = false;
  isSubmitting = false;
  showSuccessAlert = false;
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private accountState: AccountStateService
  ) {}

  ngOnInit(): void {
    this.initForm();
    if (this.profile) {
      this.populateForm(this.profile);
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      address: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', [Validators.required, Validators.minLength(2)]],
        zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
        country: ['US', Validators.required],
      }),
    });
  }

  private populateForm(profile: CustomerProfile): void {
    this.form.patchValue({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      address: {
        street: profile.address.street,
        city: profile.address.city,
        state: profile.address.state,
        zipCode: profile.address.zipCode,
        country: profile.address.country,
      },
    });
    this.form.get('email')?.disable();
  }

  onEdit(): void {
    this.isEditing = true;
    this.form.get('email')?.disable();
  }

  onCancel(): void {
    this.isEditing = false;
    this.showSuccessAlert = false;
    this.errorMessage = '';
    if (this.profile) {
      this.populateForm(this.profile);
    }
  }

  onSave(): void {
    if (this.form.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const formValue = this.form.getRawValue();

      this.accountService
        .updateProfile(formValue)
        .pipe(
          tap((profile) => {
            this.accountState.setProfile(profile);
            this.populateForm(profile);
            this.isEditing = false;
            this.showSuccessAlert = true;
            this.isSubmitting = false;
            setTimeout(() => {
              this.showSuccessAlert = false;
            }, 3000);
          }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          error: (err) => {
            console.error('Update failed:', err);
            this.errorMessage = err.error?.message || 'Failed to update profile. Please try again.';
            this.isSubmitting = false;
          },
        });
    }
  }

  getFieldError(fieldName: string): string | null {
    const field = this.form.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['email']) return 'Invalid email format';
      if (field.errors['pattern']) return `Invalid ${fieldName} format`;
    }
    return null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
