import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryListComponent } from './category-list.component';
import { ProductService } from '../../services/product.service';
import { Category } from '../../models/product.model';
import { of, throwError } from 'rxjs';

describe('CategoryListComponent', () => {
  let component: CategoryListComponent;
  let fixture: ComponentFixture<CategoryListComponent>;
  let productService: jasmine.SpyObj<ProductService>;

  const mockCategories: Category[] = [
    {
      id: 'cat1',
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic items',
      parentCategoryId: null,
      sortOrder: 1,
      isActive: true,
      createdAt: '2024-01-01',
    },
    {
      id: 'cat2',
      name: 'Phones',
      slug: 'phones',
      description: 'Mobile phones',
      parentCategoryId: 'cat1',
      sortOrder: 1,
      isActive: true,
      createdAt: '2024-01-01',
    },
  ];

  beforeEach(async () => {
    const productServiceSpy = jasmine.createSpyObj('ProductService', ['getCategories']);

    await TestBed.configureTestingModule({
      imports: [CategoryListComponent],
      providers: [{ provide: ProductService, useValue: productServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryListComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories on init', () => {
    productService.getCategories.and.returnValue(of(mockCategories));

    component.ngOnInit();

    expect(component.categories$.value).toEqual([mockCategories[0]]);
    expect(component.loading$.value).toBe(false);
  });

  it('should handle error when loading categories', () => {
    productService.getCategories.and.returnValue(throwError(() => new Error('Test error')));

    component.ngOnInit();

    expect(component.error$.value).toBe('Failed to load categories');
    expect(component.loading$.value).toBe(false);
  });

  it('should emit selectedCategory when category is selected', () => {
    spyOn(component.selectedCategory, 'emit');

    component.selectCategory(mockCategories[0]);

    expect(component.selectedCategoryId$.value).toBe('cat1');
    expect(component.selectedCategory.emit).toHaveBeenCalledWith(mockCategories[0]);
  });

  it('should clear category selection', () => {
    spyOn(component.selectedCategory, 'emit');

    component.selectCategory(mockCategories[0]);
    component.clearSelection();

    expect(component.selectedCategoryId$.value).toBeNull();
    expect(component.selectedCategory.emit).toHaveBeenCalled();
  });

  it('should get child categories for a parent', () => {
    const children = component.getChildCategories('cat1', mockCategories);

    expect(children.length).toBe(1);
    expect(children[0].id).toBe('cat2');
  });

  it('should unsubscribe on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });

  it('should filter out inactive categories', () => {
    const inactiveCategory: Category = {
      ...mockCategories[0],
      isActive: false,
    };

    productService.getCategories.and.returnValue(of([inactiveCategory]));

    component.ngOnInit();

    expect(component.categories$.value.length).toBe(1);
  });

  it('should show loading state during load', () => {
    productService.getCategories.and.returnValue(of(mockCategories));

    component.ngOnInit();

    expect(component.loading$.value).toBe(false);
  });
});
