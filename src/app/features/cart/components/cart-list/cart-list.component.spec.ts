import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartListComponent } from './cart-list.component';
import { CartItem } from '../../models/cart.model';

describe('CartListComponent', () => {
  let component: CartListComponent;
  let fixture: ComponentFixture<CartListComponent>;

  // Factory so each test gets a fresh copy — tests must not mutate shared state
  const createMockCartItems = (): CartItem[] => [
    {
      productId: 'prod1',
      productName: 'Leather Jacket',
      price: 79.99,
      quantity: 2,
      selectedVariant: { size: 'M', color: 'Red' },
      imageUrl: 'https://example.com/jacket.jpg',
    },
    {
      productId: 'prod2',
      productName: 'Cotton Shirt',
      price: 29.99,
      quantity: 1,
      selectedVariant: { size: 'L' },
      imageUrl: 'https://example.com/shirt.jpg',
    },
  ];

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [CartListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CartListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', createMockCartItems());
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('display', () => {
    it('should display all cart items', () => {
      const itemElements = fixture.nativeElement.querySelectorAll('.list-group-item');
      expect(itemElements.length).toBe(2);
    });

    it('should display product name', () => {
      const text = fixture.nativeElement.textContent;
      expect(text).toContain('Leather Jacket');
      expect(text).toContain('Cotton Shirt');
    });

    it('should display price and quantity', () => {
      const text = fixture.nativeElement.textContent;
      expect(text).toContain('79.99');
      expect(text).toContain('29.99');
    });

    it('should display variant information', () => {
      const text = fixture.nativeElement.textContent;
      expect(text).toContain('Size: M');
      expect(text).toContain('Color: Red');
    });

    it('should display empty cart message when no items', () => {
      fixture.componentRef.setInput('items', []);
      fixture.detectChanges();

      const emptyMessage = fixture.nativeElement.querySelector('.alert-info');
      expect(emptyMessage).toBeTruthy();
      expect(emptyMessage.textContent).toContain('Your cart is empty');
    });
  });

  describe('quantity controls', () => {
    it('should emit updateQuantity event when quantity increases', () => {
      const spy = vi.spyOn(component.updateQuantity, 'emit');
      component.onQuantityChange('prod1', 3);

      expect(spy).toHaveBeenCalledWith({ productId: 'prod1', quantity: 3 });
    });

    it('should not emit if quantity is not positive', () => {
      const spy = vi.spyOn(component.updateQuantity, 'emit');
      component.onQuantityChange('prod1', 0);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should disable minus button when quantity is 1', () => {
      // Provide a fresh items array where the first item has quantity 1
      const items = createMockCartItems();
      items[0].quantity = 1;
      fixture.componentRef.setInput('items', items);
      fixture.detectChanges();

      const minusButtons = fixture.nativeElement.querySelectorAll('button');
      const minusButtonForFirst = minusButtons[0];

      expect(minusButtonForFirst.disabled).toBe(true);
    });
  });

  describe('remove item', () => {
    it('should emit removeItem event when remove button clicked', () => {
      const spy = vi.spyOn(component.removeItem, 'emit');
      component.onRemove('prod1');

      expect(spy).toHaveBeenCalledWith('prod1');
    });
  });

  describe('total calculation display', () => {
    it('should display calculated item total', () => {
      const text = fixture.nativeElement.textContent;
      // prod1: 79.99 * 2 = 159.98
      expect(text).toContain('159.98');
      // prod2: 29.99 * 1 = 29.99
      expect(text).toContain('29.99');
    });
  });
});
