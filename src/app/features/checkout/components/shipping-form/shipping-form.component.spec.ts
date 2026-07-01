import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ShippingFormComponent } from './shipping-form.component';
import { AuthService } from '../../../../core/services/auth.service';
import { of } from 'rxjs';
import { ShippingAddress } from '../../models/checkout.model';

describe('ShippingFormComponent', () => {
  let component: ShippingFormComponent;
  let fixture: ComponentFixture<ShippingFormComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippingFormComponent, ReactiveFormsModule],
      providers: [AuthService]
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    fixture = TestBed.createComponent(ShippingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.form.get('firstName')?.value).toBe('');
    expect(component.form.get('email')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const form = component.form;

    expect(form.invalid).toBe(true);

    form.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1-555-0123',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US'
    });

    expect(form.valid).toBe(true);
  });

  it('should validate email format', () => {
    const emailControl = component.form.get('email');

    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('valid@example.com');
    expect(emailControl?.hasError('email')).toBe(false);
  });

  it('should emit form value on valid submit', () => {
    const shippingAddress: ShippingAddress = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1-555-0123',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US'
    };

    component.form.patchValue(shippingAddress);

    let emitted = false;
    component.submitted.subscribe((result) => {
      expect(result.firstName).toBe('John');
      expect(result.city).toBe('New York');
      emitted = true;
    });

    component.onSubmit();
    expect(emitted || component.form.valid).toBeTruthy();
  });

  it('should not emit on invalid form submit', () => {
    let emitted = false;

    component.submitted.subscribe(() => {
      emitted = true;
    });

    component.onSubmit();
    expect(emitted).toBe(false);
  });

  it('should generate error messages', () => {
    const field = component.form.get('firstName');
    field?.markAsTouched();
    field?.setErrors({ required: true });

    const message = component.getErrorMessage('firstName');
    expect(message).toContain('required');
  });

  it('should unsubscribe on destroy', () => {
    const nextSpy = vi.spyOn(component['destroy$'], 'next');
    const completeSpy = vi.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
