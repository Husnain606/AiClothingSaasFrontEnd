import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileComponent } from './profile.component';
import { AccountService } from '../../services/account.service';
import { AccountStateService } from '../../services/account-state.service';
import { of, throwError, Subject } from 'rxjs';
import { CustomerProfile } from '../../models/account.model';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockAccountService: Partial<AccountService>;
  let mockStateService: Partial<AccountStateService>;

  const mockProfile: CustomerProfile = {
    userId: '123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '1234567890',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
    },
    createdDate: new Date(),
    lastModifiedDate: new Date(),
  };

  beforeEach(async () => {
    mockAccountService = {
      updateProfile: vi.fn().mockReturnValue(of(mockProfile)),
    };

    mockStateService = {
      setProfile: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, ReactiveFormsModule],
      providers: [
        { provide: AccountService, useValue: mockAccountService },
        { provide: AccountStateService, useValue: mockStateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    component.profile = mockProfile;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form on init', () => {
      expect(component.form).toBeDefined();
      expect(component.form.get('firstName')).toBeDefined();
      expect(component.form.get('lastName')).toBeDefined();
      expect(component.form.get('email')).toBeDefined();
      expect(component.form.get('phone')).toBeDefined();
    });

    it('should initialize edit mode as false', () => {
      expect(component.isEditing).toBe(false);
    });

    it('should initialize submitting as false', () => {
      expect(component.isSubmitting).toBe(false);
    });

    it('should initialize success alert as false', () => {
      expect(component.showSuccessAlert).toBe(false);
    });

    it('should populate form with profile data', () => {
      expect(component.form.get('firstName')?.value).toBe('John');
      expect(component.form.get('lastName')?.value).toBe('Doe');
      expect(component.form.get('email')?.value).toBe('john@example.com');
      expect(component.form.get('phone')?.value).toBe('1234567890');
    });

    it('should populate address fields', () => {
      expect(component.form.get('address.street')?.value).toBe('123 Main St');
      expect(component.form.get('address.city')?.value).toBe('New York');
      expect(component.form.get('address.state')?.value).toBe('NY');
      expect(component.form.get('address.zipCode')?.value).toBe('10001');
      expect(component.form.get('address.country')?.value).toBe('US');
    });

    it('should disable email field on init', () => {
      expect(component.form.get('email')?.disabled).toBe(true);
    });
  });

  describe('Edit Mode', () => {
    it('should enable edit mode when onEdit is called', () => {
      component.isEditing = false;
      component.onEdit();
      expect(component.isEditing).toBe(true);
    });

    it('should disable email field when entering edit mode', () => {
      component.isEditing = false;
      component.onEdit();
      expect(component.form.get('email')?.disabled).toBe(true);
    });

    it('should allow editing other fields in edit mode', () => {
      component.onEdit();
      component.form.get('firstName')?.setValue('Jane');
      expect(component.form.get('firstName')?.value).toBe('Jane');
    });
  });

  describe('Cancel Functionality', () => {
    it('should disable edit mode when onCancel is called', () => {
      component.isEditing = true;
      component.onCancel();
      expect(component.isEditing).toBe(false);
    });

    it('should restore original data on cancel', () => {
      component.onEdit();
      component.form.get('firstName')?.setValue('Jane');

      component.onCancel();

      expect(component.form.get('firstName')?.value).toBe('John');
    });

    it('should clear error message on cancel', () => {
      component.errorMessage = 'Some error';
      component.onCancel();
      expect(component.errorMessage).toBe('');
    });

    it('should hide success alert on cancel', () => {
      component.showSuccessAlert = true;
      component.onCancel();
      expect(component.showSuccessAlert).toBe(false);
    });

    it('should restore full address data on cancel', () => {
      component.onEdit();
      component.form.get('address.street')?.setValue('456 Oak Ave');
      component.form.get('address.city')?.setValue('Los Angeles');

      component.onCancel();

      expect(component.form.get('address.street')?.value).toBe('123 Main St');
      expect(component.form.get('address.city')?.value).toBe('New York');
    });
  });

  describe('Form Validation', () => {
    it('should validate first name is required', () => {
      const firstNameControl = component.form.get('firstName');
      firstNameControl?.setValue('');
      expect(firstNameControl?.hasError('required')).toBe(true);
    });

    it('should validate first name min length', () => {
      const firstNameControl = component.form.get('firstName');
      firstNameControl?.setValue('J');
      expect(firstNameControl?.hasError('minlength')).toBe(true);
    });

    it('should validate last name is required', () => {
      const lastNameControl = component.form.get('lastName');
      lastNameControl?.setValue('');
      expect(lastNameControl?.hasError('required')).toBe(true);
    });

    it('should validate email format', () => {
      const emailControl = component.form.get('email');
      emailControl?.enable();
      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBe(true);
    });

    it('should accept valid email', () => {
      const emailControl = component.form.get('email');
      emailControl?.enable();
      emailControl?.setValue('test@example.com');
      expect(emailControl?.valid).toBe(true);
    });

    it('should validate phone is 10 digits', () => {
      const phoneControl = component.form.get('phone');
      phoneControl?.setValue('123456789');
      expect(phoneControl?.hasError('pattern')).toBe(true);

      phoneControl?.setValue('1234567890');
      expect(phoneControl?.valid).toBe(true);
    });

    it('should reject phone with non-digit characters', () => {
      const phoneControl = component.form.get('phone');
      phoneControl?.setValue('123-456-7890');
      expect(phoneControl?.hasError('pattern')).toBe(true);
    });

    it('should validate ZIP code is 5 digits', () => {
      const zipControl = component.form.get('address.zipCode');
      zipControl?.setValue('100');
      expect(zipControl?.hasError('pattern')).toBe(true);

      zipControl?.setValue('10001');
      expect(zipControl?.valid).toBe(true);
    });

    it('should validate street address is required', () => {
      const streetControl = component.form.get('address.street');
      streetControl?.setValue('');
      expect(streetControl?.hasError('required')).toBe(true);
    });

    it('should validate city is required', () => {
      const cityControl = component.form.get('address.city');
      cityControl?.setValue('');
      expect(cityControl?.hasError('required')).toBe(true);
    });

    it('should validate state min length', () => {
      const stateControl = component.form.get('address.state');
      stateControl?.setValue('N');
      expect(stateControl?.hasError('minlength')).toBe(true);
    });

    it('should validate country is required', () => {
      const countryControl = component.form.get('address.country');
      countryControl?.setValue('');
      expect(countryControl?.hasError('required')).toBe(true);
    });

    it('should have valid form initially', () => {
      expect(component.form.valid).toBe(true);
    });

    it('should have invalid form when required fields are empty', () => {
      component.form.get('firstName')?.setValue('');
      expect(component.form.invalid).toBe(true);
    });
  });

  describe('Save Functionality', () => {
    it('should not submit invalid form', () => {
      component.form.get('firstName')?.setValue('');

      component.onSave();

      expect(mockAccountService.updateProfile).not.toHaveBeenCalled();
    });

    it('should call updateProfile on valid form submit', () => {
      component.form.get('firstName')?.setValue('Jane');

      component.onSave();

      expect(mockAccountService.updateProfile).toHaveBeenCalled();
    });

    it('should set submitting to true during submission', () => {
      // Use a pending Subject so the in-flight submitting state can be observed
      const pending = new Subject<CustomerProfile>();
      mockAccountService.updateProfile = vi.fn().mockReturnValue(pending.asObservable());

      component.isSubmitting = false;
      component.onSave();

      expect(component.isSubmitting).toBe(true);

      pending.next(mockProfile);
      pending.complete();
    });

    it('should set submitting to false after submission', () => {
      component.onSave();

      expect(component.isSubmitting).toBe(false);
    });

    it('should update state service with new profile', () => {
      component.onSave();

      expect(mockStateService.setProfile).toHaveBeenCalledWith(mockProfile);
    });

    it('should disable edit mode after successful save', () => {
      component.isEditing = true;
      component.onSave();

      expect(component.isEditing).toBe(false);
    });

    it('should show success alert after save', () => {
      component.showSuccessAlert = false;
      component.onSave();

      expect(component.showSuccessAlert).toBe(true);
    });

    it('should hide success alert after 3 seconds', () => {
      // Zoneless app: use vi fake timers instead of fakeAsync/tick
      vi.useFakeTimers();
      try {
        component.showSuccessAlert = false;
        component.onSave();

        expect(component.showSuccessAlert).toBe(true);
        vi.advanceTimersByTime(3000);
        expect(component.showSuccessAlert).toBe(false);
      } finally {
        vi.useRealTimers();
      }
    });

    it('should send form data in update request', () => {
      component.form.get('firstName')?.setValue('Jane');
      component.form.get('phone')?.setValue('9876543210');

      component.onSave();

      expect(mockAccountService.updateProfile).toHaveBeenCalled();
    });

    it('should repopulate form with server response after save', () => {
      component.onSave();

      expect(component.form.get('firstName')?.value).toBe('John');
    });
  });

  describe('Error Handling', () => {
    it('should handle profile update error', () => {
      mockAccountService.updateProfile = vi
        .fn()
        .mockReturnValue(throwError(() => ({ error: { message: 'Update failed' } })));

      component.onSave();

      expect(component.errorMessage).toBe('Update failed');
      expect(component.isSubmitting).toBe(false);
    });

    it('should set default error message if no message provided', () => {
      mockAccountService.updateProfile = vi
        .fn()
        .mockReturnValue(throwError(() => ({ error: {} })));

      component.onSave();

      expect(component.errorMessage).toContain('Failed to update profile');
    });

    it('should clear error message before saving', () => {
      component.errorMessage = 'Previous error';

      component.onSave();

      expect(component.errorMessage).toBe('');
    });

    it('should set submitting to false on error', () => {
      mockAccountService.updateProfile = vi
        .fn()
        .mockReturnValue(throwError(() => new Error('API error')));

      component.onSave();

      expect(component.isSubmitting).toBe(false);
    });
  });

  describe('Field Error Messages', () => {
    it('should return error message for required field', () => {
      const firstNameControl = component.form.get('firstName');
      firstNameControl?.setValue('');
      firstNameControl?.markAsTouched();

      const error = component.getFieldError('firstName');
      expect(error).toContain('required');
    });

    it('should return error message for minlength', () => {
      const firstNameControl = component.form.get('firstName');
      firstNameControl?.setValue('J');
      firstNameControl?.markAsTouched();

      const error = component.getFieldError('firstName');
      expect(error).toContain('at least');
    });

    it('should return email error message', () => {
      const emailControl = component.form.get('email');
      emailControl?.enable();
      emailControl?.setValue('invalid');
      emailControl?.markAsTouched();

      const error = component.getFieldError('email');
      expect(error).toContain('Invalid email');
    });

    it('should return pattern error message for phone', () => {
      const phoneControl = component.form.get('phone');
      phoneControl?.setValue('123');
      phoneControl?.markAsTouched();

      const error = component.getFieldError('phone');
      expect(error).toContain('Invalid');
    });

    it('should return null error when field is valid', () => {
      const firstNameControl = component.form.get('firstName');
      firstNameControl?.setValue('John');
      firstNameControl?.markAsTouched();

      const error = component.getFieldError('firstName');
      expect(error).toBeNull();
    });

    it('should return null error when field is not touched', () => {
      const firstNameControl = component.form.get('firstName');
      firstNameControl?.setValue('');

      const error = component.getFieldError('firstName');
      expect(error).toBeNull();
    });
  });

  describe('Component Cleanup', () => {
    it('should unsubscribe from observables on destroy', () => {
      const destroySpy = vi.spyOn(component['destroy$'], 'next');
      component.ngOnDestroy();
      expect(destroySpy).toHaveBeenCalled();
    });

    it('should complete destroy subject on destroy', () => {
      const completeSpy = vi.spyOn(component['destroy$'], 'complete');
      component.ngOnDestroy();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
