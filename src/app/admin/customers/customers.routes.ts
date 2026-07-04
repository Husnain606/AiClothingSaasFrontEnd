import { Routes } from '@angular/router';

export const customersRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./customers-placeholder.component').then((m) => m.CustomersPlaceholderComponent),
  },
];
