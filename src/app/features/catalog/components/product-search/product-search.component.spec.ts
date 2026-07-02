import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductSearchComponent } from './product-search.component';
import { ProductService } from '../../services/product.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Product } from '../../models/product.model';

describe('ProductSearchComponent', () => {
  let component: ProductSearchComponent;
  let fixture: ComponentFixture<ProductSearchComponent>;
  let productService: Partial<ProductService>;

  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Test Product',
      slug: 'test-product',
      description: 'Test',
      categoryId: 'cat1',
      categoryName: 'Category',
      basePrice: 99.99,
      status: 'active',
      tags: [],
      variantCount: 1,
      primaryImageUrl: 'image.jpg',
      approvedReviewCount: 0,
      averageRating: 0,
      createdAt: '2024-01-01',
    },
  ];

  beforeEach(async () => {
    const productServiceMock = {
      searchProducts: vi.fn(),
    } as unknown as Partial<ProductService>;

    await TestBed.configureTestingModule({
      imports: [ProductSearchComponent, ReactiveFormsModule],
      providers: [{ provide: ProductService, useValue: productServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductSearchComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as unknown as Partial<ProductService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Zoneless app: fakeAsync/tick are unavailable — drive debounceTime with vi fake timers
  describe('debounced search', () => {
    beforeEach(async () => {
      // ngOnInit's startWith('') schedules a debounce task with REAL timers; rxjs
      // debounceTime reuses its active task, so later values would never reach the
      // fake clock. Let that initial task flush before switching to fake timers.
      await new Promise((resolve) => setTimeout(resolve, 350));
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should setup search with debounce', () => {
      (productService.searchProducts as any) = vi.fn().mockReturnValue(of(mockProducts));

      component.searchControl.setValue('test');
      vi.advanceTimersByTime(300);

      expect(productService.searchProducts).toHaveBeenCalledWith('test');
    });

    it('should debounce search input', () => {
      (productService.searchProducts as any) = vi.fn().mockReturnValue(of(mockProducts));

      component.searchControl.setValue('t');
      vi.advanceTimersByTime(100);
      component.searchControl.setValue('te');
      vi.advanceTimersByTime(100);
      component.searchControl.setValue('test');
      vi.advanceTimersByTime(300);

      expect(productService.searchProducts).toHaveBeenCalledTimes(1);
      expect(productService.searchProducts).toHaveBeenCalledWith('test');
    });

    it('should not search for empty query', () => {
      (productService.searchProducts as any) = vi.fn().mockReturnValue(of([]));

      component.searchControl.setValue('');
      vi.advanceTimersByTime(300);

      expect(productService.searchProducts).not.toHaveBeenCalled();
    });
  });

  it('should emit searchSubmit when onSearch is called', () => {
    const emitSpy = vi.spyOn(component.searchSubmit, 'emit');

    component.searchControl.setValue('test');
    component.onSearch();

    expect(emitSpy).toHaveBeenCalledWith('test');
  });

  it('should not emit searchSubmit for empty search', () => {
    const emitSpy = vi.spyOn(component.searchSubmit, 'emit');

    component.searchControl.setValue('');
    component.onSearch();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should select suggestion and emit it', () => {
    const emitSpy = vi.spyOn(component.suggestionsSelected, 'emit');

    component.selectSuggestion(mockProducts[0]);

    expect(component.searchControl.value).toBe('Test Product');
    expect(emitSpy).toHaveBeenCalledWith([mockProducts[0]]);
  });

  it('should clear search', () => {
    const emitSpy = vi.spyOn(component.searchSubmit, 'emit');

    component.searchControl.setValue('test');
    component.clearSearch();

    expect(component.searchControl.value).toBeNull();
    expect(emitSpy).toHaveBeenCalledWith('');
  });

  it('should show suggestions on focus when text exists', () => {
    component.searchControl.setValue('test');
    component.onFocus();

    expect(component.showSuggestions).toBe(true);
  });

  it('should hide suggestions on blur', async () => {
    component.showSuggestions = true;

    component.onBlur();

    await new Promise(resolve => setTimeout(resolve, 250));
    expect(component.showSuggestions).toBe(false);
  });

  it('should unsubscribe on destroy', () => {
    const nextSpy = vi.spyOn(component['destroy$'], 'next');
    const completeSpy = vi.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
