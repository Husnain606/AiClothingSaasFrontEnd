import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductService } from '../../services/product.service';
import { Category } from '../../models/product.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css'],
})
export class CategoryListComponent implements OnInit, OnDestroy {
  @Output() selectedCategory = new EventEmitter<Category>();

  categories$ = new BehaviorSubject<Category[]>([]);
  selectedCategoryId$ = new BehaviorSubject<string | null>(null);
  loading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);

  private destroy$ = new Subject<void>();

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCategories(): void {
    this.loading$.next(true);
    this.error$.next(null);

    this.productService
      .getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          // Filter only root categories (no parentCategoryId)
          const rootCategories = categories.filter((c) => !c.parentCategoryId);
          this.categories$.next(rootCategories);
          this.loading$.next(false);
        },
        error: (err) => {
          console.error('Failed to load categories:', err);
          this.error$.next('Failed to load categories');
          this.loading$.next(false);
        },
      });
  }

  selectCategory(category: Category): void {
    this.selectedCategoryId$.next(category.id);
    this.selectedCategory.emit(category);
  }

  clearSelection(): void {
    this.selectedCategoryId$.next(null);
    this.selectedCategory.emit(null as any);
  }

  /**
   * Get child categories for a given parent
   */
  getChildCategories(parentId: string, allCategories: Category[]): Category[] {
    return allCategories.filter((c) => c.parentCategoryId === parentId);
  }
}
