import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem } from '../../models/cart.model';

@Component({
  selector: 'app-cart-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-list.component.html',
  styleUrls: ['./cart-list.component.scss'],
})
export class CartListComponent {
  @Input() items: CartItem[] = [];
  @Output() removeItem = new EventEmitter<string>();
  @Output() updateQuantity = new EventEmitter<{ productId: string; quantity: number }>();

  onRemove(productId: string): void {
    this.removeItem.emit(productId);
  }

  onQuantityChange(productId: string, newQuantity: number): void {
    if (newQuantity > 0) {
      this.updateQuantity.emit({ productId, quantity: newQuantity });
    }
  }
}
