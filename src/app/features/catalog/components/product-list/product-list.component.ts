import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../models/product.model';
import { PagedResult } from '../../../../core/models/api-response.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  @Input() products: Product[] = [];
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() selectedCategoryId?: string;

  @Output() pageChange = new EventEmitter<number>();
  @Output() addToCart = new EventEmitter<Product>();

  ngOnInit(): void {
    // Component initialization if needed
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  onAddToCart(product: Product): void {
    this.addToCart.emit(product);
  }

  /**
   * Get star array for rating display
   */
  getStarArray(rating: number): boolean[] {
    const stars: boolean[] = [];
    const roundedRating = Math.round(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= roundedRating);
    }
    return stars;
  }

  /**
   * Format price for display
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  }
}
