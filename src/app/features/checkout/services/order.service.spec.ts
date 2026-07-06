import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@env/environment';
import { ApiService } from '../../../core/services/api.service';
import { OrderService } from './order.service';
import { Order } from '../models/order.model';
import { CheckoutForm, ShippingAddress, PaymentInfo } from '../models/checkout.model';
import { CartItem } from '../../cart/models/cart.model';

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  const ordersUrl = `${environment.apiBaseUrl}/store/orders`;

  const emptyApiResponse = {
    statusCode: 200,
    message: 'OK',
    data: null,
    errors: null,
    timestamp: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrderService, ApiService]
    });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create an order with only backend-accepted fields', () => {
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

    const checkoutForm: CheckoutForm = {
      shippingAddress,
      paymentInfo: {
        cardholderName: 'John Doe',
        cardNumber: '****1111',
        expiryMonth: '12',
        expiryYear: '2025',
        cvv: ''
      }
    };

    const cartItems: CartItem[] = [
      {
        productId: '1',
        productName: 'Test Product',
        price: 100,
        quantity: 2,
        selectedVariant: { size: 'M', color: 'Red' },
        imageUrl: 'test.jpg'
      }
    ];

    service.createOrder(checkoutForm, cartItems).subscribe();

    const req = httpMock.expectOne(ordersUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      shippingAddress,
      paymentInfo: { cardholderName: 'John Doe', cardNumber: '****1111' },
      items: [{ productId: '1', quantity: 2, variant: { size: 'M', color: 'Red' } }],
    });
    req.flush(emptyApiResponse);
  });

  it('should retrieve all orders', () => {
    service.getOrders().subscribe();
    const req = httpMock.expectOne(ordersUrl);
    expect(req.request.method).toBe('GET');
    req.flush({ ...emptyApiResponse, data: [] });
  });

  it('should retrieve order by id', () => {
    service.getOrderById('ORD-2026-001').subscribe();
    const req = httpMock.expectOne(`${ordersUrl}/ORD-2026-001`);
    expect(req.request.method).toBe('GET');
    req.flush(emptyApiResponse);
  });

  it('should cancel order', () => {
    service.cancelOrder('ORD-2026-001').subscribe();
    const req = httpMock.expectOne(`${ordersUrl}/ORD-2026-001/cancel`);
    expect(req.request.method).toBe('PUT');
    req.flush(emptyApiResponse);
  });
});
