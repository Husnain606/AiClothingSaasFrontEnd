import { Routes } from '@angular/router';
import { authGuard } from './features/auth/guards/auth.guard';
import { cartNotEmptyGuard } from './features/cart/guards/cart-not-empty.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'products',
        pathMatch: 'full',
      },
      {
        path: 'products',
        canActivate: [authGuard],
        title: 'Products | FashionSaaS',
        loadComponent: () =>
          import('./features/catalog/components/catalog/catalog.component').then(
            m => m.CatalogComponent
          ),
      },
      {
        path: 'products/:id',
        canActivate: [authGuard],
        title: 'Product Details | FashionSaaS',
        loadComponent: () =>
          import('./features/catalog/components/product-detail/product-detail.component').then(
            m => m.ProductDetailComponent
          ),
      },
      {
        path: 'cart',
        canActivate: [authGuard],
        title: 'Shopping Cart | FashionSaaS',
        loadComponent: () =>
          import('./features/cart/components/cart/cart.component').then(m => m.CartComponent),
      },
      {
        path: 'checkout',
        canActivate: [authGuard, cartNotEmptyGuard],
        title: 'Checkout | FashionSaaS',
        loadComponent: () =>
          import('./features/checkout/components/checkout/checkout.component').then(
            m => m.CheckoutComponent
          ),
      },
      {
        path: 'account',
        canActivate: [authGuard],
        title: 'My Account | FashionSaaS',
        loadComponent: () =>
          import('./features/account/components/account/account.component').then(
            m => m.AccountComponent
          ),
      },
    ],
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        title: 'Sign In | FashionSaaS',
        loadComponent: () =>
          import('./features/auth/components/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'register',
        title: 'Create Account | FashionSaaS',
        loadComponent: () =>
          import('./features/auth/components/register/register.component').then(
            m => m.RegisterComponent
          ),
      },
    ],
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then((m) => m.adminRoutes),
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Page Not Found | FashionSaaS',
  },
];
