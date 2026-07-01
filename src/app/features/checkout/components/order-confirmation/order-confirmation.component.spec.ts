import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderConfirmationComponent } from './order-confirmation.component';
import { Order } from '../../models/order.model';
import { ShippingAddress } from '../../models/checkout.model';

describe('OrderConfirmationComponent', () => {
  let component: OrderConfirmationComponent;
  let fixture: ComponentFixture<OrderConfirmationComponent>;

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

  const mockOrder: Order = {
    orderId: 'ORD-2026-001',
    customerId: 'user-1',
    orderDate: new Date('2026-07-01'),
    status: 'confirmed',
    items: [
      {
        productId: '1',
        productName: 'Test Product',
        price: 100,
        quantity: 2,
        variant: { size: 'M', color: 'Red' }
      }
    ],
    shippingAddress,
    subtotal: 200,
    tax: 20,
    shippingCost: 0,
    total: 220
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderConfirmationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderConfirmationComponent);
    component = fixture.componentInstance;
    component.order = mockOrder;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display order number', () => {
    expect(component.order.orderId).toBe('ORD-2026-001');
  });

  it('should display order items', () => {
    expect(component.order.items.length).toBe(1);
    expect(component.order.items[0].productName).toBe('Test Product');
  });

  it('should display shipping address', () => {
    expect(component.order.shippingAddress.firstName).toBe('John');
    expect(component.order.shippingAddress.city).toBe('New York');
  });

  it('should display order total', () => {
    expect(component.order.total).toBe(220);
  });

  it('should display order status', () => {
    expect(component.order.status).toBe('confirmed');
  });

  it('should emit continueShopping event on continue', () => {
    let emitted = false;
    component.continueShopping.subscribe(() => {
      emitted = true;
    });

    component.onContinue();
    expect(emitted).toBe(true);
  });

  it('should display confirmation email', () => {
    const email = component.order.shippingAddress.email;
    expect(email).toBe('john@example.com');
  });

  it('should display order items with variants', () => {
    const item = component.order.items[0];
    expect(item.variant?.size).toBe('M');
    expect(item.variant?.color).toBe('Red');
  });

  it('should calculate item totals correctly', () => {
    const itemTotal = mockOrder.items[0].price * mockOrder.items[0].quantity;
    expect(itemTotal).toBe(200);
  });
});
