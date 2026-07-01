export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentInfo {
  cardholderName: string;
  cardNumber: string;      // Stored masked: "****1111"
  expiryMonth: string;      // "01" to "12"
  expiryYear: string;       // "2025" etc
  cvv: string;              // Never stored, only validated
}

export interface CheckoutForm {
  shippingAddress: ShippingAddress;
  paymentInfo: PaymentInfo;
  termsAccepted?: boolean;
}
