import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, Observable, of } from 'rxjs';
import {
  debounceTime,
  switchMap,
  takeUntil,
  startWith,
  distinctUntilChanged,
} from 'rxjs/operators';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-search.component.html',
  styleUrls: ['./product-search.component.css'],
})
export class ProductSearchComponent implements OnInit, OnDestroy {
  @Output() searchSubmit = new EventEmitter<string>();
  @Output() suggestionsSelected = new EventEmitter<Product[]>();

  @ViewChild('searchInput') searchInput!: ElementRef;

  searchControl = new FormControl('');
  suggestions$: Observable<Product[]> = of([]);
  showSuggestions = false;
  isSearching = false;

  private destroy$ = new Subject<void>();

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.suggestions$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      distinctUntilChanged(),
      debounceTime(300),
      switchMap((query) => {
        if (!query || query.trim().length === 0) {
          this.showSuggestions = false;
          return of([]);
        }
        this.isSearching = true;
        this.showSuggestions = true;
        return this.productService.searchProducts(query);
      }),
      takeUntil(this.destroy$)
    );

    this.suggestions$.subscribe({
      next: () => {
        this.isSearching = false;
      },
      error: () => {
        this.isSearching = false;
      },
    });
  }

  onSearch(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    const query = this.searchControl.value?.trim() || '';
    if (query.length > 0) {
      this.searchSubmit.emit(query);
      this.showSuggestions = false;
    }
  }

  selectSuggestion(product: Product): void {
    this.searchControl.setValue(product.name, { emitEvent: false });
    this.showSuggestions = false;
    this.suggestionsSelected.emit([product]);
    this.onSearch();
  }

  clearSearch(): void {
    this.searchControl.reset();
    this.showSuggestions = false;
    this.searchSubmit.emit('');
  }

  onFocus(): void {
    const query = this.searchControl.value?.trim() || '';
    if (query.length > 0) {
      this.showSuggestions = true;
    }
  }

  onBlur(): void {
    // Delay to allow click on suggestion
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }
}
