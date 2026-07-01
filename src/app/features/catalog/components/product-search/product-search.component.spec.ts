import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProductSearchComponent } from './product-search.component';
import { ProductService } from '../../services/product.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Product } from '../../models/product.model';

describe('ProductSearchComponent', () => {
  let component: ProductSearchComponent;
  let fixture: ComponentFixture<ProductSearchComponent>;
  let productService: jasmine.SpyObj<ProductService>;

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
    const productServiceSpy = jasmine.createSpyObj('ProductService', ['searchProducts']);

    await TestBed.configureTestingModule({
      imports: [ProductSearchComponent, ReactiveFormsModule],
      providers: [{ provide: ProductService, useValue: productServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductSearchComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should setup search with debounce', fakeAsync(() => {
    productService.searchProducts.and.returnValue(of(mockProducts));

    component.searchControl.setValue('test');
    tick(300);

    expect(productService.searchProducts).toHaveBeenCalledWith('test');
  }));

  it('should debounce search input', fakeAsync(() => {
    productService.searchProducts.and.returnValue(of(mockProducts));

    component.searchControl.setValue('t');
    tick(100);
    component.searchControl.setValue('te');
    tick(100);
    component.searchControl.setValue('test');
    tick(300);

    expect(productService.searchProducts).toHaveBeenCalledTimes(1);
    expect(productService.searchProducts).toHaveBeenCalledWith('test');
  }));

  it('should not search for empty query', fakeAsync(() => {
    productService.searchProducts.and.returnValue(of([]));

    component.searchControl.setValue('');
    tick(300);

    expect(productService.searchProducts).not.toHaveBeenCalled();
  }));

  it('should emit searchSubmit when onSearch is called', () => {
    spyOn(component.searchSubmit, 'emit');

    component.searchControl.setValue('test');
    component.onSearch();

    expect(component.searchSubmit.emit).toHaveBeenCalledWith('test');
  });

  it('should not emit searchSubmit for empty search', () => {
    spyOn(component.searchSubmit, 'emit');

    component.searchControl.setValue('');
    component.onSearch();

    expect(component.searchSubmit.emit).not.toHaveBeenCalled();
  });

  it('should select suggestion and emit it', () => {
    spyOn(component.suggestionsSelected, 'emit');

    component.selectSuggestion(mockProducts[0]);

    expect(component.searchControl.value).toBe('Test Product');
    expect(component.suggestionsSelected.emit).toHaveBeenCalledWith([mockProducts[0]]);
  });

  it('should clear search', () => {
    spyOn(component.searchSubmit, 'emit');

    component.searchControl.setValue('test');
    component.clearSearch();

    expect(component.searchControl.value).toBeNull();
    expect(component.searchSubmit.emit).toHaveBeenCalledWith('');
  });

  it('should show suggestions on focus when text exists', () => {
    component.searchControl.setValue('test');
    component.onFocus();

    expect(component.showSuggestions).toBe(true);
  });

  it('should hide suggestions on blur', (done) => {
    component.showSuggestions = true;

    component.onBlur();

    setTimeout(() => {
      expect(component.showSuggestions).toBe(false);
      done();
    }, 250);
  });

  it('should unsubscribe on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
