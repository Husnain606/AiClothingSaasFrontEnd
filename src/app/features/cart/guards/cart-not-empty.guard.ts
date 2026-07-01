import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CartService } from '../services/cart.service';

export const cartNotEmptyGuard: CanActivateFn = (route, state) => {
  const cartService = inject(CartService);
  const router = inject(Router);

  const cart = cartService.getCartValue();

  if (cart.itemCount > 0) {
    return true;
  }

  // Cart is empty, redirect to products with alert
  alert('Your cart is empty. Please add items before proceeding to checkout.');
  router.navigate(['/products']);
  return false;
};
