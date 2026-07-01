import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { authGuard } from './features/auth/guards/auth.guard';
import { CatalogComponent } from './features/catalog/components/catalog/catalog.component';
import { ProductDetailComponent } from './features/catalog/components/product-detail/product-detail.component';

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
    path: '',
    redirectTo: '/products',
    pathMatch: 'full',
  },
];
