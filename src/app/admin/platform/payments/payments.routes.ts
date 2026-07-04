import { Routes } from '@angular/router';

export const paymentsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./payments-placeholder.component').then((m) => m.PaymentsPlaceholderComponent),
  },
];
