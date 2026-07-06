import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { ProductFormComponent } from './product-form.component';
import { CatalogAdminService } from '../services/catalog-admin.service';
import { ToastService } from '../../shared/services/toast.service';

describe('ProductFormComponent', () => {
  let fixture: ComponentFixture<ProductFormComponent>;
  let component: ProductFormComponent;
  let mockCatalog: Partial<CatalogAdminService>;
  let mockToast: Partial<ToastService>;

  function setup(paramId: string | null): void {
    mockCatalog = {
      getCategories: vi.fn().mockReturnValue(
        of([{ id: 'c1', name: 'Shoes', slug: 'shoes', parentCategoryId: null, sortOrder: 0, isActive: true, createdAt: '' }])
      ),
      getProduct: vi.fn().mockReturnValue(
        of({
          id: 'p1',
          name: 'Jacket',
          slug: 'jacket',
          description: 'd',
          categoryId: 'c1',
          status: 'Draft',
          basePrice: 99,
          variantCount: 0,
          approvedReviewCount: 0,
          createdAt: '',
        })
      ),
      createProduct: vi.fn().mockReturnValue(of({ id: 'p2' })),
      updateProduct: vi.fn().mockReturnValue(of({ id: 'p1' })),
      getVariants: vi.fn().mockReturnValue(of([])),
      getImages: vi.fn().mockReturnValue(of([])),
    };
    mockToast = { success: vi.fn(), error: vi.fn() };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ProductFormComponent],
      providers: [
        provideRouter([{ path: 'admin/catalog', children: [] }]),
        { provide: CatalogAdminService, useValue: mockCatalog },
        { provide: ToastService, useValue: mockToast },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => paramId } } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('starts in create mode with an empty form when there is no id param', () => {
    setup(null);
    expect(component.isEditMode).toBe(false);
    expect(component.form.value.name).toBe('');
  });

  it('loads the product and patches the form in edit mode', () => {
    setup('p1');
    expect(component.isEditMode).toBe(true);
    expect(mockCatalog.getProduct).toHaveBeenCalledWith('p1');
    expect(component.form.value.name).toBe('Jacket');
  });

  it('does not submit an invalid form', () => {
    setup(null);
    component.form.patchValue({ name: '' });
    component.onSubmit();
    expect(mockCatalog.createProduct).not.toHaveBeenCalled();
  });

  it('creates a product and navigates back to the list on success', () => {
    setup(null);
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.form.setValue({ name: 'New', slug: 'new', description: 'd', categoryId: 'c1', basePrice: 50 });
    component.onSubmit();
    expect(mockCatalog.createProduct).toHaveBeenCalledWith({
      name: 'New',
      slug: 'new',
      description: 'd',
      categoryId: 'c1',
      basePrice: 50,
    });
    expect(navSpy).toHaveBeenCalledWith(['/admin/catalog']);
  });

  it('updates a product in edit mode', () => {
    setup('p1');
    component.form.patchValue({ name: 'Updated' });
    component.onSubmit();
    expect(mockCatalog.updateProduct).toHaveBeenCalledWith('p1', expect.objectContaining({ name: 'Updated' }));
  });

  it('shows a toast error when the save fails', () => {
    setup(null);
    (mockCatalog.createProduct as ReturnType<typeof vi.fn>).mockReturnValue(throwError(() => new Error('fail')));
    component.form.setValue({ name: 'New', slug: 'new', description: 'd', categoryId: 'c1', basePrice: 50 });
    component.onSubmit();
    expect(mockToast.error).toHaveBeenCalled();
  });
});
