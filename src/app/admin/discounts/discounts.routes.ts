import { Routes } from '@angular/router';

export const discountsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./discounts-placeholder.component').then((m) => m.DiscountsPlaceholderComponent),
  },
];
