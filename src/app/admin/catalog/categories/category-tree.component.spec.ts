import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CategoryTreeComponent } from './category-tree.component';
import { CatalogAdminService } from '../services/catalog-admin.service';
import { ToastService } from '../../shared/services/toast.service';
import { CategoryTreeNodeDto } from '../models/catalog-admin.model';

describe('CategoryTreeComponent', () => {
  let fixture: ComponentFixture<CategoryTreeComponent>;
  let component: CategoryTreeComponent;
  let mockCatalog: Partial<CatalogAdminService>;
  let mockToast: Partial<ToastService>;

  const tree: CategoryTreeNodeDto[] = [
    {
      id: 'c1',
      name: 'Shoes',
      slug: 'shoes',
      sortOrder: 0,
      children: [{ id: 'c2', name: 'Sneakers', slug: 'sneakers', sortOrder: 0, children: [] }],
    },
  ];

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockCatalog = {
      getCategoryTree: vi.fn().mockReturnValue(of(tree)),
      moveCategory: vi.fn().mockReturnValue(of({})),
      reorderCategories: vi.fn().mockReturnValue(of(undefined)),
      deleteCategory: vi.fn().mockReturnValue(of(undefined)),
      createCategory: vi.fn().mockReturnValue(of({})),
    };
    mockToast = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [CategoryTreeComponent],
      providers: [
        { provide: CatalogAdminService, useValue: mockCatalog },
        { provide: ToastService, useValue: mockToast },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CategoryTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the category tree on init', () => {
    expect(component.tree.length).toBe(1);
    expect(component.tree[0].children.length).toBe(1);
  });

  it('moves a category to a new parent', () => {
    component.onMove('c2', 'c1');
    expect(mockCatalog.moveCategory).toHaveBeenCalledWith('c2', 'c1');
  });

  it('reorders siblings', () => {
    component.onReorder(['c2', 'c1']);
    expect(mockCatalog.reorderCategories).toHaveBeenCalledWith([
      { id: 'c2', sortOrder: 0 },
      { id: 'c1', sortOrder: 1 },
    ]);
  });

  it('deletes a category and reloads', () => {
    component.onDelete('c2');
    expect(mockCatalog.deleteCategory).toHaveBeenCalledWith('c2');
  });

  it('creates a new root category', () => {
    component.newCategoryName = 'Accessories';
    component.onCreateRoot();
    expect(mockCatalog.createCategory).toHaveBeenCalledWith({
      name: 'Accessories',
      slug: 'accessories',
      parentCategoryId: null,
      sortOrder: 1,
    });
  });
});
