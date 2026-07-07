import { Routes } from '@angular/router';

export const discountsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./discount-list/discount-list.component').then((m) => m.DiscountListComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./discount-form/discount-form.component').then((m) => m.DiscountFormComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./discount-form/discount-form.component').then((m) => m.DiscountFormComponent),
  },
];
