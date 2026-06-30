import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { authGuard } from './features/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  // Products and other protected routes will go here with authGuard
  // { path: 'products', component: ProductsComponent, canActivate: [authGuard] },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];
