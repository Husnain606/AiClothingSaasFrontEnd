import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { ProductService } from '../../services/product.service';
import { Product, Category, ProductFilter } from '../../models/product.model';
import { PagedResult } from '../../../../core/models/api-response.model';
import { CategoryListComponent } from '../category-list/category-list.component';
import { ProductListComponent } from '../product-list/product-list.component';
import { ProductSearchComponent } from '../product-search/product-search.component';
import { CartService } from '../../../cart/services/cart.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, CategoryListComponent, ProductListComponent, ProductSearchComponent],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css'],
})
export class CatalogComponent implements OnInit, OnDestroy {
  // State observables
  products$ = new BehaviorSubject<Product[]>([]);
  categories$ = new BehaviorSubject<Category[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);

  // Pagination
  currentPage$ = new BehaviorSubject<number>(1);
  totalPages$ = new BehaviorSubject<number>(1);
  pageSize = 20;

  // Filters
  selectedCategory$ = new BehaviorSubject<Category | null>(null);
  searchQuery$ = new BehaviorSubject<string>('');

  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load both categories and products
   */
  private loadData(): void {
    this.loadCategories();
    this.loadProducts();
  }

  /**
   * Load categories from service
   */
  private loadCategories(): void {
    this.productService
      .getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories$.next(categories);
        },
        error: (err) => {
          console.error('Failed to load categories:', err);
          this.error$.next('Failed to load categories');
        },
      });
  }

  /**
   * Load products with current filters
   */
  private loadProducts(): void {
    this.loading$.next(true);
    this.error$.next(null);

    const filter: ProductFilter = {
      page: this.currentPage$.value,
      pageSize: this.pageSize,
      search: this.searchQuery$.value || undefined,
      categoryId: this.selectedCategory$.value?.id || undefined,
    };

    this.productService
      .getProducts(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: PagedResult<Product>) => {
          this.products$.next(result.items);
          this.totalPages$.next(result.totalPages);
          this.loading$.next(false);
        },
        error: (err) => {
          console.error('Failed to load products:', err);
          this.error$.next('Failed to load products. Please try again.');
          this.loading$.next(false);
        },
      });
  }

  /**
   * Handle category selection from sidebar
   */
  onCategorySelected(category: Category | null): void {
    this.selectedCategory$.next(category);
    this.currentPage$.next(1); // Reset to first page
    this.loadProducts();
  }

  /**
   * Handle search submission
   */
  onSearch(query: string): void {
    this.searchQuery$.next(query);
    this.currentPage$.next(1); // Reset to first page
    this.loadProducts();
  }

  /**
   * Handle page changes
   */
  onPageChange(page: number): void {
    this.currentPage$.next(page);
    this.loadProducts();
  }

  /**
   * Handle add to cart from the product grid (no variant selection at this level)
   */
  onAddToCart(product: Product): void {
    this.cartService
      .addItem(product, 1)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          alert(`${product.name} added to cart!`);
        },
        error: (err) => {
          console.error('Failed to add to cart:', err);
          alert('Failed to add item to cart. Please try again.');
        },
      });
  }

  /**
   * Handle suggestions selected from search
   */
  onSuggestionsSelected(products: Product[]): void {
    if (products.length > 0) {
      this.products$.next(products);
      this.currentPage$.next(1);
    }
  }
}
