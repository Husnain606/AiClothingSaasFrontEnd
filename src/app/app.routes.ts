import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { authGuard } from './features/auth/guards/auth.guard';
import { CatalogComponent } from './features/catalog/components/catalog/catalog.component';
import { ProductDetailComponent } from './features/catalog/components/product-detail/product-detail.component';
import { CartComponent } from './features/cart/components/cart/cart.component';
import { cartNotEmptyGuard } from './features/cart/guards/cart-not-empty.guard';
import { AccountComponent } from './features/account/components/account/account.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'products',
    component: CatalogComponent,
    canActivate: [authGuard],
  },
  {
    path: 'products/:id',
    component: ProductDetailComponent,
    canActivate: [authGuard],
  },
  {
    path: 'account',
    component: AccountComponent,
    canActivate: [authGuard],
  },
  {
    path: 'cart',
    component: CartComponent,
    canActivate: [authGuard],
  },
  {
    path: 'checkout',
    canActivate: [authGuard, cartNotEmptyGuard],
    loadComponent: () => import('./features/checkout/components/checkout/checkout.component').then(m => m.CheckoutComponent),
  },
  {
    path: '',
    redirectTo: '/products',
    pathMatch: 'full',
  },
];
