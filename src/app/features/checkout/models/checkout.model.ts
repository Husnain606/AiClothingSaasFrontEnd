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

export interface PaymentProof {
  /** The uploaded proof-of-payment file (image or PDF). Not persisted between sessions. */
  file: File | null;
  fileName: string;
}

export interface CheckoutForm {
  shippingAddress: ShippingAddress;
  paymentProof: PaymentProof;
  termsAccepted?: boolean;
}
