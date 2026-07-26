import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { CheckoutForm } from '../models/checkout.model';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private checkoutFormSubject = new BehaviorSubject<CheckoutForm>(this.getEmptyForm());
  checkoutForm$ = this.checkoutFormSubject.asObservable().pipe(shareReplay(1));

  setCheckoutForm(form: CheckoutForm): void {
    this.checkoutFormSubject.next(form);
  }

  getCheckoutForm(): CheckoutForm {
    return this.checkoutFormSubject.value;
  }

  private getEmptyForm(): CheckoutForm {
    return {
      shippingAddress: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US'
      },
      paymentProof: {
        file: null,
        fileName: ''
      },
      termsAccepted: false
    };
  }
}
