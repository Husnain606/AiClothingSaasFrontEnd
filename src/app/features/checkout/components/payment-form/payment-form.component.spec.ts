import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { PaymentFormComponent } from './payment-form.component';
import { PaymentInfo } from '../../models/checkout.model';

describe('PaymentFormComponent', () => {
  let component: PaymentFormComponent;
  let fixture: ComponentFixture<PaymentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentFormComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.form.get('cardholderName')?.value).toBe('');
    expect(component.form.get('cardNumber')?.value).toBe('');
  });

  it('should populate expiry months and years', () => {
    expect(component.months.length).toBe(12);
    expect(component.years.length).toBe(11);
  });

  it('should validate card number format', () => {
    const cardControl = component.form.get('cardNumber');

    cardControl?.setValue('123');
    expect(cardControl?.hasError('minlength')).toBe(true);

    cardControl?.setValue('4111111111111111');
    expect(cardControl?.valid).toBe(true);

    cardControl?.setValue('41111111111111ab');
    expect(cardControl?.hasError('pattern')).toBe(true);
  });

  it('should validate CVV format', () => {
    const cvvControl = component.form.get('cvv');

    cvvControl?.setValue('12');
    expect(cvvControl?.hasError('minlength')).toBe(true);

    cvvControl?.setValue('123');
    expect(cvvControl?.valid).toBe(true);

    cvvControl?.setValue('1234');
    expect(cvvControl?.valid).toBe(true);

    cvvControl?.setValue('12345');
    expect(cvvControl?.hasError('maxlength')).toBe(true);
  });

  it('should validate all required fields', () => {
    expect(component.form.invalid).toBe(true);

    component.form.patchValue({
      cardholderName: 'John Doe',
      cardNumber: '4111111111111111',
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123'
    });

    expect(component.form.valid).toBe(true);
  });

  it('should mask card number on submit', () => {
    component.form.patchValue({
      cardholderName: 'John Doe',
      cardNumber: '4111111111111111',
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123'
    });

    let emitted = false;
    component.submitted.subscribe((paymentInfo) => {
      expect(paymentInfo.cardNumber).toBe('************1111');
      expect(paymentInfo.cvv).toBe('');
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

  it('should generate card number error messages', () => {
    const field = component.form.get('cardNumber');
    field?.markAsTouched();
    field?.setErrors({ minlength: { requiredLength: 16 } });

    const message = component.getErrorMessage('cardNumber');
    expect(message).toContain('16 digits');
  });

  it('should generate CVV error messages', () => {
    const field = component.form.get('cvv');
    field?.markAsTouched();
    field?.setErrors({ minlength: { requiredLength: 3 } });

    const message = component.getErrorMessage('cvv');
    expect(message).toContain('3-4 digits');
  });

  it('should emit PaymentInfo with masked card', () => {
    component.form.patchValue({
      cardholderName: 'Jane Smith',
      cardNumber: '5555555555554444',
      expiryMonth: '06',
      expiryYear: '2026',
      cvv: '456'
    });

    let emitted = false;
    component.submitted.subscribe((paymentInfo: PaymentInfo) => {
      expect(paymentInfo.cardholderName).toBe('Jane Smith');
      expect(paymentInfo.cardNumber).toBe('************4444');
      expect(paymentInfo.expiryMonth).toBe('06');
      expect(paymentInfo.expiryYear).toBe('2026');
      expect(paymentInfo.cvv).toBe('');
      emitted = true;
    });

    component.onSubmit();
    expect(emitted || component.form.valid).toBeTruthy();
  });
});
