import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { Product } from '../../models/product.model';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;

  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Test Product 1',
      slug: 'test-product-1',
      description: 'Test description 1',
      categoryId: 'cat1',
      categoryName: 'Category 1',
      basePrice: 99.99,
      status: 'active',
      tags: ['tag1'],
      variantCount: 2,
      primaryImageUrl: 'https://example.com/image1.jpg',
      approvedReviewCount: 5,
      averageRating: 4.5,
      createdAt: '2024-01-01',
    },
    {
      id: '2',
      name: 'Test Product 2',
      slug: 'test-product-2',
      description: 'Test description 2',
      categoryId: 'cat1',
      categoryName: 'Category 1',
      basePrice: 149.99,
      status: 'active',
      tags: ['tag2'],
      variantCount: 1,
      primaryImageUrl: 'https://example.com/image2.jpg',
      approvedReviewCount: 10,
      averageRating: 4.8,
      createdAt: '2024-01-02',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display products grid', () => {
    component.products = mockProducts;
    fixture.detectChanges();

    const productCards = fixture.nativeElement.querySelectorAll('.product-card');
    expect(productCards.length).toBe(2);
  });

  it('should show loading spinner when loading is true', () => {
    component.loading = true;
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('.spinner-border');
    expect(spinner).toBeTruthy();
  });

  it('should show error message when error is set', () => {
    component.error = 'Test error message';
    fixture.detectChanges();

    const errorAlert = fixture.nativeElement.querySelector('.alert-danger');
    expect(errorAlert).toBeTruthy();
    expect(errorAlert.textContent).toContain('Test error message');
  });

  it('should show empty state when no products and not loading', () => {
    component.products = [];
    component.loading = false;
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('.text-muted');
    expect(emptyState).toBeTruthy();
  });

  it('should emit pageChange when page navigation is clicked', () => {
    const emitSpy = vi.spyOn(component.pageChange, 'emit');
    component.products = mockProducts;
    component.currentPage = 1;
    component.totalPages = 3;
    fixture.detectChanges();

    component.onPageChange(2);

    expect(emitSpy).toHaveBeenCalledWith(2);
  });

  it('should emit addToCart when add to cart button is clicked', () => {
    const emitSpy = vi.spyOn(component.addToCart, 'emit');
    component.products = mockProducts;
    fixture.detectChanges();

    component.onAddToCart(mockProducts[0]);

    expect(emitSpy).toHaveBeenCalledWith(mockProducts[0]);
  });

  it('should format price correctly', () => {
    const formatted = component.formatPrice(99.99);
    expect(formatted).toContain('99.99');
  });

  it('should generate star array for rating', () => {
    const stars = component.getStarArray(4.5);
    expect(stars.length).toBe(5);
    expect(stars[0]).toBe(true);
    expect(stars[4]).toBe(false);
  });

  it('should disable pagination buttons correctly', () => {
    component.products = mockProducts;
    component.currentPage = 1;
    component.totalPages = 3;
    fixture.detectChanges();

    component.onPageChange(1);
    expect(component.pageChange.emit).not.toHaveBeenCalledWith(0);
  });

  it('should not emit pageChange for invalid page numbers', () => {
    const emitSpy = vi.spyOn(component.pageChange, 'emit');
    component.totalPages = 3;

    component.onPageChange(0);
    component.onPageChange(4);

    expect(emitSpy).not.toHaveBeenCalled();
  });
});
