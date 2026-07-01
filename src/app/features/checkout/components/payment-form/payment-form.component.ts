import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentInfo } from '../../models/checkout.model';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss']
})
export class PaymentFormComponent implements OnInit {
  @Output() submitted = new EventEmitter<PaymentInfo>();

  form!: FormGroup;
  isProcessing = false;
  months: string[] = [];
  years: string[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initForm();
    this.populateExpiryOptions();
  }

  private initForm() {
    this.form = this.fb.group({
      cardholderName: ['', [Validators.required]],
      cardNumber: ['', [Validators.required, Validators.minLength(16), Validators.maxLength(16), Validators.pattern(/^\d+$/)]],
      expiryMonth: ['', [Validators.required]],
      expiryYear: ['', [Validators.required]],
      cvv: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4), Validators.pattern(/^\d+$/)]]
    });
  }

  private populateExpiryOptions() {
    // Months
    for (let i = 1; i <= 12; i++) {
      this.months.push(i.toString().padStart(2, '0'));
    }

    // Years (current + 10 years)
    const currentYear = new Date().getFullYear();
    for (let i = 0; i <= 10; i++) {
      this.years.push((currentYear + i).toString());
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.isProcessing = true;
      const maskedCard = this.maskCardNumber(this.form.value.cardNumber);
      const paymentInfo: PaymentInfo = {
        cardholderName: this.form.value.cardholderName,
        cardNumber: maskedCard,
        expiryMonth: this.form.value.expiryMonth,
        expiryYear: this.form.value.expiryYear,
        cvv: '' // Never store/send CVV
      };
      this.submitted.emit(paymentInfo);
      this.isProcessing = false;
    } else {
      this.markFormGroupTouched(this.form);
    }
  }

  private maskCardNumber(cardNumber: string): string {
    // Return last 4 digits: "****1111"
    return '*'.repeat(Math.max(0, cardNumber.length - 4)) + cardNumber.slice(-4);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key)?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    if (field.errors['required']) {
      return `${this.capitalize(fieldName)} is required`;
    }
    if (fieldName === 'cardNumber') {
      if (field.errors['minlength'] || field.errors['maxlength']) {
        return 'Card number must be 16 digits';
      }
      if (field.errors['pattern']) {
        return 'Card number must contain only digits';
      }
    }
    if (fieldName === 'cvv') {
      if (field.errors['minlength'] || field.errors['maxlength']) {
        return 'CVV must be 3-4 digits';
      }
      if (field.errors['pattern']) {
        return 'CVV must contain only digits';
      }
    }
    return 'Invalid input';
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/([A-Z])/g, ' $1');
  }
}
